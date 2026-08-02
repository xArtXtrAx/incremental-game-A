import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  AUTOCLICK_REQUIRED_CLICKS,
  CAVITATION_REQUIRED_CLICKS,
  getAutoclickCost,
  getCavitationClicksRequired,
  getCavitationCost,
  getClickUpgradeCost,
  getGeneratorCost,
  getOverloadClicksRequired,
  getOverloadCost,
  getOverloadDurationSeconds,
  getOverloadRemainingSeconds,
  getPressureCost,
  getPressureTier,
  getResonanceCost,
  hasUnlockedBlueprints,
  initialGameState,
  isOverloadActive,
  loadGameState,
  PRESSURE_REQUIRED_CLICKS,
  SPHERE_CLICK_CAPACITY,
  type GameState,
} from './game'
import {
  getRefractionChargeRate,
  getRefractionCost,
  getRefractionDurationSeconds,
  getRefractionFacetCount,
  getRefractionRemainingSeconds,
  isRefractionActive,
  REFRACTION_REQUIRED_PRESTIGE,
} from './refraction'
import {
  UpgradeProgressStack,
  type UpgradeProgressDefinition,
} from './UpgradeProgressBar'

type UpgradeId =
  | 'pulse-amplifier'
  | 'micro-generator'
  | 'resonance-reactor'
  | 'pressure-condenser'
  | 'cavitation-chamber'
  | 'overload-valve'
  | 'autonomous-pulser'
  | 'refraction-matrix'

type ProgressHosts = Record<UpgradeId, HTMLElement | null>

type ProgressSnapshot = {
  game: GameState
  now: number
}

const UPGRADE_TITLES: Record<UpgradeId, string> = {
  'pulse-amplifier': 'Amplificador de pulso',
  'micro-generator': 'Microgenerador',
  'resonance-reactor': 'Reactor de resonancia',
  'pressure-condenser': 'Condensador de presión',
  'cavitation-chamber': 'Cámara de cavitación',
  'overload-valve': 'Válvula de sobrecarga',
  'autonomous-pulser': 'Módulo de pulsación autónoma',
  'refraction-matrix': 'Matriz de refracción',
}

const EMPTY_HOSTS: ProgressHosts = {
  'pulse-amplifier': null,
  'micro-generator': null,
  'resonance-reactor': null,
  'pressure-condenser': null,
  'cavitation-chamber': null,
  'overload-valve': null,
  'autonomous-pulser': null,
  'refraction-matrix': null,
}

const PROGRESS_STATE_KEYS: readonly (keyof GameState)[] = [
  'energy',
  'manualClicks',
  'clickLevel',
  'generatorLevel',
  'resonanceLevel',
  'pressureLevel',
  'cavitationLevel',
  'cavitationCharge',
  'autoclickLevel',
  'autoclickProgress',
  'overloadLevel',
  'overloadCharge',
  'overloadUntil',
  'refractionLevel',
  'refractionOrbitProgress',
  'refractionFacetsCharged',
  'refractionUntil',
  'prestigeCount',
]

const format = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 2 })

function sameProgressState(a: GameState, b: GameState) {
  return PROGRESS_STATE_KEYS.every((key) => a[key] === b[key])
}

function energyProgress(
  id: string,
  energy: number,
  cost: number,
): UpgradeProgressDefinition {
  const ready = energy >= cost

  return {
    id,
    label: 'Siguiente nivel',
    detail: ready
      ? `LISTO · ${format.format(cost)} energía`
      : `${format.format(energy)} / ${format.format(cost)} energía`,
    value: Math.min(energy, cost),
    maximum: Math.max(1, cost),
    tone: ready ? 'ready' : 'charging',
  }
}

function requirementProgress(
  id: string,
  label: string,
  value: number,
  maximum: number,
  detail: string,
): UpgradeProgressDefinition {
  return {
    id,
    label,
    detail,
    value: Math.min(value, maximum),
    maximum: Math.max(1, maximum),
    tone: 'locked',
  }
}

function findProgressHost(id: UpgradeId) {
  const cards = Array.from(
    document.querySelectorAll<HTMLElement>('.upgrade-card.compact'),
  )
  const title = UPGRADE_TITLES[id]
  const card = cards.find(
    (element) => element.querySelector('h3')?.textContent?.trim() === title,
  )
  if (!card) return null

  const existing = card.querySelector<HTMLElement>(
    `[data-upgrade-progress-host="${id}"]`,
  )
  if (existing) return existing

  const host = document.createElement('div')
  host.dataset.upgradeProgressHost = id
  host.className = 'upgrade-progress-portal-host'
  const quick = card.querySelector('.upgrade-quick')
  quick?.insertAdjacentElement('afterend', host)
  return host.isConnected ? host : null
}

function buildProgressItems(game: GameState, now: number) {
  const blueprintsUnlocked = hasUnlockedBlueprints(game)
  const sphereFull = game.manualClicks >= SPHERE_CLICK_CAPACITY
  const pressureDiscoveryMissing =
    !blueprintsUnlocked && game.manualClicks < PRESSURE_REQUIRED_CLICKS
  const cavitationDiscoveryMissing =
    !blueprintsUnlocked && game.manualClicks < CAVITATION_REQUIRED_CLICKS
  const autoclickDiscoveryMissing =
    !blueprintsUnlocked && game.manualClicks < AUTOCLICK_REQUIRED_CLICKS
  const overloadDiscoveryMissing = !blueprintsUnlocked && !sphereFull
  const refractionPrestigeMissing =
    game.prestigeCount < REFRACTION_REQUIRED_PRESTIGE

  const pressureItems: UpgradeProgressDefinition[] = [
    pressureDiscoveryMissing
      ? requirementProgress(
          'pressure-unlock',
          'Descubrimiento',
          game.manualClicks,
          PRESSURE_REQUIRED_CLICKS,
          `${Math.min(game.manualClicks, PRESSURE_REQUIRED_CLICKS)} / ${PRESSURE_REQUIRED_CLICKS} clics`,
        )
      : energyProgress(
          'pressure-cost',
          game.energy,
          getPressureCost(game.pressureLevel),
        ),
  ]
  if (game.pressureLevel > 0) {
    pressureItems.push({
      id: 'pressure-cycle',
      label: 'Presión del núcleo',
      detail: `${getPressureTier(game.manualClicks)}/10 tramos`,
      value: Math.min(game.manualClicks, SPHERE_CLICK_CAPACITY),
      maximum: SPHERE_CLICK_CAPACITY,
      tone: sphereFull ? 'ready' : 'charging',
      segments: 10,
    })
  }

  const cavitationItems: UpgradeProgressDefinition[] = [
    cavitationDiscoveryMissing
      ? requirementProgress(
          'cavitation-unlock',
          'Descubrimiento',
          game.manualClicks,
          CAVITATION_REQUIRED_CLICKS,
          `${Math.min(game.manualClicks, CAVITATION_REQUIRED_CLICKS)} / ${CAVITATION_REQUIRED_CLICKS} clics`,
        )
      : game.generatorLevel === 0
        ? requirementProgress(
            'cavitation-generator',
            'Instalación requerida',
            0,
            1,
            'Microgenerador 0/1',
          )
        : energyProgress(
            'cavitation-cost',
            game.energy,
            getCavitationCost(game.cavitationLevel),
          ),
  ]
  if (game.cavitationLevel > 0) {
    const threshold = getCavitationClicksRequired(game.cavitationLevel)
    cavitationItems.push({
      id: 'cavitation-cycle',
      label: 'Carga de cavitación',
      detail: `${game.cavitationCharge} / ${threshold} clics`,
      value: game.cavitationCharge,
      maximum: threshold,
      tone: 'charging',
    })
  }

  const autoclickItems: UpgradeProgressDefinition[] = [
    autoclickDiscoveryMissing
      ? requirementProgress(
          'autoclick-unlock',
          'Descubrimiento',
          game.manualClicks,
          AUTOCLICK_REQUIRED_CLICKS,
          `${Math.min(game.manualClicks, AUTOCLICK_REQUIRED_CLICKS)} / ${AUTOCLICK_REQUIRED_CLICKS} clics`,
        )
      : game.generatorLevel === 0
        ? requirementProgress(
            'autoclick-generator',
            'Instalación requerida',
            0,
            1,
            'Microgenerador 0/1',
          )
        : energyProgress(
            'autoclick-cost',
            game.energy,
            getAutoclickCost(game.autoclickLevel),
          ),
  ]
  if (game.autoclickLevel > 0) {
    autoclickItems.push({
      id: 'autoclick-cycle',
      label: 'Próximo clic autónomo',
      detail: `${format.format(game.autoclickProgress * 100)}%`,
      value: game.autoclickProgress,
      maximum: 1,
      tone: 'active',
    })
  }

  const overloadItems: UpgradeProgressDefinition[] = [
    overloadDiscoveryMissing
      ? requirementProgress(
          'overload-unlock',
          'Esfera requerida',
          game.manualClicks,
          SPHERE_CLICK_CAPACITY,
          `${Math.min(game.manualClicks, SPHERE_CLICK_CAPACITY)} / ${SPHERE_CLICK_CAPACITY} clics`,
        )
      : game.cavitationLevel === 0
        ? requirementProgress(
            'overload-cavitation',
            'Instalación requerida',
            0,
            1,
            'Cavitación 0/1',
          )
        : energyProgress(
            'overload-cost',
            game.energy,
            getOverloadCost(game.overloadLevel),
          ),
  ]
  if (game.overloadLevel > 0) {
    const active = isOverloadActive(game.overloadUntil, now)
    const threshold = getOverloadClicksRequired(game.overloadLevel)
    const duration = getOverloadDurationSeconds(game.overloadLevel)
    const remaining = getOverloadRemainingSeconds(game.overloadUntil, now)
    overloadItems.push(
      active
        ? {
            id: 'overload-active',
            label: 'Sobrecarga activa',
            detail: `${remaining.toFixed(1)} s`,
            value: remaining,
            maximum: duration,
            tone: 'active',
          }
        : {
            id: 'overload-cycle',
            label: 'Carga de sobrecarga',
            detail: `${game.overloadCharge} / ${threshold} clics`,
            value: game.overloadCharge,
            maximum: threshold,
            tone: 'charging',
          },
    )
  }

  const refractionItems: UpgradeProgressDefinition[] = [
    refractionPrestigeMissing
      ? requirementProgress(
          'refraction-prestige',
          'Prestigio requerido',
          game.prestigeCount,
          REFRACTION_REQUIRED_PRESTIGE,
          `P${game.prestigeCount} / P${REFRACTION_REQUIRED_PRESTIGE}`,
        )
      : game.generatorLevel === 0
        ? requirementProgress(
            'refraction-generator',
            'Instalación requerida',
            0,
            1,
            'Microgenerador 0/1',
          )
        : energyProgress(
            'refraction-cost',
            game.energy,
            getRefractionCost(game.refractionLevel),
          ),
  ]
  if (game.refractionLevel > 0) {
    const active = isRefractionActive(game.refractionUntil, now)
    const duration = getRefractionDurationSeconds(game.refractionLevel)
    const remaining = getRefractionRemainingSeconds(game.refractionUntil, now)
    const facets = getRefractionFacetCount(game.prestigeCount)
    const projectedCharge = Math.min(
      facets,
      game.refractionFacetsCharged +
        game.refractionOrbitProgress *
          getRefractionChargeRate(game.refractionLevel),
    )
    refractionItems.push(
      active
        ? {
            id: 'refraction-active',
            label: 'PRISMA activo',
            detail: `${remaining.toFixed(1)} s`,
            value: remaining,
            maximum: duration,
            tone: 'active',
          }
        : {
            id: 'refraction-cycle',
            label: 'Carga prismática',
            detail: `${game.refractionFacetsCharged}/${facets} facetas · ${format.format(game.refractionOrbitProgress * 100)}% vuelta`,
            value: projectedCharge,
            maximum: facets,
            tone: 'charging',
            segments: facets,
          },
    )
  }

  return {
    'pulse-amplifier': [
      energyProgress(
        'click-cost',
        game.energy,
        getClickUpgradeCost(game.clickLevel),
      ),
    ],
    'micro-generator': [
      energyProgress(
        'generator-cost',
        game.energy,
        getGeneratorCost(game.generatorLevel),
      ),
    ],
    'resonance-reactor': [
      game.generatorLevel === 0
        ? requirementProgress(
            'resonance-generator',
            'Instalación requerida',
            0,
            1,
            'Microgenerador 0/1',
          )
        : energyProgress(
            'resonance-cost',
            game.energy,
            getResonanceCost(game.resonanceLevel),
          ),
    ],
    'pressure-condenser': pressureItems,
    'cavitation-chamber': cavitationItems,
    'overload-valve': overloadItems,
    'autonomous-pulser': autoclickItems,
    'refraction-matrix': refractionItems,
  } satisfies Record<UpgradeId, readonly UpgradeProgressDefinition[]>
}

export function UpgradeProgressSystem() {
  const initialGame = loadGameState(initialGameState)
  const [snapshot, setSnapshot] = useState<ProgressSnapshot>(() => ({
    game: initialGame,
    now: Date.now(),
  }))
  const [hosts, setHosts] = useState<ProgressHosts>(EMPTY_HOSTS)
  const gameRef = useRef(initialGame)

  useEffect(() => {
    const resolveHosts = () => {
      setHosts((current) => {
        let changed = false
        const next = { ...current }

        for (const id of Object.keys(UPGRADE_TITLES) as UpgradeId[]) {
          const host = findProgressHost(id)
          if (host !== current[id]) {
            next[id] = host
            changed = true
          }
        }

        return changed ? next : current
      })
    }

    resolveHosts()
    const observer = new MutationObserver(resolveHosts)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => {
      const nextGame = loadGameState(initialGameState)
      const now = Date.now()
      const timerActive =
        nextGame.overloadUntil > now || nextGame.refractionUntil > now

      if (!sameProgressState(nextGame, gameRef.current) || timerActive) {
        gameRef.current = nextGame
        setSnapshot({ game: nextGame, now })
      }
    }, 100)

    return () => window.clearInterval(timer)
  }, [])

  const progressItems = useMemo(
    () => buildProgressItems(snapshot.game, snapshot.now),
    [snapshot],
  )

  return (
    <>
      {(Object.keys(UPGRADE_TITLES) as UpgradeId[]).map((id) => {
        const host = hosts[id]
        if (!host) return null

        return createPortal(
          <UpgradeProgressStack items={progressItems[id]} />,
          host,
          id,
        )
      })}
    </>
  )
}
