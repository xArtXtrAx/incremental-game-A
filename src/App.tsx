import { useEffect, useReducer, useRef, useState } from 'react'
import './App.css'
import './ProposalA.css'
import {
  GameCore,
  type ClickBurst,
  type EnergyBurst,
  type OverloadBurst,
} from './GameCore'
import { UpgradesPanel } from './UpgradesPanelCompact'
import {
  clearSavedGame,
  gameReducer,
  getAutoclickRate,
  getClickOutcome,
  getClickPower,
  getEnergyPerSecond,
  getOverloadMultiplier,
  getOverloadRemainingSeconds,
  getPressureBonusPercent,
  initialGameState,
  isOverloadActive,
  loadGameState,
  saveGameState,
} from './game'

type MobileView = 'core' | 'upgrades'

const format = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 2 })

function App() {
  const [game, dispatch] = useReducer(gameReducer, initialGameState, loadGameState)
  const [bursts, setBursts] = useState<ClickBurst[]>([])
  const [cavitationBurst, setCavitationBurst] = useState<EnergyBurst | null>(null)
  const [overloadBurst, setOverloadBurst] = useState<OverloadBurst | null>(null)
  const [clockNow, setClockNow] = useState(() => Date.now())
  const [resetArmed, setResetArmed] = useState(false)
  const [mobileView, setMobileView] = useState<MobileView>('core')
  const nextBurstId = useRef(0)
  const nextCavitationId = useRef(0)
  const nextOverloadId = useRef(0)

  const overloadActive = isOverloadActive(game.overloadUntil, clockNow)
  const overloadMultiplier = overloadActive
    ? getOverloadMultiplier(game.overloadLevel)
    : 1
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
  const autoclickRate = getAutoclickRate(game.autoclickLevel)
  const pressureBonus = getPressureBonusPercent(
    game.manualClicks,
    game.pressureLevel,
  )
  const overloadRemaining = getOverloadRemainingSeconds(
    game.overloadUntil,
    clockNow,
  )

  useEffect(() => {
    const id = window.setInterval(() => {
      const now = Date.now()
      setClockNow(now)
      dispatch({ type: 'tick', now })
    }, 1000)

    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    const now = Date.now()

    if (game.overloadUntil <= now) {
      return
    }

    setClockNow(now)
    const id = window.setInterval(() => setClockNow(Date.now()), 100)
    return () => window.clearInterval(id)
  }, [game.overloadUntil])

  useEffect(() => saveGameState(game), [game])

  useEffect(() => {
    if (!resetArmed) {
      return
    }

    const id = window.setTimeout(() => setResetArmed(false), 6000)
    return () => window.clearTimeout(id)
  }, [resetArmed])

  function handleClick() {
    const now = Date.now()
    const outcome = getClickOutcome(game, now)
    const burstId = nextBurstId.current++

    setClockNow(now)
    dispatch({ type: 'click', now })
    setBursts((items) => [
      ...items,
      { id: burstId, amount: outcome.clickEnergy },
    ])

    window.setTimeout(() => {
      setBursts((items) => items.filter((item) => item.id !== burstId))
    }, 850)

    if (outcome.cavitationTriggered && outcome.cavitationEnergy > 0) {
      const id = nextCavitationId.current++
      setCavitationBurst({ id, amount: outcome.cavitationEnergy })
      window.setTimeout(() => {
        setCavitationBurst((item) => (item?.id === id ? null : item))
      }, 1500)
    }

    if (outcome.overloadTriggered) {
      const id = nextOverloadId.current++
      setOverloadBurst({
        id,
        multiplier: getOverloadMultiplier(game.overloadLevel),
      })
      window.setTimeout(() => {
        setOverloadBurst((item) => (item?.id === id ? null : item))
      }, 1800)
    }
  }

  function handleReset() {
    if (!resetArmed) {
      setResetArmed(true)
      return
    }

    clearSavedGame()
    dispatch({ type: 'reset' })
    setBursts([])
    setCavitationBurst(null)
    setOverloadBurst(null)
    setResetArmed(false)
  }

  return (
    <main className="game-screen">
      <section className="game-panel">
        <header className="game-header">
          <div className="header-copy">
            <p className="eyebrow">Prototipo incremental</p>
            <h1>Incremental Game A</h1>
            <p className="instructions">
              El núcleo permanece visible mientras navegas por evoluciones compactas.
            </p>
          </div>

          <div className="summary-strip" aria-label="Resumen de producción">
            <div className="summary-item">
              <span>Energía</span>
              <strong>{format.format(game.energy)}</strong>
            </div>
            <div className="summary-item">
              <span>Por clic</span>
              <strong>+{format.format(clickPower)}</strong>
            </div>
            <div className="summary-item">
              <span>Producción</span>
              <strong>
                +{format.format(production)}/s
                {autoclickRate > 0
                  ? ` · ${format.format(autoclickRate)} clic/s`
                  : ''}
              </strong>
            </div>
            <div className="summary-item">
              <span>Presión</span>
              <strong>+{format.format(pressureBonus)}%</strong>
            </div>
            <div className={`summary-item${overloadActive ? ' is-active' : ''}`}>
              <span>Sobrecarga</span>
              <strong>
                {overloadActive
                  ? `×${format.format(overloadMultiplier)} · ${overloadRemaining.toFixed(1)} s`
                  : `${game.overloadCharge}`}
              </strong>
            </div>
          </div>
        </header>

        <nav className="mobile-section-tabs" aria-label="Secciones principales">
          <button
            type="button"
            className={mobileView === 'core' ? 'is-active' : ''}
            aria-pressed={mobileView === 'core'}
            onClick={() => setMobileView('core')}
          >
            Núcleo
          </button>
          <button
            type="button"
            className={mobileView === 'upgrades' ? 'is-active' : ''}
            aria-pressed={mobileView === 'upgrades'}
            onClick={() => setMobileView('upgrades')}
          >
            Evoluciones
          </button>
        </nav>

        <div className="game-layout">
          <div
            className={`layout-section core-layout-section${
              mobileView === 'core' ? ' is-mobile-active' : ''
            }`}
          >
            <GameCore
              game={game}
              clockNow={clockNow}
              bursts={bursts}
              cavitationBurst={cavitationBurst}
              overloadBurst={overloadBurst}
              onClick={handleClick}
            />
          </div>

          <div
            className={`layout-section upgrades-layout-section${
              mobileView === 'upgrades' ? ' is-mobile-active' : ''
            }`}
          >
            <UpgradesPanel
              game={game}
              clockNow={clockNow}
              dispatch={dispatch}
              resetArmed={resetArmed}
              onReset={handleReset}
            />
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
