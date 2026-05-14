import { useMemo, useState } from 'react'
import { Section } from '../components/Section'
import './Gallery.css'

export function Gallery({ gallery }) {
  const [cat, setCat] = useState('all')

  const categories = gallery?.categories ?? [{ id: 'all', label: 'All' }]
  const items       = gallery?.items      ?? []

  const filtered = useMemo(() => {
    if (cat === 'all') return items
    return items.filter((g) => g.category === cat)
  }, [cat, items])

  return (
    <Section id="gallery" eyebrow={gallery?.sectionEyebrow} title={gallery?.heading} tone="default">
      {/* Filter pills */}
      {categories.length > 1 && (
        <div className="gallery__filters" role="tablist" aria-label={gallery?.sectionEyebrow ?? 'Gallery filter'}>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={cat === c.id}
              className={`gallery__filter ${cat === c.id ? 'is-active' : ''}`}
              onClick={() => setCat(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className="gallery__grid">
        {filtered.map((item, i) => (
          <figure key={item.id ?? i} className={`gallery__item gallery__item--${(i % 3 === 0) ? 'wide' : 'normal'}`}>
            <img src={item.src} alt={item.alt ?? ''} loading="lazy" />
            <div className="gallery__item-overlay" aria-hidden>
              {item.alt && <p>{item.alt}</p>}
            </div>
          </figure>
        ))}
      </div>
    </Section>
  )
}
