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
  const nextIndex =
    (Math.max(0, currentIndex) + direction + buttons.length) % buttons.length
  const next = buttons[nextIndex]
  next.click()
  focusElement(next)
}

export function ChromaticGamepadBridge() {
  const previousButtons = useRef<boolean[]>([])
  const previousCombo = useRef(false)
  const animationFrame = useRef(0)

  useEffect(() => {
    const poll = () => {
      const gamepad = getFirstConnectedGamepad()
      const enabled = loadGamepadSettings().enabled

      if (
        gamepad &&
        enabled &&
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
    return () => window.cancelAnimationFrame(animationFrame.current)
  }, [])

  return null
}
