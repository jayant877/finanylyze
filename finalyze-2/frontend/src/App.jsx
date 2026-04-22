// ─────────────────────────────────────────────────────────────
// App.jsx — root component, owns all shared state
//
// State = data that React watches. When state changes, React
// automatically re-renders the parts of the UI that use it.
//
// We use useState() hooks to store:
//   selectedSymbol — which stock the user picked
//   stockData      — snapshot info (price, market cap, P/E…)
//   quarterly      — array of quarterly results
//   history        — array of daily closing prices (for chart)
//   loading        — whether a fetch is in progress
//   error          — any error message to show
// ─────────────────────────────────────────────────────────────

import { useState, useCallback } from 'react'
import axios from 'axios'       // axios = nicer alternative to fetch() for API calls
import Navbar from './components/Navbar'
import SearchBar from './components/SearchBar'
import StockOverview from './components/StockOverview'
import QuarterlyTable from './components/QuarterlyTable'
import PriceChart from './components/PriceChart'
import QuarterlyChart from './components/QuarterlyChart'

export default function App() {
  // useState returns [currentValue, setterFunction]
  // calling the setter function updates the value AND triggers a re-render
  const [stockData,  setStockData]  = useState(null)
  const [quarterly,  setQuarterly]  = useState([])
  const [history,    setHistory]    = useState([])
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState(null)
  const [activeTab,  setActiveTab]  = useState('overview') // 'overview' | 'quarterly' | 'chart'

  // ── handleSelectStock ───────────────────────────────────────
  // Called when the user clicks a stock from the search dropdown.
  // Fires THREE parallel API calls using Promise.all() — much
  // faster than firing them one-by-one and waiting for each.
  const handleSelectStock = useCallback(async (symbol) => {
    setLoading(true)
    setError(null)
    setStockData(null)
    setQuarterly([])
    setHistory([])
    setActiveTab('overview')

    try {
      // Promise.all runs all three fetches AT THE SAME TIME
      const [overviewRes, quarterlyRes, historyRes] = await Promise.all([
        axios.get(`/api/stocks/${symbol}`),
        axios.get(`/api/stocks/${symbol}/quarterly`),
        axios.get(`/api/stocks/${symbol}/history`),
      ])

      setStockData(overviewRes.data)
      setQuarterly(quarterlyRes.data.quarterly)
      setHistory(historyRes.data.prices)
    } catch (err) {
      // err.response.data.error = the message we set in the backend
      setError(err.response?.data?.error || 'Something went wrong. Try a different symbol.')
    } finally {
      // finally runs whether or not there was an error
      setLoading(false)
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* Search bar — always visible at the top */}
        <SearchBar onSelect={handleSelectStock} />

        {/* Loading spinner */}
        {loading && (
          <div className="flex items-center justify-center mt-16">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="ml-4 text-slate-400">Fetching data...</span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mt-8 p-4 bg-red-900/40 border border-red-700 rounded-lg text-red-300">
            {error}
          </div>
        )}

        {/* Main content — only shown when stockData is loaded */}
        {stockData && !loading && (
          <>
            {/* Tab switcher */}
            <div className="flex gap-2 mt-8 border-b border-slate-700 pb-0">
              {['overview', 'quarterly', 'chart'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium capitalize rounded-t transition-colors
                    ${activeTab === tab
                      ? 'bg-slate-800 text-blue-400 border border-slate-700 border-b-slate-800 -mb-px'
                      : 'text-slate-400 hover:text-slate-200'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab panels */}
            <div className="mt-6">
              {activeTab === 'overview'  && <StockOverview data={stockData} />}
              {activeTab === 'quarterly' && (
                <>
                  <QuarterlyTable data={quarterly} />
                  <QuarterlyChart data={quarterly} />
                </>
              )}
              {activeTab === 'chart'     && <PriceChart data={history} symbol={stockData.symbol} />}
            </div>
          </>
        )}

        {/* Landing state — shown before any stock is searched */}
        {!stockData && !loading && !error && (
          <div className="text-center mt-24 text-slate-500">
            <p className="text-5xl mb-4">📈</p>
            <p className="text-lg">Search for any stock to see its financial analysis</p>
            <p className="text-sm mt-2">Try: AAPL, RELIANCE.NS, TCS.NS, TSLA, INFY.NS</p>
          </div>
        )}
      </main>
    </div>
  )
}
