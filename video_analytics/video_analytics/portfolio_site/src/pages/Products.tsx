import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { Shield, Activity, Zap, Search, Fingerprint, Eye, CheckCircle2 } from 'lucide-react';
import SEO from '../components/SEO';

const iconList = [Shield, Activity, Zap, Search, Fingerprint, Eye];

const pageVariants = {
  initial: { opacity: 0, filter: 'blur(20px)', scale: 0.95 },
  in: { opacity: 1, filter: 'blur(0px)', scale: 1, transition: { duration: 0.8, ease: "easeOut" } },
  out: { opacity: 0, filter: 'blur(20px)', scale: 1.05, transition: { duration: 0.4, ease: "easeIn" } }
};

export default function Products() {
  const { products, companyName } = useStore();

  return (
    <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} className="space-y-40 pb-20 pt-20 relative">
      <SEO 
        title={`Intelligence Modules | ${companyName} AI Solutions`} 
        description="Explore our cutting-edge computer vision analytics. From tracking shoplifting vectors to complete virtual perimeters and AI autonomous retail scanning."
        keywords="behavioral analytics AI, shoplifting detection, perimeter intrusion computer vision"
      />
      
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/10 blur-[200px] pointer-events-none rounded-full" />
      
      <section className="text-center max-w-5xl mx-auto space-y-10 relative z-10 px-4">
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-6xl md:text-9xl font-black bg-clip-text text-transparent bg-gradient-to-br from-white via-primary to-slate-900 drop-shadow-xl leading-tight pb-2">
          Intelligence Modules
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-2xl md:text-3xl text-gray-400 font-light leading-relaxed">
          Military-grade deep learning matrices optimized for the Edge. Zero latency. Infinite scale.
        </motion.p>
      </section>

      <section className="grid lg:grid-cols-2 gap-16 max-w-7xl mx-auto items-stretch px-4">
        {products.map((p, i) => {
          const IconComponent = iconList[p.iconIndex ?? i % iconList.length];
          return (
            <motion.article 
              key={p.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="glass-panel p-10 md:p-14 rounded-[3rem] flex flex-col hover:-translate-y-2 transition-all duration-500 border-white/5 hover:border-primary/40 group bg-slate-900/40 relative overflow-hidden"
            >
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-[80px] group-hover:bg-primary/20 transition-colors duration-700 pointer-events-none" />
              
              <header className="flex items-center gap-6 mb-8 relative z-10">
                <div className="bg-slate-900 border border-white/10 w-24 h-24 rounded-3xl flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-slate-950 transition-all duration-700 shadow-2xl rotate-3 group-hover:rotate-0 flex-shrink-0">
                  <IconComponent className="w-10 h-10 drop-shadow-lg" />
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight group-hover:text-primary transition-colors leading-tight">
                  {p.name}
                </h2>
              </header>
              
              <div className="relative z-10 space-y-8 flex-1">
                <p className="text-gray-300 text-2xl font-light italic border-l-4 border-primary/40 pl-6 leading-relaxed">
                  {p.description}
                </p>
                
                <p className="text-gray-400 text-lg leading-loose font-medium">
                  {p.longDescription || "Advanced technical specification operating at sub-millisecond edge computational thresholds."}
                </p>

                <div className="pt-8">
                  <h4 className="text-sm font-black tracking-widest text-primary uppercase mb-4">Core Specifications</h4>
                  <ul className="space-y-4">
                    {(p.features && p.features.length > 0) ? p.features.map((feat, idx) => (
                      <li key={idx} className="flex gap-4 items-start text-gray-300">
                        <CheckCircle2 className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                        <span className="text-lg font-light">{feat}</span>
                      </li>
                    )) : (
                      <li className="flex gap-4 items-start text-gray-300">
                        <CheckCircle2 className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                        <span className="text-lg font-light">Custom Architectural Deployment Validated</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>

            </motion.article>
          );
        })}
      </section>
    </motion.div>
  );
}
