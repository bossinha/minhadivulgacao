import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, increment } from 'firebase/firestore';
import { Eye, TrendingUp, Users, Activity } from 'lucide-react';

const MINIMUM_BASE_PORTAL_VISITS = 9480;

// Deterministic baseline views for companies so no company starts at 0
export const getCompanyBaseViews = (company: any): number => {
  if (!company) return 320;
  const name = String(company.name || '').trim().toLowerCase();
  const id = String(company.id || '');

  if (name.includes('bossa infor')) return 540;
  if (name.includes('gih cred')) return 320;
  if (name.includes('north shopping')) return 680;
  if (name.includes('jls') || name.includes('calçado')) return 420;
  if (name.includes('belem') || name.includes('belém')) return 380;
  if (name.includes('assai') || name.includes('assaí')) return 790;
  if (name.includes('ordones') || name.includes('carneiro')) return 610;
  if (name.includes('atacadao') || name.includes('atacadão')) return 860;
  if (name.includes('cartao') || name.includes('cartão')) return 450;
  if (name.includes('espaco frio') || name.includes('espaço frio')) return 510;

  if (typeof company.views === 'number' && company.views >= 100) {
    return company.views;
  }

  // Deterministic hash based on ID + name
  let hash = 0;
  const seedStr = `${id}::${name}`;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  const seed = Math.abs(hash);
  return 260 + (seed % 540); // 260 to 799 views
};

// Retrieve local stored extra clicks for this company
export const getLocalCompanyExtraViews = (companyIdOrSlug: string): number => {
  try {
    const raw = localStorage.getItem(`c_extra_views_${companyIdOrSlug}`);
    return raw ? parseInt(raw, 10) || 0 : 0;
  } catch (e) {
    return 0;
  }
};

// Track action on company (clicking WhatsApp, Instagram, Website, Catalog, or Card)
export const trackCompanyInteraction = async (
  company: any, 
  actionType: 'card' | 'catalog' | 'whatsapp' | 'instagram' | 'website' = 'card'
) => {
  if (!company) return;
  const companyKey = String(company.id || company.name || 'empresa').toLowerCase().replace(/\s+/g, '-');

  // 1. Immediately update local storage
  const currentExtra = getLocalCompanyExtraViews(companyKey);
  const newExtra = currentExtra + 1;
  try {
    localStorage.setItem(`c_extra_views_${companyKey}`, String(newExtra));
    // Dispatch custom event so all cards on page update instantly
    window.dispatchEvent(new CustomEvent('company-views-updated', {
      detail: { companyKey, extraViews: newExtra }
    }));
  } catch (e) {}

  // 2. Increment Firestore in background
  try {
    const compDocRef = doc(db, 'company_views', companyKey);
    await setDoc(compDocRef, {
      id: companyKey,
      name: company.name || '',
      extraViews: increment(1),
      lastAction: actionType,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (e) {
    // Fail silently, local state already incremented
  }

  // 3. Increment global portal visits
  incrementPortalVisitsRealtime(1);
};

// Global portal visits tracker
export const incrementPortalVisitsRealtime = async (amount: number = 1) => {
  try {
    const stored = localStorage.getItem('minhadivulgacao_total_visits');
    const current = stored ? parseInt(stored, 10) || MINIMUM_BASE_PORTAL_VISITS : MINIMUM_BASE_PORTAL_VISITS;
    const nextVal = current + amount;
    localStorage.setItem('minhadivulgacao_total_visits', String(nextVal));

    window.dispatchEvent(new CustomEvent('portal-visits-updated', {
      detail: { totalVisits: nextVal }
    }));

    const configRef = doc(db, 'settings', 'universal');
    await setDoc(configRef, {
      totalVisits: increment(amount),
      lastIncrementAt: new Date().toISOString()
    }, { merge: true });
  } catch (e) {
    // Fail silently
  }
};

// Component for the discrete company card view counter
export const CompanyCardViewBadge: React.FC<{ company: any }> = ({ company }) => {
  const baseViews = getCompanyBaseViews(company);
  const companyKey = String(company?.id || company?.name || 'empresa').toLowerCase().replace(/\s+/g, '-');
  const [extraViews, setExtraViews] = useState<number>(() => getLocalCompanyExtraViews(companyKey));
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    // Listen for local updates to this company's views
    const handleUpdate = (e: any) => {
      if (e.detail?.companyKey === companyKey) {
        setExtraViews(e.detail.extraViews);
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 1200);
      }
    };

    window.addEventListener('company-views-updated', handleUpdate);

    // Also listen to Firestore live updates for this company if available
    let unsubscribe: (() => void) | null = null;
    try {
      const compDocRef = doc(db, 'company_views', companyKey);
      unsubscribe = onSnapshot(compDocRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const remoteExtra = Number(data.extraViews || 0);
          if (remoteExtra > extraViews) {
            setExtraViews(remoteExtra);
            try {
              localStorage.setItem(`c_extra_views_${companyKey}`, String(remoteExtra));
            } catch (e) {}
          }
        }
      }, () => {});
    } catch (e) {}

    return () => {
      window.removeEventListener('company-views-updated', handleUpdate);
      if (unsubscribe) unsubscribe();
    };
  }, [companyKey]);

  const totalViews = baseViews + extraViews;

  return (
    <span 
      title={`${totalViews} visualizações deste perfil no portal`}
      className={`text-[9px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full select-none flex items-center gap-1 font-mono transition-all duration-300 ${
        isPulsing 
          ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50 scale-105 shadow-[0_0_12px_rgba(251,191,36,0.3)]' 
          : 'bg-white/5 text-white/50 hover:text-white/80 border border-white/10 hover:border-white/20'
      }`}
    >
      <Eye size={11} className={`${isPulsing ? 'text-amber-400 animate-bounce' : 'text-white/60'} shrink-0`} />
      <span>{totalViews.toLocaleString('pt-BR')}</span>
    </span>
  );
};

// Big, prominent Real-time Visitor Counter at the bottom of the portal
export const BigRealtimeVisitorCounter: React.FC = () => {
  const [visits, setVisits] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('minhadivulgacao_total_visits');
      if (stored) {
        const val = parseInt(stored, 10);
        if (val >= MINIMUM_BASE_PORTAL_VISITS) return val;
      }
    } catch (e) {}
    return MINIMUM_BASE_PORTAL_VISITS + 24;
  });

  const [hasIncrementedSession, setHasIncrementedSession] = useState(false);
  const [pulse, setPulse] = useState(false);

  // Firestore real-time sync
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    try {
      const configRef = doc(db, 'settings', 'universal');
      unsubscribe = onSnapshot(configRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const remoteCount = Number(data.totalVisits || 0);
          const finalCount = Math.max(remoteCount, MINIMUM_BASE_PORTAL_VISITS);
          setVisits(prev => {
            const next = Math.max(prev, finalCount);
            try {
              localStorage.setItem('minhadivulgacao_total_visits', String(next));
            } catch (e) {}
            return next;
          });
          setPulse(true);
          setTimeout(() => setPulse(false), 800);
        }
      }, (err) => {
        console.warn("Visitor counter listener warning:", err);
      });
    } catch (e) {
      console.warn("Error setting up visitor listener:", e);
    }

    // Custom local events listener
    const handleLocalUpdate = (e: any) => {
      if (e.detail?.totalVisits) {
        setVisits(e.detail.totalVisits);
        setPulse(true);
        setTimeout(() => setPulse(false), 800);
      }
    };
    window.addEventListener('portal-visits-updated', handleLocalUpdate);

    return () => {
      if (unsubscribe) unsubscribe();
      window.removeEventListener('portal-visits-updated', handleLocalUpdate);
    };
  }, []);

  // Increment visit once per session
  useEffect(() => {
    if (!sessionStorage.getItem('portal_session_visit_counted')) {
      sessionStorage.setItem('portal_session_visit_counted', 'true');
      setHasIncrementedSession(true);
      incrementPortalVisitsRealtime(1);
    }
  }, []);

  // Subtle live traffic activity (adds 1 visit occasionally between 45s-90s to maintain real-time continuity)
  useEffect(() => {
    const interval = setInterval(() => {
      incrementPortalVisitsRealtime(1);
    }, 55000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 my-10 select-none">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#12141f] via-[#0d0e15] to-[#07080c] border border-amber-500/30 p-6 sm:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.6)] text-center">
        
        {/* Ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-[70px] pointer-events-none" />

        {/* Live Status Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono font-bold uppercase tracking-wider mb-4">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span>AO VIVO • ATUALIZADO EM TEMPO REAL</span>
        </div>

        {/* Big Counter Value */}
        <div className="flex items-center justify-center my-2">
          <div className={`transition-transform duration-300 ${pulse ? 'scale-105 text-amber-300' : 'scale-100 text-amber-400'}`}>
            <span className="text-4xl sm:text-6xl md:text-7xl font-black font-mono tracking-tight drop-shadow-[0_4px_25px_rgba(245,158,11,0.35)]">
              {visits.toLocaleString('pt-BR')}
            </span>
          </div>
        </div>

        {/* Counter Title & Explanation */}
        <h3 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider mt-2">
          Visualizações & Acessos Registrados no Portal
        </h3>
        <p className="text-xs sm:text-sm text-white/60 max-w-lg mx-auto mt-2 leading-relaxed">
          Movimento contínuo de pessoas procurando produtos, serviços e empresas dentro da rede Minha Divulgação.
        </p>

        {/* Quick Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/10 text-center">
          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-1.5 text-xs text-white/50 font-bold uppercase">
              <Activity size={13} className="text-emerald-400" />
              <span>Visitas Diárias</span>
            </div>
            <span className="text-base sm:text-lg font-black font-mono text-white mt-1">
              Constante & Ativo
            </span>
          </div>

          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-1.5 text-xs text-white/50 font-bold uppercase">
              <Users size={13} className="text-amber-400" />
              <span>Público Conectado</span>
            </div>
            <span className="text-base sm:text-lg font-black font-mono text-white mt-1">
              WhatsApp & Redes
            </span>
          </div>

          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-1.5 text-xs text-white/50 font-bold uppercase">
              <TrendingUp size={13} className="text-sky-400" />
              <span>Sua Empresa Visto</span>
            </div>
            <span className="text-base sm:text-lg font-black font-mono text-white mt-1">
              24h por Dia
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
