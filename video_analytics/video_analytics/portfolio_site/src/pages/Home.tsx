import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { ChevronRight, Cpu, Eye, ShieldAlert, Workflow, Server, Lock, Building2, Car, Factory, Target } from 'lucide-react';
import SEO from '../components/SEO';

const pageVariants = {
  initial: { opacity: 0, filter: 'blur(20px)', scale: 0.95 },
  in: { opacity: 1, filter: 'blur(0px)', scale: 1, transition: { duration: 0.8, ease: "easeOut" } },
  out: { opacity: 0, filter: 'blur(20px)', scale: 1.05, transition: { duration: 0.4, ease: "easeIn" } }
};

export default function Home() {
  const { tagline, companyName } = useStore();

  return (
    <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} className="space-y-40 pb-20">
      <SEO 
        title={`${companyName} - World's Most Advanced Video Analytics OS`} 
        description={tagline}
        keywords="video analytics, edge AI, computer vision, security AI, real-time analytics, facial recognition, shoplifting detection"
      />
      
      {/* 1. HERO SECTION */}
      <section className="min-h-[85vh] flex flex-col justify-center items-center text-center relative mt-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary/10 blur-[200px] rounded-full pointer-events-none z-0 mix-blend-screen" />
        
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }} className="space-y-10 max-w-6xl z-10 relative px-4">
          
          <div className="inline-flex self-center items-center gap-4 px-8 py-3 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
            <span className="w-3 h-3 rounded-full bg-primary animate-pulse shadow-[0_0_15px_#38bdf8]" />
            <span className="text-sm md:text-base font-black tracking-[0.2em] text-primary uppercase">System Live: Deep Inference Engine V4.2</span>
          </div>

          <h1 className="text-7xl md:text-[10rem] font-black leading-[0.9] tracking-tighter">
            <span className="text-white drop-shadow-2xl">{companyName}</span><br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-primary to-slate-800 drop-shadow-2xl">Vision OS.</span>
          </h1>
          
          <p className="text-2xl md:text-4xl text-gray-400 font-light max-w-5xl mx-auto leading-relaxed mt-12 bg-slate-900/40 p-8 rounded-3xl border border-white/5 backdrop-blur-md">
            {tagline} We process raw optical data at the physical edge to eliminate cloud latency, providing military-grade predictive threat detection globally.
          </p>
          
          <div className="pt-16 flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link to="/products" className="group flex items-center gap-4 bg-white text-slate-950 px-12 py-6 rounded-full font-black tracking-[0.2em] uppercase hover:bg-primary transition-all shadow-[0_0_50px_rgba(255,255,255,0.2)] hover:shadow-[0_0_80px_rgba(56,189,248,0.5)] text-lg">
              Initialize Modules <ChevronRight className="w-6 h-6 group-hover:translate-x-3 transition-transform" />
            </Link>
            <Link to="/contact" className="px-12 py-6 rounded-full font-black tracking-[0.2em] uppercase text-gray-300 hover:text-white border border-white/20 hover:border-white/50 hover:bg-white/5 transition-all text-lg shadow-lg">
              Request Uplink
            </Link>
          </div>
          
          {/* Key Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-24 border-t border-white/10 mt-20">
            {[
              { label: 'Latency Target', val: '< 15ms' },
              { label: 'Uptime Protocol', val: '99.999%' },
              { label: 'Active Streams', val: '500k+' },
              { label: 'False Alerts', val: '0.01%' }
            ].map((metric, idx) => (
              <div key={idx} className="space-y-2">
                <div className="text-4xl md:text-5xl font-black text-white drop-shadow-lg">{metric.val}</div>
                <div className="text-sm font-bold tracking-widest text-primary uppercase opacity-80">{metric.label}</div>
              </div>
            ))}
          </div>

        </motion.div>
      </section>

      {/* SECURE PARTNERS BANNER */}
      <section className="relative z-10 py-10 border-y border-white/5 bg-slate-950/50 backdrop-blur-sm overflow-hidden">
        <p className="text-center text-xs font-black tracking-[0.4em] text-gray-600 uppercase mb-10">Trusted By Global Security Coalitions</p>
        <div className="flex justify-center flex-wrap gap-12 md:gap-24 opacity-40 grayscale items-center px-4">
          <div className="text-2xl font-black tracking-tighter">AERO<span className="font-light">DEFENSE</span></div>
          <div className="text-2xl font-black tracking-widest uppercase">Nexus GRID</div>
          <div className="text-2xl font-black tracking-tighter italic">Vanguard Corp.</div>
          <div className="text-2xl font-serif font-black tracking-widest text-transparent styling-stroke border-white">FEDERAL RESERVE</div>
          <div className="text-2xl font-black tracking-tighter decoration-4 underline">QUANTUM</div>
        </div>
      </section>

      {/* 2. CORE ARCHITECTURE */}
      <section className="max-w-7xl mx-auto px-6 relative z-10 pt-20">
        <div className="text-center space-y-8 mb-24">
          <h2 className="text-6xl md:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent drop-shadow-md">The Edge Architecture</h2>
          <p className="text-xl md:text-2xl text-gray-400 font-light max-w-4xl mx-auto leading-relaxed">
            Legacy CCTV systems are passive observation tools. {companyName} transforms them into an intelligent neural net that actively dissects physical environments in real-time.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-12">
          {[ 
            { i: Server, t: 'Ingestion Layer', d: 'Connects directly to existing IP cameras via RTSP/ONVIF. No new physical hardware required. Feeds stream instantly into local processing nodes without hitting the internet.' }, 
            { i: Cpu, t: 'Neural Inference', d: 'Executes highly specialized spatio-temporal graph convolutional networks to map human skeleton vectors and trace object interaction paths instantaneously on local edge silicon.' }, 
            { i: Target, t: 'Action Command', d: 'Triggers programmatic webhooks, dispatches SMS alerts to security teams, or takes secure control of PTZ cameras to autonomously follow suspects through restricted zones.' }
          ].map((Feat, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ delay: idx * 0.2 }} className="glass-panel p-14 rounded-[3rem] border-white/10 hover:border-primary/40 transition-colors group bg-slate-900/60 shadow-[0_30px_60px_rgba(0,0,0,0.4)] hover:-translate-y-4 duration-500">
              <div className="flex justify-between items-start mb-12">
                <div className="w-24 h-24 rounded-[2rem] bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-primary/20 transition-all scale-110 group-hover:rotate-12 shadow-inner">
                  <Feat.i className="w-12 h-12 text-white group-hover:text-primary transition-colors drop-shadow-md" />
                </div>
                <div className="text-7xl font-black text-white/5 font-sans group-hover:text-primary/10 transition-colors">0{idx+1}</div>
              </div>
              <h3 className="text-3xl lg:text-4xl font-black tracking-tight mb-6 text-white leading-tight">{Feat.t}</h3>
              <p className="text-gray-400 leading-relaxed text-xl font-light">{Feat.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. INDUSTRY VERTICALS */}
      <section className="relative w-full border-y border-white/10 bg-slate-950/80 backdrop-blur-md py-40 z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-[800px] bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="space-y-8 mb-24 max-w-4xl">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-none">Dominate Every Environment</h2>
            <p className="text-2xl text-gray-400 font-light leading-relaxed">
              Our scalable artificial intelligence protocols are explicitly trained to conquer the unique physical challenges of enterprise-class sectors.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 border-t border-white/10 pt-20">
            <div className="space-y-8 p-12 rounded-[3.5rem] bg-slate-900/40 hover:bg-slate-900 transition-colors border border-transparent hover:border-white/10 shadow-2xl hover:-translate-y-2 duration-500">
              <Building2 className="w-20 h-20 text-primary drop-shadow-[0_0_15px_#38bdf8]" />
              <h3 className="text-4xl md:text-5xl font-black text-white tracking-tight">Commercial Retail</h3>
              <p className="text-gray-400 text-xl leading-loose font-light">Eliminate shrinkage with predictive shoplifting modules mapping concealment gestures. Ensure frictionless autonomous checkout using multi-camera hand-to-shelf spatial triangulation.</p>
            </div>
            <div className="space-y-8 p-12 rounded-[3.5rem] bg-slate-900/40 hover:bg-slate-900 transition-colors border border-transparent hover:border-white/10 shadow-2xl hover:-translate-y-2 duration-500 delay-75">
              <Factory className="w-20 h-20 text-accent drop-shadow-[0_0_15px_#818cf8]" />
              <h3 className="text-4xl md:text-5xl font-black text-white tracking-tight">Critical Infrastructure</h3>
              <p className="text-gray-400 text-xl leading-loose font-light">Deploy air-gapped thermal fusion detection to guard volatile chemical pipelines and server grids. Secure total perimeter immunity in sub-zero and absolutely zero-light scenarios.</p>
            </div>
            <div className="space-y-8 p-12 rounded-[3.5rem] bg-slate-900/40 hover:bg-slate-900 transition-colors border border-transparent hover:border-white/10 shadow-2xl hover:-translate-y-2 duration-500">
              <Car className="w-20 h-20 text-primary drop-shadow-[0_0_15px_#38bdf8]" />
              <h3 className="text-4xl md:text-5xl font-black text-white tracking-tight">Smart Urban Mobility</h3>
              <p className="text-gray-400 text-xl leading-loose font-light">Correlate millions of license plates moving at 150mph across city sectors. Track sovereign threats traversing interstates via high-speed database cross-referencing and crowd-density mapping.</p>
            </div>
            <div className="space-y-8 p-12 rounded-[3.5rem] bg-slate-900/40 hover:bg-slate-900 transition-colors border border-transparent hover:border-white/10 shadow-2xl hover:-translate-y-2 duration-500 delay-75">
              <Lock className="w-20 h-20 text-accent drop-shadow-[0_0_15px_#818cf8]" />
              <h3 className="text-4xl md:text-5xl font-black text-white tracking-tight">Secure Governance</h3>
              <p className="text-gray-400 text-xl leading-loose font-light">Fully encrypted, on-premises sovereign networks providing infinite cold-storage retention. Person Re-Identification ensuring high-value target tracing without relying on compromised facial vectors.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECURITY & COMPLIANCE CTA */}
      <section className="max-w-6xl mx-auto px-6 text-center space-y-16 relative z-10 pb-32 pt-20">
        <div className="inline-flex items-center justify-center p-8 bg-white/5 rounded-full mb-8 border border-white/10 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <ShieldAlert className="w-16 h-16 text-accent drop-shadow-[0_0_15px_#818cf8]" />
        </div>
        <h2 className="text-6xl md:text-[5rem] font-black text-white leading-none tracking-tighter">Total Data Sovereignty</h2>
        <p className="text-2xl md:text-3xl text-gray-400 font-light leading-relaxed max-w-4xl mx-auto">
          {companyName} never streams your raw video feeds to external clouds. Absolute processing happens directly inside your physical network boundaries, ensuring instant compliance with GDPR, HIPAA, and federal communications integrity regulations.
        </p>
        <div className="flex justify-center pt-16">
          <Link to="/contact" className="px-16 py-8 bg-white text-slate-950 font-black tracking-[0.2em] uppercase rounded-[3rem] hover:bg-accent hover:text-white shadow-[0_15px_40px_rgba(255,255,255,0.2)] hover:shadow-[0_20px_60px_rgba(129,140,248,0.6)] transition-all text-2xl hover:scale-105 active:scale-95 duration-300 flex items-center gap-4">
            Inquire For Enterprise Audit <ChevronRight className="w-8 h-8" />
          </Link>
        </div>
      </section>

    </motion.div>
  );
}
