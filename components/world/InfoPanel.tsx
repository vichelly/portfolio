"use client"

import { useEffect } from "react"
import { X } from "lucide-react"

export interface InfoPanelContent {
  id: string
  eyebrow?: string
  title: string
  subtitle?: string
  body?: string
  tags?: string[]
  links?: { label: string; href: string }[]
}

interface InfoPanelProps {
  content: InfoPanelContent | null
  onClose: () => void
}

/**
 * A plain DOM overlay (not a 3D mesh) rendered above the <Canvas>. Opening
 * it never unmounts the 3D scene, and closing it restores avatar control
 * immediately since movement input is independent of panel state.
 */
export default function InfoPanel({ content, onClose }: InfoPanelProps) {
  useEffect(() => {
    if (!content) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [content, onClose])

  if (!content) return null

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`panel-title-${content.id}`}
        className="w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-2xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            {content.eyebrow && (
              <p className="text-xs uppercase tracking-wide text-primary mb-1">{content.eyebrow}</p>
            )}
            <h3 id={`panel-title-${content.id}`} className="text-xl font-bold">
              {content.title}
            </h3>
            {content.subtitle && <p className="text-sm text-muted-foreground mt-0.5">{content.subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-full p-2 hover:bg-muted min-h-11 min-w-11 flex items-center justify-center"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {content.body && <p className="mt-4 whitespace-pre-line text-sm leading-relaxed">{content.body}</p>}

        {content.tags && content.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {content.tags.map((tag) => (
              <span key={tag} className="text-xs rounded-full bg-primary/10 px-2.5 py-1">
                {tag}
              </span>
            ))}
          </div>
        )}

        {content.links && content.links.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-3">
            {content.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center min-h-11 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
