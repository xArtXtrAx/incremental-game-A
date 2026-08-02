import {
  advanceRefractionMatrix,
  getRefractionBonusMultiplier,
  getRefractionCost,
  getRefractionFacetCount,
  isRefractionActive,
  REFRACTION_REQUIRED_PRESTIGE,
} from './refraction'
import {
  getPulseTriggerUpgradeCost,
  PULSE_TRIGGER_MAX_LEVEL,
} from './pulseTrigger'

export const CLICK_UPGRADE_BASE_COST = 10
export const GENERATOR_BASE_COST = 25
export const RESONANCE_BASE_COST = 120
export const PRESSURE_BASE_COST = 500
export const CAVITATION_BASE_COST = 2000
export const AUTOCLICK_BASE_COST = 5000
export const OVERLOAD_BASE_COST = 10000
export const PRESSURE_REQUIRED_CLICKS = 100
export const CAVITATION_REQUIRED_CLICKS = 500
export const AUTOCLICK_REQUIRED_CLICKS = 500
export const SPHERE_CLICK_CAPACITY = 5000
export const GAME_STORAGE_KEY = 'incremental-game-a:save:v1'
const LEGACY_PRESTIGE_TEST_STORAGE_KEY =
  'incremental-game-a:save:prestige-test:v1'

const CLICK_UPGRADE_GROWTH = 1.7
const GENERATOR_GROWTH = 1.8
const RESONANCE_GROWTH = 2.2
const PRESSURE_GROWTH = 2.4
const CAVITATION_GROWTH = 2.6
const AUTOCLICK_GROWTH = 2.8
const AUTOCLICK_RATE_GROWTH = 1.6
const AUTOCLICK_BASE_RATE = 0.2
const AUTOCLICK_MAX_RATE = 20
const OVERLOAD_GROWTH = 3
const PRESSURE_BONUS_PER_TIER = 2
const SAVE_VERSION = 1
const SAPPHIRE_MULTIPLIERS = [1, 1.5, 1.85, 2.2, 2.6, 3.05] as const

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

  return {
    energy: getSafeNumber(candidate.energy, fallback.energy),
    manualClicks: getSafeInteger(candidate.manualClicks, fallback.manualClicks),
    clickLevel: getSafeInteger(candidate.clickLevel, fallback.clickLevel),
    pulseTriggerLevel: Math.min(
      PULSE_TRIGGER_MAX_LEVEL,
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
      refractionLevel > 0 && prestigeCount >= REFRACTION_REQUIRED_PRESTIGE
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
      refractionLevel > 0 && prestigeCount >= REFRACTION_REQUIRED_PRESTIGE
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

export function getSphereFillPercentage(manualClicks: number) {
  return Math.min((manualClicks / SPHERE_CLICK_CAPACITY) * 100, 100)
}

export function getPressureTier(manualClicks: number) {
  return Math.min(Math.floor(getSphereFillPercentage(manualClicks) / 10), 10)
}

export function getPressureBonusPercent(
  manualClicks: number,
  pressureLevel: number,
) {
  return getPressureTier(manualClicks) * PRESSURE_BONUS_PER_TIER * pressureLevel
}

export function getPressureMultiplier(
  manualClicks: number,
  pressureLevel: number,
) {
  return 1 + getPressureBonusPercent(manualClicks, pressureLevel) / 100
}

export function getSapphireMultiplier(prestigeCount: number) {
  if (prestigeCount <= 0) {
    return 1
  }

  if (prestigeCount < SAPPHIRE_MULTIPLIERS.length) {
    return SAPPHIRE_MULTIPLIERS[prestigeCount]
  }

  return roundEnergy(
    SAPPHIRE_MULTIPLIERS[SAPPHIRE_MULTIPLIERS.length - 1] +
      (prestigeCount - (SAPPHIRE_MULTIPLIERS.length - 1)) * 0.5,
  )
}

export function getNextSapphireMultiplier(prestigeCount: number) {
  return getSapphireMultiplier(prestigeCount + 1)
}

export function canCrystallize(state: GameState) {
  return state.manualClicks >= SPHERE_CLICK_CAPACITY
}

export function hasUnlockedBlueprints(state: GameState) {
  return state.prestigeCount > 0
}

export function getAutoclickRate(autoclickLevel: number) {
  if (autoclickLevel <= 0) {
    return 0
  }

  return roundProgress(
    Math.min(
      AUTOCLICK_MAX_RATE,
      AUTOCLICK_BASE_RATE * AUTOCLICK_RATE_GROWTH ** (autoclickLevel - 1),
    ),
  )
}

export function getOverloadClicksRequired(overloadLevel: number) {
  return overloadLevel > 0
    ? Math.max(40, 110 - overloadLevel * 10)
    : 100
}

export function getOverloadDurationSeconds(overloadLevel: number) {
  return overloadLevel > 0 ? 12 + overloadLevel * 3 : 0
}

export function getOverloadMultiplier(overloadLevel: number) {
  return overloadLevel > 0 ? 1.5 + overloadLevel * 0.5 : 1
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
  return cavitationLevel > 0
    ? Math.max(10, 28 - cavitationLevel * 3)
    : 25
}

export function getCavitationSeconds(cavitationLevel: number) {
  return cavitationLevel > 0 ? 3 + cavitationLevel * 2 : 0
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
    state.manualClicks >= SPHERE_CLICK_CAPACITY &&
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
  return getScaledCost(CLICK_UPGRADE_BASE_COST, CLICK_UPGRADE_GROWTH, level)
}

export function getGeneratorCost(level: number) {
  return getScaledCost(GENERATOR_BASE_COST, GENERATOR_GROWTH, level)
}

export function getResonanceCost(level: number) {
  return getScaledCost(RESONANCE_BASE_COST, RESONANCE_GROWTH, level)
}

export function getPressureCost(level: number) {
  return getScaledCost(PRESSURE_BASE_COST, PRESSURE_GROWTH, level)
}

export function getCavitationCost(level: number) {
  return getScaledCost(CAVITATION_BASE_COST, CAVITATION_GROWTH, level)
}

export function getAutoclickCost(level: number) {
  return getScaledCost(AUTOCLICK_BASE_COST, AUTOCLICK_GROWTH, level)
}

export function getOverloadCost(level: number) {
  return getScaledCost(OVERLOAD_BASE_COST, OVERLOAD_GROWTH, level)
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
      if (state.pulseTriggerLevel >= PULSE_TRIGGER_MAX_LEVEL) {
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
      const requiresDiscovery = !hasUnlockedBlueprints(state)

      if (
        (requiresDiscovery && state.manualClicks < PRESSURE_REQUIRED_CLICKS) ||
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
      const requiresDiscovery = !hasUnlockedBlueprints(state)

      if (
        (requiresDiscovery && state.manualClicks < CAVITATION_REQUIRED_CLICKS) ||
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
      const requiresDiscovery = !hasUnlockedBlueprints(state)

      if (
        (requiresDiscovery && state.manualClicks < AUTOCLICK_REQUIRED_CLICKS) ||
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
      const requiresDiscovery = !hasUnlockedBlueprints(state)

      if (
        (requiresDiscovery && state.manualClicks < SPHERE_CLICK_CAPACITY) ||
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
        state.prestigeCount < REFRACTION_REQUIRED_PRESTIGE ||
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
