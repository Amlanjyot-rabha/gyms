import './Footer.css'

function interpolateCopyright(template, vars) {
  return template.replace(/\{(\w+)\}/g, (_, key) => (key in vars ? String(vars[key]) : `{${key}}`))
}

export function Footer({ branding, footer, navigation }) {
  const year = new Date().getFullYear()
  const copyrightText = interpolateCopyright(footer.copyright, {
    year,
    gymName: branding.gymName,
  })

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <span className="footer__mark">{branding.logo.wordmark}</span>
          <span className="footer__sub">{branding.logo.tagline}</span>
          <p className="footer__tagline">{footer.tagline}</p>
        </div>
        <div className="footer__col">
          <p className="footer__heading">{footer.socialHeading}</p>
          <ul className="footer__social">
            {footer.socialLinks.map((s) => (
              <li key={s.id}>
                <a href={s.href} target="_blank" rel="noreferrer">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="footer__col">
          <p className="footer__heading">{footer.quickLinksHeading}</p>
          <ul className="footer__links">
            {navigation.links.map((link) => (
              <li key={link.id}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="footer__copy">{copyrightText}</p>
    </footer>
  )
}
