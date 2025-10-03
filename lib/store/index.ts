import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { User, Organization, Shift } from '@/lib/types'

interface AppState {
  // User state
  currentUser: User | null
  setCurrentUser: (user: User | null) => void
  
  // Organization state
  organization: Organization | null
  setOrganization: (org: Organization | null) => void
  
  // Shift state
  currentShift: Shift | null
  setCurrentShift: (shift: Shift | null) => void
  
  // UI state
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  
  // Demo mode
  isDemoMode: boolean
  setIsDemoMode: (demo: boolean) => void
  
  // Hydration state
  hasHydrated: boolean
  setHasHydrated: (hydrated: boolean) => void
  
  // Clear all persisted state (for logout)
  clearState: () => void
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // User state
      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user }),
      
      // Organization state
      organization: null,
      setOrganization: (org) => set({ organization: org }),
      
      // Shift state
      currentShift: null,
      setCurrentShift: (shift) => set({ currentShift: shift }),
      
      // UI state
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
      
      // Demo mode
      isDemoMode: true,
      setIsDemoMode: (demo) => set({ isDemoMode: demo }),
      
      // Hydration state
      hasHydrated: false,
      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),
      
      // Clear all persisted state (for logout)
      clearState: () => set({
        currentUser: null,
        organization: null,
        currentShift: null,
        isDemoMode: true,
      }),
    }),
    {
      name: 'carescribe-storage', // name of the item in storage
      storage: createJSONStorage(() => localStorage), // using localStorage
      partialize: (state) => ({ 
        currentUser: state.currentUser,
        organization: state.organization,
        currentShift: state.currentShift,
        isDemoMode: state.isDemoMode
      }), // only persist these fields
      onRehydrateStorage: () => (state) => {
        // Set hasHydrated to true when rehydration is complete
        state?.setHasHydrated(true)
      },
    }
  )
)