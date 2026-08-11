import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { projects } from '../content/profile';
import { useReducedMotion } from '../hooks/useTheme';
import './projects.css';

export default function Projects() {
  const [open, setOpen] = useState<string | null>(projects[0].name);
  const reduced = useReducedMotion();

  return (
    <section id="projects" className="section" aria-labelledby="projects-title">
      <div className="shell">
        <div className="section__head">
          <h2 id="projects-title" className="section__title">
            Projects
          </h2>
          <p className="section__note">
            Two things I built to answer a question nobody assigned me.
          </p>
        </div>

        <div className="proj">
          {projects.map((p) => {
            const isOpen = open === p.name;
            return (
              <article key={p.name} className={`proj__card card${isOpen ? ' is-open' : ''}`}>
                <button
                  type="button"
                  className="proj__toggle"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : p.name)}
                >
                  <div className="proj__heading">
                    <h3 className="proj__name">{p.name}</h3>
                    <p className="proj__span">{p.span}</p>
                    <p className="proj__blurb">{p.blurb}</p>
                  </div>
                  <span className={`proj__chevron${isOpen ? ' is-open' : ''}`} aria-hidden="true">
                    ↓
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      className="proj__detail"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={
                        reduced
                          ? { duration: 0.12 }
                          : { type: 'spring', bounce: 0, duration: 0.38 }
                      }
                      style={{ overflow: 'hidden' }}
                    >
                      <div className="proj__detail-inner">
                        <ul className="proj__bullets">
                          {p.bullets.map((b) => (
                            <li key={b}>{b}</li>
                          ))}
                        </ul>
                        <div className="chips">
                          {p.stack.map((s) => (
                            <span className="chip" key={s}>
                              {s}
                            </span>
                          ))}
                        </div>
                        <div className="proj__links">
                          {p.links.map((l) => (
                            <a
                              key={l.label}
                              className="link-out"
                              href={l.href}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {l.label}
                            </a>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
