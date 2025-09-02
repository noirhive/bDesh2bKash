import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import TransactionForm from '@/components/TransactionForm'
import TransactionTable from '@/components/TransactionTable'
import MonthYearFilter from '@/components/MonthYearFilter'
import SummaryDashboard from '@/components/SummaryDashboard'
import ThemeToggle from '@/components/ThemeToggle'
import LoginForm from '@/components/LoginForm'
import Footer from '@/components/Footer'
import { useAuth } from '@/hooks/useAuth'
import { useTransactions } from '@/hooks/useTransactions'
import logo from '@/assets/bDesh2bKash-logo.png'
import './App.css'

function App() {
  const { user, signOut, loading: authLoading } = useAuth()
  const { 
    transactions, 
    loading, 
    error, 
    addTransaction, 
    updateTransaction, 
    deleteTransaction,
    getAvailableYears,
    getFilteredTransactions
  } = useTransactions()

  const [selectedYear, setSelectedYear] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [activeTab, setActiveTab] = useState('transactions')

  const availableYears = getAvailableYears()
  const filteredTransactions = getFilteredTransactions(selectedYear, selectedMonth)

  const handleAddTransaction = async (transactionData) => {
    try {
      await addTransaction(transactionData)
    } catch (error) {
      console.error('Failed to add transaction:', error)
      throw error
    }
  }

  const handleUpdateTransaction = async (updatedTransaction) => {
    try {
      await updateTransaction(updatedTransaction)
    } catch (error) {
      console.error('Failed to update transaction:', error)
      throw error
    }
  }

  const handleDeleteTransaction = async (id) => {
    try {
      await deleteTransaction(id)
    } catch (error) {
      console.error('Failed to delete transaction:', error)
      throw error
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Failed to sign out:', error)
    }
  }

  const handleLogoClick = () => {
    setActiveTab('transactions')
    setSelectedYear('')
    setSelectedMonth('')
  }

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <img src={logo} alt="bDesh2bKash" className="h-16 w-16 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login form if user is not authenticated
  if (!user) {
    return <LoginForm />
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
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
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
              loading={loading}
              error={error}
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

