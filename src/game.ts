export const CLICK_UPGRADE_BASE_COST = 10
export const GENERATOR_BASE_COST = 25
export const RESONANCE_BASE_COST = 120
export const PRESSURE_BASE_COST = 500
export const PRESSURE_REQUIRED_CLICKS = 100
export const SPHERE_CLICK_CAPACITY = 5000
export const GAME_STORAGE_KEY = 'incremental-game-a:save:v1'

const CLICK_UPGRADE_GROWTH = 1.7
const GENERATOR_GROWTH = 1.8
const RESONANCE_GROWTH = 2.2
const PRESSURE_GROWTH = 2.4
const PRESSURE_BONUS_PER_TIER = 2
const SAVE_VERSION = 1

export type GameState = {
  energy: number
  manualClicks: number
  clickLevel: number
  generatorLevel: number
  resonanceLevel: number
  pressureLevel: number
}

export type GameAction =
  | { type: 'click' }
  | { type: 'tick' }
  | { type: 'buy-click-upgrade' }
  | { type: 'buy-generator' }
  | { type: 'buy-resonance' }
  | { type: 'buy-pressure' }
  | { type: 'reset' }

export const initialGameState: GameState = {
  energy: 0,
  manualClicks: 0,
  clickLevel: 0,
  generatorLevel: 0,
  resonanceLevel: 0,
  pressureLevel: 0,
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
      const nextManualClicks = state.manualClicks + 1
      const clickPower = getClickPower(
        state.clickLevel,
        nextManualClicks,
        state.pressureLevel,
      )

      return {
        ...state,
        energy: roundEnergy(state.energy + clickPower),
        manualClicks: nextManualClicks,
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

    case 'reset':
      return initialGameState
  }
}
