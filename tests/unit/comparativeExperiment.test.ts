import { beforeEach, describe, expect, it } from 'vitest'
import {
  COMPARATIVE_MAX_SECONDS,
  createOfficialComparativeCandidate,
  normalizeComparativeDurationSeconds,
  normalizeComparativeManualClicksPerSecond,
  runComparativeExperiment,
} from '../../src/comparativeExperiment'
import { cloneBalanceConfig, DEFAULT_BALANCE_CONFIG } from '../../src/balanceConfig'
import { resetOfficialBalanceConfig } from '../../src/balanceRuntime'
import { initialGameState } from '../../src/game'

const baseScenario = {
  id: 'test-new-game',
  name: 'Partida de prueba',
  capturedAt: 0,
  state: { ...initialGameState },
}

describe('motor de comparación experimental', () => {
  beforeEach(() => {
    resetOfficialBalanceConfig()
  })

  it('produce resultados idénticos para balances idénticos', () => {
    const candidateA = createOfficialComparativeCandidate()
    const candidateB = {
      ...createOfficialComparativeCandidate(),
      id: 'official-copy',
      name: 'Copia oficial',
    }

    const result = runComparativeExperiment({
      scenario: baseScenario,
      candidateA,
      candidateB,
      settings: {
        durationSeconds: 120,
        manualClicksPerSecond: 2,
        autoPurchase: true,
        autoCrystallize: false,
        stopCondition: 'duration',
      },
      startedAt: 10_000,
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.runA.finalState).toEqual(result.value.runB.finalState)
    expect(result.value.runA.purchaseTimeline).toEqual(
      result.value.runB.purchaseTimeline,
    )
    expect(
      result.value.metrics.every(
        (metric) =>
          metric.delta === 0 ||
          (metric.valueA === null && metric.valueB === null),
      ),
    ).toBe(true)
  })

  it('detecta que una capacidad menor alcanza antes el núcleo', () => {
    const faster = cloneBalanceConfig(DEFAULT_BALANCE_CONFIG)
    faster.core.sphereClickCapacity = 1_000

    const result = runComparativeExperiment({
      scenario: baseScenario,
      candidateA: createOfficialComparativeCandidate(),
      candidateB: {
        id: 'small-core',
        name: 'Núcleo 1000',
        source: 'profile',
        config: faster,
      },
      settings: {
        durationSeconds: 1_200,
        manualClicksPerSecond: 5,
        autoPurchase: false,
        autoCrystallize: false,
        stopCondition: 'core-filled',
      },
      startedAt: 50_000,
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.runA.coreFilledAt).toBe(1_000)
    expect(result.value.runB.coreFilledAt).toBe(200)
    expect(result.value.runB.elapsedSeconds).toBeLessThan(
      result.value.runA.elapsedSeconds,
    )
    expect(
      result.value.metrics.find((metric) => metric.id === 'core-filled')?.winner,
    ).toBe('B')
  })

  it('se detiene al alcanzar una evolución objetivo', () => {
    const result = runComparativeExperiment({
      scenario: {
        ...baseScenario,
        state: { ...initialGameState, energy: 10_000 },
      },
      candidateA: createOfficialComparativeCandidate(),
      candidateB: {
        ...createOfficialComparativeCandidate(),
        id: 'official-copy',
        name: 'Copia oficial',
      },
      settings: {
        durationSeconds: 300,
        manualClicksPerSecond: 0,
        autoPurchase: true,
        autoCrystallize: false,
        stopCondition: 'target-upgrade',
        targetUpgradeId: 'generator',
        targetUpgradeLevel: 1,
      },
      startedAt: 100_000,
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.runA.endedBy).toBe('target-upgrade')
    expect(result.value.runA.elapsedSeconds).toBe(0)
    expect(result.value.runA.finalState.generatorLevel).toBeGreaterThanOrEqual(1)
  })

  it('normaliza duración y clics dentro de límites seguros', () => {
    expect(normalizeComparativeDurationSeconds(999_999)).toBe(
      COMPARATIVE_MAX_SECONDS,
    )
    expect(normalizeComparativeDurationSeconds(-10)).toBe(1)
    expect(normalizeComparativeManualClicksPerSecond(999)).toBe(20)
    expect(normalizeComparativeManualClicksPerSecond(-1)).toBe(0)
  })

  it('rechaza escenarios incompletos sin ejecutar', () => {
    const result = runComparativeExperiment({
      scenario: {
        id: 'broken',
        name: 'Roto',
        capturedAt: 0,
        state: { energy: 1 } as typeof initialGameState,
      },
      candidateA: createOfficialComparativeCandidate(),
      candidateB: createOfficialComparativeCandidate(),
      settings: {
        durationSeconds: 10,
        manualClicksPerSecond: 1,
        autoPurchase: false,
        autoCrystallize: false,
        stopCondition: 'duration',
      },
    })

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.issues.some((issue) => issue.path.includes('manualClicks'))).toBe(
      true,
    )
  })
})
