import type { BalanceConfig } from './balanceConfig'
import type { GameState } from './game'

export type BalanceNormalizationSeverity = 'info' | 'warning'

export type BalanceNormalizationChange = {
  path: keyof GameState
  label: string
  before: number
  after: number
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

function registerChange(
  changes: BalanceNormalizationChange[],
  path: keyof GameState,
  label: string,
  before: number,
  after: number,
  reason: string,
  severity: BalanceNormalizationSeverity = 'info',
) {
  if (Object.is(before, after)) return
  changes.push({ path, label, before, after, reason, severity })
}

export function normalizeGameStateForBalance(
  state: Readonly<GameState>,
  nextConfig: Readonly<BalanceConfig>,
  _now = Date.now(),
): BalanceNormalizationPreview {
  const changes: BalanceNormalizationChange[] = []
  const next: GameState = { ...state }

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

  const overloadUntil = 0
  registerChange(
    changes,
    'overloadUntil',
    'Sobrecarga activa',
    state.overloadUntil,
    overloadUntil,
    'Los efectos temporales se cancelan al cambiar de perfil para evitar duraciones híbridas.',
    'warning',
  )
  next.overloadUntil = overloadUntil

  const refractionAllowed =
    state.refractionLevel > 0 &&
    state.prestigeCount >= nextConfig.unlocks.refractionRequiredPrestige
  const refractionOrbitProgress = refractionAllowed
    ? clamp(state.refractionOrbitProgress, 0, 0.9999)
    : 0
  registerChange(
    changes,
    'refractionOrbitProgress',
    'Órbita de Refracción',
    state.refractionOrbitProgress,
    refractionOrbitProgress,
    refractionAllowed
      ? 'El progreso orbital debe permanecer entre 0 y 1.'
      : 'La partida no cumple el prestigio requerido por el nuevo perfil.',
  )
  next.refractionOrbitProgress = refractionOrbitProgress

  const facetCount = getRefractionFacetCount(nextConfig, state.prestigeCount)
  const refractionFacetsCharged = refractionAllowed
    ? clamp(state.refractionFacetsCharged, 0, Math.max(0, facetCount - 1))
    : 0
  registerChange(
    changes,
    'refractionFacetsCharged',
    'Facetas cargadas',
    state.refractionFacetsCharged,
    refractionFacetsCharged,
    refractionAllowed
      ? 'Las facetas se recortan al máximo válido del nuevo perfil.'
      : 'La Matriz queda suspendida hasta recuperar el prestigio requerido.',
  )
  next.refractionFacetsCharged = refractionFacetsCharged

  const refractionUntil = 0
  registerChange(
    changes,
    'refractionUntil',
    'PRISMA activo',
    state.refractionUntil,
    refractionUntil,
    'Los efectos temporales se cancelan al cambiar de perfil para evitar duraciones híbridas.',
    'warning',
  )
  next.refractionUntil = refractionUntil

  return { state: next, changes }
}
