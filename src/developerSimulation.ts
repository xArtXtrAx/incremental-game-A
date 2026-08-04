import {
  gameReducer,
  getAutoclickRate,
  getClickPower,
  getEnergyPerSecond,
  getOverloadMultiplier,
  getSapphireMultiplier,
  getSphereClickCapacity,
  isOverloadActive,
  type GameState,
} from './game'
import {
  getRefractionBonusMultiplier,
  isRefractionActive,
} from './refraction'

export const DEVELOPER_MAX_STEP_SECONDS = 3_600

export type DeveloperSimulationMetrics = {
  energyPerSecond: number
  energyPerMinute: number
  clickPower: number
  autoclicksPerSecond: number
  clicksRemainingToCore: number
  estimatedSecondsToCore: number | null
  sphereCapacity: number
  sphereFillPercent: number
  activeMultiplier: number
  sapphireMultiplier: number
}

export type DeveloperAdvanceResult = {
  state: GameState
  now: number
  seconds: number
}

export function normalizeDeveloperStepSeconds(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return 0
  return Math.min(DEVELOPER_MAX_STEP_SECONDS, Math.floor(seconds))
}

export function advanceGameStateBySeconds(
  state: Readonly<GameState>,
  startNow: number,
  requestedSeconds: number,
): DeveloperAdvanceResult {
  const seconds = normalizeDeveloperStepSeconds(requestedSeconds)
  let nextState: GameState = { ...state }
  let now = startNow

  for (let second = 0; second < seconds; second += 1) {
    now += 1_000
    nextState = gameReducer(nextState, { type: 'tick', now })
  }

  return { state: nextState, now, seconds }
}

export function getDeveloperSimulationMetrics(
  state: Readonly<GameState>,
  now: number,
): DeveloperSimulationMetrics {
  const overloadMultiplier = isOverloadActive(state.overloadUntil, now)
    ? getOverloadMultiplier(state.overloadLevel)
    : 1
  const refractionMultiplier = isRefractionActive(state.refractionUntil, now)
    ? getRefractionBonusMultiplier(state.refractionLevel)
    : 1
  const activeMultiplier = overloadMultiplier * refractionMultiplier
  const sapphireMultiplier = getSapphireMultiplier(state.prestigeCount)
  const energyPerSecond = getEnergyPerSecond(
    state.generatorLevel,
    state.resonanceLevel,
    state.manualClicks,
    state.pressureLevel,
    activeMultiplier,
    sapphireMultiplier,
  )
  const clickPower = getClickPower(
    state.clickLevel,
    state.manualClicks,
    state.pressureLevel,
    activeMultiplier,
    sapphireMultiplier,
  )
  const autoclicksPerSecond = getAutoclickRate(state.autoclickLevel)
  const sphereCapacity = getSphereClickCapacity()
  const clicksRemainingToCore = Math.max(
    0,
    sphereCapacity - state.manualClicks,
  )
  const estimatedSecondsToCore =
    clicksRemainingToCore === 0
      ? 0
      : autoclicksPerSecond > 0
        ? clicksRemainingToCore / autoclicksPerSecond
        : null

  return {
    energyPerSecond,
    energyPerMinute: energyPerSecond * 60,
    clickPower,
    autoclicksPerSecond,
    clicksRemainingToCore,
    estimatedSecondsToCore,
    sphereCapacity,
    sphereFillPercent: Math.min(
      100,
      (state.manualClicks / sphereCapacity) * 100,
    ),
    activeMultiplier,
    sapphireMultiplier,
  }
}
