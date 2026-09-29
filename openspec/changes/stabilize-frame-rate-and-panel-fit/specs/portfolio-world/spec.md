## MODIFIED Requirements

<!-- The base text below is the version `remove-parkour-polish-world` installs
     when it is archived, not the text currently in openspec/specs/. That change
     is implemented but unarchived; task 0.1 of this change archives it first. -->

### Requirement: Visual quality adapts to the device
The system SHALL choose a quality tier from measured device capability, not from viewport width alone, and SHALL disable the most expensive effects on the lowest tier. The highest tier SHALL be selected only on evidence that the device can sustain it. The experience SHALL remain complete at every tier: no content, control or station becomes unavailable because of the tier chosen. On integrated graphics at a typical laptop viewport, the world SHALL remain continuously interactive — movement and camera respond to input without visible stalling — from first load through the end of the trail.

A change of quality tier SHALL NOT itself stall the world: when the system steps down, the visitor SHALL continue to control the avatar throughout, and the step-down SHALL NOT produce a pause longer than the stutter it was invoked to correct.

#### Scenario: Visitor loads the world on a phone
- **WHEN** the world loads on a small or low-capability device
- **THEN** the expensive effects are disabled, and every station, control and piece of content still works

#### Scenario: Visitor loads the world on a desktop GPU
- **WHEN** the world loads on a device with evidence of a capable GPU
- **THEN** the full effect set is enabled

#### Scenario: Visitor loads the world on an integrated-graphics laptop
- **WHEN** the world loads on a wide viewport backed by integrated graphics
- **THEN** a tier appropriate to that hardware is chosen at load rather than the highest tier, and the visitor does not have to wait for a step-down to occur before the world is usable

#### Scenario: Frame rate falls
- **WHEN** the rendered frame rate stays below the target for a sustained period
- **THEN** the system steps down to a cheaper tier rather than continuing to drop frames

#### Scenario: The quality tier steps down mid-walk
- **WHEN** the system steps the tier down while the avatar is moving
- **THEN** the avatar keeps responding to input across the transition, and the world does not freeze while the cheaper tier is brought up

#### Scenario: Visitor walks the whole trail on a modest machine
- **WHEN** the avatar is walked from the first station to the last on integrated graphics
- **THEN** movement and camera remain responsive throughout, with no point along the trail where the world stops responding to input

## ADDED Requirements

### Requirement: Walking the trail does not stutter
Frame timing SHALL stay continuous for the length of the walk. Content entering or leaving the scene as the avatar advances — a plaza, its panel, its signposts, its crest, the decorative props, the ambient skill text — SHALL NOT cause a visible pause, and SHALL NOT change the cost of rendering anything other than itself.

No single frame during an uninterrupted walk from the first plaza to the last SHALL take longer than four times the session's typical frame time. The visitor SHALL never see the avatar stop, jump forward, or ignore input because something in the world was being prepared.

#### Scenario: A plaza enters the scene while the avatar is walking
- **WHEN** the avatar walks forward far enough for the next plaza to enter the scene
- **THEN** the frame it enters on takes no longer than any other frame of that walk, and the avatar's motion does not pause or skip

#### Scenario: A plaza leaves the scene behind the avatar
- **WHEN** the avatar walks far enough past a plaza for it to leave the scene
- **THEN** nothing else in the world changes appearance or cost, and the frame it leaves on is indistinguishable from its neighbours

#### Scenario: Visitor walks the trail end to end without stopping
- **WHEN** the avatar is walked from the first plaza to the last without pausing
- **THEN** no frame in that walk takes more than four times the walk's typical frame time

#### Scenario: Visitor arrives at a plaza never visited before
- **WHEN** the avatar reaches a plaza for the first time in the session
- **THEN** its panel, signposts, and crest are already prepared, and no pause occurs at the moment they become visible

#### Scenario: Visitor walks back and forth across a mount boundary
- **WHEN** the avatar is moved repeatedly across the distance at which a plaza enters and leaves the scene
- **THEN** the frame rate stays steady and nothing flickers, however many times the boundary is crossed
