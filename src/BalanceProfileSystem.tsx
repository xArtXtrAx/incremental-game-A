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
} from './developerPanelWorkspace'
import './BalanceProfileSystem.css'
import {
  BALANCE_PROFILE_NAME_MAX_LENGTH,
  createBrowserBalanceProfileRepository,
  type BalanceDevProfile,
} from './balanceProfiles'
import {
  getBalanceRuntimeSnapshot,
  subscribeBalanceRuntime,
} from './balanceRuntime'
import {
  requestBalanceSessionApply,
  requestOfficialBalanceRestore,
} from './balanceSessionBridge'
import type { BalanceValidationIssue } from './balanceValidation'

type PendingConfirmation =
  | { type: 'replace'; profileId: string }
  | { type: 'delete'; profileId: string }
  | null

const dateFormat = new Intl.DateTimeFormat('es-MX', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function firstIssueMessage(issues: readonly BalanceValidationIssue[]) {
  return issues[0]?.message ?? 'La operación no pudo completarse.'
}

function safeFileName(name: string) {
  const normalized = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
  return normalized || 'perfil-dev'
}

function downloadJson(name: string, content: string) {
  const blob = new Blob([content], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${safeFileName(name)}.balance.json`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

function BalanceProfileWindow({
  onClose,
  portalHost,
}: {
  onClose: () => void
  portalHost: HTMLElement
}) {
  const repository = useMemo(() => createBrowserBalanceProfileRepository(), [])
  const snapshot = useSyncExternalStore(
    subscribeBalanceRuntime,
    getBalanceRuntimeSnapshot,
    getBalanceRuntimeSnapshot,
  )
  const [profiles, setProfiles] = useState<BalanceDevProfile[]>([])
  const [profileName, setProfileName] = useState('')
  const [importText, setImportText] = useState('')
  const [message, setMessage] = useState(
    'Los perfiles se cargan únicamente cuando eliges Cargar.',
  )
  const [hasError, setHasError] = useState(false)
  const [pendingConfirmation, setPendingConfirmation] =
    useState<PendingConfirmation>(null)

  const refreshProfiles = useCallback(() => {
    const result = repository.list()
    if (!result.ok) {
      setProfiles([])
      setHasError(true)
      setMessage(firstIssueMessage(result.issues))
      return false
    }

    setProfiles(result.value)
    if (result.migratedLegacy) {
      setMessage(
        'El perfil heredado se copió a la colección nueva. La clave anterior se conservó como respaldo.',
      )
      setHasError(false)
    }
    return true
  }, [repository])

  useEffect(() => {
    refreshProfiles()
  }, [refreshProfiles])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  function handleSave() {
    const result = repository.save(profileName, snapshot.config)
    if (!result.ok) {
      setHasError(true)
      setMessage(firstIssueMessage(result.issues))
      return
    }

    setProfileName('')
    setHasError(false)
    setMessage(`Perfil “${result.value.name}” guardado.`)
    refreshProfiles()
  }

  function handleLoad(profile: BalanceDevProfile) {
    const outcome = requestBalanceSessionApply(profile.config)
    setHasError(!outcome.applied)
    setMessage(
      outcome.applied
        ? `Perfil “${profile.name}” cargado manualmente en la sesión.`
        : outcome.message,
    )
  }

  function handleReplace(profile: BalanceDevProfile) {
    const result = repository.replace(
      profile.id,
      profile.name,
      snapshot.config,
    )
    setPendingConfirmation(null)
    if (!result.ok) {
      setHasError(true)
      setMessage(firstIssueMessage(result.issues))
      return
    }

    setHasError(false)
    setMessage(
      `Perfil “${result.value.name}” reemplazado con el balance activo.`,
    )
    refreshProfiles()
  }

  function handleDelete(profile: BalanceDevProfile) {
    const result = repository.remove(profile.id)
    setPendingConfirmation(null)
    if (!result.ok) {
      setHasError(true)
      setMessage(firstIssueMessage(result.issues))
      return
    }

    setHasError(false)
    setMessage(`Perfil “${result.value.name}” eliminado.`)
    refreshProfiles()
  }

  function handleExport(profile: BalanceDevProfile) {
    const result = repository.exportJson(profile.id)
    if (!result.ok) {
      setHasError(true)
      setMessage(firstIssueMessage(result.issues))
      return
    }

    downloadJson(profile.name, result.value)
    setHasError(false)
    setMessage(`Perfil “${profile.name}” exportado como JSON.`)
  }

  function handleImport() {
    const result = repository.importJson(importText)
    if (!result.ok) {
      setHasError(true)
      setMessage(firstIssueMessage(result.issues))
      return
    }

    setImportText('')
    setHasError(false)
    setMessage(`Perfil “${result.value.name}” importado.`)
    refreshProfiles()
  }

  function handleRestoreOfficial() {
    const outcome = requestOfficialBalanceRestore()
    setHasError(!outcome.applied)
    setMessage(outcome.message)
  }

  return createPortal(
    <div
      className="balance-profile-backdrop developer-workspace-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        className="balance-profile-window"
        role="dialog"
        aria-modal="false"
        aria-labelledby="balance-profile-title"
      >
        <header className="balance-profile-header">
          <div>
            <span>Laboratorio de Balance · Fase 5</span>
            <h2 id="balance-profile-title">Perfiles DEV persistentes</h2>
            <p>
              Balance activo: <strong>{snapshot.source}</strong> · revisión{' '}
              {snapshot.revision}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar perfiles DEV">
            ×
          </button>
        </header>

        <div className="balance-profile-notice">
          La colección DEV está separada de la partida normal. Recargar siempre
          inicia con el balance oficial; ningún perfil se aplica automáticamente.
        </div>

        <main className="balance-profile-content">
          <div className="balance-profile-grid">
            <section className="balance-profile-column">
              <div className="balance-profile-card">
                <span>Balance activo</span>
                <h3>Guardar perfil nuevo</h3>
                <p>
                  Edita y aplica primero el borrador en el Laboratorio. Después
                  guarda aquí la configuración activa con un nombre único.
                </p>
                <input
                  aria-label="Nombre del perfil DEV"
                  value={profileName}
                  maxLength={BALANCE_PROFILE_NAME_MAX_LENGTH}
                  placeholder="Ej. Progresión rápida P0–P5"
                  onChange={(event) => setProfileName(event.currentTarget.value)}
                />
                <div className="balance-profile-actions">
                  <button
                    type="button"
                    className="is-primary"
                    disabled={profileName.trim() === ''}
                    onClick={handleSave}
                  >
                    Guardar perfil
                  </button>
                  <button
                    type="button"
                    disabled={snapshot.source === 'official'}
                    onClick={handleRestoreOfficial}
                  >
                    Restaurar balance oficial
                  </button>
                </div>
              </div>

              <div className="balance-profile-card">
                <span>Importación segura</span>
                <h3>Importar JSON</h3>
                <p>
                  Solo se aceptan exportaciones compatibles y configuraciones que
                  superen la validación completa de estructura, límites y relaciones.
                </p>
                <textarea
                  aria-label="JSON del perfil DEV"
                  value={importText}
                  placeholder="Pega aquí el JSON exportado"
                  onChange={(event) => setImportText(event.currentTarget.value)}
                />
                <div className="balance-profile-actions">
                  <button
                    type="button"
                    disabled={importText.trim() === ''}
                    onClick={handleImport}
                  >
                    Importar perfil
                  </button>
                  <button type="button" onClick={() => setImportText('')}>
                    Limpiar
                  </button>
                </div>
              </div>
            </section>

            <section className="balance-profile-list" aria-label="Perfiles DEV guardados">
              <div className="balance-profile-card">
                <span>Colección local</span>
                <h3>Perfiles guardados ({profiles.length})</h3>
                <p>
                  Cargar aplica el perfil únicamente a la sesión actual. Reemplazar
                  usa el balance activo y requiere confirmación.
                </p>
              </div>

              {profiles.length === 0 && (
                <div className="balance-profile-card">
                  <p>No hay perfiles DEV guardados.</p>
                </div>
              )}

              {profiles.map((profile) => {
                const confirming =
                  pendingConfirmation?.profileId === profile.id
                    ? pendingConfirmation.type
                    : null
                return (
                  <article className="balance-profile-row" key={profile.id}>
                    <div>
                      <strong>{profile.name}</strong>
                      <small>
                        Actualizado {dateFormat.format(new Date(profile.updatedAt))}
                      </small>
                    </div>
                    <div className="balance-profile-actions">
                      <button type="button" onClick={() => handleLoad(profile)}>
                        Cargar
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setPendingConfirmation({
                            type: 'replace',
                            profileId: profile.id,
                          })
                        }
                      >
                        Reemplazar
                      </button>
                      <button type="button" onClick={() => handleExport(profile)}>
                        Exportar
                      </button>
                      <button
                        type="button"
                        className="is-danger"
                        onClick={() =>
                          setPendingConfirmation({
                            type: 'delete',
                            profileId: profile.id,
                          })
                        }
                      >
                        Eliminar
                      </button>
                    </div>
                    {confirming && (
                      <div className="balance-profile-confirm">
                        <p>
                          {confirming === 'delete'
                            ? `¿Eliminar definitivamente “${profile.name}”?`
                            : `¿Reemplazar “${profile.name}” con el balance activo?`}
                        </p>
                        <div className="balance-profile-confirm-actions">
                          <button
                            type="button"
                            className={confirming === 'delete' ? 'is-danger' : 'is-primary'}
                            onClick={() =>
                              confirming === 'delete'
                                ? handleDelete(profile)
                                : handleReplace(profile)
                            }
                          >
                            Confirmar {confirming === 'delete' ? 'eliminación' : 'reemplazo'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPendingConfirmation(null)
                              setHasError(false)
                              setMessage('Operación cancelada; el perfil no cambió.')
                            }}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                )
              })}
            </section>
          </div>
        </main>

        <footer className="balance-profile-footer">
          <span>
            Clave nueva versionada: <strong>balance-dev-profiles:v2</strong>
          </span>
          <div className="balance-profile-actions">
            <button type="button" onClick={refreshProfiles}>
              Actualizar lista
            </button>
            <button type="button" onClick={onClose}>
              Cerrar
            </button>
          </div>
          <div className="balance-profile-message" data-error={hasError || undefined} role="status">
            {message}
          </div>
        </footer>
      </section>
    </div>,
    portalHost,
  )
}

export function BalanceProfileSystem() {
  const host = useDeveloperPanelLauncherHost()
  const workspaceHost = useDeveloperPanelWorkspaceHost()
  const [open, setOpen] = useState(false)

  return (
    <>
      {host &&
        createPortal(
          <section className="developer-balance-profiles-access">
            <button type="button" onClick={() => setOpen(true)}>
              <span aria-hidden="true">▣</span>
              <span>
                <strong>Perfiles DEV</strong>
                <small>Guardar, cargar, importar y exportar balance</small>
              </span>
              <b aria-hidden="true">FASE 5</b>
            </button>
          </section>,
          host,
        )}
      {open && workspaceHost && (
        <BalanceProfileWindow
          portalHost={workspaceHost}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
