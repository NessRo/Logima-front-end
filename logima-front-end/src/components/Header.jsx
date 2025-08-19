import { useState } from 'react';
import { ArrowRight, Menu, X, Zap, LogOut  } from 'lucide-react';
import { authApi } from "@/lib/api";
import { Logo } from '@/components/logo';

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await authApi.logout(); // server clears cookies
    } catch (_) {
      /* ignore */
    } finally {
      setIsLoggingOut(false);
      window.location.href = "/login"; // or use navigate("/login")
    }
  }

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
          <Logo className="text-white/90 hover:text-white transition-colors" />
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
        {/* Logout pinned at the very bottom */}
        <div className="absolute bottom-0 inset-x-0 p-4 border-t border-white/10 bg-[#0f0f10]">
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-100 font-medium py-2.5 px-4 rounded-lg transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoggingOut ? (
              <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogOut size={18} />
                Logout
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
