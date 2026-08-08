'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function RatingSearch({ className }: { className?: string }) {
  const router = useRouter()
  const [value, setValue] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const q = value.trim()
    router.push(q ? `/ratings?q=${encodeURIComponent(q)}` : '/ratings')
  }

  return (
    <form onSubmit={submit} className={className} role="search">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Search protocols, vaults, assets, chains, or contract addresses"
            className="h-11 pl-10 text-base sm:text-sm"
            aria-label="Search ratings"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.nativeEvent.isComposing || e.keyCode === 229)) e.preventDefault()
            }}
          />
        </div>
        <Button type="submit" size="lg" className="h-11 px-5">
          Search
        </Button>
      </div>
    </form>
  )
}
