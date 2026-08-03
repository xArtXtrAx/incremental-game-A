import {
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react'
import { createPortal } from 'react-dom'
import './BalanceLaboratorySystem.css'
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
  type BalanceCostSystem,
} from './balanceSimulation'

const COST_SYSTEMS: readonly {
  id: BalanceCostSystem
  label: string
}[] = [
  { id: 'click', label: 'Amplificador de pulso' },
  { id: 'generator', label: 'Microgenerador' },
  { id: 'resonance', label: 'Resonancia' },
  { id: 'pressure', label: 'Presión' },
  { id: 'cavitation', label: 'Cavitación' },
  { id: 'autoclick', label: 'Autoclicker' },
  { id: 'overload', label: 'Sobrecarga' },
  { id: 'refraction', label: 'Refracción' },
  { id: 'pulseTrigger', label: 'Gatillo de pulso' },
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

function BalanceLaboratoryWindow({ onClose }: { onClose: () => void }) {
  const snapshot = useSyncExternalStore(
    subscribeBalanceRuntime,
    getBalanceRuntimeSnapshot,
    getBalanceRuntimeSnapshot,
  )
  const [selectedSystem, setSelectedSystem] =
    useState<BalanceCostSystem>('click')
  const config = snapshot.config
  const selectedDefinition =
    COST_SYSTEMS.find((system) => system.id === selectedSystem) ??
    COST_SYSTEMS[0]
  const costSamples = useMemo(
    () => simulateCostCurve(config, selectedSystem),
    [config, selectedSystem],
  )
  const autoclickSamples = useMemo(
    () => simulateAutoclickRates(config),
    [config],
  )
  const diagnostics = useMemo(
    () => createBalanceDiagnostics(config),
    [config],
  )
  const storedProfile = useMemo(() => readStoredBalanceProfile(), [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

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
              Fuente activa: <strong>{snapshot.source}</strong> · revisión{' '}
              {snapshot.revision}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar laboratorio">
            ×
          </button>
        </header>

        <div className="balance-laboratory-notice" role="status">
          <strong>Modo de inspección.</strong> La edición permanece bloqueada hasta
          completar la migración de todos los consumidores y las pruebas de
          paridad. Esta ventana no modifica la partida ni el guardado.
        </div>

        <div className="balance-laboratory-grid">
          <section className="balance-laboratory-card">
            <div className="balance-laboratory-card-heading">
              <div>
                <span>Economía</span>
                <h3>Curva de costos</h3>
              </div>
              <select
                value={selectedSystem}
                onChange={(event) =>
                  setSelectedSystem(event.currentTarget.value as BalanceCostSystem)
                }
                aria-label="Sistema de costo"
              >
                {COST_SYSTEMS.map((system) => (
                  <option key={system.id} value={system.id}>
                    {system.label}
                  </option>
                ))}
              </select>
            </div>

            <p>
              {selectedDefinition.label}: base{' '}
              <strong>
                {numberFormat.format(config.costs[selectedSystem].baseCost)}
              </strong>{' '}
              · crecimiento{' '}
              <strong>×{config.costs[selectedSystem].growth}</strong>
            </p>

            <table>
              <thead>
                <tr>
                  <th>Nivel</th>
                  <th>Costo</th>
                </tr>
              </thead>
              <tbody>
                {costSamples.map((sample) => (
                  <tr key={sample.level}>
                    <td>{sample.level}</td>
                    <td>{numberFormat.format(sample.cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <small>
              Muestras: {BALANCE_COST_LEVEL_SAMPLES.join(', ')}. Los cálculos son
              puros y no compran niveles.
            </small>
          </section>

          <section className="balance-laboratory-card">
            <div className="balance-laboratory-card-heading">
              <div>
                <span>Automatización</span>
                <h3>Autoclicker</h3>
              </div>
            </div>
            <p>
              Base {config.autoclick.baseRate} clic/s · crecimiento ×
              {config.autoclick.growth} · límite {config.autoclick.maximumRate}
            </p>
            <table>
              <thead>
                <tr>
                  <th>Nivel</th>
                  <th>Clics/s</th>
                </tr>
              </thead>
              <tbody>
                {autoclickSamples.map((sample) => (
                  <tr key={sample.level}>
                    <td>{sample.level}</td>
                    <td>{numberFormat.format(sample.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="balance-laboratory-card">
            <div className="balance-laboratory-card-heading">
              <div>
                <span>Metaprogresión</span>
                <h3>Zafiro</h3>
              </div>
            </div>
            <div className="balance-laboratory-sapphire-row">
              {config.sapphire.multipliers.map((_, prestige) => (
                <div key={prestige}>
                  <span>P{prestige}</span>
                  <strong>
                    ×{getConfiguredSapphireMultiplier(config, prestige).toFixed(2)}
                  </strong>
                </div>
              ))}
            </div>
            <p>
              Después de P5: +
              {config.sapphire.postMaximumLevelIncrement.toFixed(2)} por
              cristalización. Estado actual: <strong>provisional</strong>.
            </p>
          </section>

          <section className="balance-laboratory-card">
            <div className="balance-laboratory-card-heading">
              <div>
                <span>Seguridad</span>
                <h3>Diagnóstico</h3>
              </div>
            </div>
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
            <p>
              Perfil DEV guardado:{' '}
              <strong>
                {storedProfile.found ? storedProfile.profile.name : 'ninguno'}
              </strong>
            </p>
          </section>
        </div>

        <footer className="balance-laboratory-footer">
          <span>
            Guardado DEV separado: <code>incremental-game-a:balance-dev:v1</code>
          </span>
          <button type="button" onClick={onClose}>
            Cerrar inspección
          </button>
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
                <small>Inspeccionar fórmulas y curvas actuales</small>
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
