import {
  getAutoclickCost,
  getAutoclickRate,
  getCavitationClicksRequired,
  getCavitationCost,
  getCavitationSeconds,
  getClickUpgradeCost,
  getGeneratorCost,
  getOverloadClicksRequired,
  getOverloadCost,
  getOverloadDurationSeconds,
  getOverloadMultiplier,
  getPressureBonusPercent,
  getPressureCost,
  getResonanceCost,
  getSapphireMultiplier,
  getSphereFillPercentage,
} from './game'
import {
  getPulseTriggerRate,
  getPulseTriggerUpgradeCost,
} from './pulseTrigger'
import {
  getRefractionBonusMultiplier,
  getRefractionChargeRate,
  getRefractionCost,
  getRefractionDurationSeconds,
  getRefractionFacetCount,
  getRefractionOrbitDuration,
  getRefractionRewardSeconds,
} from './refraction'

export type BalanceParityFailure = {
  id: string
  expected: number
  received: number
}

export type BalanceParityResult = {
  passed: boolean
  checks: number
  failures: BalanceParityFailure[]
}

type ParityCase = {
  id: string
  expected: number
  calculate: () => number
  tolerance?: number
}

const parityCases: readonly ParityCase[] = [
  { id: 'cost.click.l0', expected: 10, calculate: () => getClickUpgradeCost(0) },
  { id: 'cost.click.l1', expected: 17, calculate: () => getClickUpgradeCost(1) },
  { id: 'cost.generator.l1', expected: 45, calculate: () => getGeneratorCost(1) },
  { id: 'cost.resonance.l1', expected: 264, calculate: () => getResonanceCost(1) },
  { id: 'cost.pressure.l1', expected: 1_200, calculate: () => getPressureCost(1) },
  { id: 'cost.cavitation.l1', expected: 5_200, calculate: () => getCavitationCost(1) },
  { id: 'cost.autoclick.l1', expected: 14_000, calculate: () => getAutoclickCost(1) },
  { id: 'cost.overload.l1', expected: 30_000, calculate: () => getOverloadCost(1) },
  { id: 'cost.refraction.l1', expected: 78_750, calculate: () => getRefractionCost(1) },
  {
    id: 'cost.pulse-trigger.l1',
    expected: 13_500,
    calculate: () => getPulseTriggerUpgradeCost(1),
  },
  {
    id: 'sphere.half',
    expected: 50,
    calculate: () => getSphereFillPercentage(2_500),
  },
  {
    id: 'pressure.full.l2',
    expected: 40,
    calculate: () => getPressureBonusPercent(5_000, 2),
  },
  { id: 'sapphire.p5', expected: 3.05, calculate: () => getSapphireMultiplier(5) },
  { id: 'sapphire.p6', expected: 3.55, calculate: () => getSapphireMultiplier(6) },
  { id: 'autoclick.l1', expected: 0.2, calculate: () => getAutoclickRate(1) },
  {
    id: 'autoclick.l5',
    expected: 1.3107,
    calculate: () => getAutoclickRate(5),
    tolerance: 0.00005,
  },
  {
    id: 'overload.inactive-threshold',
    expected: 100,
    calculate: () => getOverloadClicksRequired(0),
  },
  {
    id: 'overload.l3-threshold',
    expected: 80,
    calculate: () => getOverloadClicksRequired(3),
  },
  {
    id: 'overload.l3-duration',
    expected: 21,
    calculate: () => getOverloadDurationSeconds(3),
  },
  {
    id: 'overload.l3-multiplier',
    expected: 3,
    calculate: () => getOverloadMultiplier(3),
  },
  {
    id: 'cavitation.inactive-threshold',
    expected: 25,
    calculate: () => getCavitationClicksRequired(0),
  },
  {
    id: 'cavitation.l3-threshold',
    expected: 19,
    calculate: () => getCavitationClicksRequired(3),
  },
  {
    id: 'cavitation.l3-duration',
    expected: 9,
    calculate: () => getCavitationSeconds(3),
  },
  {
    id: 'refraction.facets.p1',
    expected: 6,
    calculate: () => getRefractionFacetCount(1),
  },
  {
    id: 'refraction.facets.p4',
    expected: 12,
    calculate: () => getRefractionFacetCount(4),
  },
  {
    id: 'refraction.charge.l2',
    expected: 1.15,
    calculate: () => getRefractionChargeRate(2),
  },
  {
    id: 'refraction.multiplier.l2',
    expected: 1.3,
    calculate: () => getRefractionBonusMultiplier(2),
  },
  {
    id: 'refraction.duration.l2',
    expected: 6,
    calculate: () => getRefractionDurationSeconds(2),
  },
  {
    id: 'refraction.reward.l2',
    expected: 14,
    calculate: () => getRefractionRewardSeconds(2),
  },
  {
    id: 'refraction.orbit.empty',
    expected: 20,
    calculate: () => getRefractionOrbitDuration(0),
  },
  {
    id: 'refraction.orbit.full',
    expected: 3,
    calculate: () => getRefractionOrbitDuration(5_000),
  },
  { id: 'pulse-trigger.l0', expected: 6, calculate: () => getPulseTriggerRate(0) },
  { id: 'pulse-trigger.l6', expected: 9, calculate: () => getPulseTriggerRate(6) },
]

export function runOfficialBalanceParityChecks(): BalanceParityResult {
  const failures: BalanceParityFailure[] = []

  parityCases.forEach((parityCase) => {
    const received = parityCase.calculate()
    const tolerance = parityCase.tolerance ?? 0.000001

    if (
      !Number.isFinite(received) ||
      Math.abs(received - parityCase.expected) > tolerance
    ) {
      failures.push({
        id: parityCase.id,
        expected: parityCase.expected,
        received,
      })
    }
  })

  return {
    passed: failures.length === 0,
    checks: parityCases.length,
    failures,
  }
}
