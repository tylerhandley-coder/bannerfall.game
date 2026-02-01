import { PlayerTeam, UnitType } from './units';

export enum GameLogType {
  MOVE = 'move',
  ATTACK = 'attack',
  CARD_CAST = 'card_cast',
  CARD = 'card',
  UNIT_DEFEATED = 'unit_defeated',
  TURN_START = 'turn_start',
  VICTORY = 'victory',
  EFFECT = 'effect',
}

export interface GameLogEntry {
  id: string;
  type: GameLogType;
  player: PlayerTeam;
  turn: number;
  message: string;
  timestamp: number;
  unitType?: UnitType;
  targetUnitType?: UnitType;
  damage?: number;
}
