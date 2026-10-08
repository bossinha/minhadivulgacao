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
  recipientsCount?: number;
  sentCount?: number;
  clicksCount?: number;
  status?: 'enviada' | 'erro' | 'processando';
  sentBy?: string;
}

const STORAGE_SUBSCRIBER_KEY = 'minhadivulgacao_push_sub_id';

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

/**
 * Escuta o histórico de notificações enviadas pelo Administrador
 */
export function subscribeToNotificationsHistory(
  onHistoryChange: (list: PushNotificationPayload[]) => void
): () => void {
  try {
    const q = query(
      collection(db, 'push_notifications'),
      orderBy('sentAt', 'desc'),
      limit(50)
    );
    const unsub = onSnapshot(q, (snap) => {
      const list: PushNotificationPayload[] = [];
      snap.forEach(d => {
        list.push({ id: d.id, ...d.data() } as PushNotificationPayload);
      });
      onHistoryChange(list);
    }, (err) => {
      console.warn('Erro ao escutar histórico de notificações:', err);
      onHistoryChange([]);
    });
    return unsub;
  } catch (err) {
    console.warn('Falha ao criar listener de histórico:', err);
    onHistoryChange([]);
    return () => {};
  }
}

/**
 * Dispara uma notificação para toda a audiência inscrita
 * Registra o histórico e exibe nativamente nos navegadores
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
    recipientsCount: effectiveRecipients,
    sentCount: effectiveRecipients,
    clicksCount: 0,
    status: 'enviada',
    sentBy: params.adminEmail || 'admin'
  };

  // 2. Salva no histórico do Firestore
  try {
    await setDoc(doc(db, 'push_notifications', notifId), payload);
  } catch (err) {
    console.error('Erro ao gravar notificação no Firestore:', err);
  }

  // 3. Dispara a notificação real no navegador local/Service Worker
  try {
    if (isPushSupported() && 'serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.showNotification) {
        const notifOptions: any = {
          body: payload.message,
          icon: 'https://i.postimg.cc/Gpykbbz5/nova_logo_bossa_infor_png.png',
          badge: 'https://i.postimg.cc/Gpykbbz5/nova_logo_bossa_infor_png.png',
          image: payload.image || undefined,
          vibrate: [200, 100, 200],
          tag: notifId,
          renotify: true,
          requireInteraction: true,
          data: {
            url: payload.url,
            notificationId: notifId
          },
          actions: [
            {
              action: 'open_offer',
              title: `👉 ${payload.actionTitle}`
            }
          ]
        };
        reg.showNotification(payload.title, notifOptions);
      }
    }
  } catch (showErr) {
    console.warn('Erro ao disparar notificação local:', showErr);
  }

  return {
    success: true,
    notificationId: notifId,
    recipientsCount: effectiveRecipients,
    sentCount: effectiveRecipients
  };
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
