import { Effect } from './effects';

export enum UnitType {
  WARLORD = 'warlord',
  BRUTE = 'brute',
  ARCHER = 'archer',
  MAGE = 'mage',
  ASSASSIN = 'assassin',
  PLATEAU = 'plateau',
  FLAG = 'flag',
}

export enum TerrainType {
  PLAIN = 'plain',
  PLATEAU = 'plateau',
  OBSTACLE = 'obstacle',
}

export enum PlayerTeam {
  PLAYER1 = 'player1',
  PLAYER2 = 'player2',
}

export interface UnitStats {
  hp: number;
  maxHp: number;
  attack: number;
  range?: number;
  movement: number;
}

export interface Unit {
  id: string;
  type: UnitType;
  team: PlayerTeam;
  q: number;
  r: number;
  stats: UnitStats;
  actionsUsed: number;
  hasAttacked: boolean;
  hasMoved: boolean;
  hasCast: boolean;
  effects: Effect[];
}

export interface UnitDefinition {
  type: UnitType;
  name: string;
  hp: number;
  attack: number;
  movement: number;
  range?: number;
  description: string;
  ability: string;
}

export const UNIT_DEFINITIONS: Record<UnitType, UnitDefinition> = {
  [UnitType.WARLORD]: {
    type: UnitType.WARLORD,
    name: 'Warlord',
    hp: 14,
    attack: 5,
    movement: 2,
    range: 1,
    description: 'Elite commander',
    ability: 'Can use special Warlord Buff cards, but only if the total Attack exceeds the remaining HP of the opposing unit',
  },
  [UnitType.BRUTE]: {
    type: UnitType.BRUTE,
    name: 'Brute',
    hp: 7,
    attack: 3,
    movement: 1,
    range: 1,
    description: 'Powerful force',
    ability: 'Can choose to "push" an opposing unit into any open adjacent hex (opponent takes 1 damage)',
  },
  [UnitType.ARCHER]: {
    type: UnitType.ARCHER,
    name: 'Archer',
    hp: 4,
    attack: 2,
    movement: 1,
    range: 2,
    description: 'Ranged attacker',
    ability: 'Can shoot over any friendly or opposition unit',
  },
  [UnitType.MAGE]: {
    type: UnitType.MAGE,
    name: 'Mage',
    hp: 4,
    attack: 0,
    movement: 1,
    range: 3,
    description: 'Spellcaster',
    ability: 'Only unit that can Cast Nerfs and Buffs',
  },
  [UnitType.ASSASSIN]: {
    type: UnitType.ASSASSIN,
    name: 'Assassin',
    hp: 2,
    attack: 1,
    movement: 4,
    range: 4,
    description: 'Swift killer',
    ability: 'Can jump other units into an empty hex. Deals +3 damage (4 total) when adjacent to an opposing unit. Can attack targets within 4 tiles if any clear path exists',
  },
  [UnitType.PLATEAU]: {
    type: UnitType.PLATEAU,
    name: 'Plateau',
    hp: 0,
    attack: 0,
    movement: 0,
    description: 'Elevated terrain',
    ability: 'Gives Mages +1 range. Archers deal +1 damage and receive -1 damage. Takes 2 actions to climb, 1 action to descend',
  },
  [UnitType.FLAG]: {
    type: UnitType.FLAG,
    name: 'Flag',
    hp: 3,
    attack: 0,
    movement: 0,
    description: 'Team objective',
    ability: 'Defeat the enemy flag to win! Cannot move or attack',
  },
};

export function createUnit(
  type: UnitType,
  team: PlayerTeam,
  q: number,
  r: number,
  id?: string
): Unit {
  const def = UNIT_DEFINITIONS[type];
  return {
    id: id || `${team}-${type}-${Date.now()}`,
    type,
    team,
    q,
    r,
    stats: {
      hp: def.hp,
      maxHp: def.hp,
      attack: def.attack,
      range: def.range,
      movement: def.movement,
    },
    actionsUsed: 0,
    hasAttacked: false,
    hasMoved: false,
    hasCast: false,
    effects: [],
  };
}
