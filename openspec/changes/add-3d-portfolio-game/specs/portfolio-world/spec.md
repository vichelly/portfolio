## Purpose

Defines the explorable 3D world that replaces the scrolling portfolio page: a central hub connected to themed rooms, rendered in a colorful low-poly style, with a guaranteed non-game fallback so every visitor can reach the career content regardless of ability or interest in playing.

## ADDED Requirements

### Requirement: Hub-and-rooms world structure
The system SHALL render a single central hub area from which the visitor can reach every themed room (at minimum: experience/work history, skills, certifications, and projects), and SHALL make the path from the hub to each room visually obvious without requiring the visitor to read instructions.

#### Scenario: Visitor spawns in the hub
- **WHEN** a visitor loads the site
- **THEN** the avatar spawns in the central hub area and every room entrance is visible or discoverable from the hub without leaving the world

#### Scenario: Visitor enters a room
- **WHEN** the visitor moves the avatar through a room entrance
- **THEN** the world transitions the visitor into that room (via camera/scene change or seamless traversal) within 1 second, without a full page reload

### Requirement: Low-poly colorful art direction
The system SHALL render the hub, rooms, and avatar using a consistent low-poly geometric art style with a bright, colorful palette (not dark/photorealistic), so the world reads as playful rather than corporate-somber.

#### Scenario: Visual consistency across rooms
- **WHEN** the visitor moves between the hub and any room
- **THEN** all rooms share the same low-poly art style and color-palette family, so no room looks visually inconsistent with the rest of the world

### Requirement: Non-game fallback to all career content
The system SHALL provide a way to view all career content (experience, skills, certifications, projects, contact info) without requiring the visitor to successfully control the 3D avatar or complete any in-world action, for visitors who cannot or do not want to play.

#### Scenario: Visitor opts out of exploring
- **WHEN** a visitor activates the fallback/"skip to info" control
- **THEN** the system presents all career content capability panels (as defined by career-content-discovery) in a directly navigable list or menu, reachable within 2 interactions from world entry

#### Scenario: Visitor with motor or input constraints
- **WHEN** a visitor cannot operate movement controls (keyboard or touch)
- **THEN** the fallback entry point remains reachable via standard tab/keyboard focus and a visible on-screen control, independent of 3D movement

### Requirement: World loads and renders without a full-page reload between rooms
The system SHALL keep the visitor within a single continuous session (no browser navigation/reload) while moving between the hub and any room.

#### Scenario: Room-to-room traversal
- **WHEN** the visitor exits one room and enters another via the hub
- **THEN** the URL/browser history does not force a full page reload, and avatar state (position context, session) is preserved
