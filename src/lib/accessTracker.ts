import { db } from './firebase';
import { doc, getDoc, setDoc, onSnapshot, increment, collection } from 'firebase/firestore';

export interface SiteAccessSummary {
  totalVisits: number;
  uniqueVisitors: number;
  todayVisits: number;
  todayDate: string;
  origins: {
    facebook: number;
    outras: number;
    direto_nao_identificada: number;
  };
  lastAccessAt?: string;
}

export interface DailyAccessRecord {
  date: string; // 'YYYY-MM-DD'
  label: string; // '26/10'
  dayOfWeek: string; // 'Seg', 'Ter', etc.
  visits: number;
  unique: number;
  origins: {
    facebook: number;
    outras: number;
    direto_nao_identificada: number;
  };
}

export interface CompanyStatsRecord {
  id: string;
  name: string;
  category: string;
  city?: string;
  wa?: string;
  views: number;
  clicksWhatsapp: number;
  clicksOther: number;
  clicksTotal: number;
  lastAction?: string;
  lastActionAt?: string;
}

// Retorna data formatada YYYY-MM-DD no fuso de Fortaleza/Brasil
export const getTodayDateKey = (): string => {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Fortaleza',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(new Date());
  } catch (e) {
    return new Date().toISOString().slice(0, 10);
  }
};

// Detecta origem técnica do acesso
export const detectTrafficOrigin = (): {
  key: 'facebook' | 'outras' | 'direto_nao_identificada';
  sourceName: string;
} => {
  const ref = (document.referrer || '').toLowerCase();
  const searchPart = window.location.search.toLowerCase();
  const hashPart = window.location.hash.toLowerCase();
  const fullParams = new URLSearchParams(window.location.search);
  const hashSearchParams = new URLSearchParams(
    window.location.hash.includes('?') ? window.location.hash.split('?')[1] : ''
  );

  // 1. Verificação detalhada de Facebook (Referrer ou parâmetros oficiais do FB)
  const isFacebook = 
    ref.includes('facebook.com') ||
    ref.includes('fb.me') ||
    ref.includes('fb.com') ||
    ref.includes('m.facebook.com') ||
    ref.includes('l.facebook.com') ||
    fullParams.has('fbclid') ||
    hashSearchParams.has('fbclid') ||
    searchPart.includes('fbclid') ||
    hashPart.includes('fbclid') ||
    fullParams.get('utm_source')?.toLowerCase().includes('facebook') ||
    hashSearchParams.get('utm_source')?.toLowerCase().includes('facebook') ||
    fullParams.get('ref')?.toLowerCase().includes('facebook') ||
    hashSearchParams.get('ref')?.toLowerCase().includes('facebook');

  if (isFacebook) {
    return { key: 'facebook', sourceName: 'Facebook' };
  }

  // 2. Outras origens externas identificadas
  const isInstagram = 
    ref.includes('instagram.com') || 
    ref.includes('l.instagram.com') ||
    fullParams.get('utm_source')?.toLowerCase().includes('instagram') ||
    hashSearchParams.get('utm_source')?.toLowerCase().includes('instagram');

  if (isInstagram) {
    return { key: 'outras', sourceName: 'Instagram' };
  }

  const isWhatsApp = 
    ref.includes('whatsapp') || 
    ref.includes('wa.me') ||
    fullParams.get('utm_source')?.toLowerCase().includes('whatsapp') ||
    hashSearchParams.get('utm_source')?.toLowerCase().includes('whatsapp');

  if (isWhatsApp) {
    return { key: 'outras', sourceName: 'WhatsApp' };
  }

  const isSearchEngine = 
    ref.includes('google.') || 
    ref.includes('bing.') || 
    ref.includes('yahoo.') ||
    ref.includes('duckduckgo.');

  if (isSearchEngine) {
    return { key: 'outras', sourceName: 'Google / Buscadores' };
  }

  if (ref && !ref.includes(window.location.hostname)) {
    try {
      const parsedHost = new URL(ref).hostname;
      return { key: 'outras', sourceName: `Outras (${parsedHost})` };
    } catch (e) {
      return { key: 'outras', sourceName: 'Outras Origens' };
    }
  }

  // 3. Acesso direto ou origem não identificada
  return { key: 'direto_nao_identificada', sourceName: 'Origem não identificada / Direto' };
};

// Registra acesso real evitando contagens duplicadas na mesma sessão
export const recordSiteAccess = async (): Promise<void> => {
  // Evita recontagem se já registrou nesta sessão de navegação (evita F5/reloads)
  if (sessionStorage.getItem('md_access_logged_v2')) {
    return;
  }

  try {
    sessionStorage.setItem('md_access_logged_v2', 'true');

    // 1. Visitante Único (identificado por UUID persistente no navegador)
    let isUnique = false;
    let visitorId = localStorage.getItem('md_visitor_uuid');
    if (!visitorId) {
      visitorId = 'vis_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('md_visitor_uuid', visitorId);
      isUnique = true;
    }

    const todayDate = getTodayDateKey();
    const origin = detectTrafficOrigin();
    const originKey = origin.key;

    // 2. Atualiza Resumo Global em 'portal_stats/summary'
    const summaryRef = doc(db, 'portal_stats', 'summary');
    const snap = await getDoc(summaryRef);
    
    let isNewDay = true;
    let baselineTotal = 9480;

    if (snap.exists()) {
      const data = snap.data();
      isNewDay = data.todayDate !== todayDate;
      baselineTotal = Number(data.totalVisits || 9480);
    } else {
      // Pega contador de settings universal como base se existir
      try {
        const uSnap = await getDoc(doc(db, 'settings', 'universal'));
        if (uSnap.exists()) {
          baselineTotal = Math.max(Number(uSnap.data()?.totalVisits || 0), 9480);
        }
      } catch (e) {}
    }

    const nextTotal = baselineTotal + 1;

    await setDoc(summaryRef, {
      totalVisits: increment(1),
      uniqueVisitors: isUnique ? increment(1) : increment(0),
      todayDate: todayDate,
      todayVisits: isNewDay ? 1 : increment(1),
      origins: {
        facebook: originKey === 'facebook' ? increment(1) : increment(0),
        outras: originKey === 'outras' ? increment(1) : increment(0),
        direto_nao_identificada: originKey === 'direto_nao_identificada' ? increment(1) : increment(0)
      },
      lastAccessAt: new Date().toISOString()
    }, { merge: true });

    // Sincroniza também com settings/universal para manter compatibilidade com contador de rodapé
    try {
      const configRef = doc(db, 'settings', 'universal');
      await setDoc(configRef, {
        totalVisits: increment(1),
        lastIncrementAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {}

    // 3. Atualiza Histórico Diário em 'portal_stats/daily_history'
    const dailyRef = doc(db, 'portal_stats', 'daily_history');
    await setDoc(dailyRef, {
      [`days.${todayDate}.visits`]: increment(1),
      [`days.${todayDate}.unique`]: isUnique ? increment(1) : increment(0),
      [`days.${todayDate}.origins.${originKey}`]: increment(1),
      lastUpdatedAt: new Date().toISOString()
    }, { merge: true });

  } catch (error) {
    console.warn("Aviso ao registrar estatística de acesso:", error);
  }
};

// Escuta em tempo real o resumo de estatísticas
export const subscribeAccessSummary = (
  callback: (summary: SiteAccessSummary) => void
): (() => void) => {
  const summaryRef = doc(db, 'portal_stats', 'summary');

  return onSnapshot(summaryRef, (snap) => {
    const today = getTodayDateKey();
    if (snap.exists()) {
      const d = snap.data();
      const isToday = d.todayDate === today;
      const summary: SiteAccessSummary = {
        totalVisits: Number(d.totalVisits || 9480),
        uniqueVisitors: Number(d.uniqueVisitors || Math.round(Number(d.totalVisits || 9480) * 0.72)),
        todayVisits: isToday ? Number(d.todayVisits || 1) : 1,
        todayDate: today,
        origins: {
          facebook: Number(d.origins?.facebook || 0),
          outras: Number(d.origins?.outras || 0),
          direto_nao_identificada: Number(d.origins?.direto_nao_identificada || 0)
        },
        lastAccessAt: d.lastAccessAt
      };
      callback(summary);
    } else {
      // Estado inicial padrão
      callback({
        totalVisits: 9480,
        uniqueVisitors: Math.round(9480 * 0.72),
        todayVisits: 1,
        todayDate: today,
        origins: { facebook: 0, outras: 0, direto_nao_identificada: 1 }
      });
    }
  }, (err) => {
    console.warn("Erro ao escutar portal_stats/summary:", err);
  });
};

// Escuta histórico diário para o gráfico
export const subscribeDailyHistory = (
  daysToFetch: number = 14,
  callback: (records: DailyAccessRecord[]) => void
): (() => void) => {
  const dailyRef = doc(db, 'portal_stats', 'daily_history');

  return onSnapshot(dailyRef, (snap) => {
    const rawDays = snap.exists() ? (snap.data()?.days || {}) : {};
    const records: DailyAccessRecord[] = [];
    const today = new Date();

    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    for (let i = daysToFetch - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateKey = d.toISOString().slice(0, 10);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const label = `${day}/${month}`;
      const dayOfWeek = weekDays[d.getDay()];

      const dayData = rawDays[dateKey] || {};
      const visits = Number(dayData.visits || 0);
      const unique = Number(dayData.unique || 0);
      const origins = dayData.origins || {};

      records.push({
        date: dateKey,
        label,
        dayOfWeek,
        visits,
        unique,
        origins: {
          facebook: Number(origins.facebook || 0),
          outras: Number(origins.outras || 0),
          direto_nao_identificada: Number(origins.direto_nao_identificada || 0)
        }
      });
    }

    callback(records);
  }, (err) => {
    console.warn("Erro ao escutar portal_stats/daily_history:", err);
  });
};

// Escuta cliques e acessos de cada empresa/cliente cadastrado
export const subscribeCompanyStats = (
  allCompanies: any[],
  callback: (records: CompanyStatsRecord[]) => void
): (() => void) => {
  const compCollRef = collection(db, 'company_views');

  return onSnapshot(compCollRef, (snap) => {
    const firestoreMap = new Map<string, any>();
    snap.forEach((docSnap) => {
      firestoreMap.set(docSnap.id, docSnap.data());
    });

    const records: CompanyStatsRecord[] = (allCompanies || []).map((comp: any) => {
      const companyKey = String(comp.id || comp.name || 'empresa').toLowerCase().replace(/\s+/g, '-');
      const fsData = firestoreMap.get(companyKey);

      // Visualizações base do portal + extras registradas
      const extraViews = Number(fsData?.extraViews || fsData?.totalViews || 0);
      const baseViews = typeof comp.views === 'number' && comp.views >= 100 
        ? comp.views 
        : (comp.baseViews || 280);
      const totalViews = baseViews + extraViews;

      const clicksWhatsapp = Number(fsData?.clicksWhatsapp || 0);
      const clicksInstagram = Number(fsData?.clicksInstagram || 0);
      const clicksWebsite = Number(fsData?.clicksWebsite || 0);
      const clicksCatalog = Number(fsData?.clicksCatalog || 0);
      const clicksOther = clicksInstagram + clicksWebsite + clicksCatalog;
      const clicksTotal = Number(fsData?.clicksTotal || (clicksWhatsapp + clicksOther));

      return {
        id: companyKey,
        name: comp.name || 'Empresa Sem Nome',
        category: comp.category || 'Geral',
        city: comp.city || '',
        wa: comp.wa || '',
        views: totalViews,
        clicksWhatsapp,
        clicksOther,
        clicksTotal,
        lastAction: fsData?.lastAction,
        lastActionAt: fsData?.lastActionAt || fsData?.updatedAt
      };
    });

    // Ordena primariamente por cliques e depois por visualizações
    records.sort((a, b) => (b.clicksTotal - a.clicksTotal) || (b.views - a.views));

    callback(records);
  }, (err) => {
    console.warn("Erro ao escutar company_views:", err);
  });
};
