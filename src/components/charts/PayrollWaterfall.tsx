import { Group } from '@visx/group';
import { ParentSize } from '@visx/responsive';
import { scaleLinear } from '@visx/scale';
import type { PayrollBreakdown } from '../../domain/types';
import { formatEuros, formatPercent } from '../../lib/format';
import { ChartCard, LegendItem } from './ChartCard';
import styles from './charts.module.css';

interface Props {
  breakdown: PayrollBreakdown;
}

interface Segment {
  key: string;
  label: string;
  value: number;
  color: string;
}

export function PayrollWaterfall({ breakdown }: Props) {
  const { bruto, cotTrabajador, irpfFinal, salarioNeto } = breakdown;
  if (bruto <= 0) {
    return (
      <ChartCard title="¿Adónde va cada euro de tu bruto?">
        <p className={styles.subTitle}>Introduce un salario bruto mayor que 0 para ver el reparto.</p>
      </ChartCard>
    );
  }

  const segments: Segment[] = [
    { key: 'neto', label: 'Neto', value: salarioNeto, color: 'var(--color-accent)' },
    { key: 'ss', label: 'SS trabajador', value: cotTrabajador, color: 'var(--color-warn)' },
    { key: 'irpf', label: 'IRPF', value: irpfFinal, color: 'var(--color-danger)' },
  ];

  return (
    <ChartCard
      title="¿Adónde va cada euro de tu bruto?"
      subtitle="Reparto del salario bruto entre neto, cotizaciones y IRPF. El ancho es proporcional al €."
      legend={
        <>
          <LegendItem color="var(--color-accent)" label="Neto" />
          <LegendItem color="var(--color-warn)" label="SS trabajador" />
          <LegendItem color="var(--color-danger)" label="IRPF" />
        </>
      }
    >
      <ParentSize>
        {({ width }) => (
          <WaterfallInner width={width} height={160} total={bruto} segments={segments} />
        )}
      </ParentSize>
    </ChartCard>
  );
}

interface InnerProps {
  width: number;
  height: number;
  total: number;
  segments: Segment[];
}

function WaterfallInner({ width, height, total, segments }: InnerProps) {
  if (width < 10 || total <= 0) return null;

  const margin = { top: 24, right: 16, bottom: 44, left: 16 };
  const innerW = width - margin.left - margin.right;
  const barH = 54;

  const x = scaleLinear<number>({
    domain: [0, total],
    range: [0, innerW],
  });

  let cursor = 0;
  const placed = segments.map((s) => {
    const start = cursor;
    cursor += s.value;
    return { ...s, start, end: cursor };
  });

  return (
    <svg width={width} height={height} className={styles.svg}>
      <Group left={margin.left} top={margin.top}>
        {/* Total bar background */}
        <rect x={0} y={0} width={innerW} height={barH} rx={8} fill="var(--color-bg-soft)" />
        {placed.map((s) => {
          const w = Math.max(0, x(s.end) - x(s.start));
          const pct = s.value / total;
          const showInline = w > 72;
          return (
            <Group key={s.key} left={x(s.start)}>
              <rect x={0} y={0} width={w} height={barH} fill={s.color} fillOpacity={0.85} />
              {showInline && (
                <>
                  <text x={10} y={22} className={styles.annotation} fill="var(--color-bg)" fontWeight={600}>
                    {s.label}
                  </text>
                  <text x={10} y={40} className={styles.annotation} fill="var(--color-bg)">
                    {formatEuros(s.value)} · {formatPercent(pct)}
                  </text>
                </>
              )}
            </Group>
          );
        })}
        <text x={0} y={-8} className={styles.annotation} fill="var(--color-text-dim)">
          Bruto anual
        </text>
        <text
          x={innerW}
          y={-8}
          className={styles.annotation}
          fill="var(--color-text-dim)"
          textAnchor="end"
        >
          {formatEuros(total)}
        </text>

        {/* Out-of-bar labels for small segments */}
        <Group top={barH + 16}>
          {placed.map((s) => {
            const w = Math.max(0, x(s.end) - x(s.start));
            const pct = s.value / total;
            if (w > 72) return null;
            return (
              <text
                key={s.key}
                x={x(s.start) + w / 2}
                y={0}
                className={styles.annotation}
                textAnchor="middle"
                fill={s.color}
              >
                {s.label} · {formatPercent(pct)}
              </text>
            );
          })}
        </Group>
      </Group>
    </svg>
  );
}
