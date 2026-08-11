import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { parseHex, toHex } from '../lib/color';
import { useReducedMotion } from '../hooks/useTheme';
import './accent.css';

/* Burnt orange is the default; the rest are here to show the page can take a
   different temperature without falling apart. */
const PRESETS = [
  { hex: '#b85c33', name: 'Burnt orange' },
  { hex: '#9a6f3f', name: 'Ochre' },
  { hex: '#6e7f63', name: 'Sage' },
  { hex: '#4f6d84', name: 'Slate blue' },
  { hex: '#7a5a86', name: 'Plum' },
  { hex: '#a8443f', name: 'Brick' },
];

type Props = { accent: string | null; onChange: (hex: string | null) => void };

export default function AccentPicker({ accent, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(accent ?? PRESETS[0].hex);
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const hexId = useId();
  const wheelId = useId();

  const current = accent ?? PRESETS[0].hex;

  useEffect(() => setDraft(current), [current]);

  /* Close on Escape or a click outside the popover. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setOpen(false);
      }
    };
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onDown);
    };
  }, [open]);

  const commit = (value: string) => {
    const rgb = parseHex(value);
    if (rgb) onChange(toHex(rgb));
  };

  const valid = parseHex(draft) !== null;

  return (
    <div className="accent" ref={wrapRef}>
      <button
        type="button"
        className="accent__trigger"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Change accent colour"
        title="Change accent colour"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="accent__swatch" aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="accent__panel glass"
            role="dialog"
            aria-label="Accent colour"
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -6 }}
            transition={reduced ? { duration: 0.12 } : { type: 'spring', bounce: 0, duration: 0.28 }}
          >
            <div className="accent__row">
              <label className="accent__wheel" htmlFor={wheelId}>
                <input
                  id={wheelId}
                  type="color"
                  value={valid ? toHex(parseHex(draft)!) : current}
                  onChange={(e) => {
                    setDraft(e.target.value);
                    commit(e.target.value); // live preview while dragging the wheel
                  }}
                />
                <span className="visually-hidden">Colour wheel</span>
              </label>

              <div className="accent__field">
                <label className="accent__label" htmlFor={hexId}>
                  Hex
                </label>
                <input
                  id={hexId}
                  className={`accent__hex${draft && !valid ? ' is-invalid' : ''}`}
                  value={draft}
                  spellCheck={false}
                  autoComplete="off"
                  inputMode="text"
                  maxLength={7}
                  aria-invalid={!valid}
                  onChange={(e) => {
                    const next = e.target.value;
                    setDraft(next);
                    if (parseHex(next)) commit(next);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commit(draft);
                  }}
                />
              </div>
            </div>

            {draft && !valid && (
              <p className="accent__hint" role="status">
                Needs 3 or 6 hex digits, like #b85c33.
              </p>
            )}

            <div className="accent__presets">
              {PRESETS.map((p) => (
                <button
                  key={p.hex}
                  type="button"
                  className={`accent__preset${current.toLowerCase() === p.hex ? ' is-on' : ''}`}
                  style={{ '--preset': p.hex } as React.CSSProperties}
                  title={p.name}
                  aria-label={p.name}
                  onClick={() => {
                    setDraft(p.hex);
                    onChange(p.hex === PRESETS[0].hex ? null : p.hex);
                  }}
                />
              ))}
            </div>

            <button type="button" className="accent__reset" onClick={() => onChange(null)}>
              Reset to burnt orange
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
