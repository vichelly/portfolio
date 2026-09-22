import type { InfoPanelContent } from "@/components/world/InfoPanel"
import { experience } from "@/lib/content/experience"
import { projects } from "@/lib/content/projects"
import { skills } from "@/lib/content/skills"
import { contact } from "@/lib/content/contact"

export const experiencePanels: Record<string, InfoPanelContent> = Object.fromEntries(
  experience.map((entry) => [
    entry.id,
    {
      id: entry.id,
      eyebrow: entry.year,
      title: entry.title,
      subtitle: entry.company,
      body: entry.description || undefined,
    } satisfies InfoPanelContent,
  ]),
)

export const projectPanels: Record<string, InfoPanelContent> = Object.fromEntries(
  projects.map((p) => [
    p.id,
    {
      id: p.id,
      title: p.title,
      body: p.description,
      tags: p.tags,
      links: [
        { label: "View Project", href: p.link },
        { label: "GitHub", href: p.github },
      ],
    } satisfies InfoPanelContent,
  ]),
)

const NON_CERT_SKILLS = skills.filter((s) => s.id !== "agile")
const CERT_SKILLS = skills.filter((s) => s.id === "agile")

export const skillPanels: Record<string, InfoPanelContent> = Object.fromEntries(
  NON_CERT_SKILLS.map((s) => [
    s.id,
    {
      id: s.id,
      title: s.title,
      body: s.skills,
    } satisfies InfoPanelContent,
  ]),
)

export const certificationPanels: Record<string, InfoPanelContent> = Object.fromEntries(
  CERT_SKILLS.map((s) => [
    s.id,
    {
      id: s.id,
      title: s.title,
      body: s.skills,
      links: s.link ? [{ label: "View Credential", href: s.link }] : undefined,
    } satisfies InfoPanelContent,
  ]),
)

export const contactPanel: InfoPanelContent = {
  id: "contact",
  title: "Get In Touch",
  body: "Interested in working together? Feel free to reach out!",
  links: [
    { label: "LinkedIn", href: contact.linkedin },
    { label: "Email", href: contact.emailHref },
  ],
}

export const ALL_PANELS: Record<string, InfoPanelContent> = {
  ...experiencePanels,
  ...projectPanels,
  ...skillPanels,
  ...certificationPanels,
  contact: contactPanel,
}
