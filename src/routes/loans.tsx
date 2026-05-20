import { createFileRoute } from '@tanstack/react-router'
import { Filter, Plus, X } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoanFormDialog } from '@/components/forms/loan-form-dialog'
import { LoanTable } from '@/components/loans/loan-table'
import { useLoans } from '@/lib/loans-store'
import type { LoanStatus } from '@/lib/loans-store'
import { useClients } from '@/lib/store'

const statusLabels: Record<LoanStatus, string> = {
  pending: 'Pendiente',
  partial: 'Parcial',
  paid: 'Pagado',
}

const allStatuses: LoanStatus[] = ['pending', 'partial', 'paid']

export const Route = createFileRoute('/loans')({
  component: LoansPage,
})

function LoansPage() {
  const { clients, addClient } = useClients()
  const { loans, getLoanStatus, addLoan, deleteLoan } = useLoans()

  const [open, setOpen] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const [selectedStatuses, setSelectedStatuses] =
    useState<LoanStatus[]>(allStatuses)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  function toggleStatus(status: LoanStatus) {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    )
  }

  const filteredLoans = useMemo(() => {
    return loans.filter((loan) => {
      const status = getLoanStatus(loan.id)
      if (!selectedStatuses.includes(status)) return false
      if (dateFrom && loan.startDate < dateFrom) return false
      if (dateTo && loan.startDate > dateTo) return false
      return true
    })
  }, [loans, selectedStatuses, dateFrom, dateTo, getLoanStatus])

  const hasActiveFilters =
    selectedStatuses.length < allStatuses.length || !!dateFrom || !!dateTo

  function clearFilters() {
    setSelectedStatuses(allStatuses)
    setDateFrom('')
    setDateTo('')
  }

  return (
    <main className="container mx-auto space-y-8 py-10">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-2xl">Préstamos</CardTitle>
          <Button onClick={() => setOpen(true)}>
            <Plus /> Nuevo Préstamo
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="size-4" />
                  Estado
                  {selectedStatuses.length < allStatuses.length && (
                    <span className="bg-primary text-primary-foreground ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold">
                      {selectedStatuses.length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {allStatuses.map((status) => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={selectedStatuses.includes(status)}
                    onCheckedChange={() => toggleStatus(status)}
                  >
                    {statusLabels[status]}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-end gap-2">
              <div className="space-y-1">
                <Label
                  htmlFor="dateFrom"
                  className="text-muted-foreground text-xs"
                >
                  Desde
                </Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-9 w-40"
                />
              </div>
              <div className="space-y-1">
                <Label
                  htmlFor="dateTo"
                  className="text-muted-foreground text-xs"
                >
                  Hasta
                </Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-9 w-40"
                />
              </div>
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="gap-1"
              >
                <X className="size-4" /> Limpiar
              </Button>
            )}
          </div>

          <LoanTable
            loans={filteredLoans}
            showClient={true}
            onDelete={(id) => setDeleteConfirmId(id)}
          />
        </CardContent>
      </Card>

      <LoanFormDialog
        open={open}
        onOpenChange={setOpen}
        clients={clients}
        addClient={addClient}
        onSave={(data) => {
          addLoan(data)
          setOpen(false)
        }}
      />

      <Dialog
        open={!!deleteConfirmId}
        onOpenChange={() => setDeleteConfirmId(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar préstamo</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este préstamo? También se
              eliminarán todas sus cuotas. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteConfirmId) deleteLoan(deleteConfirmId)
                setDeleteConfirmId(null)
              }}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
