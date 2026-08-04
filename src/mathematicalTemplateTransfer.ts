import {
  cloneBalanceConfig,
  freezeBalanceConfig,
  type BalanceConfig,
} from './balanceConfig'
import {
  validateMathematicalTemplateSpecification,
  type MathematicalTemplateSpecification,
  type MathematicalTemplateTargetId,
} from './mathematicalTemplates'
import { validateBalanceConfig } from './balanceValidation'

export type MathematicalTemplateTransferCandidate = {
  id: string
  name: string
  source: 'template'
  target: MathematicalTemplateTargetId
  createdAt: number
  specification: Readonly<MathematicalTemplateSpecification>
  config: Readonly<BalanceConfig>
}

export type MathematicalTemplateTransferSnapshot = {
  revision: number
  candidate: MathematicalTemplateTransferCandidate | null
}

export type MathematicalTemplateTransferIssue = {
  path: string
  message: string
}

export type MathematicalTemplateTransferResult =
  | {
      ok: true
      value: MathematicalTemplateTransferCandidate
      issues: []
    }
  | {
      ok: false
      value: null
      issues: MathematicalTemplateTransferIssue[]
    }

let snapshot: MathematicalTemplateTransferSnapshot = Object.freeze({
  revision: 0,
  candidate: null,
})
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((listener) => listener())
}

function freezeSpecification(
  specification: MathematicalTemplateSpecification,
): Readonly<MathematicalTemplateSpecification> {
  Object.freeze(specification.domain)
  Object.freeze(specification.output)
  Object.freeze(specification.template)
  return Object.freeze(specification)
}

export function getMathematicalTemplateTransferSnapshot() {
  return snapshot
}

export function subscribeMathematicalTemplateTransfer(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function publishMathematicalTemplateTransfer(
  input: {
    specification: unknown
    config: unknown
  },
  createdAt = Date.now(),
): MathematicalTemplateTransferResult {
  const specificationValidation =
    validateMathematicalTemplateSpecification(input.specification)
  if (!specificationValidation.valid) {
    return {
      ok: false,
      value: null,
      issues: specificationValidation.issues,
    }
  }

  const configValidation = validateBalanceConfig(input.config)
  if (!configValidation.valid) {
    return {
      ok: false,
      value: null,
      issues: configValidation.issues.map(({ path, message }) => ({
        path,
        message,
      })),
    }
  }

  if (!Number.isFinite(createdAt) || createdAt < 0) {
    return {
      ok: false,
      value: null,
      issues: [
        {
          path: 'createdAt',
          message: 'La fecha transitoria debe ser un número finito no negativo.',
        },
      ],
    }
  }

  const revision = snapshot.revision + 1
  const specification = freezeSpecification(
    structuredClone(specificationValidation.specification),
  )
  const candidate = Object.freeze({
    id: `template:${revision}`,
    name: specification.name,
    source: 'template' as const,
    target: specification.target,
    createdAt,
    specification,
    config: freezeBalanceConfig(cloneBalanceConfig(configValidation.config)),
  })

  snapshot = Object.freeze({ revision, candidate })
  notify()

  return { ok: true, value: candidate, issues: [] }
}

export function clearMathematicalTemplateTransfer() {
  if (!snapshot.candidate) return false
  snapshot = Object.freeze({
    revision: snapshot.revision + 1,
    candidate: null,
  })
  notify()
  return true
}

export function resetMathematicalTemplateTransferForTests() {
  snapshot = Object.freeze({ revision: 0, candidate: null })
  listeners.clear()
}
