import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { Users, Eye, Target } from 'lucide-react';
import SEO from '../components/SEO';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  in: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
  out: { opacity: 0, y: -12, transition: { duration: 0.3, ease: 'easeIn' } },
};

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((token) => token[0]?.toUpperCase() ?? '')
    .join('') || 'TM';

export default function About() {
  const { companyName, team, vision, mission, aboutText, media } = useStore();

  return (
    <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} className="space-y-16 pb-20 pt-4">
      <SEO
        title={`Core Intel | ${companyName} Team & Mission`}
        description={`${aboutText.substring(0, 150)}...`}
        keywords="edge AI team, computer vision engineers, AI architects"
      />

      <section className="section-card p-2 overflow-hidden">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-2">
          <div className="p-8 md:p-12">
            <p className="muted-label">About {companyName}</p>
            <h1 className="mt-4 font-heading text-4xl md:text-6xl text-slate-900 font-semibold leading-tight">
              Building Reliable Intelligence for Real-World Operations
            </h1>
            <p className="mt-6 max-w-4xl text-slate-600 leading-relaxed">{aboutText}</p>
          </div>
          <div className="image-frame min-h-[320px] lg:min-h-full">
            <img src={media.aboutImage} alt="Team collaboration and intelligence operations" />
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-5">
        <article className="section-card p-7 md:p-8 bg-gradient-to-br from-white to-blue-50/70">
          <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Eye className="w-5 h-5" />
          </div>
          <h2 className="mt-4 font-heading text-3xl text-slate-900 font-semibold">Our Vision</h2>
          <p className="mt-3 text-slate-600 leading-relaxed">{vision}</p>
        </article>

        <article className="section-card p-7 md:p-8 bg-gradient-to-br from-white to-orange-50/70">
          <div className="w-11 h-11 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <h2 className="mt-4 font-heading text-3xl text-slate-900 font-semibold">Our Mission</h2>
          <p className="mt-3 text-slate-600 leading-relaxed">{mission}</p>
        </article>
      </section>

      <section className="section-card p-8 md:p-10">
        <div className="max-w-3xl">
          <p className="muted-label">Leadership Team</p>
          <h2 className="section-title mt-3">The AI Node Command</h2>
          <p className="mt-4 text-slate-600 leading-relaxed">
            Elite pioneers behind the {companyName} neural architecture.
          </p>
        </div>

        <div className="mt-8 grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {team.map((t, i) => {
            const profileImage = t.image?.trim() || media.teamDefaultImage?.trim();
            return (
              <motion.article
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden p-0 shadow-sm"
              >
                <div className="relative h-56">
                  {profileImage ? (
                    <>
                      <img
                        src={profileImage}
                        alt={`${t.name} profile`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 flex items-center justify-center">
                      <div className="h-20 w-20 rounded-2xl bg-white text-slate-700 border border-slate-300 shadow-sm flex items-center justify-center font-heading text-2xl font-semibold">
                        {getInitials(t.name)}
                      </div>
                    </div>
                  )}
                  <div className={`absolute bottom-4 left-4 w-11 h-11 rounded-full border flex items-center justify-center ${profileImage ? 'bg-white/20 text-white border-white/40 backdrop-blur-sm' : 'bg-white text-slate-700 border-slate-300 shadow-sm'}`}>
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-heading text-2xl text-slate-900 font-semibold">{t.name}</h3>
                  <p className="mt-1 text-xs uppercase tracking-widest text-primary font-semibold">{t.role}</p>
                  <p className="mt-4 italic text-slate-500">"{t.slogan}"</p>
                  <p className="mt-4 text-sm text-slate-600 leading-relaxed">{t.details}</p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>
    </motion.div>
  );
}
