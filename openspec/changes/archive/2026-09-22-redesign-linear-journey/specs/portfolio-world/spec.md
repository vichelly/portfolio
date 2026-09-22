## Purpose

Defines the structure, navigation shape, and art direction of the 3D portfolio world: a single guided trail the visitor walks from start to finish, so the career story arrives in order without the visitor having to choose a route.

## ADDED Requirements

### Requirement: Single linear trail replaces branching layout
The world SHALL present exactly one continuous walkable trail. The visitor SHALL NOT be asked to choose between parallel destinations, and there SHALL be no hub with multiple gateways leading to separate content areas.

#### Scenario: Visitor starts the experience
- **WHEN** the world finishes loading
- **THEN** the avatar stands at the start of the trail with the trail's forward direction clearly visible, and no alternative content routes are presented

#### Scenario: Visitor reaches the end of a station
- **WHEN** the avatar leaves a station moving forward
- **THEN** the trail continues toward exactly one next station

#### Scenario: Visitor tries to leave the trail
- **WHEN** the avatar moves away from the trail's walkable surface
- **THEN** movement is constrained back toward the trail rather than into empty or unauthored space

### Requirement: Stations appear in narrative order
Career content SHALL be distributed across stations placed along the trail in this order: introduction, professional experience (most recent first), education, skills, certifications, projects, contact. The optional parkour detour SHALL be positioned beside the trail, never between two content stations on the main path.

#### Scenario: Visitor walks the trail without deviating
- **WHEN** the visitor walks from the trail start to the trail end without entering the parkour detour
- **THEN** every content station is encountered exactly once, in the order above

#### Scenario: Visitor skips the parkour detour
- **WHEN** the visitor passes the parkour detour entrance without entering it
- **THEN** the main trail continues uninterrupted and no career content is missed

### Requirement: Trail progress is visible
The system SHALL show the visitor where they are along the trail and how much remains, updating as the avatar advances.

#### Scenario: Avatar advances along the trail
- **WHEN** the avatar moves forward past a station
- **THEN** the progress indicator updates to reflect the new position without the visitor taking any additional action

#### Scenario: Avatar backtracks
- **WHEN** the avatar walks backward toward an earlier station
- **THEN** the progress indicator updates to reflect the earlier position, and that station's content becomes available again

### Requirement: Cohesive art direction along the trail
The world SHALL apply one coherent visual system across trail surface, station framing, environment props, lighting, and interface: a single defined palette, consistent material treatment, and readable silhouettes against the sky and ground.

#### Scenario: Visitor observes any two stations
- **WHEN** the visitor compares any two stations in the world
- **THEN** both use the same palette, material treatment, and framing language, differing only in accent color and content

#### Scenario: Content is read against the environment
- **WHEN** station text is displayed over the environment
- **THEN** it remains legible against the background behind it at the default camera distance

### Requirement: Non-game fallback to all career content
The system SHALL provide a keyboard-reachable, non-3D path to every piece of career content present in the world, including all outbound links.

#### Scenario: Visitor uses the fallback path
- **WHEN** a visitor opens the fallback content view
- **THEN** all experience entries, education, skills, certifications, projects with their links, and contact details are readable and navigable without moving the avatar

#### Scenario: Visitor reaches the fallback by keyboard
- **WHEN** a visitor tabs from the top of the page
- **THEN** the control that opens the fallback view is reachable and activatable by keyboard alone

### Requirement: Visitor chooses the display language
The world SHALL offer Portuguese and English, switchable at any time from a single control that is reachable without leaving the trail. The initial language SHALL follow the visitor's browser, and their explicit choice SHALL be remembered on that device.

#### Scenario: Visitor arrives with a Portuguese browser
- **WHEN** a visitor whose browser language is Portuguese loads the world
- **THEN** the world is presented in Portuguese without them changing anything

#### Scenario: Visitor arrives with any other browser language
- **WHEN** a visitor whose browser language is not Portuguese loads the world
- **THEN** the world is presented in English

#### Scenario: Visitor switches language
- **WHEN** the visitor activates the language control
- **THEN** the interface, the station content and the world's own signage all change language, and the avatar's position and trail progress are unaffected

#### Scenario: Visitor returns later
- **WHEN** a visitor who chose a language reloads the world on the same device
- **THEN** their chosen language is used, regardless of the browser's language

### Requirement: World renders without full-page navigation
Moving between stations SHALL NOT cause a route change, full-page reload, or teardown of the 3D scene.

#### Scenario: Avatar crosses the whole trail
- **WHEN** the avatar walks from the first station to the last
- **THEN** the page URL and the 3D scene instance remain unchanged throughout
