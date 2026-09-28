import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Store, 
  MapPin, 
  Sparkles, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Phone, 
  Instagram, 
  Globe, 
  Eye, 
  ShieldCheck,
  User,
  ShoppingBag,
  HelpCircle,
  FileText
} from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { uploadToImgBB } from '../App';

export interface CompanyRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: { name: string; icon?: string; color?: string }[];
  defaultCity?: string;
  defaultState?: string;
  tenantId?: string;
  onSuccess: (createdAdvertiser: any) => void;
}

const BRAZIL_STATES = [
  { uf: 'AC', name: 'Acre' },
  { uf: 'AL', name: 'Alagoas' },
  { uf: 'AP', name: 'Amapá' },
  { uf: 'AM', name: 'Amazonas' },
  { uf: 'BA', name: 'Bahia' },
  { uf: 'CE', name: 'Ceará' },
  { uf: 'DF', name: 'Distrito Federal' },
  { uf: 'ES', name: 'Espírito Santo' },
  { uf: 'GO', name: 'Goiás' },
  { uf: 'MA', name: 'Maranhão' },
  { uf: 'MT', name: 'Mato Grosso' },
  { uf: 'MS', name: 'Mato Grosso do Sul' },
  { uf: 'MG', name: 'Minas Gerais' },
  { uf: 'PA', name: 'Pará' },
  { uf: 'PB', name: 'Paraíba' },
  { uf: 'PR', name: 'Paraná' },
  { uf: 'PE', name: 'Pernambuco' },
  { uf: 'PI', name: 'Piauí' },
  { uf: 'RJ', name: 'Rio de Janeiro' },
  { uf: 'RN', name: 'Rio Grande do Norte' },
  { uf: 'RS', name: 'Rio Grande do Sul' },
  { uf: 'RO', name: 'Rondônia' },
  { uf: 'RR', name: 'Roraima' },
  { uf: 'SC', name: 'Santa Catarina' },
  { uf: 'SP', name: 'São Paulo' },
  { uf: 'SE', name: 'Sergipe' },
  { uf: 'TO', name: 'Tocantins' }
];

const slugify = (str: string) => 
  (str || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');

export const CompanyRegistrationModal: React.FC<CompanyRegistrationModalProps> = ({
  isOpen,
  onClose,
  categories,
  defaultCity = 'Fortaleza',
  defaultState = 'CE',
  tenantId = 'fortaleza',
  onSuccess
}) => {
  const [name, setName] = useState('');
  const [wa, setWa] = useState('');
  const [category, setCategory] = useState(categories[0]?.name || 'Geral');
  const [customCategory, setCustomCategory] = useState('');
  const [state, setState] = useState(defaultState);
  const [city, setCity] = useState(defaultCity);
  const [logo, setLogo] = useState('');
  const [desc, setDesc] = useState('');
  const [ig, setIg] = useState('');
  const [catalogUrl, setCatalogUrl] = useState('');
  const [website, setWebsite] = useState('');
  const [fb, setFb] = useState('');
  const [responsibleName, setResponsibleName] = useState('');
  
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const activeCategory = category === '__custom__' ? customCategory : category;
  const cleanWa = wa.replace(/[^0-9]/g, '');
  const previewLogo = logo.trim() || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300';

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem (JPG, PNG, WEBP).');
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadToImgBB(file);
      setLogo(url);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Falha ao enviar a foto. Tente colar um link direto ou tente novamente.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Por favor, informe o nome da sua empresa.');
      return;
    }

    if (!cleanWa || cleanWa.length < 10) {
      setErrorMsg('Informe um WhatsApp válido com DDD (Ex: 85992900000).');
      return;
    }

    if (!activeCategory.trim()) {
      setErrorMsg('Por favor, selecione ou informe o ramo/categoria da sua empresa.');
      return;
    }

    if (!city.trim() || !state.trim()) {
      setErrorMsg('Por favor, informe a Cidade e o Estado.');
      return;
    }

    setIsSubmitting(true);
    try {
      const baseSlug = slugify(name);
      if (!baseSlug) {
        throw new Error('Nome inválido para criação de registro.');
      }

      // Check if doc already exists, if so append random digits
      let finalSlug = baseSlug;
      const initialDocRef = doc(db, 'advertisers', finalSlug);
      const initialSnap = await getDoc(initialDocRef);
      if (initialSnap.exists()) {
        finalSlug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
      }

      const creationDate = new Date();
      const expiresDate = new Date(creationDate.getTime() + 30 * 24 * 60 * 60 * 1000);
      const createdAtStr = creationDate.toISOString();
      const expiresAtStr = expiresDate.toISOString().split('T')[0];

      const newCompanyData = {
        id: finalSlug,
        name: name.trim(),
        category: activeCategory.trim(),
        desc: desc.trim() || 'Comércio verificado com atendimento dedicado via WhatsApp.',
        logo: logo.trim() || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300',
        wa: cleanWa,
        ig: ig.trim() ? (ig.startsWith('@') ? `https://instagram.com/${ig.replace('@', '')}` : ig.trim()) : '',
        catalogUrl: catalogUrl.trim(),
        website: website.trim(),
        fb: fb.trim(),
        state: state.toUpperCase(),
        uf: state.toUpperCase(),
        city: city.trim(),
        responsibleName: responsibleName.trim(),
        status: 'pending',
        pixPaid: false,
        active: false,
        featured: false,
        items: [],
        createdAt: createdAtStr,
        expiresAt: expiresAtStr
      };

      const advertiserDoc = {
        id: finalSlug,
        name: name.trim(),
        tenantId: slugify(tenantId || 'fortaleza'),
        responsibleName: responsibleName.trim(),
        status: 'pending',
        pixPaid: false,
        isAdvertiserCreated: true,
        createdAt: createdAtStr,
        expiresAt: expiresAtStr,
        company: newCompanyData
      };

      // Save in Firestore
      await setDoc(doc(db, 'advertisers', finalSlug), advertiserDoc);

      // Callback to parent to reload and open Pix modal
      onSuccess(advertiserDoc);
    } catch (err: any) {
      console.error("Erro ao salvar cadastro:", err);
      setErrorMsg(err.message || "Erro ao processar o cadastro da empresa. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[2400] bg-black/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 overflow-y-auto font-sans"
      >
        <div className="relative w-full max-w-5xl bg-[#090b12] border-2 border-amber-500/40 rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.85)] overflow-hidden my-auto max-h-[92vh] flex flex-col">
          
          {/* Top Header */}
          <div className="bg-gradient-to-r from-[#141624] via-[#1a1c30] to-[#141624] px-6 py-4 border-b border-white/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-xl shadow">
                🚀
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                    Cadastrar Minha Empresa
                  </h3>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase">
                    Sem Burocracia
                  </span>
                </div>
                <p className="text-xs text-white/60">
                  Sem senhas complicadas. Preencha os dados e veja a prévia do seu anúncio na hora!
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

          {/* Body: Form on Left + Live Preview on Right */}
          <div className="overflow-y-auto p-5 sm:p-7 grid grid-cols-1 lg:grid-cols-12 gap-7">
            
            {/* LEFT: FORM (7 Columns) */}
            <form onSubmit={handleSubmit} className="lg:col-span-7 flex flex-col gap-4">
              
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 flex items-start gap-3 text-amber-200 text-xs leading-relaxed">
                <Sparkles size={18} className="shrink-0 text-amber-400 mt-0.5" />
                <div>
                  <strong>Presença Garantida no Portal:</strong> Após cadastrar e realizar o pagamento de <strong>R$ 49,90/mês</strong> (via Cartão de Crédito ou Pix), o gestor do portal libera o seu card diretamente na vitrine da cidade para receber clientes no WhatsApp!
                </div>
              </div>

              {errorMsg && (
                <div className="bg-red-500/15 border border-red-500/40 rounded-xl p-3 flex items-center gap-2.5 text-xs text-red-300">
                  <AlertCircle size={16} className="shrink-0 text-red-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Empresa + WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-black uppercase tracking-wider text-white/70 flex items-center gap-1.5">
                    <Store size={13} className="text-amber-400" />
                    <span>Nome da Empresa *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Padaria Central, Barbearia Silva"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#11111a] border border-white/15 focus:border-amber-400 outline-none rounded-xl px-3.5 py-3 text-xs text-white placeholder-white/30 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-black uppercase tracking-wider text-white/70 flex items-center gap-1.5">
                    <Phone size={13} className="text-emerald-400" />
                    <span>WhatsApp Comercial *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="DDD + Número (Ex: 85992900000)"
                    value={wa}
                    onChange={(e) => setWa(e.target.value)}
                    className="w-full bg-[#11111a] border border-white/15 focus:border-emerald-400 outline-none rounded-xl px-3.5 py-3 text-xs text-white placeholder-white/30 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Ramo / Categoria */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-white/70">
                  Ramo Comercial / Categoria *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#11111a] border border-white/15 focus:border-amber-400 outline-none rounded-xl px-3.5 py-3 text-xs text-white cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat.name} value={cat.name} className="bg-[#11111a] text-white">
                        {cat.name}
                      </option>
                    ))}
                    <option value="__custom__" className="bg-[#11111a] text-amber-300 font-bold">
                      ✍️ Outro (Digitar nicho exclusivo...)
                    </option>
                  </select>

                  {category === '__custom__' && (
                    <input
                      type="text"
                      required
                      placeholder="Qual é o seu nicho? Ex: Marmitaria, Fretes"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="w-full bg-[#11111a] border border-amber-500/50 focus:border-amber-400 outline-none rounded-xl px-3.5 py-3 text-xs text-white placeholder-white/30"
                    />
                  )}
                </div>
              </div>

              {/* Cidade + Estado */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-[11px] font-black uppercase tracking-wider text-white/70 flex items-center gap-1.5">
                    <MapPin size={13} className="text-amber-400" />
                    <span>Cidade de Atuação *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Fortaleza, Sobral, Caucaia"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-[#11111a] border border-white/15 focus:border-amber-400 outline-none rounded-xl px-3.5 py-3 text-xs text-white placeholder-white/30 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-black uppercase tracking-wider text-white/70">
                    Estado (UF) *
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-[#11111a] border border-white/15 focus:border-amber-400 outline-none rounded-xl px-3 py-3 text-xs text-white cursor-pointer"
                  >
                    {BRAZIL_STATES.map((st) => (
                      <option key={st.uf} value={st.uf} className="bg-[#11111a] text-white">
                        {st.uf} - {st.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Foto / Logo com Upload Direto */}
              <div className="flex flex-col gap-1.5 bg-white/5 border border-white/10 rounded-2xl p-3.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <label className="text-[11px] font-black uppercase tracking-wider text-white/80 flex items-center gap-1.5">
                    <span>Foto ou Logo do Negócio</span>
                    <span className="text-[10px] text-white/40 normal-case font-normal">(opcional)</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-amber-500 hover:bg-amber-400 text-black px-3 py-1.5 rounded-lg font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow transition-all disabled:opacity-50"
                    >
                      {isUploading ? (
                        <>
                          <span className="animate-spin text-xs">⏳</span>
                          <span>Enviando foto...</span>
                        </>
                      ) : (
                        <>
                          <Upload size={12} />
                          <span>📷 Escolher Foto do Celular / PC</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    placeholder="Ou cole o link direto da imagem aqui..."
                    value={logo}
                    onChange={(e) => setLogo(e.target.value)}
                    className="w-full bg-[#11111a] border border-white/10 focus:border-amber-400 outline-none rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30"
                  />
                  {logo && (
                    <button
                      type="button"
                      onClick={() => setLogo('')}
                      className="px-2.5 py-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 text-xs shrink-0 cursor-pointer"
                      title="Remover foto"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Descrição do Negócio */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-white/70 flex items-center gap-1.5">
                  <FileText size={13} className="text-amber-400" />
                  <span>Descrição Curta do Negócio</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Oferecemos os melhores produtos e serviços da região com qualidade garantida e entrega rápida."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-[#11111a] border border-white/15 focus:border-amber-400 outline-none rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 resize-none transition-all"
                />
              </div>

              {/* Redes Sociais & Links Externos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-black uppercase tracking-wider text-white/70 flex items-center gap-1.5">
                    <Instagram size={13} className="text-pink-400" />
                    <span>Instagram</span>
                    <span className="text-[10px] text-white/40 normal-case font-normal">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="@suaempresa ou link"
                    value={ig}
                    onChange={(e) => setIg(e.target.value)}
                    className="w-full bg-[#11111a] border border-white/15 focus:border-pink-400 outline-none rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-black uppercase tracking-wider text-white/70 flex items-center gap-1.5">
                    <ShoppingBag size={13} className="text-amber-400" />
                    <span>Link do Catálogo / Cardápio</span>
                    <span className="text-[10px] text-white/40 normal-case font-normal">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Link do WhatsApp, PDF, catálogo ou menu"
                    value={catalogUrl}
                    onChange={(e) => setCatalogUrl(e.target.value)}
                    className="w-full bg-[#11111a] border border-white/15 focus:border-amber-400 outline-none rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-black uppercase tracking-wider text-white/70 flex items-center gap-1.5">
                    <Globe size={13} className="text-amber-400" />
                    <span>Website Oficial</span>
                    <span className="text-[10px] text-white/40 normal-case font-normal">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="https://suaempresa.com.br"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full bg-[#11111a] border border-white/15 focus:border-amber-400 outline-none rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-black uppercase tracking-wider text-white/70 flex items-center gap-1.5">
                    <span className="text-blue-400 font-black text-xs">f</span>
                    <span>Facebook</span>
                    <span className="text-[10px] text-white/40 normal-case font-normal">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="facebook.com/suaempresa ou link"
                    value={fb}
                    onChange={(e) => setFb(e.target.value)}
                    className="w-full bg-[#11111a] border border-white/15 focus:border-blue-400 outline-none rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-white/70 flex items-center gap-1.5">
                  <User size={13} className="text-cyan-400" />
                  <span>Nome do Responsável</span>
                  <span className="text-[10px] text-white/40 normal-case font-normal">(opcional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Para contato com o gestor Anderson"
                  value={responsibleName}
                  onChange={(e) => setResponsibleName(e.target.value)}
                  className="w-full bg-[#11111a] border border-white/15 focus:border-cyan-400 outline-none rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30"
                />
              </div>

              {/* SUBMIT BUTTON */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:brightness-110 text-black py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-wider text-center transition-all duration-300 shadow-xl shadow-amber-500/20 hover:scale-[1.01] cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin text-base">⏳</span>
                      <span>Salvando Cadastro...</span>
                    </>
                  ) : (
                    <>
                      <span>🚀 Finalizar Cadastro & Ver Pagamento (R$ 49,90)</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <p className="text-[11px] text-white/50 text-center mt-2.5 leading-relaxed">
                  🔒 Seus dados serão enviados para liberação pelo gestor. Você não precisa decorar senhas.
                </p>
              </div>

            </form>

            {/* RIGHT: LIVE CARD PREVIEW (5 Columns) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="bg-[#121420] border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-black uppercase text-amber-300 tracking-wider">
                  <Eye size={15} />
                  <span>Prévia do Card em Tempo Real</span>
                </div>
                <span className="text-[10px] font-mono bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-bold">
                  AO VIVO
                </span>
              </div>

              {/* Exact Card Preview Replica */}
              <div className="bg-gradient-to-b from-[#151728] to-[#0e101c] border-2 border-amber-500/40 rounded-3xl p-5 shadow-2xl relative overflow-hidden group">
                
                {/* Status Notice Tag */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center gap-1">
                    <Sparkles size={10} />
                    🌟 Verificado Minha Divulgação
                  </span>
                  <span className="text-[9px] font-mono bg-white/10 text-white/80 px-2 py-1 rounded-md">
                    {city || defaultCity} - {state || defaultState}
                  </span>
                </div>

                {/* Logo & Info Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-black/60 border border-white/15 shrink-0 shadow-lg relative">
                    <img 
                      src={previewLogo} 
                      alt="Logo da Empresa" 
                      className="w-full h-full object-cover"
                      onError={(e: any) => {
                        e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300';
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-base sm:text-lg font-black text-white truncate leading-tight">
                      {name.trim() || 'Nome da Sua Empresa'}
                    </h4>
                    
                    <div className="inline-block mt-1">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md">
                        {activeCategory.trim() || 'Ramo Comercial'}
                      </span>
                    </div>

                    <div className="text-[10px] text-white/50 mt-1.5 flex items-center gap-1">
                      <MapPin size={11} className="text-amber-400" />
                      <span>{city || defaultCity}, {state || defaultState}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-white/80 leading-relaxed min-h-[2.8rem] line-clamp-3 bg-black/30 p-2.5 rounded-xl border border-white/5">
                  {desc.trim() || 'Descrição dos seus produtos, serviços e atendimento aparecerá aqui para milhares de clientes.'}
                </p>

                {/* Simulated Interaction Badges */}
                <div className="mt-3.5 flex items-center justify-between text-[11px] text-white/60 bg-white/5 p-2 rounded-xl">
                  <span className="flex items-center gap-1.5 text-amber-300 font-bold">
                    🔥 140+ Visualizações
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 size={11} /> Pronto para Clientes
                  </span>
                </div>

                {/* Simulated WhatsApp Button */}
                <div className="mt-3.5">
                  <div className="w-full bg-[#25D366] text-white py-3 rounded-xl font-black text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20">
                    <Phone size={14} />
                    <span>Falar no WhatsApp ({cleanWa ? `(DDD) ${cleanWa.slice(-8)}` : 'Seu WhatsApp'})</span>
                  </div>
                </div>

                {/* Simulated Secondary Action Buttons (Instagram, Catálogo, Website, Facebook) */}
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-1.5 w-full">
                  <div className={`flex-1 min-w-0 py-2 px-1.5 rounded-xl font-black text-[10px] uppercase tracking-wider text-center flex items-center justify-center gap-1 transition-all ${
                    ig ? 'bg-pink-500/20 border border-pink-500/40 text-pink-300' : 'bg-white/5 border border-white/10 text-white/40'
                  }`}>
                    <Instagram size={12} />
                    <span className="truncate">Instagram</span>
                  </div>

                  <div className={`flex-1 min-w-0 py-2 px-1.5 rounded-xl font-black text-[10px] uppercase tracking-wider text-center flex items-center justify-center gap-1 transition-all ${
                    catalogUrl ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300' : 'bg-white/5 border border-white/10 text-white/40'
                  }`}>
                    <ShoppingBag size={12} />
                    <span className="truncate">Catálogo</span>
                  </div>

                  <div className={`flex-1 min-w-0 py-2 px-1.5 rounded-xl font-black text-[10px] uppercase tracking-wider text-center flex items-center justify-center gap-1 transition-all ${
                    website ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300' : 'bg-white/5 border border-white/10 text-white/40'
                  }`}>
                    <Globe size={12} />
                    <span className="truncate">Website</span>
                  </div>

                  {fb && (
                    <div className="flex-1 min-w-0 py-2 px-1.5 rounded-xl font-black text-[10px] uppercase tracking-wider text-center flex items-center justify-center gap-1 transition-all bg-blue-500/20 border border-blue-500/40 text-blue-300">
                      <span className="text-xs font-black">f</span>
                      <span className="truncate">Facebook</span>
                    </div>
                  )}
                </div>

                {/* Bottom Notice on Preview */}
                <div className="mt-4 pt-3 border-t border-white/10 text-center">
                  <p className="text-[10px] text-amber-300/90 font-medium">
                    ⏳ Este card será ativado na página principal assim que o pagamento de R$ 49,90 (Cartão ou Pix) for confirmado.
                  </p>
                </div>
              </div>

              {/* Info Note on Control */}
              <div className="bg-[#0e1018] border border-white/10 rounded-2xl p-3.5 text-white/60 text-xs leading-relaxed flex items-start gap-2.5">
                <ShieldCheck size={18} className="shrink-0 text-emerald-400 mt-0.5" />
                <div>
                  <strong className="text-white">Controle 100% Seguro:</strong> Você não precisa se preocupar com logins ou senhas esquecidas. Toda a moderação e publicação é supervisionada pelo gestor local do portal.
                </div>
              </div>

            </div>

          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
};
