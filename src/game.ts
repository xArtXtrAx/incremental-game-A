export const CLICK_UPGRADE_BASE_COST = 10
export const GENERATOR_BASE_COST = 25
export const SPHERE_CLICK_CAPACITY = 5000
export const GAME_STORAGE_KEY = 'incremental-game-a:save:v1'

const CLICK_UPGRADE_GROWTH = 1.7
const GENERATOR_GROWTH = 1.8
const SAVE_VERSION = 1

export type GameState = {
  energy: number
  manualClicks: number
  clickLevel: number
  generatorLevel: number
}

export type GameAction =
  | { type: 'click' }
  | { type: 'tick' }
  | { type: 'buy-click-upgrade' }
  | { type: 'buy-generator' }
  | { type: 'reset' }

export const initialGameState: GameState = {
  energy: 0,
  manualClicks: 0,
  clickLevel: 0,
  generatorLevel: 0,
}

type StoredGame = {
  version: number
  state: GameState
}

function getScaledCost(baseCost: number, growth: number, level: number) {
  return Math.ceil(baseCost * growth ** level)
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
    energy: getSafeInteger(candidate.energy, fallback.energy),
    manualClicks: getSafeInteger(candidate.manualClicks, fallback.manualClicks),
    clickLevel: getSafeInteger(candidate.clickLevel, fallback.clickLevel),
    generatorLevel: getSafeInteger(
      candidate.generatorLevel,
      fallback.generatorLevel,
    ),
  }
}

export function getClickPower(level: number) {
  return level + 1
}

export function getEnergyPerSecond(generatorLevel: number) {
  return generatorLevel
}

export function getClickUpgradeCost(level: number) {
  return getScaledCost(CLICK_UPGRADE_BASE_COST, CLICK_UPGRADE_GROWTH, level)
}

export function getGeneratorCost(level: number) {
  return getScaledCost(GENERATOR_BASE_COST, GENERATOR_GROWTH, level)
}

export function getSphereFillPercentage(manualClicks: number) {
  return Math.min((manualClicks / SPHERE_CLICK_CAPACITY) * 100, 100)
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
    case 'click':
      return {
        ...state,
        energy: state.energy + getClickPower(state.clickLevel),
        manualClicks: state.manualClicks + 1,
      }

    case 'tick': {
      const production = getEnergyPerSecond(state.generatorLevel)

      if (production === 0) {
        return state
      }

      return {
        ...state,
        energy: state.energy + production,
      }
    }

    case 'buy-click-upgrade': {
      const cost = getClickUpgradeCost(state.clickLevel)

      if (state.energy < cost) {
        return state
      }

      return {
        ...state,
        energy: state.energy - cost,
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
        energy: state.energy - cost,
        generatorLevel: state.generatorLevel + 1,
      }
    }

    case 'reset':
      return initialGameState
  }
}
