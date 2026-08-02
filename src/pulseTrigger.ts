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

export const PULSE_TRIGGER_CHARGE_CLICKS = 10
export const PULSE_TRIGGER_RESERVE_GAIN_MS = 1000
export const PULSE_TRIGGER_MAX_RESERVE_MS = 10_000
export const PULSE_TRIGGER_BASE_RATE = 6
export const PULSE_TRIGGER_RATE_PER_LEVEL = 0.5
export const PULSE_TRIGGER_MAX_RATE = 9
export const PULSE_TRIGGER_MAX_LEVEL = 6
export const PULSE_TRIGGER_UPGRADE_BASE_COST = 6000
export const PULSE_TRIGGER_UPGRADE_GROWTH = 2.25

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
  const safeLevel = Math.min(
    PULSE_TRIGGER_MAX_LEVEL,
    Math.max(0, Math.floor(level)),
  )
  return Math.min(
    PULSE_TRIGGER_MAX_RATE,
    PULSE_TRIGGER_BASE_RATE + safeLevel * PULSE_TRIGGER_RATE_PER_LEVEL,
  )
}

export function getPulseTriggerIntervalMs(level: number) {
  return 1000 / getPulseTriggerRate(level)
}

export function getPulseTriggerUpgradeCost(level: number) {
  const safeLevel = Math.max(0, Math.floor(level))
  return Math.ceil(
    PULSE_TRIGGER_UPGRADE_BASE_COST *
      PULSE_TRIGGER_UPGRADE_GROWTH ** safeLevel,
  )
}

export function chargePulseTriggerFromDirectClick(
  state: PulseTriggerStoredState,
): PulseTriggerChargeResult {
  if (state.reserveMs >= PULSE_TRIGGER_MAX_RESERVE_MS) {
    return { state, charged: false }
  }

  const nextCharge = state.chargeClicks + 1
  if (nextCharge < PULSE_TRIGGER_CHARGE_CLICKS) {
    return {
      state: { ...state, chargeClicks: nextCharge },
      charged: false,
    }
  }

  return {
    state: {
      reserveMs: Math.min(
        PULSE_TRIGGER_MAX_RESERVE_MS,
        state.reserveMs + PULSE_TRIGGER_RESERVE_GAIN_MS,
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

    const value = JSON.parse(raw) as Partial<PulseTriggerStoredState>
    const reserveMs = clampNumber(
      value.reserveMs,
      0,
      PULSE_TRIGGER_MAX_RESERVE_MS,
      0,
    )
    const chargeClicks = Math.floor(
      clampNumber(
        value.chargeClicks,
        0,
        PULSE_TRIGGER_CHARGE_CLICKS - 1,
        0,
      ),
    )

    return {
      reserveMs,
      chargeClicks:
        reserveMs >= PULSE_TRIGGER_MAX_RESERVE_MS ? 0 : chargeClicks,
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
