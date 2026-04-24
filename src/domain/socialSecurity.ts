import type { YearParams } from './types';

export interface SocialSecurityContributions {
  empresa: number;
  trabajador: number;
  /** Base sobre la que se aplican los tipos SS (capada por `baseMax`). */
  baseCotizacion: number;
  /** Exceso del bruto sobre la base máxima (sujeto a solidaridad si aplica). */
  excesoBase: number;
}

/**
 * Calcula las cotizaciones sociales — incluyendo MEI y, cuando aplica, la
 * cuota de solidaridad sobre el exceso de base máxima (5/6 empresa, 1/6 trabajador).
 */
export function computeSocialSecurity(bruto: number, p: YearParams): SocialSecurityContributions {
  const baseCotizacion = Math.min(bruto, p.baseMax);
  const excesoBase = Math.max(0, bruto - p.baseMax);

  const tipoEmpresa = p.ssRates.empresa + p.mei.empresa;
  const tipoTrabajador = p.ssRates.trabajador + p.mei.trabajador;

  let empresa = baseCotizacion * tipoEmpresa;
  let trabajador = baseCotizacion * tipoTrabajador;

  if (p.solidaridad.length > 0 && excesoBase > 0) {
    const l1 = p.baseMax * 0.10; // 10% adicional
    const l2 = p.baseMax * 0.50; // 50% adicional
    const [t1, t2, t3] = p.solidaridad;

    const e1 = Math.min(excesoBase, l1);
    const e2 = Math.min(Math.max(0, excesoBase - l1), l2 - l1);
    const e3 = Math.max(0, excesoBase - l2);

    const cuotaSol = e1 * t1.rate + e2 * t2.rate + e3 * t3.rate;
    empresa += cuotaSol * (5 / 6);
    trabajador += cuotaSol * (1 / 6);
  }

  return { empresa, trabajador, baseCotizacion, excesoBase };
}
