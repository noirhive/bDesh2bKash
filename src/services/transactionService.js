import { supabase } from '@/lib/supabase'

// Create transactions table if it doesn't exist
export async function initializeDatabase() {
  try {
    // Check if table exists by trying to select from it
    const { data, error } = await supabase
      .from('transactions')
      .select('id')
      .limit(1)
    
    if (error && error.code === '42P01') {
      // Table doesn't exist, create it
      console.log('Creating transactions table...')
      // Note: In a real app, you would create the table through Supabase dashboard
      // For now, we'll just log this and assume the table will be created manually
      console.log('Please create the transactions table in Supabase dashboard with the following schema:')
      console.log(`
        CREATE TABLE transactions (
          id BIGSERIAL PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          credit_date DATE,
          credit_amount DECIMAL(10,2),
          debit_date DATE,
          debit_amount DECIMAL(10,2),
          debit_type TEXT,
          charge DECIMAL(10,2),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `)
    }
  } catch (error) {
    console.error('Error initializing database:', error)
  }
}

// Get current user's transactions
export async function getTransactions() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching transactions:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getTransactions:', error)
    return []
  }
}

// Add a new transaction for the current user
export async function addTransaction(transaction) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    const transactionWithUser = {
      ...transaction,
      user_id: user.id
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert([transactionWithUser])
      .select()

    if (error) {
      console.error('Error adding transaction:', error)
      throw error
    }

    return data[0]
  } catch (error) {
    console.error('Error in addTransaction:', error)
    throw error
  }
}

// Update a transaction (only if it belongs to the current user)
export async function updateTransaction(id, updates) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()

    if (error) {
      console.error('Error updating transaction:', error)
      throw error
    }

    return data[0]
  } catch (error) {
    console.error('Error in updateTransaction:', error)
    throw error
  }
}

// Delete a transaction (only if it belongs to the current user)
export async function deleteTransaction(id) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting transaction:', error)
      throw error
    }

    return true
  } catch (error) {
    console.error('Error in deleteTransaction:', error)
    throw error
  }
}

// Get transactions for a specific month/year (user-specific)
export async function getTransactionsByMonth(year, month) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    const startDate = `${year}-${month}-01`
    const endDate = `${year}-${month}-31`

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .or(`credit_date.gte.${startDate},debit_date.gte.${startDate}`)
      .or(`credit_date.lte.${endDate},debit_date.lte.${endDate}`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching transactions by month:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getTransactionsByMonth:', error)
    return []
  }
}

// Get transactions for a specific year (user-specific)
export async function getTransactionsByYear(year) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    const startDate = `${year}-01-01`
    const endDate = `${year}-12-31`

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .or(`credit_date.gte.${startDate},debit_date.gte.${startDate}`)
      .or(`credit_date.lte.${endDate},debit_date.lte.${endDate}`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching transactions by year:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getTransactionsByYear:', error)
    return []
  }
}

