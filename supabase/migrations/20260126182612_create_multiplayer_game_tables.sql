/*
  # Create Multiplayer Game Tables

  ## Summary
  Sets up the database schema for online multiplayer Bannerfall game.

  ## Tables Created
  
  ### 1. `games`
  Stores game sessions and metadata
  - `id` (uuid, primary key) - Unique game identifier
  - `game_code` (text, unique) - 6-character code for joining games
  - `player1_id` (uuid) - Player 1's user ID
  - `player2_id` (uuid, nullable) - Player 2's user ID
  - `current_player` (text) - Which player's turn it is
  - `turn_number` (integer) - Current turn number
  - `actions_remaining` (integer) - Actions left in current turn
  - `game_phase` (text) - 'setup' or 'play'
  - `winner` (text, nullable) - Winner when game ends
  - `status` (text) - 'waiting', 'active', 'completed'
  - `created_at` (timestamptz) - When game was created
  - `updated_at` (timestamptz) - Last update time

  ### 2. `game_units`
  Stores all units on the board
  - `id` (uuid, primary key) - Unique unit identifier
  - `game_id` (uuid, foreign key) - Reference to game
  - `unit_id` (text) - Game-specific unit ID
  - `type` (text) - Unit type (warlord, brute, etc.)
  - `team` (text) - player1 or player2
  - `q` (integer) - Hex coordinate q
  - `r` (integer) - Hex coordinate r
  - `hp` (integer) - Current hit points
  - `max_hp` (integer) - Maximum hit points
  - `attack` (integer) - Attack stat
  - `range` (integer, nullable) - Range stat
  - `movement` (integer) - Movement stat
  - `has_acted` (boolean) - Whether unit acted this turn
  - `effects` (jsonb) - Active effects on unit
  - `created_at` (timestamptz)

  ### 3. `game_cards`
  Stores player hands
  - `id` (uuid, primary key)
  - `game_id` (uuid, foreign key) - Reference to game
  - `player` (text) - player1 or player2
  - `card_data` (jsonb) - Card information
  - `position` (integer) - Position in hand
  - `created_at` (timestamptz)

  ### 4. `game_plateaus`
  Stores plateau positions
  - `id` (uuid, primary key)
  - `game_id` (uuid, foreign key) - Reference to game
  - `q` (integer) - Hex coordinate q
  - `r` (integer) - Hex coordinate r
  - `created_at` (timestamptz)

  ### 5. `game_logs`
  Stores game action logs
  - `id` (uuid, primary key)
  - `game_id` (uuid, foreign key) - Reference to game
  - `log_data` (jsonb) - Complete log entry
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Players can only read/write games they're part of
  - Anonymous users can create games
  - Only game participants can modify game state

  ## Important Notes
  1. Game codes are 6-character unique identifiers for easy joining
  2. Real-time subscriptions will sync game state between players
  3. JSONB fields store complex data structures efficiently
  4. Cascade deletes ensure cleanup when games are deleted
*/

-- Create games table
CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_code text UNIQUE NOT NULL,
  player1_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  player2_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  current_player text NOT NULL DEFAULT 'player1',
  turn_number integer NOT NULL DEFAULT 0,
  actions_remaining integer NOT NULL DEFAULT 2,
  game_phase text NOT NULL DEFAULT 'setup',
  winner text,
  status text NOT NULL DEFAULT 'waiting',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create game_units table
CREATE TABLE IF NOT EXISTS game_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  unit_id text NOT NULL,
  type text NOT NULL,
  team text NOT NULL,
  q integer NOT NULL,
  r integer NOT NULL,
  hp integer NOT NULL,
  max_hp integer NOT NULL,
  attack integer NOT NULL,
  range integer,
  movement integer NOT NULL,
  has_acted boolean NOT NULL DEFAULT false,
  effects jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create game_cards table
CREATE TABLE IF NOT EXISTS game_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player text NOT NULL,
  card_data jsonb NOT NULL,
  position integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create game_plateaus table
CREATE TABLE IF NOT EXISTS game_plateaus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  q integer NOT NULL,
  r integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create game_logs table
CREATE TABLE IF NOT EXISTS game_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  log_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_plateaus ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_logs ENABLE ROW LEVEL SECURITY;

-- Games policies
CREATE POLICY "Users can view their own games"
  ON games FOR SELECT
  TO authenticated
  USING (auth.uid() = player1_id OR auth.uid() = player2_id);

CREATE POLICY "Users can create games"
  ON games FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = player1_id);

CREATE POLICY "Players can update their games"
  ON games FOR UPDATE
  TO authenticated
  USING (auth.uid() = player1_id OR auth.uid() = player2_id)
  WITH CHECK (auth.uid() = player1_id OR auth.uid() = player2_id);

-- Game units policies
CREATE POLICY "Players can view units in their games"
  ON game_units FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = game_units.game_id
      AND (games.player1_id = auth.uid() OR games.player2_id = auth.uid())
    )
  );

CREATE POLICY "Players can insert units in their games"
  ON game_units FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = game_units.game_id
      AND (games.player1_id = auth.uid() OR games.player2_id = auth.uid())
    )
  );

CREATE POLICY "Players can update units in their games"
  ON game_units FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = game_units.game_id
      AND (games.player1_id = auth.uid() OR games.player2_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = game_units.game_id
      AND (games.player1_id = auth.uid() OR games.player2_id = auth.uid())
    )
  );

CREATE POLICY "Players can delete units in their games"
  ON game_units FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = game_units.game_id
      AND (games.player1_id = auth.uid() OR games.player2_id = auth.uid())
    )
  );

-- Game cards policies
CREATE POLICY "Players can view cards in their games"
  ON game_cards FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = game_cards.game_id
      AND (games.player1_id = auth.uid() OR games.player2_id = auth.uid())
    )
  );

CREATE POLICY "Players can insert cards in their games"
  ON game_cards FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = game_cards.game_id
      AND (games.player1_id = auth.uid() OR games.player2_id = auth.uid())
    )
  );

CREATE POLICY "Players can delete cards in their games"
  ON game_cards FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = game_cards.game_id
      AND (games.player1_id = auth.uid() OR games.player2_id = auth.uid())
    )
  );

-- Game plateaus policies
CREATE POLICY "Players can view plateaus in their games"
  ON game_plateaus FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = game_plateaus.game_id
      AND (games.player1_id = auth.uid() OR games.player2_id = auth.uid())
    )
  );

CREATE POLICY "Players can insert plateaus in their games"
  ON game_plateaus FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = game_plateaus.game_id
      AND (games.player1_id = auth.uid() OR games.player2_id = auth.uid())
    )
  );

CREATE POLICY "Players can delete plateaus in their games"
  ON game_plateaus FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = game_plateaus.game_id
      AND (games.player1_id = auth.uid() OR games.player2_id = auth.uid())
    )
  );

-- Game logs policies
CREATE POLICY "Players can view logs in their games"
  ON game_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = game_logs.game_id
      AND (games.player1_id = auth.uid() OR games.player2_id = auth.uid())
    )
  );

CREATE POLICY "Players can insert logs in their games"
  ON game_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = game_logs.game_id
      AND (games.player1_id = auth.uid() OR games.player2_id = auth.uid())
    )
  );

-- Create index for game code lookups
CREATE INDEX IF NOT EXISTS idx_games_game_code ON games(game_code);

-- Create index for player lookups
CREATE INDEX IF NOT EXISTS idx_games_player1 ON games(player1_id);
CREATE INDEX IF NOT EXISTS idx_games_player2 ON games(player2_id);

-- Create index for game_id foreign keys
CREATE INDEX IF NOT EXISTS idx_game_units_game_id ON game_units(game_id);
CREATE INDEX IF NOT EXISTS idx_game_cards_game_id ON game_cards(game_id);
CREATE INDEX IF NOT EXISTS idx_game_plateaus_game_id ON game_plateaus(game_id);
CREATE INDEX IF NOT EXISTS idx_game_logs_game_id ON game_logs(game_id);