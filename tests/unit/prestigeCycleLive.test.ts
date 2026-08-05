import { describe, expect, it } from 'vitest'
import type { DeveloperExperimentSnapshot } from '../../src/developerExperimentBridge'
import { initialGameState } from '../../src/game'
import {
  advanceLivePrestigeCycleState,
  createLivePrestigeCycleState,
  getLiveAverageCycleSeconds,
  getLiveCycleElapsedSeconds,
} from '../../src/prestigeCycleLive'

function snapshot(
  clockNow: number,
  prestigeCount: number,
  manualClicks: number,
): DeveloperExperimentSnapshot {
  return {
    state: { ...initialGameState, prestigeCount, manualClicks },
    clockNow,
    paused: false,
    experimental: false,
    baselineAvailable: false,
  }
}

describe('seguimiento en vivo de ciclos de prestigio', () => {
  it('inicia una observación desde el snapshot actual', () => {
    const state = createLivePrestigeCycleState(snapshot(1_000, 3, 120))

    expect(state.prestigeCount).toBe(3)
    expect(state.cycleStartedAt).toBe(1_000)
    expect(state.completedCycles).toEqual([])
    expect(getLiveCycleElapsedSeconds(state)).toBe(0)
  })

  it('calcula el ritmo reciente de clics sin usar valores negativos', () => {
    let state = createLivePrestigeCycleState(snapshot(0, 1, 100))
    state = advanceLivePrestigeCycleState(state, snapshot(1_000, 1, 106))
    state = advanceLivePrestigeCycleState(state, snapshot(2_000, 1, 112))

    expect(state.recentClickRate).toBe(6)
    expect(state.completedCycles).toHaveLength(0)
  })

  it('registra una cristalización y abre el ciclo siguiente', () => {
    let state = createLivePrestigeCycleState(snapshot(10_000, 5, 4_900))
    state = advanceLivePrestigeCycleState(state, snapshot(25_000, 6, 0))

    expect(state.completedCycles).toHaveLength(1)
    expect(state.completedCycles[0]).toEqual(
      expect.objectContaining({
        prestigeBefore: 5,
        prestigeAfter: 6,
        durationSeconds: 15,
        sapphireMultiplier: 3.05,
        nextSapphireMultiplier: 3.55,
      }),
    )
    expect(state.cycleStartedAt).toBe(25_000)
    expect(state.prestigeCount).toBe(6)
  })

  it('calcula el promedio de varios ciclos observados', () => {
    let state = createLivePrestigeCycleState(snapshot(0, 1, 0))
    state = advanceLivePrestigeCycleState(state, snapshot(10_000, 2, 0))
    state = advanceLivePrestigeCycleState(state, snapshot(25_000, 3, 0))

    expect(getLiveAverageCycleSeconds(state)).toBe(12.5)
  })

  it('reinicia la línea base cuando un escenario reemplaza el estado', () => {
    let state = createLivePrestigeCycleState(snapshot(0, 3, 1_000))
    state = advanceLivePrestigeCycleState(state, snapshot(1_000, 3, 1_100))
    state = advanceLivePrestigeCycleState(state, snapshot(2_000, 3, 200))

    expect(state.resetCount).toBe(1)
    expect(state.cycleStartedAt).toBe(2_000)
    expect(state.lastManualClicks).toBe(200)
    expect(state.recentClickRate).toBe(0)
  })

  it('preserva el historial al detectar una nueva línea base', () => {
    let state = createLivePrestigeCycleState(snapshot(0, 1, 0))
    state = advanceLivePrestigeCycleState(state, snapshot(10_000, 2, 0))
    state = advanceLivePrestigeCycleState(state, snapshot(5_000, 2, 0))

    expect(state.completedCycles).toHaveLength(1)
    expect(state.resetCount).toBe(1)
  })
})
