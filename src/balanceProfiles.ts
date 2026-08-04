import {
  BALANCE_CONFIG_SCHEMA_VERSION,
  BALANCE_DEV_STORAGE_KEY,
  cloneBalanceConfig,
  type BalanceConfig,
} from './balanceConfig'
import {
  validateBalanceConfig,
  type BalanceValidationIssue,
} from './balanceValidation'

export const BALANCE_PROFILE_COLLECTION_STORAGE_KEY =
  'incremental-game-a:balance-dev-profiles:v2'
export const BALANCE_PROFILE_COLLECTION_VERSION = 2
export const BALANCE_PROFILE_EXPORT_VERSION = 1
export const BALANCE_PROFILE_NAME_MAX_LENGTH = 80

export type BalanceProfileStorage = Pick<
  Storage,
  'getItem' | 'setItem' | 'removeItem'
>

export type BalanceDevProfile = {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  config: BalanceConfig
}

export type BalanceProfileCollection = {
  storageVersion: typeof BALANCE_PROFILE_COLLECTION_VERSION
  profiles: BalanceDevProfile[]
}

export type BalanceProfileExport = {
  exportVersion: typeof BALANCE_PROFILE_EXPORT_VERSION
  configSchemaVersion: typeof BALANCE_CONFIG_SCHEMA_VERSION
  exportedAt: number
  profile: {
    name: string
    config: BalanceConfig
  }
}

type LegacyStoredBalanceProfile = {
  schemaVersion: typeof BALANCE_CONFIG_SCHEMA_VERSION
  name: string
  createdAt: number
  config: BalanceConfig
}

export type BalanceProfileResult<T> =
  | {
      ok: true
      value: T
      issues: BalanceValidationIssue[]
      migratedLegacy: boolean
    }
  | {
      ok: false
      value: null
      issues: BalanceValidationIssue[]
      migratedLegacy: boolean
    }

export type BalanceProfileRepositoryOptions = {
  now?: () => number
  createId?: () => string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function issue(path: string, message: string): BalanceValidationIssue {
  return { path, severity: 'error', message }
}

function cloneProfile(profile: Readonly<BalanceDevProfile>): BalanceDevProfile {
  return {
    id: profile.id,
    name: profile.name,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
    config: cloneBalanceConfig(profile.config),
  }
}

function cloneCollection(
  collection: Readonly<BalanceProfileCollection>,
): BalanceProfileCollection {
  return {
    storageVersion: BALANCE_PROFILE_COLLECTION_VERSION,
    profiles: collection.profiles.map(cloneProfile),
  }
}

function normalizeName(name: unknown) {
  if (typeof name !== 'string') return null
  const normalized = name.trim().replace(/\s+/g, ' ')
  if (!normalized || normalized.length > BALANCE_PROFILE_NAME_MAX_LENGTH) {
    return null
  }
  return normalized
}

function normalizeTimestamp(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
    ? Math.floor(value)
    : fallback
}

function validateProfileCandidate(
  candidate: unknown,
  fallbackNow: number,
): BalanceProfileResult<BalanceDevProfile> {
  if (!isRecord(candidate)) {
    return {
      ok: false,
      value: null,
      issues: [issue('profile', 'El perfil debe ser un objeto.')],
      migratedLegacy: false,
    }
  }

  const name = normalizeName(candidate.name)
  if (!name) {
    return {
      ok: false,
      value: null,
      issues: [
        issue(
          'profile.name',
          `El nombre debe contener entre 1 y ${BALANCE_PROFILE_NAME_MAX_LENGTH} caracteres.`,
        ),
      ],
      migratedLegacy: false,
    }
  }

  if (typeof candidate.id !== 'string' || candidate.id.trim() === '') {
    return {
      ok: false,
      value: null,
      issues: [issue('profile.id', 'El identificador del perfil es inválido.')],
      migratedLegacy: false,
    }
  }

  const validation = validateBalanceConfig(candidate.config)
  if (!validation.valid) {
    return {
      ok: false,
      value: null,
      issues: validation.issues,
      migratedLegacy: false,
    }
  }

  const createdAt = normalizeTimestamp(candidate.createdAt, fallbackNow)
  const updatedAt = Math.max(
    createdAt,
    normalizeTimestamp(candidate.updatedAt, createdAt),
  )

  return {
    ok: true,
    value: {
      id: candidate.id,
      name,
      createdAt,
      updatedAt,
      config: cloneBalanceConfig(validation.config),
    },
    issues: validation.issues,
    migratedLegacy: false,
  }
}

function validateCollectionCandidate(
  candidate: unknown,
  fallbackNow: number,
): BalanceProfileResult<BalanceProfileCollection> {
  if (!isRecord(candidate)) {
    return {
      ok: false,
      value: null,
      issues: [issue('storage', 'La colección de perfiles debe ser un objeto.')],
      migratedLegacy: false,
    }
  }

  if (candidate.storageVersion !== BALANCE_PROFILE_COLLECTION_VERSION) {
    return {
      ok: false,
      value: null,
      issues: [
        issue(
          'storage.storageVersion',
          'La colección usa una versión incompatible.',
        ),
      ],
      migratedLegacy: false,
    }
  }

  if (!Array.isArray(candidate.profiles)) {
    return {
      ok: false,
      value: null,
      issues: [issue('storage.profiles', 'La colección debe incluir una lista.')],
      migratedLegacy: false,
    }
  }

  const profiles: BalanceDevProfile[] = []
  const issues: BalanceValidationIssue[] = []
  const ids = new Set<string>()
  const names = new Set<string>()

  candidate.profiles.forEach((profile, index) => {
    const result = validateProfileCandidate(profile, fallbackNow)
    if (!result.ok) {
      issues.push(
        ...result.issues.map((entry) => ({
          ...entry,
          path: `storage.profiles.${index}.${entry.path}`,
        })),
      )
      return
    }

    const normalizedName = result.value.name.toLocaleLowerCase('es-MX')
    if (ids.has(result.value.id)) {
      issues.push(
        issue(
          `storage.profiles.${index}.id`,
          'La colección contiene identificadores duplicados.',
        ),
      )
      return
    }
    if (names.has(normalizedName)) {
      issues.push(
        issue(
          `storage.profiles.${index}.name`,
          'La colección contiene nombres duplicados.',
        ),
      )
      return
    }

    ids.add(result.value.id)
    names.add(normalizedName)
    profiles.push(result.value)
  })

  if (issues.length > 0) {
    return {
      ok: false,
      value: null,
      issues,
      migratedLegacy: false,
    }
  }

  profiles.sort((left, right) => right.updatedAt - left.updatedAt)

  return {
    ok: true,
    value: {
      storageVersion: BALANCE_PROFILE_COLLECTION_VERSION,
      profiles,
    },
    issues: [],
    migratedLegacy: false,
  }
}

function validateLegacyProfile(
  candidate: unknown,
  fallbackNow: number,
  createId: () => string,
): BalanceProfileResult<BalanceDevProfile> {
  if (!isRecord(candidate)) {
    return {
      ok: false,
      value: null,
      issues: [issue('legacy', 'El perfil heredado debe ser un objeto.')],
      migratedLegacy: false,
    }
  }

  if (candidate.schemaVersion !== BALANCE_CONFIG_SCHEMA_VERSION) {
    return {
      ok: false,
      value: null,
      issues: [issue('legacy.schemaVersion', 'El perfil heredado es incompatible.')],
      migratedLegacy: false,
    }
  }

  const legacy = candidate as Partial<LegacyStoredBalanceProfile>
  const name = normalizeName(legacy.name)
  if (!name) {
    return {
      ok: false,
      value: null,
      issues: [issue('legacy.name', 'El perfil heredado no tiene un nombre válido.')],
      migratedLegacy: false,
    }
  }

  const validation = validateBalanceConfig(legacy.config)
  if (!validation.valid) {
    return {
      ok: false,
      value: null,
      issues: validation.issues,
      migratedLegacy: false,
    }
  }

  const createdAt = normalizeTimestamp(legacy.createdAt, fallbackNow)
  return {
    ok: true,
    value: {
      id: createId(),
      name,
      createdAt,
      updatedAt: createdAt,
      config: cloneBalanceConfig(validation.config),
    },
    issues: validation.issues,
    migratedLegacy: true,
  }
}

function createDefaultId() {
  const random = Math.random().toString(36).slice(2, 10)
  return `balance-${Date.now().toString(36)}-${random}`
}

export function createBalanceProfileRepository(
  storage: BalanceProfileStorage,
  options: BalanceProfileRepositoryOptions = {},
) {
  const now = options.now ?? Date.now
  const createId = options.createId ?? createDefaultId

  function writeCollection(
    collection: Readonly<BalanceProfileCollection>,
    migratedLegacy = false,
  ): BalanceProfileResult<BalanceProfileCollection> {
    const safeCollection = cloneCollection(collection)
    try {
      storage.setItem(
        BALANCE_PROFILE_COLLECTION_STORAGE_KEY,
        JSON.stringify(safeCollection),
      )
      return {
        ok: true,
        value: cloneCollection(safeCollection),
        issues: [],
        migratedLegacy,
      }
    } catch {
      return {
        ok: false,
        value: null,
        issues: [issue('storage', 'No fue posible guardar los perfiles DEV.')],
        migratedLegacy,
      }
    }
  }

  function readCollection(): BalanceProfileResult<BalanceProfileCollection> {
    let raw: string | null
    try {
      raw = storage.getItem(BALANCE_PROFILE_COLLECTION_STORAGE_KEY)
    } catch {
      return {
        ok: false,
        value: null,
        issues: [issue('storage', 'No fue posible leer los perfiles DEV.')],
        migratedLegacy: false,
      }
    }

    if (raw) {
      try {
        const validation = validateCollectionCandidate(JSON.parse(raw), now())
        return validation.ok
          ? {
              ...validation,
              value: cloneCollection(validation.value),
            }
          : validation
      } catch {
        return {
          ok: false,
          value: null,
          issues: [
            issue(
              'storage',
              'La colección guardada no contiene JSON válido. No se modificó.',
            ),
          ],
          migratedLegacy: false,
        }
      }
    }

    let legacyRaw: string | null
    try {
      legacyRaw = storage.getItem(BALANCE_DEV_STORAGE_KEY)
    } catch {
      legacyRaw = null
    }

    if (!legacyRaw) {
      return {
        ok: true,
        value: {
          storageVersion: BALANCE_PROFILE_COLLECTION_VERSION,
          profiles: [],
        },
        issues: [],
        migratedLegacy: false,
      }
    }

    try {
      const legacy = validateLegacyProfile(JSON.parse(legacyRaw), now(), createId)
      if (!legacy.ok) return legacy

      return writeCollection(
        {
          storageVersion: BALANCE_PROFILE_COLLECTION_VERSION,
          profiles: [legacy.value],
        },
        true,
      )
    } catch {
      return {
        ok: false,
        value: null,
        issues: [
          issue(
            'legacy',
            'El perfil heredado no contiene JSON válido. No se modificó.',
          ),
        ],
        migratedLegacy: false,
      }
    }
  }

  function list(): BalanceProfileResult<BalanceDevProfile[]> {
    const collection = readCollection()
    if (!collection.ok) return collection
    return {
      ok: true,
      value: collection.value.profiles.map(cloneProfile),
      issues: collection.issues,
      migratedLegacy: collection.migratedLegacy,
    }
  }

  function get(profileId: string): BalanceProfileResult<BalanceDevProfile> {
    const profiles = list()
    if (!profiles.ok) return profiles
    const profile = profiles.value.find((entry) => entry.id === profileId)
    if (!profile) {
      return {
        ok: false,
        value: null,
        issues: [issue('profile.id', 'El perfil solicitado no existe.')],
        migratedLegacy: profiles.migratedLegacy,
      }
    }
    return {
      ok: true,
      value: cloneProfile(profile),
      issues: profiles.issues,
      migratedLegacy: profiles.migratedLegacy,
    }
  }

  function save(
    nameCandidate: unknown,
    configCandidate: unknown,
  ): BalanceProfileResult<BalanceDevProfile> {
    const name = normalizeName(nameCandidate)
    if (!name) {
      return {
        ok: false,
        value: null,
        issues: [
          issue(
            'profile.name',
            `El nombre debe contener entre 1 y ${BALANCE_PROFILE_NAME_MAX_LENGTH} caracteres.`,
          ),
        ],
        migratedLegacy: false,
      }
    }

    const validation = validateBalanceConfig(configCandidate)
    if (!validation.valid) {
      return {
        ok: false,
        value: null,
        issues: validation.issues,
        migratedLegacy: false,
      }
    }

    const collection = readCollection()
    if (!collection.ok) return collection
    if (
      collection.value.profiles.some(
        (profile) =>
          profile.name.toLocaleLowerCase('es-MX') ===
          name.toLocaleLowerCase('es-MX'),
      )
    ) {
      return {
        ok: false,
        value: null,
        issues: [
          issue(
            'profile.name',
            'Ya existe un perfil con ese nombre. Usa Reemplazar para sobrescribirlo.',
          ),
        ],
        migratedLegacy: collection.migratedLegacy,
      }
    }

    const timestamp = Math.floor(now())
    const profile: BalanceDevProfile = {
      id: createId(),
      name,
      createdAt: timestamp,
      updatedAt: timestamp,
      config: cloneBalanceConfig(validation.config),
    }
    const write = writeCollection({
      storageVersion: BALANCE_PROFILE_COLLECTION_VERSION,
      profiles: [profile, ...collection.value.profiles],
    })
    if (!write.ok) return write
    return {
      ok: true,
      value: cloneProfile(profile),
      issues: validation.issues,
      migratedLegacy: collection.migratedLegacy,
    }
  }

  function replace(
    profileId: string,
    nameCandidate: unknown,
    configCandidate: unknown,
  ): BalanceProfileResult<BalanceDevProfile> {
    const name = normalizeName(nameCandidate)
    if (!name) {
      return {
        ok: false,
        value: null,
        issues: [issue('profile.name', 'El nombre del perfil es inválido.')],
        migratedLegacy: false,
      }
    }

    const validation = validateBalanceConfig(configCandidate)
    if (!validation.valid) {
      return {
        ok: false,
        value: null,
        issues: validation.issues,
        migratedLegacy: false,
      }
    }

    const collection = readCollection()
    if (!collection.ok) return collection
    const existing = collection.value.profiles.find(
      (profile) => profile.id === profileId,
    )
    if (!existing) {
      return {
        ok: false,
        value: null,
        issues: [issue('profile.id', 'El perfil que se intenta reemplazar no existe.')],
        migratedLegacy: collection.migratedLegacy,
      }
    }

    if (
      collection.value.profiles.some(
        (profile) =>
          profile.id !== profileId &&
          profile.name.toLocaleLowerCase('es-MX') ===
            name.toLocaleLowerCase('es-MX'),
      )
    ) {
      return {
        ok: false,
        value: null,
        issues: [issue('profile.name', 'Otro perfil ya usa ese nombre.')],
        migratedLegacy: collection.migratedLegacy,
      }
    }

    const updated: BalanceDevProfile = {
      id: existing.id,
      name,
      createdAt: existing.createdAt,
      updatedAt: Math.max(existing.updatedAt + 1, Math.floor(now())),
      config: cloneBalanceConfig(validation.config),
    }
    const profiles = collection.value.profiles.map((profile) =>
      profile.id === profileId ? updated : profile,
    )
    const write = writeCollection({
      storageVersion: BALANCE_PROFILE_COLLECTION_VERSION,
      profiles,
    })
    if (!write.ok) return write
    return {
      ok: true,
      value: cloneProfile(updated),
      issues: validation.issues,
      migratedLegacy: collection.migratedLegacy,
    }
  }

  function remove(profileId: string): BalanceProfileResult<BalanceDevProfile> {
    const collection = readCollection()
    if (!collection.ok) return collection
    const existing = collection.value.profiles.find(
      (profile) => profile.id === profileId,
    )
    if (!existing) {
      return {
        ok: false,
        value: null,
        issues: [issue('profile.id', 'El perfil que se intenta eliminar no existe.')],
        migratedLegacy: collection.migratedLegacy,
      }
    }

    const write = writeCollection({
      storageVersion: BALANCE_PROFILE_COLLECTION_VERSION,
      profiles: collection.value.profiles.filter(
        (profile) => profile.id !== profileId,
      ),
    })
    if (!write.ok) return write
    return {
      ok: true,
      value: cloneProfile(existing),
      issues: [],
      migratedLegacy: collection.migratedLegacy,
    }
  }

  function exportJson(profileId: string): BalanceProfileResult<string> {
    const profile = get(profileId)
    if (!profile.ok) return profile
    const payload: BalanceProfileExport = {
      exportVersion: BALANCE_PROFILE_EXPORT_VERSION,
      configSchemaVersion: BALANCE_CONFIG_SCHEMA_VERSION,
      exportedAt: Math.floor(now()),
      profile: {
        name: profile.value.name,
        config: cloneBalanceConfig(profile.value.config),
      },
    }
    return {
      ok: true,
      value: JSON.stringify(payload, null, 2),
      issues: [],
      migratedLegacy: profile.migratedLegacy,
    }
  }

  function importJson(raw: string): BalanceProfileResult<BalanceDevProfile> {
    let candidate: unknown
    try {
      candidate = JSON.parse(raw)
    } catch {
      return {
        ok: false,
        value: null,
        issues: [issue('import', 'El texto importado no contiene JSON válido.')],
        migratedLegacy: false,
      }
    }

    if (!isRecord(candidate)) {
      return {
        ok: false,
        value: null,
        issues: [issue('import', 'El archivo importado debe ser un objeto.')],
        migratedLegacy: false,
      }
    }
    if (candidate.exportVersion !== BALANCE_PROFILE_EXPORT_VERSION) {
      return {
        ok: false,
        value: null,
        issues: [issue('import.exportVersion', 'La versión de exportación es incompatible.')],
        migratedLegacy: false,
      }
    }
    if (candidate.configSchemaVersion !== BALANCE_CONFIG_SCHEMA_VERSION) {
      return {
        ok: false,
        value: null,
        issues: [issue('import.configSchemaVersion', 'La versión del balance es incompatible.')],
        migratedLegacy: false,
      }
    }
    if (!isRecord(candidate.profile)) {
      return {
        ok: false,
        value: null,
        issues: [issue('import.profile', 'El JSON no contiene un perfil válido.')],
        migratedLegacy: false,
      }
    }

    return save(candidate.profile.name, candidate.profile.config)
  }

  return {
    list,
    get,
    save,
    replace,
    remove,
    exportJson,
    importJson,
  }
}

export function createBrowserBalanceProfileRepository() {
  return createBalanceProfileRepository(window.localStorage)
}
