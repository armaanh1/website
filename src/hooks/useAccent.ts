import { useCallback, useEffect, useState } from 'react';
import { fitToBackground, inkFor, parseHex, toHex } from '../lib/color';
import type { Theme } from './useTheme';

const KEY = 'accent';

/** The page background each theme paints, so a custom accent can be checked against it. */
const BACKDROP: Record<Theme, string> = { light: '#f5f2ea', dark: '#1a1815' };

/** Enough separation to read as a link or a filled control in either theme. */
const MIN_CONTRAST = 3.2;

/**
 * An optional accent override. `null` means "use the palette in tokens.css",
 * which is hand-tuned per theme; a custom hex is fitted to whichever theme is
 * showing so one choice stays legible in both.
 */
export function useAccent(theme: Theme) {
  const [accent, setAccentState] = useState<string | null>(() => {
    try {
      const stored = localStorage.getItem(KEY);
      return stored && parseHex(stored) ? stored : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const root = document.documentElement;

    if (!accent) {
      root.style.removeProperty('--accent');
      root.style.removeProperty('--accent-ink');
      return;
    }

    const rgb = parseHex(accent);
    if (!rgb) return;

    const fitted = fitToBackground(rgb, parseHex(BACKDROP[theme])!, MIN_CONTRAST);
    root.style.setProperty('--accent', toHex(fitted));
    root.style.setProperty('--accent-ink', inkFor(fitted));
  }, [accent, theme]);

  const setAccent = useCallback((next: string | null) => {
    setAccentState(next);
    try {
      if (next) localStorage.setItem(KEY, next);
      else localStorage.removeItem(KEY);
    } catch {
      /* private mode — the choice still applies for this session */
    }
  }, []);

  return { accent, setAccent };
}
