import { useEffect } from 'react'
import { getFirstConnectedGamepad, loadGamepadSettings } from './gamepad'

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

type HapticStep = {
  delay: number
  duration: number
  weak: number
  strong: number
}

const EVENT_COOLDOWN = 350

function getActuator(gamepad: GamepadWithHaptics) {
  return gamepad.vibrationActuator ?? gamepad.hapticActuators?.[0]
}

function playStep(
  actuator: HapticActuatorLike,
  intensity: number,
  step: HapticStep,
) {
  const weakMagnitude = Math.min(1, step.weak * intensity)
  const strongMagnitude = Math.min(1, step.strong * intensity)

  try {
    if (actuator.playEffect) {
      void actuator.playEffect('dual-rumble', {
        duration: step.duration,
        weakMagnitude,
        strongMagnitude,
      })
    } else if (actuator.pulse) {
      void actuator.pulse(
        Math.min(1, Math.max(weakMagnitude, strongMagnitude)),
        step.duration,
      )
    }
  } catch {
    // Los eventos visuales continúan aunque la vibración falle.
  }
}

export function GamepadEventHaptics() {
  useEffect(() => {
    const root = document.querySelector('.game-screen')
    if (!root) return

    const timers: number[] = []
    const lastPlayed = new Map<string, number>()

    function playPattern(key: string, steps: HapticStep[]) {
      const settings = loadGamepadSettings()
      if (!settings.enabled || !settings.hapticsEnabled) return

      const gamepad = getFirstConnectedGamepad() as GamepadWithHaptics | null
      if (!gamepad || document.visibilityState !== 'visible') return
      const actuator = getActuator(gamepad)
      if (!actuator) return

      const now = performance.now()
      if (now - (lastPlayed.get(key) ?? 0) < EVENT_COOLDOWN) return
      lastPlayed.set(key, now)

      for (const step of steps) {
        timers.push(
          window.setTimeout(
            () => playStep(actuator, settings.hapticIntensity, step),
            step.delay,
          ),
        )
      }
    }

    const observer = new MutationObserver((records) => {
      const text = records
        .flatMap((record) => Array.from(record.addedNodes))
        .map((node) => node.textContent ?? '')
        .join(' ')
        .toUpperCase()

      if (!text) return

      if (text.includes('DESCARGA PRISMÁTICA')) {
        playPattern('prism', [
          { delay: 0, duration: 115, weak: 0.55, strong: 0.82 },
          { delay: 145, duration: 150, weak: 0.7, strong: 1 },
        ])
      } else if (text.includes('NÚCLEO SOBRECARGADO')) {
        playPattern('overload', [
          { delay: 0, duration: 190, weak: 0.45, strong: 0.95 },
          { delay: 220, duration: 90, weak: 0.28, strong: 0.62 },
        ])
      } else if (text.includes('ZAFIRO ASCENDIDO')) {
        playPattern('prestige', [
          { delay: 0, duration: 70, weak: 0.18, strong: 0.22 },
          { delay: 110, duration: 115, weak: 0.35, strong: 0.52 },
          { delay: 270, duration: 240, weak: 0.72, strong: 1 },
        ])
      } else if (text.includes('DESCARGA +')) {
        playPattern('cavitation', [
          { delay: 0, duration: 120, weak: 0.38, strong: 0.58 },
        ])
      }
    })

    observer.observe(root, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [])

  return null
}
