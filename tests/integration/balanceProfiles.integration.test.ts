import { beforeEach, describe, expect, it } from 'vitest'
import {
  BALANCE_CONFIG_SCHEMA_VERSION,
  BALANCE_DEV_STORAGE_KEY,
  DEFAULT_BALANCE_CONFIG,
  cloneBalanceConfig,
} from '../../src/balanceConfig'
import {
  createBalanceProfileRepository,
  type BalanceProfileStorage,
} from '../../src/balanceProfiles'
import {
  applySessionBalanceConfig,
  getBalanceRuntimeSnapshot,
  resetOfficialBalanceConfig,
} from '../../src/balanceRuntime'

class MemoryStorage implements BalanceProfileStorage {
  private readonly values = new Map<string, string>()

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

function createRepository(storage = new MemoryStorage()) {
  let id = 0
  return {
    storage,
    repository: createBalanceProfileRepository(storage, {
      now: () => 1_800_000_000_000 + id,
      createId: () => `integration-${++id}`,
    }),
  }
}

function configuredCapacity(capacity: number) {
  const config = cloneBalanceConfig(DEFAULT_BALANCE_CONFIG)
  config.core.sphereClickCapacity = capacity
  return config
}

function requireValue<T>(result: { ok: boolean; value: T | null }): T {
  expect(result.ok).toBe(true)
  if (!result.ok) throw new Error('Resultado inválido')
  return result.value
}

describe('perfiles DEV y runtime', () => {
  beforeEach(() => {
    resetOfficialBalanceConfig()
  })

  it('guardar un perfil no lo carga automáticamente', () => {
    const { repository } = createRepository()

    requireValue(repository.save('Persistente', configuredCapacity(2_000)))

    const snapshot = getBalanceRuntimeSnapshot()
    expect(snapshot.source).toBe('official')
    expect(snapshot.config.core.sphereClickCapacity).toBe(
      DEFAULT_BALANCE_CONFIG.core.sphereClickCapacity,
    )
  })

  it('carga manualmente un perfil guardado en el runtime', () => {
    const { repository } = createRepository()
    const saved = requireValue(
      repository.save('Manual', configuredCapacity(2_000)),
    )
    const loaded = requireValue(repository.get(saved.id))

    const applied = applySessionBalanceConfig(loaded.config, 'stored-profile')

    expect(applied.applied).toBe(true)
    expect(getBalanceRuntimeSnapshot().source).toBe('stored-profile')
    expect(getBalanceRuntimeSnapshot().config.core.sphereClickCapacity).toBe(2_000)
  })

  it('restaura el balance oficial después de cargar un perfil', () => {
    const { repository } = createRepository()
    const saved = requireValue(
      repository.save('Temporal', configuredCapacity(2_500)),
    )
    const loaded = requireValue(repository.get(saved.id))
    applySessionBalanceConfig(loaded.config, 'stored-profile')

    const restored = resetOfficialBalanceConfig()

    expect(restored.source).toBe('official')
    expect(restored.config).toBe(DEFAULT_BALANCE_CONFIG)
    expect(restored.config.core.sphereClickCapacity).toBe(5_000)
  })

  it('reemplazar un perfil no altera la sesión hasta cargarlo de nuevo', () => {
    const { repository } = createRepository()
    const saved = requireValue(
      repository.save('Reemplazo', configuredCapacity(2_000)),
    )
    applySessionBalanceConfig(saved.config, 'stored-profile')

    requireValue(
      repository.replace(saved.id, saved.name, configuredCapacity(8_000)),
    )

    expect(getBalanceRuntimeSnapshot().config.core.sphereClickCapacity).toBe(2_000)
    const updated = requireValue(repository.get(saved.id))
    applySessionBalanceConfig(updated.config, 'stored-profile')
    expect(getBalanceRuntimeSnapshot().config.core.sphereClickCapacity).toBe(8_000)
  })

  it('un perfil importado permanece inactivo hasta carga manual', () => {
    const source = createRepository()
    const saved = requireValue(
      source.repository.save('Importado', configuredCapacity(3_000)),
    )
    const exported = requireValue(source.repository.exportJson(saved.id))
    const target = createRepository()

    const imported = requireValue(target.repository.importJson(exported))

    expect(getBalanceRuntimeSnapshot().source).toBe('official')
    applySessionBalanceConfig(imported.config, 'stored-profile')
    expect(getBalanceRuntimeSnapshot().config.core.sphereClickCapacity).toBe(3_000)
  })

  it('rechazar una importación inválida conserva el runtime activo', () => {
    const { repository } = createRepository()
    applySessionBalanceConfig(configuredCapacity(2_200), 'session')

    const result = repository.importJson('{json roto')

    expect(result.ok).toBe(false)
    expect(getBalanceRuntimeSnapshot().source).toBe('session')
    expect(getBalanceRuntimeSnapshot().config.core.sphereClickCapacity).toBe(2_200)
  })

  it('migra el perfil heredado y lo mantiene inactivo', () => {
    const storage = new MemoryStorage()
    storage.setItem(
      BALANCE_DEV_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: BALANCE_CONFIG_SCHEMA_VERSION,
        name: 'Heredado',
        createdAt: 1_700_000_000_000,
        config: configuredCapacity(3_500),
      }),
    )
    const { repository } = createRepository(storage)

    const profiles = requireValue(repository.list())

    expect(profiles).toHaveLength(1)
    expect(profiles[0].config.core.sphereClickCapacity).toBe(3_500)
    expect(getBalanceRuntimeSnapshot().source).toBe('official')
  })
})
