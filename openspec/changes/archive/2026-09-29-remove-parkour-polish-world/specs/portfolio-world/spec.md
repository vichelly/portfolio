## MODIFIED Requirements

### Requirement: Visual quality adapts to the device
The system SHALL choose a quality tier from measured device capability, not from viewport width alone, and SHALL disable the most expensive effects on the lowest tier. The highest tier SHALL be selected only on evidence that the device can sustain it. The experience SHALL remain complete at every tier: no content, control or station becomes unavailable because of the tier chosen. On integrated graphics at a typical laptop viewport, the world SHALL remain continuously interactive — movement and camera respond to input without visible stalling — from first load through the end of the trail.

#### Scenario: Visitor loads the world on a phone
- **WHEN** the world loads on a small or low-capability device
- **THEN** the expensive effects are disabled, and every station, control and piece of content still works

#### Scenario: Visitor loads the world on a desktop GPU
- **WHEN** the world loads on a device with evidence of a capable GPU
- **THEN** the full effect set is enabled

#### Scenario: Visitor loads the world on an integrated-graphics laptop
- **WHEN** the world loads on a wide viewport backed by integrated graphics
- **THEN** a tier appropriate to that hardware is chosen at load rather than the highest tier, and the visitor does not have to wait for a step-down to occur before the world is usable

#### Scenario: Frame rate falls
- **WHEN** the rendered frame rate stays below the target for a sustained period
- **THEN** the system steps down to a cheaper tier rather than continuing to drop frames

#### Scenario: Visitor walks the whole trail on a modest machine
- **WHEN** the avatar is walked from the first station to the last on integrated graphics
- **THEN** movement and camera remain responsive throughout, with no point along the trail where the world stops responding to input

## REMOVED Requirements

### Requirement: Stations appear in narrative order
**Reason**: Both of this requirement's scenarios are written around the parkour detour — "without entering the parkour detour" and "Visitor skips the parkour detour" — and the detour no longer exists. Restating the narrative order without those clauses is a new requirement rather than an edit to this one, so it is replaced wholesale by "Stations appear in narrative order on a single route" below.
**Migration**: None. The narrative order it specified is carried forward unchanged by its replacement, which additionally requires that no alternative route exists at all.

## ADDED Requirements

### Requirement: Stations appear in narrative order on a single route
Career content SHALL be distributed across stations placed along the trail in this order: introduction, professional experience (most recent first), education, skills, certifications, projects, contact. The trail SHALL offer exactly one route from its first station to its last: no optional branch SHALL leave it, and no alternative path SHALL rejoin it.

#### Scenario: Visitor walks the trail from end to end
- **WHEN** the visitor walks from the trail start to the trail end
- **THEN** every content station is encountered exactly once, in the order above

#### Scenario: Visitor looks for an alternative route
- **WHEN** the visitor moves the avatar in any direction at any point along the trail
- **THEN** there is exactly one walkable route, with no branch, detour, or side area to enter

#### Scenario: Visitor is never asked to choose a direction
- **WHEN** the avatar leaves any station moving forward
- **THEN** the trail continues toward exactly one next station, and no signage offers a second destination

### Requirement: The world's visual system holds along the whole trail
Every element of the world's visual treatment — cast shadows, the avatar's contact grounding, distance fog, and the depth at which geometry is drawn — SHALL behave identically at every point along the trail. Quality SHALL NOT degrade as a function of distance from the world's origin, and no part of the trail SHALL be rendered without a treatment that another part of the trail receives.

#### Scenario: Visitor compares the start and the end of the trail
- **WHEN** the visitor stands at the first plaza and then at the last plaza
- **THEN** objects cast shadows in both places, and the shadows run in the same direction with comparable definition

#### Scenario: Visitor walks the whole trail watching the avatar's feet
- **WHEN** the avatar walks from the trail start to the trail end
- **THEN** it stays visually grounded — a contact shadow sits beneath it — at every point, not only near the start

#### Scenario: Visitor looks toward the far horizon
- **WHEN** the visitor looks along the trail toward its far end
- **THEN** distant geometry fades into the haze rather than being cut off at a visible hard edge

### Requirement: A loading asset never removes placed content
Content already placed in the scene SHALL remain visible while any other part of the world is still loading. An asset that has not finished loading SHALL affect only the object that needs it.

#### Scenario: A plaza's logo has not loaded yet
- **WHEN** the avatar walks toward a plaza whose crest image is still being fetched
- **THEN** the other plazas, their panels, their signposts, and the ambient skill text all remain on screen, and only that crest is absent until it arrives

#### Scenario: Visitor switches language while walking
- **WHEN** the visitor switches the display language mid-trail
- **THEN** the world does not blank: plazas, panels, and signposts remain in place and change language without disappearing and reappearing

#### Scenario: Visitor reaches a plaza they have not visited
- **WHEN** the avatar arrives at a plaza for the first time
- **THEN** its panel and crest are present on arrival rather than appearing some time after the visitor has stopped to read

### Requirement: Content appears and disappears by fading
Objects that are mounted and unmounted as the avatar advances SHALL enter and leave the frame by fading, never by appearing or vanishing abruptly. A station SHALL NOT flicker on and off while the avatar lingers at the edge of the range that mounts it.

#### Scenario: A plaza comes into view
- **WHEN** the avatar walks forward far enough for the next plaza to enter the scene
- **THEN** it fades in rather than popping into existence

#### Scenario: Visitor stands at the edge of a plaza's range
- **WHEN** the avatar is moved back and forth across the boundary at which a plaza is mounted
- **THEN** that plaza does not flicker on and off
