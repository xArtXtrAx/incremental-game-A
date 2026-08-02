import { useLayoutEffect, useRef, type CSSProperties } from 'react'
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
  | { kind: 'smooth'; wrapOnDecrease: boolean }
  | { kind: 'continuous-cycle'; cyclesPerSecond: number }
  | { kind: 'countdown'; endsAt: number; durationMs: number }

type TweenState =
  | { kind: 'idle' }
  | {
      kind: 'direct'
      from: number
      to: number
      startedAt: number
      durationMs: number
    }
  | {
      kind: 'wrap'
      from: number
      to: number
      startedAt: number
      durationMs: number
    }

const DEFAULT_UPDATE_MS = 1000
const MIN_TWEEN_MS = 90
const MAX_TWEEN_MS = 1150
const UPDATE_OVERLAP = 1.08
const WRAP_HOLD_MS = 28
const CYCLE_CORRECTION_SECONDS = 0.18
const TARGET_EPSILON = 0.00005
const MOTION_CACHE_MS = 45

let cachedGame: GameState | null = null
let cachedGameAt = 0

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value))
}

function normalizeProgress(value: number, maximum: number) {
  if (!Number.isFinite(value) || !Number.isFinite(maximum) || maximum <= 0) {
    return 0
  }

  return clamp(value / maximum, 0, 1)
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
      kind: 'continuous-cycle',
      cyclesPerSecond: Math.max(0, getAutoclickRate(game.autoclickLevel)),
    }
  }

  if (item.id === 'refraction-cycle') {
    const game = getCachedGameState()
    const facets = Math.max(1, item.maximum)
    const chargePerSecond =
      getRefractionChargeRate(game.refractionLevel) /
      Math.max(0.001, getRefractionOrbitDuration(game.manualClicks))

    return {
      kind: 'continuous-cycle',
      cyclesPerSecond: Math.max(0, chargePerSecond / facets),
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

  return {
    kind: 'smooth',
    wrapOnDecrease:
      item.id === 'cavitation-cycle' || item.id === 'overload-cycle',
  }
}

function getTweenValue(tween: TweenState, now: number) {
  if (tween.kind === 'idle') return null

  const elapsed = Math.max(0, now - tween.startedAt)
  const progress = clamp(elapsed / tween.durationMs, 0, 1)

  if (tween.kind === 'direct') {
    return {
      value: tween.from + (tween.to - tween.from) * progress,
      finished: progress >= 1,
    }
  }

  const forwardDistance = Math.max(0, 1 - tween.from)
  const restartDistance = Math.max(0, tween.to)
  const movingDuration = Math.max(1, tween.durationMs - WRAP_HOLD_MS)
  const totalDistance = Math.max(TARGET_EPSILON, forwardDistance + restartDistance)
  const firstDuration = movingDuration * (forwardDistance / totalDistance)
  const secondDuration = movingDuration - firstDuration

  if (elapsed <= firstDuration) {
    const localProgress = firstDuration <= 0 ? 1 : elapsed / firstDuration
    return {
      value: tween.from + forwardDistance * clamp(localProgress, 0, 1),
      finished: false,
    }
  }

  if (elapsed <= firstDuration + WRAP_HOLD_MS) {
    return { value: 1, finished: false }
  }

  const secondElapsed = elapsed - firstDuration - WRAP_HOLD_MS
  const localProgress = secondDuration <= 0 ? 1 : secondElapsed / secondDuration

  return {
    value: restartDistance * clamp(localProgress, 0, 1),
    finished: progress >= 1,
  }
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
  const displayedRef = useRef(targetProgress)
  const targetRef = useRef(targetProgress)
  const previousTargetRef = useRef(targetProgress)
  const motionRef = useRef<ProgressMotion>(motion)
  const tweenRef = useRef<TweenState>({ kind: 'idle' })
  const lastTargetAtRef = useRef(performance.now())
  const cycleCorrectionRef = useRef(0)
  const initializedRef = useRef(false)

  const motionKind = motion.kind
  const cyclesPerSecond =
    motion.kind === 'continuous-cycle' ? motion.cyclesPerSecond : 0
  const countdownEndsAt = motion.kind === 'countdown' ? motion.endsAt : 0
  const countdownDurationMs =
    motion.kind === 'countdown' ? motion.durationMs : 0
  const wrapOnDecrease =
    motion.kind === 'smooth' ? motion.wrapOnDecrease : false

  useLayoutEffect(() => {
    const now = performance.now()
    const previousTarget = previousTargetRef.current
    targetRef.current = targetProgress
    motionRef.current = motion

    if (!initializedRef.current) {
      displayedRef.current = targetProgress
      previousTargetRef.current = targetProgress
      lastTargetAtRef.current = now
      initializedRef.current = true
      fillRef.current?.style.setProperty(
        'transform',
        `scaleX(${targetProgress.toFixed(6)})`,
      )
      return
    }

    if (motion.kind === 'continuous-cycle') {
      cycleCorrectionRef.current = circularDifference(
        targetProgress,
        displayedRef.current,
      )
      tweenRef.current = { kind: 'idle' }
    } else if (motion.kind === 'countdown') {
      tweenRef.current = { kind: 'idle' }
    } else {
      const observedInterval = clamp(
        now - lastTargetAtRef.current,
        MIN_TWEEN_MS,
        MAX_TWEEN_MS,
      )
      const durationMs = clamp(
        (Number.isFinite(observedInterval)
          ? observedInterval
          : DEFAULT_UPDATE_MS) * UPDATE_OVERLAP,
        MIN_TWEEN_MS,
        MAX_TWEEN_MS,
      )
      const shouldWrap =
        motion.wrapOnDecrease &&
        targetProgress + TARGET_EPSILON < previousTarget &&
        displayedRef.current > TARGET_EPSILON

      tweenRef.current = {
        kind: shouldWrap ? 'wrap' : 'direct',
        from: displayedRef.current,
        to: targetProgress,
        startedAt: now,
        durationMs,
      }
    }

    previousTargetRef.current = targetProgress
    lastTargetAtRef.current = now
  }, [
    targetProgress,
    motionKind,
    cyclesPerSecond,
    countdownEndsAt,
    countdownDurationMs,
    wrapOnDecrease,
  ])

  useLayoutEffect(() => {
    let animationFrame = 0
    let previousFrame = performance.now()
    let lastWritten = Number.NaN

    const writeProgress = (value: number) => {
      const safeValue = clamp(value, 0, 1)
      if (Math.abs(safeValue - lastWritten) > TARGET_EPSILON) {
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
      const deltaSeconds = Math.max(0, (frameNow - previousFrame) / 1000)
      previousFrame = frameNow
      const currentMotion = motionRef.current
      let nextProgress = displayedRef.current

      if (currentMotion.kind === 'countdown') {
        nextProgress = clamp(
          (currentMotion.endsAt - Date.now()) /
            Math.max(1, currentMotion.durationMs),
          0,
          1,
        )
      } else if (currentMotion.kind === 'continuous-cycle') {
        const baseAdvance = currentMotion.cyclesPerSecond * deltaSeconds
        const correctionAlpha =
          1 - Math.exp(-deltaSeconds / CYCLE_CORRECTION_SECONDS)
        const maximumCorrection = Math.max(
          baseAdvance * 0.8,
          TARGET_EPSILON,
        )
        const correctionStep = clamp(
          cycleCorrectionRef.current * correctionAlpha,
          -maximumCorrection,
          maximumCorrection,
        )
        cycleCorrectionRef.current -= correctionStep
        nextProgress = wrapProgress(
          nextProgress + baseAdvance + correctionStep,
        )
      } else {
        const tweenValue = getTweenValue(tweenRef.current, frameNow)
        if (tweenValue) {
          nextProgress = tweenValue.value
          if (tweenValue.finished) {
            tweenRef.current = { kind: 'idle' }
          }
        } else {
          nextProgress = targetRef.current
        }
      }

      displayedRef.current = nextProgress
      writeProgress(nextProgress)
      animationFrame = window.requestAnimationFrame(animate)
    }

    animationFrame = window.requestAnimationFrame(animate)

    return () => window.cancelAnimationFrame(animationFrame)
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
