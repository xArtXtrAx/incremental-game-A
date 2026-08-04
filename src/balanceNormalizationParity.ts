import {
  DEFAULT_BALANCE_CONFIG,
  cloneBalanceConfig,
  type BalanceConfig,
} from './balanceConfig'
import { getBalanceUnlockRequirement } from './balanceUnlockPolicy'
import { initialGameState, type GameState } from './game'
import { normalizeGameStateForBalance } from './balanceStateNormalization'

export type BalanceNormalizationParityResult = {
  passed: boolean
  checks: number
  failures: string[]
}

function hasChange(
  changes: ReturnType<typeof normalizeGameStateForBalance>['changes'],
  path: string,
) {
  return changes.some((change) => change.path === path)
}

export function runBalanceNormalizationParityChecks(
  config: Readonly<BalanceConfig>,
): BalanceNormalizationParityResult {
  const now = Date.now()
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
    overloadUntil: now + 60_000,
    refractionLevel: 2,
    refractionOrbitProgress: 0.64,
    refractionFacetsCharged: 999,
    refractionUntil: now + 60_000,
    refractionDischargeCount: 7,
    refractionLastReward: 321,
    prestigeCount: Math.max(4, config.unlocks.refractionRequiredPrestige),
  }
  const originalState = structuredClone(state)
  const originalConfig = structuredClone(config)
  const preview = normalizeGameStateForBalance(
    state,
    config,
    now,
    config,
  )
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
  expect('preserves.refraction-level', preview.state.refractionLevel === 2)
  expect('clamps.cavitation-charge', preview.state.cavitationCharge < 999)
  expect('clamps.autoclick-progress', preview.state.autoclickProgress < 1)
  expect('clamps.overload-charge', preview.state.overloadCharge < 999)
  expect('preserves.valid-refraction-progress', preview.state.refractionOrbitProgress === 0.64)
  expect('clamps.refraction-facets', preview.state.refractionFacetsCharged < 999)
  expect('clears.overload-effect', preview.state.overloadUntil === 0)
  expect('clears.refraction-effect', preview.state.refractionUntil === 0)
  expect('does-not-mutate-input', JSON.stringify(state) === JSON.stringify(originalState))
  expect('does-not-mutate-config', JSON.stringify(config) === JSON.stringify(originalConfig))
  expect('reports-adjustments', preview.changes.length >= 5)

  const higherCapacity = cloneBalanceConfig(config)
  higherCapacity.core.sphereClickCapacity =
    config.core.sphereClickCapacity + Math.max(1, config.core.sphereClickCapacity)
  const spherePreview = normalizeGameStateForBalance(
    state,
    higherCapacity,
    now,
    config,
  )
  expect(
    'reports.sphere-full-to-incomplete',
    hasChange(spherePreview.changes, 'balance.sphere-status'),
  )
  expect(
    'clears.overload-charge-when-sphere-becomes-incomplete',
    spherePreview.state.overloadCharge === 0,
  )

  const pressureConfig = cloneBalanceConfig(config)
  pressureConfig.core.pressureBonusPerTier =
    config.core.pressureBonusPerTier + 1
  const pressurePreview = normalizeGameStateForBalance(
    state,
    pressureConfig,
    now,
    config,
  )
  expect(
    'reports.pressure-bonus-change',
    hasChange(pressurePreview.changes, 'balance.pressure-bonus'),
  )

  const raisedUnlocks = cloneBalanceConfig(config)
  raisedUnlocks.unlocks.pressureRequiredClicks = Math.max(
    DEFAULT_BALANCE_CONFIG.unlocks.pressureRequiredClicks + 1,
    state.manualClicks + 1,
  )
  raisedUnlocks.unlocks.refractionRequiredPrestige =
    state.prestigeCount + 1
  const unlockPreview = normalizeGameStateForBalance(
    state,
    raisedUnlocks,
    now,
    config,
  )
  const pressureRequirement = getBalanceUnlockRequirement(
    state,
    'pressure',
    raisedUnlocks,
  )
  const refractionRequirement = getBalanceUnlockRequirement(
    state,
    'refraction',
    raisedUnlocks,
  )

  expect('locks.new-pressure-purchases', pressureRequirement.locked)
  expect('locks.new-refraction-purchases', refractionRequirement.locked)
  expect(
    'reports.pressure-purchase-transition',
    hasChange(unlockPreview.changes, 'balance.unlock.pressure'),
  )
  expect(
    'reports.refraction-purchase-transition',
    hasChange(unlockPreview.changes, 'balance.unlock.refraction'),
  )
  expect(
    'preserves.existing-pressure-level',
    unlockPreview.state.pressureLevel === state.pressureLevel,
  )
  expect(
    'preserves.existing-refraction-level-under-raised-requirement',
    unlockPreview.state.refractionLevel === state.refractionLevel,
  )
  expect(
    'preserves.existing-refraction-progress-under-raised-requirement',
    unlockPreview.state.refractionOrbitProgress === state.refractionOrbitProgress,
  )

  return {
    passed: failures.length === 0,
    checks,
    failures,
  }
}
