/*
  # Add has_cast Column to game_units

  ## Summary
  Adds a `has_cast` column to the game_units table to track whether a unit has cast a card this turn. Casting no longer consumes actions, but is limited to one cast per turn per unit.

  ## Changes
  1. Add `has_cast` boolean column to game_units table
     - Tracks if a unit has cast a card during the current turn
     - Default value: false
     - Resets to false at the start of each turn

  ## Notes
  - This separates card casting from the action system
  - Units can now move, attack, and cast in the same turn
  - But each unit can only cast one card per turn
*/

-- Add has_cast column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'game_units' AND column_name = 'has_cast'
  ) THEN
    ALTER TABLE game_units ADD COLUMN has_cast boolean NOT NULL DEFAULT false;
  END IF;
END $$;