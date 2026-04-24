import {
  BASE_MAX,
  gastosFijos,
  irpfMinimo,
  meiRates,
  minimoExento,
  solidarityTiers,
  SS_RATES_BASE,
  tramosIrpf,
} from './constants';
import { art20Meta } from './laborReduction';
import type { Year, YearParams } from './types';

export function getParams(year: Year): YearParams {
  return {
    year,
    baseMax: BASE_MAX[year],
    ssRates: SS_RATES_BASE,
    mei: meiRates(year),
    solidaridad: solidarityTiers(year),
    irpfMinimo: irpfMinimo(year),
    minimoExento: minimoExento(year),
    gastosFijos: gastosFijos(year),
    art20Meta: art20Meta(year),
    tramosIrpf: tramosIrpf(year),
  };
}
