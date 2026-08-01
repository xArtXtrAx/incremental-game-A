export const CLICK_UPGRADE_BASE_COST = 10
export const GENERATOR_BASE_COST = 25
export const RESONANCE_BASE_COST = 120
export const PRESSURE_BASE_COST = 500
export const CAVITATION_BASE_COST = 2000
export const PRESSURE_REQUIRED_CLICKS = 100
export const CAVITATION_REQUIRED_CLICKS = 500
export const SPHERE_CLICK_CAPACITY = 5000
export const GAME_STORAGE_KEY = 'incremental-game-a:save:v1'

const CLICK_UPGRADE_GROWTH = 1.7
const GENERATOR_GROWTH = 1.8
const RESONANCE_GROWTH = 2.2
const PRESSURE_GROWTH = 2.4
const CAVITATION_GROWTH = 2.6
const PRESSURE_BONUS_PER_TIER = 2
const SAVE_VERSION = 1

export type GameState = {
  energy: number
  manualClicks: number
  clickLevel: number
  generatorLevel: number
  resonanceLevel: number
  pressureLevel: number
  cavitationLevel: number
  cavitationCharge: number
}

export type GameAction =
  | { type: 'click' }
  | { type: 'tick' }
  | { type: 'buy-click-upgrade' }
  | { type: 'buy-generator' }
  | { type: 'buy-resonance' }
  | { type: 'buy-pressure' }
  | { type: 'buy-cavitation' }
  | { type: 'reset' }

export type ClickOutcome = {
  nextManualClicks: number
  clickEnergy: number
  cavitationEnergy: number
  nextCavitationCharge: number
  cavitationTriggered: boolean
}

export const initialGameState: GameState = {
  energy: 0,
  manualClicks: 0,
  clickLevel: 0,
  generatorLevel: 0,
  resonanceLevel: 0,
  pressureLevel: 0,
  cavitationLevel: 0,
  cavitationCharge: 0,
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
  const cavitationLevel = getSafeInteger(
    candidate.cavitationLevel,
    fallback.cavitationLevel,
  )
  const cavitationThreshold = getCavitationClicksRequired(cavitationLevel)

  return {
    energy: getSafeNumber(candidate.energy, fallback.energy),
    manualClicks: getSafeInteger(candidate.manualClicks, fallback.manualClicks),
    clickLevel: getSafeInteger(candidate.clickLevel, fallback.clickLevel),
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

export function getClickPower(
  level: number,
  manualClicks = 0,
  pressureLevel = 0,
) {
  return roundEnergy(
    (level + 1) * getPressureMultiplier(manualClicks, pressureLevel),
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
) {
  return roundEnergy(
    generatorLevel *
      getResonanceMultiplier(resonanceLevel) *
      getPressureMultiplier(manualClicks, pressureLevel),
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
) {
  return roundEnergy(
    getEnergyPerSecond(
      generatorLevel,
      resonanceLevel,
      manualClicks,
      pressureLevel,
    ) * getCavitationSeconds(cavitationLevel),
  )
}

export function getClickOutcome(state: GameState): ClickOutcome {
  const nextManualClicks = state.manualClicks + 1
  const clickEnergy = getClickPower(
    state.clickLevel,
    nextManualClicks,
    state.pressureLevel,
  )

  if (state.cavitationLevel === 0) {
    return {
      nextManualClicks,
      clickEnergy,
      cavitationEnergy: 0,
      nextCavitationCharge: 0,
      cavitationTriggered: false,
    }
  }

  const threshold = getCavitationClicksRequired(state.cavitationLevel)
  const accumulatedCharge = state.cavitationCharge + 1
  const cavitationTriggered = accumulatedCharge >= threshold
  const cavitationEnergy = cavitationTriggered
    ? getCavitationReward(
        state.generatorLevel,
        state.resonanceLevel,
        nextManualClicks,
        state.pressureLevel,
        state.cavitationLevel,
      )
    : 0

  return {
    nextManualClicks,
    clickEnergy,
    cavitationEnergy,
    nextCavitationCharge: cavitationTriggered ? 0 : accumulatedCharge,
    cavitationTriggered,
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

export function loadGameState(fallback: GameState): GameState {
  try {
    const rawSave = window.localStorage.getItem(GAME_STORAGE_KEY)

    if (!rawSave) {
      return fallback
    }

    const storedGame = JSON.parse(rawSave) as Partial<StoredGame>

    if (storedGame.version !== SAVE_VERSION) {
      return fallback
    }

    return sanitizeGameState(storedGame.state, fallback)
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
  } catch {
    // El estado en memoria todavía puede reiniciarse con normalidad.
  }
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'click': {
      const outcome = getClickOutcome(state)

      return {
        ...state,
        energy: roundEnergy(
          state.energy + outcome.clickEnergy + outcome.cavitationEnergy,
        ),
        manualClicks: outcome.nextManualClicks,
        cavitationCharge: outcome.nextCavitationCharge,
      }
    }

    case 'tick': {
      const production = getEnergyPerSecond(
        state.generatorLevel,
        state.resonanceLevel,
        state.manualClicks,
        state.pressureLevel,
      )

      if (production === 0) {
        return state
      }

      return {
        ...state,
        energy: roundEnergy(state.energy + production),
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
        state.manualClicks < PRESSURE_REQUIRED_CLICKS ||
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
        state.manualClicks < CAVITATION_REQUIRED_CLICKS ||
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

    case 'reset':
      return initialGameState
  }
}
