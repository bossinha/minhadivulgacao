import React, { useState, useEffect } from 'react';
import {
  CompanyDispatchTracking,
  getCompanyDispatchTracking,
  subscribeToDispatchTracking,
  computeLiveTracking,
  parseNumberWithSeparators
} from '../lib/dispatchTracking';

interface ClientDispatchTrackerModalProps {
  companyId: string;
  companyData?: {
    id?: string | number;
    name?: string;
    logo?: string;
    category?: string;
    city?: string;
    wa?: string;
    desc?: string;
    catalogUrl?: string;
    website?: string;
    items?: any[];
  } | null;
  onClose?: () => void;
  isStandalonePage?: boolean;
}

export const ClientDispatchTrackerModal: React.FC<ClientDispatchTrackerModalProps> = ({
  companyId,
  companyData,
  onClose,
  isStandalonePage = false
}) => {
  const [tracking, setTracking] = useState<CompanyDispatchTracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(300);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [justUpdated, setJustUpdated] = useState(false);

  const compName = companyData?.name || tracking?.companyName || 'Sua Empresa';
  const compLogo = companyData?.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200';
  const compCat = companyData?.category || 'Comércio & Serviços';
  const compCity = companyData?.city || 'Brasil';

  // Load tracking data & subscribe in real-time
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getCompanyDispatchTracking(companyId, compName).then(data => {
      if (isMounted) {
        setTracking(data);
        setLoading(false);
      }
    });

    const unsubscribe = subscribeToDispatchTracking(companyId, (updated) => {
      if (isMounted) {
        setTracking(prev => {
          if (prev && updated.totalDispatches > prev.totalDispatches) {
            setJustUpdated(true);
            setTimeout(() => setJustUpdated(false), 2500);
          }
          return updated;
        });
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [companyId, compName]);

  // Live timer tick for 5-minute countdown if 24h mode is active
  useEffect(() => {
    if (!tracking?.isAuto24hActive || !tracking?.auto24hStartedAt) {
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const startTime = tracking.auto24hStartedAt!;
      const cycleMs = (tracking.autoIntervalMinutes || 5) * 60 * 1000;
      const elapsedSinceStart = now - startTime;
      const msIntoCurrentCycle = elapsedSinceStart % cycleMs;
      const secRemaining = Math.max(0, Math.ceil((cycleMs - msIntoCurrentCycle) / 1000));
      setCountdownSeconds(secRemaining);

      setTracking(prev => prev ? computeLiveTracking(prev) : prev);
    }, 1000);

    return () => clearInterval(interval);
  }, [tracking?.isAuto24hActive, tracking?.auto24hStartedAt, tracking?.autoIntervalMinutes]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    const data = await getCompanyDispatchTracking(companyId, compName);
    setTracking(data);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const minutes = Math.floor(countdownSeconds / 60);
  const seconds = countdownSeconds % 60;
  const timerFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const currentTotal = tracking?.totalDispatches || 0;
  const daysElapsed = tracking?.daysElapsed || 1;
  const totalCampaignDays = tracking?.totalCampaignDays || 30;

  const waGroups = parseNumberWithSeparators(
    tracking?.manualWhatsAppGroups !== undefined 
      ? tracking.manualWhatsAppGroups 
      : (tracking?.groupsWhatsAppReached !== undefined ? tracking.groupsWhatsAppReached : Math.max(1, Math.round(currentTotal * 0.7) + 5))
  );

  const fbGroups = parseNumberWithSeparators(
    tracking?.manualFacebookGroups !== undefined 
      ? tracking.manualFacebookGroups 
      : (tracking?.groupsFacebookReached !== undefined ? tracking.groupsFacebookReached : Math.max(1, Math.round(currentTotal * 0.4) + 3))
  );

  const totalGroups = waGroups + fbGroups;
  const reach = tracking?.estimatedReach || Math.max(currentTotal * 350, 1200);
  const dayProgressPercent = Math.min(100, Math.max(3, Math.round((daysElapsed / totalCampaignDays) * 100)));

  return (
    <div className={`${isStandalonePage ? 'min-h-screen bg-[#07080e] py-6 sm:py-10 px-3 sm:px-4' : 'fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto'}`}>
      <div className="w-full max-w-2xl bg-[#0c0d16] border border-amber-500/30 rounded-3xl shadow-[0_0_80px_rgba(0,0,0,0.9)] overflow-hidden my-auto relative text-white">
        
        {/* Top Glow Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400"></div>

        {/* Modal Top Bar */}
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between gap-3 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={compLogo}
                alt={compName}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover bg-white/10 border-2 border-amber-400/40 shadow-lg"
              />
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-black text-[9px] font-black px-1.5 py-0.2 rounded-full border border-black shadow">
                ✓
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-xl font-black text-white leading-tight">
                  {compName}
                </h2>
                <span className="bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {compCat}
                </span>
              </div>
              <p className="text-xs text-white/60 mt-0.5 flex items-center gap-1">
                <span>📍 {compCity}</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">Acompanhamento de Divulgações</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleManualRefresh}
              className={`p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold ${isRefreshing ? 'animate-spin text-amber-400' : ''}`}
              title="Atualizar Dados Agora"
            >
              🔄 <span className="hidden sm:inline">Atualizar</span>
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-400 border border-white/10 text-white/60 transition-all text-sm font-bold cursor-pointer"
                title="Fechar Janela"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-4">
          
          {/* Status Announcement Banner */}
          <div className="bg-gradient-to-r from-emerald-950/60 via-[#0d1f18] to-emerald-950/60 border border-emerald-500/40 rounded-2xl p-4 relative overflow-hidden shadow-lg">
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5">📢</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs sm:text-sm font-black text-emerald-300 uppercase tracking-wide">
                    Sua Empresa Sendo Divulgada nos Grupos!
                  </span>
                  <span className="bg-emerald-500 text-black text-[9px] font-black px-2 py-0.5 rounded-full animate-pulse uppercase">
                    AO VIVO
                  </span>
                </div>
                <p className="text-xs text-white/80 mt-1 leading-relaxed">
                  Seus anúncios estão sendo ativamente disparados em listas e grupos de <strong>WhatsApp</strong> e comunidades do <strong>Facebook</strong>. Acompanhe abaixo o painel exclusivo da sua campanha.
                </p>
              </div>
            </div>

            {/* 24h Auto Mode Countdown */}
            {tracking?.isAuto24hActive && (
              <div className="mt-3.5 pt-3 border-t border-emerald-500/20 bg-black/40 -mx-4 -mb-4 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="font-bold text-white/90">
                    Disparos Automáticos Ativos: <span className="text-emerald-400 font-black">+1 a cada 5 minutos</span>
                  </span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <span className="text-[10px] text-white/50 uppercase block font-bold">Próximo Disparo em:</span>
                    <span className="text-emerald-300 font-mono font-black text-sm tracking-wider">
                      ⏳ {timerFormatted}
                    </span>
                  </div>
                  <div className="w-24 sm:w-28 bg-white/10 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-400 h-full rounded-full transition-all duration-1000 ease-linear shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                      style={{ width: `${Math.min(100, Math.max(0, ((300 - countdownSeconds) / 300) * 100))}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ======================================================= */}
          {/* BARRA DE PROGRESSO: SEQUÊNCIA DE DIAS QUE JÁ FORAM */}
          {/* ======================================================= */}
          <div className="bg-gradient-to-r from-[#171508] via-[#211d0a] to-[#171508] border border-yellow-500/40 rounded-2xl p-4 shadow-md">
            <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📅</span>
                <div>
                  <span className="font-black text-yellow-300 text-sm sm:text-base block">
                    Sequência da Campanha: Dia {daysElapsed} de {totalCampaignDays} Dias
                  </span>
                  <span className="text-[11px] text-white/60">
                    Acompanhamento diário contínuo do seu plano contratado
                  </span>
                </div>
              </div>

              <span className="bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 text-xs font-mono font-black px-2.5 py-1 rounded-lg">
                {dayProgressPercent}% Concluído
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden p-0.5">
              <div 
                className="bg-gradient-to-r from-amber-500 via-yellow-400 to-yellow-300 h-full rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(251,191,36,0.6)]"
                style={{ width: `${dayProgressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* ======================================================= */}
          {/* CARD EM DESTAQUE: QUANTIDADE DE GRUPOS WHATSAPP & FACEBOOK */}
          {/* ======================================================= */}
          <div className="bg-gradient-to-r from-[#0d1624] via-[#0f192b] to-[#0d1624] border border-blue-500/30 rounded-2xl p-4 shadow-md">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🌐</span>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-blue-300 uppercase tracking-wide m-0">
                    Grupos de Divulgação Ativos no Momento
                  </h3>
                  <span className="text-[10px] text-white/50">
                    Canais onde seus anúncios e banners estão circulando
                  </span>
                </div>
              </div>

              <div className="bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-mono font-black px-3 py-1 rounded-xl">
                {totalGroups.toLocaleString('pt-BR')} Grupos Totais
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* WhatsApp Groups */}
              <div className="bg-black/50 border border-emerald-500/30 rounded-xl p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xl">
                    💬
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                      Grupos de WhatsApp
                    </span>
                    <span className="text-xs text-white/70">
                      Listas & Grupos Comerciais
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-400 font-mono">
                    {loading ? '...' : waGroups.toLocaleString('pt-BR')}
                  </span>
                  <span className="text-[9px] text-white/40 block font-bold">grupos</span>
                </div>
              </div>

              {/* Facebook Groups */}
              <div className="bg-black/50 border border-blue-500/30 rounded-xl p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-xl">
                    👥
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-blue-400 block">
                      Grupos do Facebook
                    </span>
                    <span className="text-xs text-white/70">
                      Comunidades & Classificados
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-black text-blue-400 font-mono">
                    {loading ? '...' : fbGroups.toLocaleString('pt-BR')}
                  </span>
                  <span className="text-[9px] text-white/40 block font-bold">comunidades</span>
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================= */}
          {/* MÉTRICAS PRINCIPAIS (DISPAROS, DIAS, ALCANCE) */}
          {/* ======================================================= */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {/* Metric 1: Total Disparos */}
            <div className={`col-span-2 sm:col-span-1 bg-gradient-to-b from-amber-500/20 to-black/60 border border-amber-400/40 rounded-2xl p-4 text-center shadow-lg transition-transform duration-300 ${justUpdated ? 'scale-105 border-emerald-400 shadow-emerald-500/30' : ''}`}>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block mb-1">
                Disparos Totais
              </span>
              <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight flex items-center justify-center gap-1">
                <span>{loading ? '...' : currentTotal.toLocaleString('pt-BR')}</span>
              </div>
              <span className="text-[9px] text-emerald-400 font-bold block mt-1">
                ✓ Confirmados
              </span>
            </div>

            {/* Metric 2: Sequência de Dias */}
            <div className="bg-gradient-to-b from-yellow-500/10 to-black/40 border border-yellow-500/30 rounded-2xl p-3.5 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-300/80 block mb-1">
                Sequência de Dias
              </span>
              <div className="text-xl sm:text-2xl font-black text-yellow-300 font-mono">
                {loading ? '...' : `Dia ${daysElapsed}`}
              </div>
              <span className="text-[9px] text-white/50 block mt-0.5">
                de {totalCampaignDays} dias
              </span>
            </div>

            {/* Metric 3: Total de Grupos */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-3.5 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/50 block mb-1">
                Grupos Ativos
              </span>
              <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                {loading ? '...' : totalGroups.toLocaleString('pt-BR')}
              </div>
              <span className="text-[9px] text-white/40 block mt-0.5">
                Zap + Face
              </span>
            </div>

            {/* Metric 4: Alcance Estimado */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-3.5 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/50 block mb-1">
                Alcance Estimado
              </span>
              <div className="text-xl sm:text-2xl font-black text-yellow-300 font-mono">
                {loading ? '...' : `${reach.toLocaleString('pt-BR')}+`}
              </div>
              <span className="text-[9px] text-white/40 block mt-0.5">
                Visualizações
              </span>
            </div>
          </div>

          {/* ======================================================= */}
          {/* LINHA DO TEMPO EM TEMPO REAL (HISTÓRICO DE DISPAROS) */}
          {/* ======================================================= */}
          <div className="bg-black/50 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5 m-0">
                <span>⏱️</span> Registro Recente de Disparos
              </h3>
              <span className="text-[10px] text-white/50 font-mono">
                {tracking?.recentLogs?.length || 0} registros
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {(!tracking?.recentLogs || tracking.recentLogs.length === 0) ? (
                <div className="text-center py-6 text-xs text-white/40 border border-dashed border-white/10 rounded-xl">
                  Disparos iniciados e sendo computados em tempo real na rede de grupos.
                </div>
              ) : (
                tracking.recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 flex items-center justify-between text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400">
                        {log.type === 'auto_5min' ? '⏱️' : log.type === 'manual' ? '🚀' : '⚙️'}
                      </span>
                      <div>
                        <span className="text-white/90 font-medium block leading-tight">
                          {log.note || 'Disparo nos grupos'}
                        </span>
                        <span className="text-[10px] text-white/40 font-mono">
                          {log.timestamp}
                        </span>
                      </div>
                    </div>
                    {log.totalAfter !== undefined && (
                      <span className="text-[11px] font-mono font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 whitespace-nowrap">
                        Total: {log.totalAfter}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center pt-2">
            <p className="text-[11px] text-white/50 leading-relaxed m-0">
              💡 Este link é atualizado em tempo real com as transmissões automáticas e manuais do portal Minha Divulgação.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
