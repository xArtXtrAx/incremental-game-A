import { DEFAULT_BALANCE_CONFIG } from './balanceConfig'
import { getActiveBalanceConfig } from './balanceRuntime'

export const PULSE_TRIGGER_INPUT_EVENT =
  'incremental-game-a:pulse-trigger-input'
export const PULSE_TRIGGER_PULSE_EVENT =
  'incremental-game-a:pulse-trigger-pulse'
export const PULSE_TRIGGER_CHARGED_EVENT =
  'incremental-game-a:pulse-trigger-charged'
export const PULSE_TRIGGER_DEPLETED_EVENT =
  'incremental-game-a:pulse-trigger-depleted'
export const PULSE_TRIGGER_BUY_EVENT =
  'incremental-game-a:pulse-trigger-buy'

export const PULSE_TRIGGER_STORAGE_KEY =
  'incremental-game-a:pulse-trigger:v1'

export const PULSE_TRIGGER_CHARGE_CLICKS =
  DEFAULT_BALANCE_CONFIG.pulseTrigger.chargeClicks
export const PULSE_TRIGGER_RESERVE_GAIN_MS =
  DEFAULT_BALANCE_CONFIG.pulseTrigger.reserveGainMs
export const PULSE_TRIGGER_MAX_RESERVE_MS =
  DEFAULT_BALANCE_CONFIG.pulseTrigger.maximumReserveMs
export const PULSE_TRIGGER_BASE_RATE =
  DEFAULT_BALANCE_CONFIG.pulseTrigger.baseRate
export const PULSE_TRIGGER_RATE_PER_LEVEL =
  DEFAULT_BALANCE_CONFIG.pulseTrigger.ratePerLevel
export const PULSE_TRIGGER_MAX_RATE =
  DEFAULT_BALANCE_CONFIG.pulseTrigger.maximumRate
export const PULSE_TRIGGER_MAX_LEVEL =
  DEFAULT_BALANCE_CONFIG.pulseTrigger.maximumLevel
export const PULSE_TRIGGER_UPGRADE_BASE_COST =
  DEFAULT_BALANCE_CONFIG.costs.pulseTrigger.baseCost
export const PULSE_TRIGGER_UPGRADE_GROWTH =
  DEFAULT_BALANCE_CONFIG.costs.pulseTrigger.growth

// Alias del nivel inicial para compatibilidad con módulos anteriores.
export const PULSE_TRIGGER_RATE = PULSE_TRIGGER_BASE_RATE
export const PULSE_TRIGGER_INTERVAL_MS = 1000 / PULSE_TRIGGER_RATE

export type PulseTriggerInputSource = 'pointer' | 'keyboard' | 'gamepad'

export type PulseTriggerInputDetail = {
  source: PulseTriggerInputSource
  active: boolean
}

export type PulseTriggerStoredState = {
  reserveMs: number
  chargeClicks: number
}

export type PulseTriggerChargeResult = {
  state: PulseTriggerStoredState
  charged: boolean
}

export const EMPTY_PULSE_TRIGGER_STATE: PulseTriggerStoredState = {
  reserveMs: 0,
  chargeClicks: 0,
}

let syntheticTriggerClicks = 0

function clampNumber(
  value: unknown,
  minimum: number,
  maximum: number,
  fallback: number,
) {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(maximum, Math.max(minimum, value))
    : fallback
}

function roundTriggerTime(value: number) {
  const rounded = Math.round((value + Number.EPSILON) * 10_000) / 10_000
  return rounded < 0.01 ? 0 : rounded
}

export function getPulseTriggerRate(level: number) {
  const {
    baseRate,
    ratePerLevel,
    maximumRate,
    maximumLevel,
  } = getActiveBalanceConfig().pulseTrigger
  const safeLevel = Math.min(
    maximumLevel,
    Math.max(0, Math.floor(level)),
  )

  return Math.min(maximumRate, baseRate + safeLevel * ratePerLevel)
}

export function getPulseTriggerIntervalMs(level: number) {
  return 1000 / getPulseTriggerRate(level)
}

export function getPulseTriggerUpgradeCost(level: number) {
  const { baseCost, growth } =
    getActiveBalanceConfig().costs.pulseTrigger
  const safeLevel = Math.max(0, Math.floor(level))
  return Math.ceil(baseCost * growth ** safeLevel)
}

export function chargePulseTriggerFromDirectClick(
  state: PulseTriggerStoredState,
): PulseTriggerChargeResult {
  const { chargeClicks, maximumReserveMs, reserveGainMs } =
    getActiveBalanceConfig().pulseTrigger

  if (state.reserveMs >= maximumReserveMs) {
    return { state, charged: false }
  }

  const nextCharge = state.chargeClicks + 1
  if (nextCharge < chargeClicks) {
    return {
      state: { ...state, chargeClicks: nextCharge },
      charged: false,
    }
  }

  return {
    state: {
      reserveMs: Math.min(
        maximumReserveMs,
        state.reserveMs + reserveGainMs,
      ),
      chargeClicks: 0,
    },
    charged: true,
  }
}

export function spendPulseTriggerPulse(
  state: PulseTriggerStoredState,
  level = 0,
): PulseTriggerStoredState | null {
  const intervalMs = getPulseTriggerIntervalMs(level)

  if (state.reserveMs + 0.001 < intervalMs) {
    return null
  }

  return {
    reserveMs: roundTriggerTime(
      Math.max(0, state.reserveMs - intervalMs),
    ),
    chargeClicks: state.chargeClicks,
  }
}

export function loadPulseTriggerState(): PulseTriggerStoredState {
  try {
    const raw = window.localStorage.getItem(PULSE_TRIGGER_STORAGE_KEY)
    if (!raw) return EMPTY_PULSE_TRIGGER_STATE

    const { chargeClicks: requiredClicks, maximumReserveMs } =
      getActiveBalanceConfig().pulseTrigger
    const value = JSON.parse(raw) as Partial<PulseTriggerStoredState>
    const reserveMs = clampNumber(
      value.reserveMs,
      0,
      maximumReserveMs,
      0,
    )
    const chargeClicks = Math.floor(
      clampNumber(value.chargeClicks, 0, requiredClicks - 1, 0),
    )

    return {
      reserveMs,
      chargeClicks: reserveMs >= maximumReserveMs ? 0 : chargeClicks,
    }
  } catch {
    return EMPTY_PULSE_TRIGGER_STATE
  }
}

export function savePulseTriggerState(state: PulseTriggerStoredState) {
  try {
    window.localStorage.setItem(
      PULSE_TRIGGER_STORAGE_KEY,
      JSON.stringify(state),
    )
  } catch {
    // El Gatillo sigue funcionando aunque el navegador bloquee localStorage.
  }
}

export function setPulseTriggerInput(
  source: PulseTriggerInputSource,
  active: boolean,
) {
  document.dispatchEvent(
    new CustomEvent<PulseTriggerInputDetail>(PULSE_TRIGGER_INPUT_EVENT, {
      detail: { source, active },
    }),
  )
}

export function requestPulseTriggerUpgrade() {
  document.dispatchEvent(new Event(PULSE_TRIGGER_BUY_EVENT))
}

export function markNextCoreClickAsTrigger() {
  syntheticTriggerClicks += 1
}

export function consumeTriggerClickMarker() {
  if (syntheticTriggerClicks <= 0) return false
  syntheticTriggerClicks -= 1
  return true
}

export function clearTriggerClickMarkers() {
  syntheticTriggerClicks = 0
}
