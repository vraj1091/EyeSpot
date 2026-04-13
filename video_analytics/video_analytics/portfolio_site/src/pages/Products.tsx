import { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import {
  Shield, Activity, Zap, Search, Fingerprint, Eye, CheckCircle2,
  Building2, HardHat, Warehouse, FlaskConical, Factory, HeartPulse,
  Car, Lock, Store, ArrowRight, ChevronRight, type LucideIcon,
} from 'lucide-react';
import SEO from '../components/SEO';

const iconList = [Shield, Activity, Zap, Search, Fingerprint, Eye];

const iconMap: Record<string, LucideIcon> = {
  Store, Building2, Factory, Car, Lock, HardHat, Warehouse, FlaskConical, HeartPulse,
};

/* -------- detection icon per keyword -------- */
const detIconMap: Record<string, LucideIcon> = {
  ppe: HardHat, fall: Activity, queue: Store, crowd: Building2,
  fork: Warehouse, dock: Warehouse, aisle: Warehouse, cargo: Warehouse,
  sterile: FlaskConical, sop: FlaskConical, tailgat: FlaskConical, foreign: FlaskConical,
  defect: Factory, machine: Factory, ergon: Factory, production: Factory,
  patient: HeartPulse, bed: HeartPulse, aggress: HeartPulse, wander: HeartPulse,
  plate: Car, wrong: Car, intersect: Car, parking: Car,
  thermal: Lock, vegeta: Lock, pipeline: Lock, drone: Lock, fire: Lock,
  shoplifting: Store, heatmap: Store, shelf: Store, checkout: Store,
  perimeter: Shield, intrusion: Shield, restricted: Shield, material: HardHat,
};

function getDetectionIcon(name: string): LucideIcon {
  const lc = name.toLowerCase();
  for (const [key, Icon] of Object.entries(detIconMap)) {
    if (lc.includes(key)) return Icon;
  }
  return CheckCircle2;
}

const statusStyles: Record<string, { label: string; pill: string; dot: string }> = {
  live: {
    label: 'Live',
    pill: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  pilot: {
    label: 'Pilot',
    pill: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  'coming-soon': {
    label: 'Coming Soon',
    pill: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-400',
  },
};

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};

export default function Products() {
  const { products, companyName, media, industries } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const initIndustry = searchParams.get('industry') || industries[0]?.id || 'retail';
  const [activeIndustry, setActiveIndustry] = useState(initIndustry);
  const [expandedDet, setExpandedDet] = useState<string | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  const selectedIndustry = industries.find((ind) => ind.id === activeIndustry) || industries[0];

  // React to URL param changes (e.g. from navbar mega-menu)
  useEffect(() => {
    const param = searchParams.get('industry');
    if (param && industries.find((i) => i.id === param)) {
      setActiveIndustry(param);
      setExpandedDet(null);
    }
  }, [searchParams]);

  function selectIndustry(id: string) {
    setActiveIndustry(id);
    setExpandedDet(null);
    setSearchParams({ industry: id });
    detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <motion.div initial="initial" animate="in" exit="out"
      variants={{ initial: { opacity: 0, y: 16 }, in: { opacity: 1, y: 0, transition: { duration: 0.45 } }, out: { opacity: 0 } }}
      className="space-y-16 pb-24 pt-4"
    >
      <SEO
        title={`AI Solutions By Industry | ${companyName}`}
        description="Explore our computer vision solutions across Retail, Construction, Warehousing, Pharmaceuticals, Manufacturing, Healthcare, Smart Cities, and Energy."
        keywords="behavioral analytics AI, shoplifting detection, PPE detection, warehouse safety AI, pharmaceutical compliance AI"
      />

      {/* ── Hero ── */}
      <section className="section-card p-2 overflow-hidden">
        <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-2">
          <div className="image-frame min-h-[320px]">
            <img src={media.productsHeroImage} alt="AI video analytics solutions" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 to-transparent" />
          </div>
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <span className="premium-chip mb-4">8 Industries · 40+ Detections</span>
            <h1 className="font-heading text-4xl md:text-6xl font-semibold text-slate-900 leading-tight">
              Solutions By Industry
            </h1>
            <p className="mt-5 max-w-xl text-slate-600 leading-relaxed">
              One intelligent edge-AI engine. Purpose-built detection modules for every enterprise sector.
              Select your industry and instantly explore every capability built for your exact environment.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              {['live', 'pilot', 'coming-soon'].map((s) => (
                <span key={s} className="inline-flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${statusStyles[s].dot}`} />
                  {statusStyles[s].label}
                </span>
              ))}
            </div>
            <Link
              to="/book-demo?source=products-hero"
              className="mt-8 inline-flex items-center gap-2 self-start rounded-lg bg-primary px-5 py-3 text-white font-semibold hover:bg-primary/90 transition-colors"
            >
              Book a Live Demo <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Main: Sidebar + Bento ── */}
      <section>
        <div className="flex gap-6 items-start">

          {/* ── Sidebar ── */}
          <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 sticky top-24">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Select Industry</p>
              </div>
              <nav className="py-2">
                {industries.map((ind) => {
                  const IconComp = iconMap[ind.icon] || Building2;
                  const isActive = ind.id === activeIndustry;
                  const s = statusStyles[ind.status];
                  return (
                    <button
                      key={ind.id}
                      onClick={() => selectIndustry(ind.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                        isActive
                          ? 'bg-primary/8 border-r-2 border-primary text-primary'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                        isActive ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-semibold truncate ${isActive ? 'text-primary' : ''}`}>
                          {ind.title.split(' & ')[0]}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                          <span className="text-[10px] text-slate-400">{s.label}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* ── Mobile tab strip ── */}
          <div className="lg:hidden w-full mb-4">
            <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
              {industries.map((ind) => {
                const IconComp = iconMap[ind.icon] || Building2;
                const isActive = ind.id === activeIndustry;
                return (
                  <button
                    key={ind.id}
                    onClick={() => selectIndustry(ind.id)}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap flex-shrink-0 transition-colors ${
                      isActive
                        ? 'bg-primary text-white shadow-[0_10px_24px_-14px_rgba(13,78,216,0.75)]'
                        : 'bg-white border border-slate-200 text-slate-600 hover:border-primary hover:text-primary'
                    }`}
                  >
                    <IconComp className="w-4 h-4" />
                    {ind.title.split(' & ')[0]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Bento Detail Pane ── */}
          <div className="flex-1 min-w-0" ref={detailRef}>
            <AnimatePresence mode="wait">
              {selectedIndustry && (
                <motion.div
                  key={selectedIndustry.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Industry Header */}
                  <div className="section-card p-7 md:p-8 mb-6">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-primary text-white`}>
                        {(() => {
                          const IconComp = iconMap[selectedIndustry.icon] || Building2;
                          return <IconComp className="w-6 h-6" />;
                        })()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-heading text-3xl md:text-4xl font-semibold text-slate-900">
                            {selectedIndustry.title}
                          </h2>
                          <span className={`text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full border ${statusStyles[selectedIndustry.status].pill}`}>
                            {statusStyles[selectedIndustry.status].label}
                          </span>
                        </div>
                        <p className="text-slate-500 text-sm mt-1">
                          {selectedIndustry.detections.length} detection modules
                        </p>
                      </div>
                    </div>
                    <p className="text-slate-600 leading-relaxed max-w-3xl mt-4">{selectedIndustry.subtitle}</p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <Link
                        to={`/book-demo?source=products&industry=${selectedIndustry.id}`}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
                      >
                        Request {selectedIndustry.title.split(' & ')[0]} Demo <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Bento Detection Grid */}
                  <motion.div
                    variants={stagger}
                    initial="initial"
                    animate="animate"
                    className="grid md:grid-cols-2 xl:grid-cols-3 gap-5"
                  >
                    {selectedIndustry.detections.map((det, i) => {
                      const DetIcon = getDetectionIcon(det.name);
                      const s = statusStyles[det.status];
                      const isExpanded = expandedDet === det.id;
                      const isFeatured = i === 0; // first card is "featured" – spans 2 cols on xl

                      return (
                        <motion.article
                          key={det.id}
                          variants={fadeUp}
                          onClick={() => setExpandedDet(isExpanded ? null : det.id)}
                          className={`rounded-2xl border bg-white shadow-sm cursor-pointer transition-all duration-200 overflow-hidden
                            ${isFeatured ? 'xl:col-span-2' : ''}
                            ${isExpanded
                              ? 'border-primary/40 shadow-[0_16px_40px_-16px_rgba(13,78,216,0.2)]'
                              : 'border-slate-200 hover:border-primary/30 hover:shadow-md'
                            }`}
                        >
                          <div className="p-5 md:p-6">
                            {/* Card top */}
                            <div className="flex items-start justify-between gap-3 mb-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                                isExpanded ? 'bg-primary text-white' : 'bg-primary/10 text-primary'
                              }`}>
                                <DetIcon className="w-5 h-5" />
                              </div>
                              <span className={`text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full border flex-shrink-0 ${s.pill}`}>
                                {s.label}
                              </span>
                            </div>

                            <h3 className="font-heading text-lg md:text-xl text-slate-900 font-semibold leading-snug">
                              {det.name}
                            </h3>
                            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                              {det.description}
                            </p>

                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 pt-4 border-t border-slate-100"
                              >
                                <div className="flex flex-wrap gap-2">
                                  {['YOLOv8 Backbone', 'Edge Inference', 'Real-time Alerts', 'API Webhook'].map((tag) => (
                                    <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-medium">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                                <Link
                                  to={`/book-demo?source=det&det=${det.id}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary font-semibold hover:underline"
                                >
                                  Request this module <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                              </motion.div>
                            )}
                          </div>
                          {/* Click hint */}
                          <div className={`px-5 pb-3 text-[10px] text-slate-400 transition-opacity ${isExpanded ? 'opacity-0 h-0' : 'opacity-100'}`}>
                            Click to expand
                          </div>
                        </motion.article>
                      );
                    })}
                  </motion.div>

                  {/* CTA strip */}
                  <div className="mt-8 rounded-2xl bg-slate-900 text-white p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
                    <div>
                      <p className="font-heading text-xl font-semibold">
                        Ready to deploy in {selectedIndustry.title.split(' & ')[0]}?
                      </p>
                      <p className="text-slate-400 text-sm mt-1">
                        Get a live pilot evaluation set up in under 48 hours.
                      </p>
                    </div>
                    <Link
                      to={`/book-demo?source=industry-cta&industry=${selectedIndustry.id}`}
                      className="flex-shrink-0 inline-flex items-center gap-2 rounded-lg bg-white text-slate-900 px-5 py-3 font-semibold text-sm hover:bg-slate-100 transition-colors"
                    >
                      Start Pilot <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ── Core Platform Modules ── */}
      <section>
        <div className="mb-6">
          <p className="muted-label">Shared Intelligence Stack</p>
          <h2 className="section-title mt-2">Core Platform Modules</h2>
          <p className="text-slate-500 mt-3 max-w-2xl">
            These foundational capabilities power every industry vertical — shared across all deployments for consistent, production-grade performance.
          </p>
        </div>
        <div className="grid lg:grid-cols-2 gap-5 items-stretch">
          {products.map((p, i) => {
            const IconComponent = iconList[p.iconIndex ?? i % iconList.length];
            return (
              <motion.article
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="section-card overflow-hidden p-0 flex flex-col"
              >
                <div className="image-frame rounded-none rounded-t-[24px] border-0 border-b border-slate-200 h-52">
                  <img src={p.image || media.productsHeroImage} alt={`${p.name} feature`} loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 to-transparent" />
                </div>
                <div className="p-7 md:p-8 flex-1 flex flex-col">
                  <header className="flex items-start gap-4 mb-6">
                    <div className="bg-primary/10 border border-primary/20 w-12 h-12 rounded-lg flex items-center justify-center text-primary flex-shrink-0">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <h2 className="font-heading text-2xl md:text-3xl font-semibold text-slate-900 leading-tight">
                      {p.name}
                    </h2>
                  </header>
                  <div className="space-y-5 flex-1">
                    <p className="text-slate-700 text-base leading-relaxed border-l-4 border-primary/20 pl-4">
                      {p.description}
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {p.longDescription || 'Advanced technical specification operating at sub-millisecond edge computational thresholds.'}
                    </p>
                    <div className="pt-2">
                      <h4 className="text-xs font-semibold tracking-widest text-slate-500 uppercase mb-3">Core Specifications</h4>
                      <ul className="space-y-3">
                        {p.features && p.features.length > 0 ? (
                          p.features.map((feat, idx) => (
                            <li key={idx} className="flex gap-3 items-start text-slate-700">
                              <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{feat}</span>
                            </li>
                          ))
                        ) : (
                          <li className="flex gap-3 items-start text-slate-700">
                            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-sm">Custom Architectural Deployment Validated</span>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>
    </motion.div>
  );
}
