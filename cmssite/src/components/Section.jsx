import './Section.css'

/**
 * @param {object} props
 * @param {string} props.id
 * @param {string} [props.eyebrow]
 * @param {string} [props.title]
 * @param {string} [props.intro]
 * @param {'default'|'muted'|'contrast'} [props.tone]
 */
export function Section({ id, eyebrow, title, intro, tone = 'default', children, className = '' }) {
  const cls = ['section', `section--${tone}`, className].filter(Boolean).join(' ')
  return (
    <section id={id} className={cls}>
      <div className="section__inner">
        {(eyebrow || title || intro) && (
          <header className="section__head">
            {eyebrow ? <p className="section__eyebrow">{eyebrow}</p> : null}
            {title ? <h2 className="section__title">{title}</h2> : null}
            {intro ? <p className="section__intro">{intro}</p> : null}
          </header>
        )}
        {children}
      </div>
    </section>
  )
}
