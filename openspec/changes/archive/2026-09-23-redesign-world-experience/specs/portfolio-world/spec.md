## MODIFIED Requirements

### Requirement: Stations appear in narrative order
Career content SHALL be distributed across stations placed along the trail in this order: introduction, professional experience (most recent first), education & certifications, contact. Skills SHALL NOT have a dedicated station; they SHALL appear as ambient, non-interactive typography in the scene rather than as a walked stop. Projects SHALL NOT have a dedicated station; a project SHALL be presented as part of the experience or education entry it belongs to. The optional parkour detour SHALL be positioned beside the trail, never between two content stations on the main path.

#### Scenario: Visitor walks the trail without deviating
- **WHEN** the visitor walks from the trail start to the trail end without entering the parkour detour
- **THEN** every content station is encountered exactly once, in the order above, and no station is dedicated to skills or to projects alone

#### Scenario: Visitor skips the parkour detour
- **WHEN** the visitor passes the parkour detour entrance without entering it
- **THEN** the main trail continues uninterrupted and no career content is missed

#### Scenario: Visitor passes through the world
- **WHEN** the visitor walks the trail
- **THEN** skill names appear as ambient text drifting in the scene, not anchored to a plaza and not requiring the avatar to stop
