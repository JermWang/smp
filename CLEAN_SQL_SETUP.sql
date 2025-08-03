-- SMP Database Setup - Copy everything below this line

-- Create the global_stats table
CREATE TABLE global_stats (
  id INTEGER PRIMARY KEY,
  total_echoes BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert the initial record
INSERT INTO global_stats (id, total_echoes) VALUES (1, 0);

-- Enable RLS (Row Level Security)
ALTER TABLE global_stats ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access to everyone
CREATE POLICY "Allow read access to global_stats" ON global_stats
  FOR SELECT TO anon USING (true);

-- Create policy to allow updates to the counter
CREATE POLICY "Allow update to global_stats" ON global_stats
  FOR UPDATE TO anon USING (id = 1);

-- 🚨 IMPORTANT: Add INSERT policy for initialization
CREATE POLICY "Allow insert to global_stats" ON global_stats
  FOR INSERT TO anon WITH CHECK (id = 1);

-- Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE global_stats;

-- Create atomic increment function for better concurrent performance
CREATE OR REPLACE FUNCTION increment_global_echoes()
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_count bigint;
BEGIN
  UPDATE global_stats 
  SET total_echoes = total_echoes + 1,
      updated_at = NOW()
  WHERE id = 1
  RETURNING total_echoes INTO new_count;
  
  -- If no row was updated, insert the initial record
  IF new_count IS NULL THEN
    INSERT INTO global_stats (id, total_echoes) 
    VALUES (1, 1)
    ON CONFLICT (id) DO UPDATE SET 
      total_echoes = global_stats.total_echoes + 1,
      updated_at = NOW()
    RETURNING total_echoes INTO new_count;
  END IF;
  
  RETURN new_count;
END;
$$;