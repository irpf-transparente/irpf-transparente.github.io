import { useEffect, useRef, useState } from 'react';
import { FIRST_YEAR, LAST_YEAR } from '../domain/constants';
import type { Year } from '../domain/types';

interface AppState {
  year: Year;
  bruto: number;
}

const DEFAULTS: AppState = { year: LAST_YEAR, bruto: 30000 };

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function parseFromLocation(): AppState {
  if (typeof window === 'undefined') return DEFAULTS;
  const params = new URLSearchParams(window.location.search);
  const rawYear = Number(params.get('year'));
  const rawBruto = Number(params.get('bruto'));

  const year: Year = Number.isFinite(rawYear) && rawYear >= FIRST_YEAR && rawYear <= LAST_YEAR
    ? rawYear
    : DEFAULTS.year;
  const bruto = Number.isFinite(rawBruto) && rawBruto > 0
    ? clamp(Math.round(rawBruto), 0, 1_000_000)
    : DEFAULTS.bruto;

  return { year, bruto };
}

/**
 * Syncs `{year, bruto}` with the URL query string so links are shareable.
 * Uses `history.replaceState` (no history pollution as the user drags the slider).
 */
export function useUrlState(): [AppState, (patch: Partial<AppState>) => void] {
  const [state, setState] = useState<AppState>(() => parseFromLocation());
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    const params = new URLSearchParams();
    params.set('year', String(state.year));
    params.set('bruto', String(state.bruto));
    const newUrl = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
    window.history.replaceState(null, '', newUrl);
  }, [state]);

  // Keep state in sync with back/forward navigation.
  useEffect(() => {
    const onPop = () => setState(parseFromLocation());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const patch = (p: Partial<AppState>) => setState((prev) => ({ ...prev, ...p }));
  return [state, patch];
}
