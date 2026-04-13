import { FormEvent, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Send } from 'lucide-react';
import SEO from '../components/SEO';
import { submitLeadRequest } from '../lib/portfolioApi';
import { useStore } from '../store/useStore';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  in: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
  out: { opacity: 0, y: -12, transition: { duration: 0.3, ease: 'easeIn' } },
};

interface DemoFormState {
  full_name: string;
  work_email: string;
  phone: string;
  company: string;
  job_title: string;
  company_size: string;
  cameras_count: string;
  selected_plan: string;
  industry: string;
  deployment_timeline: string;
  message: string;
}

const initialFormState: DemoFormState = {
  full_name: '',
  work_email: '',
  phone: '',
  company: '',
  job_title: '',
  company_size: '',
  cameras_count: '',
  selected_plan: '',
  industry: '',
  deployment_timeline: '',
  message: '',
};

export default function BookDemo() {
  const { companyName, media, plans, contactEmail, industries } = useStore();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState<DemoFormState>(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const planOptions = useMemo(
    () => Array.from(new Set(plans.map((plan) => plan.name))).sort((a, b) => a.localeCompare(b)),
    [plans]
  );

  const source = searchParams.get('source') || 'direct';
  const planFromUrl = searchParams.get('plan') || '';

  useEffect(() => {
    if (!planFromUrl) return;
    setForm((prev) => ({ ...prev, selected_plan: planFromUrl }));
  }, [planFromUrl]);

  const updateField = (key: keyof DemoFormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitMessage(null);
    setSubmitting(true);
    try {
      const response = await submitLeadRequest({
        request_type: 'demo',
        ...form,
        source_page: `book-demo:${source}`,
      });
      setSubmitMessage({
        type: 'success',
        text: response.email_sent
          ? 'Demo request submitted successfully. Our team will contact you shortly.'
          : `Request saved successfully. ${response.detail}`,
      });
      setForm((prev) => ({ ...initialFormState, selected_plan: prev.selected_plan }));
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Unable to submit right now.';
      setSubmitMessage({
        type: 'error',
        text: `${reason} You can also reach us at ${contactEmail}.`,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} className="space-y-12 pb-20 pt-4">
      <SEO
        title={`Book a Demo | ${companyName}`}
        description="Schedule a personalized EyeSpot demo and architecture walkthrough."
        keywords="book demo, video analytics consultation, AI security quote"
      />

      <section className="section-card p-2 overflow-hidden">
        <div className="grid lg:grid-cols-[1fr_1fr] gap-2">
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <p className="muted-label">Book A Free Demo</p>
            <h1 className="mt-3 font-heading text-4xl md:text-6xl font-semibold text-slate-900 leading-tight">
              Let Us Design Your Detection Stack
            </h1>
            <p className="mt-5 text-slate-600 leading-relaxed max-w-2xl">
              Share your environment, camera footprint, and timeline. We will prepare a tailored demo with the right
              modules and rollout architecture for your operation.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              <span className="premium-chip">Live Use-Case Review</span>
              <span className="premium-chip">Deployment Blueprint</span>
              <span className="premium-chip">Plan Recommendation</span>
            </div>
          </div>
          <div className="image-frame min-h-[320px]">
            <img src={media.contactImage} alt="EyeSpot detection operations" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 to-transparent" />
          </div>
        </div>
      </section>

      <section className="section-card p-7 md:p-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="font-heading text-3xl md:text-4xl font-semibold text-slate-900">Demo Request Form</h2>
            <p className="mt-2 text-sm text-slate-600">
              Fill in the details below and we will email your tailored demo agenda.
            </p>
          </div>
          <Link
            to="/pricing"
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-primary hover:text-primary transition-colors"
          >
            Compare Plans
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="muted-label">Full Name</label>
            <input
              required
              value={form.full_name}
              onChange={(event) => updateField('full_name', event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40"
              placeholder="Your full name"
            />
          </div>
          <div className="space-y-2">
            <label className="muted-label">Work Email</label>
            <input
              required
              type="email"
              value={form.work_email}
              onChange={(event) => updateField('work_email', event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40"
              placeholder="name@company.com"
            />
          </div>
          <div className="space-y-2">
            <label className="muted-label">Phone</label>
            <input
              value={form.phone}
              onChange={(event) => updateField('phone', event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40"
              placeholder="+1 (000) 000-0000"
            />
          </div>
          <div className="space-y-2">
            <label className="muted-label">Company</label>
            <input
              required
              value={form.company}
              onChange={(event) => updateField('company', event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40"
              placeholder="Company name"
            />
          </div>
          <div className="space-y-2">
            <label className="muted-label">Job Title</label>
            <input
              value={form.job_title}
              onChange={(event) => updateField('job_title', event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40"
              placeholder="Security Lead / Ops Head"
            />
          </div>
          <div className="space-y-2">
            <label className="muted-label">Company Size</label>
            <select
              value={form.company_size}
              onChange={(event) => updateField('company_size', event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40"
            >
              <option value="">Select size</option>
              <option value="1-50">1-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-1000">201-1000 employees</option>
              <option value="1000+">1000+ employees</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="muted-label">Camera Count</label>
            <select
              value={form.cameras_count}
              onChange={(event) => updateField('cameras_count', event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40"
            >
              <option value="">Select camera footprint</option>
              <option value="1-10">1-10 cameras</option>
              <option value="11-30">11-30 cameras</option>
              <option value="31-100">31-100 cameras</option>
              <option value="101+">101+ cameras</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="muted-label">Preferred Plan</label>
            <select
              value={form.selected_plan}
              onChange={(event) => updateField('selected_plan', event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40"
            >
              <option value="">Select a plan</option>
              {planOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="muted-label">Industry</label>
            <select
              value={form.industry}
              onChange={(event) => updateField('industry', event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40"
            >
              <option value="">Select your industry</option>
              {industries.map((ind) => (
                <option key={ind.id} value={ind.title}>
                  {ind.title}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="muted-label">Deployment Timeline</label>
            <select
              value={form.deployment_timeline}
              onChange={(event) => updateField('deployment_timeline', event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40"
            >
              <option value="">Select timeline</option>
              <option value="Immediate (0-30 days)">Immediate (0-30 days)</option>
              <option value="Near term (1-3 months)">Near term (1-3 months)</option>
              <option value="Planned (3-6 months)">Planned (3-6 months)</option>
              <option value="Exploring (6+ months)">Exploring (6+ months)</option>
            </select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="muted-label">Project Details</label>
            <textarea
              rows={6}
              value={form.message}
              onChange={(event) => updateField('message', event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40 resize-none"
              placeholder="Share use case, locations, and what you want to detect..."
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Submitting...' : 'Submit Demo Request'}
            </button>
          </div>
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
      </section>
    </motion.div>
  );
}
