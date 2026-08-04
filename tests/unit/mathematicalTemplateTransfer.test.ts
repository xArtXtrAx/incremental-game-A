import { afterEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_BALANCE_CONFIG } from '../../src/balanceConfig'
import {
  clearMathematicalTemplateTransfer,
  getMathematicalTemplateTransferSnapshot,
  publishMathematicalTemplateTransfer,
  resetMathematicalTemplateTransferForTests,
  subscribeMathematicalTemplateTransfer,
} from '../../src/mathematicalTemplateTransfer'
import {
  createDefaultMathematicalTemplateSpecification,
  generateBalanceConfigFromMathematicalTemplate,
} from '../../src/mathematicalTemplates'

function createValidTransfer() {
  const specification = createDefaultMathematicalTemplateSpecification(
    'cost-base-series',
    'linear',
  )
  specification.name = 'Costos transitorios'
  specification.template = {
    kind: 'linear',
    intercept: 100,
    slope: 100,
  }
  const generation = generateBalanceConfigFromMathematicalTemplate(specification)
  if (!generation.ok) throw new Error('Generación inválida en fixture')
  return generation.value
}

afterEach(() => {
  resetMathematicalTemplateTransferForTests()
})

describe('transferencia transitoria de plantillas matemáticas', () => {
  it('publica un candidato validado, clonado e identificado como plantilla', () => {
    const generated = createValidTransfer()

    const result = publishMathematicalTemplateTransfer(
      {
        specification: generated.specification,
        config: generated.config,
      },
      1234,
    )

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value).toMatchObject({
      id: 'template:1',
      name: 'Costos transitorios',
      source: 'template',
      target: 'cost-base-series',
      createdAt: 1234,
    })
    expect(result.value.config.costs.click.baseCost).toBe(100)
    expect(result.value.config).not.toBe(generated.config)
    expect(Object.isFrozen(result.value.config)).toBe(true)
    expect(getMathematicalTemplateTransferSnapshot().candidate).toBe(
      result.value,
    )
  })

  it('rechaza configuraciones incompatibles sin reemplazar el snapshot', () => {
    const generated = createValidTransfer()
    const invalid = structuredClone(DEFAULT_BALANCE_CONFIG)
    invalid.costs.click.growth = 0.5

    const result = publishMathematicalTemplateTransfer({
      specification: generated.specification,
      config: invalid,
    })

    expect(result.ok).toBe(false)
    expect(result.issues).toContainEqual(
      expect.objectContaining({ path: 'costs.click.growth' }),
    )
    expect(getMathematicalTemplateTransferSnapshot()).toEqual({
      revision: 0,
      candidate: null,
    })
  })

  it('notifica publicación y descarte sin usar persistencia', () => {
    const generated = createValidTransfer()
    const listener = vi.fn()
    const unsubscribe = subscribeMathematicalTemplateTransfer(listener)

    publishMathematicalTemplateTransfer({
      specification: generated.specification,
      config: generated.config,
    })
    expect(listener).toHaveBeenCalledTimes(1)

    expect(clearMathematicalTemplateTransfer()).toBe(true)
    expect(listener).toHaveBeenCalledTimes(2)
    expect(getMathematicalTemplateTransferSnapshot()).toEqual({
      revision: 2,
      candidate: null,
    })

    expect(clearMathematicalTemplateTransfer()).toBe(false)
    expect(listener).toHaveBeenCalledTimes(2)
    unsubscribe()
  })
})
