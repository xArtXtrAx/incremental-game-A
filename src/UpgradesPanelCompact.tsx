import { useState, type ReactNode } from 'react'
import {
  type GameAction,
  type GameState,
  AUTOCLICK_REQUIRED_CLICKS,
  CAVITATION_REQUIRED_CLICKS,
  getAutoclickCost,
  getAutoclickRate,
  getCavitationClicksRequired,
  getCavitationCost,
  getCavitationReward,
  getCavitationSeconds,
  getClickPower,
  getClickUpgradeCost,
  getEnergyPerSecond,
  getGeneratorCost,
  getOverloadClicksRequired,
  getOverloadCost,
  getOverloadDurationSeconds,
  getOverloadMultiplier,
  getOverloadRemainingSeconds,
  getPressureBonusPercent,
  getPressureCost,
  getPressureTier,
  getResonanceCost,
  getResonanceMultiplier,
  getSapphireMultiplier,
  hasUnlockedBlueprints,
  isOverloadActive,
  PRESSURE_REQUIRED_CLICKS,
  SPHERE_CLICK_CAPACITY,
} from './game'

type UpgradeCategory = 'production' | 'core' | 'advanced'

type Props = {
  game: GameState
  clockNow: number
  dispatch: (action: GameAction) => void
  resetArmed: boolean
  onReset: () => void
}

type CardProps = {
  id: string
  number: string
  title: string
  level: number
  summary: ReactNode
  description: string
  effect: ReactNode
  label: string
  detail: ReactNode
  disabled: boolean
  expanded: boolean
  onToggle: () => void
  onClick: () => void
}

const format = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 2 })

const categories: Array<{
  id: UpgradeCategory
  label: string
  description: string
  count: number
}> = [
  {
    id: 'production',
    label: 'Producción',
    description: 'Clics, automatización y eficiencia base.',
    count: 4,
  },
  {
    id: 'core',
    label: 'Núcleo',
    description: 'Presión y ciclos repetibles del núcleo líquido.',
    count: 2,
  },
  {
    id: 'advanced',
    label: 'Avanzadas',
    description: 'Estados temporales y sistemas de final de etapa.',
    count: 1,
  },
]

function describeAutoclickRate(rate: number) {
  if (rate <= 0) {
    return 'Inactivo'
  }

  return rate < 1
    ? `1 clic cada ${format.format(1 / rate)} s`
    : `${format.format(rate)} clics/s`
}

function Card({
  id,
  number,
  title,
  level,
  summary,
  description,
  effect,
  label,
  detail,
  disabled,
  expanded,
  onToggle,
  onClick,
}: CardProps) {
  const detailsId = `${id}-details`

  return (
    <article className={`upgrade-card compact${expanded ? ' is-expanded' : ''}`}>
      <div className="upgrade-card-header">
        <div>
          <span className="upgrade-number">{number}</span>
          <h3>{title}</h3>
        </div>
        <span className="level-badge">Nivel {level}</span>
      </div>

      <div className="upgrade-quick">{summary}</div>

      <div className="upgrade-card-actions">
        <button
          type="button"
          className="upgrade-button"
          onClick={onClick}
          disabled={disabled}
        >
          <span>{label}</span>
          <strong>{detail}</strong>
        </button>
        <button
          type="button"
          className="upgrade-details-toggle"
          aria-expanded={expanded}
          aria-controls={detailsId}
          onClick={onToggle}
        >
          {expanded ? 'Ocultar detalles' : 'Ver detalles'}
          <span aria-hidden="true">{expanded ? '−' : '+'}</span>
        </button>
      </div>

      {expanded && (
        <div className="upgrade-card-details" id={detailsId}>
          <p>{description}</p>
          <div className="upgrade-effect">{effect}</div>
        </div>
      )}
    </article>
  )
}

export function UpgradesPanel({
  game,
  clockNow,
  dispatch,
  resetArmed,
  onReset,
}: Props) {
  const [activeCategory, setActiveCategory] =
    useState<UpgradeCategory>('production')
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

  const active = isOverloadActive(game.overloadUntil, clockNow)
  const activeMultiplier = active ? getOverloadMultiplier(game.overloadLevel) : 1
  const sapphireMultiplier = getSapphireMultiplier(game.prestigeCount)
  const blueprintsUnlocked = hasUnlockedBlueprints(game)
  const remaining = getOverloadRemainingSeconds(game.overloadUntil, clockNow)
  const pressureTier = getPressureTier(game.manualClicks)
  const pressureBonus = getPressureBonusPercent(
    game.manualClicks,
    game.pressureLevel,
  )
  const nextPressureBonus = getPressureBonusPercent(
    game.manualClicks,
    game.pressureLevel + 1,
  )
  const clickPowerNext = getClickPower(
    game.clickLevel + 1,
    game.manualClicks,
    game.pressureLevel,
    activeMultiplier,
    sapphireMultiplier,
  )
  const generatorNext = getEnergyPerSecond(
    game.generatorLevel + 1,
    game.resonanceLevel,
    game.manualClicks,
    game.pressureLevel,
    activeMultiplier,
    sapphireMultiplier,
  )
  const resonance = getResonanceMultiplier(game.resonanceLevel)
  const resonanceNext = getEnergyPerSecond(
    game.generatorLevel,
    game.resonanceLevel + 1,
    game.manualClicks,
    game.pressureLevel,
    activeMultiplier,
    sapphireMultiplier,
  )
  const pressureClickNext = getClickPower(
    game.clickLevel,
    game.manualClicks,
    game.pressureLevel + 1,
    activeMultiplier,
    sapphireMultiplier,
  )
  const pressureProductionNext = getEnergyPerSecond(
    game.generatorLevel,
    game.resonanceLevel,
    game.manualClicks,
    game.pressureLevel + 1,
    activeMultiplier,
    sapphireMultiplier,
  )
  const cavitationThreshold = getCavitationClicksRequired(game.cavitationLevel)
  const cavitationSeconds = getCavitationSeconds(game.cavitationLevel)
  const cavitationReward = getCavitationReward(
    game.generatorLevel,
    game.resonanceLevel,
    game.manualClicks,
    game.pressureLevel,
    game.cavitationLevel,
    activeMultiplier,
    sapphireMultiplier,
  )
  const nextCavitationLevel = game.cavitationLevel + 1
  const nextCavitationThreshold = getCavitationClicksRequired(nextCavitationLevel)
  const nextCavitationSeconds = getCavitationSeconds(nextCavitationLevel)
  const nextCavitationReward = getCavitationReward(
    game.generatorLevel,
    game.resonanceLevel,
    game.manualClicks,
    game.pressureLevel,
    nextCavitationLevel,
    activeMultiplier,
    sapphireMultiplier,
  )
  const autoclickRate = getAutoclickRate(game.autoclickLevel)
  const nextAutoclickRate = getAutoclickRate(game.autoclickLevel + 1)
  const overloadThreshold = getOverloadClicksRequired(game.overloadLevel)
  const overloadDuration = getOverloadDurationSeconds(game.overloadLevel)
  const overloadMultiplier = getOverloadMultiplier(game.overloadLevel)
  const nextOverloadLevel = game.overloadLevel + 1

  const clickCost = getClickUpgradeCost(game.clickLevel)
  const generatorCost = getGeneratorCost(game.generatorLevel)
  const resonanceCost = getResonanceCost(game.resonanceLevel)
  const pressureCost = getPressureCost(game.pressureLevel)
  const cavitationCost = getCavitationCost(game.cavitationLevel)
  const autoclickCost = getAutoclickCost(game.autoclickLevel)
  const overloadCost = getOverloadCost(game.overloadLevel)
  const sphereFull = game.manualClicks >= SPHERE_CLICK_CAPACITY
  const pressureDiscoveryMissing =
    !blueprintsUnlocked && game.manualClicks < PRESSURE_REQUIRED_CLICKS
  const cavitationDiscoveryMissing =
    !blueprintsUnlocked && game.manualClicks < CAVITATION_REQUIRED_CLICKS
  const autoclickDiscoveryMissing =
    !blueprintsUnlocked && game.manualClicks < AUTOCLICK_REQUIRED_CLICKS
  const overloadDiscoveryMissing = !blueprintsUnlocked && !sphereFull
  const category =
    categories.find((item) => item.id === activeCategory) ?? categories[0]

  function selectCategory(categoryId: UpgradeCategory) {
    setActiveCategory(categoryId)
    setExpandedCard(null)
  }

  function toggleCard(cardId: string) {
    setExpandedCard((current) => (current === cardId ? null : cardId))
  }

  return (
    <aside className="upgrades-panel" aria-labelledby="upgrades-title">
      <div className="upgrades-toolbar">
        <div className="upgrades-heading">
          <div>
            <p className="eyebrow">Evoluciones disponibles</p>
            <h2 id="upgrades-title">Mejoras</h2>
          </div>
          <span className="upgrade-total">
            7 sistemas{blueprintsUnlocked ? ' · planos permanentes' : ''}
          </span>
        </div>

        <div className="upgrade-tabs" role="tablist" aria-label="Categorías de evolución">
          {categories.map((item) => (
            <button
              type="button"
              role="tab"
              key={item.id}
              className={activeCategory === item.id ? 'is-active' : ''}
              aria-selected={activeCategory === item.id}
              onClick={() => selectCategory(item.id)}
            >
              <span>{item.label}</span>
              <small>{item.count}</small>
            </button>
          ))}
        </div>

        <div className="upgrade-category-intro">
          <span>{category.label}</span>
          <p>{category.description}</p>
        </div>
      </div>

      <div className="upgrade-cards-grid" role="tabpanel">
        {activeCategory === 'production' && (
          <>
            <Card
              id="pulse-amplifier"
              number="Evolución 01"
              title="Amplificador de pulso"
              level={game.clickLevel}
              summary={<>+{format.format(clickPowerNext)} por clic</>}
              description="Aumenta en 1 la energía base obtenida con cada clic del núcleo. El zafiro multiplica el resultado final."
              effect={<>Siguiente nivel: +{format.format(clickPowerNext)} por clic</>}
              label="Mejorar"
              detail={`${format.format(clickCost)} energía`}
              disabled={game.energy < clickCost}
              expanded={expandedCard === 'pulse-amplifier'}
              onToggle={() => toggleCard('pulse-amplifier')}
              onClick={() => dispatch({ type: 'buy-click-upgrade' })}
            />

            <Card
              id="micro-generator"
              number="Evolución 02"
              title="Microgenerador"
              level={game.generatorLevel}
              summary={<>{format.format(generatorNext)} energía/s total</>}
              description="Cada unidad recibe resonancia, presión, sobrecarga y el multiplicador permanente del zafiro."
              effect={<>Siguiente nivel: {format.format(generatorNext)} energía/s total</>}
              label="Construir"
              detail={`${format.format(generatorCost)} energía`}
              disabled={game.energy < generatorCost}
              expanded={expandedCard === 'micro-generator'}
              onToggle={() => toggleCard('micro-generator')}
              onClick={() => dispatch({ type: 'buy-generator' })}
            />

            <Card
              id="resonance-reactor"
              number="Evolución 03"
              title="Reactor de resonancia"
              level={game.resonanceLevel}
              summary={<>×{format.format(resonance)} → ×{format.format(resonance + 1)}</>}
              description="Aumenta en 100% la producción base de todos los microgeneradores."
              effect={<>Producción siguiente: {format.format(resonanceNext)}/s</>}
              label="Sincronizar"
              detail={
                game.generatorLevel === 0
                  ? 'Requiere microgenerador'
                  : `${format.format(resonanceCost)} energía`
              }
              disabled={game.generatorLevel === 0 || game.energy < resonanceCost}
              expanded={expandedCard === 'resonance-reactor'}
              onToggle={() => toggleCard('resonance-reactor')}
              onClick={() => dispatch({ type: 'buy-resonance' })}
            />

            <Card
              id="autonomous-pulser"
              number="Evolución 07"
              title="Módulo de pulsación autónoma"
              level={game.autoclickLevel}
              summary={
                game.autoclickLevel > 0
                  ? `${format.format(autoclickRate)} clic/s · ${format.format(game.autoclickProgress * 100)}% de carga`
                  : 'Autoclicker inactivo'
              }
              description="Acumula fracciones de clic y las convierte en clics reales. Llena la esfera y activa presión, cavitación y sobrecarga."
              effect={
                <>
                  <span>Actual: {describeAutoclickRate(autoclickRate)}</span>
                  <small>
                    Próximo nivel: {describeAutoclickRate(nextAutoclickRate)}
                  </small>
                </>
              }
              label="Automatizar"
              detail={
                autoclickDiscoveryMissing
                  ? `Requiere ${AUTOCLICK_REQUIRED_CLICKS} clics`
                  : game.generatorLevel === 0
                    ? 'Requiere microgenerador'
                    : `${format.format(autoclickCost)} energía`
              }
              disabled={
                autoclickDiscoveryMissing ||
                game.generatorLevel === 0 ||
                game.energy < autoclickCost
              }
              expanded={expandedCard === 'autonomous-pulser'}
              onToggle={() => toggleCard('autonomous-pulser')}
              onClick={() => dispatch({ type: 'buy-autoclicker' })}
            />
          </>
        )}

        {activeCategory === 'core' && (
          <>
            <Card
              id="pressure-condenser"
              number="Evolución 04"
              title="Condensador de presión"
              level={game.pressureLevel}
              summary={<>+{format.format(pressureBonus)}% global · {pressureTier}/10 tramos</>}
              description="Cada nivel concede +2% global por cada tramo completo del 10% de llenado."
              effect={
                <>
                  <span>Bono siguiente: +{format.format(nextPressureBonus)}%</span>
                  <small>
                    +{format.format(pressureClickNext)} por clic · +
                    {format.format(pressureProductionNext)}/s
                  </small>
                </>
              }
              label="Presurizar"
              detail={
                pressureDiscoveryMissing
                  ? `Requiere ${PRESSURE_REQUIRED_CLICKS} clics`
                  : `${format.format(pressureCost)} energía`
              }
              disabled={pressureDiscoveryMissing || game.energy < pressureCost}
              expanded={expandedCard === 'pressure-condenser'}
              onToggle={() => toggleCard('pressure-condenser')}
              onClick={() => dispatch({ type: 'buy-pressure' })}
            />

            <Card
              id="cavitation-chamber"
              number="Evolución 05"
              title="Cámara de cavitación"
              level={game.cavitationLevel}
              summary={
                game.cavitationLevel > 0
                  ? `${game.cavitationCharge}/${cavitationThreshold} · +${format.format(cavitationReward)}`
                  : 'Cámara inactiva'
              }
              description="Los clics cargan la cámara y liberan varios segundos de producción automática, incluido el multiplicador del zafiro."
              effect={
                <>
                  <span>
                    Actual: cada {cavitationThreshold} clics · {cavitationSeconds} s
                  </span>
                  <small>
                    Próximo: cada {nextCavitationThreshold} clics ·{' '}
                    {nextCavitationSeconds} s = +
                    {format.format(nextCavitationReward)}
                  </small>
                </>
              }
              label="Estabilizar"
              detail={
                cavitationDiscoveryMissing
                  ? `Requiere ${CAVITATION_REQUIRED_CLICKS} clics`
                  : game.generatorLevel === 0
                    ? 'Requiere microgenerador'
                    : `${format.format(cavitationCost)} energía`
              }
              disabled={
                cavitationDiscoveryMissing ||
                game.generatorLevel === 0 ||
                game.energy < cavitationCost
              }
              expanded={expandedCard === 'cavitation-chamber'}
              onToggle={() => toggleCard('cavitation-chamber')}
              onClick={() => dispatch({ type: 'buy-cavitation' })}
            />
          </>
        )}

        {activeCategory === 'advanced' && (
          <Card
            id="overload-valve"
            number="Evolución 06"
            title="Válvula de sobrecarga"
            level={game.overloadLevel}
            summary={
              game.overloadLevel === 0
                ? 'Válvula inactiva'
                : active
                  ? `ACTIVA ×${format.format(overloadMultiplier)} · ${remaining.toFixed(1)} s`
                  : `${game.overloadCharge}/${overloadThreshold} · ×${format.format(overloadMultiplier)}`
            }
            description="Los clics posteriores a llenar la esfera cargan una fase temporal que multiplica toda la energía. Puede instalarse antes tras conservar su plano."
            effect={
              <>
                <span>
                  Actual: ×{format.format(overloadMultiplier)} durante {overloadDuration} s
                </span>
                <small>
                  Próximo: cada {getOverloadClicksRequired(nextOverloadLevel)} clics · ×
                  {format.format(getOverloadMultiplier(nextOverloadLevel))} durante{' '}
                  {getOverloadDurationSeconds(nextOverloadLevel)} s
                </small>
              </>
            }
            label="Instalar válvula"
            detail={
              overloadDiscoveryMissing
                ? `Requiere esfera llena (${SPHERE_CLICK_CAPACITY} clics)`
                : game.cavitationLevel === 0
                  ? 'Requiere cavitación nivel 1'
                  : `${format.format(overloadCost)} energía`
            }
            disabled={
              overloadDiscoveryMissing ||
              game.cavitationLevel === 0 ||
              game.energy < overloadCost
            }
            expanded={expandedCard === 'overload-valve'}
            onToggle={() => toggleCard('overload-valve')}
            onClick={() => dispatch({ type: 'buy-overload' })}
          />
        )}
      </div>

      <div className="save-controls">
        <div className="save-status">
          <span className="save-dot" aria-hidden="true" />
          <div>
            <strong>Guardado automático</strong>
            <small>
              {blueprintsUnlocked
                ? `Zafiro permanente ×${format.format(sapphireMultiplier)} y planos conservados.`
                : 'El progreso se conserva en este navegador.'}
            </small>
          </div>
        </div>
        <button
          type="button"
          className={`reset-button${resetArmed ? ' is-armed' : ''}`}
          onClick={onReset}
        >
          {resetArmed ? 'Confirmar reinicio total' : 'Reiniciar progreso'}
        </button>
        {resetArmed && (
          <p className="reset-warning" role="status">
            Presiona otra vez antes de 6 segundos. Esta acción borra también el zafiro.
          </p>
        )}
      </div>
    </aside>
  )
}
