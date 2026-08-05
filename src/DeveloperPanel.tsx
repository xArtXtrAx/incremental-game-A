import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FocusEvent,
  type FormEvent,
  type KeyboardEvent,
  type PointerEvent,
  type CSSProperties,
} from 'react'
import './DeveloperPanel.css'
import './DeveloperChromaticThemePreview.css'
import {
  requestChromaticDeveloperPreview,
  type ChromaticGemId,
} from './chromatic'
import {
  applyDeveloperChromaticTheme,
  CHROMATIC_THEME_PREVIEWS,
  clearDeveloperChromaticTheme,
  DEFAULT_CHROMATIC_THEME_PREVIEW,
} from './chromaticThemePreview'
import { getSphereClickCapacity } from './game'

export const DEVELOPER_MAX_ENERGY = 90_000_000_000_000
export const DEVELOPER_MAX_CLICKS = 1_000_000_000
export const DEVELOPER_MAX_CRYSTALLIZATIONS = 1_000_000_000

export type DeveloperValues = {
  energy: number
  manualClicks: number
  prestigeCount: number
}

type DeveloperPanelProps = DeveloperValues & {
  disabled?: boolean
  onApply: (values: DeveloperValues) => void
}

function clamp(value: number, maximum: number) {
  if (!Number.isFinite(value) || value < 0) {
    return 0
  }

  return Math.min(value, maximum)
}

export function sanitizeDeveloperValues(
  values: DeveloperValues,
): DeveloperValues {
  return {
    energy:
      Math.round(
        (clamp(values.energy, DEVELOPER_MAX_ENERGY) + Number.EPSILON) * 100,
      ) / 100,
    manualClicks: Math.floor(
      clamp(values.manualClicks, DEVELOPER_MAX_CLICKS),
    ),
    prestigeCount: Math.floor(
      clamp(values.prestigeCount, DEVELOPER_MAX_CRYSTALLIZATIONS),
    ),
  }
}

function formatInputValue(value: number) {
  return Number.isFinite(value) ? String(value) : '0'
}

function blockUnsafeKeys(
  event: KeyboardEvent<HTMLInputElement>,
  allowDecimal: boolean,
) {
  const blockedKeys = ['-', '+', 'e', 'E', ',', ' ']

  if (blockedKeys.includes(event.key) || (!allowDecimal && event.key === '.')) {
    event.preventDefault()
  }
}

export function DeveloperPanel({
  energy,
  manualClicks,
  prestigeCount,
  disabled = false,
  onApply,
}: DeveloperPanelProps) {
  const panelRef = useRef<HTMLElement | null>(null)
  const [workspaceHeight, setWorkspaceHeight] = useState<number | null>(null)
  const [workspaceOpen, setWorkspaceOpen] = useState(false)
  const mouseFocusAllowedUntil = useRef(0)
  const [energyInput, setEnergyInput] = useState(() =>
    formatInputValue(energy),
  )
  const [clickInput, setClickInput] = useState(() =>
    formatInputValue(manualClicks),
  )
  const [crystallizationInput, setCrystallizationInput] = useState(() =>
    formatInputValue(prestigeCount),
  )
  const [themePreview, setThemePreview] = useState<ChromaticGemId>(
    DEFAULT_CHROMATIC_THEME_PREVIEW,
  )
  const [dirty, setDirty] = useState(false)
  const [message, setMessage] = useState(
    'Los cambios se guardan en la partida actual.',
  )
  const sphereClickCapacity = getSphereClickCapacity()

  useLayoutEffect(() => {
    const panel = panelRef.current
    const gamePanel = panel
      ?.closest('.game-workspace')
      ?.querySelector<HTMLElement>(':scope > .game-panel')

    if (!gamePanel) return

    const updateHeight = () => {
      const nextHeight = Math.ceil(gamePanel.getBoundingClientRect().height)
      setWorkspaceHeight((current) =>
        current === nextHeight ? current : nextHeight,
      )
    }

    updateHeight()
    const observer = new ResizeObserver(updateHeight)
    observer.observe(gamePanel)
    window.addEventListener('resize', updateHeight)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updateHeight)
    }
  }, [])

  useEffect(() => {
    const panel = panelRef.current
    const workspace = panel?.querySelector<HTMLElement>(
      '.developer-panel-workspace-host',
    )
    if (!workspace) return

    const updateWorkspaceState = () => {
      setWorkspaceOpen(workspace.childElementCount > 0)
    }

    updateWorkspaceState()
    const observer = new MutationObserver(updateWorkspaceState)
    observer.observe(workspace, { childList: true })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (dirty) {
      return
    }

    setEnergyInput(formatInputValue(energy))
    setClickInput(formatInputValue(manualClicks))
    setCrystallizationInput(formatInputValue(prestigeCount))
  }, [dirty, energy, manualClicks, prestigeCount])

  useEffect(() => {
    applyDeveloperChromaticTheme(themePreview)
  }, [themePreview])

  useEffect(
    () => () => {
      clearDeveloperChromaticTheme()
    },
    [],
  )

  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return

    const blockSyntheticGamepadClick = (event: MouseEvent) => {
      if (event.detail !== 0) return
      event.preventDefault()
      event.stopImmediatePropagation()
    }

    panel.addEventListener('click', blockSyntheticGamepadClick, true)
    return () => {
      panel.removeEventListener('click', blockSyntheticGamepadClick, true)
    }
  }, [])

  function handlePanelPointerDown(event: PointerEvent<HTMLElement>) {
    if (event.pointerType === 'mouse' && event.button === 0) {
      mouseFocusAllowedUntil.current = performance.now() + 800
    }
  }

  function handlePanelFocus(event: FocusEvent<HTMLElement>) {
    if (performance.now() <= mouseFocusAllowedUntil.current) return

    const target = event.target
    if (
      target instanceof HTMLElement &&
      !target.closest('.developer-panel-workspace-host')
    ) {
      target.blur()
    }
  }

  function previewChromaticTheme(theme: ChromaticGemId) {
    const definition =
      CHROMATIC_THEME_PREVIEWS.find((item) => item.id === theme) ??
      CHROMATIC_THEME_PREVIEWS[0]

    setThemePreview(theme)
    setMessage(
      `Vista ${definition.label} aplicada solo a esta sesión. No modifica la gema activa ni el guardado.`,
    )
  }

  function handleThemePointer(
    event: PointerEvent<HTMLButtonElement>,
    theme: ChromaticGemId,
  ) {
    if (event.pointerType !== 'mouse' || event.button !== 0) return
    previewChromaticTheme(theme)
  }

  function updateEnergy(value: string) {
    if (!/^(?:\d+(?:\.\d{0,2})?)?$/.test(value)) {
      setMessage('Energía admite solamente números y hasta dos decimales.')
      return
    }

    setEnergyInput(value)
    setDirty(true)
    setMessage('Valores pendientes de aplicar.')
  }

  function updateClicks(value: string) {
    if (!/^\d*$/.test(value)) {
      setMessage('Los clics deben ser un número entero no negativo.')
      return
    }

    setClickInput(value)
    setDirty(true)
    setMessage('Valores pendientes de aplicar.')
  }

  function updateCrystallizations(value: string) {
    if (!/^\d*$/.test(value)) {
      setMessage(
        'Las cristalizaciones deben ser un número entero no negativo.',
      )
      return
    }

    setCrystallizationInput(value)
    setDirty(true)
    setMessage('Valores pendientes de aplicar.')
  }

  function restoreCurrentValues() {
    setEnergyInput(formatInputValue(energy))
    setClickInput(formatInputValue(manualClicks))
    setCrystallizationInput(formatInputValue(prestigeCount))
    setDirty(false)
    setMessage('Se restauraron los valores actuales del juego.')
  }

  function openChromaticPreview() {
    requestChromaticDeveloperPreview()
    setMessage(
      'Cámara Cromática abierta en modo de inspección. No se modificaron desbloqueos.',
    )
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (disabled) {
      setMessage('Espera a que termine la cristalización.')
      return
    }

    if (
      energyInput === '' ||
      clickInput === '' ||
      crystallizationInput === ''
    ) {
      setMessage('Completa los tres campos antes de aplicar los cambios.')
      return
    }

    const parsedEnergy = Number(energyInput)
    const parsedClicks = Number(clickInput)
    const parsedCrystallizations = Number(crystallizationInput)

    if (
      !Number.isFinite(parsedEnergy) ||
      !Number.isFinite(parsedClicks) ||
      !Number.isFinite(parsedCrystallizations) ||
      parsedEnergy < 0 ||
      parsedClicks < 0 ||
      parsedCrystallizations < 0
    ) {
      setMessage('Los valores deben ser numéricos, finitos y no negativos.')
      return
    }

    if (parsedEnergy > DEVELOPER_MAX_ENERGY) {
      setMessage(
        `La energía máxima permitida es ${DEVELOPER_MAX_ENERGY.toLocaleString('es-MX')}.`,
      )
      return
    }

    if (parsedClicks > DEVELOPER_MAX_CLICKS) {
      setMessage(
        `El máximo permitido es ${DEVELOPER_MAX_CLICKS.toLocaleString('es-MX')} clics.`,
      )
      return
    }

    if (parsedCrystallizations > DEVELOPER_MAX_CRYSTALLIZATIONS) {
      setMessage(
        `El máximo permitido es ${DEVELOPER_MAX_CRYSTALLIZATIONS.toLocaleString('es-MX')} cristalizaciones.`,
      )
      return
    }

    const safeValues = sanitizeDeveloperValues({
      energy: parsedEnergy,
      manualClicks: parsedClicks,
      prestigeCount: parsedCrystallizations,
    })

    onApply(safeValues)
    setEnergyInput(formatInputValue(safeValues.energy))
    setClickInput(formatInputValue(safeValues.manualClicks))
    setCrystallizationInput(formatInputValue(safeValues.prestigeCount))
    setDirty(false)
    setMessage('Valores aplicados y guardados en la partida actual.')
  }

  const selectedTheme =
    CHROMATIC_THEME_PREVIEWS.find((item) => item.id === themePreview) ??
    CHROMATIC_THEME_PREVIEWS[0]

  return (
    <aside
      ref={panelRef}
      className={`developer-panel${workspaceOpen ? ' is-workspace-open' : ''}`}
      data-gamepad-ignore="true"
      data-height-synced={workspaceHeight !== null || undefined}
      style={
        workspaceHeight === null
          ? undefined
          : ({
              '--developer-panel-height': `${workspaceHeight}px`,
            } as CSSProperties)
      }
      aria-label="Panel de desarrollador"
      onPointerDownCapture={handlePanelPointerDown}
      onFocusCapture={handlePanelFocus}
    >
      <div className="developer-panel-scroll" data-testid="developer-panel-scroll">
      <header className="developer-panel-header">
        <div>
          <span>Herramientas de prueba</span>
          <h2>Panel de desarrollador</h2>
        </div>
        <strong>DEV</strong>
      </header>

      <p className="developer-panel-intro">
        Modifica recursos, cristalizaciones y la apariencia temporal de la
        ventana sin ejecutar el ciclo de prestigio.
      </p>

      <section
        className="developer-theme-preview"
        aria-labelledby="developer-theme-preview-title"
      >
        <div className="developer-theme-preview-heading">
          <div>
            <span>Laboratorio visual</span>
            <strong id="developer-theme-preview-title">
              Selector cromático
            </strong>
            <small>Solo mouse · no se guarda · no desbloquea gemas</small>
          </div>
          <b aria-hidden="true">SESIÓN</b>
        </div>

        <div
          className="developer-theme-options"
          role="group"
          aria-label="Vista cromática de la ventana"
        >
          {CHROMATIC_THEME_PREVIEWS.map((theme) => (
            <button
              type="button"
              key={theme.id}
              className={`developer-theme-option ${theme.className}${
                themePreview === theme.id ? ' is-active' : ''
              }`}
              aria-pressed={themePreview === theme.id}
              title={`${theme.label}: ${theme.description}`}
              onPointerUp={(event) => handleThemePointer(event, theme.id)}
            >
              <span className="developer-theme-swatch" aria-hidden="true" />
              <span>{theme.label}</span>
            </button>
          ))}
        </div>

        <p className="developer-theme-current">
          Vista actual: <strong>{selectedTheme.label}</strong> ·{' '}
          {selectedTheme.description}
        </p>
      </section>

      <section
        className="developer-chromatic-access"
        aria-labelledby="developer-chromatic-title"
      >
        <span className="developer-tool-label">Inspección de metaprogresión</span>
        <button
          type="button"
          className="developer-chromatic-button"
          onClick={openChromaticPreview}
        >
          <span className="developer-chromatic-glyph" aria-hidden="true">
            ◇
          </span>
          <span>
            <strong id="developer-chromatic-title">Cámara Cromática</strong>
            <small>Ver estado real sin alterar el desbloqueo</small>
          </span>
          <b aria-hidden="true">ABRIR</b>
        </button>
      </section>

      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="developer-energy">
          <span>Energía acumulada</span>
          <input
            id="developer-energy"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            spellCheck={false}
            value={energyInput}
            maxLength={17}
            disabled={disabled}
            onKeyDown={(event) => blockUnsafeKeys(event, true)}
            onChange={(event) => updateEnergy(event.currentTarget.value)}
          />
          <small>Máximo: 90 billones · 2 decimales</small>
        </label>

        <label htmlFor="developer-clicks">
          <span>Clics del núcleo</span>
          <input
            id="developer-clicks"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            spellCheck={false}
            value={clickInput}
            maxLength={10}
            disabled={disabled}
            onKeyDown={(event) => blockUnsafeKeys(event, false)}
            onChange={(event) => updateClicks(event.currentTarget.value)}
          />
          <small>Máximo: 1,000,000,000 · solo enteros</small>
        </label>

        <label htmlFor="developer-crystallizations">
          <span>Cristalizaciones</span>
          <input
            id="developer-crystallizations"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            spellCheck={false}
            value={crystallizationInput}
            maxLength={10}
            disabled={disabled}
            onKeyDown={(event) => blockUnsafeKeys(event, false)}
            onChange={(event) =>
              updateCrystallizations(event.currentTarget.value)
            }
          />
          <small>Máximo: 1,000,000,000 · solo enteros</small>
        </label>

        <div className="developer-panel-actions">
          <button type="submit" disabled={disabled || !dirty}>
            Aplicar valores
          </button>
          <button
            type="button"
            className="developer-secondary-button"
            disabled={disabled}
            onClick={restoreCurrentValues}
          >
            Restaurar actuales
          </button>
        </div>
      </form>

      <p className="developer-panel-message" aria-live="polite">
        {message}
      </p>

      <footer>
        Reducir los clics por debajo de{' '}
        {sphereClickCapacity.toLocaleString('es-MX')} cancela la sobrecarga
        activa. Cambiar las cristalizaciones no elimina niveles comprados; los
        requisitos activos únicamente controlan compras nuevas. La vista
        cromática siempre vuelve a Zafiro al recargar.
      </footer>

      <div
        className="developer-panel-launcher-host"
        data-testid="developer-panel-launcher-host"
      />
      </div>

      <div
        className="developer-panel-workspace-host"
        data-testid="developer-panel-workspace-host"
        aria-live="polite"
      />
    </aside>
  )
}
