import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { format, parseISO } from 'date-fns'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export default function SummaryDashboard({ transactions }) {
  // Calculate overall totals
  const overallTotals = transactions.reduce((totals, transaction) => ({
    totalCredit: totals.totalCredit + (transaction.credit_amount || 0),
    totalDebit: totals.totalDebit + (transaction.debit_amount || 0),
    totalCharges: totals.totalCharges + (transaction.charge || 0)
  }), { totalCredit: 0, totalDebit: 0, totalCharges: 0 })

  const netBalance = overallTotals.totalCredit - overallTotals.totalDebit - overallTotals.totalCharges

  // Prepare data for debit type pie chart
  const debitTypeData = transactions.reduce((acc, transaction) => {
    if (transaction.debit_type && transaction.debit_amount) {
      const existing = acc.find(item => item.name === transaction.debit_type)
      if (existing) {
        existing.value += transaction.debit_amount
      } else {
        acc.push({
          name: transaction.debit_type,
          value: transaction.debit_amount
        })
      }
    }
    return acc
  }, [])

  // Prepare data for monthly comparison bar chart
  const monthlyData = transactions.reduce((acc, transaction) => {
    const date = transaction.credit_date || transaction.debit_date
    if (!date) return acc

    try {
      const monthKey = format(parseISO(date), 'yyyy-MM')
      const monthName = format(parseISO(date), 'MMM yyyy')
      
      const existing = acc.find(item => item.month === monthKey)
      if (existing) {
        existing.credit += transaction.credit_amount || 0
        existing.debit += transaction.debit_amount || 0
        existing.charges += transaction.charge || 0
      } else {
        acc.push({
          month: monthKey,
          monthName,
          credit: transaction.credit_amount || 0,
          debit: transaction.debit_amount || 0,
          charges: transaction.charge || 0
        })
      }
    } catch (error) {
      console.error('Error parsing date:', date, error)
    }
    return acc
  }, [])

  // Sort monthly data by month
  monthlyData.sort((a, b) => a.month.localeCompare(b.month))

  return (
    <div className="space-y-6">
      {/* Overall Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 currency">
              {formatCurrency(overallTotals.totalCredit)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Debit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 currency">
              {formatCurrency(overallTotals.totalDebit)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Charges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 currency">
              {formatCurrency(overallTotals.totalCharges)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold currency ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(netBalance)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Debit Types Pie Chart */}
        {debitTypeData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Debit Types Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={debitTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {debitTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Monthly Comparison Bar Chart */}
        {monthlyData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Monthly Credit vs Debit</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="monthName" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="credit" fill="#10B981" name="Credit" />
                  <Bar dataKey="debit" fill="#EF4444" name="Debit" />
                  <Bar dataKey="charges" fill="#F59E0B" name="Charges" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Monthly Summary Table */}
      {monthlyData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Month</th>
                    <th className="text-right p-2">Credit</th>
                    <th className="text-right p-2">Debit</th>
                    <th className="text-right p-2">Charges</th>
                    <th className="text-right p-2">Net Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map((month) => {
                    const monthNetBalance = month.credit - month.debit - month.charges
                    return (
                      <tr key={month.month} className="border-b">
                        <td className="p-2 font-medium">{month.monthName}</td>
                        <td className="p-2 text-right text-green-600 currency">{formatCurrency(month.credit)}</td>
                        <td className="p-2 text-right text-red-600 currency">{formatCurrency(month.debit)}</td>
                        <td className="p-2 text-right text-orange-600 currency">{formatCurrency(month.charges)}</td>
                        <td className={`p-2 text-right font-medium currency ${monthNetBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(monthNetBalance)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

