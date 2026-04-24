export type Year = number;

export interface SocialSecurityRates {
  empresa: number;
  trabajador: number;
}

export interface SolidarityTier {
  upToBaseMaxMultiple: number;
  rate: number;
}

export interface Art20Meta {
  uInf: number | 'Transitorio';
  rMax: number | 'Transitorio';
  uSup: number | 'Transitorio';
  rMin: number | 'Transitorio';
}

export interface IrpfBracket {
  /** Upper limit of the bracket. Use `Infinity` for the last (open-ended) bracket. */
  limit: number;
  rate: number;
}

export interface YearParams {
  year: Year;
  baseMax: number;
  ssRates: SocialSecurityRates;
  mei: SocialSecurityRates;
  solidaridad: SolidarityTier[];
  irpfMinimo: number;
  minimoExento: number;
  gastosFijos: number;
  art20Meta: Art20Meta;
  tramosIrpf: IrpfBracket[];
}

export interface BracketQuota {
  /** Label in the form "T1 (19.0%)" — 1-indexed, matches Excel sheet. */
  label: string;
  tipo: number;
  cuota: number;
}

export interface PayrollBreakdown {
  year: Year;
  bruto: number;
  cotEmpresa: number;
  costeLaboral: number;
  cotTrabajador: number;
  rendimientoPrevio: number;
  gastosFijos: number;
  reduccionArt20: number;
  baseImponible: number;
  cuotasPorTramo: BracketQuota[];
  cuotaIntegra: number;
  cuotaMinimoPersonal: number;
  cuotaTeorica: number;
  deduccionSmi: number;
  cuotaTrasSmi: number;
  limite43pct: number;
  irpfFinal: number;
  salarioNeto: number;
}
