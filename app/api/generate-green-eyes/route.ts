import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { SupabaseStorage, ImageGenerationDB } from '@/lib/supabase-storage'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Rate limiting map (in production, use Redis or database)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

// Security constants
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB (reduced from 10MB)
const RATE_LIMIT_REQUESTS = 3 // max requests per window
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/jpg']

function isRateLimited(clientId: string): boolean {
  const now = Date.now()
  const userLimit = rateLimitMap.get(clientId)
  
  if (!userLimit || now > userLimit.resetTime) {
    // Reset or create new rate limit window
    rateLimitMap.set(clientId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return false
  }
  
  if (userLimit.count >= RATE_LIMIT_REQUESTS) {
    return true
  }
  
  userLimit.count++
  return false
}

function validateImageFile(file: File): { valid: boolean; error?: string } {
  console.log('🔍 Backend validation - File details:', {
    name: file.name,
    type: file.type,
    size: file.size,
    allowedTypes: ALLOWED_MIME_TYPES,
    maxSize: MAX_FILE_SIZE
  })
  
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    console.error('❌ File too large:', file.size, 'Max:', MAX_FILE_SIZE)
    return { valid: false, error: 'File size must be less than 5MB' }
  }
  
  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    // Fallback: check file extension if MIME type is wrong
    const fileExtension = file.name.toLowerCase().split('.').pop()
    const validExtensions = ['jpg', 'jpeg', 'png']
    
    if (!fileExtension || !validExtensions.includes(fileExtension)) {
      console.error('❌ Invalid MIME type AND extension:', { 
        mimeType: file.type, 
        extension: fileExtension,
        allowed: { mimeTypes: ALLOWED_MIME_TYPES, extensions: validExtensions }
      })
      return { valid: false, error: 'Only JPG and PNG files are allowed' }
    } else {
      console.warn('⚠️ MIME type mismatch but valid extension, allowing:', {
        mimeType: file.type,
        extension: fileExtension,
        fileName: file.name
      })
    }
  }
  
  // Check file name for suspicious content
  if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
    console.error('❌ Suspicious file name:', file.name)
    return { valid: false, error: 'Invalid file name' }
  }
  
  console.log('✅ Backend validation passed for:', file.name)
  
  return { valid: true }
}

function sanitizeFilename(filename: string): string {
  // Remove any potentially dangerous characters
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 100)
}

export async function POST(request: NextRequest) {
  try {
    // Get client identifier for rate limiting
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                    request.headers.get('x-real-ip') || 
                    'unknown'
    
    // Check rate limiting
    if (isRateLimited(clientIP)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait before trying again.' }, 
        { status: 429 }
      )
    }

    const formData = await request.formData()
    const imageFile = formData.get('image') as File
    
    console.log('🔍 Received file upload request:', {
      hasFile: !!imageFile,
      fileName: imageFile?.name,
      fileType: imageFile?.type,
      fileSize: imageFile?.size
    })
    
    if (!imageFile) {
      console.error('❌ No image file in form data')
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 })
    }

    // Validate file
    console.log('🔍 About to validate file:', imageFile.name)
    const validation = validateImageFile(imageFile)
    if (!validation.valid) {
      console.error('❌ File validation failed:', validation.error)
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }
    
    console.log('✅ File validation passed, proceeding with processing')

    // Initialize storage bucket if needed
    await SupabaseStorage.initializeBucket()

    // Sanitize filename before upload
    const sanitizedFile = new File([imageFile], sanitizeFilename(imageFile.name), {
      type: imageFile.type
    })

    // Upload original image to Supabase
    const originalUpload = await SupabaseStorage.uploadOriginalImage(sanitizedFile)
    if (!originalUpload.success) {
      console.error('Failed to upload original image:', originalUpload.error)
      return NextResponse.json(
        { error: 'Failed to process image' }, 
        { status: 500 }
      )
    }

    // Convert File to Buffer for OpenAI
    const bytes = await imageFile.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Validate buffer size as additional security
    if (buffer.length > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeded' }, 
        { status: 400 }
      )
    }

    // Convert buffer to File for OpenAI
    const imageBlob = new Blob([buffer], { type: imageFile.type })
    const openAIFile = new File([imageBlob], sanitizedFile.name, { type: imageFile.type })

    // Optimized prompts based on DALL-E best practices
    const prompts = {
      // Primary: Clear, direct instruction (works best)
      primary: "Add bright green laser eyes. Green laser beams shoot from the eyes.",
      
      // Fallback: Popular meme reference (clear context)
      fallback: "Green laser eyes meme effect. Glowing green eyes with laser beams.",
      
      // Last resort: Minimal but specific
      simple: "Green glowing eyes with laser beams."
    }

    let response;
    let lastError;

    // Try primary prompt first (optimized for best results)
    try {
      console.log('🎨 Trying optimized laser eyes prompt...')
      response = await openai.images.edit({
        image: openAIFile,
        prompt: prompts.primary,
        n: 1,
        size: "1024x1024",
      })
      
      if (response.data && response.data[0]?.url) {
        console.log('✅ Optimized laser eyes prompt succeeded! Should have clear green laser beams.')
      } else {
        throw new Error('Primary prompt returned no result')
      }
    } catch (error) {
      console.log('⚠️ Primary prompt failed, trying meme reference fallback...')
      lastError = error
      
      // Try fallback prompt
      try {
        response = await openai.images.edit({
          image: openAIFile,
          prompt: prompts.fallback,
          n: 1,
          size: "1024x1024",
        })
        
        if (response.data && response.data[0]?.url) {
          console.log('✅ Meme reference fallback succeeded!')
        } else {
          throw new Error('Fallback prompt returned no result')
        }
      } catch (fallbackError) {
        console.log('⚠️ Fallback failed, trying minimal approach...')
        
        // Try simple prompt as last resort
        try {
          response = await openai.images.edit({
      image: openAIFile,
            prompt: prompts.simple,
      n: 1,
      size: "1024x1024",
    })
          
          if (response.data && response.data[0]?.url) {
            console.log('✅ Minimal prompt succeeded!')
          } else {
            throw new Error('All prompts failed to generate result')
          }
        } catch (simpleError) {
          console.error('❌ All optimized prompt strategies failed')
          throw lastError // Throw the original error
        }
      }
    }

    if (!response.data || !response.data[0]?.url) {
      throw new Error('No image generated from OpenAI')
    }

    // Validate OpenAI response URL
    if (!response.data[0].url.startsWith('https://')) {
      throw new Error('Invalid response from AI service')
    }

    // Download and store the processed image in Supabase
    const generatedImageUrl = response.data[0].url
    const processedUpload = await SupabaseStorage.uploadProcessedImageFromUrl(
      generatedImageUrl, 
      sanitizedFile.name
    )

    if (!processedUpload.success) {
      console.error('Failed to upload processed image:', processedUpload.error)
      // Don't return OpenAI URL directly for security
      return NextResponse.json(
        { error: 'Failed to save processed image' }, 
        { status: 500 }
      )
    }

    // Save generation record to database (limit IP logging)
    const hashedIP = clientIP !== 'unknown' ? 
      Buffer.from(clientIP).toString('base64').substring(0, 10) : 'unknown'
    
    await ImageGenerationDB.saveGeneration({
      original_image_path: originalUpload.path!,
      original_image_url: originalUpload.url!,
      processed_image_path: processedUpload.path!,
      processed_image_url: processedUpload.url!,
      processing_method: 'openai',
      user_ip: hashedIP // Store hashed/truncated IP for privacy
    })

    // Return our stored image URL
    return NextResponse.json({ 
      imageUrl: processedUpload.url,
      success: true 
    })

  } catch (error) {
    console.error('Error generating green eyes:', error)
    
    // Provide more specific error information for debugging
    let errorMessage = 'Processing failed. Please try again.'
    let statusCode = 500
    
    if (error instanceof Error) {
      // OpenAI API errors
      if (error.message.includes('OpenAI')) {
        errorMessage = 'AI service is temporarily unavailable. Please try again.'
        console.error('OpenAI Error Details:', error)
      }
      // Supabase storage errors
      else if (error.message.includes('storage') || error.message.includes('bucket')) {
        errorMessage = 'Storage service error. Please try again.'
        console.error('Storage Error Details:', error)
      }
      // File validation errors
      else if (error.message.includes('File') || error.message.includes('image')) {
        errorMessage = 'Invalid image file. Please try a different JPG or PNG.'
        statusCode = 400
      }
      // API key errors
      else if (error.message.includes('unauthorized') || error.message.includes('API key')) {
        errorMessage = 'Service temporarily unavailable. Please try again later.'
        console.error('API Key Error - Check OPENAI_API_KEY environment variable')
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    )
  }
}

// Remove fallback function that exposes base64 data
// This was a potential security risk