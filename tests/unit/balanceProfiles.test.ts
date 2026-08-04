import { describe, expect, it } from 'vitest'
import {
  BALANCE_CONFIG_SCHEMA_VERSION,
  BALANCE_DEV_STORAGE_KEY,
  DEFAULT_BALANCE_CONFIG,
  cloneBalanceConfig,
} from '../../src/balanceConfig'
import {
  BALANCE_PROFILE_COLLECTION_STORAGE_KEY,
  BALANCE_PROFILE_COLLECTION_VERSION,
  BALANCE_PROFILE_EXPORT_VERSION,
  createBalanceProfileRepository,
  type BalanceProfileStorage,
} from '../../src/balanceProfiles'

const GAME_STORAGE_KEY = 'incremental-game-a:save:v1'

class MemoryStorage implements BalanceProfileStorage {
  readonly values = new Map<string, string>()

  getItem(key: string) {
    return this.values.get(key) ?? null
  }

  setItem(key: string, value: string) {
    this.values.set(key, value)
  }

  removeItem(key: string) {
    this.values.delete(key)
  }
}

function createHarness(storage = new MemoryStorage()) {
  let id = 0
  let time = 1_800_000_000_000
  const repository = createBalanceProfileRepository(storage, {
    now: () => time++,
    createId: () => `profile-${++id}`,
  })
  return { storage, repository }
}

function changedConfig(value = 2_000) {
  const config = cloneBalanceConfig(DEFAULT_BALANCE_CONFIG)
  config.core.sphereClickCapacity = value
  return config
}

function expectSuccess<T>(result: { ok: boolean; value: T | null }): T {
  expect(result.ok).toBe(true)
  if (!result.ok) throw new Error('Resultado inesperadamente inválido')
  return result.value
}

describe('balanceProfiles', () => {
  it('guarda un perfil válido en una colección versionada', () => {
    const { storage, repository } = createHarness()

    const profile = expectSuccess(repository.save('  Núcleo rápido  ', changedConfig()))
    const raw = storage.getItem(BALANCE_PROFILE_COLLECTION_STORAGE_KEY)

    expect(profile.name).toBe('Núcleo rápido')
    expect(profile.config.core.sphereClickCapacity).toBe(2_000)
    expect(raw).not.toBeNull()
    expect(JSON.parse(raw ?? '{}').storageVersion).toBe(
      BALANCE_PROFILE_COLLECTION_VERSION,
    )
  })

  it('recupera la lista ordenada por actualización reciente', () => {
    const { repository } = createHarness()
    expectSuccess(repository.save('Primero', changedConfig(2_000)))
    expectSuccess(repository.save('Segundo', changedConfig(3_000)))

    const profiles = expectSuccess(repository.list())

    expect(profiles.map((profile) => profile.name)).toEqual([
      'Segundo',
      'Primero',
    ])
  })

  it('recupera manualmente un perfil por identificador', () => {
    const { repository } = createHarness()
    const saved = expectSuccess(repository.save('Manual', changedConfig(1_500)))

    const loaded = expectSuccess(repository.get(saved.id))

    expect(loaded).toEqual(saved)
    expect(loaded).not.toBe(saved)
    expect(loaded.config).not.toBe(saved.config)
  })

  it('reemplaza un perfil conservando identidad y fecha de creación', () => {
    const { repository } = createHarness()
    const saved = expectSuccess(repository.save('Reemplazable', changedConfig(2_000)))

    const replaced = expectSuccess(
      repository.replace(saved.id, 'Reemplazable', changedConfig(8_000)),
    )

    expect(replaced.id).toBe(saved.id)
    expect(replaced.createdAt).toBe(saved.createdAt)
    expect(replaced.updatedAt).toBeGreaterThan(saved.updatedAt)
    expect(replaced.config.core.sphereClickCapacity).toBe(8_000)
  })

  it('elimina solamente el perfil solicitado', () => {
    const { repository } = createHarness()
    const first = expectSuccess(repository.save('Primero', changedConfig(2_000)))
    expectSuccess(repository.save('Segundo', changedConfig(3_000)))

    const removed = expectSuccess(repository.remove(first.id))
    const remaining = expectSuccess(repository.list())

    expect(removed.name).toBe('Primero')
    expect(remaining.map((profile) => profile.name)).toEqual(['Segundo'])
  })

  it('impide sobrescribir silenciosamente un nombre existente', () => {
    const { repository } = createHarness()
    expectSuccess(repository.save('Seguro', changedConfig(2_000)))

    const duplicate = repository.save('seguro', changedConfig(9_000))
    const profiles = expectSuccess(repository.list())

    expect(duplicate.ok).toBe(false)
    expect(profiles).toHaveLength(1)
    expect(profiles[0].config.core.sphereClickCapacity).toBe(2_000)
  })

  it('exporta JSON portable con versiones explícitas', () => {
    const { repository } = createHarness()
    const saved = expectSuccess(repository.save('Exportable', changedConfig(2_500)))

    const json = expectSuccess(repository.exportJson(saved.id))
    const payload = JSON.parse(json)

    expect(payload.exportVersion).toBe(BALANCE_PROFILE_EXPORT_VERSION)
    expect(payload.configSchemaVersion).toBe(BALANCE_CONFIG_SCHEMA_VERSION)
    expect(payload.profile.name).toBe('Exportable')
    expect(payload.profile.config.core.sphereClickCapacity).toBe(2_500)
  })

  it('importa una exportación válida como perfil nuevo', () => {
    const source = createHarness()
    const saved = expectSuccess(
      source.repository.save('Importable', changedConfig(2_750)),
    )
    const json = expectSuccess(source.repository.exportJson(saved.id))
    const target = createHarness()

    const imported = expectSuccess(target.repository.importJson(json))

    expect(imported.name).toBe('Importable')
    expect(imported.config.core.sphereClickCapacity).toBe(2_750)
    expect(expectSuccess(target.repository.list())).toHaveLength(1)
  })

  it('rechaza JSON malformado sin crear perfiles', () => {
    const { repository } = createHarness()

    const imported = repository.importJson('{ perfil roto')

    expect(imported.ok).toBe(false)
    expect(expectSuccess(repository.list())).toEqual([])
  })

  it('rechaza valores fuera de los límites del balance', () => {
    const { repository } = createHarness()
    const invalid = changedConfig()
    invalid.core.sphereClickCapacity = 0
    const payload = {
      exportVersion: BALANCE_PROFILE_EXPORT_VERSION,
      configSchemaVersion: BALANCE_CONFIG_SCHEMA_VERSION,
      exportedAt: 1,
      profile: { name: 'Inválido', config: invalid },
    }

    const imported = repository.importJson(JSON.stringify(payload))

    expect(imported.ok).toBe(false)
    expect(expectSuccess(repository.list())).toEqual([])
  })

  it('rechaza versiones de exportación incompatibles', () => {
    const { repository } = createHarness()
    const payload = {
      exportVersion: 999,
      configSchemaVersion: BALANCE_CONFIG_SCHEMA_VERSION,
      profile: { name: 'Futuro', config: changedConfig() },
    }

    const imported = repository.importJson(JSON.stringify(payload))

    expect(imported.ok).toBe(false)
    expect(imported.issues[0]?.path).toBe('import.exportVersion')
  })

  it('rechaza versiones incompatibles del esquema de balance', () => {
    const { repository } = createHarness()
    const payload = {
      exportVersion: BALANCE_PROFILE_EXPORT_VERSION,
      configSchemaVersion: 999,
      profile: { name: 'Futuro', config: changedConfig() },
    }

    const imported = repository.importJson(JSON.stringify(payload))

    expect(imported.ok).toBe(false)
    expect(imported.issues[0]?.path).toBe('import.configSchemaVersion')
  })

  it('devuelve clones y evita mutaciones de los objetos almacenados', () => {
    const { repository } = createHarness()
    const config = changedConfig(2_000)
    const saved = expectSuccess(repository.save('Inmutable', config))

    config.core.sphereClickCapacity = 9_000
    saved.config.core.sphereClickCapacity = 7_000
    const firstRead = expectSuccess(repository.get(saved.id))
    firstRead.config.core.sphereClickCapacity = 6_000
    const secondRead = expectSuccess(repository.get(saved.id))

    expect(secondRead.config.core.sphereClickCapacity).toBe(2_000)
  })

  it('migra el perfil heredado sin borrar la clave anterior', () => {
    const storage = new MemoryStorage()
    storage.setItem(
      BALANCE_DEV_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: BALANCE_CONFIG_SCHEMA_VERSION,
        name: 'Perfil heredado',
        createdAt: 1_700_000_000_000,
        config: changedConfig(3_333),
      }),
    )
    const { repository } = createHarness(storage)

    const result = repository.list()
    const profiles = expectSuccess(result)

    expect(result.migratedLegacy).toBe(true)
    expect(profiles).toHaveLength(1)
    expect(profiles[0].name).toBe('Perfil heredado')
    expect(profiles[0].config.core.sphereClickCapacity).toBe(3_333)
    expect(storage.getItem(BALANCE_DEV_STORAGE_KEY)).not.toBeNull()
    expect(storage.getItem(BALANCE_PROFILE_COLLECTION_STORAGE_KEY)).not.toBeNull()
  })

  it('no sobrescribe una colección corrupta al intentar guardar', () => {
    const storage = new MemoryStorage()
    storage.setItem(BALANCE_PROFILE_COLLECTION_STORAGE_KEY, '{corrupta')
    const original = storage.getItem(BALANCE_PROFILE_COLLECTION_STORAGE_KEY)
    const { repository } = createHarness(storage)

    const result = repository.save('No debe guardarse', changedConfig())

    expect(result.ok).toBe(false)
    expect(storage.getItem(BALANCE_PROFILE_COLLECTION_STORAGE_KEY)).toBe(original)
  })

  it('conserva un perfil heredado corrupto sin crear una colección vacía', () => {
    const storage = new MemoryStorage()
    storage.setItem(BALANCE_DEV_STORAGE_KEY, '{heredado roto')
    const { repository } = createHarness(storage)

    const result = repository.list()

    expect(result.ok).toBe(false)
    expect(storage.getItem(BALANCE_DEV_STORAGE_KEY)).toBe('{heredado roto')
    expect(storage.getItem(BALANCE_PROFILE_COLLECTION_STORAGE_KEY)).toBeNull()
  })

  it('rechaza nombres vacíos o demasiado largos', () => {
    const { repository } = createHarness()

    expect(repository.save('   ', changedConfig()).ok).toBe(false)
    expect(repository.save('x'.repeat(81), changedConfig()).ok).toBe(false)
    expect(expectSuccess(repository.list())).toEqual([])
  })

  it('mantiene intacta la partida normal durante todas las operaciones', () => {
    const { storage, repository } = createHarness()
    const normalSave = JSON.stringify({ version: 1, state: { energy: 123 } })
    storage.setItem(GAME_STORAGE_KEY, normalSave)

    const saved = expectSuccess(repository.save('Separado', changedConfig()))
    expectSuccess(repository.replace(saved.id, saved.name, changedConfig(4_000)))
    expectSuccess(repository.exportJson(saved.id))
    expectSuccess(repository.remove(saved.id))

    expect(storage.getItem(GAME_STORAGE_KEY)).toBe(normalSave)
  })
})
