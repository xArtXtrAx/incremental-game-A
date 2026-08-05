import { getSapphireMultiplier } from './game'
import type { DeveloperExperimentSnapshot } from './developerExperimentBridge'

export const LIVE_PRESTIGE_RATE_WINDOW_SECONDS = 10
export const LIVE_PRESTIGE_MAX_RECORDED_CYCLES = 50

export type LivePrestigeCycleRecord = {
  index: number
  prestigeBefore: number
  prestigeAfter: number
  startedAt: number
  endedAt: number
  durationSeconds: number
  sapphireMultiplier: number
  nextSapphireMultiplier: number
}

type ClickSample = {
  at: number
  clicks: number
}

export type LivePrestigeCycleState = {
  cycleStartedAt: number
  prestigeCount: number
  lastClockNow: number
  lastManualClicks: number
  recentClickRate: number
  clickSamples: ClickSample[]
  completedCycles: LivePrestigeCycleRecord[]
  resetCount: number
}

function round(value: number, decimals = 3) {
  const factor = 10 ** decimals
  return Math.round((value + Number.EPSILON) * factor) / factor
}

export function createLivePrestigeCycleState(
  snapshot: DeveloperExperimentSnapshot,
): LivePrestigeCycleState {
  return {
    cycleStartedAt: snapshot.clockNow,
    prestigeCount: snapshot.state.prestigeCount,
    lastClockNow: snapshot.clockNow,
    lastManualClicks: snapshot.state.manualClicks,
    recentClickRate: 0,
    clickSamples: [],
    completedCycles: [],
    resetCount: 0,
  }
}

function calculateClickRate(samples: readonly ClickSample[]) {
  if (samples.length === 0) return 0
  const totalClicks = samples.reduce((sum, sample) => sum + sample.clicks, 0)
  const durationMs = Math.max(
    1_000,
    samples[samples.length - 1].at - samples[0].at + 1_000,
  )
  return round(totalClicks / (durationMs / 1_000))
}

export function advanceLivePrestigeCycleState(
  current: Readonly<LivePrestigeCycleState>,
  snapshot: DeveloperExperimentSnapshot,
): LivePrestigeCycleState {
  const clockMovedBack = snapshot.clockNow < current.lastClockNow
  const prestigeMovedBack = snapshot.state.prestigeCount < current.prestigeCount
  const stateWasReplacedWithoutPrestige =
    snapshot.state.prestigeCount === current.prestigeCount &&
    snapshot.state.manualClicks < current.lastManualClicks

  if (clockMovedBack || prestigeMovedBack || stateWasReplacedWithoutPrestige) {
    return {
      ...createLivePrestigeCycleState(snapshot),
      completedCycles: current.completedCycles.map((cycle) => ({ ...cycle })),
      resetCount: current.resetCount + 1,
    }
  }

  const prestigeAdvanced = snapshot.state.prestigeCount > current.prestigeCount
  const nextCompleted = current.completedCycles.map((cycle) => ({ ...cycle }))
  let cycleStartedAt = current.cycleStartedAt

  if (prestigeAdvanced) {
    const steps = snapshot.state.prestigeCount - current.prestigeCount
    for (let offset = 0; offset < steps; offset += 1) {
      const prestigeBefore = current.prestigeCount + offset
      nextCompleted.push({
        index: nextCompleted.length + 1,
        prestigeBefore,
        prestigeAfter: prestigeBefore + 1,
        startedAt: cycleStartedAt,
        endedAt: snapshot.clockNow,
        durationSeconds: round(
          Math.max(0, snapshot.clockNow - cycleStartedAt) / 1_000,
          2,
        ),
        sapphireMultiplier: getSapphireMultiplier(prestigeBefore),
        nextSapphireMultiplier: getSapphireMultiplier(prestigeBefore + 1),
      })
      cycleStartedAt = snapshot.clockNow
    }
  }

  const deltaClicks = prestigeAdvanced
    ? snapshot.state.manualClicks
    : Math.max(0, snapshot.state.manualClicks - current.lastManualClicks)
  const cutoff =
    snapshot.clockNow - LIVE_PRESTIGE_RATE_WINDOW_SECONDS * 1_000
  const clickSamples = [
    ...current.clickSamples.filter((sample) => sample.at > cutoff),
    { at: snapshot.clockNow, clicks: deltaClicks },
  ]

  return {
    cycleStartedAt,
    prestigeCount: snapshot.state.prestigeCount,
    lastClockNow: snapshot.clockNow,
    lastManualClicks: snapshot.state.manualClicks,
    recentClickRate: calculateClickRate(clickSamples),
    clickSamples,
    completedCycles: nextCompleted.slice(-LIVE_PRESTIGE_MAX_RECORDED_CYCLES),
    resetCount: current.resetCount,
  }
}

export function getLiveCycleElapsedSeconds(
  state: Readonly<LivePrestigeCycleState>,
) {
  return round(Math.max(0, state.lastClockNow - state.cycleStartedAt) / 1_000, 2)
}

export function getLiveAverageCycleSeconds(
  state: Readonly<LivePrestigeCycleState>,
) {
  if (state.completedCycles.length === 0) return null
  return round(
    state.completedCycles.reduce(
      (sum, cycle) => sum + cycle.durationSeconds,
      0,
    ) / state.completedCycles.length,
    2,
  )
}
