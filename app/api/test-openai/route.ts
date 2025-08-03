import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Test if OpenAI API key is available
    const hasKey = !!process.env.OPENAI_API_KEY
    const keyLength = process.env.OPENAI_API_KEY?.length || 0
    
    return NextResponse.json({
      success: true,
      hasOpenAIKey: hasKey,
      keyLength: keyLength,
      message: hasKey ? 'OpenAI key found!' : 'No OpenAI key in environment'
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}