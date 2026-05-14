import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

interface AuthStore {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isDarkMode: boolean
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
  toggleDarkMode: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isDarkMode: false,
      setAuth: (user, token) => {
        localStorage.setItem('bankflow_token', token)
        set({ user, token, isAuthenticated: true })
      },
      clearAuth: () => {
        localStorage.removeItem('bankflow_token')
        localStorage.removeItem('bankflow_user')
        set({ user: null, token: null, isAuthenticated: false })
      },
      toggleDarkMode: () => set((s) => ({ isDarkMode: !s.isDarkMode })),
    }),
    {
      name: 'bankflow_auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        isDarkMode: state.isDarkMode,
      }),
    }
  )
)
