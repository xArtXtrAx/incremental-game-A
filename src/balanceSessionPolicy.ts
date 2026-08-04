import { DEFAULT_BALANCE_CONFIG, type BalanceConfig } from './balanceConfig'
import {
  BALANCE_EDITABLE_PATHS,
  getBalanceDraftNumber,
  type BalanceEditablePath,
} from './balanceDraft'
import type { BalanceValidationIssue } from './balanceValidation'

export function isBalancePathApplicableToSession(path: BalanceEditablePath) {
  return BALANCE_EDITABLE_PATHS.includes(path)
}

export function getBlockedBalanceSessionPaths(
  candidate: Readonly<BalanceConfig>,
  official: Readonly<BalanceConfig> = DEFAULT_BALANCE_CONFIG,
) {
  return BALANCE_EDITABLE_PATHS.filter(
    (path) =>
      !isBalancePathApplicableToSession(path) &&
      !Object.is(
        getBalanceDraftNumber(candidate, path),
        getBalanceDraftNumber(official, path),
      ),
  )
}

export function createBlockedBalanceSessionIssues(
  candidate: Readonly<BalanceConfig>,
): BalanceValidationIssue[] {
  return getBlockedBalanceSessionPaths(candidate).map((path) => ({
    path,
    severity: 'error',
    message:
      'Este parámetro no está habilitado para aplicación en la sesión actual.',
  }))
}
