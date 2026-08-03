import {
  DEFAULT_BALANCE_CONFIG,
  type BalanceConfig,
  type CostCurveConfig,
} from './balanceConfig'
import { runOfficialBalanceParityChecks } from './balanceParity'

export const BALANCE_COST_LEVEL_SAMPLES = [0, 1, 2, 5, 10] as const
export const BALANCE_RATE_LEVEL_SAMPLES = [1, 2, 3, 5, 10] as const

export type BalanceCostSystem = keyof BalanceConfig['costs']

export type BalanceCostSample = {
  level: number
  cost: number
}

export type BalanceRateSample = {
  level: number
  value: number
}

export type BalanceDiagnostic = {
  severity: 'info' | 'warning' | 'error'
  code: string
  message: string
}

function round(value: number, decimals = 4) {
  const factor = 10 ** decimals
  return Math.round((value + Number.EPSILON) * factor) / factor
}

export function getConfiguredCost(curve: CostCurveConfig, level: number) {
  const safeLevel = Math.max(0, Math.floor(level))
  return Math.ceil(curve.baseCost * curve.growth ** safeLevel)
}

export function simulateCostCurve(
  config: Readonly<BalanceConfig>,
  system: BalanceCostSystem,
  levels: readonly number[] = BALANCE_COST_LEVEL_SAMPLES,
): BalanceCostSample[] {
  const curve = config.costs[system]
  return levels.map((level) => ({
    level,
    cost: getConfiguredCost(curve, level),
  }))
}

export function getConfiguredAutoclickRate(
  config: Readonly<BalanceConfig>,
  level: number,
) {
  if (level <= 0) return 0

  return round(
    Math.min(
      config.autoclick.maximumRate,
      config.autoclick.baseRate *
        config.autoclick.growth ** (Math.floor(level) - 1),
    ),
  )
}

export function simulateAutoclickRates(
  config: Readonly<BalanceConfig>,
  levels: readonly number[] = BALANCE_RATE_LEVEL_SAMPLES,
): BalanceRateSample[] {
  return levels.map((level) => ({
    level,
    value: getConfiguredAutoclickRate(config, level),
  }))
}

export function getConfiguredSapphireMultiplier(
  config: Readonly<BalanceConfig>,
  prestigeCount: number,
) {
  const safePrestige = Math.max(0, Math.floor(prestigeCount))
  const multipliers = config.sapphire.multipliers

  if (safePrestige < multipliers.length) {
    return multipliers[safePrestige]
  }

  return round(
    multipliers[multipliers.length - 1] +
      (safePrestige - (multipliers.length - 1)) *
        config.sapphire.postMaximumLevelIncrement,
    2,
  )
}

export function createBalanceDiagnostics(
  config: Readonly<BalanceConfig>,
): BalanceDiagnostic[] {
  const diagnostics: BalanceDiagnostic[] = []

  if (config === DEFAULT_BALANCE_CONFIG) {
    const parity = runOfficialBalanceParityChecks()
    diagnostics.push(
      parity.passed
        ? {
            severity: 'info',
            code: 'official-parity-passed',
            message: `Paridad oficial superada: ${parity.checks} comprobaciones coinciden con el balance anterior.`,
          }
        : {
            severity: 'error',
            code: 'official-parity-failed',
            message: `Fallaron ${parity.failures.length} de ${parity.checks} comprobaciones de paridad oficial.`,
          },
    )
  } else {
    diagnostics.push({
      severity: 'info',
      code: 'experimental-profile-active',
      message:
        'La configuración activa es experimental; la paridad con el balance oficial no aplica.',
    })
  }

  if (
    config.autoclick.maximumRate >
    config.engineLimits.maximumAutomaticClicksPerTick * 0.75
  ) {
    diagnostics.push({
      severity: 'warning',
      code: 'autoclick-near-engine-limit',
      message:
        'La tasa máxima del Autoclicker utiliza más del 75% del límite seguro por tick.',
    })
  }

  if (config.core.sphereClickCapacity < 500) {
    diagnostics.push({
      severity: 'warning',
      code: 'short-prestige-cycle',
      message:
        'La capacidad de la esfera puede producir ciclos de prestigio demasiado breves.',
    })
  }

  if (config.costs.overload.growth >= 4) {
    diagnostics.push({
      severity: 'warning',
      code: 'overload-cost-wall',
      message:
        'La curva de Sobrecarga puede crear un muro de costo muy pronunciado.',
    })
  }

  if (config.sapphire.postMaximumLevelIncrement > 1) {
    diagnostics.push({
      severity: 'warning',
      code: 'sapphire-post-cap-inflation',
      message:
        'El crecimiento posterior a Zafiro 5 puede eclipsar etapas cromáticas futuras.',
    })
  }

  if (
    config.refraction.minimumOrbitDurationSeconds ===
    config.refraction.maximumOrbitDurationSeconds
  ) {
    diagnostics.push({
      severity: 'info',
      code: 'fixed-refraction-orbit',
      message:
        'La órbita de Refracción mantendrá la misma duración durante todo el ciclo.',
    })
  }

  return diagnostics
}
