import { useState, useEffect } from 'react'
import { 
  getTransactions, 
  addTransaction, 
  updateTransaction, 
  deleteTransaction,
  initializeDatabase 
} from '@/services/transactionService'

export function useTransactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load transactions on component mount
  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Initialize database first
      await initializeDatabase()
      
      // Then load transactions
      const data = await getTransactions()
      setTransactions(data)
    } catch (err) {
      console.error('Error loading transactions:', err)
      setError('Failed to load transactions. Please check your internet connection.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddTransaction = async (transactionData) => {
    try {
      setError(null)
      const newTransaction = await addTransaction(transactionData)
      setTransactions(prev => [newTransaction, ...prev])
      return newTransaction
    } catch (err) {
      console.error('Error adding transaction:', err)
      setError('Failed to add transaction. Please try again.')
      throw err
    }
  }

  const handleUpdateTransaction = async (updatedTransaction) => {
    try {
      setError(null)
      const updated = await updateTransaction(updatedTransaction.id, updatedTransaction)
      setTransactions(prev => 
        prev.map(t => t.id === updatedTransaction.id ? updated : t)
      )
      return updated
    } catch (err) {
      console.error('Error updating transaction:', err)
      setError('Failed to update transaction. Please try again.')
      throw err
    }
  }

  const handleDeleteTransaction = async (id) => {
    try {
      setError(null)
      await deleteTransaction(id)
      setTransactions(prev => prev.filter(t => t.id !== id))
      return true
    } catch (err) {
      console.error('Error deleting transaction:', err)
      setError('Failed to delete transaction. Please try again.')
      throw err
    }
  }

  // Get available years from transactions
  const getAvailableYears = () => {
    const years = new Set()
    transactions.forEach(transaction => {
      const date = transaction.credit_date || transaction.debit_date
      if (date) {
        const year = date.split('-')[0]
        years.add(year)
      }
    })
    return Array.from(years).sort((a, b) => b.localeCompare(a))
  }

  // Filter transactions by year and month
  const getFilteredTransactions = (selectedYear, selectedMonth) => {
    if (!selectedYear && !selectedMonth) {
      return transactions
    }

    return transactions.filter(transaction => {
      const date = transaction.credit_date || transaction.debit_date
      if (!date) return false

      const [year, month] = date.split('-')
      
      if (selectedYear && year !== selectedYear) return false
      if (selectedMonth && month !== selectedMonth) return false
      
      return true
    })
  }

  return {
    transactions,
    loading,
    error,
    loadTransactions,
    addTransaction: handleAddTransaction,
    updateTransaction: handleUpdateTransaction,
    deleteTransaction: handleDeleteTransaction,
    getAvailableYears,
    getFilteredTransactions
  }
}

