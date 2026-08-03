import {
  BALANCE_CONFIG_SCHEMA_VERSION,
  BALANCE_DEV_STORAGE_KEY,
  DEFAULT_BALANCE_CONFIG,
  cloneBalanceConfig,
  type BalanceConfig,
} from './balanceConfig'
import {
  validateBalanceConfig,
  type BalanceValidationIssue,
} from './balanceValidation'

export type BalanceRuntimeSource = 'official' | 'session' | 'stored-profile'

export type BalanceRuntimeSnapshot = {
  revision: number
  source: BalanceRuntimeSource
  config: Readonly<BalanceConfig>
}

export type StoredBalanceProfile = {
  schemaVersion: typeof BALANCE_CONFIG_SCHEMA_VERSION
  name: string
  createdAt: number
  config: BalanceConfig
}

export type BalanceApplyResult =
  | {
      applied: true
      snapshot: BalanceRuntimeSnapshot
      issues: BalanceValidationIssue[]
    }
  | {
      applied: false
      snapshot: BalanceRuntimeSnapshot
      issues: BalanceValidationIssue[]
    }

export type BalanceProfileReadResult =
  | {
      found: false
      profile: null
      issues: BalanceValidationIssue[]
    }
  | {
      found: true
      profile: StoredBalanceProfile
      issues: BalanceValidationIssue[]
    }

let snapshot: BalanceRuntimeSnapshot = {
  revision: 0,
  source: 'official',
  config: DEFAULT_BALANCE_CONFIG,
}

const listeners = new Set<() => void>()

function emitChange() {
  listeners.forEach((listener) => listener())
}

function replaceSnapshot(
  config: Readonly<BalanceConfig>,
  source: BalanceRuntimeSource,
) {
  snapshot = {
    revision: snapshot.revision + 1,
    source,
    config,
  }
  emitChange()
  return snapshot
}

function storageIssue(message: string): BalanceValidationIssue {
  return {
    path: 'storage',
    severity: 'error',
    message,
  }
}

export function getBalanceRuntimeSnapshot() {
  return snapshot
}

export function getActiveBalanceConfig() {
  return snapshot.config
}

export function subscribeBalanceRuntime(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function applySessionBalanceConfig(
  candidate: unknown,
  source: Exclude<BalanceRuntimeSource, 'official'> = 'session',
): BalanceApplyResult {
  const validation = validateBalanceConfig(candidate)

  if (!validation.valid) {
    return {
      applied: false,
      snapshot,
      issues: validation.issues,
    }
  }

  return {
    applied: true,
    snapshot: replaceSnapshot(validation.config, source),
    issues: validation.issues,
  }
}

export function resetOfficialBalanceConfig(): BalanceRuntimeSnapshot {
  return replaceSnapshot(DEFAULT_BALANCE_CONFIG, 'official')
}

export function createStoredBalanceProfile(
  name: string,
  config: Readonly<BalanceConfig> = snapshot.config,
): StoredBalanceProfile {
  return {
    schemaVersion: BALANCE_CONFIG_SCHEMA_VERSION,
    name: name.trim() || 'Perfil DEV sin nombre',
    createdAt: Date.now(),
    config: cloneBalanceConfig(config),
  }
}

export function saveStoredBalanceProfile(
  profile: StoredBalanceProfile,
): BalanceProfileReadResult {
  const validation = validateBalanceConfig(profile.config)
  if (!validation.valid) {
    return {
      found: false,
      profile: null,
      issues: validation.issues,
    }
  }

  const safeProfile: StoredBalanceProfile = {
    schemaVersion: BALANCE_CONFIG_SCHEMA_VERSION,
    name: profile.name.trim() || 'Perfil DEV sin nombre',
    createdAt:
      Number.isFinite(profile.createdAt) && profile.createdAt > 0
        ? Math.floor(profile.createdAt)
        : Date.now(),
    config: cloneBalanceConfig(validation.config),
  }

  try {
    window.localStorage.setItem(
      BALANCE_DEV_STORAGE_KEY,
      JSON.stringify(safeProfile),
    )
    return {
      found: true,
      profile: safeProfile,
      issues: validation.issues,
    }
  } catch {
    return {
      found: false,
      profile: null,
      issues: [storageIssue('No fue posible guardar el perfil DEV.')],
    }
  }
}

export function readStoredBalanceProfile(): BalanceProfileReadResult {
  try {
    const raw = window.localStorage.getItem(BALANCE_DEV_STORAGE_KEY)
    if (!raw) {
      return { found: false, profile: null, issues: [] }
    }

    const candidate = JSON.parse(raw) as Partial<StoredBalanceProfile>
    if (
      candidate.schemaVersion !== BALANCE_CONFIG_SCHEMA_VERSION ||
      typeof candidate.name !== 'string' ||
      typeof candidate.createdAt !== 'number'
    ) {
      return {
        found: false,
        profile: null,
        issues: [storageIssue('El perfil DEV usa una estructura incompatible.')],
      }
    }

    const validation = validateBalanceConfig(candidate.config)
    if (!validation.valid) {
      return {
        found: false,
        profile: null,
        issues: validation.issues,
      }
    }

    return {
      found: true,
      profile: {
        schemaVersion: BALANCE_CONFIG_SCHEMA_VERSION,
        name: candidate.name,
        createdAt: candidate.createdAt,
        config: cloneBalanceConfig(validation.config),
      },
      issues: validation.issues,
    }
  } catch {
    return {
      found: false,
      profile: null,
      issues: [storageIssue('El perfil DEV guardado no contiene JSON válido.')],
    }
  }
}

export function applyStoredBalanceProfile(): BalanceApplyResult {
  const stored = readStoredBalanceProfile()

  if (!stored.found) {
    return {
      applied: false,
      snapshot,
      issues: stored.issues,
    }
  }

  return applySessionBalanceConfig(stored.profile.config, 'stored-profile')
}

export function clearStoredBalanceProfile() {
  try {
    window.localStorage.removeItem(BALANCE_DEV_STORAGE_KEY)
    return true
  } catch {
    return false
  }
}
