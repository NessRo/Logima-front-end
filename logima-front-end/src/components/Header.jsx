import { useState } from 'react';
import { ArrowRight, Menu, X, Zap } from 'lucide-react';

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* --- Fixed full‑viewport dark backdrop --- */}
      <div className="fixed inset-0 -z-20 bg-gradient-to-br from-[#101010] via-[#141414] to-[#0d0d0d] pointer-events-none" />

      {/* --- Top bar with hamburger on left --- */}
      <header className="fixed top-0 inset-x-0 z-30 h-14 flex items-center justify-between px-6 bg-black/60 backdrop-blur border-b border-white/10">
        {/* Hamburger button */}
        <button
          aria-label="Toggle navigation menu"
          className="text-gray-300 hover:text-white transition-colors mr-4"
          onClick={() => setMenuOpen(true)}
        >
          <Menu size={22} />
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2 select-none">
          <Zap size={22} className="text-violet-400" />
          <span className="text-white font-semibold">Logima</span>
        </div>

        {/* Empty spacer to balance flex */}
        <div className="w-6" />
      </header>

      {/* --- Overlay --- */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMenuOpen(false)}
      />

      {/* --- Slide‑out drawer from left --- */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-[#111111] border-r border-white/10 transform transition-transform duration-300 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Close button */}
        <button
          aria-label="Close navigation menu"
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
          onClick={() => setMenuOpen(false)}
        >
          <X size={24} />
        </button>

        {/* Nav links */}
        <nav className="mt-20 flex flex-col gap-6 px-8 text-lg text-gray-200">
          {['Guide', 'Docs', 'Pricing', 'Blog'].map((item) => (
            <a
              key={item}
              href="#"
              className="hover:text-white transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {item}
            </a>
          ))}
        </nav>
      </aside>
    </>
  );
}
