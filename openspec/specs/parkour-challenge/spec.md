# parkour-challenge Specification

## Purpose
Defines the optional parkour course that sits beside the main trail, giving visitors who want to play a physics challenge without making anyone pass it to read the portfolio.

## Requirements

### Requirement: Parkour is an optional detour off the trail
The parkour course SHALL branch off the main trail as a clearly marked, clearly optional detour. It SHALL NOT sit between two content stations on the main path, and no career content SHALL be placed inside it.

#### Scenario: Visitor passes the detour entrance
- **WHEN** the avatar walks past the parkour entrance along the main trail
- **THEN** the trail continues toward the next content station and the visitor is not redirected into the course

#### Scenario: Visitor sees the detour entrance
- **WHEN** the avatar approaches the branch point
- **THEN** the detour is labeled as optional and visually distinct from the main trail

### Requirement: Parkour never gates career content
Entering, completing, failing, or ignoring the parkour course SHALL have no effect on which career content is available or on trail progress.

#### Scenario: Visitor ignores parkour entirely
- **WHEN** the visitor completes the trail without entering the course
- **THEN** all career content has been available and trail progress reaches its end state

#### Scenario: Visitor fails the course
- **WHEN** the avatar falls off the course
- **THEN** it respawns at the course start, and no career content, station state, or trail progress changes

### Requirement: Jump behaves consistently inside and outside parkour
The jump control, its responsiveness, and its feel SHALL be the same inside the parkour course as on the main trail. Jump SHALL NOT be introduced, enabled, or disabled by entering or leaving the course.

#### Scenario: Visitor jumps immediately after entering the course
- **WHEN** the avatar crosses into the parkour course and the visitor presses jump
- **THEN** the jump behaves the same as it did on the trail, with no change in control binding, height, or responsiveness

#### Scenario: Visitor leaves the course mid-run
- **WHEN** the avatar exits the course back onto the trail
- **THEN** movement and jump continue to work without interruption or a control change

### Requirement: Course exit is always available
The visitor SHALL be able to return from the parkour course to the main trail at any time, without completing the course.

#### Scenario: Visitor abandons the course
- **WHEN** the visitor walks back toward the branch point from inside the course
- **THEN** the avatar returns to the main trail at the point it left

### Requirement: Parkour course loads on demand
The parkour course's geometry and logic SHALL NOT be part of the initial page load, and SHALL only be mounted and updated while the avatar is in or near the course.

#### Scenario: Visitor loads the world
- **WHEN** the world first loads
- **THEN** the parkour course's code is not included in the initial bundle

#### Scenario: Visitor never visits the course
- **WHEN** the visitor completes the trail without approaching the course
- **THEN** the course is never mounted and its per-frame logic never runs

### Requirement: Course obstacles are solid
Platforms, moving platforms, and the finish area SHALL support the avatar standing on them and SHALL block it from passing through them.

#### Scenario: Avatar lands on a platform
- **WHEN** the avatar's jump arc brings it down onto a platform
- **THEN** it comes to rest on the platform surface and can walk on it

#### Scenario: Avatar stands on the moving platform
- **WHEN** the avatar is standing on the moving platform
- **THEN** it is carried along with the platform instead of sliding off or falling through

#### Scenario: Avatar jumps into the underside of a platform
- **WHEN** the avatar's jump arc intersects a platform from below
- **THEN** it is stopped by the platform rather than passing through it
