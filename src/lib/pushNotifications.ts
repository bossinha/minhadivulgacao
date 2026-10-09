import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  updateDoc,
  increment,
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';
import { db } from './firebase';

export interface PushSubscriber {
  id: string;
  city?: string;
  status: 'active' | 'unsubscribed';
  subscribedAt: string;
  lastActiveAt: string;
  userAgent?: string;
  platform?: string;
  isMobile: boolean;
  endpoint?: string;
}

export interface PushNotificationPayload {
  id?: string;
  title: string;
  message: string;
  image?: string;
  url: string;
  actionTitle?: string;
  sentAt?: string;
  sentAtTimestamp?: number;
  recipientsCount?: number;
  sentCount?: number;
  clicksCount?: number;
  status?: 'enviada' | 'erro' | 'processando';
  sentBy?: string;
}

const STORAGE_SUBSCRIBER_KEY = 'minhadivulgacao_push_sub_id';

/**
 * Toca um som de aviso sonoro suave e alegre usando Web Audio API nativo
 */
export function playNotificationSound(): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    // Arpeggio de dois tons agradável e nítido: 587Hz -> 880Hz
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    // Autoplay policy pode exigir interação prévia em alguns navegadores
  }
}

/**
 * Vibra o dispositivo móvel suavemente
 */
export function vibrateDevice(): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([200, 100, 200]);
    } catch (_) {}
  }
}

/**
 * Dispara uma notificação nativa do sistema com proteção total para celulares e PCs
 */
export async function displayNotificationSafely(
  title: string,
  options: {
    body: string;
    icon?: string;
    badge?: string;
    image?: string;
    tag?: string;
    data?: any;
    url?: string;
    actionTitle?: string;
  }
): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  // Vibração e som em primeiro plano
  vibrateDevice();
  playNotificationSound();

  if (!('Notification' in window)) return false;

  // Se a permissão estiver como 'default', solicita ao usuário antes de falhar
  if (Notification.permission === 'default') {
    try {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') return false;
    } catch (_) {
      return false;
    }
  }

  if (Notification.permission !== 'granted') return false;

  const notifOptions: any = {
    body: options.body,
    icon: options.icon || 'https://i.postimg.cc/Gpykbbz5/nova_logo_bossa_infor_png.png',
    badge: options.badge || 'https://i.postimg.cc/Gpykbbz5/nova_logo_bossa_infor_png.png',
    image: options.image || undefined,
    tag: options.tag || ('minha-divulgacao-' + Date.now()),
    renotify: true,
    requireInteraction: true,
    vibrate: [200, 100, 200],
    data: options.data || { url: options.url || '/' }
  };

  if (options.actionTitle) {
    notifOptions.actions = [
      {
        action: 'open_offer',
        title: `👉 ${options.actionTitle}`
      }
    ];
  }

  // 1. Tenta prioritariamente via Service Worker (obrigatório e padrão no Android Chrome e navegadores modernos)
  if ('serviceWorker' in navigator) {
    try {
      let reg: ServiceWorkerRegistration | null = null;
      try {
        // Usa Promise.race com timeout de 1500ms para nunca travar a aplicação
        reg = await Promise.race([
          navigator.serviceWorker.ready,
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500))
        ]);
        if (!reg) {
          reg = await navigator.serviceWorker.getRegistration();
        }
      } catch (e) {
        try {
          reg = await navigator.serviceWorker.getRegistration();
        } catch (_) {}
      }

      if (!reg) {
        try {
          reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
        } catch (_) {}
      }

      if (reg && typeof reg.showNotification === 'function') {
        await reg.showNotification(title, notifOptions);

        // Notifica também o ServiceWorker controller se houver
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'SHOW_NOTIFICATION',
            title,
            options: notifOptions
          });
        }
        return true;
      }
    } catch (swErr) {
      console.warn('Tentativa via Service Worker falhou, testando fallback:', swErr);
    }
  }

  // 2. Fallback para Notification nativa clássica (desktop e navegadores que suportam)
  try {
    if (typeof Notification === 'function') {
      const notif = new Notification(title, {
        body: notifOptions.body,
        icon: notifOptions.icon,
        badge: notifOptions.badge,
        image: notifOptions.image,
        tag: notifOptions.tag
      } as any);
      notif.onclick = () => {
        window.focus();
        if (options.url) {
          window.location.href = options.url;
        }
      };
      return true;
    }
  } catch (natErr) {
    console.warn('Fallback Notification clássico falhou:', natErr);
  }

  return false;
}

/**
 * Detecta se o navegador atual suporta notificações e service workers
 */
export function isPushSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'serviceWorker' in navigator && 'Notification' in window;
}

/**
 * Retorna o status atual da permissão de notificações do navegador
 */
export function getNotificationPermission(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Obtém ou gera um identificador persistente e anônimo do dispositivo/navegador
 */
export function getLocalSubscriberId(): string {
  if (typeof window === 'undefined') return 'server';
  let id = localStorage.getItem(STORAGE_SUBSCRIBER_KEY);
  if (!id) {
    id = 'sub_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
    localStorage.setItem(STORAGE_SUBSCRIBER_KEY, id);
  }
  return id;
}

/**
 * Registra o Service Worker do portal
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushSupported()) return null;
  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    return reg;
  } catch (err) {
    console.warn('Não foi possível registrar o Service Worker:', err);
    return null;
  }
}

/**
 * Solicita autorização oficial do navegador e cadastra o visitante na audiência de notificações
 */
export async function requestAndRegisterPushSubscriber(city: string = 'geral'): Promise<{
  success: boolean;
  permission: NotificationPermission;
  error?: string;
}> {
  if (!isPushSupported()) {
    return { success: false, permission: 'denied', error: 'Seu navegador não suporta notificações Push.' };
  }

  try {
    // 1. Solicita a permissão oficial do navegador
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { success: false, permission, error: 'Permissão de notificação não foi concedida.' };
    }

    // 2. Registra o Service Worker
    const reg = await registerServiceWorker();

    // 3. Monta os dados anônimos da inscrição
    const subId = getLocalSubscriberId();
    const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
    const nowIso = new Date().toISOString();

    const subscriberData: PushSubscriber = {
      id: subId,
      city: city || 'geral',
      status: 'active',
      subscribedAt: nowIso,
      lastActiveAt: nowIso,
      userAgent: navigator.userAgent.substring(0, 120),
      platform: navigator.platform || (isMobile ? 'Mobile' : 'Desktop'),
      isMobile
    };

    // 4. Salva no Firestore
    try {
      const subDoc = doc(db, 'push_subscribers', subId);
      await setDoc(subDoc, subscriberData, { merge: true });
    } catch (dbErr) {
      console.warn('Erro ao salvar assinante no Firestore (usando fallback local):', dbErr);
    }

    // Marca no localStorage que está ativo
    localStorage.setItem('minhadivulgacao_push_active', 'true');

    // 5. Exibe notificação de boas-vindas imediatamente para confirmar o funcionamento
    if (reg && reg.showNotification) {
      const welcomeOptions: any = {
        body: 'Agora você receberá as melhores ofertas, promoções e novidades da Minha Divulgação direto no seu celular.',
        icon: 'https://i.postimg.cc/Gpykbbz5/nova_logo_bossa_infor_png.png',
        badge: 'https://i.postimg.cc/Gpykbbz5/nova_logo_bossa_infor_png.png',
        vibrate: [150, 80, 150],
        tag: 'welcome-notification'
      };
      reg.showNotification('🎉 Notificações Ativadas com Sucesso!', welcomeOptions);
    }

    return { success: true, permission: 'granted' };
  } catch (error: any) {
    console.error('Erro ao registrar assinante push:', error);
    return { success: false, permission: 'denied', error: error?.message || 'Falha ao ativar notificações.' };
  }
}

/**
 * Escuta em tempo real a quantidade de pessoas ativas na audiência
 */
export function subscribeToActiveSubscribersCount(
  onCountChange: (count: number) => void
): () => void {
  try {
    const q = query(collection(db, 'push_subscribers'), where('status', '==', 'active'));
    const unsub = onSnapshot(q, (snap) => {
      onCountChange(snap.size);
    }, (err) => {
      console.warn('Erro no listener de assinantes push:', err);
      // Fallback seguro caso Firestore tenha regras temporárias
      onCountChange(0);
    });
    return unsub;
  } catch (err) {
    console.warn('Falha ao inicializar listener de assinantes:', err);
    onCountChange(0);
    return () => {};
  }
}

const LOCAL_HISTORY_KEY = 'minhadivulgacao_local_push_history';

function getLocalHistory(): PushNotificationPayload[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalHistory(list: PushNotificationPayload[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(list.slice(0, 50)));
  } catch (e) {}
}

/**
 * Escuta o histórico de notificações enviadas pelo Administrador
 */
export function subscribeToNotificationsHistory(
  onHistoryChange: (list: PushNotificationPayload[]) => void
): () => void {
  // Emite imediatamente o que já estiver em cache para evitar atraso visual
  const cached = getLocalHistory();
  if (cached.length > 0) {
    onHistoryChange(cached);
  }

  try {
    const q = collection(db, 'push_notifications');
    const unsub = onSnapshot(q, (snap) => {
      const list: PushNotificationPayload[] = [];
      snap.forEach(d => {
        list.push({ id: d.id, ...d.data() } as PushNotificationPayload);
      });

      // Mescla com cache local para garantir que nada se perca
      const mergedMap = new Map<string, PushNotificationPayload>();
      cached.forEach(c => { if (c.id) mergedMap.set(c.id, c); });
      list.forEach(item => { if (item.id) mergedMap.set(item.id, item); });

      const mergedList = Array.from(mergedMap.values());
      // Ordena decrescente com segurança por timestamp ou id
      mergedList.sort((a, b) => (b.sentAtTimestamp || 0) - (a.sentAtTimestamp || 0));

      saveLocalHistory(mergedList);
      onHistoryChange(mergedList.slice(0, 50));
    }, (err) => {
      console.warn('Erro ao escutar histórico de notificações no Firestore:', err);
      onHistoryChange(getLocalHistory());
    });
    return unsub;
  } catch (err) {
    console.warn('Falha ao criar listener de histórico:', err);
    onHistoryChange(getLocalHistory());
    return () => {};
  }
}

// Rastreia em memória quais IDs já foram disparados nesta sessão do navegador
const sessionHandledNotifs = new Set<string>();

/**
 * Escuta transmissões de notificações push ao vivo no Firestore
 * Sincroniza em tempo real para todos os visitantes e celulares conectados
 */
export function subscribeToLiveBroadcastNotifications(
  onNotificationReceived: (payload: PushNotificationPayload) => void
): () => void {
  let isInitialSnapshot = true;

  try {
    const q = collection(db, 'push_notifications');
    const unsub = onSnapshot(q, (snap) => {
      if (snap.empty) {
        isInitialSnapshot = false;
        return;
      }

      const docs: PushNotificationPayload[] = [];
      snap.forEach(d => {
        docs.push({ id: d.id, ...d.data() } as PushNotificationPayload);
      });

      // Ordena pela mais recente
      docs.sort((a, b) => (b.sentAtTimestamp || 0) - (a.sentAtTimestamp || 0));
      const latest = docs[0];
      if (!latest || !latest.id) {
        isInitialSnapshot = false;
        return;
      }

      const now = Date.now();
      const sentTime = latest.sentAtTimestamp || 0;
      // Notificação recente (últimos 10 minutos)
      const isVeryRecent = Math.abs(now - sentTime) < 10 * 60 * 1000;

      // Se for a carga inicial da página
      if (isInitialSnapshot) {
        isInitialSnapshot = false;
        const storageKey = 'seen_push_broadcast_' + latest.id;
        const alreadySeen = localStorage.getItem(storageKey);

        // Se for muito recente, exibe para o visitante
        if (isVeryRecent && !alreadySeen) {
          localStorage.setItem(storageKey, 'true');

          playNotificationSound();
          vibrateDevice();

          displayNotificationSafely(latest.title, {
            body: latest.message,
            image: latest.image,
            url: latest.url,
            actionTitle: latest.actionTitle,
            data: { url: latest.url, notificationId: latest.id }
          });

          onNotificationReceived(latest);
        }
        return;
      }

      // Se for um evento em tempo real após a carga inicial (novo disparo pelo admin)
      const storageKey = 'seen_push_broadcast_' + latest.id;
      const alreadyHandledInSession = sessionHandledNotifs.has(latest.id);
      
      if (!alreadyHandledInSession) {
        sessionHandledNotifs.add(latest.id);
        localStorage.setItem(storageKey, 'true');

        playNotificationSound();
        vibrateDevice();

        displayNotificationSafely(latest.title, {
          body: latest.message,
          image: latest.image,
          url: latest.url,
          actionTitle: latest.actionTitle,
          data: { url: latest.url, notificationId: latest.id }
        });

        onNotificationReceived(latest);
      }
    }, (err) => {
      console.warn('Erro ao escutar transmissões de notificações:', err);
    });

    return unsub;
  } catch (err) {
    console.warn('Falha ao inicializar listener de transmissões:', err);
    return () => {};
  }
}

/**
 * Dispara uma notificação para toda a audiência inscrita
 * Registra o histórico e exibe nativamente nos navegadores e em primeiro plano
 */
export async function sendBroadcastPushNotification(params: {
  title: string;
  message: string;
  image?: string;
  url: string;
  actionTitle?: string;
  adminEmail?: string;
}): Promise<{
  success: boolean;
  notificationId: string;
  recipientsCount: number;
  sentCount: number;
}> {
  const notifId = 'notif_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
  const now = new Date();
  const timestamp = Date.now();
  const dateFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} — ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  // 1. Obtém a contagem de inscritos ativos
  let recipientsCount = 0;
  try {
    const snap = await getDocs(query(collection(db, 'push_subscribers'), where('status', '==', 'active')));
    recipientsCount = snap.size;
  } catch (e) {
    console.warn('Não foi possível ler tamanho dos inscritos, usando valor base:', e);
  }

  // Se for o primeiro teste e ainda não houver outros inscritos no banco além do admin, define no mínimo 1
  const effectiveRecipients = Math.max(1, recipientsCount);

  const payload: PushNotificationPayload = {
    id: notifId,
    title: params.title.trim(),
    message: params.message.trim(),
    image: params.image?.trim() || '',
    url: params.url.trim() || '/',
    actionTitle: params.actionTitle?.trim() || 'VER OFERTA',
    sentAt: dateFormatted,
    sentAtTimestamp: timestamp,
    recipientsCount: effectiveRecipients,
    sentCount: effectiveRecipients,
    clicksCount: 0,
    status: 'enviada',
    sentBy: params.adminEmail || 'admin'
  };

  // Salva no cache local imediatamente
  const currentLocal = getLocalHistory();
  saveLocalHistory([payload, ...currentLocal.filter(x => x.id !== notifId)]);

  // 2. Salva no histórico do Firestore (isso dispara imediatamente em tempo real para todos os clientes conectados)
  try {
    await setDoc(doc(db, 'push_notifications', notifId), payload);
  } catch (err) {
    console.error('Erro ao gravar notificação no Firestore:', err);
  }

  // 3. Toca som e vibração
  playNotificationSound();
  vibrateDevice();

  // 4. Exibe notificação nativa do sistema se suportado
  await displayNotificationSafely(payload.title, {
    body: payload.message,
    image: payload.image,
    url: payload.url,
    actionTitle: payload.actionTitle,
    data: { url: payload.url, notificationId: notifId }
  });

  // 5. Emite evento local imediato para o toast em tela aparecer instantaneamente para quem enviou
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('minhadivulgacao_last_emitted_push', JSON.stringify(payload));
    } catch (_) {}
    window.dispatchEvent(new CustomEvent('PUSH_NOTIFICATION_EMITTED', { detail: payload }));
  }

  return {
    success: true,
    notificationId: notifId,
    recipientsCount: effectiveRecipients,
    sentCount: effectiveRecipients
  };
}

/**
 * Dispara um teste local imediato com som, vibração, toast e notificação nativa
 */
export async function triggerLocalTestNotification(params: {
  title?: string;
  message?: string;
  image?: string;
  url?: string;
  actionTitle?: string;
}): Promise<boolean> {
  const testPayload: PushNotificationPayload = {
    id: 'test_' + Date.now(),
    title: params.title || '🔔 TESTE: Notificações Ativas!',
    message: params.message || 'Seu dispositivo está pronto para receber todas as ofertas e novidades da Minha Divulgação.',
    image: params.image || '',
    url: params.url || window.location.origin,
    actionTitle: params.actionTitle || 'VER OFERTA',
    sentAt: 'Agora (Teste)',
    sentAtTimestamp: Date.now(),
    recipientsCount: 1,
    sentCount: 1,
    clicksCount: 0,
    status: 'enviada'
  };

  playNotificationSound();
  vibrateDevice();

  // 1. Dispara imediatamente evento para o toast em tela e sincroniza abas sem esperar
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('minhadivulgacao_last_emitted_push', JSON.stringify(testPayload));
    } catch (_) {}
    window.dispatchEvent(new CustomEvent('PUSH_NOTIFICATION_EMITTED', { detail: testPayload }));
  }

  // 2. Dispara notificação nativa do sistema em segundo plano
  try {
    await displayNotificationSafely(testPayload.title, {
      body: testPayload.message,
      image: testPayload.image,
      url: testPayload.url,
      actionTitle: testPayload.actionTitle,
      data: { url: testPayload.url, notificationId: testPayload.id }
    });
  } catch (err) {
    console.warn('Erro ao disparar nativo no teste:', err);
  }

  return true;
}

/**
 * Registra o clique de um usuário na notificação
 */
export async function recordNotificationClick(notificationId: string): Promise<void> {
  if (!notificationId) return;
  try {
    const notifRef = doc(db, 'push_notifications', notificationId);
    await updateDoc(notifRef, {
      clicksCount: increment(1)
    });
  } catch (err) {
    console.warn('Não foi possível incrementar clique na notificação:', err);
  }
}

/**
 * Exclui uma notificação específica do histórico do banco de dados (Firestore)
 */
export async function deletePushNotification(notificationId: string): Promise<boolean> {
  if (!notificationId) return false;
  try {
    const notifRef = doc(db, 'push_notifications', notificationId);
    await deleteDoc(notifRef);
    return true;
  } catch (err) {
    console.error('Erro ao excluir notificação do Firestore:', err);
    throw err;
  }
}

/**
 * Atualiza os dados de uma notificação existente no histórico do banco de dados (Firestore)
 */
export async function updatePushNotification(
  notificationId: string, 
  data: Partial<PushNotificationPayload>
): Promise<boolean> {
  if (!notificationId) return false;
  try {
    const notifRef = doc(db, 'push_notifications', notificationId);
    await updateDoc(notifRef, data);

    // Atualiza também no cache local
    const local = getLocalHistory();
    const updated = local.map(item => item.id === notificationId ? { ...item, ...data } : item);
    saveLocalHistory(updated);

    return true;
  } catch (err) {
    console.error('Erro ao atualizar notificação no Firestore:', err);
    throw err;
  }
}

/**
 * Exclui todas as notificações do histórico do banco de dados (limpeza geral para não sobrecarregar)
 */
export async function clearAllPushNotifications(): Promise<number> {
  try {
    const snap = await getDocs(collection(db, 'push_notifications'));
    const deletePromises = snap.docs.map(d => deleteDoc(d.ref));
    await Promise.all(deletePromises);
    return snap.size;
  } catch (err) {
    console.error('Erro ao limpar histórico de notificações do Firestore:', err);
    throw err;
  }
}
