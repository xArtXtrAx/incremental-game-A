import { DEFAULT_BALANCE_CONFIG } from './balanceConfig'
import {
  getActiveBalanceConfig,
  subscribeBalanceRuntime,
} from './balanceRuntime'
import {
  getBalanceUnlockRequirement,
  isBalanceUpgradePurchaseLocked,
  type BalanceUnlockId,
} from './balanceUnlockPolicy'
import {
  advanceRefractionMatrix,
  getRefractionBonusMultiplier,
  getRefractionCost,
  getRefractionFacetCount,
  isRefractionActive,
} from './refraction'
import { getPulseTriggerUpgradeCost } from './pulseTrigger'

export const CLICK_UPGRADE_BASE_COST =
  DEFAULT_BALANCE_CONFIG.costs.click.baseCost
export const GENERATOR_BASE_COST =
  DEFAULT_BALANCE_CONFIG.costs.generator.baseCost
export const RESONANCE_BASE_COST =
  DEFAULT_BALANCE_CONFIG.costs.resonance.baseCost
export const PRESSURE_BASE_COST =
  DEFAULT_BALANCE_CONFIG.costs.pressure.baseCost
export const CAVITATION_BASE_COST =
  DEFAULT_BALANCE_CONFIG.costs.cavitation.baseCost
export const AUTOCLICK_BASE_COST =
  DEFAULT_BALANCE_CONFIG.costs.autoclick.baseCost
export const OVERLOAD_BASE_COST =
  DEFAULT_BALANCE_CONFIG.costs.overload.baseCost

export let PRESSURE_REQUIRED_CLICKS =
  DEFAULT_BALANCE_CONFIG.unlocks.pressureRequiredClicks
export let CAVITATION_REQUIRED_CLICKS =
  DEFAULT_BALANCE_CONFIG.unlocks.cavitationRequiredClicks
export let AUTOCLICK_REQUIRED_CLICKS =
  DEFAULT_BALANCE_CONFIG.unlocks.autoclickRequiredClicks
export let SPHERE_CLICK_CAPACITY =
  DEFAULT_BALANCE_CONFIG.core.sphereClickCapacity
export let PRESSURE_BONUS_PER_TIER =
  DEFAULT_BALANCE_CONFIG.core.pressureBonusPerTier

function syncLegacyBalanceExports() {
  const balance = getActiveBalanceConfig()
  PRESSURE_REQUIRED_CLICKS = balance.unlocks.pressureRequiredClicks
  CAVITATION_REQUIRED_CLICKS = balance.unlocks.cavitationRequiredClicks
  AUTOCLICK_REQUIRED_CLICKS = balance.unlocks.autoclickRequiredClicks
  SPHERE_CLICK_CAPACITY = balance.core.sphereClickCapacity
  PRESSURE_BONUS_PER_TIER = balance.core.pressureBonusPerTier
}

subscribeBalanceRuntime(syncLegacyBalanceExports)

export const GAME_STORAGE_KEY = 'incremental-game-a:save:v1'
const LEGACY_PRESTIGE_TEST_STORAGE_KEY =
  'incremental-game-a:save:prestige-test:v1'

const SAVE_VERSION = 1

export type GameState = {
  energy: number
  manualClicks: number
  clickLevel: number
  pulseTriggerLevel: number
  generatorLevel: number
  resonanceLevel: number
  pressureLevel: number
  cavitationLevel: number
  cavitationCharge: number
  autoclickLevel: number
  autoclickProgress: number
  overloadLevel: number
  overloadCharge: number
  overloadUntil: number
  refractionLevel: number
  refractionOrbitProgress: number
  refractionFacetsCharged: number
  refractionUntil: number
  refractionDischargeCount: number
  refractionLastReward: number
  prestigeCount: number
}

export type GameAction =
  | { type: 'click'; now?: number }
  | { type: 'tick'; now?: number }
  | { type: 'buy-click-upgrade' }
  | { type: 'buy-pulse-trigger' }
  | { type: 'buy-generator' }
  | { type: 'buy-resonance' }
  | { type: 'buy-pressure' }
  | { type: 'buy-cavitation' }
  | { type: 'buy-autoclicker' }
  | { type: 'buy-overload' }
  | { type: 'buy-refraction' }
  | { type: 'crystallize' }
  | { type: 'reset' }

export type ClickOutcome = {
  nextManualClicks: number
  clickEnergy: number
  cavitationEnergy: number
  nextCavitationCharge: number
  cavitationTriggered: boolean
  nextOverloadCharge: number
  nextOverloadUntil: number
  overloadTriggered: boolean
}

export const initialGameState: GameState = {
  energy: 0,
  manualClicks: 0,
  clickLevel: 0,
  pulseTriggerLevel: 0,
  generatorLevel: 0,
  resonanceLevel: 0,
  pressureLevel: 0,
  cavitationLevel: 0,
  cavitationCharge: 0,
  autoclickLevel: 0,
  autoclickProgress: 0,
  overloadLevel: 0,
  overloadCharge: 0,
  overloadUntil: 0,
  refractionLevel: 0,
  refractionOrbitProgress: 0,
  refractionFacetsCharged: 0,
  refractionUntil: 0,
  refractionDischargeCount: 0,
  refractionLastReward: 0,
  prestigeCount: 0,
}

type StoredGame = {
  version: number
  state: GameState
}

function getScaledCost(baseCost: number, growth: number, level: number) {
  return Math.ceil(baseCost * growth ** level)
}

function roundEnergy(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function roundProgress(value: number) {
  return Math.round((value + Number.EPSILON) * 10000) / 10000
}

function getSafeNumber(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? roundEnergy(value)
    : fallback
}

function getSafeInteger(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? Math.floor(value)
    : fallback
}

function sanitizeGameState(value: unknown, fallback: GameState): GameState {
  if (typeof value !== 'object' || value === null) {
    return fallback
  }

  const balance = getActiveBalanceConfig()
  const candidate = value as Partial<GameState>
  const prestigeCount = getSafeInteger(
    candidate.prestigeCount,
    fallback.prestigeCount,
  )
  const cavitationLevel = getSafeInteger(
    candidate.cavitationLevel,
    fallback.cavitationLevel,
  )
  const cavitationThreshold = getCavitationClicksRequired(cavitationLevel)
  const autoclickLevel = getSafeInteger(
    candidate.autoclickLevel,
    fallback.autoclickLevel,
  )
  const overloadLevel = getSafeInteger(
    candidate.overloadLevel,
    fallback.overloadLevel,
  )
  const overloadThreshold = getOverloadClicksRequired(overloadLevel)
  const overloadUntil = getSafeInteger(
    candidate.overloadUntil,
    fallback.overloadUntil,
  )
  const refractionLevel = getSafeInteger(
    candidate.refractionLevel,
    fallback.refractionLevel,
  )
  const refractionFacetCount = getRefractionFacetCount(prestigeCount)
  const refractionUntil = getSafeInteger(
    candidate.refractionUntil,
    fallback.refractionUntil,
  )
  const refractionAllowed =
    prestigeCount >= balance.unlocks.refractionRequiredPrestige

  return {
    energy: getSafeNumber(candidate.energy, fallback.energy),
    manualClicks: getSafeInteger(candidate.manualClicks, fallback.manualClicks),
    clickLevel: getSafeInteger(candidate.clickLevel, fallback.clickLevel),
    pulseTriggerLevel: Math.min(
      balance.pulseTrigger.maximumLevel,
      getSafeInteger(
        candidate.pulseTriggerLevel,
        fallback.pulseTriggerLevel,
      ),
    ),
    generatorLevel: getSafeInteger(
      candidate.generatorLevel,
      fallback.generatorLevel,
    ),
    resonanceLevel: getSafeInteger(
      candidate.resonanceLevel,
      fallback.resonanceLevel,
    ),
    pressureLevel: getSafeInteger(
      candidate.pressureLevel,
      fallback.pressureLevel,
    ),
    cavitationLevel,
    cavitationCharge:
      cavitationLevel > 0
        ? Math.min(
            getSafeInteger(
              candidate.cavitationCharge,
              fallback.cavitationCharge,
            ),
            cavitationThreshold - 1,
          )
        : 0,
    autoclickLevel,
    autoclickProgress:
      autoclickLevel > 0
        ? Math.min(
            roundProgress(
              getSafeNumber(
                candidate.autoclickProgress,
                fallback.autoclickProgress,
              ),
            ),
            0.9999,
          )
        : 0,
    overloadLevel,
    overloadCharge:
      overloadLevel > 0
        ? Math.min(
            getSafeInteger(
              candidate.overloadCharge,
              fallback.overloadCharge,
            ),
            overloadThreshold - 1,
          )
        : 0,
    overloadUntil:
      overloadLevel > 0 && overloadUntil > Date.now() ? overloadUntil : 0,
    refractionLevel,
    refractionOrbitProgress:
      refractionLevel > 0 && refractionAllowed
        ? Math.min(
            roundProgress(
              getSafeNumber(
                candidate.refractionOrbitProgress,
                fallback.refractionOrbitProgress,
              ),
            ),
            0.9999,
          )
        : 0,
    refractionFacetsCharged:
      refractionLevel > 0 && refractionAllowed
        ? Math.min(
            getSafeInteger(
              candidate.refractionFacetsCharged,
              fallback.refractionFacetsCharged,
            ),
            refractionFacetCount - 1,
          )
        : 0,
    refractionUntil:
      refractionLevel > 0 && refractionUntil > Date.now()
        ? refractionUntil
        : 0,
    refractionDischargeCount: getSafeInteger(
      candidate.refractionDischargeCount,
      fallback.refractionDischargeCount,
    ),
    refractionLastReward: getSafeNumber(
      candidate.refractionLastReward,
      fallback.refractionLastReward,
    ),
    prestigeCount,
  }
}

export function getSphereClickCapacity() {
  return getActiveBalanceConfig().core.sphereClickCapacity
}

export function getSphereFillPercentage(manualClicks: number) {
  return Math.min((manualClicks / getSphereClickCapacity()) * 100, 100)
}

export function getPressureTier(manualClicks: number) {
  return Math.min(Math.floor(getSphereFillPercentage(manualClicks) / 10), 10)
}

export function getPressureBonusPercent(
  manualClicks: number,
  pressureLevel: number,
) {
  return (
    getPressureTier(manualClicks) *
    getActiveBalanceConfig().core.pressureBonusPerTier *
    pressureLevel
  )
}

export function getPressureMultiplier(
  manualClicks: number,
  pressureLevel: number,
) {
  return 1 + getPressureBonusPercent(manualClicks, pressureLevel) / 100
}

export function getSapphireMultiplier(prestigeCount: number) {
  const { multipliers, postMaximumLevelIncrement } =
    getActiveBalanceConfig().sapphire

  if (prestigeCount <= 0) {
    return 1
  }

  if (prestigeCount < multipliers.length) {
    return multipliers[prestigeCount]
  }

  return roundEnergy(
    multipliers[multipliers.length - 1] +
      (prestigeCount - (multipliers.length - 1)) *
        postMaximumLevelIncrement,
  )
}

export function getNextSapphireMultiplier(prestigeCount: number) {
  return getSapphireMultiplier(prestigeCount + 1)
}

export function canCrystallize(state: GameState) {
  return state.manualClicks >= getSphereClickCapacity()
}

export function hasUnlockedBlueprints(state: GameState) {
  return state.prestigeCount > 0
}

export function getUpgradeUnlockRequirement(
  state: Readonly<GameState>,
  id: BalanceUnlockId,
) {
  return getBalanceUnlockRequirement(state, id, getActiveBalanceConfig())
}

export function isUpgradePurchaseLockedByRequirement(
  state: Readonly<GameState>,
  id: BalanceUnlockId,
) {
  return isBalanceUpgradePurchaseLocked(
    state,
    id,
    getActiveBalanceConfig(),
  )
}

export function getAutoclickRate(autoclickLevel: number) {
  if (autoclickLevel <= 0) {
    return 0
  }

  const { baseRate, growth, maximumRate } =
    getActiveBalanceConfig().autoclick

  return roundProgress(
    Math.min(maximumRate, baseRate * growth ** (autoclickLevel - 1)),
  )
}

export function getOverloadClicksRequired(overloadLevel: number) {
  const {
    inactiveClicksRequired,
    baseClicksRequired,
    clicksReducedPerLevel,
    minimumClicksRequired,
  } = getActiveBalanceConfig().overload

  return overloadLevel > 0
    ? Math.max(
        minimumClicksRequired,
        baseClicksRequired - overloadLevel * clicksReducedPerLevel,
      )
    : inactiveClicksRequired
}

export function getOverloadDurationSeconds(overloadLevel: number) {
  if (overloadLevel <= 0) return 0

  const { baseDurationSeconds, durationSecondsPerLevel } =
    getActiveBalanceConfig().overload
  return baseDurationSeconds + overloadLevel * durationSecondsPerLevel
}

export function getOverloadMultiplier(overloadLevel: number) {
  if (overloadLevel <= 0) return 1

  const { baseMultiplier, multiplierPerLevel } =
    getActiveBalanceConfig().overload
  return baseMultiplier + overloadLevel * multiplierPerLevel
}

export function isOverloadActive(overloadUntil: number, now = Date.now()) {
  return overloadUntil > now
}

export function getOverloadRemainingSeconds(
  overloadUntil: number,
  now = Date.now(),
) {
  return Math.max(0, (overloadUntil - now) / 1000)
}

export function getClickPower(
  level: number,
  manualClicks = 0,
  pressureLevel = 0,
  activeMultiplier = 1,
  sapphireMultiplier = 1,
) {
  return roundEnergy(
    (level + 1) *
      getPressureMultiplier(manualClicks, pressureLevel) *
      activeMultiplier *
      sapphireMultiplier,
  )
}

export function getResonanceMultiplier(resonanceLevel: number) {
  return resonanceLevel + 1
}

export function getEnergyPerSecond(
  generatorLevel: number,
  resonanceLevel: number,
  manualClicks = 0,
  pressureLevel = 0,
  activeMultiplier = 1,
  sapphireMultiplier = 1,
) {
  return roundEnergy(
    generatorLevel *
      getResonanceMultiplier(resonanceLevel) *
      getPressureMultiplier(manualClicks, pressureLevel) *
      activeMultiplier *
      sapphireMultiplier,
  )
}

export function getCavitationClicksRequired(cavitationLevel: number) {
  const {
    inactiveClicksRequired,
    baseClicksRequired,
    clicksReducedPerLevel,
    minimumClicksRequired,
  } = getActiveBalanceConfig().cavitation

  return cavitationLevel > 0
    ? Math.max(
        minimumClicksRequired,
        baseClicksRequired - cavitationLevel * clicksReducedPerLevel,
      )
    : inactiveClicksRequired
}

export function getCavitationSeconds(cavitationLevel: number) {
  if (cavitationLevel <= 0) return 0

  const { baseDurationSeconds, durationSecondsPerLevel } =
    getActiveBalanceConfig().cavitation
  return baseDurationSeconds + cavitationLevel * durationSecondsPerLevel
}

export function getCavitationReward(
  generatorLevel: number,
  resonanceLevel: number,
  manualClicks: number,
  pressureLevel: number,
  cavitationLevel: number,
  activeMultiplier = 1,
  sapphireMultiplier = 1,
) {
  return roundEnergy(
    getEnergyPerSecond(
      generatorLevel,
      resonanceLevel,
      manualClicks,
      pressureLevel,
      activeMultiplier,
      sapphireMultiplier,
    ) * getCavitationSeconds(cavitationLevel),
  )
}

function getActiveTemporaryMultiplier(state: GameState, now: number) {
  const overloadMultiplier = isOverloadActive(state.overloadUntil, now)
    ? getOverloadMultiplier(state.overloadLevel)
    : 1
  const refractionMultiplier = isRefractionActive(state.refractionUntil, now)
    ? getRefractionBonusMultiplier(state.refractionLevel)
    : 1

  return overloadMultiplier * refractionMultiplier
}

export function getClickOutcome(
  state: GameState,
  now = Date.now(),
): ClickOutcome {
  const nextManualClicks = state.manualClicks + 1
  const overloadWasActive = isOverloadActive(state.overloadUntil, now)
  const activeMultiplier = getActiveTemporaryMultiplier(state, now)
  const sapphireMultiplier = getSapphireMultiplier(state.prestigeCount)
  const clickEnergy = getClickPower(
    state.clickLevel,
    nextManualClicks,
    state.pressureLevel,
    activeMultiplier,
    sapphireMultiplier,
  )

  const cavitationThreshold = getCavitationClicksRequired(state.cavitationLevel)
  const cavitationCharge =
    state.cavitationLevel > 0 ? state.cavitationCharge + 1 : 0
  const cavitationTriggered =
    state.cavitationLevel > 0 && cavitationCharge >= cavitationThreshold
  const cavitationEnergy = cavitationTriggered
    ? getCavitationReward(
        state.generatorLevel,
        state.resonanceLevel,
        nextManualClicks,
        state.pressureLevel,
        state.cavitationLevel,
        activeMultiplier,
        sapphireMultiplier,
      )
    : 0

  const canChargeOverload =
    state.overloadLevel > 0 &&
    state.manualClicks >= getSphereClickCapacity() &&
    !overloadWasActive
  const overloadThreshold = getOverloadClicksRequired(state.overloadLevel)
  const accumulatedOverloadCharge = canChargeOverload
    ? state.overloadCharge + 1
    : state.overloadCharge
  const overloadTriggered =
    canChargeOverload && accumulatedOverloadCharge >= overloadThreshold
  const nextOverloadUntil = overloadTriggered
    ? now + getOverloadDurationSeconds(state.overloadLevel) * 1000
    : overloadWasActive
      ? state.overloadUntil
      : 0

  return {
    nextManualClicks,
    clickEnergy,
    cavitationEnergy,
    nextCavitationCharge: cavitationTriggered ? 0 : cavitationCharge,
    cavitationTriggered,
    nextOverloadCharge: overloadTriggered ? 0 : accumulatedOverloadCharge,
    nextOverloadUntil,
    overloadTriggered,
  }
}

export function getClickUpgradeCost(level: number) {
  const { baseCost, growth } = getActiveBalanceConfig().costs.click
  return getScaledCost(baseCost, growth, level)
}

export function getGeneratorCost(level: number) {
  const { baseCost, growth } = getActiveBalanceConfig().costs.generator
  return getScaledCost(baseCost, growth, level)
}

export function getResonanceCost(level: number) {
  const { baseCost, growth } = getActiveBalanceConfig().costs.resonance
  return getScaledCost(baseCost, growth, level)
}

export function getPressureCost(level: number) {
  const { baseCost, growth } = getActiveBalanceConfig().costs.pressure
  return getScaledCost(baseCost, growth, level)
}

export function getCavitationCost(level: number) {
  const { baseCost, growth } = getActiveBalanceConfig().costs.cavitation
  return getScaledCost(baseCost, growth, level)
}

export function getAutoclickCost(level: number) {
  const { baseCost, growth } = getActiveBalanceConfig().costs.autoclick
  return getScaledCost(baseCost, growth, level)
}

export function getOverloadCost(level: number) {
  const { baseCost, growth } = getActiveBalanceConfig().costs.overload
  return getScaledCost(baseCost, growth, level)
}

export { getRefractionCost }

export function loadGameState(fallback: GameState): GameState {
  try {
    const legacyRawSave = window.localStorage.getItem(
      LEGACY_PRESTIGE_TEST_STORAGE_KEY,
    )
    const rawSave =
      legacyRawSave ?? window.localStorage.getItem(GAME_STORAGE_KEY)

    if (!rawSave) {
      return fallback
    }

    const storedGame = JSON.parse(rawSave) as Partial<StoredGame>

    if (storedGame.version !== SAVE_VERSION) {
      return fallback
    }

    const sanitizedState = sanitizeGameState(storedGame.state, fallback)

    if (legacyRawSave) {
      const migratedGame: StoredGame = {
        version: SAVE_VERSION,
        state: sanitizedState,
      }
      window.localStorage.setItem(
        GAME_STORAGE_KEY,
        JSON.stringify(migratedGame),
      )
      window.localStorage.removeItem(LEGACY_PRESTIGE_TEST_STORAGE_KEY)
    }

    return sanitizedState
  } catch {
    return fallback
  }
}

export function saveGameState(state: GameState) {
  try {
    const storedGame: StoredGame = {
      version: SAVE_VERSION,
      state,
    }

    window.localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(storedGame))
  } catch {
    // El juego continúa aunque el navegador bloquee el almacenamiento local.
  }
}

export function clearSavedGame() {
  try {
    window.localStorage.removeItem(GAME_STORAGE_KEY)
    window.localStorage.removeItem(LEGACY_PRESTIGE_TEST_STORAGE_KEY)
  } catch {
    // El estado en memoria todavía puede reiniciarse con normalidad.
  }
}

function applyClickToState(state: GameState, now: number): GameState {
  const outcome = getClickOutcome(state, now)

  return {
    ...state,
    energy: roundEnergy(
      state.energy + outcome.clickEnergy + outcome.cavitationEnergy,
    ),
    manualClicks: outcome.nextManualClicks,
    cavitationCharge: outcome.nextCavitationCharge,
    overloadCharge: outcome.nextOverloadCharge,
    overloadUntil: outcome.nextOverloadUntil,
  }
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'click':
      return applyClickToState(state, action.now ?? Date.now())

    case 'tick': {
      const now = action.now ?? Date.now()
      let nextState = state

      if (
        nextState.overloadUntil !== 0 &&
        !isOverloadActive(nextState.overloadUntil, now)
      ) {
        nextState = { ...nextState, overloadUntil: 0 }
      }

      if (
        nextState.refractionUntil !== 0 &&
        !isRefractionActive(nextState.refractionUntil, now)
      ) {
        nextState = { ...nextState, refractionUntil: 0 }
      }

      const autoclickRate = getAutoclickRate(nextState.autoclickLevel)

      if (autoclickRate > 0) {
        const accumulatedProgress = roundProgress(
          nextState.autoclickProgress + autoclickRate,
        )
        const automaticClicks = Math.floor(accumulatedProgress + 0.000001)
        const autoclickProgress = roundProgress(
          accumulatedProgress - automaticClicks,
        )

        if (autoclickProgress !== nextState.autoclickProgress) {
          nextState = { ...nextState, autoclickProgress }
        }

        for (let clickIndex = 0; clickIndex < automaticClicks; clickIndex += 1) {
          nextState = applyClickToState(nextState, now)
        }
      } else if (nextState.autoclickProgress !== 0) {
        nextState = { ...nextState, autoclickProgress: 0 }
      }

      const overloadMultiplier = isOverloadActive(nextState.overloadUntil, now)
        ? getOverloadMultiplier(nextState.overloadLevel)
        : 1
      const refractionMultiplier = isRefractionActive(
        nextState.refractionUntil,
        now,
      )
        ? getRefractionBonusMultiplier(nextState.refractionLevel)
        : 1
      const sapphireMultiplier = getSapphireMultiplier(nextState.prestigeCount)
      const baseProduction = getEnergyPerSecond(
        nextState.generatorLevel,
        nextState.resonanceLevel,
        nextState.manualClicks,
        nextState.pressureLevel,
        overloadMultiplier,
        sapphireMultiplier,
      )
      const production = getEnergyPerSecond(
        nextState.generatorLevel,
        nextState.resonanceLevel,
        nextState.manualClicks,
        nextState.pressureLevel,
        overloadMultiplier * refractionMultiplier,
        sapphireMultiplier,
      )
      const refractionAdvance = advanceRefractionMatrix(
        {
          level: nextState.refractionLevel,
          orbitProgress: nextState.refractionOrbitProgress,
          facetsCharged: nextState.refractionFacetsCharged,
          refractionUntil: nextState.refractionUntil,
          dischargeCount: nextState.refractionDischargeCount,
          prestigeCount: nextState.prestigeCount,
          manualClicks: nextState.manualClicks,
        },
        baseProduction,
        now,
      )

      return {
        ...nextState,
        energy: roundEnergy(
          nextState.energy + production + refractionAdvance.dischargeAmount,
        ),
        refractionOrbitProgress: refractionAdvance.orbitProgress,
        refractionFacetsCharged: refractionAdvance.facetsCharged,
        refractionUntil: refractionAdvance.refractionUntil,
        refractionDischargeCount: refractionAdvance.dischargeCount,
        refractionLastReward:
          refractionAdvance.dischargesTriggered > 0
            ? refractionAdvance.dischargeAmount
            : nextState.refractionLastReward,
      }
    }

    case 'buy-click-upgrade': {
      const cost = getClickUpgradeCost(state.clickLevel)

      if (state.energy < cost) {
        return state
      }

      return {
        ...state,
        energy: roundEnergy(state.energy - cost),
        clickLevel: state.clickLevel + 1,
      }
    }

    case 'buy-pulse-trigger': {
      if (
        state.pulseTriggerLevel >=
        getActiveBalanceConfig().pulseTrigger.maximumLevel
      ) {
        return state
      }

      const cost = getPulseTriggerUpgradeCost(state.pulseTriggerLevel)
      if (state.energy < cost) {
        return state
      }

      return {
        ...state,
        energy: roundEnergy(state.energy - cost),
        pulseTriggerLevel: state.pulseTriggerLevel + 1,
      }
    }

    case 'buy-generator': {
      const cost = getGeneratorCost(state.generatorLevel)

      if (state.energy < cost) {
        return state
      }

      return {
        ...state,
        energy: roundEnergy(state.energy - cost),
        generatorLevel: state.generatorLevel + 1,
      }
    }

    case 'buy-resonance': {
      const cost = getResonanceCost(state.resonanceLevel)

      if (state.generatorLevel === 0 || state.energy < cost) {
        return state
      }

      return {
        ...state,
        energy: roundEnergy(state.energy - cost),
        resonanceLevel: state.resonanceLevel + 1,
      }
    }

    case 'buy-pressure': {
      const cost = getPressureCost(state.pressureLevel)

      if (
        isUpgradePurchaseLockedByRequirement(state, 'pressure') ||
        state.energy < cost
      ) {
        return state
      }

      return {
        ...state,
        energy: roundEnergy(state.energy - cost),
        pressureLevel: state.pressureLevel + 1,
      }
    }

    case 'buy-cavitation': {
      const cost = getCavitationCost(state.cavitationLevel)

      if (
        isUpgradePurchaseLockedByRequirement(state, 'cavitation') ||
        state.generatorLevel === 0 ||
        state.energy < cost
      ) {
        return state
      }

      const nextLevel = state.cavitationLevel + 1
      const nextThreshold = getCavitationClicksRequired(nextLevel)

      return {
        ...state,
        energy: roundEnergy(state.energy - cost),
        cavitationLevel: nextLevel,
        cavitationCharge: Math.min(
          state.cavitationCharge,
          nextThreshold - 1,
        ),
      }
    }

    case 'buy-autoclicker': {
      const cost = getAutoclickCost(state.autoclickLevel)

      if (
        isUpgradePurchaseLockedByRequirement(state, 'autoclick') ||
        state.generatorLevel === 0 ||
        state.energy < cost
      ) {
        return state
      }

      return {
        ...state,
        energy: roundEnergy(state.energy - cost),
        autoclickLevel: state.autoclickLevel + 1,
      }
    }

    case 'buy-overload': {
      const cost = getOverloadCost(state.overloadLevel)

      if (
        isUpgradePurchaseLockedByRequirement(state, 'overload') ||
        state.cavitationLevel === 0 ||
        state.energy < cost
      ) {
        return state
      }

      const nextLevel = state.overloadLevel + 1
      const nextThreshold = getOverloadClicksRequired(nextLevel)

      return {
        ...state,
        energy: roundEnergy(state.energy - cost),
        overloadLevel: nextLevel,
        overloadCharge: Math.min(state.overloadCharge, nextThreshold - 1),
      }
    }

    case 'buy-refraction': {
      const cost = getRefractionCost(state.refractionLevel)

      if (
        isUpgradePurchaseLockedByRequirement(state, 'refraction') ||
        state.generatorLevel === 0 ||
        state.energy < cost
      ) {
        return state
      }

      return {
        ...state,
        energy: roundEnergy(state.energy - cost),
        refractionLevel: state.refractionLevel + 1,
      }
    }

    case 'crystallize':
      if (!canCrystallize(state)) {
        return state
      }

      return {
        ...initialGameState,
        prestigeCount: state.prestigeCount + 1,
      }

    case 'reset':
      return initialGameState
  }
}
