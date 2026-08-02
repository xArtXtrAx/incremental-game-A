import { useEffect } from 'react'
import { getFirstConnectedGamepad, loadGamepadSettings } from './gamepad'
import {
  PULSE_TRIGGER_CHARGED_EVENT,
  PULSE_TRIGGER_DEPLETED_EVENT,
  PULSE_TRIGGER_PULSE_EVENT,
} from './pulseTrigger'

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

    function playPattern(
      key: string,
      steps: HapticStep[],
      cooldown = EVENT_COOLDOWN,
    ) {
      const settings = loadGamepadSettings()
      if (!settings.enabled || !settings.hapticsEnabled) return

      const gamepad = getFirstConnectedGamepad() as GamepadWithHaptics | null
      if (!gamepad || document.visibilityState !== 'visible') return
      const actuator = getActuator(gamepad)
      if (!actuator) return

      const now = performance.now()
      if (now - (lastPlayed.get(key) ?? 0) < cooldown) return
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

    const handleTriggerPulse = () => {
      playPattern(
        'pulse-trigger-shot',
        [{ delay: 0, duration: 30, weak: 0.11, strong: 0.04 }],
        80,
      )
    }
    const handleTriggerCharged = () => {
      playPattern('pulse-trigger-charged', [
        { delay: 0, duration: 55, weak: 0.18, strong: 0.12 },
        { delay: 85, duration: 85, weak: 0.32, strong: 0.24 },
      ])
    }
    const handleTriggerDepleted = () => {
      playPattern('pulse-trigger-depleted', [
        { delay: 0, duration: 95, weak: 0.2, strong: 0.34 },
      ])
    }

    observer.observe(root, { childList: true, subtree: true })
    document.addEventListener(PULSE_TRIGGER_PULSE_EVENT, handleTriggerPulse)
    document.addEventListener(PULSE_TRIGGER_CHARGED_EVENT, handleTriggerCharged)
    document.addEventListener(PULSE_TRIGGER_DEPLETED_EVENT, handleTriggerDepleted)

    return () => {
      observer.disconnect()
      document.removeEventListener(PULSE_TRIGGER_PULSE_EVENT, handleTriggerPulse)
      document.removeEventListener(
        PULSE_TRIGGER_CHARGED_EVENT,
        handleTriggerCharged,
      )
      document.removeEventListener(
        PULSE_TRIGGER_DEPLETED_EVENT,
        handleTriggerDepleted,
      )
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [])

  return null
}
