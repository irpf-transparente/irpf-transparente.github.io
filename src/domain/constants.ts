import type { IrpfBracket, SocialSecurityRates, SolidarityTier, Year } from './types';

export const FIRST_YEAR: Year = 2012;
export const LAST_YEAR: Year = 2026;

/** Dec-to-Dec YoY CPI in Spain. Key = year, value = inflation rate that year. */
export const IPC_ANUAL_DIC: Record<Year, number> = {
  2013: 0.003,
  2014: -0.010,
  2015: 0.000,
  2016: 0.016,
  2017: 0.011,
  2018: 0.012,
  2019: 0.008,
  2020: -0.005,
  2021: 0.065,
  2022: 0.057,
  2023: 0.031,
  2024: 0.028,
  2025: 0.029,
  2026: 0.030,
};

/** Tope máximo de cotización a la Seguridad Social (anual). */
export const BASE_MAX: Record<Year, number> = {
  2012: 39150.0,
  2013: 41108.4,
  2014: 43164.0,
  2015: 43272.0,
  2016: 43704.0,
  2017: 45014.4,
  2018: 45014.4,
  2019: 48841.2,
  2020: 48841.2,
  2021: 48841.2,
  2022: 49672.8,
  2023: 53946.0,
  2024: 56646.0,
  2025: 58914.0,
  2026: 61214.4,
};

/**
 * Tipos de cotización de Seguridad Social agregados (suma de comunes, desempleo,
 * FOGASA, FP, AT&EP). Iguales para todos los años en el modelo original.
 */
export const SS_RATES_BASE: SocialSecurityRates = {
  // 0.236 + 0.055 + 0.002 + 0.006 + 0.015
  empresa: 0.314,
  // 0.047 + 0.0155 + 0 + 0.001 + 0
  trabajador: 0.0635,
};

/** MEI (Mecanismo de Equidad Intergeneracional). Defaults to 0/0 before 2023. */
export function meiRates(year: Year): SocialSecurityRates {
  if (year === 2023) return { empresa: 0.005, trabajador: 0.001 };
  if (year === 2024) return { empresa: 0.0058, trabajador: 0.0012 };
  if (year === 2025) return { empresa: 0.0067, trabajador: 0.0013 };
  if (year >= 2026) return { empresa: 0.0075, trabajador: 0.0015 };
  return { empresa: 0, trabajador: 0 };
}

/**
 * Cuota de solidaridad aplicable al exceso sobre la base máxima.
 * Se aplica en 3 tramos: hasta 10%, hasta 50% y más allá de la base máxima.
 * 5/6 cargado al empleador, 1/6 al trabajador.
 */
export function solidarityTiers(year: Year): SolidarityTier[] {
  if (year === 2025) {
    return [
      { upToBaseMaxMultiple: 1.10, rate: 0.0092 },
      { upToBaseMaxMultiple: 1.50, rate: 0.0100 },
      { upToBaseMaxMultiple: Infinity, rate: 0.0117 },
    ];
  }
  if (year >= 2026) {
    return [
      { upToBaseMaxMultiple: 1.10, rate: 0.0115 },
      { upToBaseMaxMultiple: 1.50, rate: 0.0125 },
      { upToBaseMaxMultiple: Infinity, rate: 0.0146 },
    ];
  }
  return [];
}

/** Mínimo personal del contribuyente (base general, sin adiciones familiares). */
export function irpfMinimo(year: Year): number {
  return year <= 2014 ? 5151 : 5550;
}

/**
 * Umbral de salario bruto a partir del cual empieza a aplicarse retención
 * (mínimo exento del Art. 81 RIRPF para soltero sin hijos, tipo 1).
 */
export function minimoExento(year: Year): number {
  if (year <= 2014) return 11162;
  if (year <= 2017) return 12000;
  if (year === 2018) return 12643;
  if (year <= 2022) return 14000;
  if (year === 2023) return 15000;
  return 15876;
}

/** Gastos fijos del Art. 19.2.f (gastos generales). */
export function gastosFijos(year: Year): number {
  return year <= 2014 ? 0 : 2000;
}

/** Escala general del IRPF (parte estatal + autonómica) por año. */
export function tramosIrpf(year: Year): IrpfBracket[] {
  if (year <= 2014) {
    return [
      { limit: 17707, rate: 0.2475 },
      { limit: 33007, rate: 0.30 },
      { limit: 53407, rate: 0.40 },
      { limit: 120000, rate: 0.47 },
      { limit: 175000, rate: 0.49 },
      { limit: 300000, rate: 0.51 },
      { limit: Infinity, rate: 0.52 },
    ];
  }
  if (year === 2015) {
    return [
      { limit: 12450, rate: 0.195 },
      { limit: 20200, rate: 0.245 },
      { limit: 34000, rate: 0.305 },
      { limit: 60000, rate: 0.38 },
      { limit: Infinity, rate: 0.46 },
    ];
  }
  if (year <= 2020) {
    return [
      { limit: 12450, rate: 0.19 },
      { limit: 20200, rate: 0.24 },
      { limit: 35200, rate: 0.30 },
      { limit: 60000, rate: 0.37 },
      { limit: Infinity, rate: 0.45 },
    ];
  }
  return [
    { limit: 12450, rate: 0.19 },
    { limit: 20200, rate: 0.24 },
    { limit: 35200, rate: 0.30 },
    { limit: 60000, rate: 0.37 },
    { limit: 300000, rate: 0.45 },
    { limit: Infinity, rate: 0.47 },
  ];
}
