## ADDED Requirements

### Requirement: The world commits to one named art direction
The world SHALL present a dawn-in-a-valley direction: a low sun casting long shadows, a sky graded from warm to cool, warm sand and stone, and vegetation reading as dark silhouette. Every surface, light and interface accent SHALL draw from one palette defined in a single place.

#### Scenario: Visitor looks along the trail
- **WHEN** the visitor faces the trail ahead at any point along it
- **THEN** the sun's direction is readable from the shadows, and the palette is the same one used at every other point on the trail

#### Scenario: A new surface is added to the world
- **WHEN** a new object is added to the scene
- **THEN** its colours come from the shared palette rather than being specified on the object

### Requirement: Surfaces carry procedural detail
Every large surface — the trail, the terrain, stone, and vegetation — SHALL carry visible material detail generated procedurally rather than painted as a single flat colour. That detail SHALL NOT repeat in a visible tiling pattern, and SHALL NOT require any texture file to be downloaded.

#### Scenario: Visitor stands close to the trail surface
- **WHEN** the avatar stands still and the surface fills a good part of the frame
- **THEN** the surface shows grain and tonal variation rather than one uniform fill

#### Scenario: Visitor looks across a long stretch of ground
- **WHEN** a large area of terrain is visible at once
- **THEN** no repeating tile or seam is discernible in it

#### Scenario: The world loads
- **WHEN** the world loads
- **THEN** no image texture file is requested

### Requirement: Sky and distance separate the planes
The world SHALL render a graded sky containing the sun, and distance fog tuned so that successive ridges and objects separate from one another by tone rather than merging into a single band.

#### Scenario: Visitor looks toward the horizon
- **WHEN** the visitor looks toward the far horizon
- **THEN** near terrain, far terrain and sky are distinguishable from each other by tone

#### Scenario: Visitor looks up
- **WHEN** the camera frames the sky
- **THEN** the sky is a gradient with the sun's position readable in it, not a flat fill

### Requirement: The ground has relief
Terrain outside the walkable corridor SHALL have height variation, and SHALL meet the trail's edge without a visible step or gap. The walkable corridor itself SHALL remain flat.

#### Scenario: Visitor looks off the trail
- **WHEN** the visitor looks away from the trail toward the surrounding land
- **THEN** the land has hills and hollows rather than reading as a flat plane

#### Scenario: Visitor walks to the trail's edge
- **WHEN** the avatar reaches the lateral limit of the trail
- **THEN** the trail surface and the terrain beside it meet without a visible step, gap or floating edge

#### Scenario: Visitor walks the whole trail
- **WHEN** the avatar walks from the first station to the last
- **THEN** the ground underfoot stays level and movement behaves exactly as before this change

### Requirement: The air is not empty
The world SHALL show motion in the environment: airborne particles in the light, vegetation responding to wind, and dust raised at the avatar's feet when it walks and when it lands.

#### Scenario: Visitor stands still
- **WHEN** the avatar is idle
- **THEN** the environment still shows motion, so the world does not read as a frozen image

#### Scenario: Avatar lands from a jump
- **WHEN** the avatar lands after a jump
- **THEN** dust is raised at the point of landing

### Requirement: Visual quality adapts to the device
The system SHALL choose a quality tier from the device's capability and viewport, and SHALL disable the most expensive effects on the lowest tier. The experience SHALL remain complete at every tier: no content, control or station becomes unavailable because of the tier chosen.

#### Scenario: Visitor loads the world on a phone
- **WHEN** the world loads on a small or low-capability device
- **THEN** the expensive effects are disabled, and every station, control and piece of content still works

#### Scenario: Visitor loads the world on a desktop GPU
- **WHEN** the world loads on a capable device
- **THEN** the full effect set is enabled

#### Scenario: Frame rate falls
- **WHEN** the rendered frame rate stays below the target for a sustained period
- **THEN** the system steps down to a cheaper tier rather than continuing to drop frames
