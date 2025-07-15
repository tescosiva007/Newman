import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface User {
  id: string
  email: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('newman_user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login for:', email)
      const { data, error } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', email)
        .eq('password', password)
        .single()

      console.log('Login response:', { data, error })

      if (error || !data) {
        return { success: false, error: 'Invalid credentials' }
      }

      const userData = { id: data.id, email: data.email }
      setUser(userData)
      localStorage.setItem('newman_user', JSON.stringify(userData))
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Login failed' }
    }
  }

  const logout = async () => {
    setUser(null)
    localStorage.removeItem('newman_user')
  }

  const value = {
    user,
    login,
    logout,
    loading
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}