import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Sparkles, 
  Store, 
  Briefcase, 
  Search, 
  MessageSquare, 
  Smartphone, 
  Tv, 
  Radio, 
  Layers, 
  Check, 
  ArrowRight,
  ExternalLink,
  Utensils,
  Scissors,
  Wrench,
  Car,
  ShoppingBag,
  Stethoscope,
  Star,
  Megaphone,
  HelpCircle,
  ChevronDown,
  ShieldCheck,
  Zap,
  Building2,
  Share2
} from 'lucide-react';

// ==========================================
// 1. SEGMENTOS ATENDIDOS NA REDE
// ==========================================
export const SegmentsShowcase: React.FC = () => {
  const segments = [
    { label: 'Lojas & Varejo', icon: Store, color: 'from-amber-500/20 to-yellow-500/10 text-amber-400 border-amber-500/30' },
    { label: 'Restaurantes & Bares', icon: Utensils, color: 'from-red-500/20 to-orange-500/10 text-red-400 border-red-500/30' },
    { label: 'Salões & Barbearias', icon: Scissors, color: 'from-pink-500/20 to-rose-500/10 text-pink-400 border-pink-500/30' },
    { label: 'Oficinas Mecânicas', icon: Wrench, color: 'from-blue-500/20 to-indigo-500/10 text-blue-400 border-blue-500/30' },
    { label: 'Lojas de Celulares & Tech', icon: Smartphone, color: 'from-cyan-500/20 to-blue-500/10 text-cyan-400 border-cyan-500/30' },
    { label: 'Lojas de Roupas & Moda', icon: ShoppingBag, color: 'from-purple-500/20 to-pink-500/10 text-purple-400 border-purple-500/30' },
    { label: 'Mercados & Açougues', icon: Store, color: 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/30' },
    { label: 'Clínicas & Saúde', icon: Stethoscope, color: 'from-teal-500/20 to-emerald-500/10 text-teal-400 border-teal-500/30' },
    { label: 'Prestadores de Serviços', icon: Briefcase, color: 'from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/30' },
    { label: 'Autopeças & Acessórios', icon: Car, color: 'from-orange-500/20 to-red-500/10 text-orange-400 border-orange-500/30' },
    { label: 'Empresas em Geral', icon: Layers, color: 'from-yellow-500/20 to-amber-500/10 text-yellow-400 border-yellow-500/30' },
  ];

  return (
    <div className="w-full mt-10 pt-8 border-t border-white/5 select-none">
      <div className="text-center mb-5">
        <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-white/50 uppercase">
          Presença comercial para empresas de todos os portes e segmentos
        </span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 max-w-5xl mx-auto">
        {segments.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div 
              key={idx} 
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-b ${item.color} border text-xs font-bold transition-all duration-300 hover:scale-105 shadow-sm`}
            >
              <Icon size={14} className="shrink-0" />
              <span>{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==========================================
// 2. SEÇÃO: O QUE É A MINHA DIVULGAÇÃO
// ==========================================
export const OQueERedeSection: React.FC = () => {
  const redePilares = [
    {
      title: 'Portal de Empresas',
      desc: 'Presença organizada em um portal de negócios ativo.',
      icon: Building2
    },
    {
      title: 'Busca de Empresas & Serviços',
      desc: 'Localização rápida por categoria, palavras-chave e estado.',
      icon: Search
    },
    {
      title: 'Vitrine Comercial',
      desc: 'Espaço profissional para fotos, descrição e produtos.',
      icon: Store
    },
    {
      title: 'Espaços de Destaque',
      desc: 'Participação nas áreas de evidência comercial da rede.',
      icon: Star
    },
    {
      title: 'Promoções & Ofertas',
      desc: 'Canal para divulgação de ofertas comerciais da sua empresa.',
      icon: Sparkles
    },
    {
      title: 'TV Minha Divulgação',
      desc: 'Canal de TV próprio com exibição contínua de anúncios.',
      icon: Tv
    },
    {
      title: 'Rádio Minha Divulgação',
      desc: 'Rádio web transmitindo programação e anúncios comerciais.',
      icon: Radio
    },
    {
      title: 'Canais de Contato com Clientes',
      desc: 'Botão de WhatsApp e contato direto para atendimento imediato.',
      icon: MessageSquare
    }
  ];

  return (
    <section id="o-que-e" className="w-full py-16 md:py-24 bg-gradient-to-b from-black via-[#08080f] to-black border-b border-white/5 relative overflow-hidden select-none">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-amber-500/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        
        {/* Header da Seção */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-amber-400 text-xs font-mono font-black tracking-[0.2em] uppercase bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full inline-block mb-3">
            REDE DE DIVULGAÇÃO
          </span>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            O QUE É A MINHA DIVULGAÇÃO?
          </h2>
          <p className="text-base sm:text-lg text-white/90 font-medium mt-4 leading-relaxed max-w-2xl mx-auto">
            O Minha Divulgação é uma rede comercial criada para ajudar empresas a ampliarem sua presença e serem encontradas por pessoas que procuram produtos e serviços.
          </p>
        </div>

        {/* Pilares da Rede Comercial */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
          {redePilares.map((pilar, idx) => {
            const Icon = pilar.icon;
            return (
              <div 
                key={idx}
                className="bg-gradient-to-b from-[#111119] to-[#09090e] border border-white/10 hover:border-amber-500/40 rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-amber-500/20 transition-all">
                    <Icon size={22} />
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white leading-snug group-hover:text-amber-300 transition-colors">
                    {pilar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/70 mt-2 leading-relaxed font-medium">
                    {pilar.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-1.5 text-amber-400/80 text-[11px] font-mono font-bold uppercase">
                  <span>Rede Integrada</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Nota de Posicionamento */}
        <div className="mt-12 max-w-3xl mx-auto bg-gradient-to-r from-amber-950/30 via-[#161206] to-amber-950/30 border border-amber-400/30 rounded-2xl p-5 sm:p-6 text-center shadow-lg">
          <p className="text-xs sm:text-sm text-amber-200/90 font-medium leading-relaxed">
            <span className="font-black text-amber-400 uppercase tracking-wide">Mais do que um simples cadastro: </span> 
            Sua empresa contrata presença ativa em uma rede completa com portal, busca, vitrine comercial, TV, rádio e divulgação direcionada ao WhatsApp.
          </p>
        </div>

      </div>
    </section>
  );
};

// ==========================================
// 3. SEÇÃO: O QUE SUA EMPRESA RECEBE
// ==========================================
export const OQueSuaEmpresaRecebeSection: React.FC<{ primaryWaLink: string }> = ({ primaryWaLink }) => {
  const cards = [
    {
      tag: 'PRESENÇA NO PORTAL',
      title: '🔎 PRESENÇA NO PORTAL',
      desc: 'Sua empresa fica disponível para ser encontrada por categoria e busca.',
      detail: 'Página exclusiva com nome, descrição, categoria, horários, fotos e informações comerciais completas.',
      icon: Search,
      highlight: 'Busca Otimizada'
    },
    {
      tag: 'CONTATO DIRETO',
      title: '📱 CONTATO DIRETO',
      desc: 'Botão para o cliente entrar em contato com sua empresa.',
      detail: 'Link direto para seu WhatsApp comercial e telefone, sem intermediários e sem comissões sobre vendas.',
      icon: Smartphone,
      highlight: 'Direto no WhatsApp'
    },
    {
      tag: 'DESTAQUE COMERCIAL',
      title: '⭐ DESTAQUE COMERCIAL',
      desc: 'Sua empresa participa dos espaços de destaque disponíveis na rede.',
      detail: 'Visibilidade destacada na página inicial, seções de recomendação e vitrines temáticas da plataforma.',
      icon: Star,
      highlight: 'Visibilidade em Evidência'
    },
    {
      tag: 'TV MINHA DIVULGAÇÃO',
      title: '📺 TV MINHA DIVULGAÇÃO',
      desc: 'Possibilidade de participação nos espaços comerciais da TV da rede, conforme programação.',
      detail: 'Transmissão contínua em formato 16:9 acessível no portal por visitantes e parceiros comerciais.',
      icon: Tv,
      highlight: 'Canal de TV 24h'
    },
    {
      tag: 'RÁDIO MINHA DIVULGAÇÃO',
      title: '📻 RÁDIO MINHA DIVULGAÇÃO',
      desc: 'Participação nos espaços comerciais da rádio, conforme programação.',
      detail: 'Rádio web com música, vinhetas e menções aos negócios que fazem parte da nossa rede.',
      icon: Radio,
      highlight: 'Rádio Web Comercial'
    },
    {
      tag: 'DIVULGAÇÃO',
      title: '📢 DIVULGAÇÃO',
      desc: 'Sua empresa participa dos espaços destinados aos anunciantes da rede.',
      detail: 'Apresentação comercial organizada, moderna e acessível para pessoas que procuram negócios como o seu.',
      icon: Megaphone,
      highlight: 'Exposição Comercial'
    }
  ];

  return (
    <section id="beneficios" className="w-full py-16 md:py-24 bg-[#050508] border-b border-white/5 relative overflow-hidden select-none">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-amber-400 text-xs font-mono font-black tracking-[0.2em] uppercase bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full inline-block mb-3">
            BENEFÍCIOS DA ASSINATURA
          </span>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            O QUE SUA EMPRESA RECEBE
          </h2>
          <p className="text-sm sm:text-base text-white/70 mt-3 max-w-2xl mx-auto font-medium">
            Tudo o que sua empresa precisa para ter uma presença profissional e ser encontrada na internet com investimento acessível.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {cards.map((c, idx) => {
            const Icon = c.icon;
            return (
              <div 
                key={idx}
                className="bg-gradient-to-b from-[#12121d] to-[#0a0a10] border border-white/10 hover:border-amber-500/50 rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-xl transition-all duration-300 hover:-translate-y-1.5 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                      <Icon size={24} />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300 bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 rounded-full">
                      {c.highlight}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-black text-white leading-snug group-hover:text-amber-300 transition-colors">
                    {c.title}
                  </h3>

                  <p className="text-sm font-bold text-white/90 mt-2.5 leading-relaxed">
                    {c.desc}
                  </p>

                  <p className="text-xs text-white/60 mt-2 leading-relaxed">
                    {c.detail}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 size={15} className="shrink-0" />
                  <span>Incluso na assinatura mensal</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA rápido */}
        <div className="mt-12 text-center">
          <a
            href={primaryWaLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:brightness-110 text-black px-8 py-4 sm:py-5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-300 shadow-[0_10px_35px_rgba(245,158,11,0.3)] cursor-pointer decoration-transparent hover:scale-105"
          >
            <span>QUERO DIVULGAR MINHA EMPRESA</span>
            <ArrowRight size={18} />
          </a>
        </div>

      </div>
    </section>
  );
};

// ==========================================
// 4. SEÇÃO: PLANO (UMA ASSINATURA PARA SUA EMPRESA - R$ 49,90/mês)
// ==========================================
export const PlanoPrincipalSection: React.FC<{ primaryWaLink: string }> = ({ primaryWaLink }) => {
  const benefits = [
    'Presença no portal Minha Divulgação',
    'Página / perfil completo da sua empresa',
    'Nome, descrição, categoria e informações comerciais',
    'Fotos da empresa, produtos ou serviços',
    'Telefone e botão direto para seu WhatsApp',
    'Participação nas buscas e filtros do portal',
    'Participação na vitrine comercial',
    'Possibilidade de aparecer nos espaços de destaque da rede',
    'Participação nos espaços comerciais da TV e Rádio Minha Divulgação, conforme programação e critérios da rede',
    'Divulgação contínua dentro dos espaços disponíveis para anunciantes'
  ];

  return (
    <section id="planos" className="w-full py-16 md:py-24 bg-gradient-to-b from-black via-[#090912] to-black border-b border-white/5 relative overflow-hidden select-none">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[170px] pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-amber-400 text-xs font-mono font-black tracking-[0.2em] uppercase bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full inline-block mb-3">
            ASSINATURA RECORRENTE
          </span>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            UMA ASSINATURA PARA SUA EMPRESA
          </h2>
          <p className="text-base sm:text-lg text-amber-300 font-extrabold mt-3">
            Presença e divulgação ativa na rede Minha Divulgação.
          </p>
          <p className="text-sm text-white/60 mt-1.5 max-w-xl mx-auto">
            Sem cadastro gratuito. Um valor justo e transparente para colocar sua marca em evidência.
          </p>
        </div>

        {/* Card do Plano */}
        <div className="max-w-3xl mx-auto">
          <div className="relative bg-gradient-to-b from-[#151525] via-[#10101b] to-[#0b0b12] border-2 border-amber-400 rounded-3xl p-6 sm:p-10 md:p-12 shadow-[0_20px_60px_rgba(245,158,11,0.2)]">
            
            {/* Badge de Destaque */}
            <div className="absolute -top-3.5 right-6 sm:right-10 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black font-black text-[10px] sm:text-xs tracking-widest uppercase px-4 py-1.5 rounded-full shadow-lg">
              ASSINATURA COMERCIAL
            </div>

            {/* Cabeçalho do Card */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-white/10">
              <div>
                <span className="text-xs font-mono font-black uppercase tracking-wider text-amber-400">
                  PLANO OFICIAL DA REDE
                </span>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mt-1">
                  MINHA DIVULGAÇÃO
                </h3>
                <p className="text-xs sm:text-sm text-white/70 mt-1 font-medium">
                  Acesso completo aos canais e espaços da rede
                </p>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <div className="flex items-baseline gap-1">
                  <span className="text-base font-black text-amber-400">R$</span>
                  <span className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight">
                    49,90
                  </span>
                  <span className="text-xs sm:text-sm font-black text-white/70 uppercase">
                    /mês
                  </span>
                </div>
                <span className="text-[11px] text-amber-300 font-mono font-bold block mt-1">
                  Assinatura mensal • Sem cadastro gratuito
                </span>
              </div>
            </div>

            {/* Lista de Benefícios Reais */}
            <div className="my-8">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-white/50 block mb-4">
                Benefícios reais inclusos na sua assinatura:
              </span>

              <div className="space-y-3.5">
                {benefits.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={12} className="stroke-[3]" />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-white/90 leading-snug">
                      {feat}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Botão de Contratação */}
            <div className="pt-6 border-t border-white/10">
              <a
                href={primaryWaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:brightness-110 text-black px-8 py-5 rounded-2xl font-black text-sm sm:text-base uppercase tracking-wider transition-all duration-300 shadow-[0_12px_35px_rgba(245,158,11,0.35)] cursor-pointer decoration-transparent hover:scale-[1.02] active:scale-95"
              >
                <span>QUERO ENTRAR NA REDE</span>
                <ArrowRight size={18} />
              </a>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-4 text-[11px] text-white/50 font-mono text-center sm:text-left">
                <span>💬 Contratação rápida e direta pelo WhatsApp</span>
                <span>🔒 Sem taxa de adesão oculta</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

// ==========================================
// 5. SEÇÃO: COMO FUNCIONA (5 Passos Simples)
// ==========================================
export const ComoFuncionaRedeSection: React.FC = () => {
  const steps = [
    {
      num: '1',
      title: 'Você solicita sua assinatura',
      desc: 'Entre em contato pelo WhatsApp e informe os dados iniciais do seu negócio.',
      badge: 'Contato'
    },
    {
      num: '2',
      title: 'Nossa equipe recebe seus dados',
      desc: 'Coletamos nome da empresa, descrição, fotos, categorias, contatos e WhatsApp.',
      badge: 'Recebimento'
    },
    {
      num: '3',
      title: 'Sua empresa é cadastrada na rede',
      desc: 'Criamos a apresentação visual e o perfil comercial dentro da plataforma.',
      badge: 'Cadastro'
    },
    {
      num: '4',
      title: 'As informações são organizadas e publicadas',
      desc: 'Revisamos todos os dados, botões de contato e links para garantir funcionamento perfeito.',
      badge: 'Publicação'
    },
    {
      num: '5',
      title: 'Sua empresa passa a participar dos espaços de divulgação disponíveis',
      desc: 'Sua marca passa a ser exibida nas buscas, destaques, canais e vitrines da rede.',
      badge: 'Divulgação Ativa'
    }
  ];

  return (
    <section id="como-funciona" className="w-full py-16 md:py-24 bg-[#06060a] border-b border-white/5 relative overflow-hidden select-none">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-amber-400 text-xs font-mono font-black tracking-[0.2em] uppercase bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full inline-block mb-3">
            PROCESSO SIMPLES
          </span>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            COMO FUNCIONA?
          </h2>
          <p className="text-sm sm:text-base text-white/70 mt-3 max-w-2xl mx-auto font-medium">
            Você não precisa perder tempo configurando ferramentas complexas. Nossa equipe cuida de toda a organização da sua divulgação.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 max-w-6xl mx-auto">
          {steps.map((st, idx) => (
            <div 
              key={idx}
              className="bg-gradient-to-b from-[#111119] to-[#09090e] border border-white/10 hover:border-amber-500/50 rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-xl transition-all duration-300 hover:-translate-y-1 group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-black font-black text-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                    {st.num}
                  </span>
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    {st.badge}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-black text-white leading-snug group-hover:text-amber-300 transition-colors">
                  {st.title}
                </h3>
                <p className="text-xs text-white/70 mt-2.5 leading-relaxed">
                  {st.desc}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-white/5 text-[10px] font-mono text-white/40">
                Passo {st.num} de 5
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

// ==========================================
// 6. SEÇÃO: FAQ (Perguntas Frequentes)
// ==========================================
export const FaqSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'O que é o Minha Divulgação?',
      a: 'O Minha Divulgação é uma rede comercial criada para ajudar empresas a ampliarem sua presença e serem encontradas por pessoas que procuram produtos e serviços.'
    },
    {
      q: 'Quanto custa participar?',
      a: 'A assinatura oficial da rede custa R$ 49,90 por mês, sem custos ocultos e sem cobrança de comissões sobre as vendas que você realizar.'
    },
    {
      q: 'O pagamento é mensal?',
      a: 'Sim, a assinatura é recorrente mensal. Você tem total controle sobre sua continuidade, sem contratos de fidelidade que prendam seu negócio.'
    },
    {
      q: 'O que minha empresa recebe?',
      a: 'Sua empresa recebe presença completa no portal, perfil com fotos e descrição, link direto para seu WhatsApp comercial, inclusão nas buscas e categorias, participação na vitrine comercial e possibilidade de participação nos espaços comerciais da TV e Rádio Minha Divulgação.'
    },
    {
      q: 'Minha empresa pode ser encontrada no portal?',
      a: 'Sim! Os visitantes podem encontrar sua empresa filtrando por estado, buscando pelo nome do negócio, produtos, ramos de atividade ou navegando diretamente nas categorias comerciais.'
    },
    {
      q: 'Como faço para contratar?',
      a: 'Basta tocar no botão "QUERO DIVULGAR MINHA EMPRESA" para falar diretamente com nossa equipe no WhatsApp. Nós coletamos as informações da sua empresa e organizamos tudo para você.'
    },
    {
      q: 'Tenho garantia de clientes?',
      a: 'O Minha Divulgação oferece presença e divulgação dentro da rede. O resultado em vendas depende também da oferta, localização, atendimento, preço e outros fatores de cada empresa. Por isso, não prometemos vendas ou quantidade de clientes.'
    }
  ];

  return (
    <section id="faq" className="w-full py-16 md:py-24 bg-[#050508] border-b border-white/5 relative overflow-hidden select-none">
      <div className="w-full max-w-4xl mx-auto px-4 md:px-6 relative z-10">
        
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-amber-400 text-xs font-mono font-black tracking-[0.2em] uppercase bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full inline-block mb-3">
            TIRA-DÚVIDAS
          </span>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            PERGUNTAS FREQUENTES
          </h2>
          <p className="text-sm sm:text-base text-white/70 mt-3 font-medium">
            Respostas claras e transparentes sobre o funcionamento da rede Minha Divulgação.
          </p>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div 
                key={idx}
                className="bg-gradient-to-b from-[#11111a] to-[#09090f] border border-white/10 hover:border-amber-500/40 rounded-2xl overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full text-left px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="text-sm sm:text-base font-extrabold text-white">
                    {faq.q}
                  </span>
                  <span className={`w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center shrink-0 text-amber-400 transition-transform duration-200 ${isOpen ? 'rotate-180 bg-amber-500/15' : ''}`}>
                    <ChevronDown size={18} />
                  </span>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-white/80 leading-relaxed font-medium border-t border-white/5">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

// ==========================================
// 7. SEÇÃO: CTA FINAL (SUA EMPRESA JÁ ESTÁ NA REDE?)
// ==========================================
export const CtaFinalRedeSection: React.FC<{ primaryWaLink: string }> = ({ primaryWaLink }) => {
  return (
    <section className="w-full py-16 md:py-24 bg-gradient-to-b from-[#0a0a10] to-black border-b border-white/5 relative overflow-hidden select-none">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-amber-500/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="relative w-full max-w-4xl mx-auto px-4 md:px-6 text-center z-10">
        
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-widest mb-6">
          🚀 ENTRAR PARA A REDE
        </div>

        <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
          SUA EMPRESA JÁ ESTÁ NA REDE?
        </h2>

        <p className="text-sm sm:text-base md:text-lg text-white/80 font-medium max-w-2xl mx-auto mt-4 leading-relaxed">
          Entre para o Minha Divulgação e coloque sua empresa em uma rede criada para ampliar sua presença comercial.
        </p>

        <div className="mt-4 inline-flex items-baseline gap-2 bg-neutral-900/80 border border-white/10 px-5 py-2.5 rounded-2xl">
          <span className="text-xs font-mono text-white/60 uppercase">Assinatura:</span>
          <span className="text-xl sm:text-2xl font-black text-amber-400">R$ 49,90</span>
          <span className="text-xs text-white/60 uppercase font-mono">/mês</span>
          <span className="text-[11px] text-white/40 ml-2 hidden sm:inline">• Sem cadastro gratuito</span>
        </div>

        <div className="mt-8 flex justify-center">
          <a
            href={primaryWaLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:brightness-110 text-black px-8 py-5 rounded-2xl font-black text-sm sm:text-base uppercase tracking-wider transition-all duration-300 shadow-[0_12px_40px_rgba(245,158,11,0.35)] hover:scale-105 cursor-pointer decoration-transparent"
          >
            <span>QUERO DIVULGAR MINHA EMPRESA</span>
            <ArrowRight size={18} />
          </a>
        </div>

        <p className="text-xs text-white/40 font-mono mt-4">
          Fale diretamente com nossa equipe comercial pelo WhatsApp
        </p>

      </div>
    </section>
  );
};
