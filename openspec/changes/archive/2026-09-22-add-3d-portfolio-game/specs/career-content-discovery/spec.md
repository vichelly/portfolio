## Purpose

Defines how career information — experience, skills, certifications, projects, and contact details — is surfaced as the visitor explores the world, ensuring every existing piece of career content from the prior portfolio remains present and easy to find in-world.

## ADDED Requirements

### Requirement: Points of interest trigger career info panels
The system SHALL place interactive points of interest (glowing objects and/or NPC-like figures) inside rooms, such that approaching or clicking/tapping one opens an info panel displaying the associated career content, without leaving the 3D world.

#### Scenario: Visitor approaches a point of interest
- **WHEN** the avatar moves near an interactive point of interest (or the visitor clicks/taps it)
- **THEN** an info panel opens showing the associated content within 300ms, and the world remains rendered behind/around it

#### Scenario: Visitor closes an info panel
- **WHEN** the visitor dismisses an open info panel (close control, tap outside, or Escape key)
- **THEN** the panel closes and avatar control is restored immediately

### Requirement: All prior experience content is represented
The system SHALL surface every timeline entry from the previous portfolio — Software Engineer Intern at Itaú Unibanco (2024–Present, including the Jarvis/Itaú Portal work), PSPO I certification (2024), Software Engineer Intern at Agile Inc (2022–2024), and Bachelor's degree in Computer Science at FEI University Center (2022) — as discoverable career-content-discovery content, with no entry omitted.

#### Scenario: Visitor explores the experience room
- **WHEN** the visitor visits the room(s) presenting work/education history
- **THEN** each of the four timeline entries above is reachable through at least one point of interest, with its original title, company/institution, year(s), and description text preserved

### Requirement: Vault modernization story is integrated into relevant experience content
The system SHALL present the Itaú Vault login modernization story (migrating the front end to the company design system and moving hosting from EC2 to S3) as part of the Itaú Unibanco experience content, not as a separate dedicated room or capability.

#### Scenario: Visitor views the Itaú experience entry
- **WHEN** the visitor opens the info panel for the Itaú Unibanco experience point of interest
- **THEN** the panel includes the Vault modernization story as part of that entry's content

### Requirement: All six existing projects remain discoverable with working links
The system SHALL surface all six projects from the previous portfolio (PowerLifting Personal Records API, Scrum Day 2023 website, Link Reader, WorkAround, Itaú Jr. Back-end, Gastly Busters) as career-content-discovery content, each retaining its title, description, tags, and outbound link(s) (project link and GitHub link).

#### Scenario: Visitor explores the projects room
- **WHEN** the visitor visits the room presenting projects
- **THEN** each of the six projects is reachable through a point of interest, and its outbound links open in a new tab without breaking avatar control in the underlying world

### Requirement: Skills and certifications are discoverable
The system SHALL surface the skills categories (Back-end, Front-end, Agile Project Management, Cloud Computing, No-code) and the PSPO I certification (with its credential link) from the previous About section as discoverable career-content-discovery content.

#### Scenario: Visitor explores the skills room
- **WHEN** the visitor visits the room presenting skills
- **THEN** each skill category and its listed technologies/tools, and the PSPO I certification with its credential link, are reachable through points of interest

### Requirement: Contact information remains reachable
The system SHALL surface a way to reach the visitor's LinkedIn profile and email address (as previously shown in the Contact section) from within the world.

#### Scenario: Visitor looks for contact info
- **WHEN** the visitor reaches the contact point of interest (or the non-game fallback list)
- **THEN** the LinkedIn profile link and the email address/mailto link are both present and functional

### Requirement: Info panels are usable on mobile
The system SHALL size and lay out info panels so their full content is readable and their links/buttons are tappable on small mobile viewports, without requiring horizontal scrolling.

#### Scenario: Visitor opens a panel on a mobile viewport
- **WHEN** an info panel opens on a viewport narrower than 480px
- **THEN** all text is readable without zooming and all interactive elements meet a minimum comfortable tap-target size
