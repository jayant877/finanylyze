// PriceChart.jsx — 1-year closing price line chart
// Uses recharts AreaChart for a filled area under the line

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-900 border border-slate-600 rounded-lg p-3 text-xs">
      <p className="text-slate-400 mb-1">{label}</p>
      <p className="text-white font-mono font-semibold">{payload[0].value?.toFixed(2)}</p>
    </div>
  )
}

export default function PriceChart({ data, symbol }) {
  if (!data || data.length === 0) {
    return <p className="text-slate-500 text-sm">No price history available.</p>
  }

  // Only show every ~30th label on the X axis — otherwise it gets crowded
  const tickIndices = new Set(
    data.filter((_, i) => i % 30 === 0 || i === data.length - 1).map((_, i) => i)
  )

  // Calculate overall performance (first to last price)
  const firstPrice = data[0]?.close
  const lastPrice  = data[data.length - 1]?.close
  const perfPct    = ((lastPrice - firstPrice) / firstPrice * 100).toFixed(2)
  const isUp       = perfPct >= 0

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-white font-semibold">{symbol} — 1 Year Price Chart</h3>
          <p className="text-slate-400 text-xs mt-1">Daily closing prices</p>
        </div>
        <div className={`text-right ${isUp ? 'text-green-400' : 'text-red-400'}`}>
          <p className="font-bold text-lg">{isUp ? '▲' : '▼'} {Math.abs(perfPct)}%</p>
          <p className="text-xs text-slate-400">1-year return</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            {/* Gradient fill under the line */}
            <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={isUp ? '#22c55e' : '#ef4444'} stopOpacity={0.3} />
              <stop offset="95%" stopColor={isUp ? '#22c55e' : '#ef4444'} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: '#94a3b8', fontSize: 10 }}
            axisLine={false} tickLine={false}
            // Only show some date labels to avoid clutter
            tickFormatter={(val, i) => {
              if (i % 60 === 0) return val.slice(0,7) // "2024-01"
              return ''
            }}
          />
          <YAxis
            domain={['auto', 'auto']}
            tick={{ fill: '#94a3b8', fontSize: 10 }}
            axisLine={false} tickLine={false}
            tickFormatter={v => v.toFixed(0)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="close"
            stroke={isUp ? '#22c55e' : '#ef4444'}
            strokeWidth={2}
            fill="url(#priceGrad)"
            dot={false}          // don't render a dot on each data point (too many)
            activeDot={{ r: 4, fill: isUp ? '#22c55e' : '#ef4444' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
