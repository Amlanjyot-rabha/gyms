import { Section } from '../components/Section'
import { Card } from '../components/Card'
import './Testimonials.css'

export function Testimonials({ testimonials }) {
  return (
    <Section
      id="testimonials"
      eyebrow={testimonials.sectionEyebrow}
      title={testimonials.heading}
      tone="contrast"
    >
      <div className="testimonials__grid">
        {testimonials.items.map((item) => (
          <Card key={item.id} className="quote-card">
            <figure className="quote-card__figure">
              <p className="quote-card__stars" aria-label={item.ratingLabel}>
                <span aria-hidden>{item.ratingDisplay}</span>
              </p>
              <blockquote className="quote-card__quote">{item.quote}</blockquote>
              <figcaption className="quote-card__cite">
                <cite className="quote-card__name">{item.name}</cite>
                <span className="quote-card__role">{item.role}</span>
              </figcaption>
            </figure>
          </Card>
        ))}
      </div>
    </Section>
  )
}
