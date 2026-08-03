import type { BalanceConfig } from './balanceConfig'
import type {
  BalanceNormalizationPreview,
} from './balanceStateNormalization'
import type {
  BalanceRuntimeSnapshot,
} from './balanceRuntime'
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
    message: 'La partida todavía no está disponible para aplicar el perfil.',
  }
}

export function requestBalanceSessionApply(
  config: Readonly<BalanceConfig>,
): BalanceSessionOutcome {
  let outcome = unavailableOutcome()

  document.dispatchEvent(
    new CustomEvent<BalanceSessionRequest>(BALANCE_SESSION_REQUEST_EVENT, {
      detail: {
        mode: 'apply',
        config,
        respond: (response) => {
          outcome = response
        },
      },
    }),
  )

  return outcome
}

export function requestOfficialBalanceRestore(): BalanceSessionOutcome {
  let outcome = unavailableOutcome()

  document.dispatchEvent(
    new CustomEvent<BalanceSessionRequest>(BALANCE_SESSION_REQUEST_EVENT, {
      detail: {
        mode: 'restore-official',
        respond: (response) => {
          outcome = response
        },
      },
    }),
  )

  return outcome
}
