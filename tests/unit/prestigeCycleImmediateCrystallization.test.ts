import { describe, expect, it } from 'vitest'
import { DEFAULT_BALANCE_CONFIG } from '../../src/balanceConfig'
import { initialGameState } from '../../src/game'
import { runPrestigeCycleExperiment } from '../../src/prestigeCycleObservatory'

describe('cristalización inmediata del Observatorio', () => {
  it('cristaliza antes de comprar cuando el escenario comienza con el núcleo lleno', () => {
    const candidate = {
      id: 'official',
      name: 'Balance oficial',
      config: structuredClone(DEFAULT_BALANCE_CONFIG),
    }
    const result = runPrestigeCycleExperiment({
      scenario: {
        id: 'full-core',
        name: 'Núcleo lleno',
        capturedAt: 0,
        state: {
          ...initialGameState,
          energy: 1_000_000,
          manualClicks: 5_000,
          generatorLevel: 5,
          prestigeCount: 5,
        },
      },
      candidateA: candidate,
      candidateB: candidate,
      settings: {
        durationSeconds: 1,
        manualClicksPerSecond: 0,
        autoPurchase: true,
        targetCycles: 1,
      },
      startedAt: 1_000,
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    const cycle = result.value.runA.completedCycles[0]
    expect(cycle.durationSeconds).toBe(0)
    expect(cycle.purchaseCount).toBe(0)
    expect(cycle.energySpent).toBe(0)
    expect(cycle.finalUpgradeLevels.generator).toBe(5)
    expect(result.value.runA.finalState.prestigeCount).toBe(6)
    expect(result.value.runA.finalState.generatorLevel).toBe(0)
  })
})
