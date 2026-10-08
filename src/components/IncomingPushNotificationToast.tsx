import React, { useState, useEffect } from 'react';
import {
  PushNotificationPayload,
  subscribeToLiveBroadcastNotifications,
  recordNotificationClick
} from '../lib/pushNotifications';

export const IncomingPushNotificationToast: React.FC = () => {
  const [activeNotification, setActiveNotification] = useState<PushNotificationPayload | null>(null);

  useEffect(() => {
    // 1. Escuta notificações enviadas ao vivo no Firestore (para todos os visitantes conectados)
    const unsub = subscribeToLiveBroadcastNotifications((payload) => {
      setActiveNotification(payload);
    });

    // 2. Escuta notificações disparadas localmente pelo próprio admin
    const handleLocalEmit = (event: any) => {
      if (event.detail) {
        setActiveNotification(event.detail);
      }
    };
    window.addEventListener('PUSH_NOTIFICATION_EMITTED', handleLocalEmit);

    return () => {
      unsub();
      window.removeEventListener('PUSH_NOTIFICATION_EMITTED', handleLocalEmit);
    };
  }, []);

  // Timer para fechar automaticamente após 12 segundos
  useEffect(() => {
    if (!activeNotification) return;

    const timer = setTimeout(() => {
      setActiveNotification(null);
    }, 12000);

    return () => clearTimeout(timer);
  }, [activeNotification]);

  if (!activeNotification) return null;

  const handleActionClick = () => {
    if (activeNotification.id) {
      recordNotificationClick(activeNotification.id);
    }
    const targetUrl = activeNotification.url || '/';
    setActiveNotification(null);

    // Se for link externo (WhatsApp, site), abre em nova aba ou navega
    if (targetUrl.startsWith('http')) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = targetUrl;
    }
  };

  return (
    <div 
      className="w-[95%] max-w-md transition-all duration-300 animate-in fade-in slide-in-from-top-6"
      style={{
        position: 'fixed',
        top: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 2147483647,
        pointerEvents: 'auto'
      }}
    >
      <div 
        className="relative overflow-hidden rounded-2xl bg-[#11131c]/95 backdrop-blur-xl border border-amber-500/40 p-4 sm:p-5 shadow-[0_20px_60px_rgba(0,0,0,0.85)] text-left"
        style={{
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9), 0 0 30px rgba(245, 158, 11, 0.25)'
        }}
      >
        {/* Barra de progresso animada de 12s */}
        <div 
          className="absolute top-0 left-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 animate-[shrink_12s_linear_forwards]"
          style={{ width: '100%' }}
        />

        {/* Topo do Card: Logo + Nome do Portal + Hora + Fechar */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <img 
              src="https://i.postimg.cc/Gpykbbz5/nova_logo_bossa_infor_png.png" 
              alt="Logo" 
              className="w-5 h-5 rounded-md object-contain bg-black shrink-0 border border-white/10" 
            />
            <span className="text-xs font-black text-amber-400 uppercase tracking-wide truncate">
              Minha Divulgação
            </span>
            <span className="text-[10px] text-white/50 font-mono shrink-0">
              • agora
            </span>
            <span className="inline-flex items-center gap-1 bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[9px] font-black uppercase px-2 py-0.5 rounded-full shrink-0">
              🔥 Nova Oferta
            </span>
          </div>

          <button 
            type="button"
            onClick={() => setActiveNotification(null)}
            className="text-white/40 hover:text-white bg-white/5 hover:bg-white/15 w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors cursor-pointer border-0 shrink-0"
            title="Fechar"
          >
            ✕
          </button>
        </div>

        {/* Linha Principal com Imagem Miniatura (se houver) e Texto */}
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm sm:text-base font-black text-white leading-snug break-words">
              {activeNotification.title}
            </h4>
            <p className="text-xs sm:text-sm text-white/80 font-medium leading-relaxed mt-1 break-words">
              {activeNotification.message}
            </p>
          </div>

          {activeNotification.image && (
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-black/60 border border-white/15 shrink-0 shadow-inner">
              <img 
                src={activeNotification.image} 
                alt="Banner Notificação" 
                className="w-full h-full object-cover" 
              />
            </div>
          )}
        </div>

        {/* Imagem Grande Expandida (se houver) */}
        {activeNotification.image && (
          <div className="mt-3 rounded-xl overflow-hidden max-h-36 bg-black/80 border border-white/10">
            <img 
              src={activeNotification.image} 
              alt="Banner Grande" 
              className="w-full h-full object-cover block" 
            />
          </div>
        )}

        {/* Botão de Ação CTA */}
        <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between gap-3">
          <span className="text-[10px] text-white/40 font-mono">
            Toque para ver a promoção completa
          </span>

          <button
            type="button"
            onClick={handleActionClick}
            className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 active:scale-95 text-black font-black text-xs uppercase px-4 py-2 rounded-xl shadow-lg shadow-amber-500/25 flex items-center gap-1.5 transition-all cursor-pointer border-0 select-none"
          >
            <span>👉</span>
            <span>{activeNotification.actionTitle || 'VER OFERTA'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
