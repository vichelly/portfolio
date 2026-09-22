"use client"

import { Suspense, useCallback, useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { Canvas } from "@react-three/fiber"
import { ContactShadows } from "@react-three/drei"
import Avatar, { type AvatarHandle } from "@/components/world/Avatar"
import CameraRig from "@/components/world/CameraRig"
import Hub from "@/components/world/Hub"
import ZoneFloor from "@/components/world/ZoneFloor"
import RoomSign from "@/components/world/RoomSign"
import Decor from "@/components/world/Decor"
import ExperienceRoom from "@/components/world/rooms/ExperienceRoom"
import SkillsRoom from "@/components/world/rooms/SkillsRoom"
import CertificationsRoom from "@/components/world/rooms/CertificationsRoom"
import ProjectsRoom from "@/components/world/rooms/ProjectsRoom"
import WorldUI from "@/components/world/WorldUI"
import { useMovementInput } from "@/lib/input/useMovementInput"
import { useInputModeDetection } from "@/lib/input/useInputModeDetection"
import { useWorldStore, type RoomId } from "@/lib/world-store"
import { WORLD_BOUNDS_RADIUS, ZONES, activeZoneAt, distanceToZone, zoneFor } from "@/lib/world/layout"

const SKY_COLOR = "#a9d9f0"

const ParkourZone = dynamic(() => import("@/components/world/parkour/ParkourZone"), {
  ssr: false,
  loading: () => null,
})

export default function World() {
  const avatarRef = useRef<AvatarHandle>(null)
  const { vector, setTouchVector, setTouchJump } = useMovementInput()
  useInputModeDetection()

  const setActiveRoom = useWorldStore((s) => s.setActiveRoom)
  const openPanel = useWorldStore((s) => s.openPanel)

  const lastZone = useRef<RoomId>("hub")
  const [nearbyRooms, setNearbyRooms] = useState<Set<RoomId>>(new Set())
  const [parkourActive, setParkourActive] = useState(false)

  const handleMove = useCallback(
    (x: number, z: number) => {
      const zone = activeZoneAt(x, z)
      if (zone !== lastZone.current) {
        lastZone.current = zone
        setActiveRoom(zone)
      }

      const next = new Set<RoomId>()
      for (const z_ of ZONES) {
        if (z_.id === "hub") continue
        if (distanceToZone(x, z, z_) <= z_.activationRadius) next.add(z_.id)
      }
      setNearbyRooms((prev) => {
        if (prev.size === next.size && [...prev].every((r) => next.has(r))) return prev
        return next
      })

      // Uses the same containment radius as activeZoneAt(), so physics takes
      // over avatar position exactly when activeRoom becomes "parkour" -
      // never earlier, avoiding a fight over position with Avatar's own
      // ground-movement useFrame.
      const inParkour = distanceToZone(x, z, zoneFor("parkour")) <= zoneFor("parkour").radius
      setParkourActive((prev) => (prev === inParkour ? prev : inParkour))
    },
    [setActiveRoom],
  )

  const handleTrigger = useCallback(
    (id: string) => {
      openPanel(id)
    },
    [openPanel],
  )

  useEffect(() => {
    // Ensure the store reflects "hub" at mount even before the first move event.
    setActiveRoom("hub")
  }, [setActiveRoom])

  return (
    <div className="fixed inset-0 h-dvh w-dvw overflow-hidden" style={{ background: SKY_COLOR }}>
      <Canvas shadows dpr={[1, 2]} camera={{ fov: 55, near: 0.1, far: 200 }}>
        <color attach="background" args={[SKY_COLOR]} />
        <fog attach="fog" args={[SKY_COLOR, 35, 130]} />

        <hemisphereLight args={["#cfe9ff", "#8a6b3d", 0.65]} />
        <ambientLight intensity={0.35} />
        <directionalLight
          position={[18, 24, 12]}
          intensity={1.4}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-60}
          shadow-camera-right={60}
          shadow-camera-top={60}
          shadow-camera-bottom={-60}
          shadow-bias={-0.0015}
        />

        <Avatar ref={avatarRef} movementVector={vector} onMove={handleMove} />
        <ContactShadows position={[0, 0.02, 0]} opacity={0.35} scale={140} blur={2} far={20} />
        <CameraRig target={avatarRef} />

        <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[WORLD_BOUNDS_RADIUS + 15, 48]} />
          <meshStandardMaterial color="#6fae4f" flatShading />
        </mesh>

        <Decor />

        <Hub avatarRef={avatarRef} onTrigger={handleTrigger} />
        <ZoneFloor zone={zoneFor("parkour")} />
        <RoomSign zone={zoneFor("parkour")} height={5} />

        {nearbyRooms.has("experience") && <ExperienceRoom avatarRef={avatarRef} onTrigger={handleTrigger} />}
        {nearbyRooms.has("skills") && <SkillsRoom avatarRef={avatarRef} onTrigger={handleTrigger} />}
        {nearbyRooms.has("certifications") && (
          <CertificationsRoom avatarRef={avatarRef} onTrigger={handleTrigger} />
        )}
        {nearbyRooms.has("projects") && <ProjectsRoom avatarRef={avatarRef} onTrigger={handleTrigger} />}

        {nearbyRooms.has("parkour") && (
          <Suspense fallback={null}>
            <ParkourZone avatarRef={avatarRef} movementVector={vector} active={parkourActive} onMove={handleMove} />
          </Suspense>
        )}
      </Canvas>

      <WorldUI setTouchVector={setTouchVector} setTouchJump={setTouchJump} />
    </div>
  )
}
