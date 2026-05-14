import './Hero.css'

export function Hero({ hero, onJoin }) {
  return (
    <section className="hero" aria-label={hero?.title ?? 'Hero'}>
      {/* Background */}
      <div
        className="hero__bg"
        style={{ backgroundImage: hero?.backgroundImage ? `url(${hero.backgroundImage})` : undefined }}
        role="img"
        aria-label={hero?.backgroundImageAlt || hero?.title || 'Gym hero image'}
      />
      <div className="hero__overlay-gradient" aria-hidden />
      <div className="hero__overlay-vignette"  aria-hidden />

      {/* Content */}
      <div className="hero__content">
        <div className="hero__inner">
          <p className="hero__eyebrow" aria-hidden>Elite Fitness</p>

          <h1 className="hero__title">
            {hero?.title ?? 'Train Hard. Live Strong.'}
          </h1>

          <p className="hero__subtitle">
            {hero?.subtitle ?? 'Premium coaching. Precision equipment. Real results.'}
          </p>

          <div className="hero__ctas">
            <button
              className="hero__btn hero__btn--primary"
              onClick={onJoin}
              aria-label={hero?.ctaPrimary?.label ?? 'Join now'}
            >
              {hero?.ctaPrimary?.label ?? 'Join Now'}
            </button>
            {hero?.ctaSecondary && (
              <a className="hero__btn hero__btn--outline" href={hero.ctaSecondary.href}>
                {hero.ctaSecondary.label}
              </a>
            )}
          </div>

          {/* Stats */}
          <div className="hero__stats" aria-hidden>
            <div className="hero__stat">
              <span className="hero__stat-value">500+</span>
              <span className="hero__stat-label">Members</span>
            </div>
            <div className="hero__stat-divider" />
            <div className="hero__stat">
              <span className="hero__stat-value">12+</span>
              <span className="hero__stat-label">Expert Coaches</span>
            </div>
            <div className="hero__stat-divider" />
            <div className="hero__stat">
              <span className="hero__stat-value">24/7</span>
              <span className="hero__stat-label">Access</span>
            </div>
          </div>
        </div>
      </div>

      <div className="hero__bottom-fade" aria-hidden />
    </section>
  )
}
