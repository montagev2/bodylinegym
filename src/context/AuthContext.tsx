import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Profile, AuthState } from '../types'
import { verifyLogin, registerOrUpgrade } from '../lib/api'
import { sanitisePhone, isValidPhone, isValidPin, sanitiseName } from '../lib/security'

interface AuthContextType extends AuthState {
  user: Profile | null // backward compatibility alias
  login: (phone: string, pin: string) => Promise<Profile>
  register: (phone: string, pin: string, name: string) => Promise<Profile>
  logout: () => void
  signOut: () => Promise<void> // backward compatibility alias
  isAdmin: boolean
  isMember: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

const STORAGE_KEY = 'bl_gym_profile'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    profile: null,
    loading: true,
    error: null,
  })

  // Restore session on mount from localStorage (Shanti Kutir pattern)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const profile = JSON.parse(raw) as Profile
        setState({ profile, loading: false, error: null })
      } else {
        setState(s => ({ ...s, loading: false }))
      }
    } catch {
      setState(s => ({ ...s, loading: false }))
    }
  }, [])

  const login = async (phone: string, pin: string): Promise<Profile> => {
    const cleanPhone = sanitisePhone(phone)
    if (!isValidPhone(cleanPhone)) throw new Error('Please enter a valid 10-digit mobile number')
    if (!isValidPin(pin)) throw new Error('PIN must be exactly 4 digits')

    setState(s => ({ ...s, loading: true, error: null }))
    try {
      const profile = await verifyLogin(cleanPhone, pin)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
      setState({ profile, loading: false, error: null })
      return profile
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed'
      setState(s => ({ ...s, loading: false, error: msg }))
      throw err
    }
  }

  const register = async (phone: string, pin: string, name: string): Promise<Profile> => {
    const cleanPhone = sanitisePhone(phone)
    const cleanName = sanitiseName(name)
    if (!isValidPhone(cleanPhone)) throw new Error('Please enter a valid 10-digit mobile number')
    if (!isValidPin(pin)) throw new Error('PIN must be exactly 4 digits')
    if (!cleanName) throw new Error('Please enter your full name')

    setState(s => ({ ...s, loading: true, error: null }))
    try {
      const profile = await registerOrUpgrade(cleanPhone, pin, cleanName)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
      setState({ profile, loading: false, error: null })
      return profile
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed'
      setState(s => ({ ...s, loading: false, error: msg }))
      throw err
    }
  }

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY)
    setState({ profile: null, loading: false, error: null })
  }

  const signOut = async () => {
    logout()
  }

  const isAdmin = state.profile?.role === 'admin'
  const isMember = state.profile?.role === 'member'

  return (
    <AuthContext.Provider
      value={{
        ...state,
        user: state.profile,
        login,
        register,
        logout,
        signOut,
        isAdmin,
        isMember,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
