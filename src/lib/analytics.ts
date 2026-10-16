import { db } from './firebase';
import { 
  doc, 
  setDoc, 
  increment, 
  getDoc, 
  getDocs, 
  collection, 
  query, 
  where 
} from 'firebase/firestore';

export interface TrafficSourceInfo {
  sourceType: 'direct' | 'google' | 'facebook' | 'instagram' | 'whatsapp' | 'referral' | 'unknown';
  referrer: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
}

export interface PortalDailyStats {
  date: string; // YYYY-MM-DD
  views: number;
  sessions: number;
  uniqueVisitorsEstimate: number;
  sources: {
    direct: number;
    google: number;
    facebook: number;
    instagram: number;
    whatsapp: number;
    referral: number;
    unknown: number;
  };
  topPages?: Record<string, number>;
  entryPages?: Record<string, number>;
  lastUpdated?: string;
}

export interface AdvertiserDailyStats {
  docId: string; // YYYY-MM-DD_companyId
  date: string; // YYYY-MM-DD
  companyId: string;
  companyName: string;
  impressions: number;
  cardClicks: number;
  contactClicks: number;
  whatsappClicks: number;
  websiteClicks: number;
  catalogClicks: number;
  phoneClicks: number;
  instagramClicks: number;
  facebookClicks: number;
  lastUpdated?: string;
}

export interface AdvertiserAggregatedMetrics {
  companyId: string;
  companyName: string;
  impressions: number;
  cardClicks: number;
  contactClicks: number;
  whatsappClicks: number;
  websiteClicks: number;
  catalogClicks: number;
  instagramClicks: number;
  ctr: number; // percentage
}

// Format local date YYYY-MM-DD
export function getTodayKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Generate or retrieve pseudonymous visitor UUID (stored in localStorage, no personal data, LGPD-compliant)
export function getPseudonymousVisitorId(): string {
  const KEY = 'md_anonymous_visitor_id';
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = 'v_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return 'v_temp_' + Math.random().toString(36).substring(2, 10);
  }
}

// Generate or retrieve session ID (stored in sessionStorage, reset when tab is closed)
export function getSessionId(): { sessionId: string; isNewSession: boolean } {
  const KEY = 'md_analytics_session_id';
  try {
    let sessionId = sessionStorage.getItem(KEY);
    if (!sessionId) {
      sessionId = 's_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now();
      sessionStorage.setItem(KEY, sessionId);
      return { sessionId, isNewSession: true };
    }
    return { sessionId, isNewSession: false };
  } catch {
    return { sessionId: 's_volatile_' + Date.now(), isNewSession: true };
  }
}

// Identify traffic source accurately without false Facebook claims
export function detectTrafficSource(): TrafficSourceInfo {
  let referrer = '';
  try {
    referrer = document.referrer || '';
  } catch {}

  const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const utmSource = urlParams.get('utm_source') || undefined;
  const utmMedium = urlParams.get('utm_medium') || undefined;
  const utmCampaign = urlParams.get('utm_campaign') || undefined;
  const utmTerm = urlParams.get('utm_term') || undefined;
  const utmContent = urlParams.get('utm_content') || undefined;

  const refLower = referrer.toLowerCase();
  const utmSourceLower = (utmSource || '').toLowerCase();

  let sourceType: TrafficSourceInfo['sourceType'] = 'unknown';

  if (utmSourceLower.includes('facebook') || utmSourceLower.includes('fb') || refLower.includes('facebook.com') || refLower.includes('fb.me')) {
    sourceType = 'facebook';
  } else if (utmSourceLower.includes('instagram') || utmSourceLower.includes('ig') || refLower.includes('instagram.com')) {
    sourceType = 'instagram';
  } else if (utmSourceLower.includes('whatsapp') || utmSourceLower.includes('wa') || refLower.includes('whatsapp.com') || refLower.includes('wa.me')) {
    sourceType = 'whatsapp';
  } else if (utmSourceLower.includes('google') || refLower.includes('google.com') || refLower.includes('google.com.br')) {
    sourceType = 'google';
  } else if (!referrer && !utmSource) {
    sourceType = 'direct';
  } else if (referrer) {
    try {
      const refUrl = new URL(referrer);
      if (refUrl.hostname === window.location.hostname) {
        sourceType = 'direct';
      } else {
        sourceType = 'referral';
      }
    } catch {
      sourceType = 'referral';
    }
  }

  return {
    sourceType,
    referrer: referrer ? referrer.substring(0, 150) : '',
    utmSource,
    utmMedium,
    utmCampaign,
    utmTerm,
    utmContent
  };
}

// In-memory debounce cache to avoid duplicate counts in React StrictMode and rapid re-renders
const trackedPagesCache = new Map<string, number>();
const trackedImpressionsInSession = new Set<string>();
const recentClicksCooldown = new Map<string, number>();

/**
 * Tracks a pageview and session start in Firestore and local aggregation
 */
export async function trackPortalPageView(pagePath?: string): Promise<void> {
  if (typeof window === 'undefined') return;

  const currentPath = pagePath || window.location.hash || window.location.pathname || '/';
  const cleanPath = currentPath.split('?')[0].replace(/[#]/g, '') || 'inicio';

  // Deduplication: ignore same path tracked within 3 seconds (handles React StrictMode)
  const now = Date.now();
  const lastTrackedTime = trackedPagesCache.get(cleanPath) || 0;
  if (now - lastTrackedTime < 3000) {
    return;
  }
  trackedPagesCache.set(cleanPath, now);

  const { isNewSession } = getSessionId();
  const today = getTodayKey();
  const traffic = detectTrafficSource();

  // 1. Check if unique visitor for today
  const visitorKey = `md_visited_day_${today}`;
  let isNewUniqueToday = false;
  try {
    if (!localStorage.getItem(visitorKey)) {
      localStorage.setItem(visitorKey, '1');
      isNewUniqueToday = true;
    }
  } catch {}

  // 2. Local fallback storage for instant offline analytics
  try {
    const localTodayKey = `portal_stats_cache_${today}`;
    const raw = localStorage.getItem(localTodayKey);
    const parsed: PortalDailyStats = raw ? JSON.parse(raw) : {
      date: today,
      views: 0,
      sessions: 0,
      uniqueVisitorsEstimate: 0,
      sources: { direct: 0, google: 0, facebook: 0, instagram: 0, whatsapp: 0, referral: 0, unknown: 0 },
      topPages: {},
      entryPages: {}
    };

    parsed.views = (parsed.views || 0) + 1;
    if (isNewSession) parsed.sessions = (parsed.sessions || 0) + 1;
    if (isNewUniqueToday) parsed.uniqueVisitorsEstimate = (parsed.uniqueVisitorsEstimate || 0) + 1;
    parsed.sources[traffic.sourceType] = (parsed.sources[traffic.sourceType] || 0) + 1;

    if (!parsed.topPages) parsed.topPages = {};
    parsed.topPages[cleanPath] = (parsed.topPages[cleanPath] || 0) + 1;

    localStorage.setItem(localTodayKey, JSON.stringify(parsed));
  } catch {}

  // 3. Increment daily stats in Firestore
  try {
    if (!db) return;
    const dailyRef = doc(db, 'portal_stats', today);

    // Sanitize path for Firestore map key (no dots, slashes)
    const sanitizedPathKey = cleanPath.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 40) || 'home';

    const updates: Record<string, any> = {
      date: today,
      views: increment(1),
      [`sources.${traffic.sourceType}`]: increment(1),
      [`topPages.${sanitizedPathKey}`]: increment(1),
      lastUpdated: new Date().toISOString()
    };

    if (isNewSession) {
      updates.sessions = increment(1);
    }
    if (isNewUniqueToday) {
      updates.uniqueVisitorsEstimate = increment(1);
    }

    await setDoc(dailyRef, updates, { merge: true });
  } catch (err) {
    // Fails silently, does not interrupt user browsing
  }
}

/**
 * Tracks an advertiser card impression when visible for >= 750ms
 * Deduplicated per session to avoid counting redundant impressions
 */
export async function trackAdvertiserImpression(
  companyId: string | number, 
  companyName: string
): Promise<void> {
  if (!companyId) return;

  const companyKey = String(companyId).toLowerCase().replace(/\s+/g, '-');
  const today = getTodayKey();
  const sessionDedupeKey = `${companyKey}_${today}_impression`;

  // Avoid duplicate impressions in same user session
  if (trackedImpressionsInSession.has(sessionDedupeKey)) {
    return;
  }
  trackedImpressionsInSession.add(sessionDedupeKey);

  // Local storage cache
  try {
    const localKey = `adv_imp_${today}_${companyKey}`;
    const curr = parseInt(localStorage.getItem(localKey) || '0', 10);
    localStorage.setItem(localKey, String(curr + 1));
  } catch {}

  // Firestore update
  try {
    if (!db) return;
    const docId = `${today}_${companyKey}`;
    const advDailyRef = doc(db, 'advertiser_analytics', docId);

    await setDoc(advDailyRef, {
      docId,
      date: today,
      companyId: String(companyId),
      companyName: companyName || '',
      impressions: increment(1),
      lastUpdated: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    // Fail silently
  }
}

export type AdvertiserClickType = 
  | 'card' 
  | 'banner_click'
  | 'whatsapp' 
  | 'catalog' 
  | 'website' 
  | 'instagram' 
  | 'facebook' 
  | 'phone';

/**
 * Tracks an advertiser click (card, whatsapp, catalog, website, instagram, etc.)
 * Includes cooldown debounce to prevent rapid accidental double-clicks.
 */
export async function trackAdvertiserClick(
  companyId: string | number,
  companyName: string,
  clickType: AdvertiserClickType = 'card'
): Promise<void> {
  if (!companyId) return;

  const companyKey = String(companyId).toLowerCase().replace(/\s+/g, '-');
  const now = Date.now();
  const cooldownKey = `${companyKey}_${clickType}`;
  const lastClick = recentClicksCooldown.get(cooldownKey) || 0;

  // 1.5 seconds cooldown per action
  if (now - lastClick < 1500) {
    return;
  }
  recentClicksCooldown.set(cooldownKey, now);

  const today = getTodayKey();
  const isContact = clickType !== 'card';

  // Local storage update
  try {
    const localKey = `adv_click_${today}_${companyKey}_${clickType}`;
    const curr = parseInt(localStorage.getItem(localKey) || '0', 10);
    localStorage.setItem(localKey, String(curr + 1));
  } catch {}

  // Firestore update
  try {
    if (!db) return;
    const docId = `${today}_${companyKey}`;
    const advDailyRef = doc(db, 'advertiser_analytics', docId);

    const updates: Record<string, any> = {
      docId,
      date: today,
      companyId: String(companyId),
      companyName: companyName || '',
      lastUpdated: new Date().toISOString()
    };

    if (clickType === 'card' || clickType === 'banner_click') {
      updates.cardClicks = increment(1);
      if (clickType === 'banner_click') {
        updates.bannerClicks = increment(1);
      }
    } else {
      updates.contactClicks = increment(1);
      if (clickType === 'whatsapp') updates.whatsappClicks = increment(1);
      if (clickType === 'website') updates.websiteClicks = increment(1);
      if (clickType === 'catalog') updates.catalogClicks = increment(1);
      if (clickType === 'instagram') updates.instagramClicks = increment(1);
      if (clickType === 'facebook') updates.facebookClicks = increment(1);
      if (clickType === 'phone') updates.phoneClicks = increment(1);
    }

    await setDoc(advDailyRef, updates, { merge: true });

    // Also update all-time summary for quick query
    const summaryRef = doc(db, 'company_analytics', companyKey);
    await setDoc(summaryRef, {
      companyId: String(companyId),
      companyName: companyName || '',
      [clickType === 'card' ? 'cardClicks' : 'contactClicks']: increment(1),
      totalClicks: increment(1),
      lastClickAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    // Fail silently
  }
}

/**
 * Calculates CTR percentage (cliques no card / impressões válidas * 100)
 */
export function calculateCTR(cardClicks: number, impressions: number): number {
  if (!impressions || impressions <= 0) return 0;
  const ctr = (cardClicks / impressions) * 100;
  return Math.min(100, Math.round(ctr * 10) / 10); // Rounded to 1 decimal place
}

/**
 * Generates an array of date strings (YYYY-MM-DD) for a given range
 */
export function getDateRangeKeys(days: number): string[] {
  const result: string[] = [];
  const now = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    result.push(`${year}-${month}-${day}`);
  }
  return result;
}

/**
 * Fetches portal stats for a list of date keys from Firestore
 */
export async function fetchPortalStatsForDates(dateKeys: string[]): Promise<PortalDailyStats[]> {
  const results: PortalDailyStats[] = [];
  if (!db || dateKeys.length === 0) return results;

  try {
    for (const dateKey of dateKeys) {
      try {
        const snap = await getDoc(doc(db, 'portal_stats', dateKey));
        if (snap.exists()) {
          const data = snap.data();
          results.push({
            date: dateKey,
            views: Number(data.views || 0),
            sessions: Number(data.sessions || 0),
            uniqueVisitorsEstimate: Number(data.uniqueVisitorsEstimate || 0),
            sources: {
              direct: Number(data.sources?.direct || 0),
              google: Number(data.sources?.google || 0),
              facebook: Number(data.sources?.facebook || 0),
              instagram: Number(data.sources?.instagram || 0),
              whatsapp: Number(data.sources?.whatsapp || 0),
              referral: Number(data.sources?.referral || 0),
              unknown: Number(data.sources?.unknown || 0),
            },
            topPages: data.topPages || {}
          });
        }
      } catch (e) {
        // Continue on individual day error
      }
    }
  } catch (err) {
    console.warn('[analytics] Error fetching portal stats:', err);
  }

  return results;
}

/**
 * Fetches advertiser analytics for a list of date keys from Firestore
 */
export async function fetchAdvertiserStatsForDates(dateKeys: string[]): Promise<AdvertiserDailyStats[]> {
  const results: AdvertiserDailyStats[] = [];
  if (!db || dateKeys.length === 0) return results;

  try {
    // Firestore supports 'in' query with up to 30 values
    const chunks: string[][] = [];
    for (let i = 0; i < dateKeys.length; i += 25) {
      chunks.push(dateKeys.slice(i, i + 25));
    }

    for (const chunk of chunks) {
      const q = query(collection(db, 'advertiser_analytics'), where('date', 'in', chunk));
      const snaps = await getDocs(q);
      snaps.forEach(docSnap => {
        const d = docSnap.data();
        results.push({
          docId: docSnap.id,
          date: d.date || '',
          companyId: String(d.companyId || ''),
          companyName: d.companyName || 'Empresa',
          impressions: Number(d.impressions || 0),
          cardClicks: Number(d.cardClicks || 0),
          contactClicks: Number(d.contactClicks || 0),
          whatsappClicks: Number(d.whatsappClicks || 0),
          websiteClicks: Number(d.websiteClicks || 0),
          catalogClicks: Number(d.catalogClicks || 0),
          phoneClicks: Number(d.phoneClicks || 0),
          instagramClicks: Number(d.instagramClicks || 0),
          facebookClicks: Number(d.facebookClicks || 0)
        });
      });
    }
  } catch (err) {
    console.warn('[analytics] Error fetching advertiser stats:', err);
  }

  return results;
}

/**
 * Export analytics table to CSV with UTF-8 BOM
 */
export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]): void {
  const escapeCell = (cell: string | number) => {
    const str = String(cell ?? '').replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent = '\uFEFF' + [
    headers.map(escapeCell).join(';'),
    ...rows.map(row => row.map(escapeCell).join(';'))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
