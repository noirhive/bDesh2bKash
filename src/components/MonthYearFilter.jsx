import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Download } from 'lucide-react'
import { exportToCSV } from '@/lib/utils'

const months = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' }
]

export default function MonthYearFilter({ 
  selectedYear, 
  selectedMonth, 
  onYearChange, 
  onMonthChange, 
  transactions,
  availableYears 
}) {
  const handleDownloadMonthCSV = () => {
    if (!selectedYear || !selectedMonth) {
      alert('Please select both year and month to download monthly data')
      return
    }

    const monthKey = `${selectedYear}-${selectedMonth}`
    const filteredTransactions = transactions.filter(transaction => {
      const date = transaction.credit_date || transaction.debit_date
      if (!date) return false
      return date.startsWith(monthKey)
    })

    if (filteredTransactions.length === 0) {
      alert('No transactions found for the selected month')
      return
    }

    const monthName = months.find(m => m.value === selectedMonth)?.label
    const filename = `bDesh2bKash_${monthName}_${selectedYear}.csv`
    exportToCSV(filteredTransactions, filename)
  }

  const handleDownloadYearCSV = () => {
    if (!selectedYear) {
      alert('Please select a year to download yearly data')
      return
    }

    const filteredTransactions = transactions.filter(transaction => {
      const date = transaction.credit_date || transaction.debit_date
      if (!date) return false
      return date.startsWith(selectedYear)
    })

    if (filteredTransactions.length === 0) {
      alert('No transactions found for the selected year')
      return
    }

    const filename = `bDesh2bKash_${selectedYear}.csv`
    exportToCSV(filteredTransactions, filename)
  }

  const handleShowAll = () => {
    onYearChange('')
    onMonthChange('')
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Filter & Export</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Year</label>
              <Select value={selectedYear} onValueChange={onYearChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map(year => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Month</label>
              <Select value={selectedMonth} onValueChange={onMonthChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Actions</label>
              <Button 
                variant="outline" 
                onClick={handleShowAll}
                className="w-full"
              >
                Show All
              </Button>
            </div>
          </div>

          {/* Export Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={handleDownloadMonthCSV}
              className="flex items-center gap-2"
              disabled={!selectedYear || !selectedMonth}
            >
              <Download className="h-4 w-4" />
              Download Month CSV
            </Button>
            
            <Button 
              onClick={handleDownloadYearCSV}
              variant="outline"
              className="flex items-center gap-2"
              disabled={!selectedYear}
            >
              <Download className="h-4 w-4" />
              Download Year CSV
            </Button>
          </div>

          {/* Filter Status */}
          {(selectedYear || selectedMonth) && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Active Filter:</strong> 
                {selectedYear && ` Year: ${selectedYear}`}
                {selectedMonth && ` Month: ${months.find(m => m.value === selectedMonth)?.label}`}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

