import { useState, useEffect, useCallback } from 'react'
import './BannerSlider.css'

const INTERVAL = 4500

export function BannerSlider({ banners }) {
  const slides = banners ?? []
  const [current, setCurrent] = useState(0)

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length)
  }, [slides.length])

  useEffect(() => {
    if (slides.length <= 1) return
    const id = setInterval(next, INTERVAL)
    return () => clearInterval(id)
  }, [next, slides.length])

  if (!slides.length) return null

  return (
    <section className="banner-slider" aria-label="Promotions and announcements" aria-roledescription="carousel">
      <div className="banner-slider__track">
        {slides.map((slide, i) => (
          <div
            key={slide.id ?? i}
            className={`banner-slider__slide ${i === current ? 'is-active' : ''}`}
            aria-hidden={i !== current}
            role="group"
            aria-roledescription="slide"
            aria-label={`Slide ${i + 1} of ${slides.length}`}
          >
            {/* Background image */}
            {slide.imageSrc && (
              <div
                className="banner-slider__bg"
                style={{ backgroundImage: `url(${slide.imageSrc})` }}
              />
            )}
            <div className="banner-slider__overlay" />

            {/* Content */}
            <div className="banner-slider__content">
              {slide.title && (
                <h2 className="banner-slider__title">{slide.title}</h2>
              )}
              {slide.subtitle && (
                <p className="banner-slider__subtitle">{slide.subtitle}</p>
              )}
              {slide.buttonText && slide.buttonLink && (
                <a className="banner-slider__cta" href={slide.buttonLink}>
                  {slide.buttonText}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Dot navigation */}
      {slides.length > 1 && (
        <div className="banner-slider__dots" role="tablist" aria-label="Slide navigation">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === current}
              aria-label={`Go to slide ${i + 1}`}
              className={`banner-slider__dot ${i === current ? 'is-active' : ''}`}
              onClick={() => setCurrent(i)}
            />
          ))}
        </div>
      )}

      {/* Progress bar */}
      {slides.length > 1 && (
        <div className="banner-slider__progress" key={current} aria-hidden />
      )}
    </section>
  )
}
