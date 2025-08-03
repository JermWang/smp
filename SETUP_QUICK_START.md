# 🚀 SMP Quick Start Setup Guide

If you're seeing database errors in the console, you need to set up your Supabase database first!

## ⚠️ Common Error Messages:
- "Global stats table not found"
- "RPC function not found" 
- "Error initializing database"

## 🔧 Quick Fix (2 minutes):

### 1. Set up Supabase Environment
Make sure you have a `.env.local` file with:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key_here
```

### 2. Run the SQL Setup
Copy and paste this SQL into your **Supabase SQL Editor**:

```sql
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
```

### 3. Optional: Green Eyes Generator
If you want to use the Green Eyes PFP generator, also run:

```sql
-- Create the image_generations table
CREATE TABLE image_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_image_path TEXT NOT NULL,
  original_image_url TEXT NOT NULL,
  processed_image_path TEXT NOT NULL,
  processed_image_url TEXT NOT NULL,
  processing_method TEXT NOT NULL DEFAULT 'openai',
  user_ip TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE image_generations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow read access to image_generations" ON image_generations
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow insert to image_generations" ON image_generations
  FOR INSERT TO anon WITH CHECK (true);
```

### 4. Create Storage Bucket
1. Go to **Storage** in your Supabase dashboard
2. Create a bucket called `green-eyes-images`
3. Make it **public**
4. Add these storage policies:

```sql
CREATE POLICY "Allow public read access" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'green-eyes-images');
CREATE POLICY "Allow public upload" ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'green-eyes-images');
```

## ✅ That's it!

Refresh your app and the errors should be gone. You'll see:
- ✅ Global echo counter working
- ✅ Green Eyes generator working (if you added the OpenAI key)
- ✅ No more console errors

## 📚 Need More Help?

Check out the detailed setup files:
- `SUPABASE_SETUP.md` - Full echo tracking setup
- `SUPABASE_GREEN_EYES_SETUP.md` - Green eyes generator setup