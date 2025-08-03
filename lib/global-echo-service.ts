import { supabase } from './supabase'

export class GlobalEchoService {
  // Increment the global echo count - SAFE VERSION
  static async incrementGlobalEchoes(): Promise<number | null> {
    try {
      console.log('🎯 Incrementing echo count using SAFE method...')
      
      // Use the database RPC function ONLY - no fallbacks
      const { data, error } = await supabase
        .rpc('increment_global_echoes')

      if (error) {
        console.error('🚨 RPC INCREMENT FAILED - NOT using any fallback to prevent reset!')
        console.error('🚨 Error:', error)
        console.error('🚨 Your count is SAFE - just the increment failed this time.')
        return null
      }

      if (data) {
        console.log('✅ Echo count incremented successfully to:', data)
        return data
      }

      console.error('🚨 RPC returned no data - NOT using fallback to prevent reset!')
      return null

    } catch (error) {
      console.error('🚨 CRITICAL: Increment failed - NOT using fallback to prevent reset!')
      console.error('Error:', error)
      return null
    }
  }

  // Get current global echo count
  static async getGlobalEchoCount(): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('global_stats')
        .select('total_echoes')
        .eq('id', 1)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          console.warn('⚠️  Global stats table not found. Please run the SQL setup from SUPABASE_SETUP.md')
        } else {
          console.error('Error fetching global echo count:', error)
        }
        return 0
      }

      return data?.total_echoes || 0
    } catch (error) {
      console.error('Error in getGlobalEchoCount:', error)
      return 0
    }
  }

  // Subscribe to real-time updates
  static subscribeToEchoUpdates(callback: (count: number) => void) {
    const subscription = supabase
      .channel('global_stats_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'global_stats',
          filter: 'id=eq.1'
        },
        (payload) => {
          console.log('📡 Real-time echo update received:', payload.new)
          const newCount = (payload.new as any)?.total_echoes || 0
          callback(newCount)
        }
      )
      .subscribe()

    // Return a proper unsubscribe function
    return () => {
      subscription.unsubscribe()
    }
  }

  // Initialize the database (SAFE VERSION - never resets)
  static async initializeDatabase(): Promise<void> {
    try {
      // Check if table exists by trying to select from it
      const { data: existingData, error: selectError } = await supabase
        .from('global_stats')
        .select('id, total_echoes')
        .eq('id', 1)
        .single()

      if (selectError && selectError.code === 'PGRST116') {
        console.warn('⚠️  Global stats table not found. Please run the emergency restoration script.')
        console.log('💡 Run EMERGENCY_RESTORE_FINAL.sql in your Supabase SQL editor.')
        return
      }

      if (!existingData) {
        console.error('🚨 CRITICAL: Global stats record not found!')
        console.error('🚨 Please run EMERGENCY_RESTORE_FINAL.sql to restore your count.')
        console.error('🚨 The app will NOT create a new record to prevent resetting your count.')
      } else {
        console.log('✅ Global stats initialized with count:', existingData.total_echoes)
      }
    } catch (error) {
      console.error('❌ Error in initializeDatabase:', error)
      console.warn('💡 Run EMERGENCY_RESTORE_FINAL.sql to fix all database issues.')
    }
  }
}