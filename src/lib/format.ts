const EUR = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

const EUR_CENTS = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const PERCENT = new Intl.NumberFormat('es-ES', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 2,
});

export function formatEuros(value: number, withCents = false): string {
  return (withCents ? EUR_CENTS : EUR).format(value);
}

export function formatPercent(ratio: number): string {
  return PERCENT.format(ratio);
}
