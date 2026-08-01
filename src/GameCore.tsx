import { type CSSProperties } from 'react'
import { motion } from 'motion/react'
import {
  type GameState,
  getAutoclickRate,
  getCavitationClicksRequired,
  getCavitationReward,
  getClickPower,
  getEnergyPerSecond,
  getOverloadClicksRequired,
  getOverloadDurationSeconds,
  getOverloadMultiplier,
  getOverloadRemainingSeconds,
  getPressureBonusPercent,
  getSphereFillPercentage,
  isOverloadActive,
  SPHERE_CLICK_CAPACITY,
} from './game'

export type ClickBurst = { id: number; amount: number }
export type EnergyBurst = { id: number; amount: number }
export type OverloadBurst = { id: number; multiplier: number }

type SphereStyle = CSSProperties & {
  '--fill-level': string
  '--liquid-opacity': number
}

type GameCoreProps = {
  game: GameState
  clockNow: number
  bursts: ClickBurst[]
  cavitationBurst: EnergyBurst | null
  overloadBurst: OverloadBurst | null
  onClick: () => void
}

const particleDirections = [
  { x: 0, y: -82 },
  { x: 58, y: -58 },
  { x: 82, y: 0 },
  { x: 58, y: 58 },
  { x: 0, y: 82 },
  { x: -58, y: 58 },
  { x: -82, y: 0 },
  { x: -58, y: -58 },
]

const format = new Intl.NumberFormat('es-MX', {
  maximumFractionDigits: 2,
})

function SegmentRing({
  count,
  charged,
  radius,
  active = false,
}: {
  count: number
  charged: number
  radius: number
  active?: boolean
}) {
  return (
    <span
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
      }}
    >
      {Array.from({ length: count }, (_, index) => {
        const isCharged = index < charged
        const angle = (index / count) * 360

        return (
          <span
            key={index}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 0,
              height: 0,
              transform: `rotate(${angle}deg) translateY(-${radius}px)`,
            }}
          >
            <motion.span
              initial={false}
              animate={{
                opacity: active ? [0.42, 1, 0.42] : isCharged ? 1 : 0.16,
                scaleY: active ? [0.8, 1.35, 0.8] : isCharged ? 1.08 : 1,
              }}
              transition={
                active
                  ? {
                      duration: 0.85,
                      delay: (index % 12) * 0.035,
                      repeat: Infinity,
                    }
                  : { duration: 0.14 }
              }
              style={{
                position: 'absolute',
                top: active ? -4 : -5.5,
                left: active ? -1 : -1.5,
                width: active ? 2 : 3,
                height: active ? 8 : 11,
                borderRadius: 999,
                background: active
                  ? '#d5fbff'
                  : isCharged
                    ? '#8ce8ff'
                    : 'rgba(70, 145, 195, 0.42)',
                boxShadow:
                  active || isCharged
                    ? '0 0 8px rgba(42, 205, 255, 0.95)'
                    : 'none',
                transformOrigin: '50% 50%',
              }}
            />
          </span>
        )
      })}
    </span>
  )
}

export function GameCore({
  game,
  clockNow,
  bursts,
  cavitationBurst,
  overloadBurst,
  onClick,
}: GameCoreProps) {
  const fill = getSphereFillPercentage(game.manualClicks)
  const sphereClicks = Math.min(game.manualClicks, SPHERE_CLICK_CAPACITY)
  const sphereFull = fill >= 100
  const pressureBonus = getPressureBonusPercent(
    game.manualClicks,
    game.pressureLevel,
  )
  const autoclickRate = getAutoclickRate(game.autoclickLevel)
  const overloadActive = isOverloadActive(game.overloadUntil, clockNow)
  const overloadMultiplier = overloadActive
    ? getOverloadMultiplier(game.overloadLevel)
    : 1
  const overloadRemaining = getOverloadRemainingSeconds(
    game.overloadUntil,
    clockNow,
  )
  const overloadThreshold = getOverloadClicksRequired(game.overloadLevel)
  const overloadDuration = getOverloadDurationSeconds(game.overloadLevel)
  const clickPower = getClickPower(
    game.clickLevel,
    game.manualClicks,
    game.pressureLevel,
    overloadMultiplier,
  )
  const production = getEnergyPerSecond(
    game.generatorLevel,
    game.resonanceLevel,
    game.manualClicks,
    game.pressureLevel,
    overloadMultiplier,
  )
  const cavitationThreshold = getCavitationClicksRequired(game.cavitationLevel)
  const cavitationReward = getCavitationReward(
    game.generatorLevel,
    game.resonanceLevel,
    game.manualClicks,
    game.pressureLevel,
    game.cavitationLevel,
    overloadMultiplier,
  )
  const cavitationVisualCharge = cavitationBurst
    ? cavitationThreshold
    : game.cavitationCharge
  const pressureOpacity =
    game.pressureLevel > 0
      ? Math.min(0.22 + fill / 140 + game.pressureLevel * 0.08, 1)
      : 0
  const sphereStyle: SphereStyle = {
    '--fill-level': `${fill}%`,
    '--liquid-opacity': sphereClicks > 0 ? 1 : 0,
  }

  return (
    <section className="core-column" aria-label="Núcleo de energía">
      <div className="energy-display" aria-live="polite">
        <span>Energía</span>
        <strong>{format.format(game.energy)}</strong>
        <small>
          +{format.format(production)} por segundo
          {autoclickRate > 0
            ? ` · ${format.format(autoclickRate)} clic/s`
            : ''}
          {overloadActive
            ? ` · SOBRECARGA ×${format.format(overloadMultiplier)}`
            : ''}
        </small>
      </div>

      <div className="button-stage">
        {game.overloadLevel > 0 && sphereFull && (
          <span style={{ position: 'absolute', inset: 4, zIndex: 0 }}>
            <SegmentRing
              count={overloadThreshold}
              charged={game.overloadCharge}
              radius={108}
              active={overloadActive}
            />
          </span>
        )}

        {game.cavitationLevel > 0 && (
          <span style={{ position: 'absolute', inset: 18, zIndex: 1 }}>
            <SegmentRing
              count={cavitationThreshold}
              charged={cavitationVisualCharge}
              radius={93}
            />
          </span>
        )}

        <motion.button
          type="button"
          className="click-button"
          style={sphereStyle}
          onClick={onClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          animate={
            overloadActive
              ? {
                  boxShadow: [
                    '0 0 18px rgba(49,211,255,.9),0 0 45px rgba(0,119,255,.8)',
                    '0 0 30px rgba(179,247,255,1),0 0 78px rgba(0,153,255,.95)',
                    '0 0 18px rgba(49,211,255,.9),0 0 45px rgba(0,119,255,.8)',
                  ],
                }
              : undefined
          }
          transition={
            overloadActive
              ? { duration: 0.75, repeat: Infinity }
              : undefined
          }
          aria-label={`Generar ${clickPower} de energía. Sobrecarga ${game.overloadCharge} de ${overloadThreshold}.`}
        >
          <motion.span
            className="sphere-liquid"
            aria-hidden="true"
            animate={
              cavitationBurst
                ? {
                    x: [0, -4, 4, -3, 3, 0],
                    rotate: [0, -1.2, 1.2, 0],
                  }
                : overloadActive
                  ? { x: [0, -1.5, 1.5, 0], y: [0, -1, 1, 0] }
                  : { x: 0, y: 0 }
            }
            transition={
              cavitationBurst
                ? { duration: 0.68 }
                : overloadActive
                  ? { duration: 0.32, repeat: Infinity }
                  : { duration: 0.2 }
            }
          >
            <span className="liquid-body" />
            <span className="liquid-wave liquid-wave-back" />
            <span className="liquid-wave liquid-wave-front" />
            <span className="liquid-bubble bubble-one" />
            <span className="liquid-bubble bubble-two" />
            <span className="liquid-bubble bubble-three" />
          </motion.span>
          <span className="sphere-depth" aria-hidden="true" />

          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 4,
              opacity: pressureOpacity,
              pointerEvents: 'none',
            }}
          >
            {[0, 1, 2].map((ring) => (
              <motion.span
                key={ring}
                initial={{ scale: 0.38, opacity: 0 }}
                animate={{
                  scale: [0.38, 0.72, 1.08],
                  opacity: [0, 0.72, 0],
                }}
                transition={{
                  duration: Math.max(2.8, 6 - game.pressureLevel * 0.4),
                  delay: ring * 0.75,
                  repeat: Infinity,
                }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: 92,
                  height: 42,
                  marginTop: -21,
                  marginLeft: -46,
                  border: '1px solid rgba(83,207,255,.72)',
                  borderRadius: '50%',
                  boxShadow: '0 0 12px rgba(0,155,255,.35)',
                }}
              />
            ))}
          </span>

          {overloadActive && (
            <motion.span
              aria-hidden="true"
              animate={{ opacity: [0.3, 0.85, 0.3] }}
              transition={{ duration: 0.55, repeat: Infinity }}
              style={{
                position: 'absolute',
                inset: 5,
                zIndex: 4,
                borderRadius: '50%',
                border: '2px solid rgba(195,249,255,.92)',
                background:
                  'radial-gradient(circle,rgba(81,205,255,.42),rgba(0,84,205,.08) 58%,transparent 74%)',
                boxShadow:
                  '0 0 28px rgba(73,220,255,.92),inset 0 0 28px rgba(83,210,255,.5)',
              }}
            />
          )}

          {cavitationBurst && (
            <motion.span
              key={cavitationBurst.id}
              aria-hidden="true"
              initial={{ opacity: 0.9, scale: 0.18 }}
              animate={{
                opacity: [0.9, 0.58, 0],
                scale: [0.18, 0.82, 1.45],
              }}
              transition={{ duration: 0.82 }}
              style={{
                position: 'absolute',
                inset: 7,
                zIndex: 5,
                border: '2px solid #a4f1ff',
                borderRadius: '50%',
                boxShadow: '0 0 32px #3fcdff',
              }}
            />
          )}

          <span className="sphere-shine" aria-hidden="true" />
          <span className="button-label">
            <strong>{overloadActive ? 'OVERLOAD' : 'CLICK'}</strong>
            <small>
              {overloadActive
                ? `${overloadRemaining.toFixed(1)} s · ×${format.format(overloadMultiplier)}`
                : `${format.format(sphereClicks)} / ${format.format(SPHERE_CLICK_CAPACITY)}`}
            </small>
          </span>
        </motion.button>

        {bursts.map((burst) => (
          <div className="click-burst" key={burst.id} aria-hidden="true">
            <motion.span
              className="click-plus-one"
              initial={{ opacity: 0, scale: 0.65, y: 0 }}
              animate={{
                opacity: [0, 1, 1, 0],
                scale: [0.65, 1.08, 1],
                y: -92,
              }}
              transition={{ duration: 0.8 }}
            >
              +{format.format(burst.amount)}
            </motion.span>

            {particleDirections.map((direction, index) => (
              <motion.span
                className="click-particle"
                key={`${burst.id}-${index}`}
                initial={{ opacity: 0, scale: 0.25, x: 0, y: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.25, 1.15, 0.2],
                  x: direction.x,
                  y: direction.y,
                }}
                transition={{ duration: 0.65 }}
              />
            ))}
          </div>
        ))}

        {cavitationBurst && (
          <motion.div
            key={cavitationBurst.id}
            role="status"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: [0, 1, 1, 0], y: [12, -10, -24] }}
            transition={{ duration: 1.35 }}
            style={{
              position: 'absolute',
              top: 6,
              zIndex: 8,
              color: '#dffbff',
              fontWeight: 900,
              textShadow: '0 0 18px #00aeff',
            }}
          >
            DESCARGA +{format.format(cavitationBurst.amount)}
          </motion.div>
        )}

        {overloadBurst && (
          <motion.div
            key={overloadBurst.id}
            role="status"
            initial={{ opacity: 0, scale: 0.55, y: 28 }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0.55, 1.12, 1],
              y: [28, -8, -34],
            }}
            transition={{ duration: 1.7 }}
            style={{
              position: 'absolute',
              top: -8,
              zIndex: 9,
              color: '#effeff',
              fontWeight: 950,
              textShadow: '0 0 25px #17ccff',
            }}
          >
            NÚCLEO SOBRECARGADO ×{format.format(overloadBurst.multiplier)}
          </motion.div>
        )}
      </div>

      <div className={`sphere-status${sphereFull ? ' is-full' : ''}`}>
        <span>Núcleo líquido</span>
        <strong>
          {sphereFull ? 'Capacidad completa' : `${fill.toFixed(1)}% lleno`} · +
          {format.format(pressureBonus)}% global
        </strong>
      </div>

      {game.autoclickLevel > 0 && (
        <div className="sphere-status" style={{ marginTop: -6 }}>
          <span>Pulsación autónoma</span>
          <strong>
            {format.format(autoclickRate)} clic/s ·{' '}
            {format.format(game.autoclickProgress * 100)}% hacia el siguiente
          </strong>
        </div>
      )}

      {game.cavitationLevel > 0 && (
        <div className="sphere-status" style={{ marginTop: -6 }}>
          <span>Cavitación</span>
          <strong>
            {game.cavitationCharge}/{cavitationThreshold} · Próxima +
            {format.format(cavitationReward)}
          </strong>
        </div>
      )}

      {game.overloadLevel > 0 && (
        <div
          className={`sphere-status${overloadActive ? ' is-full' : ''}`}
          style={{ marginTop: -6 }}
        >
          <span>Sobrecarga</span>
          <strong>
            {overloadActive
              ? `ACTIVA ×${format.format(getOverloadMultiplier(game.overloadLevel))} · ${overloadRemaining.toFixed(1)} s`
              : `${game.overloadCharge}/${overloadThreshold} · ×${format.format(getOverloadMultiplier(game.overloadLevel))} por ${overloadDuration} s`}
          </strong>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <span>Por clic</span>
          <strong>+{format.format(clickPower)}</strong>
        </div>
        <div className="stat-card">
          <span>Automática</span>
          <strong>+{format.format(production)}/s</strong>
        </div>
        <div className="stat-card">
          <span>Clics del núcleo</span>
          <strong>{format.format(game.manualClicks)}</strong>
        </div>
      </div>
    </section>
  )
}
