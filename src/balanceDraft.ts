import {
  BALANCE_CONFIG_LIMITS,
  cloneBalanceConfig,
  type BalanceConfig,
} from './balanceConfig'

export type BalanceCostSystem = Extract<keyof BalanceConfig['costs'], string>
type SapphireEditableIndex = 1 | 2 | 3 | 4 | 5

export type BalanceEditablePath =
  | `costs.${BalanceCostSystem}.baseCost`
  | `costs.${BalanceCostSystem}.growth`
  | 'unlocks.pressureRequiredClicks'
  | 'unlocks.cavitationRequiredClicks'
  | 'unlocks.autoclickRequiredClicks'
  | 'unlocks.refractionRequiredPrestige'
  | 'core.sphereClickCapacity'
  | 'core.pressureBonusPerTier'
  | 'autoclick.baseRate'
  | 'autoclick.growth'
  | 'autoclick.maximumRate'
  | `sapphire.multipliers.${SapphireEditableIndex}`
  | 'sapphire.postMaximumLevelIncrement'

export type BalanceFieldDefinition = {
  path: BalanceEditablePath
  label: string
  minimum: number
  maximum: number
  step: number
  integer?: boolean
  unit?: string
  help?: string
}

export const BALANCE_COST_SYSTEMS: readonly {
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

export const BALANCE_CORE_FIELDS: readonly BalanceFieldDefinition[] = [
  {
    path: 'core.sphereClickCapacity',
    label: 'Capacidad de la esfera',
    ...BALANCE_CONFIG_LIMITS.clicks,
    step: 100,
    integer: true,
    unit: 'clics',
    help: 'Cantidad de clics necesaria para cristalizar.',
  },
  {
    path: 'core.pressureBonusPerTier',
    label: 'Bono de Presión por tramo',
    minimum: 0,
    maximum: 1_000,
    step: 0.1,
    unit: '%',
    help: 'Bono por cada 10% de llenado y por nivel de Presión.',
  },
]

export const BALANCE_UNLOCK_FIELDS: readonly BalanceFieldDefinition[] = [
  {
    path: 'unlocks.pressureRequiredClicks',
    label: 'Desbloqueo de Presión',
    ...BALANCE_CONFIG_LIMITS.clicks,
    step: 10,
    integer: true,
    unit: 'clics',
  },
  {
    path: 'unlocks.cavitationRequiredClicks',
    label: 'Desbloqueo de Cavitación',
    ...BALANCE_CONFIG_LIMITS.clicks,
    step: 10,
    integer: true,
    unit: 'clics',
  },
  {
    path: 'unlocks.autoclickRequiredClicks',
    label: 'Desbloqueo del Autoclicker',
    ...BALANCE_CONFIG_LIMITS.clicks,
    step: 10,
    integer: true,
    unit: 'clics',
  },
  {
    path: 'unlocks.refractionRequiredPrestige',
    label: 'Desbloqueo de Refracción',
    ...BALANCE_CONFIG_LIMITS.level,
    step: 1,
    integer: true,
    unit: 'prestigios',
  },
]

export const BALANCE_AUTOCLICK_FIELDS: readonly BalanceFieldDefinition[] = [
  {
    path: 'autoclick.baseRate',
    label: 'Tasa inicial',
    ...BALANCE_CONFIG_LIMITS.rate,
    step: 0.01,
    unit: 'clics/s',
  },
  {
    path: 'autoclick.growth',
    label: 'Crecimiento por nivel',
    ...BALANCE_CONFIG_LIMITS.growth,
    step: 0.01,
    unit: '×',
  },
  {
    path: 'autoclick.maximumRate',
    label: 'Tasa máxima',
    ...BALANCE_CONFIG_LIMITS.rate,
    step: 0.1,
    unit: 'clics/s',
  },
]

export const BALANCE_SAPPHIRE_FIELDS: readonly BalanceFieldDefinition[] = [
  ...([1, 2, 3, 4, 5] as const).map((prestige) => ({
    path: `sapphire.multipliers.${prestige}` as const,
    label: `Multiplicador P${prestige}`,
    ...BALANCE_CONFIG_LIMITS.multiplier,
    step: 0.01,
    unit: '×',
  })),
  {
    path: 'sapphire.postMaximumLevelIncrement',
    label: 'Incremento posterior a P5',
    minimum: 0,
    maximum: BALANCE_CONFIG_LIMITS.multiplier.maximum,
    step: 0.01,
    unit: '× por prestigio',
  },
]

export function getCostFieldDefinitions(
  system: BalanceCostSystem,
): readonly BalanceFieldDefinition[] {
  return [
    {
      path: `costs.${system}.baseCost`,
      label: 'Costo base',
      ...BALANCE_CONFIG_LIMITS.costBase,
      step: 1,
      unit: 'energía',
    },
    {
      path: `costs.${system}.growth`,
      label: 'Factor de crecimiento',
      ...BALANCE_CONFIG_LIMITS.growth,
      step: 0.01,
      unit: '×',
    },
  ]
}

export const BALANCE_EDITABLE_PATHS: readonly BalanceEditablePath[] = [
  ...BALANCE_COST_SYSTEMS.flatMap((system) =>
    getCostFieldDefinitions(system.id).map((field) => field.path),
  ),
  ...BALANCE_CORE_FIELDS.map((field) => field.path),
  ...BALANCE_UNLOCK_FIELDS.map((field) => field.path),
  ...BALANCE_AUTOCLICK_FIELDS.map((field) => field.path),
  ...BALANCE_SAPPHIRE_FIELDS.map((field) => field.path),
]

function readSegment(container: unknown, segment: string): unknown {
  if (Array.isArray(container)) {
    return container[Number(segment)]
  }

  if (typeof container === 'object' && container !== null) {
    return (container as Record<string, unknown>)[segment]
  }

  return undefined
}

export function getBalanceDraftNumber(
  config: Readonly<BalanceConfig>,
  path: BalanceEditablePath,
) {
  const value = path
    .split('.')
    .reduce<unknown>((current, segment) => readSegment(current, segment), config)

  return typeof value === 'number' ? value : Number.NaN
}

export function updateBalanceDraftNumber(
  config: Readonly<BalanceConfig>,
  path: BalanceEditablePath,
  value: number,
): BalanceConfig {
  const next = cloneBalanceConfig(config)
  const segments = path.split('.')
  let current: unknown = next

  segments.slice(0, -1).forEach((segment) => {
    current = readSegment(current, segment)
  })

  const finalSegment = segments[segments.length - 1]
  if (Array.isArray(current)) {
    current[Number(finalSegment)] = value
  } else if (typeof current === 'object' && current !== null) {
    ;(current as Record<string, unknown>)[finalSegment] = value
  }

  return next
}

export function restoreBalanceDraftPath(
  draft: Readonly<BalanceConfig>,
  official: Readonly<BalanceConfig>,
  path: BalanceEditablePath,
) {
  return updateBalanceDraftNumber(
    draft,
    path,
    getBalanceDraftNumber(official, path),
  )
}

export function countBalanceDraftChanges(
  draft: Readonly<BalanceConfig>,
  official: Readonly<BalanceConfig>,
) {
  return BALANCE_EDITABLE_PATHS.reduce(
    (count, path) =>
      Object.is(
        getBalanceDraftNumber(draft, path),
        getBalanceDraftNumber(official, path),
      )
        ? count
        : count + 1,
    0,
  )
}

export function isBalanceDraftDirty(
  draft: Readonly<BalanceConfig>,
  official: Readonly<BalanceConfig>,
) {
  return countBalanceDraftChanges(draft, official) > 0
}
