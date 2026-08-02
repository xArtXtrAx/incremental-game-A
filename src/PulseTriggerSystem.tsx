import { type CSSProperties, useCallback, useEffect, useRef, useState } from 'react'
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
  chargePulseTriggerFromDirectClick,
  clearTriggerClickMarkers,
  consumeTriggerClickMarker,
  EMPTY_PULSE_TRIGGER_STATE,
  getPulseTriggerIntervalMs,
  getPulseTriggerRate,
  getPulseTriggerUpgradeCost,
  loadPulseTriggerState,
  markNextCoreClickAsTrigger,
  PULSE_TRIGGER_CHARGED_EVENT,
  PULSE_TRIGGER_CHARGE_CLICKS,
  PULSE_TRIGGER_DEPLETED_EVENT,
  PULSE_TRIGGER_INPUT_EVENT,
  PULSE_TRIGGER_MAX_LEVEL,
  PULSE_TRIGGER_MAX_RESERVE_MS,
  PULSE_TRIGGER_PULSE_EVENT,
  requestPulseTriggerUpgrade,
  savePulseTriggerState,
  spendPulseTriggerPulse,
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
  pulseTriggerLevel: number
  prestigeCount: number
  hasProgress: boolean
}

const format = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 2 })
const MOUSE_TRIGGER_EXCLUDED_SELECTOR =
  'input, textarea, select, option, [contenteditable="true"], [data-allow-selection="true"]'

function isMouseTriggerTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false
  if (!target.closest('.game-panel')) return false
  return !target.closest(MOUSE_TRIGGER_EXCLUDED_SELECTOR)
}

function readGameSnapshot(): GameSnapshot | null {
  try {
    const raw = window.localStorage.getItem(GAME_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { state?: Record<string, unknown> }
    const state = parsed.state
    if (!state) return null

    return {
      energy: Number(state.energy ?? 0),
      pulseTriggerLevel: Number(state.pulseTriggerLevel ?? 0),
      prestigeCount: Number(state.prestigeCount ?? 0),
      hasProgress: Object.entries(state).some(
        ([key, value]) =>
          key !== 'prestigeCount' && typeof value === 'number' && value > 0,
      ),
    }
  } catch {
    return null
  }
}

function sameSnapshot(a: GameSnapshot | null, b: GameSnapshot | null) {
  return (
    a?.energy === b?.energy &&
    a?.pulseTriggerLevel === b?.pulseTriggerLevel &&
    a?.prestigeCount === b?.prestigeCount &&
    a?.hasProgress === b?.hasProgress
  )
}

export function PulseTriggerSystem() {
  const initialSnapshot = readGameSnapshot()
  const [host, setHost] = useState<HTMLElement | null>(null)
  const [snapshot, setSnapshot] = useState<GameSnapshot | null>(initialSnapshot)
  const [triggerState, setTriggerState] =
    useState<PulseTriggerStoredState>(loadPulseTriggerState)
  const [isActive, setIsActive] = useState(false)
  const snapshotRef = useRef(initialSnapshot)
  const stateRef = useRef(triggerState)
  const previousSnapshot = useRef(initialSnapshot)
  const activeSources = useRef(new Set<PulseTriggerInputSource>())
  const previousR2 = useRef(false)
  const rightMouseHeld = useRef(false)

  const commitState = useCallback((next: PulseTriggerStoredState) => {
    stateRef.current = next
    setTriggerState(next)
  }, [])

  const stopAll = useCallback(() => {
    rightMouseHeld.current = false
    activeSources.current.clear()
    clearTriggerClickMarkers()
    setIsActive(false)
  }, [])

  const resetTrigger = useCallback(() => {
    stopAll()
    commitState(EMPTY_PULSE_TRIGGER_STATE)
  }, [commitState, stopAll])

  const updateSource = useCallback(
    (source: PulseTriggerInputSource, active: boolean) => {
      const interval = getPulseTriggerIntervalMs(
        snapshotRef.current?.pulseTriggerLevel ?? 0,
      )
      if (active && stateRef.current.reserveMs + 0.001 >= interval) {
        activeSources.current.add(source)
      } else {
        activeSources.current.delete(source)
      }
      setIsActive(activeSources.current.size > 0)
    },
    [],
  )

  const firePulse = useCallback(() => {
    const level = snapshotRef.current?.pulseTriggerLevel ?? 0
    const next = spendPulseTriggerPulse(stateRef.current, level)
    const button = document.querySelector<HTMLButtonElement>(
      '.click-button:not(:disabled)',
    )
    if (!next || !button) return false

    markNextCoreClickAsTrigger()
    button.click()
    commitState(next)
    document.dispatchEvent(new Event(PULSE_TRIGGER_PULSE_EVENT))

    if (next.reserveMs + 0.001 < getPulseTriggerIntervalMs(level)) {
      document.dispatchEvent(new Event(PULSE_TRIGGER_DEPLETED_EVENT))
    }
    return true
  }, [commitState])

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
    const timer = window.setTimeout(() => savePulseTriggerState(triggerState), 120)
    return () => window.clearTimeout(timer)
  }, [triggerState])

  useEffect(() => {
    const handleInput = (event: Event) => {
      const detail = (event as CustomEvent<PulseTriggerInputDetail>).detail
      if (detail) updateSource(detail.source, detail.active)
    }
    document.addEventListener(PULSE_TRIGGER_INPUT_EVENT, handleInput)
    return () => document.removeEventListener(PULSE_TRIGGER_INPUT_EVENT, handleInput)
  }, [updateSource])

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (event.button !== 2 || !isMouseTriggerTarget(event.target)) return
      event.preventDefault()
      rightMouseHeld.current = true
      setPulseTriggerInput('pointer', true)
    }

    const handleMouseUp = (event: MouseEvent) => {
      if (event.button !== 2 || !rightMouseHeld.current) return
      rightMouseHeld.current = false
      setPulseTriggerInput('pointer', false)
    }

    const handleContextMenu = (event: MouseEvent) => {
      if (rightMouseHeld.current || isMouseTriggerTarget(event.target)) {
        event.preventDefault()
      }
    }

    document.addEventListener('mousedown', handleMouseDown, true)
    window.addEventListener('mouseup', handleMouseUp, true)
    document.addEventListener('contextmenu', handleContextMenu, true)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown, true)
      window.removeEventListener('mouseup', handleMouseUp, true)
      document.removeEventListener('contextmenu', handleContextMenu, true)
      rightMouseHeld.current = false
      setPulseTriggerInput('pointer', false)
    }
  }, [])

  useEffect(() => {
    const handleCoreClick = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Element) || !target.closest('.click-button')) return
      if (consumeTriggerClickMarker()) return

      const result = chargePulseTriggerFromDirectClick(stateRef.current)
      if (result.state === stateRef.current) return
      commitState(result.state)
      if (result.charged) {
        document.dispatchEvent(new Event(PULSE_TRIGGER_CHARGED_EVENT))
      }
    }
    document.addEventListener('click', handleCoreClick, true)
    return () => document.removeEventListener('click', handleCoreClick, true)
  }, [commitState])

  useEffect(() => {
    let frame = 0
    let controlsEnabled = loadGamepadSettings().enabled
    let lastSettingsRead = 0

    const poll = (now: number) => {
      if (now - lastSettingsRead >= 400) {
        controlsEnabled = loadGamepadSettings().enabled
        lastSettingsRead = now
      }
      const gamepad = getFirstConnectedGamepad()
      const pressed = Boolean(
        controlsEnabled &&
          document.visibilityState === 'visible' &&
          gamepad &&
          isButtonPressed(gamepad.buttons[STANDARD_BUTTON.rightTrigger]),
      )
      if (pressed !== previousR2.current) {
        previousR2.current = pressed
        setPulseTriggerInput('gamepad', pressed)
      }
      frame = window.requestAnimationFrame(poll)
    }

    frame = window.requestAnimationFrame(poll)
    return () => {
      window.cancelAnimationFrame(frame)
      setPulseTriggerInput('gamepad', false)
    }
  }, [])

  useEffect(() => {
    if (!isActive) return
    const interval = getPulseTriggerIntervalMs(
      snapshotRef.current?.pulseTriggerLevel ?? 0,
    )
    const timer = window.setInterval(() => {
      if (!firePulse()) stopAll()
    }, interval)
    return () => window.clearInterval(timer)
  }, [firePulse, isActive, snapshot?.pulseTriggerLevel, stopAll])

  useEffect(() => {
    const stop = () => stopAll()
    const visibility = () => {
      if (document.visibilityState !== 'visible') stopAll()
    }
    window.addEventListener('blur', stop)
    document.addEventListener('visibilitychange', visibility)
    return () => {
      window.removeEventListener('blur', stop)
      document.removeEventListener('visibilitychange', visibility)
    }
  }, [stopAll])

  useEffect(() => {
    const timer = window.setInterval(() => {
      const current = readGameSnapshot()
      const previous = previousSnapshot.current
      if (!sameSnapshot(current, snapshotRef.current)) {
        snapshotRef.current = current
        setSnapshot(current)
      }

      const prestigeChanged =
        previous && current && previous.prestigeCount !== current.prestigeCount
      const saveCleared = previous && !current
      const fullReset = previous?.hasProgress && current && !current.hasProgress
      if (prestigeChanged || saveCleared || fullReset) resetTrigger()
      previousSnapshot.current = current
    }, 160)
    return () => window.clearInterval(timer)
  }, [resetTrigger])

  const level = snapshot?.pulseTriggerLevel ?? 0
  const rate = getPulseTriggerRate(level)
  const interval = getPulseTriggerIntervalMs(level)

  useEffect(() => {
    if (isActive && triggerState.reserveMs + 0.001 < interval) stopAll()
  }, [interval, isActive, stopAll, triggerState.reserveMs])

  useEffect(
    () => () => {
      stopAll()
      setPulseTriggerInput('pointer', false)
      setPulseTriggerInput('keyboard', false)
      setPulseTriggerInput('gamepad', false)
    },
    [stopAll],
  )

  if (!host) return null

  const maxed = level >= PULSE_TRIGGER_MAX_LEVEL
  const cost = getPulseTriggerUpgradeCost(level)
  const available = triggerState.reserveMs + 0.001 >= interval
  const style: TriggerStyle = {
    '--trigger-reserve': `${(triggerState.reserveMs / PULSE_TRIGGER_MAX_RESERVE_MS) * 100}%`,
    '--trigger-charge': `${(triggerState.chargeClicks / PULSE_TRIGGER_CHARGE_CLICKS) * 100}%`,
  }
  const releasePointer = (id: number, target: HTMLButtonElement) => {
    if (target.hasPointerCapture(id)) target.releasePointerCapture(id)
    setPulseTriggerInput('pointer', false)
  }

  return createPortal(
    <section
      className={`pulse-trigger-card${isActive ? ' is-active' : ''}${available ? ' is-ready' : ''}`}
      style={style}
      aria-label="Gatillo de pulso"
    >
      <div className="pulse-trigger-heading">
        <div>
          <span>Herramienta activa</span>
          <strong>Gatillo de pulso</strong>
          <small>Nivel {level} · {rate.toFixed(1)} pulsos/s</small>
        </div>
        <b>{(triggerState.reserveMs / 1000).toFixed(1)} s</b>
      </div>

      <button
        type="button"
        className="pulse-trigger-button"
        disabled={!available}
        aria-pressed={isActive}
        title="Mantén el clic derecho en el área de juego o usa R2/RT"
        onPointerDown={(event) => {
          if (event.pointerType === 'mouse') return
          event.preventDefault()
          event.currentTarget.setPointerCapture(event.pointerId)
          setPulseTriggerInput('pointer', true)
        }}
        onPointerUp={(event) => {
          if (event.pointerType !== 'mouse') {
            releasePointer(event.pointerId, event.currentTarget)
          }
        }}
        onPointerCancel={(event) => {
          if (event.pointerType !== 'mouse') {
            releasePointer(event.pointerId, event.currentTarget)
          }
        }}
        onLostPointerCapture={() => setPulseTriggerInput('pointer', false)}
        onKeyDown={(event) => {
          if (!event.repeat && (event.key === ' ' || event.key === 'Enter')) {
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
        <span className="pulse-trigger-button-icon" aria-hidden="true">RMB</span>
        <span>
          <strong>{isActive ? 'DESCARGANDO' : 'MANTENER CLIC DERECHO'}</strong>
          <small>{available ? 'Clic derecho o R2 · izquierdo libre para el núcleo' : 'Carga la reserva con clics directos'}</small>
        </span>
      </button>

      <div className="pulse-trigger-meter" aria-hidden="true"><span /></div>
      <div className="pulse-trigger-footer">
        <span>Siguiente segundo: {triggerState.chargeClicks}/{PULSE_TRIGGER_CHARGE_CLICKS}</span>
        <span>Máximo 10 s</span>
      </div>
      <div className="pulse-trigger-charge" aria-hidden="true"><span /></div>

      <div className="pulse-trigger-upgrade">
        <div>
          <span>Acelerador de pulso</span>
          <strong>{maxed ? 'Cadencia máxima alcanzada' : `${rate.toFixed(1)} → ${getPulseTriggerRate(level + 1).toFixed(1)} pulsos/s`}</strong>
        </div>
        <button
          type="button"
          disabled={maxed || (snapshot?.energy ?? 0) < cost}
          onClick={requestPulseTriggerUpgrade}
        >
          {maxed ? 'Nivel máximo' : `Mejorar · ${format.format(cost)}`}
        </button>
      </div>
    </section>,
    host,
  )
}
