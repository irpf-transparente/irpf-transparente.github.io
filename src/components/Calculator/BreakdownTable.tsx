import type { PayrollBreakdown } from '../../domain/types';
import { formatEuros, formatPercent } from '../../lib/format';
import styles from './BreakdownTable.module.css';

interface Props {
  breakdown: PayrollBreakdown;
}

type RowKind = 'add' | 'sub' | 'sum' | 'info' | 'highlight';

interface Row {
  label: string;
  value: number;
  kind?: RowKind;
  sub?: string;
}

export function BreakdownTable({ breakdown: b }: Props) {
  const tipoEfectivo = b.bruto > 0 ? b.irpfFinal / b.bruto : 0;

  const rows: Row[] = [
    { label: 'Salario bruto anual', value: b.bruto, kind: 'info' },
    { label: '− Cotización SS trabajador', value: -b.cotTrabajador, kind: 'sub' },
    { label: '= Rendimiento previo', value: b.rendimientoPrevio, kind: 'sum' },
    { label: '− Gastos fijos Art. 19.2.f', value: -b.gastosFijos, kind: 'sub' },
    { label: '− Reducción Art. 20', value: -b.reduccionArt20, kind: 'sub' },
    { label: '= Base imponible', value: b.baseImponible, kind: 'sum' },
    { label: 'Cuota íntegra (escala)', value: b.cuotaIntegra, kind: 'info' },
    { label: '− Cuota mínimo personal', value: -b.cuotaMinimoPersonal, kind: 'sub' },
    { label: '= Cuota teórica', value: b.cuotaTeorica, kind: 'sum' },
    { label: '− Deducción SMI', value: -b.deduccionSmi, kind: 'sub' },
    {
      label: 'Límite 43% (Art. 85.3)',
      value: b.limite43pct,
      kind: 'info',
      sub: 'tope sobre el exceso del mínimo exento',
    },
    { label: 'IRPF final (retención)', value: b.irpfFinal, kind: 'highlight' },
    {
      label: 'Salario neto anual',
      value: b.salarioNeto,
      kind: 'highlight',
      sub: `tipo efectivo ${formatPercent(tipoEfectivo)}`,
    },
  ];

  return (
    <div className={styles.root}>
      <h2 className={styles.title}>Desglose anual</h2>
      <table className={styles.table}>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className={styles[r.kind ?? 'info']}>
              <th scope="row" className={styles.label}>
                {r.label}
                {r.sub && <span className={styles.sublabel}>{r.sub}</span>}
              </th>
              <td className={styles.value}>
                {r.value < 0 ? '−' : ''}
                {formatEuros(Math.abs(r.value), true)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <details className={styles.details}>
        <summary>Cuotas por tramo de la escala</summary>
        <table className={styles.subtable}>
          <thead>
            <tr>
              <th>Tramo</th>
              <th>Tipo</th>
              <th>Cuota</th>
            </tr>
          </thead>
          <tbody>
            {b.cuotasPorTramo.map((t) => (
              <tr key={t.label}>
                <td>{t.label}</td>
                <td>{formatPercent(t.tipo)}</td>
                <td className={styles.value}>{formatEuros(t.cuota, true)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>

      <div className={styles.costHint}>
        <span>Coste laboral empresa</span>
        <strong>{formatEuros(b.costeLaboral, true)}</strong>
        <span className={styles.costHintDim}>
          ({formatEuros(b.cotEmpresa, true)} en SS)
        </span>
      </div>
    </div>
  );
}
