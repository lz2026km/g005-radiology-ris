import { create } from 'zustand'

export interface MobileState {
  isOnline: boolean
  authToken: string | null
  isAuthenticated: boolean
  currentRole: 'doctor' | 'tech' | 'nurse' | null
  unreadNotifications: number
  darkMode: boolean
}

export interface MobileActions {
  setOnline: (online: boolean) => void
  setAuthToken: (token: string | null) => void
  setCurrentRole: (role: MobileState['currentRole']) => void
  setUnreadNotifications: (count: number) => void
  toggleDarkMode: () => void
  logout: () => void
}

export type MobileStore = MobileState & MobileActions

const initialState: MobileState = {
  isOnline: navigator.onLine,
  authToken: null,
  isAuthenticated: false,
  currentRole: null,
  unreadNotifications: 0,
  darkMode: false,
}

export const useMobileStore = create<MobileStore>((set) => ({
  ...initialState,
  setOnline: (online) => set({ isOnline: online }),
  setAuthToken: (token) => set({ authToken: token, isAuthenticated: !!token }),
  setCurrentRole: (role) => set({ currentRole: role }),
  setUnreadNotifications: (count) => set({ unreadNotifications: count }),
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  logout: () => set({ authToken: null, isAuthenticated: false, currentRole: null }),
}))
