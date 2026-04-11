import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { CheckCircle2, Hexagon } from 'lucide-react';
import SEO from '../components/SEO';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  in: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
  out: { opacity: 0, y: -12, transition: { duration: 0.3, ease: 'easeIn' } },
};

export default function Pricing() {
  const { plans, companyName, media } = useStore();
  const [cycle, setCycle] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');

  const filteredPlans = plans.filter(p => p.type === cycle);

  return (
    <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} className="space-y-16 pb-20 pt-4">
      <SEO
        title={`Scale The Edge | ${companyName} Deployment Pricing`}
        description="View scalable, military-grade Edge Edge AI architectures for single grids to city-wide tracking ops."
        keywords="edge AI pricing, video analytics deployment, city surveillance pricing"
      />

      <section className="section-card p-2 overflow-hidden">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-2">
          <div className="p-8 md:p-12">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-heading text-4xl md:text-6xl font-semibold text-slate-900 leading-tight">
              Scale The Protocol
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="mt-5 text-slate-600 leading-relaxed max-w-3xl">
              From independent retail perimeters to absolute city-wide surveillance frameworks. Access highly-tuned Neural Nodes with total scaling flexibility.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8 inline-flex flex-wrap justify-center items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 p-2">
          {(['monthly', 'quarterly', 'yearly'] as const).map(c => (
            <button
              key={c}
              onClick={() => setCycle(c)}
              className={`px-4 py-2 rounded-lg font-semibold uppercase tracking-wide text-xs transition-colors ${
                cycle === c ? 'bg-primary text-white' : 'text-slate-600 hover:text-primary'
              }`}
            >
              {c}
            </button>
          ))}
        </motion.div>
          </div>
          <div className="image-frame min-h-[300px]">
            <img src={media.pricingImage} alt="Analytics dashboard and growth charts" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 to-transparent" />
          </div>
        </div>
      </section>

      <section>
        <AnimatePresence mode="wait">
          <motion.div
            key={cycle}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="grid md:grid-cols-2 xl:grid-cols-4 gap-5 items-stretch"
          >
            {filteredPlans.map((plan, i) => {
              const recommended = i === 2;
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl border p-6 flex flex-col ${
                    recommended
                      ? 'border-primary/40 bg-gradient-to-b from-primary/10 to-white shadow-card'
                      : 'border-slate-200 bg-white/90'
                  }`}
                >
                  {recommended && (
                    <div className="absolute -top-3 left-6 rounded-full bg-primary text-white text-[10px] font-semibold tracking-wide uppercase px-3 py-1">
                      Recommended
                    </div>
                  )}

                  <div className={`flex-col flex h-full ${recommended ? 'pt-3' : ''}`}>
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-heading text-xl font-semibold text-slate-900">{plan.name}</h3>
                        <Hexagon className={`w-5 h-5 ${recommended ? 'text-primary' : 'text-slate-300'}`} />
                      </div>
                      <div className="font-heading text-4xl font-semibold text-slate-900">
                        {plan.price}
                      </div>
                      {plan.price !== 'Custom' && (
                        <div className="text-xs font-semibold tracking-widest text-slate-500 uppercase mt-1">/ {cycle}</div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h4 className="text-xs font-semibold tracking-widest text-slate-500 uppercase mb-3">Included Systems</h4>
                      <ul className="space-y-3">
                        {plan.features.map((f, j) => (
                          <li key={j} className="flex gap-3 text-slate-700 text-sm">
                            <CheckCircle2 className={`w-4 h-4 flex-shrink-0 mt-0.5 ${recommended ? 'text-primary' : 'text-slate-400'}`} />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button className={`w-full py-3 rounded-lg font-semibold text-sm transition-colors mt-7 ${
                      recommended
                        ? 'bg-primary text-white hover:bg-primary/90'
                        : 'bg-slate-900 text-white hover:bg-slate-700'
                    }`}>
                      {plan.price === 'Custom' ? 'Contact Team' : 'Get Started'}
                    </button>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
            <div className="p-7 md:p-8">
              <h3 className="font-heading text-2xl md:text-3xl font-semibold text-slate-900">Custom AI Training Ops</h3>
              <p className="mt-3 text-slate-600 text-sm md:text-base leading-relaxed">
                Require specialized detection mechanics? We ingest your proprietary video data and train elite, highly
                specific logic models exclusively tailored for your physical infrastructure and compliance needs.
              </p>
              <button className="mt-6 w-full md:w-auto px-5 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                Design Custom Model
              </button>
            </div>
            <div className="image-frame rounded-none border-0 border-l border-slate-200 min-h-[240px]">
              <img src={media.architectureImage} alt="Custom AI model training operations" />
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
