import { Section } from '../components/Section'
import './Testimonials.css'

export function Testimonials({ testimonials }) {
  const items = testimonials?.items ?? []

  return (
    <Section
      id="testimonials"
      eyebrow={testimonials?.sectionEyebrow}
      title={testimonials?.heading}
      tone="muted"
    >
      <div className="testimonials__grid">
        {items.map((item) => (
          <article key={item.id} className="quote-card">
            <span className="quote-card__mark" aria-hidden>"</span>

            <div className="quote-card__stars" aria-label={item.ratingLabel ?? '5 stars'}>
              <span aria-hidden>{item.ratingDisplay ?? '★★★★★'}</span>
            </div>

            <blockquote className="quote-card__quote">
              {item.quote}
            </blockquote>

            <footer className="quote-card__footer">
              <div className="quote-card__avatar" aria-hidden>
                {(item.name ?? 'M').charAt(0)}
              </div>
              <div>
                <cite className="quote-card__name">{item.name}</cite>
                {item.role && <span className="quote-card__role">{item.role}</span>}
              </div>
            </footer>
          </article>
        ))}
      </div>
    </Section>
  )
}
