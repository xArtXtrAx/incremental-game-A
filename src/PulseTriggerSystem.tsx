import {
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import './PulseTriggerSystem.css'
import { GAME_STORAGE_KEY } from './game'
import {
  getFirstConnectedGamepad,
  isButtonPressed,
  loadGamepadSettings,
  STANDARD_BUTTON,
} from './gamepad'
import {
  clearTriggerClickMarkers,
  consumeTriggerClickMarker,
  EMPTY_PULSE_TRIGGER_STATE,
  loadPulseTriggerState,
  markNextCoreClickAsTrigger,
  PULSE_TRIGGER_CHARGED_EVENT,
  PULSE_TRIGGER_CHARGE_CLICKS,
  PULSE_TRIGGER_DEPLETED_EVENT,
  PULSE_TRIGGER_INPUT_EVENT,
  PULSE_TRIGGER_INTERVAL_MS,
  PULSE_TRIGGER_MAX_RESERVE_MS,
  PULSE_TRIGGER_PULSE_EVENT,
  PULSE_TRIGGER_RATE,
  PULSE_TRIGGER_RESERVE_GAIN_MS,
  savePulseTriggerState,
  setPulseTriggerInput,
  type PulseTriggerInputDetail,
  type PulseTriggerInputSource,
  type PulseTriggerStoredState,
} from './pulseTrigger'

type TriggerStyle = CSSProperties & {
  '--trigger-reserve': string
  '--trigger-charge': string
}

type GameSnapshot = {
  energy: number
  manualClicks: number
  clickLevel: number
  generatorLevel: number
  resonanceLevel: number
  pressureLevel: number
  cavitationLevel: number
  autoclickLevel: number
  overloadLevel: number
  refractionLevel: number
  prestigeCount: number
}

function roundTriggerTime(value: number) {
  const rounded = Math.round((value + Number.EPSILON) * 10_000) / 10_000
  return rounded < 0.01 ? 0 : rounded
}

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

function readGameSnapshot(): GameSnapshot | null {
  try {
    const raw = window.localStorage.getItem(GAME_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { state?: Partial<GameSnapshot> }
    const state = parsed.state
    if (!state) return null

    return {
      energy: Number(state.energy ?? 0),
      manualClicks: Number(state.manualClicks ?? 0),
      clickLevel: Number(state.clickLevel ?? 0),
      generatorLevel: Number(state.generatorLevel ?? 0),
      resonanceLevel: Number(state.resonanceLevel ?? 0),
      pressureLevel: Number(state.pressureLevel ?? 0),
      cavitationLevel: Number(state.cavitationLevel ?? 0),
      autoclickLevel: Number(state.autoclickLevel ?? 0),
      overloadLevel: Number(state.overloadLevel ?? 0),
      refractionLevel: Number(state.refractionLevel ?? 0),
      prestigeCount: Number(state.prestigeCount ?? 0),
    }
  } catch {
    return null
  }
}

function hasRunProgress(snapshot: GameSnapshot | null) {
  if (!snapshot) return false
  return (
    snapshot.energy > 0 ||
    snapshot.manualClicks > 0 ||
    snapshot.clickLevel > 0 ||
    snapshot.generatorLevel > 0 ||
    snapshot.resonanceLevel > 0 ||
    snapshot.pressureLevel > 0 ||
    snapshot.cavitationLevel > 0 ||
    snapshot.autoclickLevel > 0 ||
    snapshot.overloadLevel > 0 ||
    snapshot.refractionLevel > 0 ||
    snapshot.prestigeCount > 0
  )
}

export function PulseTriggerSystem() {
  const [host, setHost] = useState<HTMLElement | null>(null)
  const [triggerState, setTriggerState] =
    useState<PulseTriggerStoredState>(loadPulseTriggerState)
  const [isActive, setIsActive] = useState(false)
  const stateRef = useRef(triggerState)
  const activeSources = useRef(new Set<PulseTriggerInputSource>())
  const previousGameSnapshot = useRef<GameSnapshot | null>(readGameSnapshot())
  const previousGamepadTrigger = useRef(false)

  const commitTriggerState = useCallback((next: PulseTriggerStoredState) => {
    stateRef.current = next
    setTriggerState(next)
  }, [])

  const stopAllInputs = useCallback(() => {
    activeSources.current.clear()
    clearTriggerClickMarkers()
    setIsActive(false)
  }, [])

  const resetTriggerState = useCallback(() => {
    stopAllInputs()
    commitTriggerState(EMPTY_PULSE_TRIGGER_STATE)
  }, [commitTriggerState, stopAllInputs])

  const updateInputSource = useCallback(
    (source: PulseTriggerInputSource, active: boolean) => {
      if (
        active &&
        stateRef.current.reserveMs + 0.001 >= PULSE_TRIGGER_INTERVAL_MS
      ) {
        activeSources.current.add(source)
      } else {
        activeSources.current.delete(source)
      }

      setIsActive(activeSources.current.size > 0)
    },
    [],
  )

  const chargeFromDirectClick = useCallback(() => {
    const current = stateRef.current
    if (current.reserveMs >= PULSE_TRIGGER_MAX_RESERVE_MS) return

    let reserveMs = current.reserveMs
    let chargeClicks = current.chargeClicks + 1
    let charged = false

    if (chargeClicks >= PULSE_TRIGGER_CHARGE_CLICKS) {
      reserveMs = Math.min(
        PULSE_TRIGGER_MAX_RESERVE_MS,
        reserveMs + PULSE_TRIGGER_RESERVE_GAIN_MS,
      )
      chargeClicks = 0
      charged = true
    }

    commitTriggerState({ reserveMs, chargeClicks })

    if (charged) {
      document.dispatchEvent(new Event(PULSE_TRIGGER_CHARGED_EVENT))
    }
  }, [commitTriggerState])

  const fireTriggerPulse = useCallback(() => {
    const current = stateRef.current
    if (current.reserveMs + 0.001 < PULSE_TRIGGER_INTERVAL_MS) {
      return false
    }

    const coreButton = document.querySelector<HTMLButtonElement>(
      '.click-button:not(:disabled)',
    )
    if (!coreButton || !isVisible(coreButton)) return false

    markNextCoreClickAsTrigger()
    coreButton.click()

    const reserveMs = roundTriggerTime(
      Math.max(0, current.reserveMs - PULSE_TRIGGER_INTERVAL_MS),
    )
    commitTriggerState({
      reserveMs,
      chargeClicks: current.chargeClicks,
    })
    document.dispatchEvent(new Event(PULSE_TRIGGER_PULSE_EVENT))

    if (reserveMs + 0.001 < PULSE_TRIGGER_INTERVAL_MS) {
      document.dispatchEvent(new Event(PULSE_TRIGGER_DEPLETED_EVENT))
    }

    return true
  }, [commitTriggerState])

  useEffect(() => {
    const resolveHost = () => {
      const next = document.querySelector<HTMLElement>('.core-column')
      if (next) setHost(next)
    }

    resolveHost()
    const observer = new MutationObserver(resolveHost)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(
      () => savePulseTriggerState(triggerState),
      120,
    )
    return () => window.clearTimeout(timer)
  }, [triggerState])

  useEffect(() => {
    const handleTriggerInput = (event: Event) => {
      const detail = (event as CustomEvent<PulseTriggerInputDetail>).detail
      if (!detail) return
      updateInputSource(detail.source, detail.active)
    }

    document.addEventListener(PULSE_TRIGGER_INPUT_EVENT, handleTriggerInput)
    return () =>
      document.removeEventListener(PULSE_TRIGGER_INPUT_EVENT, handleTriggerInput)
  }, [updateInputSource])

  useEffect(() => {
    let animationFrame = 0
    let controlsEnabled = loadGamepadSettings().enabled
    let lastSettingsRead = 0

    const pollGamepadTrigger = (now: number) => {
      if (now - lastSettingsRead >= 400) {
        controlsEnabled = loadGamepadSettings().enabled
        lastSettingsRead = now
      }

      const gamepad = getFirstConnectedGamepad()
      const triggerPressed = Boolean(
        controlsEnabled &&
          document.visibilityState === 'visible' &&
          gamepad &&
          (isButtonPressed(gamepad.buttons[STANDARD_BUTTON.rightTrigger]) ||
            (gamepad.buttons[STANDARD_BUTTON.rightTrigger]?.value ?? 0) >=
              0.55),
      )

      if (triggerPressed !== previousGamepadTrigger.current) {
        previousGamepadTrigger.current = triggerPressed
        setPulseTriggerInput('gamepad', triggerPressed)
      }

      animationFrame = window.requestAnimationFrame(pollGamepadTrigger)
    }

    animationFrame = window.requestAnimationFrame(pollGamepadTrigger)
    return () => {
      window.cancelAnimationFrame(animationFrame)
      previousGamepadTrigger.current = false
      setPulseTriggerInput('gamepad', false)
    }
  }, [])

  useEffect(() => {
    const handleCoreClick = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Element) || !target.closest('.click-button')) {
        return
      }

      if (consumeTriggerClickMarker()) return
      chargeFromDirectClick()
    }

    document.addEventListener('click', handleCoreClick, true)
    return () => document.removeEventListener('click', handleCoreClick, true)
  }, [chargeFromDirectClick])

  useEffect(() => {
    if (!isActive) return

    let animationFrame = 0
    let previousTime = performance.now()
    let accumulatedTime = 0

    const run = (now: number) => {
      if (document.visibilityState !== 'visible') {
        stopAllInputs()
        return
      }

      accumulatedTime += Math.min(250, Math.max(0, now - previousTime))
      previousTime = now

      while (accumulatedTime + 0.001 >= PULSE_TRIGGER_INTERVAL_MS) {
        if (!fireTriggerPulse()) {
          stopAllInputs()
          return
        }
        accumulatedTime -= PULSE_TRIGGER_INTERVAL_MS

        if (
          stateRef.current.reserveMs + 0.001 <
          PULSE_TRIGGER_INTERVAL_MS
        ) {
          stopAllInputs()
          return
        }
      }

      animationFrame = window.requestAnimationFrame(run)
    }

    animationFrame = window.requestAnimationFrame(run)
    return () => window.cancelAnimationFrame(animationFrame)
  }, [fireTriggerPulse, isActive, stopAllInputs])

  useEffect(() => {
    const stop = () => stopAllInputs()
    const handleVisibility = () => {
      if (document.visibilityState !== 'visible') stopAllInputs()
    }

    window.addEventListener('blur', stop)
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      window.removeEventListener('blur', stop)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [stopAllInputs])

  useEffect(() => {
    const timer = window.setInterval(() => {
      const current = readGameSnapshot()
      const previous = previousGameSnapshot.current

      const prestigeChanged =
        previous !== null &&
        current !== null &&
        previous.prestigeCount !== current.prestigeCount
      const saveWasCleared = previous !== null && current === null
      const fullReset =
        previous !== null &&
        current !== null &&
        hasRunProgress(previous) &&
        !hasRunProgress(current)

      if (prestigeChanged || saveWasCleared || fullReset) {
        resetTriggerState()
      }

      previousGameSnapshot.current = current
    }, 500)

    return () => window.clearInterval(timer)
  }, [resetTriggerState])

  useEffect(() => {
    if (
      triggerState.reserveMs + 0.001 < PULSE_TRIGGER_INTERVAL_MS &&
      isActive
    ) {
      stopAllInputs()
    }
  }, [isActive, stopAllInputs, triggerState.reserveMs])

  useEffect(
    () => () => {
      stopAllInputs()
      setPulseTriggerInput('pointer', false)
      setPulseTriggerInput('keyboard', false)
      setPulseTriggerInput('gamepad', false)
    },
    [stopAllInputs],
  )

  if (!host) return null

  const reservePercent =
    (triggerState.reserveMs / PULSE_TRIGGER_MAX_RESERVE_MS) * 100
  const chargePercent =
    (triggerState.chargeClicks / PULSE_TRIGGER_CHARGE_CLICKS) * 100
  const available =
    triggerState.reserveMs + 0.001 >= PULSE_TRIGGER_INTERVAL_MS
  const style: TriggerStyle = {
    '--trigger-reserve': `${reservePercent}%`,
    '--trigger-charge': `${chargePercent}%`,
  }

  const releasePointer = (pointerId: number, target: HTMLButtonElement) => {
    if (target.hasPointerCapture(pointerId)) {
      target.releasePointerCapture(pointerId)
    }
    setPulseTriggerInput('pointer', false)
  }

  return createPortal(
    <section
      className={`pulse-trigger-card${isActive ? ' is-active' : ''}${
        available ? ' is-ready' : ''
      }`}
      style={style}
      aria-label="Gatillo de pulso"
    >
      <div className="pulse-trigger-heading">
        <div>
          <span>Herramienta activa</span>
          <strong>Gatillo de pulso</strong>
        </div>
        <b>{(triggerState.reserveMs / 1000).toFixed(1)} s</b>
      </div>

      <button
        type="button"
        className="pulse-trigger-button"
        disabled={!available}
        aria-pressed={isActive}
        aria-label={`Mantener para generar ${PULSE_TRIGGER_RATE} pulsaciones por segundo. ${(
          triggerState.reserveMs / 1000
        ).toFixed(1)} segundos disponibles.`}
        onPointerDown={(event) => {
          event.preventDefault()
          event.currentTarget.setPointerCapture(event.pointerId)
          setPulseTriggerInput('pointer', true)
        }}
        onPointerUp={(event) =>
          releasePointer(event.pointerId, event.currentTarget)
        }
        onPointerCancel={(event) =>
          releasePointer(event.pointerId, event.currentTarget)
        }
        onLostPointerCapture={() => setPulseTriggerInput('pointer', false)}
        onKeyDown={(event) => {
          if (
            !event.repeat &&
            (event.key === ' ' || event.key === 'Enter')
          ) {
            event.preventDefault()
            setPulseTriggerInput('keyboard', true)
          }
        }}
        onKeyUp={(event) => {
          if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault()
            setPulseTriggerInput('keyboard', false)
          }
        }}
        onBlur={() => setPulseTriggerInput('keyboard', false)}
      >
        <span className="pulse-trigger-button-icon" aria-hidden="true">
          R2
        </span>
        <span>
          <strong>{isActive ? 'DESCARGANDO' : 'MANTENER PULSADO'}</strong>
          <small>
            {available
              ? `${PULSE_TRIGGER_RATE} pulsos/s · mouse o control`
              : 'Carga la reserva con clics directos'}
          </small>
        </span>
      </button>

      <div className="pulse-trigger-meter" aria-hidden="true">
        <span />
      </div>

      <div className="pulse-trigger-footer">
        <span>
          Siguiente segundo: {triggerState.chargeClicks}/
          {PULSE_TRIGGER_CHARGE_CLICKS}
        </span>
        <span>Máximo 10 s</span>
      </div>
      <div className="pulse-trigger-charge" aria-hidden="true">
        <span />
      </div>
    </section>,
    host,
  )
}
