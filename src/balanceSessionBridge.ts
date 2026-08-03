import type { BalanceConfig } from './balanceConfig'
import type { BalanceNormalizationPreview } from './balanceStateNormalization'
import type { BalanceRuntimeSnapshot } from './balanceRuntime'
import type { BalanceValidationIssue } from './balanceValidation'

export const BALANCE_SESSION_REQUEST_EVENT =
  'incremental-game-a:balance-session-request'

export type BalanceSessionRequestMode =
  | 'preview'
  | 'apply'
  | 'restore-official'

export type BalanceSessionOutcome = {
  handled: boolean
  applied: boolean
  snapshot: BalanceRuntimeSnapshot | null
  normalization: BalanceNormalizationPreview | null
  issues: BalanceValidationIssue[]
  message: string
}

export type BalanceSessionRequest = {
  mode: BalanceSessionRequestMode
  config?: Readonly<BalanceConfig>
  respond: (outcome: BalanceSessionOutcome) => void
}

function unavailableOutcome(): BalanceSessionOutcome {
  return {
    handled: false,
    applied: false,
    snapshot: null,
    normalization: null,
    issues: [],
    message: 'La partida todavía no está disponible para procesar el perfil.',
  }
}

function dispatchBalanceSessionRequest(
  mode: BalanceSessionRequestMode,
  config?: Readonly<BalanceConfig>,
) {
  let outcome = unavailableOutcome()

  document.dispatchEvent(
    new CustomEvent<BalanceSessionRequest>(BALANCE_SESSION_REQUEST_EVENT, {
      detail: {
        mode,
        config,
        respond: (response) => {
          outcome = response
        },
      },
    }),
  )

  return outcome
}

export function requestBalanceSessionPreview(
  config: Readonly<BalanceConfig>,
): BalanceSessionOutcome {
  return dispatchBalanceSessionRequest('preview', config)
}

export function requestBalanceSessionApply(
  config: Readonly<BalanceConfig>,
): BalanceSessionOutcome {
  return dispatchBalanceSessionRequest('apply', config)
}

export function requestOfficialBalanceRestore(): BalanceSessionOutcome {
  return dispatchBalanceSessionRequest('restore-official')
}
