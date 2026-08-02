import type { CSSProperties } from 'react'
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
  '--upgrade-progress': string
  '--upgrade-segment-size': string
}

function normalizeProgress(value: number, maximum: number) {
  if (!Number.isFinite(value) || !Number.isFinite(maximum) || maximum <= 0) {
    return 0
  }

  return Math.min(1, Math.max(0, value / maximum))
}

function ProgressBar({ item }: { item: UpgradeProgressDefinition }) {
  const progress = normalizeProgress(item.value, item.maximum)
  const percent = progress * 100
  const segments = Math.max(1, Math.floor(item.segments ?? 1))
  const style: ProgressStyle = {
    '--upgrade-progress': `${percent.toFixed(3)}%`,
    '--upgrade-segment-size': `${(100 / segments).toFixed(5)}%`,
  }
  const tone = item.tone ?? 'charging'

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
        <span className="upgrade-progress-fill" />
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
