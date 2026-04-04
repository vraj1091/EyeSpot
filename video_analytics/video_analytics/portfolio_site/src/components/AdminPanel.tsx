import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { X, Save } from 'lucide-react';

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
    }
  }, [isOpen, store]);
  
  const handleSave = () => {
    store.updateCompanyDetails(data);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-5xl h-[90vh] overflow-hidden glass-panel rounded-3xl p-0 border border-white/20 flex flex-col">
        <div className="bg-slate-950 border-b border-white/10 p-6 flex justify-between items-center sticky top-0 z-20 shadow-xl">
          <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent uppercase tracking-widest">
            EyeSpot Core Override
          </h2>
          <button onClick={onClose} className="text-white bg-white/5 p-3 rounded-full hover:bg-red-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="overflow-y-auto p-8 space-y-16 flex-1 bg-slate-900/50">
          
          <section className="space-y-6">
            <h3 className="text-xl font-bold text-white border-b border-white/10 pb-4 shadow-sm">Global Branding</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-xs text-primary font-black uppercase tracking-[0.2em]">Designation Code</label>
                <input 
                  value={data.companyName} 
                  onChange={e => setData({...data, companyName: e.target.value})}
                  className="w-full bg-slate-950/80 p-5 rounded-2xl border border-white/5 text-white focus:border-primary focus:bg-slate-950 outline-none transition-colors font-medium text-lg shadow-inner"
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs text-primary font-black uppercase tracking-[0.2em]">Operational Tagline</label>
                <input 
                  value={data.tagline} 
                  onChange={e => setData({...data, tagline: e.target.value})}
                  className="w-full bg-slate-950/80 p-5 rounded-2xl border border-white/5 text-white focus:border-primary focus:bg-slate-950 outline-none transition-colors font-medium text-lg shadow-inner"
                />
              </div>
            </div>
          </section>

          <section className="space-y-8">
            <h3 className="text-xl font-bold text-white border-b border-white/10 pb-4">Strategy & Intel</h3>
            <div className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs text-primary font-black uppercase tracking-[0.2em]">Strategic Vision</label>
                  <textarea 
                    value={data.vision} 
                    onChange={e => setData({...data, vision: e.target.value})}
                    rows={4}
                    className="w-full bg-slate-950/80 p-5 rounded-2xl border border-white/5 text-gray-300 focus:border-primary outline-none transition-colors resize-none leading-relaxed"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs text-primary font-black uppercase tracking-[0.2em]">Tactical Mission</label>
                  <textarea 
                    value={data.mission} 
                    onChange={e => setData({...data, mission: e.target.value})}
                    rows={4}
                    className="w-full bg-slate-950/80 p-5 rounded-2xl border border-white/5 text-gray-300 focus:border-primary outline-none transition-colors resize-none leading-relaxed"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-xs text-primary font-black uppercase tracking-[0.2em]">Detailed Architecture / About</label>
                <textarea 
                  value={data.aboutText} 
                  onChange={e => setData({...data, aboutText: e.target.value})}
                  rows={4}
                  className="w-full bg-slate-950/80 p-5 rounded-2xl border border-white/5 text-gray-300 focus:border-primary outline-none transition-colors resize-none leading-relaxed"
                />
              </div>
            </div>
          </section>
          
          <section className="space-y-8 pb-10">
            <h3 className="text-xl font-bold text-white border-b border-white/10 pb-4">Personnel Database</h3>
            <div className="space-y-12">
              {store.team.map((t, idx) => (
                <div key={idx} className="bg-slate-950/40 p-8 rounded-3xl border border-white/5 space-y-6">
                  <div className="flex gap-4 items-center mb-6">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-primary font-black text-xl border border-white/10">0{idx + 1}</div>
                    <h4 className="text-2xl font-black uppercase tracking-widest flex-1">{t.name}</h4>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <input
                      value={t.name}
                      onChange={(e) => {
                        const newTeam = [...store.team];
                        newTeam[idx].name = e.target.value;
                        store.updateTeam(newTeam);
                      }}
                      className="w-full bg-slate-950/80 p-5 rounded-2xl border border-white/5 text-white font-black text-lg focus:border-primary outline-none"
                      placeholder="Codename / Name"
                    />
                    <input
                      value={t.role}
                      onChange={(e) => {
                        const newTeam = [...store.team];
                        newTeam[idx].role = e.target.value;
                        store.updateTeam(newTeam);
                      }}
                      className="w-full bg-slate-950/80 p-5 rounded-2xl border border-white/5 text-primary tracking-widest uppercase font-bold text-sm focus:border-accent outline-none"
                      placeholder="Rank / Designation"
                    />
                  </div>
                  <input
                    value={t.slogan || ''}
                    onChange={(e) => {
                      const newTeam = [...store.team];
                      newTeam[idx].slogan = e.target.value;
                      store.updateTeam(newTeam);
                    }}
                    className="w-full bg-slate-950/80 p-5 rounded-2xl border border-white/5 text-gray-400 italic font-serif text-lg focus:border-primary outline-none"
                    placeholder="Personal Slogan / Quote"
                  />
                  <textarea
                    value={t.details || ''}
                    onChange={(e) => {
                      const newTeam = [...store.team];
                      newTeam[idx].details = e.target.value;
                      store.updateTeam(newTeam);
                    }}
                    rows={3}
                    className="w-full bg-slate-950/80 p-5 rounded-2xl border border-white/5 text-gray-300 focus:border-primary outline-none resize-none leading-relaxed"
                    placeholder="Full Biography / Security Clearance Intel"
                  />
                </div>
              ))}
            </div>
          </section>

        </div>

        <div className="bg-slate-950 border-t border-white/10 p-6 flex justify-end sticky bottom-0 z-20 shadow-2xl">
          <button onClick={onClose} className="px-10 py-4 bg-transparent text-gray-500 font-bold hover:text-white transition-colors mr-2">
            Abort
          </button>
          <button onClick={handleSave} className="px-12 py-4 bg-primary text-slate-950 font-black tracking-[0.2em] uppercase rounded-full hover:bg-white shadow-[0_0_30px_rgba(56,189,248,0.3)] hover:shadow-[0_0_50px_rgba(255,255,255,0.6)] transition-all flex items-center gap-3 active:scale-95">
            <Save className="w-5 h-5"/> Commit Override
          </button>
        </div>

      </div>
    </div>
  );
}
