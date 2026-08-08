'use client'

import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FilterBarProps {
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  children?: React.ReactNode
  onReset?: () => void
  hasActiveFilters?: boolean
  className?: string
}

// Layout container for a search input plus arbitrary filter controls.
export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search…',
  children,
  onReset,
  hasActiveFilters,
  className,
}: FilterBarProps) {
  return (
    <div className={cn('flex flex-col gap-3 lg:flex-row lg:items-center', className)}>
      <div className="relative flex-1 lg:max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="h-9 pl-9 text-sm"
          aria-label={searchPlaceholder}
        />
        {searchValue && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {children}
        {hasActiveFilters && onReset && (
          <Button variant="ghost" size="sm" onClick={onReset} className="text-muted-foreground">
            <X className="size-3.5" />
            Reset
          </Button>
        )}
      </div>
    </div>
  )
}
