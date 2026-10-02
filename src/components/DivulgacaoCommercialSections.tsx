import React, { useState } from 'react';
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
  Briefcase
} from 'lucide-react';

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
        
        {/* Título da Seção - Seção 3 do Brief */}
        <div className="text-center max-w-4xl mx-auto mb-12 sm:mb-16">
          <span className="text-amber-400 text-[10px] sm:text-xs font-mono font-black tracking-[0.2em] uppercase bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full inline-block mb-4">
            OPORTUNIDADE DE SER ENCONTRADO
          </span>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            ENQUANTO SUA EMPRESA NÃO APARECE, ELA PODE ESTAR PERDENDO VISIBILIDADE.
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-white/80 mt-4 leading-relaxed max-w-3xl mx-auto font-medium">
            Seu negócio tem produtos, serviços, histórias e ofertas que merecem ser conhecidos.
          </p>
          <p className="text-sm sm:text-base text-white/70 mt-2 leading-relaxed max-w-3xl mx-auto">
            No Minha Divulgação, sua empresa ganha um espaço para apresentar o que faz, mostrar sua marca e ampliar sua presença no ambiente digital. Porque não basta ter uma boa empresa. Também é importante criar oportunidades para que as pessoas conheçam seu negócio.
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
  const steps = [
    {
      num: '1',
      title: 'ESCOLHA SEU ESPAÇO',
      desc: 'Sua empresa faz o cadastro com seus dados principais, contatos e fotos.'
    },
    {
      num: '2',
      title: 'ORGANIZAÇÃO DO PERFIL',
      desc: 'Os materiais e informações da sua empresa são preparados para exibição no portal.'
    },
    {
      num: '3',
      title: 'PRESENÇA NO PORTAL',
      desc: 'Seu negócio fica em destaque na vitrine comercial para ser conhecido pelo público.'
    },
    {
      num: '4',
      title: 'CONTATO DIRETO',
      desc: 'Pessoas interessadas nos seus produtos e serviços encontram seu WhatsApp.'
    }
  ];

  return (
    <section id="como-funciona" className="w-full py-16 sm:py-24 bg-[#06060a] border-b border-white/5 relative overflow-hidden select-none">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        
        {/* Título da Seção - Seção 4 do Brief */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-amber-400 text-[10px] sm:text-xs font-mono font-black tracking-[0.2em] uppercase bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full inline-block mb-3">
            O VALOR DO PORTAL
          </span>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            SUA EMPRESA TEM UM LUGAR AQUI.
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-white/80 mt-4 max-w-2xl mx-auto font-medium leading-relaxed">
            O Minha Divulgação é um portal criado para dar espaço aos negócios, apresentar empresas e divulgar produtos, serviços e ofertas.
          </p>
          <p className="text-xs sm:text-sm text-white/70 mt-2 max-w-2xl mx-auto leading-relaxed">
            Queremos que o empreendedor tenha mais uma maneira de mostrar sua empresa, fortalecer sua presença digital e participar de um ambiente voltado à divulgação comercial.
          </p>
        </div>

        {/* 4 Passos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
          {steps.map((st, idx) => (
            <div 
              key={idx}
              className="bg-gradient-to-b from-[#111119] to-[#09090e] border border-white/10 hover:border-amber-500/40 rounded-3xl p-6 flex flex-col justify-between shadow-xl transition-all duration-300 hover:-translate-y-1 group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-black font-black text-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                    {st.num}
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400/90 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
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

              <div className="mt-5 pt-3 border-t border-white/5 text-[10px] font-mono text-white/40">
                Presença comercial ativa
              </div>
            </div>
          ))}
        </div>

        {/* Frase de Destaque */}
        <div className="mt-10 max-w-2xl mx-auto bg-gradient-to-r from-[#171308] via-[#211a0a] to-[#171308] border-2 border-amber-400/40 rounded-2xl p-4 sm:p-5 text-center shadow-lg">
          <p className="text-xs sm:text-sm md:text-base text-amber-300 font-extrabold">
            💡 Mais do que uma página de serviço: um espaço para seu negócio ser visto e lembrado.
          </p>
        </div>

      </div>
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
      desc: 'Quando incluída e disponível na operação.',
      highlight: 'Canais Parceiros'
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
        
        {/* Header - 4. CONVITE PARA ANUNCIAR */}
        <div className="max-w-3xl mx-auto mb-8 sm:mb-12">
          <span className="text-amber-400 text-[10px] sm:text-xs font-mono font-black tracking-[0.2em] uppercase bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full inline-block mb-3">
            DIVULGUE SUA EMPRESA
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            Sua empresa também pode aparecer aqui.
          </h2>
          <p className="text-base sm:text-lg text-white/80 font-medium mt-3 leading-relaxed max-w-2xl mx-auto">
            Apresente seus produtos, divulgue suas ofertas e tenha mais um espaço para fortalecer sua presença digital.
          </p>
        </div>

        {/* Card de Preço Destacado */}
        <div className="max-w-xl mx-auto bg-gradient-to-b from-[#161626] via-[#10101b] to-[#0b0b12] border-2 border-amber-400 rounded-3xl p-7 sm:p-10 shadow-[0_15px_50px_rgba(245,158,11,0.25)]">
          
          <span className="text-[10px] sm:text-xs font-mono font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full inline-block mb-4">
            ASSINATURA COMERCIAL
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
            Apresentação comercial e presença contínua para sua empresa.
          </p>

          <div className="mt-7 flex flex-col gap-3">
            {onCadastrarClick ? (
              <button
                type="button"
                onClick={onCadastrarClick}
                className="w-full inline-flex items-center justify-center gap-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:brightness-110 text-black px-8 py-5 rounded-2xl font-black text-sm sm:text-base uppercase tracking-wider transition-all duration-300 shadow-[0_10px_35px_rgba(245,158,11,0.35)] cursor-pointer hover:scale-105 active:scale-95"
              >
                <span>QUERO PARTICIPAR</span>
                <ArrowRight size={18} />
              </button>
            ) : (
              <a
                href={primaryWaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:brightness-110 text-black px-8 py-5 rounded-2xl font-black text-sm sm:text-base uppercase tracking-wider transition-all duration-300 shadow-[0_10px_35px_rgba(245,158,11,0.35)] cursor-pointer decoration-transparent hover:scale-105 active:scale-95"
              >
                <span>QUERO PARTICIPAR</span>
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
              <span>QUERO MINHA EMPRESA AQUI</span>
              <ArrowRight size={18} />
            </button>
          ) : (
            <a
              href={primaryWaLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:brightness-110 text-black px-8 sm:px-10 py-5 rounded-2xl font-black text-sm sm:text-base uppercase tracking-wider transition-all duration-300 shadow-[0_12px_40px_rgba(245,158,11,0.35)] hover:scale-105 cursor-pointer decoration-transparent"
            >
              <span>QUERO MINHA EMPRESA AQUI</span>
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
