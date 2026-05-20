import { createContext, useContext, useState, type ReactNode } from 'react'

export type Modality = 'monthly' | 'biweekly' | 'weekly'

export const modalityLabels: Record<Modality, string> = {
  monthly: 'Mensual',
  biweekly: 'Quincenal',
  weekly: 'Semanal',
}

export type Loan = {
  id: string
  clientId: string
  clientName: string
  amount: number
  modality: Modality
  interestRate: number
  installments: number
  startDate: string
  interestGenerated: number
  paymentPerPeriod: number
  totalToPay: number
}

export type InstallmentStatus = 'pending' | 'paid'

export type Installment = {
  id: string
  loanId: string
  number: number
  dueDate: string
  amount: number
  status: InstallmentStatus
  paidAt?: string
}

export type LoanStatus = 'pending' | 'partial' | 'paid'

type LoansContextType = {
  loans: Loan[]
  installments: Installment[]
  addLoan: (loan: Omit<Loan, 'id'>) => void
  deleteLoan: (id: string) => void
  markInstallmentPaid: (id: string, date: string) => void
  markInstallmentPending: (id: string) => void
  updateInstallmentDate: (id: string, date: string) => void
  getInstallmentsByLoanId: (loanId: string) => Installment[]
  getLoanStatus: (loanId: string) => LoanStatus
  getPendingAmount: (loanId: string) => number
}

const LoansContext = createContext<LoansContextType | undefined>(undefined)

function generateInstallments(loan: Loan): Installment[] {
  const result: Installment[] = []
  const start = new Date(loan.startDate + 'T00:00:00')

  for (let i = 1; i <= loan.installments; i++) {
    const due = new Date(start)
    switch (loan.modality) {
      case 'monthly':
        due.setMonth(due.getMonth() + i)
        break
      case 'biweekly':
        due.setDate(due.getDate() + 15 * i)
        break
      case 'weekly':
        due.setDate(due.getDate() + 7 * i)
        break
    }

    result.push({
      id: crypto.randomUUID(),
      loanId: loan.id,
      number: i,
      dueDate: due.toISOString().split('T')[0],
      amount: loan.paymentPerPeriod,
      status: 'pending',
    })
  }

  return result
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

function buildMockLoan(
  overrides: Partial<Loan> & { clientName: string; clientId: string },
): Loan {
  const defaults = {
    id: crypto.randomUUID(),
    amount: 0,
    modality: 'monthly' as Modality,
    interestRate: 5,
    installments: 6,
    startDate: todayStr(),
    interestGenerated: 0,
    paymentPerPeriod: 0,
    totalToPay: 0,
  }
  const loan: Loan = { ...defaults, ...overrides }
  loan.interestGenerated = loan.amount * (loan.interestRate / 100)
  loan.totalToPay = loan.amount + loan.interestGenerated
  loan.paymentPerPeriod = loan.totalToPay / loan.installments
  return loan
}

function buildMockInstallments(
  loan: Loan,
  paidUpTo = 0,
  startOffset = 0,
  payDates?: string[],
) {
  const result: Installment[] = []
  const start = new Date(loan.startDate + 'T00:00:00')
  start.setDate(start.getDate() + startOffset)

  for (let i = 1; i <= loan.installments; i++) {
    const due = new Date(start)
    switch (loan.modality) {
      case 'monthly':
        due.setMonth(due.getMonth() + i)
        break
      case 'biweekly':
        due.setDate(due.getDate() + 15 * i)
        break
      case 'weekly':
        due.setDate(due.getDate() + 7 * i)
        break
    }

    const isPaid = i <= paidUpTo
    result.push({
      id: crypto.randomUUID(),
      loanId: loan.id,
      number: i,
      dueDate: due.toISOString().split('T')[0],
      amount: loan.paymentPerPeriod,
      status: isPaid ? 'paid' : 'pending',
      paidAt: isPaid && payDates ? payDates[i - 1] : undefined,
    })
  }

  return result
}

function LoansProvider({ children }: { children: ReactNode }) {
  const [loans, setLoans] = useState<Loan[]>(() => {
    const loan1 = buildMockLoan({
      id: 'mock-1',
      clientId: '1',
      clientName: 'Juan Pérez',
      amount: 500,
      modality: 'monthly',
      interestRate: 10,
      installments: 3,
      startDate: daysAgo(90),
    })
    const loan2 = buildMockLoan({
      id: 'mock-2',
      clientId: '2',
      clientName: 'María García',
      amount: 1200,
      modality: 'biweekly',
      interestRate: 8,
      installments: 4,
      startDate: daysAgo(60),
    })
    const loan3 = buildMockLoan({
      id: 'mock-3',
      clientId: '1',
      clientName: 'Juan Pérez',
      amount: 800,
      modality: 'weekly',
      interestRate: 5,
      installments: 6,
      startDate: daysAgo(45),
    })
    const loan4 = buildMockLoan({
      id: 'mock-4',
      clientId: '2',
      clientName: 'María García',
      amount: 300,
      modality: 'monthly',
      interestRate: 15,
      installments: 2,
      startDate: daysAgo(3),
    })
    const loan5 = buildMockLoan({
      id: 'mock-5',
      clientId: '1',
      clientName: 'Juan Pérez',
      amount: 200,
      modality: 'weekly',
      interestRate: 10,
      installments: 4,
      startDate: daysAgo(5),
    })
    return [loan1, loan2, loan3, loan4, loan5]
  })

  const [installments, setInstallments] = useState<Installment[]>(() => {
    const mockLoans = [
      {
        loanId: 'mock-1',
        paidUpTo: 3,
        startOffset: 0,
        payDates: [daysAgo(60), daysAgo(30), daysAgo(0)],
      },
      {
        loanId: 'mock-2',
        paidUpTo: 2,
        startOffset: 0,
        payDates: [daysAgo(45), daysAgo(30)],
      },
      {
        loanId: 'mock-3',
        paidUpTo: 3,
        startOffset: 0,
        payDates: [daysAgo(38), daysAgo(31), daysAgo(24)],
      },
      { loanId: 'mock-4', paidUpTo: 0, startOffset: 0 },
      { loanId: 'mock-5', paidUpTo: 0, startOffset: 0 },
    ]

    const generated = mockLoans.flatMap((m) => {
      const loan = loans.find((l) => l.id === m.loanId)!
      return buildMockInstallments(loan, m.paidUpTo, m.startOffset, m.payDates)
    })

    return generated
  })

  function addLoan(data: Omit<Loan, 'id'>) {
    const loan: Loan = { ...data, id: crypto.randomUUID() }
    const newInstallments = generateInstallments(loan)
    setLoans((prev) => [...prev, loan])
    setInstallments((prev) => [...prev, ...newInstallments])
  }

  function deleteLoan(id: string) {
    setLoans((prev) => prev.filter((l) => l.id !== id))
    setInstallments((prev) => prev.filter((inst) => inst.loanId !== id))
  }

  function markInstallmentPaid(id: string, date: string) {
    setInstallments((prev) =>
      prev.map((inst) =>
        inst.id === id
          ? { ...inst, status: 'paid' as const, paidAt: date }
          : inst,
      ),
    )
  }

  function markInstallmentPending(id: string) {
    setInstallments((prev) =>
      prev.map((inst) =>
        inst.id === id
          ? { ...inst, status: 'pending' as const, paidAt: undefined }
          : inst,
      ),
    )
  }

  function updateInstallmentDate(id: string, date: string) {
    setInstallments((prev) =>
      prev.map((inst) => (inst.id === id ? { ...inst, paidAt: date } : inst)),
    )
  }

  function getInstallmentsByLoanId(loanId: string) {
    return installments.filter((inst) => inst.loanId === loanId)
  }

  function getLoanStatus(loanId: string): LoanStatus {
    const insts = installments.filter((i) => i.loanId === loanId)
    if (insts.length === 0) return 'pending'
    const allPaid = insts.every((i) => i.status === 'paid')
    const somePaid = insts.some((i) => i.status === 'paid')
    if (allPaid) return 'paid'
    if (somePaid) return 'partial'
    return 'pending'
  }

  function getPendingAmount(loanId: string) {
    return installments
      .filter((i) => i.loanId === loanId && i.status === 'pending')
      .reduce((sum, i) => sum + i.amount, 0)
  }

  return (
    <LoansContext.Provider
      value={{
        loans,
        installments,
        addLoan,
        deleteLoan,
        markInstallmentPaid,
        markInstallmentPending,
        updateInstallmentDate,
        getInstallmentsByLoanId,
        getLoanStatus,
        getPendingAmount,
      }}
    >
      {children}
    </LoansContext.Provider>
  )
}

function useLoans() {
  const context = useContext(LoansContext)
  if (!context) throw new Error('useLoans must be used within a LoansProvider')
  return context
}

export { LoansProvider, useLoans }
