import { NextResponse } from 'next/server'
import { DDRunResultSchema } from '@/lib/dd/contracts'
import { persistDDRunResult } from '@/lib/dd/persist-result'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ runId: string }> },
) {
  const { runId } = await params
  const configuredKey = process.env.DD_ENGINE_API_KEY
  const suppliedKey = request.headers.get('x-internal-api-key')

  if (!configuredKey) return NextResponse.json({ error: 'Engine callback is not configured' }, { status: 503 })
  if (!suppliedKey || suppliedKey !== configuredKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parsed = DDRunResultSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid DD Engine result', issues: parsed.error.flatten() }, { status: 422 })
  }
  if (parsed.data.run_id !== runId) {
    return NextResponse.json({ error: 'Run id mismatch' }, { status: 409 })
  }

  await persistDDRunResult(parsed.data)
  return NextResponse.json({ data: { run_id: runId, accepted: true } }, { status: 202 })
}
