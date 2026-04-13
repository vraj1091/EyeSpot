import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Menu, X, ChevronDown, Building2, HardHat, Warehouse, FlaskConical, Factory, HeartPulse, Car, Lock, Store, type LucideIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const iconMap: Record<string, LucideIcon> = {
  Store, Building2, Factory, Car, Lock, HardHat, Warehouse, FlaskConical, HeartPulse,
};

const statusDot: Record<string, string> = {
  live: 'bg-emerald-500',
  pilot: 'bg-amber-500',
  'coming-soon': 'bg-blue-400',
};

export default function Navbar() {
  const { companyName, industries } = useStore();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const megaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileMenuOpen(false);
    setMegaOpen(false);
  }, [location.pathname]);

  // Close mega-menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) {
        setMegaOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const staticLinks = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/pricing', label: 'Pricing' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <nav className="fixed top-0 inset-x-0 z-50 py-3">
      <div className="site-shell">
        <div className="rounded-2xl border border-white/70 bg-white/85 backdrop-blur-xl shadow-[0_20px_50px_-32px_rgba(15,23,42,0.5)] px-4 md:px-6 py-3 flex items-center justify-between gap-4">
          {/* Logo */}
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

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-semibold text-slate-600">
            {staticLinks.slice(0, 2).map((link) => (
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

            {/* Industries mega-menu trigger */}
            <div className="relative" ref={megaRef}>
              <button
                onClick={() => setMegaOpen((p) => !p)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
                  isActive('/products') || megaOpen
                    ? 'bg-primary/10 text-primary'
                    : 'hover:text-primary hover:bg-slate-100/90'
                }`}
              >
                Industries
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${megaOpen ? 'rotate-180' : ''}`} />
              </button>

              {megaOpen && (
                <div className="absolute top-[calc(100%+10px)] left-1/2 -translate-x-1/2 w-[640px] rounded-2xl border border-slate-200 bg-white shadow-[0_32px_64px_-20px_rgba(15,23,42,0.25)] p-5 z-50">
                  {/* Header */}
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Industries We Serve</p>
                    <Link
                      to="/products"
                      className="text-xs text-primary font-semibold hover:underline"
                      onClick={() => setMegaOpen(false)}
                    >
                      View All →
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {industries.map((ind) => {
                      const IconComp = iconMap[ind.icon] || Building2;
                      return (
                        <Link
                          key={ind.id}
                          to={`/products?industry=${ind.id}`}
                          onClick={() => setMegaOpen(false)}
                          className="group flex items-start gap-3 rounded-xl p-3 hover:bg-slate-50 transition-colors"
                        >
                          <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                            <IconComp className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-slate-800 truncate">{ind.title.split(' & ')[0]}</p>
                              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusDot[ind.status]}`} />
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{ind.subtitle}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Live</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Pilot Program</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400" /> Coming Soon</span>
                  </div>
                </div>
              )}
            </div>

            {staticLinks.slice(2).map((link) => (
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
              to="/book-demo?source=navbar"
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

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 rounded-2xl border border-white/70 bg-white/95 backdrop-blur-xl shadow-lg px-4 pb-5 pt-4">
            <div className="flex flex-col gap-1">
              {staticLinks.slice(0, 2).map((link) => (
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
              {/* Industries mobile section */}
              <div className="px-3 py-2">
                <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-2">Industries</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {industries.map((ind) => {
                    const IconComp = iconMap[ind.icon] || Building2;
                    return (
                      <Link
                        key={ind.id}
                        to={`/products?industry=${ind.id}`}
                        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                      >
                        <IconComp className="w-3.5 h-3.5 text-primary" />
                        {ind.title.split(' & ')[0]}
                      </Link>
                    );
                  })}
                </div>
              </div>
              {staticLinks.slice(2).map((link) => (
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
                to="/book-demo?source=menu"
                className="inline-flex justify-center px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors mt-1"
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
