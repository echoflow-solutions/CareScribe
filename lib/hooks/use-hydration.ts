import { useEffect } from 'react'
import { useStore } from '@/lib/store'

export function useHydration() {
  const hasHydrated = useStore((state) => state.hasHydrated)
  
  useEffect(() => {
    useStore.persist.rehydrate()
  }, [])
  
  return hasHydrated
}