import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import TransactionForm from '@/components/TransactionForm'
import TransactionTable from '@/components/TransactionTable'
import MonthYearFilter from '@/components/MonthYearFilter'
import SummaryDashboard from '@/components/SummaryDashboard'
import ThemeToggle from '@/components/ThemeToggle'
import Footer from '@/components/Footer'
import { calculateCharge, exportToCSV } from '@/lib/utils'
import logo from '@/assets/bDesh2bKash-logo.png'
import './App.css'

function App() {
  const [transactions, setTransactions] = useState([])
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [activeTab, setActiveTab] = useState('transactions')

  // Get available years from transactions
  const getAvailableYears = () => {
    const years = new Set()
    transactions.forEach(transaction => {
      if (transaction.credit_date) {
        years.add(new Date(transaction.credit_date).getFullYear())
      }
      if (transaction.debit_date) {
        years.add(new Date(transaction.debit_date).getFullYear())
      }
    })
    return Array.from(years).sort((a, b) => b - a)
  }

  // Filter transactions based on selected month/year
  const getFilteredTransactions = (year, month) => {
    if (!year && !month) return transactions
    
    return transactions.filter(transaction => {
      const creditDate = transaction.credit_date ? new Date(transaction.credit_date) : null
      const debitDate = transaction.debit_date ? new Date(transaction.debit_date) : null
      
      const matchesFilter = (date) => {
        if (!date) return false
        const dateYear = date.getFullYear()
        const dateMonth = date.getMonth() + 1
        
        if (year && month) {
          return dateYear === parseInt(year) && dateMonth === parseInt(month)
        } else if (year) {
          return dateYear === parseInt(year)
        } else if (month) {
          return dateMonth === parseInt(month)
        }
        return true
      }
      
      return matchesFilter(creditDate) || matchesFilter(debitDate)
    })
  }

  const filteredTransactions = getFilteredTransactions(selectedYear, selectedMonth)
  const availableYears = getAvailableYears()

  const handleAddTransaction = async (transactionData) => {
    try {
      // Calculate charge
      const charge = transactionData.debitAmount && transactionData.debitType 
        ? calculateCharge(parseFloat(transactionData.debitAmount), transactionData.debitType)
        : 0

      const newTransaction = {
        id: Date.now(), // Simple ID for demo
        credit_date: transactionData.creditDate || null,
        credit_amount: transactionData.creditAmount ? parseFloat(transactionData.creditAmount) : null,
        debit_date: transactionData.debitDate || null,
        debit_amount: transactionData.debitAmount ? parseFloat(transactionData.debitAmount) : null,
        debit_type: transactionData.debitType || null,
        charge: charge,
        created_at: new Date().toISOString()
      }

      setTransactions(prev => [newTransaction, ...prev])
    } catch (error) {
      console.error('Failed to add transaction:', error)
      throw error
    }
  }

  const handleUpdateTransaction = async (updatedTransaction) => {
    try {
      // Recalculate charge
      const charge = updatedTransaction.debit_amount && updatedTransaction.debit_type 
        ? calculateCharge(parseFloat(updatedTransaction.debit_amount), updatedTransaction.debit_type)
        : 0

      const transactionWithCharge = {
        ...updatedTransaction,
        charge: charge
      }

      setTransactions(prev => 
        prev.map(t => t.id === updatedTransaction.id ? transactionWithCharge : t)
      )
    } catch (error) {
      console.error('Failed to update transaction:', error)
      throw error
    }
  }

  const handleDeleteTransaction = async (id) => {
    try {
      setTransactions(prev => prev.filter(t => t.id !== id))
    } catch (error) {
      console.error('Failed to delete transaction:', error)
      throw error
    }
  }

  const handleLogoClick = () => {
    setActiveTab('transactions')
    setSelectedYear('')
    setSelectedMonth('')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Clickable Logo and Title */}
            <button 
              onClick={handleLogoClick}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg p-2"
            >
              <img 
                src={logo} 
                alt="bDesh2bKash Logo" 
                className="h-10 w-10"
              />
              <div className="text-left">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  bDesh2bKash
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Transaction Management System
                </p>
              </div>
            </button>

            {/* Header Actions */}
            <div className="flex items-center space-x-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-6">
            <TransactionForm onAddTransaction={handleAddTransaction} />
            
            <MonthYearFilter
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              onYearChange={setSelectedYear}
              onMonthChange={setSelectedMonth}
              availableYears={availableYears}
              transactions={filteredTransactions}
            />

            <TransactionTable
              transactions={filteredTransactions}
              onUpdateTransaction={handleUpdateTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              loading={false}
              error={null}
            />
          </TabsContent>

          <TabsContent value="dashboard">
            <SummaryDashboard 
              transactions={filteredTransactions}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
            />
          </TabsContent>

          <TabsContent value="reports">
            <SummaryDashboard 
              transactions={filteredTransactions}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              showReports={true}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default App

