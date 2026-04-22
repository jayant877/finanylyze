// QuarterlyTable.jsx — shows the last 4 quarters of financials
// This is FinAlyze's signature feature.
// Props: data — array of quarterly objects from the backend

export default function QuarterlyTable({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-slate-500 text-sm">No quarterly data available.</p>
  }

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-700">
        <h3 className="text-white font-semibold">Quarterly Results</h3>
        <p className="text-slate-400 text-xs mt-1">Last 4 quarters — Revenue, Gross Profit, Net Income, EPS</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-400 text-xs uppercase tracking-wider">
              <th className="px-5 py-3 text-left">Metric</th>
              {data.map(q => (
                <th key={q.period} className="px-5 py-3 text-right">{q.period}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">

            {/* Revenue row */}
            <tr className="hover:bg-slate-700/50 transition-colors">
              <td className="px-5 py-4 text-slate-300 font-medium">
                Revenue
                <p className="text-slate-500 text-xs font-normal">Total sales</p>
              </td>
              {data.map(q => (
                <td key={q.period} className="px-5 py-4 text-right text-white font-mono">{q.revenue}</td>
              ))}
            </tr>

            {/* Gross profit row */}
            <tr className="hover:bg-slate-700/50 transition-colors">
              <td className="px-5 py-4 text-slate-300 font-medium">
                Gross Profit
                <p className="text-slate-500 text-xs font-normal">Revenue minus cost of goods</p>
              </td>
              {data.map(q => (
                <td key={q.period} className="px-5 py-4 text-right text-blue-300 font-mono">{q.grossProfit}</td>
              ))}
            </tr>

            {/* Net income row — green if positive, red if negative */}
            <tr className="hover:bg-slate-700/50 transition-colors">
              <td className="px-5 py-4 text-slate-300 font-medium">
                Net Income
                <p className="text-slate-500 text-xs font-normal">Profit after all expenses & tax</p>
              </td>
              {data.map(q => {
                const isProfit = q.netIncomeRaw >= 0
                return (
                  <td key={q.period} className={`px-5 py-4 text-right font-mono font-semibold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                    {q.netIncome}
                  </td>
                )
              })}
            </tr>

            {/* EPS row */}
            <tr className="hover:bg-slate-700/50 transition-colors">
              <td className="px-5 py-4 text-slate-300 font-medium">
                EPS (Actual)
                <p className="text-slate-500 text-xs font-normal">Earnings per share</p>
              </td>
              {data.map(q => (
                <td key={q.period} className="px-5 py-4 text-right text-amber-300 font-mono">
                  {q.epsActual !== 'N/A' ? q.epsActual.toFixed(2) : 'N/A'}
                </td>
              ))}
            </tr>

            {/* EPS estimate vs actual comparison */}
            <tr className="hover:bg-slate-700/50 transition-colors">
              <td className="px-5 py-4 text-slate-300 font-medium">
                EPS (Estimate)
                <p className="text-slate-500 text-xs font-normal">Analyst forecast</p>
              </td>
              {data.map(q => (
                <td key={q.period} className="px-5 py-4 text-right text-slate-400 font-mono">
                  {q.epsEstimate !== 'N/A' ? q.epsEstimate.toFixed(2) : 'N/A'}
                </td>
              ))}
            </tr>

          </tbody>
        </table>
      </div>
    </div>
  )
}
