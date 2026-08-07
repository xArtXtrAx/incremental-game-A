import { useCallback, useEffect, useMemo, useState } from 'react'
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
  createBrowserDeveloperScenarioRepository,
  createBuiltInDeveloperScenarios,
  type DeveloperScenario,
} from './developerScenarios'
import {
  PRESTIGE_CYCLE_START_P5_SCENARIO_ID,
  createPrestigeCycleObservatoryScenarios,
} from './prestigeCycleScenarios'
import {
  analyzePrestigePath,
  comparePrestigeLabRuns,
  comparePrestigeStrategies,
  describeSapphirePolicy,
  PRESTIGE_LAB_MAX_BATCH_RUNS,
  runPrestigeBatch,
  runPrestigeCurveExplorer,
  runPrestigeLab,
  type PrestigeBatchResult,
  type PrestigeCurveExplorerResult,
  type PrestigeLabCandidate,
  type PrestigeLabPairComparison,
  type PrestigeLabPurchaseStrategy,
  type PrestigeLabRun,
  type PrestigeLabSapphirePolicy,
  type PrestigePathSummary,
  type PrestigeStrategyComparisonRow,
} from './prestigeProgressionLaboratory'
import './PrestigeProgressionLaboratorySystem.css'

const numberFormat = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 2 })
const durationOptions = [900, 3_600, 7_200, 21_600] as const
const clickOptions = [0, 1, 2, 5, 10, 20] as const
const cycleOptions = [1, 2, 3, 5, 8, 10] as const
const curveIncrements = [0, 0.1, 0.2, 0.3, 0.5, 0.7] as const
const allStrategies: PrestigeLabPurchaseStrategy[] = [
  'cheapest',
  'production',
  'manual',
  'automation',
  'roi',
]

type LabTab = 'counterfactual' | 'curves' | 'strategies' | 'path' | 'batch'

type LabResult =
  | { kind: 'pair'; value: PrestigeLabPairComparison }
  | { kind: 'curves'; value: PrestigeCurveExplorerResult }
  | { kind: 'strategies'; value: PrestigeStrategyComparisonRow[] }
  | { kind: 'path'; run: PrestigeLabRun; summary: PrestigePathSummary }
  | { kind: 'batch'; value: PrestigeBatchResult }

function officialCandidate(): PrestigeLabCandidate {
  return {
    id: 'official',
    name: 'Balance oficial',
    config: structuredClone(DEFAULT_BALANCE_CONFIG),
  }
}

function profileCandidate(profile: BalanceDevProfile): PrestigeLabCandidate {
  return {
    id: `profile:${profile.id}`,
    name: profile.name,
    config: structuredClone(profile.config),
  }
}

function formatSeconds(value: number | null) {
  if (value === null) return '—'
  if (value < 60) return `${numberFormat.format(value)} s`
  if (value < 3_600) return `${numberFormat.format(value / 60)} min`
  return `${numberFormat.format(value / 3_600)} h`
}

function strategyLabel(strategy: PrestigeLabPurchaseStrategy) {
  switch (strategy) {
    case 'cheapest': return 'Más barata'
    case 'production': return 'Producción'
    case 'manual': return 'Manual'
    case 'automation': return 'Automática'
    case 'roi': return 'ROI'
  }
}

function policyFromMode(mode: string, customIncrement: number): PrestigeLabSapphirePolicy {
  if (mode === 'neutralized') return { mode: 'neutralized' }
  if (mode === 'frozen-p5') return { mode: 'frozen-p5' }
  if (mode === 'custom-post-p5') return { mode: 'custom-post-p5', increment: customIncrement }
  return { mode: 'official' }
}

function downloadJson(filename: string, value: unknown) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function PairResults({ comparison }: { comparison: PrestigeLabPairComparison }) {
  return (
    <section className="prestige-lab-result-card" data-testid="prestige-lab-pair-results">
      <div className="prestige-lab-result-heading">
        <div><span>CONTRAFACTUAL</span><h3>Trayectorias comparadas</h3></div>
        <strong>{comparison.completedCycleDelta > 0 ? `B +${comparison.completedCycleDelta} ciclos` : comparison.completedCycleDelta < 0 ? `A +${Math.abs(comparison.completedCycleDelta)} ciclos` : 'Mismos ciclos'}</strong>
      </div>
      <div className="prestige-lab-summary-grid">
        {[comparison.runA, comparison.runB].map((run, index) => (
          <article key={index}>
            <span>RECORRIDO {index === 0 ? 'A' : 'B'}</span>
            <h4>{describeSapphirePolicy(run.settings.sapphirePolicy)}</h4>
            <dl>
              <div><dt>Ciclos</dt><dd>{run.completedCycles.length}</dd></div>
              <div><dt>Promedio</dt><dd>{formatSeconds(run.averageCycleSeconds)}</dd></div>
              <div><dt>Último</dt><dd>{formatSeconds(run.lastCycleSeconds)}</dd></div>
              <div><dt>Sin decisiones</dt><dd>{formatSeconds(run.totalDecisionlessSeconds)}</dd></div>
            </dl>
          </article>
        ))}
      </div>
      <p>
        Delta medio B−A: <strong>{comparison.averageCycleDeltaSeconds === null ? '—' : formatSeconds(comparison.averageCycleDeltaSeconds)}</strong>
        {comparison.averageCycleDeltaPercent !== null ? ` · ${comparison.averageCycleDeltaPercent > 0 ? '+' : ''}${numberFormat.format(comparison.averageCycleDeltaPercent)}%` : ''}
      </p>
    </section>
  )
}

function CurveResults({ result }: { result: PrestigeCurveExplorerResult }) {
  return (
    <section className="prestige-lab-result-card" data-testid="prestige-lab-curve-results">
      <div className="prestige-lab-result-heading"><div><span>CURVAS</span><h3>Aceleración post-P5</h3></div><strong>{result.points.length} variantes</strong></div>
      <div className="prestige-lab-table-scroll">
        <table>
          <thead><tr><th>Incremento</th><th>Ciclos</th><th>Promedio</th><th>Último</th><th>Último / primero</th><th>Duraciones</th></tr></thead>
          <tbody>
            {result.points.map((point) => (
              <tr key={point.increment}>
                <th>+{numberFormat.format(point.increment)}</th>
                <td>{point.completedCycles}</td>
                <td>{formatSeconds(point.averageCycleSeconds)}</td>
                <td>{formatSeconds(point.lastCycleSeconds)}</td>
                <td>{point.accelerationRatio === null ? '—' : numberFormat.format(point.accelerationRatio)}</td>
                <td>{point.cycleDurations.map((value) => formatSeconds(value)).join(' · ') || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function StrategyResults({ rows }: { rows: PrestigeStrategyComparisonRow[] }) {
  return (
    <section className="prestige-lab-result-card" data-testid="prestige-lab-strategy-results">
      <div className="prestige-lab-result-heading"><div><span>ESTILOS</span><h3>Políticas de compra</h3></div><strong>{rows.length} estrategias</strong></div>
      <div className="prestige-lab-table-scroll">
        <table>
          <thead><tr><th>Estrategia</th><th>Ciclos</th><th>Promedio</th><th>Generada</th><th>Gastada</th><th>Sin decisiones</th></tr></thead>
          <tbody>{rows.map((row) => <tr key={row.strategy}><th>{strategyLabel(row.strategy)}</th><td>{row.completedCycles}</td><td>{formatSeconds(row.averageCycleSeconds)}</td><td>{numberFormat.format(row.totalEnergyGenerated)}</td><td>{numberFormat.format(row.totalEnergySpent)}</td><td>{formatSeconds(row.decisionlessSeconds)}</td></tr>)}</tbody>
        </table>
      </div>
    </section>
  )
}

function PathResults({ run, summary }: { run: PrestigeLabRun; summary: PrestigePathSummary }) {
  return (
    <section className="prestige-lab-result-card" data-testid="prestige-lab-path-results">
      <div className="prestige-lab-result-heading">
        <div><span>RUTA</span><h3>Secuencia de decisiones</h3></div>
        <strong>{summary.dominantUpgrade ?? 'Sin gasto dominante'}</strong>
      </div>
      <div className="prestige-lab-path-grid">
        <article><span>Compras</span><strong>{run.purchaseEvents.length}</strong></article>
        <article><span>Sin decisiones</span><strong>{formatSeconds(run.totalDecisionlessSeconds)}</strong></article>
        <article><span>Nunca compradas</span><strong>{summary.neverPurchased.length}</strong></article>
        <article><span>Energía gastada</span><strong>{numberFormat.format(run.totalEnergySpent)}</strong></article>
      </div>
      <div className="prestige-lab-table-scroll">
        <table>
          <thead><tr><th>t</th><th>Ciclo</th><th>Mejora</th><th>Nivel</th><th>Costo</th></tr></thead>
          <tbody>
            {summary.firstPurchases.length ? summary.firstPurchases.map((event, index) => (
              <tr key={`${event.cycleIndex}-${event.second}-${event.upgradeId}-${index}`}>
                <td>{formatSeconds(event.second)}</td><td>{event.cycleIndex}</td><th>{event.upgradeId}</th><td>{event.levelAfter}</td><td>{numberFormat.format(event.cost)}</td>
              </tr>
            )) : <tr><td colSpan={5}>No hubo compras.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function BatchResults({ result }: { result: PrestigeBatchResult }) {
  const sorted = [...result.rows].sort((a, b) => {
    if (a.completedCycles !== b.completedCycles) return b.completedCycles - a.completedCycles
    const av = a.averageCycleSeconds ?? Number.POSITIVE_INFINITY
    const bv = b.averageCycleSeconds ?? Number.POSITIVE_INFINITY
    return av - bv
  })
  return (
    <section className="prestige-lab-result-card" data-testid="prestige-lab-batch-results">
      <div className="prestige-lab-result-heading"><div><span>LOTE</span><h3>Matriz experimental</h3></div><strong>{result.totalRuns} corridas</strong></div>
      <div className="prestige-lab-table-scroll prestige-lab-batch-table">
        <table>
          <thead><tr><th>Zafiro</th><th>Estrategia</th><th>Clic/s</th><th>Ciclos</th><th>Promedio</th><th>Último</th><th>Sin decisiones</th></tr></thead>
          <tbody>{sorted.map((row, index) => <tr key={`${row.sapphirePolicy}-${row.strategy}-${row.manualClicksPerSecond}-${index}`}><th>{row.sapphirePolicy}</th><td>{strategyLabel(row.strategy)}</td><td>{row.manualClicksPerSecond}</td><td>{row.completedCycles}</td><td>{formatSeconds(row.averageCycleSeconds)}</td><td>{formatSeconds(row.lastCycleSeconds)}</td><td>{formatSeconds(row.totalDecisionlessSeconds)}</td></tr>)}</tbody>
        </table>
      </div>
    </section>
  )
}

function LaboratoryWindow({ portalHost, onClose }: { portalHost: HTMLElement; onClose: () => void }) {
  const profileRepository = useMemo(() => createBrowserBalanceProfileRepository(), [])
  const scenarioRepository = useMemo(() => createBrowserDeveloperScenarioRepository(), [])
  const [tab, setTab] = useState<LabTab>('counterfactual')
  const [profiles, setProfiles] = useState<BalanceDevProfile[]>([])
  const [scenarios, setScenarios] = useState<DeveloperScenario[]>([])
  const [scenarioId, setScenarioId] = useState(PRESTIGE_CYCLE_START_P5_SCENARIO_ID)
  const [candidateId, setCandidateId] = useState('official')
  const [durationSeconds, setDurationSeconds] = useState(7_200)
  const [manualClicksPerSecond, setManualClicksPerSecond] = useState(2)
  const [targetCycles, setTargetCycles] = useState(3)
  const [policyMode, setPolicyMode] = useState('frozen-p5')
  const [customIncrement, setCustomIncrement] = useState(0.3)
  const [strategy, setStrategy] = useState<PrestigeLabPurchaseStrategy>('cheapest')
  const [result, setResult] = useState<LabResult | null>(null)
  const [running, setRunning] = useState(false)
  const [message, setMessage] = useState('Laboratorio listo.')
  const [hasError, setHasError] = useState(false)

  const candidates = useMemo(() => [officialCandidate(), ...profiles.map(profileCandidate)], [profiles])
  const candidate = candidates.find((item) => item.id === candidateId) ?? candidates[0]
  const scenario = scenarios.find((item) => item.id === scenarioId) ?? scenarios[0]
  const selectedPolicy = policyFromMode(policyMode, customIncrement)

  const refresh = useCallback(() => {
    const profileResult = profileRepository.list()
    const scenarioResult = scenarioRepository.list()
    if (!profileResult.ok || !scenarioResult.ok) {
      setHasError(true)
      setMessage(!profileResult.ok ? profileResult.issues[0]?.message ?? 'No fue posible leer perfiles.' : scenarioResult.ok ? 'No fue posible actualizar.' : scenarioResult.issues[0]?.message ?? 'No fue posible leer escenarios.')
      return
    }
    const nextProfiles = profileResult.value
    const nextScenarios = createPrestigeCycleObservatoryScenarios(
      createBuiltInDeveloperScenarios(DEFAULT_BALANCE_CONFIG.core.sphereClickCapacity),
      scenarioResult.value,
    )
    setProfiles(nextProfiles)
    setScenarios(nextScenarios)
    setCandidateId((current) => current === 'official' || nextProfiles.some((item) => `profile:${item.id}` === current) ? current : 'official')
    setScenarioId((current) => nextScenarios.some((item) => item.id === current) ? current : nextScenarios[0]?.id ?? PRESTIGE_CYCLE_START_P5_SCENARIO_ID)
    setHasError(false)
    setMessage('Bibliotecas actualizadas.')
  }, [profileRepository, scenarioRepository])

  useEffect(() => { refresh() }, [refresh])
  useEffect(() => {
    const handler = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const baseSettings = {
    durationSeconds,
    manualClicksPerSecond,
    targetCycles,
    autoPurchase: true,
  }

  function execute(label: string, task: () => LabResult | null) {
    if (!scenario || !candidate) {
      setHasError(true)
      setMessage('Selecciona un escenario y un balance válidos.')
      return
    }
    setRunning(true)
    setHasError(false)
    setMessage(`${label}…`)
    window.setTimeout(() => {
      try {
        const next = task()
        if (next) {
          setResult(next)
          setMessage(`${label} completado.`)
        }
      } finally {
        setRunning(false)
      }
    }, 0)
  }

  function fail(issues: Array<{ message: string }>) {
    setHasError(true)
    setMessage(issues[0]?.message ?? 'El experimento no pudo completarse.')
    setResult(null)
    return null
  }

  function runCounterfactual() {
    execute('Contrafactual', () => {
      const comparison = comparePrestigeLabRuns({
        scenario,
        candidate,
        startedAt: 1_000,
        settingsA: { ...baseSettings, purchaseStrategy: strategy, sapphirePolicy: { mode: 'official' } },
        settingsB: { ...baseSettings, purchaseStrategy: strategy, sapphirePolicy: selectedPolicy },
      })
      return comparison.ok ? { kind: 'pair', value: comparison.value } : fail(comparison.issues)
    })
  }

  function runCurves() {
    execute('Explorador de curvas', () => {
      const curves = runPrestigeCurveExplorer({
        scenario,
        candidate,
        startedAt: 1_000,
        baseSettings: { ...baseSettings, purchaseStrategy: strategy },
        increments: [...curveIncrements],
      })
      return curves.ok ? { kind: 'curves', value: curves.value } : fail(curves.issues)
    })
  }

  function runStrategies() {
    execute('Comparación de estrategias', () => {
      const strategies = comparePrestigeStrategies({
        scenario,
        candidate,
        startedAt: 1_000,
        baseSettings: { ...baseSettings, sapphirePolicy: selectedPolicy },
        strategies: allStrategies,
      })
      return strategies.ok ? { kind: 'strategies', value: strategies.value } : fail(strategies.issues)
    })
  }

  function runPath() {
    execute('Análisis de ruta', () => {
      const run = runPrestigeLab({
        scenario,
        candidate,
        startedAt: 1_000,
        settings: { ...baseSettings, purchaseStrategy: strategy, sapphirePolicy: selectedPolicy },
      })
      return run.ok ? { kind: 'path', run: run.value, summary: analyzePrestigePath(run.value) } : fail(run.issues)
    })
  }

  function runBatch() {
    execute('Lote experimental', () => {
      const batch = runPrestigeBatch({
        scenarios: [scenario],
        candidate,
        policies: [
          { mode: 'official' },
          { mode: 'frozen-p5' },
          { mode: 'neutralized' },
          { mode: 'custom-post-p5', increment: customIncrement },
        ],
        strategies: allStrategies,
        manualClickRates: [0, 2, 5],
        durationSeconds,
        targetCycles,
        startedAt: 1_000,
      })
      return batch.ok ? { kind: 'batch', value: batch.value } : fail(batch.issues)
    })
  }

  function runCurrentTab() {
    if (tab === 'counterfactual') runCounterfactual()
    else if (tab === 'curves') runCurves()
    else if (tab === 'strategies') runStrategies()
    else if (tab === 'path') runPath()
    else runBatch()
  }

  const resultMatchesTab =
    (tab === 'counterfactual' && result?.kind === 'pair') ||
    (tab === 'curves' && result?.kind === 'curves') ||
    (tab === 'strategies' && result?.kind === 'strategies') ||
    (tab === 'path' && result?.kind === 'path') ||
    (tab === 'batch' && result?.kind === 'batch')

  return createPortal(
    <div className="prestige-lab-overlay developer-workspace-overlay" role="presentation">
      <section className="prestige-lab-window" role="dialog" aria-modal="false" aria-labelledby="prestige-lab-title">
        <header className="prestige-lab-header">
          <div><span>DEV · METAPROGRESIÓN</span><h2 id="prestige-lab-title">Laboratorio de Progresión de Prestigio</h2><p>Contrafactuales, curvas, estilos de compra, rutas y lotes antes de diseñar Esmeralda.</p></div>
          <div><b>{running ? 'CALCULANDO' : 'AISLADO'}</b><button type="button" onClick={onClose} aria-label="Cerrar">×</button></div>
        </header>

        <nav className="prestige-lab-tabs" aria-label="Herramientas de progresión">
          {([
            ['counterfactual', 'Contrafactual'],
            ['curves', 'Curvas'],
            ['strategies', 'Estrategias'],
            ['path', 'Ruta'],
            ['batch', 'Lotes'],
          ] as const).map(([id, label]) => <button key={id} type="button" data-active={tab === id || undefined} onClick={() => { setTab(id); setResult(null) }}>{label}</button>)}
        </nav>

        <main className="prestige-lab-content">
          <section className="prestige-lab-card">
            <div className="prestige-lab-section-heading"><div><span>CONDICIONES</span><h3>Experimento reproducible</h3></div><button type="button" onClick={refresh}>Actualizar bibliotecas</button></div>
            <div className="prestige-lab-form-grid">
              <label><span>Escenario</span><select aria-label="Escenario laboratorio prestigio" value={scenarioId} onChange={(event) => setScenarioId(event.currentTarget.value)}>{scenarios.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
              <label><span>Balance</span><select aria-label="Balance laboratorio prestigio" value={candidateId} onChange={(event) => setCandidateId(event.currentTarget.value)}>{candidates.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
              <label><span>Ciclos objetivo</span><select value={targetCycles} onChange={(event) => setTargetCycles(Number(event.currentTarget.value))}>{cycleOptions.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
              <label><span>Límite</span><select value={durationSeconds} onChange={(event) => setDurationSeconds(Number(event.currentTarget.value))}>{durationOptions.map((value) => <option key={value} value={value}>{value / 60} min</option>)}</select></label>
              <label><span>Clics manuales</span><select value={manualClicksPerSecond} onChange={(event) => setManualClicksPerSecond(Number(event.currentTarget.value))}>{clickOptions.map((value) => <option key={value} value={value}>{value}/s</option>)}</select></label>
              <label><span>Estrategia</span><select aria-label="Estrategia de compra" value={strategy} onChange={(event) => setStrategy(event.currentTarget.value as PrestigeLabPurchaseStrategy)}>{allStrategies.map((value) => <option key={value} value={value}>{strategyLabel(value)}</option>)}</select></label>
              <label><span>Política Zafiro</span><select aria-label="Política de Zafiro" value={policyMode} onChange={(event) => setPolicyMode(event.currentTarget.value)}><option value="official">Oficial</option><option value="frozen-p5">Congelado P5</option><option value="neutralized">Neutralizado ×1</option><option value="custom-post-p5">Incremento personalizado</option></select></label>
              <label><span>Incremento post-P5</span><input aria-label="Incremento post P5" type="number" min="0" max="100" step="0.05" value={customIncrement} disabled={policyMode !== 'custom-post-p5' && tab !== 'batch'} onChange={(event) => setCustomIncrement(Number(event.currentTarget.value))} /></label>
            </div>
            <div className="prestige-lab-run-row">
              <p>{tab === 'batch' ? `Lote actual: 4 políticas × 5 estrategias × 3 tasas = 60 / ${PRESTIGE_LAB_MAX_BATCH_RUNS} corridas.` : 'Todas las corridas usan el reducer autoritativo y un override temporal de balance.'}</p>
              <button type="button" className="is-primary" data-testid="run-prestige-progression-lab" disabled={running || !scenario || !candidate} onClick={runCurrentTab}>{running ? 'Calculando…' : tab === 'counterfactual' ? 'Comparar contra oficial' : tab === 'curves' ? 'Explorar curvas' : tab === 'strategies' ? 'Comparar estrategias' : tab === 'path' ? 'Analizar ruta' : 'Ejecutar lote'}</button>
            </div>
          </section>

          {resultMatchesTab && result ? (
            <>
              <div className="prestige-lab-export-row"><button type="button" onClick={() => downloadJson(`prestige-lab-${tab}.json`, result)}>Exportar JSON</button></div>
              {result.kind === 'pair' && <PairResults comparison={result.value} />}
              {result.kind === 'curves' && <CurveResults result={result.value} />}
              {result.kind === 'strategies' && <StrategyResults rows={result.value} />}
              {result.kind === 'path' && <PathResults run={result.run} summary={result.summary} />}
              {result.kind === 'batch' && <BatchResults result={result.value} />}
            </>
          ) : (
            <section className="prestige-lab-empty-state">
              <span>P↗</span>
              <h3>{tab === 'counterfactual' ? 'Aísla el verdadero efecto de Zafiro' : tab === 'curves' ? 'Busca una curva post-P5 estable' : tab === 'strategies' ? 'Comprueba distintos estilos de jugador' : tab === 'path' ? 'Explica por qué un ciclo funciona o falla' : 'Barre decenas de combinaciones deterministas'}</h3>
              <p>{tab === 'counterfactual' ? 'Compara el balance oficial contra Zafiro neutralizado, congelado en P5 o con incremento configurable.' : tab === 'curves' ? 'Ejecuta seis incrementos post-P5 bajo exactamente las mismas condiciones.' : tab === 'strategies' ? 'Contrasta compra barata, producción, manual, automática y ROI.' : tab === 'path' ? 'Registra la cronología real de compras, gasto y tiempo sin decisiones.' : 'Ejecuta 60 corridas sobre el escenario seleccionado sin escribir la partida.'}</p>
            </section>
          )}
        </main>

        <footer className="prestige-lab-footer"><span data-error={hasError || undefined} role="status">{message}</span><span>Sin localStorage · sin cambios de sesión · sin fórmulas paralelas</span></footer>
      </section>
    </div>,
    portalHost,
  )
}

export function PrestigeProgressionLaboratorySystem() {
  const launcherHost = useDeveloperPanelLauncherHost()
  const workspaceHost = useDeveloperPanelWorkspaceHost()
  const toolsHost = usePortalHost('.developer-tools-grid')
  const [open, setOpen] = useState(false)

  return (
    <>
      {launcherHost && createPortal(
        <section className="developer-prestige-lab-access">
          <span>Experimentación pre-Esmeralda</span>
          <button type="button" onClick={() => setOpen(true)}>
            <span aria-hidden="true">P↗</span>
            <span><strong>Laboratorio de Progresión</strong><small>Contrafactuales, curvas, rutas y lotes</small></span>
            <b aria-hidden="true">ABRIR</b>
          </button>
        </section>,
        launcherHost,
      )}
      {toolsHost && createPortal(
        <button type="button" className="developer-prestige-lab-tool-button" onClick={() => setOpen(true)}>
          <span>P↗</span><strong>Laboratorio de Progresión</strong><small>Explorar prestigio antes de Esmeralda.</small>
        </button>,
        toolsHost,
      )}
      {open && workspaceHost && <LaboratoryWindow portalHost={workspaceHost} onClose={() => setOpen(false)} />}
    </>
  )
}
