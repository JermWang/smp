import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI only when needed to avoid build-time errors
function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is required')
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

// Security constants
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/jpg']

export async function POST(request: NextRequest) {
  try {
    console.log('🎨 Green Eyes Generator API called')
    
    // Parse the uploaded file
    const formData = await request.formData()
    const imageFile = formData.get('image') as File
    
    if (!imageFile) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }
    
    // Validate file size
    if (imageFile.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large. Max 5MB allowed.' }, { status: 400 })
    }
    
    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(imageFile.type)) {
      return NextResponse.json({ error: 'Invalid file type. Use PNG or JPEG.' }, { status: 400 })
    }
    
    console.log('📤 Image received:', imageFile.name, imageFile.size, 'bytes')
    
    // Convert File to Buffer for OpenAI
    const bytes = await imageFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Convert buffer to File for OpenAI
    const imageBlob = new Blob([buffer], { type: imageFile.type })
    const openAIFile = new File([imageBlob], imageFile.name, { type: imageFile.type })
    
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
      const openai = getOpenAI()
      response = await openai.images.edit({
        image: openAIFile,
        prompt: prompts.primary,
        n: 1,
        size: "1024x1024",
      })
      
      if (response.data && response.data[0]?.url) {
        console.log('✅ Optimized laser eyes prompt succeeded!')
      } else {
        throw new Error('Primary prompt returned no result')
      }
    } catch (error) {
      console.log('⚠️ Primary prompt failed, trying meme reference fallback...')
      lastError = error
      
      // Try fallback prompt
      try {
        const openai = getOpenAI()
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
          const openai = getOpenAI()
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
    
    const resultUrl = response.data[0].url
    console.log('🎉 Green laser eyes generated successfully!')
    
    return NextResponse.json({
      success: true,
      imageUrl: resultUrl,
      message: 'Green laser eyes generated successfully! 🟢⚡'
    })
    
  } catch (error) {
    console.error('❌ Green Eyes API Error:', error)
    return NextResponse.json({ 
      error: 'Failed to generate laser eyes',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}