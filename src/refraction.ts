import { DEFAULT_BALANCE_CONFIG } from './balanceConfig'
import {
  getActiveBalanceConfig,
  subscribeBalanceRuntime,
} from './balanceRuntime'

export const REFRACTION_BASE_COST =
  DEFAULT_BALANCE_CONFIG.costs.refraction.baseCost
export let REFRACTION_REQUIRED_PRESTIGE =
  DEFAULT_BALANCE_CONFIG.unlocks.refractionRequiredPrestige

subscribeBalanceRuntime(() => {
  REFRACTION_REQUIRED_PRESTIGE =
    getActiveBalanceConfig().unlocks.refractionRequiredPrestige
})

function roundEnergy(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function roundProgress(value: number) {
  return Math.round((value + Number.EPSILON) * 10000) / 10000
}

export function getRefractionCost(level: number) {
  const { baseCost, growth } = getActiveBalanceConfig().costs.refraction
  return Math.ceil(baseCost * growth ** level)
}

export function getRefractionFacetCount(prestigeCount: number) {
  const [first, second, third, maximum] =
    getActiveBalanceConfig().refraction.facetCounts

  if (prestigeCount >= 4) return maximum
  if (prestigeCount === 3) return third
  if (prestigeCount === 2) return second
  return first
}

export function getRefractionChargeRate(level: number) {
  if (level <= 0) return 0

  const { baseChargeRate, chargeRatePerLevel } =
    getActiveBalanceConfig().refraction
  return roundProgress(baseChargeRate + (level - 1) * chargeRatePerLevel)
}

export function getRefractionBonusMultiplier(level: number) {
  if (level <= 0) return 1

  const { baseBonusMultiplier, bonusMultiplierPerLevel } =
    getActiveBalanceConfig().refraction
  return roundEnergy(baseBonusMultiplier + level * bonusMultiplierPerLevel)
}

export function getRefractionDurationSeconds(level: number) {
  if (level <= 0) return 0

  const { baseDurationSeconds, durationSecondsPerLevel } =
    getActiveBalanceConfig().refraction
  return baseDurationSeconds + level * durationSecondsPerLevel
}

export function getRefractionRewardSeconds(level: number) {
  if (level <= 0) return 0

  const { baseRewardSeconds, rewardSecondsPerLevel } =
    getActiveBalanceConfig().refraction
  return baseRewardSeconds + level * rewardSecondsPerLevel
}

export function getRefractionReward(baseProduction: number, level: number) {
  return roundEnergy(baseProduction * getRefractionRewardSeconds(level))
}

export function getRefractionOrbitDuration(manualClicks: number) {
  const {
    minimumOrbitDurationSeconds,
    maximumOrbitDurationSeconds,
    orbitAccelerationPower,
  } = getActiveBalanceConfig().refraction
  const sphereClickCapacity =
    getActiveBalanceConfig().core.sphereClickCapacity
  const progress = Math.min(
    1,
    Math.max(0, manualClicks / sphereClickCapacity),
  )

  return (
    minimumOrbitDurationSeconds +
    (maximumOrbitDurationSeconds - minimumOrbitDurationSeconds) *
      (1 - progress) ** orbitAccelerationPower
  )
}

export function isRefractionActive(refractionUntil: number, now = Date.now()) {
  return refractionUntil > now
}

export function getRefractionRemainingSeconds(
  refractionUntil: number,
  now = Date.now(),
) {
  return Math.max(0, (refractionUntil - now) / 1000)
}

type AdvanceInput = {
  level: number
  orbitProgress: number
  facetsCharged: number
  refractionUntil: number
  dischargeCount: number
  prestigeCount: number
  manualClicks: number
}

export type RefractionAdvance = {
  orbitProgress: number
  facetsCharged: number
  refractionUntil: number
  dischargeCount: number
  dischargeAmount: number
  dischargesTriggered: number
}

export function advanceRefractionMatrix(
  input: AdvanceInput,
  baseProduction: number,
  now: number,
): RefractionAdvance {
  if (input.level <= 0) {
    return {
      orbitProgress: 0,
      facetsCharged: 0,
      refractionUntil: 0,
      dischargeCount: input.dischargeCount,
      dischargeAmount: 0,
      dischargesTriggered: 0,
    }
  }

  const orbitDuration = getRefractionOrbitDuration(input.manualClicks)
  const accumulatedProgress =
    input.orbitProgress + getRefractionChargeRate(input.level) / orbitDuration
  const completedCharges = Math.floor(accumulatedProgress + 0.0001)
  const orbitProgress = roundProgress(
    Math.max(0, accumulatedProgress - completedCharges),
  )
  const facetCount = getRefractionFacetCount(input.prestigeCount)
  const accumulatedFacets = input.facetsCharged + completedCharges
  const dischargesTriggered = Math.floor(accumulatedFacets / facetCount)
  const facetsCharged = accumulatedFacets % facetCount
  const dischargeAmount = roundEnergy(
    getRefractionReward(baseProduction, input.level) * dischargesTriggered,
  )
  const currentUntil = isRefractionActive(input.refractionUntil, now)
    ? input.refractionUntil
    : 0
  const refractionUntil =
    dischargesTriggered > 0
      ? Math.max(currentUntil, now) +
        getRefractionDurationSeconds(input.level) * 1000
      : currentUntil

  return {
    orbitProgress,
    facetsCharged,
    refractionUntil,
    dischargeCount: input.dischargeCount + dischargesTriggered,
    dischargeAmount,
    dischargesTriggered,
  }
}
