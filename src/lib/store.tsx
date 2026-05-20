import { createContext, useContext, useState, type ReactNode } from 'react'

export type Client = {
  id: string
  firstName: string
  lastName: string
  idNumber: string
  address: string
  phone: string
}

type ClientsContextType = {
  clients: Client[]
  addClient: (client: Omit<Client, 'id'>) => string
  updateClient: (id: string, data: Partial<Omit<Client, 'id'>>) => void
  deleteClient: (id: string) => void
}

const ClientsContext = createContext<ClientsContextType | undefined>(undefined)

const initialClients: Client[] = [
  {
    id: '1',
    firstName: 'Juan',
    lastName: 'Pérez',
    idNumber: '001-0000001-0',
    address: 'Calle Principal #123',
    phone: '809-555-0101',
  },
  {
    id: '2',
    firstName: 'María',
    lastName: 'García',
    idNumber: '001-0000002-0',
    address: 'Avenida Central #456',
    phone: '809-555-0102',
  },
]

function ClientsProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>(initialClients)

  function addClient(data: Omit<Client, 'id'>) {
    const id = crypto.randomUUID()
    setClients((prev) => [...prev, { ...data, id }])
    return id
  }

  function updateClient(id: string, data: Partial<Omit<Client, 'id'>>) {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)))
  }

  function deleteClient(id: string) {
    setClients((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <ClientsContext.Provider value={{ clients, addClient, updateClient, deleteClient }}>
      {children}
    </ClientsContext.Provider>
  )
}

function useClients() {
  const context = useContext(ClientsContext)
  if (!context) throw new Error('useClients must be used within a ClientsProvider')
  return context
}

export { ClientsProvider, useClients }
