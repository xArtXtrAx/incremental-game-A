import { describe, expect, it } from 'vitest'
import { DEFAULT_BALANCE_CONFIG } from '../../src/balanceConfig'
import { initialGameState } from '../../src/game'
import {
  exportPrestigeCycleCsv,
  normalizePrestigeCycleDuration,
  normalizePrestigeCycleManualClicks,
  normalizePrestigeCycleTarget,
  runPrestigeCycleExperiment,
  type PrestigeCycleCandidate,
  type PrestigeCycleExperimentRequest,
} from '../../src/prestigeCycleObservatory'

const official: PrestigeCycleCandidate = {
  id: 'official',
  name: 'Balance oficial',
  config: structuredClone(DEFAULT_BALANCE_CONFIG),
}

function request(
  overrides: Partial<PrestigeCycleExperimentRequest> = {},
): PrestigeCycleExperimentRequest {
  return {
    scenario: {
      id: 'near-core-p1',
      name: 'Cerca del núcleo P1',
      capturedAt: 0,
      state: {
        ...initialGameState,
        prestigeCount: 1,
        manualClicks: 4_900,
        generatorLevel: 3,
        resonanceLevel: 2,
      },
    },
    candidateA: official,
    candidateB: official,
    settings: {
      durationSeconds: 180,
      manualClicksPerSecond: 1,
      autoPurchase: false,
      targetCycles: 1,
    },
    startedAt: 1_000,
    ...overrides,
  }
}

describe('Observatorio de Ciclos y Prestigio', () => {
  it('normaliza límites de duración, ciclos y clics', () => {
    expect(normalizePrestigeCycleDuration(Number.POSITIVE_INFINITY)).toBe(1)
    expect(normalizePrestigeCycleDuration(99_999)).toBe(21_600)
    expect(normalizePrestigeCycleTarget(0)).toBe(1)
    expect(normalizePrestigeCycleTarget(99)).toBe(10)
    expect(normalizePrestigeCycleManualClicks(-4)).toBe(0)
    expect(normalizePrestigeCycleManualClicks(99)).toBe(20)
  })

  it('registra un ciclo completo con transición de prestigio y Zafiro', () => {
    const result = runPrestigeCycleExperiment(request())

    expect(result.ok).toBe(true)
    if (!result.ok) return
    const cycle = result.value.runA.completedCycles[0]
    expect(cycle).toEqual(
      expect.objectContaining({
        prestigeBefore: 1,
        prestigeAfter: 2,
        sapphireMultiplier: 1.5,
        nextSapphireMultiplier: 1.85,
        durationSeconds: 100,
      }),
    )
    expect(result.value.runA.endedBy).toBe('target-cycles')
  })

  it('captura checkpoints de recuperación a 10, 30 y 60 segundos', () => {
    const result = runPrestigeCycleExperiment(request())

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(
      result.value.runA.completedCycles[0].checkpoints.map(
        (checkpoint) => checkpoint.second,
      ),
    ).toEqual([10, 30, 60])
  })

  it('separa energía generada, gastada y aporte directo de Zafiro', () => {
    const result = runPrestigeCycleExperiment(
      request({
        settings: {
          durationSeconds: 180,
          manualClicksPerSecond: 2,
          autoPurchase: true,
          targetCycles: 1,
        },
      }),
    )

    expect(result.ok).toBe(true)
    if (!result.ok) return
    const cycle = result.value.runA.completedCycles[0]
    expect(cycle.energyGenerated).toBeGreaterThan(0)
    expect(cycle.energySpent).toBeGreaterThanOrEqual(0)
    expect(cycle.directSapphireEnergy).toBeGreaterThan(0)
    expect(cycle.directSapphireSharePercent).toBeGreaterThan(0)
    expect(cycle.directSapphireSharePercent).toBeLessThan(100)
  })

  it('registra hitos de recuperación de sistemas', () => {
    const result = runPrestigeCycleExperiment(
      request({
        scenario: {
          id: 'new-p5',
          name: 'Inicio P5',
          capturedAt: 0,
          state: { ...initialGameState, prestigeCount: 5, energy: 1_000_000 },
        },
        settings: {
          durationSeconds: 120,
          manualClicksPerSecond: 20,
          autoPurchase: true,
          targetCycles: 1,
        },
      }),
    )

    expect(result.ok).toBe(true)
    if (!result.ok) return
    const current = result.value.runA.currentCycle
    expect(current.firstGeneratorAt).not.toBeNull()
    expect(current.firstAdvancedUpgradeAt).not.toBeNull()
  })

  it('es determinista para una misma solicitud y marca temporal', () => {
    const first = runPrestigeCycleExperiment(request())
    const second = runPrestigeCycleExperiment(request())

    expect(first).toEqual(second)
  })

  it('rechaza balances inválidos sin ejecutar el reducer', () => {
    const invalid = structuredClone(DEFAULT_BALANCE_CONFIG)
    invalid.costs.click.growth = 0.5

    const result = runPrestigeCycleExperiment(
      request({
        candidateB: { id: 'invalid', name: 'Inválido', config: invalid },
      }),
    )

    expect(result.ok).toBe(false)
    expect(result.issues).toContainEqual(
      expect.objectContaining({ path: 'candidateB.costs.click.growth' }),
    )
  })

  it('exporta métricas y cronología en CSV', () => {
    const result = runPrestigeCycleExperiment(request())
    if (!result.ok) throw new Error('Resultado inesperadamente inválido')

    const csv = exportPrestigeCycleCsv(result.value)

    expect(csv).toContain('Duración media por ciclo')
    expect(csv).toContain('Prestigio inicial')
    expect(csv).toContain('Aporte directo Zafiro')
    expect(csv).toContain('Balance oficial')
  })
})
