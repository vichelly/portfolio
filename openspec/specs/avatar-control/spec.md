# avatar-control Specification

## Purpose
Defines how the visitor controls the avatar across desktop and mobile — movement, jumping, gravity, camera framing — and what the avatar looks like, so walking the trail feels like playing a game rather than dragging a marker.

## Requirements

### Requirement: Desktop keyboard movement
The system SHALL let desktop visitors move the avatar using WASD and arrow keys, responding to key input within one rendered frame of the key event.

#### Scenario: Visitor presses a movement key
- **WHEN** a desktop visitor presses W/A/S/D or an arrow key
- **THEN** the avatar accelerates in the corresponding direction while the key is held, and decelerates to a stop when released

#### Scenario: Visitor presses two movement keys
- **WHEN** two perpendicular movement keys are held at once
- **THEN** the avatar moves diagonally at the same top speed as a single-axis move, not faster

### Requirement: Mobile touch movement
The system SHALL let touch visitors move the avatar with an on-screen joystick and jump with an on-screen button, without an external keyboard.

#### Scenario: Visitor drags the on-screen joystick
- **WHEN** a touch visitor drags the virtual joystick
- **THEN** the avatar moves in the drag direction at a speed proportional to the drag distance, and stops when the touch ends

#### Scenario: Touch controls do not obscure content
- **WHEN** touch controls are displayed
- **THEN** the avatar and the currently displayed station content remain visible and unobstructed

### Requirement: Jump is available everywhere in the world
The visitor SHALL be able to jump at any point in the world, not only inside the optional parkour area. Jump SHALL be bound to Space on desktop and to a dedicated on-screen button on touch devices, and that button SHALL be present regardless of the avatar's location.

#### Scenario: Visitor jumps on the main trail
- **WHEN** the visitor presses the jump control while the avatar is grounded anywhere on the trail
- **THEN** the avatar leaves the ground, follows a gravity arc, and lands

#### Scenario: Visitor jumps near a station
- **WHEN** the visitor jumps while station content is displayed
- **THEN** the jump executes normally and the displayed content is not dismissed or interrupted

#### Scenario: Visitor holds jump while airborne
- **WHEN** the jump control is held continuously
- **THEN** the avatar performs exactly one jump per grounded state and does not jump again until it lands

### Requirement: Grounded movement has game feel
Movement SHALL apply gravity, jump buffering, coyote time, and reduced-but-nonzero air control, so input that is slightly early or slightly late still produces the jump the visitor intended.

#### Scenario: Jump pressed just before landing
- **WHEN** the visitor presses jump within the buffer window before the avatar touches the ground
- **THEN** the avatar jumps immediately on landing instead of ignoring the input

#### Scenario: Jump pressed just after leaving a ledge
- **WHEN** the visitor presses jump within the coyote window after the avatar walks off a ledge
- **THEN** the avatar still performs a full jump

#### Scenario: Visitor steers in mid-air
- **WHEN** a movement direction is held while the avatar is airborne
- **THEN** the avatar's horizontal trajectory adjusts partially toward that direction, with less authority than on the ground

#### Scenario: Avatar falls off a raised surface
- **WHEN** the avatar walks off any raised surface in the world
- **THEN** it falls under gravity and lands on the surface below rather than floating or snapping down

### Requirement: Avatar reads as a human figure
The avatar SHALL be a recognizably humanoid Ultraman-inspired figure with distinct head, neck, torso, arms with hands, and legs with feet, in human proportion. It SHALL NOT read as a featureless robot or as unconnected floating primitives.

#### Scenario: Visitor views the avatar at rest
- **WHEN** the avatar is idle at the default camera distance
- **THEN** its silhouette reads as a human figure, with the head, limbs, hands, and feet distinguishable

#### Scenario: Avatar turns
- **WHEN** the avatar changes facing direction
- **THEN** front and back are visually distinguishable from each other

### Requirement: Avatar animation reflects movement state
The avatar SHALL be animated distinctly for idle, walking, jumping, falling, and landing, with transitions between states blended rather than snapped.

#### Scenario: Avatar starts walking from idle
- **WHEN** movement input begins
- **THEN** the avatar blends from the idle animation into a walk cycle whose rate tracks its speed

#### Scenario: Avatar is airborne
- **WHEN** the avatar is rising after a jump or falling
- **THEN** its pose differs visibly from both the idle and the walking pose

#### Scenario: Avatar lands
- **WHEN** the avatar touches the ground after a fall
- **THEN** a brief landing response plays before it returns to idle or walking

### Requirement: Camera follows the avatar along the trail
The camera SHALL keep the avatar and its immediate surroundings in frame at all times without requiring manual camera control, and SHALL keep the trail's forward direction visible.

#### Scenario: Avatar moves along the trail
- **WHEN** the avatar moves in any direction
- **THEN** the camera follows smoothly, keeping the avatar on screen and the trail ahead visible

#### Scenario: Avatar jumps
- **WHEN** the avatar jumps
- **THEN** the camera keeps the avatar framed through the whole arc without abrupt movement

### Requirement: Controls work across viewport sizes
Movement, jump, and the progress indicator SHALL remain usable from a 360px-wide phone viewport up to a desktop viewport, with touch targets at least 44x44 CSS pixels.

#### Scenario: Visitor plays on a small phone
- **WHEN** the world is loaded in a 360px-wide viewport
- **THEN** the joystick and jump button are fully visible, tappable, and not overlapping each other or the progress indicator
