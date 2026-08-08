'use client'

import { useMemo, useState } from 'react'
import type { CriterionTrack, ScoringCriterion } from '@/types'
import { CriterionCard } from '@/components/dashboard/criterion-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const TRACKS: (CriterionTrack | 'All')[] = ['All', 'General', 'Asset', 'Protocol', 'Blockchain']

export function ScoringWorkspace({ criteria }: { criteria: ScoringCriterion[] }) {
  const [track, setTrack] = useState<string>('All')

  const visibleTracks = useMemo(() => {
    const present = new Set(criteria.map((c) => c.track))
    return TRACKS.filter((t) => t === 'All' || present.has(t as CriterionTrack))
  }, [criteria])

  const filtered = track === 'All' ? criteria : criteria.filter((c) => c.track === track)

  return (
    <div>
      <Tabs value={track} onValueChange={(v) => setTrack(v as string)}>
        <TabsList className="flex-wrap">
          {visibleTracks.map((t) => (
            <TabsTrigger key={t} value={t}>
              {t}
            </TabsTrigger>
          ))}
        </TabsList>
        {visibleTracks.map((t) => (
          <TabsContent key={t} value={t} className="mt-4 space-y-3">
            {filtered.map((c) => (
              <CriterionCard key={c.id} criterion={c} />
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
