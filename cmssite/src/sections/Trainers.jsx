import { Section } from '../components/Section'
import { Card } from '../components/Card'
import './Trainers.css'

export function Trainers({ trainers }) {
  return (
    <Section id="trainers" eyebrow={trainers.sectionEyebrow} title={trainers.heading} tone="default">
      <div className="trainers__grid">
        {trainers.items.map((t) => (
          <Card key={t.id} elevated className="trainer-card">
            <div className="trainer-card__media">
              <img src={t.imageSrc} alt={t.imageAlt} loading="lazy" />
            </div>
            <div className="trainer-card__body">
              <h3 className="trainer-card__name">{t.name}</h3>
              <p className="trainer-card__spec">{t.specialization}</p>
              <p className="trainer-card__exp">
                <span className="trainer-card__exp-key">{trainers.fieldLabels.experience}</span>
                {t.experience}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  )
}
