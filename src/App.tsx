import { useMemo } from 'react';
import { Calculator } from './components/Calculator/Calculator';
import { InflationCompareChart } from './components/charts/InflationCompareChart';
import { NetVsGrossChart } from './components/charts/NetVsGrossChart';
import { PayrollWaterfall } from './components/charts/PayrollWaterfall';
import { cumulativeInflation } from './domain/inflation';
import { computePayroll } from './domain/payroll';
import { useUrlState } from './hooks/useUrlState';
import styles from './App.module.css';

export default function App() {
  const [{ year, bruto }, patch] = useUrlState();

  const breakdown = useMemo(() => computePayroll(bruto, year), [bruto, year]);

  // For the inflation chart we always compare against the equivalent 2026 €.
  // If the user is exploring a non-2026 year, scale their current bruto up.
  const brutoRef2026 = useMemo(
    () => (year === 2026 ? bruto : Math.round(bruto * cumulativeInflation(year, 2026))),
    [bruto, year],
  );

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div>
          <h1>IRPF Transparente</h1>
          <p>
            Calculadora interactiva del IRPF, cotizaciones sociales y salario neto
            en España · 2012 – 2026
          </p>
        </div>
      </header>
      <main className={styles.main}>
        <Calculator
          year={year}
          bruto={bruto}
          onYearChange={(y) => patch({ year: y })}
          onBrutoChange={(b) => patch({ bruto: b })}
        />

        <div className={styles.chartsGrid}>
          <PayrollWaterfall breakdown={breakdown} />
          <NetVsGrossChart year={year} bruto={bruto} />
        </div>

        <InflationCompareChart brutoRef2026={brutoRef2026} />
      </main>
      <footer className={styles.footer}>
        <p>
          Datos y algoritmo basados en el script Python original de{' '}
          <a
            href="https://github.com/jongonzlz/Calculadora-de-Salarios-y-Progresividad-en-Fr-o"
            target="_blank"
            rel="noopener noreferrer"
          >
            jongonzlz/Calculadora-de-Salarios-y-Progresividad-en-Fr-o
          </a>
          . Código abierto en{' '}
          <a
            href="https://github.com/manuartero/irpf-transparente.github.io"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          .
        </p>
      </footer>
    </div>
  );
}
