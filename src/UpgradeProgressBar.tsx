import { useEffect, useLayoutEffect, useRef, type CSSProperties } from 'react'
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

const CYCLIC_PROGRESS_IDS = new Set([
  'autoclick-cycle',
  'cavitation-cycle',
  'overload-cycle',
  'refraction-cycle',
])

const MIN_ANIMATION_MS = 180
const MAX_ANIMATION_MS = 1300
const DEFAULT_UPDATE_MS = 1000
const OVERLAP_FACTOR = 1.15
const WRAP_JUMP_OFFSET = 0.001
const EPSILON = 0.0001

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value))
}

function normalizeProgress(value: number, maximum: number) {
  if (!Number.isFinite(value) || !Number.isFinite(maximum) || maximum <= 0) {
    return 0
  }

  return clamp(value / maximum, 0, 1)
}

function readScaleX(element: HTMLElement) {
  const transform = window.getComputedStyle(element).transform
  if (!transform || transform === 'none') return 0

  if (transform.startsWith('matrix3d(')) {
    const values = transform.slice(9, -1).split(',')
    const scale = Number.parseFloat(values[0] ?? '')
    return Number.isFinite(scale) ? clamp(scale, 0, 1) : 0
  }

  if (transform.startsWith('matrix(')) {
    const values = transform.slice(7, -1).split(',')
    const scale = Number.parseFloat(values[0] ?? '')
    return Number.isFinite(scale) ? clamp(scale, 0, 1) : 0
  }

  const scaleMatch = transform.match(/scaleX\(([-+\d.]+)\)/)
  const scale = Number.parseFloat(scaleMatch?.[1] ?? '')
  return Number.isFinite(scale) ? clamp(scale, 0, 1) : 0
}

function buildKeyframes(current: number, target: number, wraps: boolean) {
  if (!wraps) {
    return [
      { transform: `scaleX(${current.toFixed(6)})`, offset: 0 },
      { transform: `scaleX(${target.toFixed(6)})`, offset: 1 },
    ] satisfies Keyframe[]
  }

  const distanceToEnd = Math.max(0, 1 - current)
  const distanceAfterRestart = Math.max(0, target)
  const totalDistance = Math.max(EPSILON, distanceToEnd + distanceAfterRestart)
  const endOffset = clamp(distanceToEnd / totalDistance, 0.04, 0.96)
  const restartOffset = Math.min(0.999, endOffset + WRAP_JUMP_OFFSET)

  return [
    { transform: `scaleX(${current.toFixed(6)})`, offset: 0 },
    { transform: 'scaleX(1)', offset: endOffset },
    { transform: 'scaleX(0)', offset: restartOffset },
    { transform: `scaleX(${target.toFixed(6)})`, offset: 1 },
  ] satisfies Keyframe[]
}

function ProgressBar({ item }: { item: UpgradeProgressDefinition }) {
  const targetProgress = normalizeProgress(item.value, item.maximum)
  const segments = Math.max(1, Math.floor(item.segments ?? 1))
  const style: ProgressStyle = {
    '--upgrade-segment-size': `${(100 / segments).toFixed(5)}%`,
  }
  const tone = item.tone ?? 'charging'
  const fillRef = useRef<HTMLSpanElement | null>(null)
  const animationRef = useRef<Animation | null>(null)
  const previousTargetRef = useRef(targetProgress)
  const lastTargetAtRef = useRef(performance.now())
  const initializedRef = useRef(false)
  const isCyclic = CYCLIC_PROGRESS_IDS.has(item.id)

  useLayoutEffect(() => {
    const fill = fillRef.current
    if (!fill) return

    const now = performance.now()

    if (!initializedRef.current) {
      fill.style.transform = `scaleX(${targetProgress.toFixed(6)})`
      previousTargetRef.current = targetProgress
      lastTargetAtRef.current = now
      initializedRef.current = true
      return
    }

    const previousTarget = previousTargetRef.current
    if (Math.abs(targetProgress - previousTarget) < EPSILON) return

    const currentProgress = readScaleX(fill)
    animationRef.current?.cancel()

    const observedInterval = now - lastTargetAtRef.current
    const baseDuration = Number.isFinite(observedInterval) && observedInterval > 0
      ? observedInterval
      : DEFAULT_UPDATE_MS
    const duration = clamp(
      baseDuration * OVERLAP_FACTOR,
      MIN_ANIMATION_MS,
      MAX_ANIMATION_MS,
    )
    const wraps =
      isCyclic &&
      targetProgress + EPSILON < previousTarget &&
      currentProgress > EPSILON

    const animation = fill.animate(
      buildKeyframes(currentProgress, targetProgress, wraps),
      {
        duration,
        easing: 'linear',
        fill: 'forwards',
      },
    )

    animationRef.current = animation
    animation.onfinish = () => {
      fill.style.transform = `scaleX(${targetProgress.toFixed(6)})`
      animation.cancel()
      if (animationRef.current === animation) {
        animationRef.current = null
      }
    }

    previousTargetRef.current = targetProgress
    lastTargetAtRef.current = now
  }, [isCyclic, targetProgress])

  useEffect(
    () => () => {
      animationRef.current?.cancel()
      animationRef.current = null
    },
    [],
  )

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
        <strong>{item.detail}</strong>
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
