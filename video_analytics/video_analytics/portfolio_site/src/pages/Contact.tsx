import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const pageVariants = {
  initial: { opacity: 0, filter: 'blur(20px)', scale: 0.95 },
  in: { opacity: 1, filter: 'blur(0px)', scale: 1, transition: { duration: 0.8, ease: "easeOut" } },
  out: { opacity: 0, filter: 'blur(20px)', scale: 1.05, transition: { duration: 0.4, ease: "easeIn" } }
};

export default function Contact() {
  const { contactEmail, contactPhone, contactAddress } = useStore();

  return (
    <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} className="space-y-40 pb-20 pt-20">
      
      <section className="text-center max-w-5xl mx-auto space-y-6 md:space-y-10 relative z-10 px-4">
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-5xl sm:text-7xl lg:text-9xl font-black bg-clip-text text-transparent bg-gradient-to-l from-white via-primary to-slate-900 drop-shadow-xl p-2">
          Initialize Uplink
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-xl sm:text-2xl md:text-3xl text-gray-400 font-light leading-relaxed">
          Request physical architecture demonstration, access API endpoints, or speak directly with deployment engineers.
        </motion.p>
      </section>

      <section className="grid lg:grid-cols-2 gap-16 md:gap-20 max-w-[1200px] mx-auto items-stretch px-4">
        
        <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-50px' }} className="space-y-12 md:space-y-16">
          <div className="space-y-4 md:space-y-6 text-center lg:text-left">
            <h3 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2">Direct Vectors</h3>
            <p className="text-gray-400 text-xl md:text-2xl font-light leading-relaxed">Establish a secure comms channel to schedule pilot mapping.</p>
          </div>
          
          <div className="space-y-10 pt-10">
            <div className="flex items-start gap-8 group cursor-pointer">
              <div className="bg-slate-900 border border-white/10 p-6 rounded-[2rem] group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-500 group-hover:border-primary/50 shadow-2xl">
                <Mail className="w-10 h-10 text-primary drop-shadow-[0_0_10px_#38bdf8]" />
              </div>
              <div className="pt-2">
                <div className="text-sm font-black text-primary/70 uppercase tracking-[0.3em] mb-2">Network Protocol</div>
                <div className="text-2xl font-medium text-white tracking-wide group-hover:text-primary transition-colors">{contactEmail}</div>
              </div>
            </div>
            
            <div className="flex items-start gap-8 group cursor-pointer">
              <div className="bg-slate-900 border border-white/10 p-6 rounded-[2rem] group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-500 group-hover:border-primary/50 shadow-2xl">
                <Phone className="w-10 h-10 text-primary drop-shadow-[0_0_10px_#38bdf8]" />
              </div>
              <div className="pt-2">
                <div className="text-sm font-black text-primary/70 uppercase tracking-[0.3em] mb-2">Voice Channel</div>
                <div className="text-xl md:text-2xl font-medium text-white tracking-wide group-hover:text-primary transition-colors">{contactPhone}</div>
              </div>
            </div>

            <div className="flex items-start gap-8 group cursor-pointer">
              <div className="bg-slate-900 border border-white/10 p-6 rounded-[2rem] group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-500 group-hover:border-primary/50 shadow-2xl">
                <MapPin className="w-10 h-10 text-primary drop-shadow-[0_0_10px_#38bdf8]" />
              </div>
              <div className="pt-2 max-w-sm">
                <div className="text-sm font-black text-primary/70 uppercase tracking-[0.3em] mb-2">HQ Coordinates</div>
                <div className="text-xl font-light leading-relaxed text-gray-300 group-hover:text-white transition-colors">{contactAddress}</div>
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-50px' }}>
          <div className="glass-panel p-8 md:p-16 rounded-[2.5rem] md:rounded-[4rem] border-white/10 space-y-8 md:space-y-12 relative overflow-hidden h-full shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
            <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
            <h3 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-4 relative z-10 text-center lg:text-left">Neural Transmission</h3>
            
            <form className="space-y-6 md:space-y-8 relative z-10" onSubmit={e => e.preventDefault()}>
              <div>
                <input 
                  type="text" 
                  placeholder="Identification / Unit Name" 
                  className="w-full bg-slate-900/60 pt-6 pb-5 px-8 rounded-2xl border border-white/5 text-white placeholder-gray-500 focus:border-primary/50 focus:bg-slate-900 shadow-inner outline-none transition-all text-lg font-light tracking-wide"
                />
              </div>
              <div>
                <input 
                  type="email" 
                  placeholder="Secure Return Address" 
                  className="w-full bg-slate-900/60 pt-6 pb-5 px-8 rounded-2xl border border-white/5 text-white placeholder-gray-500 focus:border-primary/50 focus:bg-slate-900 shadow-inner outline-none transition-all text-lg font-light tracking-wide"
                />
              </div>
              <div>
                <textarea 
                  placeholder="Operational Objective Parameters" 
                  rows={6}
                  className="w-full bg-slate-900/60 pt-6 pb-5 px-8 rounded-[2rem] border border-white/5 text-white placeholder-gray-500 focus:border-primary/50 focus:bg-slate-900 shadow-inner outline-none transition-all resize-none text-lg font-light tracking-wide"
                />
              </div>
              <button className="w-full py-5 md:py-6 rounded-2xl font-black tracking-widest uppercase text-base md:text-xl bg-white text-slate-950 hover:bg-primary shadow-[0_15px_30px_rgba(255,255,255,0.2)] hover:shadow-[0_20px_50px_rgba(56,189,248,0.5)] flex items-center justify-center gap-2 md:gap-4 transition-all duration-500 hover:scale-[1.02]">
                <Send className="w-5 h-5 md:w-6 h-6" /> Beam Data
              </button>
            </form>
          </div>
        </motion.div>
        
      </section>
    </motion.div>
  );
}
