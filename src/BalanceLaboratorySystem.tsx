import {
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react'
import { createPortal } from 'react-dom'
import './BalanceLaboratorySystem.css'
import {
  DEFAULT_BALANCE_CONFIG,
  cloneBalanceConfig,
  type BalanceConfig,
} from './balanceConfig'
import {
  BALANCE_AUTOCLICK_FIELDS,
  BALANCE_CORE_FIELDS,
  BALANCE_COST_SYSTEMS,
  BALANCE_SAPPHIRE_FIELDS,
  BALANCE_UNLOCK_FIELDS,
  countBalanceDraftChanges,
  getBalanceDraftNumber,
  getCostFieldDefinitions,
  isBalanceDraftDirty,
  restoreBalanceDraftPath,
  updateBalanceDraftNumber,
  type BalanceCostSystem,
  type BalanceEditablePath,
  type BalanceFieldDefinition,
} from './balanceDraft'
import {
  getBalanceRuntimeSnapshot,
  readStoredBalanceProfile,
  subscribeBalanceRuntime,
} from './balanceRuntime'
import {
  BALANCE_COST_LEVEL_SAMPLES,
  createBalanceDiagnostics,
  getConfiguredSapphireMultiplier,
  simulateAutoclickRates,
  simulateCostCurve,
} from './balanceSimulation'
import {
  validateBalanceConfig,
  type BalanceValidationIssue,
} from './balanceValidation'

type LaboratorySection =
  | 'costs'
  | 'core'
  | 'autoclick'
  | 'sapphire'
  | 'diagnostics'

const LABORATORY_SECTIONS: readonly {
  id: LaboratorySection
  label: string
}[] = [
  { id: 'costs', label: 'Costos' },
  { id: 'core', label: 'Núcleo' },
  { id: 'autoclick', label: 'Autoclicker' },
  { id: 'sapphire', label: 'Zafiro' },
  { id: 'diagnostics', label: 'Diagnóstico' },
]

const SAPPHIRE_PREVIEW_LEVELS = [0, 1, 2, 3, 4, 5, 6, 7, 8] as const

const numberFormat = new Intl.NumberFormat('es-MX', {
  maximumFractionDigits: 4,
})

function findDeveloperPanel() {
  return document.querySelector<HTMLElement>('.developer-panel')
}

function useDeveloperPanelHost() {
  const [host, setHost] = useState<HTMLElement | null>(() =>
    findDeveloperPanel(),
  )

  useEffect(() => {
    const updateHost = () => setHost(findDeveloperPanel())
    updateHost()

    const observer = new MutationObserver(updateHost)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  return host
}

function formatDifference(official: number, draft: number) {
  if (!Number.isFinite(official) || !Number.isFinite(draft)) return '—'
  if (official === draft) return '0%'
  if (official === 0) return draft > 0 ? 'nuevo' : '—'

  const difference = ((draft - official) / official) * 100
  const prefix = difference > 0 ? '+' : ''
  return `${prefix}${numberFormat.format(difference)}%`
}

function getDifferenceDirection(official: number, draft: number) {
  if (!Number.isFinite(official) || !Number.isFinite(draft)) return 'invalid'
  if (official === draft) return 'same'
  return draft > official ? 'higher' : 'lower'
}

function getIssuesForPath(
  issues: readonly BalanceValidationIssue[],
  path: BalanceEditablePath,
) {
  return issues.filter(
    (issue) => issue.path === path || issue.path.startsWith(`${path}.`),
  )
}

function BalanceNumberField({
  field,
  draft,
  official,
  issues,
  onChange,
  onRestore,
}: {
  field: BalanceFieldDefinition
  draft: Readonly<BalanceConfig>
  official: Readonly<BalanceConfig>
  issues: readonly BalanceValidationIssue[]
  onChange: (path: BalanceEditablePath, rawValue: string) => void
  onRestore: (path: BalanceEditablePath) => void
}) {
  const value = getBalanceDraftNumber(draft, field.path)
  const officialValue = getBalanceDraftNumber(official, field.path)
  const fieldIssues = getIssuesForPath(issues, field.path)
  const changed = !Object.is(value, officialValue)
  const invalid = fieldIssues.some((issue) => issue.severity === 'error')

  return (
    <label
      className="balance-laboratory-field"
      data-changed={changed || undefined}
      data-invalid={invalid || undefined}
    >
      <span className="balance-laboratory-field-heading">
        <span>{field.label}</span>
        {changed && (
          <button type="button" onClick={() => onRestore(field.path)}>
            Restaurar
          </button>
        )}
      </span>
      <span className="balance-laboratory-input-row">
        <input
          type="number"
          value={Number.isFinite(value) ? value : ''}
          min={field.minimum}
          max={field.maximum}
          step={field.step}
          inputMode={field.integer ? 'numeric' : 'decimal'}
          aria-invalid={invalid}
          onChange={(event) => onChange(field.path, event.currentTarget.value)}
        />
        {field.unit && <b>{field.unit}</b>}
      </span>
      <small>
        Oficial: {numberFormat.format(officialValue)}
        {field.help ? ` · ${field.help}` : ''}
      </small>
      {fieldIssues.map((issue) => (
        <em key={`${issue.path}-${issue.message}`} data-severity={issue.severity}>
          {issue.message}
        </em>
      ))}
    </label>
  )
}

function ComparisonTable({
  headers,
  rows,
}: {
  headers: readonly string[]
  rows: readonly {
    key: string
    cells: readonly (string | number)[]
    direction?: string
  }[]
}) {
  return (
    <div className="balance-laboratory-table-wrap">
      <table>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} data-change={row.direction}>
              {row.cells.map((cell, index) => (
                <td key={`${row.key}-${headers[index]}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function FieldGrid({
  fields,
  draft,
  official,
  issues,
  onChange,
  onRestore,
}: {
  fields: readonly BalanceFieldDefinition[]
  draft: Readonly<BalanceConfig>
  official: Readonly<BalanceConfig>
  issues: readonly BalanceValidationIssue[]
  onChange: (path: BalanceEditablePath, rawValue: string) => void
  onRestore: (path: BalanceEditablePath) => void
}) {
  return (
    <div className="balance-laboratory-field-grid">
      {fields.map((field) => (
        <BalanceNumberField
          key={field.path}
          field={field}
          draft={draft}
          official={official}
          issues={issues}
          onChange={onChange}
          onRestore={onRestore}
        />
      ))}
    </div>
  )
}

function BalanceLaboratoryWindow({ onClose }: { onClose: () => void }) {
  const snapshot = useSyncExternalStore(
    subscribeBalanceRuntime,
    getBalanceRuntimeSnapshot,
    getBalanceRuntimeSnapshot,
  )
  const [section, setSection] = useState<LaboratorySection>('costs')
  const [selectedSystem, setSelectedSystem] =
    useState<BalanceCostSystem>('click')
  const [draft, setDraft] = useState<BalanceConfig>(() =>
    cloneBalanceConfig(DEFAULT_BALANCE_CONFIG),
  )

  const validation = useMemo(() => validateBalanceConfig(draft), [draft])
  const issues = validation.issues
  const previewConfig = validation.valid ? validation.config : null
  const dirty = isBalanceDraftDirty(draft, DEFAULT_BALANCE_CONFIG)
  const changeCount = countBalanceDraftChanges(draft, DEFAULT_BALANCE_CONFIG)
  const errorCount = issues.filter((issue) => issue.severity === 'error').length
  const warningCount = issues.filter(
    (issue) => issue.severity === 'warning',
  ).length
  const selectedDefinition =
    BALANCE_COST_SYSTEMS.find((system) => system.id === selectedSystem) ??
    BALANCE_COST_SYSTEMS[0]
  const selectedCostFields = getCostFieldDefinitions(selectedSystem)
  const officialCostSamples = useMemo(
    () => simulateCostCurve(DEFAULT_BALANCE_CONFIG, selectedSystem),
    [selectedSystem],
  )
  const draftCostSamples = useMemo(
    () =>
      previewConfig ? simulateCostCurve(previewConfig, selectedSystem) : null,
    [previewConfig, selectedSystem],
  )
  const officialAutoclickSamples = useMemo(
    () => simulateAutoclickRates(DEFAULT_BALANCE_CONFIG),
    [],
  )
  const draftAutoclickSamples = useMemo(
    () => (previewConfig ? simulateAutoclickRates(previewConfig) : null),
    [previewConfig],
  )
  const diagnostics = useMemo(
    () =>
      previewConfig
        ? createBalanceDiagnostics(
            dirty ? previewConfig : DEFAULT_BALANCE_CONFIG,
          )
        : [],
    [dirty, previewConfig],
  )
  const storedProfile = useMemo(() => readStoredBalanceProfile(), [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  function updateDraft(path: BalanceEditablePath, rawValue: string) {
    const value = rawValue.trim() === '' ? Number.NaN : Number(rawValue)
    setDraft((current) => updateBalanceDraftNumber(current, path, value))
  }

  function restorePath(path: BalanceEditablePath) {
    setDraft((current) =>
      restoreBalanceDraftPath(current, DEFAULT_BALANCE_CONFIG, path),
    )
  }

  function restoreAll() {
    setDraft(cloneBalanceConfig(DEFAULT_BALANCE_CONFIG))
  }

  const statusLabel = errorCount > 0
    ? `${errorCount} error${errorCount === 1 ? '' : 'es'}`
    : dirty
      ? `${changeCount} cambio${changeCount === 1 ? '' : 's'} válido${changeCount === 1 ? '' : 's'}`
      : 'Sin cambios'

  return createPortal(
    <div
      className="balance-laboratory-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        className="balance-laboratory-window"
        role="dialog"
        aria-modal="true"
        aria-labelledby="balance-laboratory-title"
      >
        <header className="balance-laboratory-header">
          <div>
            <span>Herramientas de prueba</span>
            <h2 id="balance-laboratory-title">Laboratorio de Balance</h2>
            <p>
              Runtime activo: <strong>{snapshot.source}</strong> · revisión{' '}
              {snapshot.revision}
            </p>
          </div>
          <div className="balance-laboratory-header-actions">
            <span
              className="balance-laboratory-status"
              data-state={errorCount > 0 ? 'invalid' : dirty ? 'draft' : 'clean'}
            >
              {statusLabel}
            </span>
            <button type="button" onClick={onClose} aria-label="Cerrar laboratorio">
              ×
            </button>
          </div>
        </header>

        <div className="balance-laboratory-notice" role="status">
          <strong>Previsualización editable.</strong> Los campos modifican únicamente
          un borrador en memoria. El reducer, la partida y el guardado continúan
          usando los valores oficiales.
        </div>

        <nav className="balance-laboratory-tabs" aria-label="Secciones del laboratorio">
          {LABORATORY_SECTIONS.map((item) => (
            <button
              type="button"
              key={item.id}
              className={section === item.id ? 'is-active' : ''}
              aria-pressed={section === item.id}
              onClick={() => setSection(item.id)}
            >
              {item.label}
              {item.id === 'diagnostics' && (errorCount > 0 || warningCount > 0) && (
                <b>{errorCount + warningCount}</b>
              )}
            </button>
          ))}
        </nav>

        <main className="balance-laboratory-content">
          {section === 'costs' && (
            <div className="balance-laboratory-split">
              <section className="balance-laboratory-card">
                <div className="balance-laboratory-card-heading">
                  <div>
                    <span>Economía</span>
                    <h3>Curva de costos</h3>
                  </div>
                  <select
                    value={selectedSystem}
                    onChange={(event) =>
                      setSelectedSystem(
                        event.currentTarget.value as BalanceCostSystem,
                      )
                    }
                    aria-label="Sistema de costo"
                  >
                    {BALANCE_COST_SYSTEMS.map((system) => (
                      <option key={system.id} value={system.id}>
                        {system.label}
                      </option>
                    ))}
                  </select>
                </div>

                <p>
                  Edita los dos parámetros de {selectedDefinition.label}. La
                  estructura exponencial permanece fija durante esta fase.
                </p>

                <FieldGrid
                  fields={selectedCostFields}
                  draft={draft}
                  official={DEFAULT_BALANCE_CONFIG}
                  issues={issues}
                  onChange={updateDraft}
                  onRestore={restorePath}
                />
              </section>

              <section className="balance-laboratory-card">
                <div className="balance-laboratory-card-heading">
                  <div>
                    <span>Comparación</span>
                    <h3>Oficial frente a borrador</h3>
                  </div>
                </div>
                {draftCostSamples ? (
                  <ComparisonTable
                    headers={['Nivel', 'Oficial', 'Borrador', 'Diferencia']}
                    rows={officialCostSamples.map((officialSample, index) => {
                      const draftSample = draftCostSamples[index]
                      return {
                        key: String(officialSample.level),
                        direction: getDifferenceDirection(
                          officialSample.cost,
                          draftSample.cost,
                        ),
                        cells: [
                          officialSample.level,
                          numberFormat.format(officialSample.cost),
                          numberFormat.format(draftSample.cost),
                          formatDifference(
                            officialSample.cost,
                            draftSample.cost,
                          ),
                        ],
                      }
                    })}
                  />
                ) : (
                  <p className="balance-laboratory-empty">
                    Corrige los errores del borrador para recalcular la curva.
                  </p>
                )}
                <small>
                  Muestras: {BALANCE_COST_LEVEL_SAMPLES.join(', ')}. No se realizan
                  compras ni se modifica energía.
                </small>
              </section>
            </div>
          )}

          {section === 'core' && (
            <div className="balance-laboratory-split">
              <section className="balance-laboratory-card">
                <div className="balance-laboratory-card-heading">
                  <div>
                    <span>Núcleo</span>
                    <h3>Prestigio y Presión</h3>
                  </div>
                </div>
                <FieldGrid
                  fields={BALANCE_CORE_FIELDS}
                  draft={draft}
                  official={DEFAULT_BALANCE_CONFIG}
                  issues={issues}
                  onChange={updateDraft}
                  onRestore={restorePath}
                />
                {previewConfig && (
                  <ComparisonTable
                    headers={['Métrica', 'Oficial', 'Borrador', 'Diferencia']}
                    rows={[
                      {
                        key: 'sphere',
                        direction: getDifferenceDirection(
                          DEFAULT_BALANCE_CONFIG.core.sphereClickCapacity,
                          previewConfig.core.sphereClickCapacity,
                        ),
                        cells: [
                          'Clics para cristalizar',
                          numberFormat.format(
                            DEFAULT_BALANCE_CONFIG.core.sphereClickCapacity,
                          ),
                          numberFormat.format(
                            previewConfig.core.sphereClickCapacity,
                          ),
                          formatDifference(
                            DEFAULT_BALANCE_CONFIG.core.sphereClickCapacity,
                            previewConfig.core.sphereClickCapacity,
                          ),
                        ],
                      },
                      {
                        key: 'pressure',
                        direction: getDifferenceDirection(
                          DEFAULT_BALANCE_CONFIG.core.pressureBonusPerTier * 10,
                          previewConfig.core.pressureBonusPerTier * 10,
                        ),
                        cells: [
                          'Bono máximo por nivel',
                          `${numberFormat.format(DEFAULT_BALANCE_CONFIG.core.pressureBonusPerTier * 10)}%`,
                          `${numberFormat.format(previewConfig.core.pressureBonusPerTier * 10)}%`,
                          formatDifference(
                            DEFAULT_BALANCE_CONFIG.core.pressureBonusPerTier * 10,
                            previewConfig.core.pressureBonusPerTier * 10,
                          ),
                        ],
                      },
                    ]}
                  />
                )}
              </section>

              <section className="balance-laboratory-card">
                <div className="balance-laboratory-card-heading">
                  <div>
                    <span>Progresión inicial</span>
                    <h3>Requisitos de desbloqueo</h3>
                  </div>
                </div>
                <FieldGrid
                  fields={BALANCE_UNLOCK_FIELDS}
                  draft={draft}
                  official={DEFAULT_BALANCE_CONFIG}
                  issues={issues}
                  onChange={updateDraft}
                  onRestore={restorePath}
                />
              </section>
            </div>
          )}

          {section === 'autoclick' && (
            <div className="balance-laboratory-split">
              <section className="balance-laboratory-card">
                <div className="balance-laboratory-card-heading">
                  <div>
                    <span>Automatización</span>
                    <h3>Parámetros del Autoclicker</h3>
                  </div>
                </div>
                <FieldGrid
                  fields={BALANCE_AUTOCLICK_FIELDS}
                  draft={draft}
                  official={DEFAULT_BALANCE_CONFIG}
                  issues={issues}
                  onChange={updateDraft}
                  onRestore={restorePath}
                />
                <p>
                  Límite absoluto del motor: <strong>
                    {DEFAULT_BALANCE_CONFIG.engineLimits.maximumAutomaticClicksPerTick}
                  </strong>{' '}
                  clics por tick. Este valor no es editable.
                </p>
              </section>

              <section className="balance-laboratory-card">
                <div className="balance-laboratory-card-heading">
                  <div>
                    <span>Comparación</span>
                    <h3>Tasa por nivel</h3>
                  </div>
                </div>
                {draftAutoclickSamples ? (
                  <ComparisonTable
                    headers={['Nivel', 'Oficial', 'Borrador', 'Diferencia']}
                    rows={officialAutoclickSamples.map((officialSample, index) => {
                      const draftSample = draftAutoclickSamples[index]
                      return {
                        key: String(officialSample.level),
                        direction: getDifferenceDirection(
                          officialSample.value,
                          draftSample.value,
                        ),
                        cells: [
                          officialSample.level,
                          `${numberFormat.format(officialSample.value)} clic/s`,
                          `${numberFormat.format(draftSample.value)} clic/s`,
                          formatDifference(
                            officialSample.value,
                            draftSample.value,
                          ),
                        ],
                      }
                    })}
                  />
                ) : (
                  <p className="balance-laboratory-empty">
                    Corrige los errores del borrador para recalcular las tasas.
                  </p>
                )}
              </section>
            </div>
          )}

          {section === 'sapphire' && (
            <div className="balance-laboratory-split">
              <section className="balance-laboratory-card">
                <div className="balance-laboratory-card-heading">
                  <div>
                    <span>Metaprogresión</span>
                    <h3>Multiplicadores de Zafiro</h3>
                  </div>
                </div>
                <FieldGrid
                  fields={BALANCE_SAPPHIRE_FIELDS}
                  draft={draft}
                  official={DEFAULT_BALANCE_CONFIG}
                  issues={issues}
                  onChange={updateDraft}
                  onRestore={restorePath}
                />
                <p>
                  P0 permanece fijo en ×1.00. La validación exige que P1–P5 formen
                  una secuencia estrictamente creciente.
                </p>
              </section>

              <section className="balance-laboratory-card">
                <div className="balance-laboratory-card-heading">
                  <div>
                    <span>Comparación</span>
                    <h3>P0–P8</h3>
                  </div>
                </div>
                {previewConfig ? (
                  <ComparisonTable
                    headers={['Prestigio', 'Oficial', 'Borrador', 'Diferencia']}
                    rows={SAPPHIRE_PREVIEW_LEVELS.map((prestige) => {
                      const officialValue = getConfiguredSapphireMultiplier(
                        DEFAULT_BALANCE_CONFIG,
                        prestige,
                      )
                      const draftValue = getConfiguredSapphireMultiplier(
                        previewConfig,
                        prestige,
                      )
                      return {
                        key: String(prestige),
                        direction: getDifferenceDirection(
                          officialValue,
                          draftValue,
                        ),
                        cells: [
                          `P${prestige}`,
                          `×${officialValue.toFixed(2)}`,
                          `×${draftValue.toFixed(2)}`,
                          formatDifference(officialValue, draftValue),
                        ],
                      }
                    })}
                  />
                ) : (
                  <p className="balance-laboratory-empty">
                    Corrige la secuencia para recalcular la metaprogresión.
                  </p>
                )}
              </section>
            </div>
          )}

          {section === 'diagnostics' && (
            <div className="balance-laboratory-split">
              <section className="balance-laboratory-card">
                <div className="balance-laboratory-card-heading">
                  <div>
                    <span>Validación</span>
                    <h3>Estado del borrador</h3>
                  </div>
                </div>
                {issues.length === 0 ? (
                  <p className="balance-laboratory-success">
                    El borrador cumple la estructura, rangos y relaciones de
                    seguridad registradas.
                  </p>
                ) : (
                  <ul className="balance-laboratory-diagnostics">
                    {issues.map((issue) => (
                      <li
                        key={`${issue.path}-${issue.message}`}
                        data-severity={issue.severity}
                      >
                        <strong>{issue.severity}</strong>
                        <span>
                          <code>{issue.path}</code> · {issue.message}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                {diagnostics.length > 0 && (
                  <ul className="balance-laboratory-diagnostics">
                    {diagnostics.map((diagnostic) => (
                      <li
                        key={diagnostic.code}
                        data-severity={diagnostic.severity}
                      >
                        <strong>{diagnostic.severity}</strong>
                        <span>{diagnostic.message}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="balance-laboratory-card">
                <div className="balance-laboratory-card-heading">
                  <div>
                    <span>Protecciones</span>
                    <h3>Límites no editables</h3>
                  </div>
                </div>
                <dl className="balance-laboratory-limits">
                  <div>
                    <dt>Clics automáticos por tick</dt>
                    <dd>
                      {numberFormat.format(
                        DEFAULT_BALANCE_CONFIG.engineLimits
                          .maximumAutomaticClicksPerTick,
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>Iteraciones de Comprar todo</dt>
                    <dd>
                      {numberFormat.format(
                        DEFAULT_BALANCE_CONFIG.engineLimits
                          .maximumBulkPurchaseIterations,
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>Valor finito máximo</dt>
                    <dd>
                      {numberFormat.format(
                        DEFAULT_BALANCE_CONFIG.engineLimits.maximumFiniteValue,
                      )}
                    </dd>
                  </div>
                </dl>
                <p>
                  Perfil DEV guardado:{' '}
                  <strong>
                    {storedProfile.found
                      ? storedProfile.profile.name
                      : 'ninguno'}
                  </strong>
                </p>
                <p>
                  La aplicación de perfiles, normalización de estado y persistencia
                  siguen bloqueadas hasta la fase siguiente.
                </p>
              </section>
            </div>
          )}
        </main>

        <footer className="balance-laboratory-footer">
          <span>
            Borrador temporal · al cerrar se descarta · guardado DEV separado:{' '}
            <code>incremental-game-a:balance-dev:v1</code>
          </span>
          <div>
            <button type="button" onClick={restoreAll} disabled={!dirty}>
              Restaurar valores oficiales
            </button>
            <button
              type="button"
              className="is-primary"
              disabled
              title="Se habilitará después de implementar normalización y rollback"
            >
              Aplicar a sesión · Fase 3
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

export function BalanceLaboratorySystem() {
  const host = useDeveloperPanelHost()
  const [open, setOpen] = useState(false)

  return (
    <>
      {host &&
        createPortal(
          <section className="developer-balance-access">
            <span>Economía y progresión</span>
            <button type="button" onClick={() => setOpen(true)}>
              <span aria-hidden="true">∑</span>
              <span>
                <strong>Laboratorio de Balance</strong>
                <small>Editar borradores y comparar curvas</small>
              </span>
              <b aria-hidden="true">ABRIR</b>
            </button>
          </section>,
          host,
        )}
      {open && <BalanceLaboratoryWindow onClose={() => setOpen(false)} />}
    </>
  )
}
