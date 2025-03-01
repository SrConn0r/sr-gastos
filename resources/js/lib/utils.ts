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


export const formatDateString = (dateString: string) => {
  if (!dateString) return 'Fecha no disponible';

  try {
    // Handle ISO date with timezone (e.g. "2025-03-01T00:00:00.000000Z")
    let dateStrClean = dateString;

    // If the date contains a 'T', it's likely an ISO format with time
    if (dateString.includes('T')) {
      // Extract just the date part (before the T)
      dateStrClean = dateString.split('T')[0];
    }

    // Now split the clean date (YYYY-MM-DD)
    const [year, month, day] = dateStrClean.split('-');

    if (!year || !month || !day) {
      return dateString; // Return original if we can't parse it
    }

    // Map month number to month name
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const monthIndex = parseInt(month, 10) - 1; // Convert to 0-based index
    if (monthIndex < 0 || monthIndex > 11) {
      return dateString; // Invalid month
    }

    const monthName = monthNames[monthIndex];

    // Remove leading zero from day if present
    const dayFormatted = day.startsWith('0') ? day.substring(1) : day;

    return `${monthName} ${dayFormatted}, ${year}`;
  } catch (error) {
    console.error('Error formatting date string:', error);
    return dateString; // Return original string if formatting fails
  }
};