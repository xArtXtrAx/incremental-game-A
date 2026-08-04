import { describe, expect, it } from 'vitest'
import { DEFAULT_BALANCE_CONFIG } from '../../src/balanceConfig'
import { createBalanceProfileRepository } from '../../src/balanceProfiles'
import {
  createOfficialComparativeCandidate,
  runComparativeExperiment,
} from '../../src/comparativeExperiment'
import { createBuiltInDeveloperScenarios } from '../../src/developerScenarios'
import {
  getActiveBalanceConfig,
  getBalanceRuntimeSnapshot,
  runWithBalanceConfig,
} from '../../src/balanceRuntime'
import {
  createDefaultMathematicalTemplateSpecification,
  generateBalanceConfigFromMathematicalTemplate,
} from '../../src/mathematicalTemplates'

function createMemoryStorage() {
  const values = new Map<string, string>()
  return {
    getItem(key: string) {
      return values.get(key) ?? null
    },
    setItem(key: string, value: string) {
      values.set(key, value)
    },
    removeItem(key: string) {
      values.delete(key)
    },
    snapshot() {
      return new Map(values)
    },
  }
}

function createGeneratedConfig() {
  const specification = createDefaultMathematicalTemplateSpecification(
    'cost-base-series',
    'linear',
  )
  specification.name = 'Costos lineales de integración'
  specification.template = {
    kind: 'linear',
    intercept: 100,
    slope: 100,
  }
  const generation = generateBalanceConfigFromMathematicalTemplate(specification)
  if (!generation.ok) {
    throw new Error(generation.issues.map((entry) => entry.message).join(', '))
  }
  return generation.value
}

describe('integración de plantillas matemáticas', () => {
  it('genera un BalanceConfig validado sin mutar el balance oficial', () => {
    const before = structuredClone(DEFAULT_BALANCE_CONFIG)
    const generated = createGeneratedConfig()

    expect(generated.config.costs.click.baseCost).toBe(100)
    expect(DEFAULT_BALANCE_CONFIG).toEqual(before)
  })

  it('guarda el resultado como perfil DEV sin aplicarlo al runtime', () => {
    const storage = createMemoryStorage()
    const repository = createBalanceProfileRepository(storage, {
      now: () => 1234,
      createId: () => 'template-profile',
    })
    const generated = createGeneratedConfig()
    const runtimeBefore = getBalanceRuntimeSnapshot()

    const saved = repository.save(
      generated.specification.name,
      generated.config,
    )

    expect(saved.ok).toBe(true)
    expect(saved.ok && saved.value.id).toBe('template-profile')
    expect(repository.list()).toEqual(
      expect.objectContaining({
        ok: true,
        value: [
          expect.objectContaining({
            name: 'Costos lineales de integración',
            config: expect.objectContaining({
              costs: expect.objectContaining({
                click: expect.objectContaining({ baseCost: 100 }),
              }),
            }),
          }),
        ],
      }),
    )
    expect(getBalanceRuntimeSnapshot()).toEqual(runtimeBefore)
    expect(storage.snapshot().size).toBe(1)
  })

  it('expone el override solo a consultas activas sin cambiar el snapshot visible', () => {
    const generated = createGeneratedConfig()
    const before = getBalanceRuntimeSnapshot()

    const observed = runWithBalanceConfig(generated.config, () => ({
      activeBaseCost: getActiveBalanceConfig().costs.click.baseCost,
      visibleSnapshot: getBalanceRuntimeSnapshot(),
    }))

    expect(observed.activeBaseCost).toBe(100)
    expect(observed.visibleSnapshot).toEqual(before)
    expect(getBalanceRuntimeSnapshot()).toEqual(before)
    expect(getActiveBalanceConfig().costs.click.baseCost).toBe(10)
  })

  it('produce comparaciones A/B reproducibles y conserva el runtime visible', () => {
    const generated = createGeneratedConfig()
    const scenario = createBuiltInDeveloperScenarios(
      DEFAULT_BALANCE_CONFIG.core.sphereClickCapacity,
    )[0]
    const request = {
      scenario,
      candidateA: createOfficialComparativeCandidate(),
      candidateB: {
        id: 'template:linear-costs',
        name: generated.specification.name,
        source: 'profile' as const,
        config: structuredClone(generated.config),
      },
      settings: {
        durationSeconds: 300,
        manualClicksPerSecond: 2,
        autoPurchase: true,
        autoCrystallize: false,
        stopCondition: 'duration' as const,
      },
      startedAt: 1234,
    }
    const runtimeBefore = getBalanceRuntimeSnapshot()

    const first = runComparativeExperiment(request)
    const second = runComparativeExperiment(request)

    expect(first).toEqual(second)
    expect(first.ok).toBe(true)
    expect(getBalanceRuntimeSnapshot()).toEqual(runtimeBefore)
  })
})
