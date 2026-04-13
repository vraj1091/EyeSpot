import { FormEvent, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { CheckCircle2, Mail, Phone, MapPin, Send } from 'lucide-react';
import SEO from '../components/SEO';
import { submitLeadRequest } from '../lib/portfolioApi';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  in: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
  out: { opacity: 0, y: -12, transition: { duration: 0.3, ease: 'easeIn' } },
};

export default function Contact() {
  const { contactEmail, contactPhone, contactAddress, companyName, media } = useStore();
  const [form, setForm] = useState({
    full_name: '',
    work_email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitMessage(null);
    setIsSubmitting(true);
    try {
      const response = await submitLeadRequest({
        request_type: 'contact',
        full_name: form.full_name,
        work_email: form.work_email,
        message: form.message,
        source_page: 'contact-page',
      });
      setSubmitMessage({
        type: 'success',
        text: response.email_sent
          ? 'Message sent successfully. Our team will reach out soon.'
          : `Message saved successfully. ${response.detail}`,
      });
      setForm({ full_name: '', work_email: '', message: '' });
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Unable to submit right now.';
      setSubmitMessage({
        type: 'error',
        text: `${reason} You can also email us at ${contactEmail}.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} className="space-y-16 pb-20 pt-4">
      <SEO
        title={`Contact ${companyName} | Book a Video Analytics Demo`}
        description="Request a product walkthrough, architecture consultation, or deployment planning session."
        keywords="video analytics demo, contact security AI team, edge AI consultation"
      />

      <section className="section-card p-2 overflow-hidden">
        <div className="grid lg:grid-cols-[1fr_1fr] gap-2">
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-heading text-4xl md:text-6xl font-semibold text-slate-900 leading-tight">
              Initialize Uplink
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="mt-5 text-slate-600 leading-relaxed max-w-3xl">
              Request physical architecture demonstration, access API endpoints, or speak directly with deployment engineers.
            </motion.p>
          </div>
          <div className="image-frame min-h-[320px]">
            <img src={media.contactImage} alt="Contact and operations center" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 to-transparent" />
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-2 gap-5 items-stretch">
        <motion.div initial={{ opacity: 0, x: -18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="section-card p-7 md:p-8">
          <div>
            <p className="muted-label">Direct Vectors</p>
            <h2 className="mt-3 font-heading text-3xl md:text-4xl font-semibold text-slate-900">Contact Information</h2>
            <p className="mt-3 text-slate-600 leading-relaxed">
              Establish a secure communication channel to schedule a pilot deployment.
            </p>
          </div>

          <div className="mt-8 space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase text-slate-500">Network Protocol</p>
                <p className="mt-1 text-slate-900 font-medium">{contactEmail}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase text-slate-500">Voice Channel</p>
                <p className="mt-1 text-slate-900 font-medium">{contactPhone}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase text-slate-500">HQ Coordinates</p>
                <p className="mt-1 text-slate-700 leading-relaxed">{contactAddress}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <div className="section-card p-7 md:p-8 h-full bg-gradient-to-br from-white to-slate-50">
            <h3 className="font-heading text-3xl md:text-4xl font-semibold text-slate-900">Neural Transmission</h3>

            <form className="space-y-4 mt-6" onSubmit={handleSubmit}>
              <div>
                <input
                  type="text"
                  required
                  value={form.full_name}
                  onChange={(event) => setForm((prev) => ({ ...prev, full_name: event.target.value }))}
                  placeholder="Identification / Unit Name"
                  className="w-full bg-slate-50 py-3 px-4 rounded-lg border border-slate-200 text-slate-800 placeholder-slate-400 focus:border-primary/40 outline-none transition-colors"
                />
              </div>
              <div>
                <input
                  type="email"
                  required
                  value={form.work_email}
                  onChange={(event) => setForm((prev) => ({ ...prev, work_email: event.target.value }))}
                  placeholder="Secure Return Address"
                  className="w-full bg-slate-50 py-3 px-4 rounded-lg border border-slate-200 text-slate-800 placeholder-slate-400 focus:border-primary/40 outline-none transition-colors"
                />
              </div>
              <div>
                <textarea
                  required
                  value={form.message}
                  onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
                  placeholder="Operational Objective Parameters"
                  rows={6}
                  className="w-full bg-slate-50 py-3 px-4 rounded-lg border border-slate-200 text-slate-800 placeholder-slate-400 focus:border-primary/40 outline-none transition-colors resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-lg font-semibold bg-primary text-white hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
              >
                <Send className="w-4 h-4" /> {isSubmitting ? 'Sending...' : 'Beam Data'}
              </button>
            </form>

            {submitMessage && (
              <div
                className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
                  submitMessage.type === 'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-rose-200 bg-rose-50 text-rose-800'
                }`}
              >
                <div className="flex items-start gap-2">
                  {submitMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 mt-0.5" />}
                  <p>{submitMessage.text}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </section>
    </motion.div>
  );
}
