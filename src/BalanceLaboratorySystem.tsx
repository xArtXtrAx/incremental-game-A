import {
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react'
import { createPortal } from 'react-dom'
import {
  useDeveloperPanelLauncherHost,
  useDeveloperPanelWorkspaceHost,
} from './developerPanelWorkspace'
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
  requestBalanceSessionApply,
  requestBalanceSessionPreview,
  requestOfficialBalanceRestore,
} from './balanceSessionBridge'
import { getBlockedBalanceSessionPaths } from './balanceSessionPolicy'
import {
  BALANCE_COST_LEVEL_SAMPLES,
  createBalanceDiagnostics,
  getConfiguredSapphireMultiplier,
  simulateAutoclickRates,
  simulateCostCurve,
} from './balanceSimulation'
import type { BalanceNormalizationChange } from './balanceStateNormalization'
import {
  validateBalanceConfig,
  type BalanceValidationIssue,
} from './balanceValidation'
import {
  clearMathematicalTemplateTransfer,
  getMathematicalTemplateTransferSnapshot,
  subscribeMathematicalTemplateTransfer,
} from './mathematicalTemplateTransfer'

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

function NormalizationList({
  changes,
  emptyMessage = 'La configuración no requiere ajustes sobre la partida.',
}: {
  changes: readonly BalanceNormalizationChange[]
  emptyMessage?: string
}) {
  if (changes.length === 0) {
    return (
      <p className="balance-laboratory-success">
        {emptyMessage}
      </p>
    )
  }

  return (
    <ul className="balance-laboratory-diagnostics">
      {changes.map((change) => (
        <li
          key={`${change.path}-${change.before}-${change.after}`}
          data-severity={change.severity}
        >
          <strong>{change.severity}</strong>
          <span>
            {change.label}: {change.beforeLabel ?? numberFormat.format(change.before)} →{' '}
            {change.afterLabel ?? numberFormat.format(change.after)} · {change.reason}
          </span>
        </li>
      ))}
    </ul>
  )
}

function BalanceLaboratoryWindow({
  onClose,
  portalHost,
}: {
  onClose: () => void
  portalHost: HTMLElement
}) {
  const snapshot = useSyncExternalStore(
    subscribeBalanceRuntime,
    getBalanceRuntimeSnapshot,
    getBalanceRuntimeSnapshot,
  )
  const transferSnapshot = useSyncExternalStore(
    subscribeMathematicalTemplateTransfer,
    getMathematicalTemplateTransferSnapshot,
    getMathematicalTemplateTransferSnapshot,
  )
  const transferredCandidate = transferSnapshot.candidate
  const [section, setSection] = useState<LaboratorySection>('costs')
  const [selectedSystem, setSelectedSystem] =
    useState<BalanceCostSystem>('click')
  const [draft, setDraft] = useState<BalanceConfig>(() =>
    cloneBalanceConfig(getBalanceRuntimeSnapshot().config),
  )
  const [sessionMessage, setSessionMessage] = useState(
    'El borrador aún no se ha aplicado a la sesión.',
  )
  const [previewNormalization, setPreviewNormalization] = useState<
    readonly BalanceNormalizationChange[]
  >([])
  const [lastNormalization, setLastNormalization] = useState<
    readonly BalanceNormalizationChange[]
  >([])

  const validation = useMemo(() => validateBalanceConfig(draft), [draft])
  const issues = validation.issues
  const previewConfig = validation.valid ? validation.config : null
  const dirty = isBalanceDraftDirty(draft, DEFAULT_BALANCE_CONFIG)
  const changeCount = countBalanceDraftChanges(draft, DEFAULT_BALANCE_CONFIG)
  const blockedPaths = useMemo(
    () => getBlockedBalanceSessionPaths(draft),
    [draft],
  )
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
  const canApply =
    previewConfig !== null && dirty && blockedPaths.length === 0 && errorCount === 0

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  useEffect(() => {
    if (!previewConfig) {
      setPreviewNormalization([])
      return
    }

    const outcome = requestBalanceSessionPreview(previewConfig)
    setPreviewNormalization(outcome.normalization?.changes ?? [])
  }, [previewConfig])

  function updateDraft(path: BalanceEditablePath, rawValue: string) {
    const value = rawValue.trim() === '' ? Number.NaN : Number(rawValue)
    setDraft((current) => updateBalanceDraftNumber(current, path, value))
    setSessionMessage('Borrador modificado; los cambios aún no afectan la partida.')
  }

  function restorePath(path: BalanceEditablePath) {
    setDraft((current) =>
      restoreBalanceDraftPath(current, DEFAULT_BALANCE_CONFIG, path),
    )
    setSessionMessage('El campo volvió a su valor oficial.')
  }

  function restoreDraft() {
    setDraft(cloneBalanceConfig(DEFAULT_BALANCE_CONFIG))
    setSessionMessage('El borrador volvió a los valores oficiales.')
  }

  function useTransferredDraft() {
    if (!transferredCandidate) return

    setDraft(cloneBalanceConfig(transferredCandidate.config))
    if (transferredCandidate.target === 'sapphire-multipliers') {
      setSection('sapphire')
    } else {
      setSection('costs')
      setSelectedSystem('click')
    }
    setSessionMessage(
      `Borrador “${transferredCandidate.name}” recibido desde Plantillas Matemáticas; aún no afecta la partida.`,
    )
    setLastNormalization([])
    clearMathematicalTemplateTransfer()
  }

  function discardTransferredDraft() {
    if (!transferredCandidate) return
    const name = transferredCandidate.name
    clearMathematicalTemplateTransfer()
    setSessionMessage(
      `La transferencia “${name}” fue descartada sin modificar el borrador.`,
    )
  }

  function applyDraftToSession() {
    if (!previewConfig || !canApply) return

    const outcome = requestBalanceSessionApply(previewConfig)
    setSessionMessage(outcome.message)
    setLastNormalization(outcome.normalization?.changes ?? [])
    if (outcome.applied) {
      setSection('diagnostics')
    }
  }

  function restoreOfficialSession() {
    const outcome = requestOfficialBalanceRestore()
    setSessionMessage(outcome.message)
    setLastNormalization(outcome.normalization?.changes ?? [])
    if (outcome.applied) {
      setDraft(cloneBalanceConfig(DEFAULT_BALANCE_CONFIG))
      setSection('diagnostics')
    }
  }

  const statusLabel = errorCount > 0
    ? `${errorCount} error${errorCount === 1 ? '' : 'es'}`
    : dirty
      ? `${changeCount} cambio${changeCount === 1 ? '' : 's'} válido${changeCount === 1 ? '' : 's'}`
      : 'Sin cambios'

  return createPortal(
    <div
      className="balance-laboratory-backdrop developer-workspace-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        className="balance-laboratory-window"
        role="dialog"
        aria-modal="false"
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
          <strong>Cobertura completa de sesión.</strong> Costos, Núcleo,
          desbloqueos, Autoclicker y Zafiro comparten ahora la misma configuración
          autoritativa. La previsualización no modifica la partida.
        </div>

        {transferredCandidate && (
          <div
            className="mathematical-template-transfer-banner"
            data-testid="laboratory-template-transfer"
          >
            <div>
              <span>PLANTILLA MATEMÁTICA RECIBIDA</span>
              <strong>{transferredCandidate.name}</strong>
              <small>
                Destino: {transferredCandidate.specification.target}. No se ha
                aplicado al borrador ni a la sesión.
              </small>
            </div>
            <div>
              <button type="button" onClick={discardTransferredDraft}>
                Descartar
              </button>
              <button
                type="button"
                className="is-primary"
                data-testid="use-template-in-laboratory"
                onClick={useTransferredDraft}
              >
                Usar en borrador
              </button>
            </div>
          </div>
        )}

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
              {item.id === 'diagnostics' &&
                (errorCount > 0 || warningCount > 0) && (
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
                    <span>Economía · aplicable</span>
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
                  Edita los parámetros de {selectedDefinition.label}. La forma
                  exponencial de la curva permanece fija.
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
                    Corrige los errores para recalcular la curva.
                  </p>
                )}
                <small>Muestras: {BALANCE_COST_LEVEL_SAMPLES.join(', ')}.</small>
              </section>
            </div>
          )}

          {section === 'core' && (
            <div className="balance-laboratory-split">
              <section className="balance-laboratory-card">
                <div className="balance-laboratory-card-heading">
                  <div>
                    <span>Núcleo · aplicable</span>
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
              </section>

              <section className="balance-laboratory-card">
                <div className="balance-laboratory-card-heading">
                  <div>
                    <span>Progresión · aplicable</span>
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
                <p>
                  Elevar un requisito no elimina niveles existentes ni detiene el
                  sistema comprado. Solo bloquea la compra del siguiente nivel
                  hasta volver a cumplirlo.
                </p>
              </section>
            </div>
          )}

          {section === 'autoclick' && (
            <div className="balance-laboratory-split">
              <section className="balance-laboratory-card">
                <div className="balance-laboratory-card-heading">
                  <div>
                    <span>Automatización · aplicable</span>
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
                  Límite del motor: <strong>
                    {DEFAULT_BALANCE_CONFIG.engineLimits.maximumAutomaticClicksPerTick}
                  </strong>{' '}
                  clics por tick. No es editable.
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
                    Corrige los errores para recalcular las tasas.
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
                    <span>Metaprogresión · aplicable</span>
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
                  P0 permanece fijo en ×1.00 y P1–P5 deben crecer estrictamente.
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
                    El borrador cumple estructura, rangos y relaciones de seguridad.
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
                    <span>Previsualización</span>
                    <h3>Impacto antes de aplicar</h3>
                  </div>
                </div>
                <NormalizationList
                  changes={previewNormalization}
                  emptyMessage="El borrador no altera cargas, efectos ni disponibilidad actual."
                />

                <div className="balance-laboratory-card-heading">
                  <div>
                    <span>Sesión</span>
                    <h3>Última transición aplicada</h3>
                  </div>
                </div>
                <p>{sessionMessage}</p>
                <NormalizationList
                  changes={lastNormalization}
                  emptyMessage="Todavía no se ha aplicado una transición que requiera ajustes."
                />
                <p>
                  Perfil DEV guardado:{' '}
                  <strong>
                    {storedProfile.found
                      ? storedProfile.profile.name
                      : 'ninguno'}
                  </strong>
                </p>
                <p>
                  Al recargar, el runtime vuelve automáticamente al balance oficial.
                </p>
              </section>
            </div>
          )}
        </main>

        <footer className="balance-laboratory-footer">
          <span>
            Fuente activa: <strong>{snapshot.source}</strong> · los perfiles de
            sesión no se guardan.
          </span>
          <div>
            <button type="button" onClick={restoreDraft} disabled={!dirty}>
              Restaurar borrador
            </button>
            <button
              type="button"
              className="is-primary"
              disabled={!canApply}
              title="Aplicar borrador únicamente a esta sesión."
              onClick={applyDraftToSession}
            >
              Aplicar a sesión
            </button>
            <button
              type="button"
              disabled={snapshot.source === 'official'}
              onClick={restoreOfficialSession}
            >
              Restaurar sesión oficial
            </button>
            <button type="button" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </footer>
      </section>
    </div>,
    portalHost,
  )
}

export function BalanceLaboratorySystem() {
  const host = useDeveloperPanelLauncherHost()
  const workspaceHost = useDeveloperPanelWorkspaceHost()
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
                <small>Comparar y aplicar perfiles completos</small>
              </span>
              <b aria-hidden="true">ABRIR</b>
            </button>
          </section>,
          host,
        )}
      {open && workspaceHost && (
        <BalanceLaboratoryWindow
          portalHost={workspaceHost}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
