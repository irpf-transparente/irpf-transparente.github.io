import { useMemo } from 'react';
import { computePayroll } from '../domain/payroll';
import type { PayrollBreakdown, Year } from '../domain/types';

export function usePayrollCalc(bruto: number, year: Year): PayrollBreakdown {
  return useMemo(() => computePayroll(bruto, year), [bruto, year]);
}
