import { Video } from 'lucide-react'

export default function Header() {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <a href="#" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/60 backdrop-blur-xl border border-white/40 text-lg font-semibold text-violet-600 shadow-lg shadow-black/5">
            <Video size={36} />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight text-slate-900">Oxide Stream</p>
            <p className="text-xs text-slate-500">See every amazing moment</p>
          </div>
        </a>
      </nav>
    </header>
  )
}