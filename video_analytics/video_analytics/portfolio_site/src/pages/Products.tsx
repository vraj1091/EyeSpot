import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { Shield, Activity, Zap, Search, Fingerprint, Eye, CheckCircle2 } from 'lucide-react';
import SEO from '../components/SEO';

const iconList = [Shield, Activity, Zap, Search, Fingerprint, Eye];

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  in: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
  out: { opacity: 0, y: -12, transition: { duration: 0.3, ease: 'easeIn' } },
};

export default function Products() {
  const { products, companyName, media } = useStore();

  return (
    <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} className="space-y-16 pb-20 pt-4 relative">
      <SEO
        title={`Intelligence Modules | ${companyName} AI Solutions`}
        description="Explore our cutting-edge computer vision analytics. From tracking shoplifting vectors to complete virtual perimeters and AI autonomous retail scanning."
        keywords="behavioral analytics AI, shoplifting detection, perimeter intrusion computer vision"
      />

      <section className="section-card p-2 overflow-hidden">
        <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-2">
          <div className="image-frame min-h-[320px]">
            <img src={media.productsHeroImage} alt="AI video analytics solutions interface" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
          </div>
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-heading text-4xl md:text-6xl font-semibold text-slate-900 leading-tight">
              Intelligence Modules
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="mt-5 max-w-3xl text-slate-600 leading-relaxed">
              Military-grade deep learning matrices optimized for the Edge. Zero latency. Infinite scale.
            </motion.p>
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-2 gap-5 items-stretch">
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
                    {p.longDescription ||
                      'Advanced technical specification operating at sub-millisecond edge computational thresholds.'}
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
      </section>
    </motion.div>
  );
}
