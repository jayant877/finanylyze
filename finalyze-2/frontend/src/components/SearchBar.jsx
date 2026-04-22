// ─────────────────────────────────────────────────────────────
// SearchBar.jsx — search input with live dropdown results
//
// Key concepts used here:
//   useState  — tracks input text and search results
//   useEffect — runs side-effects (the API call) when state changes
//   debounce  — waits 400ms after the user stops typing before
//               firing the API call (avoids hammering the server
//               on every single keystroke)
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

// Props: onSelect(symbol) — called when user clicks a result
export default function SearchBar({ onSelect }) {
  const [query,    setQuery]    = useState('')      // what the user typed
  const [results,  setResults]  = useState([])      // search results from backend
  const [open,     setOpen]     = useState(false)   // whether dropdown is visible
  const [loading,  setLoading]  = useState(false)
  const containerRef = useRef(null)                  // ref to detect clicks outside

  // ── Debounced search ────────────────────────────────────────
  // useEffect runs whenever `query` changes.
  // We set a 400ms timer — if query changes again before 400ms,
  // the previous timer is cancelled (the cleanup function).
  // This pattern is called "debouncing".
  useEffect(() => {
    if (query.trim().length < 1) {
      setResults([])
      setOpen(false)
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await axios.get(`/api/stocks/search?q=${encodeURIComponent(query)}`)
        setResults(res.data)
        setOpen(true)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 400) // wait 400ms

    // Cleanup: cancel the timer if query changes before 400ms
    return () => clearTimeout(timer)
  }, [query]) // dependency array — only re-run when `query` changes

  // ── Close dropdown when clicking outside ───────────────────
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSelect(symbol) {
    setQuery('')       // clear the input
    setOpen(false)     // close the dropdown
    onSelect(symbol)   // tell App.jsx which stock was picked
  }

  return (
    <div ref={containerRef} className="relative max-w-xl mx-auto">
      <div className="flex items-center bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 gap-3 focus-within:border-blue-500 transition-colors">
        <span className="text-slate-400">🔍</span>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search stocks — e.g. Apple, Reliance, TCS..."
          className="flex-1 bg-transparent outline-none text-white placeholder-slate-500 text-sm"
        />
        {loading && (
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {/* Dropdown results */}
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-600 rounded-xl overflow-hidden shadow-xl z-50">
          {results.map(stock => (
            <button
              key={stock.symbol}
              onClick={() => handleSelect(stock.symbol)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-700 transition-colors text-left"
            >
              <div>
                <span className="font-mono font-bold text-blue-400 text-sm">{stock.symbol}</span>
                <span className="ml-3 text-slate-300 text-sm">{stock.name}</span>
              </div>
              <span className="text-slate-500 text-xs">{stock.exchange}</span>
            </button>
          ))}
        </div>
      )}

      {open && results.length === 0 && !loading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-slate-500 text-sm">
          No results found for "{query}"
        </div>
      )}
    </div>
  )
}
