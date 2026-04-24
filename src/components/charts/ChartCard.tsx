import type { ReactNode } from 'react';
import styles from './ChartCard.module.css';

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
  legend?: ReactNode;
}

export function ChartCard({ title, subtitle, children, legend }: Props) {
  return (
    <section className={styles.root}>
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>{title}</h2>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        {legend && <div className={styles.legend}>{legend}</div>}
      </header>
      <div className={styles.body}>{children}</div>
    </section>
  );
}

interface LegendItemProps {
  color: string;
  label: string;
}

export function LegendItem({ color, label }: LegendItemProps) {
  return (
    <span className={styles.legendItem}>
      <span className={styles.legendSwatch} style={{ background: color }} />
      {label}
    </span>
  );
}
