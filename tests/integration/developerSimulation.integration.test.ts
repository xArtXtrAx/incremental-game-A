import { beforeEach, describe, expect, it } from 'vitest'
import { resetOfficialBalanceConfig } from '../../src/balanceRuntime'
import {
  gameReducer,
  initialGameState,
  type GameState,
} from '../../src/game'
import {
  DEVELOPER_MAX_STEP_SECONDS,
  advanceGameStateBySeconds,
  getDeveloperSimulationMetrics,
  normalizeDeveloperStepSeconds,
} from '../../src/developerSimulation'

function advanceManually(
  state: GameState,
  startNow: number,
  seconds: number,
) {
  let nextState = { ...state }
  let now = startNow
  for (let index = 0; index < seconds; index += 1) {
    now += 1_000
    nextState = gameReducer(nextState, { type: 'tick', now })
  }
  return { state: nextState, now }
}

describe('simulación determinista del Centro DEV', () => {
  beforeEach(() => {
    resetOfficialBalanceConfig()
  })

  it('reproduce exactamente ticks consecutivos del reducer', () => {
    const state: GameState = {
      ...initialGameState,
      generatorLevel: 3,
      resonanceLevel: 2,
      autoclickLevel: 2,
      clickLevel: 1,
    }
    const expected = advanceManually(state, 10_000, 25)
    const result = advanceGameStateBySeconds(state, 10_000, 25)

    expect(result.seconds).toBe(25)
    expect(result.now).toBe(expected.now)
    expect(result.state).toEqual(expected.state)
  })

  it('no muta el estado recibido', () => {
    const state = { ...initialGameState, generatorLevel: 1 }
    const original = { ...state }

    advanceGameStateBySeconds(state, 1_000, 10)

    expect(state).toEqual(original)
  })

  it('limita cada operación a una hora', () => {
    expect(normalizeDeveloperStepSeconds(99_999)).toBe(
      DEVELOPER_MAX_STEP_SECONDS,
    )
    expect(normalizeDeveloperStepSeconds(-1)).toBe(0)
    expect(normalizeDeveloperStepSeconds(Number.NaN)).toBe(0)
  })

  it('calcula métricas con las funciones autoritativas del juego', () => {
    const metrics = getDeveloperSimulationMetrics(
      {
        ...initialGameState,
        manualClicks: 2_500,
        clickLevel: 2,
        generatorLevel: 2,
        resonanceLevel: 1,
        pressureLevel: 2,
        autoclickLevel: 1,
        prestigeCount: 1,
      },
      100_000,
    )

    expect(metrics.sphereCapacity).toBe(5_000)
    expect(metrics.sphereFillPercent).toBe(50)
    expect(metrics.clicksRemainingToCore).toBe(2_500)
    expect(metrics.energyPerSecond).toBeGreaterThan(0)
    expect(metrics.clickPower).toBeGreaterThan(0)
    expect(metrics.autoclicksPerSecond).toBeGreaterThan(0)
    expect(metrics.estimatedSecondsToCore).toBeGreaterThan(0)
  })

  it('declara tiempo indeterminado cuando no existe producción automática de clics', () => {
    const metrics = getDeveloperSimulationMetrics(
      { ...initialGameState, manualClicks: 100 },
      100_000,
    )

    expect(metrics.autoclicksPerSecond).toBe(0)
    expect(metrics.estimatedSecondsToCore).toBeNull()
  })
})
