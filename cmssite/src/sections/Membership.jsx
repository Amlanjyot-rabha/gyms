import { Section } from '../components/Section'
import { AnchorButton } from '../components/Button'
import './Membership.css'

export function Membership({ membershipPlans }) {
  return (
    <Section
      id="membership"
      eyebrow={membershipPlans.sectionEyebrow}
      title={membershipPlans.heading}
      intro={membershipPlans.periodNote}
      tone="muted"
    >
      <div className="plans">
        {membershipPlans.plans.map((plan) => (
          <article key={plan.id} className={`plan ${plan.highlighted ? 'plan--featured' : ''}`}>
            {plan.highlighted ? (
              <span className="plan__badge">{membershipPlans.featuredBadge}</span>
            ) : null}
            <h3 className="plan__name">{plan.name}</h3>
            <p className="plan__price">
              <span className="plan__amount">{plan.price}</span>
              <span className="plan__period">{plan.period}</span>
            </p>
            <p className="plan__desc">{plan.description}</p>
            <ul className="plan__features">
              {plan.features.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
            <AnchorButton
              variant={plan.highlighted ? 'primary' : 'secondary'}
              block
              className="plan__cta"
              href={plan.cta.href}
            >
              {plan.cta.label}
            </AnchorButton>
          </article>
        ))}
      </div>
    </Section>
  )
}
