import { useEffect, useLayoutEffect, useRef, type CSSProperties } from 'react'
import {
  getAutoclickRate,
  initialGameState,
  loadGameState,
  type GameState,
} from './game'
import {
  getRefractionChargeRate,
  getRefractionOrbitDuration,
} from './refraction'
import './UpgradeProgressBar.css'

export type UpgradeProgressTone =
  | 'locked'
  | 'charging'
  | 'ready'
  | 'active'

export type UpgradeProgressDefinition = {
  id: string
  label: string
  detail: string
  value: number
  maximum: number
  tone?: UpgradeProgressTone
  segments?: number
}

type ProgressStyle = CSSProperties & {
  '--upgrade-segment-size': string
}

type ProgressMotion =
  | { kind: 'smooth' }
  | { kind: 'cycle'; normalizedRate: number }
  | { kind: 'countdown'; endsAt: number; durationMs: number }

const SMOOTH_TWEEN_MS = 920
const CYCLE_CORRECTION_SECONDS = 0.14
const MAX_FRAME_SECONDS = 0.05
const MOTION_CACHE_MS = 45

let cachedGame: GameState | null = null
let cachedGameAt = 0

function normalizeProgress(value: number, maximum: number) {
  if (!Number.isFinite(value) || !Number.isFinite(maximum) || maximum <= 0) {
    return 0
  }

  return Math.min(1, Math.max(0, value / maximum))
}

function wrapProgress(value: number) {
  return ((value % 1) + 1) % 1
}

function circularDifference(target: number, current: number) {
  let difference = target - current
  if (difference > 0.5) difference -= 1
  if (difference < -0.5) difference += 1
  return difference
}

function smoothstep(value: number) {
  const clamped = Math.min(1, Math.max(0, value))
  return clamped * clamped * (3 - 2 * clamped)
}

function getCachedGameState() {
  const now = performance.now()
  if (!cachedGame || now - cachedGameAt > MOTION_CACHE_MS) {
    cachedGame = loadGameState(initialGameState)
    cachedGameAt = now
  }
  return cachedGame
}

function resolveProgressMotion(
  item: UpgradeProgressDefinition,
): ProgressMotion {
  if (item.id === 'autoclick-cycle') {
    const game = getCachedGameState()
    return {
      kind: 'cycle',
      normalizedRate:
        getAutoclickRate(game.autoclickLevel) / Math.max(1, item.maximum),
    }
  }

  if (item.id === 'refraction-cycle') {
    const game = getCachedGameState()
    const unitsPerSecond =
      getRefractionChargeRate(game.refractionLevel) /
      Math.max(0.001, getRefractionOrbitDuration(game.manualClicks))

    return {
      kind: 'cycle',
      normalizedRate: unitsPerSecond / Math.max(1, item.maximum),
    }
  }

  if (item.id === 'overload-active') {
    const game = getCachedGameState()
    return {
      kind: 'countdown',
      endsAt: game.overloadUntil,
      durationMs: Math.max(1, item.maximum * 1000),
    }
  }

  if (item.id === 'refraction-active') {
    const game = getCachedGameState()
    return {
      kind: 'countdown',
      endsAt: game.refractionUntil,
      durationMs: Math.max(1, item.maximum * 1000),
    }
  }

  return { kind: 'smooth' }
}

function ProgressBar({ item }: { item: UpgradeProgressDefinition }) {
  const targetProgress = normalizeProgress(item.value, item.maximum)
  const segments = Math.max(1, Math.floor(item.segments ?? 1))
  const style: ProgressStyle = {
    '--upgrade-segment-size': `${(100 / segments).toFixed(5)}%`,
  }
  const tone = item.tone ?? 'charging'
  const motion = resolveProgressMotion(item)
  const fillRef = useRef<HTMLSpanElement | null>(null)
  const detailRef = useRef<HTMLElement | null>(null)
  const targetRef = useRef(targetProgress)
  const displayedRef = useRef(targetProgress)
  const motionRef = useRef<ProgressMotion>(motion)
  const cycleCorrectionRef = useRef(0)
  const smoothFromRef = useRef(targetProgress)
  const smoothToRef = useRef(targetProgress)
  const smoothStartedAtRef = useRef(performance.now())
  const initializedRef = useRef(false)

  const motionRate = motion.kind === 'cycle' ? motion.normalizedRate : 0
  const motionEndsAt = motion.kind === 'countdown' ? motion.endsAt : 0
  const motionDurationMs =
    motion.kind === 'countdown' ? motion.durationMs : 0

  useEffect(() => {
    targetRef.current = targetProgress
    motionRef.current = motion

    if (!initializedRef.current) {
      displayedRef.current = targetProgress
      smoothFromRef.current = targetProgress
      smoothToRef.current = targetProgress
      smoothStartedAtRef.current = performance.now()
      initializedRef.current = true
      return
    }

    if (motion.kind === 'cycle') {
      cycleCorrectionRef.current = circularDifference(
        targetProgress,
        displayedRef.current,
      )
      return
    }

    if (motion.kind === 'smooth') {
      smoothFromRef.current = displayedRef.current
      smoothToRef.current = targetProgress
      smoothStartedAtRef.current = performance.now()
    }
  }, [
    targetProgress,
    motion.kind,
    motionRate,
    motionEndsAt,
    motionDurationMs,
  ])

  useLayoutEffect(() => {
    let animationFrame = 0
    let previousFrame = performance.now()
    let lastWritten = Number.NaN

    const writeProgress = (value: number) => {
      const safeValue = Math.min(1, Math.max(0, value))
      if (Math.abs(safeValue - lastWritten) > 0.00005) {
        fillRef.current?.style.setProperty(
          'transform',
          `scaleX(${safeValue.toFixed(6)})`,
        )
        lastWritten = safeValue
      }

      const currentMotion = motionRef.current
      if (item.id === 'autoclick-cycle' && detailRef.current) {
        detailRef.current.textContent = `${(safeValue * 100).toFixed(1)}%`
      } else if (
        currentMotion.kind === 'countdown' &&
        detailRef.current
      ) {
        const remainingSeconds = Math.max(
          0,
          (currentMotion.endsAt - Date.now()) / 1000,
        )
        detailRef.current.textContent = `${remainingSeconds.toFixed(1)} s`
      }
    }

    writeProgress(displayedRef.current)

    const animate = (frameNow: number) => {
      const deltaSeconds = Math.min(
        MAX_FRAME_SECONDS,
        Math.max(0, (frameNow - previousFrame) / 1000),
      )
      previousFrame = frameNow
      const currentMotion = motionRef.current
      let nextProgress = displayedRef.current

      if (currentMotion.kind === 'countdown') {
        nextProgress = Math.min(
          1,
          Math.max(
            0,
            (currentMotion.endsAt - Date.now()) /
              Math.max(1, currentMotion.durationMs),
          ),
        )
      } else if (currentMotion.kind === 'cycle') {
        const correctionAlpha =
          1 - Math.exp(-deltaSeconds / CYCLE_CORRECTION_SECONDS)
        const correctionStep =
          cycleCorrectionRef.current * correctionAlpha
        cycleCorrectionRef.current -= correctionStep
        nextProgress = wrapProgress(
          nextProgress +
            currentMotion.normalizedRate * deltaSeconds +
            correctionStep,
        )
      } else {
        const elapsed = frameNow - smoothStartedAtRef.current
        const eased = smoothstep(elapsed / SMOOTH_TWEEN_MS)
        nextProgress =
          smoothFromRef.current +
          (smoothToRef.current - smoothFromRef.current) * eased

        if (eased >= 1) {
          nextProgress = smoothToRef.current
        }
      }

      displayedRef.current = nextProgress
      writeProgress(nextProgress)
      animationFrame = window.requestAnimationFrame(animate)
    }

    animationFrame = window.requestAnimationFrame(animate)

    return () => {
      window.cancelAnimationFrame(animationFrame)
    }
  }, [item.id])

  return (
    <div
      className={`upgrade-progress is-${tone}${segments > 1 ? ' is-segmented' : ''}`}
      role="progressbar"
      aria-label={item.label}
      aria-valuemin={0}
      aria-valuemax={item.maximum}
      aria-valuenow={Math.min(item.maximum, Math.max(0, item.value))}
      aria-valuetext={item.detail}
      style={style}
    >
      <div className="upgrade-progress-heading">
        <span>{item.label}</span>
        <strong ref={detailRef}>{item.detail}</strong>
      </div>
      <div className="upgrade-progress-track" aria-hidden="true">
        <span ref={fillRef} className="upgrade-progress-fill" />
        {segments > 1 && <span className="upgrade-progress-segments" />}
      </div>
    </div>
  )
}

export function UpgradeProgressStack({
  items,
}: {
  items?: readonly UpgradeProgressDefinition[]
}) {
  if (!items || items.length === 0) return null

  return (
    <div className="upgrade-progress-stack">
      {items.map((item) => (
        <ProgressBar key={item.id} item={item} />
      ))}
    </div>
  )
}
