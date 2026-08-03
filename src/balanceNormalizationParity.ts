import type { BalanceConfig } from './balanceConfig'
import { initialGameState, type GameState } from './game'
import { normalizeGameStateForBalance } from './balanceStateNormalization'

export type BalanceNormalizationParityResult = {
  passed: boolean
  checks: number
  failures: string[]
}

export function runBalanceNormalizationParityChecks(
  config: Readonly<BalanceConfig>,
): BalanceNormalizationParityResult {
  const state: GameState = {
    ...initialGameState,
    energy: 12_345.67,
    manualClicks: config.core.sphereClickCapacity,
    clickLevel: 4,
    pulseTriggerLevel: config.pulseTrigger.maximumLevel,
    generatorLevel: 5,
    resonanceLevel: 3,
    pressureLevel: 2,
    cavitationLevel: 2,
    cavitationCharge: 999,
    autoclickLevel: 3,
    autoclickProgress: 1.75,
    overloadLevel: 2,
    overloadCharge: 999,
    overloadUntil: Date.now() + 60_000,
    refractionLevel: 2,
    refractionOrbitProgress: 1.4,
    refractionFacetsCharged: 999,
    refractionUntil: Date.now() + 60_000,
    refractionDischargeCount: 7,
    refractionLastReward: 321,
    prestigeCount: Math.max(4, config.unlocks.refractionRequiredPrestige),
  }
  const original = structuredClone(state)
  const preview = normalizeGameStateForBalance(state, config)
  const failures: string[] = []
  let checks = 0

  function expect(id: string, condition: boolean) {
    checks += 1
    if (!condition) failures.push(id)
  }

  expect('preserves.energy', preview.state.energy === state.energy)
  expect('preserves.manual-clicks', preview.state.manualClicks === state.manualClicks)
  expect('preserves.upgrade-levels', preview.state.generatorLevel === state.generatorLevel)
  expect('preserves.prestige', preview.state.prestigeCount === state.prestigeCount)
  expect('preserves.discharge-count', preview.state.refractionDischargeCount === 7)
  expect('clamps.cavitation-charge', preview.state.cavitationCharge < 999)
  expect('clamps.autoclick-progress', preview.state.autoclickProgress < 1)
  expect('clamps.overload-charge', preview.state.overloadCharge < 999)
  expect('clamps.refraction-progress', preview.state.refractionOrbitProgress < 1)
  expect('clamps.refraction-facets', preview.state.refractionFacetsCharged < 999)
  expect('clears.overload-effect', preview.state.overloadUntil === 0)
  expect('clears.refraction-effect', preview.state.refractionUntil === 0)
  expect('does-not-mutate-input', JSON.stringify(state) === JSON.stringify(original))
  expect('reports-adjustments', preview.changes.length >= 6)

  return {
    passed: failures.length === 0,
    checks,
    failures,
  }
}
