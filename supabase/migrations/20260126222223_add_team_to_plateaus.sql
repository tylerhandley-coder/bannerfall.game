/*
  # Add team field to game_plateaus table

  ## Changes
  1. Add team column to game_plateaus table
    - Adds `team` column (text) to track which player placed each plateau
    - Values: 'player1' or 'player2'
    - Default: NULL (for backwards compatibility with existing data)
  
  ## Notes
  - This allows proper tracking of plateau counts per team
  - Fixes issue where plateau counts reset after page refresh
  - Existing plateau data will have NULL team values initially
*/

-- Add team column to game_plateaus table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'game_plateaus' AND column_name = 'team'
  ) THEN
    ALTER TABLE game_plateaus ADD COLUMN team text;
  END IF;
END $$;