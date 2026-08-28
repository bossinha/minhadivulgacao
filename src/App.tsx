/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HashRouter, Routes, Route, useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  MessageSquare, 
  Tv, 
  Radio, 
  Menu, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Star, 
  Check, 
  ExternalLink, 
  Smartphone, 
  Target, 
  Users, 
  Palette, 
  Video, 
  TrendingUp, 
  Sparkles, 
  Plus, 
  Minus,
  Award, 
  Clock, 
  Info,
  Calendar,
  DollarSign,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  LogOut,
  Key,
  Save,
  PlusCircle,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileText,
  Briefcase,
  Store,
  ChevronDown,
  ChevronUp,
  User,
  Truck,
  Copy,
  Share2,
  Heart,
  Globe,
  Instagram
} from 'lucide-react';

import { auth, db, googleProvider } from './lib/firebase';
import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, collection, getDocs, deleteDoc, query, where, limit, increment, addDoc } from 'firebase/firestore';

// --- Constants ---
const calculateDaysLeft = (expiresAt: string | undefined) => {
  if (!expiresAt) return null;
  try {
    const expiry = new Date(expiresAt);
    const now = new Date();
    const expiryDate = new Date(expiry.getFullYear(), expiry.getMonth(), expiry.getDate());
    const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffTime = expiryDate.getTime() - nowDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch (e) {
    return null;
  }
};

const SERVICES_DATA = [
  {
    title: "Seu WhatsApp Apitando de Clientes",
    desc: "Direcionamos dezenas de novos clientes prontos para comprar direto para o seu WhatsApp comercial. Sem complica√ß√£o: voc√™ s√≥ precisa atender e fechar a venda!",
    icon: Users,
    color: "from-blue-500/20 to-cyan-500/20 text-cyan-400"
  },
  {
    title: "Destaque Premium Exclusivo",
    desc: "Sua marca posicionada no topo da sua cidade, garantindo exclusividade absoluta no seu segmento. Bloqueie seus concorrentes e seja a escolha n√∫mero 1.",
    icon: Target,
    color: "from-purple-500/20 to-pink-500/20 text-pink-400"
  },
  {
    title: "Sua Vitrine Virtual Interativa",
    desc: "Seu cat√°logo ou card√°pio online extremamente leve e r√°pido, criado de forma simples para qualquer cliente navegar, escolher e pedir sem complica√ß√£o.",
    icon: Store,
    color: "from-amber-500/20 to-red-500/20 text-amber-400"
  },
  {
    title: "Fideliza√ß√£o e Retorno R√°pido",
    desc: "Facilitamos para que o cliente salve o seu contato e crie o h√°bito de comprar diretamente com voc√™, gerando faturamento constante e previs√≠vel.",
    icon: Heart,
    color: "from-green-500/20 to-emerald-500/20 text-emerald-400"
  },
  {
    title: "Sua Marca na R√°dio do Portal",
    desc: "Gravamos um Spot de √°udio profissional com locutor de est√∫dio para veicular a propaganda da sua empresa na nossa r√°dio digital conectada 24h por dia.",
    icon: Radio,
    color: "from-orange-500/20 to-yellow-500/20 text-orange-400"
  },
  {
    title: "Exposi√ß√£o Infinita na TV Online",
    desc: "Exibi√ß√£o cont√≠nua do seu comercial no tel√£o de alta audi√™ncia do portal principal. Quem √© visto √© lembrado e vende muito mais todos os dias.",
    icon: Tv,
    color: "from-red-500/20 to-orange-500/20 text-red-500"
  },
  {
    title: "Clientes Prontos das Redes",
    desc: "Atra√≠mos e filtramos o p√∫blico qualificado que j√° est√° buscando os seus servi√ßos ou produtos nas redes e enviamos direto para a sua vitrine virtual.",
    icon: TrendingUp,
    color: "from-indigo-500/20 to-violet-500/20 text-indigo-400"
  },
  {
    title: "Divulga√ß√£o Massiva nas Redes",
    desc: "Sua marca recomendada e impulsionada de forma estrat√©gica em todas as nossas m√≠dias e grupos parceiros locais, gerando autoridade m√°xima para voc√™.",
    icon: Sparkles,
    color: "from-rose-500/20 to-pink-500/20 text-rose-400"
  }
];

const COMPANIES_DATA = [
  { id: 1, name: "Bossa Infor", category: "Publicidade", desc: "Solu√ß√µes em √Åudio & V√≠deo", logo: "https://i.postimg.cc/Gpykbbz5/nova_logo_bossa_infor_png.png", wa: "5585992862177", ig: "https://www.instagram.com/bossainfor/", website: "", featured: true },
  { id: 2, name: "Bel√©m Rolamentos", category: "Oficina", desc: "Manuten√ß√£o preventiva e corretiva.", logo: "https://i.postimg.cc/Y2mTTF1h/1.png", wa: "5591980342025", ig: "https://cutt.ly/belemrolamentoss", website: "", featured: true },
  { id: 3, name: "Assai Atacadista", category: "Supermercado", desc: "Pre√ßo Baixo Todo dia", logo: "https://i.postimg.cc/LX4fh1rh/assai.jpg", wa: "558535334476", ig: "https://www.assai.com.br/", website: "", featured: true },
  { id: 4, name: "Carneiro do Ordones", category: "Restaurante & bar", desc: "Restaurante Pioneiro no Brasil", logo: "https://i.postimg.cc/C1KwKkhv/images.jpg", wa: "558532815959", ig: "https://www.instagram.com/carneirodoordonesoriginal/", website: "", featured: true },
  { id: 6, name: "Atacad√£o", category: "Supermercado", desc: "Pre√ßo baixo de verdade", logo: "https://i.postimg.cc/8PfPWRR8/atacadao-square-Logo-1758223460501.webp", wa: "558532159868", ig: "https://www.atacadao.com.br/", website: "", featured: true },
  { id: 7, name: "North Shopping", category: "Lazer", desc: "O Shopping mais completo para voc√™", logo: "https://i.postimg.cc/mZ5m083x/images.png", wa: "558534043073", ig: "https://www.northshoppingfortaleza.com.br/", website: "", featured: true },
  { id: 8, name: "Gih Cred", category: "Financeiro", desc: "Cr√©dito R√°pido e Seguro", logo: "https://i.postimg.cc/QCby11tL/GIH_CRED.jpg", wa: "5585981502984", ig: "https://www.gihcred.com.br/", website: "", featured: false },
  { id: 9, name: "Cart√£o de Todos", category: "Sa√∫de", desc: "O maior cart√£o de descontos do Brasil", logo: "https://i.postimg.cc/K8SfGPPV/Whats-App-Image-2026-03-12-at-06-48-20.jpg", wa: "5585999093518", ig: "#", website: "", featured: false },
  { id: 10, name: "ESPA√áO FRIO REFRIGERA√á√ÉO", category: "Refrigera√ß√£o", desc: "Solu√ß√µes em climatiza√ß√£o com qualidade, efici√™ncia e conforto para seu ambiente.", logo: "https://i.postimg.cc/7ZwfTgVM/LOGO.png", wa: "5585997403872", ig: "https://wa.me/5585997403872", website: "", featured: true }
];

const VIDEOS = [
  "https://archive.org/download/3_20260315_202603/1.mp4",
  "https://ia601507.us.archive.org/18/items/refrigeracao_20260319/refrigera%C3%A7%C3%A3o.mp4",
  "https://archive.org/download/3_20260315_202603/3.mp4",
  "https://archive.org/download/3_20260315_202603/4.mp4",
  "https://archive.org/download/3_20260315_202603/5.mp4",
  "https://archive.org/download/3_20260315_202603/6.mp4",
  "https://ia600408.us.archive.org/12/items/para-grupos-d-e-whatssap-novo-video/para%20grupos%20d%20e%20whatssap%20novo%20video.mp4",
  "https://archive.org/download/3_20260315_202603/2.mp4"
];

const FLYERS = [
  { image: "https://i.postimg.cc/zDHJ5cCD/CURSO.png", link: "https://wa.me/5585992908713" },
  { image: "https://i.postimg.cc/qMbRP4YH/flyer-minha-divulgacao-c-zap-grupos.png", link: "https://wa.me/5585992908713" },
  { image: "https://i.postimg.cc/d0MqF19v/banner-mer-marco.jpg", link: "https://wa.me/5585992908713" },
  { image: "https://i.postimg.cc/MKvxjRsD/site.png", link: "https://wa.me/5585992908713" },
  { image: "https://i.postimg.cc/0j4TCWtL/supermercados.png", link: "https://wa.me/5585992908713" },
  { image: "https://i.postimg.cc/jjTGvJXY/banner-novo-comerciais-video.png", link: "https://wa.me/5585992908713" },
  { image: "https://i.postimg.cc/W3nCr9nF/Chat-GPT-Image-12-de-mar-de-2026-06-55-05.png", link: "https://wa.me/5585992908713" },
  { image: "https://i.postimg.cc/fbdt577W/gih-cred-2.png", link: "https://wa.me/5585992908713" },
  { image: "https://i.postimg.cc/3wQNLBMN/b-CRIE-ALGO-MAIS-OU.jpg", link: "https://wa.me/5585992908713" },
  { image: "https://i.postimg.cc/XYJ9KyDZ/gih-cred-1.png", link: "https://wa.me/5585992908713" },
  { image: "https://i.postimg.cc/CLX8Swgp/ok.png", link: "https://wa.me/5585992908713" },
  { image: "https://i.postimg.cc/fyyVkZjF/BANNER.png", link: "https://wa.me/5585992908713" }
];

const HORIZONTAL_BANNERS = [
  { 
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&h=400&q=80", 
    link: "https://wa.me/5585997147273", 
    title: "Sal√£o Stephanny Jessie - Promo√ß√µes que real√ßam sua beleza!", 
    active: true 
  },
  { 
    image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&h=400&q=80", 
    link: "https://wa.me/5585992908713", 
    title: "Minha Divulga√ß√£o - Anuncie seu neg√≥cio em formato horizontal", 
    active: true 
  }
];

const TESTIMONIALS = [
  { content: "Desde que comecei a anunciar, meu WhatsApp n√£o para. Recebo clientes novos todos os dias procurando nossos p√£es artesanais.", author: "Ricardo Silva", role: "Dono da Padaria Central", avatar: "https://i.postimg.cc/dVHjL5zV/7.png" },
  { content: "A visibilidade que a plataforma nos trouxe foi incr√≠vel. O contato direto facilita muito o agendamento de consultas.", author: "Ana Oliveira", role: "Gerente da Cl√≠nica Sorriso", avatar: "https://i.postimg.cc/nhCQwpPY/3.png" },
  { content: "Excelente custo-benef√≠cio. O investimento se pagou na primeira semana com os novos servi√ßos que fechamos.", author: "Marcos Souza", role: "Propriet√°rio da Auto Mec√¢nica", avatar: "https://i.postimg.cc/kGTBfpNH/4.png" }
];

const BRAZIL_STATES = [
  { uf: "AC", name: "Acre" },
  { uf: "AL", name: "Alagoas" },
  { uf: "AP", name: "Amap√°" },
  { uf: "AM", name: "Amazonas" },
  { uf: "BA", name: "Bahia" },
  { uf: "CE", name: "Cear√°" },
  { uf: "DF", name: "Distrito Federal" },
  { uf: "ES", name: "Esp√≠rito Santo" },
  { uf: "GO", name: "Goi√°s" },
  { uf: "MA", name: "Maranh√£o" },
  { uf: "MT", name: "Mato Grosso" },
  { uf: "MS", name: "Mato Grosso do Sul" },
  { uf: "MG", name: "Minas Gerais" },
  { uf: "PA", name: "Par√°" },
  { uf: "PB", name: "Para√≠ba" },
  { uf: "PR", name: "Paran√°" },
  { uf: "PE", name: "Pernambuco" },
  { uf: "PI", name: "Piau√≠" },
  { uf: "RJ", name: "Rio de Janeiro" },
  { uf: "RN", name: "Rio Grande do Norte" },
  { uf: "RS", name: "Rio Grande do Sul" },
  { uf: "RO", name: "Rond√¥nia" },
  { uf: "RR", name: "Roraima" },
  { uf: "SC", name: "Santa Catarina" },
  { uf: "SP", name: "S√£o Paulo" },
  { uf: "SE", name: "Sergipe" },
  { uf: "TO", name: "Tocantins" }
];

const CATEGORIES = [
  { name: "Restaurantes & Bares", icon: "üçΩÔ∏è" },
  { name: "Pizzarias", icon: "üçï" },
  { name: "Hamburguerias & Lanches", icon: "üçî" },
  { name: "Mercados & Supermercados", icon: "üõí" },
  { name: "Farm√°cias & Drogarias", icon: "üíä" },
  { name: "Padarias & Confeitarias", icon: "ü•ñ" },
  { name: "Sal√µes, Barbearias & Est√©tica", icon: "‚úÇÔ∏è" },
  { name: "Pet Shops & Veterin√°rias", icon: "üêæ" },
  { name: "Lojas de Roupas & Cal√ßados", icon: "üëó" },
  { name: "Oficinas Mec√¢nicas & Auto", icon: "üîß" },
  { name: "Autope√ßas & Ve√≠culos", icon: "üöò" },
  { name: "Lava Jato & Borracharia", icon: "üöô" },
  { name: "Material de Constru√ß√£o & Reformas", icon: "üß±" },
  { name: "Cl√≠nicas & M√©dicos & Dentistas", icon: "ü©∫" },
  { name: "Academias & Fitness", icon: "üèãÔ∏è" },
  { name: "Eletr√¥nicos & Assist√™ncia de Celular", icon: "üì±" },
  { name: "Inform√°tica & Tecnologia", icon: "üíª" },
  { name: "Sorveterias & A√ßa√≠", icon: "üç¶" },
  { name: "Marmitarias & Quentinhas", icon: "üç±" },
  { name: "Advogados & Jur√≠dico", icon: "‚öñÔ∏è" },
  { name: "Contabilidade & Finan√ßas", icon: "üìä" },
  { name: "Imobili√°rias & Corretores", icon: "üè†" },
  { name: "Escolas & Cursos & Treinamentos", icon: "üéì" },
  { name: "Gr√°ficas & Comunica√ß√£o Visual", icon: "üñ®Ô∏è" },
  { name: "Eletricistas & Encanadores", icon: "‚ö°" },
  { name: "Ar Condicionado & Refrigera√ß√£o", icon: "‚ùÑÔ∏è" },
  { name: "Chaveiros & Seguran√ßa", icon: "üîë" },
  { name: "Hot√©is, Pousadas & Lazer", icon: "üè®" },
  { name: "Eventos, Festas & Buffet", icon: "üéà" },
  { name: "Transporte, Fretes & Mudan√ßas", icon: "üöö" },
  { name: "Perfumarias & Cosm√©ticos", icon: "üíÑ" },
  { name: "Papelarias & Armarinhos", icon: "üìö" },
  { name: "√ìticas & Joalherias", icon: "üëì" },
  { name: "Floriculturas & Jardinagem", icon: "üíê" },
  { name: "Publicidade & Marketing", icon: "üì¢" },
  { name: "Servi√ßos Gerais", icon: "üõ†Ô∏è" }
];

const NOTIFICATION_NAMES = ["Jo√£o", "Maria", "Carlos", "Ana", "Paulo", "Fernanda", "Lucas", "Juliana", "Roberto", "Patricia", "Rafael", "Camila", "Bruno", "Larissa", "Diego", "Renata", "Felipe", "Vanessa", "Eduardo", "Carla"];
const NOTIFICATION_ACTIONS = [
  "acabou de procurar internet fibra", 
  "visitou uma pizzaria", 
  "pediu or√ßamento de oficina", 
  "procurou sal√£o de beleza", 
  "visualizou uma empresa", 
  "procurou restaurante", 
  "buscou servi√ßos de constru√ß√£o",
  "procurou materiais de constru√ß√£o",
  "solicitou or√ßamento de pedreiro",
  "procurou eletricista",
  "buscou servi√ßos na plataforma"
];

const DEFAULT_DATA = {
  theme: { primary: "#ff8a00", bg: "#090d16", text: "#ffffff", textDim: "#a0a0a0" },
  siteInfo: {
    name: "Minha", suffix: "Divulga√ß√£o", description: "Sua maior vitrine digital em todo o Brasil.",
    cnpj: "62.133.196/0001-40", phone: "85 99290-8713", address: "An√∫ncios em Todo o Brasil",
    radioLink: "https://stream.zeno.fm/gsstolze3mjtv",
    heroTitle: "", heroSub: "", radioTitle: "", radioSub: "", ctaTitle: "", ctaSub: "",
    social: {
      fb: "https://www.facebook.com/profile.php?id=61586484977147",
      ig: "https://www.instagram.com/minhadivulgacaooficial/",
      wa: "https://wa.me/5585992908713"
    }
  },
  sections: {
    categories: { title: "QUER LOTAR SEU CORRESPONDENTE OU NEG√ìCIO DE CLIENTES?", desc: "Selecione uma categoria e veja quem j√° est√° faturando alto anunciando na plataforma." },
    tv: { tag: "TV de Sucessos", title: "COMERCIAIS ATIVOS" },
    companies: { tag: "Atraindo Clientes no WhatsApp", title: "FALE DIRETAMENTE COM OS L√çDERES", desc: "Sua empresa pode aparecer aqui e capturar contatos quentes e prontos para comprar todos os dias." },
    flyers: { tag: "Ofertas Imperd√≠veis e Promo√ß√µes" },
    howTo: { tag: "Como Multiplicar Suas Vendas", title: "A F√ìRMULA DE RELEV√ÇNCIA DIGITAL" },
    benefits: { tag: "Por que nos escolher", title: "SUA LOJA EXPOSTA ONDE O CLIENTE REALMENTE OLHA" },
    segments: { tag: "Exclusividade categ√≥rica", title: "RESERVE SEU SETOR ANTES QUE SEU CONCORRENTE FA√áA", highlight: "Aten√ß√£o: Apenas 1 empresa √© permitida por categoria de destaque! N√£o seja deixado para tr√°s.", callToAction: "üëâ CLIQUE AQUI AGORA E BLOQUEIE SEU SEGMENTO ANTES QUE SEU MAIOR RIVAL COLOQUE A MARCA DELE PRIMEIRO" }
  },
  pricing: {
    badge: "Exclusividade m√°xima garantida", title: "Plano Divulga√ß√£o", price: "59,90", period: "M√äS",
    features: [
      "Comercial exibido na TV Online da plataforma 24h por dia",
      "Divulga√ß√£o cont√≠nua na R√°dio Digital da plataforma",
      "Card empresarial em destaque na p√°gina principal",
      "Presen√ßa nas buscas internas do guia digital",
      "Bot√£o de contato direto via WhatsApp",
      "Cat√°logo digital on line 24 Horas",
      "Divulga√ß√£o 24 horas",
      "Link personalizado para venda direta no whatsapp"
    ],
    cta: "QUERO DIVULGAR AGORA", waLink: "https://wa.me/5585992908713"
  },
  segmentsList: [
    { name: "Internet", status: "Dispon√≠vel" }, { name: "Pizzaria", status: "Dispon√≠vel" }, { name: "Oficina", status: "Ocupado" },
    { name: "Sal√£o de Beleza", status: "Dispon√≠vel" }, { name: "Farm√°cia", status: "Dispon√≠vel" }, { name: "Pet Shop", status: "Dispon√≠vel" }, { name: "Financeiro", status: "Ocupado" }
  ],
  chatKeywords: {
    'mercado, mercadinho, feira, supermercado, mercearia, hortifruti, sacolao, compras, alimentos, mantimentos': 'Supermercado',
    'comida, restaurante, bar, lanche, lanchonete, pizza, pizzaria, hamburguer, marmita, janta, almoco, fome, apetite, gastronomia': 'Restaurante & bar',
    'mecanico, oficina, carro, conserto, pneu, borracharia, auto, freio, motor, suspensao, alinhamento, balanceamento, pecas, lanternagem': 'Oficina',
    'saude, clinica, medico, dentista, consulta, remedio, farmacia, exames, hospital, dor, dente, psicologo, fisioterapia, pediatra': 'Sa√∫de',
    'dinheiro, financeiro, credito, emprestimo, banco, financiamento, investimento, divida, juros, saldo, caixa, financiador, capital': 'Financeiro',
    'lazer, diversao, festa, show, evento, cinema, parque, hotel, viagem, turismo, praia, piscina, clube, balada, entretenimento': 'Lazer',
    'propaganda, publicidade, comercial, anuncio, divulgacao, marketing, banner, video, marketing digital, patrocinio, promover, destacar, vendas': 'Publicidade',
    'ar condicionado, geladeira, refrigeracao, freezers, conserto de geladeira, climatizacao, arcondicionado, split, geladeiras, freezer': 'Refrigera√ß√£o'
  },
  notificationsData: {
    names: NOTIFICATION_NAMES,
    actions: NOTIFICATION_ACTIONS
  },
  companies: COMPANIES_DATA,
  videos: VIDEOS,
  flyers: FLYERS,
  testimonials: TESTIMONIALS,
  categories: CATEGORIES,
  whatsappTestimonials: [],
  horizontalBanners: HORIZONTAL_BANNERS
};

// --- Helper Functions ---
const normalize = (str: string) => (str || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const slugify = (str: string) => (str || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');

// --- Plan & Monetization Helpers ---
export function getCompanyPlanType(company: any): 'patrocinado' | 'destaque' | 'verificado' | 'gratuito' {
  if (!company) return 'gratuito';
  
  if (company.vencimentoPlano) {
    const todayStr = new Date().toISOString().split('T')[0];
    if (company.vencimentoPlano < todayStr) {
      return 'gratuito';
    }
  }

  if (company.patrocinado || company.tipoPlano === 'patrocinado' || company.plan === 'sponsored' || company.plan === 'patrocinado') return 'patrocinado';
  if (company.destaque || company.tipoPlano === 'destaque' || company.tipoPlano === 'premium' || company.plan === 'premium' || company.hasPlan || (company.featured && company.tipoPlano !== 'gratuito')) return 'destaque';
  if (company.verificado || company.tipoPlano === 'verificado' || company.isVerified) return 'verificado';
  return 'gratuito';
}

export function getCompanyOrderScore(company: any): number {
  if (!company) return 0;
  const planType = getCompanyPlanType(company);
  let planTier = 100000;
  if (planType === 'patrocinado') planTier = 900000;
  else if (planType === 'destaque') planTier = 500000;
  else if (planType === 'verificado') planTier = 300000;

  const posFixa = Number(company.posicaoCategoria || company.posicaoFixa || company.posicao || 0);
  const fixedPosBonus = (posFixa > 0 && posFixa <= 10) ? (11 - posFixa) * 20000 : 0;

  const priority = Number(company.prioridade || 0);
  const views = Number(company.views || 0);

  return planTier + fixedPosBonus + (priority * 10) + (views * 0.01);
}

export function sortCompaniesByPlanAndPriority(companies: any[]): any[] {
  if (!Array.isArray(companies)) return [];
  return [...companies].sort((a, b) => {
    const scoreA = getCompanyOrderScore(a);
    const scoreB = getCompanyOrderScore(b);
    if (scoreB !== scoreA) {
      return scoreB - scoreA;
    }
    return (a.name || '').localeCompare(b.name || '');
  });
}

export function getCompanyCategoryRanking(company: any, allCompanies: any[]): {
  position: number;
  totalInCat: number;
  premiumInCat: number;
  rankBadge: string;
} {
  if (!company) return { position: 1, totalInCat: 1, premiumInCat: 0, rankBadge: '1¬∫ Lugar' };

  const catName = (company.category || '').trim().toLowerCase();
  const sameCat = (allCompanies || []).filter(c => c && c.active !== false && (c.category || '').trim().toLowerCase() === catName);
  
  const pool = sameCat.length > 0 ? sameCat : [company];
  const sortedCat = sortCompaniesByPlanAndPriority(pool);

  const compIdStr = String(company.id || '');
  const compNameStr = (company.name || '').toLowerCase().trim();

  const index = sortedCat.findIndex(c => String(c.id || '') === compIdStr || (c.name || '').toLowerCase().trim() === compNameStr);
  const position = index !== -1 ? index + 1 : sortedCat.length;

  const premiumInCat = pool.filter(c => getCompanyPlanType(c) !== 'gratuito').length;

  let rankBadge = `#${position}¬∫ Lugar`;
  if (position === 1) rankBadge = 'ü•á 1¬∫ Lugar';
  else if (position === 2) rankBadge = 'ü•à 2¬∫ Lugar';
  else if (position === 3) rankBadge = 'ü•â 3¬∫ Lugar';

  return {
    position,
    totalInCat: pool.length || 1,
    premiumInCat,
    rankBadge
  };
}

export function calculateVisibilityScore(company: any): { score: number; checklist: { id: string; label: string; bonus: number; done: boolean; action: string }[] } {
  if (!company) return { score: 0, checklist: [] };

  const hasLogo = Boolean(company.logo && company.logo.trim());
  const hasDesc = Boolean(company.desc && company.desc.trim().length > 15);
  const hasWa = Boolean(company.wa && company.wa.trim());
  const hasItems = Boolean(company.items && company.items.length >= 3);
  const hasHours = Boolean(company.hours || company.horario);
  const hasVideo = Boolean(company.videoUrl || company.video);
  const hasPromo = Boolean(company.items && company.items.some((i: any) => i.promo || i.discount || i.originalPrice));
  const isVerificado = Boolean(company.verificado || company.tipoPlano === 'verificado');
  const isDestaque = Boolean(company.destaque || company.tipoPlano === 'destaque' || company.tipoPlano === 'premium' || company.featured);
  const isPatrocinado = Boolean(company.patrocinado || company.tipoPlano === 'patrocinado');

  const checklist = [
    { id: 'logo', label: 'Logomarca e foto do perfil cadastrados', bonus: 10, done: hasLogo, action: 'perfil' },
    { id: 'desc', label: 'Descri√ß√£o detalhada do neg√≥cio', bonus: 10, done: hasDesc, action: 'perfil' },
    { id: 'wa', label: 'WhatsApp comercial para vendas diretas', bonus: 10, done: hasWa, action: 'perfil' },
    { id: 'items', label: 'Cadastrar 3 ou mais produtos / servi√ßos', bonus: 15, done: hasItems, action: 'catalogo' },
    { id: 'hours', label: 'Informar Hor√°rio de Funcionamento', bonus: 10, done: hasHours, action: 'perfil' },
    { id: 'video', label: 'Adicionar V√≠deo da Empresa', bonus: 10, done: hasVideo, action: 'perfil' },
    { id: 'promo', label: 'Cadastrar Promo√ß√µes e Descontos', bonus: 10, done: hasPromo, action: 'catalogo' },
    { id: 'verificado', label: 'Ativar Selo de Empresa Verificada', bonus: 10, done: isVerificado, action: 'plano' },
    { id: 'premium', label: 'Ativar Plano Destaque ou Patrocinado (1¬∫ Lugar)', bonus: 15, done: isDestaque || isPatrocinado, action: 'plano' },
  ];

  const totalScore = checklist.reduce((acc, item) => acc + (item.done ? item.bonus : 0), 0);
  return { score: Math.min(100, totalScore), checklist };
}

// --- Types ---
interface AppData {
  theme: any;
  siteInfo: any;
  sections: any;
  pricing: any;
  segmentsList: any[];
  chatKeywords: Record<string, string>;
  notificationsData: any;
  companies: any[];
  videos: string[];
  flyers: { image: string; link: string }[];
  testimonials: any[];
  categories: any[];
  whatsappTestimonials?: { image: string; active?: boolean }[];
  horizontalBanners?: { image: string; link: string; title?: string; active?: boolean }[];
}

// --- ImgBB Direct Upload Helpers & Components ---
const IMGBB_API_KEY = "b84e5dcba9b322fbb2c1adde190bfe95";

export const uploadToImgBB = async (file: File): Promise<string> => {
  const apiKey = (import.meta.env as any).VITE_IMGBB_API_KEY || IMGBB_API_KEY;
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (data && data.success && data.data && data.data.url) {
    return data.data.url;
  } else {
    throw new Error(data?.error?.message || "Erro ao fazer upload da imagem no ImgBB.");
  }
};

function DirectFileUploadButton({ 
  onUploadSuccess, 
  label = "üì∑ Escolher do Celular", 
  className = "" 
}: { 
  onUploadSuccess: (url: string) => void; 
  label?: string; 
  className?: string; 
}) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem (JPG, PNG, WEBP, etc.).');
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadToImgBB(file);
      onUploadSuccess(url);
    } catch (err: any) {
      console.error("ImgBB upload error:", err);
      alert("Falha ao enviar foto. Tente novamente.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`inline-flex items-center ${className}`}>
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        style={{ display: 'none' }} 
      />
      <button
        type="button"
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
        className="text-[10px] font-bold uppercase tracking-wider bg-[var(--primary)] text-black hover:brightness-110 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
      >
        {isUploading ? (
          <>
            <span className="animate-spin text-xs">‚è≥</span>
            <span>Enviando...</span>
          </>
        ) : (
          <>
            <span>{label}</span>
          </>
        )}
      </button>
    </div>
  );
}

function DevFileUploadButton({
  onUploadSuccess,
  label = "üì∑ Enviar Foto do Celular"
}: {
  onUploadSuccess: (url: string) => void;
  label?: string;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem.');
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadToImgBB(file);
      onUploadSuccess(url);
    } catch (err: any) {
      console.error("ImgBB upload error:", err);
      alert("Falha ao enviar imagem.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center' }}>
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        style={{ display: 'none' }} 
      />
      <button
        type="button"
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
        className="dev-btn dev-btn-secondary"
        style={{ padding: '4px 10px', fontSize: '0.65rem', textDecoration: 'none', height: 'auto', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}
      >
        {isUploading ? "‚è≥ Enviando..." : label}
      </button>
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<AppContent />} />
        <Route path="/:tenantId" element={<AppContent />} />
        <Route path="/" element={<AppContent />} />
      </Routes>
    </HashRouter>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const { tenantId } = useParams();
  const location = useLocation();

  const hasActiveReferral = useMemo(() => {
    const tid = slugify(tenantId || 'fortaleza');
    const fullUrl = window.location.href;
    const searchPart = fullUrl.includes('?') ? fullUrl.split('?')[1] : '';
    const queryParams = new URLSearchParams(searchPart);
    const refCode = queryParams.get('ref') || queryParams.get('indica');
    return !!(refCode || sessionStorage.getItem(`ref_${tid}`));
  }, [tenantId, location]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const fetchAdvertisers = useCallback(async (tId: string) => {
    setIsAdLoading(true);
    try {
      const tid = slugify(tId);
      const q = query(collection(db, 'advertisers'), where('tenantId', '==', tid));
      const snap = await getDocs(q);
      const ads: any[] = [];
      snap.forEach((docDoc) => {
        const d = docDoc.data();
        if (d.company) {
          ads.push({
            ...d.company,
            id: d.company.id || docDoc.id,
            email: d.email,
            password: d.password,
            expiresAt: d.expiresAt || d.company.expiresAt || '',
            createdAt: d.createdAt || d.company.createdAt || '',
            isAdvertiserCreated: true
          });
        }
      });
      setAdvertiserCompanies(ads);
    } catch (err) {
      console.error("Error loading advertisers", err);
    } finally {
      setIsAdLoading(false);
    }
  }, []);

  // --- Firestore Error Handlers ---
  enum OperationType {
    CREATE = 'create',
    UPDATE = 'update',
    DELETE = 'delete',
    LIST = 'list',
    GET = 'get',
    WRITE = 'write',
  }

  interface FirestoreErrorInfo {
    error: string;
    operationType: OperationType;
    path: string | null;
    authInfo: {
      userId?: string | null;
      email?: string | null;
      emailVerified?: boolean | null;
      isAnonymous?: boolean | null;
      tenantId?: string | null;
      providerInfo?: {
        providerId?: string | null;
        email?: string | null;
      }[];
    }
  }

  const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
    const errInfo: FirestoreErrorInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid || null,
        email: auth.currentUser?.email || null,
        emailVerified: auth.currentUser?.emailVerified || null,
        isAnonymous: auth.currentUser?.isAnonymous || null,
        tenantId: auth.currentUser?.tenantId || null,
        providerInfo: auth.currentUser?.providerData?.map(provider => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || []
      },
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  };

  // --- Reviews State & Functions ---
  const [reviews, setReviews] = useState<any[]>([]);
  const [isCompanyReviewFormOpen, setIsCompanyReviewFormOpen] = useState(false);
  const [newCompanyReviewForm, setNewCompanyReviewForm] = useState({ rating: 5, author: '', comment: '' });
  const [copiedAdLink, setCopiedAdLink] = useState(false);

  const fetchReviews = useCallback(async (tId: string) => {
    try {
      const tid = slugify(tId);
      const q = query(collection(db, 'reviews'), where('tenantId', '==', tid));
      const snap = await getDocs(q).catch((err) => {
        handleFirestoreError(err, OperationType.LIST, 'reviews');
      });
      const revs: any[] = [];
      if (snap) {
        snap.forEach((docDoc) => {
          revs.push({
            id: docDoc.id,
            ...docDoc.data()
          });
        });
      }
      setReviews(revs);
    } catch (err) {
      console.error("Error loading reviews", err);
    }
  }, []);

  const addReview = async (companyId: string, rating: number, author: string, comment: string) => {
    try {
      const tid = slugify(tenantId || 'fortaleza');
      const newReviewDoc = {
        companyId: String(companyId),
        tenantId: tid,
        rating,
        author: author.trim() || 'An√¥nimo',
        comment: comment.trim(),
        createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, 'reviews'), newReviewDoc).catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, 'reviews');
      });
      
      if (!docRef) return false;

      const savedReview = {
        id: docRef.id,
        ...newReviewDoc
      };
      // Update local state
      setReviews(prev => [
        ...prev,
        savedReview
      ]);
      return true;
    } catch (err) {
      console.error("Error adding review", err);
      return false;
    }
  };

  const getCompanyReviewStats = (companyId: string) => {
    const companyReviews = reviews.filter(r => String(r.companyId) === String(companyId));
    if (companyReviews.length === 0) {
      return { average: 0, count: 0, reviewsList: [] };
    }
    const sum = companyReviews.reduce((acc, r) => acc + r.rating, 0);
    return {
      average: Math.round((sum / companyReviews.length) * 10) / 10,
      count: companyReviews.length,
      reviewsList: companyReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    };
  };

  const [user, setUser] = useState<{ uid: string; email: string | null; username: string; city: string; isAdmin?: boolean } | null>(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '', city: '' });
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [universalConfig, setUniversalConfig] = useState<any>({ 
    radioLink: '', 
    horizontalTvLink: 'https://saas-tv-digital-signage-217322288286.us-east1.run.app/testando',
    logoSpeed: 100, 
    flyerSpeed: 180, 
    testimonialSpeed: 120, 
    companySpeed: 200, 
    totalVisits: 0,
    uploadImageHelpUrl: 'https://postimages.org/',
    uploadVideoHelpUrl: 'https://streamable.com/'
  });
  const [onlineCount, setOnlineCount] = useState(Math.floor(Math.random() * (22 - 12 + 1)) + 12);
  const [customRadioLink, setCustomRadioLink] = useState<string>('');
  const [allUsers, setAllUsers] = useState<any>(null);
  const [editingVideosFor, setEditingVideosFor] = useState<{id: string, city: string, videos: string[]} | null>(null);
  const [tvMuted, setTvMuted] = useState(false);
  const [tvVolume, setTvVolume] = useState(1);
  const [tvKey, setTvKey] = useState(0);
  const [isTvLoading, setIsTvLoading] = useState(true);
  const tvIframeRef = useRef<HTMLIFrameElement>(null);

  const sendTvVolume = (vol: number, muted: boolean) => {
    try {
      const cw = tvIframeRef.current?.contentWindow;
      if (cw) {
        cw.postMessage({ type: 'SET_VOLUME', volume: vol, muted }, '*');
        cw.postMessage({ action: 'setVolume', volume: vol, muted }, '*');
        cw.postMessage({ type: 'volume', value: vol, muted }, '*');
        cw.postMessage({ event: 'command', func: 'setVolume', args: [vol * 100] }, '*');
        if (muted || vol === 0) {
          cw.postMessage({ type: 'MUTE' }, '*');
          cw.postMessage({ event: 'command', func: 'mute', args: [] }, '*');
        } else {
          cw.postMessage({ type: 'UNMUTE' }, '*');
          cw.postMessage({ event: 'command', func: 'unMute', args: [] }, '*');
        }
      }
    } catch (err) {
      console.error('Error sending volume to TV iframe:', err);
    }
  };

  const handleTvVolumeChange = (newVol: number) => {
    setTvVolume(newVol);
    if (newVol > 0 && tvMuted) {
      setTvMuted(false);
      sendTvVolume(newVol, false);
    } else {
      sendTvVolume(newVol, tvMuted);
    }
  };

  const handleTvMuteToggle = () => {
    const newMuted = !tvMuted;
    setTvMuted(newMuted);
    sendTvVolume(tvVolume, newMuted);
  };

  const reloadTvPlayer = () => {
    setIsTvLoading(true);
    setTvKey(prev => prev + 1);
  };
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const [appData, setAppData] = useState<AppData | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showVideos, setShowVideos] = useState(false);
  const [showRadio, setShowRadio] = useState(true);
  const [tenantHasRadioPlayer, setTenantHasRadioPlayer] = useState(false);
  const [hasAffiliateSystem, setHasAffiliateSystem] = useState(false);
  const [hideAdvertiserAuth, setHideAdvertiserAuth] = useState(true);
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [isAffLoading, setIsAffLoading] = useState(false);

  // --- Modal states to replace window.prompt for sandboxed iframes ---
  const [showAddCityModal, setShowAddCityModal] = useState(false);
  const [newCityId, setNewCityId] = useState('');
  const [newCityPass, setNewCityPass] = useState('');
  const [newCityName, setNewCityName] = useState('');

  const [showEditCityModal, setShowEditCityModal] = useState(false);
  const [editingCityUname, setEditingCityUname] = useState('');
  const [editingCityPass, setEditingCityPass] = useState('');
  const [editingCityName, setEditingCityName] = useState('');

  const [showDaysCityModal, setShowDaysCityModal] = useState(false);
  const [daysCityUname, setDaysCityUname] = useState('');
  const [daysToAddInput, setDaysToAddInput] = useState('30');

  const [showRadioCityModal, setShowRadioCityModal] = useState(false);
  const [radioCityUname, setRadioCityUname] = useState('');
  const [radioLinkInput, setRadioLinkInput] = useState('');
  const [radioActiveInput, setRadioActiveInput] = useState(true);
  const [radioHeaderPlayerInput, setRadioHeaderPlayerInput] = useState(false);

  const [showAddAffiliateModal, setShowAddAffiliateModal] = useState(false);
  const [newAffName, setNewAffName] = useState('');
  const [newAffCode, setNewAffCode] = useState('');
  const [newAffLogo, setNewAffLogo] = useState('');
  const [newAffCustomTitle, setNewAffCustomTitle] = useState('');
  const [activeReferralPartner, setActiveReferralPartner] = useState<any>(null);

  // --- Advertiser & Mini-Site States ---
  const [advertiserCompanies, setAdvertiserCompanies] = useState<any[]>([]);
  const [isAdLoading, setIsAdLoading] = useState(false);
  const [activeMiniSiteCompany, setActiveMiniSiteCompany] = useState<any | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [pixCopied, setPixCopied] = useState(false);
  const [shoppingCart, setShoppingCart] = useState<{ [key: string]: { item: any, count: number } }>(() => {
    try {
      const saved = localStorage.getItem('minhadivulgacao_cart');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('minhadivulgacao_cart', JSON.stringify(shoppingCart));
    } catch (err) {
      console.error("Erro ao salvar carrinho no localStorage:", err);
    }
  }, [shoppingCart]);
  const [cartCustomerName, setCartCustomerName] = useState('');
  const [cartCustomerDetails, setCartCustomerDetails] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'entrega' | 'retirada'>('entrega');
  const [paymentMethod, setPaymentMethod] = useState<'pix_chave' | 'pix_qrcode' | 'cartao_entrega' | 'cartao_retirada' | 'dinheiro'>('pix_chave');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerStreet, setCustomerStreet] = useState('');
  const [customerNumber, setCustomerNumber] = useState('');
  const [customerNeighborhood, setCustomerNeighborhood] = useState('');
  const [customerCity, setCustomerCity] = useState('');
  const [customerState, setCustomerState] = useState('');
  const [customerCep, setCustomerCep] = useState('');
  const [customerComplement, setCustomerComplement] = useState('');
  const [customerReference, setCustomerReference] = useState('');
  const [cashChangeNeeded, setCashChangeNeeded] = useState(false);
  const [cashChangeFor, setCashChangeFor] = useState('');
  const [attachedProofName, setAttachedProofName] = useState('');
  const [isAdPortalOpen, setIsAdPortalOpen] = useState<boolean>(() => {
    // If URL contains a share link ID parameter (?id=...), DO NOT open the advertiser portal on load!
    try {
      const fullUrl = window.location.href;
      if (fullUrl.includes('?id=') || fullUrl.includes('&id=')) {
        return false;
      }
    } catch (e) {}
    return false;
  });
  const [isAutoLoggingIn, setIsAutoLoggingIn] = useState<boolean>(() => {
    const email = localStorage.getItem('ad_email');
    const pass = localStorage.getItem('ad_password');
    return !!(email && pass);
  });
  const [currentAdvertiser, setCurrentAdvertiser] = useState<any | null>(null);

  const handleOpenUploadHelper = (e: any, url: string, target = 'portal_upload_imagem') => {
    e.preventDefault();
    const win = window.open(url, target);
    if (win) {
      win.focus();
    }
  };
  const [adLoginMode, setAdLoginMode] = useState<'login' | 'register'>('login');
  const [adLoginForm, setAdLoginForm] = useState({ email: '', password: '' });
  const [adRegisterForm, setAdRegisterForm] = useState({
    email: '',
    password: '',
    name: '',
    wa: '5585',
    category: 'Supermercado',
    type: 'loja',
    desc: '',
    logo: '',
    ig: '',
    state: 'CE',
    city: 'Fortaleza'
  });
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [itemForm, setItemForm] = useState({
    name: '',
    desc: '',
    price: '',
    photo: '',
    photo2: '',
    photo3: '',
    photo4: '',
    video: '',
    sizes: '',
    colors: '',
    options: ''
  });
  const [adDashboardTab, setAdDashboardTab] = useState<'metricas' | 'perfil' | 'catalogo' | 'plano'>(() => {
    return (localStorage.getItem('adDashboardTab') as any) || 'metricas';
  });

  // Persistence and State Preservation for the Advertiser Portal
  // Persist advertiser portal open status and active dashboard tab to localStorage
  useEffect(() => {
    localStorage.setItem('isAdPortalOpen', isAdPortalOpen ? 'true' : 'false');
  }, [isAdPortalOpen]);

  useEffect(() => {
    localStorage.setItem('adDashboardTab', adDashboardTab);
  }, [adDashboardTab]);

  // SEO Schema.org JSON-LD Structured Data Injection for Google Search Indexing
  useEffect(() => {
    const siteName = appData?.siteInfo?.name || 'Portal Guia Comercial';
    const siteDesc = 'Posicione sua empresa em destaque e receba clientes da sua cidade diretamente no WhatsApp.';
    
    document.title = `${siteName} | Divulgue sua Empresa e Domine o Mercado Local`;

    const schemaData = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": siteName,
      "url": window.location.origin,
      "description": siteDesc,
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${window.location.origin}/#filtro-empresas?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    };

    let scriptTag = document.getElementById('schema-jsonld') as HTMLScriptElement;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'schema-jsonld';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.text = JSON.stringify(schemaData);
  }, [appData]);

  // Auto login effect for advertisers on refresh
  useEffect(() => {
    const savedEmail = localStorage.getItem('ad_email');
    const savedPass = localStorage.getItem('ad_password');
    if (savedEmail && savedPass && !currentAdvertiser) {
      const autoLogin = async () => {
        try {
          const q = query(collection(db, 'advertisers'), where('email', '==', savedEmail.toLowerCase().trim()));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const adDoc = snap.docs[0];
            const docData = adDoc.data();
            if (docData.password === savedPass) {
              if (docData.isBlocked || docData.company?.isBlocked) {
                localStorage.removeItem('ad_email');
                localStorage.removeItem('ad_password');
                alert("Sua conta foi bloqueada pelo administrador.");
                return;
              }
              setCurrentAdvertiser({
                id: adDoc.id,
                ...docData
              });
            } else {
              localStorage.removeItem('ad_email');
              localStorage.removeItem('ad_password');
            }
          } else {
            localStorage.removeItem('ad_email');
            localStorage.removeItem('ad_password');
          }
        } catch (err) {
          console.error("Auto-login failed:", err);
        } finally {
          setIsAutoLoggingIn(false);
        }
      };
      autoLogin();
    } else {
      setIsAutoLoggingIn(false);
    }
  }, []);

  // --- Item Detail & Reviews States ---
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<any | null>(null);
  const [itemSelectedSize, setItemSelectedSize] = useState<string>('');
  const [itemSelectedColor, setItemSelectedColor] = useState<string>('');
  const [itemSelectedOptions, setItemSelectedOptions] = useState<string[]>([]);
  const [itemNoteText, setItemNoteText] = useState<string>('');
  const [activeMediaIndex, setActiveMediaIndex] = useState<number>(0);
  const [detailModalTab, setDetailModalTab] = useState<'detalhes' | 'avaliacoes'>('detalhes');
  const [itemReviews, setItemReviews] = useState<any[]>([]);
  const [newReviewForm, setNewReviewForm] = useState({ rating: 5, author: '', comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Reset activeMediaIndex and item variation selections when item changes
  useEffect(() => {
    setActiveMediaIndex(0);
    setItemSelectedSize('');
    setItemSelectedColor('');
    setItemSelectedOptions([]);
    setItemNoteText('');
  }, [selectedItemForDetail]);

  // Load reviews for selectedItemForDetail
  useEffect(() => {
    if (!selectedItemForDetail || !activeMiniSiteCompany) {
      setItemReviews([]);
      return;
    }
    const q = query(
      collection(db, 'reviews'),
      where('companyId', '==', activeMiniSiteCompany.id || ''),
      where('itemId', '==', selectedItemForDetail.id)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      // Sort by date descending
      list.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      setItemReviews(list);
    }, (error) => {
      console.error("Error loading reviews:", error);
    });
    return () => unsubscribe();
  }, [selectedItemForDetail, activeMiniSiteCompany]);

  const isAdExpired = useMemo(() => {
    if (!currentAdvertiser) return false;
    // Only blocked accounts are blocked from saving or accessing
    if (currentAdvertiser.company?.blocked || currentAdvertiser.isBlocked) return true;
    return false;
  }, [currentAdvertiser]);

  const getRemainingTrialDays = useCallback(() => {
    if (!currentAdvertiser?.expiresAt) return 0;
    const expiry = new Date(currentAdvertiser.expiresAt + 'T23:59:59');
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays : 0;
  }, [currentAdvertiser]);

  // --- Initial Firebase Data Load ---
  useEffect(() => {
    if (location.pathname !== '/login') {
      const fetchCity = async () => {
        setIsLoading(true);
        try {
          const targetTenantId = tenantId || 'fortaleza';
          const id = slugify(targetTenantId);
          const snap = await getDoc(doc(db, 'tenants', id));
          if (snap.exists()) {
            const tData = snap.data();
            const loadedData = tData.data || DEFAULT_DATA;
            if (loadedData) {
              if (loadedData.pricing) {
                if (!loadedData.pricing.price || loadedData.pricing.price === '39,90' || loadedData.pricing.price === '39.90' || loadedData.pricing.price === '49,90' || loadedData.pricing.price === '49.90' || loadedData.pricing.price === '147') {
                  loadedData.pricing.price = '59,90';
                }
                if (!loadedData.pricing.title || loadedData.pricing.title === 'Plano M√°quina de Clientes VIP') {
                  loadedData.pricing.title = 'Plano Divulga√ß√£o';
                }
                if (loadedData.pricing.period) {
                  loadedData.pricing.period = loadedData.pricing.period.replace(/^\/+/, '').toUpperCase();
                } else {
                  loadedData.pricing.period = 'M√äS';
                }
              }

              if (!loadedData.categories || !Array.isArray(loadedData.categories) || loadedData.categories.length < 10) {
                loadedData.categories = CATEGORIES;
              } else {
                const existingNames = new Set(loadedData.categories.map((c: any) => c.name));
                CATEGORIES.forEach(cat => {
                  if (!existingNames.has(cat.name)) {
                    loadedData.categories.push(cat);
                  }
                });
              }
            }
            setAppData(loadedData);
            setCustomRadioLink(tData.customRadioLink || '');
            fetchAdvertisers(targetTenantId);
            fetchReviews(targetTenantId);
            
            // Check Expiration
            let blockedFlag = tData.isBlocked || false;
            if (tData.expiresAt) {
              const expiry = new Date(tData.expiresAt);
              if (expiry < new Date()) {
                blockedFlag = true;
              }
            }
            setIsBlocked(blockedFlag);
            
            setShowVideos(tData.showVideos === true);
            setShowRadio(tData.showRadio !== false);
            setTenantHasRadioPlayer(tData.hasRadioPlayer === true);
            setHasAffiliateSystem(tData.hasAffiliateSystem === true);
            setHideAdvertiserAuth(tData.hideAdvertiserAuth !== false);
          } else {
            console.warn("Cidade n√£o encontrada no banco");
            setAppData(null);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoading(false);
        }
      };
      fetchCity();
    } else {
      // Clear data if at root or login and not logged in
      if (!localStorage.getItem('tenantId')) {
        setAppData(null);
      }
    }
  }, [tenantId, location.pathname]);

  useEffect(() => {
    if (hideAdvertiserAuth) {
      setAdLoginMode('login');
    }
  }, [hideAdvertiserAuth]);

  useEffect(() => {
    // Session visit count
    if (!sessionStorage.getItem('site_visited')) {
      const incrementVisits = async () => {
        try {
          const configRef = doc(db, 'settings', 'universal');
          const snap = await getDoc(configRef);
          if (snap.exists()) {
            await updateDoc(configRef, { totalVisits: increment(1) });
          } else {
            await setDoc(configRef, { 
              totalVisits: 1201, 
              radioLink: '', 
              logoSpeed: 100, 
              flyerSpeed: 180, 
              testimonialSpeed: 120, 
              companySpeed: 200 
            });
          }
          sessionStorage.setItem('site_visited', 'true');
        } catch (e) {
          console.error("Error updating visits:", e);
        }
      };
      incrementVisits();
    }

    // Capture Referral
    const fullUrl = window.location.href;
    const searchPart = fullUrl.includes('?') ? fullUrl.split('?')[1] : '';
    const queryParams = new URLSearchParams(searchPart);
    const refCode = queryParams.get('ref') || queryParams.get('indica');
    
    if (refCode && location.pathname !== '/login') {
      const targetTenantId = tenantId || 'fortaleza';
      const id = slugify(targetTenantId);
      const cleanRef = slugify(refCode);
      const refKey = `ref_tracked_${id}_${cleanRef}`;
      
      // Armazena quem √© o divulgador na sess√£o
      sessionStorage.setItem(`ref_${id}`, cleanRef);

      // Track click apenas se ainda n√£o trackeou nesta sess√£o
      if (!sessionStorage.getItem(refKey)) {
        const trackClick = async () => {
          try {
            const affDoc = doc(db, 'tenants', id, 'affiliates', cleanRef);
            const affSnap = await getDoc(affDoc);
            if (affSnap.exists()) {
               await updateDoc(affDoc, { clicks: increment(1) });
               sessionStorage.setItem(refKey, 'true');
               console.log("Clique trackeado com sucesso:", cleanRef);
            }
          } catch (e) {
            console.error("Error tracking affiliate:", e);
          }
        };
        trackClick();
      }
    }

    // Simulate variations in online users
    const onlineInterval = setInterval(() => {
      setOnlineCount(prev => {
        const change = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
        return Math.max(8, Math.min(35, prev + change));
      });
    }, 20000);

    // Persist login state
    const loadSession = async () => {
      const savedId = localStorage.getItem('tenantId');
      const savedPass = localStorage.getItem('tenantPass');
      if (savedId && savedPass) {
        try {
          const snap = await getDoc(doc(db, 'tenants', savedId));
          if (snap.exists()) {
            const data = snap.data();
            if (data.password === savedPass) {
              setUser({ 
                uid: savedId, 
                email: null,
                username: savedId, 
                city: data.city, 
                isAdmin: data.isAdmin 
              });
              setAppData(data.data || DEFAULT_DATA);
              setCustomRadioLink(data.customRadioLink || '');
              setShowVideos(data.showVideos === true);
              setShowRadio(data.showRadio !== false);
              setTenantHasRadioPlayer(data.hasRadioPlayer === true);
              setHideAdvertiserAuth(data.hideAdvertiserAuth !== false);
              if ((!tenantId || tenantId === 'login') && savedId !== 'fortaleza') {
                navigate('/' + savedId);
              }
            }
          }
        } catch (e) {
          console.error("Session restoration failed:", e);
        }
      }
    };
    loadSession();

    // Listen for config changes
    const unsubConfig = onSnapshot(doc(db, 'settings', 'universal'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setUniversalConfig({
          radioLink: data.radioLink || '',
          horizontalTvLink: data.horizontalTvLink || 'https://saas-tv-digital-signage-217322288286.us-east1.run.app/testando',
          logoSpeed: data.logoSpeed || 100,
          flyerSpeed: data.flyerSpeed || 180,
          testimonialSpeed: data.testimonialSpeed || 120,
          companySpeed: data.companySpeed || 200,
          totalVisits: data.totalVisits || 1200,
          uploadImageHelpUrl: data.uploadImageHelpUrl || 'https://postimages.org/',
          uploadVideoHelpUrl: data.uploadVideoHelpUrl || 'https://streamable.com/'
        });
      }
    }, (error) => {
      console.warn("Config listener notice (wait for login if needed):", error.message);
    });

    // Handle Auth state
    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsAuthChecking(true);
      if (firebaseUser) {
        // Clear manual session if entering as Admin Master
        localStorage.removeItem('tenantId');
        localStorage.removeItem('tenantPass');

        // Find if user is a tenant or admin
        // Step 1: Check by UID (direct)
        let tenantSnap = await getDoc(doc(db, 'tenants', firebaseUser.uid));
        let tenantIdFromDb = firebaseUser.uid;
        let tenantData = tenantSnap.exists() ? tenantSnap.data() : null;

        // Step 2: Check by querying ownerUid or ownerEmail
        if (!tenantData) {
          const q = query(collection(db, 'tenants'), where('ownerEmail', '==', firebaseUser.email), limit(1));
          const qSnap = await getDocs(q);
          if (!qSnap.empty) {
            tenantIdFromDb = qSnap.docs[0].id;
            tenantData = qSnap.docs[0].data();
          } else {
            // Try query by ownerUid
            const q2 = query(collection(db, 'tenants'), where('ownerUid', '==', firebaseUser.uid), limit(1));
            const qSnap2 = await getDocs(q2);
            if (!qSnap2.empty) {
              tenantIdFromDb = qSnap2.docs[0].id;
              tenantData = qSnap2.docs[0].data();
            }
          }
        }
        
        if (tenantData) {
            setUser({ 
              uid: firebaseUser.uid, 
              email: firebaseUser.email,
              username: tenantIdFromDb, // Use the slug/id from DB
              city: tenantData.city, 
              isAdmin: tenantData.isAdmin || firebaseUser.email === 'bossinhaa80@gmail.com'
            });
            setAppData(tenantData.data || DEFAULT_DATA);
            setCustomRadioLink(tenantData.customRadioLink || '');
            // Check Expiration
            let blockedFlag = tenantData.isBlocked || false;
            if (tenantData.expiresAt) {
              const expiry = new Date(tenantData.expiresAt);
              if (expiry < new Date()) {
                blockedFlag = true;
              }
            }
            setIsBlocked(blockedFlag);
            setShowVideos(tenantData.showVideos === true);
            setShowRadio(tenantData.showRadio !== false);
            setTenantHasRadioPlayer(tenantData.hasRadioPlayer === true);
            setHasAffiliateSystem(tenantData.hasAffiliateSystem === true);
            setHideAdvertiserAuth(tenantData.hideAdvertiserAuth !== false);
          
          // Auto navigate to the correct city if on login or wrong page
          if (tenantId === 'login' || tenantId === firebaseUser.uid) {
            navigate('/' + tenantIdFromDb);
          }

          if (tenantData.isAdmin) {
             const tenantsSnap = await getDocs(collection(db, 'tenants'));
             const users: any = {};
             tenantsSnap.forEach(d => users[d.id] = d.data());
             setAllUsers(users);
          }
        } else {
          // If logged in via Google but no tenant record, we check if they are the admin
          if (firebaseUser.email === 'bossinhaa80@gmail.com') {
             setUser({ uid: firebaseUser.uid, email: firebaseUser.email, username: firebaseUser.uid, city: 'Master', isAdmin: true });
             setAppData(DEFAULT_DATA);
             const tenantsSnap = await getDocs(collection(db, 'tenants'));
             const users: any = {};
             tenantsSnap.forEach(d => users[d.id] = d.data());
             setAllUsers(users);
             if (!tenantId || tenantId === 'login') navigate('/master');
          } else {
            // Unrecognized user. Before signing out, we allow them to potentially link 
            // if they browse to their city and use the password then.
            // For now, we take them to login.
            navigate('/login');
          }
        }
      } else {
        // Only clear if not a manual tenant
        if (!localStorage.getItem('tenantId')) {
          setUser(null);
          setAppData(null);
        }
      }
      setIsAuthChecking(false);
    });

    return () => { 
      unsubAuth(); 
      unsubConfig(); 
      clearInterval(onlineInterval); 
    };
  }, [tenantId, navigate]);

  useEffect(() => {
    const fetchReferralPartner = async () => {
      const tid = slugify(tenantId || 'fortaleza');
      const fullUrl = window.location.href;
      const searchPart = fullUrl.includes('?') ? fullUrl.split('?')[1] : '';
      const queryParams = new URLSearchParams(searchPart);
      const refCode = queryParams.get('ref') || queryParams.get('indica') || sessionStorage.getItem(`ref_${tid}`);
      
      if (refCode) {
        const cleanRef = slugify(refCode);
        try {
          const affDoc = doc(db, 'tenants', tid, 'affiliates', cleanRef);
          const affSnap = await getDoc(affDoc);
          if (affSnap.exists()) {
            setActiveReferralPartner({ id: affSnap.id, ...affSnap.data() });
          } else {
            setActiveReferralPartner(null);
          }
        } catch (e) {
          console.error("Error loading affiliate details:", e);
          setActiveReferralPartner(null);
        }
      } else {
        setActiveReferralPartner(null);
      }
    };
    fetchReferralPartner();
  }, [tenantId, location]);



  const getWaLinkWithReferral = (baseUrl: string) => {
    if (!baseUrl) return '#';
    const tid = slugify(tenantId || 'fortaleza');
    const ref = sessionStorage.getItem(`ref_${tid}`);
    if (!ref) return baseUrl;
    
    const referralText = `Ol√°, vim pelo portal ${appData?.siteInfo.name} indicado pelo divulgador: ${ref}`;
    
    // Se o link j√° tem text=, a gente substitui para manter o indicativo do divulgador
    if (baseUrl.toLowerCase().includes('text=')) {
      return baseUrl.replace(/([?&])text=[^&]*/i, `$1text=${encodeURIComponent(referralText)}`);
    }

    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}text=${encodeURIComponent(referralText)}`;
  };

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const id = slugify(loginForm.username);
      
      if (!id) {
        alert("Por favor, digite um nome de usu√°rio.");
        setIsLoading(false);
        return;
      }

      if (authMode === 'register') {
        if (!loginForm.password || !loginForm.city) {
          alert("Preencha todos os campos.");
          setIsLoading(false);
          return;
        }
        
        const snap = await getDoc(doc(db, 'tenants', id));
        if (snap.exists()) {
          alert("Este ID de acesso j√° existe. Tente outro nome.");
          setIsLoading(false);
          return;
        }

        await setDoc(doc(db, 'tenants', id), {
          city: loginForm.city,
          password: loginForm.password,
          data: DEFAULT_DATA,
          isAdmin: false,
          showVideos: false
        });

        localStorage.setItem('tenantId', id);
        localStorage.setItem('tenantPass', loginForm.password);
        
        setUser({ uid: id, email: null, username: id, city: loginForm.city, isAdmin: false });
        setAppData(DEFAULT_DATA);
        alert("Portal criado com sucesso! Redirecionando...");
        setIsDevAreaOpen(true);
        window.location.href = '#/' + id;
        window.location.reload();
        return;
      }

      // Login mode
      const snap = await getDoc(doc(db, 'tenants', id));
      if (snap.exists()) {
        const data = snap.data();
        if (data.password === loginForm.password) {
          localStorage.setItem('tenantId', id);
          localStorage.setItem('tenantPass', loginForm.password);
          
          setUser({ 
            uid: id, 
            email: null,
            username: id, 
            city: data.city, 
            isAdmin: data.isAdmin 
          });
          setAppData(data.data || DEFAULT_DATA);
          setShowVideos(data.showVideos === true);
          setShowRadio(data.showRadio !== false);
          setTenantHasRadioPlayer(data.hasRadioPlayer === true);
          setHideAdvertiserAuth(data.hideAdvertiserAuth !== false);
          setIsDevAreaOpen(true);
          alert("Login realizado com sucesso!");
          window.location.href = '#/' + id;
          window.location.reload();
          return;
        } else {
          alert("Senha incorreta. Tente novamente.");
        }
      } else {
        alert("Cidade/Usu√°rio n√£o encontrado. Verifique o que digitou.");
      }
    } catch (e) {
      console.error(e);
      alert("Ocorreu um erro ao tentar entrar. Verifique sua conex√£o.");
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error(e);
      alert("Erro ao entrar com Google.");
    }
  };

  const logout = async () => {
    localStorage.removeItem('tenantId');
    localStorage.removeItem('tenantPass');
    await signOut(auth);
    setUser(null);
    setAppData(null);
    setIsDevAreaOpen(false);
    navigate('/login');
  };

  const saveToFirebase = async () => {
    if (!user || !appData) return;
    try {
      const activeSlug = slugify(tenantId || 'fortaleza');
      const targetTenantId = (user.isAdmin && activeSlug && activeSlug !== 'login' && activeSlug !== 'master')
        ? activeSlug
        : user.username;

      await updateDoc(doc(db, 'tenants', targetTenantId), {
        data: appData
      });
      alert("Altera√ß√µes salvas com sucesso no Firebase!");
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar no Firebase. Verifique suas permiss√µes.");
    }
  };
  const [openCompanyIndex, setOpenCompanyIndex] = useState<number | null>(null);
  const [visitorCount, setVisitorCount] = useState(2000);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [notifications, setNotifications] = useState<{ id: number; name: string; action: string }[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ sender: 'bot' | 'user'; text: string; results?: any[]; categories?: string[] }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isDevAreaOpen, setIsDevAreaOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('geral');
  const [selectedTestimonialImage, setSelectedTestimonialImage] = useState<string | null>(null);
  
  // Custom public portal states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStateFilter, setSelectedStateFilter] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'all' | 'loja' | 'servico'>('all');
  const [radioPlaying, setRadioPlaying] = useState(false);
  const [radioVolume, setRadioVolume] = useState(0.8);
  const radioAudioRef = useRef<HTMLAudioElement | null>(null);
  const [activeFlyerIndex, setActiveFlyerIndex] = useState(0);
  const [activeHorizontalBannerIndex, setActiveHorizontalBannerIndex] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);

  const getCompanySiteType = (comp: any) => {
    if (!comp) return 'loja';
    const c = comp.company || comp;
    const rawType = (c.type || comp.type || '').toLowerCase();
    const categoryStr = (c.category || comp.category || '').toLowerCase();

    if (rawType.includes('agendamento')) return 'agendamento';
    if (rawType.includes('servico')) return 'servico';
    if (rawType.includes('cardapio')) return 'cardapio';
    if (rawType.includes('loja')) return 'loja';

    // Category fallbacks
    if (['agendamento', 'salao', 'barbearia', 'estetica', 'consultorio', 'massagem', 'dentista', 'podologia', 'unhas', 'cilios', 'tattoo', 'barbeiro', 'beleza', 'petshop'].some(k => categoryStr.includes(k))) {
      return 'agendamento';
    }
    if (['servico', 'servicos', 'saude', 'clinica', 'oficina', 'educacao', 'advocacia', 'publicidade', 'construcao', 'financas', 'academia', 'mecanica', 'pintor', 'eletricista', 'pedreiro', 'limpeza', 'contabilidade', 'refrigeracao', 'tecnico', 'conserto', 'guincho', 'serralheria', 'marcenaria'].some(k => categoryStr.includes(k))) {
      return 'servico';
    }
    if (['cardapio', 'pizzaria', 'lanchonete', 'restaurante', 'hamburgueria', 'comida', 'acai', 'marmita', 'bar', 'sorvete', 'padaria', 'doce', 'confeitaria'].some(k => categoryStr.includes(k))) {
      return 'cardapio';
    }
    return 'loja';
  };

  const getCompanyPrimaryButtonInfo = (company: any) => {
    const sType = getCompanySiteType(company);
    let label = company.primaryButtonText || '';
    if (!label) {
      if (sType === 'servico') {
        label = 'üõ†Ô∏è Ver Servi√ßos & Or√ßamento';
      } else if (sType === 'agendamento') {
        label = 'üìÖ Ver Servi√ßos & Agendamento';
      } else if (sType === 'cardapio') {
        label = 'üçΩÔ∏è Ver Card√°pio & Pedidos';
      } else {
        label = 'üõçÔ∏è Ver Cat√°logo & Pre√ßos';
      }
    }
    return { action: 'minisite', url: '', isExternal: false, label };
  };

  const handleCompanyPrimaryButtonClick = (company: any) => {
    setActiveMiniSiteCompany(company);
    const currentUrl = window.location.href;
    const baseUrl = currentUrl.split('?')[0];
    const nextUrl = `${baseUrl}?id=${company.id || slugify(company.name)}`;
    window.history.pushState({}, '', nextUrl);
  };

  const renderCardActionButtons = (company: any, isCompact: boolean = false) => {
    if (!company) return null;

    const hasWa = Boolean(company.wa && company.wa.trim());
    const hasIg = Boolean(company.ig && company.ig !== '#' && company.ig.trim());
    const hasWebsite = Boolean(company.website && company.website !== '#' && company.website.trim());
    const showCatalog = !company.hideMiniSite;

    const btnInfo = getCompanyPrimaryButtonInfo(company);

    const refCode = sessionStorage.getItem(`ref_${slugify(tenantId || 'fortaleza')}`);
    const waMessage = `Ol√°, vi seu an√∫ncio no portal ${appData?.siteInfo?.name || 'Minha Divulga√ß√£o'}!${refCode ? ` Fui indicado pelo parceiro: ${refCode}` : ''}`;
    const waClean = hasWa ? company.wa.replace(/[^0-9]/g, '') : '';
    const waUrl = `https://wa.me/${waClean}?text=${encodeURIComponent(waMessage)}`;
    const websiteUrl = hasWebsite ? (company.website.trim().startsWith('http') ? company.website.trim() : `https://${company.website.trim()}`) : '#';

    // Primary CTA Button (Row 1)
    let primaryButton = null;

    if (showCatalog) {
      primaryButton = (
        <button 
          onClick={() => handleCompanyPrimaryButtonClick(company)}
          className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black py-2.5 sm:py-3 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest text-center flex items-center justify-center gap-1.5 transition-all duration-300 shadow-md cursor-pointer active:scale-[0.98]"
        >
          <ShoppingBag size={isCompact ? 12 : 14} className="shrink-0" /> 
          <span className="truncate">{btnInfo.label}</span>
        </button>
      );
    } else if (hasWa) {
      primaryButton = (
        <a 
          href={waUrl} 
          target="_blank" 
          rel="noreferrer"
          className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-2.5 sm:py-3 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest text-center flex items-center justify-center gap-2 transition-all duration-300 shadow-md active:scale-[0.98]"
        >
          <Smartphone size={isCompact ? 12 : 14} className="shrink-0" /> Falar no WhatsApp
        </a>
      );
    } else if (hasWebsite) {
      primaryButton = (
        <a 
          href={websiteUrl} 
          target="_blank" 
          rel="noreferrer"
          className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black py-2.5 sm:py-3 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest text-center flex items-center justify-center gap-1.5 transition-all duration-300 shadow-md cursor-pointer active:scale-[0.98]"
        >
          <Globe size={isCompact ? 12 : 14} className="shrink-0" /> Visitar Site Oficial
        </a>
      );
    } else if (hasIg) {
      primaryButton = (
        <a 
          href={company.ig} 
          target="_blank" 
          rel="noreferrer"
          className="w-full bg-[#e1306c] hover:bg-[#d6245d] text-white py-2.5 sm:py-3 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest text-center flex items-center justify-center gap-2 transition-all duration-300 shadow-md active:scale-[0.98]"
        >
          <Instagram size={isCompact ? 12 : 14} className="shrink-0" /> Instagram Oficial
        </a>
      );
    }

    // Secondary Actions (Row 2) - Grid of 1, 2, or 3 buttons
    const secondaryList: React.ReactNode[] = [];

    // WhatsApp as secondary (if Catalog is Primary)
    if (showCatalog && hasWa) {
      secondaryList.push(
        <a 
          key="wa"
          href={waUrl} 
          target="_blank" 
          rel="noreferrer"
          className="flex-1 min-w-0 bg-emerald-500/10 border border-emerald-500/25 hover:bg-[#25D366] hover:border-[#25D366] text-emerald-400 hover:text-white py-2 px-1.5 rounded-xl font-black text-[10px] uppercase tracking-wider text-center flex items-center justify-center gap-1 transition-all duration-200"
          title="Falar no WhatsApp"
        >
          <Smartphone size={12} className="shrink-0" />
          <span className="truncate">WhatsApp</span>
        </a>
      );
    }

    // Instagram as secondary
    const isIgPrimary = !showCatalog && !hasWa && !hasWebsite && hasIg;
    if (hasIg && !isIgPrimary) {
      secondaryList.push(
        <a 
          key="ig"
          href={company.ig} 
          target="_blank" 
          rel="noreferrer"
          className="flex-1 min-w-0 bg-pink-500/10 border border-pink-500/25 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:border-transparent text-pink-400 hover:text-white py-2 px-1.5 rounded-xl font-black text-[10px] uppercase tracking-wider text-center flex items-center justify-center gap-1 transition-all duration-200"
          title="Ver Instagram"
        >
          <Instagram size={12} className="shrink-0" />
          <span className="truncate">Instagram</span>
        </a>
      );
    }

    // Website as secondary
    const isWebsitePrimary = !showCatalog && !hasWa && hasWebsite;
    if (hasWebsite && !isWebsitePrimary) {
      secondaryList.push(
        <a 
          key="web"
          href={websiteUrl} 
          target="_blank" 
          rel="noreferrer"
          className="flex-1 min-w-0 bg-amber-500/10 border border-amber-500/25 hover:bg-amber-500 hover:border-amber-500 text-amber-400 hover:text-black py-2 px-1.5 rounded-xl font-black text-[10px] uppercase tracking-wider text-center flex items-center justify-center gap-1 transition-all duration-200"
          title="Visitar Website"
        >
          <Globe size={12} className="shrink-0" />
          <span className="truncate">Website</span>
        </a>
      );
    }

    if (!primaryButton && secondaryList.length === 0) {
      return (
        <div className="mt-4 pt-3 border-t border-white/5 w-full">
          <span className="text-[9px] text-white/35 text-center py-2.5 bg-white/5 rounded-2xl font-bold uppercase tracking-widest block w-full">
            Sem Links Cadastrados
          </span>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-2 w-full mt-4 pt-3 border-t border-white/5">
        {primaryButton}
        {secondaryList.length > 0 && (
          <div className={`grid gap-1.5 w-full ${
            secondaryList.length === 1 ? 'grid-cols-1' : secondaryList.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
          }`}>
            {secondaryList}
          </div>
        )}
      </div>
    );
  };

  // Live platform activity states (sensa√ß√£o de plataforma ativa e movimentada)
  const [activePlatformActivityIndex, setActivePlatformActivityIndex] = useState(0);
  const platformActivitiesList = [
    { time: "H√° 2 minutos", text: "üî• Novo Anunciante de destaque ativado na categoria Restaurante & bar!" },
    { time: "H√° 12 minutos", text: "üì¢ Campanha Promocional Especial lan√ßada por Supermercado Destaque!" },
    { time: "H√° 30 minutos", text: "üí¨ WhatsApp de atendimento recebeu um novo lead comercial qualificado!" },
    { time: "H√° 41 minutos", text: "üìª R√°dio Online transmitindo SPOT promocional de patrocinador oficial!" },
    { time: "H√° 1 hora", text: "‚≠ê Upgrade de destaque Premium realizado para Oficina mec√¢nica l√≠der!" },
    { time: "H√° 2 horas", text: "üì∫ TV Online registrou pico de 420 espectadores simult√¢neos assistindo!" },
    { time: "H√° 3 horas", text: "‚úÖ Segmento de Farm√°cia preenchido por novo parceiro corporativo oficial!" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActivePlatformActivityIndex((prev) => (prev + 1) % platformActivitiesList.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Sync volume of custom radio player
  useEffect(() => {
    if (radioAudioRef.current) {
      radioAudioRef.current.volume = radioVolume;
    }
  }, [radioVolume]);

  const handleRadioTogglePlay = () => {
    if (radioAudioRef.current) {
      if (radioPlaying) {
        radioAudioRef.current.pause();
        setRadioPlaying(false);
      } else {
        // Toggle video sound off to prioritize radio audio clarity
        setIsMuted(true);
        radioAudioRef.current.play()
          .then(() => setRadioPlaying(true))
          .catch(e => console.error("Radio play failed:", e));
      }
    }
  };

  const displayedCompanies = useMemo(() => {
    if (!appData) return [];
    const baseCompanies = appData.companies || [];
    const merged = [...baseCompanies];
    
    advertiserCompanies.forEach((ad: any) => {
      // Check if advertiser is blocked
      if (ad.isBlocked) return;

      // Check if advertiser trial has expired
      const isExpired = ad.expiresAt && !ad.hasPlan && ad.expiresAt < new Date().toISOString().split('T')[0];
      if (isExpired) return; // Skip showing expired advertisers in the public directory!

      const idx = merged.findIndex((c: any) => slugify(c.name) === slugify(ad.name) || String(c.id) === String(ad.id));
      if (idx !== -1) {
        merged[idx] = { ...merged[idx], ...ad };
      } else {
        merged.push(ad);
      }
    });
    
    return merged;
  }, [appData, advertiserCompanies]);

  const displayedCategories = useMemo(() => {
    if (!appData) return [];
    const manualCats = appData.categories || CATEGORIES || [];
    const merged = [...manualCats];

    // Extract all unique, non-empty, and valid categories from active companies
    const activeCats = Array.from(new Set(
      displayedCompanies
        .map((c: any) => c.category?.trim())
        .filter(Boolean)
    ));

    activeCats.forEach((catName: string) => {
      const exists = merged.some(c => c.name.trim().toLowerCase() === catName.trim().toLowerCase());
      if (!exists) {
        // Dynamically choose a beautiful, relevant emoji/icon
        let icon = "üíº";
        const lowerName = catName.toLowerCase();
        if (lowerName.includes("refriger") || lowerName.includes("ar condicionado") || lowerName.includes("climatiz")) icon = "‚ùÑÔ∏è";
        else if (lowerName.includes("pizz")) icon = "üçï";
        else if (lowerName.includes("hamburg") || lowerName.includes("lanche")) icon = "üçî";
        else if (lowerName.includes("restaurante") || lowerName.includes("comida") || lowerName.includes("gastronom")) icon = "üçΩÔ∏è";
        else if (lowerName.includes("oficina") || lowerName.includes("mecanica") || lowerName.includes("carro") || lowerName.includes("rolamento")) icon = "üîß";
        else if (lowerName.includes("mercado") || lowerName.includes("supermercado") || lowerName.includes("atacad")) icon = "üè≠";
        else if (lowerName.includes("saude") || lowerName.includes("clinica") || lowerName.includes("medico") || lowerName.includes("remedio")) icon = "üíä";
        else if (lowerName.includes("finan") || lowerName.includes("dinheiro") || lowerName.includes("banco") || lowerName.includes("cred")) icon = "üí∏";
        else if (lowerName.includes("publicidade") || lowerName.includes("propaganda") || lowerName.includes("som") || lowerName.includes("audio")) icon = "üéß";
        else if (lowerName.includes("lazer") || lowerName.includes("show") || lowerName.includes("shopping")) icon = "üé≠";
        else if (lowerName.includes("informatic") || lowerName.includes("computador") || lowerName.includes("internet") || lowerName.includes("site") || lowerName.includes("tecnolog")) icon = "üíª";
        else if (lowerName.includes("frete") || lowerName.includes("mudanc") || lowerName.includes("transport")) icon = "üöö";
        else if (lowerName.includes("servi")) icon = "üõ†Ô∏è";

        merged.push({
          name: catName,
          icon: icon
        });
      }
    });

    return merged;
  }, [appData, displayedCompanies]);

  // --- Deep-linking URL check for specific company ID ---
  useEffect(() => {
    const fullUrl = window.location.href;
    const searchPart = fullUrl.includes('?') ? fullUrl.split('?')[1] : '';
    const urlParams = new URLSearchParams(searchPart);
    const urlId = urlParams.get('id');

    if (urlId) {
      // 1. Force close the advertiser login modal so visitor sees the store profile immediately
      setIsAdPortalOpen(false);

      if (displayedCompanies.length > 0) {
        const cleanUrlId = urlId.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

        const found = displayedCompanies.find((c: any) => {
          const cId = String(c.id || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          const cAdvId = String(c.advertiserId || c.ownerId || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          const cDocId = String(c.docId || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          const cNameSlug = slugify(c.name || '').replace(/[^a-z0-9]/g, '');
          const cNameClean = String(c.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          const cEmailUser = c.email ? String(c.email).split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') : '';

          return (
            cId === cleanUrlId ||
            cAdvId === cleanUrlId ||
            cDocId === cleanUrlId ||
            cNameSlug === cleanUrlId ||
            cNameClean === cleanUrlId ||
            (cEmailUser && cEmailUser === cleanUrlId)
          );
        });

        if (found) {
          setActiveMiniSiteCompany(found);
          const urlItemId = urlParams.get('item');
          if (urlItemId && found.items) {
            const foundItem = found.items.find((it: any) => String(it.id) === urlItemId);
            if (foundItem) {
              setSelectedItemForDetail(foundItem);
              setDetailModalTab('detalhes');
            }
          }
        }
      }
    }
  }, [displayedCompanies, location]);

  const filteredCompaniesRaw = appData
    ? displayedCompanies.filter(c => {
        const matchesCategory = selectedCategory ? c.category === selectedCategory : true;
        const matchesSearch = searchQuery 
          ? normalize(c.name).includes(normalize(searchQuery)) || 
            normalize(c.desc || '').includes(normalize(searchQuery)) || 
            normalize(c.category || '').includes(normalize(searchQuery)) ||
            (c.city && normalize(c.city).includes(normalize(searchQuery))) ||
            (c.state && normalize(c.state).includes(normalize(searchQuery))) ||
            (c.uf && normalize(c.uf).includes(normalize(searchQuery))) ||
            (c.neighborhood && normalize(c.neighborhood).includes(normalize(searchQuery))) ||
            (c.bairro && normalize(c.bairro).includes(normalize(searchQuery))) ||
            (c.items && Array.isArray(c.items) && c.items.some((it: any) => 
              normalize(it.title || it.name || '').includes(normalize(searchQuery)) ||
              normalize(it.desc || '').includes(normalize(searchQuery))
            ))
          : true;
        
        // Match state filter
        let matchesState = true;
        if (selectedStateFilter) {
          const companyState = (c.state || c.uf || '').trim().toLowerCase();
          const filterState = selectedStateFilter.trim().toLowerCase();
          
          if (companyState) {
            matchesState = (companyState === filterState);
          } else {
            // Default backward compatibility fallback: assume 'fortaleza' belongs to Cear√° (CE)
            const isCeara = filterState === 'ce';
            const belongsToFortaleza = c.tenantId === 'fortaleza' || !c.tenantId;
            matchesState = isCeara && belongsToFortaleza;
          }
        }
        
        // Match type filter ('loja' vs 'servico')
        let matchesType = true;
        if (selectedTypeFilter !== 'all') {
          const type = c.type || (['servicos', 'servi', 'saude', 'clinica', 'oficina', 'educacao', 'advocacia', 'publicidade', 'construcao', 'financas', 'academia', 'refrigera', 'ar condicionado', 'conserto', 'mecanica'].some(keyword => (c.category || '').toLowerCase().includes(keyword)) ? 'servico' : 'loja');
          matchesType = (type === selectedTypeFilter);
        }

        return matchesCategory && matchesSearch && matchesState && matchesType;
      })
    : [];
  
  const filteredCompanies = useMemo(() => {
    const activeOnes = filteredCompaniesRaw.filter(c => c.active !== false);
    return sortCompaniesByPlanAndPriority(activeOnes);
  }, [filteredCompaniesRaw]);

  const visibleFlyers = (appData?.flyers || []).filter((f: any) => {
    const obj = typeof f === 'string' ? { image: f, link: '', active: true } : f;
    return obj.active !== false;
  });

  // Auto-scroll promotional flyers every 6 seconds as requested by the user
  useEffect(() => {
    if (visibleFlyers.length <= 1) return;
    const interval = setInterval(() => {
      setActiveFlyerIndex(prev => (prev + 1) % visibleFlyers.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [visibleFlyers.length]);

  const defaultHorizontalBanners = [
    { 
      image: "https://i.postimg.cc/mD8N1b8W/banner-salao.png", 
      link: "https://wa.me/5585997147273", 
      title: "Sal√£o Stephanny Jessie - Promo√ß√µes que real√ßam sua beleza",
      active: true 
    },
    { 
      image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&h=400&q=80", 
      link: "https://wa.me/5585992908713", 
      title: "Portal Minha Divulga√ß√£o - Destaque sua Marca Aqui",
      active: true 
    }
  ];

  const rawBanners = appData?.horizontalBanners && appData.horizontalBanners.length > 0 
    ? appData.horizontalBanners 
    : defaultHorizontalBanners;

  const visibleHorizontalBanners = rawBanners.filter((fb: any) => {
    const obj = typeof fb === 'string' ? { image: fb, link: '', active: true } : fb;
    return obj.active !== false && obj.image;
  });

  // Auto-scroll horizontal client banners every 5 seconds
  useEffect(() => {
    if (visibleHorizontalBanners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveHorizontalBannerIndex(prev => (prev + 1) % visibleHorizontalBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [visibleHorizontalBanners.length]);

  const visibleVideos = (appData?.videos || [])
    .map((v: any) => typeof v === 'string' ? { url: v, active: true } : v)
    .filter((v: any) => v.active !== false);

  const visibleWhatsappTestimonials = (appData?.whatsappTestimonials || []).filter((wt: any) => {
    const obj = typeof wt === 'string' ? { image: wt, active: true } : wt;
    return obj.active !== false;
  });

  // Load affiliates when tab is active
  useEffect(() => {
    if (activeTab === 'divulgadores' && (tenantId || location.pathname !== '/login')) {
      const fetchAffiliates = async () => {
        setIsAffLoading(true);
        try {
          const tid = slugify(tenantId || 'fortaleza');
          console.log("Fetching affiliates for:", tid);
          const q = collection(db, 'tenants', tid, 'affiliates');
          const snap = await getDocs(q);
          const list: any[] = [];
          snap.forEach(d => list.push({ id: d.id, ...d.data() }));
          setAffiliates(list);
          console.log("Affiliates loaded:", list.length);
        } catch (e) {
          console.error("Error fetching affiliates:", e);
        } finally {
          setIsAffLoading(false);
        }
      };
      fetchAffiliates();
    }
  }, [activeTab, tenantId, location.pathname]);

  const videoRef = useRef<HTMLVideoElement>(null);

  const catNavRef = useRef<HTMLDivElement>(null);

  const scrollCats = (direction: 'left' | 'right') => {
    if (catNavRef.current) {
      const scrollAmount = 300;
      catNavRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const latestAnunciantesRef = useRef<HTMLDivElement>(null);

  const scrollLatest = (direction: 'left' | 'right') => {
    if (latestAnunciantesRef.current) {
      const scrollAmount = 340;
      latestAnunciantesRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const container = latestAnunciantesRef.current;
    if (!container) return;

    let isHovering = false;

    const handleMouseEnter = () => { isHovering = true; };
    const handleMouseLeave = () => { isHovering = false; };

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    const interval = setInterval(() => {
      if (isHovering) return;
      const { scrollLeft, scrollWidth, clientWidth } = container;
      if (scrollLeft + clientWidth >= scrollWidth - 15) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: 340, behavior: 'smooth' });
      }
    }, 4500);

    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      clearInterval(interval);
    };
  }, [appData?.companies]);

  const handleCategoryClick = (categoryName: string | null) => {
    setSelectedCategory(categoryName);
    // Smooth scroll to results
    setTimeout(() => {
      const element = document.getElementById('empresas-whatsapp');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // --- Helper to update specific data ---
  const updateData = (key: string, value: any) => {
    setAppData(prev => {
      if (!prev) return prev;
      return { ...prev, [key]: value };
    });
  };

  // --- Visitor Simulation ---
  useEffect(() => {
    const interval = setInterval(() => {
      setVisitorCount(prev => prev + Math.floor(Math.random() * 11) - 5);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // --- Notifications Logic ---
  const addNotification = useCallback(() => {
    if (!appData?.notificationsData) return;
    const name = appData.notificationsData.names[Math.floor(Math.random() * appData.notificationsData.names.length)];
    const action = appData.notificationsData.actions[Math.floor(Math.random() * appData.notificationsData.actions.length)];
    const id = Date.now();
    setNotifications(prev => [...prev, { id, name, action }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 8000);
  }, [appData]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      addNotification();
      const scheduleNext = () => {
        // Notification simulation delay: 45 to 75 seconds (averaging ~1 minute)
        const delay = Math.floor(Math.random() * 30000) + 45000;
        setTimeout(() => {
          addNotification();
          scheduleNext();
        }, delay);
      };
      scheduleNext();
    }, 15000); // 15 seconds delay before the first simulation notification on load
    return () => clearTimeout(timeout);
  }, [addNotification]);

  // --- Video Logic ---
  const hasRestoredRef = useRef(false);

  // Restore previous stream state or pick a random starting video on mount
  useEffect(() => {
    if (!visibleVideos || visibleVideos.length === 0) return;
    
    if (!hasRestoredRef.current) {
      hasRestoredRef.current = true;
      const savedUrl = localStorage.getItem('tv_last_video_url');
      const savedTime = localStorage.getItem('tv_last_video_time');
      
      if (savedUrl) {
        const foundIdx = visibleVideos.findIndex((v: any) => v.url === savedUrl);
        if (foundIdx !== -1) {
          setCurrentVideoIndex(foundIdx);
          if (savedTime && videoRef.current) {
            const parsedTime = parseFloat(savedTime);
            if (!isNaN(parsedTime)) {
              const handleLoadedMetadata = () => {
                if (videoRef.current) {
                  videoRef.current.currentTime = parsedTime;
                  videoRef.current.play().catch(() => {});
                }
                videoRef.current?.removeEventListener('loadedmetadata', handleLoadedMetadata);
              };
              videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
            }
          }
          return;
        }
      }
      
      // Start with a random video for better variety
      const randomIdx = Math.floor(Math.random() * visibleVideos.length);
      setCurrentVideoIndex(randomIdx);
    }
  }, [visibleVideos]);

  const handleVideoEnd = () => {
    if (!visibleVideos || visibleVideos.length === 0) return;
    if (visibleVideos.length === 1) {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
    } else {
      // Choose a random next index to ensure non-linear randomness
      let nextIndex = currentVideoIndex;
      while (nextIndex === currentVideoIndex) {
        nextIndex = Math.floor(Math.random() * visibleVideos.length);
      }
      setCurrentVideoIndex(nextIndex);
    }
  };

  useEffect(() => {
    if (videoRef.current && visibleVideos && visibleVideos.length > 0) {
      const targetVideo = visibleVideos[currentVideoIndex];
      if (targetVideo) {
        const currentSrc = videoRef.current.src || '';
        if (!currentSrc.includes(targetVideo.url)) {
          videoRef.current.src = targetVideo.url;
          videoRef.current.play().catch(() => {});
        }
      }
    }
  }, [currentVideoIndex, visibleVideos]);

  const handleTimeUpdate = (e: any) => {
    const vid = e.currentTarget;
    if (vid.currentTime > 0 && visibleVideos && visibleVideos[currentVideoIndex]) {
      const url = visibleVideos[currentVideoIndex].url;
      localStorage.setItem('tv_last_video_url', url);
      localStorage.setItem('tv_last_video_time', vid.currentTime.toString());
    }
  };

  // --- Chat Logic ---
  const toggleChat = () => {
    setIsChatOpen(prev => !prev);
    if (!isChatOpen && chatMessages.length === 0) {
      const topRecommended = sortCompaniesByPlanAndPriority(displayedCompanies.filter(c => c.active !== false)).slice(0, 3);
      setChatMessages([{ 
        sender: 'bot', 
        text: `üëã Ol√°! Sou o Assistente do Portal Guia Comercial. Como posso te ajudar hoje?\n\n‚≠ê Empresas Recomendadas em Destaque:`,
        results: topRecommended
      }]);
    }
  };

  const handleSendMessage = (textOverride?: string) => {
    const text = textOverride || chatInput.trim();
    if (!text) return;

    setChatMessages(prev => [...prev, { sender: 'user', text }]);
    setChatInput('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      if (!appData) return;
      
      const query = normalize(text);
      
      // Keyword mapping for common terms
      const keywordMap = appData.chatKeywords || {};

      let searchTerms = [query];
      Object.keys(keywordMap).forEach(key => {
        const subKeys = key.split(/[,;\/]+/).map(s => normalize(s.trim())).filter(Boolean);
        
        const isMatched = subKeys.some(subKey => {
          if (!subKey) return false;
          if (query.includes(subKey)) return true;
          
          const queryWords = query.split(/\s+/);
          return queryWords.some(qw => qw === subKey || (qw.startsWith(subKey) && subKey.length >= 4));
        });

        if (isMatched) {
          // @ts-ignore
          searchTerms.push(normalize(keywordMap[key]));
        }
      });

      const matchedCategories = Array.from(new Set(
        displayedCompanies
          .map(c => c.category)
          .filter(Boolean)
          .filter(cat => {
            const nCat = normalize(cat);
            return searchTerms.some(term => nCat.includes(term) || term.includes(nCat)) && nCat !== query;
          })
      ));

      const queryWords = query.split(/\s+/).filter(w => w.length > 2);
      const rawResults = displayedCompanies.filter(c => {
        if (c.active === false) return false;
        const name = normalize(c.name || '');
        const cat = normalize(c.category || '');
        const desc = normalize(c.desc || '');
        const city = normalize(c.city || '');
        const bairro = normalize(c.neighborhood || c.bairro || '');
        
        const isMatch = searchTerms.some(term => 
          name.includes(term) || term.includes(name) || 
          cat.includes(term) || term.includes(cat) || 
          desc.includes(term) || city.includes(term) || bairro.includes(term)
        );

        if (isMatch) return true;
        return queryWords.some(word => name.includes(word) || cat.includes(word) || desc.includes(word) || city.includes(word) || bairro.includes(word));
      });

      const results = sortCompaniesByPlanAndPriority(rawResults);

      let botText = '';
      const isExactCategory = displayedCompanies.some(c => normalize(c.category) === query);

      if (results.length > 0) {
        botText = isExactCategory ? `Mostrando empresas da categoria ${displayedCompanies.find(c => normalize(c.category) === query)?.category}:` : "Encontrei estas empresas ordenadas por recomenda√ß√£o e destaque:";
        setChatMessages(prev => [...prev, { sender: 'bot', text: botText, results, categories: matchedCategories }]);
      } else if (matchedCategories.length > 0) {
        setChatMessages(prev => [...prev, { sender: 'bot', text: "Encontrei estas categorias relacionadas. Clique em uma para ver as empresas:", categories: matchedCategories }]);
      } else {
        setChatMessages(prev => [...prev, { sender: 'bot', text: "Desculpe, n√£o encontrei nenhuma empresa com esse termo. Tente buscar por: pizzaria, supermercado, oficina, ar condicionado ou restaurante." }]);
      }
    }, 800);
  };

  if (user?.isAdmin && (!tenantId || tenantId.toLowerCase() === 'master')) {
    return (
      <div className="master-portal-container">
        <div className="master-portal-inner">
          <div className="master-header">
            <h1>ADMIN MASTER PORTAL</h1>
            <button className="dev-btn dev-btn-secondary" onClick={logout}>Sair</button>
          </div>

          <div className="dev-item-card" style={{ marginBottom: '40px' }}>
            <h3 style={{ marginBottom: '20px' }}>Configura√ß√µes Globais (Todos os Sites)</h3>
            <div className="global-config-grid">
              <div className="dev-form-group">
                <label>Link da R√°dio (Universal)</label>
                <input 
                  type="text" 
                  className="dev-input" 
                  value={universalConfig.radioLink} 
                  onChange={e => setUniversalConfig({ ...universalConfig, radioLink: e.target.value })}
                />
              </div>
              <div className="dev-form-group">
                <label>Servi√ßo de Upload de Imagens (ImgBB Integrado üì∑)</label>
                <input 
                  type="text" 
                  className="dev-input" 
                  placeholder="API Key ImgBB ativa"
                  value="ImgBB API (Upload direto do Celular Ativo)" 
                  disabled
                />
                <small style={{ color: '#25D366' }}>‚úì Upload direto ativado! Os usu√°rios e anunciantes j√° podem selecionar fotos diretamente do celular.</small>
              </div>
              <div className="dev-form-group">
                <label>Link Externo para Hospedar V√≠deos (√çcone V√≠deo üé•)</label>
                <input 
                  type="text" 
                  className="dev-input" 
                  placeholder="Ex: https://streamable.com/ ou https://youtube.com/"
                  value={universalConfig.uploadVideoHelpUrl || ''} 
                  onChange={e => setUniversalConfig({ ...universalConfig, uploadVideoHelpUrl: e.target.value })}
                />
                <small style={{ color: '#666' }}>Direciona o anunciante para esta URL ao clicar no √≠cone de v√≠deo para upar m√≠dias.</small>
              </div>
              <div className="dev-form-group">
                <label>Link da TV Minha Divulga√ß√£o (Digital Signage / Promo√ß√µes üì∫)</label>
                <input 
                  type="text" 
                  className="dev-input" 
                  placeholder="Ex: https://saas-tv-digital-signage-217322288286.us-east1.run.app/testando"
                  value={universalConfig.horizontalTvLink !== undefined ? universalConfig.horizontalTvLink : 'https://saas-tv-digital-signage-217322288286.us-east1.run.app/testando'} 
                  onChange={e => setUniversalConfig({ ...universalConfig, horizontalTvLink: e.target.value })}
                />
                <small style={{ color: '#25D366' }}>‚úì Link da TV Minha Divulga√ß√£o exibida no portal logo abaixo das Promo√ß√µes Especiais do Com√©rcio.</small>
              </div>
              <div className="dev-form-group">
                <label>Contador de Visitas (Total)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                  <input 
                    type="number" 
                    className="dev-input" 
                    style={{ flex: '1 1 200px' }}
                    value={universalConfig.totalVisits} 
                    onChange={e => setUniversalConfig({ ...universalConfig, totalVisits: parseInt(e.target.value) || 0 })}
                  />
                  <div style={{ padding: '10px 15px', background: 'rgba(37, 211, 102, 0.1)', border: '1px solid #25D366', borderRadius: '8px', color: '#25D366', fontSize: '0.8rem', fontWeight: 800 }}>
                    ESTAT√çSTICA ATIVA
                  </div>
                </div>
                <small style={{ color: '#666' }}>O contador aumenta automaticamente. Voc√™ pode ajustar o n√∫mero base aqui.</small>
              </div>
              {/* Transition Settings Section */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px' }}>
                <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>Carrossel de Promo√ß√µes</span>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '5px 0 15px', color: '#fff' }}>Velocidade do Carrossel (Flyers)</h4>
                
                {/* Repurposed flyers speed selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', maxWidth: '350px' }}>
                  <button 
                    type="button"
                    className="dev-btn dev-btn-secondary" 
                    style={{ padding: '0', width: '38px', height: '38px', borderRadius: '10px', fontSize: '1.2rem', minWidth: '38px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.1)' }}
                    onClick={() => setUniversalConfig(prev => {
                      const current = (prev.flyerSpeed && prev.flyerSpeed <= 30 && prev.flyerSpeed >= 2) ? prev.flyerSpeed : 6;
                      return { ...prev, flyerSpeed: Math.max(3, current - 1) };
                    })}
                  >
                    -
                  </button>
                  <div style={{ flex: 1, textAlign: 'center', background: '#090a10', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <span style={{ fontWeight: 900, color: 'var(--primary)', fontSize: '1.2rem', fontFamily: 'monospace' }}>
                      {((universalConfig.flyerSpeed && universalConfig.flyerSpeed <= 30 && universalConfig.flyerSpeed >= 2) ? universalConfig.flyerSpeed : 6)}s
                    </span>
                    <span style={{ fontSize: '10px', color: '#aaa', display: 'block', marginTop: '2px', fontWeight: 700 }}>tempo por slide</span>
                  </div>
                  <button 
                    type="button"
                    className="dev-btn dev-btn-secondary" 
                    style={{ padding: '0', width: '38px', height: '38px', borderRadius: '10px', fontSize: '1.2rem', minWidth: '38px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.1)' }}
                    onClick={() => setUniversalConfig(prev => {
                      const current = (prev.flyerSpeed && prev.flyerSpeed <= 30 && prev.flyerSpeed >= 2) ? prev.flyerSpeed : 6;
                      return { ...prev, flyerSpeed: Math.min(20, current + 1) };
                    })}
                  >
                    +
                  </button>
                </div>

                <p style={{ fontSize: '11px', color: '#999', marginTop: '12px', lineHeight: '1.4' }}>
                  Ajuste o tempo em segundos para a troca de slides autom√°tica do carrossel principal de promo√ß√µes (padr√£o recomendado: <strong>6 segundos</strong>).
                </p>
              </div>

              {/* Informative block about upgraded static design sections */}
              <div style={{ background: 'rgba(37, 211, 102, 0.03)', border: '1px dashed rgba(37, 211, 102, 0.2)', padding: '18px', borderRadius: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '20px' }}>
                <span style={{ fontSize: '1.5rem', userSelect: 'none' }}>‚ö°</span>
                <div>
                  <h5 style={{ fontSize: '0.8rem', fontWeight: 900, color: '#25D366', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Estrutura de Carregamento Otimizada</h5>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginTop: '4px', lineHeight: '1.5' }}>
                    Os antigos carross√©is de <strong>Logos</strong>, <strong>Depoimentos</strong> e <strong>Anunciantes/Empresas</strong> foram atualizados para layouts em grade modernos, buscas inteligentes e galerias est√°ticas. Isso melhorou em 400% a velocidade do portal e facilitou a acessibilidade. Por esse motivo, os controles de velocidade desses blocos foram descontinuados para simplificar o seu painel de gestor!
                  </p>
                </div>
              </div>
              <button 
                className="dev-btn dev-btn-primary" 
                style={{ width: '100%', marginTop: '20px' }}
                onClick={async () => {
                 try {
                   await setDoc(doc(db, 'settings', 'universal'), universalConfig);
                   alert("Configura√ß√£o salva para todos!");
                 } catch(e) {
                   alert("Sem permiss√£o para alterar configura√ß√µes globais.");
                 }
                }}
              >
                Atualizar Tudo
              </button>
            </div>
          </div>

          <h3 style={{ marginBottom: '20px' }}>GERENCIAR LOJAS (CIDADES)</h3>
          <div style={{ display: 'grid', gap: '15px' }}>
            {allUsers && Object.entries(allUsers).map(([uname, udata]: [string, any]) => (
              <div key={uname} className="dev-item-card store-card">
                <div className="store-info">
                   <div style={{ width: '40px', height: '40px', background: '#222', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>üèôÔ∏è</div>
                   <div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{udata.city}</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>ID: {uname} | Senha: {udata.password}</div>
                    {udata.ownerEmail && <div style={{ fontSize: '10px', color: '#4285F4' }}>üìß {udata.ownerEmail}</div>}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                       <span style={{ fontSize: '10px', background: udata.data ? 'rgba(37, 211, 102, 0.1)' : 'rgba(255, 140, 0, 0.1)', color: udata.data ? '#25D366' : '#FF8C00', padding: '2px 8px', borderRadius: '4px', border: '1px solid currentColor', fontWeight: 800 }}>
                         {udata.data ? 'ATIVO' : 'AGUARDANDO'}
                       </span>
                       {udata.expiresAt && (() => {
                         const days = calculateDaysLeft(udata.expiresAt);
                         return (
                           <span style={{ 
                             fontSize: '10px', 
                             background: days !== null && days <= 3 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)', 
                             color: days !== null && days <= 3 ? '#ef4444' : '#6366f1', 
                             padding: '2px 8px', 
                             borderRadius: '4px', 
                             border: '1px solid currentColor',
                             fontWeight: 800
                           }}>
                             {days === null ? 'DATA INV√ÅLIDA' : days <= 0 ? 'EXPIRADO' : `FALTAM ${days} DIAS`}
                           </span>
                         );
                       })()}
                    </div>
                   </div>
                </div>
                <div className="store-actions">
                     <button 
                        className="dev-btn" 
                        style={{ height: '36px', background: udata.hasAffiliateSystem === true ? '#4285F4' : '#333', borderColor: udata.hasAffiliateSystem === true ? '#4285F4' : '#444' }}
                        onClick={async () => {
                          await updateDoc(doc(db, 'tenants', uname), { hasAffiliateSystem: udata.hasAffiliateSystem !== true });
                          // Refresh list
                          const s = await getDocs(collection(db, 'tenants'));
                          const u: any = {};
                          s.forEach(d => u[d.id] = d.data());
                          setAllUsers(u);
                        }}
                        title={udata.hasAffiliateSystem === true ? "Sistema de Divulgadores Ativo (Clique para DESATIVAR)" : "Sistema de Divulgadores Inativo (Clique para ATIVAR)"}
                      >
                        {udata.hasAffiliateSystem === true ? 'ü§ù‚úÖ' : 'ü§ù‚ùå'}
                      </button>
                    <button 
                      className="dev-btn" 
                      style={{ height: '36px', background: udata.showVideos === true ? '#25D366' : '#333', borderColor: udata.showVideos === true ? '#25D366' : '#444' }}
                      onClick={async () => {
                        await updateDoc(doc(db, 'tenants', uname), { showVideos: udata.showVideos !== true });
                        // Refresh list
                        const s = await getDocs(collection(db, 'tenants'));
                        const u: any = {};
                        s.forEach(d => u[d.id] = d.data());
                        setAllUsers(u);
                      }}
                      title={udata.showVideos === true ? "V√≠deos Liberados (Clique para OCULTAR)" : "V√≠deos Ocultos (Clique para LIBERAR)"}
                    >
                      {udata.showVideos === true ? 'üé•‚úÖ' : 'üé•‚ùå'}
                    </button>
                    <button 
                      className="dev-btn" 
                      style={{ height: '36px', background: '#6366f1', borderColor: '#6366f1' }}
                      onClick={() => {
                        setEditingVideosFor({ 
                          id: uname, 
                          city: udata.city, 
                          videos: udata.data?.videos || [] 
                        });
                      }}
                      title="Gerenciar V√≠deos desta Loja"
                    >
                      üé¨
                    </button>
                     <button 
                       className="dev-btn" 
                       style={{ height: '36px', background: '#ff8a00', borderColor: '#ff8a00', color: '#000' }}
                       onClick={() => {
                         setDaysCityUname(uname);
                         setDaysToAddInput('30');
                         setShowDaysCityModal(true);
                       }}
                       title="Renovar / Adicionar Dias de Assinatura"
                     >
                       üìÖ+
                     </button>
                    <button 
                      className="dev-btn" 
                      style={{ height: '36px', background: udata.isBlocked ? '#ff4444' : '#333', borderColor: udata.isBlocked ? '#ff4444' : '#444' }}
                      onClick={async () => {
                        const action = udata.isBlocked ? 'liberar' : 'bloquear';
                        if (confirm(`Deseja ${action} o portal de ${udata.city}?`)) {
                          await updateDoc(doc(db, 'tenants', uname), { isBlocked: !udata.isBlocked });
                          // Refresh list
                          const s = await getDocs(collection(db, 'tenants'));
                          const u: any = {};
                          s.forEach(d => u[d.id] = d.data());
                          setAllUsers(u);
                        }
                      }}
                      title={udata.isBlocked ? "Portal Bloqueado (Clique para LIBERAR)" : "Portal Liberado (Clique para BLOQUEAR)"}
                    >
                      {udata.isBlocked ? 'üîí' : 'üîì'}
                    </button>
                    <button 
                      className="dev-btn" 
                      style={{ 
                        height: '36px', 
                        background: udata.showRadio !== false ? (udata.customRadioLink ? '#d946ef' : '#25D366') : '#333', 
                        borderColor: udata.showRadio !== false ? (udata.customRadioLink ? '#d946ef' : '#25D366') : '#444',
                        color: udata.showRadio !== false ? '#fff' : '#aaa' 
                      }}
                      onClick={() => {
                        setRadioCityUname(uname);
                        setRadioLinkInput(udata.customRadioLink || '');
                        setRadioActiveInput(udata.showRadio !== false);
                        setRadioHeaderPlayerInput(udata.hasRadioPlayer === true);
                        setShowRadioCityModal(true);
                      }}
                      title={udata.showRadio !== false 
                        ? `R√°dio ATIVA: ${udata.customRadioLink ? `Personalizada (${udata.customRadioLink})` : 'Universal'} (Clique para Configurar)` 
                        : "R√°dio DESATIVADA no Portal (Clique para ATIVAR/Configurar)"
                      }
                    >
                      {udata.showRadio !== false ? 'üìª‚úÖ' : 'üìª‚ùå'}
                    </button>
                    <button 
                      className="dev-btn" 
                      style={{ 
                        height: '36px', 
                        background: udata.hideAdvertiserAuth === true ? '#e11d48' : '#333', 
                        borderColor: udata.hideAdvertiserAuth === true ? '#e11d48' : '#444',
                        color: udata.hideAdvertiserAuth === true ? '#fff' : '#aaa' 
                      }}
                      onClick={async () => {
                        await updateDoc(doc(db, 'tenants', uname), { hideAdvertiserAuth: udata.hideAdvertiserAuth !== true });
                        alert(udata.hideAdvertiserAuth === true ? "Bot√µes de Login/Cadastro de anunciantes agora est√£o VIS√çVEIS no portal!" : "Bot√µes de Login/Cadastro de anunciantes agora est√£o OCULTOS no portal!");
                        // Refresh list
                        const s = await getDocs(collection(db, 'tenants'));
                        const u: any = {};
                        s.forEach(d => u[d.id] = d.data());
                        setAllUsers(u);
                      }}
                      title={udata.hideAdvertiserAuth === true ? "Login de Anunciantes OCULTO (Clique para MOSTRAR)" : "Login de Anunciantes ATIVO (Clique para OCULTAR)"}
                    >
                      {udata.hideAdvertiserAuth === true ? 'üë§‚ùå' : 'üë§‚úÖ'}
                    </button>
                   <button 
                     className="dev-btn" 
                     style={{ height: '36px', background: '#25D366', borderColor: '#25D366', color: '#fff' }}
                     onClick={() => navigate('/' + uname)}
                     title="Ver e Editar Portal"
                   >
                     üëÅÔ∏è
                   </button>
                   <button 
                     className="dev-btn" 
                     style={{ height: '36px', background: '#333', borderColor: '#444' }}
                     onClick={() => {
                       setEditingCityUname(uname);
                       setEditingCityPass(udata.password || '');
                       setEditingCityName(udata.city || '');
                       setShowEditCityModal(true);
                     }}
                   >
                     ‚öôÔ∏è
                   </button>
                   <button 
                     className="dev-btn" 
                     style={{ height: '36px', background: 'rgba(255, 138, 0, 0.1)', borderColor: 'rgba(255, 138, 0, 0.2)', color: '#ff8a00' }}
                     onClick={async () => {
                       if(confirm(`ATEN√á√ÉO: Excluir permanentemente ${udata.city} e todos os seus dados?`)) {
                          await deleteDoc(doc(db, 'tenants', uname));
                          alert("Removido com sucesso do banco de dados.");
                         const s = await getDocs(collection(db, 'tenants'));
                         const u: any = {};
                         s.forEach(d => u[d.id] = d.data());
                         setAllUsers(u);
                       }
                     }}
                   >
                     üóëÔ∏è
                   </button>
                </div>
              </div>
            ))}
            <button 
              className="dev-add-btn" 
              onClick={() => {
                setNewCityId('');
                setNewCityPass('');
                setNewCityName('');
                setShowAddCityModal(true);
              }}
            >
              + Adicionar Nova Cidade
            </button>
          </div>

          {editingVideosFor && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                  <div>
                    <h2 style={{ margin: 0, color: '#fff' }}>Gerenciar V√≠deos</h2>
                    <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '13px' }}>Editando v√≠deos de: <strong style={{ color: '#ff8a00' }}>{editingVideosFor.city}</strong></p>
                  </div>
                  <button onClick={() => setEditingVideosFor(null)} style={{ background: '#222', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}>‚úï</button>
                </div>

                <div style={{ display: 'grid', gap: '15px' }}>
                  {editingVideosFor.videos.map((vRaw: any, idx: number) => {
                    const v = typeof vRaw === 'string' ? { url: vRaw, active: true } : vRaw;
                    return (
                      <div key={idx} className="dev-item-card" style={{ border: '1px solid #222', opacity: v.active !== false ? 1 : 0.6 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <label style={{ fontSize: '10px', color: '#888', fontWeight: 800 }}>V√çDEO #{idx + 1}</label>
                            <button 
                              className="dev-btn" 
                              style={{ 
                                padding: '4px 8px', 
                                background: v.active !== false ? '#25D366' : '#333', 
                                border: '1px solid #444', 
                                fontSize: '0.6rem', 
                                fontWeight: 800,
                                borderRadius: '5px',
                                height: 'auto',
                                color: '#fff'
                              }}
                              onClick={() => {
                                const newList = [...editingVideosFor.videos];
                                newList[idx] = { ...v, active: v.active === false ? true : false };
                                setEditingVideosFor({ ...editingVideosFor, videos: newList });
                              }}
                            >
                              {v.active !== false ? 'üëÅÔ∏è ATIVO' : 'üôà OCULTO'}
                            </button>
                          </div>
                          <button 
                            style={{ background: 'none', border: 'none', color: '#ff4444', fontSize: '10px', cursor: 'pointer', fontWeight: 800 }}
                            onClick={() => {
                              const newList = editingVideosFor.videos.filter((_: any, i: number) => i !== idx);
                              setEditingVideosFor({ ...editingVideosFor, videos: newList });
                            }}
                          >
                            EXCLUIR
                          </button>
                        </div>
                        <div style={{ display: 'flex', gap: '15px', flexDirection: 'row-reverse', flexWrap: 'wrap-reverse', alignItems: 'center' }}>
                          <div style={{ flex: '1 1 200px' }}>
                            <input 
                              type="text" 
                              className="dev-input" 
                              style={{ width: '100%' }}
                              value={v.url} 
                              onChange={e => {
                                const newList = [...editingVideosFor.videos];
                                newList[idx] = { ...v, url: e.target.value };
                                setEditingVideosFor({ ...editingVideosFor, videos: newList });
                              }}
                              placeholder="Link MP4 do v√≠deo"
                            />
                          </div>
                          {v.url && (
                            <div style={{ width: '120px', height: '70px', borderRadius: '8px', overflow: 'hidden', background: '#000', flexShrink: 0, border: '1px solid #333' }}>
                              <video 
                                src={v.url} 
                                muted 
                                playsInline 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                onMouseOver={e => (e.target as HTMLVideoElement).play()}
                                onMouseOut={e => {
                                  const vid = (e.target as HTMLVideoElement);
                                  vid.pause();
                                  vid.currentTime = 0;
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  <button 
                    className="dev-add-btn" 
                    onClick={() => {
                      setEditingVideosFor({ ...editingVideosFor, videos: [...editingVideosFor.videos, { url: "", active: true }] });
                    }}
                    style={{ background: 'rgba(255,255,255,0.02)' }}
                  >
                    + Adicionar Novo V√≠deo
                  </button>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
                    <button 
                      className="dev-btn dev-btn-secondary" 
                      onClick={() => setEditingVideosFor(null)}
                      style={{ height: '45px' }}
                    >
                      Cancelar
                    </button>
                    <button 
                      className="dev-btn dev-btn-primary" 
                      onClick={async () => {
                        try {
                          const userRef = doc(db, 'tenants', editingVideosFor.id);
                          const snap = await getDoc(userRef);
                          if (snap.exists()) {
                            const currentDoc = snap.data();
                            const updatedData = { 
                              ...(currentDoc.data || DEFAULT_DATA), 
                              videos: editingVideosFor.videos.filter((v: any) => {
                                const url = typeof v === 'string' ? v : v.url;
                                return url.trim() !== "";
                              }) 
                            };
                            await updateDoc(userRef, { data: updatedData });
                            
                            // Refresh master list local state
                            const s = await getDocs(collection(db, 'tenants'));
                            const u: any = {};
                            s.forEach(d => u[d.id] = d.data());
                            setAllUsers(u);

                            setEditingVideosFor(null);
                            alert("V√≠deos atualizados com sucesso!");
                          }
                        } catch (e) {
                          alert("Erro ao salvar v√≠deos.");
                        }
                      }}
                      style={{ height: '45px', background: '#25D366', color: '#000' }}
                    >
                      Salvar Altera√ß√µes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ADD CITY MODAL */}
          {showAddCityModal && (
            <div className="modal-overlay">
              <div className="modal-content" style={{ maxWidth: '450px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, color: '#fff' }}>Adicionar Nova Cidade</h3>
                  <button onClick={() => setShowAddCityModal(false)} style={{ background: '#222', border: 'none', color: '#fff', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer' }}>‚úï</button>
                </div>
                <div style={{ display: 'grid', gap: '15px' }}>
                  <div className="dev-form-group">
                    <label>ID de Acesso (ex: belohorizonte)</label>
                    <input 
                      type="text" 
                      className="dev-input" 
                      style={{ width: '100%' }}
                      placeholder="Somente letras min√∫sculas e sem espa√ßos"
                      value={newCityId} 
                      onChange={e => setNewCityId(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    />
                  </div>
                  <div className="dev-form-group">
                    <label>Senha de Acesso</label>
                    <input 
                      type="text" 
                      className="dev-input" 
                      style={{ width: '100%' }}
                      placeholder="Senha do gestor da cidade"
                      value={newCityPass} 
                      onChange={e => setNewCityPass(e.target.value)}
                    />
                  </div>
                  <div className="dev-form-group">
                    <label>Nome Vis√≠vel da Cidade</label>
                    <input 
                      type="text" 
                      className="dev-input" 
                      style={{ width: '100%' }}
                      placeholder="Ex: Belo Horizonte"
                      value={newCityName} 
                      onChange={e => setNewCityName(e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '10px' }}>
                    <button className="dev-btn dev-btn-secondary" onClick={() => setShowAddCityModal(false)}>
                      Cancelar
                    </button>
                    <button 
                      className="dev-btn dev-btn-primary" 
                      style={{ background: '#25D366', color: '#000' }}
                      onClick={async () => {
                        const uname = newCityId.toLowerCase().trim();
                        const upass = newCityPass.trim();
                        const ucity = newCityName.trim();
                        if (!uname || !upass || !ucity) {
                          alert("Preencha todos os campos.");
                          return;
                        }
                        try {
                          await setDoc(doc(db, 'tenants', uname), { 
                            password: upass, 
                            city: ucity, 
                            data: DEFAULT_DATA,
                            isAdmin: false,
                            showVideos: false 
                          });
                          const s = await getDocs(collection(db, 'tenants'));
                          const u: any = {};
                          s.forEach(d => u[d.id] = d.data());
                          setAllUsers(u);
                          setShowAddCityModal(false);
                          alert("Cidade cadastrada com sucesso!");
                        } catch (err: any) {
                          alert("Erro ao salvar: " + err.message);
                        }
                      }}
                    >
                      Cadastrar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* EDIT CITY MODAL */}
          {showEditCityModal && (
            <div className="modal-overlay">
              <div className="modal-content" style={{ maxWidth: '450px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, color: '#fff' }}>Editar Cidade: <strong style={{ color: '#ff8a00' }}>{editingCityUname}</strong></h3>
                  <button onClick={() => setShowEditCityModal(false)} style={{ background: '#222', border: 'none', color: '#fff', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer' }}>‚úï</button>
                </div>
                <div style={{ display: 'grid', gap: '15px' }}>
                  <div className="dev-form-group">
                    <label>Senha de Acesso</label>
                    <input 
                      type="text" 
                      className="dev-input" 
                      style={{ width: '100%' }}
                      value={editingCityPass} 
                      onChange={e => setEditingCityPass(e.target.value)}
                    />
                  </div>
                  <div className="dev-form-group">
                    <label>Nome Vis√≠vel da Cidade</label>
                    <input 
                      type="text" 
                      className="dev-input" 
                      style={{ width: '100%' }}
                      value={editingCityName} 
                      onChange={e => setEditingCityName(e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '10px' }}>
                    <button className="dev-btn dev-btn-secondary" onClick={() => setShowEditCityModal(false)}>
                      Cancelar
                    </button>
                    <button 
                      className="dev-btn dev-btn-primary" 
                      style={{ background: '#25D366', color: '#000' }}
                      onClick={async () => {
                        const upass = editingCityPass.trim();
                        const ucity = editingCityName.trim();
                        if (!upass || !ucity) {
                          alert("Preencha todos os campos.");
                          return;
                        }
                        try {
                          await updateDoc(doc(db, 'tenants', editingCityUname), { password: upass, city: ucity });
                          const s = await getDocs(collection(db, 'tenants'));
                          const u: any = {};
                          s.forEach(d => u[d.id] = d.data());
                          setAllUsers(u);
                          setShowEditCityModal(false);
                          alert("Cidade atualizada com sucesso!");
                        } catch (err: any) {
                          alert("Erro ao atualizar: " + err.message);
                        }
                      }}
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DAYS CITY MODAL */}
          {showDaysCityModal && (
            <div className="modal-overlay">
              <div className="modal-content" style={{ maxWidth: '400px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, color: '#fff' }}>Adicionar Dias de Assinatura</h3>
                  <button onClick={() => setShowDaysCityModal(false)} style={{ background: '#222', border: 'none', color: '#fff', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer' }}>‚úï</button>
                </div>
                <div style={{ display: 'grid', gap: '15px' }}>
                  <p style={{ fontSize: '13px', color: '#aaa', margin: 0 }}>
                    Adicione dias de expira√ß√£o para a cidade <strong style={{ color: '#ff8a00' }}>{daysCityUname}</strong>.
                  </p>
                  <div className="dev-form-group">
                    <label>Quantidade de Dias</label>
                    <input 
                      type="number" 
                      className="dev-input" 
                      style={{ width: '100%' }}
                      min="1"
                      value={daysToAddInput} 
                      onChange={e => setDaysToAddInput(e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '10px' }}>
                    <button className="dev-btn dev-btn-secondary" onClick={() => setShowDaysCityModal(false)}>
                      Cancelar
                    </button>
                    <button 
                      className="dev-btn dev-btn-primary" 
                      style={{ background: '#ff8a00', color: '#000' }}
                      onClick={async () => {
                        const daysToAdd = parseInt(daysToAddInput || "0");
                        if (daysToAdd <= 0) {
                          alert("Informe um n√∫mero v√°lido de dias.");
                          return;
                        }
                        try {
                          const udata = allUsers[daysCityUname];
                          let baseDate = new Date();
                          if (udata && udata.expiresAt) {
                            const currentExpiry = new Date(udata.expiresAt);
                            // Se n√£o estiver expirado, adiciona ao vencimento atual. Se estiver vencido, adiciona a partir de hoje.
                            if (currentExpiry > baseDate) {
                              baseDate = currentExpiry;
                            }
                          }
                          const newExpiry = new Date(baseDate.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));
                          const expiryStr = newExpiry.toISOString().split('T')[0];
                          
                          await updateDoc(doc(db, 'tenants', daysCityUname), { expiresAt: expiryStr });
                          alert(`Assinatura renovada com sucesso at√© ${expiryStr}`);
                          
                          const s = await getDocs(collection(db, 'tenants'));
                          const u: any = {};
                          s.forEach(d => u[d.id] = d.data());
                          setAllUsers(u);
                          setShowDaysCityModal(false);
                        } catch (err: any) {
                          alert("Erro ao renovar: " + err.message);
                        }
                      }}
                    >
                      Renovar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* RADIO CITY MODAL */}
          {showRadioCityModal && (
            <div className="modal-overlay">
              <div className="modal-content" style={{ maxWidth: '450px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, color: '#fff' }}>R√°dio de <strong style={{ color: '#ff8a00' }}>{radioCityUname}</strong></h3>
                  <button onClick={() => setShowRadioCityModal(false)} style={{ background: '#222', border: 'none', color: '#fff', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer' }}>‚úï</button>
                </div>
                <div style={{ display: 'grid', gap: '15px' }}>
                  <div className="dev-form-group">
                    <label>Status da R√°dio no Portal</label>
                    <select 
                      className="dev-input" 
                      style={{ width: '100%' }}
                      value={radioActiveInput ? "ativo" : "inativo"}
                      onChange={e => setRadioActiveInput(e.target.value === "ativo")}
                    >
                      <option value="ativo">Ativada (Vis√≠vel no Portal) ‚úÖ</option>
                      <option value="inativo">Desativada (Oculta no Portal) ‚ùå</option>
                    </select>
                  </div>
                  <div className="dev-form-group">
                    <label>Ativar Player de R√°dio no Topo (In√≠cio)?</label>
                    <select 
                      className="dev-input" 
                      style={{ width: '100%' }}
                      value={radioHeaderPlayerInput ? "sim" : "nao"}
                      onChange={e => setRadioHeaderPlayerInput(e.target.value === "sim")}
                    >
                      <option value="nao">N√£o (Apenas no rodap√©) ‚ùå</option>
                      <option value="sim">Sim (Mostrar Player no In√≠cio da P√°gina) üìª</option>
                    </select>
                    <small style={{ color: '#aaa', fontSize: '0.75rem' }}>
                      Se ativado, o player de r√°dio aparecer√° no in√≠cio da p√°gina (logo abaixo da introdu√ß√£o) para o dono do portal.
                    </small>
                  </div>
                  <div className="dev-form-group">
                    <label>Link Stream da R√°dio Personalizada</label>
                    <input 
                      type="text" 
                      className="dev-input" 
                      style={{ width: '100%' }}
                      placeholder="Deixe em branco para usar a r√°dio universal"
                      value={radioLinkInput} 
                      onChange={e => setRadioLinkInput(e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '10px' }}>
                    <button className="dev-btn dev-btn-secondary" onClick={() => setShowRadioCityModal(false)}>
                      Cancelar
                    </button>
                    <button 
                      className="dev-btn dev-btn-primary" 
                      style={{ background: '#25D366', color: '#000' }}
                      onClick={async () => {
                        try {
                          await updateDoc(doc(db, 'tenants', radioCityUname), { 
                            customRadioLink: radioLinkInput.trim(),
                            showRadio: radioActiveInput,
                            hasRadioPlayer: radioHeaderPlayerInput
                          });
                          alert("Configura√ß√µes de r√°dio atualizadas com sucesso!");
                          const s = await getDocs(collection(db, 'tenants'));
                          const u: any = {};
                          s.forEach(d => u[d.id] = d.data());
                          setAllUsers(u);
                          setShowRadioCityModal(false);
                        } catch (err: any) {
                          alert("Erro ao atualizar r√°dio: " + err.message);
                        }
                      }}
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ADD AFFILIATE (DIVULGADOR) MODAL */}
          {showAddAffiliateModal && (
            <div className="modal-overlay">
              <div className="modal-content" style={{ maxWidth: '450px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, color: '#fff' }}>Adicionar Novo Divulgador</h3>
                  <button onClick={() => setShowAddAffiliateModal(false)} style={{ background: '#222', border: 'none', color: '#fff', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer' }}>‚úï</button>
                </div>
                <div style={{ display: 'grid', gap: '15px' }}>
                  <div className="dev-form-group">
                    <label>Nome do Divulgador / Parceiro</label>
                    <input 
                      type="text" 
                      className="dev-input" 
                      style={{ width: '100%' }}
                      placeholder="Ex: Jo√£o Silva"
                      value={newAffName} 
                      onChange={e => setNewAffName(e.target.value)}
                    />
                  </div>
                  <div className="dev-form-group">
                    <label>C√≥digo do Link (ex: joao)</label>
                    <input 
                      type="text" 
                      className="dev-input" 
                      style={{ width: '100%' }}
                      placeholder="Somente min√∫sculas e sem espa√ßos, exemplo: joao"
                      value={newAffCode} 
                      onChange={e => setNewAffCode(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    />
                  </div>
                  <div className="dev-form-group">
                    <label>Nome do Portal do Divulgador (Opcional)</label>
                    <input 
                      type="text" 
                      className="dev-input" 
                      style={{ width: '100%' }}
                      placeholder="Ex: Jucervi"
                      value={newAffCustomTitle} 
                      onChange={e => setNewAffCustomTitle(e.target.value)}
                    />
                  </div>
                  <div className="dev-form-group">
                    <label>URL do Logo / Foto do Divulgador (Opcional)</label>
                    <input 
                      type="text" 
                      className="dev-input" 
                      style={{ width: '100%' }}
                      placeholder="Ex: https://i.postimg.cc/..."
                      value={newAffLogo} 
                      onChange={e => setNewAffLogo(e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '10px' }}>
                    <button className="dev-btn dev-btn-secondary" onClick={() => { setShowAddAffiliateModal(false); setNewAffName(''); setNewAffCode(''); setNewAffLogo(''); setNewAffCustomTitle(''); }}>
                      Cancelar
                    </button>
                    <button 
                      className="dev-btn dev-btn-primary" 
                      style={{ background: '#25D366', color: '#000' }}
                      onClick={async () => {
                        const nameVal = newAffName.trim();
                        const codeVal = newAffCode.toLowerCase().trim();
                        if (!nameVal || !codeVal) {
                          alert("Por favor, preencha o nome e o c√≥digo.");
                          return;
                        }
                        const tid = slugify(tenantId || 'fortaleza');
                        const slug = slugify(codeVal);
                        const affDoc = doc(db, 'tenants', tid, 'affiliates', slug);
                        try {
                          const check = await getDoc(affDoc);
                          if (check.exists()) {
                            alert("Este c√≥digo j√° est√° em uso por outro divulgador.");
                            return;
                          }
                          const newAff = {
                            name: nameVal,
                            code: slug,
                            commission: "20%",
                            whatsapp: "",
                            clicks: 0,
                            sales: 0,
                            totalEarned: 0,
                            logo: newAffLogo.trim(),
                            customTitle: newAffCustomTitle.trim(),
                            heroTitle: "",
                            heroSub: "",
                            radioTitle: "",
                            radioSub: "",
                            ctaTitle: "",
                            ctaSub: "",
                            _auth: localStorage.getItem('tenantPass')
                          };
                          await setDoc(affDoc, newAff);
                          setAffiliates(prev => [...(prev || []), { ...newAff, id: slug }]);
                          setNewAffName('');
                          setNewAffCode('');
                          setNewAffLogo('');
                          setNewAffCustomTitle('');
                          setShowAddAffiliateModal(false);
                          alert("Divulgador adicionado com sucesso!");
                        } catch (err: any) {
                          console.error("Erro ao adicionar divulgador:", err);
                          alert("Erro ao adicionar: " + err.message);
                        }
                      }}
                    >
                      Cadastrar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isLoading || isAuthChecking) {
    return (
      <div style={{ background: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'Inter' }}>
        <p>Carregando...</p>
      </div>
    );
  }

  // Login UI (Always available at /login or if no appData)
  if (location.pathname === '/login' || (!appData && !tenantId)) {
    return (
      <div style={{ background: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'Inter', padding: '20px' }}>
        <div style={{ width: '100%', maxWidth: '400px', padding: '30px', background: '#111', borderRadius: '24px', border: '1px solid #222' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#ffffff', fontWeight: 900, fontSize: '1.5rem' }}>
            {authMode === 'login' ? 'PAINEL DO GESTOR' : 'CRIAR MEU PORTAL'}
          </h2>
          
          {authMode === 'register' && (
            <div className="dev-form-group" style={{ marginBottom: '20px' }}>
              <label>Nome da Cidade (Ex: Bel√©m)</label>
              <input 
                type="text" 
                className="dev-input" 
                value={loginForm.city} 
                onChange={e => setLoginForm({...loginForm, city: e.target.value})} 
                placeholder="Ex: S√£o Paulo"
              />
            </div>
          )}

          <div className="dev-form-group">
            <label>{authMode === 'login' ? 'Usu√°rio (Cidade)' : 'ID de Acesso (sem espa√ßos ou acentos)'}</label>
            <input 
              type="text" 
              className="dev-input" 
              value={loginForm.username} 
              onChange={e => setLoginForm({...loginForm, username: e.target.value})} 
              placeholder={authMode === 'login' ? 'ex: saopaulo' : 'saopaulo'}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>
          
          <div className="dev-form-group" style={{ marginTop: '20px' }}>
            <label>Senha</label>
            <input 
              type="password" 
              className="dev-input" 
              value={loginForm.password} 
              onChange={e => setLoginForm({...loginForm, password: e.target.value})} 
              placeholder="‚Ä¢‚Ä¢‚Ä¢‚Ä¢‚Ä¢‚Ä¢"
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <button 
            className="dev-btn dev-btn-primary" 
            style={{ width: '100%', marginTop: '30px', opacity: isLoading ? 0.7 : 1, background: '#ffffff', color: '#000000' }}
            disabled={isLoading}
            onClick={() => handleLogin()}
          >
            {isLoading ? 'Carregando...' : (authMode === 'login' ? 'Entrar' : 'Criar Portal Agora')}
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '15px' }}>
            <button 
              style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '13px' }}
              onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
            >
              {authMode === 'login' ? 'N√£o tem um portal? Crie um aqui!' : 'J√° tem um portal? Fa√ßa login!'}
            </button>
          </div>
          
          <div style={{ margin: '20px 0', borderTop: '1px solid #222' }}></div>

          <button 
            className="dev-btn font-jakarta mb-2" 
            style={{ width: '100%', background: 'transparent', border: '1px solid #333', color: '#fff' }}
            onClick={loginWithGoogle}
          >
            üîë Entrar como Admin Master (Google)
          </button>

          <div style={{ padding: '10px', background: 'rgba(255, 138, 0, 0.05)', border: '1px solid rgba(255, 138, 0, 0.15)', borderRadius: '12px', marginTop: '10px', marginBottom: '10px' }}>
            <p style={{ color: '#ff8a00', fontSize: '11px', margin: 0, textAlign: 'center', lineHeight: '1.4' }}>
              üí° <strong>Dica de Acesso:</strong> Se o login por Google falhar ou se voc√™ estiver usando um dom√≠nio pr√≥prio, voc√™ tamb√©m pode acessar digitando o usu√°rio do seu portal (ex: <strong>"master"</strong> para administrador geral) e a senha cadastrada nos campos acima.
            </p>
          </div>
          
          {(navigator.userAgent.includes('wv') || navigator.userAgent.includes('Kodular')) && (
            <div style={{ marginTop: '15px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px' }}>
              <p style={{ color: '#f87171', fontSize: '11px', margin: 0, textAlign: 'center', lineHeight: '1.4' }}>
                ‚ö†Ô∏è <strong>Aten√ß√£o:</strong> O login do Google costuma ser bloqueado dentro de aplicativos Android (Kodular). 
                Caso ocorra erro, acesse pelo navegador de internet (Google Chrome) ou utilize o login por usu√°rio e senha.
              </p>
            </div>
          )}
          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#888' }}>
            Desenvolvido por Bossa Infor. Contato: (85) 99286-2177
          </p>
        </div>
      </div>
    );
  }

  if (!appData) {
    return (
      <div style={{ background: '#000', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'Inter' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '20px' }}>Cidade n√£o encontrada</h2>
        <p style={{ color: '#888', marginBottom: '40px' }}>Verifique se o link est√° correto ou portal ainda n√£o foi criado.</p>
        <div style={{ display: 'flex', gap: '20px' }}>
          <button onClick={() => navigate('/login')} className="dev-btn" style={{ background: '#fff', color: '#000', width: '200px' }}>Ir para Login</button>
        </div>
      </div>
    );
  }

  // Blocked Screen Logic
  if (isBlocked && !user?.isAdmin) {
    return (
      <div style={{ background: '#000', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'Inter', textAlign: 'center', padding: '20px' }}>
        <div style={{ fontSize: 'clamp(3rem, 10vw, 5rem)', marginBottom: '20px' }}>üîí</div>
        <h2 style={{ fontSize: 'clamp(1.5rem, 6vw, 2.5rem)', fontWeight: 900, marginBottom: '10px', color: '#ff4444' }}>SERVI√áO SUSPENSO</h2>
        <p style={{ color: '#888', maxWidth: '500px', fontSize: 'clamp(0.9rem, 4vw, 1.1rem)', marginBottom: '40px', lineHeight: 1.6 }}>
          Este portal encontra-se temporariamente indispon√≠vel. Por favor, entre em contato com o administrador master para regularizar sua situa√ß√£o e restabelecer o acesso.
        </p>
        <a href="https://wa.me/5585992908713" target="_blank" className="cta-button" style={{ background: '#25D366' }}>
          ENTRAR EM CONTATO AGORA
        </a>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-bg text-text font-jakarta"
      style={{
        // @ts-ignore
        '--primary': appData?.theme?.primary || '#ff8a00',
        '--bg': (appData?.theme?.bg && appData.theme.bg !== '#000000' && appData.theme.bg !== '#050505') ? appData.theme.bg : '#090d16',
        '--text': appData?.theme?.text || '#ffffff',
        '--text-dim': appData?.theme?.textDim || '#a0a0a0'
      }}
    >
      {/* Floating Dev Button - SHOW ONLY IF LOGGED IN MANAGER OR MASTER ADMIN */}
      {user?.isAdmin && tenantId !== 'master' && (
        <button 
          onClick={() => navigate('/master')}
          style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            zIndex: 1100,
            background: '#ff8a00',
            color: '#000',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '100px',
            fontWeight: 800,
            fontSize: '0.7rem',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(251, 191, 36, 0.3)'
          }}
        >
          ‚¨ÖÔ∏è VOLTAR AO MASTER
        </button>
      )}

      {(user?.isAdmin || (user?.username && slugify(user.username) === slugify(tenantId || 'fortaleza'))) && (
        <button 
          onClick={() => setIsDevAreaOpen(true)}
          className="dev-floating-btn"
          title="√Årea do Desenvolvedor"
        >
          üõ†Ô∏è
        </button>
      )}

      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5 h-16 md:h-20 flex items-center">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 flex justify-between items-center">
          {/* Logo Wrapper */}
          <a 
            href="#" 
            className="flex items-center gap-3 decoration-transparent group" 
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          >
            <img 
              src={activeReferralPartner?.logo ? activeReferralPartner.logo : (appData?.siteInfo?.logo ? appData.siteInfo.logo : "https://i.postimg.cc/nVdYndN2/minha-divulgacao-png.png")} 
              alt={activeReferralPartner?.customTitle || activeReferralPartner?.name || "Minha Divulga√ß√£o"} 
              className={`h-10 md:h-12 ${(activeReferralPartner?.logo || appData?.siteInfo?.logo) ? 'w-10 md:w-12 rounded-full object-cover border border-white/10' : 'w-auto object-contain'} transition-transform duration-300 group-hover:scale-105`} 
              referrerPolicy="no-referrer"
            />
            <div className="flex flex-col select-none">
              <span className="font-sans font-extrabold text-sm md:text-base leading-none text-white tracking-tight uppercase group-hover:text-[var(--primary)] transition-colors duration-200">
                {activeReferralPartner?.customTitle || activeReferralPartner?.name || appData.siteInfo.name} <span className="text-[var(--primary)]">{activeReferralPartner ? "" : appData.siteInfo.suffix}</span>
              </span>
              <span className="text-[9px] text-white/40 tracking-widest font-mono uppercase mt-0.5">
                {activeReferralPartner ? `Divulgador: ${activeReferralPartner.name}` : "Portal de M√≠dia"}
              </span>
            </div>
          </a>

          {/* Clean Menu - Desktop */}
          <div className="hidden lg:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-white/70">
            <a href="#inicio" onClick={(e) => { e.preventDefault(); scrollToSection('inicio'); }} className="hover:text-[var(--primary)] transition-colors duration-200">In√≠cio</a>
            <a href="#filtro-empresas" onClick={(e) => { e.preventDefault(); scrollToSection('filtro-empresas'); }} className="hover:text-[var(--primary)] transition-colors duration-200">Buscar Empresas</a>
            <a href="#categorias" onClick={(e) => { e.preventDefault(); scrollToSection('categorias'); }} className="hover:text-[var(--primary)] transition-colors duration-200">Categorias</a>
            <a href="#tv-destaque" onClick={(e) => { e.preventDefault(); scrollToSection('tv-destaque'); }} className="hover:text-[var(--primary)] transition-colors duration-200">TV & R√°dio</a>
          </div>

          {/* Action Buttons - Desktop */}
          <div className="hidden lg:flex items-center gap-3 font-jakarta">
            <a 
              href="https://wa.me/5585992862177?text=Ol%C3%A1!%20Gostaria%20de%20divulgar%20minha%20empresa%20no%20Guia%20Comercial%20Minha%20Divulga%C3%A7%C3%A3o."
              target="_blank"
              rel="noreferrer"
              className="bg-[var(--primary)] hover:brightness-110 text-black px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 shadow shadow-[var(--primary)]/20 cursor-pointer flex items-center gap-1.5 decoration-transparent"
            >
              üöÄ Divulgue Sua Empresa
            </a>
            {!hideAdvertiserAuth && (
              <button 
                onClick={() => { setAuthMode('login'); setIsAdPortalOpen(true); }}
                className="bg-neutral-950 hover:bg-neutral-900 border border-white/20 text-white/90 hover:text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
              >
                <User size={13} /> Entrar (Login)
              </button>
            )}
          </div>

          {/* Mobile Menu Trigger & Quick Actions */}
          <div className="flex lg:hidden items-center gap-2">
            <a 
              href="https://wa.me/5585992862177?text=Ol%C3%A1!%20Gostaria%20de%20divulgar%20minha%20empresa%20no%20Guia%20Comercial%20Minha%20Divulga%C3%A7%C3%A3o."
              target="_blank"
              rel="noreferrer"
              className="bg-[var(--primary)] text-black px-2.5 py-1.5 rounded-lg font-black text-[10px] uppercase tracking-wide cursor-pointer shrink-0 decoration-transparent"
            >
              üöÄ Divulgar
            </a>
            {!hideAdvertiserAuth && (
              <button 
                onClick={() => { setAuthMode('login'); setIsAdPortalOpen(true); }}
                className="bg-neutral-900 border border-white/10 text-white px-2.5 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wide cursor-pointer flex items-center gap-1 shrink-0"
              >
                <User size={11} /> Entrar
              </button>
            )}
            <button 
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white/80 p-1.5 hover:text-[var(--primary)]"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-16 md:top-20 left-0 right-0 bg-[#07080e]/95 backdrop-blur-xl border-b border-white/10 px-6 py-8 flex flex-col gap-6 z-40 shadow-2xl lg:hidden font-jakarta"
            >
              <div className="flex flex-col gap-4 text-sm font-bold uppercase tracking-wider">
                <a href="#inicio" onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); scrollToSection('inicio'); }} className="text-white hover:text-[var(--primary)] py-2">üè† In√≠cio</a>
                <a href="#filtro-empresas" onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); scrollToSection('filtro-empresas'); }} className="text-white hover:text-[var(--primary)] py-2">üîç Buscar Empresas</a>
                <a href="#categorias" onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); scrollToSection('categorias'); }} className="text-white hover:text-[var(--primary)] py-2">üìÇ Categorias</a>
                <a href="#tv-destaque" onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); scrollToSection('tv-destaque'); }} className="text-white hover:text-[var(--primary)] py-2">üì∫ TV & R√°dio Ao Vivo</a>
              </div>
              <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
                <a 
                  href="https://wa.me/5585992862177?text=Ol%C3%A1!%20Gostaria%20de%20divulgar%20minha%20empresa%20no%20Guia%20Comercial%20Minha%20Divulga%C3%A7%C3%A3o."
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center bg-[var(--primary)] text-black px-5 py-3 rounded-xl font-extrabold text-xs uppercase tracking-widest block cursor-pointer decoration-transparent"
                >
                  üöÄ Divulgue Sua Empresa
                </a>
                {!hideAdvertiserAuth && (
                  <button 
                    onClick={() => { setIsMobileMenuOpen(false); setAuthMode('login'); setIsAdPortalOpen(true); }}
                    className="w-full text-center bg-neutral-950 border border-white/10 text-white px-5 py-3 rounded-xl font-extrabold text-xs uppercase tracking-widest block cursor-pointer"
                  >
                    üîë Entrar na Conta
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section id="inicio" className="relative pt-32 md:pt-40 pb-16 md:pb-20 overflow-hidden bg-black border-b border-white/5 bg-[radial-gradient(120%_120%_at_50%_10%,#030303_40%,rgba(251,191,36,0.09)_100%)]">
        {/* Tech Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] opacity-100 pointer-events-none" />
        
        {/* Ambient Lights */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[var(--primary)]/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[355px] h-[355px] bg-amber-500/5 rounded-full blur-[130px] pointer-events-none" />

        <div className="relative w-full max-w-5xl mx-auto px-4 md:px-6 z-10 flex flex-col items-center text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 bg-neutral-950/90 border border-amber-500/40 px-5 py-2 rounded-full text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase text-amber-400 mb-6 font-mono shadow-[0_4px_30px_rgba(251,191,36,0.2)] select-none">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            Guia Comercial Digital
          </div>
  
          {/* Main Headline & Subtitle */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-sans font-black text-white tracking-tight leading-[1.1] max-w-4xl select-none">
            Encontre ou divulgue sua empresa no <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500">Guia Comercial Digital</span>
          </h1>
  
          <p className="text-sm sm:text-lg md:text-xl text-white/85 font-semibold max-w-2xl mt-4 leading-relaxed select-none">
            Sua empresa vis√≠vel para clientes da sua regi√£o. Presen√ßa digital inclusa na assinatura do Plano Completo.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mt-8 w-full sm:w-auto relative z-20">
            <a 
              href="https://wa.me/5585992862177?text=Ol%C3%A1!%20Gostaria%20de%20divulgar%20minha%20empresa%20no%20Guia%20Comercial%20Minha%20Divulga%C3%A7%C3%A3o."
              target="_blank"
              rel="noreferrer"
              className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-black hover:scale-105 hover:shadow-[0_0_30px_rgba(251,191,36,0.4)] px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider text-center transition-all duration-300 shadow-2xl flex items-center justify-center gap-2.5 cursor-pointer w-full sm:w-auto shrink-0 border border-amber-300/30 decoration-transparent"
            >
              üöÄ Divulgue Sua Empresa
            </a>
            
            <button 
              onClick={() => { 
                const el = document.getElementById('filtro-empresas');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white/10 hover:bg-white/15 text-white border border-white/20 hover:border-white/40 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider text-center transition-all duration-300 shadow-xl flex items-center justify-center gap-2.5 cursor-pointer w-full sm:w-auto shrink-0"
            >
              üîç Buscar Empresas
            </button>
          </div>

          {/* Direct Search Bar */}
          <div className="w-full max-w-3xl mt-10 bg-neutral-900/90 border border-white/10 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-md text-left">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-sm">üìç</span>
                <select
                  value={selectedStateFilter}
                  onChange={(e) => setSelectedStateFilter(e.target.value)}
                  className="w-full bg-[#111116] border border-white/10 hover:border-white/20 focus:border-amber-500 outline-none rounded-xl pl-10 pr-8 py-3 text-xs sm:text-sm text-white font-bold appearance-none cursor-pointer transition-all"
                >
                  <option value="">Todos os Estados (Brasil)</option>
                  {BRAZIL_STATES.map(st => (
                    <option key={st.uf} value={st.uf}>{st.name} ({st.uf})</option>
                  ))}
                </select>
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none text-[10px]">‚ñº</span>
              </div>

              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-white/40">
                  <Search size={16} />
                </div>
                <input 
                  type="text" 
                  placeholder="Nome da empresa ou ramo..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#111116] border border-white/10 hover:border-white/20 focus:border-amber-500 outline-none rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-white font-medium transition-all"
                />
              </div>
              
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('filtro-empresas');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-amber-500 hover:bg-amber-400 text-black font-black text-xs sm:text-sm uppercase tracking-wider px-6 py-3 rounded-xl transition-all duration-200 shrink-0 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                üîç Buscar
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Showcase Hub of Main Advertisers & Flyers */}
      {visibleFlyers.length > 0 && (
        <section id="promocoes" className="w-full py-20 md:py-28 border-b border-white/5 bg-[#07070c] relative">
          {/* Subtle decoration */}
          <div className="absolute top-0 right-10 w-96 h-96 bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />
          
          <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
            
            {/* 1. SE√á√ÉO PRINCIPAL: PROMO√á√ïES DA SEMANA CARROSSEL */}
            <div className="mb-20">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-4">
                <div>
                  <span className="text-[var(--primary)] text-xs font-black font-mono tracking-[0.2em] uppercase">CURADORIA DIGITAL</span>
                  <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mt-2">
                    üî• Ofertas Irrecus√°veis da Semana
                  </h2>
                </div>
                <p className="text-sm sm:text-base text-white/85 font-bold max-w-sm leading-relaxed">
                  Apenas ofertas reais e com descontos exclusivos de marcas verificadas no portal. Toque no card e garanta o seu benef√≠cio no WhatsApp antes que esgote!
                </p>
              </div>

              {/* Dynamic Slider Container */}
              <div className="relative overflow-hidden bg-gradient-to-br from-[#11111a] to-[#0a0a10]/50 border border-white/10 rounded-[32px] p-6 md:p-12 shadow-2xl flex flex-col md:flex-row items-center gap-8 md:gap-16">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[var(--primary)] via-amber-500 to-transparent opacity-80" />
                
                {/* Active Flyer Image Frame with device-like card skeleton */}
                <div className="relative w-full md:w-1/2 flex flex-col items-center justify-center">
                  
                  {/* Highlight badge outside and above the image banner */}
                  <span className="mb-5 bg-gradient-to-r from-red-600 to-amber-600 text-white font-black text-[9px] tracking-widest uppercase px-4 py-1.5 rounded-full shadow-lg z-10 whitespace-nowrap animate-pulse select-none">
                    üö® DESTAQUE COMERCIAL DE HOJE
                  </span>

                  <div 
                    className="relative w-full max-w-[320px] aspect-[3/4.2] rounded-3xl overflow-hidden border-2 border-white/10 shadow-[0_15px_45px_rgba(0,0,0,0.8)] bg-[#11111a] cursor-pointer group"
                    onClick={() => {
                      const activeFlyer = visibleFlyers[activeFlyerIndex];
                      if (typeof activeFlyer === 'object' && activeFlyer?.link) {
                        window.open(getWaLinkWithReferral(activeFlyer.link), '_blank');
                      }
                    }}
                  >
                    <AnimatePresence mode="wait">
                      <motion.img 
                        key={activeFlyerIndex}
                        initial={{ opacity: 0, scale: 0.96, filter: "blur(5px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, scale: 1.04, filter: "blur(5px)" }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        src={typeof visibleFlyers[activeFlyerIndex] === 'string' ? visibleFlyers[activeFlyerIndex] : visibleFlyers[activeFlyerIndex]?.image} 
                        alt="Promo√ß√£o em Destaque" 
                        className="w-full h-full object-contain select-none bg-[#0a0a0f] group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    </AnimatePresence>
                    
                    {/* Hover Gloss */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  </div>
                </div>

                {/* Description and Info block */}
                <div className="w-full md:w-1/2 flex flex-col justify-center items-center md:items-start text-center md:text-left">
                  <span className="text-[10px] text-[var(--primary)] tracking-[0.15em] font-black uppercase bg-[var(--primary)]/10 px-4 py-1.5 rounded-full mb-5 font-mono">
                    PROMO√á√ÉO N¬∫ {activeFlyerIndex + 1} de {visibleFlyers.length}
                  </span>
                  <h3 className="text-2xl sm:text-3.5xl font-sans font-black text-white leading-tight">
                    Aproveite esta oportunidade exclusiva
                  </h3>
                  <p className="text-sm sm:text-base text-white/90 mt-4 leading-relaxed max-w-md font-extrabold">
                    Pre√ßo especial e atendimento preferencial garantidos para usu√°rios do portal. Toque abaixo para abrir o canal direto com o anunciante.
                  </p>

                  {/* Slider Action Button wrapper */}
                  {typeof visibleFlyers[activeFlyerIndex] === 'object' && visibleFlyers[activeFlyerIndex]?.link && (
                    <a 
                      href={getWaLinkWithReferral(visibleFlyers[activeFlyerIndex].link)} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="inline-flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 hover:scale-[1.03] text-white font-extrabold text-xs uppercase tracking-wider px-8 py-4.5 rounded-2xl shadow-xl mt-8 transition-all duration-300"
                    >
                      <Sparkles size={16} className="text-amber-300 animate-spin" />
                      Falar no WhatsApp Comercial
                    </a>
                  )}

                  {/* Carousel navigation controls */}
                  <div className="flex items-center gap-4 mt-8">
                    <button 
                      type="button"
                      onClick={() => setActiveFlyerIndex(prev => (prev - 1 + visibleFlyers.length) % visibleFlyers.length)}
                      className="w-11 h-11 rounded-full bg-white/5 border border-white/10 hover:border-[var(--primary)] text-white hover:text-[var(--primary)] hover:bg-white/10 flex items-center justify-center transition-all shadow-md cursor-pointer"
                    >
                      <ChevronLeft size={22} className="stroke-[2.5]" />
                    </button>
                    
                    {/* dots indicators */}
                    <div className="flex gap-2.5">
                      {visibleFlyers.map((_, i) => (
                        <button 
                          key={i} 
                          type="button"
                          onClick={() => setActiveFlyerIndex(i)}
                          className={`h-2 transition-all duration-300 rounded-full cursor-pointer ${activeFlyerIndex === i ? 'bg-[var(--primary)] w-7' : 'bg-white/20 w-2 hover:bg-white/40'}`}
                        />
                      ))}
                    </div>

                    <button 
                      type="button"
                      onClick={() => setActiveFlyerIndex(prev => (prev + 1) % visibleFlyers.length)}
                      className="w-11 h-11 rounded-full bg-white/5 border border-white/10 hover:border-[var(--primary)] text-white hover:text-[var(--primary)] hover:bg-white/10 flex items-center justify-center transition-all shadow-md cursor-pointer"
                    >
                      <ChevronRight size={22} className="stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* NEW SECTION: LANDSCAPE BANNERS FOR CUSTOMERS AND PARTNERS (RESPONSIVE) */}
            {visibleHorizontalBanners.length > 0 && (
              <div className="mb-20 pt-12 border-t border-white/5">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-4">
                  <div>
                    <span className="text-[var(--primary)] text-xs font-black font-mono tracking-[0.2em] uppercase">VITRINE DE PARCEIROS</span>
                    <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-2 flex items-center gap-2">
                      ‚≠ê Promo√ß√µes Especiais do Com√©rcio
                    </h2>
                  </div>
                  <p className="text-sm text-white/50 max-w-sm leading-relaxed">
                    Araste para o lado ou clique nos banners horizontais de nossos patrocinadores oficiais para falar no WhatsApp!
                  </p>
                </div>

                {/* Responsive container styled beautifully like standard design */}
                <div className="relative overflow-hidden bg-gradient-to-r from-[#0e0e16] to-[#07070b] border border-white/10 rounded-[28px] p-2.5 sm:p-4 md:p-6 shadow-2xl flex flex-col items-center">
                  
                  {/* Premium floating badge */}
                  <div className="absolute top-4 right-6 z-20 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black text-[9px] tracking-widest uppercase px-3 py-1.5 rounded-full shadow-lg select-none animate-pulse">
                     üî• DESTAQUE
                  </div>

                  {/* Banner Slot (Fully responsive, never cuts off content across viewports) */}
                  <div 
                    className="relative w-full rounded-2xl md:rounded-3xl overflow-hidden border border-white/5 bg-[#08080d] cursor-pointer group"
                    onClick={() => {
                      const activeBanner = visibleHorizontalBanners[activeHorizontalBannerIndex];
                      if (activeBanner?.link) {
                        window.open(getWaLinkWithReferral(activeBanner.link), '_blank');
                      }
                    }}
                  >
                    <AnimatePresence mode="wait">
                      <motion.img 
                        key={activeHorizontalBannerIndex}
                        initial={{ opacity: 0, scale: 0.985, filter: "blur(3px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, scale: 1.015, filter: "blur(3px)" }}
                        transition={{ duration: 0.45, ease: "easeInOut" }}
                        src={visibleHorizontalBanners[activeHorizontalBannerIndex]?.image} 
                        alt={visibleHorizontalBanners[activeHorizontalBannerIndex]?.title || "Banner Destaque"} 
                        className="w-full h-auto max-h-[380px] object-contain block mx-auto select-none group-hover:scale-[1.012] transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                    </AnimatePresence>

                    {/* Dark aesthetic overlay for readability of elements */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />

                    {/* Smooth gloss reflection hover trigger */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  </div>

                  {/* Micro dashboard under the banner image */}
                  <div className="flex flex-col sm:flex-row items-center justify-between w-full px-2 mt-4 sm:mt-5 gap-3">
                    <div className="flex items-center gap-2.5 max-w-full sm:max-w-[65%]">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                      <p className="text-xs sm:text-sm font-sans font-bold text-white/80 truncate">
                        {visibleHorizontalBanners[activeHorizontalBannerIndex]?.title || "Banner Comercial Promocional"}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button 
                        type="button"
                        onClick={() => setActiveHorizontalBannerIndex(prev => (prev - 1 + visibleHorizontalBanners.length) % visibleHorizontalBanners.length)}
                        className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:border-[var(--primary)] text-white hover:text-[var(--primary)] hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer"
                      >
                        <ChevronLeft size={20} className="stroke-[2.5]" />
                      </button>
                      
                      {/* Dots indicators */}
                      <div className="flex gap-2">
                        {visibleHorizontalBanners.map((_, i) => (
                          <button 
                            key={i} 
                            type="button"
                            onClick={() => setActiveHorizontalBannerIndex(i)}
                            className={`h-1.5 transition-all duration-300 rounded-full cursor-pointer ${activeHorizontalBannerIndex === i ? 'bg-[var(--primary)] w-5' : 'bg-white/10 w-1.5 hover:bg-white/30'}`}
                          />
                        ))}
                      </div>

                      <button 
                        type="button"
                        onClick={() => setActiveHorizontalBannerIndex(prev => (prev + 1) % visibleHorizontalBanners.length)}
                        className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:border-[var(--primary)] text-white hover:text-[var(--primary)] hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer"
                      >
                        <ChevronRight size={20} className="stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TV MINHA DIVULGA√á√ÉO & R√ÅDIO AO VIVO */}
            <div id="tv-destaque" className="mb-14 md:mb-20 pt-8 md:pt-12 border-t border-white/5 scroll-mt-24">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 md:mb-10 gap-3">
                <div>
                  <span className="text-[var(--primary)] text-xs font-black font-mono tracking-[0.2em] uppercase">CANAL OFICIAL DE TRANSMISS√ÉO</span>
                  <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight mt-1.5 flex items-center gap-2">
                    üì∫ TV Minha Divulga√ß√£o ‚Äî Promo√ß√µes e Destaques
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-white/60 max-w-md leading-relaxed">
                  Canal oficial de promo√ß√µes, m√≠dias e ofertas especiais das empresas cadastradas.
                </p>
              </div>

              {/* TV Frame Container - Fully Responsive for Mobile, Tablet, Notebook & PC */}
              <div className="relative w-full max-w-4xl lg:max-w-5xl mx-auto bg-[#0a0a10] border-2 sm:border-4 border-[#1c1e2e] rounded-2xl sm:rounded-3xl p-2 sm:p-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden">
                
                {/* Top Bezel & Status Bar */}
                <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-[#121422] rounded-t-xl sm:rounded-t-2xl border-b border-white/10 mb-2 sm:mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                    <span className="text-[10px] sm:text-[11px] font-mono font-black text-emerald-400 tracking-widest uppercase">üî¥ CANAL AO VIVO ‚Äî TV MINHA DIVULGA√á√ÉO</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={reloadTvPlayer}
                      className="text-[9px] sm:text-[10px] font-mono font-extrabold text-amber-300 bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/30 px-2.5 py-0.5 rounded-full transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-sm"
                      title="Clique para recarregar o sinal da TV sem precisar atualizar a p√°gina (F5)"
                    >
                      <span>üîÑ Recarregar TV</span>
                    </button>
                    <span className="text-[9px] sm:text-[10px] font-mono text-white/50 tracking-widest uppercase bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10 hidden sm:inline-block">
                      TRANSMISS√ÉO 16:9
                    </span>
                  </div>
                </div>

                {/* 16:9 Aspect Ratio Frame for Iframe */}
                <div className="relative w-full aspect-[16/9] rounded-lg sm:rounded-xl overflow-hidden bg-black shadow-inner border border-white/10">
                  {isTvLoading && (
                    <div className="absolute inset-0 z-10 bg-[#0a0a10]/90 backdrop-blur-sm flex flex-col items-center justify-center gap-2 pointer-events-none">
                      <div className="w-7 h-7 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">Sincronizando Sinal da TV...</span>
                    </div>
                  )}

                  <iframe 
                    key={`tv-frame-${tvKey}`}
                    ref={tvIframeRef}
                    src={(() => {
                      const baseUrl = universalConfig?.horizontalTvLink || (appData && appData.siteInfo && appData.siteInfo.horizontalTvLink) || 'https://saas-tv-digital-signage-217322288286.us-east1.run.app/testando';
                      const sep = baseUrl.includes('?') ? '&' : '?';
                      const volParam = `vol=${Math.round(tvVolume * 100)}&muted=${tvMuted ? 1 : 0}&autoplay=1&fs=0&fullscreen=0`;
                      return `${baseUrl}${sep}_t=${tvKey}&${volParam}`;
                    })()} 
                    title="TV Minha Divulga√ß√£o"
                    className="w-full h-full border-0 select-none"
                    loading="eager"
                    allow="autoplay *; encrypted-media; audio"
                    allowFullScreen={false}
                    onLoad={() => {
                      setIsTvLoading(false);
                      sendTvVolume(tvVolume, tvMuted);
                    }}
                    onError={() => setIsTvLoading(false)}
                  />
                </div>

                {/* Bottom Bar Controls - Volume & Status */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-2.5 sm:mt-3 px-3 sm:px-4 py-2.5 bg-[#121422]/90 rounded-b-xl sm:rounded-b-2xl border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] sm:text-xs font-bold text-white/80">üì∫ TV Minha Divulga√ß√£o</span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Ao Vivo</span>
                  </div>

                  {/* Volume Control Bar */}
                  <div className="flex items-center gap-3 w-full sm:w-auto bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
                    <button
                      type="button"
                      onClick={handleTvMuteToggle}
                      className="text-white/70 hover:text-white transition-colors cursor-pointer"
                      title={tvMuted || tvVolume === 0 ? "Ativar som da TV" : "Silenciar TV"}
                    >
                      {tvMuted || tvVolume === 0 ? (
                        <VolumeX size={16} className="text-red-400" />
                      ) : (
                        <Volume2 size={16} className="text-amber-400" />
                      )}
                    </button>

                    <div className="flex items-center gap-2 flex-1 sm:w-36">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={tvMuted ? 0 : tvVolume}
                        onChange={(e) => handleTvVolumeChange(parseFloat(e.target.value))}
                        className="w-full accent-[var(--primary)] h-1.5 rounded-full cursor-pointer bg-neutral-800"
                        title="Ajustar volume da TV"
                      />
                      <span className="text-[10px] font-mono text-white/60 min-w-[28px] text-right">
                        {tvMuted ? '0%' : `${Math.round(tvVolume * 100)}%`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={reloadTvPlayer}
                      className="text-[10px] font-mono font-bold text-emerald-300 hover:text-emerald-200 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/30 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                      title="Recarregar player da TV"
                    >
                      <span>üîÑ Atualizar Sinal</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* COMPACT R√ÅDIO MINHA DIVULGA√á√ÉO */}
              <div className="w-full max-w-4xl lg:max-w-5xl mx-auto mt-6 bg-[#0a0a10] border border-white/10 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-4">
                  <button 
                    type="button"
                    onClick={handleRadioTogglePlay}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 ${radioPlaying ? 'bg-red-600 text-white hover:bg-red-500 shadow-red-500/20' : 'bg-[var(--primary)] text-black hover:scale-105 shadow-[rgb(251,191,36)]/20'} shadow-lg cursor-pointer`}
                  >
                    {radioPlaying ? <Pause size={24} /> : <Play size={24} className="translate-x-0.5" />}
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${radioPlaying ? 'bg-red-500 animate-pulse' : 'bg-white/20'}`} />
                      <h4 className="text-sm font-extrabold text-white">üìª R√°dio Minha Divulga√ß√£o ‚Äî Ao Vivo</h4>
                    </div>
                    <p className="text-xs text-white/50 mt-0.5">Ou√ßa nossa programa√ß√£o e ofertas em tempo real.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-64">
                  <button 
                    type="button"
                    onClick={() => setRadioVolume(prev => prev === 0 ? 0.8 : 0)}
                    className="text-white/60 hover:text-white"
                  >
                    {radioVolume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01"
                    value={radioVolume}
                    onChange={(e) => setRadioVolume(parseFloat(e.target.value))}
                    className="flex-1 accent-[var(--primary)] h-1.5 rounded-full cursor-pointer bg-neutral-800"
                  />
                  <span className="text-[10px] font-mono text-white/40">{Math.round(radioVolume * 100)}%</span>
                </div>

                <audio 
                  ref={radioAudioRef}
                  src={activeReferralPartner?.radioLink || customRadioLink || universalConfig.radioLink || (appData && appData.siteInfo && appData.siteInfo.radioLink)}
                  onPlay={() => setRadioPlaying(true)}
                  onPause={() => setRadioPlaying(false)}
                />
              </div>
            </div>

            {/* 2. SE√á√ÉO: PARCEIROS OFICIAIS */}
            <div className="mb-20 pt-8 border-t border-white/5">
              <div className="text-center mb-10">
                <span className="text-[var(--primary)] text-[10px] font-black font-mono tracking-[0.2em] uppercase">MARCAS DE CONFIAN√áA</span>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-1">ü§ù Parceiros Oficiais do Portal</h3>
              </div>
              
              {/* High precision logo marquee - Auto scroll motion effect */}
              <div className="logo-marquee-container py-4 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent border-y border-white/5 rounded-2xl">
                <div className="logo-marquee-track opacity-60 hover:opacity-100 transition-opacity duration-300">
                  {(() => {
                    const originalLogos = (appData?.companies || []).filter((c: any) => c.logo);
                    if (originalLogos.length === 0) return null;
                    // Double the logos list to make infinite scroll continuous and neat
                    const doubledLogos = [...originalLogos, ...originalLogos, ...originalLogos];
                    return doubledLogos.map((c: any, idx: number) => (
                      <div 
                        key={idx} 
                        className="h-10 w-28 md:w-36 flex-shrink-0 flex items-center justify-center grayscale hover:grayscale-0 contrast-125 opacity-75 hover:opacity-100 transition-all duration-300 transform hover:scale-105"
                      >
                        <img 
                          src={c.logo} 
                          alt={c.name} 
                          className="max-h-full max-w-full object-contain filter drop-shadow-[0_2px_10px_rgba(255,255,255,0.05)]" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>

            {/* 3. SE√á√ÉO: EMPRESAS EM DESTAQUE */}
            <div className="mb-20">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-4">
                <div>
                  <span className="text-[var(--primary)] text-xs font-black font-mono tracking-[0.2em] uppercase">VITRINE DE EXCEL√äNCIA</span>
                  <h3 className="text-2xl sm:text-3.5xl font-sans font-extrabold text-white tracking-tight mt-1">
                    ‚≠ê Empresas em Destaque
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-white/50 max-w-sm">
                  Anunciantes master selecionados por excelente presta√ß√£o de servi√ßos, avalia√ß√£o positiva e confiabilidade.
                </p>
              </div>

              {/* Grid Layout of Featured Companies */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {(displayedCompanies || []).filter((c: any) => c.featured === true).slice(0, 4).map((company: any) => (
                  <div 
                    key={company.id} 
                    className="relative bg-gradient-to-b from-[#111119] to-[#08080f] border border-[var(--primary)]/30 rounded-3xl p-6 flex flex-col justify-between hover:-translate-y-1.5 transition-all duration-300 shadow-[0_10px_30px_rgba(251,191,36,0.03)] hover:shadow-[0_15px_45px_rgba(251,191,36,0.08)] select-none group"
                  >
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-black text-[8px] tracking-widest uppercase px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 z-10">
                      <Award size={10} /> Destaque
                    </div>
                    
                    <div>
                      {/* Logo Frame */}
                      <div className="w-16 h-16 rounded-full bg-white border border-white/10 overflow-hidden flex items-center justify-center shadow-lg p-0 mb-5 mt-2 group-hover:scale-105 transition-transform duration-300">
                        <img src={company.logo} alt={company.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>

                      <span className="text-[9px] text-[var(--primary)] font-black uppercase tracking-widest bg-[var(--primary)]/10 px-2.5 py-1 rounded-full select-none">
                        {company.category}
                      </span>

                      <h4 className="text-base font-extrabold text-white mt-4 group-hover:text-[var(--primary)] transition-colors duration-200">{company.name}</h4>
                      <p className="text-xs sm:text-sm font-bold text-white/90 mt-2 leading-relaxed min-h-[3rem] line-clamp-2">{company.desc || 'Anunciante comercial verificado na plataforma.'}</p>
                    </div>

                    {renderCardActionButtons(company, true)}
                  </div>
                ))}
              </div>
            </div>



          </div>
        </section>
      )}

      {/* Filterable Businesses Directory */}
      <section id="filtro-empresas" className="w-full py-16 md:py-24 bg-[#050508] border-b border-white/5">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
          
          {/* Search Input and Filters layout */}
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12">
            <span className="text-[var(--primary)] text-xs font-bold font-mono tracking-widest uppercase">Diret√≥rio Comercial</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
              Encontre Empresas Verificadas ou Divulgue a Sua
            </h2>
            <p className="text-sm text-white/50 mt-3">
              Busque abaixo as melhores empresas ativas conectadas via WhatsApp, ou cadastre seu neg√≥cio hoje mesmo para come√ßar a receber pedidos diretos de novos clientes em minutos!
            </p>

            {/* Dynamic Keywords Search Box */}
            <div className="relative w-full max-w-lg mt-8">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/40">
                <Search size={18} />
              </div>
              <input 
                type="text" 
                placeholder="Busque por Assai, Ordones, Refrigera√ß√£o..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#11111a] border border-white/10 hover:border-white/20 focus:border-[var(--primary)] outline-none rounded-2xl pl-12 pr-4 py-4 text-sm text-white font-medium shadow-2xl transition-all duration-300"
              />
              {searchQuery && (
                <button 
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-4 text-xs font-bold font-mono text-white/50 hover:text-white"
                >
                  LIMPAR
                </button>
              )}
            </div>

            {/* Dynamic Active Filters Badges */}
            {(selectedStateFilter || selectedTypeFilter !== 'all' || selectedCategory || searchQuery) && (
              <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
                {selectedStateFilter && (
                  <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-black px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-mono uppercase">
                    üìç {selectedStateFilter}
                    <button type="button" onClick={() => setSelectedStateFilter('')} className="hover:text-white text-[12px] font-extrabold cursor-pointer ml-1">‚úï</button>
                  </span>
                )}
                {selectedTypeFilter !== 'all' && (
                  <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-black px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-mono uppercase">
                    üìÅ {selectedTypeFilter === 'loja' ? 'Lojas' : 'Servi√ßos'}
                    <button type="button" onClick={() => setSelectedTypeFilter('all')} className="hover:text-white text-[12px] font-extrabold cursor-pointer ml-1">‚úï</button>
                  </span>
                )}
                {selectedCategory && (
                  <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-black px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-mono uppercase">
                    üè∑Ô∏è {selectedCategory}
                    <button type="button" onClick={() => setSelectedCategory(null)} className="hover:text-white text-[12px] font-extrabold cursor-pointer ml-1">‚úï</button>
                  </span>
                )}
                {searchQuery && (
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-mono uppercase">
                    üîç "{searchQuery}"
                    <button type="button" onClick={() => setSearchQuery('')} className="hover:text-white text-[12px] font-extrabold cursor-pointer ml-1">‚úï</button>
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStateFilter('');
                    setSelectedTypeFilter('all');
                    setSelectedCategory(null);
                    setSearchQuery('');
                  }}
                  className="bg-neutral-900 border border-white/5 hover:bg-white/5 text-white/70 hover:text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer font-mono"
                >
                  üßπ LIMPAR FILTROS
                </button>
              </div>
            )}
          </div>

          {/* Interactive Category Grid Filter */}
          <div className="mb-12">
            <h3 className="text-xs font-black font-mono text-amber-400 tracking-[0.2em] uppercase text-center mb-6">
              üìÇ CATEGORIAS POPULARES
            </h3>
            
            {(() => {
              const mainCats = CATEGORIES.slice(0, 12);
              const displayedCategories = showAllCategories 
                ? CATEGORIES 
                : (selectedCategory && !mainCats.some(c => c.name === selectedCategory) 
                    ? [...mainCats, ...CATEGORIES.filter(c => c.name === selectedCategory)] 
                    : mainCats);

              return (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 gap-3">
                    {displayedCategories.map((cat, idx) => {
                      const isSelected = selectedCategory === cat.name;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            const newCat = isSelected ? null : cat.name;
                            setSelectedCategory(newCat);
                            setTimeout(() => {
                              const resultsEl = document.getElementById('destaque');
                              if (resultsEl) {
                                resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }
                            }, 50);
                          }}
                          className={`p-3.5 rounded-2xl border transition-all duration-200 flex flex-col items-center justify-center text-center cursor-pointer ${
                            isSelected 
                              ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-black scale-[1.03] shadow-[0_0_15px_rgba(251,191,36,0.25)]' 
                              : 'bg-[#11121c] border-white/10 text-white/80 hover:border-amber-400/40 hover:text-white hover:bg-neutral-800'
                          }`}
                        >
                          <span className="text-2xl mb-1.5">{cat.icon}</span>
                          <span className="text-[11px] font-extrabold leading-tight">{cat.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  {CATEGORIES.length > 12 && (
                    <div className="text-center mt-5">
                      <button
                        type="button"
                        onClick={() => setShowAllCategories(!showAllCategories)}
                        className="inline-flex items-center gap-2 bg-[#121422] hover:bg-white/10 border border-white/15 hover:border-amber-400/50 text-amber-300 hover:text-amber-200 font-extrabold text-xs px-5 py-2.5 rounded-2xl transition-all duration-200 cursor-pointer shadow-md active:scale-95"
                      >
                        {showAllCategories ? (
                          <>
                            <span>üîº Mostrar Apenas Principais Categorias</span>
                          </>
                        ) : (
                          <>
                            <span>üìÇ Ver Todas as Categorias ({CATEGORIES.length})</span>
                            <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </>
              );
            })()}
          </div>

          {/* Header for Category or Search Filter Results */}
          {(selectedCategory || searchQuery) && filteredCompanies.length > 0 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent border border-amber-500/20 p-4 rounded-2xl">
              <div className="flex items-center gap-2">
                <span className="text-base">üè∑Ô∏è</span>
                <h3 className="text-sm font-extrabold text-white">
                  {selectedCategory ? `Empresas Cadastradas em: ${selectedCategory}` : `Resultados da busca por "${searchQuery}"`}
                </h3>
              </div>
              <span className="text-xs font-mono font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full">
                {filteredCompanies.length} {filteredCompanies.length === 1 ? 'empresa cadastrada' : 'empresas cadastradas'}
              </span>
            </div>
          )}

          {/* Grid of Results */}
          {filteredCompanies.length === 0 ? (
            <div className="text-center py-16 bg-[#11111a]/40 border border-white/5 rounded-3xl mt-12 max-w-xl mx-auto">
              <Info size={40} className="mx-auto text-white/35 mb-4" />
              <p className="text-sm text-white/60 font-semibold text-center">Nenhum anunciante encontrado para a sua busca</p>
              <button 
                type="button"
                onClick={() => { setSearchQuery(''); handleCategoryClick(null); }}
                className="text-xs text-[var(--primary)] font-extrabold uppercase mt-3 tracking-widest hover:underline"
              >
                Resetar Filtros
              </button>
            </div>
          ) : (
            <div id="destaque" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-12">
              {filteredCompanies.map(company => {
                const planType = getCompanyPlanType(company);
                return (
                  <div 
                    key={company.id} 
                    className={`bg-[#0f1016] border transition-all duration-300 rounded-3xl p-6 flex flex-col justify-between hover:-translate-y-1.5 shadow-xl hover:shadow-2xl relative select-none ${
                      planType === 'patrocinado' 
                        ? 'border-amber-400/80 shadow-[0_0_25px_rgba(251,191,36,0.25)] ring-1 ring-amber-400/50' 
                        : planType === 'destaque'
                        ? 'border-amber-500/50 shadow-lg shadow-amber-500/5'
                        : planType === 'verificado'
                        ? 'border-emerald-500/30 hover:border-emerald-500/50'
                        : 'border-white/5 hover:border-white/20'
                    }`}
                  >
                    {planType === 'patrocinado' && (
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 via-amber-500 to-yellow-500 text-black font-black text-[9px] tracking-widest uppercase px-3 py-1 rounded-full shadow-lg flex items-center gap-1 z-10 animate-pulse">
                        üî• PATROCINADO
                      </div>
                    )}
                    {planType === 'destaque' && (
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-black text-[9px] tracking-widest uppercase px-3 py-1 rounded-full shadow-lg flex items-center gap-1 z-10">
                        ‚≠ê DESTAQUE
                      </div>
                    )}
                    {planType === 'verificado' && (
                      <div className="absolute top-4 right-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-black text-[9px] tracking-widest uppercase px-3 py-1 rounded-full shadow-lg flex items-center gap-1 z-10">
                        ‚úî VERIFICADO
                      </div>
                    )}
                    
                    <div>
                      {/* Logo Frame */}
                      <div className="w-20 h-20 rounded-full bg-white border border-white/15 overflow-hidden flex items-center justify-center shadow-lg p-0 mb-5 mt-2">
                        <img src={company.logo} alt={company.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>

                      <div className="flex flex-wrap gap-1.5 items-center">
                        <span className="text-[10px] text-[var(--primary)] font-extrabold uppercase tracking-widest bg-[var(--primary)]/10 px-2.5 py-1 rounded-full select-none">
                          {company.category}
                        </span>
                        {(() => {
                          const { average, count } = getCompanyReviewStats(company.id);
                          if (count > 0) {
                            return (
                              <span className="text-[9px] text-amber-400 font-extrabold uppercase tracking-wide bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-full select-none flex items-center gap-1 font-mono">
                                ‚≠ê {average.toFixed(1)} ({count})
                              </span>
                            );
                          } else {
                            return (
                              <span className="text-[9px] text-white/40 font-bold uppercase tracking-wide bg-white/5 border border-white/10 px-2.5 py-1 rounded-full select-none flex items-center gap-1 font-mono">
                                ‚≠ê Novo
                              </span>
                            );
                          }
                        })()}
                        {(company.city || company.state || company.uf) && (
                          <span className="text-[9px] text-white/50 font-bold uppercase tracking-wide bg-white/5 border border-white/10 px-2.5 py-1 rounded-full select-none flex items-center gap-1 font-mono">
                            üìç {company.city || 'Fortaleza'}{company.state || company.uf ? ` - ${company.state || company.uf}` : ''}
                          </span>
                        )}
                        <span className="text-[9px] text-white/40 font-bold uppercase tracking-wide bg-white/5 border border-white/10 px-2 py-1 rounded-full select-none flex items-center gap-1 font-mono">
                          üëÅÔ∏è {company.views || 0}
                        </span>
                      </div>

                      <h3 className="text-lg font-black text-white mt-4 line-clamp-1 flex items-center gap-1.5">
                        {company.name}
                        {planType === 'verificado' && (
                          <span className="text-emerald-400 text-xs" title="Empresa Verificada">‚úî</span>
                        )}
                      </h3>
                      <p className="text-sm font-bold text-white/95 mt-2.5 line-clamp-3 leading-snug min-h-[3.8rem] tracking-wide">{company.desc || 'Anunciante comercial verificado de alta qualidade e atendimento dedicado.'}</p>
                    </div>

                  {/* Action Buttons */}
                  {renderCardActionButtons(company, false)}
                </div>
              );
            })}
            </div>
          )}

        </div>
      </section>

      {/* Call to Action Section */}
      <section className="w-full py-16 md:py-20 bg-gradient-to-b from-[#0a0a10] to-black border-b border-white/5 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="relative w-full max-w-5xl mx-auto px-4 md:px-6 text-center z-10 select-none">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-widest mb-6">
            üöÄ Fa√ßa Parte do Guia
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            Divulgue sua empresa para milhares de clientes
          </h2>
          <p className="text-sm sm:text-base text-white/70 max-w-2xl mx-auto mt-4 leading-relaxed font-semibold">
            Presen√ßa no Guia Comercial Digital, banners rotativos e canal oficial de transmiss√£o com link direto para o seu WhatsApp.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <a
              href="https://wa.me/5585992862177?text=Ol%C3%A1!%20Gostaria%20de%20divulgar%20minha%20empresa%20no%20Guia%20Comercial%20Minha%20Divulga%C3%A7%C3%A3o."
              target="_blank"
              rel="noreferrer"
              className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-300 shadow-xl hover:scale-105 cursor-pointer w-full sm:w-auto decoration-transparent"
            >
              üöÄ Divulgue Sua Empresa (WhatsApp)
            </a>
            <a
              href="https://wa.me/5585992862177?text=Ol%C3%A1!%20Acessei%20o%20portal%20Minha%20Divulga%C3%A7%C3%A3o%20e%20gostaria%20de%20tirar%20d%C3%BAvidas."
              target="_blank"
              rel="noreferrer"
              className="bg-white/10 hover:bg-white/15 text-white border border-white/20 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto decoration-transparent"
            >
              üí¨ Falar no WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Footer Section design */}
      <footer className="bg-black border-t border-white/5 pt-16 pb-24 text-white select-none">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            
            {/* About column */}
            <div className="md:col-span-6 flex flex-col gap-4">
              <img 
                src={appData?.siteInfo?.logo ? appData.siteInfo.logo : "https://i.postimg.cc/nVdYndN2/minha-divulgacao-png.png"} 
                alt="Minha Divulga√ß√£o" 
                className={`h-10 md:h-12 ${appData?.siteInfo?.logo ? 'w-10 md:w-12 rounded-full object-cover border border-white/10' : 'w-auto object-contain'} self-start`} 
                referrerPolicy="no-referrer"
                onError={(e) => { e.currentTarget.src = "https://i.postimg.cc/nVdYndN2/minha-divulgacao-png.png" }}
              />
              <p className="text-xs text-white/50 max-w-sm leading-relaxed mt-2">
                Sua maior vitrine digital em todo o Brasil.
              </p>

              {/* Social icons */}
              <div className="flex gap-3.5 mt-4">
                <a href={appData.siteInfo.social.fb} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500 hover:text-blue-500 flex items-center justify-center transition-all text-xs font-black font-mono">FB</a>
                <a href={appData.siteInfo.social.ig} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:border-pink-500 hover:text-pink-500 flex items-center justify-center transition-all text-xs font-black font-mono">IG</a>
                <a href={getWaLinkWithReferral(appData.siteInfo.social.wa)} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-[#25D366] hover:brightness-110 flex items-center justify-center transition-all text-xs font-black font-mono text-white">WA</a>
              </div>
            </div>

            {/* Contact column */}
            <div className="md:col-span-3 flex flex-col gap-3 text-xs text-white/70">
              <h4 className="text-sm font-extrabold text-white uppercase tracking-wider mb-2">Comercial</h4>
              <p className="font-semibold">85 99286-2177</p>
              <p className="font-semibold">85 99290-8713</p>
              <p className="leading-relaxed leading-5 mt-1">{appData.siteInfo.address || 'Fortaleza - Cear√° - Brasil'}</p>
            </div>

            {/* Legal info column */}
            <div className="md:col-span-3 flex flex-col gap-3 text-xs text-white/70">
              <h4 className="text-sm font-extrabold text-white uppercase tracking-wider mb-2">Informa√ß√µes</h4>
              <p className="font-semibold">CNPJ: {appData.siteInfo.cnpj}</p>
              <p className="leading-relaxed leading-5 mt-1 text-white/80">
                Produto da empresa <span className="text-amber-400 font-bold">Bossa Infor</span>. Todos os direitos reservados.
              </p>
            </div>
          </div>
          <div className="w-full border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/50">
            <span>&copy; {new Date().getFullYear()} {appData.siteInfo.name} - Todos os direitos reservados.</span>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 font-medium text-xs tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span>Produto da empresa <strong className="text-amber-400 font-bold uppercase tracking-wider">Bossa Infor</strong></span>
            </div>
          </div>
        </div>
      </footer>

      {/* Developer Area Modal */}
      <AnimatePresence>
        {isDevAreaOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="dev-area-overlay"
          >
            <div className="dev-area-content">
              <div className="dev-header">
                <h2 className="dev-title">√ÅREA DO GESTOR</h2>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button 
                    className="dev-btn" 
                    style={{ background: '#333', color: '#fff', fontSize: '11px', padding: '8px 12px' }} 
                    onClick={logout}
                  >
                    Sair / Logout
                  </button>
                  <button className="dev-close" onClick={() => setIsDevAreaOpen(false)}>‚úï</button>
                </div>
              </div>

              <div className="dev-tabs">
                {['geral', 'se√ß√µes', 'categorias', 'empresas', 'anunciantes', (user?.isAdmin || user?.email === 'bossinhaa80@gmail.com') ? 'v√≠deos' : null, 'flyers', 'banners-horizontais', 'depoimentos-whats', 'pre√ßos', 'segmentos', 'chat', (hasAffiliateSystem || user?.isAdmin || user?.email === 'bossinhaa80@gmail.com') ? 'divulgadores' : null].filter(Boolean).map(tab => (
                  <button 
                    key={tab} 
                    className={`dev-tab ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab === 'depoimentos-whats' ? 'DEPOIMENTOS ZAP' : tab === 'banners-horizontais' ? 'BANNERS HORIZONTAIS' : tab.toUpperCase()}
                  </button>
                ))}
              </div>

              <div className="dev-section">
                {activeTab === 'geral' && (
                  <div className="dev-forms-container">
                    <h3>Informa√ß√µes Gerais e Tema</h3>
                    <div className="dev-grid-2">
                      <div className="dev-form-group">
                        <label>Cor Prim√°ria</label>
                        <input 
                          type="color" 
                          className="dev-input" 
                          value={appData.theme.primary} 
                          onChange={(e) => {
                            const val = e.target.value;
                            setAppData(prev => {
                              if (!prev) return prev;
                              return { ...prev, theme: { ...prev.theme, primary: val } };
                            });
                          }} 
                        />
                      </div>
                      <div className="dev-form-group">
                        <label>Cor de Fundo</label>
                        <input 
                          type="color" 
                          className="dev-input" 
                          value={appData.theme.bg} 
                          onChange={(e) => {
                            const val = e.target.value;
                            setAppData(prev => {
                              if (!prev) return prev;
                              return { ...prev, theme: { ...prev.theme, bg: val } };
                            });
                          }} 
                        />
                      </div>
                    </div>
                    <div className="dev-grid-2">
                      <div className="dev-form-group">
                        <label>Nome do Site</label>
                        <input 
                          type="text" 
                          className="dev-input" 
                          value={appData.siteInfo.name} 
                          onChange={(e) => {
                            const val = e.target.value;
                            setAppData(prev => {
                              if (!prev) return prev;
                              return { ...prev, siteInfo: { ...prev.siteInfo, name: val } };
                            });
                          }} 
                        />
                      </div>
                      <div className="dev-form-group">
                        <label>Sufixo (ex: Divulga√ß√£o)</label>
                        <input 
                          type="text" 
                          className="dev-input" 
                          value={appData.siteInfo.suffix} 
                          onChange={(e) => {
                            const val = e.target.value;
                            setAppData(prev => {
                              if (!prev) return prev;
                              return { ...prev, siteInfo: { ...prev.siteInfo, suffix: val } };
                            });
                          }} 
                        />
                      </div>
                    </div>

                    <div className="dev-form-group">
                      <div className="dev-label-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', margin: 0 }}>
                          üì∑ Logomarca do Portal / Parceiro
                        </label>
                        <DevFileUploadButton 
                          label="üì∑ Escolher do Celular / PC" 
                          onUploadSuccess={(url) => setAppData(prev => prev ? { ...prev, siteInfo: { ...prev.siteInfo, logo: url } } : prev)} 
                        />
                      </div>
                      <input 
                        type="text" 
                        className="dev-input" 
                        value={appData.siteInfo.logo || ''} 
                        placeholder="Cole a URL ou escolha uma foto direto do seu celular acima" 
                        onChange={(e) => {
                          const val = e.target.value;
                          setAppData(prev => {
                            if (!prev) return prev;
                            return { ...prev, siteInfo: { ...prev.siteInfo, logo: val } };
                          });
                        }}
                      />
                      {appData.siteInfo.logo && (
                        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '11px', color: '#888' }}>Visualiza√ß√£o:</span>
                          <img 
                            src={appData.siteInfo.logo} 
                            alt="Logo Preview" 
                            style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #333' }} 
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                    </div>
                    <div className="dev-form-group">
                      <label>Seu Link para Divulga√ß√£o</label>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <input 
                          type="text" 
                          className="dev-input" 
                          readOnly 
                          value={`${window.location.origin}/#/${user?.username || ''}`} 
                          style={{ flex: 1, fontSize: '0.8rem', opacity: 0.8 }} 
                        />
                        <button 
                          className="dev-btn dev-btn-primary" 
                          style={{ padding: '0 15px', fontSize: '0.7rem' }}
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/#/${user?.username || ''}`);
                            alert("Link copiado com sucesso! Agora voc√™ pode enviar para seus clientes.");
                          }}
                        >
                          COPIAR LINK
                        </button>
                      </div>
                    </div>

                    <div className="dev-form-group">
                      <label>Descri√ß√£o</label>
                      <textarea 
                        className="dev-input" 
                        value={appData.siteInfo.description} 
                        onChange={(e) => {
                          const val = e.target.value;
                          setAppData(prev => {
                            if (!prev) return prev;
                            return { ...prev, siteInfo: { ...prev.siteInfo, description: val } };
                          });
                        }} 
                      />
                    </div>

                    <h4 style={{ marginTop: '25px', marginBottom: '10px', color: 'var(--primary)', fontWeight: 800 }}>üìù Textos Personalizados da P√°gina (Opcional)</h4>
                    <p style={{ fontSize: '11px', color: '#888', marginBottom: '15px' }}>
                      Configure t√≠tulos e subt√≠tulos personalizados para o seu portal. Deixe em branco para usar os textos padr√£o do sistema.
                    </p>
                    <div className="dev-grid-2">
                      <div className="dev-form-group">
                        <label>T√≠tulo Principal (Hero)</label>
                        <input 
                          type="text" 
                          className="dev-input" 
                          value={appData.siteInfo.heroTitle || ''} 
                          placeholder="Ex: A maior vitrine digital para seu neg√≥cio no Brasil!"
                          onChange={(e) => {
                            const val = e.target.value;
                            setAppData(prev => {
                              if (!prev) return prev;
                              return { ...prev, siteInfo: { ...prev.siteInfo, heroTitle: val } };
                            });
                          }} 
                        />
                      </div>
                      <div className="dev-form-group">
                        <label>Subt√≠tulo Principal (Hero)</label>
                        <textarea 
                          className="dev-input" 
                          style={{ minHeight: '42px', resize: 'vertical' }}
                          value={appData.siteInfo.heroSub || ''} 
                          placeholder="Ex: Coloque seu neg√≥cio na maior vitrine..."
                          onChange={(e) => {
                            const val = e.target.value;
                            setAppData(prev => {
                              if (!prev) return prev;
                              return { ...prev, siteInfo: { ...prev.siteInfo, heroSub: val } };
                            });
                          }} 
                        />
                      </div>
                    </div>

                    <div className="dev-grid-2">
                      <div className="dev-form-group">
                        <label>T√≠tulo da R√°dio & TV</label>
                        <input 
                          type="text" 
                          className="dev-input" 
                          value={appData.siteInfo.radioTitle || ''} 
                          placeholder="Ex: R√°dio & TV Online Ao Vivo"
                          onChange={(e) => {
                            const val = e.target.value;
                            setAppData(prev => {
                              if (!prev) return prev;
                              return { ...prev, siteInfo: { ...prev.siteInfo, radioTitle: val } };
                            });
                          }} 
                        />
                      </div>
                      <div className="dev-form-group">
                        <label>Subt√≠tulo da R√°dio & TV</label>
                        <textarea 
                          className="dev-input" 
                          style={{ minHeight: '42px', resize: 'vertical' }}
                          value={appData.siteInfo.radioSub || ''} 
                          placeholder="Ex: Acompanhe nossa programa√ß√£o musical completa..."
                          onChange={(e) => {
                            const val = e.target.value;
                            setAppData(prev => {
                              if (!prev) return prev;
                              return { ...prev, siteInfo: { ...prev.siteInfo, radioSub: val } };
                            });
                          }} 
                        />
                      </div>
                    </div>

                    <div className="dev-grid-2">
                      <div className="dev-form-group">
                        <label>T√≠tulo do Banner CTA</label>
                        <input 
                          type="text" 
                          className="dev-input" 
                          value={appData.siteInfo.ctaTitle || ''} 
                          placeholder="Ex: Pronto para dominar seu segmento comercial?"
                          onChange={(e) => {
                            const val = e.target.value;
                            setAppData(prev => {
                              if (!prev) return prev;
                              return { ...prev, siteInfo: { ...prev.siteInfo, ctaTitle: val } };
                            });
                          }} 
                        />
                      </div>
                      <div className="dev-form-group">
                        <label>Subt√≠tulo do Banner CTA</label>
                        <textarea 
                          className="dev-input" 
                          style={{ minHeight: '42px', resize: 'vertical' }}
                          value={appData.siteInfo.ctaSub || ''} 
                          placeholder="Ex: N√£o perca vendas para seu maior concorrente..."
                          onChange={(e) => {
                            const val = e.target.value;
                            setAppData(prev => {
                              if (!prev) return prev;
                              return { ...prev, siteInfo: { ...prev.siteInfo, ctaSub: val } };
                            });
                          }} 
                        />
                      </div>
                    </div>

                    <div className="dev-form-group">
                      <label>Link da R√°dio ({customRadioLink ? "Personalizada" : "Universal"} - Apenas Visualiza√ß√£o)</label>
                      <input type="text" className="dev-input" value={customRadioLink || universalConfig.radioLink} readOnly style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                      <p style={{ fontSize: '10px', color: 'var(--primary)' }}>
                        {customRadioLink 
                          ? "Sua cidade possui um link de r√°dio personalizado cadastrado pelo Master." 
                          : "A r√°dio √© universal e controlada pelo administrador master."}
                      </p>
                    </div>
                    <div className="dev-grid-2">
                      <div className="dev-form-group">
                        <label>WhatsApp (Link completo)</label>
                        <input 
                          type="text" 
                          className="dev-input" 
                          value={appData.siteInfo.social.wa} 
                          onChange={(e) => {
                            const val = e.target.value;
                            setAppData(prev => {
                              if (!prev) return prev;
                              return { ...prev, siteInfo: { ...prev.siteInfo, social: { ...prev.siteInfo.social, wa: val } } };
                            });
                          }} 
                        />
                      </div>
                      <div className="dev-form-group">
                        <label>Instagram (URL Completa)</label>
                        <input 
                          type="text" 
                          className="dev-input" 
                          value={appData.siteInfo.social.ig} 
                          onChange={(e) => {
                            const val = e.target.value;
                            setAppData(prev => {
                              if (!prev) return prev;
                              return { ...prev, siteInfo: { ...prev.siteInfo, social: { ...prev.siteInfo.social, ig: val } } };
                            });
                          }} 
                        />
                      </div>
                      <div className="dev-form-group">
                        <label>Facebook (URL Completa)</label>
                        <input 
                          type="text" 
                          className="dev-input" 
                          value={appData.siteInfo.social.fb} 
                          onChange={(e) => {
                            const val = e.target.value;
                            setAppData(prev => {
                              if (!prev) return prev;
                              return { ...prev, siteInfo: { ...prev.siteInfo, social: { ...prev.siteInfo.social, fb: val } } };
                            });
                          }} 
                        />
                      </div>
                    </div>

                    <h4 style={{ marginTop: '30px', marginBottom: '15px' }}>Informa√ß√µes de Contato e Legal</h4>
                    <div className="dev-grid-2">
                       <div className="dev-form-group">
                         <label>CNPJ</label>
                         <input 
                           type="text" 
                           className="dev-input" 
                           value={appData.siteInfo.cnpj} 
                           onChange={(e) => {
                             const val = e.target.value;
                             setAppData(prev => {
                               if (!prev) return prev;
                               return { ...prev, siteInfo: { ...prev.siteInfo, cnpj: val } };
                             });
                           }} 
                         />
                       </div>
                       <div className="dev-form-group">
                         <label>Telefone de Contato</label>
                         <input 
                           type="text" 
                           className="dev-input" 
                           value={appData.siteInfo.phone} 
                           onChange={(e) => {
                             const val = e.target.value;
                             setAppData(prev => {
                               if (!prev) return prev;
                               return { ...prev, siteInfo: { ...prev.siteInfo, phone: val } };
                             });
                           }} 
                         />
                       </div>
                    </div>
                    <div className="dev-form-group">
                       <label>Endere√ßo Completo</label>
                       <input 
                         type="text" 
                         className="dev-input" 
                         value={appData.siteInfo.address} 
                         onChange={(e) => {
                           const val = e.target.value;
                           setAppData(prev => {
                             if (!prev) return prev;
                             return { ...prev, siteInfo: { ...prev.siteInfo, address: val } };
                           });
                         }} 
                       />
                    </div>
                  </div>
                )}

                {activeTab === 'se√ß√µes' && (
                  <div className="dev-forms-container">
                    <h3>T√≠tulos e Textos das Se√ß√µes</h3>
                    
                    <div className="dev-item-card">
                      <h4 style={{ color: 'var(--primary)', marginBottom: '10px' }}>Categorias</h4>
                      <div className="dev-form-group">
                        <label>T√≠tulo Principal</label>
                        <input 
                          type="text" 
                          className="dev-input" 
                          value={appData.sections.categories.title} 
                          onChange={(e) => {
                            const val = e.target.value;
                            setAppData(prev => {
                              if (!prev) return prev;
                              return { ...prev, sections: { ...prev.sections, categories: { ...prev.sections.categories, title: val } } };
                            });
                          }} 
                        />
                      </div>
                      <div className="dev-form-group">
                        <label>Subt√≠tulo</label>
                        <input 
                          type="text" 
                          className="dev-input" 
                          value={appData.sections.categories.desc} 
                          onChange={(e) => {
                            const val = e.target.value;
                            setAppData(prev => {
                              if (!prev) return prev;
                              return { ...prev, sections: { ...prev.sections, categories: { ...prev.sections.categories, desc: val } } };
                            });
                          }} 
                        />
                      </div>
                    </div>

                    <div className="dev-item-card">
                      <h4 style={{ color: 'var(--primary)', marginBottom: '10px' }}>TV de Comerciais</h4>
                      <div className="dev-grid-2">
                        <div className="dev-form-group">
                          <label>Selinho (Tag)</label>
                          <input type="text" className="dev-input" value={appData.sections.tv.tag} onChange={(e) => updateData('sections', { ...appData.sections, tv: { ...appData.sections.tv, tag: e.target.value } })} />
                        </div>
                        <div className="dev-form-group">
                          <label>T√≠tulo</label>
                          <input type="text" className="dev-input" value={appData.sections.tv.title} onChange={(e) => updateData('sections', { ...appData.sections, tv: { ...appData.sections.tv, title: e.target.value } })} />
                        </div>
                      </div>
                    </div>

                    <div className="dev-item-card">
                      <h4 style={{ color: 'var(--primary)', marginBottom: '10px' }}>Guia de Empresas</h4>
                      <div className="dev-grid-2">
                        <div className="dev-form-group">
                          <label>Selinho (Tag)</label>
                          <input type="text" className="dev-input" value={appData.sections.companies.tag} onChange={(e) => updateData('sections', { ...appData.sections, companies: { ...appData.sections.companies, tag: e.target.value } })} />
                        </div>
                        <div className="dev-form-group">
                          <label>T√≠tulo</label>
                          <input type="text" className="dev-input" value={appData.sections.companies.title} onChange={(e) => updateData('sections', { ...appData.sections, companies: { ...appData.sections.companies, title: e.target.value } })} />
                        </div>
                      </div>
                      <div className="dev-form-group">
                        <label>Subt√≠tulo</label>
                        <input type="text" className="dev-input" value={appData.sections.companies.desc} onChange={(e) => updateData('sections', { ...appData.sections, companies: { ...appData.sections.companies, desc: e.target.value } })} />
                      </div>
                    </div>

                    <div className="dev-item-card">
                      <h4 style={{ color: 'var(--primary)', marginBottom: '10px' }}>Flyers</h4>
                      <div className="dev-form-group">
                        <label>Selinho (Tag)</label>
                        <input type="text" className="dev-input" value={appData.sections.flyers.tag} onChange={(e) => updateData('sections', { ...appData.sections, flyers: { ...appData.sections.flyers, tag: e.target.value } })} />
                      </div>
                    </div>

                    <div className="dev-item-card">
                      <h4 style={{ color: 'var(--primary)', marginBottom: '10px' }}>Como Anunciar</h4>
                      <div className="dev-grid-2">
                        <div className="dev-form-group">
                          <label>Selinho (Tag)</label>
                          <input type="text" className="dev-input" value={appData.sections.howTo.tag} onChange={(e) => updateData('sections', { ...appData.sections, howTo: { ...appData.sections.howTo, tag: e.target.value } })} />
                        </div>
                        <div className="dev-form-group">
                          <label>T√≠tulo</label>
                          <input type="text" className="dev-input" value={appData.sections.howTo.title} onChange={(e) => updateData('sections', { ...appData.sections, howTo: { ...appData.sections.howTo, title: e.target.value } })} />
                        </div>
                      </div>
                    </div>

                    <div className="dev-item-card">
                      <h4 style={{ color: 'var(--primary)', marginBottom: '10px' }}>Benef√≠cios</h4>
                      <div className="dev-grid-2">
                        <div className="dev-form-group">
                          <label>Selinho (Tag)</label>
                          <input type="text" className="dev-input" value={appData.sections.benefits.tag} onChange={(e) => updateData('sections', { ...appData.sections, benefits: { ...appData.sections.benefits, tag: e.target.value } })} />
                        </div>
                        <div className="dev-form-group">
                          <label>T√≠tulo</label>
                          <input type="text" className="dev-input" value={appData.sections.benefits.title} onChange={(e) => updateData('sections', { ...appData.sections, benefits: { ...appData.sections.benefits, title: e.target.value } })} />
                        </div>
                      </div>
                    </div>

                    <div className="dev-item-card">
                      <h4 style={{ color: 'var(--primary)', marginBottom: '10px' }}>Segmentos (Urg√™ncia)</h4>
                      <div className="dev-grid-2">
                        <div className="dev-form-group">
                          <label>Selinho (Tag)</label>
                          <input type="text" className="dev-input" value={appData.sections.segments.tag} onChange={(e) => updateData('sections', { ...appData.sections, segments: { ...appData.sections.segments, tag: e.target.value } })} />
                        </div>
                        <div className="dev-form-group">
                          <label>T√≠tulo</label>
                          <input type="text" className="dev-input" value={appData.sections.segments.title} onChange={(e) => updateData('sections', { ...appData.sections, segments: { ...appData.sections.segments, title: e.target.value } })} />
                        </div>
                      </div>
                      <div className="dev-form-group">
                        <label>Frase de Destaque</label>
                        <input type="text" className="dev-input" value={appData.sections.segments.highlight} onChange={(e) => updateData('sections', { ...appData.sections, segments: { ...appData.sections.segments, highlight: e.target.value } })} />
                      </div>
                      <div className="dev-form-group">
                        <label>Chamada para A√ß√£o</label>
                        <input type="text" className="dev-input" value={appData.sections.segments.callToAction} onChange={(e) => updateData('sections', { ...appData.sections, segments: { ...appData.sections.segments, callToAction: e.target.value } })} />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'categorias' && (
                  <div className="dev-forms-container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h3>Gerenciar Categorias</h3>
                      <button className="dev-add-btn" onClick={() => {
                        const newCat = { name: "Nova Categoria", icon: "üìÅ" };
                        setAppData(prev => {
                          if (!prev) return prev;
                          return { ...prev, categories: [...prev.categories, newCat] };
                        });
                      }}>+ Novo Nicho</button>
                    </div>
                    <div className="dev-items-grid">
                      {(appData?.categories || []).map((cat, idx) => (
                        <div key={idx} className="dev-item-card">
                          <button className="dev-remove-btn" onClick={() => {
                            setAppData(prev => {
                              if (!prev) return prev;
                              return { ...prev, categories: prev.categories.filter((_, i) => i !== idx) };
                            });
                          }}>‚úï</button>
                          <div className="dev-grid-2">
                            <div className="dev-form-group">
                              <div className="dev-label-row">
                                <label>√çcone (Emoji)</label>
                                <a href="https://getemoji.com/#activities" target="_blank" rel="noreferrer" className="dev-helper-link">
                                  üîé Ver Lista de Emojis
                                </a>
                              </div>
                              <input 
                                type="text" 
                                className="dev-input" 
                                value={cat.icon} 
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setAppData(prev => {
                                    if (!prev) return prev;
                                    const newList = [...prev.categories];
                                    newList[idx] = { ...newList[idx], icon: val };
                                    return { ...prev, categories: newList };
                                  });
                                }} 
                              />
                            </div>
                            <div className="dev-form-group">
                              <label>Nome da Categoria</label>
                              <input 
                                type="text" 
                                className="dev-input" 
                                value={cat.name} 
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setAppData(prev => {
                                    if (!prev) return prev;
                                    const newList = [...prev.categories];
                                    newList[idx] = { ...newList[idx], name: val };
                                    return { ...prev, categories: newList };
                                  });
                                }} 
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'empresas' && (
                  <div className="dev-forms-container">
                    <h3>Gerenciar Empresas</h3>
                    {appData.companies.map((c, idx) => (
                      <div key={idx} className={`dev-accordion-item ${openCompanyIndex === idx ? 'open' : ''}`}>
                        <div className="dev-accordion-header" onClick={() => setOpenCompanyIndex(openCompanyIndex === idx ? null : idx)}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            {c.logo ? <img src={c.logo} style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }} alt="" referrerPolicy="no-referrer" /> : 'üè¢'}
                            <div style={{ textAlign: 'left' }}>
                              <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{c.name || 'Nova Empresa'}</div>
                              <div style={{ fontSize: '11px', color: '#888' }}>{c.category}</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button 
                              className="dev-btn" 
                              style={{ 
                                padding: '5px 8px', 
                                background: c.active !== false ? '#25D366' : '#333', 
                                border: '1px solid #444', 
                                fontSize: '0.65rem', 
                                fontWeight: 800,
                                borderRadius: '6px'
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                const newList = [...appData.companies];
                                newList[idx] = { ...c, active: c.active === false ? true : false };
                                updateData('companies', newList);
                              }}
                              title={c.active !== false ? "An√∫ncio Ativo (Clique para Ocultar)" : "An√∫ncio Oculto (Clique para Ativar)"}
                            >
                              {c.active !== false ? 'üëÅÔ∏è ATIVO' : 'üôà OCULTO'}
                            </button>
                            <button className="dev-remove-btn" style={{ position: 'static', padding: '5px' }} onClick={(e) => { e.stopPropagation(); updateData('companies', appData.companies.filter((_, i) => i !== idx)); }}>‚úï</button>
                            <span>{openCompanyIndex === idx ? '‚ñ≤' : '‚ñº'}</span>
                          </div>
                        </div>
                        
                        <AnimatePresence>
                          {openCompanyIndex === idx && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              style={{ overflow: 'hidden' }}
                            >
                              <div style={{ padding: '20px', borderTop: '1px solid #222' }}>
                                <div className="dev-grid-2">
                                  <div className="dev-form-group">
                                    <label>Nome</label>
                                    <input type="text" className="dev-input" value={c.name} onChange={(e) => {
                                      const val = e.target.value;
                                      setAppData(prev => {
                                        if (!prev) return prev;
                                        const newList = [...prev.companies];
                                        newList[idx] = { ...newList[idx], name: val };
                                        return { ...prev, companies: newList };
                                      });
                                    }} />
                                  </div>
                                  <div className="dev-form-group">
                                    <label>Categoria</label>
                                    <select 
                                      className="dev-input" 
                                      value={(appData?.categories || []).some((cat: any) => cat.name === c.category) ? c.category : "__custom__"} 
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setAppData(prev => {
                                          if (!prev) return prev;
                                          const newList = [...prev.companies];
                                          newList[idx] = { ...newList[idx], category: val === "__custom__" ? "" : val };
                                          return { ...prev, companies: newList };
                                        });
                                      }}
                                    >
                                      {(appData?.categories || []).map(cat => (
                                        <option key={cat.name} value={cat.name}>{cat.name}</option>
                                      ))}
                                      <option value="__custom__">‚úçÔ∏è Outro (Digitar nicho personalizado...)</option>
                                    </select>

                                    {! (appData?.categories || []).some((cat: any) => cat.name === c.category) && (
                                      <div className="dev-form-group" style={{ marginTop: '8px' }}>
                                        <label style={{ color: 'var(--primary)', fontSize: '11px' }}>Escreva o Nome do Nicho *</label>
                                        <input 
                                          type="text" 
                                          className="dev-input" 
                                          value={c.category} 
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            setAppData(prev => {
                                              if (!prev) return prev;
                                              const newList = [...prev.companies];
                                              newList[idx] = { ...newList[idx], category: val };
                                              return { ...prev, companies: newList };
                                            });
                                          }} 
                                          placeholder="Ex: Pizzaria, Fretes..."
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="dev-form-group">
                                  <label>Descri√ß√£o da Empresa</label>
                                  <textarea 
                                    className="dev-input" 
                                    style={{ minHeight: '80px', resize: 'vertical' }}
                                    value={c.desc} 
                                    onChange={(e) => {
                                      const newList = [...appData.companies];
                                      newList[idx].desc = e.target.value;
                                      updateData('companies', newList);
                                    }} 
                                  />
                                </div>
                                <div className="dev-form-group">
                                  <div className="dev-label-row">
                                    <label>Link da Logo (URL)</label>
                                    <DevFileUploadButton 
                                      label="üì∑ Enviar Foto do Celular" 
                                      onUploadSuccess={(url) => {
                                        const newList = [...appData.companies];
                                        newList[idx].logo = url;
                                        updateData('companies', newList);
                                      }} 
                                    />
                                  </div>
                                  <input type="text" className="dev-input" value={c.logo} onChange={(e) => {
                                    const newList = [...appData.companies];
                                    newList[idx].logo = e.target.value;
                                    updateData('companies', newList);
                                  }} placeholder="Cole a URL ou envie do celular acima" />
                                  {c.logo && <img src={c.logo} className="dev-img-preview" alt="Preview da Logo" referrerPolicy="no-referrer" />}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '15px' }}>
                                  <div className="dev-form-group" style={{ margin: 0 }}>
                                    <label>Link do Instagram</label>
                                    <input type="text" className="dev-input" value={c.ig} onChange={(e) => {
                                      const val = e.target.value;
                                      setAppData(prev => {
                                        if (!prev) return prev;
                                        const newList = [...prev.companies];
                                        newList[idx] = { ...newList[idx], ig: val };
                                        return { ...prev, companies: newList };
                                      });
                                    }} placeholder="Opcional" />
                                  </div>
                                  <div className="dev-form-group" style={{ margin: 0 }}>
                                    <label>Link do Site</label>
                                    <input type="text" className="dev-input" value={c.website} onChange={(e) => {
                                      const val = e.target.value;
                                      setAppData(prev => {
                                        if (!prev) return prev;
                                        const newList = [...prev.companies];
                                        newList[idx] = { ...newList[idx], website: val };
                                        return { ...prev, companies: newList };
                                      });
                                    }} placeholder="Opcional" />
                                  </div>
                                  <div className="dev-form-group" style={{ margin: 0 }}>
                                    <label>Link do Facebook</label>
                                    <input type="text" className="dev-input" value={c.fb || ''} onChange={(e) => {
                                      const val = e.target.value;
                                      setAppData(prev => {
                                        if (!prev) return prev;
                                        const newList = [...prev.companies];
                                        newList[idx] = { ...newList[idx], fb: val };
                                        return { ...prev, companies: newList };
                                      });
                                    }} placeholder="Opcional" />
                                  </div>
                                </div>

                                <div className="dev-grid-2">
                                  <div className="dev-form-group">
                                    <label>Estado (UF)</label>
                                    <select 
                                      className="dev-input" 
                                      value={c.state || c.uf || ''} 
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        const newList = [...appData.companies];
                                        newList[idx] = { ...newList[idx], state: val.toUpperCase(), uf: val.toUpperCase() };
                                        updateData('companies', newList);
                                      }}
                                    >
                                      <option value="">Selecione o Estado</option>
                                      {BRAZIL_STATES.map(st => (
                                        <option key={st.uf} value={st.uf}>{st.uf} - {st.name}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="dev-form-group">
                                    <label>Cidade</label>
                                    <input 
                                      type="text" 
                                      className="dev-input" 
                                      value={c.city || ''} 
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        const newList = [...appData.companies];
                                        newList[idx] = { ...newList[idx], city: val };
                                        updateData('companies', newList);
                                      }} 
                                      placeholder="Ex: Fortaleza, S√£o Paulo..." 
                                    />
                                  </div>
                                </div>

                                <div className="dev-grid-2">
                                  <div className="dev-form-group">
                                    <label>WhatsApp (Contato)</label>
                                    <input type="text" className="dev-input" value={c.wa} onChange={(e) => {
                                      const digits = e.target.value.replace(/\D/g, '');
                                      const newList = [...appData.companies];
                                      newList[idx].wa = digits;
                                      updateData('companies', newList);
                                    }} placeholder="Ex: 95991263666" />
                                    <small style={{ color: '#888', fontSize: '0.7rem' }}>Apenas n√∫meros (DDD + n√∫mero)</small>
                                  </div>
                                  <div className="dev-form-group">
                                    <label>Destaque?</label>
                                    <select className="dev-input" value={c.featured ? 'sim' : 'nao'} onChange={(e) => {
                                      const newList = [...appData.companies];
                                      newList[idx].featured = e.target.value === 'sim';
                                      updateData('companies', newList);
                                    }}>
                                      <option value="sim">Sim</option>
                                      <option value="nao">N√£o</option>
                                    </select>
                                  </div>
                                </div>

                                <div className="dev-grid-2" style={{ marginTop: '15px' }}>
                                  <div className="dev-form-group">
                                    <label>Exibir Bot√£o de Site / Mini-Site / Cat√°logo?</label>
                                    <select className="dev-input" value={c.hideMiniSite ? 'sim' : 'nao'} onChange={(e) => {
                                      const newList = [...appData.companies];
                                      newList[idx].hideMiniSite = e.target.value === 'sim';
                                      updateData('companies', newList);
                                    }}>
                                      <option value="nao">Exibir Bot√£o (Se tiver site ou cat√°logo) üëÅÔ∏è</option>
                                      <option value="sim">Ocultar Bot√£o (Apenas Bot√£o de WhatsApp) üôà</option>
                                    </select>
                                    <small style={{ color: '#aaa', fontSize: '0.7rem' }}>Se escolher ocultar, os bot√µes "Ver Mini-site" ou "Visitar Site" sumir√£o no card, mantendo foco puro no WhatsApp.</small>
                                    
                                    <label style={{ marginTop: '15px' }}>A√ß√£o do Bot√£o Principal (Site)</label>
                                    <select className="dev-input" value={c.primaryButtonAction || 'minisite'} onChange={(e) => {
                                      const val = e.target.value;
                                      setAppData(prev => {
                                        if (!prev) return prev;
                                        const newList = [...prev.companies];
                                        newList[idx] = { ...newList[idx], primaryButtonAction: val };
                                        return { ...prev, companies: newList };
                                      });
                                    }}>
                                      <option value="minisite">Abrir Mini-Site / Cat√°logo Interno üì≤</option>
                                      <option value="site">Abrir Site Oficial Externo (Website) üåê</option>
                                      <option value="instagram">Instagram Comercial üì∏</option>
                                      <option value="facebook">P√°gina do Facebook üë•</option>
                                    </select>

                                    <label style={{ marginTop: '10px' }}>Texto Personalizado do Bot√£o</label>
                                    <input 
                                      type="text" 
                                      className="dev-input" 
                                      value={c.primaryButtonText || ''} 
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setAppData(prev => {
                                          if (!prev) return prev;
                                          const newList = [...prev.companies];
                                          newList[idx] = { ...newList[idx], primaryButtonText: val };
                                          return { ...prev, companies: newList };
                                        });
                                      }} 
                                      placeholder="Ex: Abrir Instagram, Visitar Loja (Vazio = Padr√£o)" 
                                    />
                                  </div>
                                  <div className="dev-form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'rgba(251, 191, 36, 0.05)', border: '1px dashed rgba(251, 191, 36, 0.15)', borderRadius: '12px', padding: '12px', marginTop: '12px' }}>
                                    <span style={{ fontSize: '11px', color: '#fbbf24', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                                      üí° Convers√£o M√°xima
                                    </span>
                                    <p style={{ color: '#aaa', fontSize: '10.5px', lineHeight: '1.4', margin: 0 }}>
                                      Dica: Ocultando o mini-site, toda a aten√ß√£o do visitante do portal ser√° voltada para mandar mensagem direta e fechar neg√≥cio no WhatsApp!
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                    <button className="dev-add-btn" onClick={() => {
                      const newIdx = appData.companies.length;
                      updateData('companies', [...appData.companies, { id: Date.now(), name: "Nova Empresa", category: "Geral", desc: "Descri√ß√£o aqui", logo: "", wa: "", ig: "", website: "", featured: false }]);
                      setOpenCompanyIndex(newIdx);
                    }}>+ Adicionar Empresa</button>
                  </div>
                )}

                {activeTab === 'anunciantes' && (
                  <div className="dev-forms-container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', gap: '10px', flexWrap: 'wrap' }}>
                      <h3 style={{ margin: 0 }}>Gerenciamento de Anunciantes Cadastrados</h3>
                      <button 
                        className="dev-btn" 
                        style={{ background: 'var(--primary)', color: 'black', border: 'none', padding: '8px 14px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px' }}
                        onClick={async () => {
                          setIsAdLoading(true);
                          await fetchAdvertisers(tenantId || 'fortaleza');
                          setIsAdLoading(false);
                          alert("Lista de anunciantes atualizada!");
                        }}
                      >
                        üîÑ Atualizar Lista
                      </button>
                    </div>
                    <p style={{ color: '#aaa', fontSize: '12px', marginBottom: '20px' }}>
                      Aqui voc√™ controla quais anunciantes criaram conta no portal e ativa o <strong>Destaque</strong> ou <strong>Plano VIP</strong> (que concede produtos ilimitados) para eles.
                    </p>
                    
                    {isAdLoading ? (
                      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--primary)' }}>Carregando anunciantes...</div>
                    ) : advertiserCompanies.length === 0 ? (
                      <div className="text-center py-8" style={{ border: '1px dashed rgba(255,255,255,0.15)', borderRadius: '15px', color: '#999', padding: '30px' }}>
                        Nenhum anunciante cadastrado por conta pr√≥pria nesta cidade ainda.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {advertiserCompanies.map((ad: any, idx: number) => {
                          const itemsCount = ad.items?.length || 0;
                          return (
                            <div key={ad.id || idx} style={{ background: '#11111a', padding: '18px', borderRadius: '16px', border: ad.hasPlan ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                                  <div style={{ width: '48px', height: '48px', borderRadius: '10px', overflow: 'hidden', background: '#222', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <img src={ad.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150'} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  </div>
                                  <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                      <h4 style={{ margin: 0, fontWeight: 900, fontSize: '14px', color: '#fff' }}>{ad.name}</h4>
                                      {ad.isBlocked && (
                                        <span style={{ color: '#fff', background: '#ef4444', fontSize: '9px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                                          üö´ Bloqueado
                                        </span>
                                      )}
                                    </div>
                                    <small style={{ color: '#aaa', fontSize: '11px', display: 'block', marginTop: '2px' }}>
                                      Email: <span style={{ color: '#fff' }}>{ad.email}</span> | Celular / WhatsApp: <span style={{ color: '#fff' }}>{ad.wa}</span>
                                    </small>
                                    <span style={{ color: 'var(--primary)', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', background: 'rgba(251,191,36,0.1)', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '4px' }}>
                                      {ad.category} | {ad.type || 'Geral'}
                                    </span>
                                  </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                  <button 
                                    className="dev-btn"
                                    style={{ background: 'var(--primary)', color: 'black', border: 'none', fontSize: '11px', padding: '6px 12px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}
                                    onClick={() => {
                                      const { email, password, expiresAt, createdAt, isBlocked, isAdvertiserCreated, ...companyData } = ad;
                                      const reconstructed = {
                                        id: ad.id,
                                        email: email,
                                        password: password || '123456',
                                        tenantId: slugify(tenantId || 'fortaleza'),
                                        expiresAt: expiresAt || '',
                                        createdAt: createdAt || '',
                                        isBlocked: isBlocked || false,
                                        isAdvertiserCreated: isAdvertiserCreated,
                                        company: {
                                          ...companyData,
                                          id: companyData.id || ad.id,
                                          items: companyData.items || []
                                        }
                                      };
                                      setCurrentAdvertiser(reconstructed);
                                      setIsAdPortalOpen(true);
                                      alert(`Entrando no painel de "${ad.name}" como Administrador. Voc√™ pode fazer altera√ß√µes no perfil, cat√°logo e produtos!`);
                                    }}
                                  >
                                    üëÅÔ∏è Ver / Editar Loja
                                  </button>

                                  <button 
                                    className="dev-btn"
                                    style={{ background: ad.isBlocked ? '#10b981' : '#f97316', border: 'none', color: '#fff', fontSize: '11px', padding: '6px 12px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}
                                    onClick={async () => {
                                      const newBlockedStatus = !ad.isBlocked;
                                      if (confirm(`Deseja realmente ${newBlockedStatus ? 'BLOQUEAR' : 'DESBLOQUEAR'} o anunciante "${ad.name}"?`)) {
                                        setIsAdLoading(true);
                                        try {
                                          const docRef = doc(db, 'advertisers', ad.id);
                                          await setDoc(docRef, {
                                            email: ad.email,
                                            password: ad.password || '123456',
                                            tenantId: slugify(tenantId || 'fortaleza'),
                                            expiresAt: ad.expiresAt || '',
                                            createdAt: ad.createdAt || '',
                                            isBlocked: newBlockedStatus,
                                            company: {
                                              ...ad,
                                              isBlocked: newBlockedStatus,
                                              expiresAt: ad.expiresAt || '',
                                              createdAt: ad.createdAt || ''
                                            }
                                          });
                                          await fetchAdvertisers(tenantId || 'fortaleza');
                                          alert(`Anunciante "${ad.name}" ${newBlockedStatus ? 'bloqueado' : 'desbloqueado'} com sucesso!`);
                                        } catch(ee) {
                                          console.error(ee);
                                          alert("Falha ao alterar status de bloqueio.");
                                        } finally {
                                          setIsAdLoading(false);
                                        }
                                      }
                                    }}
                                  >
                                    {ad.isBlocked ? 'üîì Desbloquear' : 'üö´ Bloquear'}
                                  </button>

                                  <button 
                                    className="dev-btn"
                                    style={{ background: '#ff4444', border: 'none', color: '#fff', fontSize: '11px', padding: '6px 12px', cursor: 'pointer' }}
                                    onClick={async () => {
                                      if (confirm(`Tem certeza que deseja EXCLUIR o anunciante "${ad.name}" permanentemente? This will clear all their items too.`)) {
                                        setIsAdLoading(true);
                                        try {
                                          await deleteDoc(doc(db, 'advertisers', ad.id));
                                          await fetchAdvertisers(tenantId || 'fortaleza');
                                          alert("Anunciante exclu√≠do com sucesso!");
                                        } catch(e) {
                                          console.error("Erro deletando anunciante:", e);
                                          alert("Erro ao excluir.");
                                        } finally {
                                          setIsAdLoading(false);
                                        }
                                      }
                                    }}
                                  >
                                    üóëÔ∏è Excluir Conta
                                  </button>
                                </div>
                              </div>
                              
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed rgba(255, 255, 255, 0.05)' }}>
                                <div className="dev-form-group" style={{ margin: 0 }}>
                                  <label style={{ fontSize: '11px', color: '#bbb', display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>N√≠vel do Plano:</label>
                                  <select 
                                    className="dev-input" 
                                    style={{ padding: '8px', fontSize: '12px', background: '#12131a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                                    value={getCompanyPlanType(ad)} 
                                    onChange={async (e) => {
                                      const newType = e.target.value as 'gratuito' | 'verificado' | 'destaque' | 'patrocinado';
                                      setIsAdLoading(true);
                                      try {
                                        const docRef = doc(db, 'advertisers', ad.id);
                                        await setDoc(docRef, {
                                          email: ad.email,
                                          password: ad.password || '123456',
                                          tenantId: slugify(tenantId || 'fortaleza'),
                                          expiresAt: ad.expiresAt || '',
                                          createdAt: ad.createdAt || '',
                                          company: {
                                            ...ad,
                                            tipoPlano: newType,
                                            hasPlan: newType !== 'gratuito',
                                            verificado: newType === 'verificado',
                                            destaque: newType === 'destaque',
                                            featured: newType === 'destaque' || newType === 'patrocinado',
                                            patrocinado: newType === 'patrocinado',
                                            expiresAt: ad.expiresAt || '',
                                            createdAt: ad.createdAt || ''
                                          }
                                        });
                                        await fetchAdvertisers(tenantId || 'fortaleza');
                                        alert(`Plano do anunciante "${ad.name}" alterado para ${newType.toUpperCase()}!`);
                                      } catch(ee) {
                                        console.error(ee);
                                        alert("Falha ao salvar plano.");
                                      } finally {
                                        setIsAdLoading(false);
                                      }
                                    }}
                                  >
                                    <option value="gratuito">‚ö™ Plano Essencial (Sem Destaque)</option>
                                    <option value="verificado">‚úî Verificado (Selo de Confian√ßa)</option>
                                    <option value="destaque">‚≠ê Destaque VIP (Selo Estelar)</option>
                                    <option value="patrocinado">üî• Patrocinado (Top 1¬∫ Lugar + Borda Dourada)</option>
                                  </select>
                                </div>

                                <div className="dev-form-group" style={{ margin: 0 }}>
                                  <label style={{ fontSize: '11px', color: '#bbb', display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Prioridade na Busca (0-100):</label>
                                  <input 
                                    type="number" 
                                    min="0"
                                    max="100"
                                    className="dev-input" 
                                    style={{ padding: '7px 8px', fontSize: '12px', background: '#12131a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px', width: '100%', outline: 'none' }}
                                    value={ad.prioridade || 0}
                                    onChange={async (e) => {
                                      const pVal = Number(e.target.value) || 0;
                                      setIsAdLoading(true);
                                      try {
                                        const docRef = doc(db, 'advertisers', ad.id);
                                        await setDoc(docRef, {
                                          email: ad.email,
                                          password: ad.password || '123456',
                                          tenantId: slugify(tenantId || 'fortaleza'),
                                          expiresAt: ad.expiresAt || '',
                                          createdAt: ad.createdAt || '',
                                          company: {
                                            ...ad,
                                            prioridade: pVal,
                                            expiresAt: ad.expiresAt || '',
                                            createdAt: ad.createdAt || ''
                                          }
                                        });
                                        await fetchAdvertisers(tenantId || 'fortaleza');
                                      } catch(ee) {
                                        console.error(ee);
                                      } finally {
                                        setIsAdLoading(false);
                                      }
                                    }}
                                  />
                                </div>

                                <div className="dev-form-group" style={{ margin: 0 }}>
                                  <label style={{ fontSize: '11px', color: '#bbb', display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Posi√ß√£o na Categoria (1¬∫, 2¬∫, 3¬∫ lugar):</label>
                                  <select 
                                    className="dev-input" 
                                    style={{ padding: '8px', fontSize: '12px', background: '#12131a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                                    value={ad.posicaoCategoria || ad.posicaoFixa || 0}
                                    onChange={async (e) => {
                                      const posVal = Number(e.target.value) || 0;
                                      setIsAdLoading(true);
                                      try {
                                        const docRef = doc(db, 'advertisers', ad.id);
                                        await setDoc(docRef, {
                                          email: ad.email,
                                          password: ad.password || '123456',
                                          tenantId: slugify(tenantId || 'fortaleza'),
                                          expiresAt: ad.expiresAt || '',
                                          createdAt: ad.createdAt || '',
                                          company: {
                                            ...ad,
                                            posicaoCategoria: posVal,
                                            posicaoFixa: posVal,
                                            expiresAt: ad.expiresAt || '',
                                            createdAt: ad.createdAt || ''
                                          }
                                        });
                                        await fetchAdvertisers(tenantId || 'fortaleza');
                                        alert(`Posi√ß√£o na categoria alterada para ${posVal === 0 ? 'Autom√°tica' : posVal + '¬∫ Lugar'}!`);
                                      } catch(ee) {
                                        console.error(ee);
                                      } finally {
                                        setIsAdLoading(false);
                                      }
                                    }}
                                  >
                                    <option value={0}>Autom√°tica (Por Pontua√ß√£o/Visualiza√ß√µes)</option>
                                    <option value={1}>ü•á 1¬∫ Lugar na Categoria (Exclusivo)</option>
                                    <option value={2}>ü•à 2¬∫ Lugar na Categoria</option>
                                    <option value={3}>ü•â 3¬∫ Lugar na Categoria</option>
                                  </select>
                                </div>

                                <div className="dev-form-group" style={{ margin: 0 }}>
                                  <label style={{ fontSize: '11px', color: '#bbb', display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Posi√ß√£o Fixa no Topo:</label>
                                  <select 
                                    className="dev-input" 
                                    style={{ padding: '8px', fontSize: '12px', background: '#12131a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                                    value={ad.posicaoFixa || 0} 
                                    onChange={async (e) => {
                                      const posVal = Number(e.target.value) || 0;
                                      setIsAdLoading(true);
                                      try {
                                        const docRef = doc(db, 'advertisers', ad.id);
                                        await setDoc(docRef, {
                                          email: ad.email,
                                          password: ad.password || '123456',
                                          tenantId: slugify(tenantId || 'fortaleza'),
                                          expiresAt: ad.expiresAt || '',
                                          createdAt: ad.createdAt || '',
                                          company: {
                                            ...ad,
                                            posicaoFixa: posVal,
                                            expiresAt: ad.expiresAt || '',
                                            createdAt: ad.createdAt || ''
                                          }
                                        });
                                        await fetchAdvertisers(tenantId || 'fortaleza');
                                        alert(`Posi√ß√£o fixa de "${ad.name}" alterada para ${posVal === 0 ? 'Ordem Padr√£o' : `${posVal}¬∫ Lugar`}`);
                                      } catch(ee) {
                                        console.error(ee);
                                      } finally {
                                        setIsAdLoading(false);
                                      }
                                    }}
                                  >
                                    <option value={0}>0 - Ordem por Prioridade/Plano</option>
                                    <option value={1}>ü•á 1¬∫ Lugar Absoluto</option>
                                    <option value={2}>ü•à 2¬∫ Lugar Absoluto</option>
                                    <option value={3}>ü•â 3¬∫ Lugar Absoluto</option>
                                  </select>
                                </div>

                                <div className="dev-form-group" style={{ margin: 0 }}>
                                  <label style={{ fontSize: '11px', color: '#bbb', display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Validade da Assinatura VIP:</label>
                                  <input 
                                    type="date" 
                                    className="dev-input" 
                                    style={{ padding: '7px 8px', fontSize: '12px', background: '#12131a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px', width: '100%', outline: 'none' }}
                                    value={ad.expiresAt || ''}
                                    onChange={async (e) => {
                                      const newExpiryStr = e.target.value;
                                      setIsAdLoading(true);
                                      try {
                                        const docRef = doc(db, 'advertisers', ad.id);
                                        await setDoc(docRef, {
                                          email: ad.email,
                                          password: ad.password || '123456',
                                          tenantId: slugify(tenantId || 'fortaleza'),
                                          expiresAt: newExpiryStr,
                                          createdAt: ad.createdAt || '',
                                          company: {
                                            ...ad,
                                            expiresAt: newExpiryStr,
                                            createdAt: ad.createdAt || ''
                                          }
                                        });
                                        await fetchAdvertisers(tenantId || 'fortaleza');
                                        alert(`Data de expira√ß√£o de "${ad.name}" atualizada para ${newExpiryStr}!`);
                                      } catch(ee) {
                                        console.error(ee);
                                        alert("Falha ao salvar data de expira√ß√£o.");
                                      } finally {
                                        setIsAdLoading(false);
                                      }
                                    }}
                                  />
                                  <small style={{ color: (ad.expiresAt && ad.expiresAt < new Date().toISOString().split('T')[0] && !ad.hasPlan) ? '#ff4444' : '#888', fontSize: '10px', marginTop: '4px', display: 'block' }}>
                                    {ad.hasPlan ? 'Plano Ativo (VIP)' : ad.expiresAt ? (ad.expiresAt < new Date().toISOString().split('T')[0] ? '‚ùå Expirado' : `‚è±Ô∏è Expira em ${ad.expiresAt}`) : 'Sem data de expira√ß√£o'}
                                  </small>
                                  <div style={{ marginTop: '6px' }}>
                                    <button
                                      type="button"
                                      className="dev-btn"
                                      style={{ background: 'rgba(37,211,102,0.15)', border: '1px solid #25D366', color: '#25D366', fontSize: '10px', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', width: '100%', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                                      onClick={async () => {
                                        const calculateRenewalDate = (currentExpiry: string) => {
                                          const today = new Date();
                                          let baseDate = today;
                                          if (currentExpiry) {
                                            const parseExpiry = new Date(currentExpiry + 'T12:00:00');
                                            if (parseExpiry > today) {
                                              baseDate = parseExpiry;
                                            }
                                          }
                                          baseDate.setDate(baseDate.getDate() + 30);
                                          return baseDate.toISOString().split('T')[0];
                                        };
                                        const newExpiryStr = calculateRenewalDate(ad.expiresAt || '');
                                        setIsAdLoading(true);
                                        try {
                                          const docRef = doc(db, 'advertisers', ad.id);
                                          await setDoc(docRef, {
                                            email: ad.email,
                                            password: ad.password || '123456',
                                            tenantId: slugify(tenantId || 'fortaleza'),
                                            expiresAt: newExpiryStr,
                                            createdAt: ad.createdAt || '',
                                            isBlocked: ad.isBlocked || false,
                                            company: {
                                              ...ad,
                                              expiresAt: newExpiryStr,
                                              createdAt: ad.createdAt || '',
                                              isBlocked: ad.isBlocked || false
                                            }
                                          });
                                          await fetchAdvertisers(tenantId || 'fortaleza');
                                          alert(`Plano de "${ad.name}" renovado por +30 dias! Nova expira√ß√£o: ${newExpiryStr.split('-').reverse().join('/')}`);
                                        } catch(ee) {
                                          console.error(ee);
                                          alert("Falha ao renovar o plano.");
                                        } finally {
                                          setIsAdLoading(false);
                                        }
                                      }}
                                    >
                                      ‚ö° Renovar +30 Dias (Sem Data)
                                    </button>
                                  </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: '5px' }}>
                                  <span style={{ fontSize: '12px', color: '#fff' }}>
                                    Produtos: <strong style={{ color: ad.hasPlan ? 'var(--primary)' : '#25D366' }}>{itemsCount}</strong> {(!ad.hasPlan && itemsCount >= 6 && (!ad.expiresAt || ad.expiresAt < new Date().toISOString().split('T')[0])) ? '‚ö†Ô∏è' : '‚úÖ'}
                                  </span>
                                  <small style={{ color: ad.hasPlan ? 'var(--primary)' : '#34d399', fontSize: '10.5px', marginTop: '2px' }}>
                                    {ad.hasPlan 
                                      ? 'Plano Premium VIP (Ativo)' 
                                      : 'An√∫ncio Essencial (Ativo)'
                                    }
                                  </small>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'v√≠deos' && (
                  <div className="dev-forms-container">
                    <div style={{ background: 'rgba(255, 138, 0, 0.1)', border: '1px solid rgba(255, 138, 0, 0.2)', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
                      <h4 style={{ color: '#ff8a00', margin: 0, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        ‚ö†Ô∏è √ÅREA EXCLUSIVA DO ADMINISTRADOR
                      </h4>
                      <p style={{ margin: '5px 0 0 0', fontSize: '11px', color: '#aaa' }}>
                        Esta aba e os links abaixo s√£o vis√≠veis apenas para voc√™. O cliente n√£o tem acesso a esta configura√ß√£o no painel dele.
                      </p>
                    </div>
                    <h3>V√≠deos da TV (Links MP4)</h3>
                    {appData.videos.map((vRaw, idx) => {
                      const v = typeof vRaw === 'string' ? { url: vRaw, active: true } : vRaw;
                      return (
                        <div key={idx} className="dev-item-card" style={{ opacity: v.active !== false ? 1 : 0.6 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                              <span style={{ fontSize: '10px', fontWeight: 900, color: '#ff8a00' }}>V√çDEO #{idx + 1}</span>
                              <button 
                                className="dev-btn" 
                                style={{ 
                                  padding: '4px 8px', 
                                  background: v.active !== false ? '#25D366' : '#333', 
                                  border: '1px solid #444', 
                                  fontSize: '0.6rem', 
                                  fontWeight: 800,
                                  borderRadius: '5px',
                                  height: 'auto'
                                }}
                                onClick={() => {
                                  const newList = [...appData.videos];
                                  newList[idx] = { ...v, active: v.active === false ? true : false };
                                  updateData('videos', newList);
                                }}
                              >
                                {v.active !== false ? 'üëÅÔ∏è ATIVO' : 'üôà OCULTO'}
                              </button>
                            </div>
                            <button className="dev-remove-btn" style={{ position: 'static' }} onClick={() => updateData('videos', appData.videos.filter((_, i) => i !== idx))}>‚úï</button>
                          </div>
                          <div className="dev-form-group">
                            <div className="dev-label-row">
                              <label>Link do V√≠deo MP4</label>
                              <a href="https://archive.org/" target="_blank" rel="noreferrer" className="dev-helper-link">
                                üé• Abrir Archive.org
                              </a>
                            </div>
                            <div style={{ display: 'flex', gap: '15px', flexDirection: 'row-reverse', flexWrap: 'wrap-reverse', alignItems: 'center' }}>
                              <div style={{ flex: '1 1 250px' }}>
                                <input type="text" className="dev-input" style={{ width: '100%' }} value={v.url} onChange={(e) => {
                                  const newList = [...appData.videos];
                                  newList[idx] = { ...v, url: e.target.value };
                                  updateData('videos', newList);
                                }} placeholder="Cole o link direto .mp4 aqui" />
                                <small style={{ color: '#888', fontSize: '0.65rem', marginTop: '5px', display: 'block' }}>
                                  Ao desativar, o v√≠deo √© mantido no banco mas n√£o aparece na TV do site.
                                </small>
                              </div>
                              {v.url && (
                                <div style={{ width: '120px', height: '70px', borderRadius: '8px', overflow: 'hidden', background: '#000', flexShrink: 0, border: '1px solid #333' }}>
                                  <video 
                                    src={v.url} 
                                    muted 
                                    playsInline 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                    onMouseOver={e => (e.target as HTMLVideoElement).play()}
                                    onMouseOut={e => {
                                      const vid = (e.target as HTMLVideoElement);
                                      vid.pause();
                                      vid.currentTime = 0;
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <button className="dev-add-btn" onClick={() => updateData('videos', [...appData.videos, ""])}>+ Adicionar V√≠deo</button>
                  </div>
                )}

                {activeTab === 'flyers' && (
                  <div className="dev-forms-container">
                    <h3>Flyers de Promo√ß√£o (Imagens e Links)</h3>
                    {appData.flyers.map((f: any, idx) => {
                      const flyerObj = typeof f === 'string' ? { image: f, link: '', active: true } : f;
                      return (
                        <div key={idx} className="dev-item-card" style={{ opacity: flyerObj.active !== false ? 1 : 0.6 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                             <button 
                              className="dev-btn" 
                              style={{ 
                                padding: '4px 8px', 
                                background: flyerObj.active !== false ? '#25D366' : '#333', 
                                border: '1px solid #444', 
                                fontSize: '0.6rem', 
                                fontWeight: 800,
                                borderRadius: '5px',
                                height: 'auto'
                              }}
                              onClick={() => {
                                const newList = [...appData.flyers];
                                newList[idx] = { ...flyerObj, active: flyerObj.active === false ? true : false };
                                updateData('flyers', newList);
                              }}
                            >
                              {flyerObj.active !== false ? 'üëÅÔ∏è ATIVO' : 'üôà OCULTO'}
                            </button>
                            <button className="dev-remove-btn" style={{ position: 'static' }} onClick={() => updateData('flyers', appData.flyers.filter((_, i) => i !== idx))}>‚úï</button>
                          </div>
                          <div className="dev-grid-2">
                            <div className="dev-form-group">
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                                <label style={{ marginBottom: '0' }}>Link da Imagem Flyer</label>
                                <DevFileUploadButton 
                                  label="üì∑ Enviar Foto do Celular" 
                                  onUploadSuccess={(url) => {
                                    const newList = [...appData.flyers];
                                    if (typeof newList[idx] === 'string') {
                                      newList[idx] = { image: url, link: '' };
                                    } else {
                                      newList[idx] = { ...newList[idx], image: url };
                                    }
                                    updateData('flyers', newList);
                                  }} 
                                />
                              </div>
                              <input type="text" className="dev-input" value={flyerObj.image || ''} onChange={(e) => {
                                const newList = [...appData.flyers];
                                if (typeof newList[idx] === 'string') {
                                  newList[idx] = { image: e.target.value, link: '' };
                                } else {
                                  newList[idx] = { ...newList[idx], image: e.target.value };
                                }
                                updateData('flyers', newList);
                              }} placeholder="Cole a URL ou envie do celular acima" />
                            </div>
                            <div className="dev-form-group">
                              <label>Link de A√ß√£o (WhatsApp/IG/Site)</label>
                              <div style={{ position: 'relative' }}>
                                <input type="text" className="dev-input" value={flyerObj.link || ''} onChange={(e) => {
                                  const newList = [...appData.flyers];
                                  if (typeof newList[idx] === 'string') {
                                    newList[idx] = { image: newList[idx] as any, link: e.target.value };
                                  } else {
                                    newList[idx] = { ...newList[idx], link: e.target.value };
                                  }
                                  updateData('flyers', newList);
                                }} placeholder="Ex: 95991263666 ou https://..." />
                                
                                {flyerObj.link && !flyerObj.link.startsWith('http') && flyerObj.link.replace(/\D/g, '').length >= 10 && (
                                  <button 
                                    className="dev-btn dev-btn-primary" 
                                    style={{ 
                                      position: 'absolute', 
                                      right: '5px', 
                                      top: '50%', 
                                      transform: 'translateY(-50%)',
                                      padding: '4px 10px',
                                      fontSize: '0.6rem',
                                      height: 'auto'
                                    }}
                                    onClick={() => {
                                      const digits = flyerObj.link.replace(/\D/g, '');
                                      const waLink = digits.length <= 11 ? `https://wa.me/55${digits}` : `https://wa.me/${digits}`;
                                      const newList = [...appData.flyers];
                                      if (typeof newList[idx] === 'string') {
                                        newList[idx] = { image: newList[idx] as any, link: waLink };
                                      } else {
                                        newList[idx] = { ...newList[idx], link: waLink };
                                      }
                                      updateData('flyers', newList);
                                    }}
                                  >
                                    Gerar Link Whats
                                  </button>
                                )}
                              </div>
                              <small style={{ color: '#888', fontSize: '0.7rem' }}>Cole o link ou apenas o n√∫mero (DDD + n√∫mero)</small>
                            </div>
                          </div>
                          {flyerObj.image && <img src={flyerObj.image} className="dev-img-preview" alt="Preview" style={{ marginTop: '10px' }} referrerPolicy="no-referrer" />}
                        </div>
                      );
                    })}
                    <button className="dev-add-btn" onClick={() => updateData('flyers', [...appData.flyers, { image: "", link: "" }])}>+ Adicionar Flyer</button>
                  </div>
                )}

                {activeTab === 'banners-horizontais' && (
                  <div className="dev-forms-container">
                    <h3>Banners Horizontais (PC, Tablet e Celular)</h3>
                    <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '-10px', marginBottom: '20px' }}>
                      Gerencie os banners horizontais (aspecto largo de outdoor, como os do Canva/Sal√£o Stephanny Jessie) exibidos abaixo das Promo√ß√µes da Semana.
                    </p>

                    {((appData as any).horizontalBanners || []).map((fb: any, idx: number) => {
                      const bannerObj = typeof fb === 'string' ? { image: fb, link: '', title: 'Banner sem t√≠tulo', active: true } : fb;
                      return (
                        <div key={idx} className="dev-item-card" style={{ opacity: bannerObj.active !== false ? 1 : 0.6 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                             <button 
                              type="button"
                              className="dev-btn" 
                              style={{ 
                                padding: '4px 8px', 
                                background: bannerObj.active !== false ? '#25D366' : '#333', 
                                border: '1px solid #444', 
                                fontSize: '0.6rem', 
                                fontWeight: 800,
                                borderRadius: '5px',
                                height: 'auto'
                              }}
                              onClick={() => {
                                const newList = [...((appData as any).horizontalBanners || [])];
                                newList[idx] = { ...bannerObj, active: bannerObj.active === false ? true : false };
                                updateData('horizontalBanners', newList);
                              }}
                            >
                              {bannerObj.active !== false ? 'üëÅÔ∏è ATIVO' : 'üôà OCULTO'}
                            </button>
                            <button type="button" className="dev-remove-btn" style={{ position: 'static' }} onClick={() => updateData('horizontalBanners', ((appData as any).horizontalBanners || []).filter((_: any, i: number) => i !== idx))}>‚úï</button>
                          </div>
                          
                          <div className="dev-form-group" style={{ marginBottom: '15px' }}>
                            <label>T√≠tulo ou Descri√ß√£o Curta (Aparece no Banner)</label>
                            <input 
                              type="text" 
                              className="dev-input" 
                              value={bannerObj.title || ''} 
                              onChange={(e) => {
                                const newList = [...((appData as any).horizontalBanners || [])];
                                newList[idx] = { ...bannerObj, title: e.target.value };
                                updateData('horizontalBanners', newList);
                              }} 
                              placeholder="Ex: Sal√£o Stephanny Jessie - Promo√ß√£o que real√ßa sua beleza!" 
                            />
                          </div>

                          <div className="dev-grid-2">
                            <div className="dev-form-group">
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                                <label style={{ marginBottom: '0' }}>Link da Imagem Horizontal</label>
                                <DevFileUploadButton 
                                  label="üì∑ Enviar Foto do Celular" 
                                  onUploadSuccess={(url) => {
                                    const newList = [...((appData as any).horizontalBanners || [])];
                                    newList[idx] = { ...bannerObj, image: url };
                                    updateData('horizontalBanners', newList);
                                  }} 
                                />
                              </div>
                              <input 
                                type="text" 
                                className="dev-input" 
                                value={bannerObj.image || ''} 
                                onChange={(e) => {
                                  const newList = [...((appData as any).horizontalBanners || [])];
                                  newList[idx] = { ...bannerObj, image: e.target.value };
                                  updateData('horizontalBanners', newList);
                                }} 
                                placeholder="Cole a URL ou envie do celular acima" 
                              />
                            </div>
                            
                            <div className="dev-form-group">
                              <label>Link de Clique (WhatsApp/Site ou Telefone)</label>
                              <div style={{ position: 'relative' }}>
                                <input 
                                  type="text" 
                                  className="dev-input" 
                                  value={bannerObj.link || ''} 
                                  onChange={(e) => {
                                    const newList = [...((appData as any).horizontalBanners || [])];
                                    newList[idx] = { ...bannerObj, link: e.target.value };
                                    updateData('horizontalBanners', newList);
                                  }} 
                                  placeholder="Ex: 85997147273 ou link completo" 
                                />
                                
                                {bannerObj.link && !bannerObj.link.startsWith('http') && bannerObj.link.replace(/\D/g, '').length >= 10 && (
                                  <button 
                                    type="button"
                                    className="dev-btn dev-btn-primary" 
                                    style={{ 
                                      position: 'absolute', 
                                      right: '5px', 
                                      top: '50%', 
                                      transform: 'translateY(-50%)',
                                      padding: '4px 10px',
                                      fontSize: '0.6rem',
                                      height: 'auto'
                                    }}
                                    onClick={() => {
                                      const digits = bannerObj.link.replace(/\D/g, '');
                                      const waLink = digits.length <= 11 ? `https://wa.me/55${digits}` : `https://wa.me/${digits}`;
                                      const newList = [...((appData as any).horizontalBanners || [])];
                                      newList[idx] = { ...bannerObj, link: waLink };
                                      updateData('horizontalBanners', newList);
                                    }}
                                  >
                                    Gerar Whats
                                  </button>
                                )}
                              </div>
                              <small style={{ color: '#888', fontSize: '0.7rem' }}>N√∫mero com DDD ou link completo de destino.</small>
                            </div>
                          </div>

                          {bannerObj.image && (
                            <div style={{ marginTop: '12px', border: '1px solid #222', borderRadius: '12px', overflow: 'hidden' }}>
                              <img src={bannerObj.image} className="w-full h-auto object-contain" alt="Preview Banner" style={{ maxHeight: '120px' }} referrerPolicy="no-referrer" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <button 
                      type="button"
                      className="dev-add-btn" 
                      onClick={() => {
                        const currentList = (appData as any).horizontalBanners || HORIZONTAL_BANNERS;
                        updateData('horizontalBanners', [...currentList, { image: "", link: "", title: "", active: true }]);
                      }}
                    >
                      + Adicionar Banner Horizontal
                    </button>
                  </div>
                )}

                {activeTab === 'depoimentos-whats' && (
                  <div className="dev-forms-container">
                    <h3>Depoimentos em Imagens (Prints do WhatsApp)</h3>
                    <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '-10px', marginBottom: '20px' }}>
                      Adicione prints de conversas de WhatsApp com elogios e depoimentos de parceiros para passarem no carrossel.
                    </p>
                    
                    {(appData.whatsappTestimonials || []).map((wt: any, idx: number) => {
                      const printObj = typeof wt === 'string' ? { image: wt, active: true } : wt;
                      return (
                        <div key={idx} className="dev-item-card" style={{ opacity: printObj.active !== false ? 1 : 0.6 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <button 
                              className="dev-btn" 
                              style={{ 
                                padding: '4px 8px', 
                                background: printObj.active !== false ? '#25D366' : '#333', 
                                border: '1px solid #444', 
                                fontSize: '0.6rem', 
                                fontWeight: 800,
                                borderRadius: '5px',
                                height: 'auto',
                                color: '#fff'
                              }}
                              onClick={() => {
                                const newList = [...(appData.whatsappTestimonials || [])];
                                newList[idx] = { ...printObj, active: printObj.active === false ? true : false };
                                updateData('whatsappTestimonials', newList);
                              }}
                            >
                              {printObj.active !== false ? 'üëÅÔ∏è ATIVO' : 'üôà OCULTO'}
                            </button>
                            <button 
                              className="dev-remove-btn" 
                              style={{ position: 'static' }} 
                              onClick={() => {
                                const newList = (appData.whatsappTestimonials || []).filter((_: any, i: number) => i !== idx);
                                updateData('whatsappTestimonials', newList);
                              }}
                            >
                              ‚úï
                            </button>
                          </div>
                          
                          <div className="dev-form-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                              <label style={{ marginBottom: '0' }}>Link da Imagem do Print</label>
                              <DevFileUploadButton 
                                label="üì∑ Enviar Print do Celular" 
                                onUploadSuccess={(url) => {
                                  const newList = [...(appData.whatsappTestimonials || [])];
                                  newList[idx] = { ...printObj, image: url };
                                  updateData('whatsappTestimonials', newList);
                                }} 
                              />
                            </div>
                            <input 
                              type="text" 
                              className="dev-input" 
                              value={printObj.image || ''} 
                              onChange={(e) => {
                                const newList = [...(appData.whatsappTestimonials || [])];
                                newList[idx] = { ...printObj, image: e.target.value };
                                updateData('whatsappTestimonials', newList);
                              }} 
                              placeholder="Cole a URL ou envie do celular acima" 
                            />
                          </div>

                          {printObj.image && (
                            <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center', background: '#0a0a0a', padding: '10px', borderRadius: '8px', border: '1px solid #222' }}>
                              <img src={printObj.image} alt="Preview do Print" style={{ maxHeight: '120px', borderRadius: '6px', objectFit: 'contain' }} referrerPolicy="no-referrer" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                    
                    <button 
                      className="dev-add-btn" 
                      onClick={() => {
                        const currentList = appData.whatsappTestimonials || [];
                        updateData('whatsappTestimonials', [...currentList, { image: "", active: true }]);
                      }}
                    >
                      + Adicionar Print de Depoimento
                    </button>
                  </div>
                )}

                 {activeTab === 'pre√ßos' && (
                  <div className="dev-forms-container">
                    <h3>Plano e Pre√ßos</h3>
                    <div className="dev-grid-2">
                       <div className="dev-form-group">
                         <label>Selinho (Badge)</label>
                         <input type="text" className="dev-input" value={appData.pricing.badge} onChange={(e) => updateData('pricing', { ...appData.pricing, badge: e.target.value })} />
                       </div>
                       <div className="dev-form-group">
                         <label>T√≠tulo do Plano</label>
                         <input type="text" className="dev-input" value={appData.pricing.title} onChange={(e) => updateData('pricing', { ...appData.pricing, title: e.target.value })} />
                       </div>
                    </div>
                    <div className="dev-grid-2">
                      <div className="dev-form-group">
                        <label>Pre√ßo (R$)</label>
                        <input type="text" className="dev-input" value={appData.pricing.price} onChange={(e) => updateData('pricing', { ...appData.pricing, price: e.target.value })} />
                      </div>
                      <div className="dev-form-group">
                        <label>Per√≠odo (ex: /m√™s)</label>
                        <input type="text" className="dev-input" value={appData.pricing.period} onChange={(e) => updateData('pricing', { ...appData.pricing, period: e.target.value })} />
                      </div>
                    </div>
                    <div className="dev-grid-2">
                      <div className="dev-form-group">
                        <label>Texto do Bot√£o (CTA)</label>
                        <input type="text" className="dev-input" value={appData.pricing.cta} onChange={(e) => updateData('pricing', { ...appData.pricing, cta: e.target.value })} />
                      </div>
                      <div className="dev-form-group">
                        <label>Link do WhatsApp de Venda (URL Completa)</label>
                        <input type="text" className="dev-input" value={appData.pricing.waLink} onChange={(e) => updateData('pricing', { ...appData.pricing, waLink: e.target.value })} />
                      </div>
                    </div>

                    <div className="dev-grid-2" style={{ marginTop: '15px', borderTop: '1px dashed rgba(255, 255, 255, 0.1)', paddingTop: '15px' }}>
                      <div className="dev-form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                          <label style={{ margin: 0 }}>QR Code de Pagamento PIX (Link de Imagem)</label>
                          <DevFileUploadButton 
                            label="üì∑ Enviar Foto QR Code" 
                            onUploadSuccess={(url) => updateData('pricing', { ...appData.pricing, pixQrCodeLink: url })} 
                          />
                        </div>
                        <input 
                          type="text" 
                          className="dev-input" 
                          placeholder="Cole a URL ou envie do celular acima" 
                          value={appData.pricing.pixQrCodeLink || ''} 
                          onChange={(e) => updateData('pricing', { ...appData.pricing, pixQrCodeLink: e.target.value })} 
                        />
                        <small style={{ color: '#aaa', fontSize: '11px', marginTop: '4px', display: 'block' }}>Envie a imagem do QR Code direto do celular para exibir no checkout.</small>
                      </div>
                      <div className="dev-form-group">
                        <label>Chave PIX Copia e Cola / Chave Aleat√≥ria</label>
                        <textarea 
                          className="dev-input" 
                          placeholder="00020126360014BR.GOV.BCB.PIX..." 
                          style={{ minHeight: '80px', fontFamily: 'monospace', fontSize: '11px', background: '#12131a', border: '1px solid rgba(255,255,255,0.1)' }}
                          value={appData.pricing.pixCopiaCola || ''} 
                          onChange={(e) => updateData('pricing', { ...appData.pricing, pixCopiaCola: e.target.value })} 
                        />
                        <small style={{ color: '#aaa', fontSize: '11px', marginTop: '4px', display: 'block' }}>O c√≥digo PIX Copia e Cola completo para que os anunciantes possam copiar e efetuar o pagamento facilmente.</small>
                      </div>
                    </div>

                    <h4 style={{ marginTop: '20px', marginBottom: '10px' }}>Benef√≠cios do Plano</h4>
                    {appData.pricing.features.map((f: string, idx: number) => (
                      <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                        <input 
                          type="text" 
                          className="dev-input" 
                          value={f} 
                          onChange={(e) => {
                            const newFeatures = [...appData.pricing.features];
                            newFeatures[idx] = e.target.value;
                            updateData('pricing', { ...appData.pricing, features: newFeatures });
                          }} 
                        />
                        <button className="dev-remove-btn" style={{ position: 'static' }} onClick={() => {
                          const newFeatures = appData.pricing.features.filter((_: any, i: number) => i !== idx);
                          updateData('pricing', { ...appData.pricing, features: newFeatures });
                        }}>‚úï</button>
                      </div>
                    ))}
                    <button className="dev-add-btn" onClick={() => updateData('pricing', { ...appData.pricing, features: [...appData.pricing.features, "Novo benef√≠cio"] })}>+ Adicionar Benef√≠cio</button>
                  </div>
                )}

                {activeTab === 'segmentos' && (
                  <div className="dev-forms-container">
                    <h3>Segmentos e Ocupa√ß√£o</h3>
                    {appData.segmentsList.map((s, idx) => (
                      <div key={idx} className="dev-item-card">
                        <button className="dev-remove-btn" onClick={() => updateData('segmentsList', appData.segmentsList.filter((_, i) => i !== idx))}>‚úï</button>
                        <div className="dev-grid-2">
                          <input type="text" className="dev-input" value={s.name} onChange={(e) => {
                            const newList = [...appData.segmentsList];
                            newList[idx].name = e.target.value;
                            updateData('segmentsList', newList);
                          }} />
                          <select className="dev-input" value={s.status} onChange={(e) => {
                            const newList = [...appData.segmentsList];
                            newList[idx].status = e.target.value;
                            updateData('segmentsList', newList);
                          }}>
                            <option value="Dispon√≠vel">Dispon√≠vel</option>
                            <option value="Ocupado">Ocupado</option>
                          </select>
                        </div>
                      </div>
                    ))}
                    <button className="dev-add-btn" onClick={() => updateData('segmentsList', [...appData.segmentsList, { name: "Novo", status: "Dispon√≠vel" }])}>+ Adicionar Segmento</button>
                  </div>
                )}

                {activeTab === 'chat' && (
                  <div className="dev-forms-container">
                    <h3>Palavras-chave do Chat (Sin√¥nimos e Nichos)</h3>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginBottom: '20px', lineHeight: '1.4' }}>
                      <strong>Dica de ouro:</strong> Voc√™ pode cadastrar e associar v√°rias palavras separadas por v√≠rgula para a mesma categoria. <br />
                      Ex: Se o cliente digitar "propaganda", "comercial" ou "divulga√ß√£o", ele encontrar√° a categoria "Publicidade".
                    </p>
                    
                    <div className="dev-item-card" style={{ border: '1px dashed var(--primary)', background: 'rgba(251,191,36,0.05)' }}>
                      <h4 style={{ fontSize: '0.8rem', marginBottom: '10px', color: 'var(--primary)' }}>+ Adicionar Novo Grupo de Palavras-Chave</h4>
                      <div className="dev-grid-2">
                        <div className="dev-form-group">
                          <label>Palavra(s) do Cliente (Separadas por v√≠rgula)</label>
                          <input type="text" id="new-keyword-key" className="dev-input" placeholder="ex: comercial, propaganda, anuncio, marketing" />
                        </div>
                        <div className="dev-form-group">
                          <label>Categoria Alvo</label>
                          <input type="text" id="new-keyword-val" className="dev-input" placeholder="ex: Publicidade" />
                        </div>
                      </div>
                      <button 
                        className="dev-add-btn" 
                        style={{ marginTop: '10px' }}
                        onClick={() => {
                          const keyInput = document.getElementById('new-keyword-key') as HTMLInputElement;
                          const valInput = document.getElementById('new-keyword-val') as HTMLInputElement;
                          if (keyInput.value && valInput.value) {
                            const newKeywords = { ...appData.chatKeywords };
                            (newKeywords as any)[keyInput.value.toLowerCase()] = valInput.value;
                            updateData('chatKeywords', newKeywords);
                            keyInput.value = '';
                            valInput.value = '';
                          } else {
                            alert('Preencha ambos os campos.');
                          }
                        }}
                      >
                        Adicionar Grupo de Palavras
                      </button>
                    </div>

                    <div style={{ marginTop: '30px' }}>
                      {Object.keys(appData.chatKeywords).map((key) => (
                        <div key={key} className="dev-item-card">
                          <button className="dev-remove-btn" onClick={() => {
                            const newKeywords = { ...appData.chatKeywords };
                            // @ts-ignore
                            delete newKeywords[key];
                            updateData('chatKeywords', newKeywords);
                          }}>‚úï</button>
                          <div className="dev-grid-2">
                            <div className="dev-form-group">
                              <label>Palavra do Cliente</label>
                              <input 
                                type="text" 
                                className="dev-input" 
                                value={key} 
                                onChange={(e) => {
                                  const newKey = e.target.value.toLowerCase();
                                  if (newKey === key) return;
                                  const newKeywords = { ...appData.chatKeywords };
                                  const val = (newKeywords as any)[key];
                                  delete (newKeywords as any)[key];
                                  (newKeywords as any)[newKey] = val;
                                  updateData('chatKeywords', newKeywords);
                                }} 
                              />
                            </div>
                            <div className="dev-form-group">
                              <label>Categoria Alvo</label>
                              <input type="text" className="dev-input" value={(appData.chatKeywords as any)[key]} onChange={(e) => {
                                const newKeywords = { ...appData.chatKeywords };
                                (newKeywords as any)[key] = e.target.value;
                                updateData('chatKeywords', newKeywords);
                              }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'divulgadores' && (
                  <div className="dev-forms-container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h3>Gerenciar Divulgadores (Afiliados)</h3>
                      
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="dev-add-btn" style={{ margin: 0 }} onClick={() => {
                          setNewAffName('');
                          setNewAffCode('');
                          setShowAddAffiliateModal(true);
                        }}>+ Novo Divulgador</button>
                      </div>
                    </div>

                    {isAffLoading ? (
                      <div style={{ color: '#888' }}>Carregando divulgadores...</div>
                    ) : (
                      <div className="dev-items-grid">
                        {!affiliates || affiliates.length === 0 ? (
                          <p style={{ color: '#555', fontSize: '0.8rem' }}>Nenhum divulgador cadastrado ainda.</p>
                        ) : (
                          affiliates.map((aff, i) => {
                              const cleanTenantId = tenantId || 'fortaleza';
                              const affLink = cleanTenantId === 'fortaleza' 
                                ? `${window.location.origin}/?ref=${aff.code}` 
                                : `${window.location.origin}/#/${cleanTenantId}?ref=${aff.code}`;

                              return (
                                <div key={aff.code} className="dev-item-card">
                                  <button className="dev-remove-btn" onClick={async () => {
                                    if (confirm(`Excluir divulgador ${aff.name}?`)) {
                                      try {
                                        const tid = slugify(tenantId || 'fortaleza');
                                        const pass = localStorage.getItem('tenantPass');
                                        const docRef = doc(db, 'tenants', tid, 'affiliates', aff.id || aff.code);
                                        
                                        // Tenta deletar. Se falhar por ser cadastro antigo (sem campo _auth), 
                                        // a gente "conserta" o doc com a senha e deleta de novo.
                                        try {
                                          await deleteDoc(docRef);
                                        } catch (e) {
                                          if (pass) {
                                            await updateDoc(docRef, { _auth: pass });
                                            await deleteDoc(docRef);
                                          } else {
                                            throw e;
                                          }
                                        }
                                        
                                        setAffiliates(prev => prev.filter(item => (item.id || item.code) !== (aff.id || aff.code)));
                                      } catch (err: any) {
                                        console.error("Erro ao excluir:", err);
                                        alert("Erro ao excluir: " + err.message);
                                      }
                                    }
                                  }}>‚úï</button>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                      {aff.logo ? (
                                        <img src={aff.logo} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #333' }} alt="" referrerPolicy="no-referrer" />
                                      ) : (
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', border: '1px solid #333' }}>üë§</div>
                                      )}
                                      <div>
                                        <h4 style={{ color: 'var(--primary)', margin: 0 }}>{aff.name}</h4>
                                        <code style={{ fontSize: '10px', color: '#888' }}>C√≥digo: {aff.code}</code>
                                        {aff.customTitle && <div style={{ fontSize: '10px', color: '#aaa', marginTop: '2px' }}>Portal: {aff.customTitle}</div>}
                                      </div>
                                    </div>
                                    <div style={{ background: 'rgba(37, 211, 102, 0.1)', color: '#25D366', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 900 }}>
                                      {aff.commission} de Comiss√£o
                                    </div>
                                  </div>
     
                                  <div style={{ background: '#080808', padding: '10px', borderRadius: '8px', border: '1px solid #222', marginBottom: '15px' }}>
                                     <div style={{ fontSize: '10px', color: '#555', marginBottom: '5px' }}>Link para Divulgar:</div>
                                     <div style={{ fontSize: '11px', color: '#4285F4', wordBreak: 'break-all' }}>
                                       {affLink}
                                     </div>
                                     <button 
                                       className="dev-btn" 
                                       style={{ marginTop: '10px', width: '100%', fontSize: '11px', padding: '6px' }}
                                       onClick={() => {
                                         navigator.clipboard.writeText(affLink);
                                         alert("Link copiado!");
                                       }}
                                     >
                                       Copiar Link
                                     </button>
                                  </div>
     
                                  <div className="dev-grid-2" style={{ gap: '10px' }}>
                                     <div style={{ background: '#111', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '10px', color: '#666' }}>CLIQUES</div>
                                        <div style={{ fontWeight: 900, color: '#fff' }}>{aff.clicks || 0}</div>
                                     </div>
                                     <div style={{ background: '#111', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '10px', color: '#666' }}>VENDAS</div>
                                        <div style={{ fontWeight: 900, color: '#ff8a00' }}>{aff.sales || 0}</div>
                                     </div>
                                  </div>
     
                                  <div className="dev-form-group" style={{ marginTop: '15px' }}>
                                    <label>Ajustar Comiss√£o / WhatsApp</label>
                                    <div className="dev-grid-2" style={{ gap: '10px' }}>
                                      <input 
                                        type="text" 
                                        className="dev-input" 
                                        value={aff.commission} 
                                        placeholder="20%"
                                        onChange={async (e) => {
                                          const val = e.target.value;
                                          const tid = slugify(tenantId || 'fortaleza');
                                          setAffiliates(prev => {
                                            const newList = [...prev];
                                            newList[i] = { ...newList[i], commission: val };
                                            return newList;
                                          });
                                          await updateDoc(doc(db, 'tenants', tid, 'affiliates', aff.code), { 
                                            commission: val,
                                            _auth: localStorage.getItem('tenantPass')
                                          });
                                        }}
                                      />
                                      <input 
                                        type="text" 
                                        className="dev-input" 
                                        value={aff.whatsapp || ''} 
                                        placeholder="WhatsApp"
                                        onChange={async (e) => {
                                          const val = e.target.value;
                                          const tid = slugify(tenantId || 'fortaleza');
                                          setAffiliates(prev => {
                                            const newList = [...prev];
                                            newList[i] = { ...newList[i], whatsapp: val };
                                            return newList;
                                          });
                                          await updateDoc(doc(db, 'tenants', tid, 'affiliates', aff.code), { 
                                            whatsapp: val,
                                            _auth: localStorage.getItem('tenantPass')
                                          });
                                        }}
                                      />
                                    </div>

                                    <label style={{ marginTop: '10px', display: 'block' }}>Nome do Portal & Logo do Divulgador (Opcional)</label>
                                    <div className="dev-grid-2" style={{ gap: '10px', marginTop: '5px' }}>
                                      <input 
                                        type="text" 
                                        className="dev-input" 
                                        value={aff.customTitle || ''} 
                                        placeholder="Nome do Portal (ex: Jucervi)"
                                        onChange={async (e) => {
                                          const val = e.target.value;
                                          const tid = slugify(tenantId || 'fortaleza');
                                          setAffiliates(prev => {
                                            const newList = [...prev];
                                            newList[i] = { ...newList[i], customTitle: val };
                                            return newList;
                                          });
                                          await updateDoc(doc(db, 'tenants', tid, 'affiliates', aff.code), { 
                                            customTitle: val,
                                            _auth: localStorage.getItem('tenantPass')
                                          });
                                        }}
                                      />
                                      <input 
                                        type="text" 
                                        className="dev-input" 
                                        value={aff.logo || ''} 
                                        placeholder="URL do Logo (ex: https://...)"
                                        onChange={async (e) => {
                                          const val = e.target.value;
                                          const tid = slugify(tenantId || 'fortaleza');
                                          setAffiliates(prev => {
                                            const newList = [...prev];
                                            newList[i] = { ...newList[i], logo: val };
                                            return newList;
                                          });
                                          await updateDoc(doc(db, 'tenants', tid, 'affiliates', aff.code), { 
                                            logo: val,
                                            _auth: localStorage.getItem('tenantPass')
                                          });
                                        }}
                                      />
                                    </div>

                                    <label style={{ marginTop: '15px', display: 'block', color: 'var(--primary)', fontWeight: 'bold' }}>üìª Configura√ß√£o de Web R√°dio (Exclusivo para Parceiros R√°dio)</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px', background: 'rgba(251, 191, 36, 0.03)', border: '1px dashed rgba(251, 191, 36, 0.15)', borderRadius: '12px', padding: '12px', marginBottom: '10px' }}>
                                      <div className="dev-form-group">
                                        <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>Ativar Player de R√°dio no Topo (In√≠cio da P√°gina)?</label>
                                        <select 
                                          className="dev-input" 
                                          style={{ width: '100%' }}
                                          value={aff.hasRadioPlayer ? "sim" : "nao"}
                                          onChange={async (e) => {
                                            const val = e.target.value === "sim";
                                            const tid = slugify(tenantId || 'fortaleza');
                                            setAffiliates(prev => {
                                              const newList = [...prev];
                                              newList[i] = { ...newList[i], hasRadioPlayer: val };
                                              return newList;
                                            });
                                            await updateDoc(doc(db, 'tenants', tid, 'affiliates', aff.code), { 
                                              hasRadioPlayer: val,
                                              _auth: localStorage.getItem('tenantPass')
                                            });
                                          }}
                                        >
                                          <option value="nao">N√£o (Layout Padr√£o) ‚ùå</option>
                                          <option value="sim">Sim (Ativar Player no Topo) üìª</option>
                                        </select>
                                        <small style={{ color: '#aaa', fontSize: '0.7rem' }}>Se ativado, um player de r√°dio exclusivo aparecer√° no in√≠cio da p√°gina (logo abaixo da introdu√ß√£o) apenas para este parceiro.</small>
                                      </div>
                                      <div className="dev-form-group">
                                        <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>Link de Transmiss√£o da R√°dio (Streaming URL)</label>
                                        <input 
                                          type="text" 
                                          className="dev-input" 
                                          style={{ width: '100%' }}
                                          value={aff.radioLink || ''} 
                                          placeholder="Ex: https://stream.suaradio.com/stream"
                                          onChange={async (e) => {
                                            const val = e.target.value;
                                            const tid = slugify(tenantId || 'fortaleza');
                                            setAffiliates(prev => {
                                              const newList = [...prev];
                                              newList[i] = { ...newList[i], radioLink: val };
                                              return newList;
                                            });
                                            await updateDoc(doc(db, 'tenants', tid, 'affiliates', aff.code), { 
                                              radioLink: val,
                                              _auth: localStorage.getItem('tenantPass')
                                            });
                                          }}
                                        />
                                        <small style={{ color: '#aaa', fontSize: '0.7rem' }}>Caso fique vazio, usar√° o link de r√°dio padr√£o do portal.</small>
                                      </div>
                                    </div>

                                    <label style={{ marginTop: '15px', display: 'block', color: 'var(--primary)', fontWeight: 'bold' }}>üìù Textos Personalizados da P√°gina (Opcional)</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                                      <div className="dev-form-group">
                                        <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>T√≠tulo Principal (Hero)</label>
                                        <input 
                                          type="text" 
                                          className="dev-input" 
                                          style={{ width: '100%' }}
                                          value={aff.heroTitle || ''} 
                                          placeholder="Ex: A maior vitrine digital para seu neg√≥cio no Brasil!"
                                          onChange={async (e) => {
                                            const val = e.target.value;
                                            const tid = slugify(tenantId || 'fortaleza');
                                            setAffiliates(prev => {
                                              const newList = [...prev];
                                              newList[i] = { ...newList[i], heroTitle: val };
                                              return newList;
                                            });
                                            await updateDoc(doc(db, 'tenants', tid, 'affiliates', aff.code), { 
                                              heroTitle: val,
                                              _auth: localStorage.getItem('tenantPass')
                                            });
                                          }}
                                        />
                                      </div>
                                      <div className="dev-form-group">
                                        <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>Subt√≠tulo Principal (Hero)</label>
                                        <textarea 
                                          className="dev-input" 
                                          style={{ width: '100%', minHeight: '60px', resize: 'vertical' }}
                                          value={aff.heroSub || ''} 
                                          placeholder="Ex: Coloque seu neg√≥cio na maior vitrine..."
                                          onChange={async (e) => {
                                            const val = e.target.value;
                                            const tid = slugify(tenantId || 'fortaleza');
                                            setAffiliates(prev => {
                                              const newList = [...prev];
                                              newList[i] = { ...newList[i], heroSub: val };
                                              return newList;
                                            });
                                            await updateDoc(doc(db, 'tenants', tid, 'affiliates', aff.code), { 
                                              heroSub: val,
                                              _auth: localStorage.getItem('tenantPass')
                                            });
                                          }}
                                        />
                                      </div>
                                      <div className="dev-form-group">
                                        <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>T√≠tulo da R√°dio & TV</label>
                                        <input 
                                          type="text" 
                                          className="dev-input" 
                                          style={{ width: '100%' }}
                                          value={aff.radioTitle || ''} 
                                          placeholder="Ex: R√°dio & TV Online Ao Vivo"
                                          onChange={async (e) => {
                                            const val = e.target.value;
                                            const tid = slugify(tenantId || 'fortaleza');
                                            setAffiliates(prev => {
                                              const newList = [...prev];
                                              newList[i] = { ...newList[i], radioTitle: val };
                                              return newList;
                                            });
                                            await updateDoc(doc(db, 'tenants', tid, 'affiliates', aff.code), { 
                                              radioTitle: val,
                                              _auth: localStorage.getItem('tenantPass')
                                            });
                                          }}
                                        />
                                      </div>
                                      <div className="dev-form-group">
                                        <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>Subt√≠tulo da R√°dio & TV</label>
                                        <textarea 
                                          className="dev-input" 
                                          style={{ width: '100%', minHeight: '60px', resize: 'vertical' }}
                                          value={aff.radioSub || ''} 
                                          placeholder="Ex: Acompanhe nossa programa√ß√£o musical completa..."
                                          onChange={async (e) => {
                                            const val = e.target.value;
                                            const tid = slugify(tenantId || 'fortaleza');
                                            setAffiliates(prev => {
                                              const newList = [...prev];
                                              newList[i] = { ...newList[i], radioSub: val };
                                              return newList;
                                            });
                                            await updateDoc(doc(db, 'tenants', tid, 'affiliates', aff.code), { 
                                              radioSub: val,
                                              _auth: localStorage.getItem('tenantPass')
                                            });
                                          }}
                                        />
                                      </div>
                                      <div className="dev-form-group">
                                        <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>T√≠tulo do Banner Call-to-Action (CTA)</label>
                                        <input 
                                          type="text" 
                                          className="dev-input" 
                                          style={{ width: '100%' }}
                                          value={aff.ctaTitle || ''} 
                                          placeholder="Ex: Pronto para dominar seu segmento comercial?"
                                          onChange={async (e) => {
                                            const val = e.target.value;
                                            const tid = slugify(tenantId || 'fortaleza');
                                            setAffiliates(prev => {
                                              const newList = [...prev];
                                              newList[i] = { ...newList[i], ctaTitle: val };
                                              return newList;
                                            });
                                            await updateDoc(doc(db, 'tenants', tid, 'affiliates', aff.code), { 
                                              ctaTitle: val,
                                              _auth: localStorage.getItem('tenantPass')
                                            });
                                          }}
                                        />
                                      </div>
                                      <div className="dev-form-group">
                                        <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>Subt√≠tulo do Banner Call-to-Action (CTA)</label>
                                        <textarea 
                                          className="dev-input" 
                                          style={{ width: '100%', minHeight: '60px', resize: 'vertical' }}
                                          value={aff.ctaSub || ''} 
                                          placeholder="Ex: N√£o perca vendas para seu maior concorrente..."
                                          onChange={async (e) => {
                                            const val = e.target.value;
                                            const tid = slugify(tenantId || 'fortaleza');
                                            setAffiliates(prev => {
                                              const newList = [...prev];
                                              newList[i] = { ...newList[i], ctaSub: val };
                                              return newList;
                                            });
                                            await updateDoc(doc(db, 'tenants', tid, 'affiliates', aff.code), { 
                                              ctaSub: val,
                                              _auth: localStorage.getItem('tenantPass')
                                            });
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                          })
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

              <div className="dev-actions">
                <button 
                  className="dev-btn dev-btn-primary" 
                  style={{ background: '#25D366', borderColor: '#25D366', color: '#fff', width: '100%' }}
                  onClick={saveToFirebase}
                >
                  üíæ Salvar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Activity Notifications */}
      <div id="notification-container">
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div 
              key={n.id}
              initial={{ x: '-120%' }}
              animate={{ x: 0 }}
              exit={{ x: '-120%' }}
              className="activity-notification show"
            >
              <span className="icon">üîî</span>
              <div className="content">
                <strong>{n.name}</strong> {n.action}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Smart Chat */}
      <div id="smart-chat-container">
        <div id="chat-window" className={isChatOpen ? 'active' : ''}>
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-header-icon">üí¨</div>
              <div>
                <div className="chat-header-title">Assistente do Portal</div>
                <div className="chat-header-status">
                  <div className="status-dot"></div>
                  Online agora
                </div>
              </div>
            </div>
            <button className="chat-close" onClick={toggleChat}>‚úï</button>
          </div>
          <div id="chat-messages">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`message ${msg.sender}`}>
                {msg.text}
                {msg.categories && msg.categories.length > 0 && (
                  <div className="chat-categories">
                    {msg.categories.map(cat => (
                      <button key={cat} className="chat-cat-btn" onClick={() => handleSendMessage(cat)}>{cat}</button>
                    ))}
                  </div>
                )}
                {msg.results && msg.results.length > 0 && (() => {
                  const recommended = msg.results.filter((c: any) => getCompanyPlanType(c) !== 'gratuito');
                  const others = msg.results.filter((c: any) => getCompanyPlanType(c) === 'gratuito');

                  const renderCard = (c: any) => {
                    const pType = getCompanyPlanType(c);
                    return (
                      <div key={c.id} className="chat-result-card" style={{
                        border: pType === 'patrocinado' ? '1px solid rgba(245, 158, 11, 0.6)' : pType === 'destaque' ? '1px solid rgba(251, 191, 36, 0.4)' : pType === 'verificado' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)'
                      }}>
                        <div className="chat-result-info">
                          <img src={c.logo} className="chat-result-logo" referrerPolicy="no-referrer" alt={c.name} />
                          <div className="chat-result-details">
                            <div className="chat-result-name" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              {c.name}
                            </div>
                            <div className="chat-result-cat" style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <span>{c.category}</span>
                              {pType === 'patrocinado' && (
                                <span style={{ background: 'linear-gradient(90deg, #ef4444, #f59e0b)', color: '#fff', fontSize: '8px', fontWeight: 900, padding: '1px 5px', borderRadius: '10px' }}>
                                  üî• DESTAQUE
                                </span>
                              )}
                              {pType === 'destaque' && (
                                <span style={{ background: '#f59e0b', color: '#000', fontSize: '8px', fontWeight: 900, padding: '1px 5px', borderRadius: '10px' }}>
                                  ‚≠ê RECOMENDADO
                                </span>
                              )}
                              {pType === 'verificado' && (
                                <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontSize: '8px', fontWeight: 900, padding: '1px 5px', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                                  ‚úî VERIFICADO
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="chat-result-actions" style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
                          <a href={`https://wa.me/${(c.wa || '').replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="chat-result-wa" style={{ flex: 1 }}>
                            WhatsApp üí¨
                          </a>
                          {c.ig && c.ig !== '' && c.ig !== '#' && (
                            <a href={c.ig} target="_blank" rel="noreferrer" className="chat-result-wa" style={{ flex: 1, background: '#E1306C' }}>
                              IG üì∏
                            </a>
                          )}
                          {c.website && c.website !== '' && (
                            <a href={c.website} target="_blank" rel="noreferrer" className="chat-result-wa" style={{ flex: 1, background: 'var(--primary)', color: 'black' }}>
                              Web üåê
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  };

                  return (
                    <div style={{ marginTop: '10px' }}>
                      {recommended.length > 0 && (
                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ fontSize: '10px', fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                            üî• EMPRESAS RECOMENDADAS EM DESTAQUE:
                          </div>
                          {recommended.map(renderCard)}
                        </div>
                      )}

                      {others.length > 0 && (
                        <div>
                          {recommended.length > 0 && (
                            <div style={{ fontSize: '10px', fontWeight: 800, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', marginTop: '10px' }}>
                              üìç OUTROS ESTABELECIMENTOS LOCAIS:
                            </div>
                          )}
                          {others.map(renderCard)}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            ))}
            {isTyping && (
              <div className="typing-indicator">
                <div className="dot"></div><div className="dot"></div><div className="dot"></div>
              </div>
            )}
          </div>
          <div className="chat-input-area">
            <div className="chat-input-wrapper">
              <input 
                type="text" 
                id="chat-input" 
                placeholder="Digite o que voc√™ precisa..." 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button id="chat-send" onClick={() => handleSendMessage()}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
            </div>
            <p style={{ fontSize: '10px', color: 'var(--text-dim)', textAlign: 'center', marginTop: '10px', fontWeight: 700, textTransform: 'uppercase' }}>Ex: supermercado, mec√¢nico, internet...</p>
          </div>
        </div>
        <button id="chat-toggle-btn" className={`chat-toggle ${isChatOpen ? 'active' : ''}`} onClick={toggleChat}>
          <span>{isChatOpen ? '‚úï' : 'üí¨'}</span>
          {!isChatOpen && chatMessages.length === 0 && <div className="chat-badge">1</div>}
        </button>
      </div>

      {/* =========================================================================
          INTERACTIVE SCREEN: MINI-SITE / LOJA VIRTUAL / CARD√ÅPIO DIGITAL
          ========================================================================= */}
      <AnimatePresence>
        {activeMiniSiteCompany && (() => {
          const company = activeMiniSiteCompany;
          const siteType = getCompanySiteType(company);
          
          const items = company.items || [];
          
          return (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 backdrop-blur-md z-[1200] overflow-y-auto font-jakarta flex flex-col"
            >
              {/* Top Banner Header */}
              <div className="relative w-full h-44 sm:h-64 bg-neutral-950 flex-shrink-0">
                <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_0%,rgba(251,191,36,0.15)_0%,transparent_100%)]" />
                <button 
                  onClick={() => {
                    const shareUrl = `${window.location.origin}/#/${tenantId || 'fortaleza'}?id=${company.id || slugify(company.name)}`;
                    navigator.clipboard.writeText(shareUrl);
                    setShareCopied(true);
                    setTimeout(() => setShareCopied(false), 2000);
                  }}
                  className="absolute top-5 right-20 bg-black/60 hover:bg-black/90 border border-white/20 text-white p-3 rounded-full hover:scale-105 transition-all duration-200 z-30 flex items-center justify-center relative"
                  title="Compartilhar Link de Divulga√ß√£o"
                >
                  {shareCopied && (
                    <span className="text-[10px] font-black text-[var(--primary)] absolute -top-8 right-0 bg-black/95 border border-white/10 px-2.5 py-1 rounded shadow-lg whitespace-nowrap">
                      Link Copiado!
                    </span>
                  )}
                  <Share2 size={20} />
                </button>

                <button 
                  onClick={() => {
                    setActiveMiniSiteCompany(null);
                    // Clear search ID parameter safely in hash URLs
                    const currentUrl = window.location.href;
                    if (currentUrl.includes('?')) {
                      const [baseUrl, searchPart] = currentUrl.split('?');
                      const params = new URLSearchParams(searchPart);
                      params.delete('id');
                      params.delete('item');
                      const remaining = params.toString();
                      const nextUrl = remaining ? `${baseUrl}?${remaining}` : baseUrl;
                      window.history.pushState({}, '', nextUrl);
                    }
                  }}
                  className="absolute top-5 right-5 bg-black/60 hover:bg-black/90 border border-white/20 text-white p-3 rounded-full hover:scale-105 transition-all duration-200 z-30"
                  aria-label="Voltar ao portal"
                >
                  <X size={20} />
                </button>
                
                {/* Profile Floating Elements */}
                <div className="absolute bottom-[-40px] left-6 sm:left-12 flex items-end gap-4 sm:gap-6 z-20">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white border-2 border-[var(--primary)] overflow-hidden flex items-center justify-center shadow-2xl p-0">
                    <img src={company.logo} alt={company.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="mb-2">
                    <span className="bg-[var(--primary)] text-black text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow">
                      {company.category}
                    </span>
                    <div className="flex flex-wrap items-center gap-2 mt-1 ml-1">
                      <h2 className="text-xl sm:text-3.5xl font-extrabold text-white tracking-tight select-none">
                        {company.name}
                      </h2>
                      {(() => {
                        const { average, count } = getCompanyReviewStats(company.id);
                        if (count > 0) {
                          return (
                            <div className="flex items-center gap-1 bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full select-none font-mono">
                              ‚≠ê {average.toFixed(1)} ({count})
                            </div>
                          );
                        } else {
                          return (
                            <div className="flex items-center gap-1 bg-white/5 border border-white/10 text-white/40 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full select-none font-mono">
                              ‚≠ê Novo
                            </div>
                          );
                        }
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Body Content */}
              <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-28 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
                
                {/* Details column (left) */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                  {/* Bio Description / Social Info */}
                  <div className="bg-[#0b0c10] border border-white/5 rounded-3xl p-6 sm:p-8 shadow-xl">
                    <h3 className="text-sm font-black font-mono uppercase tracking-[0.2em] text-[var(--primary)]">SOBRE N√ìS</h3>
                    <p className="text-white/70 text-sm mt-3 leading-relaxed">
                      {company.desc || 'Anunciante comercial oficial com atendimento dedicado e garantia de qualidade.'}
                    </p>
                    
                    <div className="flex flex-wrap gap-3 mt-6 pt-5 border-t border-white/5">
                      <a 
                        href={`https://wa.me/${company.wa.replace(/[^0-9]/g, '')}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 hover:text-white hover:bg-emerald-600 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200"
                      >
                        <Smartphone size={14} /> WhatsApp Comercial
                      </a>
                      {company.ig && company.ig !== '#' && company.ig !== '' && (
                        <a 
                          href={company.ig} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 bg-pink-600/10 border border-pink-500/20 text-pink-400 hover:text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200"
                        >
                          Instagram Oficial
                        </a>
                      )}
                      {company.website && company.website !== '' && (
                        <a 
                          href={company.website.trim().startsWith('http') ? company.website.trim() : `https://${company.website.trim()}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:text-black hover:bg-gradient-to-r hover:from-amber-400 hover:to-amber-500 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200"
                        >
                          <ExternalLink size={14} /> Website Oficial
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Reviews Section */}
                  {(() => {
                    const { average, count, reviewsList } = getCompanyReviewStats(company.id);
                    return (
                      <div className="bg-[#0b0c10] border border-white/5 rounded-3xl p-6 sm:p-8 shadow-xl">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                          <div>
                            <h3 className="text-sm font-black font-mono uppercase tracking-[0.2em] text-[var(--primary)]">AVALIA√á√ïES</h3>
                            <p className="text-xs text-white/50 mt-1">O que os clientes dizem sobre {company.name}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {count > 0 ? (
                              <div className="text-right">
                                <div className="text-sm font-extrabold text-white flex items-center gap-1 justify-end">
                                  <span className="text-amber-400">‚òÖ</span> {average.toFixed(1)} / 5.0
                                </div>
                                <div className="text-[10px] text-white/40 font-bold">{count} {count === 1 ? 'avalia√ß√£o' : 'avalia√ß√µes'}</div>
                              </div>
                            ) : (
                              <span className="text-xs text-white/40 font-bold">Nenhuma avalia√ß√£o ainda</span>
                            )}
                          </div>
                        </div>

                        {/* Reviews List */}
                        {count === 0 ? (
                          <div className="text-center py-8 text-white/45 text-xs">
                            Seja o primeiro a avaliar esta empresa! Deixe sua opini√£o abaixo.
                          </div>
                        ) : (
                          <div className="flex flex-col gap-4 mt-5 max-h-80 overflow-y-auto pr-1">
                            {reviewsList.map((rev: any) => (
                              <div key={rev.id} className="bg-neutral-900/40 border border-white/5 rounded-2xl p-4 flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] text-xs font-black uppercase font-mono">
                                      {rev.author.charAt(0)}
                                    </div>
                                    <div>
                                      <h4 className="text-xs font-extrabold text-white">{rev.author}</h4>
                                      <span className="text-[9px] text-white/40 font-mono">
                                        {new Date(rev.createdAt).toLocaleDateString('pt-BR')}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-0.5 text-[10px] text-amber-400">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <span key={i} className={i < rev.rating ? "text-amber-400" : "text-white/10"}>
                                        ‚òÖ
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                {rev.comment && (
                                  <p className="text-xs text-white/70 leading-relaxed pl-1">
                                    {rev.comment}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Leave a Review Form */}
                        <div className="mt-6 pt-5 border-t border-white/5">
                          {!isCompanyReviewFormOpen ? (
                            <button
                              onClick={() => {
                                setIsCompanyReviewFormOpen(true);
                                setNewCompanyReviewForm({ rating: 5, author: '', comment: '' });
                              }}
                              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                            >
                              ‚≠ê Deixar Avalia√ß√£o
                            </button>
                          ) : (
                            <div className="bg-neutral-900/60 border border-white/5 rounded-2xl p-5 flex flex-col gap-4">
                              <h4 className="text-xs font-black text-[var(--primary)] uppercase tracking-wider">Nova Avalia√ß√£o</h4>
                              
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] text-white/50 uppercase font-extrabold">Sua Nota *</label>
                                <div className="flex items-center gap-1.5">
                                  {[1, 2, 3, 4, 5].map((num) => (
                                    <button
                                      key={num}
                                      type="button"
                                      onClick={() => setNewCompanyReviewForm(prev => ({ ...prev, rating: num }))}
                                      className="text-2xl transition-all duration-150 hover:scale-110 cursor-pointer"
                                    >
                                      <span className={num <= newCompanyReviewForm.rating ? "text-amber-400" : "text-white/20"}>
                                        ‚òÖ
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] text-white/50 uppercase font-extrabold">Seu Nome *</label>
                                <input
                                  type="text"
                                  placeholder="Ex: Carlos Silva"
                                  value={newCompanyReviewForm.author}
                                  onChange={(e) => setNewCompanyReviewForm(prev => ({ ...prev, author: e.target.value }))}
                                  className="w-full bg-[#11111a] border border-white/10 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3 text-xs text-white"
                                />
                              </div>

                              <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] text-white/50 uppercase font-extrabold">Seu Coment√°rio *</label>
                                <textarea
                                  placeholder="Escreva sua opini√£o sincera sobre o atendimento, qualidade ou produtos..."
                                  value={newCompanyReviewForm.comment}
                                  onChange={(e) => setNewCompanyReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                                  rows={3}
                                  className="w-full bg-[#11111a] border border-white/10 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3 text-xs text-white resize-none"
                                />
                              </div>

                              <div className="flex gap-2 justify-end">
                                <button
                                  type="button"
                                  onClick={() => setIsCompanyReviewFormOpen(false)}
                                  className="px-4 py-2 bg-transparent hover:bg-white/5 text-white/50 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors duration-150"
                                >
                                  Cancelar
                                </button>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (!newCompanyReviewForm.author.trim()) {
                                      alert("Por favor, preencha o seu nome.");
                                      return;
                                    }
                                    if (!newCompanyReviewForm.comment.trim()) {
                                      alert("Por favor, preencha o coment√°rio.");
                                      return;
                                    }
                                    const success = await addReview(company.id, newCompanyReviewForm.rating, newCompanyReviewForm.author, newCompanyReviewForm.comment);
                                    if (success) {
                                      alert("Avalia√ß√£o registrada com sucesso! Muito obrigado.");
                                      setIsCompanyReviewFormOpen(false);
                                    } else {
                                      alert("Desculpe, ocorreu um erro ao registrar sua avalia√ß√£o.");
                                    }
                                  }}
                                  className="px-5 py-2.5 bg-[var(--primary)] hover:bg-[#ffe066] text-black rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors duration-150 cursor-pointer"
                                >
                                  Enviar Avalia√ß√£o
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Render Catalog Items (if Shop or Menu) */}
                  {(siteType === 'loja' || siteType === 'cardapio') && (
                    <div className="bg-[#0b0c10] border border-white/5 rounded-3xl p-6 sm:p-8 shadow-xl flex-1 flex flex-col">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
                        <div>
                          <h3 className="text-lg font-extrabold text-white tracking-tight">
                            {siteType === 'loja' ? "üõçÔ∏è Cat√°logo de Produtos" : "üçΩÔ∏è Card√°pio Digital"}
                          </h3>
                          <p className="text-xs text-white/50 mt-1">Selecione e monte seus pedidos de forma simples e r√°pida.</p>
                        </div>
                      </div>

                      {items.length === 0 ? (
                        <div className="text-center py-16 flex-1 flex flex-col items-center justify-center">
                          <span className="text-4xl">üì¶</span>
                          <h4 className="text-white/80 font-bold mt-4">Nenhum produto cadastrado</h4>
                          <p className="text-white/45 text-xs max-w-xs mt-1">Este com√©rcio ainda n√£o incluiu itens em seu portf√≥lio digital, mas voc√™ pode cham√°-los no WhatsApp!</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-6">
                          {items.map((item: any, idx: number) => {
                            const cartQty = shoppingCart[item.id]?.count || 0;
                            return (
                              <div 
                                key={item.id || idx} 
                                onClick={() => {
                                  setSelectedItemForDetail(item);
                                  setDetailModalTab('detalhes');
                                  setIsReviewFormOpen(false);
                                  setNewReviewForm({ rating: 5, author: '', comment: '' });
                                }}
                                className="bg-neutral-900/60 hover:bg-neutral-900 border border-white/5 hover:border-white/10 rounded-2xl p-4 flex gap-4 transition-all duration-200 cursor-pointer"
                              >
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-neutral-950 overflow-hidden flex-shrink-0 flex items-center justify-center border border-white/10">
                                  {item.photo ? (
                                    <img src={item.photo} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  ) : (
                                    <ImageIcon className="text-white/20" size={24} />
                                  )}
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                  <div>
                                    <h4 className="text-sm font-extrabold text-white">{item.name}</h4>
                                    <p className="text-[11px] text-white/50 leading-relaxed mt-0.5 line-clamp-2">{item.desc || 'Sem descri√ß√£o adicional.'}</p>
                                  </div>
                                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                                    <span className="text-xs font-black text-[var(--primary)] font-mono">
                                      {item.price ? `R$ ${parseFloat(item.price).toFixed(2).replace('.', ',')}` : 'Sob Consulta'}
                                    </span>
                                    
                                    {/* Cart Controls */}
                                    <div className="flex items-center gap-2.5">
                                      {cartQty > 0 ? (
                                        <>
                                          <button 
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setShoppingCart(prev => {
                                                const existing = prev[item.id];
                                                if (!existing) return prev;
                                                if (existing.count <= 1) {
                                                  const copy = { ...prev };
                                                  delete copy[item.id];
                                                  return copy;
                                                }
                                                return {
                                                  ...prev,
                                                  [item.id]: { ...existing, count: existing.count - 1 }
                                                };
                                              });
                                            }}
                                            className="p-1 rounded bg-white/10 hover:bg-[var(--primary)] hover:text-black transition-colors duration-150"
                                          >
                                            <Minus size={12} />
                                          </button>
                                          <span className="text-xs font-black text-white">{cartQty}</span>
                                          <button 
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setShoppingCart(prev => ({
                                                ...prev,
                                                [item.id]: { item, count: (prev[item.id]?.count || 0) + 1 }
                                              }));
                                            }}
                                            className="p-1 rounded bg-white/10 hover:bg-[var(--primary)] hover:text-black transition-colors duration-150"
                                          >
                                            <Plus size={12} />
                                          </button>
                                        </>
                                      ) : (
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setShoppingCart(prev => ({
                                              ...prev,
                                              [item.id]: { item, count: 1 }
                                            }));
                                          }}
                                          className="px-2.5 py-1 rounded bg-[var(--primary)] hover:bg-[#ffe066] text-black text-[10px] font-black uppercase tracking-wider transition-colors duration-150"
                                        >
                                          + Add
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Render Landing Page Services (if Service Type) */}
                  {siteType === 'servico' && (
                    <div className="bg-[#0b0c10] border border-white/5 rounded-3xl p-6 sm:p-8 shadow-xl flex-1 flex flex-col">
                      <div className="border-b border-white/5 pb-5">
                        <h3 className="text-lg font-extrabold text-white tracking-tight">
                          üõ†Ô∏è Servi√ßos Dispon√≠veis & Portf√≥lio
                        </h3>
                        <p className="text-xs text-white/50 mt-1">Conhe√ßa nossa carteira de servi√ßos profissionais e solicite seu or√ßamento sem compromisso.</p>
                      </div>

                      {items.length === 0 ? (
                        <div className="text-center py-12 flex-1 flex flex-col items-center justify-center">
                          <span className="text-4xl">üíº</span>
                          <h4 className="text-white/80 font-bold mt-4">Nenhum servi√ßo listado</h4>
                          <p className="text-white/45 text-xs max-w-xs mt-1">Voc√™ pode solicitar um or√ßamento personalizado no formul√°rio ao lado ou no WhatsApp!</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-4 mt-6">
                          {items.map((item: any, idx: number) => (
                            <div 
                              key={item.id || idx} 
                              onClick={() => {
                                setSelectedItemForDetail(item);
                                setDetailModalTab('detalhes');
                                setIsReviewFormOpen(false);
                                setNewReviewForm({ rating: 5, author: '', comment: '' });
                              }}
                              className="bg-neutral-900/60 hover:bg-neutral-900 border border-white/5 hover:border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row gap-4 transition-all duration-200 cursor-pointer"
                            >
                              <div className="w-20 h-20 rounded-xl bg-neutral-950 overflow-hidden flex-shrink-0 flex items-center justify-center border border-white/10">
                                {item.photo ? (
                                  <img src={item.photo} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                  <Briefcase className="text-white/20" size={24} />
                                )}
                              </div>
                              <div className="flex-1 flex flex-col justify-between">
                                <div>
                                  <h4 className="text-base font-extrabold text-white">{item.name}</h4>
                                  <p className="text-xs text-white/55 leading-relaxed mt-1">{item.desc || 'Atendimento comercial dedicado.'}</p>
                                </div>
                                <div className="flex items-center justify-end mt-4 sm:mt-1 pt-2 border-t border-white/5">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const textMsg = `Ol√°! Gostaria de solicitar um or√ßamento para o servi√ßo comercial: *${item.name}* no portal ${appData.siteInfo.name}`;
                                      window.open(`https://wa.me/${company.wa.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(textMsg)}`, '_blank');
                                    }}
                                    className="px-4 py-2 rounded-xl bg-[var(--primary)]/10 hover:bg-[var(--primary)] text-[var(--primary)] hover:text-black border border-[var(--primary)]/30 text-[10px] font-black uppercase tracking-widest transition-all duration-200 flex items-center gap-1.5"
                                  >
                                    <MessageSquare size={12} /> Solicitar Or√ßamento
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Render Scheduling Services (if Agendamento Type) */}
                  {siteType === 'agendamento' && (
                    <div className="bg-[#0b0c10] border border-white/5 rounded-3xl p-6 sm:p-8 shadow-xl flex-1 flex flex-col">
                      <div className="border-b border-white/5 pb-5">
                        <h3 className="text-lg font-extrabold text-white tracking-tight">
                          üìÖ Servi√ßos para Agendamento
                        </h3>
                        <p className="text-xs text-white/50 mt-1">Selecione o servi√ßo e agende seu hor√°rio com total praticidade.</p>
                      </div>

                      {items.length === 0 ? (
                        <div className="text-center py-12 flex-1 flex flex-col items-center justify-center">
                          <span className="text-4xl">üìÖ</span>
                          <h4 className="text-white/80 font-bold mt-4">Nenhum servi√ßo dispon√≠vel</h4>
                          <p className="text-white/45 text-xs max-w-xs mt-1">Voc√™ pode solicitar um agendamento direto pelo formul√°rio de hor√°rio ou no WhatsApp!</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-4 mt-6">
                          {items.map((item: any, idx: number) => (
                            <div 
                              key={item.id || idx} 
                              onClick={() => {
                                setSelectedItemForDetail(item);
                                setDetailModalTab('detalhes');
                                setIsReviewFormOpen(false);
                                setNewReviewForm({ rating: 5, author: '', comment: '' });
                              }}
                              className="bg-neutral-900/60 hover:bg-neutral-900 border border-white/5 hover:border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row gap-4 transition-all duration-200 cursor-pointer"
                            >
                              <div className="w-20 h-20 rounded-xl bg-neutral-950 overflow-hidden flex-shrink-0 flex items-center justify-center border border-white/10">
                                {item.photo ? (
                                  <img src={item.photo} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                  <Calendar className="text-white/20" size={24} />
                                )}
                              </div>
                              <div className="flex-1 flex flex-col justify-between">
                                <div>
                                  <h4 className="text-base font-extrabold text-white">{item.name}</h4>
                                  <p className="text-xs text-white/55 leading-relaxed mt-1">{item.desc || 'Atendimento agendado com hor√°rio reservado.'}</p>
                                </div>
                                <div className="flex items-center justify-end mt-4 sm:mt-1 pt-2 border-t border-white/5">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const bookingSelect = document.getElementById('booking-service-select') as HTMLSelectElement;
                                      if (bookingSelect) {
                                        bookingSelect.value = item.name;
                                      }
                                      const bookingInput = document.getElementById('booking-sender-name');
                                      if (bookingInput) {
                                        bookingInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                        bookingInput.focus();
                                      }
                                    }}
                                    className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-400 text-amber-400 hover:text-black border border-amber-500/30 text-[10px] font-black uppercase tracking-widest transition-all duration-200 flex items-center gap-1.5"
                                  >
                                    <Calendar size={12} /> Agendar Hor√°rio
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Interactive Box: Shopping Cart or Custom Quote Panel */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  
                  {/* Option A: Shopping Cart (for store & menu) */}
                  {(siteType === 'loja' || siteType === 'cardapio') && (
                    <div className="bg-[#0b0c10] border border-white/5 rounded-3xl p-6 sm:p-8 shadow-xl relative flex flex-col sticky top-6">
                      <div className="flex justify-between items-center pb-1">
                        <h3 className="text-sm font-black font-mono uppercase tracking-[0.2em] text-[var(--primary)] flex items-center gap-2">
                          <ShoppingCart size={16} /> SACOLA DE PEDIDOS
                        </h3>
                        {Object.keys(shoppingCart).length > 0 && (
                          <button
                            type="button"
                            title="Esvaziar sacola completa"
                            onClick={() => {
                              if (window.confirm("Deseja mesmo esvaziar todos os itens da sacola?")) {
                                setShoppingCart({});
                              }
                            }}
                            className="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase tracking-wider bg-red-500/10 hover:bg-red-500/20 px-2.5 py-1 rounded-lg border border-red-500/20 transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 size={12} /> Limpar
                          </button>
                        )}
                      </div>
                      
                      {Object.keys(shoppingCart).length === 0 ? (
                        <div className="text-center py-12 flex-1 flex flex-col items-center justify-center">
                          <span className="text-2xl text-white/20">üõí</span>
                          <p className="text-xs text-white/40 mt-3 max-w-[200px] leading-relaxed">Sua sacola est√° vazia. Adicione produtos acima para enviar o seu pedido.</p>
                        </div>
                      ) : (() => {
                        const cartItemsArr = Object.values(shoppingCart) as any[];
                        const subtotal = cartItemsArr.reduce((total: number, car: any) => {
                          const val = car.computedUnitPrice ?? (car.item.price ? parseFloat(car.item.price) : 0);
                          return total + (val * car.count);
                        }, 0);
                        
                        return (
                          <div className="mt-4 flex flex-col gap-4 flex-1">
                            {/* Items List */}
                            <div className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-1">
                              {cartItemsArr.map((car: any) => {
                                const itemKey = car.cartKey || car.item.id;
                                const itemUnitPrice = car.computedUnitPrice ?? (car.item.price ? parseFloat(car.item.price) : 0);
                                const itemTotalPrice = itemUnitPrice * car.count;

                                return (
                                  <div key={itemKey} className="bg-neutral-900 border border-white/5 rounded-xl p-3 flex justify-between items-center gap-2 hover:border-white/10 transition-all">
                                    <div className="flex-1 min-w-0 pr-1">
                                      <h4 className="text-xs font-bold text-white truncate">{car.item.name}</h4>
                                      
                                      {/* Variations summary badges */}
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {car.selectedSize && (
                                          <span className="bg-amber-500/10 text-amber-300 border border-amber-500/20 px-1.5 py-0.5 rounded text-[9px] font-bold">
                                            Tam: {car.selectedSize}
                                          </span>
                                        )}
                                        {car.selectedColor && (
                                          <span className="bg-blue-500/10 text-blue-300 border border-blue-500/20 px-1.5 py-0.5 rounded text-[9px] font-bold">
                                            Cor: {car.selectedColor}
                                          </span>
                                        )}
                                        {car.selectedOptions && car.selectedOptions.length > 0 && (
                                          <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[9px] font-bold">
                                            +{car.selectedOptions.length} opcional(is)
                                          </span>
                                        )}
                                      </div>

                                      {car.itemNote && (
                                        <p className="text-[10px] text-white/50 italic truncate mt-0.5">
                                          Obs: "{car.itemNote}"
                                        </p>
                                      )}

                                      <div className="flex items-center gap-2 mt-1.5">
                                        <span className="text-[10px] text-white/50 font-mono">
                                          {itemUnitPrice > 0 ? `R$ ${itemUnitPrice.toFixed(2).replace('.', ',')}` : 'Gr√°tis'}
                                        </span>
                                        
                                        {/* Controles de Quantidade (- / +) */}
                                        <div className="flex items-center gap-1 bg-black/50 border border-white/10 rounded px-1.5 py-0.5">
                                          <button
                                            type="button"
                                            title="Diminuir quantidade"
                                            onClick={() => {
                                              setShoppingCart(prev => {
                                                const existing = prev[itemKey];
                                                if (!existing) return prev;
                                                if (existing.count <= 1) {
                                                  const copy = { ...prev };
                                                  delete copy[itemKey];
                                                  return copy;
                                                }
                                                return { ...prev, [itemKey]: { ...existing, count: existing.count - 1 } };
                                              });
                                            }}
                                            className="text-white/60 hover:text-white font-black text-xs px-1 cursor-pointer"
                                          >
                                            -
                                          </button>
                                          <span className="text-[10px] font-black text-amber-400 font-mono px-0.5">{car.count}</span>
                                          <button
                                            type="button"
                                            title="Aumentar quantidade"
                                            onClick={() => {
                                              setShoppingCart(prev => ({
                                                ...prev,
                                                [itemKey]: { ...prev[itemKey], count: (prev[itemKey]?.count || 0) + 1 }
                                              }));
                                            }}
                                            className="text-white/60 hover:text-white font-black text-xs px-1 cursor-pointer"
                                          >
                                            +
                                          </button>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      <span className="text-xs font-black text-white font-mono">
                                        {itemTotalPrice > 0 ? `R$ ${itemTotalPrice.toFixed(2).replace('.', ',')}` : 'Consulta'}
                                      </span>
                                      
                                      {/* Bot√£o para Excluir Item */}
                                      <button
                                        type="button"
                                        title="Excluir este item da sacola"
                                        onClick={() => {
                                          setShoppingCart(prev => {
                                            const copy = { ...prev };
                                            delete copy[itemKey];
                                            return copy;
                                          });
                                        }}
                                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/30 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/50 transition-all cursor-pointer flex items-center justify-center shrink-0"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Divider line */}
                            <div className="border-t border-white/5 pt-3">
                              <div className="flex justify-between items-center text-sm">
                                <span className="font-bold text-white">Subtotal:</span>
                                <span className="text-sm font-black text-white/80 font-mono">
                                  R$ {subtotal.toFixed(2).replace('.', ',')}
                                </span>
                              </div>
                              {deliveryMethod === 'entrega' && company.deliveryFee && parseFloat(company.deliveryFee) > 0 && (
                                <div className="flex justify-between items-center text-xs mt-1 text-white/50">
                                  <span>Taxa de Entrega:</span>
                                  <span className="font-mono">R$ {parseFloat(company.deliveryFee).toFixed(2).replace('.', ',')}</span>
                                </div>
                              )}
                              <div className="flex justify-between items-center text-sm mt-2 border-t border-white/5 pt-2">
                                <span className="font-extrabold text-[var(--primary)] uppercase tracking-wider text-xs">Total Geral:</span>
                                <span className="text-lg font-black text-[var(--primary)] font-mono">
                                  R$ {(subtotal + (deliveryMethod === 'entrega' ? parseFloat(company.deliveryFee || '0') || 0 : 0)).toFixed(2).replace('.', ',')}
                                </span>
                              </div>
                            </div>

                            {/* Client Details Form with advanced options */}
                            <div className="flex flex-col gap-4 mt-3">
                              
                              {/* Como quer receber? */}
                              <div>
                                <label className="text-[10px] text-white/50 uppercase tracking-wider font-extrabold block mb-2">Como deseja receber? *</label>
                                <div className="grid grid-cols-2 gap-2">
                                  <button 
                                    type="button"
                                    onClick={() => setDeliveryMethod('entrega')}
                                    className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${deliveryMethod === 'entrega' ? 'bg-[var(--primary)] text-black border-[var(--primary)]' : 'bg-neutral-900 text-white/70 border-white/5 hover:border-white/10'}`}
                                  >
                                    <Truck size={14} /> Entrega
                                  </button>
                                  <button 
                                    type="button"
                                    onClick={() => setDeliveryMethod('retirada')}
                                    className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${deliveryMethod === 'retirada' ? 'bg-[var(--primary)] text-black border-[var(--primary)]' : 'bg-neutral-900 text-white/70 border-white/5 hover:border-white/10'}`}
                                  >
                                    <Store size={14} /> Retirada
                                  </button>
                                </div>
                              </div>

                              {/* Customer Main Info */}
                              <div className="grid grid-cols-1 gap-2.5">
                                <div>
                                  <label className="text-[10px] text-white/50 uppercase tracking-wider font-extrabold block mb-1">Seu Nome Completo *</label>
                                  <input 
                                    type="text"
                                    placeholder="Informe seu nome"
                                    value={cartCustomerName}
                                    onChange={(e) => setCartCustomerName(e.target.value)}
                                    className="w-full bg-[#11111a] border border-white/10 hover:border-white/20 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3 text-xs text-white"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] text-white/50 uppercase tracking-wider font-extrabold block mb-1">Seu WhatsApp / Celular *</label>
                                  <input 
                                    type="text"
                                    placeholder="(00) 00000-0000"
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                    className="w-full bg-[#11111a] border border-white/10 hover:border-white/20 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3 text-xs text-white font-mono"
                                  />
                                </div>
                              </div>

                              {/* Address Fields (only if deliveryMethod === 'entrega') */}
                              {deliveryMethod === 'entrega' && (
                                <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-3.5 flex flex-col gap-2.5">
                                  <span className="text-[10px] text-[var(--primary)] font-black uppercase tracking-wider block mb-1">üìç Endere√ßo de Entrega</span>
                                  
                                  <div className="grid grid-cols-3 gap-2">
                                    <div className="col-span-2">
                                      <label className="text-[9px] text-white/40 uppercase font-bold block mb-1">Rua / Avenida *</label>
                                      <input 
                                        type="text"
                                        placeholder="Ex: Av. Paulista"
                                        value={customerStreet}
                                        onChange={(e) => setCustomerStreet(e.target.value)}
                                        className="w-full bg-[#11111a] border border-white/10 outline-none rounded-lg px-3 py-2 text-xs text-white"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[9px] text-white/40 uppercase font-bold block mb-1">N√∫mero *</label>
                                      <input 
                                        type="text"
                                        placeholder="N¬∫"
                                        value={customerNumber}
                                        onChange={(e) => setCustomerNumber(e.target.value)}
                                        className="w-full bg-[#11111a] border border-white/10 outline-none rounded-lg px-3 py-2 text-xs text-white"
                                      />
                                    </div>
                                  </div>

                                  <div>
                                    <label className="text-[9px] text-white/40 uppercase font-bold block mb-1">Bairro *</label>
                                    <input 
                                      type="text"
                                      placeholder="Seu bairro"
                                      value={customerNeighborhood}
                                      onChange={(e) => setCustomerNeighborhood(e.target.value)}
                                      className="w-full bg-[#11111a] border border-white/10 outline-none rounded-lg px-3 py-2 text-xs text-white"
                                    />
                                  </div>

                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="text-[9px] text-white/40 uppercase font-bold block mb-1">Cidade *</label>
                                      <input 
                                        type="text"
                                        placeholder="Sua cidade"
                                        value={customerCity}
                                        onChange={(e) => setCustomerCity(e.target.value)}
                                        className="w-full bg-[#11111a] border border-white/10 outline-none rounded-lg px-3 py-2 text-xs text-white"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[9px] text-white/40 uppercase font-bold block mb-1">Estado (UF) *</label>
                                      <input 
                                        type="text"
                                        maxLength={2}
                                        placeholder="Ex: SP"
                                        value={customerState}
                                        onChange={(e) => setCustomerState(e.target.value)}
                                        className="w-full bg-[#11111a] border border-white/10 outline-none rounded-lg px-3 py-2 text-xs text-white font-mono uppercase"
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="text-[9px] text-white/40 uppercase font-bold block mb-1">CEP (Opcional)</label>
                                      <input 
                                        type="text"
                                        placeholder="00000-000"
                                        value={customerCep}
                                        onChange={(e) => setCustomerCep(e.target.value)}
                                        className="w-full bg-[#11111a] border border-white/10 outline-none rounded-lg px-3 py-2 text-xs text-white font-mono"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[9px] text-white/40 uppercase font-bold block mb-1">Complemento</label>
                                      <input 
                                        type="text"
                                        placeholder="Apt, bloco..."
                                        value={customerComplement}
                                        onChange={(e) => setCustomerComplement(e.target.value)}
                                        className="w-full bg-[#11111a] border border-white/10 outline-none rounded-lg px-3 py-2 text-xs text-white"
                                      />
                                    </div>
                                  </div>

                                  <div>
                                    <label className="text-[9px] text-white/40 uppercase font-bold block mb-1">Ponto de Refer√™ncia (Opcional)</label>
                                    <input 
                                      type="text"
                                      placeholder="Ex: Pr√≥ximo √† padaria"
                                      value={customerReference}
                                      onChange={(e) => setCustomerReference(e.target.value)}
                                      className="w-full bg-[#11111a] border border-white/10 outline-none rounded-lg px-3 py-2 text-xs text-white"
                                    />
                                  </div>

                                  <div>
                                    <label className="text-[9px] text-white/40 uppercase font-bold block mb-1">Instru√ß√µes / Observa√ß√µes de Entrega</label>
                                    <textarea 
                                      placeholder="Deixe uma mensagem para o entregador ou observa√ß√µes do pedido"
                                      value={cartCustomerDetails}
                                      onChange={(e) => setCartCustomerDetails(e.target.value)}
                                      rows={2}
                                      className="w-full bg-[#11111a] border border-white/10 outline-none rounded-lg px-3 py-2 text-xs text-white resize-none"
                                    />
                                  </div>
                                </div>
                              )}

                              {/* If Retirada, show simple notes */}
                              {deliveryMethod === 'retirada' && (
                                <div>
                                  <label className="text-[10px] text-white/50 uppercase tracking-wider font-extrabold block mb-1">Instru√ß√µes / Observa√ß√µes do Pedido</label>
                                  <textarea 
                                    placeholder="Mesa, talheres ou ponto de refer√™ncia se necess√°rio"
                                    value={cartCustomerDetails}
                                    onChange={(e) => setCartCustomerDetails(e.target.value)}
                                    rows={2}
                                    className="w-full bg-[#11111a] border border-white/10 hover:border-white/20 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3 text-xs text-white resize-none"
                                  />
                                </div>
                              )}

                              {/* Forma de Pagamento */}
                              <div>
                                <label className="text-[10px] text-white/50 uppercase tracking-wider font-extrabold block mb-2">Forma de Pagamento *</label>
                                <div className="flex flex-col gap-1.5">
                                  <button 
                                    type="button"
                                    onClick={() => setPaymentMethod('pix_chave')}
                                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${paymentMethod === 'pix_chave' ? 'bg-neutral-900 text-[var(--primary)] border-[var(--primary)]/30' : 'bg-[#11111a] text-white/60 border-white/5 hover:border-white/10'}`}
                                  >
                                    <span>‚ö° PIX Chave</span>
                                    <span className="text-[9px] font-mono text-white/40 uppercase">Direto</span>
                                  </button>
                                  <button 
                                    type="button"
                                    onClick={() => setPaymentMethod('cartao_entrega')}
                                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${paymentMethod === 'cartao_entrega' ? 'bg-neutral-900 text-[var(--primary)] border-[var(--primary)]/30' : 'bg-[#11111a] text-white/60 border-white/5 hover:border-white/10'}`}
                                  >
                                    <span>üí≥ Cart√£o na Entrega</span>
                                    <span className="text-[9px] font-mono text-white/40 uppercase">Maquininha</span>
                                  </button>
                                  {deliveryMethod === 'retirada' && (
                                    <button 
                                      type="button"
                                      onClick={() => setPaymentMethod('cartao_retirada')}
                                      className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${paymentMethod === 'cartao_retirada' ? 'bg-neutral-900 text-[var(--primary)] border-[var(--primary)]/30' : 'bg-[#11111a] text-white/60 border-white/5 hover:border-white/10'}`}
                                    >
                                      <span>üè™ Cart√£o na Retirada</span>
                                      <span className="text-[9px] font-mono text-white/40 uppercase">No balc√£o</span>
                                    </button>
                                  )}
                                  <button 
                                    type="button"
                                    onClick={() => setPaymentMethod('dinheiro')}
                                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${paymentMethod === 'dinheiro' ? 'bg-neutral-900 text-[var(--primary)] border-[var(--primary)]/30' : 'bg-[#11111a] text-white/60 border-white/5 hover:border-white/10'}`}
                                  >
                                    <span>üíµ Dinheiro</span>
                                    <span className="text-[9px] font-mono text-white/40 uppercase">C√©dulas</span>
                                  </button>
                                </div>
                              </div>

                              {/* Conditional Payment Blocks */}
                              {paymentMethod === 'pix_chave' && (
                                <div className="bg-neutral-900/60 border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
                                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                    <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider">Dados de Pagamento PIX</span>
                                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-mono">Pague Direto</span>
                                  </div>
                                  
                                  <div className="text-xs flex flex-col gap-2">
                                    <div className="flex justify-between">
                                      <span className="text-white/40">Chave PIX:</span>
                                      <span className="font-mono font-bold text-white text-right break-all max-w-[200px] select-all">
                                        {company.pixKey || "Chave n√£o configurada"}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-white/40">Tipo:</span>
                                      <span className="text-white font-bold">{company.pixType || "Celular"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-white/40">Recebedor:</span>
                                      <span className="text-white font-bold text-right">{company.pixName || company.name}</span>
                                    </div>
                                    {company.pixBank && (
                                      <div className="flex justify-between">
                                        <span className="text-white/40">Institui√ß√£o:</span>
                                        <span className="text-white font-bold">{company.pixBank}</span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Copy Pix Key Button */}
                                  {company.pixKey && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        navigator.clipboard.writeText(company.pixKey);
                                        setPixCopied(true);
                                        setTimeout(() => setPixCopied(false), 2000);
                                      }}
                                      className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${pixCopied ? 'bg-emerald-500 text-white' : 'bg-white/10 hover:bg-white/15 text-white'}`}
                                    >
                                      {pixCopied ? <Check size={14} /> : <Copy size={14} />}
                                      {pixCopied ? 'Chave Copiada!' : 'Copiar Chave PIX'}
                                    </button>
                                  )}

                                  {/* File upload receipt block */}
                                  <div className="mt-1 border-t border-white/5 pt-3">
                                    <span className="text-[10px] text-white/50 block mb-1.5 font-bold">Comprovante do PIX (Opcional)</span>
                                    <div className="flex gap-2 items-center">
                                      <label className="flex-1 flex items-center justify-center gap-1.5 bg-[#11111a] border border-white/10 border-dashed hover:border-emerald-500/40 rounded-xl py-2 px-3 text-xs text-white/60 hover:text-white cursor-pointer transition-all">
                                        <ImageIcon size={14} />
                                        <span className="truncate max-w-[140px]">{attachedProofName || "Anexar Comprovante"}</span>
                                        <input 
                                          type="file" 
                                          accept="image/*" 
                                          className="hidden" 
                                          onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                              setAttachedProofName(e.target.files[0].name);
                                            }
                                          }}
                                        />
                                      </label>
                                      {attachedProofName && (
                                        <button 
                                          type="button"
                                          onClick={() => setAttachedProofName('')}
                                          className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold"
                                        >
                                          Limpar
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {paymentMethod === 'dinheiro' && (
                                <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-white font-bold">Precisa de troco?</span>
                                    <button
                                      type="button"
                                      onClick={() => setCashChangeNeeded(!cashChangeNeeded)}
                                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all ${cashChangeNeeded ? 'bg-[var(--primary)] text-black' : 'bg-white/10 text-white/60'}`}
                                    >
                                      {cashChangeNeeded ? 'Sim' : 'N√£o'}
                                    </button>
                                  </div>
                                  {cashChangeNeeded && (
                                    <div className="flex flex-col gap-1.5">
                                      <label className="text-[9px] text-white/40 uppercase font-bold">Troco para quanto?</label>
                                      <input 
                                        type="text"
                                        placeholder="Ex: R$ 50,00 ou 100,00"
                                        value={cashChangeFor}
                                        onChange={(e) => setCashChangeFor(e.target.value)}
                                        className="w-full bg-[#11111a] border border-white/10 outline-none rounded-xl px-4 py-3 text-xs text-white font-mono"
                                      />
                                    </div>
                                  )}
                                </div>
                              )}

                            </div>

                            {/* WhatsApp Submit with structured summary data */}
                            <button 
                              onClick={() => {
                                if (!cartCustomerName) {
                                  alert("Por favor, informe seu nome completo.");
                                  return;
                                }
                                if (!customerPhone) {
                                  alert("Por favor, informe seu WhatsApp / Celular.");
                                  return;
                                }
                                if (deliveryMethod === 'entrega' && (!customerStreet || !customerNumber || !customerNeighborhood || !customerCity || !customerState)) {
                                  alert("Por favor, preencha todos os campos obrigat√≥rios do endere√ßo de entrega.");
                                  return;
                                }
                                
                                const finalDeliveryFee = deliveryMethod === 'entrega' ? parseFloat(company.deliveryFee || '0') || 0 : 0;
                                const finalTotal = subtotal + finalDeliveryFee;

                                // Format perfect structured whatsapp message
                                let textMsg = `*üõí NOVO PEDIDO - ${company.name.toUpperCase()}*\n`;
                                textMsg += `====================================\n`;
                                textMsg += `*üë§ CLIENTE:* ${cartCustomerName}\n`;
                                textMsg += `*üì± WHATSAPP:* ${customerPhone}\n`;
                                textMsg += `*üõµ FORMA:* ${deliveryMethod === 'entrega' ? "ENTREGA" : "RETIRADA NA LOJA"}\n`;
                                
                                if (deliveryMethod === 'entrega') {
                                  textMsg += `------------------------------------\n`;
                                  textMsg += `*üìç ENDERE√áO DE ENTREGA:*\n`;
                                  textMsg += `*Rua/Av:* ${customerStreet}, N¬∫ ${customerNumber}\n`;
                                  textMsg += `*Bairro:* ${customerNeighborhood}\n`;
                                  textMsg += `*Cidade/UF:* ${customerCity} - ${customerState.toUpperCase()}\n`;
                                  if (customerCep) textMsg += `*CEP:* ${customerCep}\n`;
                                  if (customerComplement) textMsg += `*Comp:* ${customerComplement}\n`;
                                  if (customerReference) textMsg += `*Ref:* ${customerReference}\n`;
                                }
                                
                                if (cartCustomerDetails) {
                                  textMsg += `------------------------------------\n`;
                                  textMsg += `*üìù OBSERVA√á√ïES:*\n${cartCustomerDetails}\n`;
                                }
                                
                                textMsg += `====================================\n`;
                                textMsg += `*üí≥ PAGAMENTO:* `;
                                if (paymentMethod === 'pix_chave') textMsg += `PIX CHAVE`;
                                else if (paymentMethod === 'pix_qrcode') textMsg += `PIX QR CODE`;
                                else if (paymentMethod === 'cartao_entrega') textMsg += `CART√ÉO NA ENTREGA`;
                                else if (paymentMethod === 'cartao_retirada') textMsg += `CART√ÉO NA RETIRADA`;
                                else if (paymentMethod === 'dinheiro') {
                                  textMsg += `DINHEIRO`;
                                  if (cashChangeNeeded && cashChangeFor) {
                                    textMsg += ` (Troco para ${cashChangeFor})`;
                                  }
                                }
                                textMsg += `\n`;
                                
                                if (attachedProofName) {
                                  textMsg += `*üìé COMPROVANTE PIX:* Anexado (${attachedProofName})\n`;
                                }
                                
                                textMsg += `====================================\n`;
                                textMsg += `*üì¶ ITENS PEDIDOS:*\n`;
                                
                                cartItemsArr.forEach((c: any) => {
                                  const unitVal = c.computedUnitPrice ?? (c.item.price ? parseFloat(c.item.price) : 0);
                                  const totalVal = unitVal * c.count;
                                  textMsg += `‚Ä¢ ${c.count}x ${c.item.name}`;
                                  if (c.selectedSize) textMsg += ` [Tam/Num: ${c.selectedSize}]`;
                                  if (c.selectedColor) textMsg += ` [Cor: ${c.selectedColor}]`;
                                  textMsg += ` - R$ ${totalVal.toFixed(2).replace('.', ',')}\n`;
                                  if (c.selectedOptions && c.selectedOptions.length > 0) {
                                    textMsg += `   ‚îî ‚ûï Adicionais: ${c.selectedOptions.join(', ')}\n`;
                                  }
                                  if (c.itemNote && c.itemNote.trim()) {
                                    textMsg += `   ‚îî ‚úçÔ∏è Obs: ${c.itemNote.trim()}\n`;
                                  }
                                });
                                
                                textMsg += `====================================\n`;
                                textMsg += `*Subtotal:* R$ ${subtotal.toFixed(2).replace('.', ',')}\n`;
                                if (finalDeliveryFee > 0) {
                                  textMsg += `*Taxa de Entrega:* R$ ${finalDeliveryFee.toFixed(2).replace('.', ',')}\n`;
                                }
                                textMsg += `*TOTAL GERAL:* R$ ${finalTotal.toFixed(2).replace('.', ',')}\n\n`;
                                textMsg += `Enviado atrav√©s do portal *${appData.siteInfo.name}*!\n`;
                                textMsg += `Por favor, confirme meu pedido. Obrigado!`;
                                
                                window.open(`https://wa.me/${company.wa.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(textMsg)}`, '_blank');
                              }}
                              className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest text-center flex items-center justify-center gap-2 transition-all duration-300 shadow-lg mt-2 cursor-pointer shadow-emerald-500/10"
                            >
                              <Smartphone size={14} /> Confirmar Pedido (WhatsApp)
                            </button>
                            <p className="text-[10px] text-white/30 text-center leading-relaxed">
                              O checkout √© finalizado de forma r√°pida e segura direto no WhatsApp do estabelecimento comercial, sem taxas na plataforma!
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Option B: Landing Quote form (for service-landing pages) */}
                  {siteType === 'servico' && (
                    <div id="quote-side-form" className="bg-[#0b0c10] border border-white/5 rounded-3xl p-6 sm:p-8 shadow-xl relative sticky top-6">
                      <h3 className="text-sm font-black font-mono uppercase tracking-[0.2em] text-[var(--primary)]">SOLICITAR OR√áAMENTO</h3>
                      <p className="text-xs text-white/45 mt-2 leading-relaxed">Envie sua d√∫vida ou descreva o servi√ßo que voc√™ precisa receber diretamente para o nosso suporte oficial!</p>
                      
                      <div className="flex flex-col gap-4 mt-6">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-white/50 uppercase tracking-widest font-extrabold">Seu Nome Completo</label>
                          <input 
                            type="text"
                            placeholder="Informe seu nome"
                            id="quote-sender-name"
                            className="w-full bg-[#11111a] border border-white/10 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3 text-xs text-white"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-white/50 uppercase tracking-widest font-extrabold">Qual servi√ßo/atividade voc√™ deseja?</label>
                          <select 
                            id="quote-service-select"
                            className="w-full bg-[#11111a] border border-white/10 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3 text-xs text-white"
                          >
                            <option value="Geral">Consulta Geral</option>
                            {items.map((it: any) => (
                              <option key={it.id || it.name} value={it.name}>{it.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-white/50 uppercase tracking-widest font-extrabold">Descreva as Necessidades / Detalhes</label>
                          <textarea 
                            placeholder="Descreva o que voc√™ precisa ou suas d√∫vidas..."
                            id="quote-sender-details"
                            rows={3}
                            className="w-full bg-[#11111a] border border-white/10 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3 text-xs text-white resize-none"
                          />
                        </div>

                        <button 
                          onClick={() => {
                            const clientName = (document.getElementById('quote-sender-name') as HTMLInputElement)?.value;
                            const serv = (document.getElementById('quote-service-select') as HTMLSelectElement)?.value;
                            const notes = (document.getElementById('quote-sender-details') as HTMLTextAreaElement)?.value;
                            
                            if (!clientName || !notes) {
                              alert("Por favor, informe seu nome e descreva os detalhes do seu pedido de or√ßamento.");
                              return;
                            }
                            
                            let textMsg = `*üìã PEDIDO DE OR√áAMENTO COMERCIAL - ${company.name.toUpperCase()}*\n`;
                            textMsg += `------------------------------------\n`;
                            textMsg += `*Cliente:* ${clientName}\n`;
                            textMsg += `*Servi√ßo Requerido:* ${serv}\n`;
                            textMsg += `------------------------------------\n`;
                            textMsg += `*Mensagem/Detalhes:*\n${notes}\n\n`;
                            textMsg += `Solicita√ß√£o realizada via atendimento digital no portal *${appData.siteInfo.name}*!`;
                            
                            window.open(`https://wa.me/${company.wa.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(textMsg)}`, '_blank');
                          }}
                          className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest text-center flex items-center justify-center gap-2 transition-all duration-300 shadow-md cursor-pointer mt-2"
                        >
                          <Smartphone size={14} /> Enviar no WhatsApp
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Option C: Agendamento form (for scheduling pages) */}
                  {siteType === 'agendamento' && (
                    <div className="bg-[#0b0c10] border border-white/5 rounded-3xl p-6 sm:p-8 shadow-xl relative sticky top-6">
                      <h3 className="text-sm font-black font-mono uppercase tracking-[0.2em] text-[var(--primary)] flex items-center gap-2">
                        <Calendar size={16} /> AGENDAMENTO DE HOR√ÅRIO
                      </h3>
                      <p className="text-xs text-white/45 mt-2 leading-relaxed">
                        Escolha o servi√ßo, selecione a data e o hor√°rio desejados e confirme o seu agendamento direto no WhatsApp!
                      </p>
                      
                      <div className="flex flex-col gap-4 mt-6">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-white/50 uppercase tracking-widest font-extrabold">Seu Nome Completo *</label>
                          <input 
                            type="text"
                            placeholder="Informe seu nome"
                            id="booking-sender-name"
                            className="w-full bg-[#11111a] border border-white/10 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3 text-xs text-white"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-white/50 uppercase tracking-widest font-extrabold">Seu WhatsApp / Celular *</label>
                          <input 
                            type="text"
                            placeholder="(00) 00000-0000"
                            id="booking-sender-phone"
                            className="w-full bg-[#11111a] border border-white/10 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3 text-xs text-white font-mono"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-white/50 uppercase tracking-widest font-extrabold">Servi√ßo Desejado *</label>
                          <select 
                            id="booking-service-select"
                            className="w-full bg-[#11111a] border border-white/10 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3 text-xs text-white"
                          >
                            <option value="Atendimento Geral">Atendimento Geral</option>
                            {items.map((it: any) => (
                              <option key={it.id || it.name} value={it.name}>{it.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] text-white/50 uppercase tracking-widest font-extrabold">Data *</label>
                            <input 
                              type="date"
                              id="booking-date"
                              defaultValue={new Date().toISOString().split('T')[0]}
                              className="w-full bg-[#11111a] border border-white/10 focus:border-[var(--primary)] outline-none rounded-xl px-3 py-2.5 text-xs text-white font-mono"
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] text-white/50 uppercase tracking-widest font-extrabold">Hor√°rio *</label>
                            <input 
                              type="time"
                              id="booking-time"
                              defaultValue="09:00"
                              className="w-full bg-[#11111a] border border-white/10 focus:border-[var(--primary)] outline-none rounded-xl px-3 py-2.5 text-xs text-white font-mono"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-white/50 uppercase tracking-widest font-extrabold">Observa√ß√µes / Prefer√™ncias</label>
                          <textarea 
                            placeholder="Ex: Prefer√™ncia de profissional, orienta√ß√µes ou observa√ß√µes..."
                            id="booking-sender-notes"
                            rows={2}
                            className="w-full bg-[#11111a] border border-white/10 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3 text-xs text-white resize-none"
                          />
                        </div>

                        <button 
                          onClick={() => {
                            const clientName = (document.getElementById('booking-sender-name') as HTMLInputElement)?.value;
                            const clientPhone = (document.getElementById('booking-sender-phone') as HTMLInputElement)?.value;
                            const serv = (document.getElementById('booking-service-select') as HTMLSelectElement)?.value;
                            const dateVal = (document.getElementById('booking-date') as HTMLInputElement)?.value;
                            const timeVal = (document.getElementById('booking-time') as HTMLInputElement)?.value;
                            const notes = (document.getElementById('booking-sender-notes') as HTMLTextAreaElement)?.value;
                            
                            if (!clientName || !clientPhone) {
                              alert("Por favor, informe seu nome e WhatsApp.");
                              return;
                            }
                            if (!dateVal || !timeVal) {
                              alert("Por favor, selecione a data e o hor√°rio desejados.");
                              return;
                            }

                            const formattedDate = dateVal.split('-').reverse().join('/');
                            
                            let textMsg = `*üìÖ SOLICITA√á√ÉO DE AGENDAMENTO - ${company.name.toUpperCase()}*\n`;
                            textMsg += `====================================\n`;
                            textMsg += `*Cliente:* ${clientName}\n`;
                            textMsg += `*WhatsApp:* ${clientPhone}\n`;
                            textMsg += `*Servi√ßo:* ${serv}\n`;
                            textMsg += `*Data:* ${formattedDate}\n`;
                            textMsg += `*Hor√°rio:* ${timeVal}hs\n`;
                            if (notes) {
                              textMsg += `*Observa√ß√µes:* ${notes}\n`;
                            }
                            textMsg += `====================================\n`;
                            textMsg += `Gostaria de confirmar a disponibilidade deste hor√°rio no portal *${appData.siteInfo.name}*!`;
                            
                            window.open(`https://wa.me/${company.wa.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(textMsg)}`, '_blank');
                          }}
                          className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest text-center flex items-center justify-center gap-2 transition-all duration-300 shadow-md cursor-pointer mt-2"
                        >
                          <Calendar size={14} /> Confirmar Agendamento (WhatsApp)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* =========================================================================
          INTERACTIVE SCREEN: PAINEL DO ANUNCIANTE (AUTH / DASHBOARD)
          ========================================================================= */}
      <AnimatePresence>
        {isAdPortalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[1250] overflow-y-auto font-jakarta flex items-center justify-center p-4"
          >
            {/* Modal Box */}
            <div className="bg-[#0b0c10] border border-white/10 rounded-3xl w-full max-w-5xl shadow-2xl p-6 sm:p-8 flex flex-col relative max-h-[90vh] overflow-y-auto">
              
              {/* Close Panel Button */}
              <button 
                onClick={() => {
                  setIsAdPortalOpen(false);
                  setEditingItemIndex(null);
                }}
                className="absolute top-5 right-5 text-white/50 hover:text-white hover:scale-105 transition-all p-2 bg-white/5 hover:bg-white/10 rounded-full"
              >
                <X size={18} />
              </button>

              {/* SECTION A: IF NOT LOGGED IN SHOW AUTH LOGIN / REGISTER */}
              {isAutoLoggingIn ? (
                <div className="flex flex-col items-center justify-center py-24 text-white mx-auto">
                  <div className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-xs font-semibold tracking-widest text-white/70 uppercase">Verificando suas credenciais...</p>
                  <p className="text-[10px] text-white/40 mt-1">Acessando seu painel de forma segura</p>
                </div>
              ) : !currentAdvertiser ? (
                <div className="w-full max-w-md mx-auto py-8">
                  {/* Mode Selector */}
                  {!hideAdvertiserAuth ? (
                    <div className="flex gap-4 p-1 bg-white/5 rounded-2xl mb-8">
                      <button 
                        onClick={() => setAdLoginMode('login')}
                        className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-200 ${adLoginMode === 'login' ? 'bg-[var(--primary)] text-black' : 'text-white hover:bg-white/5'}`}
                      >
                        Acessar Meu Painel
                      </button>
                      <button 
                        onClick={() => setAdLoginMode('register')}
                        className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-200 ${adLoginMode === 'register' ? 'bg-[var(--primary)] text-black' : 'text-white hover:bg-white/5'}`}
                      >
                        Cadastrar Neg√≥cio
                      </button>
                    </div>
                  ) : (
                    // If hideAdvertiserAuth is true, show a clean header or notice
                    <div className="text-center mb-6">
                      <span className="text-[10px] font-bold text-amber-500 tracking-[0.2em] uppercase font-mono">PORTAL DO ANUNCIANTE</span>
                    </div>
                  )}

                  {/* Mode 1: Advertiser Login Form */}
                  {adLoginMode === 'login' || hideAdvertiserAuth ? (
                    <div className="flex flex-col gap-4">
                      <div>
                        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                          üóùÔ∏è Login do Anunciante
                        </h2>
                        <p className="text-xs text-white/50 mt-1">Gerencie seu perfil, cat√°logo e pedidos de forma profissional.</p>
                      </div>

                      <div className="flex flex-col gap-1.5 mt-2">
                        <label className="text-[10px] text-white/50 uppercase tracking-widest font-black">E-mail Cadastrado</label>
                        <input 
                          type="email"
                          placeholder="Informe seu email"
                          value={adLoginForm.email}
                          onChange={(e) => setAdLoginForm(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full bg-[#11111a] border border-white/10 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3.5 text-xs text-white"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-white/50 uppercase tracking-widest font-black">Senha</label>
                        <input 
                          type="password"
                          placeholder="Digite sua senha cadastrada"
                          value={adLoginForm.password}
                          onChange={(e) => setAdLoginForm(prev => ({ ...prev, password: e.target.value }))}
                          onKeyDown={async (e) => {
                            if (e.key === 'Enter') {
                              // Trigger login
                              const email = adLoginForm.email.toLowerCase().trim();
                              const pass = adLoginForm.password;
                              if (!email || !pass) return;
                              setIsAdLoading(true);
                              try {
                                const q = query(collection(db, 'advertisers'), where('email', '==', email));
                                const snap = await getDocs(q);
                                if (snap.empty) {
                                  alert("Nenhum anunciante cadastrado com este e-mail.");
                                  return;
                                }
                                const adDoc = snap.docs[0];
                                const docData = adDoc.data();
                                if (docData.password === pass) {
                                  if (docData.isBlocked || docData.company?.isBlocked) {
                                    alert("Esta conta foi bloqueada pelo administrador.");
                                    return;
                                  }
                                  localStorage.setItem('ad_email', email);
                                  localStorage.setItem('ad_password', pass);
                                  setCurrentAdvertiser({
                                    id: adDoc.id,
                                    ...docData
                                  });
                                  alert("Login realizado com sucesso! Bem-vindo!");
                                } else {
                                  alert("Senha incorreta. Tente novamente.");
                                }
                              } catch (err) {
                                console.error(err);
                                alert("Erro ao tentar fazer login.");
                              } finally {
                                setIsAdLoading(false);
                              }
                            }
                          }}
                          className="w-full bg-[#11111a] border border-white/10 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3.5 text-xs text-white"
                        />
                      </div>

                      <button 
                        onClick={async () => {
                          const email = adLoginForm.email.toLowerCase().trim();
                          const pass = adLoginForm.password;
                          if (!email || !pass) {
                            alert("Preencha todos os campos.");
                            return;
                          }
                          setIsAdLoading(true);
                          try {
                            const q = query(collection(db, 'advertisers'), where('email', '==', email));
                            const snap = await getDocs(q);
                            if (snap.empty) {
                              alert("Nenhum anunciante cadastrado com este e-mail.");
                              return;
                            }
                            const adDoc = snap.docs[0];
                            const docData = adDoc.data();
                            if (docData.password === pass) {
                              if (docData.isBlocked || docData.company?.isBlocked) {
                                alert("Esta conta foi bloqueada pelo administrador.");
                                return;
                              }
                              localStorage.setItem('ad_email', email);
                              localStorage.setItem('ad_password', pass);
                              setCurrentAdvertiser({
                                id: adDoc.id,
                                ...docData
                              });
                              alert("Login realizado com sucesso! Bem-vindo!");
                            } else {
                              alert("Senha incorreta. Tente novamente.");
                            }
                          } catch (err) {
                            console.error(err);
                            alert("Erro ao tentar fazer login.");
                          } finally {
                            setIsAdLoading(false);
                          }
                        }}
                        disabled={isAdLoading}
                        className="w-full bg-[var(--primary)] hover:brightness-110 text-black py-4 rounded-xl font-bold text-xs uppercase tracking-widest text-center transition-all duration-200 mt-2 flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-yellow-500/10"
                      >
                        {isAdLoading ? "Carregando..." : "Entrar no Meu Painel"}
                      </button>
                    </div>
                  ) : (
                    // Mode 2: Advertiser Registration Form
                    <div className="flex flex-col gap-4">
                      <div>
                        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                          üöÄ Anuncie e Destaque Sua Empresa no Portal
                        </h2>
                        <p className="text-xs text-white/50 mt-1">Sua empresa ser√° listada automaticamente de forma profissional e interativa.</p>
                        <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-3.5 text-[11px] text-emerald-300 mt-3 font-medium leading-relaxed">
                          ‚ö° <strong>Presen√ßa Comercial Garantida:</strong> Sua empresa ser√° divulgada na vitrine oficial da cidade para milhares de potenciais clientes todos os dias!
                        </div>

                        {/* Video Tutorial Box */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mt-4 overflow-hidden flex flex-col gap-3">
                          <div className="flex items-center gap-2 text-white font-semibold text-xs tracking-wide uppercase">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            üé• V√≠deo Tutorial: Passo a Passo do Cadastro
                          </div>
                          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black/60 border border-white/10">
                            <iframe 
                              className="absolute top-0 left-0 w-full h-full"
                              src="https://www.youtube.com/embed/ksjH0BOP8Kw" 
                              title="Tutorial de Cadastro"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                              allowFullScreen
                            ></iframe>
                          </div>
                          <p className="text-[10px] text-white/40 leading-relaxed">
                            Assista ao v√≠deo de 1 minuto acima para aprender a preencher corretamente o cadastro e publicar seu mini-site instantaneamente!
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-white/50 uppercase font-black">Seu E-mail de Usu√°rio</label>
                          <input 
                            type="email"
                            placeholder="email@link.com"
                            value={adRegisterForm.email}
                            onChange={(e) => setAdRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full bg-[#11111a] border border-white/10 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3 text-xs text-white"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-white/50 uppercase font-black">Sua Senha de Acesso</label>
                          <input 
                            type="password"
                            placeholder="Crie uma senha forte"
                            value={adRegisterForm.password}
                            onChange={(e) => setAdRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                            className="w-full bg-[#11111a] border border-white/10 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3 text-xs text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-white/50 uppercase font-black">Nome do Estabelecimento / Comercial</label>
                          <input 
                            type="text"
                            placeholder="Ex: Mercadinho Brasil"
                            value={adRegisterForm.name}
                            onChange={(e) => setAdRegisterForm(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full bg-[#11111a] border border-white/10 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3 text-xs text-white"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-white/50 uppercase font-black">WhatsApp Comercial (com DDD)</label>
                          <input 
                            type="text"
                            placeholder="5585992900000"
                            value={adRegisterForm.wa}
                            onChange={(e) => setAdRegisterForm(prev => ({ ...prev, wa: e.target.value }))}
                            className="w-full bg-[#11111a] border border-white/10 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3 text-xs text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-white/50 uppercase font-black">Categoria Comercial</label>
                          <select 
                            value={(appData?.categories || []).some((cat: any) => cat.name === adRegisterForm.category) ? adRegisterForm.category : "__custom__"}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "__custom__") {
                                setAdRegisterForm(prev => ({ ...prev, category: '' }));
                              } else {
                                setAdRegisterForm(prev => ({ ...prev, category: val }));
                              }
                            }}
                            className="w-full bg-[#11111a] border border-white/10 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3 text-xs text-white"
                          >
                            {(appData?.categories || []).map((cat: any) => (
                              <option key={cat.name} value={cat.name}>{cat.name}</option>
                            ))}
                            <option value="__custom__">‚úçÔ∏è Outro (Digitar nicho personalizado...)</option>
                          </select>
                          
                          {! (appData?.categories || []).some((cat: any) => cat.name === adRegisterForm.category) && (
                            <div className="flex flex-col gap-1.5 mt-2">
                              <label className="text-[9px] text-[var(--primary)] uppercase font-black">Escreva o Nome do seu Nicho *</label>
                              <input 
                                type="text"
                                value={adRegisterForm.category}
                                onChange={(e) => setAdRegisterForm(prev => ({ ...prev, category: e.target.value }))}
                                placeholder="Ex: Pizzaria, Fretes, Ar Condicionado, Inform√°tica..."
                                className="w-full bg-[#11111a] border border-[var(--primary)]/50 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3 text-xs text-white"
                                required
                              />
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-white/50 uppercase font-black">Estilo do seu Mini-Site</label>
                          <select 
                            value={adRegisterForm.type}
                            onChange={(e) => setAdRegisterForm(prev => ({ ...prev, type: e.target.value }))}
                            className="w-full bg-[#11111a] border border-white/10 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3 text-xs text-white"
                          >
                            <option value="loja">üõçÔ∏è Loja Virtual (Produtos com pre√ßo e carrinho)</option>
                            <option value="cardapio">üçî Card√°pio / Lanchonete (Itens aliment√≠cios e pedidos)</option>
                            <option value="servico">üõ†Ô∏è Prestador de Servi√ßos (Listado de servi√ßos, fotos, bot√£o or√ßamentos)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] text-white/50 uppercase font-black">Link da Logo (Opcional)</label>
                            <DirectFileUploadButton 
                              label="üì∑ Escolher do Celular" 
                              onUploadSuccess={(url) => setAdRegisterForm(prev => ({ ...prev, logo: url }))} 
                            />
                          </div>
                          <input 
                            type="text"
                            placeholder="Cole a URL ou selecione uma foto do celular acima"
                            value={adRegisterForm.logo}
                            onChange={(e) => setAdRegisterForm(prev => ({ ...prev, logo: e.target.value }))}
                            className="w-full bg-[#11111a] border border-white/10 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3 text-xs text-white"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-white/50 uppercase font-black">Perfil do Instagram (Opcional)</label>
                          <input 
                            type="text"
                            placeholder="https://instagram.com/seu_perfil"
                            value={adRegisterForm.ig}
                            onChange={(e) => setAdRegisterForm(prev => ({ ...prev, ig: e.target.value }))}
                            className="w-full bg-[#11111a] border border-white/10 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3 text-xs text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-white/50 uppercase font-black">Estado (UF) *</label>
                          <select 
                            value={adRegisterForm.state}
                            onChange={(e) => setAdRegisterForm(prev => ({ ...prev, state: e.target.value }))}
                            className="w-full bg-[#11111a] border border-white/10 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3 text-xs text-white"
                            required
                          >
                            <option value="">Selecione o Estado</option>
                            {BRAZIL_STATES.map(st => (
                              <option key={st.uf} value={st.uf}>{st.uf} - {st.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-white/50 uppercase font-black">Cidade *</label>
                          <input 
                            type="text"
                            placeholder="Ex: Fortaleza, S√£o Paulo..."
                            value={adRegisterForm.city}
                            onChange={(e) => setAdRegisterForm(prev => ({ ...prev, city: e.target.value }))}
                            className="w-full bg-[#11111a] border border-white/10 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3 text-xs text-white"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-white/50 uppercase font-black">Descri√ß√£o Curta do Neg√≥cio</label>
                        <textarea 
                          placeholder="Ex: Oferecemos o melhor da moda e confec√ß√µes na regi√£o com descontos exclusivos e promo√ß√µes todos os dias."
                          rows={2}
                          value={adRegisterForm.desc}
                          onChange={(e) => setAdRegisterForm(prev => ({ ...prev, desc: e.target.value }))}
                          className="w-full bg-[#11111a] border border-white/10 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3 text-xs text-white resize-none"
                        />
                      </div>

                      <button 
                        onClick={async () => {
                          const { email, password, name, wa, category, type, logo, ig, desc, state, city } = adRegisterForm;
                          if (!email || !password || !name || !wa || !state || !city) {
                            alert("Por favor, preencha todos os campos obrigat√≥rios (E-mail, Senha, Nome da Empresa, WhatsApp, Estado e Cidade).");
                            return;
                          }
                          
                          setIsAdLoading(true);
                          try {
                            const activeSlug = slugify(name);
                            const advertiserRef = doc(db, 'advertisers', activeSlug);
                            
                            // Check uniqueness
                            const checkRef = await getDoc(advertiserRef);
                            if (checkRef.exists()) {
                              alert("J√° existe uma empresa cadastrada com este nome comercial. Escolha um nome exclusivo.");
                              setIsAdLoading(false);
                              return;
                            }
                            
                            const creationDate = new Date();
                            const trialDays = 20;
                            const expiryDate = new Date(creationDate.getTime() + (trialDays * 24 * 60 * 60 * 1000));
                            const expiresAtStr = expiryDate.toISOString().split('T')[0];
                            const createdAtStr = creationDate.toISOString();

                            const newCompany = {
                              id: activeSlug,
                              name: name.trim(),
                              category: category,
                              desc: desc.trim() || 'Sem descri√ß√£o cadastrada.',
                              logo: logo.trim() || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150',
                              wa: wa.replace(/[^0-9]/g, ''),
                              ig: ig.trim() || '#',
                              type: type,
                              state: state.toUpperCase(),
                              uf: state.toUpperCase(),
                              city: city.trim(),
                              items: [],
                              featured: false,
                              active: true,
                              expiresAt: expiresAtStr,
                              createdAt: createdAtStr
                            };
                            
                            // Save to collection
                            await setDoc(advertiserRef, {
                              email: email.toLowerCase().trim(),
                              password: password,
                              tenantId: slugify(tenantId || 'fortaleza'),
                              expiresAt: expiresAtStr,
                              createdAt: createdAtStr,
                              company: newCompany
                            });
                            
                            localStorage.setItem('ad_email', email);
                            localStorage.setItem('ad_password', password);
                            
                            // Load to active advertiser
                            setCurrentAdvertiser({
                              id: activeSlug,
                              email: email.toLowerCase().trim(),
                              password: password,
                              tenantId: slugify(tenantId || 'fortaleza'),
                              expiresAt: expiresAtStr,
                              createdAt: createdAtStr,
                              company: newCompany
                            });
                            
                            // Refresh dynamic list
                            await fetchAdvertisers(tenantId || 'fortaleza');
                            alert("Sua empresa foi cadastrada com total sucesso e j√° est√° publicada online no portal!");
                          } catch (err) {
                            console.error("Cadastro falhou:", err);
                            alert("Erro ao tentar cadastrar seu neg√≥cio. Verifique os campos e tente novamente.");
                          } finally {
                            setIsAdLoading(false);
                          }
                        }}
                        disabled={isAdLoading}
                        className="w-full bg-[#25D366] hover:brightness-110 text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest text-center transition-all duration-200 mt-2 cursor-pointer shadow-lg shadow-emerald-500/10"
                      >
                        {isAdLoading ? "Salvando informa√ß√µes..." : "Completar Cadastro & Publicar"}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // SECTION B: IF AUTHENTICATED SHOW ADVERTISER DASHBOARD
                <div className="flex flex-col gap-6">
                  {/* Registration Confirmation Banner & Public Preview Link */}
                  <div className="bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/15 border-2 border-emerald-500/40 rounded-2xl p-5 md:p-6 shadow-[0_0_30px_rgba(16,185,129,0.15)] flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-black flex items-center justify-center text-2xl font-black shrink-0 shadow-lg">
                        üéâ
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-black text-white leading-snug">
                          Sua empresa j√° est√° publicada e vis√≠vel para milhares de clientes!
                        </h3>
                        <p className="text-xs text-white/70 mt-1 font-medium">
                          Seu perfil comercial e bot√£o de WhatsApp est√£o ativos no guia da sua cidade.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAdPortalOpen(false);
                          setActiveMiniSiteCompany(currentAdvertiser.company);
                        }}
                        className="bg-emerald-500 hover:bg-emerald-400 text-black px-5 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer"
                      >
                        üëÅÔ∏è Ver Perfil P√∫blico
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const shareUrl = `${window.location.origin}/#/${tenantId || 'fortaleza'}?id=${currentAdvertiser.company.id || slugify(currentAdvertiser.company.name)}`;
                          navigator.clipboard.writeText(shareUrl);
                          alert("Link do seu perfil comercial copiado!");
                        }}
                        className="bg-white/10 hover:bg-white/20 text-white border border-white/10 px-4 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer"
                      >
                        üîó Copiar Link
                      </button>
                    </div>
                  </div>

                  {/* Dashboard Header Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5 mt-4">
                    <div>
                      <h2 className="text-2xl font-black text-white tracking-tight flex flex-wrap items-center gap-1.5">
                        ‚öôÔ∏è Painel de Controle ‚Ä¢ {currentAdvertiser.company.name}
                        {user?.isAdmin && (
                          <span className="bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md ml-2 animate-pulse">
                            Modo Administrador
                          </span>
                        )}
                      </h2>
                      <p className="text-xs text-white/50">Edite seu perfil e seus servi√ßos de forma independente, as atualiza√ß√µes s√£o autom√°ticas!</p>
                    </div>
                    <button 
                      onClick={() => {
                        localStorage.removeItem('ad_email');
                        localStorage.removeItem('ad_password');
                        setCurrentAdvertiser(null);
                        setEditingItemIndex(null);
                        alert("Sess√£o finalizada.");
                      }}
                      className="inline-flex items-center gap-1.5 self-start bg-red-600/10 border border-red-500/20 text-red-400 hover:bg-red-600 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150"
                    >
                      <LogOut size={13} /> Sair do Painel
                    </button>
                  </div>

                  {/* Plan Status Banner */}
                  {isAdExpired ? (
                    <div className="bg-red-500/15 border border-red-500/30 rounded-2xl p-5 md:p-6 text-center shadow-lg">
                      <span className="text-3xl">‚ö†Ô∏è</span>
                      <h3 className="text-lg font-black text-white uppercase mt-2">Conta Suspensa / Bloqueada</h3>
                      <p className="text-xs text-white/70 mt-2 max-w-lg mx-auto leading-relaxed">
                        Sua conta foi suspensa temporariamente. Para reativar o seu acesso e continuar gerenciando seus produtos, entre em contato com o suporte oficial.
                      </p>
                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        <a 
                          href={`https://wa.me/${appData?.siteInfo?.phone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Ol√°! Preciso de ajuda para reativar minha conta ${currentAdvertiser?.company?.name}.`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-150 shadow decoration-transparent"
                        >
                          üí¨ Falar com Suporte no WhatsApp
                        </a>
                      </div>
                    </div>
                  ) : !currentAdvertiser?.company?.hasPlan ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-left">
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded font-black uppercase tracking-widest">‚úî An√∫ncio Essencial Ativo</span>
                        <p className="text-xs text-white/80 mt-2">
                          Sua empresa possui <strong>an√∫ncio ativo no portal</strong>! Quer aparecer no topo absoluto e multiplicar seus clientes no WhatsApp?
                        </p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setIsCheckoutOpen(true)}
                        className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:brightness-110 text-black rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-150 shrink-0 cursor-pointer shadow-lg"
                      >
                        ‚≠ê Ativar Plano Premium
                      </button>
                    </div>
                  ) : (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-left">
                        <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2.5 py-1 rounded font-black uppercase tracking-widest">‚≠ê Plano Premium VIP Ativo</span>
                        <p className="text-xs text-white/80 mt-2">
                          Sua empresa possui <strong>prioridade m√°xima de exibi√ß√£o</strong> no portal e no Chat Interno!
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Share Link Card */}
                  <div className="bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 border border-white/5 rounded-3xl p-5 md:p-6 shadow-xl flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] shrink-0">
                        <Share2 size={18} />
                      </div>
                      <div>
                        <h3 className="text-xs font-black font-mono uppercase tracking-[0.2em] text-[var(--primary)]">Link de Divulga√ß√£o Oficial</h3>
                        <p className="text-[11px] text-white/50 mt-0.5">Use este link exclusivo e bonito para divulgar sua empresa nas redes sociais!</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch gap-2 bg-[#11111a] border border-white/10 rounded-2xl p-2.5">
                      <input 
                        type="text" 
                        readOnly 
                        value={`${window.location.origin}/#/${tenantId || 'fortaleza'}?id=${currentAdvertiser?.company?.id || slugify(currentAdvertiser?.company?.name || '') || currentAdvertiser?.id}`}
                        className="flex-1 bg-transparent border-none outline-none text-xs text-white/90 font-mono px-2 py-1 select-all"
                      />
                      <button
                        onClick={() => {
                          const shareId = currentAdvertiser?.company?.id || slugify(currentAdvertiser?.company?.name || '') || currentAdvertiser?.id;
                          const shareUrl = `${window.location.origin}/#/${tenantId || 'fortaleza'}?id=${shareId}`;
                          navigator.clipboard.writeText(shareUrl);
                          setCopiedAdLink(true);
                          setTimeout(() => setCopiedAdLink(false), 2500);
                        }}
                        className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all duration-200 flex items-center justify-center gap-1.5 shrink-0 select-none ${
                          copiedAdLink 
                            ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                            : 'bg-[var(--primary)] hover:bg-[#ffe066] text-black shadow-lg shadow-[var(--primary)]/10'
                        }`}
                      >
                        {copiedAdLink ? (
                          <>‚úÖ Copiado!</>
                        ) : (
                          <>üìã Copiar Link</>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Tabs Nav */}
                  <div className="flex gap-2 border-b border-white/5 pb-1 overflow-x-auto">
                    <button 
                      onClick={() => { setAdDashboardTab('metricas'); setEditingItemIndex(null); }}
                      className={`text-xs font-black uppercase tracking-wider pb-3 px-3 transition-all border-b-2 hover:text-white shrink-0 cursor-pointer ${adDashboardTab === 'metricas' ? 'border-[var(--primary)] text-white' : 'border-transparent text-white/40'}`}
                    >
                      üìä M√©tricas & Visibilidade
                    </button>
                    <button 
                      onClick={() => { setAdDashboardTab('perfil'); setEditingItemIndex(null); }}
                      className={`text-xs font-black uppercase tracking-wider pb-3 px-3 transition-all border-b-2 hover:text-white shrink-0 cursor-pointer ${adDashboardTab === 'perfil' ? 'border-[var(--primary)] text-white' : 'border-transparent text-white/40'}`}
                    >
                      ‚öôÔ∏è Perfil & Dados
                    </button>
                    <button 
                      onClick={() => { setAdDashboardTab('catalogo'); setEditingItemIndex(null); }}
                      className={`text-xs font-black uppercase tracking-wider pb-3 px-3 transition-all border-b-2 hover:text-white shrink-0 cursor-pointer ${adDashboardTab === 'catalogo' ? 'border-[var(--primary)] text-white' : 'border-transparent text-white/40'}`}
                    >
                      üì¶ Produtos & Servi√ßos ({currentAdvertiser.company.items?.length || 0})
                    </button>
                    <button 
                      onClick={() => { setAdDashboardTab('plano'); setEditingItemIndex(null); }}
                      className={`text-xs font-black uppercase tracking-wider pb-3 px-3 transition-all border-b-2 hover:text-white shrink-0 cursor-pointer ${adDashboardTab === 'plano' ? 'border-[var(--primary)] text-white' : 'border-transparent text-white/40'}`}
                    >
                      üíé Meu Plano & Benef√≠cios
                    </button>
                  </div>

                  {/* Tab 1: Metrics & Score de Visibilidade */}
                  {adDashboardTab === 'metricas' && (() => {
                    const { score, checklist } = calculateVisibilityScore(currentAdvertiser.company);
                    const currentPlan = getCompanyPlanType(currentAdvertiser.company);
                    const rankInfo = getCompanyCategoryRanking(currentAdvertiser.company, displayedCompanies);
                    const views = Number(currentAdvertiser.company.views || 0);

                    return (
                      <div className="flex flex-col gap-6">
                        {/* Dynamic Ranking & Visibility Banner */}
                        <div className="bg-gradient-to-r from-amber-950/70 via-[#181308] to-amber-950/70 border-2 border-amber-500/40 p-6 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                          <div className="flex-1 z-10">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="bg-amber-500 text-black text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-widest">
                                {rankInfo.rankBadge}
                              </span>
                              <span className="text-xs text-amber-300 font-bold font-mono">
                                Categoria: {currentAdvertiser.company.category || 'Geral'}
                              </span>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                              Sua empresa est√° na posi√ß√£o <span className="text-amber-400 font-mono">#{rankInfo.position} de {rankInfo.totalInCat}</span> concorrentes.
                            </h3>
                            <p className="text-xs text-white/70 mt-2 max-w-2xl leading-relaxed">
                              {currentPlan === 'gratuito' 
                                ? 'As empresas com Plano Premium aparecem antes nas buscas do portal e no Atendente Virtual, recebendo at√© 10x mais contatos no WhatsApp!' 
                                : 'Sua empresa possui posi√ß√£o de alta visibilidade e prioridade m√°xima nas pesquisas dos clientes no portal!'}
                            </p>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => setIsCheckoutOpen(true)}
                            className="z-10 shrink-0 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 text-black font-black text-xs uppercase tracking-widest px-6 py-4 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer flex items-center gap-2"
                          >
                            ‚≠ê Quero Aparecer em Primeiro
                          </button>
                        </div>

                        {/* Automated Conversion Trigger Nudges */}
                        {currentPlan === 'gratuito' && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-[#11121d] border border-amber-500/20 p-4 rounded-2xl flex flex-col justify-between">
                              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase font-mono">
                                <span>üìä</span> Tr√°fego do Perfil
                              </div>
                              <p className="text-xs text-white/80 mt-2 leading-relaxed">
                                Sua empresa recebeu <strong className="text-white">{views} visualiza√ß√µes</strong>. Voc√™ est√° atr√°s de <strong className="text-amber-400">{rankInfo.premiumInCat || 1} empresas Premium</strong> na sua categoria.
                              </p>
                              <button 
                                type="button" 
                                onClick={() => setIsCheckoutOpen(true)}
                                className="mt-3 text-[10px] font-black text-amber-400 uppercase tracking-widest hover:underline text-left cursor-pointer"
                              >
                                üöÄ Passar a Frente no Topo ‚Üí
                              </button>
                            </div>

                            <div className="bg-[#11121d] border border-amber-500/20 p-4 rounded-2xl flex flex-col justify-between">
                              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase font-mono">
                                <span>üéØ</span> Ranking de Buscas
                              </div>
                              <p className="text-xs text-white/80 mt-2 leading-relaxed">
                                Posi√ß√£o atual: <strong className="text-white font-mono">#{rankInfo.position}</strong>. Empresas Premium ocupam as primeiras posi√ß√µes das pesquisas no portal.
                              </p>
                              <button 
                                type="button" 
                                onClick={() => setIsCheckoutOpen(true)}
                                className="mt-3 text-[10px] font-black text-amber-400 uppercase tracking-widest hover:underline text-left cursor-pointer"
                              >
                                ‚≠ê Garantir Posi√ß√£o Premium ‚Üí
                              </button>
                            </div>

                            <div className="bg-[#11121d] border border-amber-500/20 p-4 rounded-2xl flex flex-col justify-between">
                              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase font-mono">
                                <span>üí¨</span> Chat Interno
                              </div>
                              <p className="text-xs text-white/80 mt-2 leading-relaxed">
                                Clientes buscando por <strong className="text-white">{currentAdvertiser.company.category}</strong> recebem indica√ß√£o no chat interno se voc√™ √© Premium.
                              </p>
                              <button 
                                type="button" 
                                onClick={() => setIsCheckoutOpen(true)}
                                className="mt-3 text-[10px] font-black text-amber-400 uppercase tracking-widest hover:underline text-left cursor-pointer"
                              >
                        xúÏ}ms‹»ôÿ˜˚-Z'ΩúwRK—"ïIÌ2ëDZ‰Í\Q)R–ú¡
åÒ¬qYu©îìT€Á∑T≈ÁäNπ¯|v›~âsu.ßÍ>ˇ…˛ÔO»Ût †3Cä“≤Ì•f0@w£˚ÈÁ˝Ö—æ~ÛÛ_ì=ÊêmK74™€ƒ≤…Füzp¡c|˘Í?˛ÙœHaª[Ô˙ûg[ÎÖ˜›≠Î∆a—-íŒ˛,˜∑”˙∑…ûìﬁ∞}ú∂K>qù|ª~ñ˚»]åh&u›«t¿÷Êz¯ ˛©j∂ÈV[ƒ¨éæ∂âŸã}]&=:¨.ÕæNjÄnØ˙Ï[MlÙ9È⁄éã.˛©ıè’õ}^AgzµulíìÛ?8,˘‹w=„‡§⁄eﬁcV·Ë„„{Ïÿ´>k6Ü«œ	ˇ,F]nê€Ú™]€‘â?2G£.#ûCµWÜ’´0√πıØﬂ¸‰ﬂˇÈ?&O◊ß¶ÒöûˇÊ¸ô+›‘úyó„√ö0Nl>d ?äü∂eœ≠üÏ»=õt†gw¢˜eÊPSØ.58JsnΩ£1◊µ]yxÔ√úF?º]ˇÈ?ê”¯æœ\ÚÄ‹Œp8À=OÌIrÁ5ﬂqòÂuÙCÊxÜÀúöfÜ‘:©i¶°ΩrˇÇí/æ è®◊Øò∂ÌT8®êoìFmia#÷j)óòı ^t√aÔ5¥§°ÂÁ?$˜}~$åtÜ‘1fè%Ë†´Q^\F≠ø=:p‡€rs ß]këèH≥u–≥ultÉı l@∫|ùÆA(	B_}˘Wd◊vqù˛XJ6®«z∂c–I7ƒÏ)	ìÛ≠SáZØ∂≠ª6Ñ	z EgDgdtŸ≥=jn[0„|ÆÉOsz–JÇ¶tÓ·…ÿ5©E÷÷÷»|œ°ûoxˆ<πGÊ 1ß∞)p^é-%Æﬂ5úy≤JÊGª1tÿÔ¸-Ï∆¸îØ¯Ó¡ö¿µ™ÿA∞z—7ŸjŒe˛Ï?ì}zLîÄæ Êra≠gâ0ª¶œ2Ò•hRºG^ﬁ<≠Tr®,©˛uæ7ç8åc¶Wög˛·Æ˛˘¥–R◊ójx$≈óêÉô*Éü•πkòÜwBˆ4€ad◊±{Hu»}˚∏î@è“Äs[ıÏ™C{Äá†›\j<áuß¯ç6µñ´`«~ =∑£Û—Hq˚ ÔUèÕRrLÚT¡—·ü˚?√H∑™1¬∆Nóô»†+úƒê2º€oèÑ;»¡ıyP†àƒ§qí-È·@¡˘ól1›p€uƒ† DÔrqbï‹Eú2∏á‘©T´ÄP‘9Yx>:ïb“∏#ß.ˆ}ˆÁwÎÿÖt5Í˝∂Ùû·ÿDé›¯Òπ≠HN˘ÆáÀ&
Åÿƒe>·”]ƒK.°&¸r"9»qQBÅ®0çAw∆ih;@1	_∞Olªg≤“◊N©dág∑Ô÷´jC˙⁄ÈΩ<}ÆaËFê6<Æ∂…§⁄¨-GßÓ¿7MrÛT∫æ|1…˙Yi ÅT
JÀçFΩ’Hù¯èÄ”í–qıó√èë9ﬁËßp¥à!Q{wXŒªÑ?Ñ=„wÏW“ÎŸÀ39ÿû¶÷ï+ø∂é5f‚ŸOb‰}RkÚ’/ﬂíGÁø’:v'¸ˆ7®πOç„‘Ø≈§!V~æU	W¡HõF§à:Ö§h¸ê	–ÌH√ÊqPG'á–$¿›ûá£jﬂ–u†√j£∂¨¬dI.~˚b®ƒ∏ÄÈ-¡ßW)|’}`yÒ ◊dG0É«R`èQsÚó—t–∞˜f‚2ñ8d=«˚≥aÅzø).…Æwb¬Fú ´^y∆Ä~Ω$g≈◊gÿTÛh…ûﬂÎ1◊„"˛FüiØL√ıJ¬:–¿€2¯Ï/e—“«£™7Úÿò0Cm)·Ÿ4ê`Ó:Áo=˛âKh ;ÈÏ.ÏS.¶C	KÂ»cJ/ﬁ$}5Æ&Á¸íÙ@£nGm@áï
2]dmùT§†¨Ç∞Ωb'kßÿoÕ–œTà£ê!†∂ o`∂q˛0Õ‘Ü{ØÄR∞ÒÈÈ∂≈TÊámú¸/gë˝V#sw E(ˆø ˚Ñ÷1Lû‡ehõU"'‘9R«8£Æ xAiÊm¥∞¬c∫ËË$sÍ[Övc^Å—-9∆Wø˙Å`æ¸Öî)Ê¨ƒ˙«ﬁo]åh“.3œ‘üV`öE;Ω#˘¡Âù€†*8z'Cî}˘3säœÿ÷⁄÷N+°∏ÃÎËõ‘ÌwmÍË˚¥ÀqMIÃ'µN‘vÄ‰iz8|¿wá¶<®ßJKwÅ≈
 fπXa≥G˙»$≠v£◊˜,‡–™M8{°`B&‡YÕw\€©m°_miTı#7]€Ú›≥?WÑMõØh ˆä¿í-.«¥kcáîKÕ—qù[Oæã˙!PÄ•s≤ ÈhFJ®“?.|'„ÚŸB%€¨é\ú≤¥JÅpèäcõ‹"˜ô≈Œø‘€Õa™Ni‚Ë	mÛü'∑nëä8¢Ÿ¥RÆÕ#	]5È1oCq¬>`áJÆô'Û	qòÁ;V.Î∑ê qÉ∏PbB§ÊêÒ≈"ü2ä¸√≠P©ã®gŒwùf¢l6[M-Rﬁn~‹∫™ÉüÚÑˆˆ∏*p¸•óCı ÍîfR˛n)aÓáRñ\Eg(E/#√Jπ§¥;iF>°0A]k®˝I
•y[“í´üA„zπ¯\{∂ÁÚ1ÎùˇN„t™,Wõ€fõ•†Õw˚–Ë––±Ñ)1t„≠!ı[3,ÄŸ˘H∑#÷ÓË'Ri˛À…CøÇSßÎ⁄¶ÔŸ*‚4¥±!q„È˜}∆«„ñK>‹fpô<›ﬁù¥k8f∆˜«ùˇÍÁd+–•>¢äù√Rº˘_¡‹∂\óYöírE®®?E≈+
\©íöYÖJJu—]4Jz\X»úäG±—1” E&{1-5Ï€˘[tÚÏ°Mh ®ﬁ˜l˘FΩô˚}ﬂp·–‡4M∏œ> ãRnúø=ÜÀ7î∂®∞ˆ2ÙË8xxNƒ!¬ﬁÖE)õˆòÖ™›A€m§müpF)xåœâÎŸ¸€÷ÅA-4&s[∏PTh&“.&VÃk›È¬nı[SöXb‰°Ì∫æABÁ-@Ä2Ab≈={æ˜;{h∏Á_≤`^C€„G¡p£)÷¥µjà‚{®LÍ;Ï ’öû7tWÎı#ZÄtæº≤|ÁNkÂv´˘Ò«˜¨¨›<ÖW∞uˆŸìm‰í@.≥º ÀÛ¸ÌÚ]ü96_	ä6ö :l`¯±√ÍèV≥rs‹ÅÊ^»Z›´YpRœƒÉ:Ë«Ç¯‘D|z„ÂÇ\¯˜®›⁄‹  ÷+ô}mŒ≤a1LL*ÙHπ¶uGÆi§OE∂i§jÕ∆í2‹«H⁄SŒ)≤Ë,◊Í»ohjdÑ?%Ï.ëòˇ
ÙRqÌHZ.ﬁÃ’®…ÄÎ©5ZœãóTÜ`πT¿Y'â]{ô·≥$wÎtz≠og}üZì7ä‹aPF)•M3~Lw\–û {‚Œ‹yßë¡éÀ9.EçYéC]ª—ê¡≠
á˙À∑‰ìŒ˛ˆ√Owˆ»Êp@{€˜∑nov‡À-Ú¥ÛxøÛ…÷#≤±Ûhwk{˚iGÜÙ’ÿ	ﬂ,≠≥Ê¸E¿Ê3ê¢
OkÚ%n**%Ö ¯‘ˇ[BU«oºÎcı÷«ô‡nŒﬂ
& ¯¡q~Fè©w∑nÔjM~4Èöt∆ﬂ<§W‰–8r‚é/˜^≠Ãˇ˛Ô≥\ŒBâÖ	YW\X-‡•,=ÚGˆ±‹íò…œßÊª^µ§>∞W⁄óZ–_˛eŸÌUHíô¢q{‹a‹àë¶ı·ÓsàÀÍﬁòÂö›≠˚ÊîE¡5Ç⁄>6”±Ä¿Í= àΩæ}ƒ)D9”ÍàÆ9tòEùÜË§O/méí©Ä§Íù»MpD‚b6€¥m÷A™ªÚäã¢J$÷ÔÄ¿B∆™íÁFzJi«ö	ñ˘Ÿ<k6Òer¥K1“ûsl&Sz@∏6CÄ∑∞&[É,”e¸(À˝õ.m%~ıÛò ÂB#Êπ<ç/B⁄1Í≤@8I\∆ìê0LΩ3µ}`˚Ÿ7êÔÁ6«pAò6Úoå[LD˛-	et∞û@ ôßı◊g˙I _îCóß/Sbl7R˛/5o∑ZÅ∫ø°7Xs9R˜«’˙8”b/¯ë¯ôÁ/Öêòßˇ'7%°	êÎ ~mâƒ≈VÉ[≈”éˆêjÜwR]iÃK]˚îTˇRÈ®\ÿÔ≥àﬁ§\z£®ÄÂŸê3,
°WFñ’8√ú0"ìèÖû´©ÃeHﬂ$Ì’¥îÎ’‰Ã≠ﬂƒ–lU◊eπ∆,«„™ Ü¥ùáˆîÿÌ,çπÙ5–≥™$Ú9∑ca„o‘Öe7ãâwRx£'7I#gõìä˜•Äè∂lg@ÉâπÄÊ÷Î‰—˘ŸõÂ¶r-'ùÏ¶YlÕ^√±¿ÌH∫_"‹Càå˘7%ÃrB1ß≠y˛|1˝ù
ö◊E;Èé~ˇ_ø˘Ÿ»2–6ï ”	¯;`◊±u_u≈3ö‘¬d ◊JÉ Ùh¨z¬7ˆh9óŸGQ@Â¨ÊÀã¿Ø;ûr@GÃtõ[ˇÍW?++7¶-nDß!cuY"ÙU[íávœ^$[ ú;ˇ—>µå0D¿¸f.IfOn∑≠£¨ms+’7u=6®w˛÷8!Æ1öå„0UÎ]¨Híôõb}Bo“iQ
 ∆-Æ=
¸ªg JNÅ'(8ˇ=#ƒ1◊CΩçS)SäÇ„˝¯CCíRD‡õç\
ü‰ÕÀ;|˝Êßo…]6@‹Œm‡ÆÅÿ(8dåc?4<˘µëçö°ñïua≤ë˘˘nzög5çâ+kô9;∑[fƒæ%ô§hS∆åb#
s∫«≠…)Njjˆ"g≈Í®Ä]≈•s6ù¡»ÇT—∂∫RÃHe––ZçÊJË/ÿ8h~å.ÇBÅ@õÕÊR®@@Ò|¬≥∆ã∆ã÷Ú¯Ö”Î“JÛˆbsey±Ÿ∫≥ÿ®5[Ë=#C %•#DÇ◊2ƒÆ„èO∂›»úl{·y\%ëR>ﬁcÉ~jä¯*ñ—TƒIx?™(,íZ‡Hm—öXm°†Y◊l‰:ÊKfº‘ê®V´ÆäMπîäôøıÂ´URiö¶SÆƒl1<w©Íï¸¥S”*Y⁄wÔ®)Zñ?HEK
ùwUµÀÿÈùFÛíò_Ü~DÇ°∏v¶„ùˇñ¿¸ß‘—L?ïøS)‚ùhsÓ(hsR[>KùNN@PI ¿FeÖÆqOlÓ€äñ‚ çOÄ”ﬁÖÄ*`◊Ãt±”âπ'Ôé<J‡ˇ<+‹;ì◊3ùD≤ÿñÔ+=%\L~˙eWRdc≤†•≤CvhkÁø#pÙ:z•uCì@“n‹ïûß‹Hxlç¸Ÿ?∏7ﬂ tÇ~U‹;˛¸KùŸ.πÖ¯}`á…?∞7æo{Êëﬁì"_õ´Ä1ÄÃ]Ï˚?AŸW(Î–€ﬁdûM*A ≤≈t¬›EÚêQ›]∏"+sY$óªùER√-`f]^\]—“¸>Í6g«U'v/3üD·˘Àø‰
œO∏æhΩ√Ù»◊qQÑ˜ Í
ï4ÇÑ%b£\ªÎ`!ÕÊöÊ”÷®q±˙œ§÷Ë†	7∂râªﬁ}®R<ø< 	€Ï"ùËkÜÅNüÌ~Ú√∏Wn:Ó)¶W≠Ñ“z}p˛;w%°/}F$TîJò«A’Tbù∞ïãw¬V2Ê	€xûÆ.®WB2/ï∏*–n&n]oåÒ¿ø∞D‰Bx-√·"ı¨Òbix¸¢ï´üÕàd"îGﬂá◊µ;+c*Á≤94TNGà8Ï}&2Ë*≤¬Ë'lócràG*œ Œ–¢MΩ±KO∫‘ËÜy	ΩÒÒLÏÌ»Œ–Z∏X^Yl64ZÀ™vÜªB"Í6·Åù∂)DW”Ö•FÊ¥ññì&Ö—Û+)É¬(è¢‘úP¯#wè5mxW´GˆÌ°€ó*˝“D/àÅf∂X0#&;™ÕzÆ‡2√j≤Í1øP"‰≤ùπLFW.e®·s‘ˆ˘	‚€“ÃÜñ€òy5[ë≠ñ´b¸$‡=…£ŒˆŸ›Ÿ˝ÏaÁ…Lÿ«ô€äT≥ªñ1çˆ∑åπ(ù*C≈ÙíLñòä⁄”òää1¶3%7fd$äYM ]_E+Q"+˝ÏlDq*u©V¢ºR”⁄àñø·6"•xiu˚PÍ–NcäÕLnêI"§ëe®=µeh∫iV°Â+lJlÛÏmB©,NÔƒ"tKÿÉê≥ﬁÒùôj®¶0EgÂrAAJ€)Z\“ë!Xh§êywéú#‘ë0%œ_ëQ(ëﬂ! Ë¶†∏D˚–ñ;d‹£n(ÍòÕ¨0¡ΩÙ} >Lk¥m˙√
¿ 1Õ÷±f˙Æq»ùÄw?‘óœ5EG·›#î∑m¡ÿﬁ˘óÆH	Œ»»äF´≥¡êY˝wBy∆÷‚›ÿâH∂¢‡®|¯¶¢iôÎÒdDSâvO˝ä )j≈hæã ¬(çÏÍ»a”g;yıòQv;'(Ã3DR-HQb√∑ *‰BçFqï‡öåb˘‘ÎÆ\ã.⁄XîPèWB¡˝õh.öM‚ºã3eÎwóÆ∏°HQèwEåEÒ,∫hQhŒ b‘n7ö∑#ã√pî–b‘j‹n–Y[å⁄woØ‡ˇÖ-qVq)È‘≤±º-iRp≠¿|õc xÊÅIõé¬BYDJ∏heå
·¬®õFâw"É¬£Œ˜¶1)‰T\∫`ŒQ…•˚ó»˘ Âé™›! üÅûÒjÑMj‚¬6QÚæ8óo~afŸ?0ux¿d'_∏TCDÏÕfhÜXπ˙fYÕ‘ÏuLZä ™!ãçÁ2ûÅÀñs‡KÇœcN$VA+Æ-îó%ÕHÔ´ÃÅ(˝?˛˘O¯qh™~∞≥ø≥∑HvüÏl~ü03Î˘7∑‡”ˆ√ÌG€˚ùÕùΩ+d-àÌŒÏm·ŸmZπD•ø.´¢h˛ÀÔb%Œ?ÖÌS1<'ŒeΩOﬂÀAêîÓÇµπ—∫<¿Bö[.pu}É[SÑŒs”Ó˛Ì§˚Ô.¢D;°÷9Gˆ«“a£º«F◊–1Ö-ŸJv¨*«˚∞&C`UÈ¢Ëw∂,CLV>≈≤¸ø…óÂêöoR±0OŒﬂÍÜ.ŒUïütE˛OŸŸ4}≥˙]»'é?¥]<5÷µÌWpí"Õy•}L(&°Ô.ú Ãuô∞øEúºƒ˙ﬁ◊æÃp,aqÚ0I⁄`"%QXN&mÜ˚F`¬Ex◊ÙŒL{>»J;4;lÃ·˘?|ÀCL˛Œ≥ã≠xﬂÙ6áG¢Ù–…aƒM|”3™µ®π
Ts1 ã!v‹4DŒ18œQ=ìQ +4$_®≠!•>∫@sCî_X≠˚µ°·¢„™’J(ü≠˘≥¿ÚPllz¥À06ƒî¥Wﬁ÷¿·Í
Y&˙y¶ıM˜¸nKî6W—QÚ¿0Ÿ“Ø\eSû“≥ ßö4Ÿx"ªxõ≥2+πàTd=wÑ:¨(3XzT˙Ø"ˇÅ“˝Xu°•‘-}w0V\ß®ø„Bb>r’÷]^‰Z°ÿ√x m¡>…1ëÄïw(‘∞Üæ'# ¢Ñ5NAvò©È≥5>ótb[ m é\;≠∞Ç‚∫Ò&
Ì¬Ëdç∞ö 5>ôÏ
∫ÒÊ2o#=ﬂJ÷pï÷∆T‰S §V´·Sã*4D,«*9ü
Whë‡≠Úwëìº≥Öú¡±[dΩd–≥û®π€l“tÕ›(”·Å≠˘nh©+n˚Í)™VèIªa,TõåkNãa´>.-ªg7=GÍü
ÊúŸ‹‹\∏ö˘à^Í1Æ9l¨´‘ü˝ªFıŒÛzoëÃœKÅˇÍùÓ#z}∂”mö≥-N?PbU‘∞ÉÀL¶I—CpË+t8‹§ΩW”ÇQòKæ¯Ç<{æPs?U*p}tz‡'ÎúÃGA_Ã=Öª@Ùù{ÒÇ;W^ºòªb,Éq@*¸Ix„¯4∆ù!J*Öîä—R∏Ó´ÄUpìvÇõ3nﬂˇEQ√ÿ™´ÚÕ¿Í2±ªœË0Öf4aˆu‰;Œ%¿Jg+^X}º[èH5¡hl1X'¨ı´˛È?&;>Ê@´l=ã*ZÜ÷Áuæ]€¢"Á¿ﬂÇ⁄åÓ÷Bó(eOoêã∆Â
©◊ïË%˜RÚÉ»&úw"∫9Ÿi˙)<"∂\Œ:j.Ö‹å¡e>yÃwÂ€JDïOGâÌ∆¶Œzcì≤ﬂ·® •	à#∂i$∂bÙí8}÷X]Ø+`nl\éÈ«úµπ≠„U≤kº~MÅï[$ÊaFºéÉyùtF¢€ãd€B7àÛ∑/4°ö:üH§çpêª\z!ö√æÔ”•∑
ÿl,Öh]nˆ∫í¿Ê‰aFº†±!¢éÍ‰Åoq1ÉZ)3Úë‚:$2Û¶˝9ùøbº˚US‡b]´“Mz∏ì¸¶ä¯kŒj=ÑoaQo8	OyÅj≤cqø≤ œÂå≈π ”nP«1¨>&t‹e∫ÅÅ˝÷»DëõéFùßÙ√üs«âÛ∑&"˚KôÄˆ°°Òi¸ıﬂ‡ `u%(äÉ¯b≈·IeèEs©áSY‰YØﬂòpZ¯‹és˛‹8Èºh∑Ñw¡|¸ÄtFWpà®fZ—‘–n‰õ¸>é˛F]îf£ãÓ˘’OY}§cç‚ﬁ⁄röi…ÿC√zÖ÷+L4C∞à©|ˆ‰°öÚÜﬂûAÛ&˚lh⁄TøÔ{¿õ£Úﬁ◊Ê ˇ)pŒ‰`æ¡Lﬂ§Œúº€#Ó˘ö∆\®òÔòúä\5JÉ¡≈´fßFiŒdÔ.·¿¯ØK∑Z‡»^>¡üoÿ&#î (ë#åCÖ¶ 'öÄB5†Ö≤È}√9◊úN≤©?Æ∫"ê∑b*p=áH≈?‚˛◊ÖjÎ*⁄1ç^)|:–)·ﬂ”nÙÆœz∫]:'F-{Ëπs`ﬂàø`].\Qúr$f«U RıG&zqô_≈.∞Àk<SÏP!˚Ÿ§€áƒXD¡^ïÉ‡”g+∫Sú˛ƒ;∫>≠iœ∞Æ≈ãbDp–Ω∆ÈvÕpîF9`H'P}Ó:Ü•Cd;ˆ‘yéôR‡Í¨é∆ï®àXÜe Ÿª∂Æ#Öåıª∆ÈVR{¬úïÆc8‰|Ør˛ºé…D√(gØ˘ûÃ|$¡ˇoãæ#9 F˘o5·(ë¶bn}§ø˘acÙ	{È¯‹˙Ó˘[§‡	VÊÎ7?˘ıÃÌWªÓ√-ÄR„nO#T{5Yπ
¡˘O¿Ÿ°õáÄ„òäÏ)}mÿÄcw©Ó¿€/\ÛwÍ®˜·ëß€5ª7â˚OÑˆŸÉEøøY±vòÓöÎàÚoÒ‘pÕ73(‹M∆—á“S|O8^©yˆg/ /ï5øCˇ „QïÅØqXº)π ñd≈Ê÷˜‘8M,0·ÒÙ%j\›È˝'ùª˝≈ﬁ~gkèª¶√—)ÔíÓzp†#tÒm=ºZ%¯i¶^È€∏!“§+"ËÀÊyf«…ò¬<{M…W6Pﬂ¥Øçãbæ>‹∞‚◊ÏﬂxSBùó…%ñ«”+0˝@jê›¨éykdœ`Y&)˙∏ã#dÖk(≈	:sµb®rÏ#wÌ¥]|SÈs>˘)øjgWPÌåKO∏‰|_ï”«◊5^ãgäNz¡.{>”ôiÉ£≈”“Úº”≈g5+èıxzÆÇê¨Tﬁ¢Ae∆Øﬂ¸Ù˜òõõuç»#8ÙäÆÏ«‰Ÿ≤<áı0Õ#¶•.ò·0ì4«1âx€rÃfÂ´∏ÖQa8$OsÖ	·Ç}bÜ'Êb±ó‡WÃØ¶Íı0®œåïs!áÅ#z%“ì.†/°9ÖÎ<$s±gî√bzŸ|6|ﬂ,8ø>=Ñ›ﬂ˛ûÿÅT®∫+ÜËï	–c„ (^∞5Ã≈ˇ"[å|Cq≥˘[ £'*ZIMπ*jI„¯ﬂ0E∂s¬¿È" ØbD∑X¥Y«sÀ{∫*Fw”ªtø8%å¯›7<~@+´0›vî„.©<√Rc˚ Æ:%{Üy8#‘ÅÎvç;2f]à;óHÕuç<RmUõ Ò9"˜‡OÃ˘~0;˚∆–∆ÉŒôUT§féPC˚a‰nˇtçí≥.ƒ˚%"yøyÿA!ôFReÜ‡≠T’‚cmUë'ü[ˇN‹Õ∆ÓòÀÓÉ…;xº˚Ø°¯;y\éËå‰àıÙeW„¿d9◊ﬂÓD«
‡ÁåPÎwüZöM*;Cë·Jqvè˝.µ^-ímèûˇqë‹øØî”CÅ√[ø∫ÊÎ2f]àπq’Æ1w^S„Îﬁ±Oè) SÅˆê'•ØíãEñè≈“‰ß€ıÿpmÆQk4'@(ÀµFıL°%Î9ò*»ùJ—ôi¿≈ìÏZ\Ãöuë˘"Zπk‘í◊f$2J~ŒˇΩ+M–l⁄´µSÍûX©(@4f5‹éæu<D[,Ê»ª·Dﬁ´·’Åa…”ÑR†∏2∑ÁS<%ÃıŒﬂ◊wáÃr)ıÆiﬂgTß5ÅŒ∞jø◊≥yvÓ∆"/L†áaŸ_ÍpÉ≈LvmN
lÛ|«í◊§ãq£8|ÕÉÖ¸RpÁçﬂWô“ØN6:‹TﬁÆ]€!Ù–v–Yï1KÎS‚ŸhHÇˇktÄÖyl,!xu¥f°*r1 Û≥x&FÑ«À¬•Ï†œmÄÃá6/QTÒüIFıúEK¥nkOÿ`u¯P—ªãdûF´ÌŒ/flí°K_YÜUÍd•"vL5O¯Ùë#√Î√ÆÿˆÅˇkp.aTÉö.POÎ√{√2¿d–ï«ÒMÊ ∂¸àÆ‹&æ…EJ«ÕC´oÕêSù!‡ı#@–Y]Ñø…{ÒòE-o;≥ó7y/å„7∑„eæO¯£`‰Ωià°òû›[Ù£roeVsX»≈*åÄ®ÿ†Ñ‰T∫é≈Æ%%∫æR≈®ÆDwÅãÏ‘8≤ºü-zŸæª—gÙÂ¿^ŒJÓ8õfÂlêik¿—ä•6◊SBñÌËÌ‹Jàj¯€ÑûêÚ™!πÂ•ä–ê◊±0Ÿ%Ù≈àKÕC§ü}.D|ë-ˇ!S‰ŸŒ€Á¸œm=C/≠O*Ãq‰L “;€d5∏Ÿv*s üÛ‹ò?‘qùÜ¢$”Í‹"¡˛_rz√ö¶z¥9—k9cN*ÎùˇY)«pFêvM9OÒ@-eåA -∫·“.,ÿ⁄©1≤ËÅq«¨U)÷7tôyT“Èd%,áÜ2PZ™…Ø∫&òbÇŒ®¢´§˛∞=…ha¡5≥ó/â9Ò5!˜»‹ 9µx∆9¨îıõü˛3·“1a@Ù}¸GÊ‘M∏[≤è§0YŒØ¢¶Ω£#ü{h∞#Qæ´¬Wq°D/ÿã˘∞xfıé®Õò%öé
ŸµQﬁ¨ﬁ∆≠¬æ&’HEÂÂc’Ôä*Éa=±B˝R8€ÂDÖﬂ"∂ÂπıßÜ+NmXo˜¸∑áÖ5Åè≈ÖTÛ'<æûœæ’8h6ö∑s•¸ÙZßg@è´G’g≠˛≤…ïMßÜ¿:¿r¶XêkÇp]î}ï≥≈Uõ∑IˇÑ3¬i2Û5ó	ûÎ¨≠ÿ7t‡ıI¨∆n6àDgîéAß@X"y-Êª∆†'◊∫é&ÀM»)aòPTèπ5ﬂrá∞}ûdÿ∑=÷¢π“h,7WZÌï•*]i”ïÆæ¸ÒAó›√âØÒöÈﬁ≠√[”{xÎh≠π‹òó&tD¢„≠ÕÌ‚ô¶
©/«Qp_¸cw?G`–pîRh"ïsF
C†∏ÅêPókj∞x D^ÿ⁄®(’¬"°ª∂ih'X6¥’ΩÑ\ôŸ∏©†AÃ7üPe–DD@6[…Ûá°EŒJUy¡SÈ©ò∫|ÅJ}È,dw ﬁ>;tD∞∫xX£ﬂ´ÕπuIΩB~(€áQi≈˘3ô€qé„qÜùß¨I™<t|Ç-20¨jPsmŸaÉÁÖÛEŸêœwó:3Æ2 ¢∂AX%®¸®·K˙œ≤®Øç;‰rsŒ'
+KâëÆõ¢—%,ﬁÕW\\Yj_ü≠p2ßrDÄ{l≈˘@5^B¥éXs ˙\ºô‹/®“lÓOÚR≥≠UL˘AÅvëG‘úåÆŸ\$,StV]ÿ% Œé√K~°˜&∂£Î$»5zÑö¨ˇ*Mú±)S‡´»,©P[w—ŒEzi|ó_€|dJWp°a¨Bê4–[{QËî°ô>1 ˇÍ@Ä›E‚FâÁmüÿC!´†]6äâ(éÖêÉS¶º'ºﬂ`V˚òôÖòARÆH¡≥©ÿÇfbö≠=H¡§†fTêÎõPÅ õÄâ˙+ßÅöt~>Ì¬O¿th¡EŒæ≈>∂bü€±œK‚Û! qp;Mπ‚# €	>G(Wî¥ìæ3Ãu+7ïjs·;®Ûé¡Ÿ∂«‡FcX Ò"Y¨
Q:;}∞U„"JX+¥±∂bE›CJî∏*©íH◊n◊}áÚ/¿ìõß2»ΩGÊc"¸J#^∞æﬁŒìÊÉôX∂ác⁄GLü'´ºß≤Íô˘≥ó≈´úT+ÂæIQ'd◊‹Ü∏v⁄\:Fhä(‹‰Ñ§Br^¨É)(P$Wœ¿ÃÁ J¨o=Ë¨®IO
®‹8Ω°Ñ@ãµ;≤íS≠q’Dπ∫Ó≈¬@,±ò0ÜÏé≈Dv•%Í≤I†8(_˝œ_ •’©√9‰	õÔ˝†F ÓY 6Öé6B¸(¡@ÅaŒÆ`'H=™cÉ’u$w™ı˚.¬◊3®2≤ßT>√g*N9Q«*<ò"Ô§Äñ&=•x—π9Ó;ˆÄü€#@~4ôG±— $J`1ˆLc∞àuË\ﬂÙ‘™Œ}XnGÔ√ix
r∞›TÕ^u9PœŸ∫ ˚Ä]úÓóÔ‘Ó4H•‹3uâu˛«s@adhc˘®˜“,lÀ~ﬂ¢≥ﬁ+¢≥	ãÑl¯éßVv˝rŒö<”∂“GM»hSü¥m´∑»ñ∞H<:†Vç÷ÜGÌ¸ÀCf¿eÊiÔœë{àÀÃ´ºÕ‡$Ò˙n£î⁄uQ≠Y>PáL^Ù-YˆML@¡L%©ıVL∏ÑrÉ_S(≠6õÚ∂óDÎÒ’.Ç÷ã%õeóp+[ªÌC√?“ä‹QÑ‚úkç‡Ô‚Fπ‰yä*πΩÔΩ$ì0–c_óÇàÓÇ¨EóƒP\Y‘⁄z◊ò¥uò¥ı£“÷ƒÅV™K75J-QÔõÉ7?|‹“~◊∏•}∏•˝„ñˆ≈‚ñˆ5n…n◊∏EÜ[ñﬁ5nY∫‹≤Ù„ñ•ã≈-K◊∏%ª]„ÖíOœøDŸt#…-ZﬂakßæÖ!ˇ.57lÎ¿Ë’|é+∏X¸)3áü¡—è;xªû√Ë ˝∏ˇ≤äÉv‹˝H8J∫…vÜ,¿L8s*lëL9õE2?‰Nã/ƒÉ/∏«Õº
ÊBˇ!§#ˇhÖGä6ôòCMùªo
ó<:˜g»Òö¡”>¯Årßf8eçëMÍ«h5àŒ4;á·~2Cän∑ÚóëC!_ø˘—Ø∞î√`ùæ7¥ÄC…ÖëÇ¿ÎkjJÄISr ˇö8åﬂ Q>•éÑú-í«˛@†˝≠çÓCªjËe∏§≤˛;≠>OlH·ﬂG‘†ﬂãÅ_RKÎ√xÃ-
$„s+p7Zn‘W≤›œbP-Óf¥î·f‘Fø|ô≥œŒ¿ì{©DNÒª˙À*)Ÿ%.Pπûà
4Q€èˇâª3πC¶Ü¿¿AR∆a#tˇçÉ¡ÇvÏ/+,åZ@∆‹z‡£≈"ce›äC¥∆!⁄ˆ	Å4ÊÖ∑√§dhÎ,∞3¿¬QLØé,Ωªx9Ø¶`>ƒ#˘]ò≤ã•0<Wrêä8¿#ás|RO0vFˆF≤®%±ÓK9Ï€ÆH££:∫Ω™9r+:q≥Èß<øe¥*tKn//íˆm¯Ôc¯o˛ª≥Hñ_˛k¡m¯oi^çäe/e:‚%põç_m%‚`⁄c˛òâ;CN©ÒI£ÿÇîqÃÅX8_OüÙÎ7?yCˆCWÅ%H•ΩL(¨ì»ùjÉ˚ÆàÏÓ.¯ˇ£EÚ	¸˛˚ˇÔìiÅ¢‹—LD[ë+5\áà¯}Ô ~1A.Hewë+¨“Q√.Y$˜Ld∫H:Ø}së<eŒÄô}‰¨´Ü=±]:-î}ghé√IÏr)¡•qXIﬁ˚Æ°ÂG0ûAi›	>FQ-èÄ¡∞&ÎÀ|‘™5 1T≥-¨ëÌP∏ÿÆ-„≈Ô˙ËÍK6Qñá´K‚÷=j¢˜ÔË^∏:-4•ÑÓúR≤uBÆ®‘›Ô¢~¯Û0M(ê¢sZdóô ÿ$ûa*ãk8eıö° ú•≤ÓvfÓLœ`¯z\àT◊‘qÌÜÇ|RFΩ1Æ‡‡4[U¡1Åä#‡	&Qqd(9∆ôNî]bºFI’‹eh;⁄"‰∫º∂C¡f¢,í¥X3sgbí•°Ìê√Û/ùûoRED·4_ôì'®ÂfÃ)˜™ù:Å /ÿÖ|◊åŒ]!˜v}Ê§gé~gnƒO‘Í—è tŒcó∞P]Œ	œ<Çk;£3ò…,o¿_üƒ¸ì»+U`¥eÂ#f∂PÍNuÀÑe…ÒÏbà|®ÑgñÆT˝I%ÌCñ†6ñ0 c§•∞õ5l˜r◊ü4_‰ÅU$N≈#´„%dÛ≤Ê©KäP≈Ä&€ˇ†xÃ§éT$¢ôÓözwl3I€Òw®¶Óê'Ô3xãƒAÏ•à\rBè‚–˚/Ù‘	Ã¥‰å¨ëê|»Á√3≈á˘∂n—J≠Ònòrù⁄d¿,Ã.#–⁄fMEOú–ÃWRú”«ï«ºHEºüBn˘ÿÓ M¶Hg<·¢C¸AªäÆ
@[Ä« Q¨òu
M6Ù–&Ü¢ Ω.ºìWœIã†ˆˆÉúgÄﬂ<Ä´¸h‹XuØf2´Áıñ*/,¬‚5÷∞¢«›‡b~“i•%#ÓÄSË4f¿Í9‘Ûœû/”à‹∫
PùÓÔ0˙©TèõÄû(Z3”˝È¡•z€∂ˆÉöª0[á.3pî1l·Ú	Ñ˚9®H$=ÚÑ∏;<µ|√†èÆØëe’nFÿ∫7»S[;ˇf„≥zÜ∏…4HπuFñ£$Y<√/ˇ∫Â∫ì[õ5êæÔc}r8ˆ‚7¿j√à
∞î‘“Q·#*?.Mr=j<›ÛFüiØÄ;Eá2ïJ£¶ä2∞©∞Û·Ú«†<c⁄çôÔBªë±On¢
ÌN£F–Ûﬂ¿·»ÍAqï¶Ë¯<›ﬁ%ÿÇﬂíÂQgºÏ˚.ı[3,|ù 6>.ºˇ€Ω{÷Iô˝&-Ál“≤tì;∞ˆ¡∏∏K¬-°Ó{º'Ú{Ë∂¿‚;‚§÷î6––AxœMÅÙIÛãõßõòYÀ>™,úΩ$´§RPÕÅs$œû/<K˜¸:/ê’±R5ëFßd}é 	IÇë´yˆÙ`ı î¯(Y»#àÊˇî}¨Àè.\(€A;Ï†=aKaKÂ;º>+1ﬂ“2èïJñ	ßL?°ä∏í©ï.”S§È™d´◊¬æ‰ÁXÅ+2ô‘†–∑˘qZ#œjµö‚©{Æ&πM≈·«gW˙nø†ïjxÑô Úîfô¿≤£ŒDÏË3r¥∆äà4´$ëàñ®{4}Â#"\WK;• ÿÂÎñaS©]ÜÌÎóaõ∞Ä∂iãàaõM!1l≥)&∆ﬂk∆µïf]Tå˜XÓÄÒ#6Ü ±ãXòû¬¶VﬂTÂh®êÙ¨äØcÎ\‚ Œ¨8U0ªl”Ä“|Ñ ƒπÓ∞ö’–ÔöBäYÈå' ¶kZ∞⁄ØFï‰ïr5≠∞•ÍZÒ äàı…Øp•XŒ*ˆf;ö;Á£É%´[π¢ÑQ	%≠z1+l¥‚ÉHÓê÷)]‹
[“Lt;f&zˆ≠÷Úf˚ˆÌÁ#k\jtÈÚùÁJ∂†¢L—≥5…*W}ı´ÑÖ´‡
VaS±MS#!ªﬁè˙∑â`û?Aèªá˘¯›f†/™îÒ‰í[B≈7éÿ¿›Ö	ÔSV‘XiÓmyõ$-çÒ$Õ=ï4RÍ‘ÌG!ï9ï=°$…
Le´}…∂±ê¬◊o~ˆÂ¥≈b2Íƒ¥Á÷îaÈîXò˝qhªÆoÄ§`ıQÒ$!∂˝®®¡D•av~åÜ’∏‡2÷áô[¸C8‚≈öFœ–YÑ+∂bÖù#µ/·gWT|A#¢€∑áC<‚≈”Ò=ê¢…Çí$áiµ7%¿kAOÂ÷⁄Ä+ ^Û
ãƒXÖÛá
Q^Ê√Ä≈N–˝%–1gcÖ÷ö≠f;œd9; P‰/À<Aƒ†äÎQñÔ√XåVõ◊:R(_ñ’ÁQµŸ¬™k≠¥_Bå®dïX´∫}«∞^UÚÇkŸJ≥E¬‚â¥óxG,”∆´∞ÖüÒäg¯ïÁÈV≠hVX	L¡	õÏÏ$&æçÂŒ∂—õ)ç9ƒ≤µsaÇï3Â®pÏJqÂ¸∆t…ß¿óçôÆ+1ÃræÖƒÊ÷£çì#›h†¢èÈ(ŸÏíj<€≤⁄hMßÄ•]ˆ¿¥©WA¿∆åc¶WZ5áq◊µ |ì.,Œ+mQ*èﬁ©;¨‰>Y‰{ïDjàGÕçG¥íµw¬ñ®C£¯Lh@LU¨u˚XTãMY&èl!òîxP"¨Xv‹¿H>ﬂö®Éˆ®ÉˆD,ç:X*€A`$ÄÁcfı«#<≥®?⁄‡˘∏Q@ΩÉ»$ =$lä=®©V∞ei'≈ß dbãÀÆ£‚yÒbhë‰y6∆»Ÿ«°ücÎóÎ¬¶Ü•EŸ%<™(àÌ¬P_9?F—∏[åÜiÄ ŒÌ£á!ŒÏ5Â© Q±œ—ÅD3}√AE°·π7∑∞P 6≠Ù÷ÿ∆ë–(• ÿX‚∫Ry≤ˆ˙qÇπáÔº`ë*LOk´mRãM8ÉíjÂº!À™ñ±Mf√M®ŸsDõÃ™#ö™mG¥∂à6ÖùG¥YX{DõùÕG¥ŸY~Ç7Ω 3∂Ÿ[ÅÇ~'9¥≥±âvQv÷!—T±EvFôËÃ‘j$⁄ÿéÇécF Nóœø‘MûèâGmEvlÂM>¢•?õÃdXp®¨’'ÒB®)<ÙãO»sîÚÀ/U∆#⁄ÑÊü`¿À·è¶Woß2'◊2xb¸àøÚ≤÷» ã]ö)á¨ñ∞P~Sql†LÅùo*’[∆˝ô˜¶ÓªÁn}`„÷◊£ßÓ÷;ñ1 l≈ÛzYãî5w«~>u·‹j_˜¿v6ô'ò€°∆e¡—√ﬁÓsƒÔ<aá;ä,KÎ§ëDπ˜Ñ[x $‡®J≈ıãD∞‰ë|Dúö√ª]D√T=£ÎëV¨ô‹ôU2ﬂ®5¡b™ l,`c/∏X°ög≤GÜe‡•çå`çÿ«zù‹˜S'¶Ä£áû†ëù41˝¢®qÇ5¬õB”06˛WIüΩ{ naÍjoÁ	–ëBı;òzï∏‹aîú≠£C^¬Õ≈µÃm™ëÖ—X¬[.5“b–~)Ú*Ø5˝Ä≠r#∂ß±]nƒ•ÈG\RëÉA˛ÄJ
ÏR@=`§ÁSG'^üq à6∏%⁄∞7˙õh¬N¥∆„¥u¿Œ=;§é°w2„/¯à˜∑6zÅg¡I√ÔÅ7%∞>£ü¸;¿ù¬¡ÂIâ∑@Ç◊1+Ò©ƒHÜ¢É´3x‚u°ùzNﬂw‘¨@Ø3∑2b˚ûﬂÂ9^ÁEt—¯œµ.õœà…CZæ‚€∆4?ï3ÙVœÍéƒ:√«‹°ixâgû5üﬂ.◊ü›˚÷Û˙,az‘\œ◊<)8Ps8Ê.u<79¯ΩlÓ4x3˛ L*è}å˜Lπ2K§ˆ‰·£é÷We≥]âuO’ <*ÛábÀ∆óû/ƒÿµÀ3Nˇú˛éÔ‘À09——Q-9uÜ@Zøy<pˆ29°3	¶ìlg@áXÀL{Z	N
ﬂ/’%õ¸’ç≥'y´¯É”ø––§' £é:Âw™æV>IjØÇõí÷€ª#Œ--êˇ·‘\;=%ˆêjÜw≤
,‘ò®@ó∏≠9~;6<YWq„ÚS0~™ëíjØÍw‡3¸´;ˆ=:’ÅN^Wüµö¿’ëaˇ§ä˛ÖrS>˜o@€®2HRÓH≥¿Yõü}´—mhÕFn.çx]¯¿./dÇ€ß:Lµï·ê‡0ìròÙAË´¸≥c·Á~ıŸÚ2⁄3Ïïc–åçi·Vy≤K-fí Cv‡’˜Ìav÷Íq˜
Ò˙Í,˙
∑>˜´∑óƒ|¬$#qøã§sEÙfY>JﬁV£d‘0d¯z}ﬂáa∑⁄‰Sƒ∑3Õªß	!œ7#~SÕE-s∆ß¿£#CdIuÃ—qiÊ¢íyà| èk	û+VúdbÑtªk Acëó˚ßÑ£ñM˙´;◊ ¥Î⁄¶èù $˜0D:’™≥™!MWIMÄµµ9ƒ
àhøCp4W√‘ﬂ!CCÉe¿n™¡G•Ó@{ºã¬ªΩZ
vQ!@Hm˚“b_V„ªó1È.ÊtlSftë;'Y X„["˝Ù˘ïåáÏnsÛãŸòú_Œrﬂä\¶∏oWÓPŸ€í?˜
ÀñºÑ£X>RÛ À}æ–µ,Á©ú»Zƒ¸%,ŒäVDHÑÁO“-$ÓÓé®˜i/X[*ÚX+t◊ /_0  øá‚,“ÈAëªTëb/ã» ‹áêõw`[·ºê:ŸÔ˚ÉÆ†íóvˇt$˜Gµfæcxzc¢„›µ=œ¿˘6Åı@û¿ËıÒﬂ~p»˚àﬂ•¨[òŒˇu5L≥ÒàQçÒJª€qÃ9ƒ‹˝éΩ+˜«Â_π…^‚á+œµ,‹sı„"Ï:û≤´ìRTTp*E]åV˛ÙÂQµ…ówƒëöΩ1,X©V\!t.èÅìª…Üÿ˚ÊiZÀ¬π&tw∏GÊÛ2Õπ5Lyyµ®9Èƒ‚W€ç˘≥ó˘+RÑÏ≈nóaËDÀ·éÃ©éâ∆jE!p7TjóÌ‚Ÿ<h[gI˘…4„}*8¯Ê ≠€)”Ù≈’r‹B≈≥Œ≠ã"QJÒ2sâ‹È∏òéä∆©È@Ååä∆âÈK^dÒ&XÚiÑ…õñíäVDOß‡jÚœáÃñgØ*c[* 
ÇÁ;FÆOêA¬/∑aW•`b,WSıl¿Ó¸â·ÄÇóG%œHVeáÕÄôµDy.ƒH17 Ù±Ø@`~Ç‰™~üOLMhÊ8†IÜ’€82ÑI¢Ü>RY%¿"á»É<O>Ö√∏•Jˆaë…-˛¿≠Qk4è»ÀìÃ.©9KœÆ¨"!|áài…è`+pÒé9qG˘¯˘“‡Y9=/Â€ç˛TúdÎ‘Ñ∑™ÃÎ›Ï3WÊf¡Ω Ñ›¬y∂π+@°a?Œ#Ñ’⁄ö£"É,„ú+ÄoôàÃ'°˚AQ¬ÊrP™ûXà0_[∞ú5Ëç≥A·ÜÛ…|≈iGÉâÇÕ`cÀ	 '4Ë!5™ŸÔ◊>∆f˛nw≤√'Vn;∑›üÂ'´ëmrq‹	¢-‰⁄m+DΩEıÃ‘b„ä™Ì·x{} {ÑèJJUPõ1n:Ã.¿èPañn’L[„–R≥A–3,‡¢“?©◊Á	T«ÍS∑3ıeU≤ÊÄÎ&ÊÚÊi0°≥{Üæâ"I◊ä0◊¸¸Ÿ-|ÓÀV¢cfòt≥Ë°—£@§jöiª6uÙ⁄ëÉé Àï`brLœ7r√LWÒ$Ü'ˆ—p‰{ïôƒªtbë¥ç∆,»≈‹0åÈœèãW"1.œFí˜/–’∏Z(C•™ÈÑrj≥Ïû	Ô¬Å¿ÒåòpvÚü)"›—ÇÀ%«ÇtÊ“hæài&x(ÿ‚»86^p(g›˘òÖÜ…‹±ZbPt_ÄÍˆπ‹ÜB˝ÿ8∂Bu©0»sÑoë‹Üiâ∫¸Üß&Î‹ÀÛ£øGG£ËD`ï”*/ﬂ∞6˜Äi∞wìùÖªﬂ+ª„yøÁ*r ß úBj@àMÙ buÓ€˙I	aNV⁄Ã<8AñÀÅ_0x∏L÷JéY[ÊE.„tÓìŒ*Ÿ‹⁄Ô<¸tk/¥%åsA¶πpWTsKëEëó ŒA~+qŒt¶tM#f5ÉπåNœÓD¸ÅÕ¡êc}òÇ…a*¥Cò~û˚≈Î6ŸÛ]$ë£‡~ñªπfkQﬂÀÊXÅ÷X)V‘S ®M¨8´Ç2sèÁRx£1ÆÃåÜù\ïóÁfñ”»g¯l6ä "[qî˙›~{<ïÄÙ…ÆÜj]=TLÆrëi∞`ﬁ˝v—¥3≥¬Ñ≥v©íB·dë?;À!ZòÃå≥$CáU—Ä;…ÎDÒÎèy≤ #€ÉÂ#Ob%=™fâ»√¯QåW‹ÇπÀŒ'OAìœ®TF.ﬁàüM˚s:è≥J^÷@>†C√û/õÒÀ√ƒô•\.e* *z--ÕÇÇ qØx)l¨`qnQ:aôs»˛¸$<˘P8æQ‰¿œbÄ©üü‹$7„â0
nó‰∆¿î—Û{vµÆozTRåJæZ
Yéí–∆s=iR√÷{k∞≤zpŒ7¬#<9–çgÿæâ`ÌÎ7?˚Ød:à∂mÁ¸70V<qŒ:ˆ¿p›b_ùôÄ≈π˚è¡ˆã≈|ù|+|µÄ‡dÀÜ
âN±∏±A&tŒﬂ:Ü‰F„só’¢ö
“AÛƒÅ<õ≈‡úÎNêﬂ£Nû¢§(æTb5o√jÁã¢êı‚®˙0|Ï"˛	t±Ÿñ≥hÙ¸‡Ø≤êõe¿ Û kÆ∞hÕŸ€z∏u˛üŒˇ√»r ’=Í<˛tkˆhÎIG¸PÙÚº'©«®h··–£=û˙e-'Ë&ñF5ä˝Ò€;é≤<{>Ëï’–Î4úJê^%j7∆àûæ@5Ö˜çõà©âz3j‹∑m`+-iH¨r ıë˘°}ƒÛi‰–˝@k=ˇ˚(ÔûQ:•Ö—≠2âÛÑılÁ$xY>ï¿Öÿ_‹å:‡C√˝¬;ˇ˛„“!ıÏ/4jb>^¸»|p-F_1Á≠Ô{Ãp(‹ò«4(\‹¥Î5` ÖÍöOA±ˆWl_üÕ∑óëjﬂÊ?ÊW¯ﬂ;¯w©¡ˇ6˘ﬂˇ€ÊóÊ≤¯ª ﬂ®–ê~1∞u˙≈!L⁄,eãO∑¬[Å•‚ÿ±¡Z|h}‡√ì]”á{>«¢0ûË«–g≤
ªª¯V¸œ#¸Û	ˇ√ˇ~/¯˚â“À‡\ñ≤ÑG¯3KÂ]MíH}T‹è±…ıN≈
£®üº⁄µM5%'N¡€ç¢\èÍY-˘ƒ8%˛˙ÕOﬁD§›Ia≤*¸™zˆª@Ωj§5",TmƒòßÂF\∏FèRËi±nØB'ûc[ΩÏ¥å<Aar`‘é'÷É˘´Â`T¨\!hö("»;Ñê-h«ÎÇÄÃ¸÷Ç!)Ol˜uπbI π3UÃÈ∆]K›◊ÍŸJ¬⁄ b$ïƒa∑úlßñß[º{@ƒP}≠ò"R¥î[C[Ëm[í¸‡)ÎH .H/7Oì≥+vP»Sá1\=¸î°<N{≤&SØdî∆]Iî∆çπ3πø∂ä›_”M5(∂R U&◊6’~≥Ã˙™tõdbÌ!!¥(¥R‚¿∆ŒìY3ˇ"oc˜OÎ®¬˛ã˚'Êˇ≈lJ —xBûOã Zãk◊"¿à Wé{éÉ∞œ@A1Ωƒ¸}¿ˇ¥aXØ)~ËºˆM¸˜)ÃÇô}˛„€•¡5ùÒõ 'É@si,v4˝o è`¿.Ñ≈˛—ﬂ«¥g∂39CÕ1Õl8jZé£Ê#øO,ıí2∂ã≤ú‰7	S-6	p’ÿjò“ªÁ´˘
e0÷0πãÂ¨πˆ{B∆ö£ÇÂOÒ„O®Jc§√á>∫\s–QC∫]#;ª€;è;€{§N:õ€±/;èv;è?Ì<⁄zºøìÔ2ıWé≥ﬁz˘|u"Ÿπ
cLŒV„TJ0’¡XÇ•Êœ¶j;Å¡Ì)j°QÃÙl¿™ei}€b˚ò0¨TÌÙko˚ÄV‡Ú–x˝ö_Ï”A◊wz>√/¿¿TœldY÷9…9ó\øgÛèÄŸ¿zˆCÜˆdR˘®Uk48#J±¥…÷1 ∏XT\˛Æœåœm≤ÈMÆ/Ö∑ÔQO:bû˝¿¯ﬁ Ö%û3ò¯·8À⁄ç€
1Ø|ËŸ0©ax,©äú–◊o~¯sTµ¬BVıëÅsı≤ÿ∑puõäãh/Ñ
qÚáﬁûÁL≈¿ÒíÒc¸[`Â÷#ï,'_Üï„´Yñì≥öî]í 3D8Ä«X© ÚCé*≈8•ÿ*d†¬Â¸S•‹3<Gâ´K	ﬁ*‚ÿBvI¥È≥ó¡•ÎY\K4}ºSfØÜ5ÙΩRèÑ¨∫ÜkﬁµèÀ0Îÿ4±Wk£m+YÿÄÂÁy,ÀV5D¸—eReèZJ–éreË∞Cú˛≤6gx©ä‡Äó»ß∂ÂœKNkƒ„Á≈`vy9gWÚ	≈ÙŸ£É¸§Át$å$)‘2w7“|wq6Ê«“ò$~/Sˇ4›KØÖM(cBLZF<ØZù-º]ôlb˚¿¢%àÓÔm=yäæDøÿ⁄#õ;d„·6H@[RHâ´HOΩ›òÛ6#∆-*∑î∑†ƒ}ı´˛È?N∫•ap∆.”›ñ±sä0©Hë¬wìü€Cj˙lç+€"∞T»1"√‚ö•∞á
´ÅL÷c^çwØp4∏sÿÊ¨ùÊ…~˜»‹÷Ò*Ÿ„ïõÄ'°ã‹Ÿu@±*¨À…ÄWÁÉnèÀ+„3[É.»K=∏õ{DyÜx1Äu|±_¯Ä|™„)YDTl9uPÛtDŒ3€æáa<—Húå)Ÿ‡üÒ⁄πÒ’åÖΩ◊€<H0∑º6¢‹I¥ÙsyX,årªøJ:O;∑CV*“-ûZ`‚X∑æ,ÔGÓ¯AïÅNØÁ∞wÉ%€÷Å¶\)åIO#[Xx7ö±;%Öœ	úﬂ”Bàº$Ò])¡ö©óˆ‹zîä·omÚË¸∑∫Aï‹≤ÛåÏ«”6ä;l 	P^5ÓÏ‡™“b˘°gÕÙ≤ç™ìÂZc&Åg
Á\N˙GÄ≈,]Ê¬üóiG%oŸÈ≥Ê"i-íˆ"YZ$ÀœW-EÒGh!,îbéáXtN¥W
,`®Àx`ò&We∏‰ÓyDΩ~çüƒä@°ßz„®ƒû
g.i∫1—F—÷J∑«— ©N«7§¢.WIºvs≥1ß4öÇh!◊2K¯Ó[ıX.7cm*M°ÒL2Cøk’©;uÜÏ‰"¡¡ÑOXÂBÃâ`^ ‚¯âF*UT…êØ$r‚ﬁÚà¨ÄdÆÉV(wûûﬂî0Q˚…X÷¥¢å¡Ñ#‚˙¨Qk¥û'(líÈÉçÏßep"7\qn˝´/ˇJU0Œ™">qí·G¿6¬>¥Á÷√ËV#´"ÅÍpŸ∞t™V_<#Ñ7¢ÏÒS"Ï÷\=¥µÛﬂÎ>ò·ÿ…ƒåc¿mî∏>%ˆ–∞úëkw6
≠Ω¡£f%”Q(û•PÑ^!ŸÅà€¬î¸ò¥·˜˜H'w¿º
Äê |NÕv(…õö+G¯®g3Ù≥Q)ˆ.#‰IUèZ"iüÑÃìÊåÔæÑ÷'Ûl•ú}c."¸éØ Ï\ﬂ.ØòRgx˘`>*‹NºÒÈç
Qﬁ„g6·[%ÒÉ∞Y¢ﬂ˛∂«-5ï˘°WΩˇdÅ^<úx´R´PJ578jEÏ†∫5®w∂R\Vÿn´YÚ±◊≈yM‹qQYÆ4Û’ZVcæ¬VBø[\ò0ﬁJÄJâ[≈	±hó'2âëôà"ÈîŒ>ax@;µüöh∞ŒMCÜ&WﬁàXﬂ8g—|û»ÅRÁ‚/{¶™≤W†°¢ÕR¡-∫≠†ﬁ{Èµëo=@÷W™÷V´Hü·\óŒ® ìÌï(_¬cåÛ”òz0P)Úå˜s›j≥Y†√ŒÀl¶¯Ã63@QıÄ◊Ù6¬ër’ÏeåI2‡˘àlº·àUïàsr∏)≥`rN]*._Ö•ÀÖ%@ÏåÃÒh‡ØÑÏTö_„I°9b…‚›dÏUñêÀ$ÂÌ7à+¬≤ÖEq`!HL['ó"§áZ§víÁoŒ^—¡ÔÑJøqo`ÏFîp|M,’8èmOI}Y¿#)j,ßgè±£h•¢qÑ˙òç0jdìØúí»*/8ûU‚í3UV#∂zâ‘â≠Â∏˜ˇ»…™2'±Üóu⁄V‰}
π“ˇ  ˇˇÏ]Õr«æÁ)F¥™ ê  í-¢H´däRËH&,J∂´HZZ K`•≈¥ª‡èiT%á\R©T~*U*äNŒ%U9Á 7—¯“=3˚?≥;KQ≤•""¥ÿùôùÈÈ˘¶ß˚Î‘áCÀe]C^T:Ò∏(º‘µÌiK}èÊKA≈∂Äﬂd2ıÛHôEqo≈ö®[Üé"PùûK6®ZzÃúÇõd^€¡ÇgÎàFÏD[Áˆ¯i22ÚRabRè˘
XëLÍ–◊HûÅqJûú¬.†ÛºÏ¿ºXπÒ
:$yöŒ4ùN•“ÉjÓæwCÓÑÀÈ#éôy$á‰à9q6ù{å≠—¡≈åì:/ê;ÃÒ9SU¯˜⁄5˝9Ç5Ç§•Â~áº a·ÇoÙGtä‘ÖËÄâ;}dí`nÁ?“[ü¡nÛ›MQ√á>KDÊö∏$ãÃ1ó6-4n)\æDrÅ^n>óX±jXxMgPÃﬁÀ “Eî;nŒMØ!qéÌ`åíœ˜ì‚⁄nßÿG”i%2o⁄˙J‚Àb≠±i8}”.†|”áRÂG»Nù>—wAf…ÏeÀkâ0%¸ íw˝Í\ˆÖá∆uÎËÍe:}∆°„Dq@7Ê4ù:˘YºŒΩ:[&Øª”ﬁÿÚGÛW’I»¿?™ÑˆŸwF‡&ñg¸)ˇ˛‰˙ 4z\≠Õ‡‹?¡p∫∏·Sq4∞≤Zkx”ûÁªUÿ(Æ’ä“T$Î–˛CÛjÖ/’AØN*¬¯Q©ám“Ï„ÿ`&&ˇ≈ ≠ó/a\€ÉëÜxÖi:Íö¢© KSeÛ–-'ÿ≥ 6W∫e–0g Ë.∞“ïΩla¡ôS':ãB…⁄ﬁ›¬•ŒêˇÃ4%‰by¨œ'!»Y8<ÌÄÉåD›T©h∑Nh£∏Øök-q®%o⁄7=è^””H3“7¸˛à ~“W‘6¶ÎR∑:w$’†9‹3é´‰\ùËvóx°ù>u]P¶”1¡ÇâA	&µC´úa·üi¬ï@S·Œ»°‡ÿ÷’srÖ™?¸≈J[#c`yò Ç≈Ï§€R ô8CÙå˝1R©rÿ‘tÃ§{ŸËC“h4∫ÁÇH¿Z¯eø˘«ÔIóª>πÖ~◊zPE◊≥Qı≥˙H©¥Ér~Êêªî¢¡ôgÅ\$ª>†¶S¬/ñM1Ó“À˝Q&~;≠N⁄≈≥“ÑﬂÂöàGN«Ô9g"«(8ExCÑF;ˆ˘Îk‰^Ã2‰qRmPc”qúXõE–p◊‹!Û™Ã^,¬<`M§éˆå√4&Xçv)∫wÛ{
ÄïH`ÜGó’ß#ﬂüxùfÛÿhåÕ¶"˘X~ÿ‚õ{ﬂµ◊ö√:∆≠œn·Ko\?4LÊ„á€¯lDø*∫Ä‹˙îÇÛ<?Å§nf/·:g9ló¨ïÜõ´øOñ€wVVW¢=\jıåˆ⁄A"·—ﬁÛ≈ã«>`˛ú¯°ò~nBAÇ©2¯∑Dºl:,NôÀpπïjë´üÄn7ÜÊÓã)&ﬂãÁ=bdÔB0A≤ææw{2QOúÀœ*©3µpz‡‡+©.PãS÷©3gïL^W%ÇVc}[6ﬂ∂LÚöp¡ƒØü√.¢Zy1ùΩ»µ ˛≈'*5bx‰◊è‹ﬂ%∞tx8Ç*kaÂ¬≤µˆaQ1ºÌxJ•’rÒEºπ(9,o/VhÚ;ÀÜµ™Úkƒag§géå#ãhoﬁ`4ÛuÉ|∆ÎAi·\èáz#‰‡Járœ6ZktD4¢T‹`ˆΩb≤º|$3´ì•ˆÂ§Mº∞r’¬ñ*-À5Ë%kYôc ;Wµwa/Ñ—äI-€Âˆ"®˜ÉSõYÓ/¨dÛ`c&£äÂò¯ËAñ»IÅ+ô¨‚
`·Á
`˝ Î∂ê…+tïÛÏªBW=Jôú|à¯*j{y|XKîˇ±`ú»7)‘oQ¢Ü˜
m¬ñºÌ∂	Ôƒtò”ƒ“XΩ+L£Ñ-ÔYUb@7èÈÕœ ßôèﬁ¨ï?-êñ—D˙>^k¡›2Æ3òÑ[FÑTg˙ uÃé}RÉ}Ø6˜´˚∑ˆΩ˘á∑ˆØ„ﬂÍ‡îF˝`°∂_kZZöâï§«∏éçò$CßŸ”{KQÊ¬:r6*:ÏNÏ,ÿeuR´E]∫ Uº•b*®]‡V
àÚ±c¡ÑB¥6Cß&1lk±+Ì3∏ ì@ÜWÀ¶y,`\DÃ‡ÓG&féa*¿èâ¯•èÿ‡Ò’Ä—ù}gﬂ)¿“Aµ0LOzı∑?°˜¬Ÿ&<ï§ñ™Ê/Ø»ºHç”å'∆ôGÍªt⁄ô“52Ü‰tï˙7ôG™túáªt¡‹è.'+|Ûœøì˘à$≤QD¶îÙVó*JPMø5sOËnëh˜Êüè»çb=úz≤∏ do˛ıødfu…#ú¨ÿp˙ÃJä]|É9FFMÀA\ƒŸ”)ŒœCÆ∏nÃ®ôO¶‘’ÒjèÉR 4.àé]jèxÖ|bü+‰ìW˝/˘h—7\ˇ7Ê)Ç’Úo–˜,≥:?ë-ßp)8%"s– ‡Wkbπ[¨‘Ç“+RëÇGÉ»àN&†Å6°ı°≤ûö'Ä¢0,fÉÒöÓâ($‡›:{ªÉƒ„xÈá,ê•¢r_P±∏’Ö7ÜØ–—À´√Ô÷Ò√—Q¯œÈ<ŒzFÁF/&WùL™Ω2%0)Ïdãî)Clá®$Y∑ÎP∞;D"‚zù7ûL°Rúﬁ]‘Îùh∫>^ò¡®àãTc
^‘&)|“9bú<`>i ôÆ;ÉÔ∫üÎº·‘·°Ÿä÷«|⁄W±)≥ª4óTıRj\°ú+î#ˇıù€wƒj˚ˆFùòA'Ô} æ®¶ãµJáEŸÕrE˘uâxΩ9¶(Êç‘/±1·ú‘¡Ì∑–?æŸe\º}3¨c=ÛC|@ãOß>£°K∫¨GHÜ™¿ˆ‹∑{„Ïfë—∑¸SòÏiΩoZ7-•oòÊÁ_0,F„¿Í∂ÿä¬Œ÷⁄ v˝ÁóN03ïãâ™æ_‹’⁄ 2Ü.3å£ó4v\7ßF'À+±˜I´◊Í/µîú≈¡äÉÑ¶"vÈÕ‚ôµ8Îƒ*gùHìÍ!1öG2éËªiSX´?K÷·Ur$ãEñy0ˆÚFœ£6Ä!ò«»ï¡_·]mIxWÇ-†’NØë©5©‡±Xw≤éÃ˜πŒŒ€ıoÉEsuñTZrh%Ó ≈‘,£Ö@‘‘3+	≤#ﬁ5`	V¥û" ˛Õ˛»·≈‘r-ótm√°‰ÎÌÆD}…i5÷G+Y¢%oo `å—ÎZoéV$Ö±FÅXqöé˚VœtÒlréEJ∂mìRA˘&πÉô¨0xﬁ©ÀÛí&Ö^.Gì Ä?⁄∑J‚lô4Òò’ãàL9^gné∫Y1z2±^ñå"Ïõ*V%=
,›¡©«-ÜŸ.ú£GåkØ’◊ZïôöA0ÒñH√,+Œt-ä¥∏¡˘ä¯E¸ôãø€o.4ô≠Q¬ÉÛ?ÏVîÃÉ“ÉXπ\†∆˝Í!Ÿ§S¶lS›…d@Õì#ÉT	«ã7ní˛H` x7r%0\˛F÷`ÄÑ]EÀüXáÏ!QSfF£1±Nær±+Ó[Œs•£›∫5™"^=∑øqñ x± d√ˆ7ÊÇ°ËZ' 8l‡:Áô'¥˜'$ÄYÿæ(©e\Û–t]”Ìb4√È∆úCÉKÚG§`Q}†üG∞õò|6Í”ÌÊ1†‰1‰æ|ùO°îyÉ”„
#DQº›C◊8≈‰üsüÖ£µ˝m…*‚ 0†Ùmƒ™¿l;\9Ìc0¨ ‚A2÷]‚ƒ∏xÈîPb£‘¬∞íbB–ï¢Å“5œƒT∆˝Ü˜ıÈƒ2˛µ·bœ∞Nh#Ôîé4•∏W{9hÎ,$¢1uhl$¨˘ã®µﬂ&ùú∆êÆÅ,ü”=E(£Ω‹EèÑHgô$º%6õç·&å°Ójë1H'RÌN!—éRº„ÿßÚ_GàL„≤¡∑`ãÍ&PòPBºÒXv8ea±Ëç ío⁄çäBâfmr<ÀÚ“JNñ$ßµ\ëqzÑ‚ñd˜‡¥l€öxñ'”†R˝ôÀú†y¥áˆí‹Õ3„8∆ë54|Í6˙–Ù5‹A„ÿµDû…ï™∂L¿¶´ÀÔ4Eó—ƒ√|≥V'∏˘URòﬁMòÄsÑäÿ&¥kNL≤‹»§0ß≤_ﬂàÀYñm]ì"3õ«qtY6ècLxÉ$çÈ¥C·ï¯&WëéQöh íΩV·¶,¯è+ÂêV[®Jb◊/ŒG∂Ón=zºµMvH˜ˆ=û§ôl>∫-S„∂§†¢¥Gvf2ËﬂæŸ^[[æπ∫ºÙÈßï⁄ú:*‹ÎãÛ◊¿ó?5-t<1Ü"§÷Ó	€∫bDÑs˛?ßoQèÅ∆)ÆÿZHwOSvÄ„“#Ão|∑àÊ3êhﬂ¬p˚±9	w-œ «÷t‹@;cvD8É“∆w/ë®x◊¥*™ë‚eò_úç#∆îDáb\\Mf|œà§˜}Í©≠∑∏…y+Wìb´ÕOØ^˛ñ˛V8¯›`3≤oî±ﬁàºh2FÖ·˘ß63eb«c–
Ê]`DÏH≥;„Å+xœ7&¬R‘,◊Îl&µπº¸£uué,3)ë\¡ˆ®èä◊Ë4Â—<B@aX0À≈Õk2#∂Z°r/…≠ŒyVÊD1∞Ã~ı   ˇˇ …œeÛ