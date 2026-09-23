import React from 'react';
import { 
  CheckCircle2, 
  Sparkles, 
  Store, 
  Briefcase, 
  Search, 
  MessageSquare, 
  Smartphone, 
  Share2, 
  Tv, 
  Radio, 
  Video, 
  Layers, 
  Clock, 
  ShieldCheck, 
  Check, 
  ArrowRight,
  ExternalLink,
  PhoneCall,
  Flame,
  Wrench,
  Utensils,
  Scissors,
  Car,
  ShoppingBag,
  Stethoscope,
  Laptop
} from 'lucide-react';

interface DivulgacaoSectionsProps {
  primaryWaLink: string;
  price: string;
  period: string;
  features?: string[];
  onScrollToSearch: () => void;
  onlineSupportLink?: string;
}

// 1. SEGMENTOS ATENDIDOS (Diversos tipos de empresas e negócios)
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
          Divulgação para empresas de todos os portes e segmentos
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

// 2. SEÇÃO: DOIS PÚBLICOS (Para quem procura vs Para quem vende)
export const DoisPublicosSection: React.FC<{ primaryWaLink: string; onScrollToSearch: () => void }> = ({ 
  primaryWaLink, 
  onScrollToSearch 
}) => {
  return (
    <section id="publicos" className="w-full py-16 md:py-20 bg-gradient-to-b from-black via-[#08080e] to-black border-b border-white/5 relative overflow-hidden select-none">
      <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-amber-400 text-xs font-mono font-black tracking-[0.2em] uppercase bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-full inline-block mb-3">
            O PORTAL QUE CONECTA NEGÓCIOS
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Dois públicos. Uma só plataforma de divulgação.
          </h2>
          <p className="text-sm sm:text-base text-white/70 mt-3 max-w-2xl mx-auto">
            Criamos uma ponte direta entre quem procura produtos e serviços confiáveis e quem precisa divulgar sua empresa de forma profissional.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Card 1: Para quem procura */}
          <div className="relative bg-gradient-to-b from-[#101018] to-[#0a0a0f] border-2 border-white/10 hover:border-amber-500/40 rounded-3xl p-7 sm:p-9 flex flex-col justify-between shadow-2xl transition-all duration-300 group">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6 shadow-inner group-hover:scale-110 transition-transform">
                <Search size={26} />
              </div>
              <span className="text-[11px] font-mono font-extrabold uppercase tracking-widest text-amber-400/90 block mb-2">
                PARA QUEM PROCURA
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white leading-snug">
                Encontre empresas, produtos e serviços
              </h3>
              <p className="text-sm text-white/70 mt-3 leading-relaxed">
                Navegue pelo portal e encontre negócios e serviços com facilidade. Descubra contatos atualizados, catálogo de fotos, localização e fale direto pelo WhatsApp de cada anunciante.
              </p>

              <div className="mt-6 space-y-2.5 pt-6 border-t border-white/5">
                <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                  <span>Busca por cidade, estado, nome ou categoria</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                  <span>Acesso direto ao WhatsApp da empresa com um toque</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                  <span>Navegação 100% gratuita para clientes e visitantes</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onScrollToSearch}
              className="mt-8 w-full inline-flex items-center justify-center gap-2.5 bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/40 text-white px-6 py-4 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 shadow-lg cursor-pointer hover:scale-[1.02]"
            >
              <Search size={16} />
              <span>ENCONTRAR EMPRESAS AGORA</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Card 2: Para quem vende */}
          <div className="relative bg-gradient-to-b from-[#141422] to-[#0c0c16] border-2 border-amber-500/40 hover:border-amber-400 rounded-3xl p-7 sm:p-9 flex flex-col justify-between shadow-2xl transition-all duration-300 group">
            <div className="absolute top-4 right-5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black text-[9px] tracking-widest uppercase px-3 py-1 rounded-full shadow-lg">
              OPORTUNIDADE
            </div>

            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-black mb-6 shadow-xl group-hover:scale-110 transition-transform">
                <Sparkles size={26} />
              </div>
              <span className="text-[11px] font-mono font-extrabold uppercase tracking-widest text-amber-400 block mb-2">
                PARA QUEM VENDE
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white leading-snug">
                Divulgue sua empresa
              </h3>
              <p className="text-sm text-white/70 mt-3 leading-relaxed">
                Apresente sua empresa, produtos e serviços para pessoas que estão procurando negócios. Deixe que nós organizamos toda a sua presença para você se concentrar no seu atendimento.
              </p>

              <div className="mt-6 space-y-2.5 pt-6 border-t border-white/5">
                <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>Página e apresentação da sua empresa no portal</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>Espaço para produtos, serviços, fotos e WhatsApp</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>Exibição na TV e Rádio Online da plataforma</span>
                </div>
              </div>
            </div>

            <a
              href={primaryWaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 w-full inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:brightness-110 text-black px-6 py-4 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 shadow-[0_10px_30px_rgba(245,158,11,0.3)] cursor-pointer decoration-transparent hover:scale-[1.02] ring-2 ring-amber-400/40"
            >
              <span>QUERO DIVULGAR MINHA EMPRESA</span>
              <ArrowRight size={16} />
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};

// 3. SEÇÃO: COMO FUNCIONA (4 etapas simples)
export const ComoFuncionaSection: React.FC<{ primaryWaLink: string }> = ({ primaryWaLink }) => {
  const steps = [
    {
      num: '1',
      title: 'Escolha seu plano',
      desc: 'Escolha a opção de divulgação que melhor atende sua empresa.',
      icon: CheckCircle2,
      badge: 'Passo Inicial'
    },
    {
      num: '2',
      title: 'Envie as informações da sua empresa',
      desc: 'Nome, descrição, fotos, contatos, produtos ou serviços e demais informações necessárias.',
      icon: MessageSquare,
      badge: 'Envio Fácil'
    },
    {
      num: '3',
      title: 'Nós organizamos sua divulgação',
      desc: 'As informações são apresentadas de forma profissional dentro do Minha Divulgação.',
      icon: Layers,
      badge: 'Estruturação'
    },
    {
      num: '4',
      title: 'Sua empresa fica disponível para ser encontrada',
      desc: 'Clientes podem acessar as informações da sua empresa e entrar em contato.',
      icon: Store,
      badge: 'Divulgação Ativa'
    }
  ];

  return (
    <section id="como-funciona" className="w-full py-16 md:py-24 bg-[#050508] border-b border-white/5 relative overflow-hidden select-none">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-amber-400 text-xs font-mono font-black tracking-[0.2em] uppercase bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-full inline-block mb-3">
            PROCESSO SIMPLES E SEM COMPLICAÇÃO
          </span>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            COMO FUNCIONA?
          </h2>
          <p className="text-sm sm:text-base text-white/70 mt-3 max-w-2xl mx-auto">
            Você não precisa perder tempo aprendendo ferramentas complexas. Nossa equipe cuida de organizar a divulgação da sua empresa.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div 
                key={idx}
                className="relative bg-gradient-to-b from-[#111119] to-[#09090e] border border-white/10 hover:border-amber-500/50 rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-xl transition-all duration-300 group hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-black font-black text-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                      {step.num}
                    </span>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400/80 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                      {step.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-white leading-snug group-hover:text-amber-300 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/70 mt-3 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-white/40 text-xs font-mono">
                  <Icon size={14} className="text-amber-400" />
                  <span>Etapa {step.num} de 4</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

// 4. SEÇÃO: BENEFÍCIOS ("DEIXE SUA DIVULGAÇÃO COM A GENTE")
export const BeneficiosSection: React.FC<{ primaryWaLink: string }> = ({ primaryWaLink }) => {
  const benefits = [
    {
      title: 'Presença em uma plataforma de divulgação',
      desc: 'Sua empresa inserida em uma plataforma ativa e focada exclusivamente em negócios e serviços.',
      icon: Store
    },
    {
      title: 'Página e apresentação da empresa',
      desc: 'Um espaço limpo e profissional para apresentar sua marca com identidade visual clara.',
      icon: Briefcase
    },
    {
      title: 'Espaço para produtos e serviços',
      desc: 'Apresente suas principais ofertas, catálogo de serviços e especialidades para quem visita.',
      icon: ShoppingBag
    },
    {
      title: 'Fotos e informações da empresa',
      desc: 'Galeria visual com fotos do estabelecimento, produtos, diferenciais e informações operacionais.',
      icon: Layers
    },
    {
      title: 'Link direto para WhatsApp',
      desc: 'O cliente clica e já inicia a conversa direto com seu atendimento, sem intermediários.',
      icon: MessageSquare
    },
    {
      title: 'Informações completas de contato',
      desc: 'Endereço, horários, localização geográfica, telefone e redes sociais centralizados.',
      icon: PhoneCall
    },
    {
      title: 'Divulgação organizada e profissional',
      desc: 'Seu negócio apresentado de forma estruturada para passar credibilidade imediata ao público.',
      icon: ShieldCheck
    }
  ];

  return (
    <section id="beneficios" className="w-full py-16 md:py-24 bg-gradient-to-b from-black via-[#0a0a12] to-black border-b border-white/5 relative overflow-hidden select-none">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-amber-400 text-xs font-mono font-black tracking-[0.2em] uppercase bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-full inline-block mb-3">
            VANTAGENS REAIS
          </span>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            DEIXE SUA DIVULGAÇÃO COM A GENTE
          </h2>
          <p className="text-sm sm:text-base text-white/70 mt-3 max-w-2xl mx-auto">
            Tudo o que sua empresa precisa para ter uma apresentação comercial de qualidade na internet.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {benefits.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div 
                key={idx}
                className={`bg-[#0d0e15] border border-white/10 hover:border-amber-500/40 rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-xl transition-all duration-300 group hover:-translate-y-1 ${
                  idx === 6 ? 'md:col-span-2 lg:col-span-3 lg:max-w-xl lg:mx-auto' : ''
                }`}
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Icon size={22} />
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white leading-snug group-hover:text-amber-300 transition-colors">
                    {b.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/70 mt-2.5 leading-relaxed">
                    {b.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-white/5 flex items-center gap-1.5 text-[11px] font-mono font-bold text-emerald-400">
                  <Check size={14} />
                  <span>Benefício incluso</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <a
            href={primaryWaLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:brightness-110 text-black px-8 py-4 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 shadow-[0_10px_35px_rgba(245,158,11,0.3)] cursor-pointer decoration-transparent hover:scale-105"
          >
            <span>DIVULGUE SUA EMPRESA</span>
            <ArrowRight size={16} />
          </a>
        </div>

      </div>
    </section>
  );
};

// 5. SEÇÃO: DIFERENCIAL ("VOCÊ CUIDA DO SEU NEGÓCIO. NÓS CUIDAMOS DA DIVULGAÇÃO.")
export const DiferencialSection: React.FC<{ primaryWaLink: string }> = ({ primaryWaLink }) => {
  return (
    <section id="diferencial" className="w-full py-16 md:py-24 bg-[#050508] border-b border-white/5 relative overflow-hidden select-none">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-[#141424] via-[#1a1828] to-[#141424] border-2 border-amber-500/40 rounded-3xl p-8 sm:p-12 md:p-14 shadow-2xl relative overflow-hidden">
          {/* Top highlight bar */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500" />
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-12">
            <div className="flex-1 text-center lg:text-left">
              <span className="text-amber-400 text-xs font-mono font-black tracking-[0.2em] uppercase bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 rounded-full inline-block mb-4">
                FOCO NO QUE IMPORTA
              </span>
              
              <h2 className="text-2xl sm:text-4xl md:text-4xl font-black text-white tracking-tight leading-tight">
                VOCÊ CUIDA DO SEU NEGÓCIO.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500">
                  NÓS CUIDAMOS DA DIVULGAÇÃO.
                </span>
              </h2>

              <p className="text-sm sm:text-base text-white/80 mt-5 leading-relaxed font-medium">
                Você já tem uma empresa para administrar. Não precisa passar horas pensando em como apresentar seu negócio na internet.
              </p>

              <p className="text-sm sm:text-base text-white/80 mt-3 leading-relaxed font-medium">
                Nós organizamos sua presença no <strong className="text-white">Minha Divulgação</strong> para que sua empresa tenha um espaço profissional para apresentar seus produtos e serviços.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-7 text-left">
                <div className="bg-black/30 border border-white/10 rounded-2xl p-3.5 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 font-bold">
                    ✓
                  </span>
                  <span className="text-xs font-bold text-white/90">Sem precisar aprender ferramentas difíceis</span>
                </div>
                <div className="bg-black/30 border border-white/10 rounded-2xl p-3.5 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 font-bold">
                    ✓
                  </span>
                  <span className="text-xs font-bold text-white/90">Sem perder tempo montando páginas sozinho</span>
                </div>
                <div className="bg-black/30 border border-white/10 rounded-2xl p-3.5 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 font-bold">
                    ✓
                  </span>
                  <span className="text-xs font-bold text-white/90">Você envia as informações e nós estruturamos</span>
                </div>
                <div className="bg-black/30 border border-white/10 rounded-2xl p-3.5 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 font-bold">
                    ✓
                  </span>
                  <span className="text-xs font-bold text-white/90">Link direto para seu WhatsApp comercial</span>
                </div>
              </div>
            </div>

            <div className="shrink-0 w-full lg:w-auto flex flex-col items-center">
              <a
                href={primaryWaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:brightness-110 text-black px-8 py-5 rounded-2xl font-black text-sm sm:text-base uppercase tracking-wider transition-all duration-300 shadow-[0_15px_40px_rgba(245,158,11,0.35)] cursor-pointer decoration-transparent hover:scale-105 active:scale-95"
              >
                <span>QUERO DIVULGAR MINHA EMPRESA</span>
                <ArrowRight size={18} />
              </a>
              <span className="text-[11px] text-white/50 font-mono mt-3 text-center">
                Atendimento direto via WhatsApp comercial
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

// 6. SEÇÃO: PLANOS (Preço real do site, benefícios reais)
export const PlanosSection: React.FC<{ 
  primaryWaLink: string; 
  price: string; 
  period: string; 
  features?: string[];
}> = ({ 
  primaryWaLink, 
  price, 
  period,
  features 
}) => {
  const defaultFeatures = [
    'Sua empresa presente na plataforma Minha Divulgação',
    'Página de apresentação exclusiva da sua empresa',
    'Espaço para exibir produtos, serviços e fotos',
    'Botão com link direto para seu WhatsApp comercial',
    'Informações completas de contato, endereço e horários',
    'Presença no catálogo e busca de empresas do portal',
    'Exibição na TV e Rádio Online da plataforma',
    'Divulgação ativa 24 horas por dia'
  ];

  const actualFeatures = (features && features.length > 0) ? features : defaultFeatures;

  return (
    <section id="planos" className="w-full py-16 md:py-24 bg-gradient-to-b from-black via-[#08080f] to-black border-b border-white/5 relative overflow-hidden select-none">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-amber-500/5 rounded-full blur-[160px] pointer-events-none" />
      
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-amber-400 text-xs font-mono font-black tracking-[0.2em] uppercase bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-full inline-block mb-3">
            CONDIÇÃO COMERCIAL
          </span>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            PLANO DE DIVULGAÇÃO
          </h2>
          <p className="text-base sm:text-lg text-amber-300/90 font-bold mt-2">
            Sua empresa presente no Minha Divulgação.
          </p>
          <p className="text-sm text-white/60 mt-2 max-w-xl mx-auto">
            Apresentação comercial organizada, moderna e acessível para o seu negócio ser encontrado por clientes.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto items-stretch">
          
          {/* Main Active Plan Card */}
          <div className="lg:col-span-8 bg-gradient-to-b from-[#141422] to-[#0c0c16] border-2 border-amber-400 rounded-3xl p-7 sm:p-10 shadow-[0_15px_50px_rgba(245,158,11,0.15)] flex flex-col justify-between relative">
            <div className="absolute -top-3.5 right-8 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black text-[10px] sm:text-xs tracking-widest uppercase px-4 py-1.5 rounded-full shadow-lg">
              PLANO PRINCIPAL
            </div>

            <div>
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 mb-6 pb-6 border-b border-white/10">
                <div>
                  <span className="text-xs font-mono font-black uppercase tracking-wider text-amber-400">
                    DIVULGAÇÃO COMPLETA
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">
                    Divulgação Minha Divulgação
                  </h3>
                </div>

                <div className="text-left sm:text-right">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-black text-amber-400">R$</span>
                    <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                      {price || '59,90'}
                    </span>
                    <span className="text-xs sm:text-sm font-black text-white/60 uppercase">
                      / {period || 'MÊS'}
                    </span>
                  </div>
                  <span className="text-[11px] text-white/50 font-mono block mt-1">
                    Sem fidelidade • Contratação direta
                  </span>
                </div>
              </div>

              {/* Features list */}
              <div className="space-y-3.5 my-6">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-white/50 block mb-3">
                  Benefícios reais inclusos na sua divulgação:
                </span>
                {actualFeatures.map((feat, idx) => (
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

            <div className="mt-8 pt-6 border-t border-white/10">
              <a
                href={primaryWaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:brightness-110 text-black px-8 py-5 rounded-2xl font-black text-sm sm:text-base uppercase tracking-wider transition-all duration-300 shadow-[0_10px_30px_rgba(245,158,11,0.35)] cursor-pointer decoration-transparent hover:scale-[1.02] active:scale-95"
              >
                <span>QUERO DIVULGAR MINHA EMPRESA</span>
                <ArrowRight size={18} />
              </a>
              <p className="text-center text-[11px] text-white/50 font-mono mt-3">
                Fale diretamente com nossa equipe comercial no WhatsApp
              </p>
            </div>
          </div>

          {/* Secondary Card (Prepared for future custom plans & packages) */}
          <div className="lg:col-span-4 bg-gradient-to-b from-[#0e0e16] to-[#08080d] border border-white/10 rounded-3xl p-7 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[10px] font-mono font-bold text-white/60 uppercase mb-4">
                <span>⚡ ESTRUTURA PREPARADA</span>
              </div>

              <h4 className="text-lg sm:text-xl font-black text-white leading-snug">
                Planos Personalizados & Redes
              </h4>

              <p className="text-xs text-white/70 mt-3 leading-relaxed">
                Possui mais de uma unidade, franquia ou precisa de um projeto específico de divulgação para sua região?
              </p>

              <div className="mt-6 space-y-2.5 pt-4 border-t border-white/5 text-xs text-white/70">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-amber-400 shrink-0" />
                  <span>Divulgação para múltiplas unidades</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-amber-400 shrink-0" />
                  <span>Projetos comerciais customizados</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-amber-400 shrink-0" />
                  <span>Atendimento dedicado para empresas</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5">
              <a
                href={primaryWaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/15 text-white/90 hover:text-white px-5 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer decoration-transparent"
              >
                <span>Falar com Comercial</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

// 7. SEÇÃO: ÁUDIO E VÍDEO ("DIVULGAÇÃO COM CONTEÚDO PROFISSIONAL")
export const AudioVideoSection: React.FC<{ primaryWaLink: string }> = ({ primaryWaLink }) => {
  return (
    <section id="audio-e-video" className="w-full py-16 md:py-20 bg-[#050508] border-b border-white/5 relative overflow-hidden select-none">
      <div className="w-full max-w-5xl mx-auto px-4 md:px-6 relative z-10">
        
        <div className="bg-gradient-to-r from-[#0d0d17] via-[#121124] to-[#0d0d17] border border-amber-500/30 rounded-3xl p-7 sm:p-10 md:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 rounded-full text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest mb-4">
              <Video size={13} />
              <span>PRODUÇÃO AUDIOVISUAL</span>
            </div>

            <h3 className="text-xl sm:text-3xl font-black text-white leading-tight">
              DIVULGAÇÃO COM CONTEÚDO PROFISSIONAL
            </h3>

            <p className="text-sm text-white/80 mt-3 leading-relaxed max-w-xl font-medium">
              Sua empresa também poderá contar com materiais de divulgação, como vídeos promocionais e conteúdos produzidos profissionalmente.
            </p>

            <p className="text-xs text-white/50 mt-2 font-mono">
              * Espaço preparado para produção audiovisual sob demanda. Consulte opções e disponibilidade com a equipe comercial.
            </p>
          </div>

          <div className="shrink-0 w-full md:w-auto">
            <a
              href={primaryWaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full md:w-auto inline-flex items-center justify-center gap-2.5 bg-amber-500/15 hover:bg-amber-500/25 border-2 border-amber-500/40 hover:border-amber-400 text-amber-300 hover:text-amber-200 px-6 py-4 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 shadow-md cursor-pointer decoration-transparent hover:scale-105"
            >
              <Video size={16} />
              <span>CONSULTAR PRODUÇÃO DE VÍDEO</span>
            </a>
          </div>

        </div>

      </div>
    </section>
  );
};
