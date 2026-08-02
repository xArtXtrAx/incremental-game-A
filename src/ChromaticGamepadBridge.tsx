import { useEffect, useRef } from 'react'
import {
  getFirstConnectedGamepad,
  isButtonPressed,
  loadGamepadSettings,
  STANDARD_BUTTON,
} from './gamepad'
import {
  requestChromaticClose,
  requestChromaticOpen,
} from './chromatic'

function isChamberOpen() {
  return Boolean(document.querySelector('.chromatic-overlay'))
}

function focusElement(element: HTMLElement | null) {
  if (!element) return
  element.focus({ preventScroll: true })
  element.scrollIntoView({ block: 'nearest', inline: 'nearest' })
}

function cycleGem(direction: -1 | 1) {
  const buttons = Array.from(
    document.querySelectorAll<HTMLButtonElement>('.chromatic-gem-slot'),
  )
  if (buttons.length === 0) return

  const currentIndex = buttons.findIndex(
    (button) => button.getAttribute('aria-pressed') === 'true',
  )
  const safeIndex = currentIndex >= 0 ? currentIndex : 0
  const nextIndex =
    (safeIndex + direction + buttons.length) % buttons.length
  const next = buttons[nextIndex]
  next.click()

  // GamepadController también procesa L1/R1 para la vista histórica.
  // Reenfocamos después de su callback para mantener la Cámara al frente.
  window.setTimeout(() => focusElement(next), 24)
}

export function ChromaticGamepadBridge() {
  const previousButtons = useRef<boolean[]>([])
  const previousCombo = useRef(false)
  const animationFrame = useRef(0)
  const focusTimers = useRef<number[]>([])

  useEffect(() => {
    let controlsEnabled = loadGamepadSettings().enabled
    let lastSettingsRead = 0

    const poll = (now: number) => {
      if (now - lastSettingsRead >= 400) {
        controlsEnabled = loadGamepadSettings().enabled
        lastSettingsRead = now
      }

      const gamepad = getFirstConnectedGamepad()

      if (
        gamepad &&
        controlsEnabled &&
        document.visibilityState === 'visible'
      ) {
        const pressed = gamepad.buttons.map(isButtonPressed)
        const previous = previousButtons.current
        const justPressed = (index: number) =>
          pressed[index] && !previous[index]
        const combo = Boolean(
          pressed[STANDARD_BUTTON.leftBumper] &&
            pressed[STANDARD_BUTTON.rightBumper],
        )
        const open = isChamberOpen()

        if (combo && !previousCombo.current && !open) {
          requestChromaticOpen()
        } else if (open) {
          if (justPressed(STANDARD_BUTTON.back)) {
            requestChromaticClose()
          } else if (!combo && justPressed(STANDARD_BUTTON.leftBumper)) {
            cycleGem(-1)
          } else if (!combo && justPressed(STANDARD_BUTTON.rightBumper)) {
            cycleGem(1)
          } else if (justPressed(STANDARD_BUTTON.dpadLeft)) {
            cycleGem(-1)
          } else if (justPressed(STANDARD_BUTTON.dpadRight)) {
            cycleGem(1)
          } else if (justPressed(STANDARD_BUTTON.dpadUp)) {
            focusElement(
              document.querySelector<HTMLElement>('.chromatic-back-button'),
            )
          } else if (justPressed(STANDARD_BUTTON.dpadDown)) {
            focusElement(
              document.querySelector<HTMLElement>(
                '.chromatic-gem-slot[aria-pressed="true"]',
              ),
            )
          }
        }

        previousCombo.current = combo
        previousButtons.current = pressed
      } else {
        previousButtons.current = []
        previousCombo.current = false
      }

      animationFrame.current = window.requestAnimationFrame(poll)
    }

    animationFrame.current = window.requestAnimationFrame(poll)
    return () => {
      window.cancelAnimationFrame(animationFrame.current)
      focusTimers.current.forEach((timer) => window.clearTimeout(timer))
    }
  }, [])

  return null
}
