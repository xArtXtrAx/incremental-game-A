import { describe, expect, it } from 'vitest'
import { DEFAULT_BALANCE_CONFIG } from '../../src/balanceConfig'
import { getBalanceRuntimeSnapshot } from '../../src/balanceRuntime'
import { initialGameState } from '../../src/game'
import {
  runPrestigeCycleExperiment,
  type PrestigeCycleCandidate,
  type PrestigeCycleExperimentRequest,
} from '../../src/prestigeCycleObservatory'

function candidate(
  id: string,
  name: string,
  config = structuredClone(DEFAULT_BALANCE_CONFIG),
): PrestigeCycleCandidate {
  return { id, name, config }
}

function request(): PrestigeCycleExperimentRequest {
  return {
    scenario: {
      id: 'p5-multicycle',
      name: 'P5 multiciclo',
      capturedAt: 0,
      state: {
        ...initialGameState,
        prestigeCount: 5,
        manualClicks: 5_000,
        generatorLevel: 5,
        resonanceLevel: 3,
      },
    },
    candidateA: candidate('official-a', 'Oficial A'),
    candidateB: candidate('official-b', 'Oficial B'),
    settings: {
      durationSeconds: 1_000,
      manualClicksPerSecond: 20,
      autoPurchase: true,
      targetCycles: 2,
    },
    startedAt: 10_000,
  }
}

describe('integración del Observatorio de Prestigio', () => {
  it('completa varios ciclos consecutivos usando gameReducer', () => {
    const result = runPrestigeCycleExperiment(request())

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.runA.completedCycles).toHaveLength(2)
    expect(result.value.runA.completedCycles.map((cycle) => cycle.prestigeAfter)).toEqual([
      6, 7,
    ])
    expect(result.value.runA.endedBy).toBe('target-cycles')
  })

  it('compara curvas de Zafiro distintas sin alterar el runtime visible', () => {
    const boosted = structuredClone(DEFAULT_BALANCE_CONFIG)
    boosted.sapphire.multipliers = [1, 2, 2.5, 3, 3.5, 4]
    boosted.sapphire.postMaximumLevelIncrement = 0.75
    const input = request()
    input.candidateB = candidate('boosted', 'Zafiro reforzado', boosted)
    const runtimeBefore = getBalanceRuntimeSnapshot()

    const result = runPrestigeCycleExperiment(input)

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.runB.totalDirectSapphireEnergy).toBeGreaterThan(
      result.value.runA.totalDirectSapphireEnergy,
    )
    expect(getBalanceRuntimeSnapshot()).toEqual(runtimeBefore)
  })

  it('no muta el escenario ni los candidatos de entrada', () => {
    const input = request()
    const before = structuredClone(input)

    const result = runPrestigeCycleExperiment(input)

    expect(result.ok).toBe(true)
    expect(input).toEqual(before)
  })

  it('produce comparaciones idénticas para perfiles idénticos', () => {
    const result = runPrestigeCycleExperiment(request())

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.runA.completedCycles).toEqual(
      result.value.runB.completedCycles,
    )
    expect(result.value.metrics.every((metric) => metric.delta === 0)).toBe(true)
  })
})
