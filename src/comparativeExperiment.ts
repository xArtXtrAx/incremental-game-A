import {
  DEFAULT_BALANCE_CONFIG,
  cloneBalanceConfig,
  type BalanceConfig,
} from './balanceConfig'
import { runWithBalanceConfig } from './balanceRuntime'
import { validateBalanceConfig } from './balanceValidation'
import {
  materializeDeveloperScenarioState,
  validateDeveloperScenarioState,
  type DeveloperScenario,
} from './developerScenarios'
import {
  canCrystallize,
  gameReducer,
  type GameAction,
  type GameState,
} from './game'
import {
  getDeveloperSimulationMetrics,
  type DeveloperSimulationMetrics,
} from './developerSimulation'

export const COMPARATIVE_MAX_SECONDS = 7_200
export const COMPARATIVE_MAX_MANUAL_CLICKS_PER_SECOND = 20
export const COMPARATIVE_MAX_ACTIONS = 250_000
export const COMPARATIVE_MAX_RECORDED_PURCHASES = 2_000

export type ComparativeStopCondition =
  | 'duration'
  | 'core-filled'
  | 'first-crystallization'
  | 'target-upgrade'

export type ComparativeEndedBy =
  | ComparativeStopCondition
  | 'safety-limit'

export type ComparativeUpgradeId =
  | 'click'
  | 'pulse-trigger'
  | 'generator'
  | 'resonance'
  | 'pressure'
  | 'cavitation'
  | 'autoclick'
  | 'overload'
  | 'refraction'

export type ComparativeBalanceCandidate = {
  id: string
  name: string
  source: 'official' | 'profile' | 'template'
  config: BalanceConfig
}

export type ComparativeExperimentSettings = {
  durationSeconds: number
  manualClicksPerSecond: number
  autoPurchase: boolean
  autoCrystallize: boolean
  stopCondition: ComparativeStopCondition
  targetUpgradeId?: ComparativeUpgradeId
  targetUpgradeLevel?: number
}

export type ComparativeExperimentRequest = {
  scenario: Pick<DeveloperScenario, 'id' | 'name' | 'state' | 'capturedAt'>
  candidateA: ComparativeBalanceCandidate
  candidateB: ComparativeBalanceCandidate
  settings: ComparativeExperimentSettings
  startedAt?: number
}

export type ComparativeExperimentIssue = {
  path: string
  message: string
}

export type ComparativePurchaseRecord = {
  upgradeId: ComparativeUpgradeId
  label: string
  level: number
  elapsedSeconds: number
  cost: number
  effectiveProductionBefore: number
  effectiveProductionAfter: number
  estimatedReturnSeconds: number | null
}

export type ComparativeUpgradeMilestone = {
  upgradeId: ComparativeUpgradeId
  label: string
  firstPurchasedAt: number | null
  finalLevel: number
  purchases: number
  averageEstimatedReturnSeconds: number | null
}

export type ComparativeSingleRun = {
  candidate: ComparativeBalanceCandidate
  initialState: GameState
  finalState: GameState
  elapsedSeconds: number
  endedBy: ComparativeEndedBy
  actionCount: number
  purchaseCount: number
  purchaseTimeline: ComparativePurchaseRecord[]
  upgradeMilestones: ComparativeUpgradeMilestone[]
  coreFilledAt: number | null
  firstCrystallizationAt: number | null
  totalDecisionlessSeconds: number
  longestDecisionGapSeconds: number
  finalMetrics: DeveloperSimulationMetrics
  effectiveProductionPerSecond: number
}

export type ComparativeMetricDirection = 'higher' | 'lower' | 'neutral'

export type ComparativeMetricRow = {
  id: string
  label: string
  unit: string
  direction: ComparativeMetricDirection
  valueA: number | null
  valueB: number | null
  delta: number | null
  percentDelta: number | null
  winner: 'A' | 'B' | 'tie' | 'none'
}

export type ComparativeExperimentComparison = {
  scenarioId: string
  scenarioName: string
  startedAt: number
  settings: ComparativeExperimentSettings
  runA: ComparativeSingleRun
  runB: ComparativeSingleRun
  metrics: ComparativeMetricRow[]
}

export type ComparativeExperimentResult =
  | {
      ok: true
      value: ComparativeExperimentComparison
      issues: []
    }
  | {
      ok: false
      value: null
      issues: ComparativeExperimentIssue[]
    }

type UpgradeDefinition = {
  id: ComparativeUpgradeId
  label: string
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
  {
    id: 'click',
    label: 'Potencia de clic',
    levelField: 'clickLevel',
    action: { type: 'buy-click-upgrade' },
  },
  {
    id: 'generator',
    label: 'Generador',
    levelField: 'generatorLevel',
    action: { type: 'buy-generator' },
  },
  {
    id: 'resonance',
    label: 'Resonancia',
    levelField: 'resonanceLevel',
    action: { type: 'buy-resonance' },
  },
  {
    id: 'pressure',
    label: 'Presión',
    levelField: 'pressureLevel',
    action: { type: 'buy-pressure' },
  },
  {
    id: 'cavitation',
    label: 'Cavitación',
    levelField: 'cavitationLevel',
    action: { type: 'buy-cavitation' },
  },
  {
    id: 'autoclick',
    label: 'Autoclicker',
    levelField: 'autoclickLevel',
    action: { type: 'buy-autoclicker' },
  },
  {
    id: 'pulse-trigger',
    label: 'Gatillo de pulso',
    levelField: 'pulseTriggerLevel',
    action: { type: 'buy-pulse-trigger' },
  },
  {
    id: 'overload',
    label: 'Sobrecarga',
    levelField: 'overloadLevel',
    action: { type: 'buy-overload' },
  },
  {
    id: 'refraction',
    label: 'Refracción',
    levelField: 'refractionLevel',
    action: { type: 'buy-refraction' },
  },
]

export const COMPARATIVE_UPGRADE_OPTIONS = UPGRADE_DEFINITIONS.map(
  ({ id, label }) => ({ id, label }),
)

function round(value: number, decimals = 4) {
  const factor = 10 ** decimals
  return Math.round((value + Number.EPSILON) * factor) / factor
}

function cloneCandidate(
  candidate: Readonly<ComparativeBalanceCandidate>,
): ComparativeBalanceCandidate {
  return {
    id: candidate.id,
    name: candidate.name,
    source: candidate.source,
    config: cloneBalanceConfig(candidate.config),
  }
}

export function createOfficialComparativeCandidate(): ComparativeBalanceCandidate {
  return {
    id: 'official',
    name: 'Balance oficial',
    source: 'official',
    config: cloneBalanceConfig(DEFAULT_BALANCE_CONFIG),
  }
}

export function normalizeComparativeDurationSeconds(value: number) {
  if (!Number.isFinite(value)) return 1
  return Math.min(COMPARATIVE_MAX_SECONDS, Math.max(1, Math.floor(value)))
}

export function normalizeComparativeManualClicksPerSecond(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.min(
    COMPARATIVE_MAX_MANUAL_CLICKS_PER_SECOND,
    Math.max(0, Math.floor(value)),
  )
}

function normalizeSettings(
  settings: ComparativeExperimentSettings,
): ComparativeExperimentSettings {
  return {
    durationSeconds: normalizeComparativeDurationSeconds(
      settings.durationSeconds,
    ),
    manualClicksPerSecond: normalizeComparativeManualClicksPerSecond(
      settings.manualClicksPerSecond,
    ),
    autoPurchase: Boolean(settings.autoPurchase),
    autoCrystallize: Boolean(settings.autoCrystallize),
    stopCondition: settings.stopCondition,
    targetUpgradeId: settings.targetUpgradeId,
    targetUpgradeLevel:
      settings.targetUpgradeLevel === undefined
        ? undefined
        : Math.min(1_000, Math.max(1, Math.floor(settings.targetUpgradeLevel))),
  }
}

function validateRequest(
  request: ComparativeExperimentRequest,
): ComparativeExperimentIssue[] {
  const issues: ComparativeExperimentIssue[] = []

  issues.push(
    ...validateDeveloperScenarioState(request.scenario.state).map((issue) => ({
      path: `scenario.${issue.path}`,
      message: issue.message,
    })),
  )

  for (const [key, candidate] of [
    ['candidateA', request.candidateA],
    ['candidateB', request.candidateB],
  ] as const) {
    if (!candidate.id.trim()) {
      issues.push({ path: `${key}.id`, message: 'Falta el identificador.' })
    }
    if (!candidate.name.trim()) {
      issues.push({ path: `${key}.name`, message: 'Falta el nombre.' })
    }
    const validation = validateBalanceConfig(candidate.config)
    if (!validation.valid) {
      issues.push(
        ...validation.issues.map((issue) => ({
          path: `${key}.${issue.path}`,
          message: issue.message,
        })),
      )
    }
  }

  if (
    ![
      'duration',
      'core-filled',
      'first-crystallization',
      'target-upgrade',
    ].includes(request.settings.stopCondition)
  ) {
    issues.push({
      path: 'settings.stopCondition',
      message: 'La condición de parada no es compatible.',
    })
  }

  if (request.settings.stopCondition === 'target-upgrade') {
    if (
      !request.settings.targetUpgradeId ||
      !UPGRADE_DEFINITIONS.some(
        (definition) => definition.id === request.settings.targetUpgradeId,
      )
    ) {
      issues.push({
        path: 'settings.targetUpgradeId',
        message: 'Selecciona una evolución objetivo válida.',
      })
    }
    if (
      !Number.isFinite(request.settings.targetUpgradeLevel) ||
      (request.settings.targetUpgradeLevel ?? 0) < 1
    ) {
      issues.push({
        path: 'settings.targetUpgradeLevel',
        message: 'El nivel objetivo debe ser al menos 1.',
      })
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

function getUpgradeLevel(state: GameState, upgradeId: ComparativeUpgradeId) {
  const definition = UPGRADE_DEFINITIONS.find(
    (item) => item.id === upgradeId,
  )
  return definition ? state[definition.levelField] : 0
}

function targetReached(
  state: GameState,
  settings: ComparativeExperimentSettings,
) {
  if (
    settings.stopCondition !== 'target-upgrade' ||
    !settings.targetUpgradeId ||
    !settings.targetUpgradeLevel
  ) {
    return false
  }
  return (
    getUpgradeLevel(state, settings.targetUpgradeId) >=
    settings.targetUpgradeLevel
  )
}

function buildUpgradeMilestones(
  finalState: GameState,
  purchases: readonly ComparativePurchaseRecord[],
): ComparativeUpgradeMilestone[] {
  return UPGRADE_DEFINITIONS.map((definition) => {
    const matching = purchases.filter(
      (purchase) => purchase.upgradeId === definition.id,
    )
    const returns = matching
      .map((purchase) => purchase.estimatedReturnSeconds)
      .filter((value): value is number => value !== null)

    return {
      upgradeId: definition.id,
      label: definition.label,
      firstPurchasedAt: matching[0]?.elapsedSeconds ?? null,
      finalLevel: finalState[definition.levelField],
      purchases: matching.length,
      averageEstimatedReturnSeconds:
        returns.length > 0
          ? round(
              returns.reduce((total, value) => total + value, 0) /
                returns.length,
              2,
            )
          : null,
    }
  })
}

function runSingleExperiment(
  candidate: ComparativeBalanceCandidate,
  request: ComparativeExperimentRequest,
  settings: ComparativeExperimentSettings,
  startedAt: number,
): ComparativeSingleRun {
  return runWithBalanceConfig(candidate.config, () => {
    const initialState = materializeDeveloperScenarioState(
      request.scenario,
      startedAt,
    )
    let state = { ...initialState }
    let now = startedAt
    let elapsedSeconds = 0
    let endedBy: ComparativeEndedBy = 'duration'
    let actionCount = 0
    let coreFilledAt: number | null = null
    let firstCrystallizationAt: number | null = null
    let totalDecisionlessSeconds = 0
    let longestDecisionGapSeconds = 0
    let currentDecisionGapSeconds = 0
    const purchases: ComparativePurchaseRecord[] = []

    const purchaseLimit = Math.min(
      COMPARATIVE_MAX_RECORDED_PURCHASES,
      Math.max(0, Math.floor(candidate.config.engineLimits.maximumBulkPurchaseIterations)),
    )

    function noteCoreFilled() {
      const metrics = getDeveloperSimulationMetrics(state, now)
      if (metrics.clicksRemainingToCore === 0 && coreFilledAt === null) {
        coreFilledAt = elapsedSeconds
      }
    }

    function purchaseAffordableUpgrades() {
      let purchased = 0

      while (
        settings.autoPurchase &&
        purchases.length < purchaseLimit &&
        actionCount < COMPARATIVE_MAX_ACTIONS
      ) {
        const option = findCheapestPurchase(state)
        if (!option) break

        const beforeMetrics = getDeveloperSimulationMetrics(state, now)
        const effectiveBefore = getEffectiveProduction(
          beforeMetrics,
          settings.manualClicksPerSecond,
        )
        state = option.nextState
        actionCount += 1
        purchased += 1
        const afterMetrics = getDeveloperSimulationMetrics(state, now)
        const effectiveAfter = getEffectiveProduction(
          afterMetrics,
          settings.manualClicksPerSecond,
        )
        const productionDelta = effectiveAfter - effectiveBefore

        purchases.push({
          upgradeId: option.definition.id,
          label: option.definition.label,
          level: state[option.definition.levelField],
          elapsedSeconds,
          cost: option.cost,
          effectiveProductionBefore: effectiveBefore,
          effectiveProductionAfter: effectiveAfter,
          estimatedReturnSeconds:
            productionDelta > 0 ? round(option.cost / productionDelta, 2) : null,
        })
      }

      return purchased
    }

    function applyCrystallizationIfRequired() {
      if (!canCrystallize(state)) return false

      if (
        settings.stopCondition !== 'first-crystallization' &&
        !settings.autoCrystallize
      ) {
        return false
      }

      state = gameReducer(state, { type: 'crystallize' })
      actionCount += 1
      firstCrystallizationAt ??= elapsedSeconds
      return true
    }

    noteCoreFilled()
    if (settings.stopCondition === 'core-filled' && coreFilledAt !== null) {
      endedBy = 'core-filled'
    } else if (targetReached(state, settings)) {
      endedBy = 'target-upgrade'
    } else if (
      settings.stopCondition === 'first-crystallization' &&
      applyCrystallizationIfRequired()
    ) {
      endedBy = 'first-crystallization'
    } else {
      purchaseAffordableUpgrades()

      if (targetReached(state, settings)) {
        endedBy = 'target-upgrade'
      } else {
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
            if (actionCount >= COMPARATIVE_MAX_ACTIONS) break
            state = gameReducer(state, { type: 'click', now })
            actionCount += 1
          }

          if (actionCount >= COMPARATIVE_MAX_ACTIONS) {
            endedBy = 'safety-limit'
            break
          }

          state = gameReducer(state, { type: 'tick', now })
          actionCount += 1
          noteCoreFilled()

          if (
            settings.stopCondition === 'core-filled' &&
            coreFilledAt !== null
          ) {
            endedBy = 'core-filled'
            break
          }

          purchasedThisSecond += purchaseAffordableUpgrades()

          if (targetReached(state, settings)) {
            endedBy = 'target-upgrade'
            break
          }

          if (applyCrystallizationIfRequired()) {
            if (settings.stopCondition === 'first-crystallization') {
              endedBy = 'first-crystallization'
              break
            }
            purchasedThisSecond += purchaseAffordableUpgrades()
          }

          const hasAffordableDecision = findCheapestPurchase(state) !== null
          if (purchasedThisSecond === 0 && !hasAffordableDecision) {
            totalDecisionlessSeconds += 1
            currentDecisionGapSeconds += 1
            longestDecisionGapSeconds = Math.max(
              longestDecisionGapSeconds,
              currentDecisionGapSeconds,
            )
          } else {
            currentDecisionGapSeconds = 0
          }

          if (actionCount >= COMPARATIVE_MAX_ACTIONS) {
            endedBy = 'safety-limit'
            break
          }
        }
      }
    }

    const safeElapsedSeconds = Math.min(
      settings.durationSeconds,
      Math.max(0, elapsedSeconds),
    )
    const finalMetrics = getDeveloperSimulationMetrics(state, now)

    return {
      candidate: cloneCandidate(candidate),
      initialState: { ...initialState },
      finalState: { ...state },
      elapsedSeconds: safeElapsedSeconds,
      endedBy,
      actionCount,
      purchaseCount: purchases.length,
      purchaseTimeline: purchases.map((purchase) => ({ ...purchase })),
      upgradeMilestones: buildUpgradeMilestones(state, purchases),
      coreFilledAt,
      firstCrystallizationAt,
      totalDecisionlessSeconds,
      longestDecisionGapSeconds,
      finalMetrics,
      effectiveProductionPerSecond: getEffectiveProduction(
        finalMetrics,
        settings.manualClicksPerSecond,
      ),
    }
  })
}

function percentDelta(valueA: number | null, valueB: number | null) {
  if (valueA === null || valueB === null) return null
  if (valueA === 0) return valueB === 0 ? 0 : null
  return round(((valueB - valueA) / Math.abs(valueA)) * 100, 2)
}

function metricWinner(
  valueA: number | null,
  valueB: number | null,
  direction: ComparativeMetricDirection,
): ComparativeMetricRow['winner'] {
  if (valueA === null || valueB === null || direction === 'neutral') {
    return 'none'
  }
  if (Object.is(valueA, valueB)) return 'tie'
  if (direction === 'higher') return valueB > valueA ? 'B' : 'A'
  return valueB < valueA ? 'B' : 'A'
}

function metric(
  id: string,
  label: string,
  unit: string,
  direction: ComparativeMetricDirection,
  valueA: number | null,
  valueB: number | null,
): ComparativeMetricRow {
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
    winner: metricWinner(valueA, valueB, direction),
  }
}

function createMetricRows(
  runA: ComparativeSingleRun,
  runB: ComparativeSingleRun,
): ComparativeMetricRow[] {
  return [
    metric(
      'elapsed',
      'Tiempo ejecutado',
      's',
      'lower',
      runA.elapsedSeconds,
      runB.elapsedSeconds,
    ),
    metric(
      'core-filled',
      'Tiempo al núcleo lleno',
      's',
      'lower',
      runA.coreFilledAt,
      runB.coreFilledAt,
    ),
    metric(
      'first-crystallization',
      'Primera cristalización',
      's',
      'lower',
      runA.firstCrystallizationAt,
      runB.firstCrystallizationAt,
    ),
    metric(
      'final-energy',
      'Energía final',
      '',
      'higher',
      runA.finalState.energy,
      runB.finalState.energy,
    ),
    metric(
      'effective-production',
      'Producción efectiva estimada',
      '/s',
      'higher',
      runA.effectiveProductionPerSecond,
      runB.effectiveProductionPerSecond,
    ),
    metric(
      'purchases',
      'Compras ejecutadas',
      '',
      'neutral',
      runA.purchaseCount,
      runB.purchaseCount,
    ),
    metric(
      'decisionless-total',
      'Tiempo total sin decisiones',
      's',
      'lower',
      runA.totalDecisionlessSeconds,
      runB.totalDecisionlessSeconds,
    ),
    metric(
      'decisionless-longest',
      'Mayor espera entre decisiones',
      's',
      'lower',
      runA.longestDecisionGapSeconds,
      runB.longestDecisionGapSeconds,
    ),
    metric(
      'prestige',
      'Cristalizaciones finales',
      '',
      'higher',
      runA.finalState.prestigeCount,
      runB.finalState.prestigeCount,
    ),
  ]
}

export function runComparativeExperiment(
  request: ComparativeExperimentRequest,
): ComparativeExperimentResult {
  const issues = validateRequest(request)
  if (issues.length > 0) {
    return { ok: false, value: null, issues }
  }

  const settings = normalizeSettings(request.settings)
  const startedAt = Number.isFinite(request.startedAt)
    ? Math.max(0, Math.floor(request.startedAt ?? 0))
    : Date.now()

  try {
    const runA = runSingleExperiment(
      cloneCandidate(request.candidateA),
      request,
      settings,
      startedAt,
    )
    const runB = runSingleExperiment(
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
        metrics: createMetricRows(runA, runB),
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
              : 'La simulación comparativa no pudo completarse.',
        },
      ],
    }
  }
}

function escapeCsv(value: string | number | null) {
  const text = value === null ? '' : String(value)
  return `"${text.replaceAll('"', '""')}"`
}

export function exportComparativeExperimentCsv(
  comparison: ComparativeExperimentComparison,
) {
  const rows = [
    ['Métrica', comparison.runA.candidate.name, comparison.runB.candidate.name, 'Delta', 'Delta %'],
    ...comparison.metrics.map((row) => [
      row.label,
      row.valueA,
      row.valueB,
      row.delta,
      row.percentDelta,
    ]),
  ]

  return rows
    .map((row) => row.map((value) => escapeCsv(value)).join(','))
    .join('\n')
}
