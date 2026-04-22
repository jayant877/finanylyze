# 📊 FinAlyze — Stock Financial Analyser

A full-stack MERN application that lets users search any publicly listed stock and view its quarterly financial results, key valuation metrics, and 1-year price history in real time.

![FinAlyze Screenshot](https://via.placeholder.com/900x450/1e293b/3b82f6?text=FinAlyze+Screenshot)

## Features

- **Live stock search** — search by company name or ticker (supports NSE, BSE, NYSE, NASDAQ)
- **Quarterly results** — revenue, gross profit, net income, and EPS for the last 4 quarters
- **Financial metrics** — market cap, P/E ratio, P/B ratio, EPS, 52-week range, dividend yield
- **1-year price chart** — daily closing prices with gradient fill and 1-year return
- **Revenue vs Net Income chart** — quarterly bar chart for trend analysis
- **Company snapshot** — sector, industry, employee count, business description
- **Watchlist** (optional, requires MongoDB) — save and track favourite stocks per user

## Tech Stack

| Layer     | Technology                     |
|-----------|-------------------------------|
| Frontend  | React 18, Vite, TailwindCSS   |
| Charts    | Recharts                       |
| Backend   | Node.js, Express.js            |
| Database  | MongoDB + Mongoose (optional)  |
| Data API  | yahoo-finance2 (no API key)    |
| HTTP      | Axios                          |

## Project Structure

```
finalyze/
├── backend/
│   ├── server.js          # Express server + MongoDB + watchlist endpoints
│   ├── routes/
│   │   └── stocks.js      # Stock search, overview, quarterly, history endpoints
│   ├── .env.example       # Environment variables template
│   └── package.json
└── frontend/
    ├── src/
    │   ├── App.jsx                      # Root component, manages all state
    │   ├── components/
    │   │   ├── Navbar.jsx               # Top navigation bar
    │   │   ├── SearchBar.jsx            # Debounced live search input
    │   │   ├── StockOverview.jsx        # Price card + key metrics grid
    │   │   ├── QuarterlyTable.jsx       # 4-quarter financial results table
    │   │   ├── QuarterlyChart.jsx       # Revenue vs Net Income bar chart
    │   │   └── PriceChart.jsx           # 1-year closing price area chart
    │   ├── main.jsx
    │   └── index.css
    ├── vite.config.js
    └── package.json
```

## Getting Started

### Prerequisites
- Node.js v18+
- npm
- MongoDB URI (optional — only needed for the watchlist feature)

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/finalyze.git
cd finalyze
```

### 2. Set up the backend
```bash
cd backend
npm install

# Copy the example env file and add your MongoDB URI (optional)
cp .env.example .env
```

### 3. Start the backend
```bash
npm run dev        # uses nodemon for auto-restart on file changes
# OR
npm start          # production start
```
Backend runs on **http://localhost:5000**

### 4. Set up and start the frontend
```bash
cd ../frontend
npm install
npm run dev
```
Frontend runs on **http://localhost:5173**

The frontend's Vite proxy automatically forwards `/api/*` requests to `localhost:5000`, so no CORS configuration is needed in development.

## API Endpoints

| Method | Endpoint                        | Description                        |
|--------|---------------------------------|------------------------------------|
| GET    | `/api/stocks/search?q=apple`    | Search stocks by name or ticker    |
| GET    | `/api/stocks/:symbol`           | Full snapshot for a stock          |
| GET    | `/api/stocks/:symbol/quarterly` | Last 4 quarters of financials      |
| GET    | `/api/stocks/:symbol/history`   | 1-year daily price history         |
| GET    | `/api/watchlist/:userId`        | Fetch user's watchlist (needs DB)  |
| POST   | `/api/watchlist`                | Add stock to watchlist (needs DB)  |
| DELETE | `/api/watchlist/:userId/:symbol`| Remove from watchlist (needs DB)   |

## Example Stocks to Try
- `AAPL` — Apple Inc. (NASDAQ)
- `TSLA` — Tesla Inc. (NASDAQ)
- `RELIANCE.NS` — Reliance Industries (NSE)
- `TCS.NS` — Tata Consultancy Services (NSE)
- `INFY.NS` — Infosys (NSE)
- `HDFCBANK.NS` — HDFC Bank (NSE)

## Key Concepts Used

**Debouncing** — The search bar waits 400ms after the user stops typing before firing an API call. This prevents hammering the server on every keystroke.

**Promise.all()** — When a stock is selected, three API calls (overview, quarterly, history) fire simultaneously instead of sequentially. This cuts load time by ~3x.

**Recharts ResponsiveContainer** — Makes charts automatically resize to fit any screen width without hardcoding pixel dimensions.

**Yahoo Finance 2** — A Node.js library that scrapes Yahoo Finance's public API. No API key or account required. Supports global exchanges including NSE/BSE.

## License
MIT
