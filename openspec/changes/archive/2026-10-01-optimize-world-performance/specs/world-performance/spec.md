## Purpose
Defines the load weight and idle cost of the portfolio page, so the world stays light to open and does not burn a visitor's battery while they are not looking at it.

## ADDED Requirements

### Requirement: Page ships only what the world uses
The page SHALL deliver only code, fonts and images that the world or its non-3D fallback actually displays. It SHALL NOT depend on a third-party host for its text font on first paint.

#### Scenario: Visitor loads the page on a cold cache
- **WHEN** a visitor opens the page with an empty cache
- **THEN** every font and image requested comes from the site's own origin, and no request is made for an asset that nothing on screen uses

#### Scenario: Production build is produced
- **WHEN** the production build runs
- **THEN** it fails if the project has type errors or lint errors, rather than shipping them silently

### Requirement: Hidden page does no render work
While the page is not visible to the visitor, the world SHALL NOT render frames or advance the avatar, and SHALL resume where it left off when the page becomes visible again.

#### Scenario: Visitor switches to another tab mid-walk
- **WHEN** the tab becomes hidden while the avatar is moving
- **THEN** the world stops rendering frames, and on return the avatar is at the same position with no jump, fall-through or teleport

#### Scenario: Visitor returns after a long absence
- **WHEN** the tab becomes visible after minutes hidden
- **THEN** the first frame advances time by no more than a normal frame step, and any held movement key is not treated as still pressed

### Requirement: Optimisation preserves the experience
Performance changes SHALL NOT alter the trail, station content, controls, language switching, fallback content, or the quality tiers' visible fidelity at the detected tier.

#### Scenario: Visitor walks the full trail after the change
- **WHEN** the avatar walks from the first station to the last
- **THEN** every station's content, link and crest appears as before, and the progress indicator reaches the end
