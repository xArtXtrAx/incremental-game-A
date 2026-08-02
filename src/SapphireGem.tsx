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
  refractionLevel?: number
  refractionCharged?: number
  refractionTotal?: number
  refractionActive?: boolean
  refractionDischarging?: boolean
}

type SapphireOrbitLayerProps = {
  depth: 'back' | 'front'
}

type RefractionFacetMatrixProps = {
  charged: number
  total: number
  active: boolean
  discharging: boolean
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
          <stop offset="1" stopColor="#020d72" />
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

function RefractionFacetMatrix({
  charged,
  total,
  active,
  discharging,
}: RefractionFacetMatrixProps) {
  return (
    <span
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: -5,
        zIndex: 5,
        pointerEvents: 'none',
      }}
    >
      {Array.from({ length: total }, (_, index) => {
        const isCharged = index < charged
        const angle = (index / total) * 360

        return (
          <span
            key={index}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 0,
              height: 0,
              transform: `rotate(${angle}deg) translateY(-38px)`,
            }}
          >
            <motion.span
              initial={false}
              animate={{
                opacity: discharging
                  ? [0.3, 1, 0.15]
                  : active
                    ? [0.62, 1, 0.62]
                    : isCharged
                      ? 1
                      : 0.16,
                scaleY: discharging
                  ? [0.8, 1.8, 0.55]
                  : active
                    ? [1, 1.32, 1]
                    : isCharged
                      ? 1.12
                      : 0.82,
              }}
              transition={
                discharging
                  ? { duration: 0.72, delay: index * 0.035 }
                  : active
                    ? {
                        duration: 0.9,
                        delay: (index % total) * 0.04,
                        repeat: Infinity,
                      }
                    : { duration: 0.2 }
              }
              style={{
                position: 'absolute',
                top: -7,
                left: -1,
                width: 2,
                height: 14,
                borderRadius: 999,
                transformOrigin: '50% 50%',
                background:
                  discharging || active
                    ? '#f1feff'
                    : isCharged
                      ? '#8df2ff'
                      : 'rgba(63, 133, 190, 0.34)',
                boxShadow:
                  discharging || active || isCharged
                    ? '0 0 5px #d8fdff, 0 0 12px rgba(56, 218, 255, 0.95)'
                    : 'none',
              }}
            />
          </span>
        )
      })}
      <motion.span
        initial={false}
        animate={{
          opacity: discharging ? [0, 0.9, 0] : active ? [0.16, 0.42, 0.16] : 0,
          scale: discharging ? [0.45, 1.2, 1.55] : active ? [0.9, 1.08, 0.9] : 0.8,
        }}
        transition={
          discharging
            ? { duration: 0.9 }
            : active
              ? { duration: 1.1, repeat: Infinity }
              : { duration: 0.2 }
        }
        style={{
          position: 'absolute',
          inset: 13,
          border: '1px solid rgba(185, 249, 255, 0.78)',
          borderRadius: '50%',
          boxShadow:
            '0 0 18px rgba(82, 230, 255, 0.55), inset 0 0 15px rgba(98, 212, 255, 0.16)',
        }}
      />
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
    </motion.span>
  )
}

export function SapphireDock({
  prestigeCount,
  multiplier,
  energized = false,
  refractionLevel = 0,
  refractionCharged = 0,
  refractionTotal = 6,
  refractionActive = false,
  refractionDischarging = false,
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
      <div className="sapphire-dock-gem" style={{ position: 'relative' }}>
        <SapphireGem
          energized={energized}
          prestigeCount={prestigeCount}
        />
        {refractionLevel > 0 && (
          <RefractionFacetMatrix
            charged={refractionCharged}
            total={refractionTotal}
            active={refractionActive}
            discharging={refractionDischarging}
          />
        )}
      </div>
      <div className="sapphire-dock-copy">
        <span>{getSapphireName(prestigeCount)}</span>
        <strong>×{multiplier.toFixed(2)}</strong>
        <small>
          {prestigeCount} cristalización{prestigeCount === 1 ? '' : 'es'}
          {refractionLevel > 0
            ? ` · matriz ${refractionCharged}/${refractionTotal}`
            : ''}
        </small>
      </div>
    </motion.aside>
  )
}
