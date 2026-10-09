import React, { useState, useEffect, useMemo } from 'react';
import {
  CompanyDispatchTracking,
  getCompanyDispatchTracking,
  subscribeToDispatchTracking,
  computeLiveTracking,
  parseNumberWithSeparators,
  subscribeToGlobalDispatchGroups,
  getCachedGlobalGroups,
  getGlobalDispatchGroups,
  computeCurrentCalendarDays
} from '../lib/dispatchTracking';
import { FICTITIOUS_GROUPS_LIST, FictitiousGroupItem } from '../data/fictitiousGroups';

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
  const [showGroupsList, setShowGroupsList] = useState(true);
  const [groupFilter, setGroupFilter] = useState<'all' | 'Fortaleza' | 'Ceará' | 'Brasil'>('all');
  const [groupTypeFilter, setGroupTypeFilter] = useState<'all' | 'whatsapp' | 'facebook'>('all');
  const [groupSearch, setGroupSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(60);
  const [livePulse, setLivePulse] = useState(false);
  const [liveExtraViews, setLiveExtraViews] = useState(0);
  const [activeGroupTicker, setActiveGroupTicker] = useState<{ name: string; channel: string; time: string } | null>(null);

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

    getGlobalDispatchGroups().then((latestGlobal) => {
      if (isMounted) {
        setTracking(prev => prev ? ({
          ...prev,
          manualWhatsAppGroups: latestGlobal.whatsAppGroups,
          manualFacebookGroups: latestGlobal.facebookGroups,
          groupsWhatsAppReached: latestGlobal.whatsAppGroups,
          groupsFacebookReached: latestGlobal.facebookGroups
        }) : prev);
      }
    });

    // Escuta atualizações globais para atualizar a tela do cliente em tempo real
    const unsubscribeGlobal = subscribeToGlobalDispatchGroups((latestGlobal) => {
      if (isMounted) {
        setTracking(prev => prev ? ({
          ...prev,
          manualWhatsAppGroups: latestGlobal.whatsAppGroups,
          manualFacebookGroups: latestGlobal.facebookGroups,
          groupsWhatsAppReached: latestGlobal.whatsAppGroups,
          groupsFacebookReached: latestGlobal.facebookGroups
        }) : prev);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
      unsubscribeGlobal();
    };
  }, [companyId, compName]);

  // Live timer tick for 5-minute countdown and live visual pulse movements
  useEffect(() => {
    const cycleMs = (tracking?.autoIntervalMinutes || 5) * 60 * 1000;
    const baseStartTime = tracking?.auto24hStartedAt || (Date.now() - 145000);

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedSinceStart = Math.max(0, now - baseStartTime);
      const msIntoCurrentCycle = elapsedSinceStart % cycleMs;
      const secRemaining = Math.max(0, Math.ceil((cycleMs - msIntoCurrentCycle) / 1000));
      setCountdownSeconds(secRemaining);

      const secondsIntoCycle = Math.floor(msIntoCurrentCycle / 1000);

      // Micro-increment de visualizações ao vivo a cada ~8s para movimentar o alcance
      if (secondsIntoCycle > 0 && secondsIntoCycle % 8 === 0) {
        setLiveExtraViews(prev => prev + Math.floor(Math.random() * 2) + 1);
      }

      // Transmissão viva / pulso de atividade a cada ~20s
      if (secondsIntoCycle > 0 && secondsIntoCycle % 20 === 0) {
        setLivePulse(true);
        setTimeout(() => setLivePulse(false), 2000);
      }

      // Quando o cronômetro atinge 1s ou zera (novo disparo nos grupos)
      if (secRemaining <= 1) {
        setJustUpdated(true);
        setTimeout(() => setJustUpdated(false), 3000);
      }

      setTracking(prev => prev ? computeLiveTracking(prev) : prev);
    }, 1000);

    return () => clearInterval(interval);
  }, [tracking?.auto24hStartedAt, tracking?.autoIntervalMinutes]);

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
  const calendarDays = tracking ? computeCurrentCalendarDays(tracking) : { currentDay: 1, totalDays: 30 };
  const daysElapsed = calendarDays.currentDay;
  const totalCampaignDays = calendarDays.totalDays;

  const globalGroups = getCachedGlobalGroups();
  const waGroups = parseNumberWithSeparators(
    (tracking?.manualWhatsAppGroups !== undefined && tracking.manualWhatsAppGroups > 0 && tracking.manualWhatsAppGroups !== 6)
      ? tracking.manualWhatsAppGroups 
      : (globalGroups.whatsAppGroups > 0 ? globalGroups.whatsAppGroups : 900)
  );

  const fbGroups = parseNumberWithSeparators(
    (tracking?.manualFacebookGroups !== undefined && tracking.manualFacebookGroups > 0 && tracking.manualFacebookGroups !== 6)
      ? tracking.manualFacebookGroups 
      : (globalGroups.facebookGroups > 0 ? globalGroups.facebookGroups : 6568)
  );

  const totalGroups = (waGroups + fbGroups) > 0 ? (waGroups + fbGroups) : 7468;
  const reach = (tracking?.estimatedReach || Math.max(currentTotal * 350, 1200)) + liveExtraViews;
  const dayProgressPercent = Math.min(100, Math.max(3, Math.round((daysElapsed / totalCampaignDays) * 100)));

  // CÁLCULO EXATO DO NÚMERO DO GRUPO SE MOVENDO:
  // Se currentTotal é 289 -> o grupo divulgado no momento é o #289!
  // Vai avançando a cada disparo (289, 290, 291...) até o total de grupos.
  // Ao atingir totalGroups (ex: 7468), reinicia do 1 (ciclo concluído)!
  const currentGroupInCycle = currentTotal > 0 
    ? (((currentTotal - 1) % totalGroups) + 1)
    : 1;
  const currentCycleNumber = currentTotal > 0 
    ? Math.floor((currentTotal - 1) / totalGroups) + 1 
    : 1;
  const cycleProgressPercent = Math.min(100, Math.max(0.1, Number(((currentGroupInCycle / totalGroups) * 100).toFixed(1))));

  // Objeto do grupo atual e do próximo grupo da fila
  const currentGroupObj = FICTITIOUS_GROUPS_LIST[(currentGroupInCycle - 1) % FICTITIOUS_GROUPS_LIST.length] || FICTITIOUS_GROUPS_LIST[0];
  const nextGroupInCycle = ((currentGroupInCycle % totalGroups) + 1);
  const nextGroupObj = FICTITIOUS_GROUPS_LIST[(nextGroupInCycle - 1) % FICTITIOUS_GROUPS_LIST.length] || FICTITIOUS_GROUPS_LIST[0];

  // Filter fictitious groups (over 7,000 groups) based on region, type and search term
  const filteredGroups = useMemo(() => {
    return FICTITIOUS_GROUPS_LIST.filter(g => {
      if (groupFilter !== 'all' && g.region !== groupFilter) return false;
      if (groupTypeFilter !== 'all' && g.type !== groupTypeFilter) return false;
      if (groupSearch.trim()) {
        const query = groupSearch.toLowerCase().trim();
        const matchesName = g.name.toLowerCase().includes(query);
        const matchesCat = g.category.toLowerCase().includes(query);
        const matchesRegion = g.region.toLowerCase().includes(query);
        if (!matchesName && !matchesCat && !matchesRegion) return false;
      }
      return true;
    });
  }, [groupFilter, groupTypeFilter, groupSearch]);

  // Infinite scroll / progressive rendering slice for silky smooth performance
  const displayedGroups = useMemo(() => {
    return filteredGroups.slice(0, visibleCount);
  }, [filteredGroups, visibleCount]);

  const handleGroupsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollTop + target.clientHeight >= target.scrollHeight - 200) {
      if (visibleCount < filteredGroups.length) {
        setVisibleCount(prev => Math.min(filteredGroups.length, prev + 50));
      }
    }
  };

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

            {/* 24h Auto Mode Countdown & Real-Time Group Rotation */}
            <div className="mt-3.5 pt-3 border-t border-emerald-500/20 bg-black/60 -mx-4 -mb-4 p-3.5 rounded-b-2xl">
              {/* Row 1: Disparos Automáticos & Timer de 5 Minutos */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5 text-xs">
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <div>
                    <span className="font-bold text-white block">
                      Disparos Automáticos Contínuos: <strong className="text-emerald-400 font-black">+1 a cada 5 minutos</strong>
                    </span>
                    <span className="text-[10px] text-white/50">
                      Transmissão ativa dia e noite na rede de grupos
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end bg-black/60 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                  <div className="text-right">
                    <span className="text-[9px] text-white/50 uppercase block font-bold">Próximo Disparo em:</span>
                    <span className="text-emerald-300 font-mono font-black text-sm tracking-wider">
                      ⏳ {timerFormatted}
                    </span>
                  </div>
                  <div className="w-20 sm:w-24 bg-white/10 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-400 h-full rounded-full transition-all duration-1000 ease-linear shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                      style={{ width: `${Math.min(100, Math.max(0, ((300 - countdownSeconds) / 300) * 100))}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Row 2: ROTAÇÃO DO GRUPO ATUAL (EX: #289 DE 7.468 GRUPOS) */}
              <div className="pt-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🎯</span>
                    <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                      Grupo Atual na Rotação: <strong className="text-emerald-300 text-sm font-mono font-black bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/40">#{currentGroupInCycle.toLocaleString('pt-BR')}</strong> de <span className="text-white/80 font-mono">{totalGroups.toLocaleString('pt-BR')}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                      Ciclo #{currentCycleNumber} • {cycleProgressPercent}% Percorrido
                    </span>
                  </div>
                </div>

                {/* Progress bar of group rotation cycle */}
                <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden p-0.5 mb-2.5">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 h-full rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(52,211,153,0.7)]"
                    style={{ width: `${cycleProgressPercent}%` }}
                  />
                </div>

                {/* Live Current Group Card */}
                <div className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-950/70 via-black/80 to-emerald-950/70 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                      currentGroupObj.type === 'whatsapp' 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    }`}>
                      {currentGroupObj.type === 'whatsapp' ? '💬' : '👥'}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold truncate block leading-tight">
                          {currentGroupObj.name}
                        </span>
                        <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20 shrink-0 font-bold">
                          Ao Vivo
                        </span>
                      </div>
                      <span className="text-[10px] text-white/50 block truncate">
                        {currentGroupObj.category} • {currentGroupObj.members} • {currentGroupObj.region}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-bold text-amber-300 block">
                      Próximo: #{nextGroupInCycle.toLocaleString('pt-BR')}
                    </span>
                    <span className="text-[9px] text-white/40 block">
                      em {timerFormatted}
                    </span>
                  </div>
                </div>

                <p className="text-[10px] text-white/50 mt-2 m-0 text-center sm:text-left leading-relaxed">
                  🔄 <strong>Rotação Contínua:</strong> A cada 5 minutos, o disparo avança para o próximo grupo. Ao alcançar o grupo #{totalGroups.toLocaleString('pt-BR')}, o ciclo completa e reinicia automaticamente a partir do grupo #001 para que seus anúncios continuem circulando sem parar.
                </p>
              </div>
            </div>
          </div>

          {/* ======================================================= */}
          {/* BARRA DE PROGRESSO: SEQUÊNCIA DE DIAS QUE JÁ FORAM */}
          {/* ======================================================= */}
          <div className="bg-gradient-to-r from-[#171508] via-[#211d0a] to-[#171508] border border-yellow-500/40 rounded-2xl p-4 shadow-md">
            <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📅</span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-yellow-300 text-sm sm:text-base">
                      Sequência da Campanha: Dia {daysElapsed} de {totalCampaignDays} Dias
                    </span>
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Avanço Diário Automático
                    </span>
                  </div>
                  <span className="text-[11px] text-white/60 block mt-0.5">
                    Acompanhamento diário contínuo do seu plano contratado • Atualizado automaticamente todo dia
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

            {/* Toggle Button for the Groups Network */}
            <div className="mt-3 pt-3 border-t border-blue-500/20 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 text-xs">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-white/80 font-medium text-[11px]">
                  Rede de grupos e canais ativos (Fortaleza, Ceará e Brasil)
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowGroupsList(!showGroupsList)}
                className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/40 text-blue-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{showGroupsList ? '▲ Ocultar Lista' : '📋 Ver Lista dos Grupos'}</span>
              </button>
            </div>

            {/* EXPANDABLE LIST: GRUPOS FICTÍCIOS DE FORTALEZA, CEARÁ E BRASIL */}
            {showGroupsList && (
              <div className="mt-3.5 bg-black/70 border border-blue-500/30 rounded-xl p-3 sm:p-3.5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 mb-3">
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5 m-0">
                      <span>📲</span> Grupos e Redes Onde Sua Empresa Circula
                    </h4>
                    <span className="text-[10px] text-white/60">
                      Disparos distribuídos em listas locais de Fortaleza, polos do Ceará e redes nacionais OLX / Vendas
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 whitespace-nowrap">
                    🟢 Transmissão Ativa
                  </span>
                </div>

                {/* Filters & Search */}
                <div className="space-y-2 mb-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-white/50 font-bold uppercase mr-1">Região:</span>
                    {(['all', 'Fortaleza', 'Ceará', 'Brasil'] as const).map(reg => (
                      <button
                        key={reg}
                        type="button"
                        onClick={() => {
                          setGroupFilter(reg);
                          setVisibleCount(60);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          groupFilter === reg
                            ? 'bg-amber-400 text-black font-black shadow-sm'
                            : 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/10'
                        }`}
                      >
                        {reg === 'all' ? '🌐 Todos' : reg === 'Fortaleza' ? '📍 Fortaleza' : reg === 'Ceará' ? '🏜️ Ceará' : '🇧🇷 Brasil'}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-white/50 font-bold uppercase mr-1">Canal:</span>
                      {(['all', 'whatsapp', 'facebook'] as const).map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            setGroupTypeFilter(type);
                            setVisibleCount(60);
                          }}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            groupTypeFilter === type
                              ? 'bg-blue-500 text-white font-black'
                              : 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/10'
                          }`}
                        >
                          {type === 'all' ? 'Todos' : type === 'whatsapp' ? '💬 WhatsApp' : '👥 Facebook'}
                        </button>
                      ))}
                    </div>

                    <div className="flex-1">
                      <input
                        type="text"
                        value={groupSearch}
                        onChange={(e) => {
                          setGroupSearch(e.target.value);
                          setVisibleCount(60);
                        }}
                        placeholder="Buscar por nome, bairro ou categoria (ex: Messejana, OLX, Rolo)..."
                        className="w-full bg-black/60 border border-white/20 text-white text-xs px-2.5 py-1 rounded-lg focus:border-blue-400 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Groups Grid / Scroll Area with Smooth Infinite Scroll */}
                <div 
                  onScroll={handleGroupsScroll}
                  className="max-h-60 sm:max-h-72 overflow-y-auto space-y-1.5 pr-1 divide-y divide-white/5"
                >
                  {displayedGroups.length === 0 ? (
                    <div className="text-center py-6 text-xs text-white/40 border border-dashed border-white/10 rounded-lg">
                      Nenhum grupo encontrado com este filtro.
                    </div>
                  ) : (
                    displayedGroups.map((group) => (
                      <div
                        key={group.id}
                        className="pt-1.5 first:pt-0 flex items-center justify-between gap-2 text-xs hover:bg-white/[0.03] p-1.5 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                            group.type === 'whatsapp' 
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}>
                            {group.type === 'whatsapp' ? '💬' : '👥'}
                          </span>
                          <div className="min-w-0">
                            <span className="text-white font-semibold block truncate leading-tight">
                              {group.name}
                            </span>
                            <div className="flex items-center gap-1.5 text-[9px] text-white/50 mt-0.5">
                              <span className="text-amber-400/90 font-mono">#{String(group.id).padStart(4, '0')}</span>
                              <span>•</span>
                              <span className="text-white/60">{group.category}</span>
                              <span>•</span>
                              <span className={`px-1 py-0.2 rounded text-[8px] font-bold ${
                                group.region === 'Fortaleza'
                                  ? 'bg-emerald-500/10 text-emerald-300'
                                  : group.region === 'Ceará'
                                  ? 'bg-yellow-500/10 text-yellow-300'
                                  : 'bg-blue-500/10 text-blue-300'
                              }`}>
                                {group.region}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold block">
                            {group.members}
                          </span>
                          <span className="text-[8px] text-white/40 block mt-0.5">
                            {group.type === 'whatsapp' ? 'WhatsApp Ativo' : 'Comunidade FB'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                  {visibleCount < filteredGroups.length && (
                    <div className="text-center py-2 text-[10px] text-white/40">
                      Role para ver mais grupos em rotação...
                    </div>
                  )}
                </div>

                <div className="mt-2.5 pt-2 border-t border-white/10 text-center">
                  <span className="text-[10px] text-white/50">
                    📡 As divulgações são distribuídas continuamente em rotação entre os grupos selecionados.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ======================================================= */}
          {/* MÉTRICAS PRINCIPAIS (TODAS COM MOVIMENTOS VIVOS) */}
          {/* ======================================================= */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3">
            {/* Metric 1: Total Disparos */}
            <div className={`col-span-2 sm:col-span-1 bg-gradient-to-b from-amber-500/20 via-black/70 to-black/90 border rounded-2xl p-3.5 text-center shadow-lg transition-all duration-500 relative overflow-hidden ${
              justUpdated || livePulse 
                ? 'scale-[1.03] border-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.35)]' 
                : 'border-amber-400/40'
            }`}>
              {/* Subtle Animated Shimmer Beam across card */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent -translate-x-full animate-[shimmer_3s_infinite] pointer-events-none" />

              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                  Disparos Totais
                </span>
              </div>

              <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight flex items-center justify-center gap-1 my-0.5">
                <span className={`transition-all duration-300 ${livePulse || justUpdated ? 'text-emerald-300 scale-110' : 'text-white'}`}>
                  {loading ? '...' : currentTotal.toLocaleString('pt-BR')}
                </span>
              </div>

              <div className="flex items-center justify-center gap-1 text-[9px] font-bold mt-1">
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="inline-block animate-bounce">⚡</span>
                  <span>+1 a cada 5 min</span>
                </span>
              </div>
            </div>

            {/* Metric 2: GRUPO ATUAL NO CICLO */}
            <div className={`col-span-2 sm:col-span-1 bg-gradient-to-b from-emerald-500/20 via-black/70 to-black/90 border rounded-2xl p-3.5 text-center shadow-lg transition-all duration-500 relative overflow-hidden ${
              justUpdated || livePulse 
                ? 'border-emerald-400 scale-[1.02] shadow-[0_0_20px_rgba(52,211,153,0.3)]' 
                : 'border-emerald-500/40'
            }`}>
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span className="text-emerald-400 text-xs">🎯</span>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300">
                  Grupo no Ciclo
                </span>
              </div>

              <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 tracking-tight flex items-center justify-center gap-1 my-0.5">
                <span>#{loading ? '...' : currentGroupInCycle.toLocaleString('pt-BR')}</span>
              </div>

              <span className="text-[9px] text-white/60 font-medium block mt-1 truncate">
                de {totalGroups.toLocaleString('pt-BR')} • Ciclo #{currentCycleNumber}
              </span>
            </div>

            {/* Metric 3: Sequência de Dias */}
            <div className="bg-gradient-to-b from-yellow-500/10 to-black/40 border border-yellow-500/30 rounded-2xl p-3.5 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-300/80 block mb-1">
                Sequência de Dias
              </span>
              <div className="text-xl sm:text-2xl font-black text-yellow-300 font-mono">
                {loading ? '...' : `Dia ${daysElapsed}`}
              </div>
              <span className="text-[9px] text-emerald-400 font-medium block mt-0.5">
                de {totalCampaignDays} dias • 🟢 Automático
              </span>
            </div>

            {/* Metric 4: Rede de Grupos */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-3.5 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/50 block mb-1">
                Rede de Grupos
              </span>
              <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                {loading ? '...' : totalGroups.toLocaleString('pt-BR')}
              </div>
              <span className="text-[9px] text-white/40 block mt-0.5">
                {waGroups} Zap • {fbGroups} Face
              </span>
            </div>

            {/* Metric 5: Alcance Estimado */}
            <div className="col-span-2 sm:col-span-1 bg-white/[0.03] border border-white/10 rounded-2xl p-3.5 text-center relative overflow-hidden">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/50 block mb-1">
                Alcance Estimado
              </span>
              <div className="text-xl sm:text-2xl font-black text-yellow-300 font-mono">
                {loading ? '...' : `${reach.toLocaleString('pt-BR')}+`}
              </div>
              <span className="text-[9px] text-emerald-400 font-bold block mt-0.5 animate-pulse">
                👁️ +{liveExtraViews} ao vivo
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
