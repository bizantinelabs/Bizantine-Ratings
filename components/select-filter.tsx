'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export interface SelectOption {
  label: string
  value: string
}

// Thin wrapper around the base-ui Select for filter dropdowns.
export function SelectFilter({
  value,
  onChange,
  options,
  placeholder,
  ariaLabel,
  className,
}: {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder: string
  ariaLabel?: string
  className?: string
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange((v as string) ?? '')}>
      <SelectTrigger className={cn('h-9 min-w-[8.5rem]', className)} aria-label={ariaLabel ?? placeholder}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
