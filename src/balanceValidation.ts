import {
  BALANCE_CONFIG_LIMITS,
  BALANCE_CONFIG_SCHEMA_VERSION,
  DEFAULT_BALANCE_CONFIG,
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

type RangeRule = {
  path: string
  minimum: number
  maximum: number
  integer?: boolean
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readPath(value: unknown, path: string) {
  return path.split('.').reduce<unknown>((current, segment) => {
    if (!isRecord(current)) return undefined
    return current[segment]
  }, value)
}

function addIssue(
  issues: BalanceValidationIssue[],
  path: string,
  severity: BalanceValidationSeverity,
  message: string,
) {
  issues.push({ path, severity, message })
}

function validateShape(
  candidate: unknown,
  template: unknown,
  path: string,
  issues: BalanceValidationIssue[],
) {
  if (Array.isArray(template)) {
    if (!Array.isArray(candidate)) {
      addIssue(issues, path, 'error', 'Debe ser una lista.')
      return
    }

    if (candidate.length !== template.length) {
      addIssue(
        issues,
        path,
        'error',
        `Debe contener exactamente ${template.length} valores.`,
      )
    }

    template.forEach((item, index) => {
      validateShape(candidate[index], item, `${path}.${index}`, issues)
    })
    return
  }

  if (isRecord(template)) {
    if (!isRecord(candidate)) {
      addIssue(issues, path, 'error', 'Debe ser un objeto.')
      return
    }

    Object.entries(template).forEach(([key, value]) => {
      validateShape(
        candidate[key],
        value,
        path ? `${path}.${key}` : key,
        issues,
      )
    })
    return
  }

  if (typeof template === 'number') {
    if (typeof candidate !== 'number' || !Number.isFinite(candidate)) {
      addIssue(issues, path, 'error', 'Debe ser un número finito.')
    }
    return
  }

  if (typeof candidate !== typeof template) {
    addIssue(issues, path, 'error', `Debe ser de tipo ${typeof template}.`)
  }
}

function validateRange(
  candidate: unknown,
  rule: RangeRule,
  issues: BalanceValidationIssue[],
) {
  const value = readPath(candidate, rule.path)
  if (typeof value !== 'number' || !Number.isFinite(value)) return

  if (rule.integer && !Number.isInteger(value)) {
    addIssue(issues, rule.path, 'error', 'Debe ser un número entero.')
  }

  if (value < rule.minimum || value > rule.maximum) {
    addIssue(
      issues,
      rule.path,
      'error',
      `Debe permanecer entre ${rule.minimum} y ${rule.maximum}.`,
    )
  }
}

function validateIncreasingArray(
  candidate: unknown,
  path: string,
  issues: BalanceValidationIssue[],
  options: { minimum: number; integer?: boolean },
) {
  const values = readPath(candidate, path)
  if (!Array.isArray(values)) return

  values.forEach((value, index) => {
    if (typeof value !== 'number' || !Number.isFinite(value)) return

    if (options.integer && !Number.isInteger(value)) {
      addIssue(issues, `${path}.${index}`, 'error', 'Debe ser entero.')
    }

    if (value < options.minimum) {
      addIssue(
        issues,
        `${path}.${index}`,
        'error',
        `Debe ser mayor o igual a ${options.minimum}.`,
      )
    }

    if (
      index > 0 &&
      typeof values[index - 1] === 'number' &&
      value <= values[index - 1]
    ) {
      addIssue(
        issues,
        `${path}.${index}`,
        'error',
        'La secuencia debe crecer estrictamente.',
      )
    }
  })
}

const costSystems = Object.keys(DEFAULT_BALANCE_CONFIG.costs)

const rangeRules: RangeRule[] = [
  ...costSystems.flatMap((system) => [
    {
      path: `costs.${system}.baseCost`,
      ...BALANCE_CONFIG_LIMITS.costBase,
    },
    {
      path: `costs.${system}.growth`,
      ...BALANCE_CONFIG_LIMITS.growth,
    },
  ]),
  ...[
    'unlocks.pressureRequiredClicks',
    'unlocks.cavitationRequiredClicks',
    'unlocks.autoclickRequiredClicks',
    'core.sphereClickCapacity',
    'cavitation.inactiveClicksRequired',
    'cavitation.baseClicksRequired',
    'cavitation.minimumClicksRequired',
    'overload.inactiveClicksRequired',
    'overload.baseClicksRequired',
    'overload.minimumClicksRequired',
    'pulseTrigger.chargeClicks',
  ].map((path) => ({
    path,
    ...BALANCE_CONFIG_LIMITS.clicks,
    integer: true,
  })),
  {
    path: 'unlocks.refractionRequiredPrestige',
    ...BALANCE_CONFIG_LIMITS.level,
    integer: true,
  },
  {
    path: 'core.pressureBonusPerTier',
    minimum: 0,
    maximum: 1_000,
  },
  {
    path: 'cavitation.clicksReducedPerLevel',
    minimum: 0,
    maximum: BALANCE_CONFIG_LIMITS.clicks.maximum,
    integer: true,
  },
  {
    path: 'overload.clicksReducedPerLevel',
    minimum: 0,
    maximum: BALANCE_CONFIG_LIMITS.clicks.maximum,
    integer: true,
  },
  ...[
    'cavitation.baseDurationSeconds',
    'overload.baseDurationSeconds',
    'refraction.baseDurationSeconds',
    'refraction.minimumOrbitDurationSeconds',
    'refraction.maximumOrbitDurationSeconds',
  ].map((path) => ({ path, ...BALANCE_CONFIG_LIMITS.seconds })),
  ...[
    'cavitation.durationSecondsPerLevel',
    'overload.durationSecondsPerLevel',
    'refraction.durationSecondsPerLevel',
    'refraction.baseRewardSeconds',
    'refraction.rewardSecondsPerLevel',
  ].map((path) => ({
    path,
    minimum: 0,
    maximum: BALANCE_CONFIG_LIMITS.seconds.maximum,
  })),
  ...[
    'autoclick.baseRate',
    'autoclick.maximumRate',
    'refraction.baseChargeRate',
    'refraction.chargeRatePerLevel',
    'pulseTrigger.baseRate',
    'pulseTrigger.ratePerLevel',
    'pulseTrigger.maximumRate',
  ].map((path) => ({ path, ...BALANCE_CONFIG_LIMITS.rate })),
  {
    path: 'autoclick.growth',
    ...BALANCE_CONFIG_LIMITS.growth,
  },
  ...[
    'overload.baseMultiplier',
    'refraction.baseBonusMultiplier',
  ].map((path) => ({ path, ...BALANCE_CONFIG_LIMITS.multiplier })),
  ...[
    'overload.multiplierPerLevel',
    'refraction.bonusMultiplierPerLevel',
    'sapphire.postMaximumLevelIncrement',
  ].map((path) => ({
    path,
    minimum: 0,
    maximum: BALANCE_CONFIG_LIMITS.multiplier.maximum,
  })),
  {
    path: 'refraction.orbitAccelerationPower',
    minimum: 0.05,
    maximum: 20,
  },
  {
    path: 'pulseTrigger.reserveGainMs',
    minimum: 1,
    maximum: 3_600_000,
  },
  {
    path: 'pulseTrigger.maximumReserveMs',
    minimum: 1,
    maximum: 86_400_000,
  },
  {
    path: 'pulseTrigger.maximumLevel',
    ...BALANCE_CONFIG_LIMITS.level,
    integer: true,
  },
  {
    path: 'engineLimits.maximumAutomaticClicksPerTick',
    minimum: 1,
    maximum: 100_000,
    integer: true,
  },
  {
    path: 'engineLimits.maximumBulkPurchaseIterations',
    minimum: 1,
    maximum: 1_000_000,
    integer: true,
  },
  {
    path: 'engineLimits.maximumFiniteValue',
    ...BALANCE_CONFIG_LIMITS.finiteValue,
  },
]

function compareNumbers(
  candidate: unknown,
  leftPath: string,
  rightPath: string,
  issues: BalanceValidationIssue[],
  message: string,
) {
  const left = readPath(candidate, leftPath)
  const right = readPath(candidate, rightPath)

  if (
    typeof left === 'number' &&
    typeof right === 'number' &&
    left > right
  ) {
    addIssue(issues, leftPath, 'error', message)
  }
}

export function validateBalanceConfig(candidate: unknown): BalanceValidationResult {
  const issues: BalanceValidationIssue[] = []

  validateShape(candidate, DEFAULT_BALANCE_CONFIG, '', issues)

  if (
    isRecord(candidate) &&
    candidate.schemaVersion !== BALANCE_CONFIG_SCHEMA_VERSION
  ) {
    addIssue(
      issues,
      'schemaVersion',
      'error',
      `Se requiere la versión ${BALANCE_CONFIG_SCHEMA_VERSION}.`,
    )
  }

  rangeRules.forEach((rule) => validateRange(candidate, rule, issues))
  validateIncreasingArray(candidate, 'refraction.facetCounts', issues, {
    minimum: 1,
    integer: true,
  })
  validateIncreasingArray(candidate, 'sapphire.multipliers', issues, {
    minimum: 1,
  })

  compareNumbers(
    candidate,
    'cavitation.minimumClicksRequired',
    'cavitation.baseClicksRequired',
    issues,
    'No puede superar el umbral base de Cavitación.',
  )
  compareNumbers(
    candidate,
    'overload.minimumClicksRequired',
    'overload.baseClicksRequired',
    issues,
    'No puede superar el umbral base de Sobrecarga.',
  )
  compareNumbers(
    candidate,
    'refraction.minimumOrbitDurationSeconds',
    'refraction.maximumOrbitDurationSeconds',
    issues,
    'No puede superar la duración orbital máxima.',
  )
  compareNumbers(
    candidate,
    'autoclick.baseRate',
    'autoclick.maximumRate',
    issues,
    'No puede superar la tasa máxima del Autoclicker.',
  )
  compareNumbers(
    candidate,
    'pulseTrigger.baseRate',
    'pulseTrigger.maximumRate',
    issues,
    'No puede superar la tasa máxima del Gatillo.',
  )
  compareNumbers(
    candidate,
    'autoclick.maximumRate',
    'engineLimits.maximumAutomaticClicksPerTick',
    issues,
    'Supera el máximo seguro de clics automáticos por tick.',
  )

  const reserveGain = readPath(candidate, 'pulseTrigger.reserveGainMs')
  const maximumReserve = readPath(candidate, 'pulseTrigger.maximumReserveMs')
  if (
    typeof reserveGain === 'number' &&
    typeof maximumReserve === 'number' &&
    reserveGain > maximumReserve
  ) {
    addIssue(
      issues,
      'pulseTrigger.reserveGainMs',
      'warning',
      'Una sola carga llenará por completo la reserva.',
    )
  }

  const hasErrors = issues.some((issue) => issue.severity === 'error')
  if (hasErrors) {
    return { valid: false, config: null, issues }
  }

  return {
    valid: true,
    config: freezeBalanceConfig(
      cloneBalanceConfig(candidate as BalanceConfig),
    ),
    issues,
  }
}
