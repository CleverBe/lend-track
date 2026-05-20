import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'
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
import type { Client } from '@/lib/store'

const clientSchema = z.object({
  firstName: z.string().min(1, 'El nombre es obligatorio'),
  lastName: z.string().min(1, 'El apellido es obligatorio'),
  idNumber: z.string().min(1, 'La cédula es obligatoria'),
  address: z.string().min(1, 'La dirección es obligatoria'),
  phone: z.string().min(1, 'El teléfono es obligatorio'),
})

type ClientForm = z.infer<typeof clientSchema>

type ClientFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  client?: Client | null
  onSave: (data: ClientForm) => void
}

export function ClientFormDialog({ open, onOpenChange, client, onSave }: ClientFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientForm>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      idNumber: '',
      address: '',
      phone: '',
    },
  })

  useEffect(() => {
    if (open) {
      if (client) {
        reset({
          firstName: client.firstName,
          lastName: client.lastName,
          idNumber: client.idNumber,
          address: client.address,
          phone: client.phone,
        })
      } else {
        reset({ firstName: '', lastName: '', idNumber: '', address: '', phone: '' })
      }
    }
  }, [open, client, reset])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {client ? 'Editar Cliente' : 'Nuevo Cliente'}
          </DialogTitle>
          <DialogDescription>
            {client
              ? 'Modifica los datos del cliente.'
              : 'Ingresa los datos del nuevo cliente.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSave)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre</Label>
                <Input id="firstName" {...register('firstName')} />
                {errors.firstName && (
                  <p className="text-sm text-destructive">{errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido</Label>
                <Input id="lastName" {...register('lastName')} />
                {errors.lastName && (
                  <p className="text-sm text-destructive">{errors.lastName.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="idNumber">Cédula</Label>
              <Input id="idNumber" {...register('idNumber')} />
              {errors.idNumber && (
                <p className="text-sm text-destructive">{errors.idNumber.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input id="address" {...register('address')} />
              {errors.address && (
                <p className="text-sm text-destructive">{errors.address.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" {...register('phone')} />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {client ? 'Guardar Cambios' : 'Crear Cliente'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
