import React, { useState, useEffect } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  Clock, 
  ShieldCheck, 
  Smartphone, 
  Instagram, 
  Globe, 
  Sparkles, 
  ArrowRight,
  Eye,
  Store,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SelfServiceTrialModalProps {
  isOpen: boolean;
  onClose: () => void;
  advertiserData: any;
  onNotifyWhatsApp: (company: any, planChoice: string) => void;
}

export const OFFICIAL_PIX_DATA = {
  qrCodeUrl: "https://i.postimg.cc/cLm3w5Yj/Whats-App-Image-2026-09-25-at-17-05-48.jpg",
  cnpj: "62.133.196/0001-40",
  copiaECola: "00020126360014BR.GOV.BCB.PIX011462133196000140520400005303986540549.905802BR592562.133.196 ANDERSON LUIZ 6009SAO PAULO622905253d2fg9j6ky9pj5yubh1459d3b6304E8D4",
  receiverName: "ANDERSON LUIZ",
  monthlyPrice: "49,90"
};

export const SelfServiceTrialModal: React.FC<SelfServiceTrialModalProps> = ({
  isOpen,
  onClose,
  advertiserData,
  onNotifyWhatsApp
}) => {
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'mensal' | 'destaque'>('mensal');
  const [previewTab, setPreviewTab] = useState<'card' | 'mini-site'>('card');
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 48 });

  // 24-hour countdown simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isOpen || !advertiserData) return null;

  const company = advertiserData.company || advertiserData;
  const isApproved = advertiserData.status === 'approved' || company.status === 'approved';

  const copyToClipboard = (text: string, type: 'key' | 'code') => {
    navigator.clipboard.writeText(text);
    if (type === 'key') {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const cleanWa = String(company.wa || '').replace(/[^0-9]/g, '');

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[2500] bg-black/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 overflow-y-auto font-sans"
      >
        <div className="relative w-full max-w-4xl bg-[#090b12] border-2 border-amber-500/40 rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.8)] overflow-hidden my-auto max-h-[92vh] flex flex-col">
          
          {/* Top Bar Header */}
          <div className="bg-gradient-to-r from-[#141624] via-[#1a1c30] to-[#141624] px-6 py-4 border-b border-white/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-xl shadow">
                ✨
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                    Prévia de Teste de 24 Horas
                  </h3>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                    EXCLUSIVA
                  </span>
                </div>
                <p className="text-xs text-white/60">
                  {company.name} • {company.category}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-all cursor-pointer"
              title="Fechar"
            >
              <X size={18} />
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="overflow-y-auto p-5 sm:p-7 space-y-6">
            
            {/* Status Notice Banner with Countdown */}
            <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 ${
              isApproved 
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' 
                : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
            }`}>
              <div className="flex items-start gap-3">
                <div className="text-2xl mt-0.5">
                  {isApproved ? '🎉' : '⏳'}
                </div>
                <div>
                  <div className="font-black text-sm sm:text-base text-white flex items-center gap-2">
                    {isApproved ? 'Sua empresa já está APROVADA e visível na página principal!' : 'Sua prévia de 24 Horas está gerada com sucesso!'}
                  </div>
                  <p className="text-xs text-white/70 mt-1 max-w-xl leading-relaxed">
                    {isApproved 
                      ? 'Seu anúncio está liberado no feed principal e atraindo visitantes na sua cidade.' 
                      : 'Esta tela é uma demonstração exata de como seu negócio ficará no portal. Seu perfil ainda NÃO está na página principal aberta ao público — ele será liberado assim que o Pix for confirmado pelo gestor.'}
                  </p>
                </div>
              </div>

              {!isApproved && (
                <div className="shrink-0 bg-black/60 border border-amber-500/30 rounded-2xl px-4 py-2.5 text-center min-w-[170px]">
                  <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest block font-bold">
                    Tempo Restante de Teste
                  </span>
                  <div className="text-xl sm:text-2xl font-black font-mono text-amber-400 mt-0.5">
                    {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                  </div>
                </div>
              )}
            </div>

            {/* PREVIEW CONTAINER */}
            <div className="bg-[#0e101a] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Eye size={16} className="text-amber-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-white">
                    Como sua empresa vai aparecer no portal
                  </span>
                </div>
                <div className="flex gap-1.5 p-1 bg-white/5 rounded-xl">
                  <button
                    onClick={() => setPreviewTab('card')}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all ${
                      previewTab === 'card' ? 'bg-amber-500 text-black shadow' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    Card Principal
                  </button>
                  <button
                    onClick={() => setPreviewTab('mini-site')}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all ${
                      previewTab === 'mini-site' ? 'bg-amber-500 text-black shadow' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    Mini-Site / Catálogo
                  </button>
                </div>
              </div>

              {/* CARD PREVIEW */}
              {previewTab === 'card' && (
                <div className="max-w-md mx-auto">
                  <div className="relative rounded-3xl bg-[#12131d] border-2 border-amber-400/60 p-6 shadow-2xl flex flex-col justify-between">
                    
                    {/* Top tags */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase px-2.5 py-1 rounded-full font-mono flex items-center gap-1">
                        ⭐ Em Destaque
                      </span>
                      <span className="text-[10px] font-mono text-white/50 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                        👁️ 420 visualizações
                      </span>
                    </div>

                    {/* Logo & Info */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-2xl bg-white overflow-hidden border border-white/20 shrink-0 shadow-md">
                        <img 
                          src={company.logo || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150"} 
                          alt={company.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-lg font-black text-white truncate">
                            {company.name}
                          </h4>
                          <span className="text-emerald-400 text-xs">✔</span>
                        </div>
                        <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded mt-1">
                          {company.category || 'Comércio'}
                        </span>
                        <p className="text-[11px] text-white/50 mt-1 truncate">
                          📍 {company.city || 'Fortaleza'} - {company.state || 'CE'}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-white/70 line-clamp-2 mb-4 italic">
                      "{company.desc || 'Conheça nossos produtos e faça seu pedido direto pelo WhatsApp!'}"
                    </p>

                    {/* Action buttons on card */}
                    <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
                      <a
                        href={`https://wa.me/${cleanWa}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-2.5 rounded-xl font-black text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer decoration-transparent"
                      >
                        <Smartphone size={14} /> Falar no WhatsApp Comercial
                      </a>

                      <div className="flex flex-wrap gap-2">
                        {company.website && company.website !== '#' && (
                          <a
                            href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 min-w-[120px] bg-blue-500/15 border border-blue-500/30 text-blue-300 py-2 rounded-xl font-bold text-[11px] uppercase text-center flex items-center justify-center gap-1.5 hover:bg-blue-600 hover:text-white transition-all decoration-transparent"
                          >
                            <Globe size={13} /> Site Oficial
                          </a>
                        )}
                        {company.ig && company.ig !== '#' && (
                          <a
                            href={company.ig}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 min-w-[120px] bg-pink-500/15 border border-pink-500/30 text-pink-300 py-2 rounded-xl font-bold text-[11px] uppercase text-center flex items-center justify-center gap-1.5 hover:bg-pink-600 hover:text-white transition-all decoration-transparent"
                          >
                            <Instagram size={13} /> Instagram
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => setPreviewTab('mini-site')}
                          className="flex-1 min-w-[120px] bg-white/10 border border-white/15 text-white py-2 rounded-xl font-bold text-[11px] uppercase text-center hover:bg-white/20 transition-all cursor-pointer"
                        >
                          Ver Catálogo
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* MINI-SITE PREVIEW */}
              {previewTab === 'mini-site' && (
                <div className="bg-[#121420] border border-white/10 rounded-2xl p-5 text-center">
                  <div className="w-20 h-20 rounded-full bg-white mx-auto overflow-hidden border-2 border-amber-400 p-0.5 shadow-lg mb-3">
                    <img 
                      src={company.logo || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150"} 
                      alt={company.name} 
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <h3 className="text-xl font-black text-white">{company.name}</h3>
                  <div className="inline-flex items-center gap-1 text-xs text-amber-400 font-bold uppercase mt-1">
                    <span>{company.category}</span> • <span>{company.city || 'Fortaleza'}/{company.state || 'CE'}</span>
                  </div>
                  <p className="text-xs text-white/70 max-w-md mx-auto mt-2 leading-relaxed">
                    {company.desc || 'Atendimento comercial, produtos e orçamentos direto pelo WhatsApp.'}
                  </p>

                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    <a
                      href={`https://wa.me/${cleanWa}`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-[#25D366] text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow decoration-transparent"
                    >
                      <Smartphone size={14} /> Chamar no WhatsApp
                    </a>
                    {company.website && company.website !== '#' && (
                      <a
                        href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow decoration-transparent"
                      >
                        <Globe size={14} /> Acessar Site
                      </a>
                    )}
                    {company.ig && company.ig !== '#' && (
                      <a
                        href={company.ig.startsWith('http') ? company.ig : `https://${company.ig}`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-pink-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow decoration-transparent"
                      >
                        <Instagram size={14} /> Instagram
                      </a>
                    )}
                  </div>
                  <p className="text-[11px] text-white/40 mt-4">
                    ℹ️ Você poderá adicionar produtos, preços, fotos e vídeos diretamente pelo seu painel de controle.
                  </p>
                </div>
              )}
            </div>

            {/* OFFICIAL PIX ACTIVATION SECTION */}
            <div className="bg-gradient-to-b from-[#131522] via-[#0d0f17] to-[#07080e] border-2 border-amber-500/50 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
              
              <div className="text-center max-w-xl mx-auto">
                <span className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-black uppercase px-3 py-1 rounded-full mb-2">
                  <ShieldCheck size={12} /> DADOS OFICIAIS DE ATIVAÇÃO
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Ative seu Anúncio na Página Principal
                </h3>
                <p className="text-xs sm:text-sm text-white/70 mt-1 leading-relaxed">
                  Faça o pagamento via Pix utilizando a chave CNPJ ou o código Copia e Cola. O gestor libera sua empresa na página principal logo após a confirmação.
                </p>
              </div>

              {/* Price card */}
              <div className="mt-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center max-w-md mx-auto">
                <span className="text-[10px] text-amber-300/80 font-bold uppercase tracking-widest block font-mono">
                  Plano Divulgação Comercial
                </span>
                <div className="text-3xl font-black text-amber-400 mt-1 font-mono">
                  R$ {OFFICIAL_PIX_DATA.monthlyPrice} <span className="text-xs text-white/50 font-normal font-sans">/ MÊS</span>
                </div>
                <span className="text-[11px] text-white/60 block mt-1">
                  Card na página principal • Catálogo online • Botão direto de WhatsApp
                </span>
              </div>

              {/* PIX DETAILS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 items-center">
                
                {/* QR Code image */}
                <div className="flex flex-col items-center justify-center p-4 bg-white/5 border border-white/10 rounded-2xl">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white/70 mb-3 flex items-center gap-1.5">
                    📱 QR Code Pix Oficial
                  </span>
                  <div className="w-52 h-52 bg-white rounded-2xl p-2.5 shadow-xl flex items-center justify-center border-4 border-amber-400">
                    <img 
                      src={OFFICIAL_PIX_DATA.qrCodeUrl} 
                      alt="QR Code Pix Oficial Minha Divulgação" 
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="text-[10px] text-white/40 mt-2 font-mono">
                    Abra o app do seu banco e escaneie o código
                  </span>
                </div>

                {/* Chave e Copia e Cola */}
                <div className="flex flex-col gap-4">
                  {/* CNPJ Key Box */}
                  <div className="bg-black/50 border border-white/10 rounded-2xl p-4">
                    <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider block font-mono mb-1">
                      Chave PIX (CNPJ)
                    </span>
                    <div className="flex items-center justify-between gap-2 bg-[#12141f] border border-white/10 rounded-xl px-3 py-2.5">
                      <span className="text-sm font-mono font-bold text-white tracking-wide">
                        {OFFICIAL_PIX_DATA.cnpj}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(OFFICIAL_PIX_DATA.cnpj, 'key')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer ${
                          copiedKey ? 'bg-emerald-500 text-white' : 'bg-amber-500 hover:bg-amber-400 text-black'
                        }`}
                      >
                        {copiedKey ? <Check size={14} /> : <Copy size={14} />}
                        {copiedKey ? 'Copiado!' : 'Copiar'}
                      </button>
                    </div>
                    <span className="text-[10px] text-white/40 mt-1 block">
                      Favorecido: {OFFICIAL_PIX_DATA.receiverName}
                    </span>
                  </div>

                  {/* Copia e Cola Box */}
                  <div className="bg-black/50 border border-white/10 rounded-2xl p-4">
                    <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider block font-mono mb-1">
                      Código PIX Copia e Cola
                    </span>
                    <div className="relative">
                      <textarea
                        readOnly
                        rows={2}
                        value={OFFICIAL_PIX_DATA.copiaECola}
                        className="w-full bg-[#12141f] border border-white/10 rounded-xl p-2.5 text-[11px] font-mono text-white/80 resize-none outline-none focus:border-amber-400 select-all"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(OFFICIAL_PIX_DATA.copiaECola, 'code')}
                      className={`w-full mt-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        copiedCode ? 'bg-emerald-500 text-white' : 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:brightness-110 text-black shadow-md'
                      }`}
                    >
                      {copiedCode ? <Check size={16} /> : <Copy size={16} />}
                      {copiedCode ? 'Código PIX Copiado com Sucesso!' : 'Copiar Código Copia e Cola'}
                    </button>
                  </div>
                </div>

              </div>

              {/* ACTION: NOTIFY MANAGER ON WHATSAPP */}
              <div className="mt-7 pt-6 border-t border-white/10 text-center flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => onNotifyWhatsApp(company, selectedPlan)}
                  className="w-full max-w-md bg-[#25D366] hover:bg-[#20ba59] text-white py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2.5 shadow-[0_10px_35px_rgba(37,211,102,0.3)] transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <Smartphone size={18} />
                  <span>Já Fiz o Pix / Enviar Comprovante</span>
                </button>
                <p className="text-xs text-white/50 mt-2.5 max-w-md">
                  Envie o comprovante pelo botão acima. O gestor checará o valor e ativará sua empresa imediatamente para o público da sua cidade!
                </p>
              </div>

            </div>

          </div>

          {/* Bottom Footer Bar */}
          <div className="bg-[#0b0d14] px-6 py-3 border-t border-white/5 flex items-center justify-between shrink-0">
            <span className="text-[11px] text-white/40">
              Minha Divulgação • CNPJ {OFFICIAL_PIX_DATA.cnpj}
            </span>
            <button
              onClick={onClose}
              className="text-xs text-white/70 hover:text-white font-bold uppercase tracking-wider py-1 px-3 rounded-lg hover:bg-white/5 transition-all"
            >
              Fechar Prévia
            </button>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
};
