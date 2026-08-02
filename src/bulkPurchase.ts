import {
  AUTOCLICK_REQUIRED_CLICKS,
  CAVITATION_REQUIRED_CLICKS,
  gameReducer,
  getAutoclickRate,
  getCavitationClicksRequired,
  getCavitationReward,
  getClickPower,
  getEnergyPerSecond,
  getOverloadClicksRequired,
  getOverloadDurationSeconds,
  getOverloadMultiplier,
  getPressureTier,
  getSapphireMultiplier,
  SPHERE_CLICK_CAPACITY,
  type GameAction,
  type GameState,
} from './game'
import {
  getPulseTriggerRate,
  PULSE_TRIGGER_CHARGE_CLICKS,
} from './pulseTrigger'
import {
  getRefractionBonusMultiplier,
  getRefractionChargeRate,
  getRefractionDurationSeconds,
  getRefractionFacetCount,
  getRefractionOrbitDuration,
  getRefractionRewardSeconds,
  REFRACTION_REQUIRED_PRESTIGE,
} from './refraction'

export type BulkPurchaseStrategy = 'balanced' | 'active' | 'automatic'

export type BulkPurchaseKind =
  | 'click'
  | 'pulseTrigger'
  | 'generator'
  | 'resonance'
  | 'pressure'
  | 'cavitation'
  | 'autoclick'
  | 'overload'
  | 'refraction'

type PurchaseAction = Extract<GameAction, { type: `buy-${string}` }>

type PurchaseDefinition = {
  kind: BulkPurchaseKind
  label: string
  action: PurchaseAction
}

export type BulkPurchaseItem = {
  kind: BulkPurchaseKind
  label: string
  cost: number
}

export type BulkPurchasePlan = {
  strategy: BulkPurchaseStrategy
  finalState: GameState
  purchases: BulkPurchaseItem[]
  spent: number
  remainingEnergy: number
  counts: Record<BulkPurchaseKind, number>
}

const MAX_PURCHASES_PER_RUN = 320

const PURCHASES: readonly PurchaseDefinition[] = [
  {
    kind: 'click',
    label: 'Amplificador de pulso',
    action: { type: 'buy-click-upgrade' },
  },
  {
    kind: 'pulseTrigger',
    label: 'Acelerador de pulso',
    action: { type: 'buy-pulse-trigger' },
  },
  {
    kind: 'generator',
    label: 'Microgenerador',
    action: { type: 'buy-generator' },
  },
  {
    kind: 'resonance',
    label: 'Reactor de resonancia',
    action: { type: 'buy-resonance' },
  },
  {
    kind: 'pressure',
    label: 'Condensador de presión',
    action: { type: 'buy-pressure' },
  },
  {
    kind: 'cavitation',
    label: 'Cámara de cavitación',
    action: { type: 'buy-cavitation' },
  },
  {
    kind: 'autoclick',
    label: 'Módulo de pulsación autónoma',
    action: { type: 'buy-autoclicker' },
  },
  {
    kind: 'overload',
    label: 'Válvula de sobrecarga',
    action: { type: 'buy-overload' },
  },
  {
    kind: 'refraction',
    label: 'Matriz de refracción',
    action: { type: 'buy-refraction' },
  },
]

const STRATEGY_BIAS: Record<
  BulkPurchaseStrategy,
  Record<BulkPurchaseKind, number>
> = {
  balanced: {
    click: 1,
    pulseTrigger: 1.05,
    generator: 1.15,
    resonance: 1.1,
    pressure: 1.2,
    cavitation: 1.15,
    autoclick: 1,
    overload: 0.9,
    refraction: 0.95,
  },
  active: {
    click: 1.35,
    pulseTrigger: 1.45,
    generator: 0.9,
    resonance: 0.85,
    pressure: 1.25,
    cavitation: 1.35,
    autoclick: 0.55,
    overload: 1.3,
    refraction: 0.85,
  },
  automatic: {
    click: 0.45,
    pulseTrigger: 0.18,
    generator: 1.4,
    resonance: 1.35,
    pressure: 1.15,
    cavitation: 0.85,
    autoclick: 1.45,
    overload: 0.7,
    refraction: 1.15,
  },
}

const MANUAL_CLICKS_PER_SECOND: Record<BulkPurchaseStrategy, number> = {
  balanced: 1.5,
  active: 5,
  automatic: 0.05,
}

const DIVERSITY_PENALTY: Record<BulkPurchaseStrategy, number> = {
  balanced: 0.14,
  active: 0.08,
  automatic: 0.08,
}

function createEmptyCounts(): Record<BulkPurchaseKind, number> {
  return {
    click: 0,
    pulseTrigger: 0,
    generator: 0,
    resonance: 0,
    pressure: 0,
    cavitation: 0,
    autoclick: 0,
    overload: 0,
    refraction: 0,
  }
}

function getStateUtility(state: GameState, strategy: BulkPurchaseStrategy) {
  const sapphireMultiplier = getSapphireMultiplier(state.prestigeCount)
  const clickPower = getClickPower(
    state.clickLevel,
    state.manualClicks,
    state.pressureLevel,
    1,
    sapphireMultiplier,
  )
  const production = getEnergyPerSecond(
    state.generatorLevel,
    state.resonanceLevel,
    state.manualClicks,
    state.pressureLevel,
    1,
    sapphireMultiplier,
  )
  const cavitationPerClick =
    state.cavitationLevel > 0
      ? getCavitationReward(
          state.generatorLevel,
          state.resonanceLevel,
          state.manualClicks,
          state.pressureLevel,
          state.cavitationLevel,
          1,
          sapphireMultiplier,
        ) / getCavitationClicksRequired(state.cavitationLevel)
      : 0
  const manualRate = MANUAL_CLICKS_PER_SECOND[strategy]
  const triggerBonusRate =
    manualRate *
    (getPulseTriggerRate(state.pulseTriggerLevel) /
      PULSE_TRIGGER_CHARGE_CLICKS)
  const autoclickRate = getAutoclickRate(state.autoclickLevel)
  const totalClickRate = manualRate + triggerBonusRate + autoclickRate
  const valuePerClick = clickPower + cavitationPerClick
  const baseValue = production + totalClickRate * valuePerClick

  let overloadValue = 0
  if (state.overloadLevel > 0) {
    const readiness =
      state.manualClicks >= SPHERE_CLICK_CAPACITY
        ? 1
        : state.prestigeCount > 0
          ? Math.min(0.35, state.manualClicks / SPHERE_CLICK_CAPACITY)
          : 0
    const chargeSeconds =
      getOverloadClicksRequired(state.overloadLevel) /
      Math.max(totalClickRate, 0.05)
    const duration = getOverloadDurationSeconds(state.overloadLevel)
    const dutyCycle = Math.min(0.9, duration / (chargeSeconds + duration))

    overloadValue =
      baseValue *
      (getOverloadMultiplier(state.overloadLevel) - 1) *
      dutyCycle *
      readiness
  }

  let refractionValue = 0
  if (
    state.refractionLevel > 0 &&
    state.prestigeCount >= REFRACTION_REQUIRED_PRESTIGE
  ) {
    const cycleSeconds =
      (getRefractionFacetCount(state.prestigeCount) *
        getRefractionOrbitDuration(state.manualClicks)) /
      getRefractionChargeRate(state.refractionLevel)
    const duration = getRefractionDurationSeconds(state.refractionLevel)
    const dutyCycle = Math.min(0.9, duration / (cycleSeconds + duration))
    const rewardPerSecond =
      (production * getRefractionRewardSeconds(state.refractionLevel)) /
      cycleSeconds

    refractionValue =
      rewardPerSecond +
      baseValue *
        (getRefractionBonusMultiplier(state.refractionLevel) - 1) *
        dutyCycle
  }

  return baseValue + overloadValue + refractionValue
}

function getFoundationBoost(
  state: GameState,
  kind: BulkPurchaseKind,
  strategy: BulkPurchaseStrategy,
) {
  if (kind === 'pulseTrigger' && state.pulseTriggerLevel === 0) {
    if (strategy === 'active') return 2.2
    return strategy === 'balanced' ? 1.35 : 0.35
  }

  if (kind === 'generator' && state.generatorLevel === 0) {
    return strategy === 'automatic' ? 7 : 5
  }

  if (
    kind === 'resonance' &&
    state.resonanceLevel === 0 &&
    state.generatorLevel > 0
  ) {
    if (strategy === 'automatic') return 3.5
    return strategy === 'balanced' ? 2.8 : 1.7
  }

  if (
    kind === 'pressure' &&
    state.pressureLevel === 0 &&
    getPressureTier(state.manualClicks) > 0
  ) {
    const profileWeight =
      strategy === 'active' ? 1.3 : strategy === 'balanced' ? 1.1 : 0.9
    return 1 + (getPressureTier(state.manualClicks) / 5) * profileWeight
  }

  if (
    kind === 'cavitation' &&
    state.cavitationLevel === 0 &&
    state.generatorLevel > 0
  ) {
    if (strategy === 'active') return 5
    return strategy === 'balanced' ? 3.5 : 1.6
  }

  if (
    kind === 'autoclick' &&
    state.autoclickLevel === 0 &&
    state.generatorLevel > 0
  ) {
    if (strategy === 'automatic') return 4.5
    return strategy === 'balanced' ? 1.8 : 0.7
  }

  if (
    kind === 'overload' &&
    state.overloadLevel === 0 &&
    state.cavitationLevel > 0
  ) {
    if (strategy === 'active') return 3.2
    return strategy === 'balanced' ? 1.4 : 0.8
  }

  if (
    kind === 'refraction' &&
    state.refractionLevel === 0 &&
    state.prestigeCount >= REFRACTION_REQUIRED_PRESTIGE
  ) {
    if (strategy === 'automatic') return 1.6
    return strategy === 'balanced' ? 1.4 : 0.9
  }

  return 1
}

function getDiscoveryBoost(
  state: GameState,
  kind: BulkPurchaseKind,
  strategy: BulkPurchaseStrategy,
) {
  if (
    kind === 'cavitation' &&
    state.prestigeCount === 0 &&
    state.manualClicks < CAVITATION_REQUIRED_CLICKS
  ) {
    return 0
  }

  if (
    kind === 'autoclick' &&
    state.prestigeCount === 0 &&
    state.manualClicks < AUTOCLICK_REQUIRED_CLICKS
  ) {
    return 0
  }

  if (
    kind === 'overload' &&
    state.prestigeCount === 0 &&
    state.manualClicks < SPHERE_CLICK_CAPACITY
  ) {
    return 0
  }

  if (kind === 'click' && state.manualClicks < 100) {
    return strategy === 'automatic' ? 1.25 : 1.1
  }

  return 1
}

export function planBulkPurchases(
  initialState: GameState,
  strategy: BulkPurchaseStrategy,
): BulkPurchasePlan {
  let state = initialState
  const purchases: BulkPurchaseItem[] = []
  const counts = createEmptyCounts()

  for (
    let purchaseIndex = 0;
    purchaseIndex < MAX_PURCHASES_PER_RUN;
    purchaseIndex += 1
  ) {
    const currentUtility = getStateUtility(state, strategy)
    let best:
      | {
          definition: PurchaseDefinition
          nextState: GameState
          cost: number
          score: number
        }
      | undefined

    for (const definition of PURCHASES) {
      const nextState = gameReducer(state, definition.action)
      if (nextState === state) continue

      const cost = Math.max(0, state.energy - nextState.energy)
      if (cost <= 0) continue

      const utilityGain = Math.max(
        0.000000001,
        getStateUtility(nextState, strategy) - currentUtility,
      )
      const diversity =
        1 / (1 + counts[definition.kind] * DIVERSITY_PENALTY[strategy])
      const score =
        (utilityGain / cost) *
        STRATEGY_BIAS[strategy][definition.kind] *
        getFoundationBoost(state, definition.kind, strategy) *
        getDiscoveryBoost(state, definition.kind, strategy) *
        diversity

      if (!best || score > best.score) {
        best = { definition, nextState, cost, score }
      }
    }

    if (!best) break

    state = best.nextState
    counts[best.definition.kind] += 1
    purchases.push({
      kind: best.definition.kind,
      label: best.definition.label,
      cost: best.cost,
    })
  }

  return {
    strategy,
    finalState: state,
    purchases,
    spent: Math.max(0, initialState.energy - state.energy),
    remainingEnergy: state.energy,
    counts,
  }
}
