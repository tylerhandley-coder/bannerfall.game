import { UnitType } from './units';

export enum EffectType {
  ATTACK_BUFF = 'attack_buff',
  ATTACK_NERF = 'attack_nerf',
  ATTACK_BLOCKED = 'attack_blocked',
  DAMAGE_REDUCTION = 'damage_reduction',
  MOVEMENT_BUFF = 'movement_buff',
  MOVEMENT_BLOCKED = 'movement_blocked',
  RANGE_BUFF = 'range_buff',
  RANGE_NERF = 'range_nerf',
  HEAL = 'heal',
  INVISIBLE = 'invisible',
  CARD_DAMAGE = 'card_damage',
  BUFF_BLOCKED = 'buff_blocked',
  PLATEAU_DEBUFF = 'plateau_debuff',
  EXTRA_MOVEMENT = 'extra_movement',
  DAMAGE_ON_DEATH = 'damage_on_death',
  ON_DEATH_MAGE_DAMAGE = 'on_death_mage_damage',
  PUSH = 'push',
  EXTRA_ATTACK = 'extra_attack',
  HEAL_ON_KILL = 'heal_on_kill',
  IGNORE_DAMAGE_REDUCTION = 'ignore_damage_reduction',
  AREA_DAMAGE = 'area_damage',
  MOVEMENT_ON_KILL = 'movement_on_kill',
}

export enum EffectDuration {
  INSTANT = 'instant',
  THIS_TURN = 'this_turn',
  NEXT_TURN = 'next_turn',
  UNTIL_TRIGGERED = 'until_triggered',
  PERMANENT = 'permanent',
}

export interface Effect {
  id: string;
  type: EffectType;
  duration: EffectDuration;
  value: number;
  sourceCardTitle?: string;
  turnsRemaining?: number;
  appliedOnTurn?: number;
  triggerCondition?: string;
  usedThisTurn?: boolean;
  casterTeam?: string;
}

export interface CardTarget {
  unitId?: string;
  position?: { q: number; r: number };
  areaEffect?: boolean;
}

export interface CardEffect {
  type: EffectType;
  value: number;
  duration: EffectDuration;
  targetTypes?: UnitType[];
  requiresPlateau?: boolean;
  requiresAdjacent?: boolean;
  areaOfEffect?: number;
}
