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
    rightTrigger: 'R2',
    options: 'Menú',
  }
}

export function isButtonPressed(button: GamepadButton | undefined) {
  return Boolean(button && (button.pressed || button.value >= 0.55))
}

export function getFirstConnectedGamepad() {
  if (!('getGamepads' in navigator)) return null
  return (
    Array.from(navigator.getGamepads()).find(
      (gamepad): gamepad is Gamepad => Boolean(gamepad?.connected),
    ) ?? null
  )
}
