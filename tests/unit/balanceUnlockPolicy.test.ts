import { describe, expect, it } from 'vitest'
import {
  DEFAULT_BALANCE_CONFIG,
  cloneBalanceConfig,
} from '../../src/balanceConfig'
import {
  getBalanceUnlockRequirement,
  isBalanceUpgradePurchaseLocked,
  type BalanceUnlockId,
} from '../../src/balanceUnlockPolicy'
import { initialGameState, type GameState } from '../../src/game'

function createState(overrides: Partial<GameState> = {}): GameState {
  return { ...initialGameState, ...overrides }
}

describe('balanceUnlockPolicy', () => {
  it.each<[
    BalanceUnlockId,
    number,
  ]>([
    ['pressure', DEFAULT_BALANCE_CONFIG.unlocks.pressureRequiredClicks],
    ['cavitation', DEFAULT_BALANCE_CONFIG.unlocks.cavitationRequiredClicks],
    ['autoclick', DEFAULT_BALANCE_CONFIG.unlocks.autoclickRequiredClicks],
    ['overload', DEFAULT_BALANCE_CONFIG.core.sphereClickCapacity],
  ])('bloquea %s antes del requisito oficial', (id, required) => {
    const state = createState({ manualClicks: required - 1 })
    const result = getBalanceUnlockRequirement(
      state,
      id,
      DEFAULT_BALANCE_CONFIG,
    )

    expect(result.locked).toBe(true)
    expect(result.met).toBe(false)
    expect(result.blueprintBypass).toBe(false)
  })

  it.each<[
    BalanceUnlockId,
    number,
  ]>([
    ['pressure', DEFAULT_BALANCE_CONFIG.unlocks.pressureRequiredClicks],
    ['cavitation', DEFAULT_BALANCE_CONFIG.unlocks.cavitationRequiredClicks],
    ['autoclick', DEFAULT_BALANCE_CONFIG.unlocks.autoclickRequiredClicks],
    ['overload', DEFAULT_BALANCE_CONFIG.core.sphereClickCapacity],
  ])('desbloquea %s al alcanzar el requisito', (id, required) => {
    const state = createState({ manualClicks: required })
    const result = getBalanceUnlockRequirement(
      state,
      id,
      DEFAULT_BALANCE_CONFIG,
    )

    expect(result.locked).toBe(false)
    expect(result.met).toBe(true)
  })

  it.each<BalanceUnlockId>([
    'pressure',
    'cavitation',
    'autoclick',
    'overload',
  ])('mantiene el bypass de planos para %s con requisitos oficiales', (id) => {
    const state = createState({ manualClicks: 0, prestigeCount: 1 })
    const result = getBalanceUnlockRequirement(
      state,
      id,
      DEFAULT_BALANCE_CONFIG,
    )

    expect(result.locked).toBe(false)
    expect(result.blueprintBypass).toBe(true)
  })

  it.each<BalanceUnlockId>([
    'pressure',
    'cavitation',
    'autoclick',
    'overload',
  ])('no permite que los planos omitan un aumento experimental de %s', (id) => {
    const config = cloneBalanceConfig(DEFAULT_BALANCE_CONFIG)
    const state = createState({ manualClicks: 1_000, prestigeCount: 3 })

    if (id === 'pressure') config.unlocks.pressureRequiredClicks = 8_000
    if (id === 'cavitation') config.unlocks.cavitationRequiredClicks = 8_000
    if (id === 'autoclick') config.unlocks.autoclickRequiredClicks = 8_000
    if (id === 'overload') config.core.sphereClickCapacity = 8_000

    const result = getBalanceUnlockRequirement(state, id, config)

    expect(result.locked).toBe(true)
    expect(result.blueprintBypass).toBe(false)
    expect(result.required).toBe(8_000)
  })

  it('habilita nuevamente la compra al alcanzar el requisito experimental', () => {
    const config = cloneBalanceConfig(DEFAULT_BALANCE_CONFIG)
    config.unlocks.autoclickRequiredClicks = 8_000
    const state = createState({ manualClicks: 8_000, prestigeCount: 2 })

    expect(
      getBalanceUnlockRequirement(state, 'autoclick', config).locked,
    ).toBe(false)
  })

  it('acepta requisitos experimentales inferiores al oficial', () => {
    const config = cloneBalanceConfig(DEFAULT_BALANCE_CONFIG)
    config.unlocks.cavitationRequiredClicks = 50
    const state = createState({ manualClicks: 50 })

    const result = getBalanceUnlockRequirement(state, 'cavitation', config)

    expect(result.locked).toBe(false)
    expect(result.met).toBe(true)
  })

  it('Refracción depende siempre del prestigio configurado', () => {
    const config = cloneBalanceConfig(DEFAULT_BALANCE_CONFIG)
    config.unlocks.refractionRequiredPrestige = 5

    const locked = getBalanceUnlockRequirement(
      createState({ prestigeCount: 4 }),
      'refraction',
      config,
    )
    const unlocked = getBalanceUnlockRequirement(
      createState({ prestigeCount: 5 }),
      'refraction',
      config,
    )

    expect(locked.locked).toBe(true)
    expect(locked.blueprintBypass).toBe(false)
    expect(unlocked.locked).toBe(false)
  })

  it('el helper de compra devuelve la misma decisión autoritativa', () => {
    const config = cloneBalanceConfig(DEFAULT_BALANCE_CONFIG)
    config.unlocks.pressureRequiredClicks = 4_000
    const state = createState({ manualClicks: 3_999, prestigeCount: 1 })

    expect(isBalanceUpgradePurchaseLocked(state, 'pressure', config)).toBe(
      getBalanceUnlockRequirement(state, 'pressure', config).locked,
    )
  })
})
