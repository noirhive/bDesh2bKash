import { supabase } from '@/lib/supabase'

// Sign in with email and password
export async function signIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error('Error signing in:', error)
    throw error
  }
}

// Sign up with email and password
export async function signUp(email, password) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error('Error signing up:', error)
    throw error
  }
}

// Sign out
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      throw error
    }

    return true
  } catch (error) {
    console.error('Error signing out:', error)
    throw error
  }
}

// Get current user
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      throw error
    }

    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

// Listen to auth state changes
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback)
}

// Reset password
export async function resetPassword(email) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })

    if (error) {
      throw error
    }

    return true
  } catch (error) {
    console.error('Error resetting password:', error)
    throw error
  }
}

// Update password
export async function updatePassword(newPassword) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      throw error
    }

    return true
  } catch (error) {
    console.error('Error updating password:', error)
    throw error
  }
}

