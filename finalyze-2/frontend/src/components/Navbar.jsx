// Navbar.jsx — simple top navigation bar
// No state here — it's purely visual (a "dumb" component)

export default function Navbar() {
  return (
    <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📊</span>
          <span className="text-xl font-bold text-white">Fin<span className="text-blue-400">Alyze</span></span>
        </div>
        <p className="text-slate-400 text-sm hidden sm:block">
          Real-time stock financial analyser
        </p>
      </div>
    </nav>
  )
}
