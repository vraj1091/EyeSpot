import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const { companyName } = useStore();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/products', label: 'Solutions' },
    { to: '/pricing', label: 'Pricing' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <nav className="fixed top-0 inset-x-0 z-50 py-3">
      <div className="site-shell">
        <div className="rounded-2xl border border-white/70 bg-white/80 backdrop-blur-xl shadow-[0_20px_50px_-32px_rgba(15,23,42,0.5)] px-4 md:px-6 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="z-50 min-w-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-700 border border-blue-500/30 flex items-center justify-center text-white font-heading font-semibold flex-shrink-0">
                {companyName.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-heading text-xl font-semibold text-slate-900 leading-none truncate">{companyName}</p>
                <p className="text-xs text-slate-500 tracking-wide truncate">AI Video Intelligence Platform</p>
              </div>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-2 lg:gap-3 text-sm font-semibold text-slate-600">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  isActive(link.to) ? 'bg-primary/10 text-primary' : 'hover:text-primary hover:bg-slate-100/90'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <Link
              to="/contact"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
            >
              Book a Demo
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden z-50 text-slate-700 p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-2 rounded-2xl border border-white/70 bg-white/95 backdrop-blur-xl shadow-lg px-4 pb-5 pt-4">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold ${
                    isActive(link.to) ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/contact"
                className="inline-flex justify-center px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Book a Demo
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
