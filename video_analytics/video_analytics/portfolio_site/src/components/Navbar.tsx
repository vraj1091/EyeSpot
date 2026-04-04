import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Maximize, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { companyName } = useStore();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 w-full z-50 bg-slate-950/60 backdrop-blur-3xl border-b border-white/5 py-4 px-6 md:py-5 md:px-8 flex justify-between items-center transition-all duration-300">
      <Link to="/" className="flex items-center gap-2 md:gap-3 font-black text-xl md:text-2xl tracking-tighter text-white hover:scale-105 transition-transform origin-left z-50">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center flex-shrink-0">
          <Maximize className="w-4 h-4 text-slate-950" />
        </div>
        <span className="truncate">{companyName.toUpperCase()}</span><span className="text-primary font-light">.AI</span>
      </Link>
      
      {/* Desktop Menu */}
      <div className="hidden md:flex gap-10 items-center text-xs font-bold text-gray-400 tracking-[0.2em] uppercase">
        <Link to="/" className={`${isActive('/') ? 'text-white' : 'hover:text-primary'} transition-colors`}>Core</Link>
        <Link to="/about" className={`${isActive('/about') ? 'text-white' : 'hover:text-primary'} transition-colors`}>Intel</Link>
        <Link to="/products" className={`${isActive('/products') ? 'text-white' : 'hover:text-primary'} transition-colors`}>Modules</Link>
        <Link to="/pricing" className={`${isActive('/pricing') ? 'text-white' : 'hover:text-primary'} transition-colors`}>Deploy</Link>
        <Link to="/contact" className={`${isActive('/contact') ? 'text-white' : 'hover:text-primary'} transition-colors`}>Uplink</Link>
      </div>

      {/* Mobile Menu Toggle */}
      <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden z-50 text-white p-2">
        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-slate-950/95 backdrop-blur-xl border-b border-white/10 md:hidden flex flex-col pt-6 pb-10 space-y-8 text-center shadow-2xl">
          <Link onClick={() => setMobileMenuOpen(false)} to="/" className={`${isActive('/') ? 'text-white' : 'text-gray-400'} font-bold tracking-[0.2em] uppercase text-sm hover:text-primary transition-colors`}>Core</Link>
          <Link onClick={() => setMobileMenuOpen(false)} to="/about" className={`${isActive('/about') ? 'text-white' : 'text-gray-400'} font-bold tracking-[0.2em] uppercase text-sm hover:text-primary transition-colors`}>Intel</Link>
          <Link onClick={() => setMobileMenuOpen(false)} to="/products" className={`${isActive('/products') ? 'text-white' : 'text-gray-400'} font-bold tracking-[0.2em] uppercase text-sm hover:text-primary transition-colors`}>Modules</Link>
          <Link onClick={() => setMobileMenuOpen(false)} to="/pricing" className={`${isActive('/pricing') ? 'text-white' : 'text-gray-400'} font-bold tracking-[0.2em] uppercase text-sm hover:text-primary transition-colors`}>Deploy</Link>
          <Link onClick={() => setMobileMenuOpen(false)} to="/contact" className={`${isActive('/contact') ? 'text-white' : 'text-gray-400'} font-bold tracking-[0.2em] uppercase text-sm hover:text-primary transition-colors`}>Uplink</Link>
        </div>
      )}
    </nav>
  );
}
