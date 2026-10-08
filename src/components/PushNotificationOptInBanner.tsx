import React, { useState, useEffect } from 'react';
import {
  isPushSupported,
  requestAndRegisterPushSubscriber
} from '../lib/pushNotifications';

interface PushNotificationOptInBannerProps {
  city?: string;
  className?: string;
}

export const PushNotificationOptInBanner: React.FC<PushNotificationOptInBannerProps> = ({
  city = 'geral'
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    // Verifica suporte
    if (!isPushSupported()) return;

    // Se já estiver autorizado no navegador ou dispensado nesta sessão, não exibe
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        return;
      }
      const isDismissed = sessionStorage.getItem('minhadivulgacao_push_dismissed') === 'true';
      if (isDismissed) {
        return;
      }
      // Delay suave de 800ms ao carregar o portal para aparecer com efeito elegante
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!isVisible) {
    return null;
  }

  const handleDismiss = () => {
    try {
      sessionStorage.setItem('minhadivulgacao_push_dismissed', 'true');
    } catch (e) {}
    setIsVisible(false);
  };

  const handleActivate = async () => {
    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await requestAndRegisterPushSubscriber(city);

      if (res.success) {
        setStatusMessage('✅ Notificações ativadas com sucesso!');
        setTimeout(() => {
          setIsVisible(false);
        }, 2200);
      } else if (res.permission === 'denied') {
        setStatusMessage('⚠️ Bloqueado no navegador. Permita no ícone de cadeado.');
        setTimeout(() => {
          setIsVisible(false);
        }, 3500);
      } else {
        handleDismiss();
      }
    } catch (err) {
      console.error(err);
      handleDismiss();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="w-[95%] max-w-xl transition-all duration-300 animate-in fade-in slide-in-from-top-4"
      style={{
        position: 'fixed',
        top: '12px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 99999999,
        pointerEvents: 'auto'
      }}
    >
      <div 
        className="relative overflow-hidden rounded-2xl bg-[#0f1724]/95 backdrop-blur-md border border-[#233549] shadow-[0_12px_40px_rgba(0,0,0,0.7)] px-3.5 py-2.5 sm:px-5 sm:py-3.5 flex items-center justify-between gap-3 sm:gap-4"
        style={{ boxShadow: '0 12px 35px -5px rgba(0, 0, 0, 0.7), 0 0 20px rgba(0, 201, 128, 0.1)' }}
      >
        {statusMessage ? (
          <div className="w-full text-center py-1 text-xs sm:text-sm font-bold text-emerald-400">
            {statusMessage}
          </div>
        ) : (
          <>
            {/* Lado Esquerdo: Ícone + Textos */}
            <div className="flex items-center gap-3 min-w-0">
              {/* Ícone Sino Verde */}
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#00c980]/15 border border-[#00c980]/30 flex items-center justify-center shrink-0">
                <svg 
                  className="w-5 h-5 sm:w-6 sm:h-6 text-[#00c980]" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth={2.2}
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
                  />
                </svg>
              </div>

              {/* Textos */}
              <div className="flex flex-col text-left min-w-0">
                <span className="text-[11px] sm:text-xs font-black text-white tracking-wide uppercase leading-tight truncate">
                  🔥 RECEBA OFERTAS E NOVIDADES
                </span>
                <span className="text-[10px] sm:text-[11px] text-white/70 font-medium leading-tight mt-0.5 line-clamp-2">
                  Receba promoções, ofertas e oportunidades direto no seu celular.
                </span>
              </div>
            </div>

            {/* Lado Direito: Ações (Agora não + QUERO RECEBER) */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                type="button"
                onClick={handleDismiss}
                className="text-white/60 hover:text-white active:scale-95 text-[11px] sm:text-xs font-semibold px-2 py-1.5 transition-colors cursor-pointer bg-transparent border-0 select-none whitespace-nowrap"
              >
                Agora não
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={handleActivate}
                className="bg-[#00c980] hover:bg-[#00e28f] active:scale-95 text-[#041a0e] font-black text-[11px] sm:text-xs uppercase px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap border-0 select-none"
              >
                <span>🔔</span>
                <span>{loading ? 'ATIVANDO...' : 'QUERO RECEBER'}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
