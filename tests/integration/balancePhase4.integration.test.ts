import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  DEFAULT_BALANCE_CONFIG,
  cloneBalanceConfig,
} from '../../src/balanceConfig'
import {
  applySessionBalanceConfig,
  getBalanceRuntimeSnapshot,
  resetOfficialBalanceConfig,
} from '../../src/balanceRuntime'
import { planBulkPurchases } from '../../src/bulkPurchase'
import {
  canCrystallize,
  gameReducer,
  getAutoclickRate,
  getPressureBonusPercent,
  getSphereClickCapacity,
  initialGameState,
  type GameState,
} from '../../src/game'
import { advanceRefractionMatrix } from '../../src/refraction'

function createState(overrides: Partial<GameState> = {}): GameState {
  return { ...initialGameState, ...overrides }
}

describe('integración de Balance Fase 4', () => {
  beforeEach(() => {
    resetOfficialBalanceConfig()
  })

  afterEach(() => {
    resetOfficialBalanceConfig()
  })

  it('aplica una capacidad experimental y actualiza la cristalización', () => {
    const config = cloneBalanceConfig(DEFAULT_BALANCE_CONFIG)
    config.core.sphereClickCapacity = 2_000

    const result = applySessionBalanceConfig(config)
    const state = createState({ manualClicks: 3_000 })

    expect(result.applied).toBe(true)
    expect(getSphereClickCapacity()).toBe(2_000)
    expect(canCrystallize(state)).toBe(true)
    expect(getBalanceRuntimeSnapshot().source).toBe('session')
  })

  it('una capacidad mayor vuelve incompleta la misma partida', () => {
    const config = cloneBalanceConfig(DEFAULT_BALANCE_CONFIG)
    config.core.sphereClickCapacity = 6_000
    applySessionBalanceConfig(config)

    expect(canCrystallize(createState({ manualClicks: 3_000 }))).toBe(false)
  })

  it('el bono de Presión usa inmediatamente el perfil activo', () => {
    const config = cloneBalanceConfig(DEFAULT_BALANCE_CONFIG)
    config.core.pressureBonusPerTier = 5
    applySessionBalanceConfig(config)

    expect(getPressureBonusPercent(2_500, 2)).toBe(50)
  })

  it('bloquea una compra nueva de Autoclicker con requisito elevado', () => {
    const config = cloneBalanceConfig(DEFAULT_BALANCE_CONFIG)
    config.unlocks.autoclickRequiredClicks = 8_000
    applySessionBalanceConfig(config)

    const state = createState({
      energy: 1_000_000,
      manualClicks: 1_000,
      prestigeCount: 2,
      generatorLevel: 1,
      autoclickLevel: 4,
    })

    expect(gameReducer(state, { type: 'buy-autoclicker' })).toBe(state)
  })

  it('el Autoclicker comprado continúa funcionando aunque su compra esté bloqueada', () => {
    const config = cloneBalanceConfig(DEFAULT_BALANCE_CONFIG)
    config.unlocks.autoclickRequiredClicks = 8_000
    config.autoclick.baseRate = 1
    config.autoclick.growth = 1
    applySessionBalanceConfig(config)

    const state = createState({
      manualClicks: 1_000,
      prestigeCount: 2,
      autoclickLevel: 1,
      autoclickProgress: 0,
    })
    const next = gameReducer(state, { type: 'tick', now: 1_800_000_000_000 })

    expect(getAutoclickRate(1)).toBe(1)
    expect(next.autoclickLevel).toBe(1)
    expect(next.manualClicks).toBe(1_001)
  })

  it('habilita la compra al alcanzar el requisito experimental', () => {
    const config = cloneBalanceConfig(DEFAULT_BALANCE_CONFIG)
    config.unlocks.autoclickRequiredClicks = 8_000
    applySessionBalanceConfig(config)

    const state = createState({
      energy: 1_000_000,
      manualClicks: 8_000,
      prestigeCount: 2,
      generatorLevel: 1,
      autoclickLevel: 4,
    })
    const next = gameReducer(state, { type: 'buy-autoclicker' })

    expect(next).not.toBe(state)
    expect(next.autoclickLevel).toBe(5)
  })

  it('Comprar todo respeta los requisitos experimentales', () => {
    const config = cloneBalanceConfig(DEFAULT_BALANCE_CONFIG)
    config.unlocks.autoclickRequiredClicks = 8_000
    applySessionBalanceConfig(config)

    const state = createState({
      energy: 5_000_000,
      manualClicks: 1_000,
      prestigeCount: 2,
      generatorLevel: 1,
      autoclickLevel: 1,
    })
    const plan = planBulkPurchases(state, 'automatic')

    expect(plan.counts.autoclick).toBe(0)
    expect(plan.finalState.autoclickLevel).toBe(1)
  })

  it('Refracción comprada continúa avanzando con requisito elevado', () => {
    const config = cloneBalanceConfig(DEFAULT_BALANCE_CONFIG)
    config.unlocks.refractionRequiredPrestige = 5
    applySessionBalanceConfig(config)

    const advance = advanceRefractionMatrix(
      {
        level: 1,
        orbitProgress: 0.9,
        facetsCharged: 0,
        refractionUntil: 0,
        dischargeCount: 0,
        prestigeCount: 1,
        manualClicks: config.core.sphereClickCapacity,
      },
      100,
      1_800_000_000_000,
    )

    expect(advance.facetsCharged).toBe(1)
    expect(advance.orbitProgress).toBeGreaterThan(0)
  })

  it('restaurar valores oficiales revierte capacidad Presión y fuente', () => {
    const config = cloneBalanceConfig(DEFAULT_BALANCE_CONFIG)
    config.core.sphereClickCapacity = 2_000
    config.core.pressureBonusPerTier = 5
    applySessionBalanceConfig(config)

    resetOfficialBalanceConfig()

    expect(getSphereClickCapacity()).toBe(
      DEFAULT_BALANCE_CONFIG.core.sphereClickCapacity,
    )
    expect(getPressureBonusPercent(2_500, 2)).toBe(20)
    expect(getBalanceRuntimeSnapshot().source).toBe('official')
  })
})
