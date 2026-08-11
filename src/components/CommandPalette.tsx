import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { profile } from '../content/profile';
import { courses } from '../content/blogs';
import type { Theme } from '../hooks/useTheme';
import './palette.css';

type Command = {
  id: string;
  label: string;
  hint: string;
  group: 'Go' | 'Open' | 'Page';
  run: () => void;
};

type Props = {
  open: boolean;
  onClose: () => void;
  theme: Theme;
  onToggleTheme: () => void;
};

export default function CommandPalette({ open, onClose, theme, onToggleTheme }: Props) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  const commands = useMemo<Command[]>(() => {
    const go = (hash: string) => () => {
      navigate('/');
      // Let the home route mount before we look for the section.
      requestAnimationFrame(() =>
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      );
    };
    const open_ = (href: string) => () => window.open(href, '_blank', 'noopener,noreferrer');

    return [
      { id: 'work', label: 'Work', hint: 'Section', group: 'Go', run: go('work') },
      { id: 'projects', label: 'Projects', hint: 'Section', group: 'Go', run: go('projects') },
      { id: 'stack', label: 'Stack', hint: 'Section', group: 'Go', run: go('stack') },
      { id: 'creative', label: 'Creative', hint: 'Section', group: 'Go', run: go('creative') },
      { id: 'contact', label: 'Contact', hint: 'Section', group: 'Go', run: go('contact') },
      { id: 'github', label: 'GitHub', hint: 'armaanh1', group: 'Open', run: open_(profile.github) },
      {
        id: 'linkedin',
        label: 'LinkedIn',
        hint: 'armaan-hirani',
        group: 'Open',
        run: open_(profile.linkedin),
      },
      {
        id: 'email',
        label: 'Email me',
        hint: profile.email,
        group: 'Open',
        run: () => {
          window.location.href = `mailto:${profile.email}`;
        },
      },
      ...courses.map((c) => ({
        id: c.slug,
        label: `${c.course} blog`,
        hint: `${c.posts.length} posts`,
        group: 'Page' as const,
        run: () => navigate(`/writing/${c.slug}`),
      })),
      {
        id: 'theme',
        label: `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`,
        hint: 'Theme',
        group: 'Page',
        run: onToggleTheme,
      },
    ];
  }, [navigate, onToggleTheme, theme]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => `${c.label} ${c.hint} ${c.group}`.toLowerCase().includes(q));
  }, [commands, query]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      cancelAnimationFrame(id);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (results.length ? (i + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = results[active];
      if (cmd) {
        cmd.run();
        onClose();
      }
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="palette__scrim"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onMouseDown={onClose}
        >
          <motion.div
            className="palette glass"
            role="dialog"
            aria-modal="true"
            aria-label="Command menu"
            /* Materialise: blur and scale arrive together, so it reads as a surface. */
            initial={{ opacity: 0, scale: 0.96, y: -8, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, backdropFilter: 'blur(22px)' }}
            exit={{ opacity: 0, scale: 0.97, y: -6, backdropFilter: 'blur(0px)' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.32 }}
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={onKeyDown}
          >
            <input
              ref={inputRef}
              className="palette__input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Jump to a section, open a link, switch themes…"
              aria-label="Search commands"
              autoComplete="off"
              spellCheck={false}
            />
            <ul className="palette__list" role="listbox">
              {results.map((c, i) => (
                <li key={c.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={i === active}
                    className={`palette__item${i === active ? ' is-active' : ''}`}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => {
                      c.run();
                      onClose();
                    }}
                  >
                    <span className="palette__group mono">{c.group}</span>
                    <span className="palette__label">{c.label}</span>
                    <span className="palette__hint mono">{c.hint}</span>
                  </button>
                </li>
              ))}
              {!results.length && <li className="palette__empty">No match. Try “work” or “creative”.</li>}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
