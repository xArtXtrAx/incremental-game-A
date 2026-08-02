import { useEffect, useRef } from 'react'
import { SapphireGem } from './SapphireGem'
import './ChromaticSapphireOrbit.css'

type ChromaticSapphireOrbitProps = {
  prestigeCount: number
}

const TAU = Math.PI * 2
const ORBIT_DURATION_MS = 15_000
const ORBIT_RADIUS_X = 35
const ORBIT_RADIUS_Y = 27

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value))
}

export function ChromaticSapphireOrbit({
  prestigeCount,
}: ChromaticSapphireOrbitProps) {
  const carrierRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const carrier = carrierRef.current
    const stage = carrier?.closest<HTMLElement>('.chromatic-stage')
    if (!carrier || !stage) return

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    const startedAt = performance.now()
    let frameId = 0
    let disposed = false
    let lastFrameAt = 0

    function applyPhase(phase: number) {
      const angle = phase * TAU - Math.PI / 2
      const cosine = Math.cos(angle)
      const depth = Math.sin(angle)
      const x = 50 + cosine * ORBIT_RADIUS_X
      const y = 50 + depth * ORBIT_RADIUS_Y
      const frontness = clamp01(depth * 0.5 + 0.5)
      const scale = 0.86 + frontness * 0.24
      const lightX = 50 + cosine * 43
      const lightY = 50 + depth * 31
      const lightStrength = 0.28 + frontness * 0.56
      const lightAngle = 90 + (Math.atan2(depth, cosine) * 180) / Math.PI

      carrier.style.left = `${x.toFixed(3)}%`
      carrier.style.top = `${y.toFixed(3)}%`
      carrier.style.zIndex = depth >= 0 ? '9' : '3'
      carrier.style.opacity = (0.74 + frontness * 0.26).toFixed(3)
      carrier.style.transform =
        `translate(-50%, -50%) scale(${scale.toFixed(4)})`

      stage.style.setProperty(
        '--chromatic-sapphire-light-x',
        `${lightX.toFixed(3)}%`,
      )
      stage.style.setProperty(
        '--chromatic-sapphire-light-y',
        `${lightY.toFixed(3)}%`,
      )
      stage.style.setProperty(
        '--chromatic-sapphire-light-strength',
        lightStrength.toFixed(4),
      )
      stage.style.setProperty(
        '--chromatic-sapphire-frontness',
        frontness.toFixed(4),
      )
      stage.style.setProperty(
        '--chromatic-sapphire-light-angle',
        `${lightAngle.toFixed(3)}deg`,
      )
    }

    function render(now: number) {
      if (disposed) return

      if (document.hidden) {
        frameId = window.requestAnimationFrame(render)
        return
      }

      if (now - lastFrameAt < 1000 / 60) {
        frameId = window.requestAnimationFrame(render)
        return
      }
      lastFrameAt = now

      const phase = reducedMotion
        ? 0.125
        : ((now - startedAt) % ORBIT_DURATION_MS) / ORBIT_DURATION_MS
      applyPhase(phase)

      if (!reducedMotion) {
        frameId = window.requestAnimationFrame(render)
      }
    }

    applyPhase(0.125)
    if (!reducedMotion) {
      frameId = window.requestAnimationFrame(render)
    }

    return () => {
      disposed = true
      window.cancelAnimationFrame(frameId)
      stage.style.removeProperty('--chromatic-sapphire-light-x')
      stage.style.removeProperty('--chromatic-sapphire-light-y')
      stage.style.removeProperty('--chromatic-sapphire-light-strength')
      stage.style.removeProperty('--chromatic-sapphire-frontness')
      stage.style.removeProperty('--chromatic-sapphire-light-angle')
    }
  }, [])

  return (
    <div ref={carrierRef} className="chromatic-sapphire-carrier" aria-hidden="true">
      <span className="chromatic-sapphire-outer-glow" />
      <SapphireGem
        size="dock"
        energized={false}
        prestigeCount={prestigeCount}
        className="chromatic-sapphire-shared-gem"
      />
    </div>
  )
}
