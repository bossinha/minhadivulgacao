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
// 2. SEÇÃO: O QUE SUA EMPRESA GANHA?
// ==========================================
export const OQueSuaEmpresaGanhaSection: React.FC = () => {
  const cards = [
    {
      icon: Search,
      badge: 'BUSCA',
      title: 'APAREÇA NAS BUSCAS',
      desc: 'Sua empresa pode ser encontrada por clientes procurando produtos e serviços.',
      color: 'from-amber-500/20 to-amber-500/5 text-amber-400 border-amber-500/30'
    },
    {
      icon: Smartphone,
      badge: 'CONTATO',
      title: 'WHATSAPP DIRETO',
      desc: 'O cliente encontra sua empresa e pode entrar em contato diretamente.',
      color: 'from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/30'
    },
    {
      icon: Star,
      badge: 'DESTAQUE',
      title: 'MAIS VISIBILIDADE',
      desc: 'Participe dos espaços de destaque da rede para atrair novos clientes.',
      color: 'from-amber-400/20 to-yellow-500/5 text-yellow-400 border-yellow-500/30'
    },
    {
      icon: Flame,
      badge: 'OFERTAS',
      title: 'OFERTAS E PROMOÇÕES',
      desc: 'Divulgue ofertas e promoções para chamar atenção do seu público.',
      color: 'from-red-500/20 to-orange-500/5 text-orange-400 border-orange-500/30'
    },
    {
      icon: Tv,
      badge: 'CANAL DE TV',
      title: 'TV MINHA DIVULGAÇÃO',
      desc: 'Sua empresa pode aparecer nos espaços de destaque da rede na TV.',
      color: 'from-blue-500/20 to-cyan-500/5 text-cyan-400 border-cyan-500/30'
    },
    {
      icon: Radio,
      badge: 'RÁDIO WEB',
      title: 'RÁDIO MINHA DIVULGAÇÃO',
      desc: 'Participação na programação e divulgação de ofertas na rádio da rede.',
      color: 'from-purple-500/20 to-pink-500/5 text-purple-400 border-purple-500/30'
    }
  ];

  return (
    <section id="beneficios" className="w-full py-14 sm:py-20 bg-gradient-to-b from-black via-[#08080f] to-black border-b border-white/5 relative overflow-hidden select-none">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        
        {/* Título da Seção */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <span className="text-amber-400 text-[10px] sm:text-xs font-mono font-black tracking-[0.2em] uppercase bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full inline-block mb-3">
            VANTAGENS EXCLUSIVAS
          </span>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            O QUE SUA EMPRESA GANHA?
          </h2>
          <p className="text-sm sm:text-base text-white/70 mt-3 font-medium max-w-xl mx-auto">
            Benefícios práticos criados para colocar seu negócio em evidência e gerar contatos reais.
          </p>
        </div>

        {/* Grid de 6 Cards Visuais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
          {cards.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx}
                className="bg-gradient-to-b from-[#11111a] to-[#09090f] border border-white/10 hover:border-amber-500/40 rounded-3xl p-6 flex flex-col justify-between shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} border flex items-center justify-center group-hover:scale-105 transition-transform`}>
                      <Icon size={22} />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-white leading-snug group-hover:text-amber-300 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-white/70 mt-2.5 leading-relaxed font-medium">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-white/5 flex items-center gap-1.5 text-emerald-400 text-[11px] font-mono font-bold">
                  <CheckCircle2 size={13} className="shrink-0" />
                  <span>Incluso na rede</span>
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
// 3. SEÇÃO: COMO FUNCIONA?
// ==========================================
export const ComoFuncionaSection: React.FC = () => {
  const steps = [
    {
      num: '1',
      emoji: '1️⃣',
      title: 'VOCÊ ENTRA NA REDE',
      desc: 'Escolha divulgar sua empresa no Minha Divulgação.'
    },
    {
      num: '2',
      emoji: '2️⃣',
      title: 'NÓS PREPARAMOS SEU CADASTRO',
      desc: 'Você envia os dados da empresa e nossa equipe deixa tudo pronto.'
    },
    {
      num: '3',
      emoji: '3️⃣',
      title: 'SUA EMPRESA FICA DISPONÍVEL',
      desc: 'Seu negócio passa a fazer parte da rede Minha Divulgação.'
    },
    {
      num: '4',
      emoji: '4️⃣',
      title: 'CLIENTES ENCONTRAM VOCÊ',
      desc: 'O cliente pode encontrar sua empresa e entrar em contato pelo WhatsApp.'
    }
  ];

  return (
    <section id="como-funciona" className="w-full py-14 sm:py-20 bg-[#06060a] border-b border-white/5 relative overflow-hidden select-none">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <span className="text-amber-400 text-[10px] sm:text-xs font-mono font-black tracking-[0.2em] uppercase bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full inline-block mb-3">
            PASSO A PASSO
          </span>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            COMO FUNCIONA?
          </h2>
          <p className="text-sm sm:text-base text-white/70 mt-3 max-w-xl mx-auto font-medium">
            Tudo é organizado de forma simples, direta e sem complicações.
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
                Processo ágil e transparente
              </div>
            </div>
          ))}
        </div>

        {/* Frase de Destaque Obrigatória */}
        <div className="mt-10 max-w-2xl mx-auto bg-gradient-to-r from-[#171308] via-[#211a0a] to-[#171308] border-2 border-amber-400/40 rounded-2xl p-4 sm:p-5 text-center shadow-lg">
          <p className="text-xs sm:text-sm md:text-base text-amber-300 font-extrabold">
            💡 Você não precisa entender de tecnologia. Nós cuidamos do cadastro.
          </p>
        </div>

      </div>
    </section>
  );
};

// ==========================================
// 4. SEÇÃO: ONDE SUA EMPRESA APARECE?
// ==========================================
export const OndeSuaEmpresaApareceSection: React.FC = () => {
  const canais = [
    {
      icon: Search,
      title: 'Portal Minha Divulgação',
      desc: 'Nas buscas por empresas, produtos e serviços.',
      highlight: 'Busca Otimizada'
    },
    {
      icon: Star,
      title: 'Vitrine de Parceiros',
      desc: 'Espaços de destaque para empresas participantes.',
      highlight: 'Visibilidade'
    },
    {
      icon: Flame,
      title: 'Ofertas e Promoções',
      desc: 'Divulgação de ofertas das empresas anunciantes.',
      highlight: 'Promoções'
    },
    {
      icon: Tv,
      title: 'TV Minha Divulgação',
      desc: 'Promoções, anúncios e empresas em destaque.',
      highlight: 'Canal de TV 24h'
    },
    {
      icon: Radio,
      title: 'Rádio Minha Divulgação',
      desc: 'Programação e ofertas da rede.',
      highlight: 'Rádio Web'
    }
  ];

  return (
    <section id="onde-aparece" className="w-full py-14 sm:py-20 bg-gradient-to-b from-black via-[#090912] to-black border-b border-white/5 relative overflow-hidden select-none">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <span className="text-amber-400 text-[10px] sm:text-xs font-mono font-black tracking-[0.2em] uppercase bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full inline-block mb-3">
            CANAIS DA REDE
          </span>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            ONDE SUA EMPRESA SERÁ DIVULGADA?
          </h2>
          <p className="text-sm sm:text-base text-white/70 mt-3 max-w-xl mx-auto font-medium">
            Conheça os pontos de exibição da sua empresa dentro da nossa rede integrada.
          </p>
        </div>

        {/* 5 Cards de Onde Aparece */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5 max-w-6xl mx-auto">
          {canais.map((c, idx) => {
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
                  <span>Espaço garantido</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Frase de Fechamento */}
        <div className="mt-8 text-center">
          <span className="inline-block bg-neutral-900/90 border border-white/10 text-amber-300 text-xs sm:text-sm font-bold font-mono px-5 py-2 rounded-xl">
            ✨ Tudo dentro da rede Minha Divulgação.
          </span>
        </div>

      </div>
    </section>
  );
};

// ==========================================
// 7. SEÇÃO DE PREÇO: SUA EMPRESA NA REDE (R$ 49,90/mês)
// ==========================================
export const PlanoPrecoSection: React.FC<{ primaryWaLink?: string; onCadastrarClick?: () => void }> = ({ 
  primaryWaLink = DEFAULT_WA_LINK,
  onCadastrarClick
}) => {
  return (
    <section id="planos" className="w-full py-16 md:py-24 bg-gradient-to-b from-black via-[#0a0a14] to-black border-b border-white/5 relative overflow-hidden select-none">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-amber-500/10 rounded-full blur-[170px] pointer-events-none" />

      <div className="w-full max-w-4xl mx-auto px-4 md:px-6 relative z-10 text-center">
        
        {/* Header */}
        <div className="max-w-2xl mx-auto mb-8 sm:mb-10">
          <span className="text-amber-400 text-[10px] sm:text-xs font-mono font-black tracking-[0.2em] uppercase bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full inline-block mb-3">
            ASSINATURA COMERCIAL
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            SUA EMPRESA NA REDE
          </h2>
          <p className="text-base sm:text-lg text-white/80 font-medium mt-3">
            Tenha seu espaço comercial dentro da rede Minha Divulgação.
          </p>
        </div>

        {/* Card de Preço Destacado */}
        <div className="max-w-xl mx-auto bg-gradient-to-b from-[#161626] via-[#10101b] to-[#0b0b12] border-2 border-amber-400 rounded-3xl p-7 sm:p-10 shadow-[0_15px_50px_rgba(245,158,11,0.25)]">
          
          <span className="text-[10px] sm:text-xs font-mono font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full inline-block mb-4">
            PLANO MENSAL
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
            Sem precisar criar ou administrar tudo sozinho. Prévia de 24h para seu perfil.
          </p>

          <div className="mt-7 flex flex-col gap-3">
            {onCadastrarClick ? (
              <button
                type="button"
                onClick={onCadastrarClick}
                className="w-full inline-flex items-center justify-center gap-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:brightness-110 text-black px-8 py-5 rounded-2xl font-black text-sm sm:text-base uppercase tracking-wider transition-all duration-300 shadow-[0_10px_35px_rgba(245,158,11,0.35)] cursor-pointer hover:scale-105 active:scale-95"
              >
                <span>🚀 CADASTRAR & TESTAR 24H</span>
                <ArrowRight size={18} />
              </button>
            ) : (
              <a
                href={primaryWaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:brightness-110 text-black px-8 py-5 rounded-2xl font-black text-sm sm:text-base uppercase tracking-wider transition-all duration-300 shadow-[0_10px_35px_rgba(245,158,11,0.35)] cursor-pointer decoration-transparent hover:scale-105 active:scale-95"
              >
                <span>QUERO ENTRAR NA REDE</span>
                <ArrowRight size={18} />
              </a>
            )}

            <a
              href={primaryWaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-white/70 hover:text-amber-300 font-medium py-1.5 flex items-center justify-center gap-1.5 decoration-transparent transition-colors"
            >
              <span>💬 Ou fale direto no WhatsApp com nossa equipe</span>
            </a>

            <p className="text-[11px] text-white/50 font-mono mt-1">
              Pagamento facilitado via Cartão de Crédito ou Pix • Ativação rápida com suporte
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};

// ==========================================
// 8. SEÇÃO: CTA FINAL
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
          🚀 PARTICIPE DA REDE
        </div>

        <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
          SUA EMPRESA PODE ESTAR AQUI.
        </h2>

        <p className="text-sm sm:text-base md:text-lg text-white/80 font-medium max-w-2xl mx-auto mt-4 leading-relaxed">
          Faça parte da rede Minha Divulgação e facilite para novos clientes encontrarem seu negócio na sua cidade.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          {onCadastrarClick ? (
            <button
              type="button"
              onClick={onCadastrarClick}
              className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:brightness-110 text-black px-8 sm:px-10 py-5 rounded-2xl font-black text-sm sm:text-base uppercase tracking-wider transition-all duration-300 shadow-[0_12px_40px_rgba(245,158,11,0.35)] hover:scale-105 cursor-pointer"
            >
              <span>🚀 CADASTRAR MINHA EMPRESA</span>
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

        <p className="text-xs text-white/40 font-mono mt-4">
          Cadastro com prévia imediata de 24 horas • Suporte rápido pelo WhatsApp
        </p>

      </div>
    </section>
  );
};
