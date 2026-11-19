import { redirect } from 'next/navigation'
import { AuthForm } from '@/components/auth/auth-form'
import { getCurrentSession } from '@/lib/auth/session'

export default async function SignInPage() {
  const session = await getCurrentSession()
  if (session?.user) redirect('/')
  return <main className="auth-page"><a className="brand auth-brand" href="/" aria-label="Retni, início"><span className="brand-mark">r</span><span>retni<span className="brand-light">.</span></span></a><AuthForm mode="sign-in" /><p className="auth-footer">© 2026 Retni</p></main>
}
