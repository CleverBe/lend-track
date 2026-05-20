import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

export function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-DO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function todayStr() {
  return new Date().toISOString().split('T')[0]
}

export function isOverdue(dueDate: string) {
  return new Date(dueDate + 'T00:00:00') < new Date()
}

export function isDueSoon(dueDate: string, days = 3) {
  const due = new Date(dueDate + 'T00:00:00')
  const limit = new Date()
  limit.setDate(limit.getDate() + days)
  return due <= limit && due >= new Date()
}
