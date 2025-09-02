import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Loader2, AlertCircle, User, LogOut } from 'lucide-react'
import TransactionForm from '@/components/TransactionForm'
import TransactionTable from '@/components/TransactionTable'
import MonthYearFilter from '@/components/MonthYearFilter'
import SummaryDashboard from '@/components/SummaryDashboard'
import ThemeToggle from '@/components/ThemeToggle'
import LoginForm from '@/components/LoginForm'
import { useTransactions } from '@/hooks/useTransactions'
import logo from '@/assets/bDesh2bKash-logo.png'
import './App.css'

// Simple auth state management (for demo purposes)
function useSimpleAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  const signIn = async (email, password) => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setUser({ email })
    setLoading(false)
  }

  const signOut = async () => {
    setUser(null)
  }

  return { user, loading, signIn, signOut }
}

function MainApp() {
  const { user, signOut } = useSimpleAuth()
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

  const availableYears = getAvailableYears()
  const filteredTransactions = getFilteredTransactions(selectedYear, selectedMonth)

  const handleAddTransaction = async (transactionData) => {
    try {
      await addTransaction(transactionData)
    } catch (error) {
      console.error('Failed to add transaction:', error)
    }
  }

  const handleUpdateTransaction = async (updatedTransaction) => {
    try {
      await updateTransaction(updatedTransaction)
    } catch (error) {
      console.error('Failed to update transaction:', error)
    }
  }

  const handleDeleteTransaction = async (id) => {
    try {
      await deleteTransaction(id)
    } catch (error) {
      console.error('Failed to delete transaction:', error)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Failed to sign out:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading transactions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src={logo} alt="bDesh2bKash" className="h-10 w-auto" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">bDesh2bKash</h1>
                <p className="text-sm text-muted-foreground">Transaction Management System</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              
              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem disabled>
                    <span className="text-sm text-muted-foreground font-mono">
                      {user?.email || 'demo@bdesh2bkash.com'}
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Error Alert */}
        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Tabs Navigation */}
        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            {/* Transaction Form */}
            <TransactionForm onAddTransaction={handleAddTransaction} />

            {/* Filter and Export */}
            <MonthYearFilter
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              onYearChange={setSelectedYear}
              onMonthChange={setSelectedMonth}
              transactions={transactions}
              availableYears={availableYears}
            />

            {/* Transaction Table */}
            <TransactionTable
              transactions={filteredTransactions}
              onUpdateTransaction={handleUpdateTransaction}
              onDeleteTransaction={handleDeleteTransaction}
            />
          </TabsContent>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-foreground">Financial Dashboard</h2>
              <p className="text-muted-foreground mt-2">
                Overview of your financial transactions and trends
              </p>
            </div>
            <SummaryDashboard transactions={transactions} />
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-foreground">Reports & Analytics</h2>
              <p className="text-muted-foreground mt-2">
                Detailed analysis and export options for your transactions
              </p>
            </div>
            
            {/* Filter for Reports */}
            <MonthYearFilter
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              onYearChange={setSelectedYear}
              onMonthChange={setSelectedMonth}
              transactions={transactions}
              availableYears={availableYears}
            />

            {/* Filtered Dashboard */}
            <SummaryDashboard transactions={filteredTransactions} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; 2025 bDesh2bKash. Built with React and Supabase.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function App() {
  const { user, loading, signIn } = useSimpleAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm onSignIn={signIn} />
  }

  return <MainApp />
}

export default App

