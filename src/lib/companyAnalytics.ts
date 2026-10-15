import { db } from './firebase';
import { doc, setDoc, increment } from 'firebase/firestore';
import { trackCompanyInteraction } from '../components/RealtimeCounters';

export type CompanyEventType = 
  | 'whatsapp_click' 
  | 'view' 
  | 'call' 
  | 'website_click' 
  | 'catalog_view' 
  | string;

export interface CompanyEventRecord {
  companyId: string | number;
  companyName: string;
  eventType: CompanyEventType;
  timestamp: string;
}

/**
 * Registra eventos e cliques de empresas (ex: clique no WhatsApp a partir do modal de vídeo/flyer de boas-vindas).
 */
export async function recordCompanyEvent(
  companyId: string | number,
  companyName: string,
  eventType: CompanyEventType = 'whatsapp_click'
): Promise<void> {
  try {
    const key = String(companyId || companyName || 'empresa').toLowerCase().replace(/\s+/g, '-');

    // 1. Incrementa os contadores de tempo real e dispara evento na interface
    try {
      trackCompanyInteraction(
        { id: companyId, name: companyName },
        eventType === 'whatsapp_click' ? 'whatsapp' : 'card'
      );
    } catch {
      // Ignora erro caso ambiente não suporte CustomEvent
    }

    // 2. Armazena no localStorage para métricas locais instantâneas
    try {
      const storageKey = `company_event_${key}_${eventType}`;
      const current = parseInt(localStorage.getItem(storageKey) || '0', 10);
      localStorage.setItem(storageKey, String(current + 1));
    } catch {
      // localStorage pode estar indisponível ou bloqueado
    }

    // 3. Atualiza dados no Firestore de forma não bloqueante
    try {
      if (db) {
        const statsRef = doc(db, 'company_stats', key);
        await setDoc(
          statsRef,
          {
            companyId: String(companyId),
            companyName: companyName || '',
            [eventType]: increment(1),
            totalInteractions: increment(1),
            lastInteractionAt: new Date().toISOString()
          },
          { merge: true }
        );
      }
    } catch {
      // Falha silenciosa no Firestore (ex: sem conexão ou regras de acesso)
    }
  } catch (err) {
    console.warn('[companyAnalytics] Failed to record event:', err);
  }
}
