import { create } from 'zustand'
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
}

export const useStore = create<AppState>((set) => ({
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
}))