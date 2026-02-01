/*
  # Remove Authentication Requirements

  ## Summary
  Updates the database schema to support anonymous gameplay without authentication.
  Players can create and join games using only game codes.

  ## Changes
  1. Drop all existing RLS policies that depend on auth
  2. Modify games table to use text fields for player IDs
  3. Create new public RLS policies
  
  ## Security Notes
  - Games are accessible via unique game codes
  - No authentication required for gameplay
  - No personal data is stored
*/

-- Drop all existing RLS policies first (they depend on the player_id columns)
DROP POLICY IF EXISTS "Users can view their own games" ON games;
DROP POLICY IF EXISTS "Users can create games" ON games;
DROP POLICY IF EXISTS "Players can update their games" ON games;

DROP POLICY IF EXISTS "Players can view units in their games" ON game_units;
DROP POLICY IF EXISTS "Players can insert units in their games" ON game_units;
DROP POLICY IF EXISTS "Players can update units in their games" ON game_units;
DROP POLICY IF EXISTS "Players can delete units in their games" ON game_units;

DROP POLICY IF EXISTS "Players can view cards in their games" ON game_cards;
DROP POLICY IF EXISTS "Players can insert cards in their games" ON game_cards;
DROP POLICY IF EXISTS "Players can delete cards in their games" ON game_cards;

DROP POLICY IF EXISTS "Players can view plateaus in their games" ON game_plateaus;
DROP POLICY IF EXISTS "Players can insert plateaus in their games" ON game_plateaus;
DROP POLICY IF EXISTS "Players can delete plateaus in their games" ON game_plateaus;

DROP POLICY IF EXISTS "Players can view logs in their games" ON game_logs;
DROP POLICY IF EXISTS "Players can insert logs in their games" ON game_logs;

-- Drop foreign key constraints
ALTER TABLE games DROP CONSTRAINT IF EXISTS games_player1_id_fkey;
ALTER TABLE games DROP CONSTRAINT IF EXISTS games_player2_id_fkey;

-- Now we can safely alter the columns
ALTER TABLE games ALTER COLUMN player1_id TYPE text USING player1_id::text;
ALTER TABLE games ALTER COLUMN player2_id TYPE text USING player2_id::text;
ALTER TABLE games ALTER COLUMN player1_id DROP NOT NULL;
ALTER TABLE games ALTER COLUMN player2_id DROP NOT NULL;

-- Create new public policies for games
CREATE POLICY "Public can view games"
  ON games FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can create games"
  ON games FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update games"
  ON games FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Create public policies for game_units
CREATE POLICY "Public can view game units"
  ON game_units FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can insert game units"
  ON game_units FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update game units"
  ON game_units FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete game units"
  ON game_units FOR DELETE
  TO public
  USING (true);

-- Create public policies for game_cards
CREATE POLICY "Public can view game cards"
  ON game_cards FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can insert game cards"
  ON game_cards FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can delete game cards"
  ON game_cards FOR DELETE
  TO public
  USING (true);

-- Create public policies for game_plateaus
CREATE POLICY "Public can view game plateaus"
  ON game_plateaus FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can insert game plateaus"
  ON game_plateaus FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can delete game plateaus"
  ON game_plateaus FOR DELETE
  TO public
  USING (true);

-- Create public policies for game_logs
CREATE POLICY "Public can view game logs"
  ON game_logs FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can insert game logs"
  ON game_logs FOR INSERT
  TO public
  WITH CHECK (true);
