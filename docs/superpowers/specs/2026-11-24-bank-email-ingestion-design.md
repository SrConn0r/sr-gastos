# Registro automático de movimientos desde correos bancarios — Fase 1

Fecha: 2026-11-24 · Estado: aprobado en chat, pendiente de revisión escrita

## Objetivo

Los pagos con tarjeta, QR y transferencias Bre-B llegan como notificaciones al Gmail del dueño, pero muchas veces no se anotan. La app debe leer esas notificaciones, entender con IA si son gasto, ingreso o transferencia interna, categorizarlas y registrarlas por cuenta bancaria. Así el dueño ve cuánto recibe y gasta cada mes y en qué banco.

Bancos iniciales: BBVA (principal), Littio (USD), Bancolombia y Nequi. Las cuentas se gestionan desde la app.

## Fuera de alcance (Fase 2, spec aparte)

- Hogares (multi-tenant) y rol superadministrador que crea hogares y usuarios y los asigna o mueve.
- Configurar proveedor, modelo y credenciales de IA desde el panel de superadmin. En la fase 1 salen de `.env`. El diseño deja ese cambio limitado a un solo punto (ver "Módulo de IA").
- Token de ingesta por hogar (en la fase 1 hay un solo token y un solo dueño).
- Transferencias como tipo de movimiento y saldos por cuenta.

## Decisiones tomadas

| Tema | Decisión |
|---|---|
| Ingesta | Google Apps Script en la cuenta del dueño, cada hora, hace POST a la app con token Bearer |
| Procesamiento | Diferido: el webhook solo guarda; un comando programado cada hora procesa los pendientes (hosting compartido, sin worker) |
| Revisión | Se registra directo y se marca "Por revisar" cuando hay dudas |
| Transferencias internas | No crean movimiento; quedan en el historial como `internal_transfer` |
| Categorías | Solo las existentes; respaldo "Otros gastos" / "Otros ingresos" + "Por revisar" |
| Cuentas | Modelo `Account` por cuenta o tarjeta, con moneda, creado por el usuario |
| IA | Módulo agnóstico al proveedor; primer proveedor: Anthropic (Claude) con el SDK oficial |

## Arquitectura

```
Gmail (filtro → etiqueta "Bancos")
   │  Apps Script, cada hora
   ▼
POST /api/inbound-emails  ──►  inbound_emails (status = pending)
                                     │  schedule: inbound-emails:process (hourly)
                                     ▼
                     InboundEmailProcessor
                       ├─ CategorizeBankEmail (App\Ai\Tasks) ─► AiProvider ─► Anthropic
                       ├─ valida la respuesta contra la BD
                       └─ crea Transaction (o marca transferencia/ignorado/fallido)
```

## Datos

### `accounts` (nuevo)
| Campo | Tipo | Notas |
|---|---|---|
| name | string, único | "BBVA Ahorros", "Nu Tarjeta" |
| institution | string | "BBVA", "Littio", "Bancolombia", "Nequi" |
| kind | enum `AccountKind`: `deposit`, `credit_card` | cuenta / tarjeta de crédito |
| currency | enum `Currency` | Littio = USD |
| last4 | char(4), nullable | ayuda a la IA a elegir la cuenta |
| archived_at | timestamp, nullable | archivar en vez de borrar si tiene movimientos |

Se borra solo si no tiene movimientos, igual que las categorías. Si tiene, se archiva. Las cuentas archivadas no se ofrecen a la IA ni en el formulario de nuevos movimientos.

### `transactions` (cambios)
- `account_id` nullable FK → accounts, `restrictOnDelete`. Los movimientos existentes quedan sin cuenta.
- `needs_review` boolean, default false.
- `inbound_email_id` nullable, único, FK → inbound_emails, `nullOnDelete`. Si no es null, el movimiento es "Auto".

### `inbound_emails` (nuevo)
| Campo | Tipo | Notas |
|---|---|---|
| user_id | FK users | dueño que recibe (`config('app.owner.email')`) |
| message_id | string, único | id de Gmail; garantiza que un correo no se registre dos veces |
| from, subject | string | |
| received_at | datetime | |
| body | longText | texto plano del correo |
| status | enum `InboundEmailStatus`: `pending`, `recorded`, `internal_transfer`, `ignored`, `failed` | |
| attempts | unsignedTinyInteger, default 0 | |
| ai_result | json, nullable | respuesta cruda de la IA, para auditar |
| error | text, nullable | último error |
| processed_at | timestamp, nullable | |

### Categorías de respaldo
"Otros gastos" (expense) y "Otros ingresos" (income). Se crean con `firstOrCreate` al necesitarlas.

## Módulo de IA (agnóstico al proveedor)

```
app/Ai/
  AiProvider.php              interfaz: structured(string $system, string $input, array $schema): array
  Providers/AnthropicProvider.php   implementación con anthropic-ai/sdk
  Tasks/CategorizeBankEmail.php     prompt + JSON Schema de este caso de uso
config/ai.php                 provider, model, effort, credenciales por proveedor
```

- **Contrato:** recibe un JSON Schema estándar y devuelve un array asociativo. JSON Schema es portable entre proveedores, así que las tareas no dependen de ningún SDK.
- **Resolución:** `AppServiceProvider` hace bind de `AiProvider` según `config('ai.provider')` con un `match`. Agregar otro proveedor = una clase nueva + un caso en el `match` + sus credenciales en `config/ai.php`. En la fase 2 el superadmin edita estos valores en BD (key cifrada) y el binding los lee de ahí antes de caer a `config`. Es el único punto que cambia.
- **Errores:** el proveedor lanza `App\Ai\AiException` ante fallos de red, de API, rechazo (`stop_reason = refusal`), respuesta truncada o JSON inválido. Quien lo llama no conoce las excepciones del SDK.
- **Anthropic:** `claude-opus-5-5`, `effort: low` (clasificación), salida estructurada con `outputConfig.format = json_schema` y fallback de rechazo del lado del servidor (`fallbacks: 'default'`, beta `server-side-fallback-2026-07-01`). Coste estimado ~US$0,01 por correo. Modelo y esfuerzo configurables por `.env`.
- **Tareas:** cada caso de uso es una clase en `App\Ai\Tasks` que arma prompt y esquema y recibe `AiProvider` por inyección. Hoy solo existe `CategorizeBankEmail`.

### Esquema de `CategorizeBankEmail`
```json
{
  "kind": "expense | income | internal_transfer | not_a_transaction",
  "amount": "number | null",
  "currency": "COP | USD | BRL | null",
  "date": "YYYY-MM-DD | null",
  "title": "string | null   (corto, p. ej. 'Restaurante El Corral')",
  "account_id": "integer | null   (solo de la lista dada)",
  "category_id": "integer | null  (solo de la lista dada)",
  "confident": "boolean",
  "reason": "string   (una frase, se guarda en el historial)"
}
```
El prompt incluye: cuentas activas (id, nombre, banco, tipo, moneda, last4), categorías (id, nombre, tipo) y el correo (remitente, asunto, fecha, cuerpo). También incluye reglas para formatos colombianos (`$1.234.567,89`), para tratar como `internal_transfer` los envíos entre cuentas propias y los pagos de tarjeta de crédito, y para registrar una compra con tarjeta de crédito como gasto en la cuenta de esa tarjeta. El cuerpo del correo se marca explícitamente como dato no confiable.

## Flujo de procesamiento (`InboundEmailProcessor`)

1. `CategorizeBankEmail` devuelve el resultado; se guarda en `ai_result`.
2. `internal_transfer` → status `internal_transfer`. `not_a_transaction` → `ignored`. No se crea movimiento.
3. `expense` / `income`:
   - `amount` debe ser > 0. Si no, `failed` sin reintento ("monto inválido").
   - `currency`: la de la IA, si no la de la cuenta, si no COP.
   - `date`: la de la IA si es válida y no futura; si no, la fecha de `received_at`.
   - `category_id`: debe existir y su tipo coincidir con `kind`. Si no, la de respaldo y `needs_review`.
   - `account_id`: debe existir y no estar archivada. Si no, null y `needs_review`.
   - `confident = false` → `needs_review`.
   - Se crea el `Transaction` (`user_id` del correo, `inbound_email_id`) y status `recorded`, todo en una transacción de BD.
4. `AiException` → `attempts++` y se guarda `error`. Con `attempts >= 3` → `failed`; si no, queda `pending` para la siguiente hora.

Comando `inbound-emails:process`: toma hasta 50 `pending` por corrida, en orden de llegada. Se programa con `->hourly()->withoutOverlapping()` en `routes/console.php`.

## API de ingesta

`POST /api/inbound-emails` (nuevo `routes/api.php`, registrado en `bootstrap/app.php`)
- Auth: `Authorization: Bearer <INBOUND_EMAIL_TOKEN>`, comparado con `hash_equals`. Si falta el token en config → 503. Si no coincide → 401.
- `throttle:30,1`.
- Body: `{ "emails": [ { "message_id", "from", "subject", "date", "body" } ] }`, con 1–100 correos y `body` de hasta 100 000 caracteres.
- Guarda con `firstOrCreate(['message_id' => ...])`. Los duplicados se ignoran sin error.
- Respuesta `200 { "received": n, "new": m }`.
- Si el dueño no existe → 503 (el script reintenta en la siguiente corrida).

## Google Apps Script (`docs/gmail-apps-script.js`)

- Propiedades del script: `APP_URL`, `TOKEN`.
- Cada hora: busca `label:Bancos newer_than:3d` y recorre **los mensajes** de cada hilo, porque Gmail agrupa notificaciones con el mismo asunto. Envía los que tengan fecha posterior a `lastSuccess - 1h`. Si recibe 2xx, guarda `lastSuccess = ahora`.
- No depende de etiquetas para deduplicar: el servidor ya deduplica por `message_id`.
- El encabezado del archivo explica cómo instalarlo: filtros de Gmail por remitente de cada banco → etiqueta `Bancos`, propiedades y activador horario.

## Interfaz

- **Cuentas** (`/accounts`): lista + diálogo para crear, editar, archivar y eliminar, siguiendo el patrón de Categorías. Entrada nueva en el sidebar.
- **Movimientos**:
  - columna o etiqueta de cuenta, insignias "Auto" y "Por revisar"
  - filtros nuevos `account` y `review`
  - selector de cuenta (opcional) en el diálogo
  - al guardar una edición se pone `needs_review = false`
- **Dashboard**: tarjeta "Por cuenta (este mes)" con ingresos y gastos de cada cuenta en su moneda, más una fila "Sin cuenta".
- **Correos** (`/inbound-emails`): historial paginado con filtro por estado. Muestra remitente, asunto, fecha, estado, `reason` de la IA, enlace al movimiento creado y error. Botón **Reintentar** en los `failed` (vuelve a `pending` con `attempts = 0`). Entrada nueva en el sidebar.

## Configuración (`.env`)

```
INBOUND_EMAIL_TOKEN=          # cadena larga aleatoria, la misma que en el Apps Script
AI_PROVIDER=anthropic
AI_MODEL=claude-opus-5-5
AI_EFFORT=low
ANTHROPIC_API_KEY=
```
Cron de hPanel: `* * * * * cd <ruta> && php artisan schedule:run >> /dev/null 2>&1`.

## Seguridad

- Token largo comparado en tiempo constante, rate limit y tamaño acotado.
- El contenido del correo es no confiable. La IA solo puede devolver datos con el esquema, el código valida cada id contra la BD, y lo peor que puede pasar es un movimiento mal clasificado y marcado "Por revisar".
- Correos falsificados: se mitiga con los filtros de Gmail por remitente (Gmail ya aplica DMARC). Se acepta el riesgo residual porque cada movimiento es visible y editable.
- `ANTHROPIC_API_KEY` y el token solo viven en `.env`.

## Pruebas (Pest, `tests/Feature`)

- `AccountTest`: CRUD, nombre único, borrar solo sin movimientos, archivar.
- `InboundEmailApiTest`: sin token 401, token inválido 401, sin config 503, guarda pendientes, duplicados ignorados, validación.
- `InboundEmailProcessorTest` con un `AiProvider` falso:
  - gasto con cuenta y categoría válidas → `recorded`
  - ingreso
  - transferencia interna → sin movimiento
  - `not_a_transaction` → `ignored`
  - categoría con tipo distinto → respaldo + `needs_review`
  - cuenta desconocida o archivada → null + `needs_review`
  - fecha futura → `received_at`
  - `AiException` → reintento y luego `failed`
- `InboundEmailHistoryTest`: listado y Reintentar.
- `TransactionTest`: filtros por cuenta y por revisar; editar limpia `needs_review`; `account_id` válido.
- `AnthropicProviderTest` (Unit): la función pura `AnthropicProvider::parse(stopReason, text)` traduce rechazos, respuestas truncadas y JSON inválido a `AiException`. La llamada HTTP real se verifica a mano en local con los correos de ejemplo.
- Los correos de ejemplo reales del dueño, anonimizados, se guardan en `tests/Fixtures/emails/` y se usan para revisar el prompt manualmente con `php artisan inbound-emails:process` en local.
