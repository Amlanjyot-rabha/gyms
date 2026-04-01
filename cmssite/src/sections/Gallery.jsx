import { useMemo, useState } from 'react'
import { Section } from '../components/Section'
import './Gallery.css'

export function Gallery({ gallery }) {
  const [cat, setCat] = useState('all')

  const filtered = useMemo(() => {
    if (cat === 'all') return gallery.items
    return gallery.items.filter((g) => g.category === cat)
  }, [cat, gallery.items])

  return (
    <Section id="gallery" eyebrow={gallery.sectionEyebrow} title={gallery.heading} tone="muted">
      <div className="gallery__filters" role="tablist" aria-label={gallery.sectionEyebrow}>
        {gallery.categories.map((c) => (
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
      <div className="gallery__grid">
        {filtered.map((item) => (
          <figure key={item.id} className="gallery__item">
            <img src={item.src} alt={item.alt} loading="lazy" />
          </figure>
        ))}
      </div>
    </Section>
  )
}
