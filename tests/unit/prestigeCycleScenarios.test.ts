import { describe, expect, it } from 'vitest'
import { createBuiltInDeveloperScenarios } from '../../src/developerScenarios'
import {
  PRESTIGE_CYCLE_START_P5_SCENARIO_ID,
  createPrestigeCycleObservatoryScenarios,
  createPrestigeCycleStartP5Scenario,
} from '../../src/prestigeCycleScenarios'

describe('escenarios del Observatorio de Prestigio', () => {
  it('crea un inicio P5 idéntico al estado posterior al reset', () => {
    const scenario = createPrestigeCycleStartP5Scenario()

    expect(scenario.id).toBe(PRESTIGE_CYCLE_START_P5_SCENARIO_ID)
    expect(scenario.state.prestigeCount).toBe(5)
    expect(scenario.state.energy).toBe(0)
    expect(scenario.state.manualClicks).toBe(0)
    expect(scenario.state.generatorLevel).toBe(0)
    expect(scenario.state.autoclickLevel).toBe(0)
    expect(scenario.state.refractionLevel).toBe(0)
  })

  it('coloca el inicio P5 antes de escenarios generales y personalizados', () => {
    const builtIns = createBuiltInDeveloperScenarios(5_000)
    const custom = {
      ...builtIns[0],
      id: 'custom-one',
      name: 'Personalizado',
      kind: 'custom' as const,
    }

    const scenarios = createPrestigeCycleObservatoryScenarios(builtIns, [custom])

    expect(scenarios[0].id).toBe(PRESTIGE_CYCLE_START_P5_SCENARIO_ID)
    expect(scenarios.some((scenario) => scenario.id === 'builtin-p5')).toBe(true)
    expect(scenarios.at(-1)?.id).toBe('custom-one')
  })

  it('devuelve clones para evitar mutaciones de las bibliotecas', () => {
    const builtIns = createBuiltInDeveloperScenarios(5_000)
    const scenarios = createPrestigeCycleObservatoryScenarios(builtIns, [])

    scenarios[1].state.energy = 999

    expect(builtIns[0].state.energy).toBe(0)
  })
})
