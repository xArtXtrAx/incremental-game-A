import { useEffect, useState, type FormEvent, type KeyboardEvent } from 'react'
import './DeveloperPanel.css'
import { requestChromaticDeveloperPreview } from './chromatic'

export const DEVELOPER_MAX_ENERGY = 90_000_000_000_000
export const DEVELOPER_MAX_CLICKS = 1_000_000_000

export type DeveloperValues = {
  energy: number
  manualClicks: number
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
  disabled = false,
  onApply,
}: DeveloperPanelProps) {
  const [energyInput, setEnergyInput] = useState(() =>
    formatInputValue(energy),
  )
  const [clickInput, setClickInput] = useState(() =>
    formatInputValue(manualClicks),
  )
  const [dirty, setDirty] = useState(false)
  const [message, setMessage] = useState(
    'Los cambios se guardan en la partida actual.',
  )

  useEffect(() => {
    if (dirty) {
      return
    }

    setEnergyInput(formatInputValue(energy))
    setClickInput(formatInputValue(manualClicks))
  }, [dirty, energy, manualClicks])

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

  function restoreCurrentValues() {
    setEnergyInput(formatInputValue(energy))
    setClickInput(formatInputValue(manualClicks))
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

    if (energyInput === '' || clickInput === '') {
      setMessage('Completa ambos campos antes de aplicar los cambios.')
      return
    }

    const parsedEnergy = Number(energyInput)
    const parsedClicks = Number(clickInput)

    if (
      !Number.isFinite(parsedEnergy) ||
      !Number.isFinite(parsedClicks) ||
      parsedEnergy < 0 ||
      parsedClicks < 0
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

    const safeValues = sanitizeDeveloperValues({
      energy: parsedEnergy,
      manualClicks: parsedClicks,
    })

    onApply(safeValues)
    setEnergyInput(formatInputValue(safeValues.energy))
    setClickInput(formatInputValue(safeValues.manualClicks))
    setDirty(false)
    setMessage('Valores aplicados y guardados en la partida actual.')
  }

  return (
    <aside className="developer-panel" aria-label="Panel de desarrollador">
      <header className="developer-panel-header">
        <div>
          <span>Herramientas de prueba</span>
          <h2>Panel de desarrollador</h2>
        </div>
        <strong>DEV</strong>
      </header>

      <p className="developer-panel-intro">
        Modifica recursos sin alterar niveles, prestigios ni multiplicadores.
      </p>

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
        Al reducir los clics por debajo de 5,000 se cancela cualquier
        sobrecarga activa para conservar un estado válido.
      </footer>
    </aside>
  )
}
