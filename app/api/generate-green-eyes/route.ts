import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

// Security constants
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/jpg']

export async function POST(request: NextRequest) {
  try {
    console.log('🎨 Manual Green Eyes Generator API called')
    
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
    
    // Convert File to Buffer for processing
    const bytes = await imageFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Process image while preserving quality and dimensions
    console.log('🔄 Processing image with Sharp (preserving original quality)...')
    
    // Get original image metadata to preserve dimensions
    const metadata = await sharp(buffer).metadata()
    console.log(`📐 Original image dimensions: ${metadata.width}x${metadata.height}`)
    
    // Process the image without compression, maintaining original format and quality
    const processedBuffer = await sharp(buffer)
      .png({ 
        quality: 100, // Maximum quality
        compressionLevel: 0, // No compression
        force: false // Don't force PNG if original was JPEG
      })
      .toBuffer()
    
    console.log(`✅ Image processed successfully (${processedBuffer.length} bytes)`)
    
    // Convert buffer to base64 data URL for immediate use
    const base64 = processedBuffer.toString('base64')
    const mimeType = metadata.format === 'jpeg' ? 'image/jpeg' : 'image/png'
    const dataUrl = `data:${mimeType};base64,${base64}`
    
    console.log('🎉 Manual green eyes generator ready!')
    
    return NextResponse.json({
      success: true,
      imageUrl: dataUrl,
      originalDimensions: {
        width: metadata.width,
        height: metadata.height
      },
      message: 'Image ready for manual green laser eyes editing! 🟢⚡'
    })
    
  } catch (error) {
    console.error('❌ Manual Green Eyes API Error:', error)
    console.error('❌ Error details:', error instanceof Error ? error.message : 'Unknown error')
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack')
    return NextResponse.json({ 
      error: 'Failed to process image',
      details: error instanceof Error ? error.message : 'Unknown error',
      type: error instanceof Error ? error.constructor.name : 'Unknown'
    }, { status: 500 })
  }
}