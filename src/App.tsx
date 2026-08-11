import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Nav from './components/Nav';
import CommandPalette from './components/CommandPalette';
import Footer from './components/Footer';
import Home from './routes/Home';
import Writing from './routes/Writing';
import NotFound from './routes/NotFound';
import { useTheme } from './hooks/useTheme';
import { useAccent } from './hooks/useAccent';

export default function App() {
  const { theme, toggle } = useTheme();
  const { accent, setAccent } = useAccent(theme);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { pathname, hash } = useLocation();

  /* ⌘K / Ctrl-K anywhere, plus "/" as a quick-open when not already typing. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing =
        e.target instanceof HTMLElement &&
        (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable);

      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      } else if (e.key === '/' && !typing && !paletteOpen) {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [paletteOpen]);

  /* Route changes go to the top; in-page hashes are left to the browser. */
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Nav
        theme={theme}
        onToggleTheme={toggle}
        onOpenPalette={() => setPaletteOpen(true)}
        accent={accent}
        onChangeAccent={setAccent}
      />
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/writing/:slug" element={<Writing />} />
          {/* Links that were shared before the rebuild still land somewhere sensible. */}
          <Route path="/cs-373.html" element={<Navigate to="/writing/cs-373" replace />} />
          <Route path="/cs-371p.html" element={<Navigate to="/writing/cs-371p" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        theme={theme}
        onToggleTheme={toggle}
      />
    </>
  );
}
