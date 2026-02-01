/*
  # Enable Realtime for Game Tables

  ## Summary
  Enables Supabase Realtime functionality for all game-related tables to allow real-time synchronization between players.

  ## Changes
  1. Sets REPLICA IDENTITY FULL on all game tables
  2. Enables realtime publication for:
     - games table (for game state updates including ready states)
     - game_units table (for unit movement and combat)
     - game_cards table (for card plays and draws)
     - game_plateaus table (for plateau captures)
     - game_logs table (for action logs)

  ## Important Notes
  - REPLICA IDENTITY FULL is required for Supabase realtime to track row changes
  - This allows clients to subscribe to postgres_changes events
  - Real-time updates will now sync immediately between players
*/

-- Enable replica identity for realtime to work
ALTER TABLE games REPLICA IDENTITY FULL;
ALTER TABLE game_units REPLICA IDENTITY FULL;
ALTER TABLE game_cards REPLICA IDENTITY FULL;
ALTER TABLE game_plateaus REPLICA IDENTITY FULL;
ALTER TABLE game_logs REPLICA IDENTITY FULL;

-- Enable realtime publication for all game tables
ALTER PUBLICATION supabase_realtime ADD TABLE games;
ALTER PUBLICATION supabase_realtime ADD TABLE game_units;
ALTER PUBLICATION supabase_realtime ADD TABLE game_cards;
ALTER PUBLICATION supabase_realtime ADD TABLE game_plateaus;
ALTER PUBLICATION supabase_realtime ADD TABLE game_logs;