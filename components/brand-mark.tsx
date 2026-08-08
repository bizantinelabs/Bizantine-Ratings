import { cn } from '@/lib/utils'

// Bizantine Ratings wordmark. The mark is a stylized shield/aperture
// evoking assurance and inspection — not a generic crypto coin.
export function BrandMark({ className, showText = true }: { className?: string; showText?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span className="relative inline-flex size-7 shrink-0 items-center justify-center">
        <svg viewBox="0 0 32 32" fill="none" className="size-7" aria-hidden>
          <path
            d="M16 2.5 27 7v9.2c0 6.9-4.6 11.3-11 13.3C9.6 27.5 5 23.1 5 16.2V7l11-4.5Z"
            className="fill-primary/12 stroke-primary"
            strokeWidth="1.5"
          />
          <path d="M11 16.2l3.4 3.4L21 12.6" className="stroke-primary" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {showText && (
        <span className="flex flex-col leading-none">
          <span className="text-sm font-semibold tracking-tight text-foreground">Bizantine</span>
          <span className="text-[0.6rem] font-medium uppercase tracking-[0.2em] text-muted-foreground">Ratings</span>
        </span>
      )}
    </span>
  )
}
