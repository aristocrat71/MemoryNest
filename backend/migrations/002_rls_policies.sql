-- Row Level Security (RLS) Policies for MemoryNest
-- Run this in your Supabase SQL editor after creating the tables

-- Enable RLS on both tables
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PHASE 1: Secret URL-based access (Simple)
-- ============================================

-- Boards: Allow read access to anyone (for now, we'll rely on secret_slug in app logic)
CREATE POLICY "Allow public read access to boards"
  ON boards
  FOR SELECT
  USING (true);

-- Boards: Allow insert for anyone (creating new boards)
CREATE POLICY "Allow public insert to boards"
  ON boards
  FOR INSERT
  WITH CHECK (true);

-- Boards: Allow update for anyone who knows the board
CREATE POLICY "Allow public update to boards"
  ON boards
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Items: Allow read access to all items
CREATE POLICY "Allow public read access to items"
  ON items
  FOR SELECT
  USING (true);

-- Items: Allow insert for anyone
CREATE POLICY "Allow public insert to items"
  ON items
  FOR INSERT
  WITH CHECK (true);

-- Items: Allow update for anyone
CREATE POLICY "Allow public update to items"
  ON items
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Items: Allow delete for anyone
CREATE POLICY "Allow public delete to items"
  ON items
  FOR DELETE
  USING (true);

-- ============================================
-- PHASE 2: User-based access (Uncomment when adding Supabase Auth)
-- ============================================

-- -- Drop public policies first
-- DROP POLICY "Allow public read access to boards" ON boards;
-- DROP POLICY "Allow public insert to boards" ON boards;
-- DROP POLICY "Allow public update to boards" ON boards;
-- DROP POLICY "Allow public read access to items" ON items;
-- DROP POLICY "Allow public insert to items" ON items;
-- DROP POLICY "Allow public update to items" ON items;
-- DROP POLICY "Allow public delete to items" ON items;

-- -- Boards: Users can only see their own boards
-- CREATE POLICY "Users can view their own boards"
--   ON boards
--   FOR SELECT
--   USING (auth.uid() = created_by);

-- -- Boards: Users can create boards
-- CREATE POLICY "Users can create boards"
--   ON boards
--   FOR INSERT
--   WITH CHECK (auth.uid() = created_by);

-- -- Boards: Users can update their own boards
-- CREATE POLICY "Users can update their own boards"
--   ON boards
--   FOR UPDATE
--   USING (auth.uid() = created_by);

-- -- Items: Users can view items on boards they own
-- CREATE POLICY "Users can view items on their boards"
--   ON items
--   FOR SELECT
--   USING (
--     EXISTS (
--       SELECT 1 FROM boards
--       WHERE boards.id = items.board_id
--       AND boards.created_by = auth.uid()
--     )
--   );

-- -- Items: Users can create items on their boards
-- CREATE POLICY "Users can create items on their boards"
--   ON items
--   FOR INSERT
--   WITH CHECK (
--     EXISTS (
--       SELECT 1 FROM boards
--       WHERE boards.id = items.board_id
--       AND boards.created_by = auth.uid()
--     )
--   );

-- -- Items: Users can update items on their boards
-- CREATE POLICY "Users can update items on their boards"
--   ON items
--   FOR UPDATE
--   USING (
--     EXISTS (
--       SELECT 1 FROM boards
--       WHERE boards.id = items.board_id
--       AND boards.created_by = auth.uid()
--     )
--   );

-- -- Items: Users can delete items on their boards
-- CREATE POLICY "Users can delete items on their boards"
--   ON items
--   FOR DELETE
--   USING (
--     EXISTS (
--       SELECT 1 FROM boards
--       WHERE boards.id = items.board_id
--       AND boards.created_by = auth.uid()
--     )
--   );
