import { type CSSProperties } from 'react'
import { motion } from 'motion/react'
import { SapphireDock, SapphireGem } from './SapphireGem'
import {
  type GameState,
  getAutoclickRate,
  getCavitationClicksRequired,
  getCavitationReward,
  getClickPower,
  getEnergyPerSecond,
  getNextSapphireMultiplier,
  getOverloadClicksRequired,
  getOverloadDurationSeconds,
  getOverloadMultiplier,
  getOverloadRemainingSeconds,
  getPressureBonusPercent,
  getSapphireMultiplier,
  getSphereFillPercentage,
  isOverloadActive,
  SPHERE_CLICK_CAPACITY,
} from './game'
import {
  getRefractionBonusMultiplier,
  getRefractionFacetCount,
  getRefractionRemainingSeconds,
  getRefractionReward,
  isRefractionActive,
} from './refraction'

export type ClickBurst = { id: number; amount: number }
export type EnergyBurst = { id: number; amount: number }
export type OverloadBurst = { id: number; multiplier: number }
export type RefractionBurst = {
  id: number
  amount: number
  multiplier: number
}
export type PrestigeAnnouncement = {
  prestigeCount: number
  multiplier: number
}

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
  refractionBurst: RefractionBurst | null
  sapphireBirthId: number
  isCrystallizing: boolean
  prestigeAnnouncement: PrestigeAnnouncement | null
  onClick: () => void
  onCrystallize: () => void
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

const prismDirections = [
  { x: -95, y: -50, rotate: -28 },
  { x: 98, y: -44, rotate: 24 },
  { x: -106, y: 8, rotate: -4 },
  { x: 110, y: 12, rotate: 8 },
  { x: -74, y: 72, rotate: -45 },
  { x: 78, y: 76, rotate: 42 },
]

const format = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 2 })

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
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
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
  refractionBurst,
  sapphireBirthId,
  isCrystallizing,
  prestigeAnnouncement,
  onClick,
  onCrystallize,
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
  const refractionActive = isRefractionActive(game.refractionUntil, clockNow)
  const refractionMultiplier = refractionActive
    ? getRefractionBonusMultiplier(game.refractionLevel)
    : 1
  const activeMultiplier = overloadMultiplier * refractionMultiplier
  const sapphireMultiplier = getSapphireMultiplier(game.prestigeCount)
  const nextSapphireMultiplier = getNextSapphireMultiplier(game.prestigeCount)
  const overloadRemaining = getOverloadRemainingSeconds(
    game.overloadUntil,
    clockNow,
  )
  const refractionRemaining = getRefractionRemainingSeconds(
    game.refractionUntil,
    clockNow,
  )
  const overloadThreshold = getOverloadClicksRequired(game.overloadLevel)
  const overloadDuration = getOverloadDurationSeconds(game.overloadLevel)
  const clickPower = getClickPower(
    game.clickLevel,
    game.manualClicks,
    game.pressureLevel,
    activeMultiplier,
    sapphireMultiplier,
  )
  const production = getEnergyPerSecond(
    game.generatorLevel,
    game.resonanceLevel,
    game.manualClicks,
    game.pressureLevel,
    activeMultiplier,
    sapphireMultiplier,
  )
  const baseRefractionProduction = getEnergyPerSecond(
    game.generatorLevel,
    game.resonanceLevel,
    game.manualClicks,
    game.pressureLevel,
    overloadMultiplier,
    sapphireMultiplier,
  )
  const refractionReward = getRefractionReward(
    baseRefractionProduction,
    game.refractionLevel,
  )
  const refractionFacetCount = getRefractionFacetCount(game.prestigeCount)
  const cavitationThreshold = getCavitationClicksRequired(game.cavitationLevel)
  const cavitationReward = getCavitationReward(
    game.generatorLevel,
    game.resonanceLevel,
    game.manualClicks,
    game.pressureLevel,
    game.cavitationLevel,
    activeMultiplier,
    sapphireMultiplier,
  )
  const cavitationVisualCharge =
    cavitationBurst && game.cavitationCharge === 0
      ? cavitationThreshold
      : game.cavitationCharge
  const pressureOpacity =
    game.pressureLevel > 0
      ? Math.min(0.22 + fill / 140 + game.pressureLevel * 0.08, 1)
      : 0
  const sapphireEnergized =
    Boolean(cavitationBurst) ||
    overloadActive ||
    refractionActive ||
    Boolean(refractionBurst) ||
    prestigeAnnouncement !== null
  const sphereStyle: SphereStyle = {
    '--fill-level': `${fill}%`,
    '--liquid-opacity': sphereClicks > 0 ? 1 : 0,
  }

  return (
    <section
      className={`core-column${game.prestigeCount > 0 ? ' has-sapphire-dock' : ''}`}
      aria-label="Núcleo de energía"
    >
      <SapphireDock
        prestigeCount={game.prestigeCount}
        multiplier={sapphireMultiplier}
        energized={sapphireEnergized}
        refractionLevel={game.refractionLevel}
        refractionCharged={game.refractionFacetsCharged}
        refractionTotal={refractionFacetCount}
        refractionActive={refractionActive}
        refractionDischarging={Boolean(refractionBurst)}
      />

      <div className="energy-display" aria-live="polite">
        <span>Energía</span>
        <strong>{format.format(game.energy)}</strong>
        <small>
          +{format.format(production)} por segundo
          {autoclickRate > 0 ? ` · ${format.format(autoclickRate)} clic/s` : ''}
          {game.prestigeCount > 0
            ? ` · ZAFIRO ×${format.format(sapphireMultiplier)}`
            : ''}
          {overloadActive
            ? ` · SOBRECARGA ×${format.format(overloadMultiplier)}`
            : ''}
          {refractionActive
            ? ` · PRISMA ×${format.format(refractionMultiplier)}`
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
          className={`click-button${sphereFull ? ' has-core-sapphire' : ''}`}
          style={sphereStyle}
          onClick={onClick}
          disabled={isCrystallizing}
          whileHover={isCrystallizing ? undefined : { scale: 1.05 }}
          whileTap={isCrystallizing ? undefined : { scale: 0.92 }}
          animate={
            overloadActive || refractionActive
              ? {
                  boxShadow: refractionActive
                    ? [
                        '0 0 18px rgba(94,229,255,.78),0 0 42px rgba(67,99,255,.65)',
                        '0 0 32px rgba(230,254,255,1),0 0 82px rgba(89,111,255,.92)',
                        '0 0 18px rgba(94,229,255,.78),0 0 42px rgba(67,99,255,.65)',
                      ]
                    : [
                        '0 0 18px rgba(49,211,255,.9),0 0 45px rgba(0,119,255,.8)',
                        '0 0 30px rgba(179,247,255,1),0 0 78px rgba(0,153,255,.95)',
                        '0 0 18px rgba(49,211,255,.9),0 0 45px rgba(0,119,255,.8)',
                      ],
                }
              : undefined
          }
          transition={
            overloadActive || refractionActive
              ? { duration: refractionActive ? 1.05 : 0.75, repeat: Infinity }
              : undefined
          }
          aria-label={`Generar ${clickPower} de energía. Núcleo ${sphereClicks} de ${SPHERE_CLICK_CAPACITY}.`}
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
                : overloadActive || refractionActive
                  ? { x: [0, -1.5, 1.5, 0], y: [0, -1, 1, 0] }
                  : { x: 0, y: 0 }
            }
            transition={
              cavitationBurst
                ? { duration: 0.68 }
                : overloadActive || refractionActive
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

          {refractionActive && (
            <motion.span
              aria-hidden="true"
              animate={{ opacity: [0.22, 0.72, 0.22], rotate: [0, 180, 360] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
              style={{
                position: 'absolute',
                inset: 9,
                zIndex: 4,
                borderRadius: '50%',
                border: '1px solid rgba(224,252,255,.9)',
                background:
                  'conic-gradient(from 0deg,rgba(102,236,255,.35),rgba(130,94,255,.18),rgba(255,255,255,.42),rgba(102,236,255,.35))',
                boxShadow:
                  '0 0 34px rgba(85,220,255,.72),inset 0 0 34px rgba(117,102,255,.28)',
                mixBlendMode: 'screen',
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

          {refractionBurst && (
            <span
              key={refractionBurst.id}
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 8,
                pointerEvents: 'none',
              }}
            >
              <motion.span
                initial={{ opacity: 0.95, scale: 0.15 }}
                animate={{ opacity: [0.95, 0.5, 0], scale: [0.15, 0.9, 1.62] }}
                transition={{ duration: 1.05 }}
                style={{
                  position: 'absolute',
                  inset: 4,
                  border: '2px solid rgba(235,254,255,.96)',
                  borderRadius: '50%',
                  boxShadow:
                    '0 0 32px rgba(131,240,255,.95),0 0 68px rgba(105,90,255,.72)',
                }}
              />
              {prismDirections.map((direction, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, x: 0, y: 0, scaleX: 0.15 }}
                  animate={{
                    opacity: [0, 1, 0],
                    x: direction.x,
                    y: direction.y,
                    scaleX: [0.15, 1.25, 0.2],
                  }}
                  transition={{ duration: 0.82, delay: index * 0.045 }}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: 42,
                    height: 2,
                    marginLeft: -21,
                    marginTop: -1,
                    borderRadius: 999,
                    background:
                      'linear-gradient(90deg,transparent,#eaffff 42%,#83ddff 62%,transparent)',
                    boxShadow: '0 0 12px rgba(116,229,255,.95)',
                    rotate: `${direction.rotate}deg`,
                  }}
                />
              ))}
            </span>
          )}

          {sphereFull && (
            <motion.span
              key={`${game.prestigeCount}-${sapphireBirthId}`}
              className="core-sapphire-formation"
              initial={{ opacity: 0, scale: 0.08, rotate: -28 }}
              animate={
                isCrystallizing
                  ? {
                      opacity: [1, 1, 0],
                      scale: [1, 1.18, 0.58],
                      x: [0, -28, -205],
                      y: [0, -22, -76],
                      rotate: [0, 120, 420],
                    }
                  : { opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 }
              }
              transition={
                isCrystallizing
                  ? { duration: 1.15, ease: [0.2, 0.82, 0.2, 1] }
                  : { duration: 1.1, ease: [0.2, 0.82, 0.2, 1] }
              }
              aria-hidden="true"
            >
              <SapphireGem
                size="core"
                energized={overloadActive || refractionActive}
              />
            </motion.span>
          )}

          <span className="sphere-shine" aria-hidden="true" />
          <span className="button-label">
            <strong>
              {refractionActive
                ? 'PRISMA ACTIVO'
                : overloadActive
                  ? 'OVERLOAD'
                  : sphereFull
                    ? 'NÚCLEO LLENO'
                    : 'CLICK'}
            </strong>
            <small>
              {refractionActive
                ? `${refractionRemaining.toFixed(1)} s · ×${format.format(refractionMultiplier)}`
                : overloadActive
                  ? `${overloadRemaining.toFixed(1)} s · ×${format.format(overloadMultiplier)}`
                  : sphereFull
                    ? 'Clic para continuar sobrecarga'
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
            className="core-event-message cavitation-message"
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
            className="core-event-message overload-message"
          >
            NÚCLEO SOBRECARGADO ×{format.format(overloadBurst.multiplier)}
          </motion.div>
        )}

        {refractionBurst && (
          <motion.div
            key={refractionBurst.id}
            role="status"
            initial={{ opacity: 0, scale: 0.45, y: 24 }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0.45, 1.12, 1],
              y: [24, -14, -42],
            }}
            transition={{ duration: 1.8 }}
            className="core-event-message prestige-message"
            style={{
              color: '#f2feff',
              textShadow:
                '0 0 10px #fff, 0 0 22px rgba(84,221,255,.95), 0 0 32px rgba(111,91,255,.78)',
            }}
          >
            DESCARGA PRISMÁTICA +{format.format(refractionBurst.amount)} · ×
            {format.format(refractionBurst.multiplier)}
          </motion.div>
        )}

        {prestigeAnnouncement && (
          <motion.div
            key={prestigeAnnouncement.prestigeCount}
            role="status"
            initial={{ opacity: 0, scale: 0.65, y: 18 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.65, 1.05, 1], y: [18, -18, -38] }}
            transition={{ duration: 2.4 }}
            className="core-event-message prestige-message"
          >
            ZAFIRO ASCENDIDO · ×{format.format(prestigeAnnouncement.multiplier)}
          </motion.div>
        )}
      </div>

      {sphereFull && (
        <div className={`crystallize-control${isCrystallizing ? ' is-active' : ''}`}>
          <button
            type="button"
            onClick={onCrystallize}
            disabled={isCrystallizing}
          >
            <span>{isCrystallizing ? 'EXTRAYENDO' : 'CRISTALIZAR'}</span>
            <strong>×{format.format(nextSapphireMultiplier)} global</strong>
          </button>
          <small>
            Reinicia energía y evoluciones. El zafiro y los planos descubiertos permanecen.
          </small>
        </div>
      )}

      <div className={`sphere-status${sphereFull ? ' is-full' : ''}`}>
        <span>Núcleo líquido</span>
        <strong>
          {sphereFull ? 'Capacidad completa' : `${fill.toFixed(1)}% lleno`} · +
          {format.format(pressureBonus)}% global
        </strong>
      </div>

      {game.prestigeCount > 0 && (
        <div className="sphere-status sapphire-status" style={{ marginTop: -6 }}>
          <span>Zafiro permanente</span>
          <strong>
            ×{format.format(sapphireMultiplier)} global · Prestigio {game.prestigeCount}
          </strong>
        </div>
      )}

      {game.refractionLevel > 0 && (
        <div
          className={`sphere-status sapphire-status${refractionActive ? ' is-full' : ''}`}
          style={{ marginTop: -6 }}
        >
          <span>Matriz de refracción</span>
          <strong>
            {refractionActive
              ? `PRISMA ×${format.format(refractionMultiplier)} · ${refractionRemaining.toFixed(1)} s`
              : `${game.refractionFacetsCharged}/${refractionFacetCount} facetas · ${format.format(game.refractionOrbitProgress * 100)}% de vuelta · Próxima +${format.format(refractionReward)}`}
          </strong>
        </div>
      )}

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
