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
  daysAnchorDate?: string; // Data ISO da última definição (ex: '2026-10-06')
  daysAnchorElapsed?: number; // O dia base na âncora (ex: 7)
  autoDaysIncrement?: boolean; // Padrão: true (avanço automático diário de calendário)
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

export interface GlobalDispatchGroupsConfig {
  whatsAppGroups: number;
  facebookGroups: number;
  updatedAt?: string;
}

export const GLOBAL_GROUPS_CONFIG_ID = '_global_groups_config';
export const GLOBAL_GROUPS_STORAGE_KEY = 'tracking_dispatch_global_groups';

// Padrão universal configurado pelo Master: 900 WhatsApp e 6.568 Facebook (7.468 total)
const DEFAULT_GLOBAL_WA = 900;
const DEFAULT_GLOBAL_FB = 6568;

export function getCachedGlobalGroups(): GlobalDispatchGroupsConfig {
  try {
    const cached = localStorage.getItem(GLOBAL_GROUPS_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      const wa = parseNumberWithSeparators(parsed.whatsAppGroups);
      let fb = parseNumberWithSeparators(parsed.facebookGroups);
      // Se tiver o valor 6 que veio do bug antigo de formatação "6.568", corrige automaticamente para 6568
      if (fb === 6 || fb <= 0) {
        fb = DEFAULT_GLOBAL_FB;
      }
      return {
        whatsAppGroups: wa > 0 ? wa : DEFAULT_GLOBAL_WA,
        facebookGroups: fb,
        updatedAt: parsed.updatedAt
      };
    }
  } catch (e) {}

  return {
    whatsAppGroups: DEFAULT_GLOBAL_WA,
    facebookGroups: DEFAULT_GLOBAL_FB,
    updatedAt: new Date().toISOString()
  };
}

export async function getGlobalDispatchGroups(): Promise<GlobalDispatchGroupsConfig> {
  const local = getCachedGlobalGroups();
  try {
    const docRef = doc(db, 'dispatch_trackings', GLOBAL_GROUPS_CONFIG_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      const wa = parseNumberWithSeparators(data.whatsAppGroups);
      let fb = parseNumberWithSeparators(data.facebookGroups);
      if (fb === 6 || fb <= 0) {
        fb = DEFAULT_GLOBAL_FB;
      }
      const config: GlobalDispatchGroupsConfig = {
        whatsAppGroups: wa > 0 ? wa : local.whatsAppGroups,
        facebookGroups: fb > 0 ? fb : local.facebookGroups,
        updatedAt: data.updatedAt || local.updatedAt
      };
      localStorage.setItem(GLOBAL_GROUPS_STORAGE_KEY, JSON.stringify(config));
      return config;
    }
  } catch (err) {
    console.warn('[getGlobalDispatchGroups] error loading from Firestore:', err);
  }
  return local;
}

export async function saveGlobalDispatchGroups(
  wa: number | string, 
  fb: number | string
): Promise<GlobalDispatchGroupsConfig> {
  const validWa = parseNumberWithSeparators(wa);
  const validFb = parseNumberWithSeparators(fb);
  const config: GlobalDispatchGroupsConfig = {
    whatsAppGroups: validWa,
    facebookGroups: validFb,
    updatedAt: new Date().toISOString()
  };

  try {
    localStorage.setItem(GLOBAL_GROUPS_STORAGE_KEY, JSON.stringify(config));
    
    // Atualiza o cache local de todas as empresas registradas no navegador
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX) && key !== GLOBAL_GROUPS_STORAGE_KEY) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            parsed.manualWhatsAppGroups = validWa;
            parsed.manualFacebookGroups = validFb;
            parsed.groupsWhatsAppReached = validWa;
            parsed.groupsFacebookReached = validFb;
            localStorage.setItem(key, JSON.stringify(parsed));
          }
        } catch (err) {}
      }
    }
  } catch (e) {}

  try {
    const docRef = doc(db, 'dispatch_trackings', GLOBAL_GROUPS_CONFIG_ID);
    await setDoc(docRef, config, { merge: true });
  } catch (err) {
    console.error('[saveGlobalDispatchGroups] error saving to Firestore:', err);
  }

  // Notifica todas as instâncias e abas abertas em tempo real
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('global-dispatch-groups-updated', { detail: config }));
    }
  } catch (e) {}

  return config;
}

export function subscribeToGlobalDispatchGroups(
  onUpdate: (config: GlobalDispatchGroupsConfig) => void
): () => void {
  let unsubscribeFirestore = () => {};
  try {
    const docRef = doc(db, 'dispatch_trackings', GLOBAL_GROUPS_CONFIG_ID);
    unsubscribeFirestore = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const wa = parseNumberWithSeparators(data.whatsAppGroups);
        const fb = parseNumberWithSeparators(data.facebookGroups);
        const config: GlobalDispatchGroupsConfig = {
          whatsAppGroups: wa > 0 ? wa : DEFAULT_GLOBAL_WA,
          facebookGroups: fb > 0 ? fb : DEFAULT_GLOBAL_FB,
          updatedAt: data.updatedAt
        };
        try {
          localStorage.setItem(GLOBAL_GROUPS_STORAGE_KEY, JSON.stringify(config));
        } catch (e) {}
        onUpdate(config);
      }
    });
  } catch (e) {}

  const handleLocal = (e: any) => {
    if (e.detail) {
      onUpdate(e.detail);
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('global-dispatch-groups-updated', handleLocal);
  }

  return () => {
    unsubscribeFirestore();
    if (typeof window !== 'undefined') {
      window.removeEventListener('global-dispatch-groups-updated', handleLocal);
    }
  };
}

/**
 * Safely parse numbers from user inputs, accepting Brazilian separators (e.g. 6.568 or 6,568)
 */
export function parseNumberWithSeparators(val: string | number | undefined | null): number {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return Math.max(0, Math.floor(val));
  const str = String(val).trim();
  if (!str) return 0;
  const cleaned = str.replace(/[^\d]/g, '');
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 0 : parsed;
}

export function getDefaultTracking(companyId: string, companyName: string = 'Empresa'): CompanyDispatchTracking {
  const global = getCachedGlobalGroups();
  return {
    companyId: String(companyId),
    companyName,
    totalDispatches: 0,
    manualInitialCount: 0,
    daysElapsed: 1,
    totalCampaignDays: 30,
    isAuto24hActive: true,
    auto24hStartedAt: Date.now() - (5 * 60 * 1000 * 0.4),
    autoIntervalMinutes: 5,
    groupsWhatsAppReached: global.whatsAppGroups,
    groupsFacebookReached: global.facebookGroups,
    manualWhatsAppGroups: global.whatsAppGroups,
    manualFacebookGroups: global.facebookGroups,
    estimatedReach: 0,
    recentLogs: [],
    updatedAt: new Date().toISOString()
  };
}

/**
 * Computes the calendar day sequence automatically.
 * When the master sets e.g. Day 7, the system marks the anchor date.
 * Every new calendar day that elapses, it automatically increments +1 day.
 */
export function computeCurrentCalendarDays(tracking: CompanyDispatchTracking): { currentDay: number; totalDays: number } {
  const totalDays = tracking.totalCampaignDays || 30;
  const baseDay = tracking.daysAnchorElapsed || tracking.daysElapsed || 1;
  const anchorDateStr = tracking.daysAnchorDate;

  if (!anchorDateStr) {
    return { currentDay: Math.min(totalDays, Math.max(1, baseDay)), totalDays };
  }

  try {
    const parts = anchorDateStr.split('-').map(Number);
    if (parts.length === 3) {
      const anchorDate = new Date(parts[0], parts[1] - 1, parts[2]);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const diffMs = today.getTime() - anchorDate.getTime();
      const diffDays = Math.max(0, Math.floor(diffMs / (24 * 60 * 60 * 1000)));

      const computedDay = Math.min(totalDays, Math.max(1, baseDay + diffDays));
      return { currentDay: computedDay, totalDays };
    }
  } catch (e) {}

  return { currentDay: Math.min(totalDays, Math.max(1, baseDay)), totalDays };
}

/**
 * Computes live auto-increment if auto mode is active and automatically advances calendar days.
 * Runs continuously until the campaign contract days expire or until the admin pauses manually.
 * Calculates how many 5-min intervals elapsed since auto24hStartedAt.
 */
export function computeLiveTracking(tracking: CompanyDispatchTracking): CompanyDispatchTracking {
  let total = tracking.totalDispatches || 0;

  // Avanço automático dos dias corridos baseado no calendário
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const effectiveAnchorDate = tracking.daysAnchorDate || todayStr;
  const effectiveAnchorDay = tracking.daysAnchorElapsed || tracking.daysElapsed || 1;

  const { currentDay, totalDays } = computeCurrentCalendarDays({
    ...tracking,
    daysAnchorDate: effectiveAnchorDate,
    daysAnchorElapsed: effectiveAnchorDay
  });

  // O contrato encerra quando ultrapassa o total de dias contratados (ex: Dia > 30)
  const isContractExpired = currentDay > totalDays;

  const isAutoActive = tracking.isAuto24hActive !== false;
  const autoStartTime = tracking.auto24hStartedAt || (Date.now() - 145000);

  if (isAutoActive) {
    if (isContractExpired) {
      // Se o contrato expirou por tempo de plano, o modo automático para
    } else {
      // RODA DIRETO SEM PARAR: dia e noite até expirar o contrato ou o admin pausar manualmente
      const nowMs = Date.now();
      const startTime = autoStartTime;
      const elapsedMs = Math.max(0, nowMs - startTime);
      const intervalMs = (tracking.autoIntervalMinutes || 5) * 60 * 1000;
      const autoCycles = Math.floor(elapsedMs / intervalMs);

      const baseCount = tracking.manualInitialCount !== undefined
        ? tracking.manualInitialCount
        : (tracking.totalDispatches || 0);

      const calculatedTotal = baseCount + autoCycles;
      total = Math.max(total, calculatedTotal);

      // Gera os registros realistas nos grupos correspondentes aos ciclos completados
      if (autoCycles > 0) {
        const existingLogs = tracking.recentLogs || [];
        const existingAutoLogIds = new Set(existingLogs.map(l => l.id));
        const newAutoLogs: DispatchLogEntry[] = [];

        const globalG = getCachedGlobalGroups();
        const totalGCount = Math.max(100, (globalG.whatsAppGroups || 900) + (globalG.facebookGroups || 6568));

        // Gera os últimos ciclos (limite dos últimos 25 para não pesar)
        const cyclesToGenerate = Math.min(autoCycles, 25);
        for (let c = autoCycles; c > autoCycles - cyclesToGenerate; c--) {
          const logId = `auto_${tracking.companyId || 'comp'}_cycle_${c}`;
          if (!existingAutoLogIds.has(logId)) {
            const cycleTimestampMs = startTime + (c * intervalMs);
            const cycleDate = new Date(cycleTimestampMs);
            const dateStr = cycleDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            const timeStr = cycleDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

            const totalForCycle = baseCount + c;
            // Grupo sequencial exato do ciclo: se total é 289 -> grupo 289!
            // Ao chegar no total de grupos, reinicia do 1
            const groupIndex = totalForCycle > 0 ? (((totalForCycle - 1) % totalGCount) + 1) : 1;
            const channelType = (groupIndex % 2 === 0) ? 'Facebook' : 'WhatsApp';
            const locationSamples = [
              'Fortaleza (Aldeota)', 'Fortaleza (Messejana)', 'Fortaleza (Centro)',
              'Fortaleza (Parangaba)', 'Fortaleza (Montese)', 'Fortaleza (Papicu)',
              'Juazeiro do Norte', 'Sobral', 'Maracanaú', 'Caucaia', 'Eusébio',
              'OLX Brasil Vendas', 'Classificados Ceará', 'Feirão de Negócios Brasil'
            ];
            const loc = locationSamples[(groupIndex - 1) % locationSamples.length];

            newAutoLogs.push({
              id: logId,
              timestamp: `${dateStr} às ${timeStr}`,
              type: 'auto_5min',
              channel: `Grupo ${channelType} #${groupIndex}`,
              count: 1,
              totalAfter: totalForCycle,
              note: `Disparo transmitido com sucesso no grupo #${groupIndex}: ${loc}.`
            });
          }
        }

        if (newAutoLogs.length > 0) {
          // Mescla novos logs na timeline ordenando por total decrescente
          const combined = [...newAutoLogs, ...existingLogs];
          combined.sort((a, b) => (b.totalAfter || 0) - (a.totalAfter || 0));
          tracking.recentLogs = combined.slice(0, 50);
        }
      }
    }
  }

  const global = getCachedGlobalGroups();
  const waGroups = global.whatsAppGroups > 0 ? global.whatsAppGroups : DEFAULT_GLOBAL_WA;
  const fbGroups = (global.facebookGroups > 0 && global.facebookGroups !== 6) 
    ? global.facebookGroups 
    : DEFAULT_GLOBAL_FB;
  const reach = Math.max(total * 350, 1200);

  return {
    ...tracking,
    totalDispatches: total,
    isAuto24hActive: tracking.isAuto24hActive ? !isContractExpired : false,
    daysElapsed: currentDay,
    totalCampaignDays: totalDays,
    daysAnchorDate: effectiveAnchorDate,
    daysAnchorElapsed: effectiveAnchorDay,
    autoDaysIncrement: true,
    manualWhatsAppGroups: waGroups,
    manualFacebookGroups: fbGroups,
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
  const live = computeLiveTracking(current);
  const now = new Date();
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  
  const newTotal = (live.totalDispatches || 0) + countToAdd;
  const newLog: DispatchLogEntry = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    timestamp: `${dateStr} às ${timeStr}`,
    type: 'manual',
    channel,
    count: countToAdd,
    totalAfter: newTotal,
    note: `Disparo realizado com sucesso em ${channel}.`
  };

  const updatedLogs = [newLog, ...(live.recentLogs || [])].slice(0, 50);

  const updated: CompanyDispatchTracking = {
    ...live,
    totalDispatches: newTotal,
    manualInitialCount: newTotal,
    auto24hStartedAt: live.isAuto24hActive ? Date.now() : live.auto24hStartedAt,
    lastDispatchedAt: now.toISOString(),
    groupsWhatsAppReached: live.manualWhatsAppGroups !== undefined && live.manualWhatsAppGroups > 0 
      ? live.manualWhatsAppGroups 
      : (live.groupsWhatsAppReached > 0 ? live.groupsWhatsAppReached : Math.max(1, Math.round(newTotal * 0.7) + 5)),
    groupsFacebookReached: live.manualFacebookGroups !== undefined && live.manualFacebookGroups > 0 
      ? live.manualFacebookGroups 
      : (live.groupsFacebookReached > 0 ? live.groupsFacebookReached : Math.max(1, Math.round(newTotal * 0.4) + 3)),
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
  initialCount: number | string
): Promise<CompanyDispatchTracking> {
  const live = computeLiveTracking(current);
  const now = new Date();
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

  const validCount = parseNumberWithSeparators(initialCount);
  const newLog: DispatchLogEntry = {
    id: `log_${Date.now()}_init`,
    timestamp: `${dateStr} às ${timeStr}`,
    type: 'initial_adjust',
    channel: 'Configuração Inicial',
    count: validCount,
    totalAfter: validCount,
    note: `Contador de disparos ajustado para ${validCount.toLocaleString('pt-BR')} disparos.`
  };

  const updated: CompanyDispatchTracking = {
    ...live,
    manualInitialCount: validCount,
    totalDispatches: validCount,
    auto24hStartedAt: live.isAuto24hActive ? Date.now() : live.auto24hStartedAt,
    lastDispatchedAt: now.toISOString(),
    groupsWhatsAppReached: live.manualWhatsAppGroups !== undefined && live.manualWhatsAppGroups > 0 
      ? live.manualWhatsAppGroups 
      : (live.groupsWhatsAppReached > 0 ? live.groupsWhatsAppReached : Math.max(1, Math.round(validCount * 0.7) + 5)),
    groupsFacebookReached: live.manualFacebookGroups !== undefined && live.manualFacebookGroups > 0 
      ? live.manualFacebookGroups 
      : (live.groupsFacebookReached > 0 ? live.groupsFacebookReached : Math.max(1, Math.round(validCount * 0.4) + 3)),
    estimatedReach: Math.max(validCount * 350, 1200),
    recentLogs: [newLog, ...(live.recentLogs || [])].slice(0, 50)
  };

  await saveCompanyDispatchTracking(updated);
  return updated;
}

/**
 * Set manual WhatsApp and Facebook groups count
 */
export async function setManualGroupsCount(
  current: CompanyDispatchTracking,
  waGroups: number | string,
  fbGroups: number | string
): Promise<CompanyDispatchTracking> {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

  const validWa = parseNumberWithSeparators(waGroups);
  const validFb = parseNumberWithSeparators(fbGroups);

  const newLog: DispatchLogEntry = {
    id: `log_${Date.now()}_groups`,
    timestamp: `${dateStr} às ${timeStr}`,
    type: 'initial_adjust',
    channel: 'Definição de Grupos',
    count: 0,
    totalAfter: current.totalDispatches,
    note: `Quantidade de grupos definida: ${validWa.toLocaleString('pt-BR')} grupos de WhatsApp e ${validFb.toLocaleString('pt-BR')} grupos de Facebook.`
  };

  const updated: CompanyDispatchTracking = {
    ...current,
    manualWhatsAppGroups: validWa,
    manualFacebookGroups: validFb,
    groupsWhatsAppReached: validWa,
    groupsFacebookReached: validFb,
    recentLogs: [newLog, ...(current.recentLogs || [])].slice(0, 50)
  };

  // Salva no banco global para sincronizar todas as empresas automaticamente
  await saveGlobalDispatchGroups(validWa, validFb);
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
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const newLog: DispatchLogEntry = {
    id: `log_${Date.now()}_reset_month`,
    timestamp: `${dateStr} às ${timeStr}`,
    type: 'initial_adjust',
    channel: 'Início de Novo Mês',
    count: 0,
    totalAfter: 0,
    note: 'Contador zerado pelo administrador para início de um novo mês de campanha (avanço diário automático ativado no Dia 1).'
  };

  const global = getCachedGlobalGroups();
  const updated: CompanyDispatchTracking = {
    ...current,
    totalDispatches: 0,
    manualInitialCount: 0,
    daysElapsed: 1,
    daysAnchorDate: todayStr,
    daysAnchorElapsed: 1,
    autoDaysIncrement: true,
    isAuto24hActive: false,
    manualWhatsAppGroups: global.whatsAppGroups,
    manualFacebookGroups: global.facebookGroups,
    groupsWhatsAppReached: global.whatsAppGroups,
    groupsFacebookReached: global.facebookGroups,
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
  days: number | string,
  totalDays: number | string = 30
): Promise<CompanyDispatchTracking> {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const validDays = Math.max(1, parseNumberWithSeparators(days));
  const validTotal = Math.max(validDays, parseNumberWithSeparators(totalDays) || 30);

  const newLog: DispatchLogEntry = {
    id: `log_${Date.now()}_days`,
    timestamp: `${dateStr} às ${timeStr}`,
    type: 'initial_adjust',
    channel: 'Sequência de Dias',
    count: 0,
    totalAfter: current.totalDispatches,
    note: `Sequência de dias sincronizada para o Dia ${validDays} de ${validTotal} dias (avanço diário automático de calendário ativado).`
  };

  const updated: CompanyDispatchTracking = {
    ...current,
    daysElapsed: validDays,
    totalCampaignDays: validTotal,
    daysAnchorDate: todayStr,
    daysAnchorElapsed: validDays,
    autoDaysIncrement: true,
    recentLogs: [newLog, ...(current.recentLogs || [])].slice(0, 50)
  };

  await saveCompanyDispatchTracking(updated);
  return updated;
}

/**
 * Ativa ou pausa o Modo de Disparo Automático Contínuo (de 5 em 5 minutos)
 * Fica ativo continuamente dia e noite até expirar o término do contrato ou pausa manual
 */
export async function toggleAuto24hDispatch(
  current: CompanyDispatchTracking,
  enable: boolean
): Promise<CompanyDispatchTracking> {
  const now = Date.now();
  const dateObj = new Date();
  const timeStr = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const dateStr = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

  // Calcula o total mais recente ao vivo para consolidar a contagem exata
  const live = computeLiveTracking(current);
  const currentTotal = live.totalDispatches || 0;

  let updated: CompanyDispatchTracking;

  if (enable) {
    const startedAt = now;
    const log: DispatchLogEntry = {
      id: `log_${now}_auto_start`,
      timestamp: `${dateStr} às ${timeStr}`,
      type: 'auto_5min',
      channel: 'Disparador Automático Contínuo',
      count: 0,
      totalAfter: currentTotal,
      note: 'Disparo automático contínuo ativado! Seguirá sem parar até o término do contrato ou pausa manual (+1 a cada 5 minutos).'
    };

    updated = {
      ...live,
      isAuto24hActive: true,
      auto24hStartedAt: startedAt,
      manualInitialCount: currentTotal,
      totalDispatches: currentTotal,
      autoIntervalMinutes: 5,
      recentLogs: [log, ...(live.recentLogs || [])].slice(0, 50)
    };
  } else {
    const log: DispatchLogEntry = {
      id: `log_${now}_auto_stop`,
      timestamp: `${dateStr} às ${timeStr}`,
      type: 'auto_5min',
      channel: 'Disparador Automático Contínuo',
      count: 0,
      totalAfter: currentTotal,
      note: 'Disparos automáticos pausados manualmente pelo administrador.'
    };

    updated = {
      ...live,
      isAuto24hActive: false,
      auto24hStartedAt: undefined,
      auto24hExpiresAt: undefined,
      manualInitialCount: currentTotal,
      totalDispatches: currentTotal,
      recentLogs: [log, ...(live.recentLogs || [])].slice(0, 50)
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
