import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

export interface DispatchLogEntry {
  id: string;
  timestamp: string;
  type: 'manual' | 'auto_5min' | 'initial_adjust';
  channel: string;
  count: number;
  totalAfter: number;
  note: string;
}

export interface CompanyDispatchTracking {
  companyId: string;
  companyName: string;
  totalDispatches: number;
  manualInitialCount: number;
  daysElapsed: number; // Sequência dos dias que já foram (ex: 1, 2, 5, etc.)
  totalCampaignDays: number; // Total de dias da campanha (padrão: 30)
  lastDispatchedAt?: string;
  isAuto24hActive: boolean;
  auto24hStartedAt?: number; // epoch ms
  auto24hExpiresAt?: number; // epoch ms (24h after start)
  autoIntervalMinutes: number; // default 5 minutes
  groupsWhatsAppReached: number;
  groupsFacebookReached: number;
  manualWhatsAppGroups?: number;
  manualFacebookGroups?: number;
  estimatedReach: number;
  recentLogs: DispatchLogEntry[];
  updatedAt?: string;
}

const STORAGE_PREFIX = 'tracking_dispatch_';

export function getDefaultTracking(companyId: string, companyName: string = 'Empresa'): CompanyDispatchTracking {
  return {
    companyId: String(companyId),
    companyName,
    totalDispatches: 0,
    manualInitialCount: 0,
    daysElapsed: 1,
    totalCampaignDays: 30,
    isAuto24hActive: false,
    autoIntervalMinutes: 5,
    groupsWhatsAppReached: 0,
    groupsFacebookReached: 0,
    manualWhatsAppGroups: 0,
    manualFacebookGroups: 0,
    estimatedReach: 0,
    recentLogs: [],
    updatedAt: new Date().toISOString()
  };
}

/**
 * Computes live auto-increment if 24h mode is active.
 * Calculates how many 5-min intervals elapsed since auto24hStartedAt.
 */
export function computeLiveTracking(tracking: CompanyDispatchTracking): CompanyDispatchTracking {
  if (!tracking.isAuto24hActive || !tracking.auto24hStartedAt) {
    return tracking;
  }

  const now = Date.now();
  const startTime = tracking.auto24hStartedAt;
  const expireTime = tracking.auto24hExpiresAt || (startTime + 24 * 60 * 60 * 1000);

  // If 24h period has already ended
  const isExpired = now >= expireTime;
  const effectiveEnd = isExpired ? expireTime : now;
  const elapsedMs = Math.max(0, effectiveEnd - startTime);
  const intervalMs = (tracking.autoIntervalMinutes || 5) * 60 * 1000;
  const autoCycles = Math.floor(elapsedMs / intervalMs);

  const baseCount = tracking.manualInitialCount || 0;
  // Count manual logs not related to auto cycles
  const manualAdds = (tracking.recentLogs || [])
    .filter(l => l.type === 'manual')
    .reduce((sum, l) => sum + (l.count || 1), 0);

  const calculatedTotal = baseCount + manualAdds + autoCycles;
  const total = Math.max(tracking.totalDispatches, calculatedTotal);

  const waGroups = (tracking.manualWhatsAppGroups !== undefined && tracking.manualWhatsAppGroups >= 0)
    ? tracking.manualWhatsAppGroups
    : (tracking.groupsWhatsAppReached > 0 ? tracking.groupsWhatsAppReached : Math.max(1, Math.round(total * 0.7) + 5));
  const fbGroups = (tracking.manualFacebookGroups !== undefined && tracking.manualFacebookGroups >= 0)
    ? tracking.manualFacebookGroups
    : (tracking.groupsFacebookReached > 0 ? tracking.groupsFacebookReached : Math.max(1, Math.round(total * 0.4) + 3));
  const reach = Math.max(total * 350, 1200);

  return {
    ...tracking,
    totalDispatches: total,
    isAuto24hActive: !isExpired,
    daysElapsed: tracking.daysElapsed || 1,
    totalCampaignDays: tracking.totalCampaignDays || 30,
    manualWhatsAppGroups: tracking.manualWhatsAppGroups,
    manualFacebookGroups: tracking.manualFacebookGroups,
    groupsWhatsAppReached: waGroups,
    groupsFacebookReached: fbGroups,
    estimatedReach: reach
  };
}

/**
 * Load tracking from Firestore or fallback to localStorage
 */
export async function getCompanyDispatchTracking(companyId: string, companyName: string = 'Empresa'): Promise<CompanyDispatchTracking> {
  const cleanId = String(companyId).trim();
  try {
    const docRef = doc(db, 'dispatch_trackings', cleanId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as CompanyDispatchTracking;
      const live = computeLiveTracking(data);
      localStorage.setItem(`${STORAGE_PREFIX}${cleanId}`, JSON.stringify(live));
      return live;
    }
  } catch (err) {
    console.warn(`[getCompanyDispatchTracking] Firestore load error for ${cleanId}:`, err);
  }

  // Fallback to localStorage
  try {
    const cached = localStorage.getItem(`${STORAGE_PREFIX}${cleanId}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      return computeLiveTracking(parsed);
    }
  } catch (e) {
    console.error(e);
  }

  return getDefaultTracking(cleanId, companyName);
}

/**
 * Save tracking data to Firestore & localStorage
 */
export async function saveCompanyDispatchTracking(tracking: CompanyDispatchTracking): Promise<void> {
  const cleanId = String(tracking.companyId).trim();
  const toSave: CompanyDispatchTracking = {
    ...tracking,
    updatedAt: new Date().toISOString()
  };

  try {
    localStorage.setItem(`${STORAGE_PREFIX}${cleanId}`, JSON.stringify(toSave));
  } catch (e) {
    console.error(e);
  }

  try {
    const docRef = doc(db, 'dispatch_trackings', cleanId);
    await setDoc(docRef, toSave, { merge: true });
  } catch (err) {
    console.error(`[saveCompanyDispatchTracking] Failed to save to Firestore for ${cleanId}:`, err);
  }
}

/**
 * Register manual dispatches (e.g. +1, +5, etc.)
 */
export async function registerManualDispatch(
  current: CompanyDispatchTracking,
  countToAdd: number = 1,
  channel: string = 'Grupos WhatsApp & Facebook'
): Promise<CompanyDispatchTracking> {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  
  const newTotal = (current.totalDispatches || 0) + countToAdd;
  const newLog: DispatchLogEntry = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    timestamp: `${dateStr} às ${timeStr}`,
    type: 'manual',
    channel,
    count: countToAdd,
    totalAfter: newTotal,
    note: `Disparo realizado com sucesso em ${channel}.`
  };

  const updatedLogs = [newLog, ...(current.recentLogs || [])].slice(0, 50);

  const updated: CompanyDispatchTracking = {
    ...current,
    totalDispatches: newTotal,
    lastDispatchedAt: now.toISOString(),
    groupsWhatsAppReached: current.manualWhatsAppGroups !== undefined && current.manualWhatsAppGroups > 0 
      ? current.manualWhatsAppGroups 
      : (current.groupsWhatsAppReached > 0 ? current.groupsWhatsAppReached : Math.max(1, Math.round(newTotal * 0.7) + 5)),
    groupsFacebookReached: current.manualFacebookGroups !== undefined && current.manualFacebookGroups > 0 
      ? current.manualFacebookGroups 
      : (current.groupsFacebookReached > 0 ? current.groupsFacebookReached : Math.max(1, Math.round(newTotal * 0.4) + 3)),
    estimatedReach: Math.max(newTotal * 350, 1200),
    recentLogs: updatedLogs
  };

  await saveCompanyDispatchTracking(updated);
  return updated;
}

/**
 * Set manual initial count when campaign already has dispatches
 */
export async function setManualInitialCount(
  current: CompanyDispatchTracking,
  initialCount: number
): Promise<CompanyDispatchTracking> {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

  const validCount = Math.max(0, Math.floor(initialCount));
  const newLog: DispatchLogEntry = {
    id: `log_${Date.now()}_init`,
    timestamp: `${dateStr} às ${timeStr}`,
    type: 'initial_adjust',
    channel: 'Configuração Inicial',
    count: validCount,
    totalAfter: validCount,
    note: `Contador inicial de disparos definido para ${validCount} disparos.`
  };

  const updated: CompanyDispatchTracking = {
    ...current,
    manualInitialCount: validCount,
    totalDispatches: validCount,
    lastDispatchedAt: now.toISOString(),
    groupsWhatsAppReached: current.manualWhatsAppGroups !== undefined && current.manualWhatsAppGroups > 0 
      ? current.manualWhatsAppGroups 
      : (current.groupsWhatsAppReached > 0 ? current.groupsWhatsAppReached : Math.max(1, Math.round(validCount * 0.7) + 5)),
    groupsFacebookReached: current.manualFacebookGroups !== undefined && current.manualFacebookGroups > 0 
      ? current.manualFacebookGroups 
      : (current.groupsFacebookReached > 0 ? current.groupsFacebookReached : Math.max(1, Math.round(validCount * 0.4) + 3)),
    estimatedReach: Math.max(validCount * 350, 1200),
    recentLogs: [newLog, ...(current.recentLogs || [])].slice(0, 50)
  };

  await saveCompanyDispatchTracking(updated);
  return updated;
}

/**
 * Set manual WhatsApp and Facebook groups count
 */
export async function setManualGroupsCount(
  current: CompanyDispatchTracking,
  waGroups: number,
  fbGroups: number
): Promise<CompanyDispatchTracking> {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

  const validWa = Math.max(0, Math.floor(waGroups));
  const validFb = Math.max(0, Math.floor(fbGroups));

  const newLog: DispatchLogEntry = {
    id: `log_${Date.now()}_groups`,
    timestamp: `${dateStr} às ${timeStr}`,
    type: 'initial_adjust',
    channel: 'Definição de Grupos',
    count: 0,
    totalAfter: current.totalDispatches,
    note: `Quantidade de grupos definida: ${validWa} grupos de WhatsApp e ${validFb} grupos de Facebook.`
  };

  const updated: CompanyDispatchTracking = {
    ...current,
    manualWhatsAppGroups: validWa,
    manualFacebookGroups: validFb,
    groupsWhatsAppReached: validWa,
    groupsFacebookReached: validFb,
    recentLogs: [newLog, ...(current.recentLogs || [])].slice(0, 50)
  };

  await saveCompanyDispatchTracking(updated);
  return updated;
}

/**
 * Reset all counters for a new month
 */
export async function resetForNewMonth(
  current: CompanyDispatchTracking
): Promise<CompanyDispatchTracking> {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

  const newLog: DispatchLogEntry = {
    id: `log_${Date.now()}_reset_month`,
    timestamp: `${dateStr} às ${timeStr}`,
    type: 'initial_adjust',
    channel: 'Início de Novo Mês',
    count: 0,
    totalAfter: 0,
    note: 'Contador zerado pelo administrador para início de um novo mês de campanha.'
  };

  const updated: CompanyDispatchTracking = {
    ...current,
    totalDispatches: 0,
    manualInitialCount: 0,
    daysElapsed: 1,
    isAuto24hActive: false,
    lastDispatchedAt: now.toISOString(),
    recentLogs: [newLog, ...(current.recentLogs || [])].slice(0, 50)
  };

  await saveCompanyDispatchTracking(updated);
  return updated;
}

/**
 * Set manual days sequence (e.g. Dia 4 de 30 dias)
 */
export async function setManualDaysElapsed(
  current: CompanyDispatchTracking,
  days: number,
  totalDays: number = 30
): Promise<CompanyDispatchTracking> {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

  const validDays = Math.max(1, Math.floor(days));
  const validTotal = Math.max(validDays, Math.floor(totalDays || 30));

  const newLog: DispatchLogEntry = {
    id: `log_${Date.now()}_days`,
    timestamp: `${dateStr} às ${timeStr}`,
    type: 'initial_adjust',
    channel: 'Sequência de Dias',
    count: 0,
    totalAfter: current.totalDispatches,
    note: `Sequência de dias atualizada manualmente para o Dia ${validDays} de ${validTotal} dias.`
  };

  const updated: CompanyDispatchTracking = {
    ...current,
    daysElapsed: validDays,
    totalCampaignDays: validTotal,
    recentLogs: [newLog, ...(current.recentLogs || [])].slice(0, 50)
  };

  await saveCompanyDispatchTracking(updated);
  return updated;
}

/**
 * Toggle 24-hour Auto-Dispatch mode (5-minute interval)
 */
export async function toggleAuto24hDispatch(
  current: CompanyDispatchTracking,
  enable: boolean
): Promise<CompanyDispatchTracking> {
  const now = Date.now();
  const dateObj = new Date();
  const timeStr = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const dateStr = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

  let updated: CompanyDispatchTracking;

  if (enable) {
    const startedAt = now;
    const expiresAt = now + (24 * 60 * 60 * 1000); // 24 hours from now
    const log: DispatchLogEntry = {
      id: `log_${now}_auto_start`,
      timestamp: `${dateStr} às ${timeStr}`,
      type: 'auto_5min',
      channel: 'Disparador Automático 24h',
      count: 0,
      totalAfter: current.totalDispatches,
      note: 'Ciclo de 24 horas ativado! Disparos automáticos programados a cada 5 minutos.'
    };

    updated = {
      ...current,
      isAuto24hActive: true,
      auto24hStartedAt: startedAt,
      auto24hExpiresAt: expiresAt,
      autoIntervalMinutes: 5,
      recentLogs: [log, ...(current.recentLogs || [])].slice(0, 50)
    };
  } else {
    const log: DispatchLogEntry = {
      id: `log_${now}_auto_stop`,
      timestamp: `${dateStr} às ${timeStr}`,
      type: 'auto_5min',
      channel: 'Disparador Automático 24h',
      count: 0,
      totalAfter: current.totalDispatches,
      note: 'Disparos automáticos de 24h pausados pelo administrador.'
    };

    updated = {
      ...current,
      isAuto24hActive: false,
      recentLogs: [log, ...(current.recentLogs || [])].slice(0, 50)
    };
  }

  await saveCompanyDispatchTracking(updated);
  return updated;
}

/**
 * Subscribe to real-time changes in tracking
 */
export function subscribeToDispatchTracking(
  companyId: string,
  onUpdate: (data: CompanyDispatchTracking) => void
): () => void {
  const cleanId = String(companyId).trim();
  try {
    const docRef = doc(db, 'dispatch_trackings', cleanId);
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const raw = snapshot.data() as CompanyDispatchTracking;
          const live = computeLiveTracking(raw);
          onUpdate(live);
        }
      },
      (error) => {
        console.warn(`[subscribeToDispatchTracking] Listener error for ${cleanId}:`, error);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.error(err);
    return () => {};
  }
}

/**
 * Generate client private tracking link
 */
export function generateClientTrackingLink(companyId: string, companyName?: string): string {
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  const cleanId = encodeURIComponent(String(companyId).trim());
  return `${origin}${pathname}?acompanhar=${cleanId}`;
}
