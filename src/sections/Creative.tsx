import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { media, notes, type MediaItem } from '../content/creative';
import { courses } from '../content/blogs';
import { useReducedMotion } from '../hooks/useTheme';
import './creative.css';

type Lane = 'media' | 'writing' | 'notes';

const LANES: { id: Lane; label: string; note: string }[] = [
  { id: 'media', label: 'Media', note: 'Cool stuff. I like video more than photo.' },
  { id: 'writing', label: 'Writing', note: 'Coursework blogs, kept intact from where they started.' },
  { id: 'notes', label: 'Notes', note: 'Shorter thinking, nothing assigned.' },
];

export default function Creative() {
  const [lane, setLane] = useState<Lane>('media');
  const [openNote, setOpenNote] = useState<string | null>(null);
  const [playing, setPlaying] = useState<MediaItem | null>(null);
  /* Where each clip was left, by id. Switching lanes remounts the grid, so the
     positions have to outlive the video elements themselves. */
  const positions = useRef(new Map<string, number>());
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!playing) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setPlaying(null);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [playing]);

  const spring = reduced ? { duration: 0.15 } : ({ type: 'spring', bounce: 0, duration: 0.36 } as const);
  const active = LANES.find((l) => l.id === lane)!;

  return (
    <section id="creative" className="section" aria-labelledby="creative-title">
      <div className="shell">
        <div className="section__head">
          <h2 id="creative-title" className="section__title">
            Creative
          </h2>
          <p className="section__note">{active.note}</p>
        </div>

        <div className="cre__tabs" role="tablist" aria-label="Creative work">
          {LANES.map((l) => (
            <button
              key={l.id}
              type="button"
              role="tab"
              aria-selected={lane === l.id}
              className={`cre__tab${lane === l.id ? ' is-on' : ''}`}
              onClick={() => setLane(l.id)}
            >
              {l.label}
              {lane === l.id && (
                <motion.span className="cre__tab-rule" layoutId="cre-rule" transition={spring} />
              )}
            </button>
          ))}
        </div>

        {/* Keyed on the lane so switching remounts and replays the entry
            animation, which is plain CSS: a JS-driven tween here has twice been
            observed stalling part-way and leaving the panel semi-transparent or
            unreachable. A keyframe animation always reaches its end state. */}
        <div key={lane} className="cre__panel" role="tabpanel">
            {lane === 'media' && (
              <div className="cre__grid">
                {media.map((m) => (
                  <figure
                    key={m.id}
                    className={`cre__frame${m.src ? '' : ' cre__frame--empty'}`}
                    data-ratio={m.ratio ?? '16/9'}
                    style={{ aspectRatio: m.ratio ?? '16/9' }}
                    /* Handlers live on the frame, not the video, so the caption
                       overlay doesn't count as leaving the clip. */
                    onMouseEnter={(e) => {
                      if (reduced) return;
                      const v = e.currentTarget.querySelector('video');
                      if (!v) return;
                      /* Only one thing should ever be audible. */
                      document.querySelectorAll('video').forEach((other) => {
                        if (other !== v) other.muted = true;
                      });
                      v.muted = false;

                      // Pick up where this clip was left off.
                      const at = positions.current.get(m.id) ?? 0;
                      if (at > 0) {
                        if (v.readyState >= 1) v.currentTime = at;
                        // preload="none" means metadata may not exist yet on a
                        // fresh element — seek as soon as it does.
                        else v.addEventListener('loadedmetadata', () => { v.currentTime = at; }, { once: true });
                      }
                      /* Unmuted playback is refused until the visitor has
                         interacted with the page. Fall back to a muted preview
                         rather than showing a still that never moves. */
                      v.play().catch(() => {
                        v.muted = true;
                        void v.play().catch(() => {});
                      });
                    }}
                    onMouseLeave={(e) => {
                      if (reduced) return;
                      const v = e.currentTarget.querySelector('video');
                      if (!v) return;
                      positions.current.set(m.id, v.currentTime);
                      v.pause();
                      v.muted = true;
                    }}
                  >
                    {!m.src ? (
                      <span className="cre__placeholder">{m.kind}</span>
                    ) : m.kind === 'video' ? (
                      <button
                        type="button"
                        className="cre__open"
                        onClick={() => setPlaying(m)}
                        aria-label={`Play ${m.title}`}
                      >
                        <video
                          className="cre__media"
                          src={m.src}
                          poster={m.poster}
                          muted
                          loop
                          playsInline
                          /* Only the poster loads up front; the clip itself is
                             fetched when someone actually hovers it. */
                          preload="none"
                          tabIndex={-1}
                          aria-hidden="true"
                          /* Speed bumps, not protection — see note in README. */
                          controlsList="nodownload noplaybackrate"
                          disablePictureInPicture
                          draggable={false}
                          onContextMenu={(ev) => ev.preventDefault()}
                          /* Flag the frame off the element's own events rather
                             than off hover: a muted-fallback or a refused
                             play() should not light the ring. */
                          onPlay={(ev) =>
                            ev.currentTarget.closest('.cre__frame')?.setAttribute('data-playing', '')
                          }
                          onPause={(ev) =>
                            ev.currentTarget.closest('.cre__frame')?.removeAttribute('data-playing')
                          }
                        />
                        <span className="cre__play" aria-hidden="true">
                          ▶
                        </span>
                      </button>
                    ) : (
                      <img className="cre__media" src={m.src} alt={m.title} loading="lazy" />
                    )}
                    <figcaption className="cre__caption">
                      <span className="cre__caption-title">{m.title}</span>
                      <span className="cre__caption-ctx">{m.context}</span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            )}

            {lane === 'writing' && (
              <div className="cre__writing">
                {courses.map((c) => (
                  <Link key={c.slug} to={`/writing/${c.slug}`} className="cre__course card">
                    <span className="cre__course-code">{c.course}</span>
                    <span className="cre__course-name">{c.subtitle}</span>
                    <span className="cre__course-meta">
                      {c.posts.length} entries · {c.posts[c.posts.length - 1].date} —{' '}
                      {c.posts[0].date}
                    </span>
                    <span className="cre__course-go" aria-hidden="true">
                      →
                    </span>
                  </Link>
                ))}
              </div>
            )}

            {lane === 'notes' && (
              <ul className="cre__notes">
                {notes.map((n) => {
                  const isOpen = openNote === n.id;
                  return (
                    <li key={n.id} className="cre__note">
                      <button
                        type="button"
                        className="cre__note-head"
                        aria-expanded={isOpen}
                        onClick={() => setOpenNote(isOpen ? null : n.id)}
                      >
                        {/* The draft badge already says it — don't print it twice. */}
                        <span className="cre__note-date">{n.draft ? '' : n.date}</span>
                        <span className="cre__note-title">{n.title}</span>
                        <span className="cre__note-sum">{n.summary}</span>
                        {n.draft && <span className="cre__draft">draft</span>}
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={spring}
                            style={{ overflow: 'hidden' }}
                          >
                            <div className="cre__note-body prose">
                              {n.body.map((p, i) => (
                                <p key={i}>{p}</p>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </li>
                  );
                })}
              </ul>
            )}
        </div>
      </div>

      <AnimatePresence>
        {playing && (
          <motion.div
            className="cre__lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={playing.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setPlaying(null)}
          >
            <motion.div
              className="cre__stage"
              style={{ aspectRatio: playing.ratio ?? '16/9' }}
              initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
              transition={reduced ? { duration: 0.15 } : { type: 'spring', bounce: 0, duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <video
                className="cre__media"
                src={playing.src}
                poster={playing.poster}
                controls
                autoPlay
                playsInline
                controlsList="nodownload noplaybackrate noremoteplayback"
                disablePictureInPicture
                draggable={false}
                onContextMenu={(ev) => ev.preventDefault()}
              />
            </motion.div>
            <button type="button" className="cre__close" aria-label="Close">
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
