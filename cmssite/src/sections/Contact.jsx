import { Section } from '../components/Section'
import './Contact.css'

export function Contact({ contact }) {
  const { contactInfo, openingHours, address } = contact ?? {}

  return (
    <Section
      id="contact"
      eyebrow={contact?.sectionEyebrow}
      title={contact?.heading}
      intro={contact?.intro}
      tone="default"
    >
      <div className="contact__grid">
        {/* Phone & Email */}
        {contactInfo && (
          <div className="contact__block">
            <div className="contact__block-icon" aria-hidden>📞</div>
            <h3 className="contact__h">{contactInfo.phoneLabel ?? 'Phone'}</h3>
            <a className="contact__link" href={contactInfo.phoneHref}>
              {contactInfo.phone}
            </a>

            <div className="contact__block-icon contact__block-icon--mt" aria-hidden>✉</div>
            <h3 className="contact__h">{contactInfo.emailLabel ?? 'Email'}</h3>
            <a className="contact__link" href={contactInfo.emailHref}>
              {contactInfo.email}
            </a>
          </div>
        )}

        {/* Opening Hours */}
        {openingHours && (
          <div className="contact__block">
            <div className="contact__block-icon" aria-hidden>🕐</div>
            <h3 className="contact__h">{openingHours.heading ?? 'Hours'}</h3>
            <ul className="contact__hours">
              {(openingHours.lines ?? []).map((line, i) => (
                <li key={i}>
                  <span>{line.days}</span>
                  <span>{line.hours}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Address */}
        {address && (
          <div className="contact__block">
            <div className="contact__block-icon" aria-hidden>📍</div>
            <h3 className="contact__h">{address.label ?? 'Location'}</h3>
            {(address.lines ?? []).map((line, i) => (
              <p key={i} className="contact__line">{line}</p>
            ))}
          </div>
        )}
      </div>
    </Section>
  )
}
