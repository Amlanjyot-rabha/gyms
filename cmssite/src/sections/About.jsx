import { Section } from '../components/Section'
import './About.css'

export function About({ about }) {
  return (
    <Section id="about" eyebrow={about?.sectionEyebrow} title={about?.heading} tone="muted">
      <div className="about__grid">
        {/* Copy side */}
        <div className="about__copy">
          {(about?.body ?? []).map((paragraph, i) => (
            <p key={i} className="about__p">{paragraph}</p>
          ))}

          {/* Stats */}
          {(about?.stats ?? []).length > 0 && (
            <ul className="about__stats" aria-label="Key statistics">
              {about.stats.map((s) => (
                <li key={s.label} className="about__stat">
                  <span className="about__stat-value">{s.value}</span>
                  <span className="about__stat-label">{s.label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Image side */}
        {about?.imageSrc && (
          <figure className="about__figure">
            <img
              className="about__img"
              src={about.imageSrc}
              alt={about.imageAlt ?? ''}
              loading="lazy"
            />
            <div className="about__img-accent" aria-hidden />
          </figure>
        )}
      </div>
    </Section>
  )
}
