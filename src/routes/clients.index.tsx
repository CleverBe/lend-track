import { createFileRoute, Link } from '@tanstack/react-router'
import { Plus, Pencil, Trash2 } from 'lucide-react'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ClientFormDialog } from '@/components/forms/client-form-dialog'
import { useClients } from '@/lib/store'
import type { Client } from '@/lib/store'

export const Route = createFileRoute('/clients/')({
  component: ClientsPage,
})

function ClientsPage() {
  const { clients, addClient, updateClient, deleteClient } = useClients()

  const [open, setOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  function handleSave(data: Omit<Client, 'id'>) {
    if (editingClient) {
      updateClient(editingClient.id, data)
    } else {
      addClient(data)
    }
    setOpen(false)
  }

  return (
    <main className="container mx-auto py-10">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-2xl">Clientes</CardTitle>
          <Button
            onClick={() => {
              setEditingClient(null)
              setOpen(true)
            }}
          >
            <Plus /> Nuevo Cliente
          </Button>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Cédula</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead className="w-25">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground py-8"
                  >
                    No hay clientes registrados.
                  </TableCell>
                </TableRow>
              )}
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <Link
                      to="/clients/$clientId"
                      params={{ clientId: client.id }}
                      className="hover:underline font-medium"
                    >
                      {client.firstName} {client.lastName}
                    </Link>
                  </TableCell>
                  <TableCell>{client.idNumber}</TableCell>
                  <TableCell>{client.address}</TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setEditingClient(client)
                          setOpen(true)
                        }}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => setDeleteConfirmId(client.id)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ClientFormDialog
        open={open}
        onOpenChange={setOpen}
        client={editingClient}
        onSave={handleSave}
      />

      <Dialog
        open={!!deleteConfirmId}
        onOpenChange={() => setDeleteConfirmId(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar cliente</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este cliente? Esta acción no
              se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteConfirmId) deleteClient(deleteConfirmId)
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
