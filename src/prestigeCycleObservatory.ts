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

export const PRESTIGE_CYCLE_MAX_SECONDS = 21_600
export const PRESTIGE_CYCLE_MAX_TARGET = 10
export const PRESTIGE_CYCLE_MAX_MANUAL_CLICKS_PER_SECOND = 20
export const PRESTIGE_CYCLE_MAX_ACTIONS = 500_000
export const PRESTIGE_CYCLE_MAX_PURCHASES = 4_000
export const PRESTIGE_CYCLE_CHECKPOINT_SECONDS = [10, 30, 60] as const

export type PrestigeCycleUpgradeId =
  | 'click'
  | 'pulse-trigger'
  | 'generator'
  | 'resonance'
  | 'pressure'
  | 'cavitation'
  | 'autoclick'
  | 'overload'
  | 'refraction'

export type PrestigeCycleCandidate = {
  id: string
  name: string
  config: BalanceConfig
}

export type PrestigeCycleExperimentSettings = {
  durationSeconds: number
  manualClicksPerSecond: number
  autoPurchase: boolean
  targetCycles: number
}

export type PrestigeCycleExperimentRequest = {
  scenario: Pick<DeveloperScenario, 'id' | 'name' | 'state' | 'capturedAt'>
  candidateA: PrestigeCycleCandidate
  candidateB: PrestigeCycleCandidate
  settings: PrestigeCycleExperimentSettings
  startedAt?: number
}

export type PrestigeCycleUpgradeLevels = {
  click: number
  pulseTrigger: number
  generator: number
  resonance: number
  pressure: number
  cavitation: number
  autoclick: number
  overload: number
  refraction: number
}

export type PrestigeCycleCheckpoint = {
  second: (typeof PRESTIGE_CYCLE_CHECKPOINT_SECONDS)[number]
  absoluteElapsedSeconds: number
  energy: number
  manualClicks: number
  energyPerSecond: number
  effectiveProductionPerSecond: number
  generatorLevel: number
  autoclickLevel: number
}

export type PrestigeCycleRecord = {
  index: number
  prestigeBefore: number
  prestigeAfter: number
  startedAtSeconds: number
  endedAtSeconds: number
  durationSeconds: number
  sapphireMultiplier: number
  nextSapphireMultiplier: number
  energyGenerated: number
  energySpent: number
  directSapphireEnergy: number
  directSapphireSharePercent: number
  purchaseCount: number
  decisionlessSeconds: number
  longestDecisionGapSeconds: number
  firstGeneratorAt: number | null
  firstAutoclickAt: number | null
  firstAdvancedUpgradeAt: number | null
  checkpoints: PrestigeCycleCheckpoint[]
  finalUpgradeLevels: PrestigeCycleUpgradeLevels
}

export type PrestigeCycleCurrentRecord = Omit<
  PrestigeCycleRecord,
  'endedAtSeconds' | 'durationSeconds' | 'prestigeAfter' | 'nextSapphireMultiplier'
> & {
  elapsedSeconds: number
}

export type PrestigeCycleRun = {
  candidate: PrestigeCycleCandidate
  initialState: GameState
  finalState: GameState
  elapsedSeconds: number
  endedBy: 'target-cycles' | 'duration' | 'safety-limit'
  actionCount: number
  completedCycles: PrestigeCycleRecord[]
  currentCycle: PrestigeCycleCurrentRecord
  averageCycleSeconds: number | null
  lastCycleSeconds: number | null
  totalEnergyGenerated: number
  totalEnergySpent: number
  totalDirectSapphireEnergy: number
  finalMetrics: DeveloperSimulationMetrics
}

export type PrestigeCycleMetricDirection = 'higher' | 'lower' | 'neutral'

export type PrestigeCycleMetricRow = {
  id: string
  label: string
  unit: string
  direction: PrestigeCycleMetricDirection
  valueA: number | null
  valueB: number | null
  delta: number | null
  percentDelta: number | null
  winner: 'A' | 'B' | 'tie' | 'none'
}

export type PrestigeCycleComparison = {
  scenarioId: string
  scenarioName: string
  startedAt: number
  settings: PrestigeCycleExperimentSettings
  runA: PrestigeCycleRun
  runB: PrestigeCycleRun
  metrics: PrestigeCycleMetricRow[]
}

export type PrestigeCycleIssue = { path: string; message: string }

export type PrestigeCycleExperimentResult =
  | { ok: true; value: PrestigeCycleComparison; issues: [] }
  | { ok: false; value: null; issues: PrestigeCycleIssue[] }

type UpgradeDefinition = {
  id: PrestigeCycleUpgradeId
  levelField:
    | 'clickLevel'
    | 'pulseTriggerLevel'
    | 'generatorLevel'
    | 'resonanceLevel'
    | 'pressureLevel'
    | 'cavitationLevel'
    | 'autoclickLevel'
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

const ADVANCED_UPGRADES = new Set<PrestigeCycleUpgradeId>([
  'pressure',
  'cavitation',
  'autoclick',
  'pulse-trigger',
  'overload',
  'refraction',
])

function round(value: number, decimals = 4) {
  const factor = 10 ** decimals
  return Math.round((value + Number.EPSILON) * factor) / factor
}

function cloneCandidate(candidate: Readonly<PrestigeCycleCandidate>): PrestigeCycleCandidate {
  return {
    id: candidate.id,
    name: candidate.name,
    config: structuredClone(candidate.config),
  }
}

function getUpgradeLevels(state: Readonly<GameState>): PrestigeCycleUpgradeLevels {
  return {
    click: state.clickLevel,
    pulseTrigger: state.pulseTriggerLevel,
    generator: state.generatorLevel,
    resonance: state.resonanceLevel,
    pressure: state.pressureLevel,
    cavitation: state.cavitationLevel,
    autoclick: state.autoclickLevel,
    overload: state.overloadLevel,
    refraction: state.refractionLevel,
  }
}

export function normalizePrestigeCycleDuration(value: number) {
  if (!Number.isFinite(value)) return 1
  return Math.min(PRESTIGE_CYCLE_MAX_SECONDS, Math.max(1, Math.floor(value)))
}

export function normalizePrestigeCycleTarget(value: number) {
  if (!Number.isFinite(value)) return 1
  return Math.min(PRESTIGE_CYCLE_MAX_TARGET, Math.max(1, Math.floor(value)))
}

export function normalizePrestigeCycleManualClicks(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.min(
    PRESTIGE_CYCLE_MAX_MANUAL_CLICKS_PER_SECOND,
    Math.max(0, Math.floor(value)),
  )
}

function normalizeSettings(
  settings: PrestigeCycleExperimentSettings,
): PrestigeCycleExperimentSettings {
  return {
    durationSeconds: normalizePrestigeCycleDuration(settings.durationSeconds),
    manualClicksPerSecond: normalizePrestigeCycleManualClicks(
      settings.manualClicksPerSecond,
    ),
    autoPurchase: Boolean(settings.autoPurchase),
    targetCycles: normalizePrestigeCycleTarget(settings.targetCycles),
  }
}

function validateRequest(request: PrestigeCycleExperimentRequest) {
  const issues: PrestigeCycleIssue[] = validateDeveloperScenarioState(
    request.scenario.state,
  ).map((entry) => ({
    path: `scenario.${entry.path}`,
    message: entry.message,
  }))

  for (const [key, candidate] of [
    ['candidateA', request.candidateA],
    ['candidateB', request.candidateB],
  ] as const) {
    if (!candidate.id.trim()) issues.push({ path: `${key}.id`, message: 'Falta el id.' })
    if (!candidate.name.trim()) {
      issues.push({ path: `${key}.name`, message: 'Falta el nombre.' })
    }
    const validation = validateBalanceConfig(candidate.config)
    if (!validation.valid) {
      issues.push(
        ...validation.issues.map((entry) => ({
          path: `${key}.${entry.path}`,
          message: entry.message,
        })),
      )
    }
  }

  return issues
}

function getEffectiveProduction(
  metrics: DeveloperSimulationMetrics,
  manualClicksPerSecond: number,
) {
  return round(
    metrics.energyPerSecond +
      metrics.clickPower *
        (manualClicksPerSecond + metrics.autoclicksPerSecond),
  )
}

function findCheapestPurchase(state: GameState) {
  const options = UPGRADE_DEFINITIONS.flatMap((definition, index) => {
    const nextState = gameReducer(state, definition.action)
    if (
      nextState === state ||
      nextState[definition.levelField] <= state[definition.levelField]
    ) {
      return []
    }

    return [
      {
        definition,
        index,
        nextState,
        cost: round(Math.max(0, state.energy - nextState.energy), 2),
      },
    ]
  })

  options.sort((left, right) =>
    left.cost === right.cost
      ? left.index - right.index
      : left.cost - right.cost,
  )

  return options[0] ?? null
}

type CycleAccumulator = {
  index: number
  prestigeBefore: number
  startedAtSeconds: number
  sapphireMultiplier: number
  energyGenerated: number
  energySpent: number
  directSapphireEnergy: number
  purchaseCount: number
  decisionlessSeconds: number
  longestDecisionGapSeconds: number
  currentDecisionGapSeconds: number
  firstGeneratorAt: number | null
  firstAutoclickAt: number | null
  firstAdvancedUpgradeAt: number | null
  checkpoints: PrestigeCycleCheckpoint[]
}

function createAccumulator(
  state: Readonly<GameState>,
  index: number,
  startedAtSeconds: number,
): CycleAccumulator {
  const hasAdvanced =
    state.pressureLevel > 0 ||
    state.cavitationLevel > 0 ||
    state.autoclickLevel > 0 ||
    state.pulseTriggerLevel > 0 ||
    state.overloadLevel > 0 ||
    state.refractionLevel > 0

  return {
    index,
    prestigeBefore: state.prestigeCount,
    startedAtSeconds,
    sapphireMultiplier: getSapphireMultiplier(state.prestigeCount),
    energyGenerated: 0,
    energySpent: 0,
    directSapphireEnergy: 0,
    purchaseCount: 0,
    decisionlessSeconds: 0,
    longestDecisionGapSeconds: 0,
    currentDecisionGapSeconds: 0,
    firstGeneratorAt: state.generatorLevel > 0 ? 0 : null,
    firstAutoclickAt: state.autoclickLevel > 0 ? 0 : null,
    firstAdvancedUpgradeAt: hasAdvanced ? 0 : null,
    checkpoints: [],
  }
}

function noteGeneratedEnergy(accumulator: CycleAccumulator, gain: number) {
  if (gain <= 0) return
  accumulator.energyGenerated = round(accumulator.energyGenerated + gain, 2)
  const share =
    accumulator.sapphireMultiplier > 1
      ? gain * (1 - 1 / accumulator.sapphireMultiplier)
      : 0
  accumulator.directSapphireEnergy = round(
    accumulator.directSapphireEnergy + share,
    2,
  )
}

function noteCheckpoint(
  accumulator: CycleAccumulator,
  state: Readonly<GameState>,
  elapsedSeconds: number,
  now: number,
  manualClicksPerSecond: number,
) {
  const relative = elapsedSeconds - accumulator.startedAtSeconds
  if (
    !PRESTIGE_CYCLE_CHECKPOINT_SECONDS.includes(
      relative as (typeof PRESTIGE_CYCLE_CHECKPOINT_SECONDS)[number],
    ) ||
    accumulator.checkpoints.some((item) => item.second === relative)
  ) {
    return
  }

  const metrics = getDeveloperSimulationMetrics(state, now)
  accumulator.checkpoints.push({
    second: relative as PrestigeCycleCheckpoint['second'],
    absoluteElapsedSeconds: elapsedSeconds,
    energy: round(state.energy, 2),
    manualClicks: state.manualClicks,
    energyPerSecond: round(metrics.energyPerSecond, 2),
    effectiveProductionPerSecond: getEffectiveProduction(
      metrics,
      manualClicksPerSecond,
    ),
    generatorLevel: state.generatorLevel,
    autoclickLevel: state.autoclickLevel,
  })
}

function finalizeCycle(
  accumulator: CycleAccumulator,
  stateBeforeCrystallize: Readonly<GameState>,
  stateAfterCrystallize: Readonly<GameState>,
  elapsedSeconds: number,
): PrestigeCycleRecord {
  return {
    index: accumulator.index,
    prestigeBefore: accumulator.prestigeBefore,
    prestigeAfter: stateAfterCrystallize.prestigeCount,
    startedAtSeconds: accumulator.startedAtSeconds,
    endedAtSeconds: elapsedSeconds,
    durationSeconds: elapsedSeconds - accumulator.startedAtSeconds,
    sapphireMultiplier: accumulator.sapphireMultiplier,
    nextSapphireMultiplier: getSapphireMultiplier(
      stateAfterCrystallize.prestigeCount,
    ),
    energyGenerated: accumulator.energyGenerated,
    energySpent: accumulator.energySpent,
    directSapphireEnergy: accumulator.directSapphireEnergy,
    directSapphireSharePercent:
      accumulator.energyGenerated > 0
        ? round(
            (accumulator.directSapphireEnergy /
              accumulator.energyGenerated) *
              100,
            2,
          )
        : 0,
    purchaseCount: accumulator.purchaseCount,
    decisionlessSeconds: accumulator.decisionlessSeconds,
    longestDecisionGapSeconds: accumulator.longestDecisionGapSeconds,
    firstGeneratorAt: accumulator.firstGeneratorAt,
    firstAutoclickAt: accumulator.firstAutoclickAt,
    firstAdvancedUpgradeAt: accumulator.firstAdvancedUpgradeAt,
    checkpoints: accumulator.checkpoints.map((item) => ({ ...item })),
    finalUpgradeLevels: getUpgradeLevels(stateBeforeCrystallize),
  }
}

function currentCycleRecord(
  accumulator: CycleAccumulator,
  state: Readonly<GameState>,
  elapsedSeconds: number,
): PrestigeCycleCurrentRecord {
  return {
    index: accumulator.index,
    prestigeBefore: accumulator.prestigeBefore,
    startedAtSeconds: accumulator.startedAtSeconds,
    elapsedSeconds: elapsedSeconds - accumulator.startedAtSeconds,
    sapphireMultiplier: accumulator.sapphireMultiplier,
    energyGenerated: accumulator.energyGenerated,
    energySpent: accumulator.energySpent,
    directSapphireEnergy: accumulator.directSapphireEnergy,
    directSapphireSharePercent:
      accumulator.energyGenerated > 0
        ? round(
            (accumulator.directSapphireEnergy /
              accumulator.energyGenerated) *
              100,
            2,
          )
        : 0,
    purchaseCount: accumulator.purchaseCount,
    decisionlessSeconds: accumulator.decisionlessSeconds,
    longestDecisionGapSeconds: accumulator.longestDecisionGapSeconds,
    firstGeneratorAt: accumulator.firstGeneratorAt,
    firstAutoclickAt: accumulator.firstAutoclickAt,
    firstAdvancedUpgradeAt: accumulator.firstAdvancedUpgradeAt,
    checkpoints: accumulator.checkpoints.map((item) => ({ ...item })),
    finalUpgradeLevels: getUpgradeLevels(state),
  }
}

function runSingle(
  candidate: PrestigeCycleCandidate,
  request: PrestigeCycleExperimentRequest,
  settings: PrestigeCycleExperimentSettings,
  startedAt: number,
): PrestigeCycleRun {
  return runWithBalanceConfig(candidate.config, () => {
    const initialState = materializeDeveloperScenarioState(
      request.scenario,
      startedAt,
    )
    let state: GameState = { ...initialState }
    let elapsedSeconds = 0
    let now = startedAt
    let actionCount = 0
    let endedBy: PrestigeCycleRun['endedBy'] = 'duration'
    let accumulator = createAccumulator(state, 1, 0)
    const cycles: PrestigeCycleRecord[] = []

    function applyTrackedAction(action: GameAction) {
      const beforeEnergy = state.energy
      state = gameReducer(state, action)
      actionCount += 1
      noteGeneratedEnergy(accumulator, Math.max(0, state.energy - beforeEnergy))
    }

    function purchaseAffordableUpgrades() {
      let purchased = 0
      while (
        settings.autoPurchase &&
        accumulator.purchaseCount < PRESTIGE_CYCLE_MAX_PURCHASES &&
        actionCount < PRESTIGE_CYCLE_MAX_ACTIONS
      ) {
        const option = findCheapestPurchase(state)
        if (!option) break

        state = option.nextState
        actionCount += 1
        purchased += 1
        accumulator.purchaseCount += 1
        accumulator.energySpent = round(
          accumulator.energySpent + option.cost,
          2,
        )
        const relative = elapsedSeconds - accumulator.startedAtSeconds
        if (
          option.definition.id === 'generator' &&
          accumulator.firstGeneratorAt === null
        ) {
          accumulator.firstGeneratorAt = relative
        }
        if (
          option.definition.id === 'autoclick' &&
          accumulator.firstAutoclickAt === null
        ) {
          accumulator.firstAutoclickAt = relative
        }
        if (
          ADVANCED_UPGRADES.has(option.definition.id) &&
          accumulator.firstAdvancedUpgradeAt === null
        ) {
          accumulator.firstAdvancedUpgradeAt = relative
        }
      }
      return purchased
    }

    function crystallizeIfReady() {
      if (!canCrystallize(state)) return false
      const before = state
      state = gameReducer(state, { type: 'crystallize' })
      actionCount += 1
      cycles.push(finalizeCycle(accumulator, before, state, elapsedSeconds))
      accumulator = createAccumulator(state, cycles.length + 1, elapsedSeconds)
      return true
    }

    if (crystallizeIfReady() && cycles.length >= settings.targetCycles) {
      endedBy = 'target-cycles'
    } else {
      purchaseAffordableUpgrades()
      for (
        elapsedSeconds = 1;
        elapsedSeconds <= settings.durationSeconds;
        elapsedSeconds += 1
      ) {
        now = startedAt + elapsedSeconds * 1_000
        let purchasedThisSecond = 0

        for (
          let click = 0;
          click < settings.manualClicksPerSecond;
          click += 1
        ) {
          if (actionCount >= PRESTIGE_CYCLE_MAX_ACTIONS) break
          applyTrackedAction({ type: 'click', now })
        }

        if (actionCount >= PRESTIGE_CYCLE_MAX_ACTIONS) {
          endedBy = 'safety-limit'
          break
        }

        applyTrackedAction({ type: 'tick', now })
        purchasedThisSecond += purchaseAffordableUpgrades()
        noteCheckpoint(
          accumulator,
          state,
          elapsedSeconds,
          now,
          settings.manualClicksPerSecond,
        )

        const hasAffordableDecision = findCheapestPurchase(state) !== null
        if (purchasedThisSecond === 0 && !hasAffordableDecision) {
          accumulator.decisionlessSeconds += 1
          accumulator.currentDecisionGapSeconds += 1
          accumulator.longestDecisionGapSeconds = Math.max(
            accumulator.longestDecisionGapSeconds,
            accumulator.currentDecisionGapSeconds,
          )
        } else {
          accumulator.currentDecisionGapSeconds = 0
        }

        if (crystallizeIfReady() && cycles.length >= settings.targetCycles) {
          endedBy = 'target-cycles'
          break
        }

        if (actionCount >= PRESTIGE_CYCLE_MAX_ACTIONS) {
          endedBy = 'safety-limit'
          break
        }
      }
    }

    const safeElapsed = Math.min(
      settings.durationSeconds,
      Math.max(0, elapsedSeconds),
    )
    const durations = cycles.map((cycle) => cycle.durationSeconds)
    const totalEnergyGenerated = round(
      cycles.reduce((sum, cycle) => sum + cycle.energyGenerated, 0) +
        accumulator.energyGenerated,
      2,
    )
    const totalEnergySpent = round(
      cycles.reduce((sum, cycle) => sum + cycle.energySpent, 0) +
        accumulator.energySpent,
      2,
    )
    const totalDirectSapphireEnergy = round(
      cycles.reduce((sum, cycle) => sum + cycle.directSapphireEnergy, 0) +
        accumulator.directSapphireEnergy,
      2,
    )

    return {
      candidate: cloneCandidate(candidate),
      initialState: { ...initialState },
      finalState: { ...state },
      elapsedSeconds: safeElapsed,
      endedBy,
      actionCount,
      completedCycles: cycles.map((cycle) => ({
        ...cycle,
        checkpoints: cycle.checkpoints.map((item) => ({ ...item })),
        finalUpgradeLevels: { ...cycle.finalUpgradeLevels },
      })),
      currentCycle: currentCycleRecord(accumulator, state, safeElapsed),
      averageCycleSeconds:
        durations.length > 0
          ? round(
              durations.reduce((sum, value) => sum + value, 0) /
                durations.length,
              2,
            )
          : null,
      lastCycleSeconds: durations.at(-1) ?? null,
      totalEnergyGenerated,
      totalEnergySpent,
      totalDirectSapphireEnergy,
      finalMetrics: getDeveloperSimulationMetrics(state, now),
    }
  })
}

function percentDelta(valueA: number | null, valueB: number | null) {
  if (valueA === null || valueB === null) return null
  if (valueA === 0) return valueB === 0 ? 0 : null
  return round(((valueB - valueA) / Math.abs(valueA)) * 100, 2)
}

function winner(
  valueA: number | null,
  valueB: number | null,
  direction: PrestigeCycleMetricDirection,
): PrestigeCycleMetricRow['winner'] {
  if (valueA === null || valueB === null || direction === 'neutral') return 'none'
  if (Object.is(valueA, valueB)) return 'tie'
  if (direction === 'higher') return valueB > valueA ? 'B' : 'A'
  return valueB < valueA ? 'B' : 'A'
}

function metric(
  id: string,
  label: string,
  unit: string,
  direction: PrestigeCycleMetricDirection,
  valueA: number | null,
  valueB: number | null,
): PrestigeCycleMetricRow {
  return {
    id,
    label,
    unit,
    direction,
    valueA,
    valueB,
    delta:
      valueA === null || valueB === null ? null : round(valueB - valueA, 4),
    percentDelta: percentDelta(valueA, valueB),
    winner: winner(valueA, valueB, direction),
  }
}

function checkpointAverage(run: PrestigeCycleRun, second: 10 | 30 | 60) {
  const values = run.completedCycles.flatMap((cycle) => {
    const checkpoint = cycle.checkpoints.find((item) => item.second === second)
    return checkpoint ? [checkpoint.effectiveProductionPerSecond] : []
  })
  return values.length > 0
    ? round(values.reduce((sum, value) => sum + value, 0) / values.length, 2)
    : null
}

function createMetrics(runA: PrestigeCycleRun, runB: PrestigeCycleRun) {
  return [
    metric(
      'completed-cycles',
      'Ciclos completados',
      '',
      'higher',
      runA.completedCycles.length,
      runB.completedCycles.length,
    ),
    metric(
      'average-cycle',
      'Duración media por ciclo',
      's',
      'lower',
      runA.averageCycleSeconds,
      runB.averageCycleSeconds,
    ),
    metric(
      'last-cycle',
      'Último ciclo',
      's',
      'lower',
      runA.lastCycleSeconds,
      runB.lastCycleSeconds,
    ),
    metric(
      'generated-energy',
      'Energía generada',
      '',
      'neutral',
      runA.totalEnergyGenerated,
      runB.totalEnergyGenerated,
    ),
    metric(
      'spent-energy',
      'Energía gastada',
      '',
      'neutral',
      runA.totalEnergySpent,
      runB.totalEnergySpent,
    ),
    metric(
      'direct-sapphire-energy',
      'Aporte directo estimado de Zafiro',
      '',
      'neutral',
      runA.totalDirectSapphireEnergy,
      runB.totalDirectSapphireEnergy,
    ),
    metric(
      'checkpoint-10',
      'Producción media a 10 s',
      '/s',
      'higher',
      checkpointAverage(runA, 10),
      checkpointAverage(runB, 10),
    ),
    metric(
      'checkpoint-30',
      'Producción media a 30 s',
      '/s',
      'higher',
      checkpointAverage(runA, 30),
      checkpointAverage(runB, 30),
    ),
    metric(
      'checkpoint-60',
      'Producción media a 60 s',
      '/s',
      'higher',
      checkpointAverage(runA, 60),
      checkpointAverage(runB, 60),
    ),
  ]
}

export function runPrestigeCycleExperiment(
  request: PrestigeCycleExperimentRequest,
): PrestigeCycleExperimentResult {
  const issues = validateRequest(request)
  if (issues.length > 0) return { ok: false, value: null, issues }

  const settings = normalizeSettings(request.settings)
  const startedAt = Number.isFinite(request.startedAt)
    ? Math.max(0, Math.floor(request.startedAt ?? 0))
    : Date.now()

  try {
    const runA = runSingle(
      cloneCandidate(request.candidateA),
      request,
      settings,
      startedAt,
    )
    const runB = runSingle(
      cloneCandidate(request.candidateB),
      request,
      settings,
      startedAt,
    )

    return {
      ok: true,
      value: {
        scenarioId: request.scenario.id,
        scenarioName: request.scenario.name,
        startedAt,
        settings,
        runA,
        runB,
        metrics: createMetrics(runA, runB),
      },
      issues: [],
    }
  } catch (error) {
    return {
      ok: false,
      value: null,
      issues: [
        {
          path: 'simulation',
          message:
            error instanceof Error
              ? error.message
              : 'El observatorio no pudo completar la simulación.',
        },
      ],
    }
  }
}

function escapeCsv(value: string | number | null) {
  const text = value === null ? '' : String(value)
  return `"${text.replaceAll('"', '""')}"`
}

export function exportPrestigeCycleCsv(comparison: PrestigeCycleComparison) {
  const metricRows = [
    ['Métrica', comparison.runA.candidate.name, comparison.runB.candidate.name, 'Delta', 'Delta %'],
    ...comparison.metrics.map((row) => [
      row.label,
      row.valueA,
      row.valueB,
      row.delta,
      row.percentDelta,
    ]),
  ]
  const cycleHeader = [
    'Perfil',
    'Ciclo',
    'Prestigio inicial',
    'Prestigio final',
    'Duración s',
    'Zafiro',
    'Energía generada',
    'Energía gastada',
    'Aporte directo Zafiro',
    'Compras',
    'Sin decisiones s',
    'Primera generación s',
    'Primer Autoclicker s',
    'Primera avanzada s',
  ]
  const cycleRows = [comparison.runA, comparison.runB].flatMap((run) =>
    run.completedCycles.map((cycle) => [
      run.candidate.name,
      cycle.index,
      cycle.prestigeBefore,
      cycle.prestigeAfter,
      cycle.durationSeconds,
      cycle.sapphireMultiplier,
      cycle.energyGenerated,
      cycle.energySpent,
      cycle.directSapphireEnergy,
      cycle.purchaseCount,
      cycle.decisionlessSeconds,
      cycle.firstGeneratorAt,
      cycle.firstAutoclickAt,
      cycle.firstAdvancedUpgradeAt,
    ]),
  )

  return [...metricRows, [], cycleHeader, ...cycleRows]
    .map((row) => row.map((value) => escapeCsv(value)).join(','))
    .join('\n')
}
