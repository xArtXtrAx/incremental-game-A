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
  'button:not(:disabled)',
  '[role="button"]:not([aria-disabled="true"])',
  '[role="tab"]:not([aria-disabled="true"])',
  'input:not(:disabled)',
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

function getFocusableElements(root: HTMLElement) {
  return Array.from(
    root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter(isVisible)
}

function getFocusedControl() {
  const active = document.activeElement
  return active instanceof HTMLElement && isVisible(active) ? active : null
}

function getNavigationRoot(active: HTMLElement | null) {
  const panel = active?.closest<HTMLElement>('.gamepad-panel')
  if (panel) return panel

  const core = active?.closest<HTMLElement>('.core-layout-section')
  if (core) return core

  const upgrades = active?.closest<HTMLElement>('.upgrades-layout-section')
  if (upgrades) return upgrades

  const tabs = Array.from(
    document.querySelectorAll<HTMLButtonElement>('.mobile-section-tabs button'),
  )
  const activeSection = tabs[1]?.getAttribute('aria-pressed') === 'true'
    ? '.upgrades-layout-section'
    : '.core-layout-section'

  return document.querySelector<HTMLElement>(activeSection)
}

function focusElement(element: HTMLElement | null) {
  if (!element) return
  element.focus({ preventScroll: true })
  element.scrollIntoView({
    block: 'nearest',
    inline: 'nearest',
    behavior: 'smooth',
  })
}

function focusCore() {
  focusElement(document.querySelector<HTMLElement>('.click-button'))
}

function focusUpgrades() {
  focusElement(
    document.querySelector<HTMLElement>(
      '.bulk-purchase-button:not(:disabled), .upgrade-tabs button:not(:disabled), .upgrade-button:not(:disabled)',
    ),
  )
}

function focusActiveSection() {
  const upgradesActive = document.querySelector<HTMLButtonElement>(
    '.mobile-section-tabs button:nth-child(2)[aria-pressed="true"]',
  )
  if (upgradesActive) focusUpgrades()
  else focusCore()
}

function focusGamepadPanel() {
  focusElement(document.querySelector<HTMLElement>('.gamepad-panel-toggle'))
}

function isUpgradeZoneFocused() {
  return Boolean(
    getFocusedControl()?.closest<HTMLElement>('.upgrades-layout-section'),
  )
}

function isChromaticChamberOpen() {
  return Boolean(document.querySelector('.chromatic-overlay'))
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
  const keepUpgradeFocus = isUpgradeZoneFocused()
  const buttons = Array.from(
    document.querySelectorAll<HTMLButtonElement>(
      '.bulk-strategy-options button',
    ),
  ).filter((button) => !button.disabled && isVisible(button))
  if (buttons.length === 0) return false

  const selectedIndex = buttons.findIndex(
    (button) => button.getAttribute('aria-checked') === 'true',
  )
  const next = buttons[(selectedIndex + 1 + buttons.length) % buttons.length]
  next.click()
  if (keepUpgradeFocus) focusElement(next)
  return true
}

function buyEverything() {
  const keepUpgradeFocus = isUpgradeZoneFocused()
  const button = document.querySelector<HTMLButtonElement>(
    '.bulk-purchase-button:not(:disabled)',
  )
  if (!button || !isVisible(button)) return false
  button.click()
  if (keepUpgradeFocus) focusElement(button)
  return true
}

function pulseCore() {
  const button = document.querySelector<HTMLButtonElement>(
    '.click-button:not(:disabled)',
  )
  if (!button || !isVisible(button)) return false
  button.click()
  return true
}

function activateFocusedControl() {
  const focused = getFocusedControl()
  if (!focused || focused.closest('.mobile-section-tabs')) return false

  if (focused instanceof HTMLButtonElement) {
    if (focused.disabled) return false
    focused.click()
    return true
  }

  if (focused instanceof HTMLInputElement) {
    if (focused.disabled) return false
    if (
      focused.type === 'checkbox' ||
      focused.type === 'radio' ||
      focused.type === 'button' ||
      focused.type === 'submit' ||
      focused.type === 'reset'
    ) {
      focused.click()
      return true
    }
    return false
  }

  const role = focused.getAttribute('role')
  if (
    (role === 'button' || role === 'tab') &&
    focused.getAttribute('aria-disabled') !== 'true'
  ) {
    focused.click()
    return true
  }

  return false
}

function setNativeInputValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value',
  )?.set
  setter?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

function adjustFocusedRange(direction: 'left' | 'right') {
  const focused = getFocusedControl()
  if (!(focused instanceof HTMLInputElement) || focused.type !== 'range') {
    return false
  }

  const minimum = Number(focused.min || 0)
  const maximum = Number(focused.max || 100)
  const step = Number(focused.step || 1)
  const current = Number(focused.value)
  const next = Math.min(
    maximum,
    Math.max(minimum, current + (direction === 'right' ? step : -step)),
  )

  if (next === current) return false
  setNativeInputValue(focused, String(next))
  return true
}

function findDirectionalTarget(direction: Direction) {
  const active = getFocusedControl()
  const root = getNavigationRoot(active)
  if (!root) return null

  const elements = getFocusableElements(root)
  if (elements.length === 0) return null

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

    const primary =
      direction === 'left' || direction === 'right'
        ? Math.abs(dx)
        : Math.abs(dy)
    const secondary =
      direction === 'left' || direction === 'right'
        ? Math.abs(dy)
        : Math.abs(dx)
    const score = primary + secondary * 2.4
    if (!best || score < best.score) best = { element, score }
  }

  return best?.element ?? null
}

function navigate(direction: Direction) {
  if (
    (direction === 'left' || direction === 'right') &&
    adjustFocusedRange(direction)
  ) {
    return true
  }

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
  const [settings, setSettings] =
    useState<GamepadSettings>(loadGamepadSettings)
  const [connection, setConnection] =
    useState<ConnectionState>(EMPTY_CONNECTION)
  const [expanded, setExpanded] = useState(false)
  const settingsRef = useRef(settings)
  const connectionRef = useRef(connection)
  const previousButtons = useRef<boolean[]>([])
  const animationFrame = useRef(0)
  const lastNavigationAt = useRef(0)
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

  function togglePanelFromController() {
    setExpanded((current) => {
      const next = !current
      window.setTimeout(next ? focusGamepadPanel : focusActiveSection, 0)
      return next
    })
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
          Math.min(
            1,
            Math.max(weakMagnitude, strongMagnitude) * intensity,
          ),
          duration,
        )
      }
    } catch {
      // La vibración es opcional.
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

      if (
        gamepad &&
        settingsRef.current.enabled &&
        document.visibilityState === 'visible'
      ) {
        const pressed = gamepad.buttons.map(isButtonPressed)
        const previous = previousButtons.current
        const justPressed = (index: number) =>
          pressed[index] && !previous[index]

        const leftTriggerHeld = Boolean(
          pressed[STANDARD_BUTTON.leftTrigger],
        )
        const chamberOpen = isChromaticChamberOpen()
        const bothBumpersHeld = Boolean(
          pressed[STANDARD_BUTTON.leftBumper] &&
            pressed[STANDARD_BUTTON.rightBumper],
        )

        if (
          !leftTriggerHeld &&
          !chamberOpen &&
          justPressed(STANDARD_BUTTON.primary)
        ) {
          if (pulseCore()) rumble(gamepad, 45, 0.18, 0.08)
        }

        if (!chamberOpen) {
          if (leftTriggerHeld) {
            if (justPressed(STANDARD_BUTTON.action)) {
              if (cyclePurchaseStrategy()) rumble(gamepad, 55, 0.2, 0.08)
            }
            if (justPressed(STANDARD_BUTTON.secondary)) {
              if (buyEverything()) rumble(gamepad, 110, 0.35, 0.22)
            }
          } else {
            if (justPressed(STANDARD_BUTTON.secondary)) {
              if (activateFocusedControl()) rumble(gamepad, 55, 0.2, 0.08)
            }
            // Se conserva Triángulo como atajo anterior de compra global.
            if (justPressed(STANDARD_BUTTON.action)) {
              if (buyEverything()) rumble(gamepad, 110, 0.35, 0.22)
            }
          }
        }

        if (
          !chamberOpen &&
          !bothBumpersHeld &&
          justPressed(STANDARD_BUTTON.leftBumper)
        ) {
          switchSection('core')
          rumble(gamepad, 35, 0.12, 0.04)
        }
        if (
          !chamberOpen &&
          !bothBumpersHeld &&
          justPressed(STANDARD_BUTTON.rightBumper)
        ) {
          switchSection('upgrades')
          rumble(gamepad, 35, 0.12, 0.04)
        }
        if (justPressed(STANDARD_BUTTON.options)) {
          togglePanelFromController()
          rumble(gamepad, 45, 0.14, 0.05)
        }

        const navigationReady = now - lastNavigationAt.current >= 190
        if (!chamberOpen && navigationReady) {
          const deadzone = settingsRef.current.deadzone
          let direction: Direction | null = null
          if (
            pressed[STANDARD_BUTTON.dpadUp] ||
            (gamepad.axes[1] ?? 0) < -deadzone
          ) {
            direction = 'up'
          } else if (
            pressed[STANDARD_BUTTON.dpadDown] ||
            (gamepad.axes[1] ?? 0) > deadzone
          ) {
            direction = 'down'
          } else if (
            pressed[STANDARD_BUTTON.dpadLeft] ||
            (gamepad.axes[0] ?? 0) < -deadzone
          ) {
            direction = 'left'
          } else if (
            pressed[STANDARD_BUTTON.dpadRight] ||
            (gamepad.axes[0] ?? 0) > deadzone
          ) {
            direction = 'right'
          }

          if (direction && navigate(direction)) {
            lastNavigationAt.current = now
            rumble(gamepad, 24, 0.08, 0.02)
          }
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
      className={`gamepad-panel${
        connection.connected ? ' is-connected' : ''
      }${expanded ? ' is-expanded' : ''}`}
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
          <strong>
            {connection.connected
              ? 'Control conectado'
              : 'Control desconectado'}
          </strong>
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
            <span>
              Vibración:{' '}
              {connection.haptics ? 'disponible' : 'no disponible'}
            </span>
          </div>

          <label className="gamepad-switch">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(event) =>
                updateSettings({ enabled: event.target.checked })
              }
            />
            <span>Activar control</span>
          </label>
          <label className="gamepad-switch">
            <input
              type="checkbox"
              checked={settings.hapticsEnabled}
              disabled={!connection.haptics}
              onChange={(event) =>
                updateSettings({ hapticsEnabled: event.target.checked })
              }
            />
            <span>Vibración compatible</span>
          </label>

          <label className="gamepad-range">
            <span>
              Zona muerta del stick: {Math.round(settings.deadzone * 100)}%
            </span>
            <input
              type="range"
              min="0.25"
              max="0.9"
              step="0.05"
              value={settings.deadzone}
              onChange={(event) =>
                updateSettings({ deadzone: Number(event.target.value) })
              }
            />
          </label>
          <label className="gamepad-range">
            <span>
              Intensidad háptica:{' '}
              {Math.round(settings.hapticIntensity * 100)}%
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.hapticIntensity}
              disabled={!connection.haptics}
              onChange={(event) =>
                updateSettings({
                  hapticIntensity: Number(event.target.value),
                })
              }
            />
          </label>

          <div className="gamepad-map" aria-label="Mapa de botones">
            <span>
              <kbd>{labels.primary}</kbd> pulsar siempre el núcleo
            </span>
            <span>
              <kbd>{labels.secondary}</kbd> seleccionar / activar foco
            </span>
            <span>
              <kbd>{labels.rightTrigger}</kbd> Gatillo de pulso
            </span>
            <span>
              <kbd>
                {labels.leftTrigger} + {labels.action}
              </kbd>{' '}
              cambiar estrategia
            </span>
            <span>
              <kbd>
                {labels.leftTrigger} + {labels.secondary}
              </kbd>{' '}
              comprar todo
            </span>
            <span>
              <kbd>
                {labels.leftBumper}/{labels.rightBumper}
              </kbd>{' '}
              cambiar entre Núcleo y Evoluciones
            </span>
            <span>
              <kbd>Cruceta / stick</kbd> navegar solo dentro de la zona activa
            </span>
            <span>
              <kbd>{labels.options}</kbd> abrir este panel
            </span>
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
