import { useState } from 'react';
import { profile } from '../content/profile';
import './contact.css';

export default function Contact() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  return (
    <section id="contact" className="section contact" aria-labelledby="contact-title">
      <div className="shell">
        <p className="eyebrow">Contact</p>
        <h2 id="contact-title" className="display contact__title">
          Let's build
          <br />
          something
        </h2>

        <div className="contact__row">
          <button type="button" className="contact__email" onClick={copy}>
            {profile.email}
            <span className={`contact__copied${copied ? ' is-on' : ''}`}>
              {copied ? 'copied' : 'copy'}
            </span>
          </button>

          <div className="contact__links">
            <a className="link-out" href={profile.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
            <a className="link-out" href={profile.github} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
