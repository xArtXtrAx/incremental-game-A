import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createOfficialComparativeCandidate,
  runComparativeExperiment,
} from '../../src/comparativeExperiment'
import {
  DEFAULT_BALANCE_CONFIG,
  cloneBalanceConfig,
} from '../../src/balanceConfig'
import {
  getBalanceRuntimeSnapshot,
  resetOfficialBalanceConfig,
  subscribeBalanceRuntime,
} from '../../src/balanceRuntime'
import { initialGameState } from '../../src/game'

describe('integración del comparador con reducer y runtime', () => {
  beforeEach(() => {
    resetOfficialBalanceConfig()
  })

  it('compara dos curvas con gameReducer sin alterar el runtime visible', () => {
    const experimental = cloneBalanceConfig(DEFAULT_BALANCE_CONFIG)
    experimental.costs.generator = { baseCost: 1, growth: 1.1 }
    experimental.costs.click = { baseCost: 1_000_000, growth: 2 }
    experimental.costs.resonance = { baseCost: 1_000_000, growth: 2 }
    experimental.costs.pressure = { baseCost: 1_000_000, growth: 2 }
    experimental.costs.cavitation = { baseCost: 1_000_000, growth: 2 }
    experimental.costs.autoclick = { baseCost: 1_000_000, growth: 2 }
    experimental.costs.overload = { baseCost: 1_000_000, growth: 2 }
    experimental.costs.refraction = { baseCost: 1_000_000, growth: 2 }
    experimental.costs.pulseTrigger = { baseCost: 1_000_000, growth: 2 }

    const listener = vi.fn()
    const unsubscribe = subscribeBalanceRuntime(listener)
    const snapshotBefore = getBalanceRuntimeSnapshot()
    const scenarioState = {
      ...initialGameState,
      energy: 50_000,
      manualClicks: 800,
      generatorLevel: 1,
    }
    const originalScenarioState = { ...scenarioState }

    const result = runComparativeExperiment({
      scenario: {
        id: 'integration-rich-start',
        name: 'Inicio con capital',
        capturedAt: 0,
        state: scenarioState,
      },
      candidateA: createOfficialComparativeCandidate(),
      candidateB: {
        id: 'cheap-generator',
        name: 'Generador económico',
        source: 'profile',
        config: experimental,
      },
      settings: {
        durationSeconds: 120,
        manualClicksPerSecond: 2,
        autoPurchase: true,
        autoCrystallize: false,
        stopCondition: 'duration',
      },
      startedAt: 200_000,
    })

    unsubscribe()
    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.value.runB.finalState.generatorLevel).toBeGreaterThan(
      result.value.runA.finalState.generatorLevel,
    )
    expect(result.value.runB.effectiveProductionPerSecond).toBeGreaterThan(
      result.value.runA.effectiveProductionPerSecond,
    )
    expect(result.value.runB.purchaseCount).toBeGreaterThan(0)
    expect(scenarioState).toEqual(originalScenarioState)
    expect(listener).not.toHaveBeenCalled()
    expect(getBalanceRuntimeSnapshot()).toBe(snapshotBefore)
  })

  it('repite exactamente un experimento con la misma entrada y reloj', () => {
    const request = {
      scenario: {
        id: 'deterministic',
        name: 'Determinista',
        capturedAt: 0,
        state: {
          ...initialGameState,
          energy: 5_000,
          manualClicks: 250,
          generatorLevel: 2,
          clickLevel: 1,
        },
      },
      candidateA: createOfficialComparativeCandidate(),
      candidateB: {
        ...createOfficialComparativeCandidate(),
        id: 'official-copy',
        name: 'Copia oficial',
      },
      settings: {
        durationSeconds: 180,
        manualClicksPerSecond: 3,
        autoPurchase: true,
        autoCrystallize: true,
        stopCondition: 'duration' as const,
      },
      startedAt: 1_000_000,
    }

    const first = runComparativeExperiment(request)
    const second = runComparativeExperiment(request)

    expect(first).toEqual(second)
  })

  it('materializa la duración restante de efectos por igual en A y B', () => {
    const capturedAt = 100_000
    const result = runComparativeExperiment({
      scenario: {
        id: 'timed-effects',
        name: 'Efectos temporales',
        capturedAt,
        state: {
          ...initialGameState,
          generatorLevel: 2,
          overloadLevel: 1,
          overloadUntil: capturedAt + 30_000,
          refractionLevel: 1,
          refractionUntil: capturedAt + 15_000,
          prestigeCount: 1,
        },
      },
      candidateA: createOfficialComparativeCandidate(),
      candidateB: {
        ...createOfficialComparativeCandidate(),
        id: 'official-copy',
        name: 'Copia oficial',
      },
      settings: {
        durationSeconds: 10,
        manualClicksPerSecond: 0,
        autoPurchase: false,
        autoCrystallize: false,
        stopCondition: 'duration',
      },
      startedAt: 1_000_000,
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.runA.initialState.overloadUntil).toBe(1_030_000)
    expect(result.value.runB.initialState.overloadUntil).toBe(1_030_000)
    expect(result.value.runA.initialState.refractionUntil).toBe(1_015_000)
    expect(result.value.runB.initialState.refractionUntil).toBe(1_015_000)
    expect(result.value.runA.finalState).toEqual(result.value.runB.finalState)
  })
})
