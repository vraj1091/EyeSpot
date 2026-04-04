import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { Users, Eye, Target } from 'lucide-react';
import SEO from '../components/SEO';

const pageVariants = {
  initial: { opacity: 0, filter: 'blur(20px)', scale: 0.95 },
  in: { opacity: 1, filter: 'blur(0px)', scale: 1, transition: { duration: 0.8, ease: "easeOut" } },
  out: { opacity: 0, filter: 'blur(20px)', scale: 1.05, transition: { duration: 0.4, ease: "easeIn" } }
};

export default function About() {
  const { companyName, team, vision, mission, aboutText } = useStore();

  return (
    <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} className="space-y-40 pb-20 pt-20">
      <SEO 
        title={`Core Intel | ${companyName} Team & Mission`} 
        description={aboutText.substring(0, 150) + "..."}
        keywords="edge AI team, computer vision engineers, AI architects"
      />
      <section className="text-center max-w-5xl mx-auto space-y-10 relative z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full pointer-events-none z-0 mix-blend-screen" />
        
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-white/80 to-slate-600 drop-shadow-lg">
          Core Intel
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-2xl md:text-3xl text-gray-400 font-light leading-relaxed max-w-4xl mx-auto relative z-10">
          {aboutText}
        </motion.p>
      </section>

      <section className="grid md:grid-cols-2 gap-16 max-w-7xl mx-auto items-stretch">
        <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-100px' }} className="glass-panel p-16 rounded-[3rem] space-y-8 flex flex-col justify-center border-t-2 border-primary/20 hover:border-primary/50 transition-colors">
          <Eye className="w-16 h-16 text-primary drop-shadow-[0_0_20px_#38bdf8]" />
          <h3 className="text-5xl font-black tracking-tight text-white mb-2">Our Vision</h3>
          <p className="text-gray-400 leading-relaxed text-2xl font-light">{vision}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-100px' }} className="glass-panel p-16 rounded-[3rem] space-y-8 flex flex-col justify-center border-t-2 border-accent/20 hover:border-accent/50 transition-colors bg-slate-900/60">
          <Target className="w-16 h-16 text-accent drop-shadow-[0_0_20px_#818cf8]" />
          <h3 className="text-5xl font-black tracking-tight text-white mb-2">Our Mission</h3>
          <p className="text-gray-400 leading-relaxed text-2xl font-light">{mission}</p>
        </motion.div>
      </section>

      <section className="space-y-24 pb-32">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <h2 className="text-6xl font-black text-white">The AI Node Command</h2>
          <p className="text-2xl text-gray-400 font-light tracking-wide">Elite pioneers behind the {companyName} neural architecture.</p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-16 max-w-7xl mx-auto">
          {team.map((t, i) => (
            <motion.div 
              key={t.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ delay: i * 0.15, duration: 0.8 }}
              className="text-center group relative cursor-pointer glass-panel p-10 rounded-[3rem] hover:border-white/20 transition-all duration-700 flex flex-col items-center"
            >
              <div className="mx-auto w-48 h-48 rounded-full border-2 border-white/5 bg-gradient-to-br from-slate-900/80 to-slate-950 shadow-[0_30px_60px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden relative mb-8 group-hover:border-primary/30 transition-all duration-700 group-hover:-translate-y-2">
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl mix-blend-overlay" />
                <Users className="w-20 h-20 text-white/20 group-hover:text-primary transition-all duration-700 scale-90 group-hover:scale-110 drop-shadow-[0_0_15px_rgba(56,189,248,0)] group-hover:drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]" />
              </div>
              <div>
                <h3 className="text-3xl font-black tracking-tight text-white mb-2">{t.name}</h3>
                <p className="text-primary font-black text-sm tracking-[0.2em] uppercase mb-4">{t.role}</p>
                <p className="italic font-serif text-white/50 text-xl mb-6">"{t.slogan}"</p>
                <div className="h-px w-1/4 bg-white/10 mx-auto mb-6 transition-all group-hover:w-1/2 group-hover:bg-primary/50" />
                <p className="text-gray-400 font-light leading-relaxed">{t.details}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}
