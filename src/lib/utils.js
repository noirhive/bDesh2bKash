import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

import { format, parseISO } from 'date-fns'

export function formatDate(date) {
  if (!date) return ''
  try {
    return format(parseISO(date), 'yyyy-MM-dd')
  } catch {
    return format(new Date(date), 'yyyy-MM-dd')
  }
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 2
  }).format(amount || 0)
}

export function calculateCharge(amount, debitType) {
  if (!debitType || !amount || amount <= 0) return 0
  
  // Fixed charges for banking transfers
  const fixedCharges = {
    'BEFTN': 0,      // Free
    'NPSB': 10,      // 10 BDT fixed
    'RTGS': 100      // 100 BDT fixed
  }
  
  return fixedCharges[debitType] || 0
}

export function exportToCSV(data, filename) {
  if (!data || data.length === 0) {
    alert('No data to export')
    return
  }

  const headers = [
    'Credit Date',
    'Credit Amount',
    'Debit Date', 
    'Debit Amount',
    'Debit Type',
    'Charge'
  ]

  const csvContent = [
    headers.join(','),
    ...data.map(row => [
      row.credit_date || '',
      row.credit_amount || '',
      row.debit_date || '',
      row.debit_amount || '',
      row.debit_type || '',
      row.charge || ''
    ].join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

