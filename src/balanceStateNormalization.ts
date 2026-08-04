import {
  DEFAULT_BALANCE_CONFIG,
  type BalanceConfig,
} from './balanceConfig'
import { getActiveBalanceConfig } from './balanceRuntime'
import {
  getBalanceUnlockRequirement,
  type BalanceUnlockId,
} from './balanceUnlockPolicy'
import type { GameState } from './game'

export type BalanceNormalizationSeverity = 'info' | 'warning'
export type BalanceNormalizationPath =
  | keyof GameState
  | 'balance.sphere-status'
  | 'balance.pressure-bonus'
  | `balance.unlock.${BalanceUnlockId}`

export type BalanceNormalizationChange = {
  path: BalanceNormalizationPath
  label: string
  before: number
  after: number
  beforeLabel?: string
  afterLabel?: string
  severity: BalanceNormalizationSeverity
  reason: string
}

export type BalanceNormalizationPreview = {
  state: GameState
  changes: BalanceNormalizationChange[]
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value))
}

function getCavitationThreshold(
  config: Readonly<BalanceConfig>,
  level: number,
) {
  if (level <= 0) return config.cavitation.inactiveClicksRequired

  return Math.max(
    config.cavitation.minimumClicksRequired,
    config.cavitation.baseClicksRequired -
      level * config.cavitation.clicksReducedPerLevel,
  )
}

function getOverloadThreshold(
  config: Readonly<BalanceConfig>,
  level: number,
) {
  if (level <= 0) return config.overload.inactiveClicksRequired

  return Math.max(
    config.overload.minimumClicksRequired,
    config.overload.baseClicksRequired -
      level * config.overload.clicksReducedPerLevel,
  )
}

function getRefractionFacetCount(
  config: Readonly<BalanceConfig>,
  prestigeCount: number,
) {
  const [first, second, third, maximum] = config.refraction.facetCounts

  if (prestigeCount >= 4) return maximum
  if (prestigeCount === 3) return third
  if (prestigeCount === 2) return second
  return first
}

function getPressureBonus(
  state: Readonly<GameState>,
  config: Readonly<BalanceConfig>,
) {
  const fill = Math.min(
    state.manualClicks / config.core.sphereClickCapacity,
    1,
  )
  const tier = Math.min(Math.floor((fill * 100) / 10), 10)
  return tier * config.core.pressureBonusPerTier * state.pressureLevel
}

function registerChange(
  changes: BalanceNormalizationChange[],
  path: BalanceNormalizationPath,
  label: string,
  before: number,
  after: number,
  reason: string,
  severity: BalanceNormalizationSeverity = 'info',
  beforeLabel?: string,
  afterLabel?: string,
) {
  if (Object.is(before, after)) return
  changes.push({
    path,
    label,
    before,
    after,
    reason,
    severity,
    beforeLabel,
    afterLabel,
  })
}

function registerUnlockTransitions(
  changes: BalanceNormalizationChange[],
  state: Readonly<GameState>,
  previousConfig: Readonly<BalanceConfig>,
  nextConfig: Readonly<BalanceConfig>,
) {
  const unlocks: readonly BalanceUnlockId[] = [
    'pressure',
    'cavitation',
    'autoclick',
    'overload',
    'refraction',
  ]

  unlocks.forEach((id) => {
    const previous = getBalanceUnlockRequirement(state, id, previousConfig)
    const next = getBalanceUnlockRequirement(state, id, nextConfig)

    registerChange(
      changes,
      `balance.unlock.${id}`,
      `Compra de ${id}`,
      previous.locked ? 0 : 1,
      next.locked ? 0 : 1,
      next.locked
        ? `El requisito cambia a ${next.required}. Los niveles existentes se conservan y continúan funcionando; solo se bloquean compras nuevas.`
        : `La compra vuelve a estar disponible con el requisito ${next.required}.`,
      next.locked ? 'warning' : 'info',
      previous.locked ? 'Bloqueada' : 'Disponible',
      next.locked ? 'Bloqueada' : 'Disponible',
    )
  })
}

export function normalizeGameStateForBalance(
  state: Readonly<GameState>,
  nextConfig: Readonly<BalanceConfig>,
  now = Date.now(),
  previousConfig: Readonly<BalanceConfig> = getActiveBalanceConfig(),
): BalanceNormalizationPreview {
  const changes: BalanceNormalizationChange[] = []
  const next: GameState = { ...state }

  const sphereWasFull =
    state.manualClicks >= previousConfig.core.sphereClickCapacity
  const sphereWillBeFull =
    state.manualClicks >= nextConfig.core.sphereClickCapacity
  registerChange(
    changes,
    'balance.sphere-status',
    'Estado de la esfera',
    sphereWasFull ? 1 : 0,
    sphereWillBeFull ? 1 : 0,
    sphereWillBeFull
      ? 'La nueva capacidad deja disponible la cristalización y la carga de Sobrecarga.'
      : 'La nueva capacidad deja la esfera incompleta; Sobrecarga no podrá cargarse hasta llenarla.',
    sphereWillBeFull ? 'info' : 'warning',
    sphereWasFull ? 'Completa' : 'Incompleta',
    sphereWillBeFull ? 'Completa' : 'Incompleta',
  )

  registerChange(
    changes,
    'balance.pressure-bonus',
    'Bono actual de Presión',
    getPressureBonus(state, previousConfig),
    getPressureBonus(state, nextConfig),
    'Se recalcula con la nueva capacidad de esfera y el bono configurado por tramo.',
  )

  registerUnlockTransitions(changes, state, previousConfig, nextConfig)

  const pulseTriggerLevel = Math.min(
    state.pulseTriggerLevel,
    nextConfig.pulseTrigger.maximumLevel,
  )
  registerChange(
    changes,
    'pulseTriggerLevel',
    'Nivel del Gatillo',
    state.pulseTriggerLevel,
    pulseTriggerLevel,
    'El nivel no puede superar el máximo configurado.',
    'warning',
  )
  next.pulseTriggerLevel = pulseTriggerLevel

  const cavitationThreshold = getCavitationThreshold(
    nextConfig,
    state.cavitationLevel,
  )
  const cavitationCharge =
    state.cavitationLevel > 0
      ? clamp(state.cavitationCharge, 0, Math.max(0, cavitationThreshold - 1))
      : 0
  registerChange(
    changes,
    'cavitationCharge',
    'Carga de Cavitación',
    state.cavitationCharge,
    cavitationCharge,
    'La carga parcial se recorta al nuevo umbral.',
  )
  next.cavitationCharge = cavitationCharge

  const autoclickProgress =
    state.autoclickLevel > 0 ? clamp(state.autoclickProgress, 0, 0.9999) : 0
  registerChange(
    changes,
    'autoclickProgress',
    'Progreso del Autoclicker',
    state.autoclickProgress,
    autoclickProgress,
    'El progreso fraccionario debe permanecer entre 0 y 1.',
  )
  next.autoclickProgress = autoclickProgress

  const overloadAvailable =
    state.overloadLevel > 0 &&
    state.manualClicks >= nextConfig.core.sphereClickCapacity
  const overloadThreshold = getOverloadThreshold(
    nextConfig,
    state.overloadLevel,
  )
  const overloadCharge = overloadAvailable
    ? clamp(state.overloadCharge, 0, Math.max(0, overloadThreshold - 1))
    : 0
  registerChange(
    changes,
    'overloadCharge',
    'Carga de Sobrecarga',
    state.overloadCharge,
    overloadCharge,
    overloadAvailable
      ? 'La carga parcial se recorta al nuevo umbral.'
      : 'La esfera ya no cumple el requisito para cargar Sobrecarga.',
  )
  next.overloadCharge = overloadCharge

  const overloadWasActive = state.overloadUntil > now
  const overloadUntil = 0
  registerChange(
    changes,
    'overloadUntil',
    'Sobrecarga activa',
    state.overloadUntil,
    overloadUntil,
    overloadWasActive
      ? 'El efecto activo se cancela al cambiar de perfil para evitar duraciones híbridas.'
      : 'La marca temporal vencida se limpia durante la transición.',
    'warning',
  )
  next.overloadUntil = overloadUntil

  const refractionAvailable = state.refractionLevel > 0
  const refractionOrbitProgress = refractionAvailable
    ? clamp(state.refractionOrbitProgress, 0, 0.9999)
    : 0
  registerChange(
    changes,
    'refractionOrbitProgress',
    'Órbita de Refracción',
    state.refractionOrbitProgress,
    refractionOrbitProgress,
    refractionAvailable
      ? 'El progreso orbital se conserva dentro del rango válido.'
      : 'La Matriz no tiene niveles comprados.',
  )
  next.refractionOrbitProgress = refractionOrbitProgress

  const facetCount = getRefractionFacetCount(nextConfig, state.prestigeCount)
  const refractionFacetsCharged = refractionAvailable
    ? clamp(state.refractionFacetsCharged, 0, Math.max(0, facetCount - 1))
    : 0
  registerChange(
    changes,
    'refractionFacetsCharged',
    'Facetas cargadas',
    state.refractionFacetsCharged,
    refractionFacetsCharged,
    refractionAvailable
      ? 'Las facetas se recortan al máximo válido del nuevo perfil.'
      : 'La Matriz no tiene niveles comprados.',
  )
  next.refractionFacetsCharged = refractionFacetsCharged

  const refractionWasActive = state.refractionUntil > now
  const refractionUntil = 0
  registerChange(
    changes,
    'refractionUntil',
    'PRISMA activo',
    state.refractionUntil,
    refractionUntil,
    refractionWasActive
      ? 'El efecto activo se cancela al cambiar de perfil para evitar duraciones híbridas.'
      : 'La marca temporal vencida se limpia durante la transición.',
    'warning',
  )
  next.refractionUntil = refractionUntil

  return { state: next, changes }
}

export function normalizeGameStateForOfficialBalance(
  state: Readonly<GameState>,
  now = Date.now(),
) {
  return normalizeGameStateForBalance(
    state,
    DEFAULT_BALANCE_CONFIG,
    now,
  )
}
