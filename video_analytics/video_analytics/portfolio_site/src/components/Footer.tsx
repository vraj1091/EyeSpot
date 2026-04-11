import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';

export default function Footer() {
  const { companyName, contactEmail, contactPhone, contactAddress, media } = useStore();
  
  return (
    <footer className="mt-16 relative z-10 w-full pb-6">
      <div className="site-shell">
        <div className="overflow-hidden rounded-[28px] border border-white/60 bg-white/70 backdrop-blur-xl shadow-[0_30px_90px_-44px_rgba(15,23,42,0.5)]">
        <div className="relative h-36 md:h-44">
          <img src={media.contactImage} alt="Operations command center" className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/60 to-slate-900/15" />
          <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-center">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-200">Ready To Deploy</p>
            <h3 className="mt-2 font-heading text-2xl md:text-3xl text-white font-semibold">
              Turn Existing CCTV Into Actionable Intelligence
            </h3>
          </div>
        </div>

          <div className="px-5 md:px-8 py-12 grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-heading text-2xl text-slate-900 font-semibold">{companyName}</h3>
              <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                Transforming existing CCTV infrastructure into actionable intelligence with enterprise-grade video analytics.
              </p>
            </div>

            <div>
              <p className="muted-label">Contact</p>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <p>{contactEmail}</p>
                <p>{contactPhone}</p>
                <p>{contactAddress}</p>
              </div>
            </div>

            <div>
              <p className="muted-label">Quick Links</p>
              <div className="mt-3 flex flex-col gap-2 text-sm">
                <Link to="/about" className="text-slate-600 hover:text-primary transition-colors">About</Link>
                <Link to="/products" className="text-slate-600 hover:text-primary transition-colors">Solutions</Link>
                <Link to="/contact" className="text-slate-600 hover:text-primary transition-colors">Contact</Link>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 py-4 px-5 md:px-8">
            <div className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} {companyName}. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
