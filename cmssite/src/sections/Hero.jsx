import { AnchorButton } from '../components/Button'
import './Hero.css'

export function Hero({ hero }) {
  return (
    <section className="hero" aria-label={hero.title}>
      <div
        className="hero__bg"
        style={{ backgroundImage: `url(${hero.backgroundImage})` }}
        role="img"
        aria-label={hero.backgroundImageAlt || hero.title}
      />
      <div className="hero__scrim" aria-hidden />
      <div className="hero__content">
        <h1 className="hero__title">{hero.title}</h1>
        <p className="hero__subtitle">{hero.subtitle}</p>
        <div className="hero__ctas">
          <AnchorButton variant="primary" href={hero.ctaPrimary.href}>
            {hero.ctaPrimary.label}
          </AnchorButton>
          <AnchorButton variant="outline" className="hero__cta-secondary" href={hero.ctaSecondary.href}>
            {hero.ctaSecondary.label}
          </AnchorButton>
        </div>
      </div>
    </section>
  )
}
