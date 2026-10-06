import React, { useState, useEffect } from 'react';
import {
  getCachedGlobalGroups,
  getGlobalDispatchGroups,
  saveGlobalDispatchGroups,
  subscribeToGlobalDispatchGroups,
  parseNumberWithSeparators
} from '../lib/dispatchTracking';

export const GlobalDispatchGroupsBar: React.FC = () => {
  const [waValue, setWaValue] = useState<string>('900');
  const [fbValue, setFbValue] = useState<string>('6.568');
  const [loading, setLoading] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const initial = getCachedGlobalGroups();
    setWaValue(initial.whatsAppGroups > 0 ? initial.whatsAppGroups.toLocaleString('pt-BR') : '900');
    setFbValue(initial.facebookGroups > 0 ? initial.facebookGroups.toLocaleString('pt-BR') : '6.568');

    getGlobalDispatchGroups().then((cfg) => {
      if (isMounted) {
        setWaValue(cfg.whatsAppGroups > 0 ? cfg.whatsAppGroups.toLocaleString('pt-BR') : '900');
        setFbValue(cfg.facebookGroups > 0 ? cfg.facebookGroups.toLocaleString('pt-BR') : '6.568');
      }
    });

    const unsubscribe = subscribeToGlobalDispatchGroups((cfg) => {
      if (isMounted) {
        setWaValue(cfg.whatsAppGroups.toLocaleString('pt-BR'));
        setFbValue(cfg.facebookGroups.toLocaleString('pt-BR'));
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const handleSave = async () => {
    setLoading(true);
    const wa = parseNumberWithSeparators(waValue);
    const fb = parseNumberWithSeparators(fbValue);
    try {
      await saveGlobalDispatchGroups(wa, fb);
      setWaValue(wa > 0 ? wa.toLocaleString('pt-BR') : '0');
      setFbValue(fb > 0 ? fb.toLocaleString('pt-BR') : '0');
      setSuccessMsg(`✅ Salvo com sucesso! ${wa.toLocaleString('pt-BR')} grupos de WhatsApp e ${fb.toLocaleString('pt-BR')} grupos de Facebook atualizados em TODOS os cards e telas dos clientes.`);
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const parsedWa = parseNumberWithSeparators(waValue);
  const parsedFb = parseNumberWithSeparators(fbValue);
  const total = parsedWa + parsedFb;

  return (
    <div className="bg-gradient-to-r from-[#0d1c15] via-[#09151f] to-[#120f24] border-2 border-emerald-500/50 rounded-2xl p-4 sm:p-5 mb-5 shadow-2xl relative">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🌐</span>
          <div>
            <h4 className="text-sm sm:text-base font-black text-white m-0 flex items-center gap-2">
              <span>Configuração Global de Grupos</span>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider">
                Sincronizado em Todos os Cards
              </span>
            </h4>
            <p className="text-[11px] sm:text-xs text-white/70 m-0 mt-0.5">
              Como você divulga nos mesmos grupos para todas as empresas, configure aqui uma única vez para <strong>mudar automaticamente em todos os cards e na tela de todos os clientes</strong>.
            </p>
          </div>
        </div>

        <div className="bg-black/60 border border-emerald-500/40 rounded-xl px-3 py-1.5 text-right">
          <span className="text-[10px] uppercase font-bold text-emerald-400 block">Total de Grupos no Ar</span>
          <span className="text-base sm:text-lg font-black text-white font-mono">
            {total.toLocaleString('pt-BR')} Grupos
          </span>
        </div>
      </div>

      {successMsg && (
        <div className="mb-3 p-2.5 bg-emerald-500/20 border border-emerald-500/60 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2">
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-end pt-1">
        <div className="bg-black/60 p-2.5 rounded-xl border border-emerald-500/30">
          <label className="text-[11px] font-bold text-emerald-300 block mb-1">
            💬 Quantidade de Grupos do WhatsApp:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              value={waValue}
              onChange={(e) => setWaValue(e.target.value)}
              placeholder="Ex: 900"
              className="bg-black border border-emerald-500/50 text-emerald-300 text-sm font-mono font-black px-3 py-2 rounded-lg w-full focus:border-emerald-400 focus:outline-none"
            />
            <span className="text-xs text-white/50 whitespace-nowrap font-medium">grupos</span>
          </div>
        </div>

        <div className="bg-black/60 p-2.5 rounded-xl border border-blue-500/30">
          <label className="text-[11px] font-bold text-blue-300 block mb-1">
            👥 Quantidade de Grupos do Facebook:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              value={fbValue}
              onChange={(e) => setFbValue(e.target.value)}
              placeholder="Ex: 6.568"
              className="bg-black border border-blue-500/50 text-blue-300 text-sm font-mono font-black px-3 py-2 rounded-lg w-full focus:border-blue-400 focus:outline-none"
            />
            <span className="text-xs text-white/50 whitespace-nowrap font-medium">comunidades</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={handleSave}
            className="w-full bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-400 hover:brightness-110 active:scale-95 text-black font-black text-xs sm:text-sm px-4 py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span>Salvando...</span>
            ) : (
              <>
                <span>💾</span>
                <span>Salvar e Aplicar em TODOS os Cards</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
