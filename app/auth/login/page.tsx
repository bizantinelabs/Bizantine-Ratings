'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LockKeyhole } from 'lucide-react'
import { BrandMark } from '@/components/brand-mark'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

function loginErrorMessage(error: unknown): string {
  const { code, status } = (error ?? {}) as { code?: string; status?: number }
  if (code === 'email_not_confirmed') return 'Confirm your email address before signing in.'
  if (code === 'over_request_rate_limit' || status === 429) return 'Too many attempts. Try again shortly.'
  if (code === 'invalid_credentials') return 'Invalid email or password.'
  return 'Unable to sign in. Please try again.'
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { error: authError } = await createClient().auth.signInWithPassword({ email, password })
      if (authError) throw authError
      router.push('/dashboard')
      router.refresh()
    } catch (authError) {
      setError(loginErrorMessage(authError))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-svh bg-background">
      <section className="flex w-full items-center justify-center px-4 py-8 lg:w-[46%] lg:px-10">
        <div className="w-full max-w-sm">
          <BrandMark />
          <div className="mt-10">
            <div className="mb-6 flex size-10 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-primary">
              <LockKeyhole className="size-5" />
            </div>
            <p className="font-mono text-xs uppercase tracking-widest text-primary">Analyst workspace</p>
            <h1 className="mt-2 font-serif text-3xl text-foreground">Sign in to continue</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Access assessments, evidence review, and automated due-diligence runs.</p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 flex flex-col gap-5">
            <div className="grid gap-2">
              <Label htmlFor="email">Work email</Label>
              <Input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="analyst@institution.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
            </div>
            {error && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">New analyst? <Link href="/auth/sign-up" className="font-medium text-foreground underline underline-offset-4">Request access</Link></p>
          <p className="mt-10 text-center font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Authenticated access · All actions audited</p>
        </div>
      </section>
      <aside className="hidden flex-1 border-l border-border bg-card lg:flex lg:items-end lg:p-12">
        <div className="max-w-lg">
          <p className="font-mono text-xs uppercase tracking-widest text-primary">Operating principle</p>
          <blockquote className="mt-4 font-serif text-3xl leading-tight text-foreground">Methodology executes in the Python DD Engine. Analysts review, challenge, and approve.</blockquote>
          <div className="mt-8 h-px bg-border" />
          <p className="mt-4 text-sm leading-6 text-muted-foreground">The application orchestrates evidence, workflow, validation, and immutable publication without duplicating scoring logic.</p>
        </div>
      </aside>
    </main>
  )
}
