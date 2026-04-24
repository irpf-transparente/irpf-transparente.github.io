import { useMemo } from 'react';
import { getParams } from '../domain/params';
import { computePayrollWithParams } from '../domain/payroll';
import type { PayrollBreakdown, Year } from '../domain/types';

export interface PayrollSeriesPoint {
  bruto: number;
  neto: number;
  ssTrabajador: number;
  irpfFinal: number;
}

/**
 * Serie densa bruto → desglose para graficar neto/IRPF/SS como funciones
 * continuas.  Reutiliza los parámetros del año una única vez para minimizar
 * coste aunque recalculemos a cada cambio de input.
 */
export function usePayrollSeries(
  year: Year,
  minBruto = 0,
  maxBruto = 120000,
  step = 500,
): PayrollSeriesPoint[] {
  return useMemo(() => {
    const params = getParams(year);
    const out: PayrollSeriesPoint[] = [];
    for (let b = minBruto; b <= maxBruto; b += step) {
      const r: PayrollBreakdown = computePayrollWithParams(b, params);
      out.push({
        bruto: b,
        neto: r.salarioNeto,
        ssTrabajador: r.cotTrabajador,
        irpfFinal: r.irpfFinal,
      });
    }
    return out;
  }, [year, minBruto, maxBruto, step]);
}
