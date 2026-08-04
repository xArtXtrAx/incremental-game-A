import {
  BALANCE_CONFIG_LIMITS,
  BALANCE_CONFIG_SCHEMA_VERSION,
  DEFAULT_BALANCE_CONFIG,
  cloneBalanceConfig,
  type BalanceConfig,
} from './balanceConfig'
import {
  BALANCE_COST_SYSTEMS,
  type BalanceCostSystem,
} from './balanceDraft'
import {
  validateBalanceConfig,
  type BalanceValidationIssue,
} from './balanceValidation'

export const MATHEMATICAL_TEMPLATE_SPECIFICATION_VERSION = 1
export const MATHEMATICAL_TEMPLATE_EXPORT_VERSION = 1
export const MATHEMATICAL_TEMPLATE_NAME_MAX_LENGTH = 80
export const MATHEMATICAL_TEMPLATE_MAX_SAMPLES = 32
export const MATHEMATICAL_TEMPLATE_MAX_DECIMALS = 8
export const MATHEMATICAL_TEMPLATE_MAX_PARAMETER_ABSOLUTE = 1_000_000_000_000
export const MATHEMATICAL_TEMPLATE_MAX_OUTPUT_ABSOLUTE = Number.MAX_SAFE_INTEGER

export type MathematicalTemplateKind =
  | 'linear'
  | 'exponential'
  | 'power'
  | 'root'
  | 'logarithmic'
  | 'diminishing-returns'

export type MathematicalTemplate =
  | {
      kind: 'linear'
      intercept: number
      slope: number
    }
  | {
      kind: 'exponential'
      initial: number
      growth: number
    }
  | {
      kind: 'power'
      offset: number
      scale: number
      exponent: number
    }
  | {
      kind: 'root'
      offset: number
      scale: number
      degree: number
    }
  | {
      kind: 'logarithmic'
      offset: number
      scale: number
      base: number
      inputOffset: number
    }
  | {
      kind: 'diminishing-returns'
      minimum: number
      maximum: number
      halfSaturation: number
    }

export type MathematicalTemplateTargetId =
  | 'cost-base-series'
  | 'cost-growth-series'
  | 'sapphire-multipliers'

export type MathematicalTemplateRounding =
  | 'none'
  | 'nearest-integer'
  | 'ceil'
  | 'fixed'

export type MathematicalTemplateSpecification = {
  specificationVersion: typeof MATHEMATICAL_TEMPLATE_SPECIFICATION_VERSION
  name: string
  target: MathematicalTemplateTargetId
  template: MathematicalTemplate
  domain: {
    start: number
    step: number
  }
  output: {
    rounding: MathematicalTemplateRounding
    decimalPlaces: number
  }
}

export type MathematicalTemplateIssue = {
  path: string
  message: string
}

export type MathematicalTemplateSample = {
  index: number
  x: number
  value: number
  targetPath: string
  targetLabel: string
}

export type MathematicalTemplateEvaluationResult =
  | {
      ok: true
      value: MathematicalTemplateSample[]
      issues: []
    }
  | {
      ok: false
      value: null
      issues: MathematicalTemplateIssue[]
    }

export type MathematicalTemplateGenerationResult =
  | {
      ok: true
      value: {
        specification: MathematicalTemplateSpecification
        samples: MathematicalTemplateSample[]
        config: Readonly<BalanceConfig>
      }
      issues: BalanceValidationIssue[]
    }
  | {
      ok: false
      value: null
      issues: MathematicalTemplateIssue[]
    }

export type MathematicalTemplateExport = {
  exportVersion: typeof MATHEMATICAL_TEMPLATE_EXPORT_VERSION
  specificationVersion: typeof MATHEMATICAL_TEMPLATE_SPECIFICATION_VERSION
  balanceConfigSchemaVersion: typeof BALANCE_CONFIG_SCHEMA_VERSION
  exportedAt: number
  specification: MathematicalTemplateSpecification
}

export type MathematicalTemplateTargetDefinition = {
  id: MathematicalTemplateTargetId
  label: string
  description: string
  sampleCount: number
  paths: readonly string[]
  labels: readonly string[]
  minimum: number
  maximum: number
}

const costSystems = BALANCE_COST_SYSTEMS.map((system) => system.id)
const costLabels = BALANCE_COST_SYSTEMS.map((system) => system.label)

export const MATHEMATICAL_TEMPLATE_TARGETS: readonly MathematicalTemplateTargetDefinition[] = [
  {
    id: 'cost-base-series',
    label: 'Costos base de evoluciones',
    description:
      'Genera un costo base para cada una de las nueve evoluciones, en el orden autoritativo del Laboratorio.',
    sampleCount: costSystems.length,
    paths: costSystems.map((system) => `costs.${system}.baseCost`),
    labels: costLabels,
    ...BALANCE_CONFIG_LIMITS.costBase,
  },
  {
    id: 'cost-growth-series',
    label: 'Crecimientos de costos',
    description:
      'Genera el factor exponencial de cada evolución sin cambiar la fórmula autoritativa del gameplay.',
    sampleCount: costSystems.length,
    paths: costSystems.map((system) => `costs.${system}.growth`),
    labels: costLabels,
    ...BALANCE_CONFIG_LIMITS.growth,
  },
  {
    id: 'sapphire-multipliers',
    label: 'Multiplicadores de Zafiro P1–P5',
    description:
      'Genera cinco multiplicadores estrictamente crecientes. P0 permanece fijo en ×1.00.',
    sampleCount: 5,
    paths: [
      'sapphire.multipliers.1',
      'sapphire.multipliers.2',
      'sapphire.multipliers.3',
      'sapphire.multipliers.4',
      'sapphire.multipliers.5',
    ],
    labels: ['P1', 'P2', 'P3', 'P4', 'P5'],
    ...BALANCE_CONFIG_LIMITS.multiplier,
  },
] as const

function issue(path: string, message: string): MathematicalTemplateIssue {
  return { path, message }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isFiniteParameter(value: unknown) {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    Math.abs(value) <= MATHEMATICAL_TEMPLATE_MAX_PARAMETER_ABSOLUTE
  )
}

function normalizeName(value: unknown) {
  if (typeof value !== 'string') return null
  const normalized = value.trim().replace(/\s+/g, ' ')
  if (
    normalized.length === 0 ||
    normalized.length > MATHEMATICAL_TEMPLATE_NAME_MAX_LENGTH
  ) {
    return null
  }
  return normalized
}

function cloneSpecification(
  specification: Readonly<MathematicalTemplateSpecification>,
): MathematicalTemplateSpecification {
  return structuredClone(specification)
}

export function getMathematicalTemplateTarget(
  targetId: MathematicalTemplateTargetId,
) {
  return (
    MATHEMATICAL_TEMPLATE_TARGETS.find((target) => target.id === targetId) ??
    MATHEMATICAL_TEMPLATE_TARGETS[0]
  )
}

function createTemplateDefaults(
  target: MathematicalTemplateTargetId,
  kind: MathematicalTemplateKind,
): MathematicalTemplate {
  const scale =
    target === 'cost-base-series'
      ? { low: 10, high: 10_000, step: 25 }
      : target === 'cost-growth-series'
        ? { low: 1.15, high: 3.5, step: 0.12 }
        : { low: 1.3, high: 3.1, step: 0.35 }

  switch (kind) {
    case 'linear':
      return { kind, intercept: scale.low, slope: scale.step }
    case 'exponential':
      return {
        kind,
        initial: scale.low,
        growth: target === 'cost-base-series' ? 1.8 : 1.08,
      }
    case 'power':
      return {
        kind,
        offset: scale.low,
        scale: scale.step,
        exponent: 1.6,
      }
    case 'root':
      return {
        kind,
        offset: scale.low,
        scale: scale.step * 2,
        degree: 2,
      }
    case 'logarithmic':
      return {
        kind,
        offset: scale.low,
        scale: scale.step * 2,
        base: 2,
        inputOffset: 1,
      }
    case 'diminishing-returns':
      return {
        kind,
        minimum: scale.low,
        maximum: scale.high,
        halfSaturation: 3,
      }
  }
}

export function createDefaultMathematicalTemplateSpecification(
  target: MathematicalTemplateTargetId = 'cost-base-series',
  kind: MathematicalTemplateKind = 'linear',
): MathematicalTemplateSpecification {
  return {
    specificationVersion: MATHEMATICAL_TEMPLATE_SPECIFICATION_VERSION,
    name: 'Plantilla matemática DEV',
    target,
    template: createTemplateDefaults(target, kind),
    domain: {
      start: target === 'sapphire-multipliers' ? 1 : 0,
      step: 1,
    },
    output: {
      rounding:
        target === 'cost-base-series'
          ? 'ceil'
          : target === 'cost-growth-series'
            ? 'fixed'
            : 'fixed',
      decimalPlaces: target === 'cost-base-series' ? 0 : 4,
    },
  }
}

function validateCommonParameter(
  value: unknown,
  path: string,
  issues: MathematicalTemplateIssue[],
) {
  if (!isFiniteParameter(value)) {
    issues.push(
      issue(
        path,
        `Debe ser un número finito entre ±${MATHEMATICAL_TEMPLATE_MAX_PARAMETER_ABSOLUTE}.`,
      ),
    )
  }
}

function validateTemplate(
  template: unknown,
  issues: MathematicalTemplateIssue[],
): template is MathematicalTemplate {
  if (!isRecord(template) || typeof template.kind !== 'string') {
    issues.push(issue('template', 'La plantilla debe ser un objeto tipado.'))
    return false
  }

  switch (template.kind) {
    case 'linear':
      validateCommonParameter(template.intercept, 'template.intercept', issues)
      validateCommonParameter(template.slope, 'template.slope', issues)
      return true
    case 'exponential':
      validateCommonParameter(template.initial, 'template.initial', issues)
      validateCommonParameter(template.growth, 'template.growth', issues)
      if (
        typeof template.growth === 'number' &&
        Number.isFinite(template.growth) &&
        template.growth <= 0
      ) {
        issues.push(
          issue('template.growth', 'La base de crecimiento debe ser mayor que cero.'),
        )
      }
      return true
    case 'power':
      validateCommonParameter(template.offset, 'template.offset', issues)
      validateCommonParameter(template.scale, 'template.scale', issues)
      validateCommonParameter(template.exponent, 'template.exponent', issues)
      if (
        typeof template.exponent === 'number' &&
        Number.isFinite(template.exponent) &&
        (template.exponent < -8 || template.exponent > 8)
      ) {
        issues.push(issue('template.exponent', 'El exponente debe estar entre -8 y 8.'))
      }
      return true
    case 'root':
      validateCommonParameter(template.offset, 'template.offset', issues)
      validateCommonParameter(template.scale, 'template.scale', issues)
      validateCommonParameter(template.degree, 'template.degree', issues)
      if (
        typeof template.degree === 'number' &&
        (!Number.isInteger(template.degree) ||
          template.degree < 1 ||
          template.degree > 16)
      ) {
        issues.push(
          issue('template.degree', 'El grado debe ser un entero entre 1 y 16.'),
        )
      }
      return true
    case 'logarithmic':
      validateCommonParameter(template.offset, 'template.offset', issues)
      validateCommonParameter(template.scale, 'template.scale', issues)
      validateCommonParameter(template.base, 'template.base', issues)
      validateCommonParameter(
        template.inputOffset,
        'template.inputOffset',
        issues,
      )
      if (
        typeof template.base === 'number' &&
        Number.isFinite(template.base) &&
        (template.base <= 1 || template.base > 100)
      ) {
        issues.push(
          issue('template.base', 'La base logarítmica debe ser mayor que 1 y no superar 100.'),
        )
      }
      return true
    case 'diminishing-returns':
      validateCommonParameter(template.minimum, 'template.minimum', issues)
      validateCommonParameter(template.maximum, 'template.maximum', issues)
      validateCommonParameter(
        template.halfSaturation,
        'template.halfSaturation',
        issues,
      )
      if (
        typeof template.minimum === 'number' &&
        typeof template.maximum === 'number' &&
        Number.isFinite(template.minimum) &&
        Number.isFinite(template.maximum) &&
        template.maximum < template.minimum
      ) {
        issues.push(
          issue('template.maximum', 'El máximo no puede ser menor que el mínimo.'),
        )
      }
      if (
        typeof template.halfSaturation === 'number' &&
        Number.isFinite(template.halfSaturation) &&
        template.halfSaturation <= 0
      ) {
        issues.push(
          issue('template.halfSaturation', 'La semisaturación debe ser mayor que cero.'),
        )
      }
      return true
    default:
      issues.push(issue('template.kind', 'El tipo de plantilla es incompatible.'))
      return false
  }
}

export function validateMathematicalTemplateSpecification(
  candidate: unknown,
):
  | {
      valid: true
      specification: MathematicalTemplateSpecification
      issues: []
    }
  | {
      valid: false
      specification: null
      issues: MathematicalTemplateIssue[]
    } {
  const issues: MathematicalTemplateIssue[] = []

  if (!isRecord(candidate)) {
    return {
      valid: false,
      specification: null,
      issues: [issue('specification', 'La especificación debe ser un objeto.')],
    }
  }

  if (
    candidate.specificationVersion !==
    MATHEMATICAL_TEMPLATE_SPECIFICATION_VERSION
  ) {
    issues.push(
      issue(
        'specificationVersion',
        `Se requiere la versión ${MATHEMATICAL_TEMPLATE_SPECIFICATION_VERSION}.`,
      ),
    )
  }

  const name = normalizeName(candidate.name)
  if (!name) {
    issues.push(
      issue(
        'name',
        `El nombre debe contener entre 1 y ${MATHEMATICAL_TEMPLATE_NAME_MAX_LENGTH} caracteres.`,
      ),
    )
  }

  const target = MATHEMATICAL_TEMPLATE_TARGETS.find(
    (entry) => entry.id === candidate.target,
  )
  if (!target) {
    issues.push(issue('target', 'El destino matemático es incompatible.'))
  } else if (target.sampleCount > MATHEMATICAL_TEMPLATE_MAX_SAMPLES) {
    issues.push(
      issue(
        'target',
        `El destino supera el máximo de ${MATHEMATICAL_TEMPLATE_MAX_SAMPLES} muestras.`,
      ),
    )
  }

  const templateValid = validateTemplate(candidate.template, issues)

  if (!isRecord(candidate.domain)) {
    issues.push(issue('domain', 'El dominio debe ser un objeto.'))
  } else {
    validateCommonParameter(candidate.domain.start, 'domain.start', issues)
    validateCommonParameter(candidate.domain.step, 'domain.step', issues)
    if (
      typeof candidate.domain.step === 'number' &&
      Number.isFinite(candidate.domain.step) &&
      candidate.domain.step === 0
    ) {
      issues.push(issue('domain.step', 'El paso del dominio no puede ser cero.'))
    }
  }

  if (!isRecord(candidate.output)) {
    issues.push(issue('output', 'La configuración de salida debe ser un objeto.'))
  } else {
    if (
      candidate.output.rounding !== 'none' &&
      candidate.output.rounding !== 'nearest-integer' &&
      candidate.output.rounding !== 'ceil' &&
      candidate.output.rounding !== 'fixed'
    ) {
      issues.push(issue('output.rounding', 'El redondeo es incompatible.'))
    }
    if (
      typeof candidate.output.decimalPlaces !== 'number' ||
      !Number.isInteger(candidate.output.decimalPlaces) ||
      candidate.output.decimalPlaces < 0 ||
      candidate.output.decimalPlaces > MATHEMATICAL_TEMPLATE_MAX_DECIMALS
    ) {
      issues.push(
        issue(
          'output.decimalPlaces',
          `Los decimales deben ser un entero entre 0 y ${MATHEMATICAL_TEMPLATE_MAX_DECIMALS}.`,
        ),
      )
    }
  }

  if (issues.length > 0 || !name || !target || !templateValid) {
    return { valid: false, specification: null, issues }
  }

  return {
    valid: true,
    specification: {
      specificationVersion: MATHEMATICAL_TEMPLATE_SPECIFICATION_VERSION,
      name,
      target: target.id,
      template: structuredClone(candidate.template as MathematicalTemplate),
      domain: {
        start: (candidate.domain as Record<string, number>).start,
        step: (candidate.domain as Record<string, number>).step,
      },
      output: {
        rounding: (candidate.output as Record<string, unknown>)
          .rounding as MathematicalTemplateRounding,
        decimalPlaces: (candidate.output as Record<string, number>).decimalPlaces,
      },
    },
    issues: [],
  }
}

function evaluateRawTemplate(template: MathematicalTemplate, x: number) {
  switch (template.kind) {
    case 'linear':
      return template.intercept + template.slope * x
    case 'exponential':
      return template.initial * template.growth ** x
    case 'power':
      if (x === 0 && template.exponent < 0) return Number.NaN
      if (x < 0 && !Number.isInteger(template.exponent)) return Number.NaN
      return template.offset + template.scale * x ** template.exponent
    case 'root':
      if (x < 0) return Number.NaN
      return template.offset + template.scale * x ** (1 / template.degree)
    case 'logarithmic': {
      const argument = x + template.inputOffset
      if (argument <= 0) return Number.NaN
      return template.offset + template.scale * (Math.log(argument) / Math.log(template.base))
    }
    case 'diminishing-returns': {
      if (x < 0) return Number.NaN
      const denominator = template.halfSaturation + x
      if (denominator <= 0) return Number.NaN
      return (
        template.minimum +
        (template.maximum - template.minimum) * (x / denominator)
      )
    }
  }
}

function applyRounding(
  value: number,
  output: MathematicalTemplateSpecification['output'],
) {
  switch (output.rounding) {
    case 'none':
      return value
    case 'nearest-integer':
      return Math.round(value)
    case 'ceil':
      return Math.ceil(value)
    case 'fixed':
      return Number(value.toFixed(output.decimalPlaces))
  }
}

export function evaluateMathematicalTemplate(
  candidate: unknown,
): MathematicalTemplateEvaluationResult {
  const validation = validateMathematicalTemplateSpecification(candidate)
  if (!validation.valid) {
    return { ok: false, value: null, issues: validation.issues }
  }

  const specification = validation.specification
  const target = getMathematicalTemplateTarget(specification.target)
  const samples: MathematicalTemplateSample[] = []
  const issues: MathematicalTemplateIssue[] = []

  for (let index = 0; index < target.sampleCount; index += 1) {
    const x = specification.domain.start + specification.domain.step * index
    if (!Number.isFinite(x)) {
      issues.push(issue(`samples.${index}.x`, 'El dominio produjo un valor no finito.'))
      continue
    }

    const rawValue = evaluateRawTemplate(specification.template, x)
    if (
      !Number.isFinite(rawValue) ||
      Math.abs(rawValue) > MATHEMATICAL_TEMPLATE_MAX_OUTPUT_ABSOLUTE
    ) {
      issues.push(
        issue(
          `samples.${index}.value`,
          'La plantilla produjo NaN, Infinity o un valor fuera del límite seguro.',
        ),
      )
      continue
    }

    const value = applyRounding(rawValue, specification.output)
    if (
      !Number.isFinite(value) ||
      Math.abs(value) > MATHEMATICAL_TEMPLATE_MAX_OUTPUT_ABSOLUTE
    ) {
      issues.push(
        issue(
          `samples.${index}.value`,
          'El redondeo produjo un valor no finito o fuera del límite seguro.',
        ),
      )
      continue
    }

    samples.push({
      index,
      x,
      value,
      targetPath: target.paths[index],
      targetLabel: target.labels[index],
    })
  }

  if (issues.length > 0) {
    return { ok: false, value: null, issues }
  }

  return { ok: true, value: samples, issues: [] }
}

function applySamplesToBalance(
  config: BalanceConfig,
  targetId: MathematicalTemplateTargetId,
  samples: readonly MathematicalTemplateSample[],
) {
  if (targetId === 'sapphire-multipliers') {
    samples.forEach((sample, index) => {
      config.sapphire.multipliers[index + 1] = sample.value
    })
    return
  }

  samples.forEach((sample, index) => {
    const system = costSystems[index] as BalanceCostSystem
    if (targetId === 'cost-base-series') {
      config.costs[system].baseCost = sample.value
    } else {
      config.costs[system].growth = sample.value
    }
  })
}

export function generateBalanceConfigFromMathematicalTemplate(
  candidate: unknown,
  baseConfig: Readonly<BalanceConfig> = DEFAULT_BALANCE_CONFIG,
): MathematicalTemplateGenerationResult {
  const validation = validateMathematicalTemplateSpecification(candidate)
  if (!validation.valid) {
    return { ok: false, value: null, issues: validation.issues }
  }

  const evaluation = evaluateMathematicalTemplate(validation.specification)
  if (!evaluation.ok) return evaluation

  const next = cloneBalanceConfig(baseConfig)
  applySamplesToBalance(next, validation.specification.target, evaluation.value)
  const balanceValidation = validateBalanceConfig(next)

  if (!balanceValidation.valid) {
    return {
      ok: false,
      value: null,
      issues: balanceValidation.issues.map((entry) => ({
        path: entry.path,
        message: entry.message,
      })),
    }
  }

  return {
    ok: true,
    value: {
      specification: cloneSpecification(validation.specification),
      samples: evaluation.value.map((sample) => ({ ...sample })),
      config: balanceValidation.config,
    },
    issues: balanceValidation.issues,
  }
}

export function exportMathematicalTemplateSpecification(
  candidate: unknown,
  exportedAt = Date.now(),
) {
  const validation = validateMathematicalTemplateSpecification(candidate)
  if (!validation.valid) {
    return { ok: false as const, value: null, issues: validation.issues }
  }

  const payload: MathematicalTemplateExport = {
    exportVersion: MATHEMATICAL_TEMPLATE_EXPORT_VERSION,
    specificationVersion: MATHEMATICAL_TEMPLATE_SPECIFICATION_VERSION,
    balanceConfigSchemaVersion: BALANCE_CONFIG_SCHEMA_VERSION,
    exportedAt,
    specification: cloneSpecification(validation.specification),
  }

  return {
    ok: true as const,
    value: JSON.stringify(payload, null, 2),
    issues: [] as MathematicalTemplateIssue[],
  }
}

export function importMathematicalTemplateSpecification(json: string) {
  let candidate: unknown
  try {
    candidate = JSON.parse(json)
  } catch {
    return {
      ok: false as const,
      value: null,
      issues: [issue('import', 'El contenido no es JSON válido.')],
    }
  }

  if (!isRecord(candidate)) {
    return {
      ok: false as const,
      value: null,
      issues: [issue('import', 'La exportación debe ser un objeto.')],
    }
  }

  if (candidate.exportVersion !== MATHEMATICAL_TEMPLATE_EXPORT_VERSION) {
    return {
      ok: false as const,
      value: null,
      issues: [issue('exportVersion', 'La versión de exportación es incompatible.')],
    }
  }

  if (
    candidate.specificationVersion !==
    MATHEMATICAL_TEMPLATE_SPECIFICATION_VERSION
  ) {
    return {
      ok: false as const,
      value: null,
      issues: [
        issue('specificationVersion', 'La versión de especificación es incompatible.'),
      ],
    }
  }

  if (candidate.balanceConfigSchemaVersion !== BALANCE_CONFIG_SCHEMA_VERSION) {
    return {
      ok: false as const,
      value: null,
      issues: [
        issue(
          'balanceConfigSchemaVersion',
          'La especificación fue creada para otra versión de BalanceConfig.',
        ),
      ],
    }
  }

  const validation = validateMathematicalTemplateSpecification(
    candidate.specification,
  )
  if (!validation.valid) {
    return { ok: false as const, value: null, issues: validation.issues }
  }

  return {
    ok: true as const,
    value: cloneSpecification(validation.specification),
    issues: [] as MathematicalTemplateIssue[],
  }
}
