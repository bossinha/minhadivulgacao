import React, { useState, useEffect } from 'react';
import {
  CompanyDispatchTracking,
  getCompanyDispatchTracking,
  registerManualDispatch,
  setManualInitialCount,
  toggleAuto24hDispatch,
  subscribeToDispatchTracking,
  generateClientTrackingLink,
  computeLiveTracking
} from '../lib/dispatchTracking';

interface MasterCardDispatchControlProps {
  company: {
    id: string | number;
    name: string;
    logo?: string;
    wa?: string;
    category?: string;
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
    isAuto24hActive: false,
    autoIntervalMinutes: 5,
    groupsWhatsAppReached: 0,
    groupsFacebookReached: 0,
    estimatedReach: 0,
    recentLogs: []
  }));

  const [loading, setLoading] = useState(false);
  const [manualInputValue, setManualInputValue] = useState<string>('');
  const [isEditingInitial, setIsEditingInitial] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(300);
  const [remainingHoursStr, setRemainingHoursStr] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(!compact);

  // Load initial and subscribe to real-time updates
  useEffect(() => {
    let isMounted = true;
    getCompanyDispatchTracking(companyId, companyName).then(data => {
      if (isMounted) {
        setTracking(data);
        setManualInputValue(String(data.totalDispatches || 0));
      }
    });

    const unsubscribe = subscribeToDispatchTracking(companyId, (updated) => {
      if (isMounted) {
        setTracking(updated);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [companyId, companyName]);

  // Live timer tick for 5-minute countdown and 24h expiration
  useEffect(() => {
    if (!tracking.isAuto24hActive || !tracking.auto24hStartedAt) {
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const startTime = tracking.auto24hStartedAt!;
      const expiresAt = tracking.auto24hExpiresAt || (startTime + 24 * 60 * 60 * 1000);

      if (now >= expiresAt) {
        // Expired 24h
        setTracking(prev => ({ ...prev, isAuto24hActive: false }));
        setRemainingHoursStr('Ciclo de 24h concluído');
        return;
      }

      // Calculate remaining 24h time
      const msLeft = expiresAt - now;
      const hoursLeft = Math.floor(msLeft / (1000 * 60 * 60));
      const minsLeft = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));
      setRemainingHoursStr(`${hoursLeft}h ${minsLeft}m restantes`);

      // Calculate 5-minute interval cycle countdown
      const elapsedSinceStart = now - startTime;
      const cycleMs = (tracking.autoIntervalMinutes || 5) * 60 * 1000;
      const msIntoCurrentCycle = elapsedSinceStart % cycleMs;
      const secRemaining = Math.max(0, Math.ceil((cycleMs - msIntoCurrentCycle) / 1000));
      setCountdownSeconds(secRemaining);

      // Re-compute live tracking to catch step boundaries
      setTracking(prev => computeLiveTracking(prev));
    }, 1000);

    return () => clearInterval(interval);
  }, [tracking.isAuto24hActive, tracking.auto24hStartedAt, tracking.auto24hExpiresAt, tracking.autoIntervalMinutes]);

  // Handle +1 manual dispatch
  const handleManualDispatch = async (amount: number = 1) => {
    setLoading(true);
    try {
      const updated = await registerManualDispatch(tracking, amount, 'Grupos WhatsApp & Facebook');
      setTracking(updated);
      setManualInputValue(String(updated.totalDispatches));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle saving manual initial count
  const handleSaveInitialCount = async () => {
    const num = parseInt(manualInputValue, 10);
    if (isNaN(num) || num < 0) {
      alert('Por favor, informe um número válido de disparos.');
      return;
    }
    setLoading(true);
    try {
      const updated = await setManualInitialCount(tracking, num);
      setTracking(updated);
      setIsEditingInitial(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle 24h mode
  const handleToggle24h = async () => {
    setLoading(true);
    try {
      const nextState = !tracking.isAuto24hActive;
      const updated = await toggleAuto24hDispatch(tracking, nextState);
      setTracking(updated);
      if (nextState) {
        setCountdownSeconds(300);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Copy private client link to clipboard
  const handleCopyClientLink = () => {
    const link = generateClientTrackingLink(companyId, companyName);
    navigator.clipboard.writeText(link).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3500);
    }).catch(() => {
      prompt('Copie o link abaixo para enviar no PV do cliente:', link);
    });
  };

  const clientLink = generateClientTrackingLink(companyId, companyName);
  const minutes = Math.floor(countdownSeconds / 60);
  const seconds = countdownSeconds % 60;
  const timerFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="mt-4 pt-3 border-t border-amber-500/30 bg-gradient-to-b from-[#141622] to-[#0c0d14] rounded-2xl p-3.5 sm:p-4 text-left shadow-2xl relative select-none">
      {/* Header bar: Badge and expand/collapse */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${tracking.isAuto24hActive ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${tracking.isAuto24hActive ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
          </span>
          <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-amber-300">
            Disparador & Acompanhamento (Painel Master)
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[10px] text-white/60 hover:text-white px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 transition-colors font-mono"
        >
          {isExpanded ? '▲ Recolher' : '▼ Expandir'}
        </button>
      </div>

      {/* Summary Row */}
      <div className="flex items-center justify-between bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 mb-2.5">
        <div>
          <span className="text-[10px] uppercase font-bold text-white/50 block">Disparos Totais</span>
          <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono tracking-tight flex items-center gap-1.5">
            📢 {tracking.totalDispatches.toLocaleString('pt-BR')}
            {tracking.isAuto24hActive && (
              <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-1.5 py-0.5 rounded font-sans uppercase font-bold animate-pulse">
                +1 a cada 5m
              </span>
            )}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-white/50 block">Modo 24 Horas</span>
          <span className={`text-xs font-black uppercase px-2 py-0.5 rounded inline-block ${
            tracking.isAuto24hActive 
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
              : 'bg-white/5 text-white/40 border border-white/10'
          }`}>
            {tracking.isAuto24hActive ? '🟢 Ativo' : '⚪ Pausado'}
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-3 pt-1">
          {/* Action 1: Disparo Manual */}
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-2.5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-white/80 flex items-center gap-1">
                🚀 Disparo Manual no WhatsApp/Facebook:
              </span>
              <span className="text-[9px] text-white/40 font-mono">Dá +1 no painel do cliente</span>
            </div>
            
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleManualDispatch(1)}
                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 active:scale-95 text-white font-black text-xs py-2 px-2 rounded-lg transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer"
              >
                +1 Disparo
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleManualDispatch(5)}
                className="bg-white/10 hover:bg-white/20 active:scale-95 text-emerald-300 font-bold text-xs py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                +5 Disparos
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleManualDispatch(10)}
                className="bg-white/10 hover:bg-white/20 active:scale-95 text-emerald-300 font-bold text-xs py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                +10 Disparos
              </button>
            </div>
          </div>

          {/* Action 2: Modo Automático 24 Horas (a cada 5 minutos) */}
          <div className={`border rounded-xl p-2.5 transition-all ${
            tracking.isAuto24hActive 
              ? 'bg-emerald-950/20 border-emerald-500/40' 
              : 'bg-white/[0.03] border-white/5'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                  ⏱️ Modo 24h (Disparo a cada 5 minutos):
                </span>
                <span className="text-[9px] text-white/50 block">
                  Conta automaticamente +1 disparo de 5 em 5 minutos durante 24 horas.
                </span>
              </div>
            </div>

            {tracking.isAuto24hActive ? (
              <div className="space-y-2">
                <div className="bg-black/40 border border-emerald-500/30 rounded-lg p-2 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-white/60 text-[10px] block">Próximo Disparo em:</span>
                    <span className="font-mono font-black text-emerald-400 text-sm tracking-widest flex items-center gap-1">
                      ⏳ {timerFormatted}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-white/60 text-[10px] block">Duração:</span>
                    <span className="text-white font-bold text-[11px]">
                      {remainingHoursStr || 'Ciclo de 24 horas'}
                    </span>
                  </div>
                </div>

                {/* Progress bar representing 5 minute interval */}
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-400 h-full transition-all duration-1000 ease-linear rounded-full"
                    style={{ width: `${Math.min(100, Math.max(0, ((300 - countdownSeconds) / 300) * 100))}%` }}
                  ></div>
                </div>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleToggle24h}
                  className="w-full bg-red-600/80 hover:bg-red-600 text-white font-black text-xs py-2 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  ⏸️ Pausar Disparo Automático 24h
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={handleToggle24h}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-xs py-2.5 rounded-lg transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
              >
                ▶️ Ativar Disparo Automático 24h (a cada 5 min)
              </button>
            )}
          </div>

          {/* Action 3: Ajuste Manual de Disparos já feitos */}
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-2.5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-white/80">
                ✏️ Ajustar Contador Inicial (Já Iniciados):
              </span>
              {!isEditingInitial ? (
                <button
                  type="button"
                  onClick={() => setIsEditingInitial(true)}
                  className="text-[10px] text-amber-400 hover:underline font-bold"
                >
                  Alterar valor
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingInitial(false)}
                  className="text-[10px] text-white/50 hover:underline"
                >
                  Cancelar
                </button>
              )}
            </div>

            {isEditingInitial ? (
              <div className="flex gap-1.5 mt-1">
                <input
                  type="number"
                  min="0"
                  value={manualInputValue}
                  onChange={(e) => setManualInputValue(e.target.value)}
                  placeholder="Ex: 150"
                  className="bg-black/60 border border-white/20 text-white text-xs px-2.5 py-1.5 rounded-lg w-full font-mono focus:border-amber-400 focus:outline-none"
                />
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleSaveInitialCount}
                  className="bg-amber-400 hover:bg-amber-300 text-black font-black text-xs px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                >
                  💾 Salvar
                </button>
              </div>
            ) : (
              <p className="text-[10px] text-white/50">
                Se este anunciante já começou antes, você pode definir quantos disparos já foram realizados (atual: <strong>{tracking.totalDispatches}</strong>).
              </p>
            )}
          </div>

          {/* Action 4: LINK EXCLUSIVO DO DONO DA DIVULGAÇÃO (PV) */}
          <div className="bg-gradient-to-r from-blue-950/40 to-indigo-950/40 border border-blue-500/30 rounded-xl p-2.5">
            <div className="flex items-center gap-1.5 mb-1 text-[11px] font-black text-blue-300">
              <span>🔒 Link Exclusivo do Cliente (Envie no PV):</span>
            </div>
            <p className="text-[9px] text-blue-200/70 mb-2">
              Apenas você (Master) tem acesso a este link. Copie e envie no WhatsApp privado do cliente para ele acompanhar os disparos ao vivo!
            </p>

            <div className="flex gap-1.5 mb-2">
              <input
                type="text"
                readOnly
                value={clientLink}
                className="bg-black/60 border border-blue-500/30 text-blue-200 text-[10px] px-2.5 py-1.5 rounded-lg w-full font-mono select-all focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyClientLink}
                className={`text-xs font-black px-3 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
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
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[11px] font-bold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              👁️ Abrir Visão do Cliente (Como ele enxerga)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
