import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { DEFAULT_BALANCE_CONFIG } from './balanceConfig'
import { createBrowserBalanceProfileRepository } from './balanceProfiles'
import {
  MATHEMATICAL_TEMPLATE_MAX_DECIMALS,
  MATHEMATICAL_TEMPLATE_NAME_MAX_LENGTH,
  MATHEMATICAL_TEMPLATE_TARGETS,
  createDefaultMathematicalTemplateSpecification,
  exportMathematicalTemplateSpecification,
  generateBalanceConfigFromMathematicalTemplate,
  getMathematicalTemplateTarget,
  importMathematicalTemplateSpecification,
  type MathematicalTemplate,
  type MathematicalTemplateKind,
  type MathematicalTemplateRounding,
  type MathematicalTemplateSpecification,
  type MathematicalTemplateTargetId,
} from './mathematicalTemplates'
import './MathematicalTemplateSystem.css'

const numberFormat = new Intl.NumberFormat('es-MX', {
  maximumFractionDigits: 8,
})

const TEMPLATE_KINDS: readonly {
  id: MathematicalTemplateKind
  label: string
  formula: string
}[] = [
  { id: 'linear', label: 'Lineal', formula: 'a + b·x' },
  { id: 'exponential', label: 'Exponencial', formula: 'a·gˣ' },
  { id: 'power', label: 'Potencia', formula: 'o + s·xᵖ' },
  { id: 'root', label: 'Raíz', formula: 'o + s·x¹⁄ᵈ' },
  { id: 'logarithmic', label: 'Logarítmica', formula: 'o + s·logᵦ(x+t)' },
  {
    id: 'diminishing-returns',
    label: 'Rendimientos decrecientes',
    formula: 'mín + (máx−mín)·x/(h+x)',
  },
]

type ParameterDefinition = {
  key: string
  label: string
  step: number
  help: string
}

const PARAMETER_DEFINITIONS: Record<
  MathematicalTemplateKind,
  readonly ParameterDefinition[]
> = {
  linear: [
    {
      key: 'intercept',
      label: 'Intercepto',
      step: 0.01,
      help: 'Valor cuando x = 0.',
    },
    {
      key: 'slope',
      label: 'Pendiente',
      step: 0.01,
      help: 'Cambio por muestra.',
    },
  ],
  exponential: [
    {
      key: 'initial',
      label: 'Valor inicial',
      step: 0.01,
      help: 'Escala inicial.',
    },
    {
      key: 'growth',
      label: 'Crecimiento',
      step: 0.01,
      help: 'Base positiva de la potencia.',
    },
  ],
  power: [
    {
      key: 'offset',
      label: 'Desplazamiento',
      step: 0.01,
      help: 'Valor base aditivo.',
    },
    {
      key: 'scale',
      label: 'Escala',
      step: 0.01,
      help: 'Peso de la potencia.',
    },
    {
      key: 'exponent',
      label: 'Exponente',
      step: 0.05,
      help: 'Limitado al rango seguro −8…8.',
    },
  ],
  root: [
    {
      key: 'offset',
      label: 'Desplazamiento',
      step: 0.01,
      help: 'Valor base aditivo.',
    },
    {
      key: 'scale',
      label: 'Escala',
      step: 0.01,
      help: 'Peso de la raíz.',
    },
    {
      key: 'degree',
      label: 'Grado',
      step: 1,
      help: 'Entero seguro entre 1 y 16.',
    },
  ],
  logarithmic: [
    {
      key: 'offset',
      label: 'Desplazamiento',
      step: 0.01,
      help: 'Valor base aditivo.',
    },
    {
      key: 'scale',
      label: 'Escala',
      step: 0.01,
      help: 'Peso del logaritmo.',
    },
    {
      key: 'base',
      label: 'Base',
      step: 0.1,
      help: 'Debe ser mayor que 1.',
    },
    {
      key: 'inputOffset',
      label: 'Traslado de entrada',
      step: 0.01,
      help: 'Mantiene x + traslado por encima de cero.',
    },
  ],
  'diminishing-returns': [
    {
      key: 'minimum',
      label: 'Mínimo',
      step: 0.01,
      help: 'Valor al inicio del dominio.',
    },
    {
      key: 'maximum',
      label: 'Máximo asintótico',
      step: 0.01,
      help: 'Límite superior explicable.',
    },
    {
      key: 'halfSaturation',
      label: 'Semisaturación',
      step: 0.1,
      help: 'x donde se alcanza la mitad del recorrido.',
    },
  ],
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

function safeFileName(name: string) {
  return (
    name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase() || 'plantilla-matematica'
  )
}

function downloadJson(name: string, content: string) {
  const url = URL.createObjectURL(
    new Blob([content], { type: 'application/json;charset=utf-8' }),
  )
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${safeFileName(name)}.math-template.json`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

function readNumberAtPath(value: unknown, path: string) {
  const result = path.split('.').reduce<unknown>((current, segment) => {
    if (Array.isArray(current)) return current[Number(segment)]
    if (typeof current === 'object' && current !== null) {
      return (current as Record<string, unknown>)[segment]
    }
    return undefined
  }, value)
  return typeof result === 'number' ? result : Number.NaN
}

function parseNumericInput(rawValue: string) {
  return rawValue.trim() === '' ? Number.NaN : Number(rawValue)
}

function findToolButton(text: string) {
  return Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find(
    (button) => button.textContent?.includes(text),
  )
}

function MathematicalTemplateWindow({ onClose }: { onClose: () => void }) {
  const repository = useMemo(() => createBrowserBalanceProfileRepository(), [])
  const [specification, setSpecification] =
    useState<MathematicalTemplateSpecification>(() =>
      createDefaultMathematicalTemplateSpecification(),
    )
  const [importText, setImportText] = useState('')
  const [message, setMessage] = useState(
    'La previsualización no modifica la partida, el runtime ni el balance oficial.',
  )
  const [hasError, setHasError] = useState(false)
  const [confirmingSave, setConfirmingSave] = useState(false)
  const [savedProfileName, setSavedProfileName] = useState<string | null>(null)

  const generation = useMemo(
    () => generateBalanceConfigFromMathematicalTemplate(specification),
    [specification],
  )
  const target = getMathematicalTemplateTarget(specification.target)
  const kindDefinition =
    TEMPLATE_KINDS.find((entry) => entry.id === specification.template.kind) ??
    TEMPLATE_KINDS[0]
  const parameters = PARAMETER_DEFINITIONS[specification.template.kind]

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  function replaceDefaults(
    nextTarget: MathematicalTemplateTargetId,
    nextKind: MathematicalTemplateKind,
  ) {
    setSpecification((current) => ({
      ...createDefaultMathematicalTemplateSpecification(nextTarget, nextKind),
      name: current.name,
    }))
    setConfirmingSave(false)
    setSavedProfileName(null)
    setHasError(false)
    setMessage('Plantilla reiniciada con parámetros seguros para el nuevo tipo.')
  }

  function updateParameter(key: string, rawValue: string) {
    const value = parseNumericInput(rawValue)
    setSpecification((current) => ({
      ...current,
      template: {
        ...current.template,
        [key]: value,
      } as MathematicalTemplate,
    }))
    setConfirmingSave(false)
    setSavedProfileName(null)
  }

  function handleExport() {
    const exported = exportMathematicalTemplateSpecification(specification)
    if (!exported.ok) {
      setHasError(true)
      setMessage(exported.issues[0]?.message ?? 'No fue posible exportar.')
      return
    }
    downloadJson(specification.name, exported.value)
    setHasError(false)
    setMessage('Especificación matemática exportada como JSON versionado.')
  }

  function handleImport() {
    const imported = importMathematicalTemplateSpecification(importText)
    if (!imported.ok) {
      setHasError(true)
      setMessage(imported.issues[0]?.message ?? 'No fue posible importar.')
      return
    }
    setSpecification(imported.value)
    setImportText('')
    setConfirmingSave(false)
    setSavedProfileName(null)
    setHasError(false)
    setMessage('Especificación importada y reevaluada desde cero.')
  }

  function handleSaveProfile() {
    if (!generation.ok) return
    const saved = repository.save(specification.name, generation.value.config)
    setConfirmingSave(false)
    if (!saved.ok) {
      setHasError(true)
      setMessage(saved.issues[0]?.message ?? 'No fue posible guardar el perfil.')
      return
    }
    setSavedProfileName(saved.value.name)
    setHasError(false)
    setMessage(
      `Perfil “${saved.value.name}” guardado sin aplicarlo a la sesión.`,
    )
  }

  function openProfiles() {
    const button = findToolButton('Perfiles DEV')
    if (!button) {
      setHasError(true)
      setMessage('No se encontró el acceso a Perfiles DEV.')
      return
    }
    onClose()
    button.click()
  }

  function openComparator() {
    const button = findToolButton('Comparador de Experimentos')
    if (!button) {
      setHasError(true)
      setMessage('No se encontró el Comparador de Experimentos.')
      return
    }
    onClose()
    button.click()
  }

  return createPortal(
    <div className="mathematical-template-overlay" role="presentation">
      <section
        className="mathematical-template-window"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mathematical-template-title"
      >
        <header className="mathematical-template-header">
          <div>
            <span>FASE 6 · CURVAS DECLARATIVAS</span>
            <h2 id="mathematical-template-title">Plantillas Matemáticas Seguras</h2>
            <p>
              Genera un borrador de BalanceConfig sin ejecutar código del usuario
              ni alterar la partida.
            </p>
          </div>
          <div>
            <b data-valid={generation.ok || undefined}>
              {generation.ok ? 'BORRADOR VÁLIDO' : 'REVISAR PARÁMETROS'}
            </b>
            <button type="button" onClick={onClose} aria-label="Cerrar">
              ×
            </button>
          </div>
        </header>

        <div className="mathematical-template-notice">
          No se usa <code>eval()</code>, <code>new Function()</code> ni JavaScript
          arbitrario. Guardar un perfil tampoco lo carga automáticamente.
        </div>

        <main className="mathematical-template-content">
          <section className="mathematical-template-card">
            <div className="mathematical-template-section-heading">
              <div>
                <span>ESPECIFICACIÓN</span>
                <h3>Destino y familia matemática</h3>
              </div>
              <code>{kindDefinition.formula}</code>
            </div>

            <div className="mathematical-template-form-grid">
              <label>
                <span>Nombre</span>
                <input
                  aria-label="Nombre de la plantilla"
                  maxLength={MATHEMATICAL_TEMPLATE_NAME_MAX_LENGTH}
                  value={specification.name}
                  onChange={(event) => {
                    const name = event.currentTarget.value
                    setSpecification((current) => ({
                      ...current,
                      name,
                    }))
                    setSavedProfileName(null)
                    setConfirmingSave(false)
                  }}
                />
              </label>

              <label>
                <span>Destino</span>
                <select
                  aria-label="Destino matemático"
                  value={specification.target}
                  onChange={(event) =>
                    replaceDefaults(
                      event.currentTarget.value as MathematicalTemplateTargetId,
                      specification.template.kind,
                    )
                  }
                >
                  {MATHEMATICAL_TEMPLATE_TARGETS.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Plantilla</span>
                <select
                  aria-label="Tipo de plantilla"
                  value={specification.template.kind}
                  onChange={(event) =>
                    replaceDefaults(
                      specification.target,
                      event.currentTarget.value as MathematicalTemplateKind,
                    )
                  }
                >
                  {TEMPLATE_KINDS.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Inicio del dominio</span>
                <input
                  type="number"
                  aria-label="Inicio del dominio"
                  value={
                    Number.isFinite(specification.domain.start)
                      ? specification.domain.start
                      : ''
                  }
                  onChange={(event) => {
                    const start = parseNumericInput(event.currentTarget.value)
                    setSpecification((current) => ({
                      ...current,
                      domain: {
                        ...current.domain,
                        start,
                      },
                    }))
                  }}
                />
              </label>

              <label>
                <span>Paso del dominio</span>
                <input
                  type="number"
                  aria-label="Paso del dominio"
                  value={
                    Number.isFinite(specification.domain.step)
                      ? specification.domain.step
                      : ''
                  }
                  onChange={(event) => {
                    const step = parseNumericInput(event.currentTarget.value)
                    setSpecification((current) => ({
                      ...current,
                      domain: {
                        ...current.domain,
                        step,
                      },
                    }))
                  }}
                />
              </label>

              <label>
                <span>Redondeo</span>
                <select
                  aria-label="Redondeo de salida"
                  value={specification.output.rounding}
                  onChange={(event) => {
                    const rounding = event.currentTarget
                      .value as MathematicalTemplateRounding
                    setSpecification((current) => ({
                      ...current,
                      output: {
                        ...current.output,
                        rounding,
                      },
                    }))
                  }}
                >
                  <option value="none">Sin redondeo</option>
                  <option value="nearest-integer">Entero más cercano</option>
                  <option value="ceil">Redondear hacia arriba</option>
                  <option value="fixed">Decimales fijos</option>
                </select>
              </label>

              <label>
                <span>Decimales</span>
                <input
                  type="number"
                  aria-label="Decimales de salida"
                  min={0}
                  max={MATHEMATICAL_TEMPLATE_MAX_DECIMALS}
                  step={1}
                  value={specification.output.decimalPlaces}
                  onChange={(event) => {
                    const decimalPlaces = Number(event.currentTarget.value)
                    setSpecification((current) => ({
                      ...current,
                      output: {
                        ...current.output,
                        decimalPlaces,
                      },
                    }))
                  }}
                />
              </label>
            </div>

            <p>{target.description}</p>
          </section>

          <section className="mathematical-template-card">
            <div className="mathematical-template-section-heading">
              <div>
                <span>PARÁMETROS</span>
                <h3>{kindDefinition.label}</h3>
              </div>
              <small>{target.sampleCount} muestras fijas</small>
            </div>
            <div className="mathematical-template-parameter-grid">
              {parameters.map((parameter) => {
                const currentValue = (
                  specification.template as unknown as Record<string, number>
                )[parameter.key]
                return (
                  <label key={parameter.key}>
                    <span>{parameter.label}</span>
                    <input
                      type="number"
                      aria-label={parameter.label}
                      step={parameter.step}
                      value={Number.isFinite(currentValue) ? currentValue : ''}
                      onChange={(event) =>
                        updateParameter(parameter.key, event.currentTarget.value)
                      }
                    />
                    <small>{parameter.help}</small>
                  </label>
                )
              })}
            </div>
          </section>

          <section className="mathematical-template-card">
            <div className="mathematical-template-section-heading">
              <div>
                <span>PREVISUALIZACIÓN</span>
                <h3>Balance oficial frente al borrador</h3>
              </div>
              <b>
                {generation.ok
                  ? `${generation.value.samples.length} valores`
                  : 'inválido'}
              </b>
            </div>

            {generation.ok ? (
              <div className="mathematical-template-table-scroll">
                <table data-testid="mathematical-template-preview">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Destino</th>
                      <th>x</th>
                      <th>Oficial</th>
                      <th>Generado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generation.value.samples.map((sample) => (
                      <tr key={sample.targetPath}>
                        <td>{sample.index + 1}</td>
                        <th>{sample.targetLabel}</th>
                        <td>{numberFormat.format(sample.x)}</td>
                        <td>
                          {numberFormat.format(
                            readNumberAtPath(
                              DEFAULT_BALANCE_CONFIG,
                              sample.targetPath,
                            ),
                          )}
                        </td>
                        <td>{numberFormat.format(sample.value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <ul className="mathematical-template-issues">
                {generation.issues.map((entry) => (
                  <li key={`${entry.path}-${entry.message}`}>
                    <code>{entry.path}</code>
                    <span>{entry.message}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mathematical-template-card">
            <div className="mathematical-template-section-heading">
              <div>
                <span>IMPORTAR / EXPORTAR</span>
                <h3>Especificación versionada</h3>
              </div>
              <button
                type="button"
                disabled={!generation.ok}
                onClick={handleExport}
              >
                Exportar JSON
              </button>
            </div>
            <textarea
              aria-label="JSON de plantilla matemática"
              value={importText}
              onChange={(event) => setImportText(event.currentTarget.value)}
              placeholder="Pega aquí una especificación .math-template.json"
            />
            <button
              type="button"
              disabled={importText.trim() === ''}
              onClick={handleImport}
            >
              Importar y validar
            </button>
          </section>
        </main>

        <footer className="mathematical-template-footer">
          <span data-error={hasError || undefined} role="status">
            {message}
          </span>
          <div>
            <button type="button" onClick={openProfiles}>
              Abrir Perfiles DEV
            </button>
            {!confirmingSave ? (
              <button
                type="button"
                className="is-primary"
                disabled={!generation.ok}
                onClick={() => {
                  setConfirmingSave(true)
                  setMessage(
                    'Confirma para guardar el BalanceConfig generado. No se aplicará a la sesión.',
                  )
                }}
              >
                Guardar como perfil DEV
              </button>
            ) : (
              <>
                <button type="button" onClick={() => setConfirmingSave(false)}>
                  Cancelar
                </button>
                <button
                  type="button"
                  className="is-danger"
                  data-testid="confirm-template-profile-save"
                  onClick={handleSaveProfile}
                >
                  Confirmar guardado
                </button>
              </>
            )}
            <button
              type="button"
              disabled={!savedProfileName}
              title={
                savedProfileName
                  ? `Abrir el comparador y seleccionar “${savedProfileName}”.`
                  : 'Guarda primero el borrador como perfil DEV.'
              }
              onClick={openComparator}
            >
              Abrir Comparador A/B
            </button>
            <button type="button" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </footer>
      </section>
    </div>,
    document.body,
  )
}

export function MathematicalTemplateSystem() {
  const developerPanelHost = usePortalHost('.developer-panel')
  const toolsHost = usePortalHost('.developer-tools-grid')
  const [open, setOpen] = useState(false)

  return (
    <>
      {developerPanelHost &&
        createPortal(
          <section className="developer-mathematical-template-access">
            <span>Balance matemático</span>
            <button type="button" onClick={() => setOpen(true)}>
              <span aria-hidden="true">ƒ(x)</span>
              <span>
                <strong>Plantillas Matemáticas</strong>
                <small>Curvas tipadas, explicables y serializables</small>
              </span>
              <b aria-hidden="true">ABRIR</b>
            </button>
          </section>,
          developerPanelHost,
        )}

      {toolsHost &&
        createPortal(
          <button
            type="button"
            className="developer-mathematical-template-tool-button"
            onClick={() => setOpen(true)}
          >
            <span>ƒ(x)</span>
            <strong>Plantillas Matemáticas</strong>
            <small>Construir borradores seguros de BalanceConfig.</small>
          </button>,
          toolsHost,
        )}

      {open && <MathematicalTemplateWindow onClose={() => setOpen(false)} />}
    </>
  )
}
