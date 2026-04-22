// StockOverview.jsx — displays the stock snapshot card
// Shows: price, % change, market cap, P/E ratio, sector, description etc.
// Props: data — the object returned by GET /api/stocks/:symbol

// A small helper component for each metric card
function MetricCard({ label, value }) {
  return (
    <div className="bg-slate-800 rounded-lg p-3">
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      <p className="text-white font-semibold text-sm">{value ?? 'N/A'}</p>
    </div>
  )
}

export default function StockOverview({ data }) {
  // Determine colour based on whether price went up or down
  const isPositive = data.change >= 0
  const changeColour = isPositive ? 'text-green-400' : 'text-red-400'
  const changeBg     = isPositive ? 'bg-green-900/30 border-green-700' : 'bg-red-900/30 border-red-700'

  return (
    <div className="space-y-6">

      {/* ── Price header ── */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">{data.name}</h2>
            <p className="text-slate-400 text-sm">{data.symbol} · {data.exchange}</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-white">
              {data.currentPrice?.toFixed(2)}
              <span className="text-lg text-slate-400 ml-2">{data.currency}</span>
            </p>
            <div className={`inline-block mt-1 px-3 py-1 rounded-full border text-sm font-medium ${changeBg} ${changeColour}`}>
              {isPositive ? '▲' : '▼'} {Math.abs(data.change)?.toFixed(2)} ({Math.abs(data.changePct * 100)?.toFixed(2)}%)
            </div>
          </div>
        </div>
      </div>

      {/* ── Key metrics grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard label="Market Cap"     value={data.marketCap}      />
        <MetricCard label="P/E Ratio"      value={data.peRatio}        />
        <MetricCard label="EPS"            value={data.eps}            />
        <MetricCard label="P/B Ratio"      value={data.pbRatio}        />
        <MetricCard label="52W High"       value={data.week52High?.toFixed(2)} />
        <MetricCard label="52W Low"        value={data.week52Low?.toFixed(2)}  />
        <MetricCard label="Volume"         value={data.volume}         />
        <MetricCard label="Dividend Yield" value={data.dividendYield}  />
      </div>

      {/* ── Day range ── */}
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <p className="text-slate-400 text-xs mb-3">Today's range</p>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-red-400 font-mono">{data.low?.toFixed(2)}</span>
          <div className="flex-1 h-2 bg-slate-700 rounded-full">
            {/* Progress bar showing where current price sits in today's range */}
            <div
              className="h-2 bg-gradient-to-r from-red-500 to-green-500 rounded-full"
              style={{ width: `${((data.currentPrice - data.low) / (data.high - data.low)) * 100}%` }}
            />
          </div>
          <span className="text-green-400 font-mono">{data.high?.toFixed(2)}</span>
        </div>
      </div>

      {/* ── Company info ── */}
      <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
        <div className="flex flex-wrap gap-3 mb-4">
          <span className="bg-blue-900/50 text-blue-300 text-xs px-3 py-1 rounded-full border border-blue-700">
            {data.sector}
          </span>
          <span className="bg-slate-700 text-slate-300 text-xs px-3 py-1 rounded-full">
            {data.industry}
          </span>
          <span className="bg-slate-700 text-slate-300 text-xs px-3 py-1 rounded-full">
            {data.employees} employees
          </span>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed">{data.description}</p>
        {data.website && (
          <a href={data.website} target="_blank" rel="noreferrer"
            className="inline-block mt-3 text-blue-400 text-xs hover:underline">
            {data.website} ↗
          </a>
        )}
      </div>
    </div>
  )
}
