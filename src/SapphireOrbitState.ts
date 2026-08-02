export type SapphireOrbitPoint = {
  screenX: number
  screenY: number
  depth: number
  lightX: number
  lightY: number
  lightZ: number
}

export const SAPPHIRE_ORBIT_TAU = Math.PI * 2

let sharedOrbitPhase = 0
let sharedOrbitTimestamp = 0

export function getSapphireOrbitPhase(now: number, duration: number) {
  if (sharedOrbitTimestamp === 0) {
    sharedOrbitTimestamp = now
    return sharedOrbitPhase
  }

  const deltaSeconds = Math.min(
    0.1,
    Math.max(0, (now - sharedOrbitTimestamp) / 1000),
  )
  sharedOrbitTimestamp = now
  sharedOrbitPhase = (sharedOrbitPhase + deltaSeconds / duration) % 1
  return sharedOrbitPhase
}

export function pauseSapphireOrbit(now: number) {
  sharedOrbitTimestamp = now
}

export function getSapphireOrbitPoint(phase: number): SapphireOrbitPoint {
  const angle = phase * SAPPHIRE_ORBIT_TAU
  const x = Math.cos(angle)
  const depth = Math.sin(angle)
  const perspective = 1 + depth * 0.1

  return {
    screenX: x * 0.82 * perspective,
    screenY: -depth * 0.57 * perspective,
    depth,
    lightX: x * 1.34,
    lightY: -depth * 0.52,
    lightZ: -4.15 + depth * 1.18,
  }
}
