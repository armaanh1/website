import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="section" style={{ borderTop: 0 }}>
      <div className="shell">
        <p className="eyebrow">404</p>
        <h1 className="display" style={{ fontSize: 'clamp(2.4rem, 8vw, 5rem)', margin: '0.5rem 0 1rem' }}>
          Nothing here
        </h1>
        <p className="prose" style={{ marginBottom: '1.5rem' }}>
          That address doesn't map to a page. The work, the projects, and the writing all live on
          the home page.
        </p>
        <Link className="link-out" to="/">
          Back to the start
        </Link>
      </div>
    </section>
  );
}
