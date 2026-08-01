import { type ReactNode } from 'react'
import {
  type GameAction,
  type GameState,
  CAVITATION_REQUIRED_CLICKS,
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
  isOverloadActive,
  PRESSURE_REQUIRED_CLICKS,
  SPHERE_CLICK_CAPACITY,
} from './game'

type Props = {
  game: GameState
  clockNow: number
  dispatch: (action: GameAction) => void
  resetArmed: boolean
  onReset: () => void
}

type CardProps = {
  number: string
  title: string
  level: number
  description: string
  effect: ReactNode
  label: string
  detail: ReactNode
  disabled: boolean
  onClick: () => void
}

const format = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 2 })

function Card({ number, title, level, description, effect, label, detail, disabled, onClick }: CardProps) {
  return (
    <article className="upgrade-card">
      <div className="upgrade-card-header">
        <div><span className="upgrade-number">{number}</span><h3>{title}</h3></div>
        <span className="level-badge">Nivel {level}</span>
      </div>
      <p>{description}</p>
      <div className="upgrade-effect">{effect}</div>
      <button type="button" className="upgrade-button" onClick={onClick} disabled={disabled}>
        <span>{label}</span><strong>{detail}</strong>
      </button>
    </article>
  )
}

export function UpgradesPanel({ game, clockNow, dispatch, resetArmed, onReset }: Props) {
  const active = isOverloadActive(game.overloadUntil, clockNow)
  const activeMultiplier = active ? getOverloadMultiplier(game.overloadLevel) : 1
  const remaining = getOverloadRemainingSeconds(game.overloadUntil, clockNow)
  const pressureTier = getPressureTier(game.manualClicks)
  const pressureBonus = getPressureBonusPercent(game.manualClicks, game.pressureLevel)
  const nextPressureBonus = getPressureBonusPercent(game.manualClicks, game.pressureLevel + 1)
  const clickPowerNext = getClickPower(game.clickLevel + 1, game.manualClicks, game.pressureLevel, activeMultiplier)
  const generatorNext = getEnergyPerSecond(game.generatorLevel + 1, game.resonanceLevel, game.manualClicks, game.pressureLevel, activeMultiplier)
  const resonance = getResonanceMultiplier(game.resonanceLevel)
  const resonanceNext = getEnergyPerSecond(game.generatorLevel, game.resonanceLevel + 1, game.manualClicks, game.pressureLevel, activeMultiplier)
  const pressureClickNext = getClickPower(game.clickLevel, game.manualClicks, game.pressureLevel + 1, activeMultiplier)
  const pressureProductionNext = getEnergyPerSecond(game.generatorLevel, game.resonanceLevel, game.manualClicks, game.pressureLevel + 1, activeMultiplier)
  const cavitationThreshold = getCavitationClicksRequired(game.cavitationLevel)
  const cavitationSeconds = getCavitationSeconds(game.cavitationLevel)
  const cavitationReward = getCavitationReward(game.generatorLevel, game.resonanceLevel, game.manualClicks, game.pressureLevel, game.cavitationLevel, activeMultiplier)
  const nextCavitationLevel = game.cavitationLevel + 1
  const nextCavitationThreshold = getCavitationClicksRequired(nextCavitationLevel)
  const nextCavitationSeconds = getCavitationSeconds(nextCavitationLevel)
  const nextCavitationReward = getCavitationReward(game.generatorLevel, game.resonanceLevel, game.manualClicks, game.pressureLevel, nextCavitationLevel, activeMultiplier)
  const overloadThreshold = getOverloadClicksRequired(game.overloadLevel)
  const overloadDuration = getOverloadDurationSeconds(game.overloadLevel)
  const overloadMultiplier = getOverloadMultiplier(game.overloadLevel)
  const nextOverloadLevel = game.overloadLevel + 1

  const clickCost = getClickUpgradeCost(game.clickLevel)
  const generatorCost = getGeneratorCost(game.generatorLevel)
  const resonanceCost = getResonanceCost(game.resonanceLevel)
  const pressureCost = getPressureCost(game.pressureLevel)
  const cavitationCost = getCavitationCost(game.cavitationLevel)
  const overloadCost = getOverloadCost(game.overloadLevel)
  const sphereFull = game.manualClicks >= SPHERE_CLICK_CAPACITY

  return (
    <aside className="upgrades-panel" aria-labelledby="upgrades-title">
      <div className="upgrades-heading"><p className="eyebrow">Evoluciones disponibles</p><h2 id="upgrades-title">Mejoras</h2></div>

      <Card number="Evolución 01" title="Amplificador de pulso" level={game.clickLevel}
        description="Aumenta en 1 la energía base obtenida con cada clic manual."
        effect={<>Siguiente nivel: +{format.format(clickPowerNext)} por clic</>}
        label="Mejorar" detail={`${format.format(clickCost)} energía`}
        disabled={game.energy < clickCost} onClick={() => dispatch({ type: 'buy-click-upgrade' })} />

      <Card number="Evolución 02" title="Microgenerador" level={game.generatorLevel}
        description="Cada unidad recibe los multiplicadores de resonancia, presión y sobrecarga."
        effect={<>Siguiente nivel: {format.format(generatorNext)} energía/s total</>}
        label="Construir" detail={`${format.format(generatorCost)} energía`}
        disabled={game.energy < generatorCost} onClick={() => dispatch({ type: 'buy-generator' })} />

      <Card number="Evolución 03" title="Reactor de resonancia" level={game.resonanceLevel}
        description="Aumenta en 100% la producción base de todos los microgeneradores."
        effect={<>Resonancia: ×{format.format(resonance)} → ×{format.format(resonance + 1)} · Producción: {format.format(resonanceNext)}/s</>}
        label="Sincronizar" detail={game.generatorLevel === 0 ? 'Requiere microgenerador' : `${format.format(resonanceCost)} energía`}
        disabled={game.generatorLevel === 0 || game.energy < resonanceCost} onClick={() => dispatch({ type: 'buy-resonance' })} />

      <Card number="Evolución 04" title="Condensador de presión" level={game.pressureLevel}
        description="Cada nivel concede +2% global por cada tramo completo del 10% de llenado."
        effect={<><span style={{ display: 'block' }}>Tramos: {pressureTier}/10 · Bono: +{format.format(pressureBonus)}% → +{format.format(nextPressureBonus)}%</span><small style={{ display: 'block', marginTop: 5 }}>Próximo nivel: +{format.format(pressureClickNext)} por clic · +{format.format(pressureProductionNext)}/s</small></>}
        label="Presurizar" detail={game.manualClicks < PRESSURE_REQUIRED_CLICKS ? `Requiere ${PRESSURE_REQUIRED_CLICKS} clics` : `${format.format(pressureCost)} energía`}
        disabled={game.manualClicks < PRESSURE_REQUIRED_CLICKS || game.energy < pressureCost} onClick={() => dispatch({ type: 'buy-pressure' })} />

      <Card number="Evolución 05" title="Cámara de cavitación" level={game.cavitationLevel}
        description="Los clics cargan la cámara y liberan varios segundos de producción automática."
        effect={<><span style={{ display: 'block' }}>{game.cavitationLevel > 0 ? `Carga: ${game.cavitationCharge}/${cavitationThreshold} · ${cavitationSeconds} s = +${format.format(cavitationReward)}` : 'Cámara inactiva'}</span><small style={{ display: 'block', marginTop: 5 }}>Próximo nivel: cada {nextCavitationThreshold} clics · {nextCavitationSeconds} s = +{format.format(nextCavitationReward)}</small></>}
        label="Estabilizar" detail={game.manualClicks < CAVITATION_REQUIRED_CLICKS ? `Requiere ${CAVITATION_REQUIRED_CLICKS} clics` : game.generatorLevel === 0 ? 'Requiere microgenerador' : `${format.format(cavitationCost)} energía`}
        disabled={game.manualClicks < CAVITATION_REQUIRED_CLICKS || game.generatorLevel === 0 || game.energy < cavitationCost} onClick={() => dispatch({ type: 'buy-cavitation' })} />

      <Card number="Evolución 06" title="Válvula de sobrecarga" level={game.overloadLevel}
        description="Los clics posteriores a llenar la esfera cargan una fase temporal que multiplica toda la energía."
        effect={<><span style={{ display: 'block' }}>{game.overloadLevel === 0 ? 'Válvula inactiva' : active ? `ACTIVA: ×${format.format(overloadMultiplier)} · ${remaining.toFixed(1)} s` : `Carga: ${game.overloadCharge}/${overloadThreshold} · ×${format.format(overloadMultiplier)} durante ${overloadDuration} s`}</span><small style={{ display: 'block', marginTop: 5 }}>Próximo nivel: cada {getOverloadClicksRequired(nextOverloadLevel)} clics · ×{format.format(getOverloadMultiplier(nextOverloadLevel))} durante {getOverloadDurationSeconds(nextOverloadLevel)} s</small></>}
        label="Instalar válvula" detail={!sphereFull ? `Requiere esfera llena (${SPHERE_CLICK_CAPACITY} clics)` : game.cavitationLevel === 0 ? 'Requiere cavitación nivel 1' : `${format.format(overloadCost)} energía`}
        disabled={!sphereFull || game.cavitationLevel === 0 || game.energy < overloadCost} onClick={() => dispatch({ type: 'buy-overload' })} />

      <div className="save-controls">
        <div className="save-status"><span className="save-dot" aria-hidden="true" /><div><strong>Guardado automático</strong><small>El progreso se conserva en este navegador.</small></div></div>
        <button type="button" className={`reset-button${resetArmed ? ' is-armed' : ''}`} onClick={onReset}>{resetArmed ? 'Confirmar reinicio total' : 'Reiniciar progreso'}</button>
        {resetArmed && <p className="reset-warning" role="status">Presiona otra vez antes de 6 segundos. Esta acción borra todo.</p>}
      </div>
    </aside>
  )
}
