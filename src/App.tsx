import { useEffect, useReducer, useRef, useState } from 'react'
import './App.css'
import './ProposalA.css'
import './PrestigeSapphire.css'
import { BulkPurchaseControls } from './BulkPurchaseControls'
import type { BulkPurchasePlan } from './bulkPurchase'
import {
  DeveloperPanel,
  sanitizeDeveloperValues,
  type DeveloperValues,
} from './DeveloperPanel'
import {
  GameCore,
  type ClickBurst,
  type EnergyBurst,
  type OverloadBurst,
  type PrestigeAnnouncement,
  type RefractionBurst,
} from './GameCore'
import { UpgradesPanel } from './UpgradesPanelCompact'
import {
  clearSavedGame,
  gameReducer,
  getAutoclickRate,
  getClickOutcome,
  getClickPower,
  getEnergyPerSecond,
  getNextSapphireMultiplier,
  getOverloadMultiplier,
  getOverloadRemainingSeconds,
  getPressureBonusPercent,
  getSapphireMultiplier,
  initialGameState,
  isOverloadActive,
  loadGameState,
  saveGameState,
  SPHERE_CLICK_CAPACITY,
  type GameAction,
  type GameState,
} from './game'
import {
  getRefractionBonusMultiplier,
  isRefractionActive,
} from './refraction'

type MobileView = 'core' | 'upgrades'
type AppAction =
  | GameAction
  | { type: 'developer-set-values'; values: DeveloperValues }
  | { type: 'apply-bulk-purchase'; state: GameState }

const format = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 2 })

function appReducer(state: GameState, action: AppAction): GameState {
  if (action.type === 'apply-bulk-purchase') {
    return action.state
  }

  if (action.type === 'developer-set-values') {
    const values = sanitizeDeveloperValues(action.values)
    const sphereBelowCapacity = values.manualClicks < SPHERE_CLICK_CAPACITY

    return {
      ...state,
      energy: values.energy,
      manualClicks: values.manualClicks,
      overloadCharge: sphereBelowCapacity ? 0 : state.overloadCharge,
      overloadUntil: sphereBelowCapacity ? 0 : state.overloadUntil,
    }
  }

  return gameReducer(state, action)
}

function App() {
  const [game, dispatch] = useReducer(appReducer, initialGameState, loadGameState)
  const [bursts, setBursts] = useState<ClickBurst[]>([])
  const [cavitationBurst, setCavitationBurst] = useState<EnergyBurst | null>(null)
  const [overloadBurst, setOverloadBurst] = useState<OverloadBurst | null>(null)
  const [refractionBurst, setRefractionBurst] =
    useState<RefractionBurst | null>(null)
  const [clockNow, setClockNow] = useState(() => Date.now())
  const [resetArmed, setResetArmed] = useState(false)
  const [mobileView, setMobileView] = useState<MobileView>('core')
  const [sapphireBirthId, setSapphireBirthId] = useState(0)
  const [isCrystallizing, setIsCrystallizing] = useState(false)
  const [prestigeAnnouncement, setPrestigeAnnouncement] =
    useState<PrestigeAnnouncement | null>(null)
  const nextBurstId = useRef(0)
  const nextCavitationId = useRef(0)
  const nextOverloadId = useRef(0)
  const nextRefractionId = useRef(0)
  const previousClicks = useRef(game.manualClicks)
  const previousRefractionDischargeCount = useRef(
    game.refractionDischargeCount,
  )
  const refractionBurstTimer = useRef<number | null>(null)
  const crystallizeTimers = useRef<number[]>([])

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

    if (game.overloadUntil <= now && game.refractionUntil <= now) {
      return
    }

    setClockNow(now)
    const id = window.setInterval(() => setClockNow(Date.now()), 100)
    return () => window.clearInterval(id)
  }, [game.overloadUntil, game.refractionUntil])

  useEffect(() => saveGameState(game), [game])

  useEffect(() => {
    if (
      previousClicks.current < SPHERE_CLICK_CAPACITY &&
      game.manualClicks >= SPHERE_CLICK_CAPACITY
    ) {
      setSapphireBirthId((current) => current + 1)
    }

    previousClicks.current = game.manualClicks
  }, [game.manualClicks])

  useEffect(() => {
    const previousCount = previousRefractionDischargeCount.current

    if (game.refractionDischargeCount > previousCount) {
      const id = nextRefractionId.current++
      setRefractionBurst({
        id,
        amount: game.refractionLastReward,
        multiplier: getRefractionBonusMultiplier(game.refractionLevel),
      })
      if (refractionBurstTimer.current !== null) {
        window.clearTimeout(refractionBurstTimer.current)
      }
      refractionBurstTimer.current = window.setTimeout(() => {
        setRefractionBurst((item) => (item?.id === id ? null : item))
        refractionBurstTimer.current = null
      }, 1900)

      previousRefractionDischargeCount.current =
        game.refractionDischargeCount
    }

    previousRefractionDischargeCount.current = game.refractionDischargeCount
  }, [
    game.refractionDischargeCount,
    game.refractionLastReward,
    game.refractionLevel,
  ])

  useEffect(() => {
    if (!resetArmed) {
      return
    }

    const id = window.setTimeout(() => setResetArmed(false), 6000)
    return () => window.clearTimeout(id)
  }, [resetArmed])

  useEffect(
    () => () => {
      crystallizeTimers.current.forEach((timer) => window.clearTimeout(timer))
      if (refractionBurstTimer.current !== null) {
        window.clearTimeout(refractionBurstTimer.current)
      }
    },
    [],
  )

  function handleClick() {
    if (isCrystallizing) {
      return
    }

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

  function handleCrystallize() {
    if (isCrystallizing || game.manualClicks < SPHERE_CLICK_CAPACITY) {
      return
    }

    crystallizeTimers.current.forEach((timer) => window.clearTimeout(timer))
    crystallizeTimers.current = []
    setIsCrystallizing(true)

    const nextPrestigeCount = game.prestigeCount + 1
    const nextMultiplier = getNextSapphireMultiplier(game.prestigeCount)

    crystallizeTimers.current.push(
      window.setTimeout(() => {
        dispatch({ type: 'crystallize' })
        setRefractionBurst(null)
        setPrestigeAnnouncement({
          prestigeCount: nextPrestigeCount,
          multiplier: nextMultiplier,
        })
      }, 1100),
      window.setTimeout(() => setIsCrystallizing(false), 1760),
      window.setTimeout(() => setPrestigeAnnouncement(null), 3300),
    )
  }

  function handleReset() {
    if (!resetArmed) {
      setResetArmed(true)
      return
    }

    crystallizeTimers.current.forEach((timer) => window.clearTimeout(timer))
    crystallizeTimers.current = []
    clearSavedGame()
    if (refractionBurstTimer.current !== null) {
      window.clearTimeout(refractionBurstTimer.current)
      refractionBurstTimer.current = null
    }
    dispatch({ type: 'reset' })
    setBursts([])
    setCavitationBurst(null)
    setOverloadBurst(null)
    setRefractionBurst(null)
    setPrestigeAnnouncement(null)
    setIsCrystallizing(false)
    setResetArmed(false)
  }

  function handleDeveloperValues(values: DeveloperValues) {
    if (isCrystallizing) {
      return
    }

    setClockNow(Date.now())
    dispatch({ type: 'developer-set-values', values })
  }

  function handleBulkPurchase(plan: BulkPurchasePlan) {
    if (isCrystallizing || plan.purchases.length === 0) {
      return
    }

    dispatch({ type: 'apply-bulk-purchase', state: plan.finalState })
  }

  return (
    <main className="game-screen">
      <div className="game-workspace">
        <section className="game-panel">
          <header className="game-header">
            <div className="header-copy">
              <p className="eyebrow">Prototipo incremental</p>
              <h1>Incremental Game A</h1>
              <p className="instructions">
                Llena el núcleo, cristaliza su energía y fortalece el zafiro permanente.
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
              <div
                className={`summary-item sapphire-summary${game.prestigeCount > 0 ? ' is-active' : ''}`}
              >
                <span>Zafiro</span>
                <strong>
                  {game.prestigeCount > 0
                    ? `×${format.format(sapphireMultiplier)} · P${game.prestigeCount}`
                    : 'Sin cristalizar'}
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
                refractionBurst={refractionBurst}
                sapphireBirthId={sapphireBirthId}
                isCrystallizing={isCrystallizing}
                prestigeAnnouncement={prestigeAnnouncement}
                onClick={handleClick}
                onCrystallize={handleCrystallize}
              />
            </div>

            <div
              className={`layout-section upgrades-layout-section${
                mobileView === 'upgrades' ? ' is-mobile-active' : ''
              }`}
            >
              <BulkPurchaseControls
                game={game}
                disabled={isCrystallizing}
                onApply={handleBulkPurchase}
              />
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

        <DeveloperPanel
          energy={game.energy}
          manualClicks={game.manualClicks}
          disabled={isCrystallizing}
          onApply={handleDeveloperValues}
        />
      </div>
    </main>
  )
}

export default App
