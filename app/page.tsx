import { redirect } from 'next/navigation'
import { FinanceDashboard } from '@/components/finance/finance-dashboard'
import { getFinanceSnapshot } from '@/features/finance/application/actions'
import { getCurrentSession } from '@/lib/auth/session'

export default async function Home() {
  const session = await getCurrentSession()
  if (!session?.user) redirect('/sign-in')
  const initialSnapshot = await getFinanceSnapshot()
  return <FinanceDashboard initialSnapshot={initialSnapshot} user={{ name: session.user.name, email: session.user.email }} />
}
