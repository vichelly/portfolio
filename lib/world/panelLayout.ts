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

/** Margin between the text block and the panel's edge, on every side. */
export const PADDING = 0.34
/** How high above the ground the panel's bottom edge sits. */
export const FLOOR_CLEARANCE = 1.2
/**
 * How tall a panel may grow before it is scaled down to fit.
 *
 * This is per viewport shape, not one number, and that matters more than it
 * looks. A single fixed cap of 5.8 was what actually broke phone legibility:
 * at the distance a narrow frame has to read a panel from, the frustum is
 * about 14 world units tall, so a cap of 5.8 was shrinking panels that the
 * screen had ample room for - and the fit-scale shrinks the type with them.
 *
 * Enlarging the type cannot compensate, and provably so: while a panel is
 * scaled, `fit = MAX_HEIGHT / height` and `height` is proportional to the type
 * size, so `size x fit` is constant. The only way to get readable type on a
 * phone is to stop scaling the panel down - which is what the taller narrow
 * cap does.
 *
 * 10.5 is chosen against the frame, not by eye: at the narrow width below the
 * camera settles 13.6 units back, where the frame is 14.2 units tall, so a
 * 10.5-unit panel fills the screen without overflowing it.
 */
export const MAX_HEIGHT = 5.8
export const MAX_HEIGHT_NARROW = 10.5

/** The height cap in force for a viewport shape. */
export function maxHeightFor(narrow: boolean): number {
  return narrow ? MAX_HEIGHT_NARROW : MAX_HEIGHT
}

/**
 * Panel shapes to try, narrowest first. Height is what forces the fit-scale
 * down and makes the type small, so a stop that carries a lot of text is given
 * more width and more columns rather than being allowed to grow upward.
 */
export const SHAPES = [
  { width: 6, columns: 1 },
  { width: 9, columns: 2 },
  { width: 12, columns: 2 },
  { width: 13, columns: 3 },
]

/**
 * On a narrow viewport there is exactly one shape: a single column, 4.0 wide.
 *
 * A `{ width: 7.5, columns: 2 }` used to sit here, and it is what produced the
 * clipped Itau panel - "Consolida...", "API Gatew...", "Agentes d...". Now
 * that the camera frames a panel's width as well as its height, a wide shape
 * is not merely tight but unusable: every extra unit of width pushes the
 * camera further back, and the type shrinks with the distance.
 *
 * 4.0 is the widest that still clears the 16px floor. The camera settles 13.6
 * units back to frame it, which puts body type at 16.5px on a 360px-wide
 * screen; 4.4 pushes the camera to 14.8 units and the type to 15.2px, under
 * the floor. So this number is set by the floor, not chosen.
 */
export const NARROW_SHAPES = [{ width: 4.0, columns: 1 }]

/** Text must fill at least this much of the panel; the rest is margin. */
export const MIN_FILL = 0.75
/** The spec's floor for body text, in CSS pixels on screen. */
export const MIN_BODY_PIXELS = 16

/** How much of the panel's height the text occupies. */
function fillRatio(height: number) {
  return height / (height + PADDING * 2)
}

/**
 * The first shape that both fits the frame and is dense enough; the widest if
 * none qualify. Density is checked here rather than trusted, because bigger
 * type in the same box just makes a taller panel that `fit` then shrinks -
 * undoing the gain it was supposed to deliver.
 *
 * This lives here rather than in the panel component so that the rule the
 * panel-fit requirement turns on - does every station's panel fit the frame,
 * at every supported viewport - can be checked directly against the real
 * content, without standing in front of each plaza in a browser.
 */
export function fitShape(content: StationContent, narrow: boolean): PanelLayout {
  const shapes = narrow ? NARROW_SHAPES : SHAPES
  const maxHeight = maxHeightFor(narrow)
  for (const shape of shapes) {
    const layout = layoutStation(content, shape.width, shape.columns)
    if (layout.height <= maxHeight && fillRatio(layout.height) >= MIN_FILL) return layout
  }
  const last = shapes[shapes.length - 1]
  return layoutStation(content, last.width, last.columns)
}
