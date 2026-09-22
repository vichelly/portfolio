## ADDED Requirements

### Requirement: Camera tracks the avatar's actual movement inside the course
While the avatar is inside the parkour detour, the camera SHALL frame the scene from the avatar's current position and heading within the course, derived from its recent motion in the detour arena. The camera SHALL NOT hold a heading or position frozen from the moment the avatar entered the detour, and SHALL NOT derive its facing from the main trail while the avatar is off the main trail.

#### Scenario: Visitor jumps sideways across platforms
- **WHEN** the avatar moves in a direction that differs from the direction it was facing when it entered the detour
- **THEN** the camera reorients to follow the avatar's current direction of travel within the course

#### Scenario: Visitor stands still on a platform inside the course
- **WHEN** the avatar is stationary inside the detour
- **THEN** the camera keeps the avatar and the platform it is judging its next jump from in frame

#### Scenario: Visitor returns to the main trail
- **WHEN** the avatar crosses back from the detour onto the main trail
- **THEN** the camera resumes following the main trail's own heading at the avatar's position
