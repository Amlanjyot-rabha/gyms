import { Section } from '../components/Section'
import './Contact.css'

export function Contact({ contact }) {
  const { contactInfo, openingHours, address } = contact ?? {}
  const addressLines = address?.lines ?? (address?.addressText ? [address.addressText] : [])
  const addressLabel = address?.label ?? 'Address'
  const addressLink = address?.googleMapLink

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
            <h3 className="contact__h">{addressLabel}</h3>
            {addressLink ? (
              <a
                className="contact__address-link"
                href={addressLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="contact__address-icon" aria-hidden="true">📍</span>
                <span className="contact__address-copy">
                  {addressLines.map((line, i) => (
                    <span key={i} className="contact__line">{line}</span>
                  ))}
                </span>
              </a>
            ) : (
              addressLines.map((line, i) => (
                <p key={i} className="contact__line">{line}</p>
              ))
            )}
          </div>
        )}
      </div>
    </Section>
  )
}
