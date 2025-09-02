import { createContext, useContext, useState, useEffect } from 'react'
import { 
  signIn, 
  signUp, 
  signOut, 
  getCurrentUser, 
  onAuthStateChange,
  resetPassword,
  updatePassword 
} from '@/services/authService'

// Create Auth Context
const AuthContext = createContext({})

// Auth Provider Component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Get initial user
    getCurrentUser().then(user => {
      setUser(user)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignIn = async (email, password) => {
    try {
      setError(null)
      setLoading(true)
      const data = await signIn(email, password)
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (email, password) => {
    try {
      setError(null)
      setLoading(true)
      const data = await signUp(email, password)
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      setError(null)
      await signOut()
      setUser(null)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const handleResetPassword = async (email) => {
    try {
      setError(null)
      await resetPassword(email)
      return true
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const handleUpdatePassword = async (newPassword) => {
    try {
      setError(null)
      await updatePassword(newPassword)
      return true
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const value = {
    user,
    loading,
    error,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    resetPassword: handleResetPassword,
    updatePassword: handleUpdatePassword,
    clearError: () => setError(null)
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

