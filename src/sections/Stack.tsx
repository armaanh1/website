import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { coursework, profile, skills } from '../content/profile';
import { useReducedMotion } from '../hooks/useTheme';
import './stack.css';

const ALL = 'Everything';

export default function Stack() {
  const [filter, setFilter] = useState(ALL);
  const reduced = useReducedMotion();

  const visible = useMemo(
    () =>
      skills
        .filter((g) => filter === ALL || g.group === filter)
        .flatMap((g) => g.items.map((item) => ({ item, group: g.group }))),
    [filter],
  );

  const spring = reduced
    ? { duration: 0 }
    : ({ type: 'spring', bounce: 0, duration: 0.35 } as const);

  return (
    <section id="stack" className="section" aria-labelledby="stack-title">
      <div className="shell">
        <div className="section__head">
          <h2 id="stack-title" className="section__title">
            Stack
          </h2>
          <p className="section__note">
            Things I've actually shipped with, not things I've read about.
          </p>
        </div>

        <div className="stack__filters" role="group" aria-label="Filter skills">
          {[ALL, ...skills.map((s) => s.group)].map((g) => (
            <button
              key={g}
              type="button"
              className={`stack__filter${filter === g ? ' is-on' : ''}`}
              aria-pressed={filter === g}
              onClick={() => setFilter(g)}
            >
              {filter === g && (
                <motion.span className="stack__filter-bg" layoutId="stack-filter" transition={spring} />
              )}
              <span className="stack__filter-label">{g}</span>
            </button>
          ))}
        </div>

        <motion.ul className="stack__grid" layout transition={spring}>
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map(({ item, group }) => (
              <motion.li
                key={item}
                layout
                className="stack__pill"
                data-group={group}
                initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
                transition={spring}
              >
                {item}
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>

        <div className="stack__edu card">
          <div>
            <p className="eyebrow">Education</p>
            <h3 className="stack__school">{profile.education.school}</h3>
            <p className="stack__degree">
              {profile.education.degree} · {profile.education.span}
            </p>
            <p className="stack__note">{profile.education.note}</p>
          </div>
          <div>
            <p className="eyebrow">Coursework</p>
            <ul className="stack__courses">
              {coursework.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
