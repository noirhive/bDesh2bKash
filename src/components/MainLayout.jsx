import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TransactionForm from "@/components/TransactionForm";
import TransactionTable from "@/components/TransactionTable";
import MonthYearFilter from "@/components/MonthYearFilter";
import SummaryDashboard from "@/components/SummaryDashboard";
import ThemeToggle from "@/components/ThemeToggle";
import Footer from "@/components/Footer";
import { calculateCharge } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import logo from "@/assets/bDesh2bKash-logo.png";

function MainLayout() {
  const [transactions, setTransactions] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [activeTab, setActiveTab] = useState("transactions");

  // ✅ Fetch transactions from Supabase
  useEffect(() => {
    const fetchTransactions = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (!error) setTransactions(data);
      }
    };
    fetchTransactions();
  }, []);

  // ✅ Add transaction
  const handleAddTransaction = async (transactionData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const charge =
        transactionData.debitAmount && transactionData.debitType
          ? calculateCharge(parseFloat(transactionData.debitAmount), transactionData.debitType)
          : 0;

      const { data, error } = await supabase.from("transactions").insert([
        {
          user_id: user.id,
          credit_date: transactionData.creditDate || null,
          credit_amount: transactionData.creditAmount ? parseFloat(transactionData.creditAmount) : null,
          debit_date: transactionData.debitDate || null,
          debit_amount: transactionData.debitAmount ? parseFloat(transactionData.debitAmount) : null,
          debit_type: transactionData.debitType || null,
          charge,
        },
      ]).select("*");

      if (error) throw error;
      if (data) setTransactions((prev) => [...data, ...prev]);
    } catch (error) {
      console.error("Failed to add transaction:", error.message);
    }
  };

  // ✅ Update transaction
  const handleUpdateTransaction = async (updatedTransaction) => {
    try {
      const charge =
        updatedTransaction.debit_amount && updatedTransaction.debit_type
          ? calculateCharge(parseFloat(updatedTransaction.debit_amount), updatedTransaction.debit_type)
          : 0;

      const { data, error } = await supabase
        .from("transactions")
        .update({ ...updatedTransaction, charge })
        .eq("id", updatedTransaction.id)
        .select("*");

      if (error) throw error;
      if (data) {
        setTransactions((prev) =>
          prev.map((t) => (t.id === updatedTransaction.id ? data[0] : t))
        );
      }
    } catch (error) {
      console.error("Failed to update transaction:", error.message);
    }
  };

  // ✅ Delete transaction
  const handleDeleteTransaction = async (id) => {
    try {
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) throw error;
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Failed to delete transaction:", error.message);
    }
  };

  // Year & Month filters
  const getAvailableYears = () => {
    const years = new Set();
    transactions.forEach((t) => {
      if (t.credit_date) years.add(new Date(t.credit_date).getFullYear());
      if (t.debit_date) years.add(new Date(t.debit_date).getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a);
  };

  const getFilteredTransactions = (year, month) => {
    if (!year && !month) return transactions;
    return transactions.filter((t) => {
      const creditDate = t.credit_date ? new Date(t.credit_date) : null;
      const debitDate = t.debit_date ? new Date(t.debit_date) : null;
      const matches = (date) => {
        if (!date) return false;
        const y = date.getFullYear();
        const m = date.getMonth() + 1;
        if (year && month) return y === parseInt(year) && m === parseInt(month);
        if (year) return y === parseInt(year);
        if (month) return m === parseInt(month);
        return true;
      };
      return matches(creditDate) || matches(debitDate);
    });
  };

  const filteredTransactions = getFilteredTransactions(selectedYear, selectedMonth);
  const availableYears = getAvailableYears();

  const handleLogoClick = () => {
    setActiveTab("transactions");
    setSelectedYear("");
    setSelectedMonth("");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <button
              onClick={handleLogoClick}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <img src={logo} alt="Logo" className="h-10 w-10" />
              <div className="text-left">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  bDesh2bKash
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Transaction Management System
                </p>
              </div>
            </button>

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main (Boxed Layout) */}
      <main className="flex-1">
        <div className="container mx-auto max-w-6xl px-4 py-6">
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
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default MainLayout;
