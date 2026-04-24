import type { Year } from './types';

/**
 * Deducción especial introducida para neutralizar el impacto del IRPF sobre
 * rentas cercanas al SMI.  Sólo existe en 2025 y 2026 en el modelo actual.
 */
export function smiDeduction(bruto: number, year: Year): number {
  if (year === 2026) {
    if (bruto <= 17094) return 590.89;
    return Math.max(0, 590.89 - 0.20 * (bruto - 17094.0));
  }
  if (year === 2025) {
    if (bruto <= 16576) return 340.0;
    if (bruto <= 18276) return Math.max(0, 340.0 - 0.20 * (bruto - 16576.0));
    return 0;
  }
  return 0;
}
