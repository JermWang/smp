# Supabase Green Eyes Storage Setup

## 1. Create Image Storage Bucket

In your Supabase dashboard:

1. Go to **Storage** section
2. Create a new bucket called `green-eyes-images`
3. Make it **public** so images can be accessed directly
4. Set allowed MIME types to: `image/png, image/jpeg, image/jpg`
5. Set policies for public read access

## 2. Database Schema for Image Tracking

Run this SQL in your Supabase SQL editor:

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

-- Create policy to allow read access to everyone (for gallery features)
CREATE POLICY "Allow read access to image_generations" ON image_generations
  FOR SELECT TO anon USING (true);

-- Create policy to allow inserts (for new generations)
CREATE POLICY "Allow insert to image_generations" ON image_generations
  FOR INSERT TO anon WITH CHECK (true);

-- Enable realtime for this table (optional - for live gallery updates)
ALTER PUBLICATION supabase_realtime ADD TABLE image_generations;
```

## 3. Storage Policies

Create these policies in Supabase Storage for the `green-eyes-images` bucket:

### Allow Public Read Access
```sql
CREATE POLICY "Allow public read access" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'green-eyes-images');
```

### Allow Public Upload
```sql
CREATE POLICY "Allow public upload" ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'green-eyes-images');
```

### Allow Public Delete (Optional - for cleanup)
```sql
CREATE POLICY "Allow public delete" ON storage.objects FOR DELETE TO anon USING (bucket_id = 'green-eyes-images');
```

## 4. Environment Variables

Add to your `.env.local` file:

```
# OpenAI API Key (required for AI image processing)
OPENAI_API_KEY=your_openai_api_key_here

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 5. Initialize Storage

The storage bucket will be automatically created when first used, but you can manually create it by calling:

```typescript
import { SupabaseStorage } from '@/lib/supabase-storage'

// Call this once during app initialization
await SupabaseStorage.initializeBucket()
```

## 6. How It Works

1. **User uploads image** → Stored in `green-eyes-images/originals/`
2. **OpenAI processes image** → Result stored in `green-eyes-images/processed/`
3. **Database tracks generation** → Record saved in `image_generations` table
4. **User downloads result** → Direct access via Supabase public URLs

## 7. Features Enabled

- ✅ Image storage and retrieval
- ✅ Processing history tracking
- ✅ Public image access (for sharing)
- ✅ Automatic cleanup capabilities
- ✅ Real-time updates (optional)
- ✅ Gallery features (optional)

## 8. Security Features

- **File size limit**: 5MB maximum for faster processing and security
- **Rate limiting**: 3 requests per minute per IP address
- **Input validation**: Strict file type and content validation
- **Filename sanitization**: Removes potentially dangerous characters
- **Privacy protection**: IP addresses are hashed for anonymity
- **Error handling**: Secure error messages that don't leak information

## 9. Cost Considerations

- **Supabase Storage**: Free tier includes 1GB storage
- **OpenAI API**: Pay per image generation (~$0.02 per image)
- **Bandwidth**: Free tier includes 2GB transfer

## 9. File Format Support

**Supported formats**: JPG, PNG only
- **Why no GIF?** GIFs can cause issues with AI image processing and aren't ideal for profile pictures
- **Why no WebP?** Better compatibility with OpenAI's image editing API
- **Best practice**: Recommend users upload high-quality JPG or PNG files for best results

## 10. Optional Features

You can extend this setup with:
- Image gallery showcase
- User favorite systems
- Analytics and usage tracking
- Rate limiting for API usage
- Image optimization and resizing