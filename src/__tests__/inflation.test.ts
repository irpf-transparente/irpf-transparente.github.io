import { describe, expect, it } from 'vitest';
import { IPC_ANUAL_DIC } from '../domain/constants';
import { cumulativeInflation } from '../domain/inflation';

describe('cumulativeInflation', () => {
  it('returns 1 when from === to', () => {
    expect(cumulativeInflation(2026, 2026)).toBe(1.0);
  });

  it('multiplies 1+ipc for years *after* the base year up to target', () => {
    // 2024 → 2026 covers 2025 (0.029) and 2026 (0.030)
    const expected = (1 + IPC_ANUAL_DIC[2025]) * (1 + IPC_ANUAL_DIC[2026]);
    expect(cumulativeInflation(2024, 2026)).toBeCloseTo(expected, 10);
  });

  it('is the reciprocal when going backwards', () => {
    const fwd = cumulativeInflation(2020, 2026);
    const back = cumulativeInflation(2026, 2020);
    expect(fwd * back).toBeCloseTo(1.0, 10);
  });
});
