"use client"

import type { StationEntry } from "@/lib/world/stations"

interface InfoPanelProps {
  entry: StationEntry
  accent: string
}

/**
 * One content entry rendered as plain, readable HTML. This is the fallback
 * view's detail renderer - the non-3D counterpart of a station panel, reachable
 * by keyboard and screen reader. It is never shown over the world.
 */
export default function InfoPanel({ entry, accent }: InfoPanelProps) {
  return (
    <article className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <div className="border-l-2 pl-4" style={{ borderColor: accent }}>
        {entry.period && (
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: accent }}>
            {entry.period}
          </p>
        )}
        <h3 className="mt-1 text-lg font-semibold text-white">{entry.heading}</h3>
        {entry.subtitle && <p className="text-sm text-white/60">{entry.subtitle}</p>}
        {(entry.full ?? entry.body) && (
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-white/80">
            {entry.full ?? entry.body}
          </p>
        )}

        {entry.tags && entry.tags.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {entry.tags.map((tag) => (
              <li key={tag} className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/70">
                {tag}
              </li>
            ))}
          </ul>
        )}

        {entry.links && entry.links.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-3">
            {entry.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center rounded-lg px-4 text-sm font-medium text-[#0b1a24] transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ background: accent, outlineColor: accent }}
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}
