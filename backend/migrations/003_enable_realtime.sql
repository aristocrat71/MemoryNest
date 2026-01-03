-- Enable Realtime for MemoryNest
-- Run this in your Supabase SQL editor

-- Enable Realtime on items table
ALTER PUBLICATION supabase_realtime ADD TABLE items;

-- Optional: Enable Realtime on boards table if you want to sync board metadata changes
ALTER PUBLICATION supabase_realtime ADD TABLE boards;

-- Note: You may also need to enable Realtime in the Supabase Dashboard:
-- 1. Go to Database > Replication
-- 2. Enable Realtime for 'items' and 'boards' tables
