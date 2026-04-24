import { FIRST_YEAR, LAST_YEAR } from './constants';
import { cumulativeInflation } from './inflation';
import { getParams } from './params';
import { computePayrollWithParams } from './payroll';
import type { Year } from './types';

export interface InflationComparisonPoint {
  year: Year;
  /** Multiplicador IPC acumulado entre `year` y `LAST_YEAR`. */
  ipcMultiplier: number;
  /** Bruto nominal que, ajustado a 2026, equivale al `brutoRef2026`. */
  brutoNominal: number;
  costeLaboral2026: number;
  ssEmpresa2026: number;
  ssTrabajador2026: number;
  irpf2026: number;
  /** Neto ajustado a 2026 — el poder adquisitivo real del asalariado en `year` expresado en € de 2026. */
  netoReal2026: number;
  /** Neto que cobraría ese bruto ref en 2026 aplicando las reglas vigentes en 2026. */
  netoReferencia2026: number;
  /** netoReal2026 - netoReferencia2026. Positivo ⇒ se cobraba más en términos reales en ese año. */
  deltaPoderAdqAnual: number;
}

/**
 * Para un salario de referencia en € de 2026, reconstruye qué salario nominal
 * tenía que cobrarse en cada año 2012-2026 para equivaler a ese poder
 * adquisitivo, aplicando las reglas fiscales de cada año y comparando el neto
 * (re-ajustado a 2026) con el que se cobraría hoy.
 *
 * Variación < 0 ⇒ se cobra menos neto real que en ese año (progresividad en frío).
 */
export function buildInflationSeries(brutoRef2026: number): InflationComparisonPoint[] {
  const params2026 = getParams(LAST_YEAR);
  const ref = computePayrollWithParams(brutoRef2026, params2026);
  const netoRef = ref.salarioNeto;

  const out: InflationComparisonPoint[] = [];
  for (let year = FIRST_YEAR; year <= LAST_YEAR; year++) {
    const params = getParams(year);
    const ipc = cumulativeInflation(year, LAST_YEAR);
    const brutoNominal = brutoRef2026 / ipc;
    const row = computePayrollWithParams(brutoNominal, params);

    out.push({
      year,
      ipcMultiplier: ipc,
      brutoNominal,
      costeLaboral2026: row.costeLaboral * ipc,
      ssEmpresa2026: row.cotEmpresa * ipc,
      ssTrabajador2026: row.cotTrabajador * ipc,
      irpf2026: row.irpfFinal * ipc,
      netoReal2026: row.salarioNeto * ipc,
      netoReferencia2026: netoRef,
      deltaPoderAdqAnual: row.salarioNeto * ipc - netoRef,
    });
  }
  return out;
}
