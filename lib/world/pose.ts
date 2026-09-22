import type { MotionState } from "@/components/world/useCharacterController"

/** Every joint the rig can pose. Values are rotations in radians. */
export interface Pose {
  spineX: number
  spineZ: number
  headX: number
  shoulderLX: number
  shoulderLZ: number
  shoulderRX: number
  shoulderRZ: number
  elbowL: number
  elbowR: number
  hipLX: number
  hipRX: number
  kneeL: number
  kneeR: number
  ankleL: number
  ankleR: number
  /** Vertical offset of the whole body, for bob and crouch. */
  bodyY: number
}

const ZERO: Pose = {
  spineX: 0,
  spineZ: 0,
  headX: 0,
  shoulderLX: 0,
  shoulderLZ: 0,
  shoulderRX: 0,
  shoulderRZ: 0,
  elbowL: 0,
  elbowR: 0,
  hipLX: 0,
  hipRX: 0,
  kneeL: 0,
  kneeR: 0,
  ankleL: 0,
  ankleR: 0,
  bodyY: 0,
}

/**
 * Target pose for a motion state. Each state writes a complete pose, and the
 * rig eases toward whichever one is active - so animation can never disagree
 * with what the physics body is actually doing, and transitions blend instead
 * of snapping.
 *
 * `phase` is the walk cycle clock; `amount` is how strongly the state applies
 * (walk uses it for speed, so a slow walk is a smaller stride).
 */
export function poseFor(state: MotionState, phase: number, amount: number): Pose {
  switch (state) {
    case "walk": {
      const swing = Math.sin(phase)
      const counter = Math.sin(phase + Math.PI)
      return {
        ...ZERO,
        spineX: 0.1 * amount,
        spineZ: Math.sin(phase) * 0.05 * amount,
        headX: -0.06 * amount,
        shoulderLX: counter * 0.62 * amount,
        shoulderRX: swing * 0.62 * amount,
        shoulderLZ: 0.16,
        shoulderRZ: -0.16,
        // Elbows bend on the forward swing only - straight arms read as a doll.
        elbowL: -Math.max(0, counter) * 0.5 * amount - 0.12,
        elbowR: -Math.max(0, swing) * 0.5 * amount - 0.12,
        hipLX: swing * 0.66 * amount,
        hipRX: counter * 0.66 * amount,
        kneeL: Math.max(0, -swing) * 0.85 * amount,
        kneeR: Math.max(0, -counter) * 0.85 * amount,
        ankleL: swing * 0.2 * amount,
        ankleR: counter * 0.2 * amount,
        bodyY: Math.abs(Math.sin(phase * 2)) * 0.07 * amount,
      }
    }

    case "jump":
      return {
        ...ZERO,
        spineX: -0.12,
        headX: 0.1,
        // Arms swept up and back, legs gathering under the body.
        shoulderLX: -2.1,
        shoulderRX: -2.1,
        shoulderLZ: 0.3,
        shoulderRZ: -0.3,
        elbowL: -0.35,
        elbowR: -0.35,
        hipLX: -0.55,
        hipRX: -0.2,
        kneeL: 1.0,
        kneeR: 0.45,
        ankleL: -0.25,
        ankleR: -0.15,
        bodyY: 0.05,
      }

    case "fall":
      return {
        ...ZERO,
        spineX: 0.14,
        headX: -0.12,
        // Arms out for balance - clearly not the jump pose, clearly not idle.
        shoulderLX: -0.5,
        shoulderRX: -0.5,
        shoulderLZ: 1.05,
        shoulderRZ: -1.05,
        elbowL: -0.5,
        elbowR: -0.5,
        hipLX: 0.3,
        hipRX: -0.28,
        kneeL: 0.5,
        kneeR: 0.3,
        bodyY: 0,
      }

    case "land":
      return {
        ...ZERO,
        spineX: 0.3,
        headX: -0.2,
        shoulderLX: -0.75,
        shoulderRX: -0.75,
        shoulderLZ: 0.42,
        shoulderRZ: -0.42,
        elbowL: -0.9,
        elbowR: -0.9,
        hipLX: 0.52,
        hipRX: 0.52,
        kneeL: 0.95,
        kneeR: 0.95,
        ankleL: -0.3,
        ankleR: -0.3,
        // The crouch itself: the whole body drops on impact.
        bodyY: -0.26,
      }

    case "idle":
    default: {
      const breath = Math.sin(phase * 0.55)
      return {
        ...ZERO,
        spineX: 0.02 + breath * 0.012,
        headX: breath * 0.03,
        shoulderLX: 0.05,
        shoulderRX: 0.05,
        shoulderLZ: 0.13,
        shoulderRZ: -0.13,
        elbowL: -0.2,
        elbowR: -0.2,
        bodyY: breath * 0.018,
      }
    }
  }
}

/** Blend rate per state - a landing snaps, a walk eases. */
export function blendRate(state: MotionState): number {
  switch (state) {
    case "land":
      return 22
    case "jump":
      return 16
    case "fall":
      return 9
    default:
      return 11
  }
}

export const POSE_KEYS = Object.keys(ZERO) as (keyof Pose)[]
export const REST_POSE = ZERO
