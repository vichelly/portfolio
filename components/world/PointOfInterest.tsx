"use client"

import { useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { Html } from "@react-three/drei"
import type { AvatarHandle } from "@/components/world/Avatar"

interface PointOfInterestProps {
  id: string
  position: [number, number, number]
  color: string
  label: string
  avatarRef: React.RefObject<AvatarHandle | null>
  onTrigger: (id: string) => void
  triggerRadius?: number
}

/**
 * A glowing floating marker. Approaching it (within triggerRadius) or
 * clicking/tapping it opens the associated career-content info panel.
 */
export default function PointOfInterest({
  id,
  position,
  color,
  label,
  avatarRef,
  onTrigger,
  triggerRadius = 2.4,
}: PointOfInterestProps) {
  const marker = useRef<THREE.Group>(null)
  const autoTriggered = useRef(false)
  const [near, setNear] = useState(false)

  useFrame((state) => {
    const m = marker.current
    if (m) {
      // local offset only - the parent <group position={position}> already
      // places us at the marker's base height, this just adds the bob/spin
      m.position.y = Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.15
      m.rotation.y += 0.01
    }

    const avatarGroup = avatarRef.current?.group
    if (!avatarGroup) return
    const dx = avatarGroup.position.x - position[0]
    const dz = avatarGroup.position.z - position[2]
    const dist = Math.hypot(dx, dz)
    const isNear = dist < triggerRadius
    setNear(isNear)

    if (isNear && !autoTriggered.current) {
      autoTriggered.current = true
      onTrigger(id)
    }
    if (!isNear) {
      autoTriggered.current = false
    }
  })

  return (
    <group position={position}>
      {/* small pedestal so the marker doesn't look like it's just floating in empty space */}
      <mesh position={[0, -1.3, 0]} receiveShadow>
        <cylinderGeometry args={[0.35, 0.42, 0.25, 8]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>

      <group
        ref={marker}
        onClick={(e) => {
          e.stopPropagation()
          onTrigger(id)
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          document.body.style.cursor = "pointer"
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto"
        }}
        scale={near ? 1.15 : 1}
      >
        <mesh castShadow>
          <octahedronGeometry args={[0.55, 0]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={near ? 1.3 : 0.65} flatShading />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 4]}>
          <torusGeometry args={[0.72, 0.05, 6, 16]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={near ? 1 : 0.4} flatShading />
        </mesh>
      </group>

      <pointLight color={color} intensity={near ? 3 : 1.2} distance={5} />
      <Html center distanceFactor={11} position={[0, 1.05, 0]} occlude={false}>
        <div
          className="pointer-events-none select-none whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold text-white shadow-lg transition-transform"
          style={{ background: color, transform: near ? "scale(1.08)" : "scale(1)" }}
        >
          {label}
        </div>
      </Html>
    </group>
  )
}
