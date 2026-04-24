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

  const brutoRef2026 = useMemo(
    () => (year === 2026 ? bruto : Math.round(bruto * cumulativeInflation(year, 2026))),
    [bruto, year],
  );

  return (
    <div className={styles.app}>
      <div className={styles.marginalia} aria-hidden="true">
        IRPF · 2012—2026
      </div>

      <header className={styles.header}>
        <span className={`${styles.eyebrow} eyebrow`}>Un proyecto cívico · código abierto</span>
        <h1 className={styles.title}>
          IRPF <em>Transparente</em>
        </h1>
        <p className={styles.dek}>
          Calcula tu nómina española entre 2012 y 2026, y visualiza cuánto ha
          pesado la <em>progresividad en frío</em> — esos tramos del IRPF que
          no se actualizan con la inflación — en el dinero que terminas
          cobrando.
        </p>
      </header>

      <main className={styles.main}>
        <section className={styles.section}>
          <header className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>§ 01</span>
            <h2 className={styles.sectionTitle}>La calculadora</h2>
            <p className={styles.sectionKicker}>
              Ajusta el año y el salario bruto anual. Cada cambio recalcula
              el desglose en vivo y actualiza la URL para que puedas
              compartir el enlace.
            </p>
          </header>
          <Calculator
            year={year}
            bruto={bruto}
            onYearChange={(y) => patch({ year: y })}
            onBrutoChange={(b) => patch({ bruto: b })}
          />
        </section>

        <section className={styles.section}>
          <header className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>§ 02</span>
            <h2 className={styles.sectionTitle}>¿Adónde va el dinero?</h2>
            <p className={styles.sectionKicker}>
              El reparto del bruto entre lo que retienes, lo que va a
              Hacienda y lo que va a la Seguridad Social, visto desde dos
              ángulos distintos.
            </p>
          </header>
          <div className={styles.chartsGrid}>
            <PayrollWaterfall breakdown={breakdown} />
            <NetVsGrossChart year={year} bruto={bruto} />
          </div>
        </section>

        <section className={styles.section}>
          <header className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>§ 03</span>
            <h2 className={styles.sectionTitle}>Progresividad en frío</h2>
            <p className={styles.sectionKicker}>
              Lo que deberían cobrar, hoy, quienes hubieran tenido el mismo
              poder adquisitivo en cada uno de los últimos quince años —
              aplicando las reglas fiscales que estaban vigentes entonces.
              La diferencia con el neto real de 2026 es la factura oculta
              de no indexar los tramos.
            </p>
          </header>
          <InflationCompareChart brutoRef2026={brutoRef2026} />
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerRule} aria-hidden="true" />
        <p className={styles.colophon}>
          <span className={`${styles.colophonLabel} eyebrow`}>Colofón</span>
          Datos y algoritmo portados del{' '}
          <a
            href="https://github.com/jongonzlz/Calculadora-de-Salarios-y-Progresividad-en-Fr-o"
            target="_blank"
            rel="noopener noreferrer"
          >
            script Python original
          </a>
          {' '}de jongonzlz. Implementación abierta en{' '}
          <a
            href="https://github.com/manuartero/irpf-transparente.github.io"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          . Los tests de paridad garantizan ±0,01 € frente a la referencia.
        </p>
      </footer>
    </div>
  );
}
