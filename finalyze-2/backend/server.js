// ─────────────────────────────────────────────────────────────
// server.js — the brain of the backend
//
// This file:
//  1. Creates an Express web server
//  2. Connects to MongoDB to store user watchlists
//  3. Registers the /api/stocks routes
//  4. Starts listening on port 5000
// ─────────────────────────────────────────────────────────────

const express  = require('express');   // Express = framework to handle HTTP requests
const cors     = require('cors');      // CORS = lets our React frontend (port 3000) talk to this backend (port 5000)
const mongoose = require('mongoose');  // Mongoose = makes it easy to read/write MongoDB
const dotenv   = require('dotenv');    // dotenv = loads secrets from .env file so we don't hardcode passwords

dotenv.config(); // reads .env file and puts values into process.env

const app = express(); // create the Express application

// ── Middleware ────────────────────────────────────────────────
// Middleware = functions that run on every request before your route handler
app.use(cors());                        // allow requests from any origin (frontend)
app.use(express.json());                // parse JSON bodies (so req.body works)

// ── Routes ───────────────────────────────────────────────────
// We split routes into a separate file to keep things organised
const stockRoutes = require('./routes/stocks');
app.use('/api/stocks', stockRoutes);    // all routes in stocks.js are prefixed with /api/stocks

// ── MongoDB connection ────────────────────────────────────────
// Only connect if MONGO_URI is set in .env — this is optional for the app to work
if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch((err) => console.error('MongoDB error:', err));
} else {
  console.log('ℹ️  No MONGO_URI set — running without database (watchlist disabled)');
}

// ── Watchlist Schema ─────────────────────────────────────────
// A Schema = blueprint for documents stored in MongoDB
// This stores a user's saved stocks (their watchlist)
const watchlistSchema = new mongoose.Schema({
  userId:    { type: String, required: true },   // identifier for the user
  symbol:    { type: String, required: true },   // stock ticker e.g. "AAPL"
  addedAt:   { type: Date,   default: Date.now } // timestamp
});

const Watchlist = mongoose.model('Watchlist', watchlistSchema);

// ── Watchlist endpoints ───────────────────────────────────────
// GET /api/watchlist/:userId  — fetch all saved stocks for a user
app.get('/api/watchlist/:userId', async (req, res) => {
  try {
    const items = await Watchlist.find({ userId: req.params.userId });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/watchlist  — add a stock to a user's watchlist
// Body: { userId: "u1", symbol: "AAPL" }
app.post('/api/watchlist', async (req, res) => {
  try {
    const { userId, symbol } = req.body;
    const existing = await Watchlist.findOne({ userId, symbol });
    if (existing) return res.json({ message: 'Already in watchlist' });

    const item = await Watchlist.create({ userId, symbol: symbol.toUpperCase() });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/watchlist/:userId/:symbol  — remove a stock from watchlist
app.delete('/api/watchlist/:userId/:symbol', async (req, res) => {
  try {
    await Watchlist.deleteOne({ userId: req.params.userId, symbol: req.params.symbol });
    res.json({ message: 'Removed from watchlist' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Start server ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 FinAlyze backend running on http://localhost:${PORT}`);
});
