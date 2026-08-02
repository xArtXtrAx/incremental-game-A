import { useEffect, useMemo, useRef, useState } from 'react'
import './GamepadController.css'
import {
  DEFAULT_GAMEPAD_SETTINGS,
  getButtonLabels,
  getControllerFamily,
  getControllerLabel,
  getFirstConnectedGamepad,
  isButtonPressed,
  loadGamepadSettings,
  saveGamepadSettings,
  STANDARD_BUTTON,
  type GamepadSettings,
} from './gamepad'

type HapticActuatorLike = {
  playEffect?: (
    type: string,
    parameters: {
      startDelay?: number
      duration?: number
      weakMagnitude?: number
      strongMagnitude?: number
    },
  ) => Promise<unknown>
  pulse?: (value: number, duration: number) => Promise<boolean>
}

type GamepadWithHaptics = Gamepad & {
  vibrationActuator?: HapticActuatorLike
  hapticActuators?: HapticActuatorLike[]
}

type Direction = 'up' | 'down' | 'left' | 'right'

type ConnectionState = {
  connected: boolean
  index: number
  id: string
  mapping: string
  haptics: boolean
}

const EMPTY_CONNECTION: ConnectionState = {
  connected: false,
  index: -1,
  id: '',
  mapping: '',
  haptics: false,
}

const FOCUSABLE_SELECTOR = [
  '.game-screen button:not(:disabled)',
  '.game-screen [role="button"]:not([aria-disabled="true"])',
  '.game-screen [role="tab"]:not([aria-disabled="true"])',
].join(',')

function isVisible(element: HTMLElement) {
  const rect = element.getBoundingClientRect()
  const style = window.getComputedStyle(element)
  return (
    rect.width > 0 &&
    rect.height > 0 &&
    style.display !== 'none' &&
    style.visibility !== 'hidden'
  )
}

function getFocusableElements() {
  return Array.from(document.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    .filter(isVisible)
    .filter((element) => !element.closest('.gamepad-panel'))
}

function getFocusedButton() {
  const active = document.activeElement
  return active instanceof HTMLButtonElement && !active.disabled ? active : null
}

function focusElement(element: HTMLElement | null) {
  if (!element) return
  element.focus({ preventScroll: true })
  element.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' })
}

function focusCore() {
  const coreButton = document.querySelector<HTMLElement>('.click-button')
  focusElement(coreButton)
}

function focusUpgrades() {
  const upgradeButton = document.querySelector<HTMLElement>(
    '.bulk-purchase-button:not(:disabled), .upgrade-tabs button:not(:disabled), .upgrade-button:not(:disabled)',
  )
  focusElement(upgradeButton)
}

function switchSection(section: 'core' | 'upgrades') {
  const tabs = Array.from(
    document.querySelectorAll<HTMLButtonElement>('.mobile-section-tabs button'),
  )
  const target = section === 'core' ? tabs[0] : tabs[1]
  target?.click()
  window.setTimeout(section === 'core' ? focusCore : focusUpgrades, 0)
}

function cyclePurchaseStrategy() {
  const buttons = Array.from(
    document.querySelectorAll<HTMLButtonElement>('.bulk-strategy-options button'),
  ).filter((button) => !button.disabled && isVisible(button))
  if (buttons.length === 0) return false

  const selectedIndex = buttons.findIndex(
    (button) => button.getAttribute('aria-checked') === 'true',
  )
  const next = buttons[(selectedIndex + 1 + buttons.length) % buttons.length]
  next.click()
  focusElement(next)
  return true
}

function buyEverything() {
  const button = document.querySelector<HTMLButtonElement>(
    '.bulk-purchase-button:not(:disabled)',
  )
  if (!button || !isVisible(button)) return false
  button.click()
  focusElement(button)
  return true
}

function pulseCore() {
  const button = document.querySelector<HTMLButtonElement>('.click-button:not(:disabled)')
  if (!button || !isVisible(button)) return false
  button.click()
  return true
}

function activateFocusedOrPulse() {
  const focused = getFocusedButton()
  if (focused && !focused.closest('.gamepad-panel')) {
    focused.click()
    return true
  }
  return pulseCore()
}

function findDirectionalTarget(direction: Direction) {
  const elements = getFocusableElements()
  if (elements.length === 0) return null

  const active = document.activeElement instanceof HTMLElement
    ? document.activeElement
    : null
  if (!active || !elements.includes(active)) {
    return direction === 'left' || direction === 'up'
      ? elements[elements.length - 1]
      : elements[0]
  }

  const origin = active.getBoundingClientRect()
  const originX = origin.left + origin.width / 2
  const originY = origin.top + origin.height / 2

  let best: { element: HTMLElement; score: number } | null = null
  for (const element of elements) {
    if (element === active) continue
    const rect = element.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2
    const dx = x - originX
    const dy = y - originY

    const valid =
      (direction === 'right' && dx > 8) ||
      (direction === 'left' && dx < -8) ||
      (direction === 'down' && dy > 8) ||
      (direction === 'up' && dy < -8)
    if (!valid) continue

    const primary = direction === 'left' || direction === 'right' ? Math.abs(dx) : Math.abs(dy)
    const secondary = direction === 'left' || direction === 'right' ? Math.abs(dy) : Math.abs(dx)
    const score = primary + secondary * 2.4
    if (!best || score < best.score) best = { element, score }
  }

  return best?.element ?? null
}

function navigate(direction: Direction) {
  const target = findDirectionalTarget(direction)
  focusElement(target)
  return Boolean(target)
}

function getHapticActuator(gamepad: GamepadWithHaptics) {
  return gamepad.vibrationActuator ?? gamepad.hapticActuators?.[0]
}

function hasHaptics(gamepad: Gamepad) {
  return Boolean(getHapticActuator(gamepad as GamepadWithHaptics))
}

export function GamepadController() {
  const [settings, setSettings] = useState<GamepadSettings>(loadGamepadSettings)
  const [connection, setConnection] = useState<ConnectionState>(EMPTY_CONNECTION)
  const [expanded, setExpanded] = useState(false)
  const settingsRef = useRef(settings)
  const connectionRef = useRef(connection)
  const previousButtons = useRef<boolean[]>([])
  const animationFrame = useRef(0)
  const lastNavigationAt = useRef(0)
  const lastPulseAt = useRef(0)
  const lastHapticAt = useRef(0)

  useEffect(() => {
    settingsRef.current = settings
    saveGamepadSettings(settings)
  }, [settings])

  useEffect(() => {
    connectionRef.current = connection
  }, [connection])

  const family = useMemo(
    () => getControllerFamily(connection.id),
    [connection.id],
  )
  const labels = useMemo(() => getButtonLabels(family), [family])

  function updateSettings(patch: Partial<GamepadSettings>) {
    setSettings((current) => ({ ...current, ...patch }))
  }

  function rumble(
    gamepad: Gamepad,
    duration: number,
    weakMagnitude: number,
    strongMagnitude: number,
  ) {
    const currentSettings = settingsRef.current
    if (!currentSettings.hapticsEnabled) return
    if (performance.now() - lastHapticAt.current < 45) return

    const actuator = getHapticActuator(gamepad as GamepadWithHaptics)
    if (!actuator) return
    lastHapticAt.current = performance.now()
    const intensity = currentSettings.hapticIntensity

    try {
      if (actuator.playEffect) {
        void actuator.playEffect('dual-rumble', {
          duration,
          weakMagnitude: Math.min(1, weakMagnitude * intensity),
          strongMagnitude: Math.min(1, strongMagnitude * intensity),
        })
      } else if (actuator.pulse) {
        void actuator.pulse(
          Math.min(1, Math.max(weakMagnitude, strongMagnitude) * intensity),
          duration,
        )
      }
    } catch {
      // La vibración es opcional; los controles siguen funcionando sin ella.
    }
  }

  function updateConnection(gamepad: Gamepad | null) {
    const next: ConnectionState = gamepad
      ? {
          connected: true,
          index: gamepad.index,
          id: gamepad.id,
          mapping: gamepad.mapping,
          haptics: hasHaptics(gamepad),
        }
      : EMPTY_CONNECTION

    const current = connectionRef.current
    if (
      current.connected === next.connected &&
      current.index === next.index &&
      current.id === next.id &&
      current.haptics === next.haptics
    ) {
      return
    }

    connectionRef.current = next
    setConnection(next)
    previousButtons.current = []
  }

  useEffect(() => {
    function poll(now: number) {
      const gamepad = getFirstConnectedGamepad()
      updateConnection(gamepad)

      if (gamepad && settingsRef.current.enabled && document.visibilityState === 'visible') {
        const pressed = gamepad.buttons.map(isButtonPressed)
        const previous = previousButtons.current
        const justPressed = (index: number) => pressed[index] && !previous[index]

        if (justPressed(STANDARD_BUTTON.primary)) {
          if (activateFocusedOrPulse()) rumble(gamepad, 45, 0.18, 0.08)
        }
        if (justPressed(STANDARD_BUTTON.back)) {
          switchSection('core')
          rumble(gamepad, 35, 0.12, 0.04)
        }
        if (justPressed(STANDARD_BUTTON.secondary)) {
          if (cyclePurchaseStrategy()) rumble(gamepad, 55, 0.2, 0.08)
        }
        if (justPressed(STANDARD_BUTTON.action)) {
          if (buyEverything()) rumble(gamepad, 110, 0.35, 0.22)
        }
        if (justPressed(STANDARD_BUTTON.leftBumper)) {
          switchSection('core')
          rumble(gamepad, 35, 0.12, 0.04)
        }
        if (justPressed(STANDARD_BUTTON.rightBumper)) {
          switchSection('upgrades')
          rumble(gamepad, 35, 0.12, 0.04)
        }
        if (justPressed(STANDARD_BUTTON.options)) {
          setExpanded((current) => !current)
          rumble(gamepad, 45, 0.14, 0.05)
        }

        const navigationReady = now - lastNavigationAt.current >= 190
        if (navigationReady) {
          const deadzone = settingsRef.current.deadzone
          let direction: Direction | null = null
          if (pressed[STANDARD_BUTTON.dpadUp] || (gamepad.axes[1] ?? 0) < -deadzone) direction = 'up'
          else if (pressed[STANDARD_BUTTON.dpadDown] || (gamepad.axes[1] ?? 0) > deadzone) direction = 'down'
          else if (pressed[STANDARD_BUTTON.dpadLeft] || (gamepad.axes[0] ?? 0) < -deadzone) direction = 'left'
          else if (pressed[STANDARD_BUTTON.dpadRight] || (gamepad.axes[0] ?? 0) > deadzone) direction = 'right'

          if (direction && navigate(direction)) {
            lastNavigationAt.current = now
            rumble(gamepad, 24, 0.08, 0.02)
          }
        }

        const triggerPressed =
          gamepad.buttons[STANDARD_BUTTON.rightTrigger]?.value >= 0.55 ||
          pressed[STANDARD_BUTTON.rightTrigger]
        if (settingsRef.current.holdToPulse && triggerPressed) {
          const interval = 1000 / settingsRef.current.holdPulseRate
          if (now - lastPulseAt.current >= interval && pulseCore()) {
            lastPulseAt.current = now
            if (Math.floor(now / interval) % 3 === 0) {
              rumble(gamepad, 28, 0.1, 0.04)
            }
          }
        } else {
          lastPulseAt.current = 0
        }

        previousButtons.current = pressed
      } else {
        previousButtons.current = []
      }

      animationFrame.current = window.requestAnimationFrame(poll)
    }

    const connected = () => updateConnection(getFirstConnectedGamepad())
    const disconnected = () => updateConnection(getFirstConnectedGamepad())
    window.addEventListener('gamepadconnected', connected)
    window.addEventListener('gamepaddisconnected', disconnected)
    animationFrame.current = window.requestAnimationFrame(poll)

    return () => {
      window.cancelAnimationFrame(animationFrame.current)
      window.removeEventListener('gamepadconnected', connected)
      window.removeEventListener('gamepaddisconnected', disconnected)
    }
  }, [])

  return (
    <aside
      className={`gamepad-panel${connection.connected ? ' is-connected' : ''}${expanded ? ' is-expanded' : ''}`}
      aria-label="Configuración del control"
    >
      <button
        type="button"
        className="gamepad-panel-toggle"
        aria-expanded={expanded}
        onClick={() => setExpanded((current) => !current)}
      >
        <span className="gamepad-status-dot" aria-hidden="true" />
        <span>
          <strong>{connection.connected ? 'Control conectado' : 'Control desconectado'}</strong>
          <small>
            {connection.connected
              ? getControllerLabel(connection.id)
              : 'Pulsa un botón para detectarlo'}
          </small>
        </span>
        <b aria-hidden="true">{expanded ? '−' : '+'}</b>
      </button>

      {expanded && (
        <div className="gamepad-panel-body">
          <div className="gamepad-capabilities">
            <span>Mapeo: {connection.mapping || 'sin detectar'}</span>
            <span>Vibración: {connection.haptics ? 'disponible' : 'no disponible'}</span>
          </div>

          <label className="gamepad-switch">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(event) => updateSettings({ enabled: event.target.checked })}
            />
            <span>Activar control</span>
          </label>
          <label className="gamepad-switch">
            <input
              type="checkbox"
              checked={settings.holdToPulse}
              onChange={(event) => updateSettings({ holdToPulse: event.target.checked })}
            />
            <span>Pulsación continua con {labels.rightTrigger}</span>
          </label>
          <label className="gamepad-switch">
            <input
              type="checkbox"
              checked={settings.hapticsEnabled}
              disabled={!connection.haptics}
              onChange={(event) => updateSettings({ hapticsEnabled: event.target.checked })}
            />
            <span>Vibración compatible</span>
          </label>

          <label className="gamepad-range">
            <span>Velocidad de {labels.rightTrigger}: {settings.holdPulseRate} clic/s</span>
            <input
              type="range"
              min="2"
              max="12"
              step="1"
              value={settings.holdPulseRate}
              onChange={(event) => updateSettings({ holdPulseRate: Number(event.target.value) })}
            />
          </label>
          <label className="gamepad-range">
            <span>Intensidad háptica: {Math.round(settings.hapticIntensity * 100)}%</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.hapticIntensity}
              disabled={!connection.haptics}
              onChange={(event) => updateSettings({ hapticIntensity: Number(event.target.value) })}
            />
          </label>

          <div className="gamepad-map" aria-label="Mapa de botones">
            <span><kbd>{labels.primary}</kbd> activar foco / pulsar núcleo</span>
            <span><kbd>{labels.rightTrigger}</kbd> pulsación continua</span>
            <span><kbd>{labels.secondary}</kbd> cambiar estrategia</span>
            <span><kbd>{labels.action}</kbd> comprar todo</span>
            <span><kbd>{labels.leftBumper}/{labels.rightBumper}</kbd> cambiar sección</span>
            <span><kbd>Cruceta / stick</kbd> navegar</span>
            <span><kbd>{labels.back}</kbd> volver al núcleo</span>
            <span><kbd>{labels.options}</kbd> abrir este panel</span>
          </div>

          <button
            type="button"
            className="gamepad-reset-settings"
            onClick={() => setSettings(DEFAULT_GAMEPAD_SETTINGS)}
          >
            Restaurar ajustes
          </button>
        </div>
      )}
    </aside>
  )
}
