"use client"

import { X } from "lucide-react"
import { experience } from "@/lib/content/experience"
import { projects } from "@/lib/content/projects"
import { skills } from "@/lib/content/skills"
import { contact } from "@/lib/content/contact"

interface FallbackMenuProps {
  open: boolean
  onClose: () => void
}

/**
 * A plain, always-reachable HTML list of every career-content item, for
 * visitors who cannot or do not want to control the 3D avatar. Entirely
 * independent of avatar position, WebGL, or movement capability.
 */
export default function FallbackMenu({ open, onClose }: FallbackMenuProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:py-16">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">All Info</h1>
          <button
            type="button"
            onClick={onClose}
            autoFocus
            className="rounded-full p-2 hover:bg-muted min-h-11 min-w-11 flex items-center justify-center"
            aria-label="Close and return to the 3D world"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4">Experience</h2>
          <ul className="space-y-4">
            {experience.map((entry) => (
              <li key={entry.id} className="rounded-lg border border-border p-4">
                <p className="text-xs text-muted-foreground">{entry.year}</p>
                <p className="font-semibold">{entry.title}</p>
                <p className="text-sm text-muted-foreground mb-2">{entry.company}</p>
                {entry.description && <p className="text-sm whitespace-pre-line">{entry.description}</p>}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4">Skills & Certifications</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {skills.map((s) => (
              <li key={s.id} className="rounded-lg border border-border p-4">
                <p className="font-semibold">{s.title}</p>
                <p className="text-sm text-muted-foreground">{s.skills}</p>
                {s.link && (
                  <a
                    href={s.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary underline underline-offset-2 mt-1 inline-block min-h-11 flex items-center"
                  >
                    View credential
                  </a>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4">Projects</h2>
          <ul className="space-y-4">
            {projects.map((p) => (
              <li key={p.id} className="rounded-lg border border-border p-4">
                <p className="font-semibold">{p.title}</p>
                <p className="text-sm text-muted-foreground mb-2">{p.description}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {p.tags.map((tag) => (
                    <span key={tag} className="text-xs rounded-full bg-primary/10 px-2.5 py-1">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex gap-4">
                  <a
                    href={p.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary underline underline-offset-2 min-h-11 flex items-center"
                  >
                    View Project
                  </a>
                  <a
                    href={p.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary underline underline-offset-2 min-h-11 flex items-center"
                  >
                    GitHub
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">Contact</h2>
          <div className="flex gap-4">
            <a
              href={contact.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-border px-4 py-3 text-sm min-h-11 flex items-center"
            >
              LinkedIn
            </a>
            <a
              href={contact.emailHref}
              className="rounded-lg border border-border px-4 py-3 text-sm min-h-11 flex items-center"
            >
              {contact.email}
            </a>
          </div>
        </section>
      </div>
    </div>
  )
}
