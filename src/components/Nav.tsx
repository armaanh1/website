import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { profile } from '../content/profile';
import AccentPicker from './AccentPicker';
import type { Theme } from '../hooks/useTheme';
import './nav.css';

function SunIcon() {
  return (
    <svg className="nav__theme-icon nav__theme-icon--sun" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="4.4" fill="currentColor" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <line
          key={deg}
          x1="12"
          y1="1.8"
          x2="12"
          y2="4.4"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          transform={`rotate(${deg} 12 12)`}
        />
      ))}
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="nav__theme-icon nav__theme-icon--moon" viewBox="0 0 24 24" fill="none">
      <path
        d="M20.5 14.6A8.8 8.8 0 0 1 9.4 3.5a8.8 8.8 0 1 0 11.1 11.1Z"
        fill="currentColor"
      />
    </svg>
  );
}

const SECTIONS = [
  { id: 'work', label: 'Work' },
  { id: 'projects', label: 'Projects' },
  { id: 'stack', label: 'Stack' },
  { id: 'creative', label: 'Creative' },
  { id: 'contact', label: 'Contact' },
];

type Props = {
  theme: Theme;
  onToggleTheme: () => void;
  onOpenPalette: () => void;
  accent: string | null;
  onChangeAccent: (hex: string | null) => void;
};

export default function Nav({ theme, onToggleTheme, onOpenPalette, accent, onChangeAccent }: Props) {
  const { pathname } = useLocation();
  const onHome = pathname === '/';
  const [activeId, setActiveId] = useState('');
  const [mac, setMac] = useState(true);

  useEffect(() => {
    setMac(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent));
  }, []);

  /* Highlight whichever section owns the top third of the viewport. */
  useEffect(() => {
    if (!onHome) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: '-15% 0px -60% 0px', threshold: 0 },
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [onHome]);

  return (
    <header className="nav glass">
      <div className="nav__inner">
        <Link to="/" className="nav__brand">
          <span className="nav__mark" aria-hidden="true" />
          <span className="nav__name">{profile.name}</span>
        </Link>

        <nav className="nav__links" aria-label="Sections">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={onHome ? `#${s.id}` : `/#${s.id}`}
              className={`nav__link${onHome && activeId === s.id ? ' is-active' : ''}`}
            >
              {s.label}
            </a>
          ))}
        </nav>

        <div className="nav__actions">
          <button type="button" className="nav__cmd" onClick={onOpenPalette}>
            <span className="nav__cmd-text">Menu</span>
            <kbd>{mac ? '⌘' : 'Ctrl'}K</kbd>
          </button>
          <AccentPicker accent={accent} onChange={onChangeAccent} />
          <button
            type="button"
            className="nav__theme"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            <span className="nav__theme-track" aria-hidden="true">
              <span className="nav__theme-thumb" />
              <SunIcon />
              <MoonIcon />
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
