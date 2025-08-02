import { supabase, isSupabaseConfigured } from './supabase'

export class GlobalEchoService {
  // Check if service is available
  static isAvailable(): boolean {
    return isSupabaseConfigured && supabase !== null
  }

  // Increment the global echo count
  static async incrementGlobalEchoes(): Promise<number | null> {
    if (!this.isAvailable()) {
      console.warn('Supabase not configured, skipping global echo increment')
      return null
    }

    try {
      // Use RPC function for atomic increment (safer for concurrent users)
      const { data, error } = await supabase!
        .rpc('increment_global_echoes')

      if (error) {
        // Fallback to manual increment if RPC fails
        console.warn('RPC increment failed, using fallback:', error)
        return await this.incrementGlobalEchoesFallback()
      }

      return data
    } catch (error) {
      console.error('Error in incrementGlobalEchoes:', error)
      return await this.incrementGlobalEchoesFallback()
    }
  }

  // Fallback increment method
  private static async incrementGlobalEchoesFallback(): Promise<number | null> {
    if (!this.isAvailable()) {
      return null
    }

    try {
      // First, get the current count
      const { data: currentData, error: fetchError } = await supabase!
        .from('global_stats')
        .select('total_echoes')
        .eq('id', 1)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching current count:', fetchError)
        return null
      }

      const currentCount = currentData?.total_echoes || 0
      const newCount = currentCount + 1

      // Update the count
      const { data, error } = await supabase!
        .from('global_stats')
        .upsert({ 
          id: 1, 
          total_echoes: newCount,
          updated_at: new Date().toISOString()
        })
        .select('total_echoes')
        .single()

      if (error) {
        console.error('Error incrementing global echoes:', error)
        return null
      }

      return data.total_echoes
    } catch (error) {
      console.error('Error in incrementGlobalEchoesFallback:', error)
      return null
    }
  }

  // Get current global echo count
  static async getGlobalEchoCount(): Promise<number> {
    if (!this.isAvailable()) {
      return 0
    }

    try {
      const { data, error } = await supabase!
        .from('global_stats')
        .select('total_echoes')
        .eq('id', 1)
        .single()

      if (error) {
        console.error('Error fetching global echo count:', error)
        return 0
      }

      return data?.total_echoes || 0
    } catch (error) {
      console.error('Error in getGlobalEchoCount:', error)
      return 0
    }
  }

  // Subscribe to real-time updates
  static subscribeToGlobalEchoes(callback: (count: number) => void) {
    if (!this.isAvailable()) {
      console.warn('Supabase not configured, real-time updates disabled')
      return () => {} // Return empty unsubscribe function
    }

    const channel = supabase!
      .channel('global_stats_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'global_stats',
          filter: 'id=eq.1'
        },
        (payload) => {
          if (payload.new && typeof payload.new === 'object' && 'total_echoes' in payload.new) {
            callback(payload.new.total_echoes as number)
          }
        }
      )
      .subscribe()

    return () => {
      supabase!.removeChannel(channel)
    }
  }

  // Initialize the database (call this once)
  static async initializeDatabase(): Promise<void> {
    if (!this.isAvailable()) {
      console.warn('Supabase not configured, skipping database initialization')
      return
    }

    try {
      const { error } = await supabase!
        .from('global_stats')
        .upsert({ 
          id: 1, 
          total_echoes: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error initializing database:', error)
      }
    } catch (error) {
      console.error('Error in initializeDatabase:', error)
    }
  }
} 