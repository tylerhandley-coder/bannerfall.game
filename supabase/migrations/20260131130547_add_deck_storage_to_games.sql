/*
  # Add Deck Storage to Games Table

  ## Summary
  Adds deck storage to the games table to track each player's remaining deck cards for the card cycling mechanic.

  ## Changes
  1. Add `player1_deck` JSONB column to store Player 1's deck
  2. Add `player2_deck` JSONB column to store Player 2's deck
  
  ## Important Notes
  - Decks are stored as JSONB arrays containing card data
  - When cards are cycled (discard 3, draw 3), the deck is updated in the database
  - Empty decks are represented as empty arrays []
  - Default value is an empty array for new games
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'player1_deck'
  ) THEN
    ALTER TABLE games ADD COLUMN player1_deck jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'player2_deck'
  ) THEN
    ALTER TABLE games ADD COLUMN player2_deck jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;
