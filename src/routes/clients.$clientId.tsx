import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Plus, Pencil } from 'lucide-react'
import { useState } from 'react'

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
import { ClientFormDialog } from '@/components/forms/client-form-dialog'
import { LoanFormDialog } from '@/components/forms/loan-form-dialog'
import { LoanTable } from '@/components/loans/loan-table'
import { useClients } from '@/lib/store'
import { useLoans } from '@/lib/loans-store'

export const Route = createFileRoute('/clients/$clientId')({
  component: ClientDetailPage,
})

function ClientDetailPage() {
  const { clientId } = Route.useParams()
  const { clients, updateClient, addClient } = useClients()
  const { loans, addLoan, deleteLoan } = useLoans()

  const client = clients.find((c) => c.id === clientId)
  const clientLoans = loans.filter((l) => l.clientId === clientId)

  const [editOpen, setEditOpen] = useState(false)
  const [loanOpen, setLoanOpen] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  if (!client) {
    return (
      <main className="container mx-auto py-10">
        <div className="text-center space-y-4">
          <p className="text-lg text-muted-foreground">Cliente no encontrado</p>
          <Button asChild>
            <Link to="/clients">
              <ArrowLeft /> Volver a Clientes
            </Link>
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="container mx-auto py-10 space-y-6">
      <Button variant="ghost" asChild>
        <Link to="/clients" className="gap-2">
          <ArrowLeft className="size-4" />
          Volver a Clientes
        </Link>
      </Button>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">
              {client.firstName} {client.lastName}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{client.idNumber}</p>
          </div>
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil /> Editar
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Dirección:</span> {client.address}
            </div>
            <div>
              <span className="font-medium">Teléfono:</span> {client.phone}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Préstamos</CardTitle>
          <Button onClick={() => setLoanOpen(true)}>
            <Plus /> Nuevo Préstamo
          </Button>
        </CardHeader>
        <CardContent>
          <LoanTable
            loans={clientLoans}
            showClient={false}
            onDelete={(id) => setDeleteConfirmId(id)}
          />
        </CardContent>
      </Card>

      <ClientFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        client={client}
        onSave={(data) => {
          updateClient(client.id, data)
          setEditOpen(false)
        }}
      />

      <LoanFormDialog
        open={loanOpen}
        onOpenChange={setLoanOpen}
        clients={clients}
        defaultClientId={client.id}
        addClient={addClient}
        onSave={(data) => {
          addLoan(data)
          setLoanOpen(false)
        }}
      />

      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar préstamo</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este préstamo? También se eliminarán todas sus
              cuotas. Esta acción no se puede deshacer.
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
