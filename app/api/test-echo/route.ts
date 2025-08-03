import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST() {
  try {
    console.log('🔍 Testing direct database connection...')
    
    // Test 1: Direct query
    const { data, error } = await supabase
      .from('global_stats')
      .select('*')
      .eq('id', 1)
      .single()
    
    console.log('🔍 Raw Supabase response:', { data, error })
    
    return NextResponse.json({
      success: true,
      data: data,
      error: error,
      count: data?.total_echoes,
      message: 'Direct database test complete'
    })
    
  } catch (err) {
    console.error('🚨 Test API error:', err)
    return NextResponse.json({
      success: false,
      error: err,
      message: 'Test failed'
    })
  }
}