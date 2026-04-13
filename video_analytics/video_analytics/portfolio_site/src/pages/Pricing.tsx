import { FormEvent, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { CheckCircle2, CheckSquare, Hexagon, Send } from 'lucide-react';
import SEO from '../components/SEO';
import { submitLeadRequest } from '../lib/portfolioApi';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  in: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
  out: { opacity: 0, y: -12, transition: { duration: 0.3, ease: 'easeIn' } },
};

export default function Pricing() {
  const { plans, companyName, media, contactEmail } = useStore();
  const [cycle, setCycle] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [quoteForm, setQuoteForm] = useState({
    full_name: '',
    work_email: '',
    phone: '',
    company: '',
    cameras_count: '',
    deployment_timeline: '',
    message: '',
  });

  const filteredPlans = plans.filter((p) => p.type === cycle);
  const selectedPlan = filteredPlans.find((plan) => plan.id === selectedPlanId) ?? filteredPlans[0] ?? null;

  useEffect(() => {
    if (!filteredPlans.length) {
      setSelectedPlanId(null);
      return;
    }
    const existsInCycle = filteredPlans.some((plan) => plan.id === selectedPlanId);
    if (!existsInCycle) {
      setSelectedPlanId(filteredPlans[0].id);
    }
  }, [filteredPlans, selectedPlanId]);

  const updateQuoteField = (key: keyof typeof quoteForm, value: string) => {
    setQuoteForm((prev) => ({ ...prev, [key]: value }));
  };

  const submitQuoteRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedPlan) return;
    setSubmitMessage(null);
    setIsSubmitting(true);
    try {
      const response = await submitLeadRequest({
        request_type: 'quote',
        full_name: quoteForm.full_name,
        work_email: quoteForm.work_email,
        phone: quoteForm.phone,
        company: quoteForm.company,
        cameras_count: quoteForm.cameras_count,
        deployment_timeline: quoteForm.deployment_timeline,
        selected_plan: selectedPlan.name,
        source_page: `pricing-${cycle}`,
        message: quoteForm.message,
      });
      setSubmitMessage({
        type: 'success',
        text: response.email_sent
          ? 'Quote request submitted successfully. Our team will contact you shortly.'
          : `Quote request saved successfully. ${response.detail}`,
      });
      setQuoteForm({
        full_name: '',
        work_email: '',
        phone: '',
        company: '',
        cameras_count: '',
        deployment_timeline: '',
        message: '',
      });
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Unable to submit quote request right now.';
      setSubmitMessage({
        type: 'error',
        text: `${reason} You can also contact us at ${contactEmail}.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
              Select A Plan, Get A Tailored Quote
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="mt-5 text-slate-600 leading-relaxed max-w-3xl">
              Choose the deployment tier that matches your camera footprint and operating complexity. We provide a detailed quote instead of generic rates.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8 inline-flex flex-wrap justify-center items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 p-2">
              {(['monthly', 'quarterly', 'yearly'] as const).map((c) => (
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
              const isSelected = selectedPlan?.id === plan.id;
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl border p-6 flex flex-col ${
                    isSelected
                      ? 'border-primary bg-gradient-to-b from-primary/10 to-white shadow-card'
                      : recommended
                      ? 'border-primary/40 bg-gradient-to-b from-primary/10 to-white shadow-card'
                      : 'border-slate-200 bg-white/90'
                  }`}
                >
                  {(recommended || isSelected) && (
                    <div className="absolute -top-3 left-6 rounded-full bg-primary text-white text-[10px] font-semibold tracking-wide uppercase px-3 py-1">
                      {isSelected ? 'Selected' : 'Recommended'}
                    </div>
                  )}

                  <div className={`flex-col flex h-full ${recommended || isSelected ? 'pt-3' : ''}`}>
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-heading text-xl font-semibold text-slate-900">{plan.name}</h3>
                        <Hexagon className={`w-5 h-5 ${isSelected || recommended ? 'text-primary' : 'text-slate-300'}`} />
                      </div>
                      <div className="font-heading text-2xl font-semibold text-slate-900">
                        Deployment Quote Based
                      </div>
                      <div className="text-xs font-semibold tracking-widest text-slate-500 uppercase mt-1">
                        {cycle} planning cycle
                      </div>
                    </div>

                    <div className="flex-1">
                      <h4 className="text-xs font-semibold tracking-widest text-slate-500 uppercase mb-3">Included Features</h4>
                      <ul className="space-y-3">
                        {plan.features.map((f, j) => (
                          <li key={j} className="flex gap-3 text-slate-700 text-sm">
                            <CheckCircle2 className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isSelected || recommended ? 'text-primary' : 'text-slate-400'}`} />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`w-full py-3 rounded-lg font-semibold text-sm transition-colors mt-7 ${
                        isSelected
                          ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                          : recommended
                        ? 'bg-primary text-white hover:bg-primary/90'
                        : 'bg-slate-900 text-white hover:bg-slate-700'
                      }`}
                    >
                      {isSelected ? (
                        <span className="inline-flex items-center justify-center gap-2">
                          <CheckSquare className="w-4 h-4" />
                          Plan Selected
                        </span>
                      ) : (
                        'Select Plan'
                      )}
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
              <h3 className="font-heading text-2xl md:text-3xl font-semibold text-slate-900">Request Professional Quote</h3>
              <p className="mt-3 text-slate-600 text-sm md:text-base leading-relaxed">
                Selected Plan: <span className="font-semibold text-slate-900">{selectedPlan?.name || 'Choose a plan above'}</span>.
                Share your deployment details and we will send a tailored architecture and commercial proposal.
              </p>
              <form className="mt-6 grid md:grid-cols-2 gap-4" onSubmit={submitQuoteRequest}>
                <input
                  required
                  value={quoteForm.full_name}
                  onChange={(event) => updateQuoteField('full_name', event.target.value)}
                  placeholder="Full name"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40"
                />
                <input
                  required
                  type="email"
                  value={quoteForm.work_email}
                  onChange={(event) => updateQuoteField('work_email', event.target.value)}
                  placeholder="Work email"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40"
                />
                <input
                  required
                  value={quoteForm.company}
                  onChange={(event) => updateQuoteField('company', event.target.value)}
                  placeholder="Company name"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40"
                />
                <input
                  value={quoteForm.phone}
                  onChange={(event) => updateQuoteField('phone', event.target.value)}
                  placeholder="Phone number"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40"
                />
                <select
                  value={quoteForm.cameras_count}
                  onChange={(event) => updateQuoteField('cameras_count', event.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40"
                >
                  <option value="">Camera footprint</option>
                  <option value="1-10">1-10 cameras</option>
                  <option value="11-30">11-30 cameras</option>
                  <option value="31-100">31-100 cameras</option>
                  <option value="101+">101+ cameras</option>
                </select>
                <select
                  value={quoteForm.deployment_timeline}
                  onChange={(event) => updateQuoteField('deployment_timeline', event.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40"
                >
                  <option value="">Deployment timeline</option>
                  <option value="Immediate (0-30 days)">Immediate (0-30 days)</option>
                  <option value="Near term (1-3 months)">Near term (1-3 months)</option>
                  <option value="Planned (3-6 months)">Planned (3-6 months)</option>
                  <option value="Exploring (6+ months)">Exploring (6+ months)</option>
                </select>
                <textarea
                  rows={4}
                  value={quoteForm.message}
                  onChange={(event) => updateQuoteField('message', event.target.value)}
                  placeholder="Anything specific for your quote (locations, integrations, compliance requirements)?"
                  className="md:col-span-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40"
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedPlan}
                  className="md:col-span-2 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-white font-semibold hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? 'Submitting...' : 'Send Quote Request'}
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
                  {submitMessage.text}
                </div>
              )}
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
