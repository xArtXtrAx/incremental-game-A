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
  getSphereFillPercentage,
  initialGameState,
  loadGameState,
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
  maximumFractionDigits: 0,
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

  const clickPower = getClickPower(game.clickLevel)
  const energyPerSecond = getEnergyPerSecond(game.generatorLevel)
  const clickUpgradeCost = getClickUpgradeCost(game.clickLevel)
  const generatorCost = getGeneratorCost(game.generatorLevel)
  const sphereFillPercentage = getSphereFillPercentage(game.manualClicks)
  const sphereClicks = Math.min(game.manualClicks, SPHERE_CLICK_CAPACITY)
  const sphereIsFull = sphereFillPercentage >= 100
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
    nextBurstId.current += 1

    dispatch({ type: 'click' })
    setBursts((currentBursts) => [
      ...currentBursts,
      { id: burstId, amount: clickPower },
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
            Genera energía, mejora el núcleo y automatiza la producción.
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
                aria-label={`Generar ${clickPower} de energía. Esfera en ${sphereFillPercentage.toFixed(1)} por ciento.`}
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
                    +{burst.amount}
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
                  ? 'Capacidad completa'
                  : `${sphereFillPercentage.toFixed(1)}% lleno`}
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
              <p className="eyebrow">Primeras evoluciones</p>
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
              <p>Aumenta en 1 la energía obtenida con cada clic manual.</p>
              <div className="upgrade-effect">
                Siguiente nivel: +{numberFormatter.format(clickPower + 1)} por clic
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
              <p>Produce 1 de energía por segundo por cada nivel comprado.</p>
              <div className="upgrade-effect">
                Siguiente nivel: +{numberFormatter.format(energyPerSecond + 1)}/s
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
