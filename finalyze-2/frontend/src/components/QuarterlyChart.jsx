// QuarterlyChart.jsx — bar chart of revenue vs net income by quarter
// Uses recharts — a React charting library built on SVG

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'

// Custom tooltip that shows formatted numbers on hover
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-900 border border-slate-600 rounded-lg p-3 text-xs">
      <p className="text-slate-300 font-medium mb-2">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: p.fill }} />
          <span className="text-slate-400">{p.name}:</span>
          <span className="text-white font-mono">{p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

export default function QuarterlyChart({ data }) {
  if (!data || data.length === 0) return null

  // recharts expects an array of plain objects — each object = one bar group
  const chartData = [...data].reverse().map(q => ({
    period:    q.period,
    Revenue:   q.revenueRaw,
    'Net Income': q.netIncomeRaw,
  }))

  return (
    <div className="mt-6 bg-slate-800 rounded-xl border border-slate-700 p-5">
      <h3 className="text-white font-semibold mb-1">Revenue vs Net Income</h3>
      <p className="text-slate-400 text-xs mb-5">Quarterly trend (oldest → newest)</p>

      {/* ResponsiveContainer makes the chart fill its parent width */}
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis dataKey="period" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false}
            tickFormatter={v => {
              if (Math.abs(v) >= 1e9) return (v/1e9).toFixed(1)+'B'
              if (Math.abs(v) >= 1e6) return (v/1e6).toFixed(1)+'M'
              return v
            }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148,163,184,0.08)' }} />
          <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
          <Bar dataKey="Revenue"     fill="#3b82f6" radius={[4,4,0,0]} />
          <Bar dataKey="Net Income"  fill="#22c55e" radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
