'use client'

import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, XAxis, YAxis } from 'recharts'

const bandColor: Record<string, string> = {
  A: 'var(--success)',
  B: 'var(--primary)',
  C: 'var(--warning)',
  D: 'var(--destructive)',
  'Not Approved': 'var(--chart-5)',
}

export function RatingDistributionChart({ data = [] }: { data?: { band: string; count: number }[] }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 24, bottom: 0, left: 8 }} barCategoryGap={10}>
          <XAxis type="number" hide domain={[0, 'dataMax + 2']} />
          <YAxis
            type="category"
            dataKey="band"
            tickLine={false}
            axisLine={false}
            width={92}
            fontSize={12}
            stroke="var(--muted-foreground)"
          />
          <Bar dataKey="count" radius={3} maxBarSize={22}>
            {data.map((entry) => (
              <Cell key={entry.band} fill={bandColor[entry.band] ?? 'var(--chart-5)'} />
            ))}
            <LabelList
              dataKey="count"
              position="right"
              className="fill-foreground"
              fontSize={12}
              fontFamily="var(--font-mono)"
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
