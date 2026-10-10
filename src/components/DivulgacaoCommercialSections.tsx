import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Smartphone, 
  Star, 
  Flame, 
  Tv, 
  Radio, 
  ArrowRight, 
  Check, 
  CheckCircle2, 
  ChevronDown, 
  Sparkles, 
  ShieldCheck,
  Building2,
  Store,
  Layers,
  Utensils,
  Scissors,
  Wrench,
  Car,
  ShoppingBag,
  Stethoscope,
  Briefcase,
  Clock,
  Activity,
  TrendingUp,
  BarChart3,
  ExternalLink,
  Eye,
  Users,
  Send,
  Share2,
  Link as LinkIcon,
  Copy,
  CheckCheck,
  Play,
  Zap,
  CheckCircle
} from 'lucide-react';
import { ClientDispatchTrackerModal } from './ClientDispatchTrackerModal';

const DEFAULT_WA_LINK = `https://wa.me/5585992862177?text=${encodeURIComponent(
  "Olá! Gostaria de obter informações sobre a divulgação da minha empresa no portal Minha Divulgação.\n\nTenho interesse no plano comercial de R$ 49,90/mês. Poderia me orientar sobre o cadastro e a ativação, por gentileza?"
)}`;

// ==========================================
// SEGMENTOS DE EMPRESAS ATENDIDAS
// ==========================================
export const SegmentsShowcase: React.FC = () => {
  const segments = [
    { label: 'Lojas & Varejo', icon: Store },
    { label: 'Restaurantes & Bares', icon: Utensils },
    { label: 'Salões & Barbearias', icon: Scissors },
    { label: 'Oficinas Mecânicas', icon: Wrench },
    { label: 'Lojas de Celulares & Tech', icon: Smartphone },
    { label: 'Moda & Roupas', icon: ShoppingBag },
    { label: 'Mercados & Açougues', icon: Store },
    { label: 'Clínicas & Saúde', icon: Stethoscope },
    { label: 'Prestadores de Serviços', icon: Briefcase },
    { label: 'Autopeças & Acessórios', icon: Car },
    { label: 'Empresas em Geral', icon: Layers },
  ];

  return (
    <div className="w-full mt-8 pt-6 border-t border-white/10 select-none">
      <div className="text-center mb-3">
        <span className="text-[10px] sm:text-xs font-mono font-bold tracking-[0.2em] text-white/50 uppercase">
          Empresas atendidas em nossa rede
        </span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
        {segments.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div 
              key={idx} 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-white/80 hover:text-amber-300 hover:border-amber-500/40 text-[11px] sm:text-xs font-bold transition-all duration-200"
            >
              <Icon size={13} className="text-amber-400 shrink-0" />
              <span>{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==========================================
// 2. SEÇÃO: CRIAR DESEJO DE PARTICIPAR (ENQUANTO SUA EMPRESA NÃO APARECE...)
// ==========================================
export const OQueSuaEmpresaGanhaSection: React.FC = () => {
  const cards = [
    {
      icon: Star,
      badge: 'VISIBILIDADE',
      title: 'MAIS VISIBILIDADE',
      subtitle: 'Sua marca ganha um espaço de apresentação.',
      desc: 'Um espaço dedicado para que o público conheça o que sua empresa oferece, seus produtos e seus serviços.',
      color: 'from-amber-400/20 to-yellow-500/5 text-amber-300 border-amber-500/30'
    },
    {
      icon: Search,
      badge: 'PRESENÇA DIGITAL',
      title: 'MAIS PRESENÇA DIGITAL',
      subtitle: 'Sua empresa passa a ter mais um canal para ser encontrada.',
      desc: 'Fortaleça a presença da sua marca no ambiente digital com perfil organizado e informações sempre acessíveis.',
      color: 'from-blue-500/20 to-cyan-500/5 text-cyan-300 border-cyan-500/30'
    },
    {
      icon: Smartphone,
      badge: 'OPORTUNIDADES',
      title: 'MAIS OPORTUNIDADES',
      subtitle: 'Sua divulgação pode aproximar seu negócio de pessoas interessadas.',
      desc: 'Crie pontos de contato práticos para que quem busca seus serviços possa falar direto com você no WhatsApp.',
      color: 'from-emerald-500/20 to-emerald-500/5 text-emerald-300 border-emerald-500/30'
    }
  ];

  return (
    <section id="beneficios" className="w-full py-16 sm:py-24 bg-gradient-to-b from-black via-[#08080f] to-black border-b border-white/5 relative overflow-hidden select-none">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        
        {/* Título da Seção */}
        <div className="text-center max-w-4xl mx-auto mb-10 sm:mb-14">
          <span className="text-amber-400 text-[10px] sm:text-xs font-mono font-black tracking-[0.2em] uppercase bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full inline-block mb-3">
            VANTAGENS PARA SUA EMPRESA
          </span>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Mais visibilidade para o seu negócio
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-white/80 mt-3 leading-relaxed max-w-2xl mx-auto font-medium">
            Apresente seus produtos, ofertas e serviços em um portal moderno, conectado direto ao seu WhatsApp.
          </p>
        </div>

        {/* Grid com as 3 ideias principais destacadas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {cards.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx}
                className="bg-gradient-to-b from-[#12121d] to-[#09090f] border border-white/10 hover:border-amber-500/40 rounded-3xl p-7 flex flex-col justify-between shadow-2xl transition-all duration-300 hover:-translate-y-1 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} border flex items-center justify-center group-hover:scale-105 transition-transform`}>
                      <Icon size={26} />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-black text-white leading-snug group-hover:text-amber-300 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-amber-300 font-bold mt-2 leading-snug">
                    — {item.subtitle}
                  </p>

                  <p className="text-xs sm:text-sm text-white/70 mt-3 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-1.5 text-emerald-400 text-xs font-mono font-bold">
                  <CheckCircle2 size={14} className="shrink-0" />
                  <span>Destaque para o seu negócio</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

// ==========================================
// 3. SEÇÃO: APRESENTAR O VALOR DO PORTAL (SUA EMPRESA TEM UM LUGAR AQUI)
// ==========================================
export const ComoFuncionaSection: React.FC = () => {
  // Estado para demonstração interativa em tempo real
  const [countdown, setCountdown] = useState<number>(268); // ~4m 28s para próximo disparo
  const [currentGroupIdx, setCurrentGroupIdx] = useState<number>(289);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [showDemoTrackerModal, setShowDemoTrackerModal] = useState<boolean>(false);

  // Efeito do cronômetro regressivo de 5 em 5 minutos que avança os grupos
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Quando o cronômetro zera (5 minutos passados), incrementa o número do grupo
          setCurrentGroupIdx((g) => (g >= 7240 ? 1 : g + 1));
          return 300; // Reinicia ciclo de 5 minutos
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleCopyLink = () => {
    const link = "https://minhadivulgacao.com.br/rastreio/sua-empresa";
    navigator.clipboard?.writeText(link).catch(() => {});
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const steps = [
    {
      num: '1',
      title: 'ESCOLHA SEU ESPAÇO',
      desc: 'Sua empresa faz o cadastro com seus dados principais, contatos e fotos.',
      tag: 'Presença comercial ativa'
    },
    {
      num: '2',
      title: 'ORGANIZAÇÃO DO PERFIL',
      desc: 'Os materiais e informações da sua empresa são preparados para exibição no portal.',
      tag: 'Perfil comercial ativo'
    },
    {
      num: '3',
      title: 'PRESENÇA NO PORTAL',
      desc: 'Seu negócio fica em destaque na vitrine comercial para ser conhecido pelo público.',
      tag: 'Vitrine no portal'
    },
    {
      num: '4',
      title: 'DIVULGAÇÃO EM +7 MIL GRUPOS',
      desc: 'Sua empresa é divulgada em grupos de WhatsApp e Facebook, totalizando mais de 7 mil grupos.',
      tag: 'WhatsApp e Facebook (+7.000)'
    },
    {
      num: '5',
      title: 'CONTATO DIRETO',
      desc: 'Pessoas interessadas nos seus produtos e serviços encontram seu WhatsApp.',
      tag: 'Contato direto no WhatsApp'
    }
  ];

  // Dados do gráfico ilustrativo por hora (Volume de Disparos e Pessoas Alcançadas)
  const hourlyData = [
    { hour: '08h', groups: 420, reach: '11.5k', height: '38%', isPeak: false },
    { hour: '10h', groups: 680, reach: '18.2k', height: '62%', isPeak: false },
    { hour: '12h', groups: 960, reach: '26.4k', height: '94%', isPeak: true, label: 'Pico Almoço' },
    { hour: '14h', groups: 710, reach: '19.8k', height: '66%', isPeak: false },
    { hour: '16h', groups: 840, reach: '22.6k', height: '78%', isPeak: false },
    { hour: '18h', groups: 920, reach: '25.1k', height: '88%', isPeak: false },
    { hour: '20h', groups: 990, reach: '27.8k', height: '100%', isPeak: true, label: 'Pico Noturno' },
    { hour: '22h', groups: 610, reach: '16.5k', height: '54%', isPeak: false },
  ];

  return (
    <section id="como-funciona" className="w-full py-16 sm:py-24 bg-[#06060a] border-b border-white/5 relative overflow-hidden select-none">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        
        {/* Título da Seção */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <span className="text-amber-400 text-[10px] sm:text-xs font-mono font-black tracking-[0.2em] uppercase bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full inline-block mb-3">
            PASSO A PASSO
          </span>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            Como funciona a divulgação da sua empresa
          </h2>
          <p className="text-sm sm:text-base text-white/80 mt-3 max-w-2xl mx-auto font-medium leading-relaxed">
            Processo rápido e descomplicado: sua empresa ganha espaço no portal e é divulgada em mais de 7 mil grupos de WhatsApp e Facebook para começar a receber contatos.
          </p>
        </div>

        {/* 5 Passos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 max-w-7xl mx-auto">
          {steps.map((st, idx) => (
            <div 
              key={idx}
              className={`bg-gradient-to-b from-[#111119] to-[#09090e] border ${st.num === '4' ? 'border-amber-400/50 shadow-[0_0_25px_rgba(251,191,36,0.15)]' : 'border-white/10'} hover:border-amber-500/60 rounded-3xl p-6 flex flex-col justify-between shadow-xl transition-all duration-300 hover:-translate-y-1 group`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-11 h-11 rounded-2xl ${st.num === '4' ? 'bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500' : 'bg-gradient-to-br from-amber-400 to-amber-600'} text-black font-black text-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
                    {st.num}
                  </div>
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${st.num === '4' ? 'text-amber-300 bg-amber-500/20 border-amber-400/40' : 'text-amber-400/90 bg-amber-500/10 border-amber-500/20'} px-2.5 py-1 rounded-full border`}>
                    Etapa {st.num}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-black text-white leading-snug group-hover:text-amber-300 transition-colors">
                  {st.title}
                </h3>
                <p className="text-xs sm:text-sm text-white/70 mt-2.5 leading-relaxed font-medium">
                  {st.desc}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-white/5 text-[10px] font-mono text-white/50 flex items-center justify-between">
                <span>{st.tag}</span>
                {st.num === '4' && <span className="text-amber-400 font-bold">⚡ +7k</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Frase de Destaque */}
        <div className="mt-10 max-w-3xl mx-auto bg-gradient-to-r from-[#171308] via-[#211a0a] to-[#171308] border-2 border-amber-400/40 rounded-2xl p-4 sm:p-5 text-center shadow-lg">
          <p className="text-xs sm:text-sm md:text-base text-amber-300 font-extrabold leading-relaxed">
            💡 Mais do que uma página de serviço: sua empresa ganha presença no portal e é divulgada em mais de 7 mil grupos de WhatsApp e Facebook para o seu negócio ser visto e lembrado.
          </p>
        </div>

        {/* ======================================================== */}
        {/* DESTAQUE PRINCIPAL: VOCÊ ACOMPANHA AS DIVULGAÇÕES EM TEMPO REAL */}
        {/* ======================================================== */}
        <div className="mt-16 sm:mt-20 max-w-6xl mx-auto">
          <div className="relative rounded-3xl p-6 sm:p-8 md:p-10 bg-gradient-to-b from-[#161622] via-[#0d0d15] to-[#07070b] border-2 border-amber-400/50 shadow-[0_0_50px_rgba(245,158,11,0.15)] overflow-hidden">
            
            {/* Efeitos de iluminação de fundo */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

            {/* Cabeçalho do Bloco Destacado */}
            <div className="relative z-10 text-center max-w-3xl mx-auto mb-8 sm:mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold tracking-wider uppercase mb-4 shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span>TECNOLOGIA EXCLUSIVA • ACOMPANHAMENTO AO VIVO</span>
              </div>
              <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                Você acompanha as divulgações <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">em tempo real!</span>
              </h3>
              <p className="text-white/80 text-sm sm:text-base mt-4 font-medium leading-relaxed">
                Você recebe um <strong className="text-amber-300">link exclusivo</strong> onde acompanha todas as suas divulgações: <strong className="text-white">quanto tempo falta para o término</strong>, os <strong className="text-white">grupos exatos que estão sendo divulgados</strong> e <strong className="text-white">gráficos com estatísticas estimadas</strong> de alcance.
              </p>
            </div>

            {/* BARRA DO LINK EXCLUSIVO DO CLIENTE */}
            <div className="relative z-10 bg-[#0a0a10] border border-amber-400/30 rounded-2xl p-4 sm:p-5 mb-8 shadow-inner flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="w-10 h-10 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
                  <LinkIcon className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-2">
                    <span>SEU LINK EXCLUSIVO DE ACOMPANHAMENTO</span>
                    <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[9px]">ATIVO 24H</span>
                  </div>
                  <div className="font-mono text-xs sm:text-sm text-white/90 truncate font-semibold mt-0.5">
                    minhadivulgacao.com.br/rastreio/<span className="text-amber-300">sua-empresa</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full md:w-auto justify-end shrink-0">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold transition-all"
                  title="Copiar link"
                >
                  {isCopied ? (
                    <>
                      <CheckCheck className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-300">Link Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-white/70" />
                      <span>Copiar Link</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowDemoTrackerModal(true)}
                  className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black text-xs font-black tracking-wide shadow-lg shadow-amber-500/25 transition-all hover:scale-105"
                >
                  <Play className="w-3.5 h-3.5 fill-black" />
                  <span>Ver Demonstração ao Vivo</span>
                </button>
              </div>
            </div>

            {/* GRID PRINCIPAL: 1. TEMPO & STATUS | 2. GRUPOS EM TEMPO REAL */}
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
              
              {/* CARD 1: QUANTO TEMPO FALTA PARA O TÉRMINO & CONTADORES */}
              <div className="lg:col-span-5 bg-gradient-to-b from-[#11111b] to-[#0a0a10] border border-white/10 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xl">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span>Tempo & Término da Divulgação</span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      EM ANDAMENTO
                    </span>
                  </div>

                  {/* Cronômetro de Disparo de 5 em 5 minutos */}
                  <div className="mt-5 p-4 rounded-xl bg-[#07070c] border border-amber-500/30 text-center relative overflow-hidden">
                    <div className="text-[11px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                      Próximo disparo no grupo em:
                    </div>
                    <div className="text-3xl sm:text-4xl font-mono font-black text-white mt-1 tracking-wider text-amber-300">
                      {formatCountdown(countdown)}
                    </div>
                    <p className="text-[10px] text-white/60 mt-1 font-medium">
                      Disparos automáticos constantes de 5 em 5 minutos
                    </p>

                    {/* Barra de progresso dos 5 min */}
                    <div className="w-full bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-amber-400 to-yellow-300 h-full transition-all duration-1000"
                        style={{ width: `${((300 - countdown) / 300) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Tempo restante estimado da campanha */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-[10px] text-white/60 font-mono uppercase block">Tempo Restante:</span>
                      <span className="text-sm sm:text-base font-black text-white font-mono mt-0.5 block">
                        18h 35min
                      </span>
                      <span className="text-[9px] text-emerald-400 block mt-0.5">Ativo na rodada diária</span>
                    </div>

                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-[10px] text-white/60 font-mono uppercase block">Progresso Geral:</span>
                      <span className="text-sm sm:text-base font-black text-amber-400 font-mono mt-0.5 block">
                        74.8% concluído
                      </span>
                      <span className="text-[9px] text-white/60 block mt-0.5">5.415 de 7.240 grupos</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-white/5 text-xs text-white/70 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-amber-400" />
                    Transmissão 24 horas por dia
                  </span>
                  <span className="font-mono text-amber-300 font-bold text-[11px]">100% Auditável</span>
                </div>
              </div>

              {/* CARD 2: GRUPOS QUE ESTÃO SENDO DIVULGADOS EM TEMPO REAL */}
              <div className="lg:col-span-7 bg-gradient-to-b from-[#11111b] to-[#0a0a10] border border-white/10 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xl">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                      <Users className="w-4 h-4 text-emerald-400" />
                      <span>Grupos sendo divulgados agora</span>
                    </div>
                    <span className="text-[11px] font-mono text-amber-400 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                      +7.000 Grupos na Rede
                    </span>
                  </div>

                  <p className="text-xs text-white/70 mt-3 font-medium">
                    No seu link, você vê o nome dos grupos do WhatsApp e Facebook onde seu flyer e mensagem comercial estão entrando:
                  </p>

                  {/* Feed dinâmico simulando os grupos */}
                  <div className="mt-4 space-y-2.5">
                    {/* Grupo Ativo Atual */}
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/40 flex items-center justify-between transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 font-black text-xs shrink-0">
                          WA
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-2">
                            <span>Grupo WhatsApp #{currentGroupIdx}</span>
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-mono font-bold animate-pulse">
                              DISPARADO AGORA
                            </span>
                          </div>
                          <div className="text-[11px] text-white/70">
                            Empreendedores & Ofertas Comerciais • Ceará e Região
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-mono text-amber-300 font-bold block">100% Entregue</span>
                        <span className="text-[9px] text-white/50 block">há 12 segundos</span>
                      </div>
                    </div>

                    {/* Grupo Facebook */}
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 font-black text-xs shrink-0">
                          FB
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-2">
                            <span>Grupo Facebook #{Math.floor(currentGroupIdx / 2)}</span>
                            <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[9px] font-mono font-bold">
                              POSTADO
                            </span>
                          </div>
                          <div className="text-[11px] text-white/70">
                            Classificados & Comércio Geral Brasil (52.000 membros)
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-mono text-emerald-400 font-bold block">Concluído</span>
                        <span className="text-[9px] text-white/50 block">há 2 min</span>
                      </div>
                    </div>

                    {/* Grupo WhatsApp Anterior */}
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 font-black text-xs shrink-0">
                          WA
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-2">
                            <span>Grupo WhatsApp #{currentGroupIdx - 1 > 0 ? currentGroupIdx - 1 : 7240}</span>
                            <span className="px-1.5 py-0.5 rounded bg-white/10 text-white/70 text-[9px] font-mono font-bold">
                              CONCLUÍDO
                            </span>
                          </div>
                          <div className="text-[11px] text-white/70">
                            Vendas Rápidas, Produtos & Serviços Locais
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-mono text-white/60 font-bold block">Entregue</span>
                        <span className="text-[9px] text-white/50 block">há 5 min</span>
                      </div>
                    </div>

                    {/* Próximo da fila */}
                    <div className="p-2.5 rounded-xl bg-black/40 border border-dashed border-white/10 flex items-center justify-between text-white/50">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-amber-400 font-mono font-bold">⏳ Na fila:</span>
                        <span>Grupo WhatsApp #{currentGroupIdx + 1} (Parcerias & Divulgação)</span>
                      </div>
                      <span className="text-[10px] font-mono">Disparo em {formatCountdown(countdown)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-white/60">
                  <span>Atualização instantânea em tempo real</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Feed sincronizado
                  </span>
                </div>
              </div>

            </div>

            {/* SEÇÃO DO GRÁFICO E ESTATÍSTICAS ESTIMADAS */}
            <div className="relative z-10 bg-gradient-to-b from-[#11111b] to-[#09090f] border border-amber-400/30 rounded-2xl p-5 sm:p-7 shadow-2xl">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/10">
                <div>
                  <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-1">
                    <BarChart3 className="w-4 h-4" />
                    <span>GRÁFICO E ESTATÍSTICAS ESTIMADAS</span>
                  </div>
                  <h4 className="text-lg sm:text-xl font-black text-white">
                    Volume de Disparos e Estimativa de Alcance ao Longo do Dia
                  </h4>
                  <p className="text-xs sm:text-sm text-white/70 mt-1">
                    Veja ilustrado como suas divulgações são distribuídas estrategicamente para atingir o maior número de pessoas:
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1.5 text-xs text-white/70 font-mono">
                    <span className="w-3 h-3 rounded bg-gradient-to-t from-amber-500 to-yellow-300 inline-block" />
                    <span>Disparos por hora</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-white/70 font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                    <span>Pico de Visualizações</span>
                  </div>
                </div>
              </div>

              {/* GRÁFICO ILUSTRATIVO DE BARRAS E TENDÊNCIA */}
              <div className="mt-8 pt-4">
                <div className="h-56 sm:h-64 flex items-end justify-between gap-2 sm:gap-4 px-2 sm:px-6 relative">
                  
                  {/* Linhas de grade de fundo */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-15">
                    <div className="border-b border-white w-full" />
                    <div className="border-b border-white w-full" />
                    <div className="border-b border-white w-full" />
                    <div className="border-b border-white w-full" />
                  </div>

                  {/* Barras do Gráfico */}
                  {hourlyData.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group relative z-10">
                      
                      {/* Tooltip / Indicador acima da barra */}
                      <div className="mb-2 text-center transition-transform group-hover:scale-110">
                        {d.isPeak && (
                          <span className="hidden sm:inline-block bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full mb-1">
                            {d.label}
                          </span>
                        )}
                        <span className="text-[10px] sm:text-xs font-mono font-bold text-amber-300 block">
                          {d.groups}
                        </span>
                        <span className="text-[9px] font-mono text-white/50 hidden sm:block">
                          ~{d.reach}
                        </span>
                      </div>

                      {/* Barra Visual com Gradiente */}
                      <div className="w-full max-w-[48px] bg-white/5 rounded-t-xl overflow-hidden p-0.5 flex flex-col justify-end transition-all h-full">
                        <div 
                          className={`w-full rounded-t-lg transition-all duration-500 ${
                            d.isPeak 
                              ? 'bg-gradient-to-t from-amber-600 via-amber-400 to-yellow-300 shadow-[0_0_20px_rgba(251,191,36,0.35)]' 
                              : 'bg-gradient-to-t from-amber-600/80 to-amber-400/90 group-hover:from-amber-500 group-hover:to-yellow-300'
                          }`}
                          style={{ height: d.height }}
                        />
                      </div>

                      {/* Legenda do Horário */}
                      <span className="mt-3 text-[11px] sm:text-xs font-mono font-bold text-white/80 group-hover:text-amber-300 transition-colors">
                        {d.hour}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="text-center text-[11px] font-mono text-white/50 mt-4">
                  * Horários estratégicos com maior pico de leitura e cliques nos grupos (12h às 14h e 19h às 21h).
                </div>
              </div>

              {/* 4 CARDS COM AS ESTATÍSTICAS ESTIMADAS */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-white/10">
                
                <div className="bg-[#07070d] border border-white/10 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center gap-2 text-amber-400 mb-1">
                    <Users className="w-4 h-4" />
                    <span className="text-[10px] font-mono uppercase font-bold text-white/70">Grupos da Rede</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white font-mono">
                    +7.240
                  </div>
                  <p className="text-[10px] text-white/60 mt-1 font-medium">
                    WhatsApp e Facebook monitorados
                  </p>
                </div>

                <div className="bg-[#07070d] border border-white/10 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center gap-2 text-emerald-400 mb-1">
                    <Eye className="w-4 h-4" />
                    <span className="text-[10px] font-mono uppercase font-bold text-white/70">Alcance Estimado</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-300 font-mono">
                    +180.000
                  </div>
                  <p className="text-[10px] text-white/60 mt-1 font-medium">
                    Pessoas impactadas na campanha
                  </p>
                </div>

                <div className="bg-[#07070d] border border-white/10 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center gap-2 text-amber-400 mb-1">
                    <Zap className="w-4 h-4" />
                    <span className="text-[10px] font-mono uppercase font-bold text-white/70">Frequência</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
                    5 min
                  </div>
                  <p className="text-[10px] text-white/60 mt-1 font-medium">
                    1 disparo automático a cada 5m
                  </p>
                </div>

                <div className="bg-[#07070d] border border-white/10 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center gap-2 text-emerald-400 mb-1">
                    <Smartphone className="w-4 h-4" />
                    <span className="text-[10px] font-mono uppercase font-bold text-white/70">Contato Direto</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white font-mono">
                    WhatsApp
                  </div>
                  <p className="text-[10px] text-emerald-400 mt-1 font-medium">
                    Cliques direto no seu número
                  </p>
                </div>

              </div>

            </div>

          </div>
        </div>

      </div>

      {/* Modal de demonstração interativa do rastreamento do cliente */}
      {showDemoTrackerModal && (
        <ClientDispatchTrackerModal
          companyId="demo-empresa-destaque"
          companyData={{
            name: 'Sua Empresa Comercial (Demonstração)',
            logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200',
            category: 'Comércio, Vendas & Serviços',
            city: 'Brasil',
            desc: 'Acompanhamento em tempo real de disparos em grupos de WhatsApp e Facebook.'
          }}
          onClose={() => setShowDemoTrackerModal(false)}
        />
      )}
    </section>
  );
};

// ==========================================
// 4. SEÇÃO: OS BENEFÍCIOS DE PARTICIPAR (MAIS DO QUE UM CADASTRO...)
// ==========================================
export const OndeSuaEmpresaApareceSection: React.FC = () => {
  const beneficios = [
    {
      icon: Search,
      title: 'ESPAÇO NO PORTAL',
      desc: 'Apresentação da sua empresa para quem visita o Minha Divulgação.',
      highlight: 'Portal Web'
    },
    {
      icon: Layers,
      title: 'FLYER PERSONALIZADO',
      desc: 'Material visual para apresentar seu negócio.',
      highlight: 'Material Visual'
    },
    {
      icon: Tv,
      title: 'VÍDEO PARA TV DA PLATAFORMA',
      desc: 'Conteúdo de divulgação conforme os recursos disponíveis.',
      highlight: 'TV da Plataforma'
    },
    {
      icon: Radio,
      title: 'ÁUDIO PARA RÁDIO MINHA DIVULGAÇÃO',
      desc: 'Apresentação comercial da sua empresa.',
      highlight: 'Rádio Web'
    },
    {
      icon: Sparkles,
      title: 'DIVULGAÇÃO EM GRUPOS E CANAIS PARCEIROS',
      desc: 'Sua empresa é divulgada em grupos de WhatsApp e Facebook, totalizando mais de 7 mil grupos.',
      highlight: '+7 Mil Grupos'
    }
  ];

  return (
    <section id="onde-aparece" className="w-full py-16 sm:py-24 bg-gradient-to-b from-black via-[#090912] to-black border-b border-white/5 relative overflow-hidden select-none">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        
        {/* Título da Seção - Seção 6 do Brief */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-amber-400 text-[10px] sm:text-xs font-mono font-black tracking-[0.2em] uppercase bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full inline-block mb-3">
            RECURSOS INCLUÍDOS NA OFERTA
          </span>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            MAIS DO QUE UM CADASTRO. UM ESPAÇO PARA SUA MARCA APARECER.
          </h2>
          <p className="text-sm sm:text-base text-white/80 mt-4 max-w-2xl mx-auto font-medium leading-relaxed">
            Ao participar do Minha Divulgação, sua empresa conta com os recursos de apresentação e divulgação incluídos no plano.
          </p>
        </div>

        {/* 5 Cards dos Recursos Reais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5 max-w-6xl mx-auto">
          {beneficios.map((c, idx) => {
            const Icon = c.icon;
            return (
              <div 
                key={idx}
                className="bg-gradient-to-b from-[#111119] to-[#0a0a10] border border-white/10 hover:border-amber-500/40 rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon size={20} />
                    </div>
                    <span className="text-[9px] font-mono font-bold uppercase text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      {c.highlight}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-black text-white leading-snug group-hover:text-amber-300 transition-colors">
                    {c.title}
                  </h3>

                  <p className="text-xs text-white/70 mt-2 leading-relaxed font-medium">
                    {c.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                  <Check size={12} className="stroke-[3]" />
                  <span>Incluído no plano</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Frase de Fechamento */}
        <div className="mt-10 text-center">
          <span className="inline-block bg-neutral-900/90 border border-white/10 text-amber-300 text-xs sm:text-sm font-bold font-mono px-5 py-2.5 rounded-xl">
            ✨ Presença planejada para dar visibilidade ao seu negócio.
          </span>
        </div>

      </div>
    </section>
  );
};

// ==========================================
// 7. SEÇÃO DE PREÇO E CHAMADA PARA AÇÃO (4. CONVITE PARA ANUNCIAR)
// ==========================================
export const PlanoPrecoSection: React.FC<{ primaryWaLink?: string; onCadastrarClick?: () => void }> = ({ 
  primaryWaLink = DEFAULT_WA_LINK,
  onCadastrarClick
}) => {
  const beneficios = [
    {
      icon: Search,
      title: 'ESPAÇO NO PORTAL',
      desc: 'Apresentação da sua empresa para quem visita o Minha Divulgação.',
      highlight: 'Portal Web'
    },
    {
      icon: Layers,
      title: 'FLYER PERSONALIZADO',
      desc: 'Material visual para apresentar seu negócio.',
      highlight: 'Material Visual'
    },
    {
      icon: Tv,
      title: 'VÍDEO PARA TV DA PLATAFORMA',
      desc: 'Conteúdo de divulgação conforme os recursos disponíveis.',
      highlight: 'TV da Plataforma'
    },
    {
      icon: Radio,
      title: 'ÁUDIO PARA RÁDIO MINHA DIVULGAÇÃO',
      desc: 'Apresentação comercial da sua empresa.',
      highlight: 'Rádio Web'
    },
    {
      icon: Sparkles,
      title: 'DIVULGAÇÃO EM GRUPOS E PARCEIROS',
      desc: 'Quando incluída e disponível na operação.',
      highlight: 'Canais Parceiros'
    }
  ];

  return (
    <section id="anuncie" className="w-full py-16 md:py-24 bg-gradient-to-b from-black via-[#0a0a14] to-black border-b border-white/5 relative overflow-hidden select-none scroll-mt-20">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-amber-500/10 rounded-full blur-[170px] pointer-events-none" />

      <div className="w-full max-w-5xl mx-auto px-4 md:px-6 relative z-10 text-center">
        
        {/* Header - Seção de Anunciantes */}
        <div className="max-w-3xl mx-auto mb-8 sm:mb-12">
          <span className="text-amber-400 text-[10px] sm:text-xs font-mono font-black tracking-[0.2em] uppercase bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full inline-block mb-3">
            DIVULGUE SUA EMPRESA
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            Quer divulgar sua empresa?
          </h2>
          <p className="text-base sm:text-lg text-white/85 font-medium mt-3 leading-relaxed max-w-2xl mx-auto">
            Tenha seu espaço no Minha Divulgação, com perfil comercial, WhatsApp direto e participação nas buscas do portal.
          </p>
        </div>

        {/* Card de Preço Destacado */}
        <div className="max-w-xl mx-auto bg-gradient-to-b from-[#161626] via-[#10101b] to-[#0b0b12] border-2 border-amber-400 rounded-3xl p-7 sm:p-10 shadow-[0_15px_50px_rgba(245,158,11,0.25)]">
          
          <span className="text-[10px] sm:text-xs font-mono font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full inline-block mb-4">
            PLANO DE DIVULGAÇÃO
          </span>

          <div className="flex items-baseline justify-center gap-1.5 my-3">
            <span className="text-2xl sm:text-3xl font-black text-amber-400">R$</span>
            <span className="text-5xl sm:text-6xl md:text-7xl font-black text-white tracking-tight">
              49,90
            </span>
            <span className="text-base sm:text-lg font-bold text-white/70 uppercase">
              /mês
            </span>
          </div>

          <p className="text-xs sm:text-sm text-amber-200/90 font-semibold mt-2">
            Perfil comercial completo, WhatsApp direto e buscas no portal.
          </p>

          <div className="mt-7 flex flex-col gap-3">
            {onCadastrarClick ? (
              <button
                type="button"
                onClick={onCadastrarClick}
                className="w-full inline-flex items-center justify-center gap-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:brightness-110 text-black px-8 py-5 rounded-2xl font-black text-sm sm:text-base uppercase tracking-wider transition-all duration-300 shadow-[0_10px_35px_rgba(245,158,11,0.35)] cursor-pointer hover:scale-105 active:scale-95"
              >
                <span>QUERO DIVULGAR MINHA EMPRESA</span>
                <ArrowRight size={18} />
              </button>
            ) : (
              <a
                href={primaryWaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:brightness-110 text-black px-8 py-5 rounded-2xl font-black text-sm sm:text-base uppercase tracking-wider transition-all duration-300 shadow-[0_10px_35px_rgba(245,158,11,0.35)] cursor-pointer decoration-transparent hover:scale-105 active:scale-95"
              >
                <span>QUERO DIVULGAR MINHA EMPRESA</span>
                <ArrowRight size={18} />
              </a>
            )}

            <p className="text-xs sm:text-sm text-amber-300/90 font-medium mt-1">
              Preencha os dados da sua empresa e veja a prévia instantânea no portal.
            </p>

            <a
              href={primaryWaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-white/70 hover:text-amber-300 font-medium py-1.5 flex items-center justify-center gap-1.5 decoration-transparent transition-colors mt-2"
            >
              <span>💬 Dúvidas sobre o plano? Fale conosco no WhatsApp</span>
            </a>

            <p className="text-[11px] text-white/50 font-mono mt-1">
              Pagamento via Cartão de Crédito ou Pix • Ativação rápida com suporte
            </p>
          </div>

        </div>

        {/* Recursos Incluídos na Assinatura */}
        <div className="mt-14 pt-10 border-t border-white/5">
          <div className="text-center mb-8">
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
              O que está incluído no seu plano
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
              Recursos de Apresentação e Divulgação
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4 max-w-5xl mx-auto text-left">
            {beneficios.map((c, idx) => {
              const Icon = c.icon;
              return (
                <div 
                  key={idx}
                  className="bg-[#0e0e16] border border-white/10 rounded-2xl p-4 flex flex-col justify-between shadow-lg"
                >
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-3">
                      <Icon size={18} />
                    </div>
                    <h4 className="text-xs sm:text-sm font-black text-white leading-snug">
                      {c.title}
                    </h4>
                    <p className="text-[11px] text-white/70 mt-1.5 leading-relaxed font-medium">
                      {c.desc}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-white/5 text-[9px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                    <Check size={11} className="stroke-[3]" />
                    <span>Incluído</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};

// ==========================================
// 8. SEÇÃO: MENSAGEM FINAL (Seção 9 do Brief)
// ==========================================
export const CtaFinalSection: React.FC<{ primaryWaLink?: string; onCadastrarClick?: () => void }> = ({ 
  primaryWaLink = DEFAULT_WA_LINK,
  onCadastrarClick
}) => {
  return (
    <section className="w-full py-16 md:py-24 bg-gradient-to-b from-[#0a0a12] to-black border-b border-white/5 relative overflow-hidden select-none">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="relative w-full max-w-4xl mx-auto px-4 md:px-6 text-center z-10">
        
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-widest mb-6">
          ✨ FAÇA PARTE DO PORTAL
        </div>

        <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
          SUA EMPRESA TEM MUITO A MOSTRAR. DÊ A ELA MAIS VISIBILIDADE.
        </h2>

        <p className="text-sm sm:text-base md:text-lg text-white/80 font-medium max-w-2xl mx-auto mt-4 leading-relaxed">
          Apresente seu negócio, destaque sua marca e faça parte do Minha Divulgação.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          {onCadastrarClick ? (
            <button
              type="button"
              onClick={onCadastrarClick}
              className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:brightness-110 text-black px-8 sm:px-10 py-5 rounded-2xl font-black text-sm sm:text-base uppercase tracking-wider transition-all duration-300 shadow-[0_12px_40px_rgba(245,158,11,0.35)] hover:scale-105 cursor-pointer"
            >
              <span>QUERO DIVULGAR MINHA EMPRESA</span>
              <ArrowRight size={18} />
            </button>
          ) : (
            <a
              href={primaryWaLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:brightness-110 text-black px-8 sm:px-10 py-5 rounded-2xl font-black text-sm sm:text-base uppercase tracking-wider transition-all duration-300 shadow-[0_12px_40px_rgba(245,158,11,0.35)] hover:scale-105 cursor-pointer decoration-transparent"
            >
              <span>QUERO DIVULGAR MINHA EMPRESA</span>
              <ArrowRight size={18} />
            </a>
          )}
          <a
            href={primaryWaLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white px-6 sm:px-8 py-5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 cursor-pointer decoration-transparent"
          >
            <span>Dúvidas no WhatsApp</span>
          </a>
        </div>

        <p className="text-xs text-white/50 font-mono mt-4">
          Preencha os dados da sua empresa e siga para a confirmação da participação.
        </p>

      </div>
    </section>
  );
};
