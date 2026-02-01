/*
  # Update Unit Actions System

  ## Summary
  Updates the game_units table to support a two-action system where units can perform multiple actions per turn but only attack once.

  ## Changes
  1. Remove `has_acted` boolean column
  2. Add `actions_used` integer column (tracks number of actions used, max 2)
  3. Add `has_attacked` boolean column (prevents multiple attacks)

  ## Migration Details
  - Replaces single-action system with multi-action system
  - Maintains backward compatibility by providing default values
  - Existing units will have actions_used = 0 and has_attacked = false
*/

-- Remove old has_acted column if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'game_units' AND column_name = 'has_acted'
  ) THEN
    ALTER TABLE game_units DROP COLUMN has_acted;
  END IF;
END $$;

-- Add new action tracking columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'game_units' AND column_name = 'actions_used'
  ) THEN
    ALTER TABLE game_units ADD COLUMN actions_used integer NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'game_units' AND column_name = 'has_attacked'
  ) THEN
    ALTER TABLE game_units ADD COLUMN has_attacked boolean NOT NULL DEFAULT false;
  END IF;
END $$;