import { Effect, EffectType, EffectDuration } from '../types/effects';

export function getEffectDescription(effect: Effect): string {
  const value = effect.value > 0 ? `+${effect.value}` : effect.value;

  switch (effect.type) {
    case EffectType.ATTACK_BUFF:
      return `Attack ${value}`;
    case EffectType.ATTACK_NERF:
      return `Attack -${effect.value}`;
    case EffectType.ATTACK_BLOCKED:
      return 'Cannot attack';
    case EffectType.DAMAGE_REDUCTION:
      return `Damage reduction ${value}`;
    case EffectType.MOVEMENT_BUFF:
      return `Movement ${value}`;
    case EffectType.MOVEMENT_BLOCKED:
      return 'Cannot move';
    case EffectType.RANGE_BUFF:
      return `Range ${value}`;
    case EffectType.RANGE_NERF:
      return `Range -${effect.value}`;
    case EffectType.HEAL:
      return `Healed ${effect.value} HP`;
    case EffectType.INVISIBLE:
      return 'Invisible to enemies';
    case EffectType.CARD_DAMAGE:
      return `Took ${Math.abs(effect.value)} damage`;
    case EffectType.BUFF_BLOCKED:
      return 'Cannot receive buffs';
    case EffectType.PLATEAU_DEBUFF:
      return 'Plateau bonuses removed';
    case EffectType.EXTRA_MOVEMENT:
      return `+${effect.value} movement`;
    case EffectType.DAMAGE_ON_DEATH:
      return `Deals ${effect.value} damage on death`;
    case EffectType.ON_DEATH_MAGE_DAMAGE:
      return `Damages mages on death`;
    case EffectType.PUSH:
      return 'Pushes back attackers';
    case EffectType.EXTRA_ATTACK:
      return 'Can attack again this turn';
    case EffectType.HEAL_ON_KILL:
      return `Heals ${effect.value} HP on kill`;
    case EffectType.IGNORE_DAMAGE_REDUCTION:
      return 'Ignores damage reduction';
    case EffectType.AREA_DAMAGE:
      return `Deals ${effect.value} damage to nearby enemies`;
    case EffectType.MOVEMENT_ON_KILL:
      return `Gains ${value} movement on kill`;
    default:
      return 'Unknown effect';
  }
}

export function getEffectDurationText(effect: Effect): string {
  switch (effect.duration) {
    case EffectDuration.INSTANT:
      return '';
    case EffectDuration.THIS_TURN:
      return 'This turn';
    case EffectDuration.NEXT_TURN:
      return effect.usedThisTurn ? 'Expired' : 'Next turn';
    case EffectDuration.UNTIL_TRIGGERED:
      return 'Until triggered';
    case EffectDuration.PERMANENT:
      return 'Permanent';
    default:
      return '';
  }
}

export function formatEffectTooltip(effects: Effect[]): string {
  return effects.map(effect => {
    const description = getEffectDescription(effect);
    const duration = getEffectDurationText(effect);
    const source = effect.sourceCardTitle ? ` (${effect.sourceCardTitle})` : '';

    if (duration) {
      return `${description} - ${duration}${source}`;
    }
    return `${description}${source}`;
  }).join('\n');
}
