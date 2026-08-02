import { useMemo, useState } from 'react'
import './BulkPurchase.css'
import {
  planBulkPurchases,
  type BulkPurchasePlan,
  type BulkPurchaseStrategy,
} from './bulkPurchase'
import type { GameState } from './game'

type Props = {
  game: GameState
  disabled?: boolean
  onApply: (plan: BulkPurchasePlan) => void
}

type Receipt = {
  strategy: BulkPurchaseStrategy
  purchases: number
  spent: number
}

const format = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 2 })

const STRATEGIES: Array<{
  id: BulkPurchaseStrategy
  label: string
  description: string
}> = [
  {
    id: 'balanced',
    label: 'Equilibrado',
    description: 'Combina clics, producción y sistemas.',
  },
  {
    id: 'active',
    label: 'Juego activo',
    description: 'Favorece clic, cavitación y sobrecarga.',
  },
  {
    id: 'automatic',
    label: 'Automático',
    description: 'Favorece producción y pulsación autónoma.',
  },
]

function getBreakdown(plan: BulkPurchasePlan) {
  const entries = Object.entries(plan.counts)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  if (entries.length === 0) {
    return 'No hay mejoras comprables con la energía actual.'
  }

  const labels: Record<string, string> = {
    click: 'Pulso',
    generator: 'Generador',
    resonance: 'Resonancia',
    pressure: 'Presión',
    cavitation: 'Cavitación',
    autoclick: 'Autoclick',
    overload: 'Sobrecarga',
    refraction: 'Refracción',
  }

  return entries
    .map(([kind, count]) => `${labels[kind] ?? kind} ×${count}`)
    .join(' · ')
}

export function BulkPurchaseControls({
  game,
  disabled = false,
  onApply,
}: Props) {
  const [strategy, setStrategy] =
    useState<BulkPurchaseStrategy>('balanced')
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const preview = useMemo(
    () => planBulkPurchases(game, strategy),
    [game, strategy],
  )
  const selected =
    STRATEGIES.find((item) => item.id === strategy) ?? STRATEGIES[0]
  const canBuy = preview.purchases.length > 0 && !disabled

  function handlePurchase() {
    if (!canBuy) return

    onApply(preview)
    setReceipt({
      strategy,
      purchases: preview.purchases.length,
      spent: preview.spent,
    })
  }

  return (
    <section className="bulk-purchase-panel" aria-labelledby="bulk-purchase-title">
      <div className="bulk-purchase-heading">
        <div>
          <p className="eyebrow">Compra estratégica</p>
          <h2 id="bulk-purchase-title">Comprar todo</h2>
        </div>
        <span>{selected.label}</span>
      </div>

      <div
        className="bulk-strategy-options"
        role="radiogroup"
        aria-label="Prioridad de compra"
      >
        {STRATEGIES.map((item) => (
          <button
            type="button"
            role="radio"
            key={item.id}
            className={strategy === item.id ? 'is-active' : ''}
            aria-checked={strategy === item.id}
            onClick={() => {
              setStrategy(item.id)
              setReceipt(null)
            }}
          >
            <strong>{item.label}</strong>
            <small>{item.description}</small>
          </button>
        ))}
      </div>

      <div className="bulk-purchase-preview" aria-live="polite">
        <div>
          <span>Plan estimado</span>
          <strong>
            {preview.purchases.length > 0
              ? `${preview.purchases.length} niveles · ${format.format(preview.spent)} energía`
              : 'Sin compras disponibles'}
          </strong>
          <small>{getBreakdown(preview)}</small>
        </div>
        <div>
          <span>Saldo posterior</span>
          <strong>{format.format(preview.remainingEnergy)}</strong>
        </div>
      </div>

      <button
        type="button"
        className="bulk-purchase-button"
        disabled={!canBuy}
        onClick={handlePurchase}
      >
        <span>Comprar todo posible</span>
        <strong>{selected.label}</strong>
      </button>

      {receipt && (
        <p className="bulk-purchase-receipt" role="status">
          {receipt.purchases} niveles comprados · −{format.format(receipt.spent)} de
          energía · {STRATEGIES.find((item) => item.id === receipt.strategy)?.label}
        </p>
      )}
    </section>
  )
}
