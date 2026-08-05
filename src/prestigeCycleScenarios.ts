import type { DeveloperScenario } from './developerScenarios'
import { initialGameState } from './game'

export const PRESTIGE_CYCLE_START_P5_SCENARIO_ID =
  'observatory-start-prestige-5'

export function createPrestigeCycleStartP5Scenario(): DeveloperScenario {
  return {
    id: PRESTIGE_CYCLE_START_P5_SCENARIO_ID,
    name: 'Inicio de ciclo P5',
    description:
      'Estado exacto posterior a cristalizar en P5: núcleo vacío, energía cero y evoluciones reiniciadas.',
    kind: 'built-in',
    createdAt: 0,
    updatedAt: 0,
    capturedAt: 0,
    state: {
      ...initialGameState,
      prestigeCount: 5,
    },
  }
}

export function createPrestigeCycleObservatoryScenarios(
  builtInScenarios: readonly DeveloperScenario[],
  customScenarios: readonly DeveloperScenario[],
): DeveloperScenario[] {
  return [
    createPrestigeCycleStartP5Scenario(),
    ...builtInScenarios.map((scenario) => structuredClone(scenario)),
    ...customScenarios.map((scenario) => structuredClone(scenario)),
  ]
}
