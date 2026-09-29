## MODIFIED Requirements

### Requirement: Jump is available everywhere in the world
The visitor SHALL be able to jump at any point in the world. Jump SHALL be bound to Space on desktop and to a dedicated on-screen button on touch devices, and that button SHALL be present regardless of the avatar's location. There SHALL be no region of the world in which jump is introduced, enabled, disabled, or altered.

#### Scenario: Visitor jumps on the main trail
- **WHEN** the visitor presses the jump control while the avatar is grounded anywhere on the trail
- **THEN** the avatar leaves the ground, follows a gravity arc, and lands

#### Scenario: Visitor jumps near a station
- **WHEN** the visitor jumps while station content is displayed
- **THEN** the jump executes normally and the displayed content is not dismissed or interrupted

#### Scenario: Visitor holds jump while airborne
- **WHEN** the jump control is held continuously
- **THEN** the avatar performs exactly one jump per grounded state and does not jump again until it lands

#### Scenario: Visitor jumps at different points along the trail
- **WHEN** the visitor jumps at the trail start, at a plaza, beside an obstacle, and at the trail end
- **THEN** the jump height, airtime, and control response are identical at all four

## ADDED Requirements

### Requirement: Trail obstacles are jumpable and bypassable
The trail SHALL carry simple obstacles between its plazas — raised blocks to hop over, stepping stones to cross, and low beams to clear. Every obstacle SHALL be clearable by a single jump from the ground beside it, and every obstacle SHALL ALSO be passable on foot without jumping, by walking around it within the trail's walkable width. No obstacle SHALL be placed inside a plaza, inside a content panel's footprint, or inside a link signpost's footprint.

#### Scenario: Visitor jumps an obstacle
- **WHEN** the visitor runs at an obstacle and presses jump at its base
- **THEN** the avatar clears it and lands on the far side, or lands on top of it and can walk off

#### Scenario: Visitor cannot or will not jump
- **WHEN** the visitor walks the whole trail from start to end without ever pressing the jump control
- **THEN** they reach every plaza and every piece of career content, never becoming stuck against an obstacle

#### Scenario: Visitor walks into an obstacle
- **WHEN** the avatar walks directly into the side of an obstacle
- **THEN** it is stopped by the obstacle rather than passing through it, and can still move sideways along it

#### Scenario: Visitor stands on an obstacle
- **WHEN** the avatar lands on top of an obstacle
- **THEN** it comes to rest on that surface, can walk on it, and falls under gravity when it walks off the edge

#### Scenario: Obstacle placement is checked against the plazas
- **WHEN** the set of obstacles is laid out along the trail
- **THEN** no obstacle's collision volume overlaps any plaza, panel, or signpost, and each leaves a continuous walkable lane at least one avatar width clear beside it

### Requirement: Camera framing is continuous everywhere on the trail
The camera SHALL derive its framing from a single, continuously-updating source along the whole trail. It SHALL NOT hold a frozen heading, change its framing rule, or snap between framing modes at any point in the world.

#### Scenario: Visitor walks a bend in the trail
- **WHEN** the avatar walks through a curve in the trail
- **THEN** the camera swings smoothly to keep the trail ahead in frame, with no abrupt reorientation

#### Scenario: Visitor reverses direction
- **WHEN** the avatar turns around and walks back the way it came
- **THEN** the camera reorients smoothly rather than snapping, and keeps the avatar framed throughout

#### Scenario: Visitor jumps an obstacle
- **WHEN** the avatar jumps over an obstacle
- **THEN** the camera follows the arc without a vertical jolt, and the landing point stays visible
