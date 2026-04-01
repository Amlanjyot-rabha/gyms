import { useState } from 'react'
import { AnchorButton } from '../components/Button'
import './Navbar.css'

export function Navbar({
  branding,
  navigation,
  themeToggle,
  theme,
  onToggleTheme,
}) {
  const [open, setOpen] = useState(false)
  const logo = branding.logo
  const isDark = theme === 'dark'

  const toggleLabel = isDark ? themeToggle.switchToLight : themeToggle.switchToDark

  return (
    <header className="nav-header">
      <nav className="nav" aria-label={navigation.ariaLabel}>
        <a className="nav__brand" href={navigation.brandHref} onClick={() => setOpen(false)}>
          {logo.mode === 'image' && logo.imageSrc ? (
            <img className="nav__logo-img" src={logo.imageSrc} alt={logo.imageAlt || branding.gymName} />
          ) : (
            <span className="nav__logo">
              <span className="nav__logo-mark">{logo.wordmark}</span>
              <span className="nav__logo-sub">{logo.tagline}</span>
            </span>
          )}
        </a>

        <button
          type="button"
          className="nav__toggle"
          aria-expanded={open}
          aria-controls="nav-panel"
          aria-label={open ? navigation.menuCloseLabel : navigation.menuOpenLabel}
          onClick={() => setOpen((v) => !v)}
        />

        <div id="nav-panel" className={`nav__panel ${open ? 'is-open' : ''}`}>
          <ul className="nav__links">
            {navigation.links.map((link) => (
              <li key={link.id}>
                <a className="nav__link" href={link.href} onClick={() => setOpen(false)}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="nav__actions">
            <button type="button" className="nav__theme" onClick={onToggleTheme} aria-label={toggleLabel}>
              <span className="nav__theme-icon" data-mode={theme} aria-hidden />
            </button>
            <AnchorButton variant="primary" className="nav__cta" href={navigation.cta.href}>
              {navigation.cta.label}
            </AnchorButton>
          </div>
        </div>
      </nav>
    </header>
  )
}
