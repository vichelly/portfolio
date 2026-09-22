import * as THREE from "three"

/**
 * Shared GLSL for procedural surface detail.
 *
 * Every surface samples noise from its WORLD position, never from UVs. That is
 * the whole reason no tiling can appear: there is no tile. A rock, the trail
 * ribbon and the terrain all read from one continuous field, so they agree
 * where they meet.
 */
const NOISE_CHUNK = /* glsl */ `
  float surfHash(vec3 p) {
    p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float surfNoise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(surfHash(i + vec3(0,0,0)), surfHash(i + vec3(1,0,0)), f.x),
          mix(surfHash(i + vec3(0,1,0)), surfHash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(surfHash(i + vec3(0,0,1)), surfHash(i + vec3(1,0,1)), f.x),
          mix(surfHash(i + vec3(0,1,1)), surfHash(i + vec3(1,1,1)), f.x), f.y),
      f.z);
  }

  float surfFbm(vec3 p) {
    float sum = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 4; i++) {
      sum += surfNoise(p) * amp;
      p *= 2.02;
      amp *= 0.5;
    }
    return sum;
  }

  /** Horizontal strata, for stone. */
  float surfBands(float y, float scale) {
    float b = sin(y * scale + surfFbm(vec3(0.0, y * scale * 0.35, 0.0)) * 2.4);
    return b * 0.5 + 0.5;
  }
`

/** Every shader that swayed, so one tick can drive them all. */
const swayingShaders: { uniforms: Record<string, { value: number }> }[] = []

/** Called once per frame with the scene clock. */
export function tickSurfaces(elapsed: number) {
  for (const shader of swayingShaders) {
    if (shader.uniforms.uTime) shader.uniforms.uTime.value = elapsed
  }
}

export interface SurfaceOptions {
  /** World-space size of the fine grain, in units. Smaller = finer. */
  grainScale?: number
  /** How strongly the grain darkens and lightens the base colour. */
  grainStrength?: number
  /** World-space size of the slow tonal drift across large areas. */
  driftScale?: number
  driftStrength?: number
  /** Colour the drift leans toward. */
  tint?: THREE.Color
  /** Horizontal strata, for stone. 0 disables. */
  bandScale?: number
  bandStrength?: number
  /** Darkens faces by how far their normal tips from vertical. */
  slopeShade?: number
  /**
   * Wind sway, in units of horizontal travel at the top of the object. Phase
   * comes from world position, so no two props move together.
   */
  sway?: number
  /** Height above the object's origin at which sway reaches full strength. */
  swayHeight?: number
}

/**
 * Patches a MeshStandardMaterial to carry procedural detail.
 *
 * Patching rather than replacing is the point: lights, shadows, fog and tone
 * mapping all keep working, where a bare ShaderMaterial would forfeit them and
 * have to reimplement each one.
 */
export function makeSurface(
  base: THREE.MeshStandardMaterialParameters,
  options: SurfaceOptions = {},
): THREE.MeshStandardMaterial {
  const {
    grainScale = 2,
    grainStrength = 0.12,
    driftScale = 30,
    driftStrength = 0.1,
    tint = new THREE.Color("#ffffff"),
    bandScale = 0,
    bandStrength = 0,
    slopeShade = 0,
    sway = 0,
    swayHeight = 3,
  } = options

  const material = new THREE.MeshStandardMaterial(base)

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = { value: 0 }
    shader.uniforms.uSway = { value: sway }
    shader.uniforms.uSwayHeight = { value: swayHeight }
    // One clock for every swaying material in the world.
    swayingShaders.push(shader)
    shader.uniforms.uGrainScale = { value: grainScale }
    shader.uniforms.uGrainStrength = { value: grainStrength }
    shader.uniforms.uDriftScale = { value: driftScale }
    shader.uniforms.uDriftStrength = { value: driftStrength }
    shader.uniforms.uTint = { value: tint }
    shader.uniforms.uBandScale = { value: bandScale }
    shader.uniforms.uBandStrength = { value: bandStrength }
    shader.uniforms.uSlopeShade = { value: slopeShade }

    // Carry the world position through to the fragment stage.
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
         varying vec3 vSurfWorld;
         uniform float uTime;
         uniform float uSway;
         uniform float uSwayHeight;`,
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
         if (uSway > 0.0) {
           vec3 origin = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
           // Phase from world position: neighbouring props never move in step.
           float phase = origin.x * 0.7 + origin.z * 0.55;
           float amount = clamp(transformed.y / uSwayHeight, 0.0, 1.0);
           amount *= amount;
           transformed.x += sin(uTime * 1.35 + phase) * uSway * amount;
           transformed.z += cos(uTime * 1.05 + phase * 1.3) * uSway * 0.6 * amount;
         }`,
      )
      .replace(
        "#include <worldpos_vertex>",
        `#include <worldpos_vertex>
         vSurfWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;`,
      )

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
         varying vec3 vSurfWorld;
         uniform float uGrainScale;
         uniform float uGrainStrength;
         uniform float uDriftScale;
         uniform float uDriftStrength;
         uniform vec3 uTint;
         uniform float uBandScale;
         uniform float uBandStrength;
         uniform float uSlopeShade;
         ${NOISE_CHUNK}`,
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
         {
           float grain = surfFbm(vSurfWorld / max(uGrainScale, 0.0001)) - 0.5;
           diffuseColor.rgb *= 1.0 + grain * uGrainStrength * 2.0;

           float drift = surfNoise(vSurfWorld / max(uDriftScale, 0.0001));
           diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * uTint, drift * uDriftStrength);

           if (uBandStrength > 0.0) {
             float bands = surfBands(vSurfWorld.y, uBandScale);
             diffuseColor.rgb *= 1.0 - uBandStrength * 0.5 + bands * uBandStrength;
           }

           if (uSlopeShade > 0.0) {
             // The face normal from screen-space derivatives of the world
             // position. vNormal does not exist under flatShading, and this is
             // the geometric normal slope actually wants anyway.
             vec3 faceNormal = normalize(cross(dFdx(vSurfWorld), dFdy(vSurfWorld)));
             float slope = 1.0 - abs(faceNormal.y);
             diffuseColor.rgb *= 1.0 - slope * uSlopeShade;
           }
         }`,
      )
  }

  // Materials that differ only by their patch still need distinct programs.
  material.customProgramCacheKey = () =>
    `surf|${grainScale}|${grainStrength}|${driftScale}|${driftStrength}|${bandScale}|${bandStrength}|${slopeShade}|${sway}`

  return material
}
