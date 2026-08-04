import { describe, expect, it } from 'vitest'
import { DEFAULT_BALANCE_CONFIG } from '../../src/balanceConfig'
import {
  MATHEMATICAL_TEMPLATE_EXPORT_VERSION,
  MATHEMATICAL_TEMPLATE_SPECIFICATION_VERSION,
  createDefaultMathematicalTemplateSpecification,
  evaluateMathematicalTemplate,
  exportMathematicalTemplateSpecification,
  generateBalanceConfigFromMathematicalTemplate,
  importMathematicalTemplateSpecification,
  validateMathematicalTemplateSpecification,
  type MathematicalTemplateKind,
  type MathematicalTemplateSpecification,
} from '../../src/mathematicalTemplates'

function specification(
  kind: MathematicalTemplateKind,
): MathematicalTemplateSpecification {
  return createDefaultMathematicalTemplateSpecification(
    'cost-base-series',
    kind,
  )
}

describe('plantillas matemáticas seguras', () => {
  it('evalúa una plantilla lineal de forma determinista', () => {
    const spec = specification('linear')
    spec.template = { kind: 'linear', intercept: 10, slope: 5 }

    const first = evaluateMathematicalTemplate(spec)
    const second = evaluateMathematicalTemplate(spec)

    expect(first).toEqual(second)
    expect(first.ok && first.value.map((sample) => sample.value)).toEqual([
      10, 15, 20, 25, 30, 35, 40, 45, 50,
    ])
  })

  it('evalúa una plantilla exponencial', () => {
    const spec = specification('exponential')
    spec.template = { kind: 'exponential', initial: 10, growth: 2 }

    const result = evaluateMathematicalTemplate(spec)

    expect(result.ok && result.value.slice(0, 5).map((sample) => sample.value)).toEqual([
      10, 20, 40, 80, 160,
    ])
  })

  it('evalúa una plantilla de potencia', () => {
    const spec = specification('power')
    spec.template = { kind: 'power', offset: 10, scale: 2, exponent: 2 }

    const result = evaluateMathematicalTemplate(spec)

    expect(result.ok && result.value.slice(0, 4).map((sample) => sample.value)).toEqual([
      10, 12, 18, 28,
    ])
  })

  it('evalúa una plantilla de raíz', () => {
    const spec = specification('root')
    spec.template = { kind: 'root', offset: 10, scale: 10, degree: 2 }
    spec.output = { rounding: 'fixed', decimalPlaces: 4 }

    const result = evaluateMathematicalTemplate(spec)

    expect(result.ok && result.value[0].value).toBe(10)
    expect(result.ok && result.value[1].value).toBe(20)
    expect(result.ok && result.value[4].value).toBe(30)
  })

  it('evalúa una plantilla logarítmica', () => {
    const spec = specification('logarithmic')
    spec.template = {
      kind: 'logarithmic',
      offset: 10,
      scale: 10,
      base: 2,
      inputOffset: 1,
    }
    spec.output = { rounding: 'fixed', decimalPlaces: 4 }

    const result = evaluateMathematicalTemplate(spec)

    expect(result.ok && result.value.slice(0, 4).map((sample) => sample.value)).toEqual([
      10, 20, 25.8496, 30,
    ])
  })

  it('evalúa rendimientos decrecientes con semisaturación exacta', () => {
    const spec = specification('diminishing-returns')
    spec.template = {
      kind: 'diminishing-returns',
      minimum: 10,
      maximum: 110,
      halfSaturation: 2,
    }
    spec.domain = { start: 0, step: 1 }
    spec.output = { rounding: 'fixed', decimalPlaces: 4 }

    const result = evaluateMathematicalTemplate(spec)

    expect(result.ok && result.value[0].value).toBe(10)
    expect(result.ok && result.value[2].value).toBe(60)
    expect(result.ok && result.value[8].value).toBe(90)
  })

  it('respeta redondeo entero, ceil y decimales fijos', () => {
    const spec = specification('linear')
    spec.template = { kind: 'linear', intercept: 10.1, slope: 0.55 }

    spec.output = { rounding: 'nearest-integer', decimalPlaces: 0 }
    const nearest = evaluateMathematicalTemplate(spec)
    expect(nearest.ok && nearest.value.slice(0, 3).map((sample) => sample.value)).toEqual([
      10, 11, 11,
    ])

    spec.output = { rounding: 'ceil', decimalPlaces: 0 }
    const ceil = evaluateMathematicalTemplate(spec)
    expect(ceil.ok && ceil.value.slice(0, 3).map((sample) => sample.value)).toEqual([
      11, 11, 12,
    ])

    spec.output = { rounding: 'fixed', decimalPlaces: 2 }
    const fixed = evaluateMathematicalTemplate(spec)
    expect(fixed.ok && fixed.value.slice(0, 3).map((sample) => sample.value)).toEqual([
      10.1, 10.65, 11.2,
    ])
  })

  it('rechaza una base exponencial inválida', () => {
    const spec = specification('exponential')
    spec.template = { kind: 'exponential', initial: 10, growth: 0 }

    const result = validateMathematicalTemplateSpecification(spec)

    expect(result.valid).toBe(false)
    expect(result.issues).toContainEqual(
      expect.objectContaining({ path: 'template.growth' }),
    )
  })

  it('rechaza un grado de raíz no entero o fuera de límites', () => {
    const spec = specification('root')
    spec.template = { kind: 'root', offset: 0, scale: 1, degree: 2.5 }

    const result = validateMathematicalTemplateSpecification(spec)

    expect(result.valid).toBe(false)
    expect(result.issues).toContainEqual(
      expect.objectContaining({ path: 'template.degree' }),
    )
  })

  it('rechaza una base logarítmica menor o igual a uno', () => {
    const spec = specification('logarithmic')
    spec.template = {
      kind: 'logarithmic',
      offset: 0,
      scale: 1,
      base: 1,
      inputOffset: 1,
    }

    const result = validateMathematicalTemplateSpecification(spec)

    expect(result.valid).toBe(false)
    expect(result.issues).toContainEqual(
      expect.objectContaining({ path: 'template.base' }),
    )
  })

  it('rechaza dominios logarítmicos inválidos antes de generar BalanceConfig', () => {
    const spec = specification('logarithmic')
    spec.template = {
      kind: 'logarithmic',
      offset: 10,
      scale: 1,
      base: 2,
      inputOffset: 0,
    }
    spec.domain = { start: 0, step: 1 }

    const result = evaluateMathematicalTemplate(spec)

    expect(result.ok).toBe(false)
    expect(result.issues).toContainEqual(
      expect.objectContaining({ path: 'samples.0.value' }),
    )
  })

  it('rechaza una potencia indefinida y evita NaN', () => {
    const spec = specification('power')
    spec.template = { kind: 'power', offset: 0, scale: 1, exponent: -1 }
    spec.domain = { start: 0, step: 1 }

    const result = evaluateMathematicalTemplate(spec)

    expect(result.ok).toBe(false)
    expect(result.issues[0]?.message).toMatch(/NaN|Infinity/)
  })

  it('rechaza desbordamientos exponenciales e infinitos', () => {
    const spec = specification('exponential')
    spec.template = { kind: 'exponential', initial: 1e12, growth: 100 }
    spec.domain = { start: 100, step: 1 }

    const result = evaluateMathematicalTemplate(spec)

    expect(result.ok).toBe(false)
  })

  it('rechaza paso cero y nombres vacíos', () => {
    const spec = specification('linear')
    spec.name = '   '
    spec.domain.step = 0

    const result = validateMathematicalTemplateSpecification(spec)

    expect(result.valid).toBe(false)
    expect(result.issues.map((entry) => entry.path)).toEqual(
      expect.arrayContaining(['name', 'domain.step']),
    )
  })

  it('convierte una serie lineal a costos base de BalanceConfig', () => {
    const spec = specification('linear')
    spec.template = { kind: 'linear', intercept: 100, slope: 100 }

    const result = generateBalanceConfigFromMathematicalTemplate(spec)

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.config.costs.click.baseCost).toBe(100)
    expect(result.value.config.costs.pulseTrigger.baseCost).toBe(900)
    expect(DEFAULT_BALANCE_CONFIG.costs.click.baseCost).toBe(10)
  })

  it('convierte una serie a factores de crecimiento dentro de límites', () => {
    const spec = createDefaultMathematicalTemplateSpecification(
      'cost-growth-series',
      'linear',
    )
    spec.template = { kind: 'linear', intercept: 1.2, slope: 0.1 }

    const result = generateBalanceConfigFromMathematicalTemplate(spec)

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.config.costs.click.growth).toBe(1.2)
    expect(result.value.config.costs.pulseTrigger.growth).toBe(2)
  })

  it('convierte una serie creciente a Zafiro P1–P5 y conserva P0', () => {
    const spec = createDefaultMathematicalTemplateSpecification(
      'sapphire-multipliers',
      'linear',
    )
    spec.template = { kind: 'linear', intercept: 1, slope: 0.4 }

    const result = generateBalanceConfigFromMathematicalTemplate(spec)

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.config.sapphire.multipliers).toEqual([
      1, 1.4, 1.8, 2.2, 2.6, 3,
    ])
  })

  it('delega el rechazo de rangos y relaciones a balanceValidation', () => {
    const spec = createDefaultMathematicalTemplateSpecification(
      'cost-growth-series',
      'linear',
    )
    spec.template = { kind: 'linear', intercept: 0.5, slope: 0 }

    const result = generateBalanceConfigFromMathematicalTemplate(spec)

    expect(result.ok).toBe(false)
    expect(result.issues).toContainEqual(
      expect.objectContaining({ path: 'costs.click.growth' }),
    )
  })

  it('rechaza una secuencia de Zafiro no estrictamente creciente', () => {
    const spec = createDefaultMathematicalTemplateSpecification(
      'sapphire-multipliers',
      'linear',
    )
    spec.template = { kind: 'linear', intercept: 2, slope: 0 }

    const result = generateBalanceConfigFromMathematicalTemplate(spec)

    expect(result.ok).toBe(false)
    expect(result.issues.some((entry) => entry.path.startsWith('sapphire.multipliers'))).toBe(
      true,
    )
  })

  it('serializa y deserializa una especificación versionada', () => {
    const spec = specification('linear')
    spec.name = 'Curva lineal reproducible'

    const exported = exportMathematicalTemplateSpecification(spec, 1234)
    expect(exported.ok).toBe(true)
    if (!exported.ok) return

    const payload = JSON.parse(exported.value)
    expect(payload.exportVersion).toBe(MATHEMATICAL_TEMPLATE_EXPORT_VERSION)
    expect(payload.specificationVersion).toBe(
      MATHEMATICAL_TEMPLATE_SPECIFICATION_VERSION,
    )
    expect(payload.exportedAt).toBe(1234)

    const imported = importMathematicalTemplateSpecification(exported.value)
    expect(imported.ok).toBe(true)
    expect(imported.ok && imported.value).toEqual(spec)
  })

  it('rechaza JSON malformado y versiones incompatibles', () => {
    expect(importMathematicalTemplateSpecification('{')).toEqual(
      expect.objectContaining({ ok: false }),
    )

    const spec = specification('linear')
    const exported = exportMathematicalTemplateSpecification(spec, 1234)
    if (!exported.ok) throw new Error('Exportación inesperadamente inválida')
    const payload = JSON.parse(exported.value)
    payload.exportVersion = 999

    const imported = importMathematicalTemplateSpecification(
      JSON.stringify(payload),
    )
    expect(imported.ok).toBe(false)
    expect(imported.issues).toContainEqual(
      expect.objectContaining({ path: 'exportVersion' }),
    )
  })
})
