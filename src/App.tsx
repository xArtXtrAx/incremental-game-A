import {
  type CSSProperties,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react'
import { motion } from 'motion/react'
import './App.css'
import {
  clearSavedGame,
  gameReducer,
  getClickPower,
  getClickUpgradeCost,
  getEnergyPerSecond,
  getGeneratorCost,
  getPressureBonusPercent,
  getPressureCost,
  getPressureTier,
  getResonanceCost,
  getResonanceMultiplier,
  getSphereFillPercentage,
  initialGameState,
  loadGameState,
  PRESSURE_REQUIRED_CLICKS,
  saveGameState,
  SPHERE_CLICK_CAPACITY,
} from './game'

type ClickBurst = {
  id: number
  amount: number
}

type SphereStyle = CSSProperties & {
  '--fill-level': string
  '--liquid-opacity': number
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

const numberFormatter = new Intl.NumberFormat('es-MX', {
  maximumFractionDigits: 2,
})

function App() {
  const [game, dispatch] = useReducer(
    gameReducer,
    initialGameState,
    loadGameState,
  )
  const [bursts, setBursts] = useState<ClickBurst[]>([])
  const [resetArmed, setResetArmed] = useState(false)
  const nextBurstId = useRef(0)

  const sphereFillPercentage = getSphereFillPercentage(game.manualClicks)
  const sphereClicks = Math.min(game.manualClicks, SPHERE_CLICK_CAPACITY)
  const sphereIsFull = sphereFillPercentage >= 100
  const pressureTier = getPressureTier(game.manualClicks)
  const pressureBonusPercent = getPressureBonusPercent(
    game.manualClicks,
    game.pressureLevel,
  )
  const clickPower = getClickPower(
    game.clickLevel,
    game.manualClicks,
    game.pressureLevel,
  )
  const nextClickPower = getClickPower(
    game.clickLevel + 1,
    game.manualClicks,
    game.pressureLevel,
  )
  const resonanceMultiplier = getResonanceMultiplier(game.resonanceLevel)
  const energyPerSecond = getEnergyPerSecond(
    game.generatorLevel,
    game.resonanceLevel,
    game.manualClicks,
    game.pressureLevel,
  )
  const nextGeneratorProduction = getEnergyPerSecond(
    game.generatorLevel + 1,
    game.resonanceLevel,
    game.manualClicks,
    game.pressureLevel,
  )
  const nextResonanceProduction = getEnergyPerSecond(
    game.generatorLevel,
    game.resonanceLevel + 1,
    game.manualClicks,
    game.pressureLevel,
  )
  const nextPressureBonusPercent = getPressureBonusPercent(
    game.manualClicks,
    game.pressureLevel + 1,
  )
  const nextPressureClickPower = getClickPower(
    game.clickLevel,
    game.manualClicks,
    game.pressureLevel + 1,
  )
  const nextPressureProduction = getEnergyPerSecond(
    game.generatorLevel,
    game.resonanceLevel,
    game.manualClicks,
    game.pressureLevel + 1,
  )
  const clickUpgradeCost = getClickUpgradeCost(game.clickLevel)
  const generatorCost = getGeneratorCost(game.generatorLevel)
  const resonanceCost = getResonanceCost(game.resonanceLevel)
  const pressureCost = getPressureCost(game.pressureLevel)
  const canBuyResonance =
    game.generatorLevel > 0 && game.energy >= resonanceCost
  const canBuyPressure =
    game.manualClicks >= PRESSURE_REQUIRED_CLICKS && game.energy >= pressureCost
  const nextPressureTierClicks = Math.min(
    (pressureTier + 1) * (SPHERE_CLICK_CAPACITY / 10),
    SPHERE_CLICK_CAPACITY,
  )
  const pressureVisualOpacity =
    game.pressureLevel > 0
      ? Math.min(
          0.22 + sphereFillPercentage / 140 + game.pressureLevel * 0.08,
          1,
        )
      : 0
  const pressurePulseDuration = Math.max(2.8, 6 - game.pressureLevel * 0.4)
  const sphereStyle: SphereStyle = {
    '--fill-level': `${sphereFillPercentage}%`,
    '--liquid-opacity': sphereClicks > 0 ? 1 : 0,
  }

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      dispatch({ type: 'tick' })
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    saveGameState(game)
  }, [game])

  useEffect(() => {
    if (!resetArmed) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setResetArmed(false)
    }, 6000)

    return () => window.clearTimeout(timeoutId)
  }, [resetArmed])

  function handleClick() {
    const burstId = nextBurstId.current
    const nextManualClicks = game.manualClicks + 1
    const clickAmount = getClickPower(
      game.clickLevel,
      nextManualClicks,
      game.pressureLevel,
    )
    nextBurstId.current += 1

    dispatch({ type: 'click' })
    setBursts((currentBursts) => [
      ...currentBursts,
      { id: burstId, amount: clickAmount },
    ])

    window.setTimeout(() => {
      setBursts((currentBursts) =>
        currentBursts.filter((burst) => burst.id !== burstId),
      )
    }, 850)
  }

  function handleReset() {
    if (!resetArmed) {
      setResetArmed(true)
      return
    }

    clearSavedGame()
    dispatch({ type: 'reset' })
    setBursts([])
    setResetArmed(false)
  }

  return (
    <main className="game-screen">
      <section className="game-panel">
        <header className="game-header">
          <p className="eyebrow">Prototipo incremental</p>
          <h1>Incremental Game A</h1>
          <p className="instructions">
            Genera energía, llena el núcleo y transforma su presión en potencia.
          </p>
        </header>

        <div className="game-layout">
          <section className="core-column" aria-label="Núcleo de energía">
            <div className="energy-display" aria-live="polite">
              <span>Energía</span>
              <strong>{numberFormatter.format(game.energy)}</strong>
              <small>+{numberFormatter.format(energyPerSecond)} por segundo</small>
            </div>

            <div className="button-stage">
              <motion.button
                type="button"
                className="click-button"
                style={sphereStyle}
                onClick={handleClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                aria-label={`Generar ${clickPower} de energía. Esfera en ${sphereFillPercentage.toFixed(1)} por ciento. Bonificación global de ${pressureBonusPercent} por ciento.`}
              >
                <span className="sphere-liquid" aria-hidden="true">
                  <span className="liquid-body" />
                  <span className="liquid-wave liquid-wave-back" />
                  <span className="liquid-wave liquid-wave-front" />
                  <span className="liquid-bubble bubble-one" />
                  <span className="liquid-bubble bubble-two" />
                  <span className="liquid-bubble bubble-three" />
                </span>
                <span className="sphere-depth" aria-hidden="true" />
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 4,
                    opacity: pressureVisualOpacity,
                    pointerEvents: 'none',
                  }}
                >
                  {[0, 1, 2].map((ring) => (
                    <motion.span
                      key={ring}
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: 92,
                        height: 42,
                        marginTop: -21,
                        marginLeft: -46,
                        border: '1px solid rgba(83, 207, 255, 0.72)',
                        borderRadius: '50%',
                        boxShadow: '0 0 12px rgba(0, 155, 255, 0.35)',
                      }}
                      initial={{ scale: 0.38, opacity: 0 }}
                      animate={{
                        scale: [0.38, 0.72, 1.08],
                        opacity: [0, 0.72, 0],
                      }}
                      transition={{
                        duration: pressurePulseDuration,
                        delay: ring * 0.75,
                        repeat: Infinity,
                        ease: 'easeOut',
                      }}
                    />
                  ))}
                </span>
                <span className="sphere-shine" aria-hidden="true" />
                <span className="button-label">
                  <strong>CLICK</strong>
                  <small>
                    {numberFormatter.format(sphereClicks)} /{' '}
                    {numberFormatter.format(SPHERE_CLICK_CAPACITY)}
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
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  >
                    +{numberFormatter.format(burst.amount)}
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
                      transition={{ duration: 0.65, ease: 'easeOut' }}
                    />
                  ))}
                </div>
              ))}
            </div>

            <div className={`sphere-status${sphereIsFull ? ' is-full' : ''}`}>
              <span>Núcleo líquido</span>
              <strong>
                {sphereIsFull
                  ? `Capacidad completa · +${numberFormatter.format(pressureBonusPercent)}% global`
                  : `${sphereFillPercentage.toFixed(1)}% lleno · +${numberFormatter.format(pressureBonusPercent)}% global`}
              </strong>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <span>Por clic</span>
                <strong>+{numberFormatter.format(clickPower)}</strong>
              </div>
              <div className="stat-card">
                <span>Automática</span>
                <strong>+{numberFormatter.format(energyPerSecond)}/s</strong>
              </div>
              <div className="stat-card">
                <span>Clics manuales</span>
                <strong>{numberFormatter.format(game.manualClicks)}</strong>
              </div>
            </div>
          </section>

          <aside className="upgrades-panel" aria-labelledby="upgrades-title">
            <div className="upgrades-heading">
              <p className="eyebrow">Evoluciones disponibles</p>
              <h2 id="upgrades-title">Mejoras</h2>
            </div>

            <article className="upgrade-card">
              <div className="upgrade-card-header">
                <div>
                  <span className="upgrade-number">Evolución 01</span>
                  <h3>Amplificador de pulso</h3>
                </div>
                <span className="level-badge">Nivel {game.clickLevel}</span>
              </div>
              <p>Aumenta en 1 la energía base obtenida con cada clic manual.</p>
              <div className="upgrade-effect">
                Siguiente nivel: +{numberFormatter.format(nextClickPower)} por clic
              </div>
              <button
                type="button"
                className="upgrade-button"
                onClick={() => dispatch({ type: 'buy-click-upgrade' })}
                disabled={game.energy < clickUpgradeCost}
              >
                <span>Mejorar</span>
                <strong>{numberFormatter.format(clickUpgradeCost)} energía</strong>
              </button>
            </article>

            <article className="upgrade-card">
              <div className="upgrade-card-header">
                <div>
                  <span className="upgrade-number">Evolución 02</span>
                  <h3>Microgenerador</h3>
                </div>
                <span className="level-badge">Nivel {game.generatorLevel}</span>
              </div>
              <p>
                Cada unidad recibe los multiplicadores de resonancia y presión.
              </p>
              <div className="upgrade-effect">
                Siguiente nivel: {numberFormatter.format(nextGeneratorProduction)}{' '}
                energía/s total
              </div>
              <button
                type="button"
                className="upgrade-button"
                onClick={() => dispatch({ type: 'buy-generator' })}
                disabled={game.energy < generatorCost}
              >
                <span>Construir</span>
                <strong>{numberFormatter.format(generatorCost)} energía</strong>
              </button>
            </article>

            <article className="upgrade-card">
              <div className="upgrade-card-header">
                <div>
                  <span className="upgrade-number">Evolución 03</span>
                  <h3>Reactor de resonancia</h3>
                </div>
                <span className="level-badge">Nivel {game.resonanceLevel}</span>
              </div>
              <p>
                Aumenta en 100% la producción base de todos los microgeneradores.
              </p>
              <div className="upgrade-effect">
                Resonancia: ×{numberFormatter.format(resonanceMultiplier)} → ×
                {numberFormatter.format(resonanceMultiplier + 1)} · Producción:{' '}
                {numberFormatter.format(nextResonanceProduction)}/s
              </div>
              <button
                type="button"
                className="upgrade-button"
                onClick={() => dispatch({ type: 'buy-resonance' })}
                disabled={!canBuyResonance}
              >
                <span>Sincronizar</span>
                <strong>
                  {game.generatorLevel === 0
                    ? 'Requiere microgenerador'
                    : `${numberFormatter.format(resonanceCost)} energía`}
                </strong>
              </button>
            </article>

            <article className="upgrade-card">
              <div className="upgrade-card-header">
                <div>
                  <span className="upgrade-number">Evolución 04</span>
                  <h3>Condensador de presión</h3>
                </div>
                <span className="level-badge">Nivel {game.pressureLevel}</span>
              </div>
              <p>
                Cada nivel concede +2% global por cada tramo completo del 10% de
                llenado. Potencia clics y producción automática.
              </p>
              <div className="upgrade-effect">
                <span style={{ display: 'block' }}>
                  Tramos activos: {pressureTier}/10 · Bono: +
                  {numberFormatter.format(pressureBonusPercent)}% → +
                  {numberFormatter.format(nextPressureBonusPercent)}%
                </span>
                <small style={{ display: 'block', marginTop: 5 }}>
                  Próximo nivel: +{numberFormatter.format(nextPressureClickPower)}{' '}
                  por clic · +{numberFormatter.format(nextPressureProduction)}/s
                  {pressureTier < 10
                    ? ` · Próximo tramo a ${numberFormatter.format(nextPressureTierClicks)} clics`
                    : ''}
                </small>
              </div>
              <button
                type="button"
                className="upgrade-button"
                onClick={() => dispatch({ type: 'buy-pressure' })}
                disabled={!canBuyPressure}
              >
                <span>Presurizar</span>
                <strong>
                  {game.manualClicks < PRESSURE_REQUIRED_CLICKS
                    ? `Requiere ${numberFormatter.format(PRESSURE_REQUIRED_CLICKS)} clics`
                    : `${numberFormatter.format(pressureCost)} energía`}
                </strong>
              </button>
            </article>

            <div className="save-controls">
              <div className="save-status">
                <span className="save-dot" aria-hidden="true" />
                <div>
                  <strong>Guardado automático</strong>
                  <small>El progreso se conserva en este navegador.</small>
                </div>
              </div>
              <button
                type="button"
                className={`reset-button${resetArmed ? ' is-armed' : ''}`}
                onClick={handleReset}
              >
                {resetArmed ? 'Confirmar reinicio total' : 'Reiniciar progreso'}
              </button>
              {resetArmed && (
                <p className="reset-warning" role="status">
                  Presiona otra vez antes de 6 segundos. Esta acción borra todo.
                </p>
              )}
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}

export default App
