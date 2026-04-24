import type { Year } from '../../domain/types';
import { usePayrollCalc } from '../../hooks/usePayrollCalc';
import { BreakdownTable } from './BreakdownTable';
import { SalaryInput } from './SalaryInput';
import { YearSelector } from './YearSelector';
import styles from './Calculator.module.css';

interface Props {
  year: Year;
  bruto: number;
  onYearChange: (year: Year) => void;
  onBrutoChange: (bruto: number) => void;
}

export function Calculator({ year, bruto, onYearChange, onBrutoChange }: Props) {
  const breakdown = usePayrollCalc(bruto, year);

  return (
    <section className={styles.root}>
      <div className={styles.controls}>
        <YearSelector value={year} onChange={onYearChange} />
        <SalaryInput value={bruto} onChange={onBrutoChange} />
      </div>
      <BreakdownTable breakdown={breakdown} />
    </section>
  );
}
