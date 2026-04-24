import { describe, expect, it } from 'vitest';
import fixture from '../../fixtures/parity.json';
import { computePayroll } from '../domain/payroll';

interface ParityRow {
  year: number;
  bruto: number;
  cotEmpresa: number;
  costeLaboral: number;
  cotTrabajador: number;
  rendimientoPrevio: number;
  gastosFijos: number;
  reduccionArt20: number;
  baseImponible: number;
  cuotaIntegra: number;
  cuotaMinimoPersonal: number;
  cuotaTeorica: number;
  deduccionSmi: number;
  cuotaTrasSmi: number;
  limite43pct: number;
  irpfFinal: number;
  salarioNeto: number;
}

const TOLERANCE = 0.01;
const rows = (fixture as { rows: ParityRow[] }).rows;

const FIELDS: (keyof ParityRow)[] = [
  'cotEmpresa',
  'costeLaboral',
  'cotTrabajador',
  'rendimientoPrevio',
  'gastosFijos',
  'reduccionArt20',
  'baseImponible',
  'cuotaIntegra',
  'cuotaMinimoPersonal',
  'cuotaTeorica',
  'deduccionSmi',
  'cuotaTrasSmi',
  'limite43pct',
  'irpfFinal',
  'salarioNeto',
];

describe('parity vs Python reference', () => {
  it(`matches ${rows.length} rows within €${TOLERANCE}`, () => {
    const failures: string[] = [];

    for (const row of rows) {
      const actual = computePayroll(row.bruto, row.year);
      for (const field of FIELDS) {
        const expected = row[field] as number;
        const got = actual[field as keyof typeof actual] as number;
        if (Math.abs(expected - got) > TOLERANCE) {
          failures.push(
            `year=${row.year} bruto=${row.bruto} field=${field} ` +
              `expected=${expected.toFixed(4)} got=${got.toFixed(4)} ` +
              `diff=${(got - expected).toFixed(4)}`,
          );
        }
      }
    }

    if (failures.length > 0) {
      throw new Error(`${failures.length} parity mismatches:\n` + failures.slice(0, 20).join('\n'));
    }
    expect(failures).toEqual([]);
  });
});
