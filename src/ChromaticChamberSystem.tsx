import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './ChromaticChamberSystem.css'
import { GAME_STORAGE_KEY } from './game'
import {
  CHROMATIC_CLOSE_EVENT,
  CHROMATIC_GEMS,
  CHROMATIC_OPEN_EVENT,
  CHROMATIC_REQUIRED_SAPPHIRE_LEVEL,
  type ChromaticGemId,
  type ChromaticOpenDetail,
  type ChromaticOpenMode,
} from './chromatic'

function readPrestigeCount() {
  try {
    const raw = window.localStorage.getItem(GAME_STORAGE_KEY)
    if (!raw) return 0

    const parsed = JSON.parse(raw) as {
      state?: { prestigeCount?: unknown }
    }
    const value = parsed.state?.prestigeCount
    return typeof value === 'number' && Number.isFinite(value)
      ? Math.max(0, Math.floor(value))
      : 0
  } catch {
    return 0
  }
}

function getGemLevel(id: ChromaticGemId, prestigeCount: number) {
  return id === 'sapphire'
    ? Math.min(CHROMATIC_REQUIRED_SAPPHIRE_LEVEL, prestigeCount)
    : 0
}

function getGemSummary(
  id: ChromaticGemId,
  level: number,
  sapphireComplete: boolean,
) {
  if (id === 'sapphire') {
    return sapphireComplete
      ? 'Nivel 5 · En órbita'
      : `Nivel ${level}/5 · En desarrollo`
  }

  if (id === 'emerald') {
    return sapphireComplete ? 'Próxima gema' : 'Requiere Zafiro 5'
  }

  return 'Bloqueada'
}

export function ChromaticChamberSystem() {
  const [headerHost, setHeaderHost] = useState<HTMLElement | null>(null)
  const [prestigeCount, setPrestigeCount] = useState(readPrestigeCount)
  const [isOpen, setIsOpen] = useState(false)
  const [developerPreview, setDeveloperPreview] = useState(false)
  const [selectedGem, setSelectedGem] =
    useState<ChromaticGemId>('sapphire')
  const previousFocus = useRef<HTMLElement | null>(null)
  const unlocked = prestigeCount >= CHROMATIC_REQUIRED_SAPPHIRE_LEVEL
  const linkedFrequencies = unlocked ? 1 : 0

  const closeChamber = useCallback(() => {
    setIsOpen(false)
    window.setTimeout(() => {
      const previous = previousFocus.current
      const access = document.querySelector<HTMLElement>(
        '.chromatic-access-button:not(:disabled)',
      )
      const fallback = document.querySelector<HTMLElement>(
        '.developer-chromatic-button',
      )
      const target = previous?.isConnected ? previous : access ?? fallback
      target?.focus({ preventScroll: true })
      previousFocus.current = null
      setDeveloperPreview(false)
    }, 0)
  }, [])

  const openChamber = useCallback((mode: ChromaticOpenMode = 'normal') => {
    const nextPrestigeCount = readPrestigeCount()
    const preview = mode === 'developer-preview'

    if (
      !preview &&
      nextPrestigeCount < CHROMATIC_REQUIRED_SAPPHIRE_LEVEL
    ) {
      return
    }

    previousFocus.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    setPrestigeCount(nextPrestigeCount)
    setSelectedGem('sapphire')
    setDeveloperPreview(preview)
    setIsOpen(true)
  }, [])

  useEffect(() => {
    const resolveHeader = () => {
      const next = document.querySelector<HTMLElement>('.game-header')
      if (next) setHeaderHost(next)
    }

    resolveHeader()
    const observer = new MutationObserver(resolveHeader)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => {
      const next = readPrestigeCount()
      setPrestigeCount((current) => (current === next ? current : next))
    }, 180)

    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const handleOpen = (event: Event) => {
      const detail =
        event instanceof CustomEvent
          ? (event.detail as ChromaticOpenDetail | undefined)
          : undefined
      openChamber(
        detail?.mode === 'developer-preview'
          ? 'developer-preview'
          : 'normal',
      )
    }
    const handleClose = () => closeChamber()

    document.addEventListener(CHROMATIC_OPEN_EVENT, handleOpen)
    document.addEventListener(CHROMATIC_CLOSE_EVENT, handleClose)
    return () => {
      document.removeEventListener(CHROMATIC_OPEN_EVENT, handleOpen)
      document.removeEventListener(CHROMATIC_CLOSE_EVENT, handleClose)
    }
  }, [closeChamber, openChamber])

  useEffect(() => {
    if (unlocked || developerPreview || !isOpen) return
    closeChamber()
  }, [closeChamber, developerPreview, isOpen, unlocked])

  useEffect(() => {
    if (!isOpen) return

    document.body.classList.add('is-chromatic-open')
    const focusTimer = window.setTimeout(() => {
      document
        .querySelector<HTMLElement>('.chromatic-back-button')
        ?.focus({ preventScroll: true })
    }, 40)

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeChamber()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.clearTimeout(focusTimer)
      window.removeEventListener('keydown', handleKeyDown)
      document.body.classList.remove('is-chromatic-open')
    }
  }, [closeChamber, isOpen])

  useEffect(
    () => () => {
      document.body.classList.remove('is-chromatic-open')
      previousFocus.current = null
    },
    [],
  )

  const selectedDefinition =
    CHROMATIC_GEMS.find((gem) => gem.id === selectedGem) ??
    CHROMATIC_GEMS[0]
  const selectedLevel = getGemLevel(selectedGem, prestigeCount)
  const selectedComplete = selectedLevel >= 5
  const selectedIsSapphire = selectedGem === 'sapphire'
  const selectedIsNext = selectedGem === 'emerald' && unlocked
  const selectedStatus = selectedIsSapphire
    ? selectedComplete
      ? 'Primera órbita completa'
      : `Desarrollo ${selectedLevel}/5`
    : selectedGem === 'emerald'
      ? unlocked
        ? 'Siguiente resonancia'
        : 'Requiere Zafiro 5'
      : selectedDefinition.status

  const accessPortal = headerHost
    ? createPortal(
        <div className="chromatic-access-wrap">
          <button
            type="button"
            className={`chromatic-access-button${unlocked ? ' is-unlocked' : ''}`}
            disabled={!unlocked}
            onClick={() => openChamber('normal')}
            aria-label={
              unlocked
                ? 'Abrir Cámara Cromática'
                : `Cámara Cromática bloqueada. Zafiro ${Math.min(prestigeCount, 5)} de 5.`
            }
          >
            <span className="chromatic-access-glyph" aria-hidden="true">
              ◇
            </span>
            <span>
              <strong>Cámara Cromática</strong>
              <small>
                {unlocked
                  ? 'Primera órbita disponible'
                  : `Bloqueada · Zafiro ${Math.min(prestigeCount, 5)}/5`}
              </small>
            </span>
            <b aria-hidden="true">{unlocked ? 'ENTRAR' : 'INERTE'}</b>
          </button>
        </div>,
        headerHost,
      )
    : null

  const chamberPortal = isOpen
    ? createPortal(
        <div className="chromatic-overlay" role="dialog" aria-modal="true">
          <div className="chromatic-space" aria-hidden="true">
            <span className="chromatic-star star-one" />
            <span className="chromatic-star star-two" />
            <span className="chromatic-star star-three" />
            <span className="chromatic-star star-four" />
            <span className="chromatic-star star-five" />
          </div>

          <section
            className={`chromatic-chamber${
              developerPreview ? ' is-developer-preview' : ''
            }`}
            aria-labelledby="chromatic-title"
          >
            <header className="chromatic-header">
              <button
                type="button"
                className="chromatic-back-button"
                onClick={closeChamber}
              >
                <span aria-hidden="true">←</span>
                Volver al reactor
              </button>

              <div className="chromatic-title-stack">
                {developerPreview && (
                  <span className="chromatic-preview-badge">
                    Vista DEV · Estado real
                  </span>
                )}
                <p>Metaprogresión espectral</p>
                <h2 id="chromatic-title">Cámara Cromática</h2>
              </div>

              <div className="chromatic-header-status">
                <span>Órbitas completas</span>
                <strong>{linkedFrequencies} / 5</strong>
              </div>
            </header>

            <div className="chromatic-content">
              <div className="chromatic-stage" aria-label="Nexo Prismático">
                <div className="chromatic-orbit orbit-outer" aria-hidden="true" />
                <div className="chromatic-orbit orbit-middle" aria-hidden="true" />
                <div className="chromatic-orbit orbit-inner" aria-hidden="true" />

                {unlocked && (
                  <div className="chromatic-sapphire-orbit" aria-hidden="true">
                    <span className="chromatic-sapphire-gem">
                      <i />
                    </span>
                  </div>
                )}

                <div
                  className={`prismatic-nexus${
                    unlocked ? ' is-partially-awake' : ''
                  }`}
                >
                  <span className="nexus-aura" aria-hidden="true" />
                  <span className="nexus-facet facet-blue" aria-hidden="true" />
                  <span className="nexus-facet facet-green" aria-hidden="true" />
                  <span className="nexus-facet facet-yellow" aria-hidden="true" />
                  <span className="nexus-facet facet-orange" aria-hidden="true" />
                  <span className="nexus-facet facet-red" aria-hidden="true" />
                  <span className="nexus-core" aria-hidden="true" />
                  <div className="nexus-label">
                    <span>Nexo Prismático</span>
                    <strong>
                      {unlocked ? 'Espectro incompleto' : 'Espectro inerte'}
                    </strong>
                    <small>
                      {linkedFrequencies} de 5 frecuencias enlazadas
                    </small>
                  </div>
                </div>

                <div className="chromatic-gem-slots">
                  {CHROMATIC_GEMS.map((gem, index) => {
                    const level = getGemLevel(gem.id, prestigeCount)
                    const complete = level >= 5
                    const next = gem.id === 'emerald' && unlocked
                    return (
                      <button
                        type="button"
                        key={gem.id}
                        className={`chromatic-gem-slot slot-${index + 1} ${gem.className}${
                          complete ? ' is-complete' : ''
                        }${next ? ' is-next' : ''}${
                          selectedGem === gem.id ? ' is-selected' : ''
                        }`}
                        aria-pressed={selectedGem === gem.id}
                        onClick={() => setSelectedGem(gem.id)}
                      >
                        <span className="slot-gem" aria-hidden="true" />
                        <span>
                          <strong>{gem.name}</strong>
                          <small>
                            {getGemSummary(gem.id, level, unlocked)}
                          </small>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <aside className="chromatic-inspector" aria-live="polite">
                <p className="chromatic-inspector-eyebrow">Frecuencia seleccionada</p>
                <div className={`inspector-gem ${selectedDefinition.className}`}>
                  <span aria-hidden="true" />
                </div>
                <h3>{selectedDefinition.name}</h3>
                <div className="chromatic-level-row">
                  <span>Nivel orbital</span>
                  <strong>{selectedLevel} / 5</strong>
                </div>
                <div className="chromatic-level-track" aria-hidden="true">
                  <span style={{ width: `${(selectedLevel / 5) * 100}%` }} />
                </div>
                <p>
                  {selectedIsSapphire
                    ? selectedComplete
                      ? 'El Zafiro completó su ciclo y ahora alimenta permanentemente el primer sector azul del Nexo.'
                      : `El Zafiro se encuentra en nivel ${selectedLevel} de 5. La primera órbita y la faceta azul siguen inactivas.`
                    : selectedIsNext
                      ? 'La Esmeralda será la siguiente frecuencia en desarrollarse. Sus mecánicas todavía están por definir.'
                      : selectedGem === 'emerald'
                        ? 'La Esmeralda permanece sellada hasta que el Zafiro complete su quinto nivel.'
                        : 'Esta frecuencia permanece sellada hasta completar las gemas anteriores.'}
                </p>
                <div className="chromatic-inspector-status">
                  <span>Estado</span>
                  <strong>{selectedStatus}</strong>
                </div>
              </aside>
            </div>

            <footer className="chromatic-footer">
              <span>
                {developerPreview
                  ? 'Vista DEV: inspección solamente · No modifica niveles ni desbloqueos'
                  : 'Mouse/teclado: selecciona una gema · Esc para volver'}
              </span>
              <span>Control: L1 + R1 para entrar · Círculo/B para volver</span>
            </footer>
          </section>
        </div>,
        document.body,
      )
    : null

  return (
    <>
      {accessPortal}
      {chamberPortal}
    </>
  )
}
