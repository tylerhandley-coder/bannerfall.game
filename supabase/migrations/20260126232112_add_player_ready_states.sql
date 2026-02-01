/*
  # Add Player Ready States

  1. Changes
    - Add `player1_ready` boolean field to track when player 1 is ready
    - Add `player2_ready` boolean field to track when player 2 is ready
    - Both default to false
  
  2. Notes
    - These fields are used during setup phase to ensure both players are ready before starting
    - Game only transitions to play phase when both players have marked ready
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'player1_ready'
  ) THEN
    ALTER TABLE games ADD COLUMN player1_ready boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'player2_ready'
  ) THEN
    ALTER TABLE games ADD COLUMN player2_ready boolean DEFAULT false;
  END IF;
END $$;