export const GAMEPAD_SETTINGS_KEY = 'incremental-game-a:gamepad:v1'

export type GamepadSettings = {
  enabled: boolean
  hapticsEnabled: boolean
  hapticIntensity: number
  holdToPulse: boolean
  holdPulseRate: number
  deadzone: number
}

export const DEFAULT_GAMEPAD_SETTINGS: GamepadSettings = {
  enabled: true,
  hapticsEnabled: true,
  hapticIntensity: 0.7,
  holdToPulse: false,
  holdPulseRate: 6,
  deadzone: 0.55,
}

export type ControllerFamily = 'playstation' | 'xbox' | 'generic'
export type ActiveInputMode = 'gamepad' | 'mouse'

export const STANDARD_BUTTON = {
  primary: 0,
  back: 1,
  secondary: 2,
  action: 3,
  leftBumper: 4,
  rightBumper: 5,
  leftTrigger: 6,
  rightTrigger: 7,
  share: 8,
  options: 9,
  leftStick: 10,
  rightStick: 11,
  dpadUp: 12,
  dpadDown: 13,
  dpadLeft: 14,
  dpadRight: 15,
  home: 16,
  touchpad: 17,
} as const

const GAMEPAD_ACTIVITY_AXIS_THRESHOLD = 0.65
const INPUT_MODE_DATASET_KEY = 'incrementalInputMode'
const INPUT_MODE_TRACKING_FLAG = '__incrementalGameAInputModeTracking'
const MOUSE_MOVE_THRESHOLD = 2
let activeGamepadIndex: number | null = null

export function loadGamepadSettings(): GamepadSettings {
  try {
    const raw = window.localStorage.getItem(GAMEPAD_SETTINGS_KEY)
    if (!raw) return DEFAULT_GAMEPAD_SETTINGS

    const value = JSON.parse(raw) as Partial<GamepadSettings>
    return {
      enabled: value.enabled ?? DEFAULT_GAMEPAD_SETTINGS.enabled,
      hapticsEnabled:
        value.hapticsEnabled ?? DEFAULT_GAMEPAD_SETTINGS.hapticsEnabled,
      hapticIntensity: clampNumber(
        value.hapticIntensity,
        0,
        1,
        DEFAULT_GAMEPAD_SETTINGS.hapticIntensity,
      ),
      // El antiguo R2 gratuito queda desactivado. El nuevo Gatillo usa reserva.
      holdToPulse: false,
      holdPulseRate: DEFAULT_GAMEPAD_SETTINGS.holdPulseRate,
      deadzone: clampNumber(
        value.deadzone,
        0.25,
        0.9,
        DEFAULT_GAMEPAD_SETTINGS.deadzone,
      ),
    }
  } catch {
    return DEFAULT_GAMEPAD_SETTINGS
  }
}

export function saveGamepadSettings(settings: GamepadSettings) {
  try {
    window.localStorage.setItem(
      GAMEPAD_SETTINGS_KEY,
      JSON.stringify({
        ...settings,
        holdToPulse: false,
        holdPulseRate: DEFAULT_GAMEPAD_SETTINGS.holdPulseRate,
      }),
    )
  } catch {
    // El control continúa funcionando aunque el navegador bloquee localStorage.
  }
}

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

function setActiveInputMode(mode: ActiveInputMode) {
  if (typeof document === 'undefined') return
  document.documentElement.dataset[INPUT_MODE_DATASET_KEY] = mode
}

export function getActiveInputMode(): ActiveInputMode {
  if (typeof document === 'undefined') return 'gamepad'
  return document.documentElement.dataset[INPUT_MODE_DATASET_KEY] === 'mouse'
    ? 'mouse'
    : 'gamepad'
}

export function isGamepadInputActive() {
  return getActiveInputMode() === 'gamepad'
}

export function ensureInputModeTracking() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return

  const trackedWindow = window as Window & Record<string, unknown>
  if (trackedWindow[INPUT_MODE_TRACKING_FLAG]) return
  trackedWindow[INPUT_MODE_TRACKING_FLAG] = true

  if (!document.documentElement.dataset[INPUT_MODE_DATASET_KEY]) {
    setActiveInputMode('gamepad')
  }

  const handlePointerDown = (event: PointerEvent) => {
    if (event.pointerType === 'mouse') setActiveInputMode('mouse')
  }
  const handlePointerMove = (event: PointerEvent) => {
    if (
      event.pointerType === 'mouse' &&
      Math.abs(event.movementX) + Math.abs(event.movementY) >=
        MOUSE_MOVE_THRESHOLD
    ) {
      setActiveInputMode('mouse')
    }
  }
  const handleWheel = () => setActiveInputMode('mouse')

  document.addEventListener('pointerdown', handlePointerDown, true)
  document.addEventListener('pointermove', handlePointerMove, true)
  document.addEventListener('wheel', handleWheel, {
    capture: true,
    passive: true,
  })
}

export function getControllerFamily(id: string): ControllerFamily {
  const normalized = id.toLowerCase()
  if (
    normalized.includes('dualsense') ||
    normalized.includes('dualshock') ||
    normalized.includes('wireless controller') ||
    normalized.includes('054c')
  ) {
    return 'playstation'
  }

  if (
    normalized.includes('xbox') ||
    normalized.includes('xinput') ||
    normalized.includes('045e')
  ) {
    return 'xbox'
  }

  return 'generic'
}

export function getControllerLabel(id: string) {
  const family = getControllerFamily(id)
  if (family === 'playstation') return 'DualSense / PlayStation'
  if (family === 'xbox') return 'Control Xbox'
  return id.trim() || 'Control compatible'
}

export function getButtonLabels(family: ControllerFamily) {
  if (family === 'playstation') {
    return {
      primary: 'X',
      back: 'Círculo',
      secondary: 'Cuadrado',
      action: 'Triángulo',
      leftBumper: 'L1',
      rightBumper: 'R1',
      leftTrigger: 'L2',
      rightTrigger: 'R2',
      options: 'Options',
    }
  }

  if (family === 'xbox') {
    return {
      primary: 'A',
      back: 'B',
      secondary: 'X',
      action: 'Y',
      leftBumper: 'LB',
      rightBumper: 'RB',
      leftTrigger: 'LT',
      rightTrigger: 'RT',
      options: 'Menu',
    }
  }

  return {
    primary: 'Botón 1',
    back: 'Botón 2',
    secondary: 'Botón 3',
    action: 'Botón 4',
    leftBumper: 'L1',
    rightBumper: 'R1',
    leftTrigger: 'L2',
    rightTrigger: 'R2',
    options: 'Menú',
  }
}

export function isButtonPressed(button: GamepadButton | undefined) {
  return Boolean(button && (button.pressed || button.value >= 0.55))
}

export function hasGamepadActivity(gamepad: Gamepad) {
  return (
    gamepad.buttons.some(isButtonPressed) ||
    gamepad.axes.some(
      (axis) => Math.abs(axis) >= GAMEPAD_ACTIVITY_AXIS_THRESHOLD,
    )
  )
}

function getConnectedGamepads() {
  return Array.from(navigator.getGamepads()).filter(
    (gamepad): gamepad is Gamepad => Boolean(gamepad?.connected),
  )
}

/**
 * Conserva el nombre histórico para no romper consumidores existentes.
 * Selecciona el mando con actividad real y no simplemente el primer índice
 * que Chrome enumera. Esto evita quedar fijado a un dispositivo físico o
 * virtual conectado pero neutral cuando otro mando sí recibe las entradas.
 */
export function getFirstConnectedGamepad() {
  if (!('getGamepads' in navigator)) return null
  ensureInputModeTracking()

  const gamepads = getConnectedGamepads()
  if (gamepads.length === 0) {
    activeGamepadIndex = null
    return null
  }

  const selected =
    activeGamepadIndex === null
      ? null
      : gamepads.find((gamepad) => gamepad.index === activeGamepadIndex) ?? null

  if (selected && hasGamepadActivity(selected)) {
    setActiveInputMode('gamepad')
    return selected
  }

  const active = gamepads.find(hasGamepadActivity)
  if (active) {
    activeGamepadIndex = active.index
    setActiveInputMode('gamepad')
    return active
  }

  if (selected) return selected

  activeGamepadIndex = gamepads[0].index
  return gamepads[0]
}
