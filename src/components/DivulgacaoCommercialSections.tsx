import React from 'react';
import { 
  Search, 
  Smartphone, 
  Store, 
  Layers, 
  Utensils, 
  Scissors, 
  Wrench, 
  Car, 
  ShoppingBag, 
  Stethoscope, 
  Briefcase, 
  ArrowRight, 
  Check, 
  Sparkles, 
  Building2, 
  Megaphone, 
  Users, 
  Share2, 
  CheckCircle2, 
  ShieldCheck, 
  Tv, 
  Radio, 
  ExternalLink,
  Info
} from 'lucide-react';
import { WhatsAppIcon, FacebookIcon } from './SocialMediaIcons';

const DEFAULT_WA_LINK = `https://wa.me/5585992862177?text=${encodeURIComponent(
  "Olá! Gostaria de obter informações sobre a divulgação da minha empresa no portal Minha Divulgação.\n\nTenho interesse no plano comercial de R$ 49,90/mês. Poderia me orientar sobre o cadastro e a ativação, por gentileza?"
)}`;

const DEFAULT_EXCLUSIVE_WA_LINK = `https://wa.me/5585992862177?text=${encodeURIComponent(
  "Olá! Gostaria de consultar informações sobre a Divulgação Exclusiva para a minha empresa (campanhas feitas especificamente para o meu negócio, separadas da divulgação coletiva do portal Minha Divulgação). Poderiam me orientar com opções e valores?"
)}`;

// ==========================================
// 1. ILUSTRAÇÃO VISUAL AUTOEXPLICATIVA DO HERO
// Mostra uma empresa dentro do portal conectada a:
// WhatsApp, Facebook e Anúncios Online
// ==========================================
export const HeroPortalIllustration: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto mt-10 mb-4 select-none">
      <div className="relative rounded-3xl bg-gradient-to-b from-[#151726] via-[#0d0e18] to-[#08080f] border-2 border-amber-400/40 p-5 sm:p-7 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden">
        
        {/* Glow de fundo */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Barra superior de janela de navegador */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500/70 inline-block" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/70 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/70 inline-block" />
            <span className="text-[11px] font-mono text-white/50 ml-2 hidden sm:inline-block">
              minhadivulgacao.com.br
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>Sua Empresa Conectada na Internet</span>
          </div>
        </div>

        {/* Estrutura central: A Empresa no Portal e a Conexão com os Canais */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          
          {/* Card Principal da Empresa no Portal (Simulação de Perfil) */}
          <div className="lg:col-span-6 bg-[#0a0b12] border border-amber-400/50 rounded-2xl p-5 shadow-xl relative overflow-hidden">
            <div className="flex items-start gap-3.5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-lg shrink-0 flex items-center justify-center text-black font-black text-xl">
                <Store size={28} className="text-black" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-black text-amber-400 uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    Sua Empresa no Portal
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400 font-bold">
                    ✔ Ativa
                  </span>
                </div>
                <h4 className="text-base sm:text-lg font-black text-white mt-1 truncate">
                  Nome do Seu Negócio
                </h4>
                <p className="text-xs text-white/70 line-clamp-1 mt-0.5">
                  Apresente sua marca, produtos, serviços e promoções
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3.5 border-t border-white/5 grid grid-cols-2 gap-2 text-[11px] text-white/80">
              <div className="flex items-center gap-1.5 bg-white/[0.03] p-2 rounded-xl border border-white/5">
                <span className="text-amber-400">⭐</span>
                <span>Vitrine Comercial</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/[0.03] p-2 rounded-xl border border-white/5">
                <span className="text-emerald-400">📍</span>
                <span>Buscas no Portal</span>
              </div>
            </div>

            {/* Simulação do botão de WhatsApp direto */}
            <div className="mt-4 bg-emerald-500/20 border border-emerald-500/40 rounded-xl p-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                <WhatsAppIcon className="w-4 h-4 fill-emerald-400 shrink-0" />
                <span>Contato Direto no WhatsApp</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/30 px-2 py-0.5 rounded">
                Sem Taxas
              </span>
            </div>
          </div>

          {/* Os 3 Canais de Divulgação Conectados */}
          <div className="lg:col-span-6 flex flex-col gap-3">
            
            {/* Canal 1: WhatsApp */}
            <div className="bg-[#0b0f15] hover:bg-[#0e141d] border border-emerald-500/30 hover:border-emerald-400/60 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 transition-all shadow-md">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
                <WhatsAppIcon className="w-6 h-6 fill-emerald-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-black text-white">WhatsApp & Grupos</span>
                  <span className="text-[9px] font-mono font-bold text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded">
                    DIRETO
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-white/70 mt-0.5">
                  Divulgação do portal em grupos e botão direto para o seu WhatsApp oficial.
                </p>
              </div>
            </div>

            {/* Canal 2: Facebook */}
            <div className="bg-[#0b0e1a] hover:bg-[#0e1224] border border-blue-500/30 hover:border-blue-400/60 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 transition-all shadow-md">
              <div className="w-11 h-11 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 shadow-inner">
                <FacebookIcon className="w-6 h-6 fill-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-black text-white">Facebook</span>
                  <span className="text-[9px] font-mono font-bold text-blue-300 bg-blue-500/15 px-2 py-0.5 rounded">
                    REDES
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-white/70 mt-0.5">
                  Presença e circulação contínua do portal em comunidades e grupos parceiros.
                </p>
              </div>
            </div>

            {/* Canal 3: Anúncios Online / Tráfego Pago */}
            <div className="bg-[#140f09] hover:bg-[#1a140c] border border-amber-500/30 hover:border-amber-400/60 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 transition-all shadow-md">
              <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
                <Megaphone size={22} className="text-amber-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-black text-white">Anúncios Online & Tráfego</span>
                  <span className="text-[9px] font-mono font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded">
                    TRÁFEGO
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-white/70 mt-0.5">
                  Campanhas de tráfego pago promovendo o portal para atrair novos visitantes.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

// ==========================================
// 2. SEÇÃO: COMO FUNCIONA EM 3 ETAPAS ILUSTRADAS
// Conforme especificação 2 do usuário
// ==========================================
export const ComoFunciona3EtapasSection: React.FC = () => {
  const etapas = [
    {
      numero: 'ETAPA 1',
      titulo: 'SUA EMPRESA ENTRA NO PORTAL',
      desc: 'Ganha um espaço para apresentar sua marca, seus contatos, produtos e serviços, conforme os recursos disponíveis no plano.',
      icon: Store,
      cor: 'from-amber-400 to-amber-600',
      badgeCor: 'text-amber-300 bg-amber-500/15 border-amber-500/30'
    },
    {
      numero: 'ETAPA 2',
      titulo: 'DIVULGAMOS O PORTAL',
      desc: 'Promovemos o Minha Divulgação em grupos de WhatsApp, Facebook e por meio de campanhas de tráfego pago, com o objetivo de ampliar a visibilidade das empresas participantes.',
      icon: Megaphone,
      cor: 'from-blue-500 to-cyan-500',
      badgeCor: 'text-cyan-300 bg-cyan-500/15 border-cyan-500/30'
    },
    {
      numero: 'ETAPA 3',
      titulo: 'O CLIENTE ENCONTRA SUA EMPRESA',
      desc: 'Acessa o portal, conhece sua oferta e pode entrar em contato diretamente com você pelo WhatsApp.',
      icon: Smartphone,
      cor: 'from-emerald-400 to-green-600',
      badgeCor: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30'
    }
  ];

  return (
    <section id="como-funciona" className="w-full py-16 sm:py-20 bg-[#07070d] border-b border-white/5 relative scroll-mt-20 select-none">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        
        {/* Cabeçalho */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <span className="text-amber-400 text-[10px] sm:text-xs font-mono font-black tracking-[0.2em] uppercase bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full inline-block mb-3">
            PASSO A PASSO ILUSTRADO
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Como funciona a divulgação
          </h2>
          <p className="text-sm sm:text-base text-white/75 mt-3 max-w-2xl mx-auto font-medium leading-relaxed">
            Um modelo simples e transparente: sua empresa ganha presença na vitrine e participa da divulgação coletiva da plataforma na internet.
          </p>
        </div>

        {/* As 3 Etapas Ilustradas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {etapas.map((etapa, idx) => {
            const Icon = etapa.icon;
            return (
              <div 
                key={idx}
                className="bg-gradient-to-b from-[#11121d] to-[#090a10] border border-white/10 hover:border-amber-400/50 rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className={`text-[10px] font-mono font-black uppercase tracking-wider px-3 py-1 rounded-full border ${etapa.badgeCor}`}>
                      {etapa.numero}
                    </span>
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${etapa.cor} text-black font-black flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
                      <Icon size={24} className="text-black" />
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-white leading-snug group-hover:text-amber-300 transition-colors">
                    {etapa.titulo}
                  </h3>

                  <p className="text-xs sm:text-sm text-white/70 mt-3 leading-relaxed font-medium">
                    {etapa.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-1.5 text-amber-400 text-xs font-mono font-bold">
                  <CheckCircle2 size={14} className="shrink-0" />
                  <span>Passo {idx + 1} de 3</span>
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
// 3. SEÇÃO: DIFERENÇA ENTRE OS SERVIÇOS & PLANO R$ 49,90/mês
// Conforme especificação 3 do usuário
// ==========================================
export const PlanoEDiferencaServicosSection: React.FC<{ 
  primaryWaLink?: string; 
  exclusiveWaLink?: string;
  onCadastrarClick?: () => void;
}> = ({ 
  primaryWaLink = DEFAULT_WA_LINK,
  exclusiveWaLink = DEFAULT_EXCLUSIVE_WA_LINK,
  onCadastrarClick
}) => {
  return (
    <section id="planos" className="w-full py-16 sm:py-24 bg-gradient-to-b from-black via-[#080811] to-black border-b border-white/5 relative scroll-mt-20 select-none">
      
      {/* Luz ambiente suave */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-amber-500/5 rounded-full blur-[170px] pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        
        {/* Cabeçalho da Seção */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-amber-400 text-[10px] sm:text-xs font-mono font-black tracking-[0.2em] uppercase bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full inline-block mb-3">
            TRANSPARÊNCIA TOTAL • ESCOLHA O MELHOR PARA SEU NEGÓCIO
          </span>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Nossos planos e serviços de divulgação
          </h2>
          <p className="text-sm sm:text-base text-white/80 mt-3 max-w-2xl mx-auto font-medium leading-relaxed">
            Deixamos clara a diferença entre a presença no portal com divulgação coletiva e as campanhas exclusivas para uma única empresa.
          </p>
        </div>

        {/* Comparativo de 2 Cards: 1. Presença no Portal (R$ 49,90) vs 2. Divulgação Exclusiva */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto items-stretch">
          
          {/* CARD 1: PLANO DE PRESENÇA NO PORTAL (R$ 49,90/mês) */}
          <div className="bg-gradient-to-b from-[#131422] via-[#0d0e17] to-[#08080f] border-2 border-amber-400/80 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-[0_15px_45px_rgba(245,158,11,0.2)] relative">
            
            <div className="absolute -top-3.5 left-6 bg-gradient-to-r from-amber-400 to-amber-500 text-black font-black text-[10px] font-mono uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md">
              OFERTA PRINCIPAL DO SITE
            </div>

            <div>
              <div className="flex items-start justify-between gap-4 mt-2 mb-4">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    PLANO DE PRESENÇA NO PORTAL
                  </h3>
                  <p className="text-xs text-amber-300 font-bold mt-1">
                    Espaço comercial e participação na divulgação coletiva
                  </p>
                </div>
              </div>

              {/* Preço */}
              <div className="flex items-baseline gap-1.5 my-4 p-4 rounded-2xl bg-black/40 border border-amber-400/20">
                <span className="text-xl sm:text-2xl font-black text-amber-400">R$</span>
                <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">49,90</span>
                <span className="text-xs sm:text-sm font-bold text-white/70 uppercase">/mês</span>
              </div>

              {/* Lista de Recursos Inclusos */}
              <div className="space-y-3 mt-6">
                <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                  O que está incluso no plano:
                </div>

                <ul className="space-y-2.5 text-xs sm:text-sm text-white/85">
                  <li className="flex items-start gap-2.5">
                    <Check size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Espaço comercial no Minha Divulgação:</strong> vitrine com fotos, produtos, serviços e localização.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>WhatsApp direto:</strong> o cliente clica e entra em contato sem intermediários e sem taxas sobre vendas.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Divulgação coletiva do portal:</strong> participação na promoção em grupos de WhatsApp, Facebook e campanhas de tráfego pago da plataforma.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Canais complementares:</strong> inserção da sua marca na TV e Rádio web da rede.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Buscas e categorias:</strong> seu negócio listado na busca comercial por segmento.</span>
                  </li>
                </ul>

                {/* Caixa de Transparência Obrigatória (Regra 3 e 7) */}
                <div className="mt-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-[11px] sm:text-xs text-amber-200/90 leading-relaxed flex items-start gap-2.5">
                  <Info size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>Transparência comercial:</strong> A promoção do portal pode dar visibilidade às empresas cadastradas, mas não significa que cada empresa receberá uma campanha exclusiva ou uma quantidade garantida de visualizações, contatos ou vendas.
                  </div>
                </div>
              </div>
            </div>

            {/* Botão de Contratação */}
            <div className="mt-8 pt-5 border-t border-white/10">
              {onCadastrarClick ? (
                <button
                  type="button"
                  onClick={onCadastrarClick}
                  className="w-full inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:brightness-110 text-black px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-300 shadow-[0_10px_30px_rgba(245,158,11,0.3)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <span>QUERO DIVULGAR MINHA EMPRESA</span>
                  <ArrowRight size={17} />
                </button>
              ) : (
                <a
                  href={primaryWaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:brightness-110 text-black px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-300 shadow-[0_10px_30px_rgba(245,158,11,0.3)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer decoration-transparent"
                >
                  <span>QUERO DIVULGAR MINHA EMPRESA</span>
                  <ArrowRight size={17} />
                </a>
              )}
              <p className="text-[10px] text-white/50 text-center font-mono mt-2.5">
                Ativação rápida • Sem taxa sobre vendas
              </p>
            </div>

          </div>

          {/* CARD 2: DIVULGAÇÃO EXCLUSIVA DA SUA EMPRESA */}
          <div className="bg-gradient-to-b from-[#11121d] via-[#0c0d15] to-[#07070b] border border-white/15 hover:border-cyan-500/50 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl relative transition-all">
            
            <div className="absolute -top-3.5 left-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-black text-[10px] font-mono uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md">
              CAMPANHA INDIVIDUALIZADA
            </div>

            <div>
              <div className="flex items-start justify-between gap-4 mt-2 mb-4">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    DIVULGAÇÃO EXCLUSIVA DA SUA EMPRESA
                  </h3>
                  <p className="text-xs text-cyan-300 font-bold mt-1">
                    Campanhas feitas especificamente para uma única empresa
                  </p>
                </div>
              </div>

              {/* Preço / Modelo de Contratação */}
              <div className="my-4 p-4 rounded-2xl bg-black/40 border border-cyan-500/20 flex flex-col justify-center">
                <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
                  Contratação Separada
                </span>
                <span className="text-2xl sm:text-3xl font-black text-white mt-1">
                  Sob Consulta via WhatsApp
                </span>
                <span className="text-[11px] text-white/60 mt-0.5">
                  Orçamento sob medida conforme sua verba de anúncios
                </span>
              </div>

              {/* O que é esse serviço */}
              <div className="space-y-3 mt-6">
                <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                  Como funciona a divulgação exclusiva:
                </div>

                <ul className="space-y-2.5 text-xs sm:text-sm text-white/85">
                  <li className="flex items-start gap-2.5">
                    <Check size={16} className="text-cyan-400 shrink-0 mt-0.5" />
                    <span><strong>Campanhas exclusivas:</strong> Anúncios criados especificamente para a sua marca, separados da divulgação coletiva do portal.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check size={16} className="text-cyan-400 shrink-0 mt-0.5" />
                    <span><strong>Tráfego pago individual:</strong> Verba de anúncios direcionada unicamente para os produtos, catálogo ou WhatsApp do seu negócio.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check size={16} className="text-cyan-400 shrink-0 mt-0.5" />
                    <span><strong>Segmentação avançada:</strong> Definição precisa de público por cidade, raio de entrega, idade e interesse.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check size={16} className="text-cyan-400 shrink-0 mt-0.5" />
                    <span><strong>Relatório dedicado:</strong> Acompanhamento personalizado do alcance e cliques exclusivos da sua campanha.</span>
                  </li>
                </ul>

                {/* Caixa de distinção clara */}
                <div className="mt-5 p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-[11px] sm:text-xs text-cyan-200/90 leading-relaxed flex items-start gap-2.5">
                  <Info size={16} className="text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>Atenção:</strong> Esse serviço é contratado à parte e não está incluído no plano mensal de R$ 49,90. É indicado para empresas que desejam anúncios próprios na internet.
                  </div>
                </div>
              </div>
            </div>

            {/* Botão de Consulta Exclusiva */}
            <div className="mt-8 pt-5 border-t border-white/10">
              <a
                href={exclusiveWaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 hover:brightness-110 text-black px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-300 shadow-lg hover:scale-[1.02] active:scale-[0.98] cursor-pointer decoration-transparent"
              >
                <span>CONSULTAR DIVULGAÇÃO EXCLUSIVA</span>
                <WhatsAppIcon className="w-5 h-5 fill-black" />
              </a>
              <p className="text-[10px] text-white/50 text-center font-mono mt-2.5">
                Atendimento sob consulta via WhatsApp
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

// ==========================================
// 4. SEGMENTOS DE EMPRESAS ATENDIDAS
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
    <div className="w-full mt-6 pt-5 border-t border-white/10 select-none">
      <div className="text-center mb-2.5">
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
// 5. CHAMADA FINAL PARA ANUNCIAR (CTA FINAL)
// ==========================================
export const CtaFinalSection: React.FC<{ 
  primaryWaLink?: string; 
  exclusiveWaLink?: string;
  onCadastrarClick?: () => void;
}> = ({ 
  primaryWaLink = DEFAULT_WA_LINK,
  exclusiveWaLink = DEFAULT_EXCLUSIVE_WA_LINK,
  onCadastrarClick
}) => {
  return (
    <section className="w-full py-16 md:py-20 bg-gradient-to-b from-[#0a0a12] to-black border-b border-white/5 relative overflow-hidden select-none">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="relative w-full max-w-4xl mx-auto px-4 md:px-6 text-center z-10">
        
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-widest mb-5">
          ✨ FAÇA PARTE DO PORTAL
        </div>

        <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
          SUA EMPRESA MAIS PRESENTE NA INTERNET
        </h2>

        <p className="text-sm sm:text-base md:text-lg text-white/80 font-medium max-w-2xl mx-auto mt-3 leading-relaxed">
          Cadastre seu negócio por R$ 49,90/mês para presença no portal com WhatsApp direto, ou consulte uma campanha exclusiva para sua marca.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          {onCadastrarClick ? (
            <button
              type="button"
              onClick={onCadastrarClick}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:brightness-110 text-black px-8 sm:px-10 py-4 sm:py-5 rounded-2xl font-black text-sm sm:text-base uppercase tracking-wider transition-all duration-300 shadow-[0_12px_40px_rgba(245,158,11,0.35)] hover:scale-105 cursor-pointer"
            >
              <span>QUERO DIVULGAR MINHA EMPRESA</span>
              <ArrowRight size={18} />
            </button>
          ) : (
            <a
              href={primaryWaLink}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:brightness-110 text-black px-8 sm:px-10 py-4 sm:py-5 rounded-2xl font-black text-sm sm:text-base uppercase tracking-wider transition-all duration-300 shadow-[0_12px_40px_rgba(245,158,11,0.35)] hover:scale-105 cursor-pointer decoration-transparent"
            >
              <span>QUERO DIVULGAR MINHA EMPRESA</span>
              <ArrowRight size={18} />
            </a>
          )}
          <a
            href={exclusiveWaLink}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white px-6 sm:px-8 py-4 sm:py-5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 cursor-pointer decoration-transparent"
          >
            <span>CONSULTAR DIVULGAÇÃO EXCLUSIVA</span>
          </a>
        </div>

        <p className="text-xs text-white/50 font-mono mt-4">
          Ativação simples e transparente com suporte dedicado.
        </p>

      </div>
    </section>
  );
};

// Aliases para compatibilidade retroativa
export const OQueSuaEmpresaGanhaSection = ComoFunciona3EtapasSection;
export const ComoFuncionaSection = ComoFunciona3EtapasSection;
export const OndeSuaEmpresaApareceSection = SegmentsShowcase;
export const PlanoPrecoSection = PlanoEDiferencaServicosSection;
