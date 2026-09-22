"use client"

import { useMemo, useRef } from "react"
import * as THREE from "three"
import { useFrame } from "@react-three/fiber"
import { PALETTE, SUN_DIRECTION } from "@/lib/world/theme"

/**
 * The sky is a back-side sphere carrying a four-stop vertical gradient and the
 * sun disc. The disc is placed from the same vector the directional light uses,
 * so the sun you can see and the direction the shadows run can never disagree.
 */
export default function Sky() {
  const mesh = useRef<THREE.Mesh>(null)

  // The dome rides with the camera. It has to sit inside the far plane to
  // avoid being clipped into a polygon, and riding along means the visitor can
  // never walk far enough to reach its edge.
  useFrame((state) => {
    if (mesh.current) mesh.current.position.copy(state.camera.position)
  })

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      // The sky is background: never fogged, never lit.
      fog: false,
      uniforms: {
        uHaze: { value: new THREE.Color(PALETTE.skyHaze) },
        uWarm: { value: new THREE.Color(PALETTE.skyWarm) },
        uMid: { value: new THREE.Color(PALETTE.skyMid) },
        uZenith: { value: new THREE.Color(PALETTE.skyZenith) },
        uSunColor: { value: new THREE.Color(PALETTE.sunDisc) },
        uSunGlow: { value: new THREE.Color(PALETTE.sun) },
        uSunDirection: { value: SUN_DIRECTION.clone().normalize() },
      },
      vertexShader: /* glsl */ `
        varying vec3 vDirection;
        void main() {
          vDirection = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uHaze;
        uniform vec3 uWarm;
        uniform vec3 uMid;
        uniform vec3 uZenith;
        uniform vec3 uSunColor;
        uniform vec3 uSunGlow;
        uniform vec3 uSunDirection;
        varying vec3 vDirection;

        void main() {
          vec3 dir = normalize(vDirection);
          float h = clamp(dir.y, -1.0, 1.0);

          // Four stops: haze at the horizon, warm just above it, then the
          // cool body of the sky, then the deep zenith.
          vec3 sky = mix(uHaze, uWarm, smoothstep(-0.05, 0.10, h));
          sky = mix(sky, uMid, smoothstep(0.06, 0.34, h));
          sky = mix(sky, uZenith, smoothstep(0.30, 0.85, h));

          // Below the horizon the sky keeps the haze value, so terrain edges
          // sit against a matching tone instead of a hard seam.
          sky = mix(uHaze, sky, smoothstep(-0.18, -0.02, h));

          float toSun = dot(dir, normalize(uSunDirection));
          // A broad halo, then the disc itself.
          sky += uSunGlow * pow(max(toSun, 0.0), 220.0) * 0.55;
          sky += uSunGlow * pow(max(toSun, 0.0), 12.0) * 0.16;
          sky = mix(sky, uSunColor, smoothstep(0.9993, 0.99975, toSun));

          gl_FragColor = vec4(sky, 1.0);
          #include <colorspace_fragment>
        }
      `,
    })
  }, [])

  return (
    <mesh ref={mesh} material={material} renderOrder={-1000} frustumCulled={false}>
      {/* Enough segments that the sun's falloff is smooth rather than faceted. */}
      <sphereGeometry args={[220, 64, 48]} />
    </mesh>
  )
}
