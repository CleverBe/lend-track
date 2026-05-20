import { createFileRoute } from '@tanstack/react-router'
import { Users, HandCoins, ArrowRightLeft, DollarSign, Clock, CheckCircle2 } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useClients } from '@/lib/store'
import { useLoans } from '@/lib/loans-store'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const { clients } = useClients()
  const { loans, getPendingAmount, getLoanStatus } = useLoans()

  const totalLoaned = loans.reduce((sum, l) => sum + l.amount, 0)
  const totalPending = loans.reduce((sum, l) => sum + getPendingAmount(l.id), 0)
  const totalPaid = loans.reduce((sum, l) => sum + l.totalToPay - getPendingAmount(l.id), 0)

  const activeLoans = loans.filter(
    (l) => getLoanStatus(l.id) === 'pending' || getLoanStatus(l.id) === 'partial',
  ).length

  const paidLoans = loans.filter((l) => getLoanStatus(l.id) === 'paid').length

  const metrics = [
    {
      title: 'Clientes',
      value: clients.length,
      icon: Users,
      description: 'Registrados',
    },
    {
      title: 'Préstamos Activos',
      value: activeLoans,
      icon: HandCoins,
      description: 'En curso',
    },
    {
      title: 'Total Prestado',
      value: `$${totalLoaned.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      description: 'Monto original',
    },
    {
      title: 'Pendiente por Cobrar',
      value: `$${totalPending.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: Clock,
      description: 'Aún no pagado',
    },
    {
      title: 'Total Cobrado',
      value: `$${totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: CheckCircle2,
      description: 'Pagado hasta ahora',
    },
    {
      title: 'Préstamos Pagados',
      value: paidLoans,
      icon: ArrowRightLeft,
      description: 'Completados',
    },
  ]

  return (
    <main className="container mx-auto py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel de Control</h1>
        <p className="text-muted-foreground mt-1">Resumen general del sistema de préstamos</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <Card key={metric.title}>
              <CardHeader className="flex-row items-center justify-between gap-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <Icon className="size-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </main>
  )
}
