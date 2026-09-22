import { experience } from "@/lib/content/experience"
import { projects } from "@/lib/content/projects"
import { skills } from "@/lib/content/skills"
import { contact } from "@/lib/content/contact"
import { t, type Locale, type Localized } from "@/lib/i18n/locale"
import type { StationId } from "@/lib/world/trail"

export interface StationLink {
  label: string
  href: string
}

export interface StationEntry {
  id: string
  heading: string
  /** The full account, when it differs from the panel's short one. */
  full?: string
  /** Year or date range, shown above the heading. */
  period?: string
  /** Organisation or category, shown under the heading. */
  subtitle?: string
  body?: string
  tags?: string[]
  links?: StationLink[]
}

export interface StationContent {
  id: StationId
  /** Short name on the station sign and in the HUD. */
  label: string
  /** One line framing what this stop is. */
  kicker: string
  entries: StationEntry[]
}

/** Drops empty and repeated destinations: several projects point their "view"
 *  and "code" links at the same GitHub page, which would otherwise stand in the
 *  world as two identical signs. */
const dedupeLinks = (links: StationLink[]): StationLink[] =>
  links.filter((l, i) => l.href && links.findIndex((o) => o.href === l.href) === i)

const byId = <T extends { id: string }>(items: T[], id: string): T => {
  const found = items.find((i) => i.id === id)
  if (!found) throw new Error(`Missing content entry: ${id}`)
  return found
}

const LABELS: Record<StationId, Localized> = {
  intro: { en: "Start", pt: "Início" },
  itau: { en: "Itaú Unibanco", pt: "Itaú Unibanco" },
  "agile-inc": { en: "Agile inc", pt: "Agile inc" },
  fei: { en: "FEI University", pt: "Centro Universitário FEI" },
  skills: { en: "Skills", pt: "Habilidades" },
  certifications: { en: "Certifications", pt: "Certificações" },
  projects: { en: "Projects", pt: "Projetos" },
  contact: { en: "Contact", pt: "Contato" },
}

const KICKERS: Record<StationId, Localized> = {
  intro: {
    en: "Vitor Lucas Fujita Felício — software engineer",
    pt: "Vitor Lucas Fujita Felício — engenheiro de software",
  },
  itau: { en: "Where the work got serious", pt: "Onde o trabalho ficou sério" },
  "agile-inc": {
    en: "Two years of shipping across the stack",
    pt: "Dois anos entregando de ponta a ponta",
  },
  fei: { en: "Where it started", pt: "Onde tudo começou" },
  skills: { en: "The toolbox", pt: "A caixa de ferramentas" },
  certifications: { en: "Official stamps of approval", pt: "Selos oficiais" },
  projects: { en: "Things that got shipped", pt: "Coisas que foram entregues" },
  contact: { en: "End of the trail — say hello", pt: "Fim da trilha — diga oi" },
}

const INTRO: Record<Locale, string> = {
  en:
    "This is my career as a place you can walk through. Follow the trail: every stop tells one part of the story, in the order it happened. Nothing to click, nothing to close — just keep moving.\n\nWASD or the arrow keys to walk. Space to jump. On a phone, use the stick and the jump button.",
  pt:
    "Esta é a minha carreira como um lugar por onde você pode caminhar. Siga a trilha: cada parada conta uma parte da história, na ordem em que aconteceu. Nada para clicar, nada para fechar — é só seguir andando.\n\nWASD ou as setas para andar. Espaço para pular. No celular, use o direcional e o botão de pulo.",
}

const CONTACT_BODY: Record<Locale, string> = {
  en: "Interested in working together? The fastest way to reach me is LinkedIn or email.",
  pt: "Quer trabalhar comigo? O jeito mais rápido de falar comigo é pelo LinkedIn ou e-mail.",
}

const WELCOME_HEADING: Record<Locale, string> = {
  en: "Walk the path",
  pt: "Caminhe pela trilha",
}

const CONTACT_HEADING: Record<Locale, string> = {
  en: "Get in touch",
  pt: "Vamos conversar",
}

const CREDENTIAL: Record<Locale, string> = { en: "Credential", pt: "Credencial" }

/**
 * Every station's content in one language, assembled from lib/content. Station
 * order lives in trail.ts; this file only says what stands at each stop.
 */
export function stationsFor(locale: Locale): Record<StationId, StationContent> {
  const experienceEntry = (id: string): StationEntry => {
    const e = byId(experience, id)
    const full = t(e.description, locale) || undefined
    return {
      id: e.id,
      heading: t(e.title, locale),
      period: e.year,
      subtitle: e.company,
      body: (e.summary ? t(e.summary, locale) : full) || undefined,
      full,
    }
  }

  const skillEntry = (id: string): StationEntry => {
    const s = byId(skills, id)
    return {
      id: s.id,
      heading: t(s.title, locale),
      body: t(s.skills, locale),
      links: s.link ? [{ label: CREDENTIAL[locale], href: s.link }] : undefined,
    }
  }

  const station = (id: StationId, entries: StationEntry[]): StationContent => ({
    id,
    label: t(LABELS[id], locale),
    kicker: t(KICKERS[id], locale),
    entries,
  })

  return {
    intro: station("intro", [
      { id: "welcome", heading: WELCOME_HEADING[locale], body: INTRO[locale] },
    ]),
    itau: station("itau", [experienceEntry("itau-rpa"), experienceEntry("itau")]),
    "agile-inc": station("agile-inc", [experienceEntry("agile-inc")]),
    fei: station("fei", [experienceEntry("fei")]),
    skills: station(
      "skills",
      skills.filter((s) => s.id !== "agile").map((s) => skillEntry(s.id)),
    ),
    certifications: station("certifications", [experienceEntry("pspo"), skillEntry("agile")]),
    projects: station(
      "projects",
      projects.map((p) => ({
        id: p.id,
        heading: p.title,
        body: t(p.description, locale),
        tags: p.tags,
        links: dedupeLinks([
          { label: p.link === p.github ? "GitHub" : locale === "pt" ? "Ver" : "View", href: p.link },
          { label: "GitHub", href: p.github },
        ]),
      })),
    ),
    contact: station("contact", [
      {
        id: "contact",
        heading: CONTACT_HEADING[locale],
        body: CONTACT_BODY[locale],
        links: dedupeLinks([
          { label: "LinkedIn", href: contact.linkedin },
          { label: locale === "pt" ? "E-mail" : "Email", href: contact.emailHref },
        ]),
      },
    ]),
  }
}

export function stationListFor(locale: Locale): StationContent[] {
  return Object.values(stationsFor(locale))
}

/**
 * Fails loudly if any entry in the content data is not placed at a station, or
 * is placed at more than one. Career content going missing is the one failure
 * this world cannot show the visitor, so it is checked rather than trusted.
 */
export function assertContentCoverage(locale: Locale = "en") {
  const placed = stationListFor(locale).flatMap((s) => s.entries.map((e) => e.id))
  const duplicates = placed.filter((id, i) => placed.indexOf(id) !== i)
  if (duplicates.length) {
    throw new Error(`Content placed at more than one station: ${duplicates.join(", ")}`)
  }

  const missing: string[] = []
  for (const e of experience) if (!placed.includes(e.id)) missing.push(`experience:${e.id}`)
  for (const s of skills) if (!placed.includes(s.id)) missing.push(`skill:${s.id}`)
  for (const p of projects) if (!placed.includes(p.id)) missing.push(`project:${p.id}`)
  if (!placed.includes("contact")) missing.push("contact")
  if (missing.length) {
    throw new Error(`Content not placed at any station: ${missing.join(", ")}`)
  }

  return {
    placed: placed.length,
    experience: experience.length,
    skills: skills.length,
    projects: projects.length,
  }
}
