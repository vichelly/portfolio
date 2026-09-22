"use client"

import { forwardRef, useImperativeHandle, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { useCharacterController, type MovementInput } from "@/components/world/useCharacterController"
import { PHYSICS } from "@/lib/world/physics"
import { POSE_KEYS, REST_POSE, blendRate, poseFor, type Pose } from "@/lib/world/pose"
import { TRAIL_START } from "@/lib/world/trail"

export interface AvatarHandle {
  group: THREE.Group | null
}

interface AvatarProps {
  input: MovementInput
}

/** Ultraman-inspired palette: brushed silver, hero red, a live colour timer. */
const SILVER = "#dde2ea"
const SILVER_DARK = "#b9c0cc"
const RED = "#e0374a"
const TIMER = "#5fe0ff"
const EYE = "#fff6c9"

// Segment lengths, in metres. They add up to PHYSICS.HEIGHT.
const FOOT_H = 0.12
const SHIN = 0.38
const THIGH = 0.42
const HIP_Y = FOOT_H + SHIN + THIGH
const SPINE = 0.4
const CHEST_Y = HIP_Y + SPINE
const HEAD_Y = CHEST_Y + 0.26
const SHOULDER_X = 0.26
const UPPER_ARM = 0.32
const FOREARM = 0.3

/**
 * The player character. The controller owns where the body is; this component
 * owns what the body looks like and what it is doing - a jointed humanoid whose
 * pose is eased toward whichever motion state the physics is actually in.
 */
const Avatar = forwardRef<AvatarHandle, AvatarProps>(({ input }, ref) => {
  const group = useRef<THREE.Group>(null)
  const spine = useRef<THREE.Group>(null)
  const head = useRef<THREE.Group>(null)
  const shoulderL = useRef<THREE.Group>(null)
  const shoulderR = useRef<THREE.Group>(null)
  const elbowL = useRef<THREE.Group>(null)
  const elbowR = useRef<THREE.Group>(null)
  const hipL = useRef<THREE.Group>(null)
  const hipR = useRef<THREE.Group>(null)
  const kneeL = useRef<THREE.Group>(null)
  const kneeR = useRef<THREE.Group>(null)
  const ankleL = useRef<THREE.Group>(null)
  const ankleR = useRef<THREE.Group>(null)
  const timer = useRef<THREE.MeshStandardMaterial>(null)

  const controller = useCharacterController(group, input)
  const phase = useRef(0)
  const current = useRef<Pose>({ ...REST_POSE })

  useImperativeHandle(ref, () => ({ group: group.current }), [])

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 1 / 20)
    const s = controller.current

    const speed = Math.hypot(s.velocity.x, s.velocity.z)
    const speedFraction = THREE.MathUtils.clamp(speed / PHYSICS.MAX_SPEED, 0, 1)

    // Cycle rate tracks speed, so a slow walk and a run read differently.
    phase.current += delta * (s.motion === "walk" ? 3.4 + speedFraction * 6.2 : 2)

    const target = poseFor(s.motion, phase.current, s.motion === "walk" ? speedFraction : 1)
    const blend = 1 - Math.exp(-blendRate(s.motion) * delta)
    for (const key of POSE_KEYS) {
      current.current[key] = THREE.MathUtils.lerp(current.current[key], target[key], blend)
    }
    const p = current.current

    if (spine.current) {
      spine.current.rotation.x = p.spineX
      spine.current.rotation.z = p.spineZ
      // Bob and landing crouch move the torso only - the feet stay planted,
      // which is cheaper and steadier than solving the legs for it.
      spine.current.position.y = HIP_Y + p.bodyY
    }
    if (head.current) head.current.rotation.x = p.headX
    if (shoulderL.current) {
      shoulderL.current.rotation.x = p.shoulderLX
      shoulderL.current.rotation.z = p.shoulderLZ
    }
    if (shoulderR.current) {
      shoulderR.current.rotation.x = p.shoulderRX
      shoulderR.current.rotation.z = p.shoulderRZ
    }
    if (elbowL.current) elbowL.current.rotation.x = p.elbowL
    if (elbowR.current) elbowR.current.rotation.x = p.elbowR
    if (hipL.current) hipL.current.rotation.x = p.hipLX
    if (hipR.current) hipR.current.rotation.x = p.hipRX
    if (kneeL.current) kneeL.current.rotation.x = p.kneeL
    if (kneeR.current) kneeR.current.rotation.x = p.kneeR
    if (ankleL.current) ankleL.current.rotation.x = p.ankleL
    if (ankleR.current) ankleR.current.rotation.x = p.ankleR

    // The colour timer beats faster while airborne - a small, alive detail.
    if (timer.current) {
      const rate = s.grounded ? 2.2 : 6
      timer.current.emissiveIntensity = 1.1 + Math.sin(state.clock.elapsedTime * rate) * 0.55
    }
  })

  const limbMaterial = (color: string) => (
    <meshStandardMaterial color={color} flatShading metalness={0.15} roughness={0.55} />
  )

  const arm = (
    side: -1 | 1,
    shoulder: React.RefObject<THREE.Group | null>,
    elbow: React.RefObject<THREE.Group | null>,
  ) => (
    <group ref={shoulder} position={[SHOULDER_X * side, CHEST_Y - 0.04, 0]}>
      {/* upper arm */}
      <mesh position={[0, -UPPER_ARM / 2, 0]} castShadow>
        <capsuleGeometry args={[0.078, UPPER_ARM - 0.07, 4, 8]} />
        {limbMaterial(SILVER)}
      </mesh>
      {/* shoulder cap in hero red */}
      <mesh position={[0.01 * side, 0.02, 0]} castShadow>
        <sphereGeometry args={[0.105, 10, 8]} />
        {limbMaterial(RED)}
      </mesh>

      <group ref={elbow} position={[0, -UPPER_ARM, 0]}>
        <mesh position={[0, -FOREARM / 2, 0]} castShadow>
          <capsuleGeometry args={[0.068, FOREARM - 0.06, 4, 8]} />
          {limbMaterial(SILVER)}
        </mesh>
        {/* hand: small, but it is most of what makes the silhouette human */}
        <mesh position={[0, -FOREARM - 0.06, 0.01]} castShadow>
          <boxGeometry args={[0.13, 0.17, 0.095]} />
          {limbMaterial(RED)}
        </mesh>
      </group>
    </group>
  )

  const leg = (
    side: -1 | 1,
    hip: React.RefObject<THREE.Group | null>,
    knee: React.RefObject<THREE.Group | null>,
    ankle: React.RefObject<THREE.Group | null>,
  ) => (
    <group ref={hip} position={[0.15 * side, HIP_Y, 0]}>
      <mesh position={[0, -THIGH / 2, 0]} castShadow>
        <capsuleGeometry args={[0.105, THIGH - 0.09, 4, 8]} />
        {limbMaterial(SILVER)}
      </mesh>
      {/* thigh stripe */}
      <mesh position={[0.075 * side, -THIGH / 2, 0]}>
        <boxGeometry args={[0.055, THIGH * 0.66, 0.1]} />
        {limbMaterial(RED)}
      </mesh>

      <group ref={knee} position={[0, -THIGH, 0]}>
        <mesh position={[0, -SHIN / 2, 0]} castShadow>
          <capsuleGeometry args={[0.088, SHIN - 0.08, 4, 8]} />
          {limbMaterial(RED)}
        </mesh>

        <group ref={ankle} position={[0, -SHIN, 0]}>
          <mesh position={[0, -FOOT_H / 2, 0.08]} castShadow>
            <boxGeometry args={[0.17, FOOT_H, 0.36]} />
            {limbMaterial(RED)}
          </mesh>
        </group>
      </group>
    </group>
  )

  return (
    <group ref={group} position={[TRAIL_START.x, 0, TRAIL_START.z]}>
      <group>
        {/* ---- lower body: hips, then the legs hanging off them ---- */}
        <mesh position={[0, HIP_Y - 0.06, 0]} castShadow>
          <capsuleGeometry args={[0.19, 0.14, 4, 10]} />
          {limbMaterial(SILVER)}
        </mesh>
        {leg(-1, hipL, kneeL, ankleL)}
        {leg(1, hipR, kneeR, ankleR)}

        {/* ---- upper body, pivoting at the waist ---- */}
        <group ref={spine} position={[0, HIP_Y, 0]}>
          <group position={[0, -HIP_Y, 0]}>
            {/* torso, tapering out to the shoulders */}
            <mesh position={[0, HIP_Y + SPINE * 0.5, 0]} castShadow>
              <capsuleGeometry args={[0.235, SPINE * 0.62, 4, 12]} />
              {limbMaterial(SILVER)}
            </mesh>
            {/* chest plate */}
            <mesh position={[0, CHEST_Y - 0.07, 0.11]} castShadow>
              <boxGeometry args={[0.42, 0.3, 0.16]} />
              {limbMaterial(RED)}
            </mesh>
            {/* colour timer */}
            <mesh position={[0, CHEST_Y - 0.02, 0.21]}>
              <cylinderGeometry args={[0.072, 0.072, 0.05, 12]} />
              <meshStandardMaterial
                ref={timer}
                color={TIMER}
                emissive={TIMER}
                emissiveIntensity={1.2}
                flatShading
              />
            </mesh>
            {/* waist band */}
            <mesh position={[0, HIP_Y + 0.08, 0]}>
              <cylinderGeometry args={[0.212, 0.212, 0.09, 12]} />
              {limbMaterial(SILVER_DARK)}
            </mesh>

            {arm(-1, shoulderL, elbowL)}
            {arm(1, shoulderR, elbowR)}

            {/* ---- neck and head ---- */}
            <mesh position={[0, CHEST_Y + 0.08, 0]} castShadow>
              <cylinderGeometry args={[0.075, 0.09, 0.14, 8]} />
              {limbMaterial(SILVER_DARK)}
            </mesh>
            <group ref={head} position={[0, CHEST_Y + 0.15, 0]}>
              <mesh position={[0, 0.11, 0]} castShadow>
                <sphereGeometry args={[0.165, 14, 12]} />
                {limbMaterial(SILVER)}
              </mesh>
              {/* jaw, giving the head a front */}
              <mesh position={[0, 0.06, 0.06]} castShadow>
                <boxGeometry args={[0.17, 0.13, 0.15]} />
                {limbMaterial(SILVER)}
              </mesh>
              {/* crest running front to back over the skull */}
              <mesh position={[0, 0.2, -0.01]} rotation={[0.1, 0, 0]} castShadow>
                <boxGeometry args={[0.055, 0.1, 0.34]} />
                {limbMaterial(RED)}
              </mesh>
              {/* slanted eyes */}
              {[-1, 1].map((side) => (
                <mesh
                  key={side}
                  position={[0.072 * side, 0.125, 0.125]}
                  rotation={[0, 0, 0.42 * side]}
                >
                  <capsuleGeometry args={[0.028, 0.07, 3, 6]} />
                  <meshStandardMaterial color={EYE} emissive={EYE} emissiveIntensity={0.9} flatShading />
                </mesh>
              ))}
            </group>
          </group>
        </group>
      </group>
    </group>
  )
})

Avatar.displayName = "Avatar"

export default Avatar
