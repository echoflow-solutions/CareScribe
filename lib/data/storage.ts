import { supabase } from '@/lib/supabase/client'

export interface StorageAdapter {
  get: (key: string) => Promise<any>
  set: (key: string, value: any) => Promise<void>
  delete: (key: string) => Promise<void>
  clear: () => Promise<void>
}

class LocalStorageAdapter implements StorageAdapter {
  async get(key: string) {
    if (typeof window === 'undefined') return null
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : null
  }

  async set(key: string, value: any) {
    if (typeof window === 'undefined') return
    localStorage.setItem(key, JSON.stringify(value))
  }

  async delete(key: string) {
    if (typeof window === 'undefined') return
    localStorage.removeItem(key)
  }

  async clear() {
    if (typeof window === 'undefined') return
    localStorage.clear()
  }
}

class SupabaseAdapter implements StorageAdapter {
  async get(key: string) {
    if (!supabase) throw new Error('Supabase client not initialized')
    const { data, error } = await supabase
      .from('demo_data')
      .select('value')
      .eq('key', key)
      .single()
    
    if (error) throw error
    return data?.value
  }

  async set(key: string, value: any) {
    if (!supabase) throw new Error('Supabase client not initialized')
    const { error } = await supabase
      .from('demo_data')
      .upsert({ key, value, updated_at: new Date().toISOString() })
    
    if (error) throw error
  }

  async delete(key: string) {
    if (!supabase) throw new Error('Supabase client not initialized')
    const { error } = await supabase
      .from('demo_data')
      .delete()
      .eq('key', key)
    
    if (error) throw error
  }

  async clear() {
    if (!supabase) throw new Error('Supabase client not initialized')
    const { error } = await supabase
      .from('demo_data')
      .delete()
      .gte('id', 0)
    
    if (error) throw error
  }
}

// Export the appropriate storage adapter
export const storage: StorageAdapter = supabase 
  ? new SupabaseAdapter() 
  : new LocalStorageAdapter()