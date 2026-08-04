import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import './DeveloperControlCenterSystem.css'
import {
  requestDeveloperExperiment,
  type DeveloperExperimentSnapshot,
} from './developerExperimentBridge'
import {
  createBrowserDeveloperScenarioRepository,
  createBuiltInDeveloperScenarios,
  type DeveloperScenario,
  type DeveloperScenarioChange,
} from './developerScenarios'
import { getDeveloperSimulationMetrics } from './developerSimulation'
import { getSphereClickCapacity, type GameState } from './game'

type ControlCenterSection =
  | 'state'
  | 'scenarios'
  | 'simulation'
  | 'metrics'
  | 'tools'

const SECTIONS: readonly { id: ControlCenterSection; label: string }[] = [
  { id: 'state', label: 'Estado' },
  { id: 'scenarios', label: 'Escenarios' },
  { id: 'simulation', label: 'Simulación' },
  { id: 'metrics', label: 'Métricas' },
  { id: 'tools', label: 'Herramientas' },
]

const STATE_FIELDS: readonly {
  field: keyof GameState
  label: string
}[] = [
  { field: 'energy', label: 'Energía' },
  { field: 'manualClicks', label: 'Clics' },
  { field: 'prestigeCount', label: 'Cristalizaciones' },
  { field: 'clickLevel', label: 'Potencia de clic' },
  { field: 'pulseTriggerLevel', label: 'Gatillo' },
  { field: 'generatorLevel', label: 'Generador' },
  { field: 'resonanceLevel', label: 'Resonancia' },
  { field: 'pressureLevel', label: 'Presión' },
  { field: 'cavitationLevel', label: 'Cavitación' },
  { field: 'cavitationCharge', label: 'Carga de cavitación' },
  { field: 'autoclickLevel', label: 'Autoclicker' },
  { field: 'autoclickProgress', label: 'Progreso autoclick' },
  { field: 'overloadLevel', label: 'Sobrecarga' },
  { field: 'overloadCharge', label: 'Carga de sobrecarga' },
  { field: 'overloadUntil', label: 'Sobrecarga hasta' },
  { field: 'refractionLevel', label: 'Refracción' },
  { field: 'refractionOrbitProgress', label: 'Órbita de refracción' },
  { field: 'refractionFacetsCharged', label: 'Facetas cargadas' },
  { field: 'refractionUntil', label: 'Refracción hasta' },
  { field: 'refractionDischargeCount', label: 'Descargas' },
  { field: 'refractionLastReward', label: 'Última recompensa' },
]

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

function formatSeconds(value: number | null) {
  if (value === null) return 'Sin autoclick suficiente'
  if (value === 0) return 'Objetivo alcanzado'
  if (value < 60) return `${value.toFixed(1)} s`
  if (value < 3_600) return `${(value / 60).toFixed(1)} min`
  return `${(value / 3_600).toFixed(2)} h`
}

function formatStateValue(field: keyof GameState, value: number) {
  if (field === 'overloadUntil' || field === 'refractionUntil') {
    return value > 0 ? new Date(value).toLocaleTimeString('es-MX') : 'inactivo'
  }
  return numberFormat.format(value)
}

function ScenarioCard({
  scenario,
  onPreview,
  onApply,
  onDelete,
}: {
  scenario: DeveloperScenario
  onPreview: (scenario: DeveloperScenario) => void
  onApply: (scenario: DeveloperScenario) => void
  onDelete: (scenario: DeveloperScenario) => void
}) {
  return (
    <article
      className="developer-scenario-card"
      data-kind={scenario.kind}
      data-testid={`developer-scenario-${scenario.id}`}
    >
      <div className="developer-scenario-heading">
        <div>
          <span>{scenario.kind === 'built-in' ? 'BASE' : 'SNAPSHOT'}</span>
          <h3>{scenario.name}</h3>
        </div>
        <b>{scenario.kind === 'built-in' ? 'INCLUIDO' : 'PERSONAL'}</b>
      </div>
      <p>{scenario.description}</p>
      <dl>
        <div>
          <dt>Energía</dt>
          <dd>{numberFormat.format(scenario.state.energy)}</dd>
        </div>
        <div>
          <dt>Clics</dt>
          <dd>{numberFormat.format(scenario.state.manualClicks)}</dd>
        </div>
        <div>
          <dt>Prestigio</dt>
          <dd>P{scenario.state.prestigeCount}</dd>
        </div>
      </dl>
      <div className="developer-scenario-actions">
        <button type="button" onClick={() => onPreview(scenario)}>
          Previsualizar
        </button>
        <button
          type="button"
          className="is-primary"
          onClick={() => onApply(scenario)}
        >
          Aplicar aislado
        </button>
        {scenario.kind === 'custom' && (
          <button
            type="button"
            className="is-danger"
            onClick={() => onDelete(scenario)}
          >
            Eliminar
          </button>
        )}
      </div>
    </article>
  )
}

function ControlCenterWindow({ onClose }: { onClose: () => void }) {
  const repository = useMemo(
    () => createBrowserDeveloperScenarioRepository(),
    [],
  )
  const [section, setSection] = useState<ControlCenterSection>('state')
  const [snapshot, setSnapshot] = useState<DeveloperExperimentSnapshot | null>(
    null,
  )
  const [customScenarios, setCustomScenarios] = useState<DeveloperScenario[]>([])
  const [changes, setChanges] = useState<DeveloperScenarioChange[]>([])
  const [captureName, setCaptureName] = useState('')
  const [message, setMessage] = useState('Centro DEV listo.')
  const [hasError, setHasError] = useState(false)

  const builtInScenarios = createBuiltInDeveloperScenarios(
    getSphereClickCapacity(),
  )
  const allScenarios = [...builtInScenarios, ...customScenarios]
  const metrics = snapshot
    ? getDeveloperSimulationMetrics(snapshot.state, snapshot.clockNow)
    : null

  function refreshCustomScenarios() {
    const result = repository.list()
    if (!result.ok) {
      setHasError(true)
      setMessage(result.issues[0]?.message ?? 'No se pudieron leer los escenarios.')
      return
    }
    setCustomScenarios(result.value)
  }

  async function refreshSnapshot(silent = false) {
    const response = await requestDeveloperExperiment({ mode: 'read' })
    setSnapshot(response.snapshot)
    if (!silent) {
      setHasError(!response.accepted)
      setMessage(response.message)
    }
  }

  useEffect(() => {
    refreshCustomScenarios()
    void refreshSnapshot()
    const id = window.setInterval(() => void refreshSnapshot(true), 1_000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  async function previewScenario(scenario: DeveloperScenario) {
    const response = await requestDeveloperExperiment({
      mode: 'preview-scenario',
      state: scenario.state,
      capturedAt: scenario.capturedAt,
      scenarioName: scenario.name,
    })
    setSnapshot(response.snapshot)
    setChanges(response.changes)
    setHasError(!response.accepted)
    setMessage(response.message)
  }

  async function applyScenario(scenario: DeveloperScenario) {
    const response = await requestDeveloperExperiment({
      mode: 'apply-scenario',
      state: scenario.state,
      capturedAt: scenario.capturedAt,
      scenarioName: scenario.name,
    })
    setSnapshot(response.snapshot)
    setChanges(response.changes)
    setHasError(!response.accepted)
    setMessage(response.message)
    if (response.accepted) setSection('state')
  }

  function captureScenario() {
    if (!snapshot) return
    const result = repository.save(
      captureName,
      snapshot.state,
      snapshot.clockNow,
    )
    if (!result.ok) {
      setHasError(true)
      setMessage(result.issues[0]?.message ?? 'No se pudo guardar el escenario.')
      return
    }
    setCaptureName('')
    setHasError(false)
    setMessage(`Snapshot “${result.value.name}” guardado fuera de la partida.`)
    refreshCustomScenarios()
  }

  function deleteScenario(scenario: DeveloperScenario) {
    const result = repository.remove(scenario.id)
    if (!result.ok) {
      setHasError(true)
      setMessage(result.issues[0]?.message ?? 'No se pudo eliminar el escenario.')
      return
    }
    setHasError(false)
    setMessage(`Escenario “${scenario.name}” eliminado.`)
    refreshCustomScenarios()
  }

  async function setPaused(paused: boolean) {
    const response = await requestDeveloperExperiment({
      mode: 'set-paused',
      paused,
    })
    setSnapshot(response.snapshot)
    setChanges(response.changes)
    setHasError(!response.accepted)
    setMessage(response.message)
  }

  async function advance(seconds: number) {
    const response = await requestDeveloperExperiment({ mode: 'step', seconds })
    setSnapshot(response.snapshot)
    setChanges(response.changes)
    setHasError(!response.accepted)
    setMessage(response.message)
  }

  async function restoreBaseline() {
    const response = await requestDeveloperExperiment({
      mode: 'restore-baseline',
    })
    setSnapshot(response.snapshot)
    setChanges(response.changes)
    setHasError(!response.accepted)
    setMessage(response.message)
  }

  function openLegacyTool(selector: string, name: string) {
    const button = document.querySelector<HTMLButtonElement>(selector)
    if (!button) {
      setHasError(true)
      setMessage(`No se encontró ${name}.`)
      return
    }
    onClose()
    button.click()
  }

  return createPortal(
    <div className="developer-control-overlay" role="presentation">
      <section
        className="developer-control-window"
        role="dialog"
        aria-modal="true"
        aria-labelledby="developer-control-title"
      >
        <header className="developer-control-header">
          <div>
            <span>Consola experimental</span>
            <h2 id="developer-control-title">Centro de Control DEV</h2>
            <p>
              Escenarios reproducibles, reloj determinista y métricas sin
              contaminar el guardado normal.
            </p>
          </div>
          <div className="developer-control-status">
            <b data-active={snapshot?.experimental || undefined}>
              {snapshot?.experimental ? 'SESIÓN AISLADA' : 'SESIÓN NORMAL'}
            </b>
            <b data-paused={snapshot?.paused || undefined}>
              {snapshot?.paused ? 'PAUSADO' : 'EN MARCHA'}
            </b>
            <button type="button" onClick={onClose} aria-label="Cerrar">
              ×
            </button>
          </div>
        </header>

        <nav className="developer-control-tabs" aria-label="Secciones DEV">
          {SECTIONS.map((item) => (
            <button
              type="button"
              key={item.id}
              className={section === item.id ? 'is-active' : ''}
              aria-pressed={section === item.id}
              onClick={() => setSection(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <main className="developer-control-content">
          {section === 'state' && snapshot && (
            <div className="developer-control-grid-layout">
              <section className="developer-control-card">
                <div className="developer-control-card-heading">
                  <div>
                    <span>Runtime vivo</span>
                    <h3>Estado completo</h3>
                  </div>
                  <button type="button" onClick={() => void refreshSnapshot()}>
                    Actualizar
                  </button>
                </div>
                <div className="developer-state-grid">
                  {STATE_FIELDS.map(({ field, label }) => (
                    <div key={field}>
                      <span>{label}</span>
                      <strong>{formatStateValue(field, snapshot.state[field])}</strong>
                    </div>
                  ))}
                </div>
              </section>

              <section className="developer-control-card">
                <div className="developer-control-card-heading">
                  <div>
                    <span>Protección</span>
                    <h3>Sesión experimental</h3>
                  </div>
                </div>
                <p>
                  {snapshot.experimental
                    ? 'Los cambios actuales están aislados y no se escriben en la partida normal.'
                    : 'La partida normal continúa como fuente persistente.'}
                </p>
                <dl className="developer-control-summary">
                  <div>
                    <dt>Reloj</dt>
                    <dd>{new Date(snapshot.clockNow).toLocaleTimeString('es-MX')}</dd>
                  </div>
                  <div>
                    <dt>Modo</dt>
                    <dd>{snapshot.paused ? 'Pausado' : 'Tiempo real'}</dd>
                  </div>
                  <div>
                    <dt>Restauración</dt>
                    <dd>{snapshot.baselineAvailable ? 'Disponible' : 'No necesaria'}</dd>
                  </div>
                </dl>
                <button
                  type="button"
                  className="is-restore"
                  disabled={!snapshot.baselineAvailable}
                  onClick={() => void restoreBaseline()}
                >
                  Restaurar sesión original
                </button>
              </section>
            </div>
          )}

          {section === 'scenarios' && (
            <div className="developer-control-stack">
              <section className="developer-control-card developer-capture-card">
                <div>
                  <span>Snapshot personalizado</span>
                  <h3>Capturar estado actual</h3>
                  <p>
                    Guarda el estado completo y los tiempos restantes en una
                    colección DEV separada.
                  </p>
                </div>
                <div className="developer-capture-actions">
                  <input
                    type="text"
                    value={captureName}
                    maxLength={64}
                    placeholder="Nombre del escenario"
                    onChange={(event) => setCaptureName(event.currentTarget.value)}
                  />
                  <button
                    type="button"
                    className="is-primary"
                    disabled={!snapshot || captureName.trim() === ''}
                    onClick={captureScenario}
                  >
                    Guardar snapshot
                  </button>
                </div>
              </section>

              <section className="developer-scenario-grid">
                {allScenarios.map((scenario) => (
                  <ScenarioCard
                    key={scenario.id}
                    scenario={scenario}
                    onPreview={previewScenario}
                    onApply={applyScenario}
                    onDelete={deleteScenario}
                  />
                ))}
              </section>

              <section className="developer-control-card">
                <div className="developer-control-card-heading">
                  <div>
                    <span>Comparación</span>
                    <h3>Última previsualización</h3>
                  </div>
                  <b>{changes.length} cambios</b>
                </div>
                {changes.length === 0 ? (
                  <p>No hay diferencias calculadas.</p>
                ) : (
                  <div className="developer-change-list">
                    {changes.map((change) => (
                      <div key={change.field}>
                        <code>{change.field}</code>
                        <span>{numberFormat.format(change.from)}</span>
                        <b>→</b>
                        <strong>{numberFormat.format(change.to)}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {section === 'simulation' && snapshot && (
            <div className="developer-control-grid-layout">
              <section className="developer-control-card">
                <div className="developer-control-card-heading">
                  <div>
                    <span>Reloj autoritativo</span>
                    <h3>Pausa y reanudación</h3>
                  </div>
                </div>
                <p>
                  Al pausar, los ticks automáticos de `App` se detienen. Los
                  pasos vuelven a ejecutar el reducer segundo por segundo.
                </p>
                <div className="developer-control-button-row">
                  <button
                    type="button"
                    className={!snapshot.paused ? 'is-primary' : ''}
                    onClick={() => void setPaused(false)}
                  >
                    Reanudar
                  </button>
                  <button
                    type="button"
                    className={snapshot.paused ? 'is-primary' : ''}
                    onClick={() => void setPaused(true)}
                  >
                    Pausar
                  </button>
                </div>
              </section>

              <section className="developer-control-card">
                <div className="developer-control-card-heading">
                  <div>
                    <span>Avance determinista</span>
                    <h3>Ejecutar pasos</h3>
                  </div>
                </div>
                <p>Máximo por operación: 3,600 segundos.</p>
                <div className="developer-step-grid">
                  {[1, 10, 60, 300, 900, 3_600].map((seconds) => (
                    <button
                      type="button"
                      key={seconds}
                      disabled={!snapshot.paused}
                      onClick={() => void advance(seconds)}
                    >
                      +{seconds < 60 ? `${seconds} s` : `${seconds / 60} min`}
                    </button>
                  ))}
                </div>
              </section>
            </div>
          )}

          {section === 'metrics' && metrics && (
            <div className="developer-metrics-grid">
              <article>
                <span>Energía por segundo</span>
                <strong>{numberFormat.format(metrics.energyPerSecond)}</strong>
                <small>{numberFormat.format(metrics.energyPerMinute)} por minuto</small>
              </article>
              <article>
                <span>Potencia por clic</span>
                <strong>{numberFormat.format(metrics.clickPower)}</strong>
                <small>Multiplicador activo ×{numberFormat.format(metrics.activeMultiplier)}</small>
              </article>
              <article>
                <span>Autoclicker</span>
                <strong>{numberFormat.format(metrics.autoclicksPerSecond)}/s</strong>
                <small>Progreso fraccionario incluido en el estado</small>
              </article>
              <article>
                <span>Llenado del núcleo</span>
                <strong>{metrics.sphereFillPercent.toFixed(2)}%</strong>
                <small>{numberFormat.format(metrics.clicksRemainingToCore)} clics restantes</small>
              </article>
              <article>
                <span>Tiempo estimado al núcleo</span>
                <strong>{formatSeconds(metrics.estimatedSecondsToCore)}</strong>
                <small>Estimación con la tasa automática actual</small>
              </article>
              <article>
                <span>Zafiro</span>
                <strong>×{numberFormat.format(metrics.sapphireMultiplier)}</strong>
                <small>Capacidad actual: {numberFormat.format(metrics.sphereCapacity)}</small>
              </article>
            </div>
          )}

          {section === 'tools' && (
            <div className="developer-tools-grid">
              <button
                type="button"
                onClick={() =>
                  openLegacyTool(
                    '.developer-balance-access button',
                    'el Laboratorio de Balance',
                  )
                }
              >
                <span>∑</span>
                <strong>Laboratorio de Balance</strong>
                <small>Editar, comparar, diagnosticar y aplicar configuraciones.</small>
              </button>
              <button
                type="button"
                onClick={() =>
                  openLegacyTool(
                    '.developer-balance-profiles-access button',
                    'Perfiles DEV',
                  )
                }
              >
                <span>▣</span>
                <strong>Perfiles DEV</strong>
                <small>Guardar, cargar, importar y exportar balances.</small>
              </button>
              <button
                type="button"
                onClick={() =>
                  openLegacyTool(
                    '.developer-chromatic-button',
                    'la Cámara Cromática',
                  )
                }
              >
                <span>◇</span>
                <strong>Cámara Cromática</strong>
                <small>Inspeccionar la metaprogresión visual sin desbloquear gemas.</small>
              </button>
            </div>
          )}
        </main>

        <footer className="developer-control-footer">
          <span
            className="developer-control-message"
            data-error={hasError || undefined}
            role="status"
          >
            {message}
          </span>
          <span>
            Clave separada: <strong>developer-scenarios:v1</strong>
          </span>
        </footer>
      </section>
    </div>,
    document.body,
  )
}

export function DeveloperControlCenterSystem() {
  const host = useDeveloperPanelHost()
  const [open, setOpen] = useState(false)

  return (
    <>
      {host &&
        createPortal(
          <section className="developer-control-access">
            <span>Experimentación reproducible</span>
            <button type="button" onClick={() => setOpen(true)}>
              <span aria-hidden="true">⌘</span>
              <span>
                <strong>Centro de Control DEV</strong>
                <small>Escenarios, simulación y métricas</small>
              </span>
              <b aria-hidden="true">ABRIR</b>
            </button>
          </section>,
          host,
        )}
      {open && <ControlCenterWindow onClose={() => setOpen(false)} />}
    </>
  )
}
