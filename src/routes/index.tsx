import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <main className="container mx-auto py-10 text-center">
      <h1 className="text-4xl font-bold mb-4">Lend Track</h1>
      <p className="text-muted-foreground mb-6">Welcome to your new app</p>
      <Button>Get Started</Button>
    </main>
  )
}
