export const BALANCE_CONFIG_SCHEMA_VERSION = 1
export const BALANCE_DEV_STORAGE_KEY =
  'incremental-game-a:balance-dev:v1'

export type CostCurveConfig = {
  baseCost: number
  growth: number
}

export type BalanceConfig = {
  schemaVersion: typeof BALANCE_CONFIG_SCHEMA_VERSION
  costs: {
    click: CostCurveConfig
    generator: CostCurveConfig
    resonance: CostCurveConfig
    pressure: CostCurveConfig
    cavitation: CostCurveConfig
    autoclick: CostCurveConfig
    overload: CostCurveConfig
    refraction: CostCurveConfig
    pulseTrigger: CostCurveConfig
  }
  unlocks: {
    pressureRequiredClicks: number
    cavitationRequiredClicks: number
    autoclickRequiredClicks: number
    refractionRequiredPrestige: number
  }
  core: {
    sphereClickCapacity: number
    pressureBonusPerTier: number
  }
  cavitation: {
    baseClicksRequired: number
    clicksReducedPerLevel: number
    minimumClicksRequired: number
    baseDurationSeconds: number
    durationSecondsPerLevel: number
  }
  autoclick: {
    baseRate: number
    growth: number
    maximumRate: number
  }
  overload: {
    baseClicksRequired: number
    clicksReducedPerLevel: number
    minimumClicksRequired: number
    baseDurationSeconds: number
    durationSecondsPerLevel: number
    baseMultiplier: number
    multiplierPerLevel: number
  }
  refraction: {
    facetCounts: readonly [number, number, number, number]
    baseChargeRate: number
    chargeRatePerLevel: number
    baseBonusMultiplier: number
    bonusMultiplierPerLevel: number
    baseDurationSeconds: number
    durationSecondsPerLevel: number
    baseRewardSeconds: number
    rewardSecondsPerLevel: number
    minimumOrbitDurationSeconds: number
    maximumOrbitDurationSeconds: number
    orbitAccelerationPower: number
  }
  pulseTrigger: {
    chargeClicks: number
    reserveGainMs: number
    maximumReserveMs: number
    baseRate: number
    ratePerLevel: number
    maximumRate: number
    maximumLevel: number
  }
  sapphire: {
    multipliers: readonly [number, number, number, number, number, number]
    postMaximumLevelIncrement: number
  }
  engineLimits: {
    maximumAutomaticClicksPerTick: number
    maximumBulkPurchaseIterations: number
    maximumFiniteValue: number
  }
}

export const BALANCE_CONFIG_LIMITS = {
  costBase: { minimum: 0.01, maximum: 1_000_000_000_000 },
  growth: { minimum: 1, maximum: 10 },
  clicks: { minimum: 1, maximum: 1_000_000_000 },
  seconds: { minimum: 0.05, maximum: 3_600 },
  multiplier: { minimum: 1, maximum: 1_000 },
  rate: { minimum: 0, maximum: 10_000 },
  level: { minimum: 0, maximum: 1_000 },
  finiteValue: { minimum: 1, maximum: Number.MAX_SAFE_INTEGER },
} as const

function deepFreeze<T>(value: T): Readonly<T> {
  if (typeof value !== 'object' || value === null || Object.isFrozen(value)) {
    return value
  }

  Object.freeze(value)
  for (const child of Object.values(value)) {
    deepFreeze(child)
  }

  return value
}

export function cloneBalanceConfig(config: BalanceConfig): BalanceConfig {
  return structuredClone(config)
}

export function freezeBalanceConfig(config: BalanceConfig): Readonly<BalanceConfig> {
  return deepFreeze(config)
}

export const DEFAULT_BALANCE_CONFIG = freezeBalanceConfig({
  schemaVersion: BALANCE_CONFIG_SCHEMA_VERSION,
  costs: {
    click: { baseCost: 10, growth: 1.7 },
    generator: { baseCost: 25, growth: 1.8 },
    resonance: { baseCost: 120, growth: 2.2 },
    pressure: { baseCost: 500, growth: 2.4 },
    cavitation: { baseCost: 2_000, growth: 2.6 },
    autoclick: { baseCost: 5_000, growth: 2.8 },
    overload: { baseCost: 10_000, growth: 3 },
    refraction: { baseCost: 25_000, growth: 3.15 },
    pulseTrigger: { baseCost: 6_000, growth: 2.25 },
  },
  unlocks: {
    pressureRequiredClicks: 100,
    cavitationRequiredClicks: 500,
    autoclickRequiredClicks: 500,
    refractionRequiredPrestige: 1,
  },
  core: {
    sphereClickCapacity: 5_000,
    pressureBonusPerTier: 2,
  },
  cavitation: {
    baseClicksRequired: 28,
    clicksReducedPerLevel: 3,
    minimumClicksRequired: 10,
    baseDurationSeconds: 3,
    durationSecondsPerLevel: 2,
  },
  autoclick: {
    baseRate: 0.2,
    growth: 1.6,
    maximumRate: 20,
  },
  overload: {
    baseClicksRequired: 110,
    clicksReducedPerLevel: 10,
    minimumClicksRequired: 40,
    baseDurationSeconds: 12,
    durationSecondsPerLevel: 3,
    baseMultiplier: 1.5,
    multiplierPerLevel: 0.5,
  },
  refraction: {
    facetCounts: [6, 8, 10, 12],
    baseChargeRate: 1,
    chargeRatePerLevel: 0.15,
    baseBonusMultiplier: 1.2,
    bonusMultiplierPerLevel: 0.05,
    baseDurationSeconds: 4,
    durationSecondsPerLevel: 1,
    baseRewardSeconds: 8,
    rewardSecondsPerLevel: 3,
    minimumOrbitDurationSeconds: 3,
    maximumOrbitDurationSeconds: 20,
    orbitAccelerationPower: 1.6,
  },
  pulseTrigger: {
    chargeClicks: 10,
    reserveGainMs: 1_000,
    maximumReserveMs: 10_000,
    baseRate: 6,
    ratePerLevel: 0.5,
    maximumRate: 9,
    maximumLevel: 6,
  },
  sapphire: {
    multipliers: [1, 1.5, 1.85, 2.2, 2.6, 3.05],
    postMaximumLevelIncrement: 0.5,
  },
  engineLimits: {
    maximumAutomaticClicksPerTick: 200,
    maximumBulkPurchaseIterations: 10_000,
    maximumFiniteValue: Number.MAX_SAFE_INTEGER,
  },
} satisfies BalanceConfig)
