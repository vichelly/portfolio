# career-content-discovery Specification

## Purpose
Defines how career content — experience, education, skills, certifications, projects, and contact — is surfaced to the visitor as they walk the trail, without interrupting movement or demanding a dismiss interaction.

## Requirements

### Requirement: Content is presented diegetically in the scene
Station content SHALL be rendered inside the 3D scene at its station. The system SHALL NOT use a modal overlay, a dimmed backdrop, or any surface that covers the world to deliver primary career content.

#### Scenario: Avatar arrives at a station
- **WHEN** the avatar comes within the station's display range
- **THEN** that station's content appears in the scene, anchored at the station, without dimming or covering the world

#### Scenario: Content is displayed
- **WHEN** station content is on screen
- **THEN** no modal dialog, backdrop, or focus trap is present

### Requirement: Content never blocks movement
Displaying, showing, or hiding content SHALL NOT disable, capture, or delay avatar movement input at any point.

#### Scenario: Visitor keeps walking through a station
- **WHEN** the visitor holds a movement key while station content appears
- **THEN** the avatar keeps moving at normal speed without pause or input loss

#### Scenario: Visitor jumps while content is shown
- **WHEN** the visitor jumps while station content is displayed
- **THEN** the jump executes normally

### Requirement: Content dismisses itself by proximity
Station content SHALL disappear when the avatar leaves the station's display range. Dismissing content SHALL NOT require a click, tap, key press, or any explicit visitor action, and no close button SHALL be required to continue.

#### Scenario: Visitor walks away from a station
- **WHEN** the avatar moves beyond the station's display range
- **THEN** the content fades out on its own, with no interaction required

#### Scenario: Visitor returns to a station
- **WHEN** the avatar re-enters a station's display range after leaving it
- **THEN** that station's content appears again in full

#### Scenario: Visitor lingers at a station
- **WHEN** the avatar remains within a station's display range
- **THEN** the content stays visible for as long as the avatar stays, without timing out

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

### Requirement: All existing career content remains discoverable
Every entry currently in the project's content data — each experience entry including the Itaú Vault modernization story, the FEI education entry, every skill category, every certification, and all six projects — SHALL be reachable by walking the trail.

#### Scenario: Visitor completes the trail
- **WHEN** the visitor walks from the first station to the last
- **THEN** every experience, education, skill, certification, and project entry in the content data has been displayed at some station

#### Scenario: Content data gains an entry
- **WHEN** a new entry is added to the content data for an existing station's category
- **THEN** it appears at that station without requiring a new station to be authored

### Requirement: Content exists in both languages
Every station's content SHALL exist in Portuguese and English: headings, periods, subtitles, body text, link labels and station names. No part of the experience SHALL fall back to the other language when one is selected.

#### Scenario: Visitor reads a station in Portuguese
- **WHEN** the world is set to Portuguese and the avatar arrives at any station
- **THEN** every word of that station's panel and its signposts is in Portuguese

#### Scenario: Visitor switches language at a station
- **WHEN** the visitor switches language while station content is displayed
- **THEN** the same content is shown in the other language, without the panel closing or the avatar being moved

#### Scenario: Fallback view follows the language
- **WHEN** the fallback content view is opened in either language
- **THEN** every entry in it is presented in that language

### Requirement: Outbound links are in-world signposts
Project links, GitHub links, LinkedIn, and email SHALL be presented as interactive objects placed in the scene at their station. Activating one SHALL open the target in a new tab without navigating away from the world.

#### Scenario: Visitor activates a project link in the world
- **WHEN** the visitor clicks or taps a project's link signpost
- **THEN** the project URL opens in a new browser tab and the 3D world remains loaded and interactive in the original tab

#### Scenario: Visitor approaches a link signpost
- **WHEN** the avatar is near a link signpost
- **THEN** the signpost indicates it is interactive and names its destination

### Requirement: Contact information remains reachable
Contact details SHALL be available at the trail's final station and in the fallback content view.

#### Scenario: Visitor reaches the end of the trail
- **WHEN** the avatar arrives at the final station
- **THEN** LinkedIn and email are presented as activatable signposts

### Requirement: Fallback content view mirrors the world
The non-3D fallback view SHALL contain every entry and every outbound link available in the world, and SHALL be operable by keyboard alone.

#### Scenario: Visitor compares fallback against the world
- **WHEN** the fallback view is opened
- **THEN** it lists every experience, education, skill, certification, project, and contact item presented along the trail, with the same working links

#### Scenario: Keyboard-only visitor uses the fallback
- **WHEN** a visitor navigates the fallback view using only Tab, Shift+Tab, Enter, and Escape
- **THEN** every entry and link is reachable and the view can be closed
