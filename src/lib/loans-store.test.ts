import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  todayStr,
  daysAgo,
  generateInstallments,
  buildMockLoan,
  buildMockInstallments,
  calcLoanStatus,
  calcPendingAmount,
  type Loan,
  type Installment,
  type Modality,
} from './loans-store'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('todayStr', () => {
  it('returns today date in YYYY-MM-DD format', () => {
    const now = new Date()
    const expected = now.toISOString().split('T')[0]
    expect(todayStr()).toBe(expected)
  })
})

describe('daysAgo', () => {
  it('returns 0 days ago as today', () => {
    expect(daysAgo(0)).toBe(todayStr())
  })

  it('returns a past date for positive n', () => {
    const result = daysAgo(5)
    const expected = new Date()
    expected.setDate(expected.getDate() - 5)
    expect(result).toBe(expected.toISOString().split('T')[0])
  })
})

describe('generateInstallments', () => {
  const loan: Loan = {
    id: 'loan-1',
    clientId: 'client-1',
    clientName: 'Test',
    amount: 1000,
    modality: 'monthly',
    interestRate: 10,
    installments: 3,
    startDate: '2026-01-01',
    interestGenerated: 100,
    paymentPerPeriod: 366.67,
    totalToPay: 1100,
  }

  it('generates the correct number of installments', () => {
    const installments = generateInstallments(loan)
    expect(installments).toHaveLength(3)
  })

  it('generates monthly installments correctly', () => {
    const installments = generateInstallments(loan)
    expect(installments[0].number).toBe(1)
    expect(installments[0].dueDate).toBe('2026-02-01')
    expect(installments[0].amount).toBe(366.67)
    expect(installments[0].status).toBe('pending')
    expect(installments[1].dueDate).toBe('2026-03-01')
    expect(installments[2].dueDate).toBe('2026-04-01')
  })

  it('generates biweekly installments', () => {
    const biweeklyLoan = {
      ...loan,
      modality: 'biweekly' as Modality,
      startDate: '2026-01-05',
    }
    const installments = generateInstallments(biweeklyLoan)
    expect(installments[0].dueDate).toBe('2026-01-20')
    expect(installments[1].dueDate).toBe('2026-02-04')
  })

  it('generates weekly installments', () => {
    const weeklyLoan = {
      ...loan,
      modality: 'weekly' as Modality,
      startDate: '2026-01-05',
    }
    const installments = generateInstallments(weeklyLoan)
    expect(installments[0].dueDate).toBe('2026-01-12')
    expect(installments[1].dueDate).toBe('2026-01-19')
  })

  it('all installments have a unique id', () => {
    const installments = generateInstallments(loan)
    const ids = installments.map((i) => i.id)
    expect(new Set(ids).size).toBe(3)
  })
})

describe('buildMockLoan', () => {
  it('computes interestGenerated correctly', () => {
    const loan = buildMockLoan({
      clientName: 'Juan',
      clientId: '1',
      amount: 1000,
      interestRate: 10,
    })
    expect(loan.interestGenerated).toBe(100)
  })

  it('computes totalToPay correctly', () => {
    const loan = buildMockLoan({
      clientName: 'Juan',
      clientId: '1',
      amount: 1000,
      interestRate: 10,
    })
    expect(loan.totalToPay).toBe(1100)
  })

  it('computes paymentPerPeriod correctly', () => {
    const loan = buildMockLoan({
      clientName: 'Juan',
      clientId: '1',
      amount: 1000,
      interestRate: 10,
      installments: 4,
    })
    expect(loan.paymentPerPeriod).toBe(275)
  })

  it('overrides default values', () => {
    const loan = buildMockLoan({
      clientName: 'Ana',
      clientId: '2',
      amount: 500,
      modality: 'weekly',
    })
    expect(loan.clientName).toBe('Ana')
    expect(loan.clientId).toBe('2')
    expect(loan.modality).toBe('weekly')
  })
})

describe('buildMockInstallments', () => {
  const loan: Loan = {
    id: 'loan-1',
    clientId: 'client-1',
    clientName: 'Test',
    amount: 600,
    modality: 'monthly',
    interestRate: 10,
    installments: 3,
    startDate: '2026-01-01',
    interestGenerated: 60,
    paymentPerPeriod: 220,
    totalToPay: 660,
  }

  it('generates all pending when paidUpTo is 0', () => {
    const installments = buildMockInstallments(loan, 0)
    expect(installments).toHaveLength(3)
    expect(installments.every((i) => i.status === 'pending')).toBe(true)
  })

  it('marks first N as paid when paidUpTo is set', () => {
    const installments = buildMockInstallments(loan, 2)
    expect(installments[0].status).toBe('paid')
    expect(installments[1].status).toBe('paid')
    expect(installments[2].status).toBe('pending')
  })

  it('sets paidAt when payDates are provided', () => {
    const payDates = ['2026-02-01', '2026-03-01']
    const installments = buildMockInstallments(loan, 2, 0, payDates)
    expect(installments[0].paidAt).toBe('2026-02-01')
    expect(installments[1].paidAt).toBe('2026-03-01')
    expect(installments[2].paidAt).toBeUndefined()
  })

  it('applies startOffset to due dates', () => {
    const installments = buildMockInstallments(loan, 0, 10)
    const expectedStart = new Date('2026-01-01T00:00:00')
    expectedStart.setDate(expectedStart.getDate() + 10)
    const expectedFirstDue = new Date(expectedStart)
    expectedFirstDue.setMonth(expectedFirstDue.getMonth() + 1)
    expect(installments[0].dueDate).toBe(
      expectedFirstDue.toISOString().split('T')[0],
    )
  })
})

describe('calcLoanStatus', () => {
  const loanId = 'loan-1'
  const makeInstallments = (
    ...statuses: ('paid' | 'pending')[]
  ): Installment[] =>
    statuses.map((s, i) => ({
      id: `inst-${i}`,
      loanId,
      number: i + 1,
      dueDate: '2026-01-01',
      amount: 100,
      status: s,
    }))

  it('returns pending when there are no installments', () => {
    expect(calcLoanStatus(loanId, [])).toBe('pending')
  })

  it('returns pending when all are pending', () => {
    const installments = makeInstallments('pending', 'pending')
    expect(calcLoanStatus(loanId, installments)).toBe('pending')
  })

  it('returns partial when some are paid', () => {
    const installments = makeInstallments('paid', 'pending', 'paid')
    expect(calcLoanStatus(loanId, installments)).toBe('partial')
  })

  it('returns paid when all are paid', () => {
    const installments = makeInstallments('paid', 'paid', 'paid')
    expect(calcLoanStatus(loanId, installments)).toBe('paid')
  })

  it('ignores installments from other loans', () => {
    const myInsts: Installment[] = [
      {
        id: 'i1',
        loanId,
        number: 1,
        dueDate: '',
        amount: 100,
        status: 'pending',
      },
    ]
    const otherInsts: Installment[] = [
      {
        id: 'i2',
        loanId: 'other',
        number: 1,
        dueDate: '',
        amount: 100,
        status: 'paid',
      },
    ]
    expect(calcLoanStatus(loanId, [...myInsts, ...otherInsts])).toBe('pending')
  })
})

describe('calcPendingAmount', () => {
  const loanId = 'loan-1'
  it('returns 0 when there are no pending installments', () => {
    const installments: Installment[] = [
      { id: 'i1', loanId, number: 1, dueDate: '', amount: 100, status: 'paid' },
    ]
    expect(calcPendingAmount(loanId, installments)).toBe(0)
  })

  it('sums pending installments only', () => {
    const installments: Installment[] = [
      { id: 'i1', loanId, number: 1, dueDate: '', amount: 100, status: 'paid' },
      {
        id: 'i2',
        loanId,
        number: 2,
        dueDate: '',
        amount: 200,
        status: 'pending',
      },
      {
        id: 'i3',
        loanId,
        number: 3,
        dueDate: '',
        amount: 150,
        status: 'pending',
      },
    ]
    expect(calcPendingAmount(loanId, installments)).toBe(350)
  })
})
