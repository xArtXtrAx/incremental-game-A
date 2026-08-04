import { describe, expect, it } from 'vitest'
import {
  DEFAULT_BALANCE_CONFIG,
  cloneBalanceConfig,
} from '../../src/balanceConfig'
import {
  normalizeGameStateForBalance,
  type BalanceNormalizationChange,
} from '../../src/balanceStateNormalization'
import { initialGameState, type GameState } from '../../src/game'

const NOW = 1_800_000_000_000

function createState(overrides: Partial<GameState> = {}): GameState {
  return {
    ...initialGameState,
    energy: 12_345.67,
    manualClicks: 3_000,
    clickLevel: 4,
    pulseTriggerLevel: 3,
    generatorLevel: 5,
    resonanceLevel: 2,
    pressureLevel: 2,
    cavitationLevel: 2,
    cavitationCharge: 4,
    autoclickLevel: 3,
    autoclickProgress: 0.4,
    overloadLevel: 2,
    overloadCharge: 10,
    refractionLevel: 2,
    refractionOrbitProgress: 0.6,
    refractionFacetsCharged: 3,
    refractionDischargeCount: 7,
    refractionLastReward: 321,
    prestigeCount: 2,
    ...overrides,
  }
}

function findChange(
  changes: readonly BalanceNormalizationChange[],
  path: BalanceNormalizationChange['path'],
) {
  return changes.find((change) => change.path === path)
}

describe('normalizeGameStateForBalance', () => {
  it('conserva recursos, clics, prestigio y todos los niveles comprados', () => {
    const state = createState()
    const preview = normalizeGameStateForBalance(
      state,
      DEFAULT_BALANCE_CONFIG,
      NOW,
      DEFAULT_BALANCE_CONFIG,
    )

    expect(preview.state.energy).toBe(state.energy)
    expect(preview.state.manualClicks).toBe(state.manualClicks)
    expect(preview.state.prestigeCount).toBe(state.prestigeCount)
    expect(preview.state.clickLevel).toBe(state.clickLevel)
    expect(preview.state.pressureLevel).toBe(state.pressureLevel)
    expect(preview.state.autoclickLevel).toBe(state.autoclickLevel)
    expect(preview.state.refractionLevel).toBe(state.refractionLevel)
  })

  it('no muta el estado ni las configuraciones recibidas', () => {
    const state = createState()
    const next = cloneBalanceConfig(DEFAULT_BALANCE_CONFIG)
    next.core.sphereClickCapacity = 2_000
    const stateBefore = structuredClone(state)
    const configBefore = structuredClone(next)

    normalizeGameStateForBalance(
      state,
      next,
      NOW,
      DEFAULT_BALANCE_CONFIG,
    )

    expect(state).toEqual(stateBefore)
    expect(next).toEqual(configBefore)
  })

  it('previsualiza una esfera incompleta que pasará a completa', () => {
    const state = createState({ manualClicks: 3_000 })
    const next = cloneBalanceConfig(DEFAULT_BALANCE_CONFIG)
    next.core.sphereClickCapacity = 2_000

    const preview = normalizeGameStateForBalance(
      state,
      next,
      NOW,
      DEFAULT_BALANCE_CONFIG,
    )
    const change = findChange(preview.changes, 'balance.sphere-status')

    expect(change?.beforeLabel).toBe('Incompleta')
    expect(change?.afterLabel).toBe('Completa')
  })

  it('previsualiza una esfera completa que pasará a incompleta', () => {
    const state = createState({ manualClicks: 5_000 })
    const next = cloneBalanceConfig(DEFAULT_BALANCE_CONFIG)
    next.core.sphereClickCapacity = 8_000

    const preview = normalizeGameStateForBalance(
      state,
      next,
      NOW,
      DEFAULT_BALANCE_CONFIG,
    )
    const change = findChange(preview.changes, 'balance.sphere-status')

    expect(change?.beforeLabel).toBe('Completa')
    expect(change?.afterLabel).toBe('Incompleta')
  })

  it('recalcula y reporta el bono actual de Presión', () => {
    const state = createState({ manualClicks: 2_500, pressureLevel: 2 })
    const next = cloneBalanceConfig(DEFAULT_BALANCE_CONFIG)
    next.core.pressureBonusPerTier = 5

    const preview = normalizeGameStateForBalance(
      state,
      next,
      NOW,
      DEFAULT_BALANCE_CONFIG,
    )
    const change = findChange(preview.changes, 'balance.pressure-bonus')

    expect(change?.before).toBe(20)
    expect(change?.after).toBe(50)
  })

  it('limpia la carga de Sobrecarga si la nueva esfera queda incompleta', () => {
    const state = createState({
      manualClicks: 5_000,
      overloadLevel: 2,
      overloadCharge: 17,
    })
    const next = cloneBalanceConfig(DEFAULT_BALANCE_CONFIG)
    next.core.sphereClickCapacity = 8_000

    const preview = normalizeGameStateForBalance(
      state,
      next,
      NOW,
      DEFAULT_BALANCE_CONFIG,
    )

    expect(preview.state.overloadLevel).toBe(2)
    expect(preview.state.overloadCharge).toBe(0)
  })

  it('recorta cargas parciales que exceden los nuevos umbrales', () => {
    const state = createState({
      manualClicks: 5_000,
      cavitationCharge: 999,
      autoclickProgress: 1.75,
      overloadCharge: 999,
      refractionOrbitProgress: 1.4,
      refractionFacetsCharged: 999,
    })

    const preview = normalizeGameStateForBalance(
      state,
      DEFAULT_BALANCE_CONFIG,
      NOW,
      DEFAULT_BALANCE_CONFIG,
    )

    expect(preview.state.cavitationCharge).toBeLessThan(999)
    expect(preview.state.autoclickProgress).toBeLessThan(1)
    expect(preview.state.overloadCharge).toBeLessThan(999)
    expect(preview.state.refractionOrbitProgress).toBeLessThan(1)
    expect(preview.state.refractionFacetsCharged).toBeLessThan(999)
  })

  it('cancela Sobrecarga y PRISMA activos al cambiar de perfil', () => {
    const state = createState({
      overloadUntil: NOW + 60_000,
      refractionUntil: NOW + 60_000,
    })

    const preview = normalizeGameStateForBalance(
      state,
      DEFAULT_BALANCE_CONFIG,
      NOW,
      DEFAULT_BALANCE_CONFIG,
    )

    expect(preview.state.overloadUntil).toBe(0)
    expect(preview.state.refractionUntil).toBe(0)
    expect(findChange(preview.changes, 'overloadUntil')?.severity).toBe(
      'warning',
    )
    expect(findChange(preview.changes, 'refractionUntil')?.severity).toBe(
      'warning',
    )
  })

  it('conserva la Matriz comprada aunque aumente su requisito de prestigio', () => {
    const state = createState({
      prestigeCount: 2,
      refractionLevel: 3,
      refractionOrbitProgress: 0.72,
      refractionFacetsCharged: 4,
    })
    const next = cloneBalanceConfig(DEFAULT_BALANCE_CONFIG)
    next.unlocks.refractionRequiredPrestige = 5

    const preview = normalizeGameStateForBalance(
      state,
      next,
      NOW,
      DEFAULT_BALANCE_CONFIG,
    )

    expect(preview.state.refractionLevel).toBe(3)
    expect(preview.state.refractionOrbitProgress).toBe(0.72)
    expect(
      findChange(preview.changes, 'balance.unlock.refraction')?.afterLabel,
    ).toBe('Bloqueada')
  })

  it('conserva el Autoclicker comprado aunque aumente su requisito', () => {
    const state = createState({
      manualClicks: 1_000,
      prestigeCount: 2,
      autoclickLevel: 4,
      autoclickProgress: 0.35,
    })
    const next = cloneBalanceConfig(DEFAULT_BALANCE_CONFIG)
    next.unlocks.autoclickRequiredClicks = 8_000

    const preview = normalizeGameStateForBalance(
      state,
      next,
      NOW,
      DEFAULT_BALANCE_CONFIG,
    )

    expect(preview.state.autoclickLevel).toBe(4)
    expect(preview.state.autoclickProgress).toBe(0.35)
    expect(
      findChange(preview.changes, 'balance.unlock.autoclick')?.afterLabel,
    ).toBe('Bloqueada')
  })

  it('reporta cuando una compra vuelve a estar disponible', () => {
    const previous = cloneBalanceConfig(DEFAULT_BALANCE_CONFIG)
    previous.unlocks.pressureRequiredClicks = 8_000
    const next = cloneBalanceConfig(DEFAULT_BALANCE_CONFIG)
    const state = createState({ manualClicks: 1_000, prestigeCount: 1 })

    const preview = normalizeGameStateForBalance(
      state,
      next,
      NOW,
      previous,
    )

    expect(
      findChange(preview.changes, 'balance.unlock.pressure')?.afterLabel,
    ).toBe('Disponible')
  })

  it('no inventa cambios de esfera o Presión cuando el perfil es equivalente', () => {
    const state = createState()
    const preview = normalizeGameStateForBalance(
      state,
      DEFAULT_BALANCE_CONFIG,
      NOW,
      DEFAULT_BALANCE_CONFIG,
    )

    expect(findChange(preview.changes, 'balance.sphere-status')).toBeUndefined()
    expect(findChange(preview.changes, 'balance.pressure-bonus')).toBeUndefined()
  })
})
