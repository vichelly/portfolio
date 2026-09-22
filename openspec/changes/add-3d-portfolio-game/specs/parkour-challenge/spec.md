## Purpose

Defines the optional secondary game layer (jumpable platforms and simple obstacles) for visitors who want to engage beyond reading career content, without ever gating access to that content.

## ADDED Requirements

### Requirement: Parkour layer is optional and clearly secondary
The system SHALL present the parkour/challenge elements as clearly optional (e.g., visually distinct from career-content points of interest, or confined to an identifiable area), so a visitor can tell at a glance that engaging with them is not required to see career content.

#### Scenario: Visitor ignores the parkour elements
- **WHEN** a visitor never interacts with any jumpable platform or obstacle
- **THEN** the visitor can still reach and open every career-content-discovery info panel

### Requirement: Parkour never blocks career content access
The system SHALL NOT place any career-content point of interest, room entrance, or the non-game fallback control behind a parkour obstacle that requires jump timing, physics puzzle-solving, or platform traversal to pass.

#### Scenario: Visitor with no platforming skill explores the world
- **WHEN** a visitor who cannot or does not attempt any jump successfully navigates the hub and rooms via normal ground movement
- **THEN** every room and every career-content point of interest remains reachable

### Requirement: Jump control
The system SHALL provide a jump action (keyboard key on desktop, on-screen button on mobile) that the avatar can use to clear parkour platforms/obstacles.

#### Scenario: Visitor triggers jump on desktop
- **WHEN** a desktop visitor presses the designated jump key (e.g. Space)
- **THEN** the avatar performs a jump with enough height/distance to clear the intended platform gaps

#### Scenario: Visitor triggers jump on mobile
- **WHEN** a mobile visitor taps the on-screen jump button
- **THEN** the avatar performs the same jump behavior as on desktop

### Requirement: Falling or failing a parkour challenge has no penalty on career content
The system SHALL ensure that falling off a platform or failing a parkour obstacle only resets the avatar's position within the parkour area (or nearby ground), and never removes, hides, or delays access to any career-content-discovery content already unlocked.

#### Scenario: Visitor falls off a platform
- **WHEN** the avatar falls off a parkour platform
- **THEN** the avatar respawns at a safe nearby point and any previously viewed career content remains accessible with no reset
