# Multiplayer Implementation Guide

## Overview

This document explains the multiplayer system implementation for Bannerfall.

## Database Schema

The multiplayer system uses the following Supabase tables:

### `games` Table
- Tracks game state, current player, actions remaining, turn number
- Stores player decks as JSONB
- Real-time enabled for instant synchronization

### `game_units` Table
- Stores all unit positions, stats, and effects
- Updates in real-time when units move or take damage

### `game_cards` Table
- Stores each player's hand
- Updates when cards are played or cycled

### `game_plateaus` Table
- Tracks plateau positions and ownership

### `game_logs` Table
- Stores game action history

## System Architecture

### 1. Lobby System
- **CreateGame**: Generates a 6-character game code, creates database entry
- **JoinGame**: Allows Player 2 to join via game code
- **GameLobby**: Waits for both players, transitions to game when ready

### 2. Game State Synchronization

The system uses Supabase real-time subscriptions to sync state:

```typescript
// Subscribe to game updates
const channel = supabase
  .channel(`game_${gameId}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'games'
  }, handleGameUpdate)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'game_units'
  }, handleUnitsUpdate)
  .subscribe();
```

### 3. Turn Management

- Only the player whose ID matches `current_player` in the database can take actions
- Each player has 2 actions per turn (tracked in `actions_remaining`)
- When actions reach 0, turn automatically ends and switches to opponent

### 4. Action Validation

Before any action (move, attack, card cast):
1. Check if it's the player's turn (`game.current_player === playerRole`)
2. Check if actions remaining > 0
3. Execute action locally for responsiveness
4. Save to database
5. Real-time sync updates opponent's view

### 5. Card Cycling

The "Cycle" action:
1. Player discards up to 6 cards
2. Draws replacement cards from their deck (stored in `player1_deck` or `player2_deck`)
3. Updates database with new hand and remaining deck
4. Costs 1 action

### 6. Victory Condition

When a player captures the enemy flag:
1. Update `games` table with `winner` and `status='completed'`
2. Both clients detect the change via real-time subscription
3. Victory modal is displayed

## Implementation Status

### ✅ Completed
- Database schema with all necessary tables
- RLS policies for public access (no auth required)
- Real-time replication enabled
- Multiplayer service utilities (`multiplayerGame.ts`)
- Lobby components (CreateGame, JoinGame, GameLobby)
- Main menu with multiplayer options
- App routing for multiplayer flow

### 🚧 In Progress
- HexBoard multiplayer integration
  - The HexBoard component needs to be extended with:
    - Props: `gameMode`, `gameId`, `playerId`
    - Initial state loading from database
    - Real-time subscription hooks
    - Database save operations after each action
    - Turn validation

## Next Steps for Full Integration

To complete the multiplayer implementation in HexBoard:

1. **Add Props Interface**
```typescript
interface HexBoardProps {
  onBack?: () => void;
  gameMode?: 'local' | 'online';
  gameId?: string;
  playerId?: string;
}
```

2. **Add useEffect for Initial Load (Online Mode)**
- Load game state, units, cards, plateaus from database
- Determine player role (player1 or player2)
- Initialize local state

3. **Add useEffect for Real-time Subscriptions**
- Subscribe to all game tables
- Update local state when changes detected
- Handle opponent actions

4. **Add Database Save Functions**
- After unit movement: `updateUnit()`
- After attacks: `updateUnit()`, `deleteUnit()` if defeated
- After card cast: `deleteCard()`, update units
- After cycle: `cycleCards()`
- After turn end: `endTurn()`

5. **Add Turn Validation**
- Before any action, check `isMyTurn = currentPlayerInDB === myPlayerRole`
- Disable UI elements when not player's turn
- Show "Waiting for opponent..." message

## Testing Multiplayer

1. Open app in two browser windows/tabs
2. Window 1: Create Online Game
3. Copy the 6-character game code
4. Window 2: Join Online Game with the code
5. Both windows proceed through unit selection
6. Play the game - actions in one window should appear in the other instantly

## Database Operations

All database operations are in `src/services/multiplayerGame.ts`:

- `createGame()` - Create new game
- `joinGame()` - Join existing game
- `saveUnit()` - Add unit to database
- `updateUnit()` - Update unit position/stats
- `deleteUnit()` - Remove defeated unit
- `getUnits()` - Load all units
- `saveCard()` / `deleteCard()` / `getCards()` - Card operations
- `cycleCards()` - Handle card cycling
- `endTurn()` - Switch active player
- `setWinner()` - Mark game as completed

## Key Design Decisions

1. **No Authentication** - Uses anonymous player IDs stored in localStorage
2. **Public Access** - All RLS policies allow public read/write
3. **Optimistic Updates** - Actions execute locally first, then sync to DB
4. **Deck Storage** - Each player's deck stored as JSONB in games table
5. **Real-time First** - All state changes pushed via Supabase real-time
