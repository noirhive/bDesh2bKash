import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Pencil, Trash2 } from 'lucide-react'
import { formatDate, formatCurrency, calculateCharge } from '@/lib/utils'
import { format, parseISO } from 'date-fns'

const debitTypes = [
  'Cash Out',
  'Send Money', 
  'Mobile Recharge',
  'Bill Payment',
  'Merchant Payment',
  'Other'
]

export default function TransactionTable({ transactions, onUpdateTransaction, onDeleteTransaction }) {
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [editFormData, setEditFormData] = useState({})
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // Group transactions by month
  const groupedTransactions = transactions.reduce((groups, transaction) => {
    const date = transaction.credit_date || transaction.debit_date
    if (!date) return groups
    
    try {
      const monthKey = format(parseISO(date), 'yyyy-MM')
      if (!groups[monthKey]) {
        groups[monthKey] = []
      }
      groups[monthKey].push(transaction)
    } catch (error) {
      console.error('Error parsing date:', date, error)
    }
    return groups
  }, {})

  // Sort months in descending order (newest first)
  const sortedMonths = Object.keys(groupedTransactions).sort((a, b) => b.localeCompare(a))

  const calculateMonthTotals = (monthTransactions) => {
    return monthTransactions.reduce((totals, transaction) => ({
      totalCredit: totals.totalCredit + (transaction.credit_amount || 0),
      totalDebit: totals.totalDebit + (transaction.debit_amount || 0),
      totalCharges: totals.totalCharges + (transaction.charge || 0)
    }), { totalCredit: 0, totalDebit: 0, totalCharges: 0 })
  }

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction)
    setEditFormData({
      creditDate: transaction.credit_date || '',
      creditAmount: transaction.credit_amount || '',
      debitDate: transaction.debit_date || '',
      debitAmount: transaction.debit_amount || '',
      debitType: transaction.debit_type || ''
    })
    setIsEditDialogOpen(true)
  }

  const handleEditSubmit = (e) => {
    e.preventDefault()
    
    const updatedTransaction = {
      ...editingTransaction,
      credit_date: editFormData.creditDate || null,
      credit_amount: parseFloat(editFormData.creditAmount) || null,
      debit_date: editFormData.debitDate || null,
      debit_amount: parseFloat(editFormData.debitAmount) || null,
      debit_type: editFormData.debitType || null,
      charge: calculateCharge(parseFloat(editFormData.debitAmount) || 0, editFormData.debitType)
    }

    onUpdateTransaction(updatedTransaction)
    setIsEditDialogOpen(false)
    setEditingTransaction(null)
    setEditFormData({})
  }

  const handleDelete = (transaction) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      onDeleteTransaction(transaction.id)
    }
  }

  const handleEditInputChange = (field, value) => {
    setEditFormData(prev => ({ ...prev, [field]: value }))
  }

  if (transactions.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No transactions found. Add your first transaction above.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full space-y-6">
      {sortedMonths.map(monthKey => {
        const monthTransactions = groupedTransactions[monthKey]
        const totals = calculateMonthTotals(monthTransactions)
        const netBalance = totals.totalCredit - totals.totalDebit - totals.totalCharges
        const monthName = format(parseISO(monthKey + '-01'), 'MMMM yyyy')

        return (
          <Card key={monthKey} className="w-full">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{monthName}</span>
                <span className={`text-sm ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  Net Balance: {formatCurrency(netBalance)}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Credit Date</TableHead>
                      <TableHead>Credit Amount</TableHead>
                      <TableHead>Debit Date</TableHead>
                      <TableHead>Debit Amount</TableHead>
                      <TableHead>Debit Type</TableHead>
                      <TableHead>Charge</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{transaction.credit_date ? formatDate(transaction.credit_date) : '-'}</TableCell>
                        <TableCell className="text-green-600 font-medium">
                          {transaction.credit_amount ? formatCurrency(transaction.credit_amount) : '-'}
                        </TableCell>
                        <TableCell>{transaction.debit_date ? formatDate(transaction.debit_date) : '-'}</TableCell>
                        <TableCell className="text-red-600 font-medium">
                          {transaction.debit_amount ? formatCurrency(transaction.debit_amount) : '-'}
                        </TableCell>
                        <TableCell>{transaction.debit_type || '-'}</TableCell>
                        <TableCell className="text-orange-600 font-medium">
                          {transaction.charge ? formatCurrency(transaction.charge) : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(transaction)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(transaction)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Month Totals */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Total Credit: </span>
                    <span className="text-green-600 font-bold">{formatCurrency(totals.totalCredit)}</span>
                  </div>
                  <div>
                    <span className="font-medium">Total Debit: </span>
                    <span className="text-red-600 font-bold">{formatCurrency(totals.totalDebit)}</span>
                  </div>
                  <div>
                    <span className="font-medium">Total Charges: </span>
                    <span className="text-orange-600 font-bold">{formatCurrency(totals.totalCharges)}</span>
                  </div>
                  <div>
                    <span className="font-medium">Net Balance: </span>
                    <span className={`font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(netBalance)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Credit Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-green-600">Credit</h3>
                <div className="space-y-2">
                  <Label htmlFor="editCreditDate">Credit Date</Label>
                  <Input
                    id="editCreditDate"
                    type="date"
                    value={editFormData.creditDate}
                    onChange={(e) => handleEditInputChange('creditDate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editCreditAmount">Credit Amount (BDT)</Label>
                  <Input
                    id="editCreditAmount"
                    type="number"
                    step="0.01"
                    value={editFormData.creditAmount}
                    onChange={(e) => handleEditInputChange('creditAmount', e.target.value)}
                  />
                </div>
              </div>

              {/* Debit Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-red-600">Debit</h3>
                <div className="space-y-2">
                  <Label htmlFor="editDebitDate">Debit Date</Label>
                  <Input
                    id="editDebitDate"
                    type="date"
                    value={editFormData.debitDate}
                    onChange={(e) => handleEditInputChange('debitDate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editDebitAmount">Debit Amount (BDT)</Label>
                  <Input
                    id="editDebitAmount"
                    type="number"
                    step="0.01"
                    value={editFormData.debitAmount}
                    onChange={(e) => handleEditInputChange('debitAmount', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editDebitType">Debit Type</Label>
                  <Select value={editFormData.debitType} onValueChange={(value) => handleEditInputChange('debitType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select debit type" />
                    </SelectTrigger>
                    <SelectContent>
                      {debitTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Update Transaction
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

