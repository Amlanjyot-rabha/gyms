import './PageSkeleton.css'

export function PageSkeleton({ ariaLabel }) {
  return (
    <div className="skeleton-page" aria-busy="true" aria-live="polite" aria-label={ariaLabel}>
      <div className="skeleton skeleton--nav" />
      <div className="skeleton skeleton--hero" />
      <div className="skeleton-grid">
        <div className="skeleton skeleton--block" />
        <div className="skeleton skeleton--block short" />
      </div>
      <div className="skeleton-row">
        <div className="skeleton skeleton--card" />
        <div className="skeleton skeleton--card" />
        <div className="skeleton skeleton--card" />
      </div>
    </div>
  )
}
