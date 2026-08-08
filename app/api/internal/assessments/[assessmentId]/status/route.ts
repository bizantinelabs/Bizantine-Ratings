import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const StatusSchema = z.object({
  status: z.enum(['in_review', 'approved', 'rejected']),
  rationale: z.string().trim().min(12).max(2000),
})

const transitions: Record<string, string[]> = {
  needs_review: ['in_review', 'rejected'],
  in_review: ['approved', 'rejected'],
  approved: ['in_review'],
  rejected: ['in_review'],
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ assessmentId: string }> },
) {
  const { assessmentId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = StatusSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid status change', issues: parsed.error.flatten() }, { status: 400 })

  const { data: assessment } = await supabase.from('assessments').select('id,status').eq('id', assessmentId).single()
  if (!assessment) return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
  if (!transitions[assessment.status]?.includes(parsed.data.status)) {
    return NextResponse.json({ error: `Cannot move from ${assessment.status} to ${parsed.data.status}` }, { status: 409 })
  }

  const { error } = await supabase
    .from('assessments')
    .update({ status: parsed.data.status, updated_at: new Date().toISOString() })
    .eq('id', assessmentId)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  await supabase.from('analyst_audit_log').insert({
    assessment_id: assessmentId,
    actor: user.id,
    action: 'status_changed',
    target: 'assessment.status',
    original_value: assessment.status,
    new_value: parsed.data.status,
    rationale: parsed.data.rationale,
  })

  return NextResponse.json({ data: { id: assessmentId, status: parsed.data.status } })
}
