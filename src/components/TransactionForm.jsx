import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { calculateCharge } from '@/lib/utils'

const debitTypes = [
  'BEFTN',
  'NPSB',
  'RTGS'
]

export default function TransactionForm({ onAddTransaction }) {
  const [formData, setFormData] = useState({
    creditDate: '',
    creditAmount: '',
    debitDate: '',
    debitAmount: '',
    debitType: ''
  })

  const [calculatedCharge, setCalculatedCharge] = useState(0)

  const handleInputChange = (field, value) => {
    const newFormData = { ...formData, [field]: value }
    setFormData(newFormData)

    // Calculate charge automatically when debit amount or type changes
    if (field === 'debitAmount' || field === 'debitType') {
      const amount = parseFloat(newFormData.debitAmount) || 0
      const charge = calculateCharge(amount, newFormData.debitType)
      setCalculatedCharge(charge)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.creditDate && !formData.debitDate) {
      alert('Please enter at least one date (Credit or Debit)')
      return
    }

    if (!formData.creditAmount && !formData.debitAmount) {
      alert('Please enter at least one amount (Credit or Debit)')
      return
    }

    if (formData.debitAmount && !formData.debitType) {
      alert('Please select a debit type when entering debit amount')
      return
    }

    const transaction = {
      credit_date: formData.creditDate || null,
      credit_amount: parseFloat(formData.creditAmount) || null,
      debit_date: formData.debitDate || null,
      debit_amount: parseFloat(formData.debitAmount) || null,
      debit_type: formData.debitType || null,
      charge: calculatedCharge,
      created_at: new Date().toISOString()
    }

    onAddTransaction(transaction)
    
    // Reset form
    setFormData({
      creditDate: '',
      creditAmount: '',
      debitDate: '',
      debitAmount: '',
      debitType: ''
    })
    setCalculatedCharge(0)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add New Transaction</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Credit Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-green-600">Credit</h3>
              <div className="space-y-2">
                <Label htmlFor="creditDate">Credit Date</Label>
                <Input
                  id="creditDate"
                  type="date"
                  value={formData.creditDate}
                  onChange={(e) => handleInputChange('creditDate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="creditAmount">Credit Amount (BDT)</Label>
                <Input
                  id="creditAmount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.creditAmount}
                  onChange={(e) => handleInputChange('creditAmount', e.target.value)}
                />
              </div>
            </div>

            {/* Debit Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-red-600">Debit</h3>
              <div className="space-y-2">
                <Label htmlFor="debitDate">Debit Date</Label>
                <Input
                  id="debitDate"
                  type="date"
                  value={formData.debitDate}
                  onChange={(e) => handleInputChange('debitDate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="debitAmount">Debit Amount (BDT)</Label>
                <Input
                  id="debitAmount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.debitAmount}
                  onChange={(e) => handleInputChange('debitAmount', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="debitType">Debit Type</Label>
                <Select value={formData.debitType} onValueChange={(value) => handleInputChange('debitType', value)}>
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

          {/* Calculated Charge Display */}
          {formData.debitType && formData.debitAmount && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Calculated Charge:</strong> ৳{calculatedCharge.toFixed(2)}
                {formData.debitType === 'BEFTN' && <span className="ml-2 text-green-600">(Free)</span>}
                {formData.debitType === 'NPSB' && <span className="ml-2">(Fixed: ৳10)</span>}
                {formData.debitType === 'RTGS' && <span className="ml-2">(Fixed: ৳100)</span>}
              </p>
            </div>
          )}

          <Button type="submit" className="w-full">
            Add Transaction
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

