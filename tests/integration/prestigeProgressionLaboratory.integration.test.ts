import { describe, expect, it } from 'vitest'
import { DEFAULT_BALANCE_CONFIG } from '../../src/balanceConfig'
import { getBalanceRuntimeSnapshot } from '../../src/balanceRuntime'
import { initialGameState } from '../../src/game'
import {
  runPrestigeCycleExperiment,
  type PrestigeCycleCandidate,
} from '../../src/prestigeCycleObservatory'
import {
  runPrestigeBatch,
  runPrestigeLab,
  type PrestigeLabCandidate,
} from '../../src/prestigeProgressionLaboratory'

const labCandidate: PrestigeLabCandidate = {
  id: 'official',
  name: 'Balance oficial',
  config: structuredClone(DEFAULT_BALANCE_CONFIG),
}

const observatoryCandidate: PrestigeCycleCandidate = {
  id: 'official',
  name: 'Balance oficial',
  config: structuredClone(DEFAULT_BALANCE_CONFIG),
}

const scenario = {
  id: 'integration-p5',
  name: 'Integración P5',
  capturedAt: 0,
  state: {
    ...initialGameState,
    prestigeCount: 5,
    manualClicks: 4_900,
    generatorLevel: 3,
    resonanceLevel: 2,
  },
}

describe('Integración del Laboratorio de Progresión', () => {
  it('mantiene paridad con el Observatorio en Oficial + Más barata', () => {
    const laboratory = runPrestigeLab({
      scenario,
      candidate: labCandidate,
      startedAt: 1_000,
      settings: {
        durationSeconds: 180,
        manualClicksPerSecond: 1,
        targetCycles: 1,
        autoPurchase: false,
        purchaseStrategy: 'cheapest',
        sapphirePolicy: { mode: 'official' },
      },
    })
    const observatory = runPrestigeCycleExperiment({
      scenario,
      candidateA: observatoryCandidate,
      candidateB: observatoryCandidate,
      startedAt: 1_000,
      settings: {
        durationSeconds: 180,
        manualClicksPerSecond: 1,
        autoPurchase: false,
        targetCycles: 1,
      },
    })

    expect(laboratory.ok).toBe(true)
    expect(observatory.ok).toBe(true)
    if (!laboratory.ok || !observatory.ok) return
    expect(laboratory.value.completedCycles[0].durationSeconds).toBe(
      observatory.value.runA.completedCycles[0].durationSeconds,
    )
    expect(laboratory.value.finalState.prestigeCount).toBe(
      observatory.value.runA.finalState.prestigeCount,
    )
  })

  it('restaura siempre el runtime visible después de un contrafactual', () => {
    const before = getBalanceRuntimeSnapshot()
    const result = runPrestigeLab({
      scenario,
      candidate: labCandidate,
      startedAt: 1_000,
      settings: {
        durationSeconds: 180,
        manualClicksPerSecond: 1,
        targetCycles: 1,
        autoPurchase: false,
        purchaseStrategy: 'cheapest',
        sapphirePolicy: { mode: 'neutralized' },
      },
    })
    const after = getBalanceRuntimeSnapshot()

    expect(result.ok).toBe(true)
    expect(after).toEqual(before)
    expect(after.config).toEqual(DEFAULT_BALANCE_CONFIG)
  })

  it('produce menos energía con Zafiro neutralizado que con el oficial', () => {
    const official = runPrestigeLab({
      scenario,
      candidate: labCandidate,
      startedAt: 1_000,
      settings: {
        durationSeconds: 99,
        manualClicksPerSecond: 1,
        targetCycles: 1,
        autoPurchase: false,
        purchaseStrategy: 'cheapest',
        sapphirePolicy: { mode: 'official' },
      },
    })
    const neutralized = runPrestigeLab({
      scenario,
      candidate: labCandidate,
      startedAt: 1_000,
      settings: {
        durationSeconds: 99,
        manualClicksPerSecond: 1,
        targetCycles: 1,
        autoPurchase: false,
        purchaseStrategy: 'cheapest',
        sapphirePolicy: { mode: 'neutralized' },
      },
    })

    expect(official.ok).toBe(true)
    expect(neutralized.ok).toBe(true)
    if (!official.ok || !neutralized.ok) return
    expect(neutralized.value.totalEnergyGenerated).toBeLessThan(
      official.value.totalEnergyGenerated,
    )
    expect(neutralized.value.finalState.manualClicks).toBe(
      official.value.finalState.manualClicks,
    )
  })

  it('mantiene inmutable el candidato a través de un lote', () => {
    const before = structuredClone(labCandidate)
    const result = runPrestigeBatch({
      scenarios: [scenario],
      candidate: labCandidate,
      policies: [
        { mode: 'official' },
        { mode: 'frozen-p5' },
        { mode: 'neutralized' },
      ],
      strategies: ['cheapest', 'roi'],
      manualClickRates: [1],
      durationSeconds: 120,
      targetCycles: 1,
      startedAt: 1_000,
    })

    expect(result.ok).toBe(true)
    expect(labCandidate).toEqual(before)
  })
})
