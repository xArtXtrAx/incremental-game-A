import {
  DEFAULT_BALANCE_CONFIG,
  type BalanceConfig,
} from './balanceConfig'
import type { GameState } from './game'

export type BalanceUnlockId =
  | 'pressure'
  | 'cavitation'
  | 'autoclick'
  | 'overload'
  | 'refraction'

export type BalanceUnlockRequirement = {
  id: BalanceUnlockId
  kind: 'clicks' | 'prestige'
  required: number
  current: number
  met: boolean
  blueprintBypass: boolean
  locked: boolean
}

function getClickRequirement(
  id: Exclude<BalanceUnlockId, 'refraction'>,
  config: Readonly<BalanceConfig>,
) {
  switch (id) {
    case 'pressure':
      return config.unlocks.pressureRequiredClicks
    case 'cavitation':
      return config.unlocks.cavitationRequiredClicks
    case 'autoclick':
      return config.unlocks.autoclickRequiredClicks
    case 'overload':
      return config.core.sphereClickCapacity
  }
}

function getOfficialClickRequirement(
  id: Exclude<BalanceUnlockId, 'refraction'>,
) {
  return getClickRequirement(id, DEFAULT_BALANCE_CONFIG)
}

export function getBalanceUnlockRequirement(
  state: Readonly<GameState>,
  id: BalanceUnlockId,
  config: Readonly<BalanceConfig>,
): BalanceUnlockRequirement {
  if (id === 'refraction') {
    const required = config.unlocks.refractionRequiredPrestige
    const current = state.prestigeCount

    return {
      id,
      kind: 'prestige',
      required,
      current,
      met: current >= required,
      blueprintBypass: false,
      locked: current < required,
    }
  }

  const required = getClickRequirement(id, config)
  const officialRequired = getOfficialClickRequirement(id)
  const current = state.manualClicks
  const met = current >= required
  const experimentalIncrease = required > officialRequired
  const blueprintBypass = state.prestigeCount > 0 && !experimentalIncrease

  return {
    id,
    kind: 'clicks',
    required,
    current,
    met,
    blueprintBypass,
    locked: !met && !blueprintBypass,
  }
}

export function isBalanceUpgradePurchaseLocked(
  state: Readonly<GameState>,
  id: BalanceUnlockId,
  config: Readonly<BalanceConfig>,
) {
  return getBalanceUnlockRequirement(state, id, config).locked
}
