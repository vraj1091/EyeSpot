import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { CheckCircle2, Hexagon } from 'lucide-react';
import SEO from '../components/SEO';

const pageVariants = {
  initial: { opacity: 0, filter: 'blur(20px)', scale: 0.95 },
  in: { opacity: 1, filter: 'blur(0px)', scale: 1, transition: { duration: 0.8, ease: "easeOut" } },
  out: { opacity: 0, filter: 'blur(20px)', scale: 1.05, transition: { duration: 0.4, ease: "easeIn" } }
};

export default function Pricing() {
  const { plans, companyName } = useStore();
  const [cycle, setCycle] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');

  const filteredPlans = plans.filter(p => p.type === cycle);

  return (
    <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} className="space-y-40 pb-20 pt-20">
      <SEO 
        title={`Scale The Edge | ${companyName} Deployment Pricing`} 
        description="View scalable, military-grade Edge Edge AI architectures for single grids to city-wide tracking ops."
        keywords="edge AI pricing, video analytics deployment, city surveillance pricing"
      />
      
      <section className="text-center max-w-5xl mx-auto space-y-6 md:space-y-10 relative z-10 px-4">
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-6xl lg:text-8xl font-black bg-clip-text text-transparent bg-gradient-to-tr from-white via-primary to-slate-800 drop-shadow-xl p-2">
          Scale The Protocol
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-lg md:text-xl lg:text-2xl text-gray-400 font-light leading-relaxed max-w-3xl mx-auto">
          From independent retail perimeters to absolute city-wide surveillance frameworks. Access highly-tuned Neural Nodes with total scaling flexibility.
        </motion.p>
        
        {/* Cycle Toggle */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex flex-wrap justify-center items-center gap-2 md:gap-1 bg-slate-900 border border-white/10 p-2 rounded-[2rem] md:rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          {(['monthly', 'quarterly', 'yearly'] as const).map(c => (
            <button
              key={c}
              onClick={() => setCycle(c)}
              className={`px-6 py-2 md:px-8 md:py-3 rounded-full font-bold uppercase tracking-widest text-xs md:text-sm transition-all duration-300 ${
                cycle === c ? 'bg-primary text-slate-950 shadow-[0_0_20px_rgba(56,189,248,0.4)]' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {c}
            </button>
          ))}
        </motion.div>
      </section>

      <section className="max-w-[1600px] mx-auto px-4">
        <AnimatePresence mode="wait">
          <motion.div 
            key={cycle}
            initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
            transition={{ duration: 0.4 }}
            className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8 items-stretch"
          >
            {filteredPlans.map((plan, i) => {
              const recommended = i === 2; // Make Grid the recommended plan visually
              return (
                <div 
                  key={plan.id}
                  className={`p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border relative flex flex-col transition-all duration-700 ${
                    recommended 
                      ? 'border-primary/50 bg-primary/10 shadow-[0_0_50px_rgba(56,189,248,0.15)] z-20 backdrop-blur-3xl xl:scale-105' 
                      : 'border-white/5 glass-panel opacity-90 hover:opacity-100 hover:border-white/20'
                  }`}
                >
                  {recommended && (
                    <div className="absolute top-0 inset-x-0 mx-auto w-max bg-primary text-slate-950 text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase px-8 py-2 rounded-b-xl z-30 shadow-[0_10px_20px_rgba(56,189,248,0.4)]">
                      RECOMMENDED ARCHITECTURE
                    </div>
                  )}
                  
                  <div className={`relative z-10 flex-col flex h-full ${recommended ? 'pt-6' : ''}`}>
                    <div className="mb-8">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-black text-white uppercase tracking-widest">{plan.name}</h3>
                        <Hexagon className={`w-6 h-6 md:w-8 md:h-8 flex-shrink-0 ${recommended ? 'text-primary' : 'text-gray-600'}`} />
                      </div>
                      <div className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500 drop-shadow-xl align-baseline leading-none pt-2 pb-2">
                        {plan.price}
                      </div>
                      {plan.price !== 'Custom' && <div className="text-sm font-bold tracking-widest text-primary uppercase mt-1">/ {cycle}</div>}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="text-xs font-black tracking-widest text-gray-500 uppercase mb-4 border-b border-white/10 pb-2">Included Systems</h4>
                      <ul className="space-y-4">
                        {plan.features.map((f, j) => (
                          <li key={j} className="flex flex-start gap-4 text-gray-300 font-light text-base lg:text-lg">
                            <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${recommended ? 'text-primary' : 'text-primary/40'}`} />
                            <span className="leading-tight">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <button className={`w-full py-4 rounded-full font-black tracking-widest uppercase text-sm transition-all duration-500 mt-10 shadow-lg hover:scale-105 active:scale-95 ${
                      recommended 
                        ? 'bg-primary text-slate-950 hover:bg-white shadow-[0_10px_30px_-10px_rgba(56,189,248,0.6)]' 
                        : 'bg-white/5 border border-white/10 hover:bg-white/10 text-white'
                    }`}>
                      {plan.price === 'Custom' ? 'Contact Intel' : 'Initialize Node'}
                    </button>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        <div className="mt-16 md:mt-20 glass-panel p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] border-accent/20 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-10 bg-slate-900/60 shadow-[0_0_80px_rgba(129,140,248,0.1)] text-center md:text-left">
          <div className="space-y-4 max-w-2xl">
            <h3 className="text-3xl md:text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-accent to-primary">Custom AI Training Ops</h3>
            <p className="text-gray-400 text-base md:text-lg leading-relaxed">Require specialized detection mechanics? We ingest your proprietary video data and train elite, highly specific logic models exclusively tailored for your physical infrastructure and compliance needs.</p>
          </div>
          <button className="w-full md:w-auto px-8 py-4 md:px-10 md:py-5 bg-white text-slate-950 font-black tracking-widest uppercase rounded-2xl md:rounded-full hover:bg-accent hover:text-white transition-all shadow-[0_15px_30px_rgba(255,255,255,0.2)] hover:shadow-[0_20px_40px_rgba(129,140,248,0.6)]">
            Design Bespoke Model
          </button>
        </div>
      </section>
    </motion.div>
  );
}
