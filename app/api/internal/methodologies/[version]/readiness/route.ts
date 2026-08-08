import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getMethodologyDetail } from '@/lib/methodology/queries'

// Read-only: returns the production-readiness evaluation for a methodology
// version. Structural validation only — no scoring is performed here.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ version: string }> },
) {
  const { version } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const detail = await getMethodologyDetail(decodeURIComponent(version))
  if (!detail) return NextResponse.json({ error: 'Methodology not found' }, { status: 404 })

  return NextResponse.json({
    version: detail.methodology.version,
    status: detail.methodology.status,
    ready: detail.readiness.ready,
    checks: detail.readiness.checks,
    weightGroups: detail.weightGroups,
  })
}
