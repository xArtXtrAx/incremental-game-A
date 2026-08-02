import { useCallback, useState } from 'react'
import { motion } from 'motion/react'
import './SapphireOrbit.css'
import { SapphireGem3D } from './SapphireGem3D'
import { SapphireOrbit3D } from './SapphireOrbit3D'

export type SapphireGemSize = 'core' | 'dock'

type SapphireGemProps = {
  size?: SapphireGemSize
  energized?: boolean
  prestigeCount?: number
  className?: string
}

type SapphireDockProps = {
  prestigeCount: number
  multiplier: number
  energized?: boolean
}

type SapphireOrbitLayerProps = {
  depth: 'back' | 'front'
}

const SAPPHIRE_ORBIT_TRAIL_STEPS = [1, 2, 3, 4, 5, 6] as const

export function getSapphireName(prestigeCount: number) {
  if (prestigeCount <= 1) return 'Zafiro incipiente'
  if (prestigeCount === 2) return 'Zafiro facetado'
  if (prestigeCount === 3) return 'Zafiro resonante'
  return prestigeCount === 4 ? 'Zafiro astral' : 'Zafiro trascendente'
}

function SapphireFallback() {
  return (
    <svg viewBox="0 0 120 150" role="presentation">
      <defs>
        <linearGradient
          id="sapphire-fallback-upper"
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop offset="0" stopColor="#d9fbff" />
          <stop offset="0.35" stopColor="#49d9ff" />
          <stop offset="1" stopColor="#0754bd" />
        </linearGradient>
        <linearGradient
          id="sapphire-fallback-lower"
          x1="0"
          y1="0"
          x2="0.8"
          y2="1"
        >
          <stop offset="0" stopColor="#1baeff" />
          <stop offset="0.48" stopColor="#083fae" />
          <stop offset="1" stopColor="#020d46" />
        </linearGradient>
      </defs>
      <polygon
        points="60,4 106,39 91,112 60,146 29,112 14,39"
        fill="#075bd1"
        stroke="#aef6ff"
        strokeWidth="2"
      />
      <polygon
        points="60,4 60,58 14,39"
        fill="url(#sapphire-fallback-upper)"
        opacity="0.96"
      />
      <polygon
        points="60,4 106,39 60,58"
        fill="#158be4"
        opacity="0.92"
      />
      <polygon
        points="14,39 60,58 29,112"
        fill="#0879d8"
        opacity="0.88"
      />
      <polygon
        points="106,39 91,112 60,58"
        fill="#0348ad"
        opacity="0.96"
      />
      <polygon
        points="29,112 60,58 60,146"
        fill="url(#sapphire-fallback-lower)"
        opacity="0.95"
      />
      <polygon
        points="60,58 91,112 60,146"
        fill="#021d72"
        opacity="0.95"
      />
    </svg>
  )
}

function SapphireOrbitLayer({ depth }: SapphireOrbitLayerProps) {
  return (
    <span className={`sapphire-orbit-layer sapphire-orbit-${depth}`}>
      <span className="sapphire-orbit-ring" />
      {SAPPHIRE_ORBIT_TRAIL_STEPS.map((step) => (
        <span
          key={`${depth}-${step}`}
          className={`sapphire-orbit-trail sapphire-orbit-trail-${step}`}
        />
      ))}
      <span className="sapphire-orbit-spark" />
    </span>
  )
}

export function SapphireGem({
  size = 'dock',
  energized = false,
  prestigeCount = 1,
  className = '',
}: SapphireGemProps) {
  const [webglUnavailable, setWebglUnavailable] = useState(false)
  const [orbitUnavailable, setOrbitUnavailable] = useState(false)
  const handleUnavailable = useCallback(() => setWebglUnavailable(true), [])
  const handleOrbitUnavailable = useCallback(
    () => setOrbitUnavailable(true),
    [],
  )
  const useFallbackOrbit = webglUnavailable || orbitUnavailable

  return (
    <motion.span
      className={`sapphire-gem sapphire-gem-${size}${energized ? ' is-energized' : ''}${webglUnavailable ? ' is-webgl-fallback' : ''}${useFallbackOrbit ? ' is-orbit-fallback' : ''} ${className}`.trim()}
      animate={{ y: energized ? [0, -5, 1, -3, 0] : [0, -4, 0] }}
      transition={{
        duration: energized ? 1.1 : 3.4,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      aria-hidden="true"
    >
      <span className="sapphire-gem-halo" />
      {useFallbackOrbit ? (
        <SapphireOrbitLayer depth="back" />
      ) : (
        <SapphireOrbit3D
          depth="back"
          energized={energized}
          onUnavailable={handleOrbitUnavailable}
        />
      )}
      {!webglUnavailable ? (
        <SapphireGem3D
          energized={energized}
          prestigeCount={prestigeCount}
          onUnavailable={handleUnavailable}
        />
      ) : (
        <motion.span
          className="sapphire-gem-rotator"
          animate={{ rotateY: 360 }}
          transition={{ duration: 7.5, repeat: Infinity, ease: 'linear' }}
        >
          <SapphireFallback />
        </motion.span>
      )}
      {useFallbackOrbit ? (
        <SapphireOrbitLayer depth="front" />
      ) : (
        <SapphireOrbit3D
          depth="front"
          energized={energized}
          onUnavailable={handleOrbitUnavailable}
        />
      )}
      <motion.span
        className="sapphire-gem-glint"
        initial={{
          x: '-340%',
          rotate: 18,
          filter: 'blur(2px) opacity(0)',
        }}
        animate={{
          x: ['-340%', '-340%', '-250%', '250%', '340%', '340%'],
          rotate: 18,
          filter: [
            'blur(2px) opacity(0)',
            'blur(2px) opacity(0)',
            'blur(2px) opacity(1)',
            'blur(2px) opacity(1)',
            'blur(2px) opacity(0)',
            'blur(2px) opacity(0)',
          ],
        }}
        transition={{
          duration: 4.2,
          times: [0, 0.12, 0.24, 0.62, 0.74, 1],
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ animation: 'none' }}
      />
    </motion.span>
  )
}

export function SapphireDock({
  prestigeCount,
  multiplier,
  energized = false,
}: SapphireDockProps) {
  if (prestigeCount <= 0) return null

  return (
    <motion.aside
      className={`sapphire-dock${energized ? ' is-energized' : ''}`}
      initial={{ opacity: 0, x: 24, scale: 0.72 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 180, damping: 18 }}
      aria-label={`${getSapphireName(prestigeCount)}, multiplicador global por ${multiplier}`}
    >
      <div className="sapphire-dock-gem">
        <SapphireGem
          energized={energized}
          prestigeCount={prestigeCount}
        />
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
