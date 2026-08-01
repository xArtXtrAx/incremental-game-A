export const CLICK_UPGRADE_BASE_COST = 10
export const GENERATOR_BASE_COST = 25

const CLICK_UPGRADE_GROWTH = 1.7
const GENERATOR_GROWTH = 1.8

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

export const initialGameState: GameState = {
  energy: 0,
  manualClicks: 0,
  clickLevel: 0,
  generatorLevel: 0,
}

function getScaledCost(baseCost: number, growth: number, level: number) {
  return Math.ceil(baseCost * growth ** level)
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
  }
}
