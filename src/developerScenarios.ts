import { initialGameState, type GameState } from './game'

export const DEVELOPER_SCENARIO_STORAGE_KEY =
  'incremental-game-a:developer-scenarios:v1'
export const DEVELOPER_SCENARIO_STORAGE_VERSION = 1
export const DEVELOPER_SCENARIO_NAME_MAX_LENGTH = 64

const MAX_SAFE_LEVEL = 1_000_000_000
const MAX_SAFE_ENERGY = 90_000_000_000_000
const MAX_SAFE_TIME = 9_000_000_000_000_000

export type DeveloperScenarioKind = 'built-in' | 'custom'

export type DeveloperScenario = {
  id: string
  name: string
  description: string
  kind: DeveloperScenarioKind
  createdAt: number
  updatedAt: number
  capturedAt: number
  state: GameState
}

export type DeveloperScenarioChange = {
  field: keyof GameState
  from: number
  to: number
}

export type DeveloperScenarioStorage = Pick<
  Storage,
  'getItem' | 'setItem' | 'removeItem'
>

type StoredDeveloperScenarioCollection = {
  storageVersion: number
  scenarios: DeveloperScenario[]
}

type RepositoryDependencies = {
  now?: () => number
  createId?: () => string
}

export type DeveloperScenarioIssue = {
  path: string
  message: string
}

export type DeveloperScenarioResult<T> =
  | { ok: true; value: T; issues: [] }
  | { ok: false; value: null; issues: DeveloperScenarioIssue[] }

const integerFields: readonly (keyof GameState)[] = [
  'manualClicks',
  'clickLevel',
  'pulseTriggerLevel',
  'generatorLevel',
  'resonanceLevel',
  'pressureLevel',
  'cavitationLevel',
  'cavitationCharge',
  'autoclickLevel',
  'overloadLevel',
  'overloadCharge',
  'overloadUntil',
  'refractionLevel',
  'refractionFacetsCharged',
  'refractionUntil',
  'refractionDischargeCount',
  'prestigeCount',
]

const progressFields: readonly (keyof GameState)[] = [
  'autoclickProgress',
  'refractionOrbitProgress',
]

const stateFields = Object.keys(initialGameState) as (keyof GameState)[]

function success<T>(value: T): DeveloperScenarioResult<T> {
  return { ok: true, value, issues: [] }
}

function failure<T>(
  path: string,
  message: string,
): DeveloperScenarioResult<T> {
  return { ok: false, value: null, issues: [{ path, message }] }
}

export function cloneDeveloperGameState(state: Readonly<GameState>): GameState {
  return { ...state }
}

export function cloneDeveloperScenario(
  scenario: Readonly<DeveloperScenario>,
): DeveloperScenario {
  return {
    ...scenario,
    state: cloneDeveloperGameState(scenario.state),
  }
}

function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, ' ')
}

export function validateDeveloperScenarioState(
  value: unknown,
): DeveloperScenarioIssue[] {
  if (typeof value !== 'object' || value === null) {
    return [{ path: 'state', message: 'El estado debe ser un objeto.' }]
  }

  const candidate = value as Partial<Record<keyof GameState, unknown>>
  const issues: DeveloperScenarioIssue[] = []

  for (const field of stateFields) {
    const current = candidate[field]
    if (typeof current !== 'number' || !Number.isFinite(current)) {
      issues.push({
        path: `state.${field}`,
        message: 'Debe ser un número finito.',
      })
      continue
    }

    if (current < 0) {
      issues.push({
        path: `state.${field}`,
        message: 'No puede ser negativo.',
      })
    }
  }

  for (const field of integerFields) {
    const current = candidate[field]
    if (typeof current === 'number' && !Number.isInteger(current)) {
      issues.push({
        path: `state.${field}`,
        message: 'Debe ser un entero.',
      })
    }
  }

  for (const field of progressFields) {
    const current = candidate[field]
    if (typeof current === 'number' && (current < 0 || current >= 1)) {
      issues.push({
        path: `state.${field}`,
        message: 'Debe permanecer entre 0 y menos de 1.',
      })
    }
  }

  if (
    typeof candidate.energy === 'number' &&
    candidate.energy > MAX_SAFE_ENERGY
  ) {
    issues.push({
      path: 'state.energy',
      message: `No puede exceder ${MAX_SAFE_ENERGY}.`,
    })
  }

  for (const field of integerFields) {
    const current = candidate[field]
    const maximum =
      field === 'overloadUntil' || field === 'refractionUntil'
        ? MAX_SAFE_TIME
        : MAX_SAFE_LEVEL
    if (typeof current === 'number' && current > maximum) {
      issues.push({
        path: `state.${field}`,
        message: `No puede exceder ${maximum}.`,
      })
    }
  }

  return issues
}

function validateScenario(value: unknown, index: number): DeveloperScenarioIssue[] {
  const prefix = `scenarios.${index}`
  if (typeof value !== 'object' || value === null) {
    return [{ path: prefix, message: 'El escenario debe ser un objeto.' }]
  }

  const candidate = value as Partial<DeveloperScenario>
  const issues: DeveloperScenarioIssue[] = []

  if (typeof candidate.id !== 'string' || candidate.id.trim() === '') {
    issues.push({ path: `${prefix}.id`, message: 'Falta un id válido.' })
  }

  if (
    typeof candidate.name !== 'string' ||
    normalizeName(candidate.name) === '' ||
    normalizeName(candidate.name).length > DEVELOPER_SCENARIO_NAME_MAX_LENGTH
  ) {
    issues.push({ path: `${prefix}.name`, message: 'El nombre no es válido.' })
  }

  if (candidate.kind !== 'custom') {
    issues.push({
      path: `${prefix}.kind`,
      message: 'La colección persistente solo admite escenarios personalizados.',
    })
  }

  for (const field of ['createdAt', 'updatedAt', 'capturedAt'] as const) {
    const current = candidate[field]
    if (
      typeof current !== 'number' ||
      !Number.isFinite(current) ||
      current < 0 ||
      current > MAX_SAFE_TIME
    ) {
      issues.push({
        path: `${prefix}.${field}`,
        message: 'La marca temporal no es válida.',
      })
    }
  }

  issues.push(...validateDeveloperScenarioState(candidate.state))
  return issues
}

function parseCollection(
  raw: string | null,
): DeveloperScenarioResult<StoredDeveloperScenarioCollection> {
  if (raw === null) {
    return success({
      storageVersion: DEVELOPER_SCENARIO_STORAGE_VERSION,
      scenarios: [],
    })
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return failure('storage', 'La colección de escenarios contiene JSON corrupto.')
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return failure('storage', 'La colección de escenarios no es un objeto.')
  }

  const candidate = parsed as Partial<StoredDeveloperScenarioCollection>
  if (candidate.storageVersion !== DEVELOPER_SCENARIO_STORAGE_VERSION) {
    return failure(
      'storageVersion',
      'La versión de escenarios no es compatible.',
    )
  }

  if (!Array.isArray(candidate.scenarios)) {
    return failure('scenarios', 'La colección no contiene una lista válida.')
  }

  const issues = candidate.scenarios.flatMap((scenario, index) =>
    validateScenario(scenario, index),
  )
  if (issues.length > 0) {
    return { ok: false, value: null, issues }
  }

  const names = new Set<string>()
  const ids = new Set<string>()
  for (const scenario of candidate.scenarios) {
    const normalized = normalizeName(scenario.name).toLocaleLowerCase('es-MX')
    if (names.has(normalized)) {
      issues.push({
        path: 'scenarios',
        message: `Nombre duplicado: ${scenario.name}.`,
      })
    }
    if (ids.has(scenario.id)) {
      issues.push({ path: 'scenarios', message: `Id duplicado: ${scenario.id}.` })
    }
    names.add(normalized)
    ids.add(scenario.id)
  }

  if (issues.length > 0) {
    return { ok: false, value: null, issues }
  }

  return success({
    storageVersion: DEVELOPER_SCENARIO_STORAGE_VERSION,
    scenarios: candidate.scenarios.map(cloneDeveloperScenario),
  })
}

function createScenarioState(partial: Partial<GameState>): GameState {
  return { ...initialGameState, ...partial }
}

export function createBuiltInDeveloperScenarios(
  sphereCapacity: number,
): DeveloperScenario[] {
  const capacity = Math.max(1, Math.floor(sphereCapacity))
  const midpoint = Math.floor(capacity / 2)
  const nearlyFull = Math.max(0, capacity - 25)
  const builtAt = 0

  const definitions: readonly [
    string,
    string,
    string,
    Partial<GameState>,
  ][] = [
    [
      'builtin-new-game',
      'Partida nueva',
      'Estado inicial sin compras ni cristalizaciones.',
      {},
    ],
    [
      'builtin-mid-first-cycle',
      'Mitad del primer ciclo',
      'Progresión inicial con producción básica y medio núcleo.',
      {
        energy: 1_500,
        manualClicks: midpoint,
        clickLevel: 2,
        generatorLevel: 2,
        resonanceLevel: 1,
      },
    ],
    [
      'builtin-nearly-full',
      'Núcleo casi lleno',
      'Escenario previo al cierre del primer núcleo.',
      {
        energy: 15_000,
        manualClicks: nearlyFull,
        clickLevel: 4,
        generatorLevel: 4,
        resonanceLevel: 2,
        pressureLevel: 2,
        cavitationLevel: 1,
        autoclickLevel: 1,
      },
    ],
    [
      'builtin-before-crystallize',
      'Antes de cristalizar',
      'Núcleo lleno con varias evoluciones activas.',
      {
        energy: 50_000,
        manualClicks: capacity,
        clickLevel: 5,
        pulseTriggerLevel: 1,
        generatorLevel: 5,
        resonanceLevel: 3,
        pressureLevel: 3,
        cavitationLevel: 2,
        autoclickLevel: 2,
        overloadLevel: 1,
      },
    ],
    [
      'builtin-p1',
      'Ciclo P1',
      'Primer ciclo posterior a una cristalización.',
      {
        energy: 8_000,
        manualClicks: Math.floor(capacity * 0.3),
        clickLevel: 3,
        generatorLevel: 3,
        resonanceLevel: 2,
        pressureLevel: 2,
        cavitationLevel: 1,
        autoclickLevel: 1,
        prestigeCount: 1,
      },
    ],
    [
      'builtin-p3',
      'Ciclo P3',
      'Progresión media con sistemas avanzados disponibles.',
      {
        energy: 250_000,
        manualClicks: Math.floor(capacity * 0.7),
        clickLevel: 8,
        pulseTriggerLevel: 2,
        generatorLevel: 8,
        resonanceLevel: 5,
        pressureLevel: 5,
        cavitationLevel: 4,
        autoclickLevel: 4,
        overloadLevel: 3,
        refractionLevel: 1,
        prestigeCount: 3,
      },
    ],
    [
      'builtin-p5',
      'Ciclo P5',
      'Escenario avanzado para probar el final de la progresión actual.',
      {
        energy: 1_000_000,
        manualClicks: capacity,
        clickLevel: 12,
        pulseTriggerLevel: 3,
        generatorLevel: 12,
        resonanceLevel: 8,
        pressureLevel: 8,
        cavitationLevel: 6,
        autoclickLevel: 6,
        overloadLevel: 5,
        refractionLevel: 3,
        prestigeCount: 5,
      },
    ],
  ]

  return definitions.map(([id, name, description, state]) => ({
    id,
    name,
    description,
    kind: 'built-in',
    createdAt: builtAt,
    updatedAt: builtAt,
    capturedAt: builtAt,
    state: createScenarioState(state),
  }))
}

export function materializeDeveloperScenarioState(
  scenario: Pick<DeveloperScenario, 'state' | 'capturedAt'>,
  now: number,
): GameState {
  const overloadRemaining = Math.max(
    0,
    scenario.state.overloadUntil - scenario.capturedAt,
  )
  const refractionRemaining = Math.max(
    0,
    scenario.state.refractionUntil - scenario.capturedAt,
  )

  return {
    ...scenario.state,
    overloadUntil: overloadRemaining > 0 ? now + overloadRemaining : 0,
    refractionUntil: refractionRemaining > 0 ? now + refractionRemaining : 0,
  }
}

export function diffDeveloperScenarioState(
  current: Readonly<GameState>,
  target: Readonly<GameState>,
): DeveloperScenarioChange[] {
  return stateFields.flatMap((field) =>
    Object.is(current[field], target[field])
      ? []
      : [{ field, from: current[field], to: target[field] }],
  )
}

export function createDeveloperScenarioRepository(
  storage: DeveloperScenarioStorage,
  dependencies: RepositoryDependencies = {},
) {
  const now = dependencies.now ?? (() => Date.now())
  const createId =
    dependencies.createId ??
    (() =>
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `scenario-${now()}-${Math.random().toString(16).slice(2)}`)

  function readCollection() {
    return parseCollection(storage.getItem(DEVELOPER_SCENARIO_STORAGE_KEY))
  }

  function writeCollection(collection: StoredDeveloperScenarioCollection) {
    storage.setItem(
      DEVELOPER_SCENARIO_STORAGE_KEY,
      JSON.stringify(collection),
    )
  }

  return {
    list(): DeveloperScenarioResult<DeveloperScenario[]> {
      const result = readCollection()
      return result.ok
        ? success(result.value.scenarios.map(cloneDeveloperScenario))
        : result
    },

    save(
      name: string,
      state: Readonly<GameState>,
      capturedAt: number,
      description = 'Snapshot capturado desde la sesión actual.',
    ): DeveloperScenarioResult<DeveloperScenario> {
      const normalizedName = normalizeName(name)
      if (
        normalizedName === '' ||
        normalizedName.length > DEVELOPER_SCENARIO_NAME_MAX_LENGTH
      ) {
        return failure(
          'name',
          `Usa un nombre de 1 a ${DEVELOPER_SCENARIO_NAME_MAX_LENGTH} caracteres.`,
        )
      }

      const stateIssues = validateDeveloperScenarioState(state)
      if (stateIssues.length > 0) {
        return { ok: false, value: null, issues: stateIssues }
      }

      if (!Number.isFinite(capturedAt) || capturedAt < 0) {
        return failure('capturedAt', 'La marca temporal no es válida.')
      }

      const collectionResult = readCollection()
      if (!collectionResult.ok) return collectionResult

      const duplicate = collectionResult.value.scenarios.some(
        (scenario) =>
          scenario.name.toLocaleLowerCase('es-MX') ===
          normalizedName.toLocaleLowerCase('es-MX'),
      )
      if (duplicate) {
        return failure('name', 'Ya existe un escenario con ese nombre.')
      }

      const timestamp = now()
      const scenario: DeveloperScenario = {
        id: createId(),
        name: normalizedName,
        description,
        kind: 'custom',
        createdAt: timestamp,
        updatedAt: timestamp,
        capturedAt,
        state: cloneDeveloperGameState(state),
      }

      const collection = {
        ...collectionResult.value,
        scenarios: [...collectionResult.value.scenarios, scenario],
      }
      writeCollection(collection)
      return success(cloneDeveloperScenario(scenario))
    },

    remove(id: string): DeveloperScenarioResult<DeveloperScenario> {
      const collectionResult = readCollection()
      if (!collectionResult.ok) return collectionResult

      const scenario = collectionResult.value.scenarios.find(
        (item) => item.id === id,
      )
      if (!scenario) {
        return failure('id', 'El escenario solicitado no existe.')
      }

      writeCollection({
        ...collectionResult.value,
        scenarios: collectionResult.value.scenarios.filter(
          (item) => item.id !== id,
        ),
      })
      return success(cloneDeveloperScenario(scenario))
    },
  }
}

export function createBrowserDeveloperScenarioRepository() {
  return createDeveloperScenarioRepository(window.localStorage)
}
