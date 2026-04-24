import styles from './SalaryInput.module.css';

interface Props {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function SalaryInput({
  value,
  onChange,
  min = 0,
  max = 120000,
  step = 500,
}: Props) {
  const clamp = (n: number) => Math.max(min, Math.min(max, Math.round(n)));

  return (
    <div className={styles.root}>
      <label className={styles.label} htmlFor="bruto-number">
        Salario bruto anual
      </label>
      <div className={styles.inputRow}>
        <input
          id="bruto-number"
          className={styles.number}
          type="number"
          inputMode="numeric"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(clamp(Number(e.target.value)))}
        />
        <span className={styles.suffix}>€ / año</span>
      </div>
      <input
        className={styles.slider}
        type="range"
        aria-label="Salario bruto"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
