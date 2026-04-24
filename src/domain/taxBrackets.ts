import type { BracketQuota, IrpfBracket } from './types';

/**
 * Computa la cuota por tramo y la cuota íntegra para una base liquidable.
 * Reproduce `calcular_cuotas_por_tramo` del script Python: etiqueta cada
 * tramo como "T{n} ({tipo}%)" con un único decimal.
 */
export function bracketQuotas(baseLiq: number, tramos: IrpfBracket[]): {
  perBracket: BracketQuota[];
  total: number;
} {
  const perBracket: BracketQuota[] = tramos.map((t, i) => ({
    label: `T${i + 1} (${round(t.rate * 100, 1)}%)`,
    tipo: t.rate,
    cuota: 0,
  }));

  if (baseLiq <= 0) {
    return { perBracket, total: 0 };
  }

  let total = 0;
  let prevLimit = 0;
  for (let i = 0; i < tramos.length; i++) {
    const { limit, rate } = tramos[i];
    if (baseLiq > limit) {
      const cuota = (limit - prevLimit) * rate;
      perBracket[i].cuota = cuota;
      total += cuota;
      prevLimit = limit;
    } else {
      const cuota = (baseLiq - prevLimit) * rate;
      perBracket[i].cuota = cuota;
      total += cuota;
      break;
    }
  }

  return { perBracket, total };
}

function round(value: number, decimals: number): number {
  const m = 10 ** decimals;
  return Math.round(value * m) / m;
}
