import { useEffect, useReducer, useRef, useState } from 'react'
import './App.css'
import { GameCore, type ClickBurst, type EnergyBurst, type OverloadBurst } from './GameCore'
import { UpgradesPanel } from './UpgradesPanel'
import {
  clearSavedGame,
  gameReducer,
  getClickOutcome,
  getOverloadMultiplier,
  initialGameState,
  loadGameState,
  saveGameState,
} from './game'

function App() {
  const [game, dispatch] = useReducer(gameReducer, initialGameState, loadGameState)
  const [bursts, setBursts] = useState<ClickBurst[]>([])
  const [cavitationBurst, setCavitationBurst] = useState<EnergyBurst | null>(null)
  const [overloadBurst, setOverloadBurst] = useState<OverloadBurst | null>(null)
  const [clockNow, setClockNow] = useState(() => Date.now())
  const [resetArmed, setResetArmed] = useState(false)
  const nextBurstId = useRef(0)
  const nextCavitationId = useRef(0)
  const nextOverloadId = useRef(0)

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
    if (game.overloadUntil <= now) return
    setClockNow(now)
    const id = window.setInterval(() => setClockNow(Date.now()), 100)
    return () => window.clearInterval(id)
  }, [game.overloadUntil])

  useEffect(() => saveGameState(game), [game])

  useEffect(() => {
    if (!resetArmed) return
    const id = window.setTimeout(() => setResetArmed(false), 6000)
    return () => window.clearTimeout(id)
  }, [resetArmed])

  function handleClick() {
    const now = Date.now()
    const outcome = getClickOutcome(game, now)
    const burstId = nextBurstId.current++
    setClockNow(now)
    dispatch({ type: 'click', now })
    setBursts((items) => [...items, { id: burstId, amount: outcome.clickEnergy }])
    window.setTimeout(() => setBursts((items) => items.filter((item) => item.id !== burstId)), 850)

    if (outcome.cavitationTriggered && outcome.cavitationEnergy > 0) {
      const id = nextCavitationId.current++
      setCavitationBurst({ id, amount: outcome.cavitationEnergy })
      window.setTimeout(() => setCavitationBurst((item) => item?.id === id ? null : item), 1500)
    }
    if (outcome.overloadTriggered) {
      const id = nextOverloadId.current++
      setOverloadBurst({ id, multiplier: getOverloadMultiplier(game.overloadLevel) })
      window.setTimeout(() => setOverloadBurst((item) => item?.id === id ? null : item), 1800)
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
          <p className="eyebrow">Prototipo incremental</p>
          <h1>Incremental Game A</h1>
          <p className="instructions">Genera energía, llena el núcleo y libera su sobrecarga.</p>
        </header>
        <div className="game-layout">
          <GameCore game={game} clockNow={clockNow} bursts={bursts} cavitationBurst={cavitationBurst} overloadBurst={overloadBurst} onClick={handleClick} />
          <UpgradesPanel game={game} clockNow={clockNow} dispatch={dispatch} resetArmed={resetArmed} onReset={handleReset} />
        </div>
      </section>
    </main>
  )
}

export default App
