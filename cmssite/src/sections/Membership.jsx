import { Section } from '../components/Section'
import { Button }  from '../components/Button'
import './Membership.css'

export function Membership({ membershipPlans, onPlanSelect }) {
  const plans = membershipPlans?.plans ?? []

  return (
    <Section
      id="membership"
      eyebrow={membershipPlans?.sectionEyebrow}
      title={membershipPlans?.heading}
      intro={membershipPlans?.periodNote}
      tone="default"
    >
      <div className="plans">
        {plans.map((plan) => (
          <article
            key={plan.id}
            className={`plan ${plan.highlighted ? 'plan--featured' : ''}`}
          >
            {plan.highlighted && (
              <div className="plan__badge-wrap">
                <span className="plan__badge">
                  {membershipPlans?.featuredBadge ?? 'Best Value'}
                </span>
              </div>
            )}

            <div className="plan__header">
              <h3 className="plan__name">{plan.name}</h3>
              <p className="plan__price">
                <span className="plan__amount">{plan.price}</span>
                <span className="plan__period">{plan.period}</span>
              </p>
            </div>

            <p className="plan__desc">
              {plan.description || 'Standard membership with access to basic gym amenities.'}
            </p>

            <ul className="plan__features">
              {((plan.features ?? []).length > 0 ? plan.features : [
                'Full gym access',
                'Locker room privileges',
                'App booking'
              ]).map((f, i) => (
                <li key={i} className="plan__feature">
                  <span className="plan__check" aria-hidden>✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <Button
              variant={plan.highlighted ? 'primary' : 'secondary'}
              block
              className="plan__cta"
              onClick={(e) => onPlanSelect?.(plan, e)}
            >
              {plan.cta?.label ?? 'Get Started'}
            </Button>
          </article>
        ))}
      </div>
    </Section>
  )
}
