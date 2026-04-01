import './Button.css'

const VARIANTS = ['primary', 'secondary', 'ghost', 'outline']

/**
 * @param {object} props
 * @param {'button'|'submit'} [props.type]
 * @param {'primary'|'secondary'|'ghost'|'outline'} [props.variant]
 * @param {boolean} [props.block]
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children — should be data-driven label from parent
 */
export function Button({
  type = 'button',
  variant = 'primary',
  block = false,
  className = '',
  children,
  ...rest
}) {
  const v = VARIANTS.includes(variant) ? variant : 'primary'
  const cls = ['btn', `btn--${v}`, block ? 'btn--block' : '', className].filter(Boolean).join(' ')
  return (
    <button type={type} className={cls} {...rest}>
      {children}
    </button>
  )
}

export function AnchorButton({ variant = 'primary', block = false, className = '', children, href, ...rest }) {
  const v = VARIANTS.includes(variant) ? variant : 'primary'
  const cls = ['btn', `btn--${v}`, block ? 'btn--block' : '', className].filter(Boolean).join(' ')
  return (
    <a className={cls} href={href} {...rest}>
      {children}
    </a>
  )
}
