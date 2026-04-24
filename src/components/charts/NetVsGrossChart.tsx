import { AxisBottom, AxisLeft } from '@visx/axis';
import { Group } from '@visx/group';
import { ParentSize } from '@visx/responsive';
import { scaleLinear } from '@visx/scale';
import { AreaStack, Line } from '@visx/shape';
import { useMemo } from 'react';
import { getParams } from '../../domain/params';
import type { Year } from '../../domain/types';
import { usePayrollSeries, type PayrollSeriesPoint } from '../../hooks/usePayrollSeries';
import { formatEuros } from '../../lib/format';
import { ChartCard, LegendItem } from './ChartCard';
import styles from './charts.module.css';

interface Props {
  year: Year;
  bruto: number;
}

const MAX_BRUTO = 120000;
const KEYS = ['neto', 'ssTrabajador', 'irpfFinal'] as const;
const COLORS: Record<typeof KEYS[number], string> = {
  neto: 'var(--color-accent)',
  ssTrabajador: 'var(--color-warn)',
  irpfFinal: 'var(--color-danger)',
};

export function NetVsGrossChart({ year, bruto }: Props) {
  const series = usePayrollSeries(year, 0, MAX_BRUTO, 500);
  const params = useMemo(() => getParams(year), [year]);

  return (
    <ChartCard
      title="¿Cuánto del bruto es realmente tuyo?"
      subtitle={`Composición del salario bruto por tramos en ${year}. Las áreas apiladas suman el bruto.`}
      legend={
        <>
          <LegendItem color="var(--color-accent)" label="Salario neto" />
          <LegendItem color="var(--color-warn)" label="SS trabajador" />
          <LegendItem color="var(--color-danger)" label="IRPF" />
        </>
      }
    >
      <ParentSize>
        {({ width }) => (
          <NetVsGrossInner
            width={width}
            height={320}
            series={series}
            currentBruto={bruto}
            bracketLimits={params.tramosIrpf
              .map((t) => t.limit)
              .filter((l) => Number.isFinite(l) && l <= MAX_BRUTO)}
          />
        )}
      </ParentSize>
    </ChartCard>
  );
}

interface InnerProps {
  width: number;
  height: number;
  series: PayrollSeriesPoint[];
  currentBruto: number;
  bracketLimits: number[];
}

function NetVsGrossInner({ width, height, series, currentBruto, bracketLimits }: InnerProps) {
  if (width < 10) return null;

  const margin = { top: 8, right: 12, bottom: 36, left: 64 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const x = scaleLinear<number>({
    domain: [0, MAX_BRUTO],
    range: [0, innerW],
  });
  const y = scaleLinear<number>({
    domain: [0, MAX_BRUTO],
    range: [innerH, 0],
    nice: true,
  });

  const currentPoint = series.find((p) => p.bruto >= currentBruto) ?? series[series.length - 1];

  return (
    <svg width={width} height={height} className={styles.svg}>
      <Group left={margin.left} top={margin.top}>
        {/* Reference lines at bracket limits */}
        {bracketLimits.map((limit) => (
          <Line
            key={limit}
            from={{ x: x(limit), y: 0 }}
            to={{ x: x(limit), y: innerH }}
            stroke="var(--color-border)"
            strokeDasharray="2 4"
            strokeWidth={1}
          />
        ))}

        <AreaStack<PayrollSeriesPoint, typeof KEYS[number]>
          data={series}
          keys={KEYS as unknown as typeof KEYS[number][]}
          value={(d, k) => d[k]}
          x={(d) => x(d.data.bruto)}
          y0={(d) => y(d[0])}
          y1={(d) => y(d[1])}
        >
          {({ stacks, path }) =>
            stacks.map((stack) => (
              <path
                key={stack.key}
                d={path(stack) ?? ''}
                fill={COLORS[stack.key]}
                fillOpacity={stack.key === 'neto' ? 0.65 : 0.55}
                stroke={COLORS[stack.key]}
                strokeOpacity={0.9}
                strokeWidth={1}
              />
            ))
          }
        </AreaStack>

        {/* Current bruto marker */}
        {currentPoint && (
          <>
            <Line
              from={{ x: x(currentBruto), y: 0 }}
              to={{ x: x(currentBruto), y: innerH }}
              stroke="var(--color-text)"
              strokeWidth={1.5}
              strokeDasharray="4 3"
            />
            <circle
              cx={x(currentBruto)}
              cy={y(currentPoint.neto)}
              r={5}
              fill="var(--color-accent)"
              stroke="var(--color-bg)"
              strokeWidth={2}
            />
            <text
              x={x(currentBruto) + 6}
              y={y(currentPoint.neto) - 8}
              className={styles.annotation}
            >
              {formatEuros(currentPoint.neto)} neto
            </text>
          </>
        )}

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
          numTicks={6}
          tickFormat={(v) => formatEuros(Number(v))}
          stroke="var(--color-border)"
          tickStroke="var(--color-border)"
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
