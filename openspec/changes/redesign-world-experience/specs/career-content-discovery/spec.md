## MODIFIED Requirements

### Requirement: Station content is readable
Station content SHALL present a heading, a time period or subtitle where the source data has one, and body text. Body text SHALL render at no less than 16 CSS pixels on screen when the avatar is standing in the station's plaza, at any supported viewport. A panel SHALL NOT be more than one quarter empty space: the text block SHALL occupy at least three quarters of the panel's height. When a zone's entries do not fit one panel at that minimum size without exceeding the panel's maximum height, the zone SHALL present its entries as sequential plazas — one entry per panel — rather than shrinking body text below the 16px floor to force a fit.

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

#### Scenario: A panel is laid out
- **WHEN** any station's panel is laid out
- **THEN** its text occupies at least three quarters of the panel's height, with the remainder as margin

#### Scenario: A zone carries more entries than one panel can hold at readable size
- **WHEN** the Professional Experience or Education & Certifications zone has enough entries that a single panel would need to drop body text below 16px to fit them all
- **THEN** the zone presents its entries across multiple plazas walked in sequence, each panel meeting the 16px floor and the three-quarters fill rule on its own

### Requirement: All existing career content remains discoverable
Every experience entry (including the Itaú RAAS/Entra ID modernization and the FinOps cost-reduction result), the FEI and FIAP education entries, and every certification currently in the project's content data SHALL be reachable by walking the trail. Skill names SHALL be present in the world as ambient typography, without being required to stand at a dedicated station. A project SHALL be discoverable as part of the experience or education entry it belongs to, without requiring its own station.

#### Scenario: Visitor completes the trail
- **WHEN** the visitor walks from the first station to the last
- **THEN** every experience, education, and certification entry in the content data has been displayed at some station, and every project is discoverable inside the experience or education entry it belongs to

#### Scenario: Content data gains an entry
- **WHEN** a new entry is added to the content data for an existing zone's category
- **THEN** it appears at that zone without requiring a new station to be authored

#### Scenario: Visitor looks for a skill
- **WHEN** the visitor wants to see what technologies are listed
- **THEN** skill names are visible as ambient text somewhere in the world, and the full list remains in the fallback view
