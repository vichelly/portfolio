import { experience } from "@/lib/content/experience"
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

/** Drops empty and repeated destinations: several entries point their links at
 *  the same page, which would otherwise stand in the world as two identical
 *  signs. */
const dedupeLinks = (links: StationLink[]): StationLink[] =>
  links.filter((l, i) => l.href && links.findIndex((o) => o.href === l.href) === i)

const byId = <T extends { id: string }>(items: T[], id: string): T => {
  const found = items.find((i) => i.id === id)
  if (!found) throw new Error(`Missing content entry: ${id}`)
  return found
}

const LABELS: Record<StationId, Localized> = {
  intro: { en: "Start", pt: "Início" },
  "itau-rpa": { en: "Itaú Unibanco", pt: "Itaú Unibanco" },
  "itau-intern": { en: "Itaú Unibanco (Intern)", pt: "Itaú Unibanco (Estágio)" },
  "agile-inc": { en: "Agile inc", pt: "Agile inc" },
  fei: { en: "FEI University", pt: "Centro Universitário FEI" },
  fiap: { en: "FIAP", pt: "FIAP" },
  certifications: { en: "Certifications", pt: "Certificações" },
  contact: { en: "Contact", pt: "Contato" },
}

const KICKERS: Record<StationId, Localized> = {
  intro: {
    en: "Vitor Lucas Fujita Felício — software engineer",
    pt: "Vitor Lucas Fujita Felício — engenheiro de software",
  },
  "itau-rpa": { en: "Where the work got serious", pt: "Onde o trabalho ficou sério" },
  "itau-intern": { en: "Where the bank job started", pt: "Onde o trabalho no banco começou" },
  "agile-inc": {
    en: "Two years of shipping across the stack",
    pt: "Dois anos entregando de ponta a ponta",
  },
  fei: { en: "Where it started", pt: "Onde tudo começou" },
  fiap: { en: "What comes next", pt: "O que vem a seguir" },
  certifications: { en: "Official stamps of approval", pt: "Selos oficiais" },
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
 * order lives in trail.ts; this file only says what stands at each stop. Each
 * StationId here is one plaza carrying exactly one experience/education/
 * certification entry - dense zones (Professional Experience, Education &
 * Certifications) are several plazas walked in sequence rather than one
 * panel holding several entries, so no panel needs to shrink its type to fit.
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
      links: e.links?.length
        ? dedupeLinks(e.links.map((l) => ({ label: t(l.label, locale), href: l.href })))
        : undefined,
    }
  }

  /**
   * An experience entry with `highlights` is shown as a compact header card
   * (period, title, company - no body) plus one short card per highlight,
   * instead of a single card holding a long paragraph. This is the same
   * short-entry, multi-column layout that already keeps the certifications
   * panel readable, applied to entries dense enough to otherwise force the
   * panel's type below the 16px floor. An entry with no highlights renders
   * exactly as before, as one card.
   */
  const experienceEntries = (id: string): StationEntry[] => {
    const e = byId(experience, id)
    if (!e.highlights?.length) return [experienceEntry(id)]

    const full = t(e.description, locale) || undefined
    const header: StationEntry = {
      id: e.id,
      heading: t(e.title, locale),
      period: e.year,
      subtitle: e.company,
      full,
      links: e.links?.length
        ? dedupeLinks(e.links.map((l) => ({ label: t(l.label, locale), href: l.href })))
        : undefined,
    }
    const highlightEntries = e.highlights.map((h, i) => ({
      id: `${e.id}-highlight-${i}`,
      heading: t(h.heading, locale),
      body: t(h.body, locale),
    }))
    return [header, ...highlightEntries]
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
    "itau-rpa": station("itau-rpa", experienceEntries("itau-rpa")),
    "itau-intern": station("itau-intern", experienceEntries("itau")),
    "agile-inc": station("agile-inc", experienceEntries("agile-inc")),
    fei: station("fei", [experienceEntry("fei")]),
    fiap: station("fiap", [experienceEntry("fiap")]),
    certifications: station("certifications", [experienceEntry("pspo"), experienceEntry("devin-foundations"), experienceEntry("api-owner"), experienceEntry("aws-certifications")]),
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

/** Ids in `lib/content/experience.ts` that are certifications, gathered onto
 *  the single `certifications` plaza rather than each getting their own stop. */
const CERTIFICATION_IDS = ["pspo", "devin-foundations", "api-owner", "aws-certifications"]

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
  if (!placed.includes("contact")) missing.push("contact")
  if (missing.length) {
    throw new Error(`Content not placed at any station: ${missing.join(", ")}`)
  }

  return {
    placed: placed.length,
    experience: experience.length,
    certifications: CERTIFICATION_IDS.length,
  }
}
