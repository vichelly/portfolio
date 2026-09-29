## MODIFIED Requirements

### Requirement: Station content is readable
Station content SHALL present a heading, a time period or subtitle where the source data has one, and body text. Body text SHALL render at no less than 16 CSS pixels on screen when the avatar is standing in the station's plaza, at any supported viewport. A panel SHALL NOT be more than one quarter empty space: the text block SHALL occupy at least three quarters of the panel's height. When a zone's entries do not fit one panel at that minimum size without exceeding the panel's maximum height, the zone SHALL present its entries as sequential plazas — one entry per panel — rather than shrinking body text below the 16px floor to force a fit.

A panel SHALL fit the frame in both dimensions. When the avatar is standing in a station's plaza, the whole panel — every column, and the full width of every line of text — SHALL lie inside the viewport, at any supported viewport size and aspect ratio. No line of body text SHALL be truncated or run past the left or right edge of the screen. Where a panel's shape cannot fit the frame's width at the readable type size, the station SHALL present the content in a narrower shape rather than allow it to be clipped.

#### Scenario: Visitor reads a long experience entry
- **WHEN** a station's source entry is too long to be legible on one panel at the default camera distance
- **THEN** the panel presents a short form of that entry, legible without the visitor manipulating the camera, and the full text remains available in the fallback view

#### Scenario: Visitor reads a short entry
- **WHEN** a station's source entry is short enough to be legible on one panel
- **THEN** the panel presents it in full

#### Scenario: Visitor stands at a station on a desktop viewport
- **WHEN** the avatar stands in a station's plaza on a desktop viewport
- **THEN** the body text measures at least 16 CSS pixels tall on screen

#### Scenario: Visitor reads on a phone
- **WHEN** station content is displayed in a 360px-wide viewport
- **THEN** the text remains legible, is not clipped by the viewport edges, and measures at least 16 CSS pixels tall

#### Scenario: Visitor reads a multi-column panel on a tall narrow screen
- **WHEN** the avatar stands at a plaza whose content is laid out in more than one column, on a viewport taller than it is wide
- **THEN** every column is fully on screen and no line of text is cut off at either side edge

#### Scenario: A panel is framed by the camera
- **WHEN** the camera settles into its reading position at any station
- **THEN** the distance it settles at is far enough for the panel's full width as well as its full height to lie inside the frame

#### Scenario: A panel is laid out
- **WHEN** any station's panel is laid out
- **THEN** its text occupies at least three quarters of the panel's height, with the remainder as margin

#### Scenario: A zone carries more entries than one panel can hold at readable size
- **WHEN** the Professional Experience or Education & Certifications zone has enough entries that a single panel would need to drop body text below 16px to fit them all
- **THEN** the zone presents its entries across multiple plazas walked in sequence, each panel meeting the 16px floor and the three-quarters fill rule on its own
