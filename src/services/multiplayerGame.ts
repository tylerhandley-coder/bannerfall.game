import { supabase } from '../lib/supabase';
import { Unit } from '../types/units';
import { Card } from '../types/cards';
import { GameLog } from '../types/gameLog';
import { shuffleDeck } from '../utils/cardDeck';

export interface GameState {
  id: string;
  game_code: string;
  player1_id: string | null;
  player2_id: string | null;
  current_player: 'player1' | 'player2';
  turn_number: number;
  actions_remaining: number;
  game_phase: 'setup' | 'play';
  winner: string | null;
  status: 'waiting' | 'active' | 'completed';
  player1_ready: boolean;
  player2_ready: boolean;
  player1_deck: Card[];
  player2_deck: Card[];
  created_at: string;
  updated_at: string;
}

export interface DBUnit {
  id: string;
  game_id: string;
  unit_id: string;
  type: string;
  team: 'player1' | 'player2';
  q: number;
  r: number;
  hp: number;
  max_hp: number;
  attack: number;
  range: number | null;
  movement: number;
  actions_used: number;
  has_attacked: boolean;
  effects: any[];
  created_at: string;
}

export interface DBCard {
  id: string;
  game_id: string;
  player: 'player1' | 'player2';
  card_data: Card;
  position: number;
  created_at: string;
}

export interface DBPlateau {
  id: string;
  game_id: string;
  q: number;
  r: number;
  team: 'player1' | 'player2' | null;
  created_at: string;
}

function generateGameCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function createGame(playerId: string): Promise<{ gameId: string; gameCode: string } | null> {
  const gameCode = generateGameCode();

  const { data, error } = await supabase
    .from('games')
    .insert({
      game_code: gameCode,
      player1_id: playerId,
      status: 'waiting',
      game_phase: 'setup',
      current_player: 'player1',
      turn_number: 0,
      actions_remaining: 2,
      player1_ready: false,
      player2_ready: false,
      player1_deck: [],
      player2_deck: []
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating game:', error);
    return null;
  }

  return { gameId: data.id, gameCode: data.game_code };
}

export async function joinGame(gameCode: string, playerId: string): Promise<string | null> {
  const { data: game, error: fetchError } = await supabase
    .from('games')
    .select('*')
    .eq('game_code', gameCode)
    .eq('status', 'waiting')
    .maybeSingle();

  if (fetchError || !game) {
    console.error('Error finding game:', fetchError);
    return null;
  }

  if (game.player2_id) {
    console.error('Game is full');
    return null;
  }

  const { error: updateError } = await supabase
    .from('games')
    .update({ player2_id: playerId })
    .eq('id', game.id);

  if (updateError) {
    console.error('Error joining game:', updateError);
    return null;
  }

  return game.id;
}

export async function getGame(gameId: string): Promise<GameState | null> {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('id', gameId)
    .single();

  if (error) {
    console.error('Error fetching game:', error);
    return null;
  }

  return data;
}

export async function setPlayerReady(gameId: string, player: 'player1' | 'player2', ready: boolean): Promise<boolean> {
  const column = player === 'player1' ? 'player1_ready' : 'player2_ready';

  const { error } = await supabase
    .from('games')
    .update({ [column]: ready })
    .eq('id', gameId);

  if (error) {
    console.error('Error setting ready state:', error);
    return false;
  }

  return true;
}

export async function startGame(gameId: string, player1Deck: Card[], player2Deck: Card[]): Promise<boolean> {
  const { error } = await supabase
    .from('games')
    .update({
      status: 'active',
      game_phase: 'play',
      player1_deck: player1Deck,
      player2_deck: player2Deck
    })
    .eq('id', gameId);

  if (error) {
    console.error('Error starting game:', error);
    return false;
  }

  return true;
}

export async function saveUnit(gameId: string, unit: Unit, team: 'player1' | 'player2'): Promise<boolean> {
  const { error } = await supabase
    .from('game_units')
    .insert({
      game_id: gameId,
      unit_id: unit.id,
      type: unit.type,
      team: team,
      q: unit.q,
      r: unit.r,
      hp: unit.hp,
      max_hp: unit.maxHp,
      attack: unit.attack,
      range: unit.range || null,
      movement: unit.movement,
      actions_used: 0,
      has_attacked: false,
      effects: unit.effects || []
    });

  if (error) {
    console.error('Error saving unit:', error);
    return false;
  }

  return true;
}

export async function updateUnit(gameId: string, unitId: string, updates: Partial<Unit>): Promise<boolean> {
  const dbUpdates: any = {};

  if (updates.q !== undefined) dbUpdates.q = updates.q;
  if (updates.r !== undefined) dbUpdates.r = updates.r;
  if (updates.hp !== undefined) dbUpdates.hp = updates.hp;
  if (updates.attack !== undefined) dbUpdates.attack = updates.attack;
  if (updates.range !== undefined) dbUpdates.range = updates.range;
  if (updates.movement !== undefined) dbUpdates.movement = updates.movement;
  if (updates.effects !== undefined) dbUpdates.effects = updates.effects;

  const { error } = await supabase
    .from('game_units')
    .update(dbUpdates)
    .eq('game_id', gameId)
    .eq('unit_id', unitId);

  if (error) {
    console.error('Error updating unit:', error);
    return false;
  }

  return true;
}

export async function deleteUnit(gameId: string, unitId: string): Promise<boolean> {
  const { error } = await supabase
    .from('game_units')
    .delete()
    .eq('game_id', gameId)
    .eq('unit_id', unitId);

  if (error) {
    console.error('Error deleting unit:', error);
    return false;
  }

  return true;
}

export async function getUnits(gameId: string): Promise<DBUnit[]> {
  const { data, error } = await supabase
    .from('game_units')
    .select('*')
    .eq('game_id', gameId);

  if (error) {
    console.error('Error fetching units:', error);
    return [];
  }

  return data || [];
}

export async function saveCard(gameId: string, player: 'player1' | 'player2', card: Card, position: number): Promise<boolean> {
  const { error } = await supabase
    .from('game_cards')
    .insert({
      game_id: gameId,
      player: player,
      card_data: card,
      position: position
    });

  if (error) {
    console.error('Error saving card:', error);
    return false;
  }

  return true;
}

export async function deleteCard(gameId: string, cardId: string): Promise<boolean> {
  const { error } = await supabase
    .from('game_cards')
    .delete()
    .eq('id', cardId);

  if (error) {
    console.error('Error deleting card:', error);
    return false;
  }

  return true;
}

export async function getCards(gameId: string, player: 'player1' | 'player2'): Promise<DBCard[]> {
  const { data, error } = await supabase
    .from('game_cards')
    .select('*')
    .eq('game_id', gameId)
    .eq('player', player)
    .order('position', { ascending: true });

  if (error) {
    console.error('Error fetching cards:', error);
    return [];
  }

  return data || [];
}

export async function cycleCards(gameId: string, player: 'player1' | 'player2', cardsToDiscard: string[]): Promise<Card[] | null> {
  const game = await getGame(gameId);
  if (!game) return null;

  const deck = player === 'player1' ? game.player1_deck : game.player2_deck;

  if (deck.length < 3) {
    console.error('Not enough cards in deck to cycle');
    return null;
  }

  const newCards = deck.slice(0, 3);
  const remainingDeck = deck.slice(3);

  const deckColumn = player === 'player1' ? 'player1_deck' : 'player2_deck';
  const { error: updateError } = await supabase
    .from('games')
    .update({ [deckColumn]: remainingDeck })
    .eq('id', gameId);

  if (updateError) {
    console.error('Error updating deck:', updateError);
    return null;
  }

  for (const cardId of cardsToDiscard) {
    await supabase
      .from('game_cards')
      .delete()
      .eq('game_id', gameId)
      .eq('player', player)
      .eq('card_data->>id', cardId);
  }

  const currentCards = await getCards(gameId, player);
  for (let i = 0; i < newCards.length; i++) {
    await saveCard(gameId, player, newCards[i], currentCards.length + i);
  }

  return newCards;
}

export async function savePlateau(gameId: string, q: number, r: number, team: 'player1' | 'player2' | null = null): Promise<boolean> {
  const { error } = await supabase
    .from('game_plateaus')
    .insert({
      game_id: gameId,
      q: q,
      r: r,
      team: team
    });

  if (error) {
    console.error('Error saving plateau:', error);
    return false;
  }

  return true;
}

export async function updatePlateau(gameId: string, q: number, r: number, team: 'player1' | 'player2' | null): Promise<boolean> {
  const { error } = await supabase
    .from('game_plateaus')
    .update({ team: team })
    .eq('game_id', gameId)
    .eq('q', q)
    .eq('r', r);

  if (error) {
    console.error('Error updating plateau:', error);
    return false;
  }

  return true;
}

export async function getPlateaus(gameId: string): Promise<DBPlateau[]> {
  const { data, error } = await supabase
    .from('game_plateaus')
    .select('*')
    .eq('game_id', gameId);

  if (error) {
    console.error('Error fetching plateaus:', error);
    return [];
  }

  return data || [];
}

export async function saveLog(gameId: string, log: GameLog): Promise<boolean> {
  const { error } = await supabase
    .from('game_logs')
    .insert({
      game_id: gameId,
      log_data: log
    });

  if (error) {
    console.error('Error saving log:', error);
    return false;
  }

  return true;
}

export async function getLogs(gameId: string): Promise<GameLog[]> {
  const { data, error } = await supabase
    .from('game_logs')
    .select('log_data')
    .eq('game_id', gameId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching logs:', error);
    return [];
  }

  return data?.map(row => row.log_data) || [];
}

export async function endTurn(gameId: string): Promise<boolean> {
  const game = await getGame(gameId);
  if (!game) return false;

  const nextPlayer = game.current_player === 'player1' ? 'player2' : 'player1';
  const newTurnNumber = nextPlayer === 'player1' ? game.turn_number + 1 : game.turn_number;

  const { error: gameError } = await supabase
    .from('games')
    .update({
      current_player: nextPlayer,
      actions_remaining: 2,
      turn_number: newTurnNumber
    })
    .eq('id', gameId);

  if (gameError) {
    console.error('Error ending turn:', gameError);
    return false;
  }

  const { error: unitsError } = await supabase
    .from('game_units')
    .update({
      actions_used: 0,
      has_attacked: false
    })
    .eq('game_id', gameId)
    .eq('team', nextPlayer);

  if (unitsError) {
    console.error('Error resetting units:', unitsError);
    return false;
  }

  return true;
}

export async function updateActionsRemaining(gameId: string, actions: number): Promise<boolean> {
  const { error } = await supabase
    .from('games')
    .update({ actions_remaining: actions })
    .eq('id', gameId);

  if (error) {
    console.error('Error updating actions:', error);
    return false;
  }

  return true;
}

export async function setWinner(gameId: string, winner: 'player1' | 'player2'): Promise<boolean> {
  const { error } = await supabase
    .from('games')
    .update({
      winner: winner,
      status: 'completed'
    })
    .eq('id', gameId);

  if (error) {
    console.error('Error setting winner:', error);
    return false;
  }

  return true;
}

export async function updateUnitActions(gameId: string, unitId: string, actionsUsed: number, hasAttacked: boolean): Promise<boolean> {
  const { error } = await supabase
    .from('game_units')
    .update({
      actions_used: actionsUsed,
      has_attacked: hasAttacked
    })
    .eq('game_id', gameId)
    .eq('unit_id', unitId);

  if (error) {
    console.error('Error updating unit actions:', error);
    return false;
  }

  return true;
}
