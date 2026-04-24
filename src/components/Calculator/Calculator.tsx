import { useState } from 'react';
import type { Year } from '../../domain/types';
import { usePayrollCalc } from '../../hooks/usePayrollCalc';
import { BreakdownTable } from './BreakdownTable';
import { SalaryInput } from './SalaryInput';
import { YearSelector } from './YearSelector';
import styles from './Calculator.module.css';

export function Calculator() {
  const [year, setYear] = useState<Year>(2026);
  const [bruto, setBruto] = useState<number>(30000);

  const breakdown = usePayrollCalc(bruto, year);

  return (
    <section className={styles.root}>
      <div className={styles.controls}>
        <YearSelector value={year} onChange={setYear} />
        <SalaryInput value={bruto} onChange={setBruto} />
      </div>
      <BreakdownTable breakdown={breakdown} />
    </section>
  );
}
