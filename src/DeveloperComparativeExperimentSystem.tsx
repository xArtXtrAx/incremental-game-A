import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react'
import { createPortal } from 'react-dom'
import {
  useDeveloperPanelLauncherHost,
  useDeveloperPanelWorkspaceHost,
  usePortalHost,
} from './developerPanelWorkspace'
import { DEFAULT_BALANCE_CONFIG } from './balanceConfig'
import {
  createBrowserBalanceProfileRepository,
  type BalanceDevProfile,
} from './balanceProfiles'
import {
  COMPARATIVE_MAX_SECONDS,
  COMPARATIVE_UPGRADE_OPTIONS,
  createOfficialComparativeCandidate,
  exportComparativeExperimentCsv,
  runComparativeExperiment,
  type ComparativeBalanceCandidate,
  type ComparativeExperimentComparison,
  type ComparativeStopCondition,
  type ComparativeUpgradeId,
} from './comparativeExperiment'
import {
  createBrowserDeveloperScenarioRepository,
  createBuiltInDeveloperScenarios,
  type DeveloperScenario,
} from './developerScenarios'
import {
  clearMathematicalTemplateTransfer,
  getMathematicalTemplateTransferSnapshot,
  subscribeMathematicalTemplateTransfer,
} from './mathematicalTemplateTransfer'
import './DeveloperComparativeExperimentSystem.css'

const numberFormat = new Intl.NumberFormat('es-MX', {
  maximumFractionDigits: 2,
})
const durationOptions = [300, 900, 1_800, 3_600, 7_200] as const
const clickRateOptions = [0, 1, 2, 5, 10, 20] as const

function formatSeconds(value: number | null) {
  if (value === null) return 'No alcanzado'
  if (value < 60) return `${numberFormat.format(value)} s`
  return `${numberFormat.format(value / 60)} min`
}

function formatMetric(value: number | null, unit: string) {
  if (value === null) return '—'
  return `${numberFormat.format(value)}${unit ? ` ${unit}` : ''}`
}

function downloadText(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function profileToCandidate(
  profile: BalanceDevProfile,
): ComparativeBalanceCandidate {
  return {
    id: `profile:${profile.id}`,
    name: profile.name,
    source: 'profile',
    config: structuredClone(profile.config),
  }
}

function ComparisonResults({
  comparison,
}: {
  comparison: ComparativeExperimentComparison
}) {
  const { runA, runB } = comparison

  return (
    <div className="comparative-results" data-testid="comparative-results">
      <section className="comparative-summary-grid">
        {[runA, runB].map((run, index) => (
          <article key={`${run.candidate.id}-${index}`} data-side={index === 0 ? 'A' : 'B'}>
            <span>PERFIL {index === 0 ? 'A' : 'B'}</span>
            <h3>{run.candidate.name}</h3>
            <dl>
              <div>
                <dt>Final</dt>
                <dd>{run.endedBy}</dd>
              </div>
              <div>
                <dt>Tiempo</dt>
                <dd>{formatSeconds(run.elapsedSeconds)}</dd>
              </div>
              <div>
                <dt>Energía</dt>
                <dd>{numberFormat.format(run.finalState.energy)}</dd>
              </div>
              <div>
                <dt>Producción efectiva</dt>
                <dd>{numberFormat.format(run.effectiveProductionPerSecond)}/s</dd>
              </div>
              <div>
                <dt>Compras</dt>
                <dd>{run.purchaseCount}</dd>
              </div>
              <div>
                <dt>Acciones</dt>
                <dd>{numberFormat.format(run.actionCount)}</dd>
              </div>
            </dl>
          </article>
        ))}
      </section>

      <section className="comparative-table-card">
        <div className="comparative-section-heading">
          <div>
            <span>RESULTADO</span>
            <h3>Comparación de métricas</h3>
          </div>
          <b>{comparison.scenarioName}</b>
        </div>
        <div className="comparative-table-scroll">
          <table>
            <thead>
              <tr>
                <th>Métrica</th>
                <th>{runA.candidate.name}</th>
                <th>{runB.candidate.name}</th>
                <th>Delta B − A</th>
                <th>Ventaja</th>
              </tr>
            </thead>
            <tbody>
              {comparison.metrics.map((row) => (
                <tr key={row.id}>
                  <th>{row.label}</th>
                  <td>{formatMetric(row.valueA, row.unit)}</td>
                  <td>{formatMetric(row.valueB, row.unit)}</td>
                  <td>
                    {row.delta === null
                      ? '—'
                      : `${row.delta > 0 ? '+' : ''}${formatMetric(row.delta, row.unit)}`}
                    {row.percentDelta !== null && (
                      <small>
                        {row.percentDelta > 0 ? '+' : ''}
                        {numberFormat.format(row.percentDelta)}%
                      </small>
                    )}
                  </td>
                  <td data-winner={row.winner}>
                    {row.winner === 'none'
                      ? 'Informativa'
                      : row.winner === 'tie'
                        ? 'Empate'
                        : `Perfil ${row.winner}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="comparative-table-card">
        <div className="comparative-section-heading">
          <div>
            <span>HITOS</span>
            <h3>Evoluciones y retorno estimado</h3>
          </div>
          <small>Producción automática + clics configurados.</small>
        </div>
        <div className="comparative-table-scroll">
          <table>
            <thead>
              <tr>
                <th>Evolución</th>
                <th>A: primer acceso</th>
                <th>A: nivel / ROI</th>
                <th>B: primer acceso</th>
                <th>B: nivel / ROI</th>
              </tr>
            </thead>
            <tbody>
              {runA.upgradeMilestones.map((milestoneA, index) => {
                const milestoneB = runB.upgradeMilestones[index]
                return (
                  <tr key={milestoneA.upgradeId}>
                    <th>{milestoneA.label}</th>
                    <td>{formatSeconds(milestoneA.firstPurchasedAt)}</td>
                    <td>
                      N{milestoneA.finalLevel}
                      <small>
                        ROI {formatSeconds(milestoneA.averageEstimatedReturnSeconds)}
                      </small>
                    </td>
                    <td>{formatSeconds(milestoneB.firstPurchasedAt)}</td>
                    <td>
                      N{milestoneB.finalLevel}
                      <small>
                        ROI {formatSeconds(milestoneB.averageEstimatedReturnSeconds)}
                      </small>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function ComparativeWindow({
  onClose,
  portalHost,
}: {
  onClose: () => void
  portalHost: HTMLElement
}) {
  const profileRepository = useMemo(
    () => createBrowserBalanceProfileRepository(),
    [],
  )
  const scenarioRepository = useMemo(
    () => createBrowserDeveloperScenarioRepository(),
    [],
  )
  const transferSnapshot = useSyncExternalStore(
    subscribeMathematicalTemplateTransfer,
    getMathematicalTemplateTransferSnapshot,
    getMathematicalTemplateTransferSnapshot,
  )
  const transferredCandidate = transferSnapshot.candidate
  const [profiles, setProfiles] = useState<BalanceDevProfile[]>([])
  const [scenarios, setScenarios] = useState<DeveloperScenario[]>([])
  const [scenarioId, setScenarioId] = useState('builtin-mid-first-cycle')
  const [candidateAId, setCandidateAId] = useState('official')
  const [candidateBId, setCandidateBId] = useState('official')
  const [durationSeconds, setDurationSeconds] = useState(900)
  const [manualClicksPerSecond, setManualClicksPerSecond] = useState(2)
  const [stopCondition, setStopCondition] =
    useState<ComparativeStopCondition>('duration')
  const [targetUpgradeId, setTargetUpgradeId] =
    useState<ComparativeUpgradeId>('generator')
  const [targetUpgradeLevel, setTargetUpgradeLevel] = useState(3)
  const [autoPurchase, setAutoPurchase] = useState(true)
  const [autoCrystallize, setAutoCrystallize] = useState(true)
  const [comparison, setComparison] =
    useState<ComparativeExperimentComparison | null>(null)
  const [message, setMessage] = useState('Comparador listo.')
  const [hasError, setHasError] = useState(false)
  const [running, setRunning] = useState(false)

  const transientCandidate = useMemo<ComparativeBalanceCandidate | null>(
    () =>
      transferredCandidate
        ? {
            id: transferredCandidate.id,
            name: `${transferredCandidate.name} · transitoria`,
            source: 'template',
            config: structuredClone(transferredCandidate.config),
          }
        : null,
    [transferredCandidate],
  )

  const candidates = useMemo(
    () => [
      createOfficialComparativeCandidate(),
      ...(transientCandidate ? [transientCandidate] : []),
      ...profiles.map(profileToCandidate),
    ],
    [profiles, transientCandidate],
  )

  const refreshLibraries = useCallback(() => {
    const profileResult = profileRepository.list()
    if (!profileResult.ok) {
      setHasError(true)
      setMessage(
        profileResult.issues[0]?.message ??
          'No fue posible leer los perfiles DEV.',
      )
      return
    }

    const scenarioResult = scenarioRepository.list()
    if (!scenarioResult.ok) {
      setHasError(true)
      setMessage(
        scenarioResult.issues[0]?.message ??
          'No fue posible leer los escenarios DEV.',
      )
      return
    }

    const builtIns = createBuiltInDeveloperScenarios(
      DEFAULT_BALANCE_CONFIG.core.sphereClickCapacity,
    )
    const nextProfiles = profileResult.value
    const profileCandidateIds = nextProfiles.map(
      (profile) => `profile:${profile.id}`,
    )
    const candidateIds = [
      ...(transferredCandidate ? [transferredCandidate.id] : []),
      ...profileCandidateIds,
    ]

    setProfiles(nextProfiles)
    setScenarios([...builtIns, ...scenarioResult.value])
    setCandidateAId((current) =>
      current === 'official' || candidateIds.includes(current)
        ? current
        : 'official',
    )
    setCandidateBId((current) => {
      if (current !== 'official' && candidateIds.includes(current)) return current
      return transferredCandidate?.id ?? profileCandidateIds[0] ?? 'official'
    })
    setHasError(false)
    setMessage(
      transferredCandidate
        ? `Plantilla transitoria “${transferredCandidate.name}” seleccionada como Perfil B.`
        : nextProfiles.length > 0
          ? 'Perfiles y escenarios actualizados.'
          : 'No hay perfiles guardados; puedes comparar Oficial contra Oficial.',
    )
  }, [profileRepository, scenarioRepository, transferredCandidate])

  useEffect(() => {
    refreshLibraries()
  }, [refreshLibraries])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  function discardTransientCandidate() {
    if (!transferredCandidate) return
    const discardedId = transferredCandidate.id
    clearMathematicalTemplateTransfer()
    if (candidateAId === discardedId) setCandidateAId('official')
    if (candidateBId === discardedId) setCandidateBId('official')
    setComparison(null)
    setHasError(false)
    setMessage('El candidato matemático transitorio fue descartado.')
  }

  function runExperiment() {
    const scenario = scenarios.find((item) => item.id === scenarioId)
    const candidateA = candidates.find((item) => item.id === candidateAId)
    const candidateB = candidates.find((item) => item.id === candidateBId)

    if (!scenario || !candidateA || !candidateB) {
      setHasError(true)
      setMessage('Selecciona un escenario y dos balances válidos.')
      return
    }

    setRunning(true)
    setHasError(false)
    setMessage('Ejecutando ambos recorridos con el mismo reloj…')

    window.setTimeout(() => {
      const result = runComparativeExperiment({
        scenario,
        candidateA,
        candidateB,
        settings: {
          durationSeconds,
          manualClicksPerSecond,
          autoPurchase,
          autoCrystallize,
          stopCondition,
          targetUpgradeId,
          targetUpgradeLevel,
        },
        startedAt: Date.now(),
      })

      if (!result.ok) {
        setComparison(null)
        setHasError(true)
        setMessage(
          result.issues[0]?.message ?? 'La comparación no pudo completarse.',
        )
      } else {
        setComparison(result.value)
        setHasError(false)
        setMessage(
          `Comparación terminada: ${result.value.runA.actionCount + result.value.runB.actionCount} acciones deterministas.`,
        )
      }
      setRunning(false)
    }, 0)
  }

  function exportJson() {
    if (!comparison) return
    downloadText(
      `comparacion-${comparison.scenarioId}.json`,
      JSON.stringify(comparison, null, 2),
      'application/json',
    )
  }

  function exportCsv() {
    if (!comparison) return
    downloadText(
      `comparacion-${comparison.scenarioId}.csv`,
      exportComparativeExperimentCsv(comparison),
      'text/csv;charset=utf-8',
    )
  }

  return createPortal(
    <div className="comparative-overlay developer-workspace-overlay" role="presentation">
      <section
        className="comparative-window"
        role="dialog"
        aria-modal="false"
        aria-labelledby="comparative-title"
      >
        <header className="comparative-header">
          <div>
            <span>FASE 5.6 · SIMULACIÓN AISLADA</span>
            <h2 id="comparative-title">Comparador de Experimentos A/B</h2>
            <p>
              Dos balances, un escenario y una secuencia determinista sin
              modificar la partida ni el runtime visible.
            </p>
          </div>
          <div>
            <b>{running ? 'EJECUTANDO' : 'LISTO'}</b>
            <button type="button" onClick={onClose} aria-label="Cerrar">
              ×
            </button>
          </div>
        </header>

        <main className="comparative-content">
          <section className="comparative-config-card">
            <div className="comparative-section-heading">
              <div>
                <span>CONFIGURACIÓN</span>
                <h3>Condiciones idénticas</h3>
              </div>
              <button type="button" onClick={refreshLibraries}>
                Actualizar bibliotecas
              </button>
            </div>

            {transferredCandidate && (
              <div
                className="mathematical-template-transfer-banner"
                data-testid="comparative-template-transfer"
              >
                <div>
                  <span>CANDIDATO MATEMÁTICO TRANSITORIO</span>
                  <strong>{transferredCandidate.name}</strong>
                  <small>
                    Disponible solo en memoria. No se guardó como perfil y no
                    modifica la partida.
                  </small>
                </div>
                <div>
                  <button type="button" onClick={discardTransientCandidate}>
                    Descartar candidato
                  </button>
                </div>
              </div>
            )}

            <div className="comparative-form-grid">
              <label>
                <span>Escenario</span>
                <select
                  value={scenarioId}
                  onChange={(event) => setScenarioId(event.currentTarget.value)}
                >
                  {scenarios.map((scenario) => (
                    <option key={scenario.id} value={scenario.id}>
                      {scenario.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Perfil A</span>
                <select
                  data-testid="comparative-profile-a"
                  value={candidateAId}
                  onChange={(event) => setCandidateAId(event.currentTarget.value)}
                >
                  {candidates.map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>
                      {candidate.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Perfil B</span>
                <select
                  data-testid="comparative-profile-b"
                  value={candidateBId}
                  onChange={(event) => setCandidateBId(event.currentTarget.value)}
                >
                  {candidates.map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>
                      {candidate.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Condición de parada</span>
                <select
                  value={stopCondition}
                  onChange={(event) =>
                    setStopCondition(
                      event.currentTarget.value as ComparativeStopCondition,
                    )
                  }
                >
                  <option value="duration">Duración máxima</option>
                  <option value="core-filled">Núcleo lleno</option>
                  <option value="first-crystallization">
                    Primera cristalización
                  </option>
                  <option value="target-upgrade">Evolución objetivo</option>
                </select>
              </label>

              <label>
                <span>Límite temporal</span>
                <select
                  value={durationSeconds}
                  onChange={(event) =>
                    setDurationSeconds(Number(event.currentTarget.value))
                  }
                >
                  {durationOptions.map((seconds) => (
                    <option key={seconds} value={seconds}>
                      {seconds / 60} min
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Clics manuales por segundo</span>
                <select
                  value={manualClicksPerSecond}
                  onChange={(event) =>
                    setManualClicksPerSecond(Number(event.currentTarget.value))
                  }
                >
                  {clickRateOptions.map((rate) => (
                    <option key={rate} value={rate}>
                      {rate}/s
                    </option>
                  ))}
                </select>
              </label>

              {stopCondition === 'target-upgrade' && (
                <>
                  <label>
                    <span>Evolución objetivo</span>
                    <select
                      value={targetUpgradeId}
                      onChange={(event) =>
                        setTargetUpgradeId(
                          event.currentTarget.value as ComparativeUpgradeId,
                        )
                      }
                    >
                      {COMPARATIVE_UPGRADE_OPTIONS.map((upgrade) => (
                        <option key={upgrade.id} value={upgrade.id}>
                          {upgrade.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Nivel objetivo</span>
                    <input
                      type="number"
                      min={1}
                      max={1_000}
                      value={targetUpgradeLevel}
                      onChange={(event) =>
                        setTargetUpgradeLevel(Number(event.currentTarget.value))
                      }
                    />
                  </label>
                </>
              )}
            </div>

            <div className="comparative-toggle-row">
              <label>
                <input
                  type="checkbox"
                  checked={autoPurchase}
                  onChange={(event) => setAutoPurchase(event.currentTarget.checked)}
                />
                Comprar automáticamente la evolución disponible más barata
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={autoCrystallize}
                  disabled={stopCondition === 'core-filled'}
                  onChange={(event) =>
                    setAutoCrystallize(event.currentTarget.checked)
                  }
                />
                Cristalizar automáticamente al llenar el núcleo
              </label>
            </div>

            <div className="comparative-run-row">
              <p>
                Máximo: {COMPARATIVE_MAX_SECONDS / 60} minutos y 250,000
                acciones por recorrido. No se escriben claves de guardado.
              </p>
              <button
                type="button"
                className="is-primary"
                data-testid="comparative-run"
                disabled={running || scenarios.length === 0}
                onClick={runExperiment}
              >
                {running ? 'Ejecutando…' : 'Ejecutar comparación A/B'}
              </button>
            </div>
          </section>

          {comparison ? (
            <>
              <div className="comparative-export-row">
                <button type="button" onClick={exportJson}>
                  Exportar JSON
                </button>
                <button type="button" onClick={exportCsv}>
                  Exportar CSV
                </button>
              </div>
              <ComparisonResults comparison={comparison} />
            </>
          ) : (
            <section className="comparative-empty-state">
              <span>A/B</span>
              <h3>Configura y ejecuta el primer experimento</h3>
              <p>
                El resultado mostrará diferencias, hitos, tiempos sin decisiones
                y retorno estimado por evolución.
              </p>
            </section>
          )}
        </main>

        <footer className="comparative-footer">
          <span data-error={hasError || undefined} role="status">
            {message}
          </span>
          <span>Override transitorio · sin eventos · sin persistencia</span>
        </footer>
      </section>
    </div>,
    portalHost,
  )
}

export function DeveloperComparativeExperimentSystem() {
  const developerPanelHost = useDeveloperPanelLauncherHost()
  const workspaceHost = useDeveloperPanelWorkspaceHost()
  const toolsHost = usePortalHost('.developer-tools-grid')
  const [open, setOpen] = useState(false)

  return (
    <>
      {developerPanelHost &&
        createPortal(
          <section className="developer-comparison-access">
            <span>Balance comparativo</span>
            <button type="button" onClick={() => setOpen(true)}>
              <span aria-hidden="true">A/B</span>
              <span>
                <strong>Comparador de Experimentos</strong>
                <small>Dos perfiles bajo condiciones idénticas</small>
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
            className="developer-comparison-tool-button"
            onClick={() => setOpen(true)}
          >
            <span>A/B</span>
            <strong>Comparador de Experimentos</strong>
            <small>Ejecutar dos balances sobre el mismo escenario.</small>
          </button>,
          toolsHost,
        )}

      {open && workspaceHost && (
        <ComparativeWindow
          portalHost={workspaceHost}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
