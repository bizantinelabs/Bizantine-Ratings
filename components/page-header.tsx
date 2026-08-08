import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  eyebrow?: string
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({ title, description, eyebrow, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="flex flex-col gap-1.5">
        {eyebrow && (
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{eyebrow}</span>
        )}
        <h1 className="text-balance text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{title}</h1>
        {description && <p className="max-w-2xl text-pretty text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}
