import { Outlet, createRootRoute } from '@tanstack/react-router'

import { Header } from '@/components/header'
import { ClientsProvider } from '@/lib/store'
import { LoansProvider } from '@/lib/loans-store'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <ClientsProvider>
      <LoansProvider>
        <Header />
        <Outlet />
      </LoansProvider>
    </ClientsProvider>
  )
}
