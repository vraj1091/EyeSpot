import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Maximize } from 'lucide-react';

export default function Navbar() {
  const { companyName } = useStore();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 w-full z-50 bg-slate-950/60 backdrop-blur-3xl border-b border-white/5 py-5 px-8 flex justify-between items-center transition-all duration-300">
      <Link to="/" className="flex items-center gap-3 font-black text-2xl tracking-tighter text-white hover:scale-105 transition-transform origin-left">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center">
          <Maximize className="w-4 h-4 text-slate-950" />
        </div>
        {companyName.toUpperCase()}<span className="text-primary font-light">.AI</span>
      </Link>
      
      <div className="hidden md:flex gap-10 items-center text-xs font-bold text-gray-400 tracking-[0.2em] uppercase">
        <Link to="/" className={`${isActive('/') ? 'text-white' : 'hover:text-primary'} transition-colors`}>Core</Link>
        <Link to="/about" className={`${isActive('/about') ? 'text-white' : 'hover:text-primary'} transition-colors`}>Intel</Link>
        <Link to="/products" className={`${isActive('/products') ? 'text-white' : 'hover:text-primary'} transition-colors`}>Modules</Link>
        <Link to="/pricing" className={`${isActive('/pricing') ? 'text-white' : 'hover:text-primary'} transition-colors`}>Deploy</Link>
        <Link to="/contact" className={`${isActive('/contact') ? 'text-white' : 'hover:text-primary'} transition-colors`}>Uplink</Link>
        
      </div>
    </nav>
  );
}
