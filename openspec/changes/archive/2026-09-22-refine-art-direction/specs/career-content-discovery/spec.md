## MODIFIED Requirements

### Requirement: Station content is readable
Station content SHALL present a heading, a time period or subtitle where the source data has one, and body text. Body text SHALL render at no less than 16 CSS pixels on screen when the avatar is standing in the station's plaza, at any supported viewport. A panel SHALL NOT be more than one quarter empty space: the text block SHALL occupy at least three quarters of the panel's height.

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
