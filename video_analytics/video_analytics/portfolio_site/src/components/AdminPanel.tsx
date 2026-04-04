import { useState, useEffect } from 'react';
import { useStore, TeamMember, Product, Plan } from '../store/useStore';
import { X, Save, Plus, Trash2, LayoutDashboard, Users, Box, Wallet } from 'lucide-react';

export default function AdminPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const store = useStore();
  
  const [data, setData] = useState({
    companyName: store.companyName,
    tagline: store.tagline,
    vision: store.vision,
    mission: store.mission,
    aboutText: store.aboutText,
    contactEmail: store.contactEmail,
    contactPhone: store.contactPhone,
    contactAddress: store.contactAddress,
  });

  const [localTeam, setLocalTeam] = useState<TeamMember[]>([]);
  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  const [localPlans, setLocalPlans] = useState<Plan[]>([]);
  const [activeTab, setActiveTab] = useState<'globals' | 'team' | 'products' | 'plans'>('globals');

  useEffect(() => {
    if (isOpen) {
      setData({
        companyName: store.companyName,
        tagline: store.tagline,
        vision: store.vision,
        mission: store.mission,
        aboutText: store.aboutText,
        contactEmail: store.contactEmail,
        contactPhone: store.contactPhone,
        contactAddress: store.contactAddress,
      });
      // Deep clone arrays to prevent live mutations
      setLocalTeam(JSON.parse(JSON.stringify(store.team || [])));
      setLocalProducts(JSON.parse(JSON.stringify(store.products || [])));
      setLocalPlans(JSON.parse(JSON.stringify(store.plans || [])));
    }
  }, [isOpen, store]);
  
  const handleSave = () => {
    store.updateCompanyDetails(data);
    store.updateTeam(localTeam);
    store.updateProducts(localProducts);
    store.updatePlans(localPlans);
    onClose();
  };

  if (!isOpen) return null;

  const inputClasses = "w-full bg-slate-950/80 p-5 rounded-2xl border border-white/5 text-white focus:border-primary focus:bg-slate-950 outline-none transition-colors font-medium text-lg shadow-inner";
  const labelClasses = "text-xs text-primary font-black uppercase tracking-[0.2em]";
  const textareaClasses = "w-full bg-slate-950/80 p-5 rounded-2xl border border-white/5 text-gray-300 focus:border-primary outline-none transition-colors resize-none leading-relaxed";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-6xl h-[95vh] overflow-hidden glass-panel rounded-3xl p-0 border border-white/20 flex flex-col">
        {/* HEADER */}
        <div className="bg-slate-950 border-b border-white/10 p-6 flex justify-between items-center sticky top-0 z-20 shadow-xl">
          <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent uppercase tracking-widest">
            EyeSpot Core Override
          </h2>
          <button onClick={onClose} className="text-white bg-white/5 p-3 rounded-full hover:bg-red-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* TABS */}
        <div className="bg-slate-950/80 px-8 py-6 border-b border-white/5">
          <div className="flex bg-slate-900/40 p-2 rounded-2xl gap-2 overflow-x-auto border border-white/5">
            {[
              { id: 'globals', label: 'Globals & Contact', icon: LayoutDashboard },
              { id: 'team', label: 'Personnel (Team)', icon: Users },
              { id: 'products', label: 'Modules (Products)', icon: Box },
              { id: 'plans', label: 'Security Tiers (Plans)', icon: Wallet }
            ].map(t => (
              <button 
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all whitespace-nowrap ${activeTab === t.id ? 'bg-primary text-slate-950 shadow-[0_0_20px_rgba(56,189,248,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                <t.icon className="w-4 h-4" /> {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENT */}
        <div className="overflow-y-auto p-8 space-y-16 flex-1 bg-slate-900/50">
          
          {/* 1. GLOBALS TAB */}
          {activeTab === 'globals' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <section className="space-y-6">
                <h3 className="text-xl font-bold text-white border-b border-white/10 pb-4 shadow-sm">Global Branding</h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className={labelClasses}>Designation Code (Name)</label>
                    <input value={data.companyName} onChange={e => setData({...data, companyName: e.target.value})} className={inputClasses} />
                  </div>
                  <div className="space-y-3">
                    <label className={labelClasses}>Operational Tagline</label>
                    <input value={data.tagline} onChange={e => setData({...data, tagline: e.target.value})} className={inputClasses} />
                  </div>
                </div>
              </section>

              <section className="space-y-8">
                <h3 className="text-xl font-bold text-white border-b border-white/10 pb-4">Strategy & Intel</h3>
                <div className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className={labelClasses}>Strategic Vision</label>
                      <textarea value={data.vision} onChange={e => setData({...data, vision: e.target.value})} rows={4} className={textareaClasses} />
                    </div>
                    <div className="space-y-3">
                      <label className={labelClasses}>Tactical Mission</label>
                      <textarea value={data.mission} onChange={e => setData({...data, mission: e.target.value})} rows={4} className={textareaClasses} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className={labelClasses}>Detailed Architecture / About</label>
                    <textarea value={data.aboutText} onChange={e => setData({...data, aboutText: e.target.value})} rows={4} className={textareaClasses} />
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <h3 className="text-xl font-bold text-white border-b border-white/10 pb-4">Communication Uplink (Contact)</h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className={labelClasses}>Contact Email</label>
                    <input value={data.contactEmail} onChange={e => setData({...data, contactEmail: e.target.value})} className={inputClasses} />
                  </div>
                  <div className="space-y-3">
                    <label className={labelClasses}>Contact Phone</label>
                    <input value={data.contactPhone} onChange={e => setData({...data, contactPhone: e.target.value})} className={inputClasses} />
                  </div>
                </div>
                <div className="space-y-3">
                    <label className={labelClasses}>Physical HQ Address</label>
                    <input value={data.contactAddress} onChange={e => setData({...data, contactAddress: e.target.value})} className={inputClasses} />
                </div>
              </section>
            </div>
          )}

          {/* 2. TEAM TAB */}
          {activeTab === 'team' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center bg-slate-950/40 p-6 rounded-3xl border border-white/5">
                <div>
                    <h3 className="text-xl font-bold text-white uppercase tracking-widest">Personnel Database</h3>
                    <p className="text-gray-400 text-sm mt-1">Manage team members, roles, and intel.</p>
                </div>
                <button onClick={() => setLocalTeam([{id: Date.now().toString(), name: '', role: '', slogan: '', details: ''}, ...localTeam])} className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary px-6 py-4 rounded-full font-black uppercase text-xs tracking-widest border border-primary/20 transition-all">
                  <Plus className="w-5 h-5"/> Add Personnel
                </button>
              </div>
              
              <div className="space-y-8">
                {localTeam.map((t, idx) => (
                  <div key={t.id} className="bg-slate-900/40 p-8 rounded-3xl border border-white/5 space-y-6 relative group hover:border-white/10 transition-colors">
                    <button onClick={() => setLocalTeam(localTeam.filter(x => x.id !== t.id))} className="absolute top-6 right-6 p-4 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100 shadow-xl">
                      <Trash2 className="w-5 h-5"/>
                    </button>
                    
                    <div className="flex gap-4 items-center mb-6">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-xl border border-primary/30">0{idx + 1}</div>
                      <h4 className="text-2xl font-black uppercase tracking-widest flex-1 text-white">{t.name || 'NEW AGENT'}</h4>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                          <label className={labelClasses}>Full Name</label>
                          <input value={t.name} onChange={e => { const nt = [...localTeam]; nt[idx].name = e.target.value; setLocalTeam(nt); }} className={inputClasses} placeholder="John Doe" />
                      </div>
                      <div className="space-y-2">
                          <label className={labelClasses}>Rank / Designation</label>
                          <input value={t.role} onChange={e => { const nt = [...localTeam]; nt[idx].role = e.target.value; setLocalTeam(nt); }} className={inputClasses} placeholder="e.g. Chief Engineer" />
                      </div>
                    </div>
                    <div className="space-y-2">
                        <label className={labelClasses}>Personal Slogan</label>
                        <input value={t.slogan} onChange={e => { const nt = [...localTeam]; nt[idx].slogan = e.target.value; setLocalTeam(nt); }} className={inputClasses} placeholder="Quote" />
                    </div>
                    <div className="space-y-2">
                        <label className={labelClasses}>Full Biography / Intel</label>
                        <textarea value={t.details} onChange={e => { const nt = [...localTeam]; nt[idx].details = e.target.value; setLocalTeam(nt); }} rows={3} className={textareaClasses} placeholder="Details" />
                    </div>
                  </div>
                ))}
                {localTeam.length === 0 && <div className="text-center p-10 text-gray-500 italic">No personnel initialized.</div>}
              </div>
            </div>
          )}

          {/* 3. PRODUCTS TAB */}
          {activeTab === 'products' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center bg-slate-950/40 p-6 rounded-3xl border border-white/5">
                <div>
                    <h3 className="text-xl font-bold text-white uppercase tracking-widest">Neural Modules Database</h3>
                    <p className="text-gray-400 text-sm mt-1">Configure your product offerings.</p>
                </div>
                <button onClick={() => setLocalProducts([{id: Date.now().toString(), name: '', description: '', longDescription: '', features: [], iconIndex: 0}, ...localProducts])} className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary px-6 py-4 rounded-full font-black uppercase text-xs tracking-widest border border-primary/20 transition-all">
                  <Plus className="w-5 h-5"/> Initialize Module
                </button>
              </div>

              <div className="space-y-8">
                {localProducts.map((p, idx) => (
                  <div key={p.id} className="bg-slate-900/40 p-8 rounded-3xl border border-white/5 space-y-6 relative group hover:border-white/10 transition-colors">
                    <button onClick={() => setLocalProducts(localProducts.filter(x => x.id !== p.id))} className="absolute top-6 right-6 p-4 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100 shadow-xl">
                      <Trash2 className="w-5 h-5"/>
                    </button>
                    
                    <div className="flex gap-4 items-center mb-6">
                      <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center text-accent font-black text-xl border border-accent/30">{p.iconIndex || 0}</div>
                      <h4 className="text-2xl font-black uppercase tracking-widest flex-1 text-white">{p.name || 'NEW MODULE'}</h4>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                          <label className={labelClasses}>Module Name</label>
                          <input value={p.name} onChange={e => { const np = [...localProducts]; np[idx].name = e.target.value; setLocalProducts(np); }} className={inputClasses} placeholder="Module Name" />
                      </div>
                      <div className="space-y-2">
                          <label className={labelClasses}>Short Description</label>
                          <input value={p.description} onChange={e => { const np = [...localProducts]; np[idx].description = e.target.value; setLocalProducts(np); }} className={inputClasses} placeholder="Brief summary" />
                      </div>
                    </div>
                    <div className="space-y-2">
                        <label className={labelClasses}>Long Technical Description</label>
                        <textarea value={p.longDescription} onChange={e => { const np = [...localProducts]; np[idx].longDescription = e.target.value; setLocalProducts(np); }} rows={3} className={textareaClasses} placeholder="Full description" />
                    </div>
                    
                    <div className="grid md:grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <label className={labelClasses}>Features (Comma separated)</label>
                            <input 
                            value={p.features.join(', ')} 
                            onChange={e => { 
                                const np = [...localProducts]; 
                                np[idx].features = e.target.value.split(',').map(s => s.trim()).filter(s => s); 
                                setLocalProducts(np); 
                            }}
                            className={inputClasses}
                            placeholder="Feature 1, Feature 2, Feature 3"
                            />
                        </div>
                    </div>
                  </div>
                ))}
                {localProducts.length === 0 && <div className="text-center p-10 text-gray-500 italic">No modules initialized.</div>}
              </div>
            </div>
          )}

          {/* 4. PLANS TAB */}
          {activeTab === 'plans' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center bg-slate-950/40 p-6 rounded-3xl border border-white/5">
                <div>
                    <h3 className="text-xl font-bold text-white uppercase tracking-widest">Security Tiers (Plans)</h3>
                    <p className="text-gray-400 text-sm mt-1">Manage pricing plans for monthly, quarterly, yearly.</p>
                </div>
                <button onClick={() => setLocalPlans([{id: Date.now().toString(), name: '', type: 'monthly', price: '', features: []}, ...localPlans])} className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary px-6 py-4 rounded-full font-black uppercase text-xs tracking-widest border border-primary/20 transition-all">
                  <Plus className="w-5 h-5"/> Add Tier
                </button>
              </div>

              <div className="space-y-8">
                {localPlans.map((pl, idx) => (
                  <div key={pl.id} className="bg-slate-900/40 p-8 rounded-3xl border border-white/5 space-y-6 relative group hover:border-white/10 transition-colors">
                    <button onClick={() => setLocalPlans(localPlans.filter(x => x.id !== pl.id))} className="absolute top-6 right-6 p-4 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100 shadow-xl">
                      <Trash2 className="w-5 h-5"/>
                    </button>

                    <h4 className="text-2xl font-black uppercase tracking-widest flex-1 text-white border-b border-white/10 pb-4 mb-4">{pl.name || 'NEW TIER'}</h4>
                    
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                          <label className={labelClasses}>Tier Name</label>
                          <input value={pl.name} onChange={e => { const np = [...localPlans]; np[idx].name = e.target.value; setLocalPlans(np); }} className={inputClasses} placeholder="Tier Name" />
                      </div>
                      <div className="space-y-2">
                          <label className={labelClasses}>Price (String)</label>
                          <input value={pl.price} onChange={e => { const np = [...localPlans]; np[idx].price = e.target.value; setLocalPlans(np); }} className={inputClasses} placeholder="$199 or Custom" />
                      </div>
                      <div className="space-y-2">
                          <label className={labelClasses}>Billing Cycle</label>
                          <select value={pl.type} onChange={e => { const np = [...localPlans]; np[idx].type = e.target.value as any; setLocalPlans(np); }} className={inputClasses + " appearance-none cursor-pointer"}>
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                            <option value="yearly">Yearly</option>
                          </select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                        <label className={labelClasses}>Features (Comma separated)</label>
                        <input 
                        value={pl.features.join(', ')} 
                        onChange={e => { 
                            const np = [...localPlans]; 
                            np[idx].features = e.target.value.split(',').map(s => s.trim()).filter(s => s); 
                            setLocalPlans(np); 
                        }}
                        className={inputClasses}
                        placeholder="Unlimited Cameras, Email Support"
                        />
                    </div>
                  </div>
                ))}
            {localPlans.length === 0 && <div className="text-center p-10 text-gray-500 italic">No plans initialized.</div>}
              </div>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="bg-slate-950 border-t border-white/10 p-6 flex justify-end sticky bottom-0 z-20 shadow-[0_-20px_40px_rgba(0,0,0,0.5)]">
          <button onClick={onClose} className="px-10 py-4 bg-transparent text-gray-500 font-bold hover:text-white transition-colors mr-2 uppercase tracking-widest text-sm">
            Abort
          </button>
          <button onClick={handleSave} className="px-12 py-4 bg-primary text-slate-950 font-black tracking-[0.2em] uppercase rounded-full hover:bg-white shadow-[0_0_30px_rgba(56,189,248,0.3)] hover:shadow-[0_0_50px_rgba(255,255,255,0.6)] transition-all flex items-center gap-3 active:scale-95 text-sm">
            <Save className="w-5 h-5"/> Commit Overview
          </button>
        </div>

      </div>
    </div>
  );
}
