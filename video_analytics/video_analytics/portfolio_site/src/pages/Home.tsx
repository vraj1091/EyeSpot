import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { ChevronRight, Cpu, ShieldAlert, Server, Lock, Building2, Car, Factory, Target } from 'lucide-react';
import SEO from '../components/SEO';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  in: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
  out: { opacity: 0, y: -12, transition: { duration: 0.3, ease: 'easeIn' } },
};

export default function Home() {
  const { tagline, companyName, media } = useStore();
  const metrics = [
    { label: 'Latency Target', val: '< 15ms' },
    { label: 'Uptime Protocol', val: '99.999%' },
    { label: 'Active Streams', val: '500k+' },
    { label: 'False Alerts', val: '0.01%' },
  ];

  const architecture = [
    {
      icon: Server,
      title: 'Ingestion Layer',
      description:
        'Connects directly to existing IP cameras via RTSP/ONVIF. No new physical hardware required. Feeds stream instantly into local processing nodes without hitting the internet.',
    },
    {
      icon: Cpu,
      title: 'Neural Inference',
      description:
        'Executes highly specialized spatio-temporal graph convolutional networks to map human skeleton vectors and trace object interaction paths instantaneously on local edge silicon.',
    },
    {
      icon: Target,
      title: 'Action Command',
      description:
        'Triggers programmatic webhooks, dispatches SMS alerts to security teams, or takes secure control of PTZ cameras to autonomously follow suspects through restricted zones.',
    },
  ];

  const industries = [
    {
      icon: Building2,
      title: 'Commercial Retail',
      description:
        'Eliminate shrinkage with predictive shoplifting modules mapping concealment gestures. Ensure frictionless autonomous checkout using multi-camera hand-to-shelf spatial triangulation.',
    },
    {
      icon: Factory,
      title: 'Critical Infrastructure',
      description:
        'Deploy air-gapped thermal fusion detection to guard volatile chemical pipelines and server grids. Secure total perimeter immunity in sub-zero and absolutely zero-light scenarios.',
    },
    {
      icon: Car,
      title: 'Smart Urban Mobility',
      description:
        'Correlate millions of license plates moving at 150mph across city sectors. Track sovereign threats traversing interstates via high-speed database cross-referencing and crowd-density mapping.',
    },
    {
      icon: Lock,
      title: 'Secure Governance',
      description:
        'Fully encrypted, on-premises sovereign networks providing infinite cold-storage retention. Person Re-Identification ensuring high-value target tracing without relying on compromised facial vectors.',
    },
  ];

  return (
    <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} className="space-y-16 pb-20">
      <SEO
        title={`${companyName} - World's Most Advanced Video Analytics OS`}
        description={tagline}
        keywords="video analytics, edge AI, computer vision, security AI, real-time analytics, facial recognition, shoplifting detection"
      />
      <section className="pt-8">
        <div className="section-card overflow-hidden p-2">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-2">
            <div className="p-8 md:p-12 lg:p-14">
              <span className="premium-chip">Enterprise Video Analytics Platform</span>
              <h1 className="mt-5 font-heading text-4xl md:text-6xl text-slate-900 font-semibold leading-[1.05] text-balance">
                Transform Peripheral CCTV Footage Into Actionable Insights
              </h1>
              <p className="mt-6 text-base md:text-lg text-slate-600 leading-relaxed max-w-2xl">
                {tagline} We process raw optical data at the physical edge to eliminate cloud latency,
                providing military-grade predictive threat detection globally.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-white font-semibold hover:bg-primary/90 transition-colors"
                >
                  Explore Modules <ChevronRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-slate-700 font-semibold hover:border-primary hover:text-primary transition-colors"
                >
                  Book a Free Demo
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-2">
                <span className="premium-chip">Retail</span>
                <span className="premium-chip">Manufacturing</span>
                <span className="premium-chip">Smart Cities</span>
                <span className="premium-chip">Public Sector</span>
              </div>
            </div>

            <div className="relative min-h-[420px] lg:min-h-full rounded-[24px] overflow-hidden">
              <img src={media.heroImage} alt="Security analytics monitoring wall" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/35 to-slate-950/10" />
              <div className="absolute inset-x-4 bottom-4 grid grid-cols-2 gap-3">
                {metrics.map((metric) => (
                  <div key={metric.label} className="rounded-xl border border-white/15 bg-slate-900/45 backdrop-blur-md p-3 text-white">
                    <p className="font-heading text-xl font-semibold">{metric.val}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-wider text-slate-300">{metric.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-card p-6 md:p-8">
        <p className="muted-label text-center">Trusted By Security And Operations Teams</p>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
          {['AERODEFENSE', 'NEXUS GRID', 'VANGUARD', 'FEDERAL GROUP', 'QUANTUM'].map((name) => (
            <div key={name} className="rounded-xl bg-white border border-slate-200 px-4 py-3 text-center text-xs md:text-sm font-semibold text-slate-600 shadow-sm">
              {name}
            </div>
          ))}
        </div>
      </section>

      <section className="section-card p-8 md:p-10">
        <div className="grid xl:grid-cols-[0.92fr_1.08fr] gap-8">
          <div className="space-y-5">
            <p className="muted-label">What Is {companyName}?</p>
            <h2 className="section-title">The Edge Architecture</h2>
            <p className="text-slate-600 leading-relaxed">
              Legacy CCTV systems are passive observation tools. {companyName} transforms them into an intelligent
              neural net that actively dissects physical environments in real-time.
            </p>
            <div className="image-frame h-72">
              <img src={media.architectureImage} alt="Edge AI architecture" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent" />
            </div>
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-1 gap-5">
            {architecture.map((item, index) => (
              <article key={item.title} className="rounded-2xl border border-white/60 p-5 bg-white/80 shadow-[0_20px_40px_-28px_rgba(15,23,42,0.55)]">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-500">0{index + 1}</p>
                </div>
                <h3 className="mt-4 font-heading text-2xl text-slate-900 font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-card overflow-hidden p-0">
        <div className="relative h-72 md:h-80">
          <img src={media.industriesImage} alt="Urban monitoring and smart infrastructure" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/60 to-slate-900/25" />
          <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-center max-w-3xl">
            <p className="muted-label text-slate-200">Industries We Serve</p>
            <h2 className="mt-3 font-heading text-3xl md:text-5xl font-semibold text-white">Dominate Every Environment</h2>
            <p className="mt-4 text-slate-200/90 leading-relaxed">
              Our scalable artificial intelligence protocols are explicitly trained to conquer the unique physical
              challenges of enterprise-class sectors.
            </p>
          </div>
        </div>
        <div className="p-6 md:p-8 grid md:grid-cols-2 gap-5 bg-white/80">
          {industries.map((industry, index) => (
            <article key={industry.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <industry.icon className="w-5 h-5" />
                </div>
                <p className="font-heading text-2xl text-slate-300 font-semibold">0{index + 1}</p>
              </div>
              <h3 className="mt-4 font-heading text-2xl text-slate-900 font-semibold">{industry.title}</h3>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">{industry.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-card p-2 overflow-hidden">
        <div className="grid lg:grid-cols-[0.7fr_1.3fr] gap-2">
          <div className="image-frame min-h-[320px]">
            <img src={media.contactImage} alt="Security command operations room" />
          </div>
          <div className="rounded-[24px] bg-slate-900 text-white p-8 md:p-12">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-accent" />
            </div>
            <h2 className="mt-5 font-heading text-3xl md:text-5xl font-semibold">Total Data Sovereignty</h2>
            <p className="mt-4 text-slate-300 leading-relaxed">
              {companyName} never streams your raw video feeds to external clouds. Absolute processing happens directly
              inside your physical network boundaries, ensuring instant compliance with GDPR, HIPAA, and federal
              communications integrity regulations.
            </p>
            <Link
              to="/contact"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white text-slate-900 px-5 py-3 font-semibold hover:bg-slate-100 transition-colors"
            >
              Inquire For Enterprise Audit <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
