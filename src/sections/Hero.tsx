import Pipeline from '../components/Pipeline';
import './hero.css';

export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="shell hero__inner">
        <div className="hero__lede">
          <p className="eyebrow">
            Hey! Welcome, and nice to meet you. I'm
          </p>
          <h1 id="hero-title" className="display hero__title">
            Armaan
            <br />
            Hirani
          </h1>
          <p className="hero__blurb">
            An undergrad at Texas, and software engineer who likes working on Cloud, ML, and scalable infrastructure.
          </p>
          <p className="hero__blurb hero__blurb--sub">
            Off the clock I make videos, write, boulder, lift, and volunteer. I like working on things with impact, whether that's through code, content, or community.
          </p>
        </div>

        <div className="hero__pipe">
          <Pipeline />
        </div>
      </div>
    </section>
  );
}
