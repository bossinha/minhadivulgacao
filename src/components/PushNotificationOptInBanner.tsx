import React, { useState, useEffect } from 'react';
import {
  isPushSupported,
  getNotificationPermission,
  requestAndRegisterPushSubscriber
} from '../lib/pushNotifications';

interface PushNotificationOptInBannerProps {
  city?: string;
  className?: string;
}

export const PushNotificationOptInBanner: React.FC<PushNotificationOptInBannerProps> = ({
  city = 'geral',
  className = ''
}) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setIsSupported(isPushSupported());
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
      const isAlreadyActive = localStorage.getItem('minhadivulgacao_push_active') === 'true';
      if (isAlreadyActive && Notification.permission === 'granted') {
        setPermission('granted');
      }
    }
  }, []);

  if (!isSupported) {
    return null; // Não exibe se o navegador não suportar
  }

  const handleRequestPermission = async () => {
    setLoading(true);
    setFeedback(null);

    try {
      const res = await requestAndRegisterPushSubscriber(city);
      setPermission(res.permission);

      if (res.success) {
        setFeedback('✅ Inscrição realizada com sucesso! Você receberá as melhores ofertas da sua cidade.');
      } else if (res.permission === 'denied') {
        setFeedback('ℹ️ Notificações bloqueadas no navegador. Para ativar futuramente, toque no cadeado ao lado do endereço do site e permita as notificações.');
      }
    } catch (err: any) {
      console.error(err);
      setFeedback('Ocorreu um erro ao registrar as notificações.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`w-full max-w-5xl mx-auto my-6 px-4 ${className}`}>
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#171306] via-[#241c09] to-[#171306] border-2 border-amber-400/50 p-5 sm:p-7 shadow-2xl">
        {/* Glow de fundo */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5">
          {/* Textos */}
          <div className="text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-[10px] sm:text-xs font-black uppercase px-3.5 py-1 rounded-full mb-2.5">
              <span>🔥</span>
              <span>RECEBA OFERTAS E NOVIDADES</span>
            </div>
            
            <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight leading-snug">
              Receba promoções, ofertas e oportunidades direto no seu celular.
            </h3>
            
            <p className="text-xs sm:text-sm text-white/70 mt-1 max-w-xl font-medium">
              Não precisa de cadastro ou senha. Ative grátis com 1 clique e seja avisado sempre que surgir uma super oportunidade na sua cidade.
            </p>
          </div>

          {/* Ações e Status */}
          <div className="flex flex-col items-center md:items-end gap-2 shrink-0">
            {permission === 'granted' ? (
              <div className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 px-5 py-3 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider">
                <span>✅</span>
                <span>Notificações Ativadas</span>
              </div>
            ) : permission === 'denied' ? (
              <div className="text-center md:text-right max-w-xs">
                <span className="text-[11px] text-amber-300/80 block font-semibold">
                  ⚠️ Permissão negada no navegador.
                </span>
                <span className="text-[10px] text-white/50 block mt-0.5">
                  Toque no cadeado no topo da página para permitir notificações.
                </span>
              </div>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={handleRequestPermission}
                className="inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 active:scale-95 text-black font-black text-xs sm:text-sm uppercase tracking-wider px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl shadow-xl shadow-amber-500/20 transition-all cursor-pointer"
              >
                <span className="text-base">🔔</span>
                <span>{loading ? 'SOLICITANDO...' : 'QUERO RECEBER'}</span>
              </button>
            )}

            <span className="text-[10px] text-white/40 font-mono">
              100% Gratuito • Cancele quando quiser
            </span>
          </div>
        </div>

        {feedback && (
          <div className="mt-4 pt-3 border-t border-white/10 text-xs text-amber-200/90 font-medium text-center md:text-left">
            {feedback}
          </div>
        )}
      </div>
    </div>
  );
};
