import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getMethodologyDetail } from '@/lib/methodology/queries'
import { MethodologyDetailView } from '@/components/methodology/methodology-detail'

export const dynamic = 'force-dynamic'

export default async function MethodologyDetailPage({
  params,
}: {
  params: Promise<{ version: string }>
}) {
  const { version } = await params
  const detail = await getMethodologyDetail(decodeURIComponent(version))
  if (!detail) notFound()

  return (
    <div>
      <div className="border-b border-border px-4 pt-4 sm:px-6">
        <Link
          href="/dashboard/methodology"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Methodology suite
        </Link>
      </div>
      <MethodologyDetailView detail={detail} />
    </div>
  )
}
