import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import sharp from 'sharp'

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
    
    // Convert RGB to RGBA using Sharp for DALL-E 2 compatibility
    console.log('🔄 Converting image to RGBA format using Sharp...')
    
    const rgbaBuffer = await sharp(buffer)
      .ensureAlpha() // Add alpha channel (RGB → RGBA)
      .png() // Output as PNG
      .toBuffer()
    
    // Create File object with RGBA PNG data
    const openAIFile = new File([rgbaBuffer], 'image.png', { type: 'image/png' })
    
    console.log(`✅ Successfully converted to RGBA PNG (${rgbaBuffer.length} bytes)`)
    
    // DALL-E 2 Edit prompts - focus on ADDING elements, not describing whole scene
    const prompts = {
      // Primary: Simple additive instruction
      primary: "green glowing laser eyes with bright green laser beams",
      
      // Fallback: More specific meme reference  
      fallback: "laser eyes meme green glowing eyes beams",
      
      // Simple: Minimal keywords
      simple: "green laser eyes"
    }
    
    let response;
    let lastError;
    
    // Try primary prompt first (DALL-E 2 edit optimized for adding elements)
    try {
      console.log('🎨 Trying DALL-E 2 edit with simplified laser eyes prompt...')
      const openai = getOpenAI()
      // Try DALL-E 2 edit with proper format handling
      console.log(`📋 Sending ${openAIFile.type} file to DALL-E 2...`)
      response = await openai.images.edit({
        image: openAIFile,
        prompt: prompts.primary,
        n: 1,
        size: "1024x1024"
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
          size: "1024x1024"
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
            size: "1024x1024"
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
    console.error('❌ Error details:', error instanceof Error ? error.message : 'Unknown error')
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack')
    return NextResponse.json({ 
      error: 'Failed to generate laser eyes',
      details: error instanceof Error ? error.message : 'Unknown error',
      type: error instanceof Error ? error.constructor.name : 'Unknown'
    }, { status: 500 })
  }
}