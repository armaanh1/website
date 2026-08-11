import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useLocation, useParams } from 'react-router-dom';
import { courseBySlug, courses } from '../content/blogs';
import { useReducedMotion } from '../hooks/useTheme';
import NotFound from './NotFound';
import './writing.css';

export default function Writing() {
  const { slug } = useParams();
  const { hash } = useLocation();
  const course = courseBySlug(slug);
  const reduced = useReducedMotion();
  const [open, setOpen] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  /* A shared #post-id link opens that post and scrolls to it. */
  useEffect(() => {
    if (!hash || !course) return;
    const id = hash.slice(1);
    if (!course.posts.some((p) => p.id === id)) return;
    setOpen(id);
    requestAnimationFrame(() =>
      document.getElementById(id)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }),
    );
  }, [hash, course, reduced]);

  useEffect(() => {
    if (course) document.title = `${course.course} — Armaan Hirani`;
    return () => {
      document.title = 'Armaan Hirani — Software Engineer';
    };
  }, [course]);

  if (!course) return <NotFound />;

  const copyLink = async (id: string) => {
    const url = `${window.location.origin}/writing/${course.slug}#${id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(id);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      /* clipboard blocked — the address bar still has the link once it's open */
    }
  };

  const other = courses.filter((c) => c.slug !== course.slug);

  return (
    <article className="writing">
      <header className="shell writing__head">
        <Link to="/#creative" className="writing__back">
          ← Creative
        </Link>
        <p className="eyebrow">{course.subtitle}</p>
        <h1 className="display writing__title">{course.course}</h1>
        <p className="writing__count">
          {course.posts.length} entries · {course.posts[course.posts.length - 1].date} —{' '}
          {course.posts[0].date}
        </p>
      </header>

      <div className="shell">
        <ol className="writing__posts">
          {course.posts.map((post) => {
            const isOpen = open === post.id;
            return (
              <li key={post.id} id={post.id} className="writing__post">
                <div className="writing__post-head">
                  <button
                    type="button"
                    className="writing__post-toggle"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : post.id)}
                  >
                    <span className="writing__date">{post.date}</span>
                    <span className="writing__post-title">{post.title}</span>
                    <span className={`writing__chevron${isOpen ? ' is-open' : ''}`} aria-hidden="true">
                      ↓
                    </span>
                  </button>
                  <button
                    type="button"
                    className="writing__copy"
                    onClick={() => copyLink(post.id)}
                    aria-label={`Copy link to ${post.title}`}
                  >
                    {copied === post.id ? 'copied' : 'link'}
                  </button>
                </div>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={
                        reduced ? { duration: 0.12 } : { type: 'spring', bounce: 0, duration: 0.4 }
                      }
                      style={{ overflow: 'hidden' }}
                    >
                      {/* Original markup, rendered as authored. */}
                      <div
                        className="writing__body prose"
                        dangerouslySetInnerHTML={{ __html: post.body }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ol>

        <nav className="writing__other" aria-label="Other blogs">
          {other.map((c) => (
            <Link key={c.slug} to={`/writing/${c.slug}`} className="link-out">
              {c.course} — {c.subtitle}
            </Link>
          ))}
        </nav>
      </div>
    </article>
  );
}
