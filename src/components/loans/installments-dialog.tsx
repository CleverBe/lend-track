import { Eye, RotateCcw } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useLoans } from '@/lib/loans-store'
import type { Installment } from '@/lib/loans-store'
import {
  formatCurrency,
  formatDate,
  isDueSoon,
  isOverdue,
  todayStr,
} from '@/lib/utils'

function installmentRowClass(inst: Installment) {
  if (inst.status === 'paid') return ''
  if (isOverdue(inst.dueDate)) return 'bg-destructive/10'
  if (isDueSoon(inst.dueDate)) return 'bg-yellow-50 dark:bg-yellow-950/20'
  return ''
}

type EditingInst = {
  id: string
  number: number
  amount: number
  mode: 'pay' | 'edit'
}

export function InstallmentsDialog({
  loanId,
  clientName,
}: {
  loanId: string
  clientName: string
}) {
  const {
    getInstallmentsByLoanId,
    markInstallmentPaid,
    markInstallmentPending,
    updateInstallmentDate,
  } = useLoans()
  const [open, setOpen] = useState(false)

  const installments = getInstallmentsByLoanId(loanId)

  const [paymentDate, setPaymentDate] = useState(todayStr())
  const [editingInst, setEditingInst] = useState<EditingInst | null>(null)

  const isDateValid = /^\d{4}-\d{2}-\d{2}$/.test(paymentDate)

  function handleSave() {
    if (!editingInst || !isDateValid) return
    if (editingInst.mode === 'pay') {
      markInstallmentPaid(editingInst.id, paymentDate)
    } else {
      updateInstallmentDate(editingInst.id, paymentDate)
    }
    setEditingInst(null)
  }

  function handleUndo(instId: string) {
    markInstallmentPending(instId)
  }

  function openPayDialog(inst: Installment) {
    setPaymentDate(todayStr())
    setEditingInst({
      id: inst.id,
      number: inst.number,
      amount: inst.amount,
      mode: 'pay',
    })
  }

  function openEditDialog(inst: Installment) {
    setPaymentDate(inst.paidAt || todayStr())
    setEditingInst({
      id: inst.id,
      number: inst.number,
      amount: inst.amount,
      mode: 'edit',
    })
  }

  const dialogTitle =
    editingInst?.mode === 'pay' ? 'Confirmar Pago' : 'Editar Fecha'
  const dialogDesc = editingInst && (
    <>
      Cuota #{editingInst.number} — {formatCurrency(editingInst.amount)}
    </>
  )
  const saveLabel = editingInst?.mode === 'pay' ? 'Pagar' : 'Guardar'

  const statusBadge = (inst: Installment) => {
    if (inst.status === 'paid') {
      return <Badge variant="success">Pagada</Badge>
    }
    if (isOverdue(inst.dueDate)) {
      return <Badge variant="destructive">Vencida</Badge>
    }
    if (isDueSoon(inst.dueDate)) {
      return <Badge variant="warning">Próxima</Badge>
    }
    return <Badge variant="outline">Pendiente</Badge>
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Eye /> Cuotas
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Cuotas — {clientName}</DialogTitle>
            <DialogDescription>
              {installments.filter((i) => i.status === 'pending').length}{' '}
              pendientes de {installments.length}
            </DialogDescription>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Fecha de vencimiento</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Pagado el</TableHead>
                <TableHead className="w-30"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {installments.map((inst) => (
                <TableRow key={inst.id} className={installmentRowClass(inst)}>
                  <TableCell>{inst.number}</TableCell>
                  <TableCell>{formatDate(inst.dueDate)}</TableCell>
                  <TableCell>{formatCurrency(inst.amount)}</TableCell>
                  <TableCell>{statusBadge(inst)}</TableCell>
                  <TableCell>
                    {inst.paidAt ? formatDate(inst.paidAt) : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {inst.status === 'pending' ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openPayDialog(inst)}
                        >
                          Pagar
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(inst)}
                          >
                            Fecha
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleUndo(inst.id)}
                          >
                            <RotateCcw className="size-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editingInst}
        onOpenChange={(o) => {
          if (!o) setEditingInst(null)
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogDesc}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="pay-date">Fecha de pago</Label>
            <Input
              id="pay-date"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
            {!isDateValid && (
              <p className="text-sm text-destructive">
                Selecciona una fecha válida.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingInst(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!isDateValid}>
              {saveLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
