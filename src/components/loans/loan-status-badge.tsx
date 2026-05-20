import { Badge } from '@/components/ui/badge'
import { useLoans } from '@/lib/loans-store'

export function LoanStatusBadge({ loanId }: { loanId: string }) {
  const { getLoanStatus } = useLoans()
  const status = getLoanStatus(loanId)
  switch (status) {
    case 'paid':
      return <Badge variant="success">Pagado</Badge>
    case 'partial':
      return <Badge variant="default">Parcial</Badge>
    default:
      return <Badge variant="outline">Pendiente</Badge>
  }
}
