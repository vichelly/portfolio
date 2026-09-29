## REMOVED Requirements

### Requirement: Parkour is an optional detour off the trail
**Reason**: The parkour detour is removed from the world. It was the sole reason the world maintained two independent containment curves, and that duality was the direct source of the camera and control defects the visitor reported: trail arc-length stops advancing on entry, so the camera can no longer derive a heading, and the arena's containment radius reaches into neighbouring plazas and mislabels them. The detour carried no career content, so removing it costs the portfolio nothing.
**Migration**: None for visitors — the detour was optional and gated nothing. The play value it provided moves onto the main trail as simple, always-bypassable obstacles, covered by the `avatar-control` capability's "Trail obstacles are jumpable and bypassable" requirement.

### Requirement: Parkour never gates career content
**Reason**: There is no parkour course left to gate anything. The guarantee this requirement made is now unconditional: nothing anywhere in the world gates career content.
**Migration**: None. The equivalent guarantee for the new trail obstacles is carried by `avatar-control`'s "Trail obstacles are jumpable and bypassable" requirement, which requires every obstacle to be passable on foot without jumping.

### Requirement: Jump behaves consistently inside and outside parkour
**Reason**: With one continuous trail and one containment path, there is no longer an "inside" and an "outside" for jump behaviour to differ between. The remaining guarantee — that jump works identically everywhere — is already stated by `avatar-control`'s "Jump is available everywhere in the world" requirement.
**Migration**: None.

### Requirement: Course exit is always available
**Reason**: There is no course to exit.
**Migration**: None.

### Requirement: Parkour course loads on demand
**Reason**: The course and its code are deleted, so there is nothing left to load on demand. Removing it makes the bundle strictly smaller than the on-demand arrangement it replaces.
**Migration**: None.

### Requirement: Course obstacles are solid
**Reason**: The course's platforms, moving platform, and finish area are deleted. Solidity for the world's remaining collidable objects is now required by `avatar-control`'s "Trail obstacles are jumpable and bypassable" requirement.
**Migration**: None. The underlying collision behaviour is unchanged and is reused by the new trail obstacles.
