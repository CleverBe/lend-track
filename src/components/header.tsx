import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { AlertTriangle, Bell, Clock, Menu } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLoans } from '@/lib/loans-store'
import { formatCurrency, isDueSoon, isOverdue } from '@/lib/utils'

const navItems = [
  { path: '/clients', label: 'Clientes' },
  { path: '/loans', label: 'Préstamos' },
]

type Notification = {
  id: string
  clientId: string
  clientName: string
  installment: number
  dueDate: string
  amount: number
  overdue: boolean
  dueSoon: boolean
}

function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { installments, loans } = useLoans()
  const [mobileOpen, setMobileOpen] = useState(false)

  const notifications = useMemo(() => {
    const result: Notification[] = []
    const loanMap = new Map(loans.map((l) => [l.id, l]))

    for (const inst of installments) {
      if (inst.status !== 'pending') continue
      const overdue = isOverdue(inst.dueDate)
      const dueSoon = isDueSoon(inst.dueDate)
      if (!overdue && !dueSoon) continue

      const loan = loanMap.get(inst.loanId)
      if (!loan) continue

      result.push({
        id: inst.id,
        clientId: loan.clientId,
        clientName: loan.clientName,
        installment: inst.number,
        dueDate: inst.dueDate,
        amount: inst.amount,
        overdue,
        dueSoon,
      })
    }

    result.sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    )
    return result
  }, [installments, loans])

  const overdueCount = notifications.filter((n) => n.overdue).length

  function formatDate(dateStr: string) {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-DO', {
      day: 'numeric',
      month: 'short',
    })
  }

  return (
    <header className="bg-background sticky top-0 z-40 border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="hover:text-primary flex items-center gap-2 text-xl font-bold tracking-tight transition-colors"
          >
            <img src="/logo.svg" alt="LendTrack" className="size-7" />
            LendTrack
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="lg:hidden">
            <DropdownMenu open={mobileOpen} onOpenChange={setMobileOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-40">
                {navItems.map((item) => (
                  <DropdownMenuItem key={item.path} asChild>
                    <Link
                      to={item.path}
                      className={
                        location.pathname === item.path ? 'font-semibold' : ''
                      }
                      onClick={() => setMobileOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell />
                {notifications.length > 0 && (
                  <span className="bg-destructive absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full text-[9px] leading-none font-bold text-white select-none">
                    {notifications.length > 9 ? '9+' : notifications.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="font-normal">
                <div className="flex items-center justify-between">
                  <p className="font-medium">Notificaciones</p>
                  {overdueCount > 0 && (
                    <Badge variant="destructive" className="text-[10px]">
                      {overdueCount} vencida{overdueCount > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <div className="text-muted-foreground px-3 py-6 text-center text-sm">
                  No hay notificaciones pendientes
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <DropdownMenuItem
                      key={n.id}
                      className="flex cursor-pointer items-start gap-3 px-3 py-2.5"
                      onClick={() => {
                        navigate({
                          to: '/clients/$clientId',
                          params: { clientId: n.clientId },
                        })
                      }}
                    >
                      <div
                        className={`mt-0.5 shrink-0 ${n.overdue ? 'text-destructive' : 'text-amber-500'}`}
                      >
                        {n.overdue ? (
                          <AlertTriangle className="size-4" />
                        ) : (
                          <Clock className="size-4" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {n.clientName}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          Cuota #{n.installment} — {formatCurrency(n.amount)}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p
                          className={`text-xs font-medium ${n.overdue ? 'text-destructive' : 'text-amber-500'}`}
                        >
                          {formatDate(n.dueDate)}
                        </p>
                        <p className="text-muted-foreground text-[10px]">
                          {n.overdue ? 'Vencida' : 'Próxima'}
                        </p>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="size-10 rounded-full p-0 select-none"
              >
                <Avatar>
                  <AvatarImage src="/images/user_avatar.jpg" alt="Usuario" />
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-1">
                  <p className="font-medium">Juan Pérez</p>
                  <p className="text-muted-foreground text-xs">Administrador</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Perfil</DropdownMenuItem>
              <DropdownMenuItem>Configuraciones</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

export { Header }
