import type { PayrollBreakdown } from '../../domain/types';
import { formatEuros, formatPercent } from '../../lib/format';
import styles from './BreakdownTable.module.css';

interface Props {
  breakdown: PayrollBreakdown;
}

type RowKind = 'add' | 'sub' | 'sum' | 'info';

interface Row {
  label: string;
  value: number;
  kind?: RowKind;
  sub?: string;
}

export function BreakdownTable({ breakdown: b }: Props) {
  const tipoEfectivo = b.bruto > 0 ? b.irpfFinal / b.bruto : 0;
  const tipoTotal = b.bruto > 0 ? (b.irpfFinal + b.cotTrabajador) / b.bruto : 0;

  const rows: Row[] = [
    { label: 'Salario bruto anual', value: b.bruto, kind: 'info' },
    { label: 'Cotización SS trabajador', value: -b.cotTrabajador, kind: 'sub' },
    { label: 'Rendimiento previo', value: b.rendimientoPrevio, kind: 'sum' },
    { label: 'Gastos fijos Art. 19.2.f', value: -b.gastosFijos, kind: 'sub' },
    { label: 'Reducción Art. 20', value: -b.reduccionArt20, kind: 'sub' },
    { label: 'Base imponible', value: b.baseImponible, kind: 'sum' },
    { label: 'Cuota íntegra (escala)', value: b.cuotaIntegra, kind: 'info' },
    { label: 'Cuota del mínimo personal', value: -b.cuotaMinimoPersonal, kind: 'sub' },
    { label: 'Cuota teórica', value: b.cuotaTeorica, kind: 'sum' },
    { label: 'Deducción SMI', value: -b.deduccionSmi, kind: 'sub' },
    {
      label: 'Límite Art. 85.3 (43%)',
      value: b.limite43pct,
      kind: 'info',
      sub: 'tope sobre el exceso del mínimo exento',
    },
    { label: 'IRPF final (retención)', value: b.irpfFinal, kind: 'info' },
  ];

  return (
    <div className={styles.root}>
      {/* Hero: salario neto */}
      <div className={styles.hero}>
        <span className={`${styles.heroLabel} eyebrow`}>Tu salario neto anual</span>
        <span className={styles.heroValue} data-num>
          {formatEuros(b.salarioNeto, true)}
        </span>
        <span className={styles.heroMeta}>
          {formatEuros(b.salarioNeto / 12, true)}
          <span className={styles.heroMetaDim}> / mes (12 pagas)</span>
        </span>
        <dl className={styles.heroStats}>
          <div>
            <dt>Tipo IRPF efectivo</dt>
            <dd data-num>{formatPercent(tipoEfectivo)}</dd>
          </div>
          <div>
            <dt>Retención total (IRPF + SS)</dt>
            <dd data-num>{formatPercent(tipoTotal)}</dd>
          </div>
          <div>
            <dt>Coste laboral empresa</dt>
            <dd data-num>{formatEuros(b.costeLaboral)}</dd>
          </div>
        </dl>
      </div>

      {/* Detailed breakdown */}
      <section className={styles.detailSection}>
        <h3 className={styles.detailTitle}>
          <span className={styles.detailNumber}>§ 01.a</span>
          Desglose paso a paso
        </h3>
        <table className={styles.table}>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className={styles[r.kind ?? 'info']}>
                <th scope="row" className={styles.label}>
                  <span>{r.label}</span>
                  {r.sub && <span className={styles.sublabel}>{r.sub}</span>}
                </th>
                <td className={styles.value} data-num>
                  {r.value < 0 ? '−' : ''}
                  {formatEuros(Math.abs(r.value), true)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <details className={styles.details}>
          <summary>Cuota por tramo de la escala IRPF</summary>
          <table className={styles.subtable}>
            <thead>
              <tr>
                <th>Tramo</th>
                <th>Tipo</th>
                <th className={styles.subtableRight}>Cuota</th>
              </tr>
            </thead>
            <tbody>
              {b.cuotasPorTramo.map((t) => (
                <tr key={t.label}>
                  <td>{t.label}</td>
                  <td data-num>{formatPercent(t.tipo)}</td>
                  <td className={styles.subtableRight} data-num>
                    {formatEuros(t.cuota, true)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </section>
    </div>
  );
}
