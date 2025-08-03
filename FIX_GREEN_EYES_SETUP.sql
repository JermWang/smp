-- 🚨 COMPLETE GREEN EYES GENERATOR SETUP
-- Run this entire script in your Supabase SQL Editor to fix all issues

-- Step 1: Create storage bucket (will fail silently if exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES ('green-eyes-images', 'green-eyes-images', true, 5242880, '{"image/png","image/jpeg","image/jpg"}')
ON CONFLICT (id) DO NOTHING;

-- Step 2: Create storage policies (drop and recreate to avoid conflicts)
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public upload" ON storage.objects;

CREATE POLICY "Allow public read access" ON storage.objects 
  FOR SELECT TO anon USING (bucket_id = 'green-eyes-images');

CREATE POLICY "Allow public upload" ON storage.objects 
  FOR INSERT TO anon WITH CHECK (bucket_id = 'green-eyes-images');

-- Step 3: Create image_generations table
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

-- Step 4: Enable RLS on image_generations
ALTER TABLE image_generations ENABLE ROW LEVEL SECURITY;

-- Step 5: Create database policies (drop and recreate)
DROP POLICY IF EXISTS "Allow read access to image_generations" ON image_generations;
DROP POLICY IF EXISTS "Allow insert to image_generations" ON image_generations;

CREATE POLICY "Allow read access to image_generations" ON image_generations
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow insert to image_generations" ON image_generations
  FOR INSERT TO anon WITH CHECK (true);

-- Step 6: Enable realtime (optional)
ALTER PUBLICATION supabase_realtime ADD TABLE image_generations;

-- Step 7: Verify setup
SELECT 'Storage bucket created:' as status, name, public, file_size_limit 
FROM storage.buckets WHERE name = 'green-eyes-images';

SELECT 'Database table created:' as status, table_name 
FROM information_schema.tables 
WHERE table_name = 'image_generations';

SELECT 'Setup complete! Green Eyes generator should work now.' as result;