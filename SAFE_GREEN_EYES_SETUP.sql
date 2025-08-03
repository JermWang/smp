-- 🛡️ 100% SAFE GREEN EYES SETUP - WILL NOT TOUCH ECHO COUNT
-- This script will ONLY set up Green Eyes generator components
-- It will NEVER modify the global_stats table or your echo count

-- ⚠️ IMPORTANT: This script does NOT touch global_stats table AT ALL!

-- Step 1: Create storage bucket for Green Eyes images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES ('green-eyes-images', 'green-eyes-images', true, 5242880, '{"image/png","image/jpeg","image/jpg"}')
ON CONFLICT (id) DO NOTHING;

-- Step 2: Create storage policies for Green Eyes bucket
DROP POLICY IF EXISTS "Allow public read access on green-eyes-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public upload on green-eyes-images" ON storage.objects;

CREATE POLICY "Allow public read access on green-eyes-images" ON storage.objects 
  FOR SELECT TO anon USING (bucket_id = 'green-eyes-images');

CREATE POLICY "Allow public upload on green-eyes-images" ON storage.objects 
  FOR INSERT TO anon WITH CHECK (bucket_id = 'green-eyes-images');

-- Step 3: Create image_generations table for tracking AI generations
CREATE TABLE IF NOT EXISTS image_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_image_path TEXT NOT NULL,
  original_image_url TEXT NOT NULL,
  processed_image_path TEXT NOT NULL,
  processed_image_url TEXT NOT NULL,
  processing_method TEXT NOT NULL DEFAULT 'openai',
  user_ip TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Enable RLS on image_generations table
ALTER TABLE image_generations ENABLE ROW LEVEL SECURITY;

-- Step 5: Create policies for image_generations table
DROP POLICY IF EXISTS "Allow read access to image_generations" ON image_generations;
DROP POLICY IF EXISTS "Allow insert to image_generations" ON image_generations;

CREATE POLICY "Allow read access to image_generations" ON image_generations
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow insert to image_generations" ON image_generations
  FOR INSERT TO anon WITH CHECK (true);

-- Step 6: Enable realtime for image_generations (optional)
ALTER PUBLICATION supabase_realtime ADD TABLE image_generations;

-- Step 7: Check your current echo count (READ ONLY - NO CHANGES)
SELECT 'Your current echo count is SAFE:' as message, total_echoes as current_count, updated_at 
FROM global_stats WHERE id = 1;

-- Step 8: Verify Green Eyes setup
SELECT 'Green Eyes storage bucket:' as status, name, public 
FROM storage.buckets WHERE name = 'green-eyes-images';

SELECT 'Green Eyes database table:' as status, table_name 
FROM information_schema.tables 
WHERE table_name = 'image_generations';

SELECT '✅ GREEN EYES SETUP COMPLETE - YOUR ECHO COUNT IS UNTOUCHED!' as result;