import React, { useState, useEffect } from 'react';
import {
  CompanyDispatchTracking,
  getCompanyDispatchTracking,
  registerManualDispatch,
  setManualInitialCount,
  setManualDaysElapsed,
  setManualGroupsCount,
  resetForNewMonth,
  toggleAuto24hDispatch,
  subscribeToDispatchTracking,
  generateClientTrackingLink,
  computeLiveTracking,
  parseNumberWithSeparators,
  subscribeToGlobalDispatchGroups,
  getCachedGlobalGroups,
  getGlobalDispatchGroups,
  computeCurrentCalendarDays
} from '../lib/dispatchTracking';
import { FICTITIOUS_GROUPS_LIST } from '../data/fictitiousGroups';

interface MasterCardDispatchControlProps {
  company: {
    id: string | number;
    name: string;
    logo?: string;
    wa?: string;
    category?: string;
    city?: string;
  };
  onOpenClientView?: (tracking: CompanyDispatchTracking) => void;
  compact?: boolean;
}

export const MasterCardDispatchControl: React.FC<MasterCardDispatchControlProps> = ({
  company,
  onOpenClientView,
  compact = false
}) => {
  const companyId = String(company.id);
  const companyName = company.name || 'Empresa';

  const [tracking, setTracking] = useState<CompanyDispatchTracking>(() => ({
    companyId,
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
    recentLogs: []
  }));

  const [loading, setLoading] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Form values
  const [manualInputValue, setManualInputValue] = useState<string>('0');
  const [manualDaysValue, setManualDaysValue] = useState<string>('1');
  const [manualTotalDaysValue, setManualTotalDaysValue] = useState<string>('30');
  const [manualWaGroups, setManualWaGroups] = useState<string>('0');
  const [manualFbGroups, setManualFbGroups] = useState<string>('0');

  const [copiedLink, setCopiedLink] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(300);
  const [remainingHoursStr, setRemainingHoursStr] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [showGroupsPreview, setShowGroupsPreview] = useState(false);

  // Show temporary alert banner
  const triggerSuccessMsg = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => {
      setSaveSuccessMsg(null);
    }, 4000);
  };

  // Load initial and subscribe to real-time updates
  useEffect(() => {
    let isMounted = true;
    const globalConfig = getCachedGlobalGroups();

    // Inicializa imediatamente os campos com os grupos globais para que apareçam em todos os cards sem demora
    setManualWaGroups(globalConfig.whatsAppGroups > 0 ? globalConfig.whatsAppGroups.toLocaleString('pt-BR') : '900');
    setManualFbGroups(globalConfig.facebookGroups > 0 ? globalConfig.facebookGroups.toLocaleString('pt-BR') : '6.568');

    getCompanyDispatchTracking(companyId, companyName).then(data => {
      if (isMounted) {
        setTracking(data);
        setManualInputValue(String(data.totalDispatches || 0));
        setManualDaysValue(String(data.daysElapsed || 1));
        setManualTotalDaysValue(String(data.totalCampaignDays || 30));
      }
    });

    getGlobalDispatchGroups().then(latestGlobal => {
      if (isMounted) {
        setManualWaGroups(latestGlobal.whatsAppGroups > 0 ? latestGlobal.whatsAppGroups.toLocaleString('pt-BR') : '900');
        setManualFbGroups(latestGlobal.facebookGroups > 0 ? latestGlobal.facebookGroups.toLocaleString('pt-BR') : '6.568');
        setTracking(prev => ({
          ...prev,
          manualWhatsAppGroups: latestGlobal.whatsAppGroups,
          manualFacebookGroups: latestGlobal.facebookGroups,
          groupsWhatsAppReached: latestGlobal.whatsAppGroups,
          groupsFacebookReached: latestGlobal.facebookGroups
        }));
      }
    });

    const unsubscribe = subscribeToDispatchTracking(companyId, (updated) => {
      if (isMounted) {
        setTracking(updated);
      }
    });

    // Escuta atualizações globais para mudar em todos os cards automaticamente
    const unsubscribeGlobal = subscribeToGlobalDispatchGroups((latestGlobal) => {
      if (isMounted) {
        setTracking(prev => ({
          ...prev,
          manualWhatsAppGroups: latestGlobal.whatsAppGroups,
          manualFacebookGroups: latestGlobal.facebookGroups,
          groupsWhatsAppReached: latestGlobal.whatsAppGroups,
          groupsFacebookReached: latestGlobal.facebookGroups
        }));
        setManualWaGroups(latestGlobal.whatsAppGroups.toLocaleString('pt-BR'));
        setManualFbGroups(latestGlobal.facebookGroups.toLocaleString('pt-BR'));
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
      unsubscribeGlobal();
    };
  }, [companyId, companyName]);

  // Live timer tick for 5-minute countdown and continuous contract duration
  useEffect(() => {
    if (!tracking.isAuto24hActive || !tracking.auto24hStartedAt) {
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const startTime = tracking.auto24hStartedAt!;

      const calendar = computeCurrentCalendarDays(tracking);
      const isContractExpired = calendar.currentDay > calendar.totalDays;

      if (isContractExpired) {
        setTracking(prev => ({ ...prev, isAuto24hActive: false }));
        setRemainingHoursStr(`Contrato finalizado (${calendar.totalDays} dias concluídos)`);
        return;
      }

      const daysLeft = Math.max(0, calendar.totalDays - calendar.currentDay);
      setRemainingHoursStr(
        daysLeft === 0 
          ? 'Último dia da campanha (ativo)' 
          : `${daysLeft} dia(s) restante(s) do contrato`
      );

      const cycleMs = (tracking.autoIntervalMinutes || 5) * 60 * 1000;
      const elapsedSinceStart = now - startTime;
      const msIntoCurrentCycle = elapsedSinceStart % cycleMs;
      const secRemaining = Math.max(0, Math.ceil((cycleMs - msIntoCurrentCycle) / 1000));
      setCountdownSeconds(secRemaining);

      setTracking(prev => computeLiveTracking(prev));
    }, 1000);

    return () => clearInterval(interval);
  }, [tracking.isAuto24hActive, tracking.auto24hStartedAt, tracking.daysElapsed, tracking.totalCampaignDays, tracking.daysAnchorDate, tracking.daysAnchorElapsed, tracking.autoIntervalMinutes]);

  // Handle manual dispatch
  const handleManualDispatch = async (amount: number = 1) => {
    setLoading(true);
    try {
      const updated = await registerManualDispatch(tracking, amount, 'Grupos WhatsApp & Facebook');
      setTracking(updated);
      setManualInputValue(String(updated.totalDispatches));
      triggerSuccessMsg(`+${amount} disparo(s) registrado(s) com sucesso! Total: ${updated.totalDispatches.toLocaleString('pt-BR')}`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle saving manual total dispatches
  const handleSaveInitialCount = async () => {
    const num = parseNumberWithSeparators(manualInputValue);
    setLoading(true);
    try {
      const updated = await setManualInitialCount(tracking, num);
      setTracking(updated);
      setManualInputValue(num.toLocaleString('pt-BR'));
      triggerSuccessMsg(`Total de disparos atualizado para ${num.toLocaleString('pt-BR')}! Salvo no sistema.`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle saving manual days elapsed
  const handleSaveDaysElapsed = async () => {
    const days = Math.max(1, parseNumberWithSeparators(manualDaysValue));
    const total = Math.max(days, parseNumberWithSeparators(manualTotalDaysValue) || 30);
    setLoading(true);
    try {
      const updated = await setManualDaysElapsed(tracking, days, total);
      setTracking(updated);
      triggerSuccessMsg(`Sequência definida: Dia ${days} de ${total} dias! O sistema agora avança +1 dia automaticamente a cada novo dia de veiculação.`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Quick increment day
  const handleIncrementDays = async (amount: number = 1) => {
    setLoading(true);
    try {
      const currentDays = tracking.daysElapsed || 1;
      const total = tracking.totalCampaignDays || 30;
      const updated = await setManualDaysElapsed(tracking, currentDays + amount, total);
      setTracking(updated);
      setManualDaysValue(String(updated.daysElapsed));
      triggerSuccessMsg(`Dia avançado para Dia ${updated.daysElapsed} de ${total}!`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle saving manual groups count
  const handleSaveGroupsCount = async () => {
    const wa = parseNumberWithSeparators(manualWaGroups);
    const fb = parseNumberWithSeparators(manualFbGroups);
    setLoading(true);
    try {
      const updated = await setManualGroupsCount(tracking, wa, fb);
      setTracking(updated);
      setManualWaGroups(wa > 0 ? wa.toLocaleString('pt-BR') : '0');
      setManualFbGroups(fb > 0 ? fb.toLocaleString('pt-BR') : '0');
      triggerSuccessMsg(`Salvo com sucesso: ${wa.toLocaleString('pt-BR')} grupos de WhatsApp e ${fb.toLocaleString('pt-BR')} comunidades de Facebook! Aplicado automaticamente para TODOS os cards e clientes.`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Reset for new month
  const handleResetForNewMonth = async () => {
    const confirmReset = window.confirm(
      `⚠️ ATENÇÃO - ZERAR PARA NOVO MÊS:\n\nDeseja zerar os disparos e voltar para o Dia 1 da campanha de "${companyName}"?\n\n• Os disparos totais voltarão a 0.\n• A sequência voltará ao Dia 1.\n• Os grupos de WhatsApp (${tracking.manualWhatsAppGroups || tracking.groupsWhatsAppReached || 0}) e Facebook (${tracking.manualFacebookGroups || tracking.groupsFacebookReached || 0}) SERÃO MANTIDOS.\n\nConfirmar início de novo mês?`
    );
    if (!confirmReset) return;

    setLoading(true);
    try {
      const updated = await resetForNewMonth(tracking);
      setTracking(updated);
      setManualInputValue('0');
      setManualDaysValue('1');
      triggerSuccessMsg(`Novo mês iniciado para "${companyName}"! Contadores zerados.`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle continuous auto-dispatch mode
  const handleToggle24h = async () => {
    setLoading(true);
    try {
      const nextState = !tracking.isAuto24hActive;
      const updated = await toggleAuto24hDispatch(tracking, nextState);
      setTracking(updated);
      if (nextState) {
        setCountdownSeconds(300);
        triggerSuccessMsg('Disparo Automático Contínuo ATIVADO! Roda direto dia e noite sem parar (+1 a cada 5 min) até o término do contrato ou pausa manual.');
      } else {
        triggerSuccessMsg('Disparo Automático PAUSADO manualmente.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Copy private client link
  const clientLink = generateClientTrackingLink(companyId, companyName);
  const handleCopyClientLink = () => {
    navigator.clipboard.writeText(clientLink).then(() => {
      setCopiedLink(true);
      triggerSuccessMsg('Link exclusivo copiado! Envie no WhatsApp privado (PV) do cliente.');
      setTimeout(() => setCopiedLink(false), 3500);
    }).catch(() => {
      prompt('Copie o link abaixo para enviar no PV do cliente:', clientLink);
    });
  };

  const minutes = Math.floor(countdownSeconds / 60);
  const seconds = countdownSeconds % 60;
  const timerFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const globalConfig = getCachedGlobalGroups();
  const currentWa = parseNumberWithSeparators(
    (tracking.manualWhatsAppGroups && tracking.manualWhatsAppGroups > 0 && tracking.manualWhatsAppGroups !== 6)
      ? tracking.manualWhatsAppGroups
      : (globalConfig.whatsAppGroups > 0 ? globalConfig.whatsAppGroups : 900)
  );
  const currentFb = parseNumberWithSeparators(
    (tracking.manualFacebookGroups && tracking.manualFacebookGroups > 0 && tracking.manualFacebookGroups !== 6)
      ? tracking.manualFacebookGroups
      : (globalConfig.facebookGroups > 0 ? globalConfig.facebookGroups : 6568)
  );

  return (
    <div className="mt-4 pt-3.5 border-t border-amber-500/40 bg-gradient-to-b from-[#131522] via-[#0e0f18] to-[#090a10] rounded-2xl p-4 text-left shadow-2xl relative select-none">
      
      {/* Feedback Banner */}
      {saveSuccessMsg && (
        <div className="mb-3 p-2.5 bg-emerald-500/20 border border-emerald-500/60 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-lg">
          <span className="text-base">✅</span>
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Header bar: Badge and expand/collapse */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-3 w-3 relative">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${tracking.isAuto24hActive ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${tracking.isAuto24hActive ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
          </span>
          <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-amber-300">
            Painel Master de Disparos & Acompanhamento
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-white/80 hover:text-white px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors font-bold cursor-pointer"
        >
          {isExpanded ? '▲ Recolher Painel' : '▼ Expandir Controles'}
        </button>
      </div>

      {/* Resumo Principal em Destaque */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-black/60 border border-white/10 rounded-xl p-3 mb-3">
        {/* Total Disparos */}
        <div>
          <span className="text-[10px] uppercase font-bold text-white/50 block">Disparos Totais</span>
          <span className="text-lg sm:text-2xl font-black text-amber-400 font-mono tracking-tight flex items-center gap-1">
            📢 {tracking.totalDispatches.toLocaleString('pt-BR')}
            {tracking.isAuto24hActive && (
              <span className="text-[8px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-1 py-0.5 rounded font-sans font-bold animate-pulse">
                +1/5m
              </span>
            )}
          </span>
        </div>

        {/* Sequência de Dias */}
        <div className="border-l border-white/10 pl-2">
          <span className="text-[10px] uppercase font-bold text-white/50 block">Sequência de Dias</span>
          <span className="text-sm sm:text-base font-black text-yellow-300 font-mono tracking-tight block mt-0.5">
            📅 Dia {tracking.daysElapsed || 1} de {tracking.totalCampaignDays || 30}
          </span>
        </div>

        {/* Grupos Cadastrados */}
        <div className="border-l border-white/10 pl-2">
          <span className="text-[10px] uppercase font-bold text-white/50 block">Grupos no Ar</span>
          <span className="text-xs sm:text-sm font-bold text-white font-mono tracking-tight block mt-0.5">
            💬 <strong className="text-emerald-400">{currentWa.toLocaleString('pt-BR')}</strong> ZAP • 👥 <strong className="text-blue-400">{currentFb.toLocaleString('pt-BR')}</strong> FB
          </span>
        </div>

        {/* Modo 24h */}
        <div className="border-l border-white/10 pl-2">
          <span className="text-[10px] uppercase font-bold text-white/50 block">Modo 24 Horas</span>
          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded inline-block mt-0.5 ${
            tracking.isAuto24hActive 
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse' 
              : 'bg-white/5 text-white/40 border border-white/10'
          }`}>
            {tracking.isAuto24hActive ? '🟢 Ativo (5m)' : '⚪ Pausado'}
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-3 pt-1">

          {/* ========================================================= */}
          {/* SEÇÃO 1: QUANTIDADE DE GRUPOS WHATSAPP E FACEBOOK */}
          {/* ========================================================= */}
          <div className="bg-gradient-to-r from-emerald-950/40 via-[#0e1c15] to-[#0e1c15] border border-emerald-500/40 rounded-xl p-3 shadow-md">
            <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
              <span className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
                👥 Grupos de Divulgação (WhatsApp & Facebook):
              </span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                🌐 Aplica para todos os cards automaticamente
              </span>
            </div>
            <p className="text-[11px] text-white/70 mb-2 leading-tight">
              Defina a quantidade de grupos. Como você usa os mesmos grupos para todas as divulgações, <strong>ao salvar aqui essa numeração atualiza automaticamente para todos os cards e telas dos clientes</strong>.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
              <div className="bg-black/50 p-2 rounded-lg border border-emerald-500/20">
                <label className="text-[10px] font-bold text-emerald-300 block mb-1">
                  💬 Grupos de WhatsApp:
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={manualWaGroups}
                    onChange={(e) => setManualWaGroups(e.target.value)}
                    placeholder="Ex: 900"
                    className="bg-black/80 border border-emerald-500/40 text-emerald-300 text-sm font-mono font-black px-3 py-1.5 rounded-lg w-full focus:border-emerald-400 focus:outline-none"
                  />
                  <span className="text-xs text-white/50 whitespace-nowrap">grupos</span>
                </div>
              </div>

              <div className="bg-black/50 p-2 rounded-lg border border-blue-500/20">
                <label className="text-[10px] font-bold text-blue-300 block mb-1">
                  👥 Comunidades do Facebook:
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={manualFbGroups}
                    onChange={(e) => setManualFbGroups(e.target.value)}
                    placeholder="Ex: 7.850"
                    className="bg-black/80 border border-blue-500/40 text-blue-300 text-sm font-mono font-black px-3 py-1.5 rounded-lg w-full focus:border-blue-400 focus:outline-none"
                  />
                  <span className="text-xs text-white/50 whitespace-nowrap">grupos</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1 border-t border-emerald-500/20">
              <span className="text-[10px] text-white/60">
                Total atual: <strong className="text-white font-mono">{(currentWa + currentFb).toLocaleString('pt-BR')} grupos alcançados</strong>
              </span>
              <button
                type="button"
                disabled={loading}
                onClick={handleSaveGroupsCount}
                className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 active:scale-95 text-black font-black text-xs px-4 py-2 rounded-lg transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                💾 Salvar e Aplicar em TODOS os Cards
              </button>
            </div>

            {/* Toggle Preview of Fictitious Groups for Admin */}
            <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] text-white/50">
                Rede com mais de <strong>7.000 grupos em rotação</strong> (Fortaleza, CE e Brasil)
              </span>
              <button
                type="button"
                onClick={() => setShowGroupsPreview(!showGroupsPreview)}
                className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
              >
                {showGroupsPreview ? '▲ Ocultar Lista' : '👁️ Visualizar Amostra da Rede'}
              </button>
            </div>

            {showGroupsPreview && (
              <div className="mt-2.5 bg-black/60 border border-emerald-500/30 rounded-lg p-2.5 max-h-48 overflow-y-auto space-y-1">
                <span className="text-[10px] font-bold text-white/70 block mb-1">
                  Exibição da Rede (7.000 Grupos em Rotação Contínua):
                </span>
                {FICTITIOUS_GROUPS_LIST.slice(0, 100).map((g) => (
                  <div key={g.id} className="flex items-center justify-between text-[11px] py-0.5 border-b border-white/5 last:border-0">
                    <span className="text-white/80 truncate">
                      {g.type === 'whatsapp' ? '💬' : '👥'} #{String(g.id).padStart(4, '0')} {g.name}
                    </span>
                    <span className="text-[9px] font-mono text-emerald-400 shrink-0 ml-2">
                      {g.region} • {g.members}
                    </span>
                  </div>
                ))}
                <div className="text-center py-1 text-[10px] text-white/40">
                  + 6.900 grupos adicionais ativos no sistema...
                </div>
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* SEÇÃO 2: SEQUÊNCIA DE DIAS QUE JÁ FORAM */}
          {/* ========================================================= */}
          <div className="bg-gradient-to-r from-yellow-950/40 via-[#1c190a] to-[#1c190a] border border-yellow-500/40 rounded-xl p-3 shadow-md">
            <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
              <span className="text-xs font-black text-yellow-300 flex items-center gap-1.5">
                📅 Sequência de Dias (Avanço Diário Automático):
              </span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Avança +1 dia sozinho todo dia
              </span>
            </div>
            <p className="text-[11px] text-white/70 mb-2 leading-tight">
              Defina o dia em que a campanha está (ex: Dia 7 de 30). <strong>A partir dessa data, o sistema avança sozinho +1 dia diariamente</strong> para que o cliente veja o progresso contínuo e automático sem você precisar alterar manualmente todo dia.
            </p>

            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="bg-black/50 p-2 rounded-lg border border-yellow-500/20">
                <label className="text-[10px] font-bold text-yellow-300 block mb-1">
                  Dia Atual da Campanha:
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-yellow-400 font-bold">Dia</span>
                  <input
                    type="number"
                    min="1"
                    value={manualDaysValue}
                    onChange={(e) => setManualDaysValue(e.target.value)}
                    placeholder="Ex: 5"
                    className="bg-black/80 border border-yellow-500/40 text-yellow-300 text-sm font-mono font-black px-3 py-1.5 rounded-lg w-full focus:border-yellow-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="bg-black/50 p-2 rounded-lg border border-white/10">
                <label className="text-[10px] font-bold text-white/70 block mb-1">
                  Total de Dias do Plano:
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="1"
                    value={manualTotalDaysValue}
                    onChange={(e) => setManualTotalDaysValue(e.target.value)}
                    placeholder="30"
                    className="bg-black/80 border border-white/20 text-white text-sm font-mono font-black px-3 py-1.5 rounded-lg w-full focus:border-white/40 focus:outline-none"
                  />
                  <span className="text-xs text-white/50">dias</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1 border-t border-yellow-500/20">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleIncrementDays(1)}
                  className="bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-300 border border-yellow-400/40 text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                  title="Avançar +1 dia"
                >
                  +1 Dia
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleIncrementDays(5)}
                  className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                  title="Avançar +5 dias"
                >
                  +5 Dias
                </button>
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={handleSaveDaysElapsed}
                className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 active:scale-95 text-black font-black text-xs px-4 py-2 rounded-lg transition-all shadow-md flex items-center gap-1 cursor-pointer"
              >
                💾 Salvar Sequência de Dias
              </button>
            </div>
          </div>

          {/* ========================================================= */}
          {/* SEÇÃO 3: DISPAROS MANUAIS (+1, +5, +10) */}
          {/* ========================================================= */}
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                🚀 Disparo Manual nos Grupos (WhatsApp / Facebook):
              </span>
              <span className="text-[10px] text-white/50 font-mono">
                Soma na hora para o cliente
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-2.5">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleManualDispatch(1)}
                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 active:scale-95 text-white font-black text-xs py-2.5 px-2 rounded-xl transition-all shadow-lg flex items-center justify-center gap-1 cursor-pointer"
              >
                +1 Disparo
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleManualDispatch(5)}
                className="bg-white/10 hover:bg-white/20 active:scale-95 text-emerald-300 font-bold text-xs py-2.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                +5 Disparos
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleManualDispatch(10)}
                className="bg-white/10 hover:bg-white/20 active:scale-95 text-emerald-300 font-bold text-xs py-2.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                +10 Disparos
              </button>
            </div>

            {/* Ajuste manual do total de disparos caso já tenham começado */}
            <div className="bg-black/40 border border-white/5 rounded-lg p-2 flex items-center gap-2">
              <span className="text-[10px] text-white/60 font-bold whitespace-nowrap">
                Definir Disparos Já Realizados:
              </span>
              <input
                type="number"
                min="0"
                value={manualInputValue}
                onChange={(e) => setManualInputValue(e.target.value)}
                placeholder="Ex: 150"
                className="bg-black/80 border border-white/20 text-white text-xs px-2.5 py-1 rounded-lg w-full font-mono focus:border-amber-400 focus:outline-none"
              />
              <button
                type="button"
                disabled={loading}
                onClick={handleSaveInitialCount}
                className="bg-amber-400 hover:bg-amber-300 text-black font-black text-xs px-3 py-1 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                💾 Salvar Total
              </button>
            </div>
          </div>

          {/* ========================================================= */}
          {/* SEÇÃO 4: MODO DE DISPARO AUTOMÁTICO CONTÍNUO (DE 5 EM 5 MINUTOS) */}
          {/* ========================================================= */}
          <div className={`border rounded-xl p-3 transition-all ${
            tracking.isAuto24hActive 
              ? 'bg-emerald-950/30 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]' 
              : 'bg-white/[0.03] border-white/10'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  ⏱️ Modo Automático Contínuo (Disparo a cada 5 minutos):
                </span>
                <span className="text-[10px] text-white/60 block mt-0.5">
                  Muda automaticamente de 5 em 5 minutos contando +1 disparo para o cliente. Não para até o fim do contrato ou pausa manual.
                </span>
              </div>
            </div>

            {tracking.isAuto24hActive ? (
              <div className="space-y-2">
                <div className="bg-black/60 border border-emerald-500/40 rounded-xl p-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-white/60 text-[10px] block font-bold">Próximo Disparo em:</span>
                    <span className="font-mono font-black text-emerald-400 text-base tracking-widest flex items-center gap-1">
                      ⏳ {timerFormatted}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-white/60 text-[10px] block font-bold">Status do Contrato:</span>
                    <span className="text-emerald-300 font-bold text-xs font-mono">
                      🟢 {remainingHoursStr || 'Ativo Contínuo'}
                    </span>
                  </div>
                </div>

                {/* Progress bar representing 5 minute cycle */}
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-400 h-full transition-all duration-1000 ease-linear rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                    style={{ width: `${Math.min(100, Math.max(0, ((300 - countdownSeconds) / 300) * 100))}%` }}
                  ></div>
                </div>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleToggle24h}
                  className="w-full bg-red-600/90 hover:bg-red-600 text-white font-black text-xs py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
                >
                  ⏸️ Pausar Disparo Automático (Salvo no Banco)
                </button>

                <p className="text-[10px] text-emerald-300/80 text-center m-0 leading-tight">
                  🔒 <strong>Ativado!</strong> O sistema roda direto dia e noite sem parar (+1 a cada 5 min) até expirar o final do contrato ({tracking.totalCampaignDays || 30} dias) ou até você clicar acima para pausar.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleToggle24h}
                  className="w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 active:scale-95 text-black font-black text-xs py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  ▶️ Ativar Disparo Automático Contínuo (Até o Fim do Contrato)
                </button>
                <p className="text-[10px] text-white/50 text-center m-0 leading-tight">
                  💡 Ao ativar, o sistema dispara sem parar (+1 a cada 5 minutos) direto até finalizar o período do contrato de {tracking.totalCampaignDays || 30} dias ou até você pausar manualmente.
                </p>
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* SEÇÃO 5: LINK EXCLUSIVO DO CLIENTE (PV) */}
          {/* ========================================================= */}
          <div className="bg-gradient-to-r from-blue-950/50 to-indigo-950/50 border border-blue-500/40 rounded-xl p-3 shadow-md">
            <div className="flex items-center gap-1.5 mb-1 text-xs font-black text-blue-300">
              <span>🔒 Link Exclusivo do Dono da Divulgação (Mandar no PV):</span>
            </div>
            <p className="text-[10px] text-blue-200/80 mb-2 leading-relaxed">
              Esse link <strong>só aparece aqui no Master</strong>. Copie e envie no WhatsApp privado do cliente. Ele abrirá o portal e verá em tempo real os disparos, os grupos e a sequência de dias.
            </p>

            <div className="flex gap-2 mb-2">
              <input
                type="text"
                readOnly
                value={clientLink}
                className="bg-black/70 border border-blue-500/40 text-blue-200 text-xs px-3 py-2 rounded-xl w-full font-mono select-all focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyClientLink}
                className={`text-xs font-black px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer shadow-md ${
                  copiedLink 
                    ? 'bg-emerald-500 text-black' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                {copiedLink ? '✓ Copiado!' : '📋 Copiar PV'}
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                if (onOpenClientView) {
                  onOpenClientView(tracking);
                } else {
                  window.open(clientLink, '_blank');
                }
              }}
              className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-black py-2 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              👁️ Abrir Tela do Cliente (Visualizar exatamente o que ele vê)
            </button>
          </div>

          {/* ========================================================= */}
          {/* SEÇÃO 6: BOTÃO ZERAR CONTADOR PARA NOVO MÊS */}
          {/* ========================================================= */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-[11px] font-bold text-white/60 block">
                Quando iniciar outro mês de divulgação:
              </span>
              <span className="text-[9px] text-white/40 block">
                Zera os disparos, volta para o Dia 1 e mantém os grupos salvos.
              </span>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={handleResetForNewMonth}
              className="bg-red-500/15 hover:bg-red-500/30 text-red-300 hover:text-red-200 border border-red-500/40 text-xs font-black px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-md"
              title="Zera a contagem de disparos e volta a campanha para o Dia 1"
            >
              🔄 Zerar Contador para Novo Mês
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
