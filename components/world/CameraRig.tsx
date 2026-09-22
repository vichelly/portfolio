"use client"

import { useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import type { AvatarHandle } from "@/components/world/Avatar"

interface CameraRigProps {
  target: React.RefObject<AvatarHandle | null>
}

const OFFSET = new THREE.Vector3(0, 9, 11)

export default function CameraRig({ target }: CameraRigProps) {
  const { camera } = useThree()
  const desired = useRef(new THREE.Vector3())
  const lookAt = useRef(new THREE.Vector3())

  useFrame((_, delta) => {
    const avatarGroup = target.current?.group
    if (!avatarGroup) return

    desired.current.copy(avatarGroup.position).add(OFFSET)
    camera.position.lerp(desired.current, 1 - Math.pow(0.001, delta))

    lookAt.current.lerp(avatarGroup.position, 1 - Math.pow(0.0005, delta))
    camera.lookAt(lookAt.current.x, lookAt.current.y + 1, lookAt.current.z)
  })

  return null
}
