import type { GameState } from './game'
import type { DeveloperScenarioChange } from './developerScenarios'

export const DEVELOPER_EXPERIMENT_REQUEST_EVENT =
  'incremental-game-a:developer-experiment-request'

export type DeveloperExperimentSnapshot = {
  state: GameState
  clockNow: number
  paused: boolean
  experimental: boolean
  baselineAvailable: boolean
}

export type DeveloperExperimentMode =
  | 'read'
  | 'preview-scenario'
  | 'apply-scenario'
  | 'restore-baseline'
  | 'set-paused'
  | 'step'

export type DeveloperExperimentRequest = {
  mode: DeveloperExperimentMode
  state?: GameState
  capturedAt?: number
  scenarioName?: string
  paused?: boolean
  seconds?: number
  respond: (response: DeveloperExperimentResponse) => void
}

export type DeveloperExperimentResponse = {
  accepted: boolean
  snapshot: DeveloperExperimentSnapshot
  changes: DeveloperScenarioChange[]
  message: string
}

function unavailableResponse(): DeveloperExperimentResponse {
  return {
    accepted: false,
    snapshot: {
      state: {
        energy: 0,
        manualClicks: 0,
        clickLevel: 0,
        pulseTriggerLevel: 0,
        generatorLevel: 0,
        resonanceLevel: 0,
        pressureLevel: 0,
        cavitationLevel: 0,
        cavitationCharge: 0,
        autoclickLevel: 0,
        autoclickProgress: 0,
        overloadLevel: 0,
        overloadCharge: 0,
        overloadUntil: 0,
        refractionLevel: 0,
        refractionOrbitProgress: 0,
        refractionFacetsCharged: 0,
        refractionUntil: 0,
        refractionDischargeCount: 0,
        refractionLastReward: 0,
        prestigeCount: 0,
      },
      clockNow: Date.now(),
      paused: false,
      experimental: false,
      baselineAvailable: false,
    },
    changes: [],
    message: 'El juego no respondió a la solicitud del Centro DEV.',
  }
}

export function requestDeveloperExperiment(
  request: Omit<DeveloperExperimentRequest, 'respond'>,
  timeoutMs = 2_000,
): Promise<DeveloperExperimentResponse> {
  return new Promise((resolve) => {
    let settled = false
    const timeout = window.setTimeout(() => {
      if (settled) return
      settled = true
      resolve(unavailableResponse())
    }, timeoutMs)

    const respond = (response: DeveloperExperimentResponse) => {
      if (settled) return
      settled = true
      window.clearTimeout(timeout)
      resolve(response)
    }

    document.dispatchEvent(
      new CustomEvent<DeveloperExperimentRequest>(
        DEVELOPER_EXPERIMENT_REQUEST_EVENT,
        {
          detail: { ...request, respond },
        },
      ),
    )
  })
}
