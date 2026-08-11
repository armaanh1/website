import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { flushSync } from 'react-dom';

export type Theme = 'light' | 'dark';

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => { finished: Promise<void> };
};

function current(): Theme {
  return (document.documentElement.dataset.theme as Theme) ?? 'light';
}

/** Theme is already painted by the inline script in index.html; this syncs React to it. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(current);

  /* Layout effect, not effect: flushSync below relies on this running
     synchronously so the whole DOM is in its new state inside one transition. */
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('theme', theme);
    } catch {
      /* private mode — the theme still applies for this session */
    }
  }, [theme]);

  const toggle = useCallback(() => {
    const next: Theme = current() === 'dark' ? 'light' : 'dark';
    const doc = document as ViewTransitionDocument;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* One cross-fade of the entire page. Transitioning individual properties
       instead lets the body ease while cards and the nav snap, so the new theme
       arrives in pieces. Where View Transitions aren't available it swaps
       instantly, which is still simultaneous. */
    if (reduced || typeof doc.startViewTransition !== 'function') {
      setTheme(next);
      return;
    }

    doc.startViewTransition(() => {
      flushSync(() => setTheme(next));
    });
  }, []);

  return { theme, setTheme, toggle };
}

/** Live `prefers-reduced-motion`, so components can branch on it at render time. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
