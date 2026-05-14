import './Footer.css'

function interpolateCopyright(template, vars) {
  if (!template) return ''
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    key in vars ? String(vars[key]) : `{${key}}`
  )
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
            <span className="footer__logo-mark">{logo.wordmark ?? 'GYM'}</span>
            {logo.tagline && <span className="footer__logo-sub">{logo.tagline}</span>}
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
                    {s.label}
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
