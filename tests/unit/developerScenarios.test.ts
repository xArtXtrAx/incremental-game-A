import { describe, expect, it } from 'vitest'
import { GAME_STORAGE_KEY, initialGameState } from '../../src/game'
import {
  DEVELOPER_SCENARIO_STORAGE_KEY,
  createBuiltInDeveloperScenarios,
  createDeveloperScenarioRepository,
  diffDeveloperScenarioState,
  materializeDeveloperScenarioState,
  validateDeveloperScenarioState,
  type DeveloperScenarioStorage,
} from '../../src/developerScenarios'

class MemoryStorage implements DeveloperScenarioStorage {
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

function requireValue<T>(result: { ok: boolean; value: T | null }): T {
  expect(result.ok).toBe(true)
  if (!result.ok || result.value === null) {
    throw new Error('Resultado inválido')
  }
  return result.value
}

describe('escenarios experimentales DEV', () => {
  it('crea siete escenarios base ajustados a la capacidad activa', () => {
    const scenarios = createBuiltInDeveloperScenarios(2_000)

    expect(scenarios).toHaveLength(7)
    expect(scenarios.map((scenario) => scenario.name)).toEqual([
      'Partida nueva',
      'Mitad del primer ciclo',
      'Núcleo casi lleno',
      'Antes de cristalizar',
      'Ciclo P1',
      'Ciclo P3',
      'Ciclo P5',
    ])
    expect(
      scenarios.find((scenario) => scenario.id === 'builtin-nearly-full')
        ?.state.manualClicks,
    ).toBe(1_975)
    expect(
      scenarios.find((scenario) => scenario.id === 'builtin-before-crystallize')
        ?.state.manualClicks,
    ).toBe(2_000)
  })

  it('guarda snapshots en una clave separada de la partida normal', () => {
    const storage = new MemoryStorage()
    storage.setItem(GAME_STORAGE_KEY, 'partida-normal-intacta')
    const repository = createDeveloperScenarioRepository(storage, {
      now: () => 1_800_000_000_000,
      createId: () => 'snapshot-1',
    })

    const saved = requireValue(
      repository.save('Prueba', initialGameState, 1_700_000_000_000),
    )

    expect(saved.id).toBe('snapshot-1')
    expect(storage.getItem(DEVELOPER_SCENARIO_STORAGE_KEY)).not.toBeNull()
    expect(storage.getItem(GAME_STORAGE_KEY)).toBe('partida-normal-intacta')
  })

  it('rechaza nombres duplicados sin sobrescribir', () => {
    const storage = new MemoryStorage()
    let id = 0
    const repository = createDeveloperScenarioRepository(storage, {
      now: () => 1_800_000_000_000 + id,
      createId: () => `snapshot-${++id}`,
    })

    requireValue(repository.save('Mismo escenario', initialGameState, 100))
    const duplicate = repository.save(
      '  mismo   escenario  ',
      { ...initialGameState, energy: 999 },
      200,
    )

    expect(duplicate.ok).toBe(false)
    expect(requireValue(repository.list())).toHaveLength(1)
    expect(requireValue(repository.list())[0].state.energy).toBe(0)
  })

  it('devuelve clones y evita mutaciones accidentales', () => {
    const storage = new MemoryStorage()
    const repository = createDeveloperScenarioRepository(storage, {
      now: () => 1_800_000_000_000,
      createId: () => 'snapshot-clone',
    })

    const saved = requireValue(
      repository.save(
        'Clonado',
        { ...initialGameState, energy: 100 },
        1_700_000_000_000,
      ),
    )
    saved.state.energy = 999
    const firstList = requireValue(repository.list())
    firstList[0].state.energy = 777

    expect(requireValue(repository.list())[0].state.energy).toBe(100)
  })

  it('bloquea escrituras cuando la colección persistente está corrupta', () => {
    const storage = new MemoryStorage()
    storage.setItem(DEVELOPER_SCENARIO_STORAGE_KEY, '{json roto')
    const repository = createDeveloperScenarioRepository(storage)

    const result = repository.save('No escribir', initialGameState, 100)

    expect(result.ok).toBe(false)
    expect(storage.getItem(DEVELOPER_SCENARIO_STORAGE_KEY)).toBe('{json roto')
  })

  it('materializa tiempos restantes en el nuevo reloj de sesión', () => {
    const capturedAt = 10_000
    const target = materializeDeveloperScenarioState(
      {
        capturedAt,
        state: {
          ...initialGameState,
          overloadUntil: capturedAt + 5_000,
          refractionUntil: capturedAt + 8_000,
        },
      },
      50_000,
    )

    expect(target.overloadUntil).toBe(55_000)
    expect(target.refractionUntil).toBe(58_000)
  })

  it('detecta únicamente los campos que cambiarían', () => {
    const changes = diffDeveloperScenarioState(initialGameState, {
      ...initialGameState,
      energy: 20,
      manualClicks: 4,
      prestigeCount: 1,
    })

    expect(changes).toEqual([
      { field: 'energy', from: 0, to: 20 },
      { field: 'manualClicks', from: 0, to: 4 },
      { field: 'prestigeCount', from: 0, to: 1 },
    ])
  })

  it('rechaza progreso fraccionario y números no finitos inválidos', () => {
    expect(
      validateDeveloperScenarioState({
        ...initialGameState,
        autoclickProgress: 1,
        energy: Number.POSITIVE_INFINITY,
      }),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'state.autoclickProgress' }),
        expect.objectContaining({ path: 'state.energy' }),
      ]),
    )
  })
})
