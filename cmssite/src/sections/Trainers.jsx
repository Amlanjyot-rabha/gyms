import { Section } from '../components/Section'
import './Trainers.css'

export function Trainers({ trainers }) {
  const items = trainers?.items ?? []

  return (
    <Section id="trainers" eyebrow={trainers?.sectionEyebrow} title={trainers?.heading} tone="muted">
      <div className="trainers__grid">
        {items.map((t) => (
          <article key={t.id} className="trainer-card">
            <div className="trainer-card__media">
              {t.imageSrc ? (
                <img src={t.imageSrc} alt={t.imageAlt ?? t.name} loading="lazy" />
              ) : (
                <div className="trainer-card__placeholder" aria-hidden>
                  <span>{(t.name ?? 'T').charAt(0)}</span>
                </div>
              )}
              <div className="trainer-card__overlay" aria-hidden>
                <p className="trainer-card__spec-overlay">{t.specialization}</p>
              </div>
            </div>
            <div className="trainer-card__body">
              <h3 className="trainer-card__name">{t.name}</h3>
              <p className="trainer-card__spec">{t.specialization}</p>
              {t.experience && (
                <p className="trainer-card__exp">
                  <span className="trainer-card__exp-key">
                    {trainers?.fieldLabels?.experience ?? 'Experience'}:&nbsp;
                  </span>
                  {t.experience}
                </p>
              )}
            </div>
          </article>
        ))}
      </div>
    </Section>
  )
}
