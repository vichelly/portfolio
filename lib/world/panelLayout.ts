import type { StationContent, StationEntry } from "@/lib/world/stations"

export const FONT_REGULAR = "/fonts/inter-latin-400.woff"
export const FONT_BOLD = "/fonts/inter-latin-600.woff"

/**
 * World-unit type scale. Sized from the camera, not guessed: the on-screen
 * height of a world-space glyph is
 *
 *   pixels = worldSize x viewportHeight / (2 x distance x tan(fov / 2))
 *
 * At fov 55 on an 860px viewport with the station camera ~11u from the panel,
 * body 0.30 lands near 23px. The spec's floor is 16px.
 */
export const SIZES = {
  label: 0.58,
  kicker: 0.3,
  heading: 0.38,
  meta: 0.25,
  body: 0.3,
  tags: 0.24,
} as const

const LINE_HEIGHT = 1.26
const PARAGRAPH_GAP = 0.12
const BLOCK_GAP = 0.1
const ENTRY_GAP = 0.36
const COLUMN_GAP = 0.7

export interface TextBlock {
  key: string
  text: string
  size: number
  /** Top edge of this block, relative to the panel's top (negative downward). */
  y: number
  x: number
  maxWidth: number
  weight: "regular" | "bold"
  tone: "text" | "muted" | "accent"
}

export interface PanelLayout {
  blocks: TextBlock[]
  width: number
  height: number
}

/**
 * Troika renders text asynchronously, so its measured height is not available
 * when we need to size the panel behind it. Estimating from the average glyph
 * advance of the text face keeps layout synchronous and stable; the panel is
 * padded enough to absorb the small error.
 */
const GLYPH_ADVANCE = 0.52

function measure(text: string, size: number, maxWidth: number): number {
  const charsPerLine = Math.max(8, Math.floor(maxWidth / (size * GLYPH_ADVANCE)))
  let lines = 0
  for (const paragraph of text.split("\n")) {
    lines += Math.max(1, Math.ceil(paragraph.length / charsPerLine))
  }
  const paragraphs = text.split("\n").length - 1
  return lines * size * LINE_HEIGHT + paragraphs * PARAGRAPH_GAP
}

function entryBlocks(
  entry: StationEntry,
  x: number,
  top: number,
  width: number,
  prefix: string,
): { blocks: TextBlock[]; height: number } {
  const blocks: TextBlock[] = []
  let y = top

  const push = (
    text: string | undefined,
    size: number,
    weight: TextBlock["weight"],
    tone: TextBlock["tone"],
    key: string,
  ) => {
    if (!text) return
    const height = measure(text, size, width)
    blocks.push({ key: `${prefix}-${key}`, text, size, y, x, maxWidth: width, weight, tone })
    y -= height + BLOCK_GAP
  }

  push(entry.period, SIZES.meta, "bold", "accent", "period")
  push(entry.heading, SIZES.heading, "bold", "text", "heading")
  push(entry.subtitle, SIZES.meta, "regular", "muted", "subtitle")
  push(entry.body, SIZES.body, "regular", "text", "body")
  push(entry.tags?.join("  ·  "), SIZES.tags, "regular", "muted", "tags")

  return { blocks, height: top - y }
}

/**
 * Lays a station's content out into a flat list of positioned text blocks.
 * Busy stops are laid out in columns, which keeps the projects and skills
 * panels wide and short rather than a tower the camera cannot frame.
 */
export function layoutStation(
  content: StationContent,
  width: number,
  columns: number,
): PanelLayout {
  const blocks: TextBlock[] = []
  const left = -width / 2
  let y = 0

  const labelHeight = measure(content.label, SIZES.label, width)
  blocks.push({
    key: "label",
    text: content.label,
    size: SIZES.label,
    y,
    x: left,
    maxWidth: width,
    weight: "bold",
    tone: "text",
  })
  y -= labelHeight + 0.04

  const kickerHeight = measure(content.kicker, SIZES.kicker, width)
  blocks.push({
    key: "kicker",
    text: content.kicker,
    size: SIZES.kicker,
    y,
    x: left,
    maxWidth: width,
    weight: "regular",
    tone: "accent",
  })
  y -= kickerHeight + ENTRY_GAP

  const columnWidth = (width - COLUMN_GAP * (columns - 1)) / columns

  for (let i = 0; i < content.entries.length; i += columns) {
    const row = content.entries.slice(i, i + columns)
    let rowHeight = 0
    row.forEach((entry, column) => {
      const x = left + column * (columnWidth + COLUMN_GAP)
      const laid = entryBlocks(entry, x, y, columnWidth, entry.id)
      blocks.push(...laid.blocks)
      rowHeight = Math.max(rowHeight, laid.height)
    })
    y -= rowHeight + ENTRY_GAP
  }

  return { blocks, width, height: Math.abs(y) }
}
