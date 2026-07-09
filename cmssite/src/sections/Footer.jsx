import './Footer.css'

function interpolateCopyright(template, vars) {
  if (!template) return ''
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    key in vars ? String(vars[key]) : `{${key}}`
  )
}

function renderSocialIcon(id) {
  switch (id) {
    case 'instagram':
      return (
        <span className="footer__social-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5H7zm0 2h10c1.65 0 3 1.35 3 3v10c0 1.65-1.35 3-3 3H7c-1.65 0-3-1.35-3-3V7c0-1.65 1.35-3 3-3zm5 2.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zm0 1.5a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm4.75-.75a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5z" />
          </svg>
        </span>
      )
    case 'youtube':
      return (
        <span className="footer__social-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.75 4.5H4.25A2.25 2.25 0 0 0 2 6.75v10.5A2.25 2.25 0 0 0 4.25 19.5h15.5A2.25 2.25 0 0 0 22 17.25V6.75A2.25 2.25 0 0 0 19.75 4.5Zm-1.75 6.4-6.5 3.75a.75.75 0 0 1-1.12-.66V8.99a.75.75 0 0 1 1.12-.66l6.5 3.75a.75.75 0 0 1 0 1.32Z" />
          </svg>
        </span>
      )
    case 'linkedin':
      return (
        <span className="footer__social-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.98 3.5C4.98 4.6 4.12 5.5 3 5.5S1 4.6 1 3.5 1.86 1.5 3 1.5s1.98.9 1.98 2zm.02 4.5H1v15h4V8zm7.5 0h-3.99v15h4v-8.25c0-2.1 2.75-2.27 2.75 0v8.25h4V14.5c0-4.95-5.5-4.77-6.76-2.33V8z" />
          </svg>
        </span>
      )
    default:
      return (
        <span className="footer__social-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="3" />
          </svg>
        </span>
      )
  }
}

export function Footer({ branding, footer, navigation }) {
  const year = new Date().getFullYear()
  const copyrightText = interpolateCopyright(footer?.copyright ?? '© {year} {gymName}', {
    year,
    gymName: branding?.gymName ?? 'Gym',
  })

  const logo = branding?.logo ?? {}

  return (
    <footer className="footer">
      <div className="footer__inner">
        {/* Brand column */}
        <div className="footer__brand">
          <div className="footer__logo">
            {logo.mode === 'image' && logo.imageSrc ? (
              <img
                className="footer__logo-img"
                src={logo.imageSrc}
                alt={logo.imageAlt || branding?.gymName}
              />
            ) : (
              <>
                <span className="footer__logo-mark">{logo.wordmark ?? 'GYM'}</span>
                {logo.tagline && <span className="footer__logo-sub">{logo.tagline}</span>}
              </>
            )}
          </div>
          {footer?.tagline && (
            <p className="footer__tagline">{footer.tagline}</p>
          )}
          {/* Red accent bar */}
          <div className="footer__accent-bar" aria-hidden />
        </div>

        {/* Social links */}
        {(footer?.socialLinks ?? []).length > 0 && (
          <div className="footer__col">
            <p className="footer__col-heading">
              {footer?.socialHeading ?? 'Connect'}
            </p>
            <ul className="footer__col-links" role="list">
              {footer.socialLinks.map((s) => (
                <li key={s.id}>
                  <a href={s.href} target="_blank" rel="noreferrer noopener">
                    {renderSocialIcon(s.id)}
                    <span>{s.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Quick nav links */}
        {(navigation?.links ?? []).length > 0 && (
          <div className="footer__col">
            <p className="footer__col-heading">
              {footer?.quickLinksHeading ?? 'Explore'}
            </p>
            <ul className="footer__col-links" role="list">
              {navigation.links.map((link) => (
                <li key={link.id}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="footer__bottom">
        <p className="footer__copy">{copyrightText}</p>
        <p className="footer__made">Premium Fitness · All Rights Reserved</p>
      </div>
    </footer>
  )
}
