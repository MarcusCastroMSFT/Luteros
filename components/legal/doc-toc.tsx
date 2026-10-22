'use client'

import { useEffect, useState } from 'react'

export interface DocSection {
  id: string
  title: string
}

// Distance from the viewport top (px) used as the "reading line" to pick the active section.
const OFFSET = 130

/**
 * Sticky table of contents with scroll-spy. Uses a rAF-throttled scroll listener instead of
 * IntersectionObserver because sections are long and often taller than the viewport.
 */
export function DocToc({ sections }: { sections: DocSection[] }) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? '')

  useEffect(() => {
    if (sections.length === 0) return
    let frame = 0

    const update = () => {
      frame = 0
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
      if (atBottom) {
        setActiveId(sections[sections.length - 1].id)
        return
      }

      let current = sections[0].id
      for (const section of sections) {
        const el = document.getElementById(section.id)
        if (el && el.getBoundingClientRect().top <= OFFSET) current = section.id
      }
      setActiveId(current)
    }

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [sections])

  return (
    <nav aria-label="Neste documento" className="border-t border-[#0a2f33]/15 pt-5">
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#630a79]">
        Neste documento
      </p>
      <div className="max-h-[calc(100vh-14rem)] overflow-y-auto pr-1">
        {sections.map((section) => {
          const isActive = section.id === activeId
          return (
            <a
              key={section.id}
              href={`#${section.id}`}
              aria-current={isActive ? 'location' : undefined}
              className={[
                'block rounded-r-md border-l-2 px-3 py-1.5 text-sm transition-colors duration-200',
                isActive
                  ? 'border-[#198189] bg-[#198189]/10 font-semibold text-[#0a2f33]'
                  : 'border-[#0a2f33]/10 text-[#4f666a] hover:border-[#198189]/50 hover:bg-[#198189]/5 hover:text-[#0a2f33]',
              ].join(' ')}
            >
              {section.title}
            </a>
          )
        })}
      </div>
    </nav>
  )
}
