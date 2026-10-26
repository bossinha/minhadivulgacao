import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Activity, 
  TrendingUp, 
  Globe, 
  Calendar, 
  Search, 
  MessageSquare, 
  ExternalLink, 
  RefreshCw, 
  ShieldCheck, 
  BarChart3, 
  MousePointerClick,
  Eye,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { 
  SiteAccessSummary, 
  DailyAccessRecord, 
  CompanyStatsRecord,
  subscribeAccessSummary,
  subscribeDailyHistory,
  subscribeCompanyStats
} from '../lib/accessTracker';

interface AccessStatsPanelProps {
  allCompanies: any[];
}

export const AccessStatsPanel: React.FC<AccessStatsPanelProps> = ({ allCompanies }) => {
  const [summary, setSummary] = useState<SiteAccessSummary>({
    totalVisits: 9480,
    uniqueVisitors: Math.round(9480 * 0.72),
    todayVisits: 1,
    todayDate: new Date().toISOString().slice(0, 10),
    origins: {
      facebook: 0,
      outras: 0,
      direto_nao_identificada: 1
    }
  });

  const [daysRange, setDaysRange] = useState<7 | 14 | 30>(14);
  const [dailyRecords, setDailyRecords] = useState<DailyAccessRecord[]>([]);
  const [companyStats, setCompanyStats] = useState<CompanyStatsRecord[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [sortBy, setSortBy] = useState<'clicks' | 'views' | 'whatsapp'>('clicks');
  const [hoveredDay, setHoveredDay] = useState<DailyAccessRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Assinaturas em tempo real do Firestore
  useEffect(() => {
    setIsLoading(true);

    const unsubSummary = subscribeAccessSummary((newSummary) => {
      setSummary(newSummary);
      setIsLoading(false);
    });

    const unsubDaily = subscribeDailyHistory(daysRange, (newRecords) => {
      setDailyRecords(newRecords);
    });

    const unsubCompanies = subscribeCompanyStats(allCompanies, (newCompanyStats) => {
      setCompanyStats(newCompanyStats);
    });

    return () => {
      unsubSummary();
      unsubDaily();
      unsubCompanies();
    };
  }, [daysRange, allCompanies]);

  // Cálculo de origens em porcentagem
  const originTotals = useMemo(() => {
    const fb = summary.origins?.facebook || 0;
    const outras = summary.origins?.outras || 0;
    const direto = summary.origins?.direto_nao_identificada || 0;
    const totalKnown = fb + outras + direto;
    const total = totalKnown > 0 ? totalKnown : 1;

    return {
      fb,
      outras,
      direto,
      fbPct: Math.round((fb / total) * 100),
      outrasPct: Math.round((outras / total) * 100),
      diretoPct: Math.round((direto / total) * 100),
      total
    };
  }, [summary.origins]);

  // Filtro e ordenação da lista de anunciantes
  const filteredCompanies = useMemo(() => {
    let list = companyStats.filter(c => {
      if (!searchFilter.trim()) return true;
      const term = searchFilter.toLowerCase();
      return (
        c.name.toLowerCase().includes(term) ||
        c.category.toLowerCase().includes(term) ||
        (c.city && c.city.toLowerCase().includes(term))
      );
    });

    list.sort((a, b) => {
      if (sortBy === 'clicks') return b.clicksTotal - a.clicksTotal || b.views - a.views;
      if (sortBy === 'whatsapp') return b.clicksWhatsapp - a.clicksWhatsapp || b.clicksTotal - a.clicksTotal;
      if (sortBy === 'views') return b.views - a.views;
      return 0;
    });

    return list;
  }, [companyStats, searchFilter, sortBy]);

  // Totais agregados dos clientes
  const companyTotals = useMemo(() => {
    return companyStats.reduce((acc, c) => ({
      views: acc.views + c.views,
      clicksWhatsapp: acc.clicksWhatsapp + c.clicksWhatsapp,
      clicksTotal: acc.clicksTotal + c.clicksTotal
    }), { views: 0, clicksWhatsapp: 0, clicksTotal: 0 });
  }, [companyStats]);

  // Cálculo do pico do gráfico
  const maxDayVisits = useMemo(() => {
    const maxVal = Math.max(...dailyRecords.map(d => d.visits), 10);
    return Math.ceil(maxVal * 1.15);
  }, [dailyRecords]);

  return (
    <div className="w-full space-y-6 text-white select-none animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#121422] p-5 rounded-2xl border border-white/10 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <BarChart3 size={20} />
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                Estatísticas de Acesso
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  DADOS REAIS • MASTER
                </span>
              </h2>
              <p className="text-xs text-white/60 mt-0.5">
                Monitoramento automático do endereço oficial com proteção contra contagens duplicadas.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right text-[11px] font-mono text-white/50 hidden md:block">
            Último registro: {summary.lastAccessAt ? new Date(summary.lastAccessAt).toLocaleTimeString('pt-BR') : 'Hoje'}
          </div>
        </div>
      </div>

      {/* 3 Main Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total de acessos */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#121424] to-[#0c0d16] p-5 border border-amber-500/30 shadow-xl">
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <span className="text-xs font-mono font-black uppercase tracking-wider text-amber-400/90">
              Total de Acessos
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <Eye size={18} />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white mt-1">
            {summary.totalVisits.toLocaleString('pt-BR')}
          </div>
          <p className="text-[11px] text-white/60 mt-2 flex items-center gap-1">
            <Activity size={12} className="text-amber-400 shrink-0" />
            <span>Quantas visitas o site recebeu no total</span>
          </p>
        </div>

        {/* Card 2: Visitantes únicos */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#121424] to-[#0c0d16] p-5 border border-cyan-500/30 shadow-xl">
          <div className="flex items-center justify-between text-cyan-400 mb-2">
            <span className="text-xs font-mono font-black uppercase tracking-wider text-cyan-400/90">
              Visitantes Únicos
            </span>
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
              <Users size={18} />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-cyan-300 mt-1">
            {summary.uniqueVisitors.toLocaleString('pt-BR')}
          </div>
          <p className="text-[11px] text-white/60 mt-2 flex items-center gap-1">
            <ShieldCheck size={12} className="text-cyan-400 shrink-0" />
            <span>Estimativa de pessoas diferentes que entraram</span>
          </p>
        </div>

        {/* Card 3: Acessos hoje */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#121424] to-[#0c0d16] p-5 border border-emerald-500/30 shadow-xl">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-xs font-mono font-black uppercase tracking-wider text-emerald-400/90">
              Acessos Hoje
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Calendar size={18} />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-emerald-300 mt-1">
            {summary.todayVisits.toLocaleString('pt-BR')}
          </div>
          <p className="text-[11px] text-white/60 mt-2 flex items-center gap-1">
            <TrendingUp size={12} className="text-emerald-400 shrink-0" />
            <span>Visitas ocorridas no dia atual ({summary.todayDate.split('-').reverse().join('/')})</span>
          </p>
        </div>
      </div>

      {/* Origem dos Acessos */}
      <div className="bg-[#10121d] p-5 rounded-2xl border border-white/10 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Globe size={18} className="text-amber-400" />
              Origem dos Acessos
            </h3>
            <p className="text-xs text-white/60 mt-0.5">
              Identificação técnica automática da procedência dos visitantes.
            </p>
          </div>
          <span className="text-[11px] font-mono text-white/50 bg-black/40 px-3 py-1 rounded-full border border-white/5">
            Tráfego do Link Oficial & Campanhas
          </span>
        </div>

        {/* Barra de Progresso Horizontal Proporcional */}
        <div className="w-full h-3.5 bg-neutral-900 rounded-full overflow-hidden flex p-0.5 border border-white/10 mb-4">
          <div 
            style={{ width: `${Math.max(originTotals.fbPct, originTotals.fb > 0 ? 3 : 0)}%` }} 
            className="h-full bg-blue-500 rounded-l-full transition-all duration-500" 
            title={`Facebook: ${originTotals.fb} (${originTotals.fbPct}%)`}
          />
          <div 
            style={{ width: `${Math.max(originTotals.outrasPct, originTotals.outras > 0 ? 3 : 0)}%` }} 
            className="h-full bg-emerald-500 transition-all duration-500" 
            title={`Outras Origens: ${originTotals.outras} (${originTotals.outrasPct}%)`}
          />
          <div 
            style={{ width: `${Math.max(originTotals.diretoPct, originTotals.direto > 0 ? 3 : 0)}%` }} 
            className="h-full bg-slate-500 rounded-r-full transition-all duration-500" 
            title={`Origem não identificada / Direto: ${originTotals.direto} (${originTotals.diretoPct}%)`}
          />
        </div>

        {/* 3 Blocos de Origens */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Facebook */}
          <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-3.5 h-3.5 rounded-full bg-blue-500 shrink-0" />
              <div>
                <span className="text-xs font-bold text-white block">Facebook</span>
                <span className="text-[10px] text-white/50">Divulgações & Anúncios</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-black font-mono text-blue-400 block leading-tight">
                {originTotals.fb.toLocaleString('pt-BR')}
              </span>
              <span className="text-[10px] font-mono text-white/60">
                {originTotals.fbPct}%
              </span>
            </div>
          </div>

          {/* Outras Origens */}
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shrink-0" />
              <div>
                <span className="text-xs font-bold text-white block">Outras Origens</span>
                <span className="text-[10px] text-white/50">Instagram, Whats, Google</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-black font-mono text-emerald-400 block leading-tight">
                {originTotals.outras.toLocaleString('pt-BR')}
              </span>
              <span className="text-[10px] font-mono text-white/60">
                {originTotals.outrasPct}%
              </span>
            </div>
          </div>

          {/* Origem não identificada */}
          <div className="p-3.5 rounded-xl bg-slate-500/10 border border-slate-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-3.5 h-3.5 rounded-full bg-slate-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-white block">Não Identificada / Direto</span>
                <span className="text-[10px] text-white/50">Digitou URL ou Sem Referrer</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-black font-mono text-slate-300 block leading-tight">
                {originTotals.direto.toLocaleString('pt-BR')}
              </span>
              <span className="text-[10px] font-mono text-white/60">
                {originTotals.diretoPct}%
              </span>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-white/50 mt-3 italic">
          * O endereço oficial continuará funcionando nas divulgações normais e nos anúncios do Facebook sem necessidade de criar links alternativos.
        </p>
      </div>

      {/* Gráfico de Acessos por Dia */}
      <div className="bg-[#10121d] p-5 rounded-2xl border border-white/10 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-400" />
              Gráfico de Acessos por Dia
            </h3>
            <p className="text-xs text-white/60 mt-0.5">
              Evolução diária de visitas e visitantes únicos registrados.
            </p>
          </div>

          {/* Seletor de Período */}
          <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/10 text-xs font-mono font-bold">
            <button
              type="button"
              onClick={() => setDaysRange(7)}
              className={`px-3 py-1 rounded-lg transition-all ${
                daysRange === 7 
                  ? 'bg-amber-500 text-black shadow-md' 
                  : 'text-white/70 hover:text-white'
              }`}
            >
              7 Dias
            </button>
            <button
              type="button"
              onClick={() => setDaysRange(14)}
              className={`px-3 py-1 rounded-lg transition-all ${
                daysRange === 14 
                  ? 'bg-amber-500 text-black shadow-md' 
                  : 'text-white/70 hover:text-white'
              }`}
            >
              14 Dias
            </button>
            <button
              type="button"
              onClick={() => setDaysRange(30)}
              className={`px-3 py-1 rounded-lg transition-all ${
                daysRange === 30 
                  ? 'bg-amber-500 text-black shadow-md' 
                  : 'text-white/70 hover:text-white'
              }`}
            >
              30 Dias
            </button>
          </div>
        </div>

        {/* Visualizador do Gráfico de Barras SVG Interativo */}
        <div className="relative w-full h-56 sm:h-64 bg-black/40 rounded-xl p-4 border border-white/5 flex flex-col justify-end">
          {dailyRecords.length === 0 ? (
            <div className="flex items-center justify-center h-full text-white/50 text-xs font-mono">
              Coletando dados diários...
            </div>
          ) : (
            <>
              {/* Linhas de Grade de Fundo */}
              <div className="absolute inset-x-4 top-4 bottom-8 flex flex-col justify-between pointer-events-none opacity-20">
                <div className="border-b border-white/30 w-full" />
                <div className="border-b border-white/30 w-full" />
                <div className="border-b border-white/30 w-full" />
              </div>

              {/* Colunas do Gráfico */}
              <div className="relative z-10 flex items-end justify-between gap-1 sm:gap-2 h-44 pb-1">
                {dailyRecords.map((item, idx) => {
                  const barHeightPct = Math.min(100, Math.max(8, (item.visits / maxDayVisits) * 100));
                  const isHovered = hoveredDay?.date === item.date;

                  return (
                    <div 
                      key={item.date} 
                      className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                      onMouseEnter={() => setHoveredDay(item)}
                      onMouseLeave={() => setHoveredDay(null)}
                    >
                      {/* Valor em cima da barra */}
                      <span className={`text-[9px] font-mono font-bold mb-1 transition-opacity ${
                        isHovered || item.visits > 0 ? 'opacity-100 text-amber-300' : 'opacity-0'
                      }`}>
                        {item.visits}
                      </span>

                      {/* Barra */}
                      <div 
                        style={{ height: `${barHeightPct}%` }}
                        className={`w-full max-w-[28px] rounded-t-md transition-all duration-300 ${
                          isHovered 
                            ? 'bg-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.6)]' 
                            : item.visits > 0 
                              ? 'bg-gradient-to-t from-amber-600 to-amber-400 hover:brightness-110' 
                              : 'bg-white/10'
                        }`}
                      />

                      {/* Label da data */}
                      <span className={`text-[9px] font-mono mt-2 transition-colors ${
                        isHovered ? 'text-amber-300 font-bold' : 'text-white/50'
                      }`}>
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Tooltip flutuante ao passar o mouse */}
              {hoveredDay && (
                <div className="absolute top-3 right-3 z-20 bg-[#181a29]/95 backdrop-blur-md p-3 rounded-xl border border-amber-500/40 shadow-2xl text-xs font-mono space-y-1 animate-fadeIn pointer-events-none">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5 border-b border-white/10 pb-1">
                    <Calendar size={12} />
                    <span>{hoveredDay.label} ({hoveredDay.dayOfWeek}) - {hoveredDay.date}</span>
                  </div>
                  <div className="flex justify-between gap-4 text-white">
                    <span className="text-white/70">Acessos totais:</span>
                    <strong className="text-emerald-400">{hoveredDay.visits}</strong>
                  </div>
                  <div className="flex justify-between gap-4 text-white">
                    <span className="text-white/70">Visitantes únicos:</span>
                    <strong className="text-cyan-400">{hoveredDay.unique}</strong>
                  </div>
                  <div className="flex justify-between gap-4 text-white text-[10px] text-white/50 pt-1 border-t border-white/5">
                    <span>FB: {hoveredDay.origins?.facebook || 0}</span>
                    <span>Outros: {hoveredDay.origins?.outras || 0}</span>
                    <span>Direto: {hoveredDay.origins?.direto_nao_identificada || 0}</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* SEÇÃO SOLICITADA: ACESSOS E CLIQUES POR CLIENTE / ANUNCIANTE */}
      <div className="bg-[#10121d] p-5 rounded-2xl border border-white/10 shadow-lg">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <MousePointerClick size={18} className="text-amber-400" />
              Acessos e Cliques por Cliente / Anunciante
            </h3>
            <p className="text-xs text-white/60 mt-0.5">
              Visualize exatamente quantas pessoas viram cada empresa e quantas clicaram no WhatsApp.
            </p>
          </div>

          {/* Filtro e Ordenação */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full lg:w-auto">
            {/* Input de Busca */}
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input 
                type="text"
                placeholder="Buscar empresa ou nicho..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white placeholder-white/40 focus:border-amber-400 focus:outline-none"
              />
            </div>

            {/* Ordenação */}
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-black/50 border border-white/10 text-xs font-mono text-white/90 focus:border-amber-400 focus:outline-none cursor-pointer"
            >
              <option value="clicks">Mais Clicados (Total)</option>
              <option value="whatsapp">Mais Cliques no WhatsApp</option>
              <option value="views">Mais Visualizados</option>
            </select>
          </div>
        </div>

        {/* Resumo rápido do total de clientes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
            <span className="text-xs text-white/60">Empresas Monitoradas:</span>
            <span className="text-sm font-mono font-bold text-white">{companyStats.length}</span>
          </div>
          <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
            <span className="text-xs text-white/60">Cliques Totais no WhatsApp:</span>
            <span className="text-sm font-mono font-bold text-emerald-400">
              {companyTotals.clicksWhatsapp.toLocaleString('pt-BR')}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
            <span className="text-xs text-white/60">Total de Interações Geradas:</span>
            <span className="text-sm font-mono font-bold text-amber-400">
              {companyTotals.clicksTotal.toLocaleString('pt-BR')}
            </span>
          </div>
        </div>

        {/* Tabela de Empresas */}
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#171927] text-white/70 font-mono uppercase text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Empresa / Anunciante</th>
                <th className="py-3 px-3">Categoria</th>
                <th className="py-3 px-3 text-right">Acessos / Views</th>
                <th className="py-3 px-3 text-right">Cliques WhatsApp</th>
                <th className="py-3 px-3 text-right">Outros Cliques</th>
                <th className="py-3 px-3 text-right">Total de Cliques</th>
                <th className="py-3 px-4 text-center">Status / Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-black/20">
              {filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-white/50 text-xs font-mono">
                    Nenhuma empresa encontrada para o filtro "{searchFilter}".
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((c, i) => {
                  const hasClicks = c.clicksTotal > 0;
                  const isTop = i < 3 && hasClicks;

                  return (
                    <tr 
                      key={c.id} 
                      className={`hover:bg-white/[0.04] transition-colors ${
                        isTop ? 'bg-amber-500/[0.03]' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                        {isTop && (
                          <span className="text-amber-400" title="Destaque em cliques">
                            ★
                          </span>
                        )}
                        <span>{c.name}</span>
                      </td>

                      <td className="py-3 px-3 text-white/70">
                        <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono">
                          {c.category}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-white/90">
                        {c.views.toLocaleString('pt-BR')}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-black text-emerald-400">
                        {c.clicksWhatsapp.toLocaleString('pt-BR')}
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-white/60">
                        {c.clicksOther.toLocaleString('pt-BR')}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-black text-amber-300">
                        <span className={`px-2 py-0.5 rounded-md ${
                          hasClicks ? 'bg-amber-500/20 border border-amber-500/30' : 'text-white/40'
                        }`}>
                          {c.clicksTotal.toLocaleString('pt-BR')}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center font-mono text-[10px]">
                        {c.lastAction ? (
                          <span className="text-emerald-400/90 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            {c.lastAction === 'whatsapp' ? 'WhatsApp Clicado' : 'Interagiu'}
                          </span>
                        ) : (
                          <span className="text-white/40">Aguardando</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
