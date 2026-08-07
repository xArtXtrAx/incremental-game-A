import type { BalanceConfig } from './balanceConfig'
import { runWithBalanceConfig } from './balanceRuntime'
import {
  canCrystallize,
  gameReducer,
  getSapphireMultiplier,
  type GameAction,
  type GameState,
} from './game'
import {
  getDeveloperSimulationMetrics,
  type DeveloperSimulationMetrics,
} from './developerSimulation'
import {
  materializeDeveloperScenarioState,
  validateDeveloperScenarioState,
  type DeveloperScenario,
} from './developerScenarios'
import { validateBalanceConfig } from './balanceValidation'

export const PRESTIGE_LAB_MAX_SECONDS = 21_600
export const PRESTIGE_LAB_MAX_CYCLES = 10
export const PRESTIGE_LAB_MAX_MANUAL_CLICKS = 20
export const PRESTIGE_LAB_MAX_ACTIONS = 500_000
export const PRESTIGE_LAB_MAX_PURCHASES = 4_000
export const PRESTIGE_LAB_MAX_BATCH_RUNS = 240

export type PrestigeLabUpgradeId =
  | 'click'
  | 'generator'
  | 'resonance'
  | 'pressure'
  | 'cavitation'
  | 'autoclick'
  | 'pulse-trigger'
  | 'overload'
  | 'refraction'

export type PrestigeLabPurchaseStrategy =
  | 'cheapest'
  | 'production'
  | 'manual'
  | 'automation'
  | 'roi'

export type PrestigeLabSapphirePolicy =
  | { mode: 'official' }
  | { mode: 'neutralized' }
  | { mode: 'frozen-p5' }
  | { mode: 'custom-post-p5'; increment: number }

export type PrestigeLabCandidate = {
  id: string
  name: string
  config: BalanceConfig
}

export type PrestigeLabSettings = {
  durationSeconds: number
  manualClicksPerSecond: number
  targetCycles: number
  autoPurchase: boolean
  purchaseStrategy: PrestigeLabPurchaseStrategy
  sapphirePolicy: PrestigeLabSapphirePolicy
}

export type PrestigeLabRequest = {
  scenario: Pick<DeveloperScenario, 'id' | 'name' | 'state' | 'capturedAt'>
  candidate: PrestigeLabCandidate
  settings: PrestigeLabSettings
  startedAt?: number
}

export type PrestigeLabPurchaseEvent = {
  cycleIndex: number
  second: number
  upgradeId: PrestigeLabUpgradeId
  cost: number
  levelAfter: number
}

export type PrestigeLabCycle = {
  index: number
  prestigeBefore: number
  prestigeAfter: number
  durationSeconds: number
  sapphireMultiplier: number
  nextSapphireMultiplier: number
  energyGenerated: number
  energySpent: number
  purchaseCount: number
  decisionlessSeconds: number
  longestDecisionGapSeconds: number
}

export type PrestigeLabRun = {
  candidate: PrestigeLabCandidate
  scenarioId: string
  scenarioName: string
  settings: PrestigeLabSettings
  initialState: GameState
  finalState: GameState
  elapsedSeconds: number
  endedBy: 'target-cycles' | 'duration' | 'safety-limit'
  actionCount: number
  completedCycles: PrestigeLabCycle[]
  purchaseEvents: PrestigeLabPurchaseEvent[]
  averageCycleSeconds: number | null
  lastCycleSeconds: number | null
  totalEnergyGenerated: number
  totalEnergySpent: number
  totalDecisionlessSeconds: number
  finalMetrics: DeveloperSimulationMetrics
}

export type PrestigeLabPairComparison = {
  runA: PrestigeLabRun
  runB: PrestigeLabRun
  averageCycleDeltaSeconds: number | null
  averageCycleDeltaPercent: number | null
  completedCycleDelta: number
}

export type PrestigeCurvePoint = {
  increment: number
  completedCycles: number
  averageCycleSeconds: number | null
  lastCycleSeconds: number | null
  cycleDurations: number[]
  accelerationRatio: number | null
}

export type PrestigeCurveExplorerResult = {
  scenarioId: string
  candidateName: string
  points: PrestigeCurvePoint[]
}

export type PrestigeStrategyComparisonRow = {
  strategy: PrestigeLabPurchaseStrategy
  completedCycles: number
  averageCycleSeconds: number | null
  totalEnergyGenerated: number
  totalEnergySpent: number
  decisionlessSeconds: number
}

export type PrestigePathSummary = {
  purchaseCountByUpgrade: Record<PrestigeLabUpgradeId, number>
  spendByUpgrade: Record<PrestigeLabUpgradeId, number>
  dominantUpgrade: PrestigeLabUpgradeId | null
  neverPurchased: PrestigeLabUpgradeId[]
  firstPurchases: PrestigeLabPurchaseEvent[]
}

export type PrestigeBatchRequest = {
  scenarios: Array<Pick<DeveloperScenario, 'id' | 'name' | 'state' | 'capturedAt'>>
  candidate: PrestigeLabCandidate
  policies: PrestigeLabSapphirePolicy[]
  strategies: PrestigeLabPurchaseStrategy[]
  manualClickRates: number[]
  durationSeconds: number
  targetCycles: number
  startedAt?: number
}

export type PrestigeBatchRow = {
  scenarioId: string
  scenarioName: string
  sapphirePolicy: string
  strategy: PrestigeLabPurchaseStrategy
  manualClicksPerSecond: number
  completedCycles: number
  averageCycleSeconds: number | null
  lastCycleSeconds: number | null
  totalEnergyGenerated: number
  totalEnergySpent: number
  totalDecisionlessSeconds: number
}

export type PrestigeBatchResult = {
  totalRuns: number
  rows: PrestigeBatchRow[]
}

export type PrestigeLabIssue = { path: string; message: string }
export type PrestigeLabResult<T> =
  | { ok: true; value: T; issues: [] }
  | { ok: false; value: null; issues: PrestigeLabIssue[] }

type UpgradeDefinition = {
  id: PrestigeLabUpgradeId
  levelField:
    | 'clickLevel'
    | 'generatorLevel'
    | 'resonanceLevel'
    | 'pressureLevel'
    | 'cavitationLevel'
    | 'autoclickLevel'
    | 'pulseTriggerLevel'
    | 'overloadLevel'
    | 'refractionLevel'
  action: GameAction
}

const UPGRADE_DEFINITIONS: readonly UpgradeDefinition[] = [
  { id: 'click', levelField: 'clickLevel', action: { type: 'buy-click-upgrade' } },
  { id: 'generator', levelField: 'generatorLevel', action: { type: 'buy-generator' } },
  { id: 'resonance', levelField: 'resonanceLevel', action: { type: 'buy-resonance' } },
  { id: 'pressure', levelField: 'pressureLevel', action: { type: 'buy-pressure' } },
  { id: 'cavitation', levelField: 'cavitationLevel', action: { type: 'buy-cavitation' } },
  { id: 'autoclick', levelField: 'autoclickLevel', action: { type: 'buy-autoclicker' } },
  { id: 'pulse-trigger', levelField: 'pulseTriggerLevel', action: { type: 'buy-pulse-trigger' } },
  { id: 'overload', levelField: 'overloadLevel', action: { type: 'buy-overload' } },
  { id: 'refraction', levelField: 'refractionLevel', action: { type: 'buy-refraction' } },
]

const STRATEGY_PRIORITY: Record<Exclude<PrestigeLabPurchaseStrategy, 'cheapest' | 'roi'>, readonly PrestigeLabUpgradeId[]> = {
  production: ['generator', 'resonance', 'autoclick', 'pressure', 'cavitation', 'overload', 'refraction', 'pulse-trigger', 'click'],
  manual: ['click', 'pressure', 'pulse-trigger', 'cavitation', 'overload', 'refraction', 'generator', 'resonance', 'autoclick'],
  automation: ['autoclick', 'generator', 'resonance', 'overload', 'refraction', 'pressure', 'cavitation', 'pulse-trigger', 'click'],
}

function round(value: number, decimals = 4) {
  const factor = 10 ** decimals
  return Math.round((value + Number.EPSILON) * factor) / factor
}

function normalizeSettings(settings: PrestigeLabSettings): PrestigeLabSettings {
  return {
    durationSeconds: Number.isFinite(settings.durationSeconds)
      ? Math.min(PRESTIGE_LAB_MAX_SECONDS, Math.max(1, Math.floor(settings.durationSeconds)))
      : 1,
    manualClicksPerSecond: Number.isFinite(settings.manualClicksPerSecond)
      ? Math.min(PRESTIGE_LAB_MAX_MANUAL_CLICKS, Math.max(0, Math.floor(settings.manualClicksPerSecond)))
      : 0,
    targetCycles: Number.isFinite(settings.targetCycles)
      ? Math.min(PRESTIGE_LAB_MAX_CYCLES, Math.max(1, Math.floor(settings.targetCycles)))
      : 1,
    autoPurchase: Boolean(settings.autoPurchase),
    purchaseStrategy: settings.purchaseStrategy,
    sapphirePolicy: normalizeSapphirePolicy(settings.sapphirePolicy),
  }
}

export function normalizeSapphirePolicy(policy: PrestigeLabSapphirePolicy): PrestigeLabSapphirePolicy {
  if (policy.mode !== 'custom-post-p5') return policy
  const increment = Number.isFinite(policy.increment)
    ? Math.min(100, Math.max(0, policy.increment))
    : 0
  return { mode: 'custom-post-p5', increment: round(increment, 4) }
}

export function describeSapphirePolicy(policy: PrestigeLabSapphirePolicy) {
  switch (policy.mode) {
    case 'official':
      return 'Oficial'
    case 'neutralized':
      return 'Neutralizado ×1.00'
    case 'frozen-p5':
      return 'Congelado en P5'
    case 'custom-post-p5':
      return `Post-P5 +${round(policy.increment, 4)}`
  }
}

export function applySapphirePolicy(
  config: Readonly<BalanceConfig>,
  policy: PrestigeLabSapphirePolicy,
): BalanceConfig {
  const next = structuredClone(config)
  const normalized = normalizeSapphirePolicy(policy)
  if (normalized.mode === 'neutralized') {
    next.sapphire.multipliers = [1, 1, 1, 1, 1, 1]
    next.sapphire.postMaximumLevelIncrement = 0
  } else if (normalized.mode === 'frozen-p5') {
    next.sapphire.postMaximumLevelIncrement = 0
  } else if (normalized.mode === 'custom-post-p5') {
    next.sapphire.postMaximumLevelIncrement = normalized.increment
  }
  return next
}

function cloneCandidate(candidate: Readonly<PrestigeLabCandidate>): PrestigeLabCandidate {
  return {
    id: candidate.id,
    name: candidate.name,
    config: structuredClone(candidate.config),
  }
}

function validateRequest(request: PrestigeLabRequest) {
  const issues: PrestigeLabIssue[] = validateDeveloperScenarioState(request.scenario.state).map((entry) => ({
    path: `scenario.${entry.path}`,
    message: entry.message,
  }))
  const validation = validateBalanceConfig(request.candidate.config)
  if (!validation.valid) {
    issues.push(...validation.issues.map((entry) => ({ path: `candidate.${entry.path}`, message: entry.message })))
  }
  if (!request.candidate.id.trim()) issues.push({ path: 'candidate.id', message: 'Falta el id.' })
  if (!request.candidate.name.trim()) issues.push({ path: 'candidate.name', message: 'Falta el nombre.' })
  return issues
}

function getEffectiveProduction(state: Readonly<GameState>, now: number, manualClicksPerSecond: number) {
  const metrics = getDeveloperSimulationMetrics(state, now)
  return metrics.energyPerSecond + metrics.clickPower * (metrics.autoclicksPerSecond + manualClicksPerSecond)
}

type PurchaseOption = {
  definition: UpgradeDefinition
  index: number
  nextState: GameState
  cost: number
  score: number
}

function getPurchaseOptions(
  state: GameState,
  now: number,
  manualClicksPerSecond: number,
): PurchaseOption[] {
  const beforeProduction = getEffectiveProduction(state, now, manualClicksPerSecond)
  return UPGRADE_DEFINITIONS.flatMap((definition, index) => {
    const nextState = gameReducer(state, definition.action)
    if (nextState === state || nextState[definition.levelField] <= state[definition.levelField]) return []
    const cost = round(Math.max(0, state.energy - nextState.energy), 2)
    const afterProduction = getEffectiveProduction(nextState, now, manualClicksPerSecond)
    const productionGain = Math.max(0, afterProduction - beforeProduction)
    return [{ definition, index, nextState, cost, score: cost > 0 ? productionGain / cost : productionGain }]
  })
}

function choosePurchase(
  state: GameState,
  now: number,
  manualClicksPerSecond: number,
  strategy: PrestigeLabPurchaseStrategy,
) {
  const options = getPurchaseOptions(state, now, manualClicksPerSecond)
  if (options.length === 0) return null

  if (strategy === 'cheapest') {
    options.sort((a, b) => (a.cost === b.cost ? a.index - b.index : a.cost - b.cost))
    return options[0]
  }

  if (strategy === 'roi') {
    options.sort((a, b) => (a.score === b.score ? (a.cost === b.cost ? a.index - b.index : a.cost - b.cost) : b.score - a.score))
    return options[0]
  }

  const priority = STRATEGY_PRIORITY[strategy]
  options.sort((a, b) => {
    const priorityDelta = priority.indexOf(a.definition.id) - priority.indexOf(b.definition.id)
    if (priorityDelta !== 0) return priorityDelta
    return a.cost === b.cost ? a.index - b.index : a.cost - b.cost
  })
  return options[0]
}

type CycleAccumulator = {
  index: number
  prestigeBefore: number
  startedAtSeconds: number
  sapphireMultiplier: number
  energyGenerated: number
  energySpent: number
  purchaseCount: number
  decisionlessSeconds: number
  longestDecisionGapSeconds: number
  currentDecisionGapSeconds: number
}

function createAccumulator(state: Readonly<GameState>, index: number, startedAtSeconds: number): CycleAccumulator {
  return {
    index,
    prestigeBefore: state.prestigeCount,
    startedAtSeconds,
    sapphireMultiplier: getSapphireMultiplier(state.prestigeCount),
    energyGenerated: 0,
    energySpent: 0,
    purchaseCount: 0,
    decisionlessSeconds: 0,
    longestDecisionGapSeconds: 0,
    currentDecisionGapSeconds: 0,
  }
}

function finalizeCycle(
  accumulator: CycleAccumulator,
  stateAfter: Readonly<GameState>,
  elapsedSeconds: number,
): PrestigeLabCycle {
  return {
    index: accumulator.index,
    prestigeBefore: accumulator.prestigeBefore,
    prestigeAfter: stateAfter.prestigeCount,
    durationSeconds: elapsedSeconds - accumulator.startedAtSeconds,
    sapphireMultiplier: accumulator.sapphireMultiplier,
    nextSapphireMultiplier: getSapphireMultiplier(stateAfter.prestigeCount),
    energyGenerated: round(accumulator.energyGenerated, 2),
    energySpent: round(accumulator.energySpent, 2),
    purchaseCount: accumulator.purchaseCount,
    decisionlessSeconds: accumulator.decisionlessSeconds,
    longestDecisionGapSeconds: accumulator.longestDecisionGapSeconds,
  }
}

export function runPrestigeLab(request: PrestigeLabRequest): PrestigeLabResult<PrestigeLabRun> {
  const issues = validateRequest(request)
  if (issues.length > 0) return { ok: false, value: null, issues }
  const settings = normalizeSettings(request.settings)
  const startedAt = Number.isFinite(request.startedAt) ? Math.max(0, Math.floor(request.startedAt ?? 0)) : Date.now()
  const policyConfig = applySapphirePolicy(request.candidate.config, settings.sapphirePolicy)
  const policyValidation = validateBalanceConfig(policyConfig)
  if (!policyValidation.valid) {
    return {
      ok: false,
      value: null,
      issues: policyValidation.issues.map((entry) => ({ path: `policy.${entry.path}`, message: entry.message })),
    }
  }

  try {
    return runWithBalanceConfig(policyConfig, () => {
      const initialState = materializeDeveloperScenarioState(request.scenario, startedAt)
      let state: GameState = { ...initialState }
      let elapsedSeconds = 0
      let now = startedAt
      let actionCount = 0
      let endedBy: PrestigeLabRun['endedBy'] = 'duration'
      let accumulator = createAccumulator(state, 1, 0)
      const cycles: PrestigeLabCycle[] = []
      const purchaseEvents: PrestigeLabPurchaseEvent[] = []

      const noteGenerated = (beforeEnergy: number) => {
        accumulator.energyGenerated = round(accumulator.energyGenerated + Math.max(0, state.energy - beforeEnergy), 2)
      }

      const applyAction = (action: GameAction) => {
        const beforeEnergy = state.energy
        state = gameReducer(state, action)
        actionCount += 1
        noteGenerated(beforeEnergy)
      }

      const purchaseAffordable = () => {
        let purchased = 0
        while (
          settings.autoPurchase &&
          accumulator.purchaseCount < PRESTIGE_LAB_MAX_PURCHASES &&
          actionCount < PRESTIGE_LAB_MAX_ACTIONS
        ) {
          const option = choosePurchase(state, now, settings.manualClicksPerSecond, settings.purchaseStrategy)
          if (!option) break
          state = option.nextState
          actionCount += 1
          purchased += 1
          accumulator.purchaseCount += 1
          accumulator.energySpent = round(accumulator.energySpent + option.cost, 2)
          purchaseEvents.push({
            cycleIndex: accumulator.index,
            second: elapsedSeconds - accumulator.startedAtSeconds,
            upgradeId: option.definition.id,
            cost: option.cost,
            levelAfter: state[option.definition.levelField],
          })
        }
        return purchased
      }

      const crystallize = () => {
        if (!canCrystallize(state)) return false
        state = gameReducer(state, { type: 'crystallize' })
        actionCount += 1
        cycles.push(finalizeCycle(accumulator, state, elapsedSeconds))
        accumulator = createAccumulator(state, cycles.length + 1, elapsedSeconds)
        return true
      }

      if (crystallize() && cycles.length >= settings.targetCycles) {
        endedBy = 'target-cycles'
      } else {
        purchaseAffordable()
        for (elapsedSeconds = 1; elapsedSeconds <= settings.durationSeconds; elapsedSeconds += 1) {
          now = startedAt + elapsedSeconds * 1_000
          let purchasedThisSecond = 0
          for (let click = 0; click < settings.manualClicksPerSecond; click += 1) {
            if (actionCount >= PRESTIGE_LAB_MAX_ACTIONS) break
            applyAction({ type: 'click', now })
          }
          if (actionCount >= PRESTIGE_LAB_MAX_ACTIONS) {
            endedBy = 'safety-limit'
            break
          }
          applyAction({ type: 'tick', now })
          purchasedThisSecond += purchaseAffordable()
          const hasDecision = choosePurchase(state, now, settings.manualClicksPerSecond, settings.purchaseStrategy) !== null
          if (purchasedThisSecond === 0 && !hasDecision) {
            accumulator.decisionlessSeconds += 1
            accumulator.currentDecisionGapSeconds += 1
            accumulator.longestDecisionGapSeconds = Math.max(accumulator.longestDecisionGapSeconds, accumulator.currentDecisionGapSeconds)
          } else {
            accumulator.currentDecisionGapSeconds = 0
          }
          if (crystallize() && cycles.length >= settings.targetCycles) {
            endedBy = 'target-cycles'
            break
          }
          if (actionCount >= PRESTIGE_LAB_MAX_ACTIONS) {
            endedBy = 'safety-limit'
            break
          }
        }
      }

      const safeElapsed = Math.min(settings.durationSeconds, Math.max(0, elapsedSeconds))
      const durations = cycles.map((cycle) => cycle.durationSeconds)
      const totalEnergyGenerated = round(cycles.reduce((sum, cycle) => sum + cycle.energyGenerated, 0) + accumulator.energyGenerated, 2)
      const totalEnergySpent = round(cycles.reduce((sum, cycle) => sum + cycle.energySpent, 0) + accumulator.energySpent, 2)
      const totalDecisionlessSeconds = cycles.reduce((sum, cycle) => sum + cycle.decisionlessSeconds, 0) + accumulator.decisionlessSeconds

      return {
        ok: true,
        value: {
          candidate: cloneCandidate(request.candidate),
          scenarioId: request.scenario.id,
          scenarioName: request.scenario.name,
          settings,
          initialState: { ...initialState },
          finalState: { ...state },
          elapsedSeconds: safeElapsed,
          endedBy,
          actionCount,
          completedCycles: cycles.map((cycle) => ({ ...cycle })),
          purchaseEvents: purchaseEvents.map((event) => ({ ...event })),
          averageCycleSeconds: durations.length > 0 ? round(durations.reduce((sum, value) => sum + value, 0) / durations.length, 2) : null,
          lastCycleSeconds: durations.at(-1) ?? null,
          totalEnergyGenerated,
          totalEnergySpent,
          totalDecisionlessSeconds,
          finalMetrics: getDeveloperSimulationMetrics(state, now),
        },
        issues: [],
      }
    })
  } catch (error) {
    return {
      ok: false,
      value: null,
      issues: [{ path: 'simulation', message: error instanceof Error ? error.message : 'El laboratorio no pudo completar la simulación.' }],
    }
  }
}

function deltaPercent(a: number | null, b: number | null) {
  if (a === null || b === null || a === 0) return null
  return round(((b - a) / Math.abs(a)) * 100, 2)
}

export function comparePrestigeLabRuns(
  request: Omit<PrestigeLabRequest, 'settings'> & {
    settingsA: PrestigeLabSettings
    settingsB: PrestigeLabSettings
  },
): PrestigeLabResult<PrestigeLabPairComparison> {
  const runA = runPrestigeLab({ ...request, settings: request.settingsA })
  if (!runA.ok) return runA
  const runB = runPrestigeLab({ ...request, settings: request.settingsB })
  if (!runB.ok) return runB
  return {
    ok: true,
    value: {
      runA: runA.value,
      runB: runB.value,
      averageCycleDeltaSeconds:
        runA.value.averageCycleSeconds === null || runB.value.averageCycleSeconds === null
          ? null
          : round(runB.value.averageCycleSeconds - runA.value.averageCycleSeconds, 2),
      averageCycleDeltaPercent: deltaPercent(runA.value.averageCycleSeconds, runB.value.averageCycleSeconds),
      completedCycleDelta: runB.value.completedCycles.length - runA.value.completedCycles.length,
    },
    issues: [],
  }
}

export function runPrestigeCurveExplorer(
  request: Omit<PrestigeLabRequest, 'settings'> & {
    baseSettings: Omit<PrestigeLabSettings, 'sapphirePolicy'>
    increments: number[]
  },
): PrestigeLabResult<PrestigeCurveExplorerResult> {
  const points: PrestigeCurvePoint[] = []
  for (const rawIncrement of request.increments.slice(0, 12)) {
    const increment = normalizeSapphirePolicy({ mode: 'custom-post-p5', increment: rawIncrement }).increment
    const result = runPrestigeLab({
      scenario: request.scenario,
      candidate: request.candidate,
      startedAt: request.startedAt,
      settings: { ...request.baseSettings, sapphirePolicy: { mode: 'custom-post-p5', increment } },
    })
    if (!result.ok) return result
    const durations = result.value.completedCycles.map((cycle) => cycle.durationSeconds)
    points.push({
      increment,
      completedCycles: durations.length,
      averageCycleSeconds: result.value.averageCycleSeconds,
      lastCycleSeconds: result.value.lastCycleSeconds,
      cycleDurations: durations,
      accelerationRatio: durations.length >= 2 && durations[0] > 0 ? round(durations.at(-1)! / durations[0], 4) : null,
    })
  }
  return { ok: true, value: { scenarioId: request.scenario.id, candidateName: request.candidate.name, points }, issues: [] }
}

export function comparePrestigeStrategies(
  request: Omit<PrestigeLabRequest, 'settings'> & {
    baseSettings: Omit<PrestigeLabSettings, 'purchaseStrategy'>
    strategies: PrestigeLabPurchaseStrategy[]
  },
): PrestigeLabResult<PrestigeStrategyComparisonRow[]> {
  const rows: PrestigeStrategyComparisonRow[] = []
  for (const strategy of [...new Set(request.strategies)].slice(0, 5)) {
    const result = runPrestigeLab({
      scenario: request.scenario,
      candidate: request.candidate,
      startedAt: request.startedAt,
      settings: { ...request.baseSettings, purchaseStrategy: strategy },
    })
    if (!result.ok) return result
    rows.push({
      strategy,
      completedCycles: result.value.completedCycles.length,
      averageCycleSeconds: result.value.averageCycleSeconds,
      totalEnergyGenerated: result.value.totalEnergyGenerated,
      totalEnergySpent: result.value.totalEnergySpent,
      decisionlessSeconds: result.value.totalDecisionlessSeconds,
    })
  }
  return { ok: true, value: rows, issues: [] }
}

function emptyUpgradeRecord() {
  return Object.fromEntries(UPGRADE_DEFINITIONS.map((definition) => [definition.id, 0])) as Record<PrestigeLabUpgradeId, number>
}

export function analyzePrestigePath(run: PrestigeLabRun): PrestigePathSummary {
  const purchaseCountByUpgrade = emptyUpgradeRecord()
  const spendByUpgrade = emptyUpgradeRecord()
  for (const event of run.purchaseEvents) {
    purchaseCountByUpgrade[event.upgradeId] += 1
    spendByUpgrade[event.upgradeId] = round(spendByUpgrade[event.upgradeId] + event.cost, 2)
  }
  const dominantUpgrade = UPGRADE_DEFINITIONS
    .map((definition) => definition.id)
    .sort((a, b) => spendByUpgrade[b] - spendByUpgrade[a])[0]
  const neverPurchased = UPGRADE_DEFINITIONS.map((definition) => definition.id).filter((id) => purchaseCountByUpgrade[id] === 0)
  return {
    purchaseCountByUpgrade,
    spendByUpgrade,
    dominantUpgrade: dominantUpgrade && spendByUpgrade[dominantUpgrade] > 0 ? dominantUpgrade : null,
    neverPurchased,
    firstPurchases: run.purchaseEvents.slice(0, 40).map((event) => ({ ...event })),
  }
}

export function runPrestigeBatch(request: PrestigeBatchRequest): PrestigeLabResult<PrestigeBatchResult> {
  const totalRequested = request.scenarios.length * request.policies.length * request.strategies.length * request.manualClickRates.length
  if (totalRequested < 1) {
    return { ok: false, value: null, issues: [{ path: 'batch', message: 'Selecciona al menos una combinación.' }] }
  }
  if (totalRequested > PRESTIGE_LAB_MAX_BATCH_RUNS) {
    return { ok: false, value: null, issues: [{ path: 'batch', message: `El lote excede el máximo de ${PRESTIGE_LAB_MAX_BATCH_RUNS} corridas.` }] }
  }
  const rows: PrestigeBatchRow[] = []
  for (const scenario of request.scenarios) {
    for (const policy of request.policies) {
      for (const strategy of request.strategies) {
        for (const clickRate of request.manualClickRates) {
          const result = runPrestigeLab({
            scenario,
            candidate: request.candidate,
            startedAt: request.startedAt,
            settings: {
              durationSeconds: request.durationSeconds,
              manualClicksPerSecond: clickRate,
              targetCycles: request.targetCycles,
              autoPurchase: true,
              purchaseStrategy: strategy,
              sapphirePolicy: policy,
            },
          })
          if (!result.ok) return result
          rows.push({
            scenarioId: scenario.id,
            scenarioName: scenario.name,
            sapphirePolicy: describeSapphirePolicy(policy),
            strategy,
            manualClicksPerSecond: result.value.settings.manualClicksPerSecond,
            completedCycles: result.value.completedCycles.length,
            averageCycleSeconds: result.value.averageCycleSeconds,
            lastCycleSeconds: result.value.lastCycleSeconds,
            totalEnergyGenerated: result.value.totalEnergyGenerated,
            totalEnergySpent: result.value.totalEnergySpent,
            totalDecisionlessSeconds: result.value.totalDecisionlessSeconds,
          })
        }
      }
    }
  }
  return { ok: true, value: { totalRuns: rows.length, rows }, issues: [] }
}
