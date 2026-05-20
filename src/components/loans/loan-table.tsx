import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, Trash2 } from 'lucide-react'
import { Link } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { InstallmentsDialog } from '@/components/loans/installments-dialog'
import { LoanStatusBadge } from '@/components/loans/loan-status-badge'
import { useLoans } from '@/lib/loans-store'
import type { Loan, Installment } from '@/lib/loans-store'
import { formatCurrency, formatDate, isDueSoon, isOverdue } from '@/lib/utils'
import { modalityLabels } from '@/lib/loans-store'

function loanRowClass(
  status: 'paid' | 'partial' | 'pending',
  insts: Installment[],
) {
  if (status === 'paid') return ''
  const hasOverdue = insts.some(
    (i) => i.status === 'pending' && isOverdue(i.dueDate),
  )
  if (hasOverdue) return 'bg-destructive/10'
  const hasDueSoon = insts.some(
    (i) => i.status === 'pending' && isDueSoon(i.dueDate),
  )
  if (hasDueSoon) return 'bg-yellow-50 dark:bg-yellow-950/20'
  return ''
}

function SortIcon({
  column,
  sortKey,
  sortDir,
}: {
  column: string
  sortKey: string
  sortDir: string
}) {
  if (sortKey !== column)
    return <ArrowUpDown className="size-3.5 ml-1 inline" />
  return sortDir === 'asc' ? (
    <ArrowUp className="size-3.5 ml-1 inline" />
  ) : (
    <ArrowDown className="size-3.5 ml-1 inline" />
  )
}

type LoanTableProps = {
  loans: Loan[]
  showClient?: boolean
  onDelete: (loanId: string) => void
}

export function LoanTable({
  loans,
  showClient = true,
  onDelete,
}: LoanTableProps) {
  const { installments, getLoanStatus, getPendingAmount } = useLoans()

  const [sortKey, setSortKey] = useState<'clientName' | 'startDate' | 'status'>(
    'startDate',
  )
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  function toggleSort(key: typeof sortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sortedLoans = useMemo(() => {
    const list = [...loans]
    list.sort((a, b) => {
      let cmp = 0
      if (sortKey === 'clientName') {
        cmp = a.clientName.localeCompare(b.clientName)
      } else if (sortKey === 'startDate') {
        cmp = a.startDate.localeCompare(b.startDate)
      } else if (sortKey === 'status') {
        const sa = getLoanStatus(a.id)
        const sb = getLoanStatus(b.id)
        cmp = sa.localeCompare(sb)
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
    return list
  }, [loans, sortKey, sortDir, getLoanStatus])

  const loanInstsMap = useMemo(() => {
    const map = new Map<string, Installment[]>()
    for (const inst of installments) {
      if (!map.has(inst.loanId)) map.set(inst.loanId, [])
      map.get(inst.loanId)!.push(inst)
    }
    return map
  }, [installments])

  if (loans.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No hay préstamos registrados.
      </p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {showClient && (
            <TableHead>
              <button
                className="flex items-center gap-1 font-medium"
                onClick={() => toggleSort('clientName')}
              >
                Cliente{' '}
                <SortIcon
                  column="clientName"
                  sortKey={sortKey}
                  sortDir={sortDir}
                />
              </button>
            </TableHead>
          )}
          <TableHead>Monto</TableHead>
          <TableHead>Modalidad</TableHead>
          <TableHead>Interés</TableHead>
          <TableHead>Cuotas</TableHead>
          <TableHead>Pago / período</TableHead>
          <TableHead>Total a pagar</TableHead>
          <TableHead>
            <button
              className="flex items-center gap-1 font-medium"
              onClick={() => toggleSort('status')}
            >
              Estado{' '}
              <SortIcon column="status" sortKey={sortKey} sortDir={sortDir} />
            </button>
          </TableHead>
          <TableHead>Pendiente</TableHead>
          <TableHead>
            <button
              className="flex items-center gap-1 font-medium"
              onClick={() => toggleSort('startDate')}
            >
              Inicio{' '}
              <SortIcon
                column="startDate"
                sortKey={sortKey}
                sortDir={sortDir}
              />
            </button>
          </TableHead>
          <TableHead className="w-15"></TableHead>
          <TableHead className="w-15"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedLoans.map((loan) => {
          const status = getLoanStatus(loan.id)
          const insts = loanInstsMap.get(loan.id) || []
          const pending = getPendingAmount(loan.id)
          return (
            <TableRow key={loan.id} className={loanRowClass(status, insts)}>
              {showClient && (
                <TableCell>
                  <Link
                    to="/clients/$clientId"
                    params={{ clientId: loan.clientId }}
                    className="hover:underline font-medium"
                  >
                    {loan.clientName}
                  </Link>
                </TableCell>
              )}
              <TableCell>{formatCurrency(loan.amount)}</TableCell>
              <TableCell>{modalityLabels[loan.modality]}</TableCell>
              <TableCell>{loan.interestRate}%</TableCell>
              <TableCell>{loan.installments}</TableCell>
              <TableCell>{formatCurrency(loan.paymentPerPeriod)}</TableCell>
              <TableCell className="font-semibold">
                {formatCurrency(loan.totalToPay)}
              </TableCell>
              <TableCell>
                <LoanStatusBadge loanId={loan.id} />
              </TableCell>
              <TableCell className="font-medium">
                {pending > 0 ? formatCurrency(pending) : '-'}
              </TableCell>
              <TableCell>{formatDate(loan.startDate)}</TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => onDelete(loan.id)}
                >
                  <Trash2 />
                </Button>
              </TableCell>
              <TableCell>
                <InstallmentsDialog
                  loanId={loan.id}
                  clientName={loan.clientName}
                />
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
