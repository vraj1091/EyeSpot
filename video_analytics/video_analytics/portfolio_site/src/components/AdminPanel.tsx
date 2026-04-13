import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Save,
  Plus,
  Trash2,
  LayoutDashboard,
  Users,
  Box,
  Wallet,
  Search,
  Copy,
  Camera,
  RefreshCcw,
  Download,
  Globe,
} from 'lucide-react';
import { useStore, TeamMember, Product, Plan, SiteMedia, Industry, Detection } from '../store/useStore';
import { isPortfolioRemoteSyncEnabled, RemoteSyncUnavailableError, savePortfolioContent } from '../lib/portfolioApi';

type AdminTab = 'overview' | 'globals' | 'team' | 'products' | 'industries' | 'plans' | 'media';

interface CompanyDraft {
  companyName: string;
  tagline: string;
  vision: string;
  mission: string;
  aboutText: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
}

interface Snapshot {
  company: CompanyDraft;
  team: TeamMember[];
  products: Product[];
  plans: Plan[];
  industries: Industry[];
  media: SiteMedia;
}

type StoreStateFields = CompanyDraft & {
  team: TeamMember[];
  products: Product[];
  plans: Plan[];
  industries: Industry[];
  media: SiteMedia;
};

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;

const cloneValue = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const makeStoreSnapshot = (store: StoreStateFields): Snapshot => ({
  company: {
    companyName: store.companyName,
    tagline: store.tagline,
    vision: store.vision,
    mission: store.mission,
    aboutText: store.aboutText,
    contactEmail: store.contactEmail,
    contactPhone: store.contactPhone,
    contactAddress: store.contactAddress,
  },
  team: cloneValue(store.team),
  products: cloneValue(store.products),
  plans: cloneValue(store.plans),
  industries: cloneValue(store.industries),
  media: cloneValue(store.media),
});

const mediaFields: Array<{ key: keyof SiteMedia; label: string; hint: string }> = [
  { key: 'heroImage', label: 'Home Hero', hint: 'Main visual in the homepage hero section.' },
  { key: 'architectureImage', label: 'Architecture', hint: 'Used in architecture / technical blocks.' },
  { key: 'industriesImage', label: 'Industries Banner', hint: 'Wide banner for industries section.' },
  { key: 'aboutImage', label: 'About Hero', hint: 'Main image on about page.' },
  { key: 'productsHeroImage', label: 'Products Hero', hint: 'Top image for products page.' },
  { key: 'pricingImage', label: 'Pricing Hero', hint: 'Pricing page visual.' },
  { key: 'contactImage', label: 'Contact Hero', hint: 'Contact page and footer visual.' },
  { key: 'teamDefaultImage', label: 'Team Fallback', hint: 'Used when a team member image is missing.' },
];

export default function AdminPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const store = useStore();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [query, setQuery] = useState('');
  const [companyDraft, setCompanyDraft] = useState<CompanyDraft>({
    companyName: '',
    tagline: '',
    vision: '',
    mission: '',
    aboutText: '',
    contactEmail: '',
    contactPhone: '',
    contactAddress: '',
  });
  const [teamDraft, setTeamDraft] = useState<TeamMember[]>([]);
  const [productDraft, setProductDraft] = useState<Product[]>([]);
  const [planDraft, setPlanDraft] = useState<Plan[]>([]);
  const [industriesDraft, setIndustriesDraft] = useState<Industry[]>([]);
  const [mediaDraft, setMediaDraft] = useState<SiteMedia>(store.media);
  const [snapshotOnOpen, setSnapshotOnOpen] = useState('');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const snapshot = makeStoreSnapshot(store);
    setCompanyDraft(snapshot.company);
    setTeamDraft(snapshot.team);
    setProductDraft(snapshot.products);
    setPlanDraft(snapshot.plans);
    setIndustriesDraft(snapshot.industries);
    setMediaDraft(snapshot.media);
    setSnapshotOnOpen(JSON.stringify(snapshot));
    setSaveState('idle');
    setSaveMessage('');
    setQuery('');
    setActiveTab('overview');
  }, [
    isOpen,
    store.aboutText,
    store.companyName,
    store.contactAddress,
    store.contactEmail,
    store.contactPhone,
    store.media,
    store.mission,
    store.plans,
    store.products,
    store.tagline,
    store.team,
    store.vision,
  ]);

  const currentSnapshot = useMemo(() => JSON.stringify({
    company: companyDraft,
    team: teamDraft,
    products: productDraft,
    plans: planDraft,
    industries: industriesDraft,
    media: mediaDraft,
  }), [companyDraft, teamDraft, productDraft, planDraft, industriesDraft, mediaDraft]);

  const isDirty = currentSnapshot !== snapshotOnOpen;

  const handleSave = useCallback(async () => {
    const payload = {
      companyName: companyDraft.companyName,
      tagline: companyDraft.tagline,
      vision: companyDraft.vision,
      mission: companyDraft.mission,
      aboutText: companyDraft.aboutText,
      contactEmail: companyDraft.contactEmail,
      contactPhone: companyDraft.contactPhone,
      contactAddress: companyDraft.contactAddress,
      team: teamDraft,
      products: productDraft,
      plans: planDraft,
      industries: industriesDraft,
      media: mediaDraft,
    };

    setSaveState('saving');
    setSaveMessage('Saving locally and syncing globally...');
    store.replaceSiteContent(payload, { source: 'local' });
    setSnapshotOnOpen(JSON.stringify({
      company: companyDraft,
      team: teamDraft,
      products: productDraft,
      plans: planDraft,
      industries: industriesDraft,
      media: mediaDraft,
    }));

    if (!isPortfolioRemoteSyncEnabled()) {
      setSaveState('saved');
      setSaveMessage('Saved locally. Global sync is disabled for this deployment.');
      return;
    }

    try {
      const remote = await savePortfolioContent(payload);
      store.replaceSiteContent(remote.content, {
        version: remote.version,
        updatedAt: remote.updated_at ?? null,
        source: 'remote',
      });
      setSaveState('saved');
      setSaveMessage('Saved and synced globally.');
    } catch (error) {
      if (error instanceof RemoteSyncUnavailableError) {
        setSaveState('saved');
        setSaveMessage('Saved locally. Global sync endpoint is unavailable right now.');
        return;
      }
      const reason = error instanceof Error ? error.message : 'Global sync failed.';
      setSaveState('error');
      setSaveMessage(`Saved locally, but global sync failed. ${reason}`);
    }
  }, [companyDraft, mediaDraft, planDraft, productDraft, industriesDraft, store, teamDraft]);

  useEffect(() => {
    if (!isOpen) return;

    const handleShortcuts = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        void handleSave();
      }
    };

    window.addEventListener('keydown', handleShortcuts);
    return () => window.removeEventListener('keydown', handleShortcuts);
  }, [handleSave, isOpen, onClose]);

  useEffect(() => {
    if (saveState !== 'saved') return;
    const timeout = window.setTimeout(() => {
      setSaveState('idle');
      setSaveMessage('');
    }, 1600);
    return () => window.clearTimeout(timeout);
  }, [saveState]);

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  const filteredTeam = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return teamDraft;
    return teamDraft.filter((member) =>
      `${member.name} ${member.role} ${member.slogan} ${member.details}`.toLowerCase().includes(term)
    );
  }, [teamDraft, query]);

  const filteredProducts = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return productDraft;
    return productDraft.filter((product) =>
      `${product.name} ${product.description} ${product.longDescription} ${product.features.join(' ')}`
        .toLowerCase()
        .includes(term)
    );
  }, [productDraft, query]);

  const filteredPlans = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return planDraft;
    return planDraft.filter((plan) =>
      `${plan.name} ${plan.price} ${plan.type} ${plan.features.join(' ')}`.toLowerCase().includes(term)
    );
  }, [planDraft, query]);

  const navItems: Array<{ id: AdminTab; label: string; icon: typeof LayoutDashboard }> = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'globals', label: 'Brand + Contact', icon: LayoutDashboard },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'products', label: 'Products', icon: Box },
    { id: 'industries', label: 'Industries', icon: Globe },
    { id: 'plans', label: 'Pricing', icon: Wallet },
    { id: 'media', label: 'Media', icon: Camera },
  ];

  const handleReset = () => {
    const snapshot = makeStoreSnapshot(store);
    setCompanyDraft(snapshot.company);
    setTeamDraft(snapshot.team);
    setProductDraft(snapshot.products);
    setPlanDraft(snapshot.plans);
    setIndustriesDraft(snapshot.industries);
    setMediaDraft(snapshot.media);
    setSnapshotOnOpen(JSON.stringify(snapshot));
    setQuery('');
    setSaveState('idle');
    setSaveMessage('');
  };

  const exportBackup = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      company: companyDraft,
      team: teamDraft,
      products: productDraft,
      plans: planDraft,
      industries: industriesDraft,
      media: mediaDraft,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `eyespot-admin-backup-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  const fieldLabel = 'text-xs font-semibold uppercase tracking-[0.16em] text-slate-500';
  const textInput =
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/50 transition';
  const textArea =
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/50 transition resize-y min-h-[120px]';
  const card = 'rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-[0_16px_40px_-30px_rgba(15,23,42,0.45)]';

  const panel = (
    <div className="fixed inset-0 bg-slate-900/55 backdrop-blur-sm p-3 md:p-6" style={{ zIndex: 2147483000 }}>
      <div className="mx-auto h-full w-full max-w-[1700px] rounded-[28px] border border-white/70 bg-[linear-gradient(180deg,#f8fbff_0%,#eef4ff_42%,#f8fafc_100%)] shadow-[0_35px_120px_-55px_rgba(15,23,42,0.7)] overflow-hidden">
        <div className="grid h-full lg:grid-cols-[280px_1fr]">
          <aside className="border-b lg:border-b-0 lg:border-r border-slate-200/80 bg-white/75 backdrop-blur-xl p-4 md:p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Control Center</p>
                <h2 className="font-heading text-2xl text-slate-900">Admin Workspace</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
                aria-label="Close admin panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl bg-white border border-slate-200 p-3">
                <p className="text-slate-500">Team</p>
                <p className="mt-1 font-heading text-xl text-slate-900">{teamDraft.length}</p>
              </div>
              <div className="rounded-xl bg-white border border-slate-200 p-3">
                <p className="text-slate-500">Products</p>
                <p className="mt-1 font-heading text-xl text-slate-900">{productDraft.length}</p>
              </div>
              <div className="rounded-xl bg-white border border-slate-200 p-3">
                <p className="text-slate-500">Plans</p>
                <p className="mt-1 font-heading text-xl text-slate-900">{planDraft.length}</p>
              </div>
              <div className="rounded-xl bg-white border border-slate-200 p-3">
                <p className="text-slate-500">Status</p>
                <p className={`mt-1 font-semibold ${isDirty ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {isDirty ? 'Unsaved' : 'Synced'}
                </p>
              </div>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full rounded-xl px-3 py-2.5 flex items-center gap-3 text-sm font-semibold transition ${
                    activeTab === item.id
                      ? 'bg-primary text-white shadow-[0_10px_24px_-14px_rgba(13,78,216,0.75)]'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="mt-auto rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600 space-y-1">
              <p className="font-semibold text-slate-900">Shortcuts</p>
              <p>`Ctrl/Cmd + S` Save</p>
              <p>`Esc` Close panel</p>
              <p>`Ctrl/Cmd + Shift + A` Toggle panel</p>
            </div>
          </aside>

          <section className="min-h-0 flex flex-col">
            <header className="border-b border-slate-200/80 bg-white/75 backdrop-blur-xl px-4 md:px-6 py-3 flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
              <div className="relative w-full md:max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search team, products, plans..."
                  className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-xs px-2.5 py-1 rounded-full border ${
                  saveState === 'error'
                    ? 'border-rose-300 bg-rose-50 text-rose-700'
                    : isDirty
                      ? 'border-amber-300 bg-amber-50 text-amber-700'
                      : 'border-emerald-300 bg-emerald-50 text-emerald-700'
                }`}>
                  {saveState === 'error' ? 'Sync failed' : isDirty ? 'Unsaved changes' : 'All changes saved'}
                </span>
                <button
                  type="button"
                  onClick={exportBackup}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-primary hover:text-primary transition"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-primary hover:text-primary transition"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={saveState === 'saving'}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition"
                >
                  <Save className="w-4 h-4" />
                  {saveState === 'saving' ? 'Saving...' : saveState === 'saved' ? 'Saved' : saveState === 'error' ? 'Retry Save' : 'Save'}
                </button>
              </div>
            </header>

            {saveMessage && (
              <div className={`mx-4 md:mx-6 mt-3 rounded-xl border px-4 py-2 text-xs ${
                saveState === 'error'
                  ? 'border-rose-200 bg-rose-50 text-rose-700'
                  : saveState === 'saved'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-white text-slate-600'
              }`}>
                {saveMessage}
              </div>
            )}

            <div className="min-h-0 overflow-y-auto p-4 md:p-6 space-y-5">
              {activeTab === 'overview' && (
                <div className="space-y-5">
                  <div className="rounded-2xl border border-slate-200 bg-white/90 p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">System Overview</p>
                    <h3 className="mt-2 font-heading text-3xl text-slate-900">Advanced Site Ops</h3>
                    <p className="mt-3 text-slate-600 max-w-3xl">
                      Update brand messaging, media assets, pricing matrices, and product modules from one panel.
                      Every save syncs instantly to the live portfolio state.
                    </p>
                    <div className="mt-5 grid sm:grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setActiveTab('team')}
                        className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-white px-4 py-3 text-left transition"
                      >
                        <p className="text-xs uppercase tracking-wide text-slate-500">Team</p>
                        <p className="mt-1 font-semibold text-slate-900">{teamDraft.length} entries</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('products')}
                        className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-white px-4 py-3 text-left transition"
                      >
                        <p className="text-xs uppercase tracking-wide text-slate-500">Products</p>
                        <p className="mt-1 font-semibold text-slate-900">{productDraft.length} modules</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('plans')}
                        className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-white px-4 py-3 text-left transition"
                      >
                        <p className="text-xs uppercase tracking-wide text-slate-500">Pricing</p>
                        <p className="mt-1 font-semibold text-slate-900">{planDraft.length} plan tiers</p>
                      </button>
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-5">
                    <article className={card}>
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Brand Name</p>
                      <input
                        value={companyDraft.companyName}
                        onChange={(event) => setCompanyDraft((prev) => ({ ...prev, companyName: event.target.value }))}
                        className={`${textInput} mt-2`}
                      />
                    </article>
                    <article className={card}>
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Tagline</p>
                      <input
                        value={companyDraft.tagline}
                        onChange={(event) => setCompanyDraft((prev) => ({ ...prev, tagline: event.target.value }))}
                        className={`${textInput} mt-2`}
                      />
                    </article>
                  </div>
                </div>
              )}
              {activeTab === 'globals' && (
                <div className="space-y-5">
                  <article className={card}>
                    <h3 className="font-heading text-2xl text-slate-900">Brand + Contact</h3>
                    <p className="mt-1 text-sm text-slate-500">Core company messaging and contact endpoints.</p>
                    <div className="mt-5 grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className={fieldLabel}>Company Name</label>
                        <input
                          value={companyDraft.companyName}
                          onChange={(event) => setCompanyDraft((prev) => ({ ...prev, companyName: event.target.value }))}
                          className={textInput}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className={fieldLabel}>Tagline</label>
                        <input
                          value={companyDraft.tagline}
                          onChange={(event) => setCompanyDraft((prev) => ({ ...prev, tagline: event.target.value }))}
                          className={textInput}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className={fieldLabel}>Contact Email</label>
                        <input
                          value={companyDraft.contactEmail}
                          onChange={(event) => setCompanyDraft((prev) => ({ ...prev, contactEmail: event.target.value }))}
                          className={textInput}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className={fieldLabel}>Contact Phone</label>
                        <input
                          value={companyDraft.contactPhone}
                          onChange={(event) => setCompanyDraft((prev) => ({ ...prev, contactPhone: event.target.value }))}
                          className={textInput}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className={fieldLabel}>Address</label>
                        <input
                          value={companyDraft.contactAddress}
                          onChange={(event) => setCompanyDraft((prev) => ({ ...prev, contactAddress: event.target.value }))}
                          className={textInput}
                        />
                      </div>
                    </div>
                  </article>

                  <article className={card}>
                    <h4 className="font-heading text-xl text-slate-900">Narrative</h4>
                    <div className="mt-4 space-y-4">
                      <div className="space-y-2">
                        <label className={fieldLabel}>Vision</label>
                        <textarea
                          value={companyDraft.vision}
                          onChange={(event) => setCompanyDraft((prev) => ({ ...prev, vision: event.target.value }))}
                          className={textArea}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className={fieldLabel}>Mission</label>
                        <textarea
                          value={companyDraft.mission}
                          onChange={(event) => setCompanyDraft((prev) => ({ ...prev, mission: event.target.value }))}
                          className={textArea}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className={fieldLabel}>About Text</label>
                        <textarea
                          value={companyDraft.aboutText}
                          onChange={(event) => setCompanyDraft((prev) => ({ ...prev, aboutText: event.target.value }))}
                          className={textArea}
                        />
                      </div>
                    </div>
                  </article>
                </div>
              )}

              {activeTab === 'team' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-heading text-2xl text-slate-900">Team Manager</h3>
                      <p className="text-sm text-slate-500">Search-aware list with duplicate and remove controls.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setTeamDraft((prev) => [
                          {
                            id: createId(),
                            name: '',
                            role: '',
                            slogan: '',
                            details: '',
                            image: mediaDraft.teamDefaultImage,
                          },
                          ...prev,
                        ])
                      }
                      className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary/90 transition"
                    >
                      <Plus className="w-4 h-4" />
                      Add Team Member
                    </button>
                  </div>

                  {filteredTeam.length === 0 && (
                    <div className={card}>
                      <p className="text-sm text-slate-500">No team entries match your search.</p>
                    </div>
                  )}

                  {filteredTeam.map((member) => {
                    const index = teamDraft.findIndex((item) => item.id === member.id);
                    if (index === -1) return null;
                    return (
                      <article key={member.id} className={card}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4 className="font-heading text-xl text-slate-900">
                            {member.name || 'Unnamed Team Member'}
                          </h4>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setTeamDraft((prev) => {
                                  const copy = cloneValue(prev[index]);
                                  copy.id = createId();
                                  copy.name = copy.name ? `${copy.name} Copy` : '';
                                  return [copy, ...prev];
                                })
                              }
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-primary hover:text-primary transition"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              Duplicate
                            </button>
                            <button
                              type="button"
                              onClick={() => setTeamDraft((prev) => prev.filter((item) => item.id !== member.id))}
                              className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Remove
                            </button>
                          </div>
                        </div>

                        <div className="mt-4 grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className={fieldLabel}>Name</label>
                            <input
                              value={member.name}
                              onChange={(event) =>
                                setTeamDraft((prev) =>
                                  prev.map((item, itemIndex) =>
                                    itemIndex === index ? { ...item, name: event.target.value } : item
                                  )
                                )
                              }
                              className={textInput}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className={fieldLabel}>Role</label>
                            <input
                              value={member.role}
                              onChange={(event) =>
                                setTeamDraft((prev) =>
                                  prev.map((item, itemIndex) =>
                                    itemIndex === index ? { ...item, role: event.target.value } : item
                                  )
                                )
                              }
                              className={textInput}
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <label className={fieldLabel}>Slogan</label>
                            <input
                              value={member.slogan}
                              onChange={(event) =>
                                setTeamDraft((prev) =>
                                  prev.map((item, itemIndex) =>
                                    itemIndex === index ? { ...item, slogan: event.target.value } : item
                                  )
                                )
                              }
                              className={textInput}
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <label className={fieldLabel}>Bio</label>
                            <textarea
                              value={member.details}
                              onChange={(event) =>
                                setTeamDraft((prev) =>
                                  prev.map((item, itemIndex) =>
                                    itemIndex === index ? { ...item, details: event.target.value } : item
                                  )
                                )
                              }
                              className={textArea}
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <label className={fieldLabel}>Image URL</label>
                            <input
                              value={member.image || ''}
                              onChange={(event) =>
                                setTeamDraft((prev) =>
                                  prev.map((item, itemIndex) =>
                                    itemIndex === index ? { ...item, image: event.target.value } : item
                                  )
                                )
                              }
                              className={textInput}
                              placeholder="https://..."
                            />
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
              {activeTab === 'products' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-heading text-2xl text-slate-900">Product Modules</h3>
                      <p className="text-sm text-slate-500">Manage product messaging, features, icon slots, and imagery.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setProductDraft((prev) => [
                          {
                            id: createId(),
                            name: '',
                            description: '',
                            longDescription: '',
                            features: [],
                            iconIndex: 0,
                            image: mediaDraft.productsHeroImage,
                          },
                          ...prev,
                        ])
                      }
                      className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary/90 transition"
                    >
                      <Plus className="w-4 h-4" />
                      Add Product
                    </button>
                  </div>

                  {filteredProducts.length === 0 && (
                    <div className={card}>
                      <p className="text-sm text-slate-500">No products match your search.</p>
                    </div>
                  )}

                  {filteredProducts.map((product) => {
                    const index = productDraft.findIndex((item) => item.id === product.id);
                    if (index === -1) return null;
                    return (
                      <article key={product.id} className={card}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4 className="font-heading text-xl text-slate-900">{product.name || 'Untitled Module'}</h4>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setProductDraft((prev) => {
                                  const copy = cloneValue(prev[index]);
                                  copy.id = createId();
                                  copy.name = copy.name ? `${copy.name} Copy` : '';
                                  return [copy, ...prev];
                                })
                              }
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-primary hover:text-primary transition"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              Duplicate
                            </button>
                            <button
                              type="button"
                              onClick={() => setProductDraft((prev) => prev.filter((item) => item.id !== product.id))}
                              className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Remove
                            </button>
                          </div>
                        </div>
                        <div className="mt-4 grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className={fieldLabel}>Name</label>
                            <input
                              value={product.name}
                              onChange={(event) =>
                                setProductDraft((prev) =>
                                  prev.map((item, itemIndex) =>
                                    itemIndex === index ? { ...item, name: event.target.value } : item
                                  )
                                )
                              }
                              className={textInput}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className={fieldLabel}>Icon Index</label>
                            <input
                              type="number"
                              min={0}
                              value={product.iconIndex ?? 0}
                              onChange={(event) =>
                                setProductDraft((prev) =>
                                  prev.map((item, itemIndex) =>
                                    itemIndex === index
                                      ? { ...item, iconIndex: Number.isNaN(Number(event.target.value)) ? 0 : Number(event.target.value) }
                                      : item
                                  )
                                )
                              }
                              className={textInput}
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <label className={fieldLabel}>Short Description</label>
                            <input
                              value={product.description}
                              onChange={(event) =>
                                setProductDraft((prev) =>
                                  prev.map((item, itemIndex) =>
                                    itemIndex === index ? { ...item, description: event.target.value } : item
                                  )
                                )
                              }
                              className={textInput}
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <label className={fieldLabel}>Long Description</label>
                            <textarea
                              value={product.longDescription}
                              onChange={(event) =>
                                setProductDraft((prev) =>
                                  prev.map((item, itemIndex) =>
                                    itemIndex === index ? { ...item, longDescription: event.target.value } : item
                                  )
                                )
                              }
                              className={textArea}
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <label className={fieldLabel}>Features (comma separated)</label>
                            <input
                              value={product.features.join(', ')}
                              onChange={(event) =>
                                setProductDraft((prev) =>
                                  prev.map((item, itemIndex) =>
                                    itemIndex === index
                                      ? {
                                          ...item,
                                          features: event.target.value
                                            .split(',')
                                            .map((feature) => feature.trim())
                                            .filter((feature) => feature.length > 0),
                                        }
                                      : item
                                  )
                                )
                              }
                              className={textInput}
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <label className={fieldLabel}>Image URL</label>
                            <input
                              value={product.image || ''}
                              onChange={(event) =>
                                setProductDraft((prev) =>
                                  prev.map((item, itemIndex) =>
                                    itemIndex === index ? { ...item, image: event.target.value } : item
                                  )
                                )
                              }
                              className={textInput}
                              placeholder="https://..."
                            />
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              {activeTab === 'industries' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-heading text-2xl text-slate-900">Industries & Detections</h3>
                      <p className="text-sm text-slate-500">Manage industry verticals and their detection capabilities.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setIndustriesDraft((prev) => [
                          {
                            id: createId(),
                            title: '',
                            subtitle: '',
                            icon: 'Building2',
                            status: 'coming-soon',
                            detections: [],
                          },
                          ...prev,
                        ])
                      }
                      className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary/90 transition"
                    >
                      <Plus className="w-4 h-4" />
                      Add Industry
                    </button>
                  </div>

                  {industriesDraft.length === 0 && (
                    <div className={card}>
                      <p className="text-sm text-slate-500">No industries configured yet.</p>
                    </div>
                  )}

                  {industriesDraft.map((industry, indIdx) => (
                    <article key={industry.id} className={card}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="font-heading text-xl text-slate-900">
                          {industry.title || 'Untitled Industry'}
                          <span className={`ml-2 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${
                            industry.status === 'live' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                            industry.status === 'pilot' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                            'bg-blue-100 text-blue-700 border-blue-200'
                          }`}>
                            {industry.status}
                          </span>
                        </h4>
                        <button
                          type="button"
                          onClick={() => setIndustriesDraft((prev) => prev.filter((item) => item.id !== industry.id))}
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remove
                        </button>
                      </div>
                      <div className="mt-4 grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className={fieldLabel}>Title</label>
                          <input
                            value={industry.title}
                            onChange={(event) =>
                              setIndustriesDraft((prev) =>
                                prev.map((item, i) => i === indIdx ? { ...item, title: event.target.value } : item)
                              )
                            }
                            className={textInput}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className={fieldLabel}>Icon Name</label>
                          <input
                            value={industry.icon}
                            onChange={(event) =>
                              setIndustriesDraft((prev) =>
                                prev.map((item, i) => i === indIdx ? { ...item, icon: event.target.value } : item)
                              )
                            }
                            className={textInput}
                            placeholder="Store, HardHat, Warehouse, Factory..."
                          />
                        </div>
                        <div className="space-y-2">
                          <label className={fieldLabel}>Status</label>
                          <select
                            value={industry.status}
                            onChange={(event) =>
                              setIndustriesDraft((prev) =>
                                prev.map((item, i) => i === indIdx ? { ...item, status: event.target.value as Industry['status'] } : item)
                              )
                            }
                            className={textInput}
                          >
                            <option value="live">Live</option>
                            <option value="pilot">Pilot</option>
                            <option value="coming-soon">Coming Soon</option>
                          </select>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className={fieldLabel}>Subtitle</label>
                          <textarea
                            value={industry.subtitle}
                            onChange={(event) =>
                              setIndustriesDraft((prev) =>
                                prev.map((item, i) => i === indIdx ? { ...item, subtitle: event.target.value } : item)
                              )
                            }
                            className={textArea}
                          />
                        </div>
                      </div>

                      {/* Detections */}
                      <div className="mt-5 border-t border-slate-200 pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className={fieldLabel}>Detections ({industry.detections.length})</p>
                          <button
                            type="button"
                            onClick={() =>
                              setIndustriesDraft((prev) =>
                                prev.map((item, i) =>
                                  i === indIdx
                                    ? {
                                        ...item,
                                        detections: [
                                          ...item.detections,
                                          { id: createId(), name: '', description: '', status: industry.status },
                                        ],
                                      }
                                    : item
                                )
                              )
                            }
                            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                          >
                            <Plus className="w-3 h-3" /> Add Detection
                          </button>
                        </div>
                        <div className="space-y-3">
                          {industry.detections.map((det, detIdx) => (
                            <div key={det.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                              <div className="flex items-center justify-between mb-3">
                                <p className="text-sm font-semibold text-slate-700">{det.name || 'Unnamed Detection'}</p>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setIndustriesDraft((prev) =>
                                      prev.map((item, i) =>
                                        i === indIdx
                                          ? { ...item, detections: item.detections.filter((d) => d.id !== det.id) }
                                          : item
                                      )
                                    )
                                  }
                                  className="text-rose-500 hover:text-rose-700 transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <div className="grid md:grid-cols-3 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-semibold uppercase text-slate-400">Name</label>
                                  <input
                                    value={det.name}
                                    onChange={(event) =>
                                      setIndustriesDraft((prev) =>
                                        prev.map((item, i) =>
                                          i === indIdx
                                            ? {
                                                ...item,
                                                detections: item.detections.map((d, di) =>
                                                  di === detIdx ? { ...d, name: event.target.value } : d
                                                ),
                                              }
                                            : item
                                        )
                                      )
                                    }
                                    className={textInput}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-semibold uppercase text-slate-400">Status</label>
                                  <select
                                    value={det.status}
                                    onChange={(event) =>
                                      setIndustriesDraft((prev) =>
                                        prev.map((item, i) =>
                                          i === indIdx
                                            ? {
                                                ...item,
                                                detections: item.detections.map((d, di) =>
                                                  di === detIdx ? { ...d, status: event.target.value as Detection['status'] } : d
                                                ),
                                              }
                                            : item
                                        )
                                      )
                                    }
                                    className={textInput}
                                  >
                                    <option value="live">Live</option>
                                    <option value="pilot">Pilot</option>
                                    <option value="coming-soon">Coming Soon</option>
                                  </select>
                                </div>
                                <div className="space-y-1 md:col-span-3">
                                  <label className="text-[10px] font-semibold uppercase text-slate-400">Description</label>
                                  <input
                                    value={det.description}
                                    onChange={(event) =>
                                      setIndustriesDraft((prev) =>
                                        prev.map((item, i) =>
                                          i === indIdx
                                            ? {
                                                ...item,
                                                detections: item.detections.map((d, di) =>
                                                  di === detIdx ? { ...d, description: event.target.value } : d
                                                ),
                                              }
                                            : item
                                        )
                                      )
                                    }
                                    className={textInput}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {activeTab === 'plans' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-heading text-2xl text-slate-900">Pricing Matrix</h3>
                      <p className="text-sm text-slate-500">Maintain monthly, quarterly, and yearly offer sets.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setPlanDraft((prev) => [
                          { id: createId(), name: '', type: 'monthly', price: '', features: [] },
                          ...prev,
                        ])
                      }
                      className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary/90 transition"
                    >
                      <Plus className="w-4 h-4" />
                      Add Plan
                    </button>
                  </div>

                  {filteredPlans.length === 0 && (
                    <div className={card}>
                      <p className="text-sm text-slate-500">No plans match your search.</p>
                    </div>
                  )}

                  {filteredPlans.map((plan) => {
                    const index = planDraft.findIndex((item) => item.id === plan.id);
                    if (index === -1) return null;
                    return (
                      <article key={plan.id} className={card}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4 className="font-heading text-xl text-slate-900">{plan.name || 'Untitled Plan'}</h4>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setPlanDraft((prev) => {
                                  const copy = cloneValue(prev[index]);
                                  copy.id = createId();
                                  copy.name = copy.name ? `${copy.name} Copy` : '';
                                  return [copy, ...prev];
                                })
                              }
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-primary hover:text-primary transition"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              Duplicate
                            </button>
                            <button
                              type="button"
                              onClick={() => setPlanDraft((prev) => prev.filter((item) => item.id !== plan.id))}
                              className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Remove
                            </button>
                          </div>
                        </div>

                        <div className="mt-4 grid md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <label className={fieldLabel}>Plan Name</label>
                            <input
                              value={plan.name}
                              onChange={(event) =>
                                setPlanDraft((prev) =>
                                  prev.map((item, itemIndex) =>
                                    itemIndex === index ? { ...item, name: event.target.value } : item
                                  )
                                )
                              }
                              className={textInput}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className={fieldLabel}>Price</label>
                            <input
                              value={plan.price}
                              onChange={(event) =>
                                setPlanDraft((prev) =>
                                  prev.map((item, itemIndex) =>
                                    itemIndex === index ? { ...item, price: event.target.value } : item
                                  )
                                )
                              }
                              className={textInput}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className={fieldLabel}>Cycle</label>
                            <select
                              value={plan.type}
                              onChange={(event) =>
                                setPlanDraft((prev) =>
                                  prev.map((item, itemIndex) =>
                                    itemIndex === index
                                      ? { ...item, type: event.target.value as 'monthly' | 'quarterly' | 'yearly' }
                                      : item
                                  )
                                )
                              }
                              className={textInput}
                            >
                              <option value="monthly">Monthly</option>
                              <option value="quarterly">Quarterly</option>
                              <option value="yearly">Yearly</option>
                            </select>
                          </div>
                          <div className="space-y-2 md:col-span-3">
                            <label className={fieldLabel}>Features (comma separated)</label>
                            <input
                              value={plan.features.join(', ')}
                              onChange={(event) =>
                                setPlanDraft((prev) =>
                                  prev.map((item, itemIndex) =>
                                    itemIndex === index
                                      ? {
                                          ...item,
                                          features: event.target.value
                                            .split(',')
                                            .map((feature) => feature.trim())
                                            .filter((feature) => feature.length > 0),
                                        }
                                      : item
                                  )
                                )
                              }
                              className={textInput}
                            />
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              {activeTab === 'media' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-heading text-2xl text-slate-900">Media Library</h3>
                    <p className="text-sm text-slate-500">Control all page images from one place.</p>
                  </div>

                  <div className="grid xl:grid-cols-2 gap-4">
                    {mediaFields.map((field) => (
                      <article key={field.key} className={card}>
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-slate-900">{field.label}</p>
                          <p className="text-xs text-slate-500">{field.hint}</p>
                          <input
                            value={mediaDraft[field.key]}
                            onChange={(event) =>
                              setMediaDraft((prev) => ({
                                ...prev,
                                [field.key]: event.target.value,
                              }))
                            }
                            className={textInput}
                            placeholder="https://..."
                          />
                        </div>
                        <div className="mt-3 h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                          {mediaDraft[field.key] ? (
                            <img src={mediaDraft[field.key]} alt={field.label} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">No image URL</div>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );

  return createPortal(panel, document.body);
}
