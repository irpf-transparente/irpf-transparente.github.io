import { AxisBottom, AxisLeft } from '@visx/axis';
import { Group } from '@visx/group';
import { ParentSize } from '@visx/responsive';
import { scaleBand, scaleLinear } from '@visx/scale';
import { Bar, Line } from '@visx/shape';
import { useMemo } from 'react';
import { buildInflationSeries, type InflationComparisonPoint } from '../../domain/comparison';
import { formatEuros } from '../../lib/format';
import { ChartCard, LegendItem } from './ChartCard';
import styles from './charts.module.css';

interface Props {
  /** Salario de referencia en € de 2026 usado como eje de comparación. */
  brutoRef2026: number;
}

export function InflationCompareChart({ brutoRef2026 }: Props) {
  const series = useMemo(() => buildInflationSeries(brutoRef2026), [brutoRef2026]);
  const ref = series.find((p) => p.year === 2026)?.netoReferencia2026 ?? 0;

  return (
    <ChartCard
      title="Progresividad en frío (2012 – 2026)"
      subtitle={
        `¿Cuánto neto real (en € de 2026) cobraría alguien que tuviera el mismo poder adquisitivo que ` +
        `${formatEuros(brutoRef2026)} brutos hoy, según las reglas fiscales de cada año? ` +
        `Las barras por encima del 0 indican años en los que cobraría más neto real; por debajo, menos.`
      }
      legend={
        <>
          <LegendItem color="var(--color-accent)" label="Ganancia real vs 2026" />
          <LegendItem color="var(--color-danger)" label="Pérdida real vs 2026" />
        </>
      }
    >
      <ParentSize>
        {({ width }) => (
          <InflationCompareInner width={width} height={280} series={series} refNeto={ref} />
        )}
      </ParentSize>
    </ChartCard>
  );
}

interface InnerProps {
  width: number;
  height: number;
  series: InflationComparisonPoint[];
  refNeto: number;
}

function InflationCompareInner({ width, height, series, refNeto: _refNeto }: InnerProps) {
  if (width < 10 || series.length === 0) return null;

  const margin = { top: 16, right: 12, bottom: 32, left: 80 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const deltas = series.map((p) => p.deltaPoderAdqAnual);
  const maxAbs = Math.max(1, ...deltas.map((d) => Math.abs(d)));

  const x = scaleBand<number>({
    domain: series.map((p) => p.year),
    range: [0, innerW],
    padding: 0.25,
  });
  const y = scaleLinear<number>({
    domain: [-maxAbs * 1.1, maxAbs * 1.1],
    range: [innerH, 0],
    nice: true,
  });

  return (
    <svg width={width} height={height} className={styles.svg}>
      <Group left={margin.left} top={margin.top}>
        {series.map((p) => {
          const bx = x(p.year) ?? 0;
          const bw = x.bandwidth();
          const zero = y(0);
          const top = y(Math.max(0, p.deltaPoderAdqAnual));
          const bottom = y(Math.min(0, p.deltaPoderAdqAnual));
          const height_ = bottom - top;
          const positive = p.deltaPoderAdqAnual >= 0;
          const fill = positive ? 'var(--color-accent)' : 'var(--color-danger)';
          return (
            <g key={p.year}>
              <Bar
                x={bx}
                y={top}
                width={bw}
                height={Math.max(1, height_)}
                fill={fill}
                fillOpacity={0.8}
                rx={3}
              />
              <text
                x={bx + bw / 2}
                y={positive ? top - 6 : bottom + 12}
                className={styles.annotation}
                textAnchor="middle"
                fill="var(--color-text-dim)"
                fontSize={10}
              >
                {p.deltaPoderAdqAnual >= 0 ? '+' : '−'}
                {formatEuros(Math.abs(p.deltaPoderAdqAnual))}
              </text>
              <line
                x1={bx}
                x2={bx + bw}
                y1={zero}
                y2={zero}
                stroke="var(--color-text)"
                strokeWidth={0}
              />
            </g>
          );
        })}

        {/* Zero reference line */}
        <Line
          from={{ x: 0, y: y(0) }}
          to={{ x: innerW, y: y(0) }}
          stroke="var(--color-text)"
          strokeWidth={1.5}
        />

        <AxisLeft
          scale={y}
          numTicks={5}
          tickFormat={(v) => formatEuros(Number(v))}
          stroke="var(--color-border)"
          tickStroke="var(--color-border)"
          tickLabelProps={() => ({
            fill: 'var(--color-text-dim)',
            fontSize: 11,
            textAnchor: 'end',
            dx: -4,
            dy: 3,
          })}
        />
        <AxisBottom
          top={innerH}
          scale={x}
          stroke="var(--color-border)"
          tickStroke="var(--color-border)"
          tickFormat={(v) => String(v)}
          tickLabelProps={() => ({
            fill: 'var(--color-text-dim)',
            fontSize: 11,
            textAnchor: 'middle',
            dy: 4,
          })}
        />
      </Group>
    </svg>
  );
}
