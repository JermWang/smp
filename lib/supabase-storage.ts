import { supabase } from './supabase'

export class SupabaseStorage {
  private static BUCKET_NAME = 'green-eyes-images'

  // Initialize storage bucket (call this once during setup)
  static async initializeBucket() {
    try {
      // Check if bucket exists
      const { data: buckets, error: listError } = await supabase.storage.listBuckets()
      
      if (listError) {
        console.error('Error listing buckets:', listError)
        return false
      }

      const bucketExists = buckets?.some(bucket => bucket.name === this.BUCKET_NAME)
      
      if (!bucketExists) {
        // Create bucket if it doesn't exist
        const { error: createError } = await supabase.storage.createBucket(this.BUCKET_NAME, {
          public: true, // Make bucket public so we can access images directly
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg'],
          fileSizeLimit: 5242880 // 5MB limit for security
        })

        if (createError) {
          console.error('Error creating bucket:', createError)
          return false
        }

        console.log('Green Eyes Images bucket created successfully')
      }

      return true
    } catch (error) {
      console.error('Error initializing bucket:', error)
      return false
    }
  }

  // Upload original image
  static async uploadOriginalImage(file: File): Promise<{ success: boolean; path?: string; url?: string; error?: string }> {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `original_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `originals/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file)

      if (uploadError) {
        return { success: false, error: uploadError.message }
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath)

      return { 
        success: true, 
        path: filePath, 
        url: urlData.publicUrl 
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  // Upload processed image from URL (from OpenAI)
  static async uploadProcessedImageFromUrl(imageUrl: string, originalFileName: string): Promise<{ success: boolean; path?: string; url?: string; error?: string }> {
    try {
      // Download the image from OpenAI
      const response = await fetch(imageUrl)
      if (!response.ok) {
        throw new Error('Failed to download processed image')
      }

      const imageBuffer = await response.arrayBuffer()
      const fileName = `processed_${Date.now()}_${Math.random().toString(36).substring(2)}.png`
      const filePath = `processed/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, imageBuffer, {
          contentType: 'image/png'
        })

      if (uploadError) {
        return { success: false, error: uploadError.message }
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath)

      return { 
        success: true, 
        path: filePath, 
        url: urlData.publicUrl 
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  // Upload processed image from buffer
  static async uploadProcessedImage(imageBuffer: Buffer, originalFileName: string): Promise<{ success: boolean; path?: string; url?: string; error?: string }> {
    try {
      const fileName = `processed_${Date.now()}_${Math.random().toString(36).substring(2)}.png`
      const filePath = `processed/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, imageBuffer, {
          contentType: 'image/png'
        })

      if (uploadError) {
        return { success: false, error: uploadError.message }
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath)

      return { 
        success: true, 
        path: filePath, 
        url: urlData.publicUrl 
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  // Delete image
  static async deleteImage(path: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([path])

      return !error
    } catch (error) {
      console.error('Error deleting image:', error)
      return false
    }
  }

  // List images (for admin purposes)
  static async listImages(folder: 'originals' | 'processed' = 'processed', limit: number = 10) {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list(folder, { limit, sortBy: { column: 'created_at', order: 'desc' } })

      if (error) {
        console.error('Error listing images:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error listing images:', error)
      return []
    }
  }
}

// Database table for tracking image generations
export interface ImageGeneration {
  id: string
  original_image_path: string
  original_image_url: string
  processed_image_path: string
  processed_image_url: string
  created_at: string
  processing_method: 'openai' | 'fallback'
  user_ip?: string
}

export class ImageGenerationDB {
  // Save image generation record
  static async saveGeneration(data: Omit<ImageGeneration, 'id' | 'created_at'>): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const { data: result, error } = await supabase
        .from('image_generations')
        .insert([data])
        .select('id')
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, id: result.id }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  // Get recent generations
  static async getRecentGenerations(limit: number = 10) {
    try {
      const { data, error } = await supabase
        .from('image_generations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error getting recent generations:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error getting recent generations:', error)
      return []
    }
  }
}