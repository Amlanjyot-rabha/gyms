import { useState, useEffect } from 'react'
import './Navbar.css'

export function Navbar({ branding, navigation, siteStatus, onJoin }) {
  const [open,      setOpen]      = useState(false)
  const [scrolled,  setScrolled]  = useState(false)

  // Backward-compatible: siteStatus may be undefined on old CMS docs
  const status = siteStatus ?? 'open'
  const isOpen = status === 'open'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menu on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const logo = branding?.logo ?? {}

  return (
    <header className={`nav-header ${scrolled ? 'nav-header--scrolled' : ''}`}>
      <nav className="nav" aria-label={navigation?.ariaLabel ?? 'Primary'}>

        {/* Brand */}
        <a className="nav__brand" href={navigation?.brandHref ?? '#'} onClick={() => setOpen(false)}>
          {logo.mode === 'image' && logo.imageSrc ? (
            <img className="nav__logo-img" src={logo.imageSrc} alt={logo.imageAlt || branding?.gymName} />
          ) : (
            <span className="nav__logo">
              <span className="nav__logo-mark">{logo.wordmark ?? 'GYM'}</span>
              {logo.tagline && <span className="nav__logo-sub">{logo.tagline}</span>}
            </span>
          )}
        </a>

        {/* Desktop links */}
        <ul className="nav__links" role="list">
          {(navigation?.links ?? []).map((link) => (
            <li key={link.id}>
              <a className="nav__link" href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Right actions */}
        <div className="nav__actions">
          {/* Open / Closed badge */}
          <span className={`nav__status ${isOpen ? 'nav__status--open' : 'nav__status--closed'}`}
                aria-label={`Gym is currently ${isOpen ? 'open' : 'closed'}`}>
            <span className="nav__status-dot" aria-hidden />
            {isOpen ? 'Open Now' : 'Closed'}
          </span>

          <button
            className="nav__cta-btn"
            onClick={onJoin}
            aria-label="Join the gym"
          >
            Join Now
          </button>

          {/* Hamburger */}
          <button
            type="button"
            className={`nav__toggle ${open ? 'is-open' : ''}`}
            aria-expanded={open}
            aria-controls="nav-mobile-panel"
            aria-label={open ? (navigation?.menuCloseLabel ?? 'Close menu') : (navigation?.menuOpenLabel ?? 'Open menu')}
            onClick={() => setOpen((v) => !v)}
          >
            <span aria-hidden /><span aria-hidden /><span aria-hidden />
          </button>
        </div>
      </nav>

      {/* Mobile panel */}
      <div id="nav-mobile-panel" className={`nav__mobile ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        <ul role="list">
          {(navigation?.links ?? []).map((link) => (
            <li key={link.id}>
              <a className="nav__mobile-link" href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <button className="nav__cta-btn nav__cta-btn--mobile" onClick={() => { setOpen(false); onJoin?.() }}>
          Join Now
        </button>
      </div>
    </header>
  )
}
