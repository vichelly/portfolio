"use client"

import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { avatarState } from "@/lib/world/avatarState"
import { tickSurfaces } from "@/lib/world/surface"
import { PALETTE } from "@/lib/world/theme"

interface DustProps {
  /** Ambient mote count, from the quality tier. 0 disables the motes. */
  count: number
}

/** The box of air, centred on the avatar, that motes drift inside. */
const FIELD = new THREE.Vector3(34, 9, 34)
const FOOT_PARTICLES = 24
const FOOT_LIFETIME = 0.65
/** Where spent particles wait, well below anything the camera frames. */
const PARKED_Y = -999

/**
 * Two systems sharing one frame callback: motes drifting in the sunlight, and
 * dust kicked up at the avatar's feet. Both are plain `Points`, and both
 * recycle a fixed pool rather than allocating.
 */
export default function Dust({ count }: DustProps) {
  const motes = useRef<THREE.Points>(null)
  const foot = useRef<THREE.Points>(null)

  const moteState = useMemo(() => {
    const positions = new Float32Array(Math.max(count, 1) * 3)
    const drift = new Float32Array(Math.max(count, 1) * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * FIELD.x
      positions[i * 3 + 1] = Math.random() * FIELD.y
      positions[i * 3 + 2] = (Math.random() - 0.5) * FIELD.z
      drift[i * 3] = 0.12 + Math.random() * 0.22
      drift[i * 3 + 1] = (Math.random() - 0.35) * 0.1
      drift[i * 3 + 2] = (Math.random() - 0.5) * 0.14
    }
    return { positions, drift }
  }, [count])

  const footState = useMemo(() => {
    const positions = new Float32Array(FOOT_PARTICLES * 3)
    const velocity = new Float32Array(FOOT_PARTICLES * 3)
    const life = new Float32Array(FOOT_PARTICLES)
    // Park the whole pool below the world up front. Left at the origin, every
    // particle not yet used would appear as a tuft of dust at the trail's
    // start the moment the first one spawned.
    for (let i = 0; i < FOOT_PARTICLES; i++) positions[i * 3 + 1] = PARKED_Y
    return { positions, velocity, life, next: 0, sinceStep: 0, wasGrounded: true }
  }, [])

  const moteGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute("position", new THREE.BufferAttribute(moteState.positions, 3))
    return g
  }, [moteState])

  const footGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute("position", new THREE.BufferAttribute(footState.positions, 3))
    return g
  }, [footState])

  const spawnFoot = (strength: number, spread: number) => {
    const s = footState
    const bursts = Math.round(3 + strength * 5)
    for (let n = 0; n < bursts; n++) {
      const i = s.next
      s.next = (s.next + 1) % FOOT_PARTICLES
      const angle = Math.random() * Math.PI * 2
      s.positions[i * 3] = avatarState.x + Math.cos(angle) * 0.18
      s.positions[i * 3 + 1] = avatarState.y + 0.06
      s.positions[i * 3 + 2] = avatarState.z + Math.sin(angle) * 0.18
      s.velocity[i * 3] = Math.cos(angle) * spread * (0.5 + Math.random())
      s.velocity[i * 3 + 1] = 0.5 + Math.random() * strength
      s.velocity[i * 3 + 2] = Math.sin(angle) * spread * (0.5 + Math.random())
      s.life[i] = FOOT_LIFETIME
    }
  }

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 1 / 20)
    tickSurfaces(state.clock.elapsedTime)

    // --- ambient motes ------------------------------------------------
    if (count > 0 && motes.current) {
      const { positions, drift } = moteState
      for (let i = 0; i < count; i++) {
        positions[i * 3] += drift[i * 3] * delta
        positions[i * 3 + 1] += drift[i * 3 + 1] * delta
        positions[i * 3 + 2] += drift[i * 3 + 2] * delta
        // Wrap inside the field so the cloud travels with the visitor.
        if (positions[i * 3] > FIELD.x / 2) positions[i * 3] = -FIELD.x / 2
        if (positions[i * 3 + 1] > FIELD.y) positions[i * 3 + 1] = 0
        if (positions[i * 3 + 1] < 0) positions[i * 3 + 1] = FIELD.y
        if (positions[i * 3 + 2] > FIELD.z / 2) positions[i * 3 + 2] = -FIELD.z / 2
        if (positions[i * 3 + 2] < -FIELD.z / 2) positions[i * 3 + 2] = FIELD.z / 2
      }
      moteGeometry.attributes.position.needsUpdate = true
      motes.current.position.set(avatarState.x, avatarState.y, avatarState.z)
    }

    // --- foot dust ----------------------------------------------------
    const s = footState
    const landed = avatarState.grounded && !s.wasGrounded
    s.wasGrounded = avatarState.grounded
    if (landed) spawnFoot(1.4, 1.5)

    if (avatarState.grounded && avatarState.speed > 1.2) {
      s.sinceStep += delta * avatarState.speed
      if (s.sinceStep > 2.4) {
        s.sinceStep = 0
        spawnFoot(0.35, 0.5)
      }
    } else {
      s.sinceStep = 0
    }

    let alive = false
    for (let i = 0; i < FOOT_PARTICLES; i++) {
      if (s.life[i] <= 0) continue
      alive = true
      s.life[i] -= delta
      s.velocity[i * 3 + 1] -= 2.4 * delta
      s.positions[i * 3] += s.velocity[i * 3] * delta
      s.positions[i * 3 + 1] += s.velocity[i * 3 + 1] * delta
      s.positions[i * 3 + 2] += s.velocity[i * 3 + 2] * delta
      if (s.life[i] <= 0) s.positions[i * 3 + 1] = PARKED_Y
    }
    if (foot.current) foot.current.visible = alive
    footGeometry.attributes.position.needsUpdate = true
  })

  return (
    <group>
      {count > 0 && (
        <points ref={motes} geometry={moteGeometry} frustumCulled={false}>
          <pointsMaterial
            color={PALETTE.sun}
            size={0.06}
            sizeAttenuation
            transparent
            opacity={0.55}
            depthWrite={false}
          />
        </points>
      )}

      <points ref={foot} geometry={footGeometry} frustumCulled={false}>
        <pointsMaterial
          color={PALETTE.trail}
          size={0.13}
          sizeAttenuation
          transparent
          opacity={0.7}
          depthWrite={false}
        />
      </points>
    </group>
  )
}
