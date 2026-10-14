import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  Calendar, 
  Search, 
  ArrowUpDown, 
  ExternalLink, 
  Clock, 
  Download, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  ChevronRight,
  Store,
  RefreshCw
} from 'lucide-react';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  CompanyAnalyticsData, 
  calculateCompanyStatsForPeriod, 
  ACTIVATION_DATE_LABEL,
  getTodayDateKey,
  getDateKeysForPeriod
} from '../lib/companyAnalytics';
import { WhatsAppIcon } from './SocialMediaIcons';

interface AdminCompanyAnalyticsPanelProps {
  companies: any[];
  advertisers?: any[];
}

export const AdminCompanyAnalyticsPanel: React.FC<AdminCompanyAnalyticsPanelProps> = ({
  companies = [],
  advertisers = []
}) => {
  const [period, setPeriod] = useState<'today' | '7days' | '30days' | 'all'>('7days');
  const [searchFilter, setSearchFilter] = useState('');
  const [sortBy, setSortBy] = useState<'whatsapp' | 'views' | 'name'>('whatsapp');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [analyticsMap, setAnalyticsMap] = useState<Record<string, CompanyAnalyticsData>>({});
  const [portalVisits, setPortalVisits] = useState<{ totalVisits: number; daily: Record<string, number> }>({
    totalVisits: 0,
    daily: {}
  });
  const [isLoading, setIsLoading] = useState(true);

  // Subscribe to real-time company analytics collection in Firestore
  useEffect(() => {
    setIsLoading(true);
    const unsubCompanies = onSnapshot(collection(db, 'company_analytics'), (snapshot) => {
      const map: Record<string, CompanyAnalyticsData> = {};
      snapshot.forEach(docSnap => {
        const data = docSnap.data() as any;
        map[docSnap.id] = {
          companyId: docSnap.id,
          companyName: data.companyName || docSnap.id,
          totalProfileViews: data.totalProfileViews || 0,
          totalWhatsAppClicks: data.totalWhatsAppClicks || 0,
          totalOtherClicks: data.totalOtherClicks || 0,
          firstTrackedAt: data.firstTrackedAt || '',
          lastEventAt: data.lastEventAt || '',
          daily: data.daily || {}
        };
      });
      setAnalyticsMap(map);
      setIsLoading(false);
    }, (err) => {
      console.warn("Analytics onSnapshot error:", err);
      setIsLoading(false);
    });

    // Also get general portal visits
    const unsubPortal = onSnapshot(doc(db, 'portal_stats', 'general'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPortalVisits({
          totalVisits: data.totalVisits || 0,
          daily: data.daily || {}
        });
      }
    }, () => {});

    return () => {
      unsubCompanies();
      unsubPortal();
    };
  }, []);

  // Merge registered companies from portal with advertisers
  const allPortalCompanies = useMemo(() => {
    const list: any[] = [];
    const seen = new Set<string>();

    companies.forEach(c => {
      const id = String(c.id ?? c.name).trim();
      if (!seen.has(id)) {
        seen.add(id);
        list.push(c);
      }
    });

    advertisers.forEach(adv => {
      const id = String(adv.id ?? adv.username ?? adv.companyName).trim();
      if (!seen.has(id)) {
        seen.add(id);
        list.push({
          id,
          name: adv.companyName || adv.username,
          category: adv.category || 'Anunciante',
          logo: adv.logo || '',
          wa: adv.whatsapp || adv.wa || ''
        });
      }
    });

    return list;
  }, [companies, advertisers]);

  // Total portal visits in the selected period
  const periodPortalVisits = useMemo(() => {
    if (period === 'all') return portalVisits.totalVisits || 0;
    const validDates = new Set(getDateKeysForPeriod(period));
    let sum = 0;
    Object.entries(portalVisits.daily || {}).forEach(([dKey, count]) => {
      if (validDates.has(dKey)) sum += Number(count || 0);
    });
    return sum;
  }, [portalVisits, period]);

  // Calculate aggregated metrics across all companies
  const aggregatedStats = useMemo(() => {
    let totalViews = 0;
    let totalWhatsApp = 0;
    let totalOther = 0;

    Object.values(analyticsMap).forEach(item => {
      const periodStat = calculateCompanyStatsForPeriod(item, period);
      totalViews += periodStat.profileViews;
      totalWhatsApp += periodStat.whatsappClicks;
      totalOther += periodStat.otherClicks;
    });

    return { totalViews, totalWhatsApp, totalOther };
  }, [analyticsMap, period]);

  // Combined list of companies with their specific period stats
  const processedCompanies = useMemo(() => {
    return allPortalCompanies.map(c => {
      const cId = String(c.id ?? c.name).trim();
      const rawData = analyticsMap[cId];
      const periodStat = calculateCompanyStatsForPeriod(rawData, period);

      return {
        id: cId,
        rawCompany: c,
        name: c.name || 'Empresa sem nome',
        category: c.category || 'Geral',
        logo: c.logo || '',
        wa: c.wa || c.whatsapp || c.phone || '',
        views: periodStat.profileViews,
        whatsappClicks: periodStat.whatsappClicks,
        otherClicks: periodStat.otherClicks,
        totalEvents: periodStat.profileViews + periodStat.whatsappClicks + periodStat.otherClicks,
        lastEventAt: rawData?.lastEventAt || null
      };
    });
  }, [allPortalCompanies, analyticsMap, period]);

  // Filter and sort companies list
  const filteredCompanies = useMemo(() => {
    let list = processedCompanies;

    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase().trim();
      list = list.filter(item => 
        item.name.toLowerCase().includes(q) || 
        item.category.toLowerCase().includes(q)
      );
    }

    list = [...list].sort((a, b) => {
      let valA: any = a.whatsappClicks;
      let valB: any = b.whatsappClicks;

      if (sortBy === 'views') {
        valA = a.views;
        valB = b.views;
      } else if (sortBy === 'name') {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      }

      if (sortOrder === 'desc') {
        return valA < valB ? 1 : valA > valB ? -1 : 0;
      }
      return valA > valB ? 1 : valA < valB ? -1 : 0;
    });

    return list;
  }, [processedCompanies, searchFilter, sortBy, sortOrder]);

  // Selected company detailed modal / view
  const selectedCompanyDetail = useMemo(() => {
    if (!selectedCompanyId) return null;
    return processedCompanies.find(c => c.id === selectedCompanyId) || null;
  }, [selectedCompanyId, processedCompanies]);

  return (
    <div className="space-y-6 text-white font-sans">
      {/* Top Banner Notice - Transparency & Activation */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-[#1a1c2e] to-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
              Desempenho Real & Estatísticas dos Anunciantes
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold">
                100% Automático
              </span>
            </h3>
            <p className="text-xs text-white/70 mt-0.5 leading-relaxed">
              Métricas reais coletadas diretamente no banco de dados. Medição oficial ativada em <strong className="text-amber-300 font-mono">{ACTIVATION_DATE_LABEL}</strong>.
            </p>
          </div>
        </div>

        {/* Filter Period Buttons */}
        <div className="flex items-center gap-1.5 bg-black/60 p-1 rounded-xl border border-white/10 shrink-0">
          {(['today', '7days', '30days', 'all'] as const).map(p => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                period === p 
                  ? 'bg-amber-500 text-black shadow-md' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {p === 'today' ? 'Hoje' : p === '7days' ? 'Últimos 7 dias' : p === '30days' ? 'Últimos 30 dias' : 'Todo o Período'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Visitas ao Portal */}
        <div className="p-4 rounded-2xl bg-[#111422] border border-white/10 relative overflow-hidden shadow-lg group hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between text-white/60 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Visitas no Portal</span>
            <Eye className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {periodPortalVisits.toLocaleString('pt-BR')}
          </div>
          <span className="text-[11px] text-white/50 block mt-1">
            Visualizações da página inicial no período
          </span>
        </div>

        {/* Card 2: Perfis de Empresas Abertos */}
        <div className="p-4 rounded-2xl bg-[#111422] border border-white/10 relative overflow-hidden shadow-lg group hover:border-blue-500/40 transition">
          <div className="flex items-center justify-between text-white/60 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Perfis & Mini-Sites Abertos</span>
            <Store className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-400 font-mono">
            {aggregatedStats.totalViews.toLocaleString('pt-BR')}
          </div>
          <span className="text-[11px] text-white/50 block mt-1">
            Aberturas de páginas de empresas
          </span>
        </div>

        {/* Card 3: Cliques de WhatsApp */}
        <div className="p-4 rounded-2xl bg-[#111422] border border-white/10 relative overflow-hidden shadow-lg group hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between text-white/60 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Cliques para WhatsApp</span>
            <WhatsAppIcon className="w-4 h-4 fill-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
            {aggregatedStats.totalWhatsApp.toLocaleString('pt-BR')}
          </div>
          <span className="text-[11px] text-white/50 block mt-1">
            Contatos diretos iniciados no WhatsApp
          </span>
        </div>

        {/* Card 4: Empresas Monitoradas */}
        <div className="p-4 rounded-2xl bg-[#111422] border border-white/10 relative overflow-hidden shadow-lg group hover:border-purple-500/40 transition">
          <div className="flex items-center justify-between text-white/60 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Empresas Monitoradas</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-400 font-mono">
            {allPortalCompanies.length}
          </div>
          <span className="text-[11px] text-white/50 block mt-1">
            Todas empresas ativas no sistema
          </span>
        </div>
      </div>

      {/* Main Table: Companies Ranking and Search */}
      <div className="bg-[#111422] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        {/* Table Controls Bar */}
        <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input 
              type="text"
              placeholder="Buscar empresa por nome ou categoria..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs text-white/50">Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-black/40 border border-white/10 text-xs text-white rounded-xl px-3 py-1.5 focus:outline-none focus:border-amber-400"
            >
              <option value="whatsapp">Mais Cliques de WhatsApp 💬</option>
              <option value="views">Mais Visualizações de Perfil 👁️</option>
              <option value="name">Ordem Alfabética (A-Z)</option>
            </select>
            <button
              type="button"
              onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="p-1.5 rounded-lg bg-black/40 border border-white/10 text-white/70 hover:text-white"
              title="Alternar ordem ascendente / descendente"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/40 text-white/50 font-bold uppercase tracking-wider text-[10px] border-b border-white/5">
              <tr>
                <th className="py-3 px-4"># Pos</th>
                <th className="py-3 px-4">Empresa Anunciante</th>
                <th className="py-3 px-4 text-center">Perfis Abertos</th>
                <th className="py-3 px-4 text-center">Cliques WhatsApp</th>
                <th className="py-3 px-4 text-center">Outros Cliques</th>
                <th className="py-3 px-4 text-center">Último Evento</th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-white/50">
                    Nenhuma empresa encontrada com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((comp, idx) => (
                  <tr 
                    key={comp.id}
                    className="hover:bg-white/[0.02] transition cursor-pointer"
                    onClick={() => setSelectedCompanyId(comp.id)}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-amber-400/90">
                      #{idx + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        {comp.logo ? (
                          <img src={comp.logo} alt="" className="w-7 h-7 rounded-full object-cover shrink-0 bg-black" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-[10px] shrink-0">
                            {comp.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="font-bold text-white block truncate">{comp.name}</span>
                          <span className="text-[10px] text-white/50 block truncate">{comp.category}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-blue-400">
                      {comp.views}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-emerald-400">
                      {comp.whatsappClicks}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-white/70">
                      {comp.otherClicks}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-[10px] text-white/50">
                      {comp.lastEventAt ? new Date(comp.lastEventAt).toLocaleDateString('pt-BR') : 'Aguardando'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCompanyId(comp.id);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-bold inline-flex items-center gap-1 transition"
                      >
                        <span>Ver Relatório</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal / Card de Detalhamento Individual do Anunciante */}
      {selectedCompanyDetail && (
        <div 
          className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
          onClick={() => setSelectedCompanyId(null)}
        >
          <div 
            className="w-full max-w-lg bg-[#111422] border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                {selectedCompanyDetail.logo ? (
                  <img src={selectedCompanyDetail.logo} alt="" className="w-12 h-12 rounded-full object-cover shrink-0 border border-white/20" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-sm shrink-0">
                    {selectedCompanyDetail.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 className="text-base font-black text-white">{selectedCompanyDetail.name}</h4>
                  <p className="text-xs text-white/50">{selectedCompanyDetail.category}</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedCompanyId(null)} 
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Individual Metrics Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                <span className="text-[11px] text-white/60 block uppercase font-bold">Visualizações do Perfil</span>
                <span className="text-2xl font-black text-blue-400 font-mono mt-1 block">
                  {selectedCompanyDetail.views}
                </span>
                <span className="text-[10px] text-white/40 block mt-1">Período selecionado</span>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                <span className="text-[11px] text-white/60 block uppercase font-bold">Contatos no WhatsApp</span>
                <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
                  {selectedCompanyDetail.whatsappClicks}
                </span>
                <span className="text-[10px] text-white/40 block mt-1">Cliques no botão direto</span>
              </div>
            </div>

            {/* Explanatory Report Notice */}
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white/70 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Estatísticas Reais Auditadas</span>
              </div>
              <p className="text-[11px] text-white/60">
                Estes dados vêm de eventos gerados por visitantes únicos no portal Minha Divulgação. Você pode compartilhar este relatório com o anunciante como comprovação de alcance.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  const text = `📊 *Relatório de Desempenho - Minha Divulgação*\nEmpresa: *${selectedCompanyDetail.name}*\nPeríodo: ${period === 'today' ? 'Hoje' : period === '7days' ? 'Últimos 7 dias' : period === '30days' ? 'Últimos 30 dias' : 'Todo o Período'}\n\n👁️ Visualizações do perfil: ${selectedCompanyDetail.views}\n💬 Contatos para WhatsApp: ${selectedCompanyDetail.whatsappClicks}\n\n_Dados reais registrados pelo portal Minha Divulgação._`;
                  navigator.clipboard.writeText(text);
                  alert("Relatório copiado para a área de transferência! Você pode colar no WhatsApp do anunciante.");
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-extrabold text-xs uppercase tracking-wide flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:brightness-105"
              >
                <FileText className="w-4 h-4" />
                <span>Copiar Relatório para Enviar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
