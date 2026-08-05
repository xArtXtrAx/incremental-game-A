import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from 'react'
import { createPortal } from 'react-dom'
import {
  DEVELOPER_PANEL_KEYBOARD_STEP,
  DEVELOPER_PANEL_MIN_WIDTH,
  clampDeveloperPanelWidth,
  clearDeveloperPanelWidthPreference,
  getDefaultDeveloperPanelWidth,
  getDeveloperPanelPresetWidth,
  getMaximumDeveloperPanelWidth,
  isDeveloperPanelDesktop,
  readDeveloperPanelWidthPreference,
  writeDeveloperPanelWidthPreference,
  type DeveloperPanelWidthPreset,
} from './developerPanelWidth'
import './DeveloperPanelWidthSystem.css'

const ROOT_WIDTH_PROPERTY = '--developer-panel-width'

function getViewportWidth() {
  return Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
}

function usePortalHost(selector: string) {
  const find = useCallback(
    () => document.querySelector<HTMLElement>(selector),
    [selector],
  )
  const [host, setHost] = useState<HTMLElement | null>(() => find())

  useEffect(() => {
    const update = () => setHost(find())
    update()
    const observer = new MutationObserver(update)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [find])

  return host
}

type DragState = {
  pointerId: number
  startX: number
  startWidth: number
}

export function DeveloperPanelWidthSystem() {
  const panelHost = usePortalHost('.developer-panel')
  const headerHost = usePortalHost('.developer-panel-header')
  const [viewportWidth, setViewportWidth] = useState(getViewportWidth)
  const [preferredWidth, setPreferredWidth] = useState(() => {
    const stored = readDeveloperPanelWidthPreference(window.localStorage)
    return stored ?? getDefaultDeveloperPanelWidth(getViewportWidth())
  })
  const dragState = useRef<DragState | null>(null)
  const pendingWidth = useRef<number | null>(null)
  const animationFrame = useRef<number | null>(null)

  const desktop = isDeveloperPanelDesktop(viewportWidth)
  const maximumWidth = getMaximumDeveloperPanelWidth(viewportWidth)
  const effectiveWidth = clampDeveloperPanelWidth(
    preferredWidth,
    viewportWidth,
  )

  const presets = useMemo(
    () =>
      (
        [
          ['compact', 'Compacto'],
          ['normal', 'Normal'],
          ['wide', 'Amplio'],
        ] as const
      ).map(([id, label]) => ({
        id,
        label,
        width: getDeveloperPanelPresetWidth(id, viewportWidth),
      })),
    [viewportWidth],
  )

  useLayoutEffect(() => {
    const root = document.documentElement
    root.style.setProperty(ROOT_WIDTH_PROPERTY, `${effectiveWidth}px`)
    root.dataset.developerPanelWidth = String(effectiveWidth)

    return () => {
      root.style.removeProperty(ROOT_WIDTH_PROPERTY)
      delete root.dataset.developerPanelWidth
    }
  }, [effectiveWidth])

  useEffect(() => {
    let frame: number | null = null
    const update = () => {
      if (frame !== null) return
      frame = window.requestAnimationFrame(() => {
        frame = null
        setViewportWidth(getViewportWidth())
      })
    }

    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('resize', update)
      if (frame !== null) window.cancelAnimationFrame(frame)
    }
  }, [])

  useEffect(
    () => () => {
      if (animationFrame.current !== null) {
        window.cancelAnimationFrame(animationFrame.current)
      }
    },
    [],
  )

  function persistWidth(width: number) {
    writeDeveloperPanelWidthPreference(window.localStorage, width)
  }

  function setWidth(width: number, persist = true) {
    const nextWidth = clampDeveloperPanelWidth(width, viewportWidth)
    setPreferredWidth(nextWidth)
    if (persist) persistWidth(nextWidth)
  }

  function setPreset(preset: DeveloperPanelWidthPreset) {
    setWidth(getDeveloperPanelPresetWidth(preset, viewportWidth))
  }

  function restoreDefault() {
    clearDeveloperPanelWidthPreference(window.localStorage)
    setPreferredWidth(getDefaultDeveloperPanelWidth(viewportWidth))
  }

  function scheduleDragWidth(width: number) {
    pendingWidth.current = clampDeveloperPanelWidth(width, viewportWidth)
    if (animationFrame.current !== null) return

    animationFrame.current = window.requestAnimationFrame(() => {
      animationFrame.current = null
      const nextWidth = pendingWidth.current
      if (nextWidth !== null) setPreferredWidth(nextWidth)
    })
  }

  function finishDrag() {
    if (animationFrame.current !== null) {
      window.cancelAnimationFrame(animationFrame.current)
      animationFrame.current = null
    }

    const finalWidth = pendingWidth.current
    if (finalWidth !== null) {
      setPreferredWidth(finalWidth)
      persistWidth(finalWidth)
    }

    pendingWidth.current = null
    dragState.current = null
    document.documentElement.classList.remove('is-resizing-developer-panel')
  }

  function handleResizePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!desktop || !event.isPrimary || event.button !== 0) return

    dragState.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startWidth: effectiveWidth,
    }
    pendingWidth.current = effectiveWidth
    event.currentTarget.setPointerCapture(event.pointerId)
    document.documentElement.classList.add('is-resizing-developer-panel')
    event.preventDefault()
  }

  function handleResizePointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragState.current
    if (!drag || drag.pointerId !== event.pointerId) return

    scheduleDragWidth(drag.startWidth + event.clientX - drag.startX)
    event.preventDefault()
  }

  function handleResizePointerEnd(event: PointerEvent<HTMLDivElement>) {
    const drag = dragState.current
    if (!drag || drag.pointerId !== event.pointerId) return

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    finishDrag()
  }

  function handleResizeKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!desktop) return

    let nextWidth: number | null = null
    if (event.key === 'ArrowRight') {
      nextWidth = effectiveWidth + DEVELOPER_PANEL_KEYBOARD_STEP
    } else if (event.key === 'ArrowLeft') {
      nextWidth = effectiveWidth - DEVELOPER_PANEL_KEYBOARD_STEP
    } else if (event.key === 'Home') {
      nextWidth = DEVELOPER_PANEL_MIN_WIDTH
    } else if (event.key === 'End') {
      nextWidth = maximumWidth
    }

    if (nextWidth === null) return
    event.preventDefault()
    setWidth(nextWidth)
  }

  return (
    <>
      {headerHost &&
        createPortal(
          <section
            className="developer-panel-width-controls"
            aria-label="Ancho del Panel DEV"
            data-testid="developer-panel-width-controls"
          >
            <div className="developer-panel-width-status">
              <span>Ancho del panel</span>
              <strong>{desktop ? `${effectiveWidth} px` : 'Automático'}</strong>
            </div>
            <div className="developer-panel-width-presets">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className="developer-panel-width-preset"
                  disabled={!desktop}
                  aria-pressed={desktop && effectiveWidth === preset.width}
                  onClick={() => setPreset(preset.id)}
                >
                  {preset.label}
                </button>
              ))}
              <button
                type="button"
                className="developer-panel-width-reset"
                disabled={!desktop}
                onClick={restoreDefault}
              >
                Restaurar
              </button>
            </div>
          </section>,
          headerHost,
        )}

      {panelHost &&
        createPortal(
          <div
            className="developer-panel-resize-handle"
            role="separator"
            aria-label="Redimensionar Panel DEV"
            aria-orientation="vertical"
            aria-valuemin={DEVELOPER_PANEL_MIN_WIDTH}
            aria-valuemax={maximumWidth}
            aria-valuenow={effectiveWidth}
            aria-disabled={!desktop}
            tabIndex={desktop ? 0 : -1}
            data-testid="developer-panel-resize-handle"
            onPointerDown={handleResizePointerDown}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerEnd}
            onPointerCancel={handleResizePointerEnd}
            onKeyDown={handleResizeKeyDown}
          >
            <span aria-hidden="true" />
          </div>,
          panelHost,
        )}
    </>
  )
}
