## Purpose

Defines how the visitor controls the low-poly avatar around the world across desktop and mobile, including camera behavior and movement boundaries, so exploring feels easy rather than fiddly.

## ADDED Requirements

### Requirement: Desktop keyboard movement
The system SHALL let desktop visitors move the avatar using WASD and/or arrow keys, with immediate (sub-100ms perceived) response to key input.

#### Scenario: Visitor presses a movement key
- **WHEN** a desktop visitor presses W/A/S/D or an arrow key
- **THEN** the avatar moves in the corresponding direction while the key is held, and stops when released

### Requirement: Mobile touch movement
The system SHALL let mobile/touch visitors move the avatar using an on-screen virtual joystick or equivalent touch control, without requiring an external keyboard.

#### Scenario: Visitor drags the on-screen joystick
- **WHEN** a mobile visitor touches and drags the virtual joystick control
- **THEN** the avatar moves in the direction and at a speed proportional to the drag vector, and stops when the touch is released

#### Scenario: Touch controls do not obstruct the view
- **WHEN** the virtual joystick (and any action buttons) are displayed on mobile
- **THEN** they are positioned so the avatar and nearby points of interest remain visible and tappable

### Requirement: Camera follows the avatar
The system SHALL keep a camera trained on the avatar as it moves, keeping the avatar and its immediate surroundings in view at all times during movement.

#### Scenario: Avatar moves across the hub
- **WHEN** the avatar moves in any direction
- **THEN** the camera updates smoothly to keep the avatar visible on screen without requiring manual camera control from the visitor

### Requirement: Movement stays within world bounds
The system SHALL prevent the avatar from leaving the intended walkable area of the hub or a room (e.g., via invisible collision boundaries), so visitors cannot walk into empty space or fall out of the world through normal movement.

#### Scenario: Visitor moves toward a world edge
- **WHEN** the avatar reaches the boundary of the walkable area
- **THEN** further movement in that direction is blocked and the avatar remains within the world

### Requirement: Controls are responsive across desktop and mobile viewport sizes
The system SHALL detect the visitor's input capability (touch vs. keyboard/mouse) and present the matching control scheme automatically, without requiring manual configuration.

#### Scenario: Visitor opens the site on a touch device
- **WHEN** a visitor loads the world on a touch-primary device
- **THEN** the on-screen joystick control is shown and keyboard-only prompts are not shown

#### Scenario: Visitor opens the site on desktop
- **WHEN** a visitor loads the world on a desktop browser with keyboard/mouse
- **THEN** keyboard movement is active and the touch joystick is not shown (unless a touch event is subsequently detected, e.g. on a touchscreen laptop)
