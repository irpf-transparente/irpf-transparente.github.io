import { getParams } from './params';
import { laborReduction } from './laborReduction';
import { smiDeduction } from './smiDeduction';
import { bracketQuotas } from './taxBrackets';
import { computeSocialSecurity } from './socialSecurity';
import type { PayrollBreakdown, Year, YearParams } from './types';

/**
 * Desglose completo de una nómina anual (con 12 pagas o 14 equivalentes al año).
 * Todos los importes están en euros anuales.
 *
 * Pipeline:
 *   bruto → (SS_trab) → rendimiento previo → (gastos fijos + Art. 20) →
 *   base imponible → (tramos IRPF) → cuota íntegra → (mín. personal, SMI) →
 *   cuota teórica → min(limite Art. 85.3 RIRPF, cuota) → IRPF final → neto
 */
export function computePayroll(bruto: number, year: Year): PayrollBreakdown {
  const params = getParams(year);
  return computePayrollWithParams(bruto, params);
}

/** Variante para cuando ya se tienen los parámetros (uso en bucles). */
export function computePayrollWithParams(bruto: number, params: YearParams): PayrollBreakdown {
  const ss = computeSocialSecurity(bruto, params);

  const costeLaboral = bruto + ss.empresa;
  const rendimientoPrevio = bruto - ss.trabajador;

  const reduccionArt20 = laborReduction(rendimientoPrevio, params.year);

  // El script Python detallado expone rendimiento_neto intermedio; a efectos
  // matemáticos `max(0, max(0, A-B) - C) === max(0, A-B-C)` para entradas
  // sensatas, y preservamos el mismo esquema en dos pasos para claridad.
  const rendimientoNeto = Math.max(0, rendimientoPrevio - params.gastosFijos);
  const baseImponible = Math.max(0, rendimientoNeto - reduccionArt20);

  const { perBracket, total: cuotaIntegra } = bracketQuotas(baseImponible, params.tramosIrpf);

  // Cuota del mínimo personal: se aplica el tipo del PRIMER tramo al
  // mínimo del contribuyente y se descuenta de la cuota íntegra.
  const cuotaMinimoPersonal = params.irpfMinimo * params.tramosIrpf[0].rate;
  const cuotaTeorica = Math.max(0, cuotaIntegra - cuotaMinimoPersonal);

  const deduccionSmiValor = smiDeduction(bruto, params.year);
  const cuotaTrasSmi = Math.max(0, cuotaTeorica - deduccionSmiValor);

  // Límite Art. 85.3 RIRPF: la retención no puede superar el 43% del
  // exceso sobre el mínimo exento.  Protege a contribuyentes cercanos al umbral.
  const limite43pct = Math.max(0, (bruto - params.minimoExento) * 0.43);
  const irpfFinal = Math.min(cuotaTrasSmi, limite43pct);
  const salarioNeto = bruto - ss.trabajador - irpfFinal;

  return {
    year: params.year,
    bruto,
    cotEmpresa: ss.empresa,
    costeLaboral,
    cotTrabajador: ss.trabajador,
    rendimientoPrevio,
    gastosFijos: params.gastosFijos,
    reduccionArt20,
    baseImponible,
    cuotasPorTramo: perBracket,
    cuotaIntegra,
    cuotaMinimoPersonal,
    cuotaTeorica,
    deduccionSmi: deduccionSmiValor,
    cuotaTrasSmi,
    limite43pct,
    irpfFinal,
    salarioNeto,
  };
}
