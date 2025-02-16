import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrencyInput = (
  value: string
): { formatted: string; raw: number } => {
  // Eliminamos caracteres no deseados excepto dígitos, comas y puntos
  let sanitizedValue = value.replace(/[^0-9.,]/g, '');

  // Verificar si el valor termina en coma o punto (estado decimal incompleto)
  const endsWithSeparator = /[,.]$/.test(sanitizedValue);

  // Reemplazamos las comas por puntos para el parseo
  let normalizedValue = sanitizedValue.replace(/,/g, '.');

  // Evitamos tener más de un punto decimal:
  normalizedValue = normalizedValue.replace(/(\..*)\./g, '$1');

  // Convertir a número (si está incompleto, parseFloat ignora el separador final)
  const numericValue = parseFloat(normalizedValue) || 0;

  // Formatear el número usando Intl.NumberFormat
  let formattedNumber = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    useGrouping: false,
  }).format(numericValue);

  // Si el usuario escribió un separador al final, lo agregamos manualmente
  if (endsWithSeparator) {
    formattedNumber += ',';
  }

  return { formatted: formattedNumber, raw: numericValue };
};
