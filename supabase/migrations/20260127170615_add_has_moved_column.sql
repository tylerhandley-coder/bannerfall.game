/*
  # Add has_moved Column to game_units
  
  ## Summary
  Adds a `has_moved` column to the game_units table to track whether a unit has moved this turn, enforcing the one-move-per-turn rule while allowing other actions.
  
  ## Changes
  1. Add `has_moved` boolean column to game_units table
     - Tracks if a unit has moved during the current turn
     - Default value: false
     - Allows units to attack after moving, but prevents multiple movements per turn
  
  ## Important Notes
  1. This column is reset to false at the end of each turn
  2. Unlike `actions_used`, this is a strict boolean check
  3. Units can still perform other actions (like attacking) after moving
*/

-- Add has_moved column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'game_units' AND column_name = 'has_moved'
  ) THEN
    ALTER TABLE game_units ADD COLUMN has_moved boolean NOT NULL DEFAULT false;
  END IF;
END $$;