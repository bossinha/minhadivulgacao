import { doc, getDoc, setDoc, updateDoc, increment, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

export type AnalyticsEventType = 'profile_view' | 'whatsapp_click' | 'other_contact_click';

export interface CompanyDailyStats {
  profileViews: number;
  whatsappClicks: number;
  otherClicks: number;
}

export interface CompanyAnalyticsData {
  companyId: string;
  companyName: string;
  totalProfileViews: number;
  totalWhatsAppClicks: number;
  totalOtherClicks: number;
  firstTrackedAt: string;
  lastEventAt: string;
  daily: Record<string, CompanyDailyStats>; // Key is YYYY-MM-DD
}

export interface PortalVisitStats {
  totalVisits: number;
  daily: Record<string, number>; // Key is YYYY-MM-DD
  firstTrackedAt: string;
  lastVisitAt: string;
}

const STORAGE_PREFIX_COMPANY = 'md_analytics_comp_';
const STORAGE_PREFIX_PORTAL = 'md_analytics_portal';
const DEBOUNCE_PREFIX = 'md_debounce_';
export const ACTIVATION_DATE_LABEL = '13/10/2026';

// Helper to get local date ISO string (YYYY-MM-DD)
export const getTodayDateKey = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to get past N days date keys
export const getDateKeysForPeriod = (period: 'today' | '7days' | '30days' | 'all'): string[] => {
  const today = new Date();
  const keys: string[] = [];
  
  if (period === 'today') {
    return [getTodayDateKey()];
  }

  const daysBack = period === '7days' ? 7 : period === '30days' ? 30 : 90;
  for (let i = 0; i < daysBack; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    keys.push(`${year}-${month}-${day}`);
  }
  return keys;
};

/**
 * Registra visita geral à página inicial do portal (com debounce por sessão de 15 minutos)
 */
export const recordPortalVisit = async (): Promise<void> => {
  const todayKey = getTodayDateKey();
  const debounceKey = `${DEBOUNCE_PREFIX}portal_visit`;
  const lastTime = sessionStorage.getItem(debounceKey);
  const now = Date.now();

  // Se já registrou visita nos últimos 15 minutos nesta aba/sessão, ignora
  if (lastTime && now - parseInt(lastTime, 10) < 15 * 60 * 1000) {
    return;
  }
  sessionStorage.setItem(debounceKey, String(now));

  try {
    const docRef = doc(db, 'portal_stats', 'general');
    await setDoc(docRef, {
      totalVisits: increment(1),
      [`daily.${todayKey}`]: increment(1),
      lastVisitAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    // Fallback silencioso local
    try {
      const cached = localStorage.getItem(STORAGE_PREFIX_PORTAL);
      const parsed: PortalVisitStats = cached ? JSON.parse(cached) : {
        totalVisits: 0,
        daily: {},
        firstTrackedAt: new Date().toISOString(),
        lastVisitAt: new Date().toISOString()
      };
      parsed.totalVisits = (parsed.totalVisits || 0) + 1;
      parsed.daily[todayKey] = (parsed.daily[todayKey] || 0) + 1;
      parsed.lastVisitAt = new Date().toISOString();
      localStorage.setItem(STORAGE_PREFIX_PORTAL, JSON.stringify(parsed));
    } catch (_) {}
  }
};

/**
 * Registra evento específico de uma empresa (visita ao perfil, clique de WhatsApp ou outro contato)
 */
export const recordCompanyEvent = async (
  rawCompanyId: string | number,
  companyName: string,
  eventType: AnalyticsEventType
): Promise<void> => {
  if (!rawCompanyId) return;
  const companyId = String(rawCompanyId).trim();
  if (!companyId) return;

  const todayKey = getTodayDateKey();
  const debounceKey = `${DEBOUNCE_PREFIX}${companyId}_${eventType}`;
  const lastTime = sessionStorage.getItem(debounceKey);
  const now = Date.now();

  // Debounce por tipo de evento para evitar cliques duplos rápidos
  // profile_view: 2 minutos | whatsapp_click: 30 segundos | other_contact_click: 30 segundos
  const debounceLimit = eventType === 'profile_view' ? 2 * 60 * 1000 : 30 * 1000;
  if (lastTime && now - parseInt(lastTime, 10) < debounceLimit) {
    return;
  }
  sessionStorage.setItem(debounceKey, String(now));

  const fieldTotalMap: Record<AnalyticsEventType, string> = {
    profile_view: 'totalProfileViews',
    whatsapp_click: 'totalWhatsAppClicks',
    other_contact_click: 'totalOtherClicks'
  };

  const fieldDailyMap: Record<AnalyticsEventType, string> = {
    profile_view: `daily.${todayKey}.profileViews`,
    whatsapp_click: `daily.${todayKey}.whatsappClicks`,
    other_contact_click: `daily.${todayKey}.otherClicks`
  };

  try {
    const docRef = doc(db, 'company_analytics', companyId);
    await setDoc(docRef, {
      companyId,
      companyName: companyName || companyId,
      [fieldTotalMap[eventType]]: increment(1),
      [fieldDailyMap[eventType]]: increment(1),
      lastEventAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    // Fallback local se estiver offline
    try {
      const cacheKey = `${STORAGE_PREFIX_COMPANY}${companyId}`;
      const cached = localStorage.getItem(cacheKey);
      const data: CompanyAnalyticsData = cached ? JSON.parse(cached) : {
        companyId,
        companyName,
        totalProfileViews: 0,
        totalWhatsAppClicks: 0,
        totalOtherClicks: 0,
        firstTrackedAt: new Date().toISOString(),
        lastEventAt: new Date().toISOString(),
        daily: {}
      };

      if (eventType === 'profile_view') data.totalProfileViews++;
      if (eventType === 'whatsapp_click') data.totalWhatsAppClicks++;
      if (eventType === 'other_contact_click') data.totalOtherClicks++;

      if (!data.daily[todayKey]) {
        data.daily[todayKey] = { profileViews: 0, whatsappClicks: 0, otherClicks: 0 };
      }
      if (eventType === 'profile_view') data.daily[todayKey].profileViews++;
      if (eventType === 'whatsapp_click') data.daily[todayKey].whatsappClicks++;
      if (eventType === 'other_contact_click') data.daily[todayKey].otherClicks++;

      data.lastEventAt = new Date().toISOString();
      localStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (_) {}
  }
};

/**
 * Calcula os totais de uma empresa para um período específico
 */
export const calculateCompanyStatsForPeriod = (
  stats: CompanyAnalyticsData | undefined,
  period: 'today' | '7days' | '30days' | 'all'
): { profileViews: number; whatsappClicks: number; otherClicks: number } => {
  if (!stats) return { profileViews: 0, whatsappClicks: 0, otherClicks: 0 };

  if (period === 'all') {
    return {
      profileViews: stats.totalProfileViews || 0,
      whatsappClicks: stats.totalWhatsAppClicks || 0,
      otherClicks: stats.totalOtherClicks || 0
    };
  }

  const validKeys = new Set(getDateKeysForPeriod(period));
  let profileViews = 0;
  let whatsappClicks = 0;
  let otherClicks = 0;

  if (stats.daily) {
    Object.entries(stats.daily).forEach(([dateKey, dayStat]) => {
      if (validKeys.has(dateKey) && dayStat) {
        profileViews += Number(dayStat.profileViews || 0);
        whatsappClicks += Number(dayStat.whatsappClicks || 0);
        otherClicks += Number(dayStat.otherClicks || 0);
      }
    });
  }

  return { profileViews, whatsappClicks, otherClicks };
};
