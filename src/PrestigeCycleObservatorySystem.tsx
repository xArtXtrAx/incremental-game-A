import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { DEFAULT_BALANCE_CONFIG } from './balanceConfig'
import {
  createBrowserBalanceProfileRepository,
  type BalanceDevProfile,
} from './balanceProfiles'
import {
  useDeveloperPanelLauncherHost,
  useDeveloperPanelWorkspaceHost,
  usePortalHost,
} from './developerPanelWorkspace'
import {
  requestDeveloperExperiment,
  type DeveloperExperimentSnapshot,
} from './developerExperimentBridge'
import {
  createBrowserDeveloperScenarioRepository,
  createBuiltInDeveloperScenarios,
  type DeveloperScenario,
} from './developerScenarios'
import { getDeveloperSimulationMetrics } from './developerSimulation'
import { getSapphireMultiplier } from './game'
import {
  exportPrestigeCycleCsv,
  PRESTIGE_CYCLE_MAX_SECONDS,
  runPrestigeCycleExperiment,
  type PrestigeCycleCandidate,
  type PrestigeCycleComparison,
  type PrestigeCycleRecord,
  type PrestigeCycleRun,
} from './prestigeCycleObservatory'
import {
  advanceLivePrestigeCycleState,
  createLivePrestigeCycleState,
  getLiveAverageCycleSeconds,
  getLiveCycleElapsedSeconds,
  type LivePrestigeCycleState,
} from './prestigeCycleLive'
import './PrestigeCycleObservatorySystem.css'

const numberFormat = new Intl.NumberFormat('es-MX', {
  maximumFractionDigits: 2,
})
const durationOptions = [900, 3_600, 7_200, 21_600] as const
const clickRateOptions = [0, 1, 2, 5, 10, 20] as const
const cycleOptions = [1, 2, 3, 5, 8, 10] as const

type ObservatoryTab = 'live' | 'simulation'

function formatSeconds(value: number | null) {
  if (value === null) return 'No disponible'
  if (value < 60) return `${numberFormat.format(value)} s`
  if (value < 3_600) return `${numberFormat.format(value / 60)} min`
  return `${numberFormat.format(value / 3_600)} h`
}

function formatValue(value: number | null, unit = '') {
  if (value === null) return '—'
  return `${numberFormat.format(value)}${unit}`
}

function downloadText(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function profileToCandidate(profile: BalanceDevProfile): PrestigeCycleCandidate {
  return {
    id: `profile:${profile.id}`,
    name: profile.name,
    config: structuredClone(profile.config),
  }
}

function createOfficialCandidate(): PrestigeCycleCandidate {
  return {
    id: 'official',
    name: 'Balance oficial',
    config: structuredClone(DEFAULT_BALANCE_CONFIG),
  }
}

function CycleDurationChart({ run }: { run: PrestigeCycleRun }) {
  const maximum = Math.max(
    1,
    ...run.completedCycles.map((cycle) => cycle.durationSeconds),
  )

  return (
    <article className="prestige-cycle-chart-card">
      <span>{run.candidate.name}</span>
      <div className="prestige-cycle-bars">
        {run.completedCycles.length === 0 ? (
          <p>No completó ciclos dentro del límite.</p>
        ) : (
          run.completedCycles.map((cycle) => (
            <div key={`${run.candidate.id}-${cycle.index}`}>
              <b>P{cycle.prestigeBefore}→P{cycle.prestigeAfter}</b>
              <span>
                <i
                  style={{
                    width: `${Math.max(2, (cycle.durationSeconds / maximum) * 100)}%`,
                  }}
                />
              </span>
              <strong>{formatSeconds(cycle.durationSeconds)}</strong>
            </div>
          ))
        )}
      </div>
    </article>
  )
}

function CycleTimelineTable({
  runA,
  runB,
}: {
  runA: PrestigeCycleRun
  runB: PrestigeCycleRun
}) {
  const rows = Math.max(
    runA.completedCycles.length,
    runB.completedCycles.length,
  )

  return (
    <div className="prestige-cycle-table-scroll">
      <table data-testid="prestige-cycle-timeline">
        <thead>
          <tr>
            <th>Ciclo</th>
            <th>A: duración</th>
            <th>A: Zafiro directo</th>
            <th>A: 10 / 30 / 60 s</th>
            <th>B: duración</th>
            <th>B: Zafiro directo</th>
            <th>B: 10 / 30 / 60 s</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, index) => {
            const cycleA = runA.completedCycles[index]
            const cycleB = runB.completedCycles[index]
            return (
              <tr key={index}>
                <th>{index + 1}</th>
                <td>{cycleA ? formatSeconds(cycleA.durationSeconds) : '—'}</td>
                <td>
                  {cycleA
                    ? `${numberFormat.format(cycleA.directSapphireEnergy)} · ${numberFormat.format(cycleA.directSapphireSharePercent)}%`
                    : '—'}
                </td>
                <td>{cycleA ? formatCheckpoints(cycleA) : '—'}</td>
                <td>{cycleB ? formatSeconds(cycleB.durationSeconds) : '—'}</td>
                <td>
                  {cycleB
                    ? `${numberFormat.format(cycleB.directSapphireEnergy)} · ${numberFormat.format(cycleB.directSapphireSharePercent)}%`
                    : '—'}
                </td>
                <td>{cycleB ? formatCheckpoints(cycleB) : '—'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function formatCheckpoints(cycle: PrestigeCycleRecord) {
  return [10, 30, 60]
    .map((second) => {
      const checkpoint = cycle.checkpoints.find((item) => item.second === second)
      return checkpoint
        ? `${second}s: ${numberFormat.format(checkpoint.effectiveProductionPerSecond)}/s`
        : `${second}s: —`
    })
    .join(' · ')
}

function SimulationResults({
  comparison,
}: {
  comparison: PrestigeCycleComparison
}) {
  const { runA, runB } = comparison

  return (
    <div className="prestige-observatory-results" data-testid="prestige-cycle-results">
      <section className="prestige-cycle-summary-grid">
        {[runA, runB].map((run, index) => (
          <article key={`${run.candidate.id}-${index}`}>
            <span>PERFIL {index === 0 ? 'A' : 'B'}</span>
            <h3>{run.candidate.name}</h3>
            <dl>
              <div><dt>Ciclos</dt><dd>{run.completedCycles.length}</dd></div>
              <div><dt>Promedio</dt><dd>{formatSeconds(run.averageCycleSeconds)}</dd></div>
              <div><dt>Último</dt><dd>{formatSeconds(run.lastCycleSeconds)}</dd></div>
              <div><dt>Energía generada</dt><dd>{numberFormat.format(run.totalEnergyGenerated)}</dd></div>
              <div><dt>Energía gastada</dt><dd>{numberFormat.format(run.totalEnergySpent)}</dd></div>
              <div><dt>Zafiro directo</dt><dd>{numberFormat.format(run.totalDirectSapphireEnergy)}</dd></div>
            </dl>
          </article>
        ))}
      </section>

      <section className="prestige-observatory-card">
        <div className="prestige-observatory-section-heading">
          <div>
            <span>COMPARACIÓN</span>
            <h3>Indicadores multiciclo</h3>
          </div>
          <b>{comparison.scenarioName}</b>
        </div>
        <div className="prestige-cycle-table-scroll">
          <table>
            <thead>
              <tr>
                <th>Métrica</th>
                <th>{runA.candidate.name}</th>
                <th>{runB.candidate.name}</th>
                <th>Delta</th>
                <th>Ventaja</th>
              </tr>
            </thead>
            <tbody>
              {comparison.metrics.map((metric) => (
                <tr key={metric.id}>
                  <th>{metric.label}</th>
                  <td>{formatValue(metric.valueA, metric.unit)}</td>
                  <td>{formatValue(metric.valueB, metric.unit)}</td>
                  <td>
                    {metric.delta === null
                      ? '—'
                      : `${metric.delta > 0 ? '+' : ''}${formatValue(metric.delta, metric.unit)}`}
                    {metric.percentDelta !== null && (
                      <small>
                        {metric.percentDelta > 0 ? '+' : ''}
                        {numberFormat.format(metric.percentDelta)}%
                      </small>
                    )}
                  </td>
                  <td data-winner={metric.winner}>
                    {metric.winner === 'none'
                      ? 'Informativa'
                      : metric.winner === 'tie'
                        ? 'Empate'
                        : `Perfil ${metric.winner}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="prestige-observatory-card">
        <div className="prestige-observatory-section-heading">
          <div>
            <span>CRONOLOGÍA</span>
            <h3>Duración y recuperación por ciclo</h3>
          </div>
          <small>Producción efectiva a 10, 30 y 60 segundos.</small>
        </div>
        <CycleTimelineTable runA={runA} runB={runB} />
      </section>

      <section className="prestige-observatory-card">
        <div className="prestige-observatory-section-heading">
          <div>
            <span>GRÁFICA</span>
            <h3>Duración relativa de los ciclos</h3>
          </div>
        </div>
        <div className="prestige-cycle-chart-grid">
          <CycleDurationChart run={runA} />
          <CycleDurationChart run={runB} />
        </div>
      </section>
    </div>
  )
}

function ObservatoryWindow({
  portalHost,
  onClose,
  snapshot,
  liveState,
  onResetLive,
}: {
  portalHost: HTMLElement
  onClose: () => void
  snapshot: DeveloperExperimentSnapshot | null
  liveState: LivePrestigeCycleState | null
  onResetLive: () => void
}) {
  const profileRepository = useMemo(
    () => createBrowserBalanceProfileRepository(),
    [],
  )
  const scenarioRepository = useMemo(
    () => createBrowserDeveloperScenarioRepository(),
    [],
  )
  const [tab, setTab] = useState<ObservatoryTab>('live')
  const [profiles, setProfiles] = useState<BalanceDevProfile[]>([])
  const [scenarios, setScenarios] = useState<DeveloperScenario[]>([])
  const [scenarioId, setScenarioId] = useState('builtin-p5')
  const [candidateAId, setCandidateAId] = useState('official')
  const [candidateBId, setCandidateBId] = useState('official')
  const [durationSeconds, setDurationSeconds] = useState(7_200)
  const [manualClicksPerSecond, setManualClicksPerSecond] = useState(0)
  const [targetCycles, setTargetCycles] = useState(3)
  const [autoPurchase, setAutoPurchase] = useState(true)
  const [comparison, setComparison] =
    useState<PrestigeCycleComparison | null>(null)
  const [running, setRunning] = useState(false)
  const [message, setMessage] = useState('Observatorio listo.')
  const [hasError, setHasError] = useState(false)

  const candidates = useMemo(
    () => [createOfficialCandidate(), ...profiles.map(profileToCandidate)],
    [profiles],
  )

  const refreshLibraries = useCallback(() => {
    const profileResult = profileRepository.list()
    const scenarioResult = scenarioRepository.list()
    if (!profileResult.ok || !scenarioResult.ok) {
      setHasError(true)
      setMessage(
        !profileResult.ok
          ? profileResult.issues[0]?.message ?? 'No fue posible leer perfiles.'
          : !scenarioResult.ok
            ? scenarioResult.issues[0]?.message ?? 'No fue posible leer escenarios.'
            : 'No fue posible actualizar las bibliotecas.',
      )
      return
    }

    const nextProfiles = profileResult.value
    const nextScenarios = [
      ...createBuiltInDeveloperScenarios(
        DEFAULT_BALANCE_CONFIG.core.sphereClickCapacity,
      ),
      ...scenarioResult.value,
    ]
    const candidateIds = nextProfiles.map((item) => `profile:${item.id}`)
    setProfiles(nextProfiles)
    setScenarios(nextScenarios)
    setCandidateAId((current) =>
      current === 'official' || candidateIds.includes(current)
        ? current
        : 'official',
    )
    setCandidateBId((current) =>
      current === 'official' || candidateIds.includes(current)
        ? current
        : candidateIds[0] ?? 'official',
    )
    setHasError(false)
    setMessage(
      nextProfiles.length > 0
        ? 'Perfiles y escenarios actualizados.'
        : 'Sin perfiles DEV: Oficial contra Oficial está disponible.',
    )
  }, [profileRepository, scenarioRepository])

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

  const liveMetrics = snapshot
    ? getDeveloperSimulationMetrics(snapshot.state, snapshot.clockNow)
    : null
  const liveElapsed = liveState ? getLiveCycleElapsedSeconds(liveState) : null
  const liveAverage = liveState ? getLiveAverageCycleSeconds(liveState) : null
  const recentRate = liveState?.recentClickRate ?? 0
  const estimatedFromObservedRate =
    liveMetrics && recentRate > 0
      ? liveMetrics.clicksRemainingToCore / recentRate
      : null
  const sapphireMultiplier = snapshot
    ? getSapphireMultiplier(snapshot.state.prestigeCount)
    : 1
  const directPassivePerSecond =
    liveMetrics && sapphireMultiplier > 1
      ? liveMetrics.energyPerSecond * (1 - 1 / sapphireMultiplier)
      : 0
  const directClickEnergy =
    liveMetrics && sapphireMultiplier > 1
      ? liveMetrics.clickPower * (1 - 1 / sapphireMultiplier)
      : 0

  function runSimulation() {
    const scenario = scenarios.find((item) => item.id === scenarioId)
    const candidateA = candidates.find((item) => item.id === candidateAId)
    const candidateB = candidates.find((item) => item.id === candidateBId)
    if (!scenario || !candidateA || !candidateB) {
      setHasError(true)
      setMessage('Selecciona escenario y perfiles válidos.')
      return
    }

    setRunning(true)
    setHasError(false)
    setMessage('Simulando ciclos con el reducer autoritativo…')
    window.setTimeout(() => {
      const result = runPrestigeCycleExperiment({
        scenario,
        candidateA,
        candidateB,
        settings: {
          durationSeconds,
          manualClicksPerSecond,
          autoPurchase,
          targetCycles,
        },
        startedAt: Date.now(),
      })
      if (!result.ok) {
        setComparison(null)
        setHasError(true)
        setMessage(result.issues[0]?.message ?? 'La simulación no pudo completarse.')
      } else {
        setComparison(result.value)
        setHasError(false)
        setMessage(
          `Simulación terminada: ${result.value.runA.completedCycles.length + result.value.runB.completedCycles.length} ciclos registrados.`,
        )
      }
      setRunning(false)
    }, 0)
  }

  function exportLive() {
    if (!snapshot || !liveState) return
    downloadText(
      'observatorio-prestigio-en-vivo.json',
      JSON.stringify({ exportedAt: Date.now(), snapshot, liveState }, null, 2),
      'application/json',
    )
  }

  function exportSimulationJson() {
    if (!comparison) return
    downloadText(
      `observatorio-${comparison.scenarioId}.json`,
      JSON.stringify(comparison, null, 2),
      'application/json',
    )
  }

  function exportSimulationCsv() {
    if (!comparison) return
    downloadText(
      `observatorio-${comparison.scenarioId}.csv`,
      exportPrestigeCycleCsv(comparison),
      'text/csv;charset=utf-8',
    )
  }

  return createPortal(
    <div className="prestige-observatory-overlay developer-workspace-overlay" role="presentation">
      <section
        className="prestige-observatory-window"
        role="dialog"
        aria-modal="false"
        aria-labelledby="prestige-observatory-title"
      >
        <header className="prestige-observatory-header">
          <div>
            <span>TELEMETRÍA DEV · PRESTIGIO</span>
            <h2 id="prestige-observatory-title">Observatorio de Ciclos y Prestigio</h2>
            <p>
              Mide ciclos reales y simulados antes de definir el traspaso de Zafiro a Esmeralda.
            </p>
          </div>
          <div>
            <b>{running ? 'SIMULANDO' : snapshot ? 'OBSERVANDO' : 'SIN SEÑAL'}</b>
            <button type="button" onClick={onClose} aria-label="Cerrar">×</button>
          </div>
        </header>

        <nav className="prestige-observatory-tabs" aria-label="Secciones del observatorio">
          <button type="button" data-active={tab === 'live' || undefined} onClick={() => setTab('live')}>
            En vivo
          </button>
          <button type="button" data-active={tab === 'simulation' || undefined} onClick={() => setTab('simulation')}>
            Simulación multiciclo
          </button>
        </nav>

        <main className="prestige-observatory-content">
          {tab === 'live' ? (
            <>
              <section className="prestige-observatory-card">
                <div className="prestige-observatory-section-heading">
                  <div><span>CICLO ACTUAL</span><h3>Sesión visible</h3></div>
                  <div className="prestige-observatory-actions">
                    <button type="button" onClick={onResetLive}>Reiniciar observación</button>
                    <button type="button" disabled={!snapshot || !liveState} onClick={exportLive}>Exportar JSON</button>
                  </div>
                </div>
                {snapshot && liveState && liveMetrics ? (
                  <div className="prestige-live-grid" data-testid="prestige-live-metrics">
                    <article><span>Prestigio</span><strong>P{snapshot.state.prestigeCount} → P{snapshot.state.prestigeCount + 1}</strong></article>
                    <article><span>Tiempo del ciclo</span><strong>{formatSeconds(liveElapsed)}</strong></article>
                    <article><span>Zafiro</span><strong>×{numberFormat.format(sapphireMultiplier)}</strong></article>
                    <article><span>Ritmo observado</span><strong>{numberFormat.format(recentRate)} clic/s</strong></article>
                    <article><span>Restantes</span><strong>{numberFormat.format(liveMetrics.clicksRemainingToCore)} clics</strong></article>
                    <article><span>Estimación observada</span><strong>{formatSeconds(estimatedFromObservedRate)}</strong></article>
                    <article><span>Producción pasiva</span><strong>{numberFormat.format(liveMetrics.energyPerSecond)}/s</strong></article>
                    <article><span>Aporte directo Zafiro</span><strong>{numberFormat.format(directPassivePerSecond)}/s</strong></article>
                    <article><span>Potencia por clic</span><strong>{numberFormat.format(liveMetrics.clickPower)}</strong></article>
                    <article><span>Aporte Zafiro por clic</span><strong>{numberFormat.format(directClickEnergy)}</strong></article>
                    <article><span>Ciclos observados</span><strong>{liveState.completedCycles.length}</strong></article>
                    <article><span>Promedio observado</span><strong>{formatSeconds(liveAverage)}</strong></article>
                  </div>
                ) : (
                  <p className="prestige-observatory-empty">Esperando una lectura válida del juego.</p>
                )}
                <p className="prestige-observatory-note">
                  “Aporte directo” aísla el factor multiplicativo instantáneo de Zafiro sobre la producción actual. No incluye todavía el efecto contrafactual de compras anticipadas.
                </p>
              </section>

              <section className="prestige-observatory-card">
                <div className="prestige-observatory-section-heading">
                  <div><span>HISTORIAL EN MEMORIA</span><h3>Ciclos observados</h3></div>
                  <small>No se escribe en la partida ni en localStorage.</small>
                </div>
                <div className="prestige-cycle-table-scroll">
                  <table data-testid="prestige-live-history">
                    <thead><tr><th>#</th><th>Transición</th><th>Duración</th><th>Zafiro</th><th>Siguiente</th></tr></thead>
                    <tbody>
                      {liveState?.completedCycles.length ? (
                        liveState.completedCycles.map((cycle) => (
                          <tr key={cycle.index}>
                            <td>{cycle.index}</td>
                            <th>P{cycle.prestigeBefore}→P{cycle.prestigeAfter}</th>
                            <td>{formatSeconds(cycle.durationSeconds)}</td>
                            <td>×{numberFormat.format(cycle.sapphireMultiplier)}</td>
                            <td>×{numberFormat.format(cycle.nextSapphireMultiplier)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={5}>Aún no se ha observado una cristalización.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          ) : (
            <>
              <section className="prestige-observatory-card">
                <div className="prestige-observatory-section-heading">
                  <div><span>EXPERIMENTO</span><h3>Dos balances, varios prestigios</h3></div>
                  <button type="button" onClick={refreshLibraries}>Actualizar bibliotecas</button>
                </div>
                <div className="prestige-observatory-form-grid">
                  <label><span>Escenario</span><select aria-label="Escenario multiciclo" value={scenarioId} onChange={(event) => setScenarioId(event.currentTarget.value)}>{scenarios.map((scenario) => <option key={scenario.id} value={scenario.id}>{scenario.name}</option>)}</select></label>
                  <label><span>Perfil A</span><select aria-label="Perfil multiciclo A" value={candidateAId} onChange={(event) => setCandidateAId(event.currentTarget.value)}>{candidates.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.name}</option>)}</select></label>
                  <label><span>Perfil B</span><select aria-label="Perfil multiciclo B" value={candidateBId} onChange={(event) => setCandidateBId(event.currentTarget.value)}>{candidates.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.name}</option>)}</select></label>
                  <label><span>Ciclos objetivo</span><select aria-label="Ciclos objetivo" value={targetCycles} onChange={(event) => setTargetCycles(Number(event.currentTarget.value))}>{cycleOptions.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
                  <label><span>Límite temporal</span><select aria-label="Límite multiciclo" value={durationSeconds} onChange={(event) => setDurationSeconds(Number(event.currentTarget.value))}>{durationOptions.map((seconds) => <option key={seconds} value={seconds}>{seconds / 60} min</option>)}</select></label>
                  <label><span>Clics manuales por segundo</span><select aria-label="Clics multiciclo" value={manualClicksPerSecond} onChange={(event) => setManualClicksPerSecond(Number(event.currentTarget.value))}>{clickRateOptions.map((rate) => <option key={rate} value={rate}>{rate}/s</option>)}</select></label>
                </div>
                <label className="prestige-observatory-toggle"><input type="checkbox" checked={autoPurchase} onChange={(event) => setAutoPurchase(event.currentTarget.checked)} />Comprar automáticamente la opción válida más barata</label>
                <div className="prestige-observatory-run-row">
                  <p>Máximo: {PRESTIGE_CYCLE_MAX_SECONDS / 3_600} h, 10 ciclos y 500,000 acciones por perfil.</p>
                  <button type="button" className="is-primary" data-testid="run-prestige-cycle-experiment" disabled={running || scenarios.length === 0} onClick={runSimulation}>{running ? 'Simulando…' : 'Ejecutar experimento multiciclo'}</button>
                </div>
              </section>

              {comparison ? (
                <>
                  <div className="prestige-observatory-export-row">
                    <button type="button" onClick={exportSimulationJson}>Exportar JSON</button>
                    <button type="button" onClick={exportSimulationCsv}>Exportar CSV</button>
                  </div>
                  <SimulationResults comparison={comparison} />
                </>
              ) : (
                <section className="prestige-observatory-empty-state">
                  <span>P→P</span>
                  <h3>Ejecuta varios ciclos consecutivos</h3>
                  <p>La cronología mostrará duración, energía, gasto, Zafiro directo y recuperación a 10, 30 y 60 segundos.</p>
                </section>
              )}
            </>
          )}
        </main>

        <footer className="prestige-observatory-footer">
          <span data-error={hasError || undefined} role="status">{message}</span>
          <span>Reducer autoritativo · telemetría aislada · sin guardado</span>
        </footer>
      </section>
    </div>,
    portalHost,
  )
}

export function PrestigeCycleObservatorySystem() {
  const developerPanelHost = useDeveloperPanelLauncherHost()
  const workspaceHost = useDeveloperPanelWorkspaceHost()
  const toolsHost = usePortalHost('.developer-tools-grid')
  const [open, setOpen] = useState(false)
  const [snapshot, setSnapshot] =
    useState<DeveloperExperimentSnapshot | null>(null)
  const [liveState, setLiveState] =
    useState<LivePrestigeCycleState | null>(null)
  const inFlight = useRef(false)
  const snapshotRef = useRef<DeveloperExperimentSnapshot | null>(null)

  useEffect(() => {
    let cancelled = false

    const read = async () => {
      if (inFlight.current) return
      inFlight.current = true
      const response = await requestDeveloperExperiment({ mode: 'read' }, 1_500)
      inFlight.current = false
      if (cancelled || !response.accepted) return
      const nextSnapshot = response.snapshot
      snapshotRef.current = nextSnapshot
      setSnapshot(nextSnapshot)
      setLiveState((current) =>
        current
          ? advanceLivePrestigeCycleState(current, nextSnapshot)
          : createLivePrestigeCycleState(nextSnapshot),
      )
    }

    void read()
    const id = window.setInterval(() => void read(), 1_000)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [])

  const resetLive = useCallback(() => {
    const current = snapshotRef.current
    if (current) setLiveState(createLivePrestigeCycleState(current))
  }, [])

  return (
    <>
      {developerPanelHost &&
        createPortal(
          <section className="developer-prestige-observatory-access">
            <span>Telemetría de progresión</span>
            <button type="button" onClick={() => setOpen(true)}>
              <span aria-hidden="true">P→P</span>
              <span>
                <strong>Observatorio de Prestigio</strong>
                <small>Ciclos, recuperación y aporte de Zafiro</small>
              </span>
              <b aria-hidden="true">ABRIR</b>
            </button>
          </section>,
          developerPanelHost,
        )}

      {toolsHost &&
        createPortal(
          <button type="button" className="developer-prestige-observatory-tool-button" onClick={() => setOpen(true)}>
            <span>P→P</span>
            <strong>Observatorio de Prestigio</strong>
            <small>Medir ciclos reales y simulados.</small>
          </button>,
          toolsHost,
        )}

      {open && workspaceHost && (
        <ObservatoryWindow
          portalHost={workspaceHost}
          onClose={() => setOpen(false)}
          snapshot={snapshot}
          liveState={liveState}
          onResetLive={resetLive}
        />
      )}
    </>
  )
}
