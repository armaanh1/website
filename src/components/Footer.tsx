import { profile } from '../content/profile';
import './footer.css';

export default function Footer() {
  return (
    <footer className="foot">
      <div className="shell foot__inner">
        <p className="foot__meta">
          © {new Date().getFullYear()} {profile.name} · {profile.location}
        </p>
        <nav className="foot__links" aria-label="Elsewhere">
          <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
          <a href={profile.github} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <a href={`mailto:${profile.email}`}>Email</a>
        </nav>
      </div>
    </footer>
  );
}
