import './Card.css'

export function Card({ className = '', children, elevated = false, ...rest }) {
  const cls = ['card', elevated ? 'card--elevated' : '', className].filter(Boolean).join(' ')
  return (
    <article className={cls} {...rest}>
      {children}
    </article>
  )
}
