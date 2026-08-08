'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BrandMark } from '@/components/brand-mark'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

function signUpErrorMessage(error: unknown): string {
  const { code, status } = (error ?? {}) as { code?: string; status?: number }
  if (code === 'weak_password') return 'Choose a stronger password.'
  if (code === 'email_address_invalid') return 'Use a valid work email address.'
  if (code === 'email_address_not_authorized') return 'Confirmation cannot be sent to that address.'
  if (code === 'over_email_send_rate_limit' || status === 429) return 'Too many attempts. Try again shortly.'
  return 'Unable to create the account. Please try again.'
}

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSignUp(event: React.FormEvent) {
    event.preventDefault()
    if (password !== repeatPassword) return setError('Passwords do not match.')
    setLoading(true)
    setError(null)
    try {
      const { error: authError } = await createClient().auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/callback`,
        },
      })
      if (authError) throw authError
      router.push('/auth/sign-up-success')
    } catch (authError) {
      setError(signUpErrorMessage(authError))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-sm">
        <BrandMark />
        <p className="mt-10 font-mono text-xs uppercase tracking-widest text-primary">Controlled access</p>
        <h1 className="mt-2 font-serif text-3xl text-foreground">Create analyst account</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Use your institutional email. You must confirm it before accessing the workspace.</p>
        <form onSubmit={handleSignUp} className="mt-8 flex flex-col gap-5">
          <div className="grid gap-2"><Label htmlFor="email">Work email</Label><Input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></div>
          <div className="grid gap-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} /></div>
          <div className="grid gap-2"><Label htmlFor="repeat-password">Repeat password</Label><Input id="repeat-password" type="password" autoComplete="new-password" required value={repeatPassword} onChange={(event) => setRepeatPassword(event.target.value)} /></div>
          {error && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Creating account…' : 'Create account'}</Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">Already approved? <Link href="/auth/login" className="font-medium text-foreground underline underline-offset-4">Sign in</Link></p>
      </div>
    </main>
  )
}
