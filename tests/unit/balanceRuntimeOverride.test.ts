import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  BalanceRuntimeOverrideError,
  getActiveBalanceConfig,
  getBalanceRuntimeSnapshot,
  resetOfficialBalanceConfig,
  runWithBalanceConfig,
  subscribeBalanceRuntime,
} from '../../src/balanceRuntime'
import {
  DEFAULT_BALANCE_CONFIG,
  cloneBalanceConfig,
} from '../../src/balanceConfig'

describe('override transitorio de balance', () => {
  beforeEach(() => {
    resetOfficialBalanceConfig()
  })

  it('expone el balance alternativo solo dentro de la operación', () => {
    const candidate = cloneBalanceConfig(DEFAULT_BALANCE_CONFIG)
    candidate.core.sphereClickCapacity = 2_000
    const before = getBalanceRuntimeSnapshot()

    const capacity = runWithBalanceConfig(
      candidate,
      () => getActiveBalanceConfig().core.sphereClickCapacity,
    )

    expect(capacity).toBe(2_000)
    expect(getActiveBalanceConfig().core.sphereClickCapacity).toBe(5_000)
    expect(getBalanceRuntimeSnapshot()).toBe(before)
  })

  it('no emite eventos ni incrementa la revisión visible', () => {
    const candidate = cloneBalanceConfig(DEFAULT_BALANCE_CONFIG)
    candidate.autoclick.baseRate = 3
    const listener = vi.fn()
    const unsubscribe = subscribeBalanceRuntime(listener)
    const before = getBalanceRuntimeSnapshot()

    runWithBalanceConfig(candidate, () => {
      expect(getActiveBalanceConfig().autoclick.baseRate).toBe(3)
    })

    unsubscribe()
    expect(listener).not.toHaveBeenCalled()
    expect(getBalanceRuntimeSnapshot()).toBe(before)
    expect(getBalanceRuntimeSnapshot().revision).toBe(before.revision)
  })

  it('restaura overrides anidados en orden', () => {
    const outer = cloneBalanceConfig(DEFAULT_BALANCE_CONFIG)
    outer.core.sphereClickCapacity = 2_000
    const inner = cloneBalanceConfig(DEFAULT_BALANCE_CONFIG)
    inner.core.sphereClickCapacity = 750

    runWithBalanceConfig(outer, () => {
      expect(getActiveBalanceConfig().core.sphereClickCapacity).toBe(2_000)
      runWithBalanceConfig(inner, () => {
        expect(getActiveBalanceConfig().core.sphereClickCapacity).toBe(750)
      })
      expect(getActiveBalanceConfig().core.sphereClickCapacity).toBe(2_000)
    })

    expect(getActiveBalanceConfig().core.sphereClickCapacity).toBe(5_000)
  })

  it('restaura el runtime aunque la operación falle', () => {
    const candidate = cloneBalanceConfig(DEFAULT_BALANCE_CONFIG)
    candidate.core.sphereClickCapacity = 900

    expect(() =>
      runWithBalanceConfig(candidate, () => {
        throw new Error('fallo deliberado')
      }),
    ).toThrow('fallo deliberado')

    expect(getActiveBalanceConfig().core.sphereClickCapacity).toBe(5_000)
  })

  it('rechaza configuraciones inválidas antes de ejecutar', () => {
    const invalid = cloneBalanceConfig(DEFAULT_BALANCE_CONFIG)
    invalid.core.sphereClickCapacity = 0
    const operation = vi.fn()

    expect(() => runWithBalanceConfig(invalid, operation)).toThrow(
      BalanceRuntimeOverrideError,
    )
    expect(operation).not.toHaveBeenCalled()
    expect(getActiveBalanceConfig().core.sphereClickCapacity).toBe(5_000)
  })
})
