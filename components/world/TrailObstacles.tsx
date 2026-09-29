"use client"

import { useEffect } from "react"
import DistanceFade from "@/components/world/DistanceFade"
import type { Obstacle } from "@/lib/world/obstacles"
import { registerSolids, unregisterSolids } from "@/lib/world/solids"
import { PALETTE } from "@/lib/world/theme"

const KEY = "trail-obstacles"

/**
 * The things to jump between plazas. Geometry and collision both come from
 * `lib/world/obstacles.ts`, so the box the visitor sees and the box they land
 * on are the same declaration - there is no second set of numbers to drift.
 *
 * Only the obstacles passed in contribute solids. The caller windows them by
 * distance for the same reason it windows stations: the character controller
 * walks the whole solid list every frame, and there is no point testing the
 * avatar against a block a hundred units behind it.
 */
export default function TrailObstacles({ obstacles }: { obstacles: Obstacle[] }) {
  useEffect(() => {
    registerSolids(
      KEY,
      obstacles.flatMap((o) => o.pads.map((p) => p.solid)),
    )
    return () => unregisterSolids(KEY)
  }, [obstacles])

  return (
    <group>
      {obstacles.flatMap((obstacle) =>
        obstacle.pads.map((pad) => (
          // Positioned and turned to the trail here, so the box's own axes are
          // "across" and "along" and the geometry below needs no world maths.
          <DistanceFade key={pad.id} t={obstacle.t}>
            <group
              position={[pad.position[0], 0, pad.position[2]]}
              rotation={[0, pad.rotationY, 0]}
            >
              {/* Dark body against the pale trail. The first pass had this the
                  other way round - stone on sand - and the obstacles were very
                  nearly invisible from walking distance, which is no good for
                  something the visitor is meant to see coming and jump. Both
                  colours are the same pair the pylons and plinths already use,
                  so the contrast comes from ordering them, not from new hues. */}
              <mesh position={[0, pad.top - pad.size[1] / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={pad.size} />
                <meshStandardMaterial color={PALETTE.stoneDark} flatShading roughness={0.95} />
              </mesh>
              {/* A lighter cap catching the low sun: it reads as a surface to
                  land on rather than the top of an undifferentiated slab, and
                  costs one box rather than a separate material pass. */}
              <mesh position={[0, pad.top - 0.06, 0]} castShadow>
                <boxGeometry args={[pad.size[0] * 1.06, 0.12, pad.size[2] * 1.06]} />
                <meshStandardMaterial color={PALETTE.stone} flatShading roughness={0.85} />
              </mesh>
            </group>
          </DistanceFade>
        )),
      )}
    </group>
  )
}
