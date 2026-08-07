import { describe, expect, it } from 'vitest'
import { DEFAULT_BALANCE_CONFIG } from '../../src/balanceConfig'
import { initialGameState } from '../../src/game'
import {
  analyzePrestigePath,
  applySapphirePolicy,
  comparePrestigeLabRuns,
  comparePrestigeStrategies,
  describeSapphirePolicy,
  runPrestigeBatch,
  runPrestigeCurveExplorer,
  runPrestigeLab,
  type PrestigeLabCandidate,
  type PrestigeLabRequest,
} from '../../src/prestigeProgressionLaboratory'

const candidate: PrestigeLabCandidate = {
  id: 'official',
  name: 'Balance oficial',
  config: structuredClone(DEFAULT_BALANCE_CONFIG),
}

function request(overrides: Partial<PrestigeLabRequest> = {}): PrestigeLabRequest {
  return {
    scenario: {
      id: 'near-core-p5',
      name: 'Cerca del núcleo P5',
      capturedAt: 0,
      state: {
        ...initialGameState,
        prestigeCount: 5,
        manualClicks: 4_900,
        generatorLevel: 3,
        resonanceLevel: 2,
      },
    },
    candidate,
    settings: {
      durationSeconds: 180,
      manualClicksPerSecond: 1,
      targetCycles: 1,
      autoPurchase: false,
      purchaseStrategy: 'cheapest',
      sapphirePolicy: { mode: 'official' },
    },
    startedAt: 1_000,
    ...overrides,
  }
}

describe('Laboratorio de Progresión de Prestigio', () => {
  it('construye políticas de Zafiro sin mutar el balance base', () => {
    const original = structuredClone(DEFAULT_BALANCE_CONFIG)
    const neutralized = applySapphirePolicy(original, { mode: 'neutralized' })
    const frozen = applySapphirePolicy(original, { mode: 'frozen-p5' })
    const custom = applySapphirePolicy(original, { mode: 'custom-post-p5', increment: 0.3 })

    expect(neutralized.sapphire.multipliers).toEqual([1, 1, 1, 1, 1, 1])
    expect(neutralized.sapphire.postMaximumLevelIncrement).toBe(0)
    expect(frozen.sapphire.multipliers).toEqual(original.sapphire.multipliers)
    expect(frozen.sapphire.postMaximumLevelIncrement).toBe(0)
    expect(custom.sapphire.postMaximumLevelIncrement).toBe(0.3)
    expect(original).toEqual(DEFAULT_BALANCE_CONFIG)
  })

  it('describe claramente las políticas contrafactuales', () => {
    expect(describeSapphirePolicy({ mode: 'official' })).toBe('Oficial')
    expect(describeSapphirePolicy({ mode: 'neutralized' })).toContain('×1.00')
    expect(describeSapphirePolicy({ mode: 'frozen-p5' })).toContain('P5')
    expect(describeSapphirePolicy({ mode: 'custom-post-p5', increment: 0.25 })).toContain('+0.25')
  })

  it('ejecuta un recorrido determinista con el reducer autoritativo', () => {
    const first = runPrestigeLab(request())
    const second = runPrestigeLab(request())

    expect(first).toEqual(second)
    expect(first.ok).toBe(true)
    if (!first.ok) return
    expect(first.value.completedCycles[0]).toEqual(
      expect.objectContaining({ prestigeBefore: 5, prestigeAfter: 6, durationSeconds: 100 }),
    )
  })

  it('compara oficial contra Zafiro congelado bajo condiciones idénticas', () => {
    const result = comparePrestigeLabRuns({
      scenario: request().scenario,
      candidate,
      startedAt: 1_000,
      settingsA: { ...request().settings, sapphirePolicy: { mode: 'official' } },
      settingsB: { ...request().settings, sapphirePolicy: { mode: 'frozen-p5' } },
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.runA.settings.sapphirePolicy.mode).toBe('official')
    expect(result.value.runB.settings.sapphirePolicy.mode).toBe('frozen-p5')
  })

  it('registra compras y resume la ruta de gasto', () => {
    const result = runPrestigeLab(
      request({
        scenario: {
          id: 'funded-p5',
          name: 'P5 con capital',
          capturedAt: 0,
          state: { ...initialGameState, prestigeCount: 5, energy: 1_000_000 },
        },
        settings: {
          durationSeconds: 20,
          manualClicksPerSecond: 2,
          targetCycles: 1,
          autoPurchase: true,
          purchaseStrategy: 'production',
          sapphirePolicy: { mode: 'frozen-p5' },
        },
      }),
    )

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.purchaseEvents.length).toBeGreaterThan(0)
    const summary = analyzePrestigePath(result.value)
    expect(summary.dominantUpgrade).not.toBeNull()
    expect(Object.values(summary.purchaseCountByUpgrade).reduce((a, b) => a + b, 0)).toBe(result.value.purchaseEvents.length)
  })

  it('compara cinco estrategias de compra reproducibles', () => {
    const result = comparePrestigeStrategies({
      scenario: {
        id: 'funded-p5',
        name: 'P5 con capital',
        capturedAt: 0,
        state: { ...initialGameState, prestigeCount: 5, energy: 1_000_000 },
      },
      candidate,
      startedAt: 1_000,
      baseSettings: {
        durationSeconds: 30,
        manualClicksPerSecond: 2,
        targetCycles: 1,
        autoPurchase: true,
        sapphirePolicy: { mode: 'official' },
      },
      strategies: ['cheapest', 'production', 'manual', 'automation', 'roi'],
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.map((row) => row.strategy)).toEqual(['cheapest', 'production', 'manual', 'automation', 'roi'])
  })

  it('barre una familia de incrementos post-P5', () => {
    const result = runPrestigeCurveExplorer({
      scenario: request().scenario,
      candidate,
      startedAt: 1_000,
      baseSettings: {
        durationSeconds: 180,
        manualClicksPerSecond: 1,
        targetCycles: 1,
        autoPurchase: false,
        purchaseStrategy: 'cheapest',
      },
      increments: [0, 0.1, 0.3, 0.5],
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.points.map((point) => point.increment)).toEqual([0, 0.1, 0.3, 0.5])
    expect(result.value.points.every((point) => point.completedCycles === 1)).toBe(true)
  })

  it('ejecuta lotes combinatorios sin contaminar resultados entre corridas', () => {
    const result = runPrestigeBatch({
      scenarios: [request().scenario],
      candidate,
      policies: [{ mode: 'official' }, { mode: 'frozen-p5' }],
      strategies: ['cheapest', 'roi'],
      manualClickRates: [1, 2],
      durationSeconds: 180,
      targetCycles: 1,
      startedAt: 1_000,
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.totalRuns).toBe(8)
    expect(result.value.rows).toHaveLength(8)
  })
})
