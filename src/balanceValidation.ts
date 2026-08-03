import {
  BALANCE_CONFIG_LIMITS,
  BALANCE_CONFIG_SCHEMA_VERSION,
  cloneBalanceConfig,
  freezeBalanceConfig,
  type BalanceConfig,
} from './balanceConfig'

export type BalanceValidationSeverity = 'error' | 'warning'

export type BalanceValidationIssue = {
  path: string
  severity: BalanceValidationSeverity
  message: string
}

export type BalanceValidationResult =
  | {
      valid: true
      config: Readonly<BalanceConfig>
      issues: BalanceValidationIssue[]
    }
  | {
      valid: false
      config: null
      issues: BalanceValidationIssue[]
    }

type NumericRule = {
  path: readonly string[]
  minimum: number
  maximum: number
  integer?: boolean
}

const COST_PATHS = [
  'click',
  'generator',
  'resonance',
  'pressure',
  'cavitation',
  'autoclick',
  'overload',
  'refraction',
  'pulseTrigger',
] as const

const numericRules: NumericRule[] = [
  ...COST_PATHS.flatMap((cost) => [
    {
      path: ['costs', cost, 'baseCost'],
      ...BALANCE_CONFIG_LIMITS.costBase,
    },
    {
      path: ['costs', cost, 'growth'],
      ...BALANCE_CONFIG_LIMITS.growth,
    },
  ]),
  {
    path: ['unlocks', 'pressureRequiredClicks'],
    ...BALANCE_CONFIG_LIMITS.clicks,
    integer: true,
  },
  {
    path: ['unlocks', 'cavitationRequiredClicks'],
    ...BALANCE_CONFIG_LIMITS.clicks,
    integer: true,
  },
  {
    path: ['unlocks', 'autoclickRequiredClicks'],
    ...BALANCE_CONFIG_LIMITS.clicks,
    integer: true,
  },
  {
    path: ['unlocks', 'refractionRequiredPrestige'],
    ...BALANCE_CONFIG_LIMITS.level,
    integer: true,
  },
  {
    path: ['core', 'sphereClickCapacity'],
    ...BALANCE_CONFIG_LIMITS.clicks,
    integer: true,
  },
  {
    path: ['core', 'pressureBonusPerTier'],
    minimum: 0,
    maximum: 1_000,
  },
  {
    path: ['cavitation', 'baseClicksRequired'],
    ...BALANCE_CONFIG_LIMITS.clicks,
    integer: true,
  },
  {
    path: ['cavitation', 'clicksReducedPerLevel'],
    minimum: 0,
    maximum: BALANCE_CONFIG_LIMITS.clicks.maximum,
    integer: true,
  },
  {
    path: ['cavitation', 'minimumClicksRequired'],
    ...BALANCE_CONFIG_LIMITS.clicks,
    integer: true,
  },
  {
    path: ['cavitation', 'baseDurationSeconds'],
    ...BALANCE_CONFIG_LIMITS.seconds,
  },
  {
    path: ['cavitation', 'durationSecondsPerLevel'],
    minimum: 0,
    maximum: BALANCE_CONFIG_LIMITS.seconds.maximum,
  },
  {
    path: ['autoclick', 'baseRate'],
    ...BALANCE_CONFIG_LIMITS.rate,
  },
  {
    path: ['autoclick', 'growth'],
    ...BALANCE_CONFIG_LIMITS.growth,
  },
  {
    path: ['autoclick', 'maximumRate'],
    ...BALANCE_CONFIG_LIMITS.rate,
  },
  {
    path: ['overload', 'baseClicksRequired'],
    ...BALANCE_CONFIG_LIMITS.clicks,
    integer: true,
  },
  {
    path: ['overload', 'clicksReducedPerLevel'],
    minimum: 0,
    maximum: BALANCE_CONFIG_LIMITS.clicks.maximum,
    integer: true,
  },
  {
    path: ['overload', 'minimumClicksRequired'],
    ...BALANCE_CONFIG_LIMITS.clicks,
    integer: true,
  },
  {
    path: ['overload', 'baseDurationSeconds'],
    ...BALANCE_CONFIG_LIMITS.seconds,
  },
  {
    path: ['overload', 'durationSecondsPerLevel'],
    minimum: 0,
    maximum: BALANCE_CONFIG_LIMITS.seconds.maximum,
  },
  {
    path: ['overload', 'baseMultiplier'],
    ...BALANCE_CONFIG_LIMITS.multiplier,
  },
  {
    path: ['overload', 'multiplierPerLevel'],
    minimum: 0,
    maximum: BALANCE_CONFIG_LIMITS.multiplier.maximum,
  },
  {
    path: ['refraction', 'baseChargeRate'],
    ...BALANCE_CONFIG_LIMITS.rate,
  },
  {
    path: ['refraction', 'chargeRatePerLevel'],
    minimum: 0,
    maximum: BALANCE_CONFIG_LIMITS.rate.maximum,
  },
  {
    path: ['refraction', 'baseBonusMultiplier'],
    ...BALANCE_CONFIG_LIMITS.multiplier,
  },
  {
    path: ['refraction', 'bonusMultiplierPerLevel'],
    minimum: 0,
    maximum: BALANCE_CONFIG_LIMITS.multiplier.maximum,
  },
  {
    path: ['refraction', 'baseDurationSeconds'],
    ...BALANCE_CONFIG_LIMITS.seconds,
  },
  {
    path: ['refraction', 'durationSecondsPerLevel'],
    minimum: 0,
    maximum: BALANCE_CONFIG_LIMITS.seconds.maximum,
  },
  {
    path: ['refraction', 'baseRewardSeconds'],
    minimum: 0,
    maximum: BALANCE_CONFIG_LIMITS.seconds.maximum,
  },
  {
    path: ['refraction', 'rewardSecondsPerLevel'],
    minimum: 0,
    maximum: BALANCE_CONFIG_LIMITS.seconds.maximum,
  },
  {
    path: ['refraction', 'minimumOrbitDurationSeconds'],
    ...BALANCE_CONFIG_LIMITS.seconds,
  },
  {
    path: ['refraction', 'maximumOrbitDurationSeconds'],
    ...BALANCE_CONFIG_LIMITS.seconds,
  },
  {
    path: ['refraction', 'orbitAccelerationPower'],
    minimum: 0.05,
    maximum: 20,
  },
  {
    path: ['pulseTrigger', 'chargeClicks'],
    ...BALANCE_CONFIG_LIMITS.clicks,
    integer: true,
  },
  {
    path: ['pulseTrigger', 'reserveGainMs'],
    minimum: 1,
    maximum: 3_600_000,
  },
  {
    path: ['pulseTrigger', 'maximumReserveMs'],
    minimum: 1,
    maximum: 86_400_000,
  },
  {
    path: ['pulseTrigger', 'baseRate'],
    ...BALANCE_CONFIG_LIMITS.rate,
  },
  {
    path: ['pulseTrigger', 'ratePerLevel'],
    minimum: 0,
    maximum: BALANCE_CONFIG_LIMITS.rate.maximum,
  },
  {
    path: ['pulseTrigger', 'maximumRate'],
    ...BALANCE_CONFIG_LIMITS.rate,
  },
  {
    path: ['pulseTrigger', 'maximumLevel'],
    ...BALANCE_CONFIG_LIMITS.level,
    integer: true,
  },
  {
    path: ['sapphire', 'postMaximumLevelIncrement'],
    minimum: 0,
    maximum: BALANCE_CONFIG_LIMITS.multiplier.maximum,
  },
  {
    path: ['engineLimits', 'maximumAutomaticClicksPerTick'],
    minimum: 1,
    maximum: 100_000,
    integer: true,
  },
  {
    path: ['engineLimits', 'maximumBulkPurchaseIterations'],
    minimum: 1,
    maximum: 1_000_000,
    integer: true,
  },
  {
    path: ['engineLimits', 'maximumFiniteValue'],
    ...BALANCE_CONFIG_LIMITS.finiteValue,
  },
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readPath(value: unknown, path: readonly string[]) {
  let current = value

  for (const segment of path) {
    if (!isRecord(current)) return undefined
    current = current[segment]
  }

  return current
}

function pathLabel(path: readonly string[]) {
  return path.join('.')
}

function validateNumber(
  candidate: unknown,
  rule: NumericRule,
  issues: BalanceValidationIssue[],
) {
  const value = readPath(candidate, rule.path)
  const path = pathLabel(rule.path)

  if (typeof value !== 'number' || !Number.isFinite(value)) {
    issues.push({
      path,
      severity: 'error',
      message: 'Debe ser un número finito.',
    })
    return
  }

  if (rule.integer && !Number.isInteger(value)) {
    issues.push({
      path,
      severity: 'error',
      message: 'Debe ser un número entero.',
    })
  }

  if (value < rule.minimum || value > rule.maximum) {
    issues.push({
      path,
      severity: 'error',
      message: `Debe permanecer entre ${rule.minimum} y ${rule.maximum}.`,
    })
  }
}

function validateNumberArray(
  candidate: unknown,
  path: readonly string[],
  expectedLength: number,
  issues: BalanceValidationIssue[],
  options: { minimum: number; strictlyIncreasing?: boolean },
) {
  const value = readPath(candidate, path)
  const label = pathLabel(path)

  if (!Array.isArray(value) || value.length !== expectedLength) {
    issues.push({
      path: label,
      severity: 'error',
      message: `Debe contener exactamente ${expectedLength} valores.`,
    })
    return
  }

  value.forEach((item, index) => {
    if (typeof item !== 'number' || !Number.isFinite(item)) {
      issues.push({
        path: `${label}.${index}`,
        severity: 'error',
        message: 'Debe ser un número finito.',
      })
      return
    }

    if (item < options.minimum) {
      issues.push({
        path: `${label}.${index}`,
        severity: 'error',
        message: `Debe ser mayor o igual a ${options.minimum}.`,
      })
    }

    if (
      options.strictlyIncreasing &&
      index > 0 &&
      typeof value[index - 1] === 'number' &&
      item <= value[index - 1]
    ) {
      issues.push({
        path: `${label}.${index}`,
        severity: 'error',
        message: 'La secuencia debe crecer estrictamente.',
      })
    }
  })
}

export function validateBalanceConfig(candidate: unknown): BalanceValidationResult {
  const issues: BalanceValidationIssue[] = []

  if (!isRecord(candidate)) {
    return {
      valid: false,
      config: null,
      issues: [
        {
          path: 'root',
          severity: 'error',
          message: 'La configuración debe ser un objeto.',
        },
      ],
    }
  }

  if (candidate.schemaVersion !== BALANCE_CONFIG_SCHEMA_VERSION) {
    issues.push({
      path: 'schemaVersion',
      severity: 'error',
      message: `Se requiere la versión ${BALANCE_CONFIG_SCHEMA_VERSION}.`,
    })
  }

  numericRules.forEach((rule) => validateNumber(candidate, rule, issues))
  validateNumberArray(candidate, ['refraction', 'facetCounts'], 4, issues, {
    minimum: 1,
    strictlyIncreasing: true,
  })
  validateNumberArray(candidate, ['sapphire', 'multipliers'], 6, issues, {
    minimum: 1,
    strictlyIncreasing: true,
  })

  const minimumCavitation = readPath(candidate, [
    'cavitation',
    'minimumClicksRequired',
  ])
  const baseCavitation = readPath(candidate, [
    'cavitation',
    'baseClicksRequired',
  ])
  if (
    typeof minimumCavitation === 'number' &&
    typeof baseCavitation === 'number' &&
    minimumCavitation > baseCavitation
  ) {
    issues.push({
      path: 'cavitation.minimumClicksRequired',
      severity: 'error',
      message: 'No puede superar el umbral base de Cavitación.',
    })
  }

  const minimumOverload = readPath(candidate, [
    'overload',
    'minimumClicksRequired',
  ])
  const baseOverload = readPath(candidate, [
    'overload',
    'baseClicksRequired',
  ])
  if (
    typeof minimumOverload === 'number' &&
    typeof baseOverload === 'number' &&
    minimumOverload > baseOverload
  ) {
    issues.push({
      path: 'overload.minimumClicksRequired',
      severity: 'error',
      message: 'No puede superar el umbral base de Sobrecarga.',
    })
  }

  const minimumOrbit = readPath(candidate, [
    'refraction',
    'minimumOrbitDurationSeconds',
  ])
  const maximumOrbit = readPath(candidate, [
    'refraction',
    'maximumOrbitDurationSeconds',
  ])
  if (
    typeof minimumOrbit === 'number' &&
    typeof maximumOrbit === 'number' &&
    minimumOrbit > maximumOrbit
  ) {
    issues.push({
      path: 'refraction.minimumOrbitDurationSeconds',
      severity: 'error',
      message: 'No puede superar la duración orbital máxima.',
    })
  }

  const baseAutoclick = readPath(candidate, ['autoclick', 'baseRate'])
  const maximumAutoclick = readPath(candidate, ['autoclick', 'maximumRate'])
  if (
    typeof baseAutoclick === 'number' &&
    typeof maximumAutoclick === 'number' &&
    baseAutoclick > maximumAutoclick
  ) {
    issues.push({
      path: 'autoclick.baseRate',
      severity: 'error',
      message: 'No puede superar la tasa máxima del Autoclicker.',
    })
  }

  const pulseBaseRate = readPath(candidate, ['pulseTrigger', 'baseRate'])
  const pulseMaximumRate = readPath(candidate, [
    'pulseTrigger',
    'maximumRate',
  ])
  if (
    typeof pulseBaseRate === 'number' &&
    typeof pulseMaximumRate === 'number' &&
    pulseBaseRate > pulseMaximumRate
  ) {
    issues.push({
      path: 'pulseTrigger.baseRate',
      severity: 'error',
      message: 'No puede superar la tasa máxima del Gatillo.',
    })
  }

  const reserveGain = readPath(candidate, ['pulseTrigger', 'reserveGainMs'])
  const maximumReserve = readPath(candidate, [
    'pulseTrigger',
    'maximumReserveMs',
  ])
  if (
    typeof reserveGain === 'number' &&
    typeof maximumReserve === 'number' &&
    reserveGain > maximumReserve
  ) {
    issues.push({
      path: 'pulseTrigger.reserveGainMs',
      severity: 'warning',
      message: 'Una sola carga llenará por completo la reserva.',
    })
  }

  const requestedAutoclickMaximum = readPath(candidate, [
    'autoclick',
    'maximumRate',
  ])
  const engineAutoclickLimit = readPath(candidate, [
    'engineLimits',
    'maximumAutomaticClicksPerTick',
  ])
  if (
    typeof requestedAutoclickMaximum === 'number' &&
    typeof engineAutoclickLimit === 'number' &&
    requestedAutoclickMaximum > engineAutoclickLimit
  ) {
    issues.push({
      path: 'autoclick.maximumRate',
      severity: 'error',
      message:
        'Supera el máximo seguro de clics automáticos que el motor permite por tick.',
    })
  }

  const hasErrors = issues.some((issue) => issue.severity === 'error')
  if (hasErrors) {
    return { valid: false, config: null, issues }
  }

  return {
    valid: true,
    config: freezeBalanceConfig(
      cloneBalanceConfig(candidate as unknown as BalanceConfig),
    ),
    issues,
  }
}
