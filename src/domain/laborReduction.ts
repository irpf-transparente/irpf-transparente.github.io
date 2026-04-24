import type { Art20Meta, Year } from './types';

/**
 * Reducción por rendimientos del trabajo (Art. 20 LIRPF).
 *
 * Parámetros definidos por año.  El 2018 es un régimen transitorio que
 * promedia la fórmula de 2015-2017 con la nueva de 2019-2022.
 */
export function laborReduction(rendimientoPrevio: number, year: Year): number {
  const rn = rendimientoPrevio;

  if (year <= 2014) {
    if (rn <= 9180) return 4080.0;
    if (rn <= 13260) return 4080.0 - 0.35 * (rn - 9180.0);
    return 2652.0;
  }

  if (year <= 2017) return reduction_2015_2017(rn);

  if (year === 2018) {
    // Régimen transitorio: promedio de la regla saliente (2015-2017) y la
    // entrante (2019-2022).
    const pre = reduction_2015_2017(rn);
    const post = reduction_2019_2022(rn);
    return pre / 2 + post / 2;
  }

  if (year <= 2022) return reduction_2019_2022(rn);

  if (year === 2023) {
    if (rn <= 14047.5) return 6498.0;
    if (rn <= 19747.5) return Math.max(0, 6498.0 - 1.14 * (rn - 14047.5));
    return 0;
  }

  // 2024+ — tramo intermedio adicional al 1.75 antes de caer al 1.14
  if (rn <= 14852) return 7302.0;
  if (rn <= 17673.52) return 7302.0 - 1.75 * (rn - 14852.0);
  if (rn <= 19747.5) return 2364.34 - 1.14 * (rn - 17673.52);
  return 0;
}

function reduction_2015_2017(rn: number): number {
  if (rn <= 11250) return 3700.0;
  if (rn <= 14450) return 3700.0 - 1.15625 * (rn - 11250.0);
  return 0;
}

function reduction_2019_2022(rn: number): number {
  if (rn <= 13115) return 5565.0;
  if (rn <= 16825) return Math.max(0, 5565.0 - 1.5 * (rn - 13115.0));
  return 0;
}

/** Metadatos de los umbrales Art. 20 para tablas de control. */
export function art20Meta(year: Year): Art20Meta {
  if (year <= 2014) return { uInf: 9180, rMax: 4080, uSup: 13260, rMin: 2652 };
  if (year <= 2017) return { uInf: 11250, rMax: 3700, uSup: 14450, rMin: 0 };
  if (year === 2018) {
    return {
      uInf: 'Transitorio',
      rMax: 'Transitorio',
      uSup: 'Transitorio',
      rMin: 'Transitorio',
    };
  }
  if (year <= 2022) return { uInf: 13115, rMax: 5565, uSup: 16825, rMin: 0 };
  if (year === 2023) return { uInf: 14047.5, rMax: 6498, uSup: 19747.5, rMin: 0 };
  return { uInf: 14852, rMax: 7302, uSup: 19747.5, rMin: 0 };
}
