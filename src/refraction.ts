export const REFRACTION_BASE_COST = 25000
export const REFRACTION_REQUIRED_PRESTIGE = 1

const REFRACTION_GROWTH = 3.15
const MIN_ORBIT_DURATION_SECONDS = 3
const MAX_ORBIT_DURATION_SECONDS = 20
const ORBIT_ACCELERATION_POWER = 1.6

function roundEnergy(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function roundProgress(value: number) {
  return Math.round((value + Number.EPSILON) * 10000) / 10000
}

export function getRefractionCost(level: number) {
  return Math.ceil(REFRACTION_BASE_COST * REFRACTION_GROWTH ** level)
}

export function getRefractionFacetCount(prestigeCount: number) {
  if (prestigeCount >= 4) return 12
  if (prestigeCount === 3) return 10
  if (prestigeCount === 2) return 8
  return 6
}

export function getRefractionChargeRate(level: number) {
  return level > 0 ? roundProgress(1 + (level - 1) * 0.15) : 0
}

export function getRefractionBonusMultiplier(level: number) {
  return level > 0 ? roundEnergy(1.2 + level * 0.05) : 1
}

export function getRefractionDurationSeconds(level: number) {
  return level > 0 ? 4 + level : 0
}

export function getRefractionRewardSeconds(level: number) {
  return level > 0 ? 8 + level * 3 : 0
}

export function getRefractionReward(baseProduction: number, level: number) {
  return roundEnergy(baseProduction * getRefractionRewardSeconds(level))
}

export function getRefractionOrbitDuration(manualClicks: number) {
  const progress = Math.min(1, Math.max(0, manualClicks / 5000))
  return (
    MIN_ORBIT_DURATION_SECONDS +
    (MAX_ORBIT_DURATION_SECONDS - MIN_ORBIT_DURATION_SECONDS) *
      (1 - progress) ** ORBIT_ACCELERATION_POWER
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
  if (input.level <= 0 || input.prestigeCount < REFRACTION_REQUIRED_PRESTIGE) {
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
