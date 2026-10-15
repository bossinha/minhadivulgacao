import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  MousePointerClick, 
  Calendar, 
  Download, 
  Filter, 
  RefreshCw, 
  ExternalLink, 
  HelpCircle,
  Award,
  Globe,
  Share2,
  Smartphone,
  ChevronDown,
  ShieldCheck
} from 'lucide-react';
import { 
  getTodayKey, 
  getDateRangeKeys, 
  fetchPortalStatsForDates, 
  fetchAdvertiserStatsForDates,
  calculateCTR, 
  exportToCSV,
  PortalDailyStats, 
  AdvertiserDailyStats 
} from '../lib/analytics';

interface AdminPortalAnalyticsProps {
  companies: any[];
  adminEmail?: string;
  onRefresh?: () => void;
}

type PeriodFilter = 'today' | '7days' | '30days' | 'custom';

export const AdminPortalAnalytics: React.FC<AdminPortalAnalyticsProps> = ({
  companies,
  adminEmail,
  onRefresh
}) => {
  const [filter, setFilter] = useState<PeriodFilter>('7days');
  const [customStartDate, setCustomStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 14);
    return d.toISOString().split('T')[0];
  });
  const [customEndDate, setCustomEndDate] = useState<string>(() => getTodayKey());

  const [loading, setLoading] = useState(true);
  const [portalDailyStats, setPortalDailyStats] = useState<PortalDailyStats[]>([]);
  const [advertiserDailyStats, setAdvertiserDailyStats] = useState<AdvertiserDailyStats[]>([]);
  const [showMethodologyModal, setShowMethodologyModal] = useState(false);
  const [tableSortBy, setTableSortBy] = useState<'clicks' | 'impressions' | 'ctr' | 'name'>('clicks');

  // Compute active date keys based on chosen period filter
  const activeDateKeys = useMemo(() => {
    if (filter === 'today') {
      return [getTodayKey()];
    } else if (filter === '7days') {
      return getDateRangeKeys(7);
    } else if (filter === '30days') {
      return getDateRangeKeys(30);
    } else {
      // Custom range
      const keys: string[] = [];
      try {
        const start = new Date(customStartDate + 'T00:00:00');
        const end = new Date(customEndDate + 'T23:59:59');
        if (start <= end) {
          const curr = new Date(start);
          while (curr <= end) {
            const year = curr.getFullYear();
            const month = String(curr.getMonth() + 1).padStart(2, '0');
            const day = String(curr.getDate()).padStart(2, '0');
            keys.push(`${year}-${month}-${day}`);
            curr.setDate(curr.getDate() + 1);
          }
        }
      } catch {}
      return keys.length > 0 ? keys : [getTodayKey()];
    }
  }, [filter, customStartDate, customEndDate]);

  // Load analytics data from Firestore and local caches
  const loadData = async () => {
    setLoading(true);
    try {
      const [pStats, aStats] = await Promise.all([
        fetchPortalStatsForDates(activeDateKeys),
        fetchAdvertiserStatsForDates(activeDateKeys)
      ]);
      setPortalDailyStats(pStats);
      setAdvertiserDailyStats(aStats);
    } catch (err) {
      console.warn('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeDateKeys]);

  // Summary Metrics Calculation
  const metrics = useMemo(() => {
    // 1. Portal totals
    let totalViews = 0;
    let totalSessions = 0;
    let totalUniqueEstimate = 0;
    const sourcesSummary = {
      direct: 0,
      google: 0,
      facebook: 0,
      instagram: 0,
      whatsapp: 0,
      referral: 0,
      unknown: 0
    };
    const topPagesMap: Record<string, number> = {};

    portalDailyStats.forEach(day => {
      totalViews += day.views || 0;
      totalSessions += day.sessions || 0;
      totalUniqueEstimate += day.uniqueVisitorsEstimate || 0;

      if (day.sources) {
        sourcesSummary.direct += day.sources.direct || 0;
        sourcesSummary.google += day.sources.google || 0;
        sourcesSummary.facebook += day.sources.facebook || 0;
        sourcesSummary.instagram += day.sources.instagram || 0;
        sourcesSummary.whatsapp += day.sources.whatsapp || 0;
        sourcesSummary.referral += day.sources.referral || 0;
        sourcesSummary.unknown += day.sources.unknown || 0;
      }

      if (day.topPages) {
        Object.entries(day.topPages).forEach(([page, count]) => {
          topPagesMap[page] = (topPagesMap[page] || 0) + Number(count || 0);
        });
      }
    });

    // Fallback: If sessions is zero, estimate based on pageviews (industry baseline 1 session ~ 1.8 views)
    const estimatedSessions = totalSessions > 0 ? totalSessions : Math.ceil(totalViews / 1.8);
    const estimatedUnique = totalUniqueEstimate > 0 ? totalUniqueEstimate : Math.ceil(estimatedSessions * 0.85);

    // Today's views specifically
    const todayKey = getTodayKey();
    const todayStat = portalDailyStats.find(d => d.date === todayKey);
    const todayViews = todayStat ? todayStat.views : 0;

    // 2. Advertisers aggregated
    let totalCardClicks = 0;
    let totalContactClicks = 0;
    let totalImpressions = 0;

    const companyMetricsMap = new Map<string, {
      companyId: string;
      companyName: string;
      impressions: number;
      cardClicks: number;
      contactClicks: number;
      whatsappClicks: number;
      websiteClicks: number;
      catalogClicks: number;
      phoneClicks: number;
    }>();

    // Initialize with companies passed in props so none are missing
    companies.forEach(c => {
      const cId = String(c.id);
      companyMetricsMap.set(cId, {
        companyId: cId,
        companyName: c.name || 'Anunciante',
        impressions: 0,
        cardClicks: 0,
        contactClicks: 0,
        whatsappClicks: 0,
        websiteClicks: 0,
        catalogClicks: 0,
        phoneClicks: 0
      });
    });

    // Accumulate metrics from DB
    advertiserDailyStats.forEach(stat => {
      const cId = String(stat.companyId);
      let entry = companyMetricsMap.get(cId);
      if (!entry) {
        entry = {
          companyId: cId,
          companyName: stat.companyName || 'Anunciante',
          impressions: 0,
          cardClicks: 0,
          contactClicks: 0,
          whatsappClicks: 0,
          websiteClicks: 0,
          catalogClicks: 0,
          phoneClicks: 0
        };
        companyMetricsMap.set(cId, entry);
      }

      entry.impressions += stat.impressions || 0;
      entry.cardClicks += stat.cardClicks || 0;
      entry.contactClicks += stat.contactClicks || 0;
      entry.whatsappClicks += stat.whatsappClicks || 0;
      entry.websiteClicks += stat.websiteClicks || 0;
      entry.catalogClicks += stat.catalogClicks || 0;
      entry.phoneClicks += stat.phoneClicks || 0;

      totalImpressions += stat.impressions || 0;
      totalCardClicks += stat.cardClicks || 0;
      totalContactClicks += stat.contactClicks || 0;
    });

    const companyList = Array.from(companyMetricsMap.values()).map(comp => {
      const ctr = calculateCTR(comp.cardClicks, comp.impressions);
      return {
        ...comp,
        ctr,
        totalClicks: comp.cardClicks + comp.contactClicks
      };
    });

    // Top clicked advertiser in period
    let topAdvertiser: typeof companyList[0] | null = null;
    companyList.forEach(c => {
      if (!topAdvertiser || c.totalClicks > topAdvertiser.totalClicks) {
        if (c.totalClicks > 0) topAdvertiser = c;
      }
    });

    return {
      totalViews,
      estimatedSessions,
      estimatedUnique,
      todayViews,
      totalCardClicks,
      totalContactClicks,
      totalAdvertiserClicks: totalCardClicks + totalContactClicks,
      totalImpressions,
      topAdvertiser,
      sourcesSummary,
      topPagesMap,
      companyList
    };
  }, [portalDailyStats, advertiserDailyStats, companies]);

  // Sort advertiser table
  const sortedCompanies = useMemo(() => {
    return [...metrics.companyList].sort((a, b) => {
      if (tableSortBy === 'clicks') return b.totalClicks - a.totalClicks;
      if (tableSortBy === 'impressions') return b.impressions - a.impressions;
      if (tableSortBy === 'ctr') return b.ctr - a.ctr;
      return a.companyName.localeCompare(b.companyName);
    });
  }, [metrics.companyList, tableSortBy]);

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      'Anunciante',
      'ID',
      'Impressões Válidas',
      'Cliques no Card',
      'Cliques no Contato',
      'Cliques WhatsApp',
      'Cliques Site/Catálogo',
      'Taxa de Cliques (CTR %)',
      'Período'
    ];

    const periodLabel = filter === 'today' 
      ? 'Hoje' 
      : filter === '7days' 
      ? 'Últimos 7 dias' 
      : filter === '30days' 
      ? 'Últimos 30 dias' 
      : `${customStartDate} até ${customEndDate}`;

    const rows = sortedCompanies.map(c => [
      c.companyName,
      c.companyId,
      c.impressions,
      c.cardClicks,
      c.contactClicks,
      c.whatsappClicks,
      c.websiteClicks + c.catalogClicks,
      `${c.ctr.toFixed(1)}%`,
      periodLabel
    ]);

    exportToCSV(`estatisticas_anunciantes_${getTodayKey()}`, headers, rows);
  };

  const periodDescription = filter === 'today' 
    ? 'Dados computados de hoje' 
    : filter === '7days' 
    ? 'Dados acumulados dos últimos 7 dias' 
    : filter === '30days' 
    ? 'Dados acumulados dos últimos 30 dias' 
    : `Intervalo: ${customStartDate} a ${customEndDate}`;

  return (
    <div className="space-y-6 text-white font-sans">
      
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-[#181308] to-[#12121c] border border-amber-500/30 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="text-amber-400 w-6 h-6" />
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              Estatísticas & Desempenho do Portal
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-white/60 mt-1">
            {periodDescription} • Métricas oficiais com deduplicação e telemetria anônima LGPD
          </p>
        </div>

        {/* Filter and Actions Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex rounded-xl bg-black/50 p-1 border border-white/10">
            <button
              onClick={() => setFilter('today')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === 'today'
                  ? 'bg-amber-400 text-black shadow-md'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Hoje
            </button>
            <button
              onClick={() => setFilter('7days')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === '7days'
                  ? 'bg-amber-400 text-black shadow-md'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              7 Dias
            </button>
            <button
              onClick={() => setFilter('30days')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === '30days'
                  ? 'bg-amber-400 text-black shadow-md'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              30 Dias
            </button>
            <button
              onClick={() => setFilter('custom')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === 'custom'
                  ? 'bg-amber-400 text-black shadow-md'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Personalizado
            </button>
          </div>

          <button
            onClick={loadData}
            title="Atualizar dados agora"
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 transition-colors"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-amber-400' : ''} />
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-extrabold shadow-md transition-all active:scale-95"
          >
            <Download size={14} />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={() => setShowMethodologyModal(true)}
            className="flex items-center gap-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 px-2.5 py-2 rounded-xl text-xs font-medium"
            title="Metodologia e LGPD"
          >
            <HelpCircle size={14} />
            <span className="hidden sm:inline">Metodologia</span>
          </button>
        </div>
      </div>

      {/* Custom Date Range Inputs (when filter === 'custom') */}
      {filter === 'custom' && (
        <div className="bg-[#14141f] border border-amber-500/20 p-4 rounded-xl flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-white/60 font-bold">Data Inicial:</span>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="bg-black/60 border border-white/15 rounded-lg px-3 py-1.5 text-white font-mono"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/60 font-bold">Data Final:</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="bg-black/60 border border-white/15 rounded-lg px-3 py-1.5 text-white font-mono"
            />
          </div>
          <button
            onClick={loadData}
            className="bg-amber-400 text-black font-extrabold px-3 py-1.5 rounded-lg"
          >
            Aplicar Intervalo
          </button>
        </div>
      )}

      {/* 5 Primary Indicator Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Acessos de Hoje */}
        <div className="bg-[#11111a] border border-white/10 rounded-2xl p-4 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between text-white/50 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Acessos de Hoje</span>
            <Calendar size={15} className="text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-white">
            {metrics.todayViews.toLocaleString('pt-BR')}
          </div>
          <p className="text-[11px] text-white/40 mt-1">
            Visualizações na data de hoje
          </p>
        </div>

        {/* Card 2: Sessões no Período */}
        <div className="bg-[#11111a] border border-white/10 rounded-2xl p-4 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between text-white/50 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Sessões Estimadas</span>
            <Users size={15} className="text-sky-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-sky-400">
            {metrics.estimatedSessions.toLocaleString('pt-BR')}
          </div>
          <p className="text-[11px] text-white/40 mt-1">
            Navegações ativas identificadas
          </p>
        </div>

        {/* Card 3: Visualizações Totais no Período */}
        <div className="bg-[#11111a] border border-white/10 rounded-2xl p-4 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between text-white/50 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Visualizações Totais</span>
            <Eye size={15} className="text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
            {metrics.totalViews.toLocaleString('pt-BR')}
          </div>
          <p className="text-[11px] text-white/40 mt-1">
            Páginas e sessões no período
          </p>
        </div>

        {/* Card 4: Total de Cliques nos Anunciantes */}
        <div className="bg-[#11111a] border border-white/10 rounded-2xl p-4 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between text-white/50 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Cliques Anunciantes</span>
            <MousePointerClick size={15} className="text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-amber-300">
            {metrics.totalAdvertiserClicks.toLocaleString('pt-BR')}
          </div>
          <p className="text-[11px] text-white/40 mt-1">
            {metrics.totalContactClicks} contatos • {metrics.totalCardClicks} no card
          </p>
        </div>

        {/* Card 5: Anunciante com mais cliques */}
        <div className="bg-gradient-to-br from-[#1a1408] to-[#11111a] border border-amber-500/30 rounded-2xl p-4 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between text-amber-400/80 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Top Anunciante</span>
            <Award size={16} className="text-amber-400 animate-pulse" />
          </div>
          <div className="text-lg sm:text-xl font-black text-amber-400 truncate" title={metrics.topAdvertiser?.companyName || 'Nenhum'}>
            {metrics.topAdvertiser ? metrics.topAdvertiser.companyName : 'Nenhum no período'}
          </div>
          <p className="text-[11px] text-white/50 mt-1">
            {metrics.topAdvertiser 
              ? `${metrics.topAdvertiser.totalClicks} cliques (${metrics.topAdvertiser.whatsappClicks} WhatsApp)` 
              : 'Sem cliques registrados'}
          </p>
        </div>

      </div>

      {/* Traffic Sources Breakdown */}
      <div className="bg-[#11111a] border border-white/10 rounded-2xl p-5 shadow-lg">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-white/80 mb-3 flex items-center gap-2">
          <Globe size={16} className="text-sky-400" />
          <span>Origem dos Acessos no Período (Metodologia Auditável)</span>
        </h3>
        <p className="text-xs text-white/50 mb-4 leading-relaxed">
          Classificação baseada em referrers HTTP verificados e tags UTM. O portal só cataloga redes como Facebook ou Google quando a origem é estritamente comprovada pelo cabeçalho ou parâmetro de campanha.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
          <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl">
            <span className="text-[11px] font-bold text-white/50 uppercase block">Acesso Direto</span>
            <span className="text-lg font-black font-mono text-white mt-1 block">
              {metrics.sourcesSummary.direct}
            </span>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl">
            <span className="text-[11px] font-bold text-sky-400 uppercase block">Google</span>
            <span className="text-lg font-black font-mono text-sky-400 mt-1 block">
              {metrics.sourcesSummary.google}
            </span>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl">
            <span className="text-[11px] font-bold text-blue-400 uppercase block">Facebook</span>
            <span className="text-lg font-black font-mono text-blue-400 mt-1 block">
              {metrics.sourcesSummary.facebook}
            </span>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl">
            <span className="text-[11px] font-bold text-pink-400 uppercase block">Instagram</span>
            <span className="text-lg font-black font-mono text-pink-400 mt-1 block">
              {metrics.sourcesSummary.instagram}
            </span>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl">
            <span className="text-[11px] font-bold text-emerald-400 uppercase block">WhatsApp</span>
            <span className="text-lg font-black font-mono text-emerald-400 mt-1 block">
              {metrics.sourcesSummary.whatsapp}
            </span>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl">
            <span className="text-[11px] font-bold text-purple-400 uppercase block">Outros Sites</span>
            <span className="text-lg font-black font-mono text-purple-400 mt-1 block">
              {metrics.sourcesSummary.referral}
            </span>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl">
            <span className="text-[11px] font-bold text-white/30 uppercase block">Desconhecida</span>
            <span className="text-lg font-black font-mono text-white/60 mt-1 block">
              {metrics.sourcesSummary.unknown}
            </span>
          </div>
        </div>
      </div>

      {/* Advertisers Performance Table */}
      <div className="bg-[#11111a] border border-white/10 rounded-2xl p-5 shadow-lg overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-amber-400" />
              <span>Desempenho Individual dos Anunciantes ({sortedCompanies.length})</span>
            </h3>
            <p className="text-xs text-white/50 mt-0.5">
              Impressões válidas (50% de área por ≥ 750ms), cliques no card e botões de contato
            </p>
          </div>

          {/* Table Sort Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-white/50">Ordenar por:</span>
            <select
              value={tableSortBy}
              onChange={(e) => setTableSortBy(e.target.value as any)}
              className="bg-black/60 border border-white/15 rounded-lg px-2.5 py-1.5 text-white font-bold"
            >
              <option value="clicks">Mais Clicados</option>
              <option value="impressions">Mais Impressões</option>
              <option value="ctr">Maior CTR (%)</option>
              <option value="name">Ordem Alfabética</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-white/50 uppercase tracking-wider font-bold">
                <th className="py-3 px-3">Anunciante</th>
                <th className="py-3 px-3 text-center">Impressões Válidas</th>
                <th className="py-3 px-3 text-center">Cliques no Card</th>
                <th className="py-3 px-3 text-center">Cliques no Contato</th>
                <th className="py-3 px-3 text-center">CTR (Taxa de Cliques)</th>
                <th className="py-3 px-3 text-right">Período</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sortedCompanies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-white/40">
                    Nenhum anunciante registrado ou localizado no período selecionado.
                  </td>
                </tr>
              ) : (
                sortedCompanies.map((c, index) => {
                  return (
                    <tr 
                      key={c.companyId || index} 
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-3.5 px-3">
                        <div className="font-extrabold text-white text-sm">
                          {c.companyName}
                        </div>
                        <div className="text-[10px] text-white/40 font-mono mt-0.5">
                          ID: {c.companyId}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-center font-mono font-bold text-white/80">
                        {c.impressions.toLocaleString('pt-BR')}
                      </td>

                      <td className="py-3.5 px-3 text-center font-mono font-bold text-amber-400">
                        {c.cardClicks.toLocaleString('pt-BR')}
                      </td>

                      <td className="py-3.5 px-3 text-center font-mono">
                        <div className="font-bold text-emerald-400">
                          {c.contactClicks.toLocaleString('pt-BR')}
                        </div>
                        <div className="text-[10px] text-white/40 mt-0.5">
                          {c.whatsappClicks > 0 && `📱 ${c.whatsappClicks} WhatsApp `}
                          {(c.websiteClicks + c.catalogClicks) > 0 && `🌐 ${c.websiteClicks + c.catalogClicks} Site`}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span className={`inline-block font-mono font-extrabold text-xs px-2.5 py-1 rounded-full ${
                          c.ctr >= 5 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : c.ctr >= 2 
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                            : 'bg-white/5 text-white/60 border border-white/10'
                        }`}>
                          {c.ctr.toFixed(1)}%
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right text-[11px] text-white/40 font-mono">
                        {filter === 'today' ? 'Hoje' : filter === '7days' ? 'Últimos 7d' : filter === '30days' ? 'Últimos 30d' : 'Personalizado'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Methodology and LGPD Modal */}
      {showMethodologyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12131c] border border-amber-500/30 max-w-xl w-full rounded-2xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-emerald-400 w-5 h-5" />
                <h3 className="text-base font-extrabold text-white">
                  Metodologia das Estatísticas & Conformidade LGPD
                </h3>
              </div>
              <button 
                onClick={() => setShowMethodologyModal(false)}
                className="text-white/60 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-white/70 leading-relaxed max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <strong className="text-amber-400 block mb-1">1. Critério de Impressão Válida do Card:</strong>
                O portal não registra impressão pelo simples carregamento no HTML. É utilizado um <code>IntersectionObserver</code> configurado para disparar somente quando pelo menos 50% da área do card estiver na tela e o usuário permanecer visualizando por no mínimo 750 milissegundos. Rolações rápidas são desconsideradas.
              </div>

              <div>
                <strong className="text-amber-400 block mb-1">2. Sistema de Rodízio & Destaque:</strong>
                No carrossel ou área de destaque rotativo, cada anunciante exibido é monitorado individualmente. Quando o card muda e exibe outro anunciante, a impressão é creditada estritamente à empresa que ficou visível.
              </div>

              <div>
                <strong className="text-amber-400 block mb-1">3. Cálculo do CTR:</strong>
                <code>CTR = (Cliques no Card ÷ Impressões Válidas) × 100</code>. Mede com precisão a eficácia do criativo e do posicionamento.
              </div>

              <div>
                <strong className="text-amber-400 block mb-1">4. Proteção contra Cliques Duplicados / Acidentais:</strong>
                Cliques rápidos no mesmo botão possuem cooldown de 1,5s no cliente e deduplicação no Firestore, prevenindo contagens infladas.
              </div>

              <div>
                <strong className="text-amber-400 block mb-1">5. Identificação Pseudônima & LGPD:</strong>
                Não são coletados nomes, telefones, CPF, localização por GPS ou dados pessoais dos visitantes para fins de estatística. O visitante é identificado apenas por um token pseudônimo aleatório no <code>localStorage</code> e <code>sessionStorage</code> para distinguir sessões, garantindo conformidade com a LGPD.
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-white/10 text-right">
              <button
                onClick={() => setShowMethodologyModal(false)}
                className="bg-amber-400 hover:bg-amber-300 text-black font-extrabold px-4 py-2 rounded-xl text-xs"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
