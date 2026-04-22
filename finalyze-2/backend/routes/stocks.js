// ─────────────────────────────────────────────────────────────
// routes/stocks.js — all stock-related API endpoints
//
// We use the library `yahoo-finance2` to get real stock data
// from Yahoo Finance — no API key needed, completely free.
//
// Endpoints this file provides:
//   GET /api/stocks/search?q=apple       → search for stocks by name
//   GET /api/stocks/:symbol              → full data for one stock
//   GET /api/stocks/:symbol/quarterly    → quarterly financials
//   GET /api/stocks/:symbol/history      → 1-year price history
// ─────────────────────────────────────────────────────────────

const express = require('express');
const router  = express.Router();         // Router = mini Express app for grouping routes
const yf      = require('yahoo-finance2').default; // yahoo-finance2 fetches real market data

// ── Helper: format large numbers ────────────────────────────
// Converts 1500000000 → "1.50B", 250000000 → "250.00M"
// Makes financial numbers readable in the UI
function formatNumber(num) {
  if (!num && num !== 0) return 'N/A';
  if (Math.abs(num) >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (Math.abs(num) >= 1e9)  return (num / 1e9).toFixed(2)  + 'B';
  if (Math.abs(num) >= 1e6)  return (num / 1e6).toFixed(2)  + 'M';
  return num.toLocaleString();
}

// ─────────────────────────────────────────────────────────────
// GET /api/stocks/search?q=reliance
// Searches for stocks matching the query string
// Used by the SearchBar component in the frontend
// ─────────────────────────────────────────────────────────────
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: 'Query parameter q is required' });

    // yf.search() returns a list of matching quotes (stocks, ETFs, etc.)
    const results = await yf.search(query);

    // We only want stocks (type === 'EQUITY'), not ETFs or crypto
    const stocks = results.quotes
      .filter(q => q.quoteType === 'EQUITY')
      .slice(0, 8) // limit to 8 results
      .map(q => ({
        symbol:      q.symbol,
        name:        q.longname || q.shortname || q.symbol,
        exchange:    q.exchange,
        type:        q.quoteType
      }));

    res.json(stocks);
  } catch (err) {
    console.error('Search error:', err.message);
    res.status(500).json({ error: 'Failed to search stocks' });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/stocks/:symbol
// Returns a complete snapshot of a stock — price, market cap,
// P/E ratio, 52-week high/low, etc.
// Example: GET /api/stocks/AAPL
// ─────────────────────────────────────────────────────────────
router.get('/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();

    // yf.quoteSummary() fetches multiple data modules in one call
    // Each "module" = a different category of data
    const data = await yf.quoteSummary(symbol, {
      modules: [
        'price',            // current price, change, market cap
        'summaryDetail',    // P/E ratio, dividend yield, 52-week range
        'assetProfile',     // company description, industry, sector
        'defaultKeyStatistics' // EPS, book value, short ratio etc.
      ]
    });

    const price   = data.price           || {};
    const summary = data.summaryDetail   || {};
    const profile = data.assetProfile    || {};
    const stats   = data.defaultKeyStatistics || {};

    // Shape the response — only send what the frontend needs
    res.json({
      symbol,
      name:           price.longName || price.shortName || symbol,
      currentPrice:   price.regularMarketPrice,
      change:         price.regularMarketChange,
      changePct:      price.regularMarketChangePercent,
      open:           price.regularMarketOpen,
      high:           price.regularMarketDayHigh,
      low:            price.regularMarketDayLow,
      volume:         formatNumber(price.regularMarketVolume),
      marketCap:      formatNumber(price.marketCap),
      currency:       price.currency || 'USD',
      exchange:       price.exchangeName,

      // Valuation
      peRatio:        summary.trailingPE        ? summary.trailingPE.toFixed(2)  : 'N/A',
      pbRatio:        stats.priceToBook         ? stats.priceToBook.toFixed(2)   : 'N/A',
      eps:            stats.trailingEps         ? stats.trailingEps.toFixed(2)   : 'N/A',
      dividendYield:  summary.dividendYield     ? (summary.dividendYield * 100).toFixed(2) + '%' : 'N/A',
      week52High:     summary.fiftyTwoWeekHigh,
      week52Low:      summary.fiftyTwoWeekLow,

      // Company info
      sector:         profile.sector   || 'N/A',
      industry:       profile.industry || 'N/A',
      description:    profile.longBusinessSummary
                      ? profile.longBusinessSummary.slice(0, 400) + '...'
                      : 'No description available.',
      employees:      profile.fullTimeEmployees ? profile.fullTimeEmployees.toLocaleString() : 'N/A',
      website:        profile.website || null,
    });

  } catch (err) {
    console.error('Stock detail error:', err.message);
    res.status(500).json({ error: `Could not fetch data for ${req.params.symbol}` });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/stocks/:symbol/quarterly
// Returns quarterly income statement data:
// revenue, net income, gross profit for last 4 quarters
// This is the CORE feature of FinAlyze
// ─────────────────────────────────────────────────────────────
router.get('/:symbol/quarterly', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();

    const data = await yf.quoteSummary(symbol, {
      modules: ['incomeStatementHistoryQuarterly', 'earningsHistory']
    });

    const statements = data.incomeStatementHistoryQuarterly?.incomeStatementHistory || [];
    const earnings   = data.earningsHistory?.history || [];

    // Map quarterly income statements into clean objects
    const quarterly = statements.slice(0, 4).map((q, i) => {
      const eps = earnings[i];
      return {
        period:       q.endDate ? new Date(q.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : `Q${i+1}`,
        revenue:      formatNumber(q.totalRevenue),
        grossProfit:  formatNumber(q.grossProfit),
        netIncome:    formatNumber(q.netIncome),
        // Raw values for chart calculations
        revenueRaw:   q.totalRevenue   || 0,
        netIncomeRaw: q.netIncome      || 0,
        // EPS = Earnings Per Share (profit divided by number of shares)
        // Higher is better — shows how much profit each share earns
        epsActual:    eps?.epsActual   ?? 'N/A',
        epsEstimate:  eps?.epsEstimate ?? 'N/A',
      };
    });

    res.json({ symbol, quarterly });

  } catch (err) {
    console.error('Quarterly error:', err.message);
    res.status(500).json({ error: `Could not fetch quarterly data for ${req.params.symbol}` });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/stocks/:symbol/history
// Returns 1-year daily closing prices for the price chart
// ─────────────────────────────────────────────────────────────
router.get('/:symbol/history', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    // yf.historical() fetches OHLCV (Open/High/Low/Close/Volume) candle data
    const history = await yf.historical(symbol, {
      period1: oneYearAgo,
      period2: new Date(),
      interval: '1d'  // daily candles
    });

    // Only send date and closing price — we only need this for the line chart
    const prices = history.map(day => ({
      date:  day.date.toISOString().split('T')[0], // "2024-01-15"
      close: parseFloat(day.close.toFixed(2))
    }));

    res.json({ symbol, prices });

  } catch (err) {
    console.error('History error:', err.message);
    res.status(500).json({ error: `Could not fetch price history for ${req.params.symbol}` });
  }
});

module.exports = router;
