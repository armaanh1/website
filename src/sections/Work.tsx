import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { roles } from '../content/profile';
import { useReducedMotion } from '../hooks/useTheme';
import './work.css';

const NAV_HEIGHT = 64; // the sticky frame parks below the nav
const SLACK = 32; // don't hold a frame that only just fits

export default function Work() {
  const [selected, setSelected] = useState(0);
  const reduced = useReducedMotion();

  const trackRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [fits, setFits] = useState(false);

  /* The question isn't how wide the screen is, it's whether the frame fits in
     the viewport — a tall portrait window has plenty of room even when it's
     narrow. Measure the frame and let that decide. */
  useLayoutEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const measure = () => {
      const height = el.offsetHeight;
      setFits(height > 0 && height <= window.innerHeight - NAV_HEIGHT - SLACK);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  /* Anywhere the frame can't be held — short viewports, reduced motion — the
     same markup stays a plain tab list that works on click. */
  const scrollDriven = fits && !reduced;
  /* Read the track's geometry on each scroll frame rather than caching a
     measurement: the track only gets its height once `fits` flips, and anything
     measured before that would sit at zero until something forced a re-measure. */
  useEffect(() => {
    if (!scrollDriven) return;
    const el = trackRef.current;
    if (!el) return;

    let frame = 0;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const distance = rect.height - window.innerHeight;
      if (distance <= 0) return;
      const progress = Math.min(1, Math.max(0, -rect.top / distance));
      const next = Math.min(roles.length - 1, Math.floor(progress * roles.length));
      setSelected((prev) => (prev === next ? prev : next));
    };
    /* Cancel and reschedule rather than guarding on a flag, which would stick
       if a frame were ever dropped and freeze the section on one role. */
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [scrollDriven]);

  /* Clicking a role scrolls to the middle of its segment, so selection and
     scroll position never disagree. */
  const goTo = useCallback(
    (i: number) => {
      if (!scrollDriven) {
        setSelected(i);
        return;
      }
      const el = trackRef.current;
      if (!el) return;
      const distance = el.offsetHeight - window.innerHeight;
      const top = el.offsetTop + distance * ((i + 0.5) / roles.length);
      window.scrollTo({ top, behavior: 'smooth' });
    },
    [scrollDriven],
  );

  const body = (
    <div className="shell work__frame" ref={frameRef}>
      <div className="section__head">
        <h2 id="work-title" className="section__title">
          Work
        </h2>
        <p className="section__note">
          Work experience, in order of how much infrastructure they let me touch. It's actually chronological, but you get the point.
        </p>
      </div>

      <div className="work">
        <ol className="work__list" role="tablist" aria-label="Roles">
          {roles.map((r, i) => (
            <li key={r.company}>
              <button
                type="button"
                role="tab"
                id={`work-tab-${i}`}
                aria-selected={i === selected}
                aria-controls="work-panel"
                tabIndex={i === selected ? 0 : -1}
                className={`work__item${i === selected ? ' is-selected' : ''}`}
                onClick={() => goTo(i)}
                onKeyDown={(e) => {
                  const delta = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
                  if (!delta) return;
                  e.preventDefault();
                  const next = (i + delta + roles.length) % roles.length;
                  goTo(next);
                  document.getElementById(`work-tab-${next}`)?.focus();
                }}
              >
                {i === selected && (
                  <motion.span
                    className="work__marker"
                    layoutId="work-marker"
                    transition={reduced ? { duration: 0 } : { type: 'spring', bounce: 0, duration: 0.34 }}
                  />
                )}
                <span className="work__company">{r.company}</span>
                <span className="work__span">{r.span}</span>
              </button>
            </li>
          ))}
        </ol>

        <div
          className="work__panel card"
          id="work-panel"
          role="tabpanel"
          aria-labelledby={`work-tab-${selected}`}
        >
          {/* Every role is laid out in the same grid cell, so the card is always
              as tall as the longest one and never resizes between them. Only
              opacity changes, which also means the crossfade overlaps instead of
              blanking the card in between. */}
          <div className="work__stack">
            {roles.map((r, i) => (
              <motion.div
                key={r.company}
                className="work__slide"
                aria-hidden={i !== selected}
                initial={false}
                animate={
                  reduced
                    ? { opacity: i === selected ? 1 : 0 }
                    : { opacity: i === selected ? 1 : 0, y: i === selected ? 0 : 6 }
                }
                transition={
                  reduced ? { duration: 0.15 } : { type: 'spring', bounce: 0, duration: 0.32 }
                }
              >
                <p className="eyebrow">{r.team}</p>
                <h3 className="work__title">{r.title}</h3>
                <p className="work__meta">
                  {r.place} · {r.span}
                </p>
                <ul className="work__bullets">
                  {r.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
                <div className="chips">
                  {r.tags.map((t) => (
                    <span className="chip" key={t}>
                      {t}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  /* The track stays in the tree whether or not it is driving, so useScroll has
     a target from the first render. Toggling it on later would leave useScroll
     bound to nothing and the section would never advance. */
  return (
    <section
      id="work"
      className={scrollDriven ? undefined : 'section'}
      aria-labelledby="work-title"
    >
      <div
        ref={trackRef}
        className={scrollDriven ? 'work__track' : undefined}
        style={scrollDriven ? { height: `calc(${roles.length} * 85vh + 15vh)` } : undefined}
      >
        <div className={scrollDriven ? 'work__sticky' : undefined}>{body}</div>
      </div>
    </section>
  );
}
