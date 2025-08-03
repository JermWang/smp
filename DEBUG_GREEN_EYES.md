# 🔍 Green Eyes Generator Debug Guide

## Quick Diagnostics

### 1. Check Environment Variables
Make sure your `.env.local` file has:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key_here
```

### 2. Test Upload Flow
1. Open your browser's **Developer Tools** (F12)
2. Go to **Console** tab
3. Try uploading an image
4. Look for specific error messages

### 3. Common Issues & Solutions

#### ❌ "Storage service error"
**Problem**: Supabase bucket not set up
**Solution**: Run this SQL in Supabase:
```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('green-eyes-images', 'green-eyes-images', true);

-- Add storage policies
INSERT INTO storage.policies (bucket_id, policy_name, definition)
VALUES 
('green-eyes-images', 'Allow public read access', '((bucket_id = ''green-eyes-images'') AND (operation = ''SELECT''))'),
('green-eyes-images', 'Allow public upload', '((bucket_id = ''green-eyes-images'') AND (operation = ''INSERT''))');
```

#### ❌ "AI service temporarily unavailable"
**Problem**: OpenAI API key missing/invalid
**Solution**: 
1. Check your OpenAI account has credits
2. Verify API key in `.env.local`
3. Restart your development server

#### ❌ "Invalid image file"
**Problem**: File format/size issues
**Solution**: 
- Use JPG or PNG files only
- Keep files under 5MB
- Avoid special characters in filename

#### ❌ "Failed to save processed image"
**Problem**: Database table missing
**Solution**: Run this SQL in Supabase:
```sql
-- Create image_generations table
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

-- Enable RLS
ALTER TABLE image_generations ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Allow read access to image_generations" ON image_generations
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow insert to image_generations" ON image_generations
  FOR INSERT TO anon WITH CHECK (true);
```

### 4. Test Commands

#### Test Supabase Connection
```javascript
// Run in browser console
fetch('/api/generate-green-eyes', {
  method: 'POST',
  body: new FormData()
}).then(r => r.json()).then(console.log)
```

#### Check Storage Bucket
```sql
-- Run in Supabase SQL Editor
SELECT * FROM storage.buckets WHERE name = 'green-eyes-images';
```

### 5. What to Look For in Console

✅ **Success logs:**
- "✅ Global stats initialized successfully"
- No storage errors
- Progress updates during upload

❌ **Error patterns:**
- "OpenAI Error Details:" = API key issue
- "Storage Error Details:" = Supabase setup issue  
- "Failed to upload original image" = Bucket permissions
- "Invalid response from server" = Database issue

## If Still Broken

1. **Copy the exact error message** from console
2. **Check which step fails**: Upload → Processing → Storage → Database
3. **Verify all environment variables** are set correctly
4. **Restart development server** after env changes
5. **Test with a simple PNG image** (like a screenshot)