import { useId } from 'react'
import { motion } from 'motion/react'

export type SapphireGemSize = 'core' | 'dock'

type SapphireGemProps = {
  size?: SapphireGemSize
  energized?: boolean
  className?: string
}

type SapphireDockProps = {
  prestigeCount: number
  multiplier: number
  energized?: boolean
}

export function getSapphireName(prestigeCount: number) {
  if (prestigeCount <= 1) return 'Zafiro incipiente'
  if (prestigeCount === 2) return 'Zafiro facetado'
  if (prestigeCount === 3) return 'Zafiro resonante'
  return prestigeCount === 4 ? 'Zafiro astral' : 'Zafiro trascendente'
}

export function SapphireGem({
  size = 'dock',
  energized = false,
  className = '',
}: SapphireGemProps) {
  const rawId = useId().replace(/:/g, '')
  const upperGradient = `sapphire-upper-${rawId}`
  const lowerGradient = `sapphire-lower-${rawId}`
  const centerGradient = `sapphire-center-${rawId}`

  return (
    <motion.span
      className={`sapphire-gem sapphire-gem-${size}${energized ? ' is-energized' : ''} ${className}`.trim()}
      animate={{ y: energized ? [0, -5, 1, -3, 0] : [0, -4, 0] }}
      transition={{
        duration: energized ? 1.1 : 3.4,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      aria-hidden="true"
    >
      <span className="sapphire-gem-halo" />
      <motion.span
        className="sapphire-gem-rotator"
        animate={{ rotateY: 360, rotateZ: energized ? [0, 2, -2, 0] : 0 }}
        transition={{
          rotateY: {
            duration: energized ? 3.5 : 7.5,
            repeat: Infinity,
            ease: 'linear',
          },
          rotateZ: { duration: 0.65, repeat: Infinity, ease: 'easeInOut' },
        }}
      >
        <svg viewBox="0 0 120 150" role="presentation">
          <defs>
            <linearGradient id={upperGradient} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#d9fbff" />
              <stop offset="0.35" stopColor="#49d9ff" />
              <stop offset="1" stopColor="#0754bd" />
            </linearGradient>
            <linearGradient id={lowerGradient} x1="0" y1="0" x2="0.8" y2="1">
              <stop offset="0" stopColor="#1baeff" />
              <stop offset="0.48" stopColor="#083fae" />
              <stop offset="1" stopColor="#020d46" />
            </linearGradient>
            <radialGradient id={centerGradient} cx="42%" cy="30%" r="75%">
              <stop offset="0" stopColor="#ecffff" />
              <stop offset="0.28" stopColor="#63e9ff" />
              <stop offset="0.72" stopColor="#075bd1" />
              <stop offset="1" stopColor="#031148" />
            </radialGradient>
          </defs>

          <polygon
            points="60,4 106,39 91,112 60,146 29,112 14,39"
            fill={`url(#${centerGradient})`}
          />
          <polygon
            points="60,4 60,58 14,39"
            fill={`url(#${upperGradient})`}
            opacity="0.96"
          />
          <polygon points="60,4 106,39 60,58" fill="#158be4" opacity="0.92" />
          <polygon points="14,39 60,58 29,112" fill="#0879d8" opacity="0.88" />
          <polygon points="106,39 91,112 60,58" fill="#0348ad" opacity="0.96" />
          <polygon
            points="29,112 60,58 60,146"
            fill={`url(#${lowerGradient})`}
            opacity="0.95"
          />
          <polygon points="60,58 91,112 60,146" fill="#021d72" opacity="0.95" />
          <polyline
            points="60,4 106,39 91,112 60,146 29,112 14,39 60,4"
            fill="none"
            stroke="#aef6ff"
            strokeWidth="2"
            opacity="0.82"
          />
          <polyline
            points="14,39 60,58 106,39 M60,4 60,146 M29,112 60,58 91,112"
            fill="none"
            stroke="#71ddff"
            strokeWidth="1.2"
            opacity="0.58"
          />
          <path
            d="M34 32 L58 13"
            stroke="white"
            strokeWidth="5"
            strokeLinecap="round"
            opacity="0.72"
          />
          <path
            d="M29 47 L45 59"
            stroke="#d8fbff"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.55"
          />
        </svg>
      </motion.span>
      <motion.span
        className="sapphire-gem-glint"
        animate={{ x: ['-140%', '170%'], opacity: [0, 0.9, 0] }}
        transition={{
          duration: energized ? 1.3 : 3.8,
          repeat: Infinity,
          repeatDelay: 1.4,
        }}
      />
    </motion.span>
  )
}

export function SapphireDock({
  prestigeCount,
  multiplier,
  energized = false,
}: SapphireDockProps) {
  if (prestigeCount <= 0) {
    return null
  }

  return (
    <motion.aside
      className={`sapphire-dock${energized ? ' is-energized' : ''}`}
      initial={{ opacity: 0, x: 24, scale: 0.72 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 180, damping: 18 }}
      aria-label={`${getSapphireName(prestigeCount)}, multiplicador global por ${multiplier}`}
    >
      <div className="sapphire-dock-gem">
        <SapphireGem energized={energized} />
      </div>
      <div className="sapphire-dock-copy">
        <span>{getSapphireName(prestigeCount)}</span>
        <strong>×{multiplier.toFixed(2)}</strong>
        <small>
          {prestigeCount} cristalización{prestigeCount === 1 ? '' : 'es'}
        </small>
      </div>
    </motion.aside>
  )
}
