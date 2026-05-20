import { useEffect, useMemo, useRef, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { Plus } from 'lucide-react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ClientFormDialog } from '@/components/forms/client-form-dialog'
import type { Client } from '@/lib/store'
import { modalityLabels } from '@/lib/loans-store'
import type { Modality } from '@/lib/loans-store'
import { formatCurrency } from '@/lib/utils'

const loanSchema = z.object({
  clientId: z.string().min(1, 'Selecciona un cliente'),
  amount: z.string().min(1, 'El monto es obligatorio'),
  modality: z.string().min(1, 'Selecciona una modalidad'),
  interestRate: z.string().min(1, 'El interés es obligatorio'),
  installments: z.string().min(1, 'Las cuotas son obligatorias'),
  startDate: z.string().min(1, 'La fecha de inicio es obligatoria'),
})

type LoanForm = z.infer<typeof loanSchema>

type LoanFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  clients: Client[]
  defaultClientId?: string
  onSave: (data: {
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
  }) => void
  addClient: (client: Omit<Client, 'id'>) => string
}

export function LoanFormDialog({
  open,
  onOpenChange,
  clients,
  defaultClientId,
  onSave,
  addClient,
}: LoanFormDialogProps) {
  const [clientFormOpen, setClientFormOpen] = useState(false)
  const pendingClientId = useRef<string | null>(null)

  const defaultValues = useMemo(
    () => ({
      clientId: '',
      amount: '',
      modality: '',
      interestRate: '',
      installments: '',
      startDate: '',
    }),
    [],
  )

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<LoanForm>({
    resolver: zodResolver(loanSchema),
    defaultValues,
  })

  const watchedAmount = useWatch({ control, name: 'amount' })
  const watchedRate = useWatch({ control, name: 'interestRate' })
  const watchedInstallments = useWatch({ control, name: 'installments' })

  const parsedAmount = Number.parseFloat(watchedAmount) || 0
  const parsedRate = Number.parseFloat(watchedRate) || 0
  const parsedInstallments = Number.parseInt(watchedInstallments) || 0

  const calculations = useMemo(() => {
    if (!parsedAmount || !parsedRate || !parsedInstallments) {
      return { interestGenerated: 0, paymentPerPeriod: 0, totalToPay: 0 }
    }
    const totalInterest = parsedAmount * (parsedRate / 100)
    const totalToPay = parsedAmount + totalInterest
    return {
      interestGenerated: totalInterest,
      paymentPerPeriod: totalToPay / parsedInstallments,
      totalToPay,
    }
  }, [parsedAmount, parsedRate, parsedInstallments])

  useEffect(() => {
    if (!open) {
      reset(defaultValues)
    } else if (defaultClientId) {
      setValue('clientId', defaultClientId)
    }
  }, [open, defaultClientId, reset, defaultValues, setValue])

  useEffect(() => {
    if (pendingClientId.current && clients.some((c) => c.id === pendingClientId.current)) {
      setValue('clientId', pendingClientId.current)
      pendingClientId.current = null
    }
  })

  function onSubmit(data: LoanForm) {
    const client = clients.find((c) => c.id === data.clientId)
    if (!client) return

    onSave({
      clientId: data.clientId,
      clientName: `${client.firstName} ${client.lastName}`,
      amount: parsedAmount,
      modality: data.modality as Modality,
      interestRate: parsedRate,
      installments: parsedInstallments,
      startDate: data.startDate,
      interestGenerated: calculations.interestGenerated,
      paymentPerPeriod: calculations.paymentPerPeriod,
      totalToPay: calculations.totalToPay,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Nuevo Préstamo</DialogTitle>
            <DialogDescription>
              Ingresa los datos del préstamo. Los cálculos se actualizarán automáticamente.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="client">Cliente</Label>
              <Controller
                name="clientId"
                control={control}
                render={({ field }) =>
                  defaultClientId ? (
                    <div className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground">
                      {clients.find((c) => c.id === defaultClientId)?.firstName}{' '}
                      {clients.find((c) => c.id === defaultClientId)?.lastName}
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger id="client">
                            <SelectValue placeholder="Seleccionar cliente" />
                          </SelectTrigger>
                          <SelectContent>
                            {clients.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.firstName} {c.lastName} — {c.idNumber}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setClientFormOpen(true)}
                        title="Nuevo Cliente"
                      >
                        <Plus />
                      </Button>
                    </div>
                  )
                }
              />
              {errors.clientId && (
                <p className="text-sm text-destructive">{errors.clientId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Monto a prestar</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                {...register('amount')}
              />
              {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="modality">Modalidad</Label>
                <Controller
                  name="modality"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="modality">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(modalityLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.modality && (
                  <p className="text-sm text-destructive">{errors.modality.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="interestRate">Interés (%)</Label>
                <Input
                  id="interestRate"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  {...register('interestRate')}
                />
                {errors.interestRate && (
                  <p className="text-sm text-destructive">{errors.interestRate.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="installments">Cuotas</Label>
                <Input
                  id="installments"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="0"
                  {...register('installments')}
                />
                {errors.installments && (
                  <p className="text-sm text-destructive">{errors.installments.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Fecha de inicio</Label>
                <Input id="startDate" type="date" {...register('startDate')} />
                {errors.startDate && (
                  <p className="text-sm text-destructive">{errors.startDate.message}</p>
                )}
              </div>
            </div>

            {parsedAmount > 0 && parsedInstallments > 0 && (
              <Card className="bg-muted/40 border-dashed">
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Interés generado:</span>
                    <span className="font-medium">
                      {formatCurrency(calculations.interestGenerated)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pago por período:</span>
                    <span className="font-medium">
                      {formatCurrency(calculations.paymentPerPeriod)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold border-t pt-2">
                    <span>Total a pagar:</span>
                    <span>{formatCurrency(calculations.totalToPay)}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Crear Préstamo</Button>
          </DialogFooter>
        </form>

        <ClientFormDialog
          open={clientFormOpen}
          onOpenChange={setClientFormOpen}
          onSave={(data) => {
            const newId = addClient(data)
            setClientFormOpen(false)
            pendingClientId.current = newId
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
