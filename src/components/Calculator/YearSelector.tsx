import { FIRST_YEAR, LAST_YEAR } from '../../domain/constants';
import type { Year } from '../../domain/types';
import styles from './YearSelector.module.css';

interface Props {
  value: Year;
  onChange: (year: Year) => void;
}

const YEARS: Year[] = Array.from(
  { length: LAST_YEAR - FIRST_YEAR + 1 },
  (_, i) => FIRST_YEAR + i,
);

export function YearSelector({ value, onChange }: Props) {
  return (
    <div className={styles.root} role="radiogroup" aria-label="Año">
      <div className={styles.pillGrid}>
        {YEARS.map((year) => (
          <button
            key={year}
            type="button"
            role="radio"
            aria-checked={year === value}
            className={`${styles.pill} ${year === value ? styles.active : ''}`}
            onClick={() => onChange(year)}
          >
            {year}
          </button>
        ))}
      </div>
    </div>
  );
}
