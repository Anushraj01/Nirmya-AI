import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import axios from 'axios'

interface User {
  id: string
  name: string
  email: string
  role: 'Patient' | 'Doctor' | 'Admin'
}

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  login: (user: User, accessToken: string, refreshToken: string) => void
  logout: () => void
  refreshSession: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const storageKey = 'nirmya-auth'

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { user: User }
        setUser(parsed.user)
      } catch {
        localStorage.removeItem(storageKey)
      }
    }
  }, [])

  const login = (nextUser: User, _accessToken: string, _refreshToken: string) => {
    localStorage.setItem(storageKey, JSON.stringify({ user: nextUser }))
    setUser(nextUser)
  }

  const logout = () => {
    localStorage.removeItem(storageKey)
    setUser(null)
  }

  const refreshSession = async () => {
    try {
      const response = await api.post('/auth/refresh')
      if (response.data?.success) {
        const nextUser = response.data.user as User
        localStorage.setItem(storageKey, JSON.stringify({ user: nextUser }))
        setUser(nextUser)
        return true
      }
    } catch {
      logout()
    }
    return false
  }

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), login, logout, refreshSession }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider')
  }
  return context
}
