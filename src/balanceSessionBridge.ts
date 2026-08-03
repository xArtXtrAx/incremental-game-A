import type { BalanceConfig } from './balanceConfig'
import type { BalanceNormalizationPreview } from './balanceStateNormalization'
import type { BalanceRuntimeSnapshot } from './balanceRuntime'
import { createBlockedBalanceSessionIssues } from './balanceSessionPolicy'
import type { BalanceValidationIssue } from './balanceValidation'

export const BALANCE_SESSION_REQUEST_EVENT =
  'incremental-game-a:balance-session-request'

export type BalanceSessionRequestMode = 'apply' | 'restore-official'

export type BalanceSessionOutcome = {
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

export function requestBalanceSessionApply(
  config: Readonly<BalanceConfig>,
): BalanceSessionOutcome {
  const blockedIssues = createBlockedBalanceSessionIssues(config)
  if (blockedIssues.length > 0) {
    return {
      applied: false,
      snapshot: null,
      normalization: null,
      issues: blockedIssues,
      message:
        'El perfil contiene parámetros que todavía están limitados a simulación.',
    }
  }

  return dispatchBalanceSessionRequest('apply', config)
}

export function requestOfficialBalanceRestore(): BalanceSessionOutcome {
  return dispatchBalanceSessionRequest('restore-official')
}
