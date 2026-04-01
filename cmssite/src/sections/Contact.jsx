import { Section } from '../components/Section'
import './Contact.css'

export function Contact({ contact }) {
  const { contactInfo, openingHours, address } = contact
  return (
    <Section id="contact" eyebrow={contact.sectionEyebrow} title={contact.heading} intro={contact.intro}>
      <div className="contact__grid">
        <div className="contact__block">
          <h3 className="contact__h">{contactInfo.phoneLabel}</h3>
          <a className="contact__link" href={contactInfo.phoneHref}>
            {contactInfo.phone}
          </a>
          <h3 className="contact__h">{contactInfo.emailLabel}</h3>
          <a className="contact__link" href={contactInfo.emailHref}>
            {contactInfo.email}
          </a>
        </div>
        <div className="contact__block">
          <h3 className="contact__h">{openingHours.heading}</h3>
          <ul className="contact__hours">
            {openingHours.lines.map((line, i) => (
              <li key={i}>
                <span>{line.days}</span>
                <span>{line.hours}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="contact__block">
          <h3 className="contact__h">{address.label}</h3>
          {address.lines.map((line, i) => (
            <p key={i} className="contact__line">
              {line}
            </p>
          ))}
        </div>
      </div>
      <div className="contact__map" role="region" aria-label={contact.mapEmbedAriaLabel}>
        <div className="contact__map-placeholder" />
      </div>
    </Section>
  )
}
