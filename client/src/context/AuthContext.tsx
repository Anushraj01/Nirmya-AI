import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import axios from 'axios'

interface User {
  id: string
  name: string
  email: string
  role: 'Patient' | 'Doctor' | 'Admin'
  approvalStatus?: 'pending_approval' | 'approved' | 'rejected'
}

interface AuthContextValue {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  signIn: (email: string, password: string, role: 'Patient' | 'Doctor') => Promise<void>
  register: (payload: {
    name: string
    email: string
    password: string
    role: 'Patient' | 'Doctor'
  }) => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (email: string, token: string, password: string) => Promise<void>
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
  const [accessToken, setAccessToken] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { user: User; accessToken?: string }
        setUser(parsed.user)
        setAccessToken(parsed.accessToken ?? null)
        if (parsed.accessToken) {
          api.defaults.headers.common.Authorization = `Bearer ${parsed.accessToken}`
        }
      } catch {
        localStorage.removeItem(storageKey)
      }
    }
  }, [])

  const persistSession = (nextUser: User, nextAccessToken: string | null) => {
    const payload = { user: nextUser, accessToken: nextAccessToken }
    localStorage.setItem(storageKey, JSON.stringify(payload))
    setUser(nextUser)
    setAccessToken(nextAccessToken)
    if (nextAccessToken) {
      api.defaults.headers.common.Authorization = `Bearer ${nextAccessToken}`
    } else {
      delete api.defaults.headers.common.Authorization
    }
  }

  const signIn = async (email: string, password: string, role: 'Patient' | 'Doctor') => {
    try {
      const response = await api.post('auth/login', { email, password, role })
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Login failed')
      }
      persistSession(response.data.user as User, response.data.accessToken as string)
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        throw new Error(error.response.data.message as string)
      }
      throw new Error('Login failed')
    }
  }

  const register = async (payload: { name: string; email: string; password: string; role: 'Patient' | 'Doctor' }) => {
    const response = await api.post('auth/register', payload)
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Registration failed')
    }
  }

  const forgotPassword = async (email: string) => {
    const response = await api.post('auth/forgot-password', { email })
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Unable to process password reset request')
    }
  }

  const resetPassword = async (email: string, token: string, password: string) => {
    const response = await api.post('auth/reset-password', { email, token, password })
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Unable to reset password')
    }
  }

  const logout = () => {
    localStorage.removeItem(storageKey)
    setUser(null)
    setAccessToken(null)
    delete api.defaults.headers.common.Authorization
  }

  const refreshSession = async () => {
    try {
      const response = await api.post('auth/refresh')
      if (response.data?.success) {
        persistSession(response.data.user as User, response.data.accessToken as string)
        return true
      }
    } catch {
      logout()
    }
    return false
  }

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(user),
      signIn,
      register,
      forgotPassword,
      resetPassword,
      logout,
      refreshSession,
    }),
    [accessToken, user],
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
