import { IPC_ANUAL_DIC, LAST_YEAR } from './constants';
import type { Year } from './types';

/**
 * Multiplicador de IPC acumulado entre `fromYear` (diciembre) y `toYear` (diciembre).
 * Ej.: `cumulativeInflation(2020, 2026)` devuelve (1+ipc2021)·(1+ipc2022)…(1+ipc2026).
 */
export function cumulativeInflation(fromYear: Year, toYear: Year = LAST_YEAR): number {
  if (fromYear === toYear) return 1.0;
  let multiplier = 1.0;
  const [start, end] = fromYear < toYear ? [fromYear, toYear] : [toYear, fromYear];
  for (let y = start + 1; y <= end; y++) {
    multiplier *= 1 + IPC_ANUAL_DIC[y];
  }
  return fromYear < toYear ? multiplier : 1 / multiplier;
}
