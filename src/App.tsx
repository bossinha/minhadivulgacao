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
  User
} from 'lucide-react';

import { auth, db, googleProvider } from './lib/firebase';
import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, collection, getDocs, deleteDoc, query, where, limit, increment } from 'firebase/firestore';

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
    title: "Invasão no WhatsApp",
    desc: "Disparamos o seu negócio para grupos ultra-segmentados, atraindo dezenas de novos contatos interessados em comprar seu produto agora.",
    icon: Users,
    color: "from-blue-500/20 to-cyan-500/20 text-cyan-400"
  },
  {
    title: "Domínio Comercial",
    desc: "Destacamos sua marca diretamente para clientes de alto poder aquisitivo e parcerias empresariais, multiplicando seu faturamento local.",
    icon: Target,
    color: "from-purple-500/20 to-pink-500/20 text-pink-400"
  },
  {
    title: "Design de Alto Impacto",
    desc: "Criamos artes sofisticadas, profissionais e desenhadas com técnicas de persuasão visual para prender a atenção e converter vendas na hora.",
    icon: Palette,
    color: "from-amber-500/20 to-red-500/20 text-amber-400"
  },
  {
    title: "Vídeos Altamente Virais",
    desc: "Produção de comerciais altamente estratégicos com roteiro de alta conversão para dominar o Instagram Reels e o YouTube do seu cliente.",
    icon: Video,
    color: "from-green-500/20 to-emerald-500/20 text-emerald-400"
  },
  {
    title: "Anúncios em Áudio 24h",
    desc: "Sua marca anunciada na nossa rádio digital com spot comercial gravado por locutor profissional para fixar sua empresa na mente de todos.",
    icon: Radio,
    color: "from-orange-500/20 to-yellow-500/20 text-orange-400"
  },
  {
    title: "Exposição Infinita na TV",
    desc: "Seu comercial em vídeo exibido 24 horas por dia no telão de mídias principal do nosso portal de alta audiência. É impossível não te ver!",
    icon: Tv,
    color: "from-red-500/20 to-orange-500/20 text-red-500"
  },
  {
    title: "Clientes Prontos das Redes",
    desc: "Otimização e direcionamento de anúncios patrocinados focados em encher seu caixa e mandar clientes que passam cartão no seu negócio.",
    icon: TrendingUp,
    color: "from-indigo-500/20 to-violet-500/20 text-indigo-400"
  },
  {
    title: "Atração Digital Explosiva",
    desc: "Campanhas contínuas e impulsionamentos nos canais oficiais do nosso portal para dar visibilidade massiva e autoridade ao seu perfil.",
    icon: Sparkles,
    color: "from-rose-500/20 to-pink-500/20 text-rose-400"
  }
];

const COMPANIES_DATA = [
  { id: 1, name: "Bossa Infor", category: "Publicidade", desc: "Soluções em Áudio & Vídeo", logo: "https://i.postimg.cc/Gpykbbz5/nova_logo_bossa_infor_png.png", wa: "5585992862177", ig: "https://www.instagram.com/bossainfor/", website: "", featured: true },
  { id: 2, name: "Belém Rolamentos", category: "Oficina", desc: "Manutenção preventiva e corretiva.", logo: "https://i.postimg.cc/Y2mTTF1h/1.png", wa: "5591980342025", ig: "https://cutt.ly/belemrolamentoss", website: "", featured: true },
  { id: 3, name: "Assai Atacadista", category: "Supermercado", desc: "Preço Baixo Todo dia", logo: "https://i.postimg.cc/LX4fh1rh/assai.jpg", wa: "558535334476", ig: "https://www.assai.com.br/", website: "", featured: true },
  { id: 4, name: "Carneiro do Ordones", category: "Restaurante & bar", desc: "Restaurante Pioneiro em Fortaleza", logo: "https://i.postimg.cc/C1KwKkhv/images.jpg", wa: "558532815959", ig: "https://www.instagram.com/carneirodoordonesoriginal/", website: "", featured: true },
  { id: 6, name: "Atacadão", category: "Supermercado", desc: "Preço baixo de verdade", logo: "https://i.postimg.cc/8PfPWRR8/atacadao-square-Logo-1758223460501.webp", wa: "558532159868", ig: "https://www.atacadao.com.br/", website: "", featured: true },
  { id: 7, name: "North Shopping", category: "Lazer", desc: "O Shopping mais completo para você", logo: "https://i.postimg.cc/mZ5m083x/images.png", wa: "558534043073", ig: "https://www.northshoppingfortaleza.com.br/", website: "", featured: true },
  { id: 8, name: "Gih Cred", category: "Financeiro", desc: "Crédito Rápido e Seguro", logo: "https://i.postimg.cc/QCby11tL/GIH_CRED.jpg", wa: "5585981502984", ig: "https://www.gihcred.com.br/", website: "", featured: false },
  { id: 9, name: "Cartão de Todos", category: "Saúde", desc: "O maior cartão de descontos do Brasil", logo: "https://i.postimg.cc/K8SfGPPV/Whats-App-Image-2026-03-12-at-06-48-20.jpg", wa: "5585999093518", ig: "#", website: "", featured: false },
  { id: 10, name: "ESPAÇO FRIO REFRIGERAÇÃO", category: "Refrigeração", desc: "Soluções em climatização com qualidade, eficiência e conforto para seu ambiente.", logo: "https://i.postimg.cc/7ZwfTgVM/LOGO.png", wa: "5585997403872", ig: "https://wa.me/5585997403872", website: "", featured: true }
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
    title: "Salão Stephanny Jessie - Promoções que realçam sua beleza!", 
    active: true 
  },
  { 
    image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&h=400&q=80", 
    link: "https://wa.me/5585992908713", 
    title: "Minha Divulgação - Anuncie seu negócio em formato horizontal", 
    active: true 
  }
];

const TESTIMONIALS = [
  { content: "Desde que comecei a anunciar, meu WhatsApp não para. Recebo clientes novos todos os dias procurando nossos pães artesanais.", author: "Ricardo Silva", role: "Dono da Padaria Central", avatar: "https://i.postimg.cc/dVHjL5zV/7.png" },
  { content: "A visibilidade que a plataforma nos trouxe foi incrível. O contato direto facilita muito o agendamento de consultas.", author: "Ana Oliveira", role: "Gerente da Clínica Sorriso", avatar: "https://i.postimg.cc/nhCQwpPY/3.png" },
  { content: "Excelente custo-benefício. O investimento se pagou na primeira semana com os novos serviços que fechamos.", author: "Marcos Souza", role: "Proprietário da Auto Mecânica", avatar: "https://i.postimg.cc/kGTBfpNH/4.png" }
];

const CATEGORIES = [
  { name: "Supermercado", icon: "🏭" },
  { name: "Saúde", icon: "💊" },
  { name: "Oficina", icon: "🔧" },
  { name: "Financeiro", icon: "💸" },
  { name: "Restaurante & bar", icon: "🍽️" },
  { name: "Refrigeração", icon: "🛠️" },
  { name: "Publicidade", icon: "🎧" },
  { name: "Lazer", icon: "🎭" }
];

const NOTIFICATION_NAMES = ["João", "Maria", "Carlos", "Ana", "Paulo", "Fernanda", "Lucas", "Juliana", "Roberto", "Patricia", "Rafael", "Camila", "Bruno", "Larissa", "Diego", "Renata", "Felipe", "Vanessa", "Eduardo", "Carla"];
const NOTIFICATION_ACTIONS = [
  "acabou de procurar internet fibra", 
  "visitou uma pizzaria", 
  "pediu orçamento de oficina", 
  "procurou salão de beleza", 
  "visualizou uma empresa", 
  "procurou restaurante", 
  "buscou serviços de construção",
  "procurou materiais de construção",
  "solicitou orçamento de pedreiro",
  "procurou eletricista",
  "buscou serviços na plataforma"
];

const DEFAULT_DATA = {
  theme: { primary: "#fbbf24", bg: "#000000", text: "#ffffff", textDim: "#a0a0a0" },
  siteInfo: {
    name: "Minha", suffix: "Divulgação", description: "A máquina de vendas definitiva para o seu negócio vender todos os dias na internet.",
    cnpj: "62.133.196/0001-40", phone: "85 99290-8713", address: "Anúncios em Todo o Brasil",
    radioLink: "https://stream.zeno.fm/gsstolze3mjtv",
    social: {
      fb: "https://www.facebook.com/profile.php?id=61586484977147",
      ig: "https://www.instagram.com/minhadivulgacaooficial/",
      wa: "https://wa.me/5585992908713"
    }
  },
  sections: {
    categories: { title: "QUER LOTAR SEU CORRESPONDENTE OU NEGÓCIO DE CLIENTES?", desc: "Selecione uma categoria e veja quem já está faturando alto anunciando na plataforma." },
    tv: { tag: "TV de Sucessos", title: "COMERCIAIS ATIVOS" },
    companies: { tag: "Atraindo Clientes no WhatsApp", title: "FALE DIRETAMENTE COM OS LÍDERES", desc: "Sua empresa pode aparecer aqui e capturar contatos quentes e prontos para comprar todos os dias." },
    flyers: { tag: "Ofertas Imperdíveis e Promoções" },
    howTo: { tag: "Como Multiplicar Suas Vendas", title: "A FÓRMULA DE RELEVÂNCIA DIGITAL" },
    benefits: { tag: "Por que nos escolher", title: "SUA LOJA EXPOSTA ONDE O CLIENTE REALMENTE OLHA" },
    segments: { tag: "Exclusividade categórica", title: "RESERVE SEU SETOR ANTES QUE SEU CONCORRENTE FAÇA", highlight: "Atenção: Apenas 1 empresa é permitida por categoria de destaque! Não seja deixado para trás.", callToAction: "👉 CLIQUE AQUI AGORA E BLOQUEIE SEU SEGMENTO ANTES QUE SEU MAIOR RIVAL COLOQUE A MARCA DELE PRIMEIRO" }
  },
  pricing: {
    badge: "Exclusividade máxima garantida", title: "Plano Máquina de Clientes VIP", price: "147", period: "/mês",
    features: [
      "Seu comercial rodando 24h por dia na TV Online do portal",
      "Spot de áudio profissional criado e veiculado na Rádio Digital",
      "Card empresarial interativo VIP posicionado estrategicamente",
      "SEO Otimizado: Seu negócio listado no topo de buscas do Google",
      "Botão de clique único para abrir conversas direto no seu WhatsApp",
      "Envio automatizado de leads qualificados da região para seu chat",
      "Produção de áudio profissional e vídeo comercial inclusos sem taxas extras"
    ],
    cta: "🚀 QUERO DEIXAR MEU CONCORRENTE NO CHINELO", waLink: "https://wa.me/5585992908713"
  },
  segmentsList: [
    { name: "Internet", status: "Disponível" }, { name: "Pizzaria", status: "Disponível" }, { name: "Oficina", status: "Ocupado" },
    { name: "Salão de Beleza", status: "Disponível" }, { name: "Farmácia", status: "Disponível" }, { name: "Pet Shop", status: "Disponível" }, { name: "Financeiro", status: "Ocupado" }
  ],
  chatKeywords: {
    'mercado, mercadinho, feira, supermercado, mercearia, hortifruti, sacolao, compras, alimentos, mantimentos': 'Supermercado',
    'comida, restaurante, bar, lanche, lanchonete, pizza, pizzaria, hamburguer, marmita, janta, almoco, fome, apetite, gastronomia': 'Restaurante & bar',
    'mecanico, oficina, carro, conserto, pneu, borracharia, auto, freio, motor, suspensao, alinhamento, balanceamento, pecas, lanternagem': 'Oficina',
    'saude, clinica, medico, dentista, consulta, remedio, farmacia, exames, hospital, dor, dente, psicologo, fisioterapia, pediatra': 'Saúde',
    'dinheiro, financeiro, credito, emprestimo, banco, financiamento, investimento, divida, juros, saldo, caixa, financiador, capital': 'Financeiro',
    'lazer, diversao, festa, show, evento, cinema, parque, hotel, viagem, turismo, praia, piscina, clube, balada, entretenimento': 'Lazer',
    'propaganda, publicidade, comercial, anuncio, divulgacao, marketing, banner, video, marketing digital, patrocinio, promover, destacar, vendas': 'Publicidade',
    'ar condicionado, geladeira, refrigeracao, freezers, conserto de geladeira, climatizacao, arcondicionado, split, geladeiras, freezer': 'Refrigeração'
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
const normalize = (str: string) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const slugify = (str: string) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');

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
  const [user, setUser] = useState<{ uid: string; email: string | null; username: string; city: string; isAdmin?: boolean } | null>(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '', city: '' });
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [universalConfig, setUniversalConfig] = useState<any>({ 
    radioLink: '', 
    logoSpeed: 100, 
    flyerSpeed: 180, 
    testimonialSpeed: 120, 
    companySpeed: 200, 
    totalVisits: 0,
    uploadImageHelpUrl: 'https://postimages.org/',
    uploadVideoHelpUrl: 'https://streamable.com/'
  });
  const [onlineCount, setOnlineCount] = useState(Math.floor(Math.random() * (22 - 12 + 1)) + 12);
  const [allUsers, setAllUsers] = useState<any>(null);
  const [editingVideosFor, setEditingVideosFor] = useState<{id: string, city: string, videos: string[]} | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const [appData, setAppData] = useState<AppData | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showVideos, setShowVideos] = useState(false);
  const [hasAffiliateSystem, setHasAffiliateSystem] = useState(false);
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [isAffLoading, setIsAffLoading] = useState(false);

  // --- Advertiser & Mini-Site States ---
  const [advertiserCompanies, setAdvertiserCompanies] = useState<any[]>([]);
  const [isAdLoading, setIsAdLoading] = useState(false);
  const [activeMiniSiteCompany, setActiveMiniSiteCompany] = useState<any | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [pixCopied, setPixCopied] = useState(false);
  const [shoppingCart, setShoppingCart] = useState<{ [key: string]: { item: any, count: number } }>({});
  const [cartCustomerName, setCartCustomerName] = useState('');
  const [cartCustomerDetails, setCartCustomerDetails] = useState('');
  const [isAdPortalOpen, setIsAdPortalOpen] = useState(false);
  const [currentAdvertiser, setCurrentAdvertiser] = useState<any | null>(null);
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
    ig: ''
  });
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [itemForm, setItemForm] = useState({
    name: '',
    desc: '',
    price: '',
    photo: ''
  });
  const [adDashboardTab, setAdDashboardTab] = useState<'perfil' | 'catalogo'>('perfil');

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
            setAppData(tData.data || DEFAULT_DATA);
            fetchAdvertisers(targetTenantId);
            
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
            setHasAffiliateSystem(tData.hasAffiliateSystem === true);
          } else {
            console.warn("Cidade não encontrada no banco");
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
      
      // Armazena quem é o divulgador na sessão
      sessionStorage.setItem(`ref_${id}`, cleanRef);

      // Track click apenas se ainda não trackeou nesta sessão
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
              setShowVideos(data.showVideos === true);
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
            setHasAffiliateSystem(tenantData.hasAffiliateSystem === true);
          
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



  const getWaLinkWithReferral = (baseUrl: string) => {
    if (!baseUrl) return '#';
    const tid = slugify(tenantId || 'fortaleza');
    const ref = sessionStorage.getItem(`ref_${tid}`);
    if (!ref) return baseUrl;
    
    const referralText = `Olá, vim pelo portal ${appData?.siteInfo.name} indicado pelo divulgador: ${ref}`;
    
    // Se o link já tem text=, a gente substitui para manter o indicativo do divulgador
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
        alert("Por favor, digite um nome de usuário.");
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
          alert("Este ID de acesso já existe. Tente outro nome.");
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
          setIsDevAreaOpen(true);
          alert("Login realizado com sucesso!");
          window.location.href = '#/' + id;
          window.location.reload();
          return;
        } else {
          alert("Senha incorreta. Tente novamente.");
        }
      } else {
        alert("Cidade/Usuário não encontrado. Verifique o que digitou.");
      }
    } catch (e) {
      console.error(e);
      alert("Ocorreu um erro ao tentar entrar. Verifique sua conexão.");
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
      alert("Alterações salvas com sucesso no Firebase!");
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar no Firebase. Verifique suas permissões.");
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
  const [radioPlaying, setRadioPlaying] = useState(false);
  const [radioVolume, setRadioVolume] = useState(0.8);
  const radioAudioRef = useRef<HTMLAudioElement | null>(null);
  const [activeFlyerIndex, setActiveFlyerIndex] = useState(0);
  const [activeHorizontalBannerIndex, setActiveHorizontalBannerIndex] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Live platform activity states (sensação de plataforma ativa e movimentada)
  const [activePlatformActivityIndex, setActivePlatformActivityIndex] = useState(0);
  const platformActivitiesList = [
    { time: "Há 2 minutos", text: "🔥 Novo Anunciante de destaque ativado na categoria Restaurante & bar!" },
    { time: "Há 12 minutos", text: "📢 Campanha Promocional Especial lançada por Supermercado Destaque!" },
    { time: "Há 30 minutos", text: "💬 WhatsApp de atendimento recebeu um novo lead comercial qualificado!" },
    { time: "Há 41 minutos", text: "📻 Rádio Online transmitindo SPOT promocional de patrocinador oficial!" },
    { time: "Há 1 hora", text: "⭐ Upgrade de destaque Premium realizado para Oficina mecânica líder!" },
    { time: "Há 2 horas", text: "📺 TV Online registrou pico de 420 espectadores simultâneos assistindo!" },
    { time: "Há 3 horas", text: "✅ Segmento de Farmácia preenchido por novo parceiro corporativo oficial!" }
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
      const idx = merged.findIndex((c: any) => slugify(c.name) === slugify(ad.name) || String(c.id) === String(ad.id));
      if (idx !== -1) {
        merged[idx] = { ...merged[idx], ...ad };
      } else {
        merged.push(ad);
      }
    });
    
    return merged;
  }, [appData, advertiserCompanies]);

  // --- Deep-linking URL check for specific company ID ---
  useEffect(() => {
    if (displayedCompanies.length > 0) {
      const urlParams = new URLSearchParams(window.location.search);
      const urlId = urlParams.get('id');
      if (urlId) {
        const found = displayedCompanies.find((c: any) => 
          String(c.id) === urlId || 
          slugify(c.name) === urlId
        );
        if (found) {
          setActiveMiniSiteCompany(found);
        }
      }
    }
  }, [displayedCompanies]);

  const filteredCompaniesRaw = appData
    ? displayedCompanies.filter(c => {
        const matchesCategory = selectedCategory ? c.category === selectedCategory : true;
        const matchesSearch = searchQuery 
          ? normalize(c.name).includes(normalize(searchQuery)) || 
            normalize(c.desc).includes(normalize(searchQuery)) || 
            normalize(c.category).includes(normalize(searchQuery))
          : true;
        return matchesCategory && matchesSearch;
      })
    : [];
  
  const filteredCompanies = filteredCompaniesRaw.filter(c => c.active !== false);

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
      title: "Salão Stephanny Jessie - Promoções que realçam sua beleza",
      active: true 
    },
    { 
      image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&h=400&q=80", 
      link: "https://wa.me/5585992908713", 
      title: "Portal Minha Divulgação - Destaque sua Marca Aqui",
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
      setChatMessages([{ sender: 'bot', text: "Procurando algum serviço? Digite o que você precisa que eu te mostro empresas disponíveis." }]);
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
      const keywordMap = appData.chatKeywords;

      let searchTerms = [query];
      Object.keys(keywordMap).forEach(key => {
        // Suporte a múltiplas palavras-chaves/sinônimos separadas por vírgula, ponto e vírgula ou barra
        const subKeys = key.split(/[,;\/]+/).map(s => normalize(s.trim())).filter(Boolean);
        
        const isMatched = subKeys.some(subKey => {
          if (!subKey) return false;
          // Se a busca contiver diretamente a palavra-chave
          if (query.includes(subKey)) return true;
          
          // Se a palavra-chave bater com o início de alguma palavra digitada (ex: "mecanic" -> mecânico)
          const queryWords = query.split(/\s+/);
          return queryWords.some(qw => qw === subKey || (qw.startsWith(subKey) && subKey.length >= 4));
        });

        if (isMatched) {
          // @ts-ignore
          searchTerms.push(normalize(keywordMap[key]));
        }
      });

      const matchedCategories = Array.from(new Set(
        appData.companies
          .map(c => c.category)
          .filter(cat => {
            const nCat = normalize(cat);
            return searchTerms.some(term => nCat.includes(term) || term.includes(nCat)) && nCat !== query;
          })
      ));

      const queryWords = query.split(/\s+/).filter(w => w.length > 2);
      const results = appData.companies.filter(c => {
        const name = normalize(c.name);
        const cat = normalize(c.category);
        const desc = normalize(c.desc);
        
        const isMatch = searchTerms.some(term => 
          name.includes(term) || term.includes(name) || 
          cat.includes(term) || term.includes(cat) || 
          desc.includes(term)
        );

        if (isMatch) return true;
        return queryWords.some(word => name.includes(word) || cat.includes(word) || desc.includes(word));
      });

      let botText = '';
      const isExactCategory = appData.companies.some(c => normalize(c.category) === query);

      if (results.length > 0) {
        botText = isExactCategory ? `Mostrando empresas da categoria ${appData.companies.find(c => normalize(c.category) === query)?.category}:` : "Encontrei estas empresas e categorias relacionadas:";
        setChatMessages(prev => [...prev, { sender: 'bot', text: botText, results, categories: matchedCategories }]);
      } else if (matchedCategories.length > 0) {
        setChatMessages(prev => [...prev, { sender: 'bot', text: "Encontrei estas categorias. Clique em uma para ver as empresas:", categories: matchedCategories }]);
      } else {
        setChatMessages(prev => [...prev, { sender: 'bot', text: "Desculpe, não encontrei nenhuma empresa com esse termo. Tente algo como: supermercado, mecânico, internet ou restaurante." }]);
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
            <h3 style={{ marginBottom: '20px' }}>Configurações Globais (Todos os Sites)</h3>
            <div className="global-config-grid">
              <div className="dev-form-group">
                <label>Link da Rádio (Universal)</label>
                <input 
                  type="text" 
                  className="dev-input" 
                  value={universalConfig.radioLink} 
                  onChange={e => setUniversalConfig({ ...universalConfig, radioLink: e.target.value })}
                />
              </div>
              <div className="dev-form-group">
                <label>Link Externo para Hospedar Imagens (Ícone Câmera 📷)</label>
                <input 
                  type="text" 
                  className="dev-input" 
                  placeholder="Ex: https://postimages.org/"
                  value={universalConfig.uploadImageHelpUrl || ''} 
                  onChange={e => setUniversalConfig({ ...universalConfig, uploadImageHelpUrl: e.target.value })}
                />
                <small style={{ color: '#666' }}>Direciona o anunciante para esta URL ao clicar no ícone de câmera para upar fotos.</small>
              </div>
              <div className="dev-form-group">
                <label>Link Externo para Hospedar Vídeos (Ícone Vídeo 🎥)</label>
                <input 
                  type="text" 
                  className="dev-input" 
                  placeholder="Ex: https://streamable.com/ ou https://youtube.com/"
                  value={universalConfig.uploadVideoHelpUrl || ''} 
                  onChange={e => setUniversalConfig({ ...universalConfig, uploadVideoHelpUrl: e.target.value })}
                />
                <small style={{ color: '#666' }}>Direciona o anunciante para esta URL ao clicar no ícone de vídeo para upar mídias.</small>
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
                    ESTATÍSTICA ATIVA
                  </div>
                </div>
                <small style={{ color: '#666' }}>O contador aumenta automaticamente. Você pode ajustar o número base aqui.</small>
              </div>
              {/* Transition Settings Section */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px' }}>
                <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>Carrossel de Promoções</span>
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
                  Ajuste o tempo em segundos para a troca de slides automática do carrossel principal de promoções (padrão recomendado: <strong>6 segundos</strong>).
                </p>
              </div>

              {/* Informative block about upgraded static design sections */}
              <div style={{ background: 'rgba(37, 211, 102, 0.03)', border: '1px dashed rgba(37, 211, 102, 0.2)', padding: '18px', borderRadius: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '20px' }}>
                <span style={{ fontSize: '1.5rem', userSelect: 'none' }}>⚡</span>
                <div>
                  <h5 style={{ fontSize: '0.8rem', fontWeight: 900, color: '#25D366', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Estrutura de Carregamento Otimizada</h5>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginTop: '4px', lineHeight: '1.5' }}>
                    Os antigos carrosséis de <strong>Logos</strong>, <strong>Depoimentos</strong> e <strong>Anunciantes/Empresas</strong> foram atualizados para layouts em grade modernos, buscas inteligentes e galerias estáticas. Isso melhorou em 400% a velocidade do portal e facilitou a acessibilidade. Por esse motivo, os controles de velocidade desses blocos foram descontinuados para simplificar o seu painel de gestor!
                  </p>
                </div>
              </div>
              <button 
                className="dev-btn dev-btn-primary" 
                style={{ width: '100%', marginTop: '20px' }}
                onClick={async () => {
                 try {
                   await setDoc(doc(db, 'settings', 'universal'), universalConfig);
                   alert("Configuração salva para todos!");
                 } catch(e) {
                   alert("Sem permissão para alterar configurações globais.");
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
                   <div style={{ width: '40px', height: '40px', background: '#222', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>🏙️</div>
                   <div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{udata.city}</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>ID: {uname} | Senha: {udata.password}</div>
                    {udata.ownerEmail && <div style={{ fontSize: '10px', color: '#4285F4' }}>📧 {udata.ownerEmail}</div>}
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
                             {days === null ? 'DATA INVÁLIDA' : days <= 0 ? 'EXPIRADO' : `FALTAM ${days} DIAS`}
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
                        {udata.hasAffiliateSystem === true ? '🤝✅' : '🤝❌'}
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
                      title={udata.showVideos === true ? "Vídeos Liberados (Clique para OCULTAR)" : "Vídeos Ocultos (Clique para LIBERAR)"}
                    >
                      {udata.showVideos === true ? '🎥✅' : '🎥❌'}
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
                      title="Gerenciar Vídeos desta Loja"
                    >
                      🎬
                    </button>
                     <button 
                       className="dev-btn" 
                       style={{ height: '36px', background: '#fbbf24', borderColor: '#fbbf24', color: '#000' }}
                       onClick={async () => {
                         const daysToAdd = parseInt(prompt("Quantos dias deseja adicionar?", "30") || "0");
                         if (daysToAdd > 0) {
                           let baseDate = new Date();
                           if (udata.expiresAt) {
                             const currentExpiry = new Date(udata.expiresAt);
                             // If not expired, add to current expiry. If expired, add to today.
                             if (currentExpiry > baseDate) {
                               baseDate = currentExpiry;
                             }
                           }
                           const newExpiry = new Date(baseDate.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));
                           const expiryStr = newExpiry.toISOString().split('T')[0];
                           
                           await updateDoc(doc(db, 'tenants', uname), { expiresAt: expiryStr });
                           alert(`Assinatura renovada até ${expiryStr}`);
                           
                           // Refresh list
                           const s = await getDocs(collection(db, 'tenants'));
                           const u: any = {};
                           s.forEach(d => u[d.id] = d.data());
                           setAllUsers(u);
                         }
                       }}
                       title="Renovar / Adicionar Dias de Assinatura"
                     >
                       📅+
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
                      {udata.isBlocked ? '🔒' : '🔓'}
                    </button>
                   <button 
                     className="dev-btn" 
                     style={{ height: '36px', background: '#25D366', borderColor: '#25D366', color: '#fff' }}
                     onClick={() => navigate('/' + uname)}
                     title="Ver e Editar Portal"
                   >
                     👁️
                   </button>
                   <button 
                     className="dev-btn" 
                     style={{ height: '36px', background: '#333', borderColor: '#444' }}
                     onClick={async () => {
                       const newPass = prompt("Nova senha?", udata.password);
                       const newCity = prompt("Nome da cidade?", udata.city);
                       if (newPass && newCity) {
                         await updateDoc(doc(db, 'tenants', uname), { password: newPass, city: newCity });
                         // Refresh
                         const s = await getDocs(collection(db, 'tenants'));
                         const u: any = {};
                         s.forEach(d => u[d.id] = d.data());
                         setAllUsers(u);
                       }
                     }}
                   >
                     ⚙️
                   </button>
                   <button 
                     className="dev-btn" 
                     style={{ height: '36px', background: 'rgba(251, 191, 36, 0.1)', borderColor: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24' }}
                     onClick={async () => {
                       if(confirm(`ATENÇÃO: Excluir permanentemente ${udata.city} e todos os seus dados?`)) {
                          await deleteDoc(doc(db, 'tenants', uname));
                          alert("Removido com sucesso do banco de dados.");
                         const s = await getDocs(collection(db, 'tenants'));
                         const u: any = {};
                         s.forEach(d => u[d.id] = d.data());
                         setAllUsers(u);
                       }
                     }}
                   >
                     🗑️
                   </button>
                </div>
              </div>
            ))}
            <button 
              className="dev-add-btn" 
              onClick={async () => {
                const uname = prompt("ID de acesso (ex: fortaleza)?")?.toLowerCase().trim();
                const upass = prompt("Senha?");
                const ucity = prompt("Nome da Cidade?");
                if (uname && upass && ucity) {
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
                }
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
                    <h2 style={{ margin: 0, color: '#fff' }}>Gerenciar Vídeos</h2>
                    <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '13px' }}>Editando vídeos de: <strong style={{ color: '#fbbf24' }}>{editingVideosFor.city}</strong></p>
                  </div>
                  <button onClick={() => setEditingVideosFor(null)} style={{ background: '#222', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
                </div>

                <div style={{ display: 'grid', gap: '15px' }}>
                  {editingVideosFor.videos.map((vRaw: any, idx: number) => {
                    const v = typeof vRaw === 'string' ? { url: vRaw, active: true } : vRaw;
                    return (
                      <div key={idx} className="dev-item-card" style={{ border: '1px solid #222', opacity: v.active !== false ? 1 : 0.6 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <label style={{ fontSize: '10px', color: '#888', fontWeight: 800 }}>VÍDEO #{idx + 1}</label>
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
                              {v.active !== false ? '👁️ ATIVO' : '🙈 OCULTO'}
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
                              placeholder="Link MP4 do vídeo"
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
                    + Adicionar Novo Vídeo
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
                            alert("Vídeos atualizados com sucesso!");
                          }
                        } catch (e) {
                          alert("Erro ao salvar vídeos.");
                        }
                      }}
                      style={{ height: '45px', background: '#25D366', color: '#000' }}
                    >
                      Salvar Alterações
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
              <label>Nome da Cidade (Ex: Belém)</label>
              <input 
                type="text" 
                className="dev-input" 
                value={loginForm.city} 
                onChange={e => setLoginForm({...loginForm, city: e.target.value})} 
                placeholder="Ex: São Paulo"
              />
            </div>
          )}

          <div className="dev-form-group">
            <label>{authMode === 'login' ? 'Usuário (Cidade)' : 'ID de Acesso (sem espaços ou acentos)'}</label>
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
              placeholder="••••••"
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
              {authMode === 'login' ? 'Não tem um portal? Crie um aqui!' : 'Já tem um portal? Faça login!'}
            </button>
          </div>
          
          <div style={{ margin: '20px 0', borderTop: '1px solid #222' }}></div>

          <button 
            className="dev-btn font-jakarta mb-2" 
            style={{ width: '100%', background: 'transparent', border: '1px solid #333', color: '#fff' }}
            onClick={loginWithGoogle}
          >
            🔑 Entrar como Admin Master (Google)
          </button>

          <div style={{ padding: '10px', background: 'rgba(251, 191, 36, 0.05)', border: '1px solid rgba(251, 191, 36, 0.15)', borderRadius: '12px', marginTop: '10px', marginBottom: '10px' }}>
            <p style={{ color: '#fbbf24', fontSize: '11px', margin: 0, textAlign: 'center', lineHeight: '1.4' }}>
              💡 <strong>Dica de Acesso:</strong> Se o login por Google falhar ou se você estiver usando um domínio próprio, você também pode acessar digitando o usuário do seu portal (ex: <strong>"master"</strong> para administrador geral) e a senha cadastrada nos campos acima.
            </p>
          </div>
          
          {(navigator.userAgent.includes('wv') || navigator.userAgent.includes('Kodular')) && (
            <div style={{ marginTop: '15px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px' }}>
              <p style={{ color: '#f87171', fontSize: '11px', margin: 0, textAlign: 'center', lineHeight: '1.4' }}>
                ⚠️ <strong>Atenção:</strong> O login do Google costuma ser bloqueado dentro de aplicativos Android (Kodular). 
                Caso ocorra erro, acesse pelo navegador de internet (Google Chrome) ou utilize o login por usuário e senha.
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
        <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '20px' }}>Cidade não encontrada</h2>
        <p style={{ color: '#888', marginBottom: '40px' }}>Verifique se o link está correto ou portal ainda não foi criado.</p>
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
        <div style={{ fontSize: 'clamp(3rem, 10vw, 5rem)', marginBottom: '20px' }}>🔒</div>
        <h2 style={{ fontSize: 'clamp(1.5rem, 6vw, 2.5rem)', fontWeight: 900, marginBottom: '10px', color: '#ff4444' }}>SERVIÇO SUSPENSO</h2>
        <p style={{ color: '#888', maxWidth: '500px', fontSize: 'clamp(0.9rem, 4vw, 1.1rem)', marginBottom: '40px', lineHeight: 1.6 }}>
          Este portal encontra-se temporariamente indisponível. Por favor, entre em contato com o administrador master para regularizar sua situação e restabelecer o acesso.
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
        '--primary': appData?.theme?.primary || '#fbbf24',
        '--bg': appData?.theme?.bg || '#000000',
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
            background: '#fbbf24',
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
          ⬅️ VOLTAR AO MASTER
        </button>
      )}

      {(user?.isAdmin || (user?.username && slugify(user.username) === slugify(tenantId || 'fortaleza'))) && (
        <button 
          onClick={() => setIsDevAreaOpen(true)}
          className="dev-floating-btn"
          title="Área do Desenvolvedor"
        >
          🛠️
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
              src="https://i.postimg.cc/nVdYndN2/minha-divulgacao-png.png" 
              alt="Minha Divulgação" 
              className="h-10 md:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105" 
              referrerPolicy="no-referrer"
            />
            <div className="flex flex-col select-none">
              <span className="font-sans font-extrabold text-sm md:text-base leading-none text-white tracking-tight uppercase group-hover:text-[var(--primary)] transition-colors duration-200">
                {appData.siteInfo.name} <span className="text-[var(--primary)]">{appData.siteInfo.suffix}</span>
              </span>
              <span className="text-[9px] text-white/40 tracking-widest font-mono uppercase mt-0.5">Portal de Mídia</span>
            </div>
          </a>

          {/* Clean Menu - Desktop */}
          <div className="hidden lg:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-white/70">
            <a href="#destaque" onClick={(e) => { e.preventDefault(); scrollToSection('destaque'); }} className="hover:text-[var(--primary)] transition-colors duration-200">Destaques</a>
            {visibleFlyers.length > 0 && (
              <a href="#promocoes" onClick={(e) => { e.preventDefault(); scrollToSection('promocoes'); }} className="hover:text-[var(--primary)] transition-colors duration-200">Promoções</a>
            )}
            <a href="#filtro-empresas" onClick={(e) => { e.preventDefault(); scrollToSection('filtro-empresas'); }} className="hover:text-[var(--primary)] transition-colors duration-200">Anunciantes</a>
            <a href="#radio-tv" onClick={(e) => { e.preventDefault(); scrollToSection('radio-tv'); }} className="hover:text-[var(--primary)] transition-colors duration-200">Rádio & TV</a>
            <a href="#servicos" onClick={(e) => { e.preventDefault(); scrollToSection('servicos'); }} className="hover:text-[var(--primary)] transition-colors duration-200">Serviços</a>
            <a href="#depoimentos" onClick={(e) => { e.preventDefault(); scrollToSection('depoimentos'); }} className="hover:text-[var(--primary)] transition-colors duration-200">Depoimentos</a>
          </div>

          {/* Action Buttons - Desktop */}
          <div className="hidden lg:flex items-center gap-3 font-jakarta">
            <button 
              onClick={() => { setAuthMode('login'); setIsAdPortalOpen(true); }}
              className="bg-neutral-950 hover:bg-neutral-900 border border-white/20 text-white/90 hover:text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
            >
              <User size={13} /> Entrar (Login)
            </button>
            <button 
              onClick={() => { setAuthMode('register'); setIsAdPortalOpen(true); }}
              className="bg-[var(--primary)] hover:brightness-110 text-black px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 shadow shadow-[var(--primary)]/20 cursor-pointer flex items-center gap-1.5"
            >
              🚀 Cadastre-se (Criar Conta)
            </button>
          </div>

          {/* Mobile Menu Trigger */}
          <button 
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden text-white/80 p-2 hover:text-[var(--primary)]"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
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
                <a href="#destaque" onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); scrollToSection('destaque'); }} className="text-white hover:text-[var(--primary)] py-2">⭐ Destaques</a>
                {visibleFlyers.length > 0 && (
                  <a href="#promocoes" onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); scrollToSection('promocoes'); }} className="text-white hover:text-[var(--primary)] py-2">🔥 Promoções</a>
                )}
                <a href="#filtro-empresas" onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); scrollToSection('filtro-empresas'); }} className="text-white hover:text-[var(--primary)] py-2">🔍 Empresas</a>
                <a href="#radio-tv" onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); scrollToSection('radio-tv'); }} className="text-white hover:text-[var(--primary)] py-2">📻 Rádio & TV</a>
                <a href="#servicos" onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); scrollToSection('servicos'); }} className="text-white hover:text-[var(--primary)] py-2">🛠️ Serviços</a>
                <a href="#depoimentos" onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); scrollToSection('depoimentos'); }} className="text-white hover:text-[var(--primary)] py-2">💬 Depoimentos</a>
              </div>
              <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
                <button 
                  onClick={() => { setIsMobileMenuOpen(false); setAuthMode('login'); setIsAdPortalOpen(true); }}
                  className="w-full text-center bg-neutral-950 border border-white/10 text-white px-5 py-3 rounded-xl font-extrabold text-xs uppercase tracking-widest block cursor-pointer"
                >
                  🔑 Entrar (Login)
                </button>
                <button 
                  onClick={() => { setIsMobileMenuOpen(false); setAuthMode('register'); setIsAdPortalOpen(true); }}
                  className="w-full text-center bg-[var(--primary)] text-black px-5 py-3 rounded-xl font-extrabold text-xs uppercase tracking-widest block cursor-pointer"
                >
                  🚀 Cadastre-se (Criar Conta)
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 md:pt-44 pb-24 overflow-hidden bg-black border-b border-white/5 bg-[radial-gradient(120%_120%_at_50%_10%,#030303_40%,rgba(251,191,36,0.09)_100%)]">
        {/* Tech Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] opacity-100 pointer-events-none" />
        
        {/* Subtle Ambient Pulsing Lights */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[var(--primary)]/5 rounded-full blur-[150px] animate-pulse pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[355px] h-[355px] bg-emerald-500/5 rounded-full blur-[130px] animate-pulse pointer-events-none" />
        
        <div className="relative w-full max-w-7xl mx-auto px-4 md:px-6 z-10 flex flex-col items-center text-center">
          
          {/* Live Badge indicator */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2.5 bg-neutral-950/80 border border-[var(--primary)]/30 backdrop-blur-2xl px-5 py-2.5 rounded-full text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase text-[var(--primary)] mb-8 md:mb-10 font-mono shadow-[0_4px_30px_rgba(251,191,36,0.15)] select-none"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--primary)] animate-ping" />
            Portal de Mídia Digital & Divulgação Empresarial • Ativo
          </motion.div>
 
          {/* Premium Headline & Subtitle */}
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-sans font-extrabold text-white tracking-tight leading-[1.05] max-w-6xl select-none">
            Pare de perder vendas para o concorrente. Apareça para <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] via-amber-400 to-yellow-500 font-extrabold">milhares de clientes</span> todos os dias!
          </h1>
 
          <p className="text-sm sm:text-lg md:text-2xl text-white/75 font-medium max-w-4xl mt-8 leading-relaxed select-none">
            Coloque seu negócio na vitrine digital mais acessada do país: com comerciais em vídeo 24h, rádio digital ativa, ofertas exclusivas e botão de vendas diretas pelo WhatsApp.
          </p>
 
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-5 mt-14 w-full sm:w-auto relative z-20">
            <a 
              href="#anuncie" 
              onClick={(e) => { e.preventDefault(); scrollToSection('anuncie'); }}
              className="group bg-[var(--primary)] hover:bg-[#ffe066] text-black hover:scale-105 hover:shadow-[0_0_35px_rgba(251,191,36,0.45)] px-12 py-5.5 rounded-full font-black text-xs sm:text-sm uppercase tracking-[0.15em] text-center transition-all duration-300 shadow-2xl flex items-center justify-center gap-2"
            >
              🚀 QUERO CLIENTES TODOS OS DIAS
            </a>
            <a 
              href={`https://wa.me/${appData.siteInfo.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Olá! Acessei o portal de divulgação e gostaria de receber mais informações sobre como destacar minha empresa de forma profissional.')}`} 
              target="_blank"
              rel="noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white hover:scale-105 hover:shadow-[0_0_35px_rgba(16,185,129,0.35)] px-12 py-5.5 rounded-full font-black text-xs sm:text-sm uppercase tracking-[0.15em] text-center transition-all duration-300 shadow-2xl flex items-center justify-center gap-2"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="inline-block"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              FALAR NO WHATSAPP
            </a>
          </div>
 
          {/* Animated quick stats bar - SEÇÃO DE AUTORIDADE E NÚMEROS */}
          <div className="grid grid-cols-1 min-[340px]:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 md:gap-14 mt-24 md:mt-32 w-full max-w-5xl border-t border-white/5 pt-12 select-none">
            <div className="text-center group-hover:scale-105 transition-transform duration-300">
              <div className="text-3xl md:text-5xl font-sans font-black text-white tracking-tight">{(universalConfig.totalVisits || 12000).toLocaleString()}+</div>
              <div className="text-[11px] sm:text-[12px] text-[var(--primary)] font-bold tracking-widest font-mono uppercase mt-2">Acessos Totais</div>
              <p className="text-[10px] text-white/40 mt-1 max-w-[160px] mx-auto font-sans">Tráfego local constante e verificado diariamente</p>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-5xl font-sans font-black text-emerald-400 flex items-center justify-center gap-2 tracking-tight">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_15px_#10b981]" />
                {onlineCount}
              </div>
              <div className="text-[11px] sm:text-[12px] text-white/75 font-bold tracking-widest font-mono uppercase mt-2">Online Agora</div>
              <p className="text-[10px] text-white/40 mt-1 max-w-[160px] mx-auto font-sans">Espectadores ativos em rádio e TV online</p>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-5xl font-neutral font-black text-amber-500 tracking-tight">100%</div>
              <div className="text-[11px] sm:text-[12px] text-white/75 font-bold tracking-widest font-mono uppercase mt-2">Atendimento IA</div>
              <p className="text-[10px] text-white/40 mt-1 max-w-[160px] mx-auto font-sans">Conversões inteligentes 24h sem interrupção</p>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-5xl font-sans font-black text-white tracking-tight">24h</div>
              <div className="text-[11px] sm:text-[12px] text-[var(--primary)] font-bold tracking-widest font-mono uppercase mt-2">Sinal Ativo</div>
              <p className="text-[10px] text-white/40 mt-1 max-w-[160px] mx-auto font-sans">Mídia transmitindo som e imagem continuamente</p>
            </div>
          </div>

          {/* ÁREA “MOVIMENTO DA PLATAFORMA” - Sensação de Portal extremamente ativo */}
          <div className="w-full max-w-4xl mt-12 bg-gradient-to-r from-neutral-950/90 to-[#0e0f14]/80 border border-white/5 shadow-2xl rounded-2xl p-4.5 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 text-left select-none overflow-hidden relative">
            <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-[var(--primary)] to-amber-500" />
            
            <div className="flex items-center gap-3">
              <span className="bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 text-[10px] font-black tracking-widest px-3 py-1.5 rounded-lg font-mono flex items-center gap-1.5 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-ping" />
                DENTRO DO PORTAL
              </span>
              <div className="font-mono text-white/35 text-[10px] sm:text-xs tracking-wider shrink-0 uppercase font-black">
                Atividades Ao Vivo:
              </div>
            </div>

            <div className="flex-1 w-full overflow-hidden flex items-center text-xs md:text-sm text-neutral-200">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePlatformActivityIndex}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35 }}
                  className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 px-3 w-full"
                >
                  <span className="text-emerald-400 font-bold text-[10px] sm:text-xs font-mono bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded shrink-0 self-start sm:self-auto">
                    {platformActivitiesList[activePlatformActivityIndex].time}
                  </span>
                  <span className="font-semibold text-white/90 truncate leading-relaxed">
                    {platformActivitiesList[activePlatformActivityIndex].text}
                  </span>
                </motion.div>
              </AnimatePresence>
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
            
            {/* 1. SEÇÃO PRINCIPAL: PROMOÇÕES DA SEMANA CARROSSEL */}
            <div className="mb-20">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-4">
                <div>
                  <span className="text-[var(--primary)] text-xs font-black font-mono tracking-[0.2em] uppercase">CURADORIA DIGITAL</span>
                  <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mt-2">
                    🔥 Ofertas Irrecusáveis da Semana
                  </h2>
                </div>
                <p className="text-sm text-white/50 max-w-sm leading-relaxed">
                  Apenas ofertas reais e com descontos exclusivos de marcas verificadas no portal. Toque no card e garanta o seu benefício no WhatsApp antes que esgote!
                </p>
              </div>

              {/* Dynamic Slider Container */}
              <div className="relative overflow-hidden bg-gradient-to-br from-[#11111a] to-[#0a0a10]/50 border border-white/10 rounded-[32px] p-6 md:p-12 shadow-2xl flex flex-col md:flex-row items-center gap-8 md:gap-16">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[var(--primary)] via-amber-500 to-transparent opacity-80" />
                
                {/* Active Flyer Image Frame with device-like card skeleton */}
                <div className="relative w-full md:w-1/2 flex flex-col items-center justify-center">
                  
                  {/* Highlight badge outside and above the image banner */}
                  <span className="mb-5 bg-gradient-to-r from-red-600 to-amber-600 text-white font-black text-[9px] tracking-widest uppercase px-4 py-1.5 rounded-full shadow-lg z-10 whitespace-nowrap animate-pulse select-none">
                    🚨 DESTAQUE COMERCIAL DE HOJE
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
                        alt="Promoção em Destaque" 
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
                    PROMOÇÃO Nº {activeFlyerIndex + 1} de {visibleFlyers.length}
                  </span>
                  <h3 className="text-2xl sm:text-3.5xl font-sans font-black text-white leading-tight">
                    Aproveite esta oportunidade exclusiva
                  </h3>
                  <p className="text-xs sm:text-base text-white/60 mt-4 leading-relaxed max-w-md font-medium">
                    Preço especial e atendimento preferencial garantidos para usuários do portal. Toque abaixo para abrir o canal direto com o anunciante.
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
                      ⭐ Promoções Especiais do Comércio
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
                     🔥 DESTAQUE
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

            {/* 2. SEÇÃO: PARCEIROS OFICIAIS */}
            <div className="mb-20 pt-8 border-t border-white/5">
              <div className="text-center mb-10">
                <span className="text-[var(--primary)] text-[10px] font-black font-mono tracking-[0.2em] uppercase">MARCAS DE CONFIANÇA</span>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-1">🤝 Parceiros Oficiais do Portal</h3>
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

            {/* 3. SEÇÃO: EMPRESAS EM DESTAQUE */}
            <div className="mb-20">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-4">
                <div>
                  <span className="text-[var(--primary)] text-xs font-black font-mono tracking-[0.2em] uppercase">VITRINE DE EXCELÊNCIA</span>
                  <h3 className="text-2xl sm:text-3.5xl font-sans font-extrabold text-white tracking-tight mt-1">
                    ⭐ Empresas em Destaque
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-white/50 max-w-sm">
                  Anunciantes master selecionados por excelente prestação de serviços, avaliação positiva e confiabilidade.
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

                      <h4 className="text-sm font-extrabold text-white mt-4 group-hover:text-[var(--primary)] transition-colors duration-200">{company.name}</h4>
                      <p className="text-[11px] text-white/50 mt-1.5 leading-relaxed min-h-[2.5rem] line-clamp-2">{company.desc || 'Anunciante comercial verificado na plataforma.'}</p>
                    </div>

                    <div className="flex flex-col gap-2 mt-5">
                      {!company.hideMiniSite && (
                        <button 
                          onClick={() => {
                            if (company.website && company.website.trim() !== '') {
                              const targetUrl = company.website.trim().startsWith('http') ? company.website.trim() : `https://${company.website.trim()}`;
                              window.open(targetUrl, '_blank');
                            } else {
                              setActiveMiniSiteCompany(company);
                              const url = new URL(window.location.href);
                              url.searchParams.set('id', company.id || slugify(company.name));
                              window.history.pushState({}, '', url.toString());
                            }
                          }}
                          className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest text-center flex items-center justify-center gap-1.5 transition-all duration-300 shadow-md cursor-pointer"
                        >
                          <ShoppingBag size={12} /> 
                          {company.website && company.website.trim() !== '' ? "Visitar Site Oficial" : 
                           (company.type === 'loja' ? "Abrir Loja Virtual" : 
                            company.type === 'cardapio' ? "Abrir Cardápio" : "Ver Mini-Site")}
                        </button>
                      )}

                      <a 
                        href={`https://wa.me/${company.wa.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Olá, vi seu anúncio em destaque no portal ${appData.siteInfo.name}!`)}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest text-center flex items-center justify-center gap-2 transition-all duration-300 shadow-md"
                      >
                        <Smartphone size={12} /> Falar no WhatsApp
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. SEÇÃO: ÚLTIMOS ANUNCIANTES (CARROSSEL EM MOVIMENTO) */}
            <div>
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-4">
                <div>
                  <span className="text-emerald-400 text-xs font-black font-mono tracking-[0.2em] uppercase">PLATAFORMA EM CONSTANTE CRESCIMENTO</span>
                  <h3 className="text-2xl sm:text-3.5xl font-sans font-extrabold text-white tracking-tight mt-1 flex items-center gap-2">
                    🆕 Últimos Anunciantes Integrados
                  </h3>
                </div>
                <div className="flex items-center gap-4 justify-between md:justify-end w-full md:w-auto">
                  <p className="text-xs sm:text-sm text-white/50 max-w-sm hidden sm:block">
                    Iniciando a sua campanha de mídia inteligente semanal em nosso portal.
                  </p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => scrollLatest('left')} 
                      className="p-2.5 rounded-full bg-white/5 border border-white/5 hover:border-[var(--primary)] text-white hover:text-[var(--primary)] transition-all duration-300 active:scale-95"
                      aria-label="Voltar"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button 
                      onClick={() => scrollLatest('right')} 
                      className="p-2.5 rounded-full bg-white/5 border border-white/5 hover:border-[var(--primary)] text-white hover:text-[var(--primary)] transition-all duration-300 active:scale-95"
                      aria-label="Avançar"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Responsive Carousel Track with Snap Alignment */}
              <div 
                ref={latestAnunciantesRef}
                className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {(displayedCompanies || []).map((company: any) => (
                  <div 
                    key={company.id} 
                    className="flex-shrink-0 w-[280px] sm:w-[315px] snap-start relative bg-gradient-to-b from-[#0f1016]/80 to-[#07070b] border border-white/5 hover:border-[var(--primary)]/20 rounded-3xl p-6 flex flex-col justify-between hover:-translate-y-1.5 transition-all duration-300 shadow-xl select-none group"
                  >
                    <div>
                      {/* Logo Frame */}
                      <div className="w-16 h-16 rounded-full bg-white border border-white/5 overflow-hidden flex items-center justify-center shadow-lg p-0 mb-5 mt-2 group-hover:scale-105 transition-transform duration-300">
                        <img src={company.logo} alt={company.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>

                      <span className="text-[9px] text-white/55 font-bold uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded-full select-none">
                        {company.category}
                      </span>

                      <h4 className="text-sm font-extrabold text-white mt-4 group-hover:text-[var(--primary)] transition-colors duration-200">{company.name}</h4>
                      <p className="text-[11px] text-white/45 mt-1.5 leading-relaxed min-h-[2.5rem] line-clamp-2">{company.desc || 'Parceiro local ativo na rede de anúncios.'}</p>
                    </div>

                    <div className="flex flex-col gap-2 mt-5">
                      {!company.hideMiniSite && (
                        <button 
                          onClick={() => {
                            if (company.website && company.website.trim() !== '') {
                              const targetUrl = company.website.trim().startsWith('http') ? company.website.trim() : `https://${company.website.trim()}`;
                              window.open(targetUrl, '_blank');
                            } else {
                              setActiveMiniSiteCompany(company);
                              const url = new URL(window.location.href);
                              url.searchParams.set('id', company.id || slugify(company.name));
                              window.history.pushState({}, '', url.toString());
                            }
                          }}
                          className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest text-center flex items-center justify-center gap-1.5 transition-all duration-300 shadow-md cursor-pointer"
                        >
                          <ShoppingBag size={12} /> 
                          {company.website && company.website.trim() !== '' ? "Visitar Site Oficial" : 
                           (company.type === 'loja' ? "Abrir Loja" : 
                            company.type === 'cardapio' ? "Abrir Cardápio" : "Ver Mini-Site")}
                        </button>
                      )}

                      <a 
                        href={`https://wa.me/${company.wa.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Olá, vi seu comércio no portal ${appData.siteInfo.name}!`)}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-[var(--primary)] py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest text-center flex items-center justify-center gap-2 transition-all duration-300"
                      >
                        <Smartphone size={12} /> WhatsApp Comercial
                      </a>
                    </div>
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
            <span className="text-[var(--primary)] text-xs font-bold font-mono tracking-widest uppercase">Diretório Comercial</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
              Encontre Empresas Verificadas ou Divulgue a Sua
            </h2>
            <p className="text-sm text-white/50 mt-3">
              Busque abaixo as melhores empresas ativas conectadas via WhatsApp, ou cadastre seu negócio hoje mesmo para começar a receber pedidos diretos de novos clientes em minutos!
            </p>

            {/* Dynamic Keywords Search Box */}
            <div className="relative w-full max-w-lg mt-8">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/40">
                <Search size={18} />
              </div>
              <input 
                type="text" 
                placeholder="Busque por Assai, Ordones, Refrigeração..." 
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
          </div>

          {/* Category Pills Slider */}
          <div className="category-nav-wrapper">
            <button type="button" className="category-nav-btn" onClick={() => scrollCats('left')}>❮</button>
            <div className="category-nav-container" ref={catNavRef}>
              <button 
                type="button"
                className={`category-pill ${selectedCategory === null ? 'active' : ''}`}
                onClick={() => handleCategoryClick(null)}
              >
                ⭐ TODOS OS NEGÓCIOS
              </button>
              {appData.categories.map(cat => (
                <button 
                  key={cat.name} 
                  type="button"
                  className={`category-pill ${selectedCategory === cat.name ? 'active' : ''}`}
                  onClick={() => handleCategoryClick(cat.name)}
                >
                  <span>{cat.icon}</span> {cat.name}
                </button>
              ))}
            </div>
            <button type="button" className="category-nav-btn" onClick={() => scrollCats('right')}>❯</button>
          </div>

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
              {filteredCompanies.map(company => (
                <div 
                  key={company.id} 
                  className={`bg-[#0f1016] border transition-all duration-300 rounded-3xl p-6 flex flex-col justify-between hover:-translate-y-1.5 shadow-xl hover:shadow-2xl relative select-none ${company.featured ? 'border-[var(--primary)] shadow-[var(--primary)]/5 hover:shadow-[rgb(251,191,36)]/10' : 'border-white/5 hover:border-white/20'}`}
                >
                  {company.featured && (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-black text-[8px] tracking-widest uppercase px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 z-10">
                      <Award size={10} /> Destaque
                    </div>
                  )}
                  
                  <div>
                    {/* Logo Frame */}
                    <div className="w-20 h-20 rounded-full bg-white border border-white/15 overflow-hidden flex items-center justify-center shadow-lg p-0 mb-5 mt-2">
                      <img src={company.logo} alt={company.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>

                    <span className="text-[10px] text-[var(--primary)] font-extrabold uppercase tracking-widest bg-[var(--primary)]/10 px-2.5 py-1 rounded-full select-none">
                      {company.category}
                    </span>

                    <h3 className="text-base font-extrabold text-white mt-4 line-clamp-1">{company.name}</h3>
                    <p className="text-xs text-white/50 mt-2 line-clamp-3 leading-relaxed min-h-[3.5rem]">{company.desc || 'Anunciante comercial verificado de alta qualidade e atendimento dedicado.'}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2.5 mt-6 border-t border-white/5 pt-5">
                    {!company.hideMiniSite && (
                      <button 
                        onClick={() => {
                          if (company.website && company.website.trim() !== '') {
                            const targetUrl = company.website.trim().startsWith('http') ? company.website.trim() : `https://${company.website.trim()}`;
                            window.open(targetUrl, '_blank');
                          } else {
                            setActiveMiniSiteCompany(company);
                            const url = new URL(window.location.href);
                            url.searchParams.set('id', company.id || slugify(company.name));
                            window.history.pushState({}, '', url.toString());
                          }
                        }}
                        className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest text-center flex items-center justify-center gap-1.5 transition-all duration-305 shadow-md cursor-pointer"
                      >
                        <ShoppingBag size={14} /> 
                        {company.website && company.website.trim() !== '' ? "Visitar Site Oficial" : 
                         (company.type === 'loja' ? "Abrir Loja Virtual" : 
                          company.type === 'cardapio' ? "Abrir Cardápio" : "Ver Mini-Site / Catálogo")}
                      </button>
                    )}

                    <a 
                      href={`https://wa.me/${company.wa.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Olá, vi seu anúncio no portal ${appData.siteInfo.name}.${sessionStorage.getItem(`ref_${slugify(tenantId || 'fortaleza')}`) ? ` Fui indicado pelo parceiro: ${sessionStorage.getItem(`ref_${slugify(tenantId || 'fortaleza')}`)}` : ''}`)}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest text-center flex items-center justify-center gap-2 transition-all duration-300 shadow-md"
                    >
                      <Smartphone size={14} /> Falar no WhatsApp
                    </a>

                    <div className="flex gap-2">
                      {company.ig && company.ig !== '#' && company.ig !== '' && (
                        <a 
                          href={company.ig} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest text-center transition-all duration-200"
                        >
                          Instagram
                        </a>
                      )}
                      {company.website && company.website !== '' && (
                        <a 
                          href={company.website} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="flex-1 bg-[var(--primary)] hover:brightness-110 text-black py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest text-center transition-all duration-200"
                        >
                          Website
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* Live Radio & TV Streaming Broadcast */}
      <section id="radio-tv" className="relative w-full py-16 md:py-24 bg-[#0a0a10] border-b border-white/5 overflow-hidden">
        
        {/* Background graphics */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-[var(--primary)]/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="relative w-full max-w-7xl mx-auto px-4 md:px-6">
          
          {/* Section Header */}
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
            <span className="text-[var(--primary)] text-xs font-bold font-mono tracking-widest uppercase">Transmissões Digitais</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
              Rádio & TV Online Ao Vivo
            </h2>
            <p className="text-sm text-white/50 mt-3">
              Acompanhe nossa programação musical completa em áudio de alta definição e assista aos melhores spots de anúncios na nossa TV interativa.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* CUSTOM RADIO CONTAINER - Left Column */}
            <div className="lg:col-span-5 bg-black/40 border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col items-center shadow-2xl">
              
              <div className="w-full flex justify-between items-center mb-6">
                <span className="text-[10px] text-white/50 tracking-widest font-mono uppercase bg-white/5 px-2.5 py-1 rounded-full">
                  Sinal Digital HD
                </span>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${radioPlaying ? 'bg-red-500 animate-pulse' : 'bg-white/20'}`} />
                  <span className="text-[10px] text-white/80 font-bold uppercase tracking-widest">RÁDIO AO VIVO</span>
                </div>
              </div>

              {/* Golden Vinyl Disk sleeve */}
              <div className="relative w-44 h-44 my-4 flex items-center justify-center">
                {/* Spinning Golden Vinyl Disk */}
                <div 
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 via-yellow-600 to-amber-400 p-0.5 shadow-2xl"
                  style={{ 
                    animation: 'spin 15s linear infinite',
                    animationPlayState: radioPlaying ? 'running' : 'paused',
                    boxShadow: radioPlaying ? '0 0 30px rgba(251, 191, 36, 0.25)' : 'none'
                  }}
                >
                  <div className="w-full h-full rounded-full bg-neutral-950 flex items-center justify-center border border-white/10 relative">
                    <div className="absolute inset-4 rounded-full border border-white/5" />
                    <div className="absolute inset-8 rounded-full border border-white/5" />
                    <div className="absolute inset-12 rounded-full border border-white/10" />
                    
                    <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 p-1 flex items-center justify-center">
                      <div className="w-full h-full rounded-full bg-black flex items-center justify-center font-black text-[8px] text-[var(--primary)] font-mono">
                        MD FM
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`absolute inset-10 rounded-full bg-[var(--primary)]/25 blur-xl pointer-events-none transition-opacity duration-500 ${radioPlaying ? 'opacity-100' : 'opacity-0'}`} />
              </div>

              <p className="text-xs text-[var(--primary)] font-extrabold tracking-widest uppercase mt-4 mb-1">
                Minha Divulgação Rádio
              </p>
              <span className="text-[10px] text-white/50 tracking-wider font-mono uppercase text-center">
                Ouça nossa programação ao vivo.
              </span>

              {/* Custom controls wrapper */}
              <div className="w-full mt-8 border-t border-white/5 pt-6 flex flex-col items-center">
                
                {/* Play Button */}
                <button 
                  type="button"
                  onClick={handleRadioTogglePlay}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${radioPlaying ? 'bg-red-600 text-white hover:bg-red-500 shadow-red-500/10' : 'bg-[var(--primary)] text-black hover:scale-105 shadow-[rgb(251,191,36)]/10'} shadow-xl`}
                >
                  {radioPlaying ? <Pause size={28} /> : <Play size={28} className="translate-x-0.5" />}
                </button>

                {/* Custom volume controller */}
                <div className="w-full flex items-center gap-3 mt-6 px-4">
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
                    className="flex-1 accent-[var(--primary)] opacity-70 hover:opacity-100 h-1 rounded-full cursor-pointer bg-neutral-800"
                  />
                  <span className="text-[10px] font-mono text-white/40">{Math.round(radioVolume * 100)}%</span>
                </div>

                <audio 
                  ref={radioAudioRef}
                  src={universalConfig.radioLink || appData.siteInfo.radioLink}
                  onPlay={() => setRadioPlaying(true)}
                  onPause={() => setRadioPlaying(false)}
                />

                <div className="flex items-end gap-1 h-6 mt-6 select-none">
                  {[0.1, 0.3, 0.2, 0.5, 0.4, 0.6, 0.3, 0.5, 0.2, 0.1, 0.4].map((delay, i) => (
                    <div 
                      key={i} 
                      className={`w-1 bg-[#fbbf24]/60 rounded-full ${radioPlaying ? 'animate-pulse' : 'h-1'}`}
                      style={{ 
                        animationDuration: radioPlaying ? '0.8s' : undefined,
                        animationDelay: radioPlaying ? `${delay}s` : undefined,
                        height: radioPlaying ? '100%' : '4px'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* TV ONLINE STREAMING Broadcast - Right Column */}
            {showVideos && (
              <div className="lg:col-span-7 flex flex-col items-center">
                
                {/* TV Showcase framing */}
                <div className="w-full max-w-[340px] aspect-[9/16] rounded-[40px] overflow-hidden border-[12px] border-[#1d1d26] bg-black shadow-2xl relative">
                  
                  {/* live indicator badge overlay */}
                  <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase z-20 flex items-center gap-1.5 shadow-lg shadow-black/25 select-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    TV Online Ao Vivo
                  </div>

                  {/* simulated online users count indicator overlay */}
                  <div className="absolute bottom-4 left-4 bg-emerald-950/90 backdrop-blur-md border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase z-10 flex items-center gap-1 leading-none select-none">
                    <Users size={10} /> {visitorCount} online
                  </div>

                  {/* TV playoverlay trigger */}
                  <AnimatePresence>
                    {isMuted && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center z-20 cursor-pointer p-6 text-center select-none" 
                        onClick={() => setIsMuted(false)}
                      >
                        <div className="w-16 h-16 rounded-full bg-[var(--primary)] text-black flex items-center justify-center text-xl shadow-lg mb-4">
                          🔇
                        </div>
                        <span className="text-white font-extrabold text-xs uppercase tracking-wider">Clique para Ativar Som da TV</span>
                        <span className="text-white/40 text-[9px] tracking-widest font-mono uppercase mt-2">Transmissão comercial ativa</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Video Player */}
                  <video 
                    ref={videoRef}
                    autoPlay 
                    playsInline 
                    muted={isMuted}
                    onEnded={handleVideoEnd}
                    onTimeUpdate={handleTimeUpdate}
                    className="w-full h-full object-cover"
                  />

                  {/* Floating Mute Trigger controls */}
                  <button 
                    type="button"
                    className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-black/60 border border-white/10 hover:border-white/30 text-white flex items-center justify-center cursor-pointer z-10 transition-all text-xs" 
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? '🔇' : '🔊'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Professional Services Presentation */}
      <section id="servicos" className="w-full py-20 md:py-28 bg-[#050508] border-b border-white/5 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--primary)]/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 relative z-10">
          
          {/* Section Header */}
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16 md:mb-20 select-none">
            <span className="text-[var(--primary)] text-xs font-black font-mono tracking-[0.2em] uppercase">SOLUÇÕES DE ALTA PERFORMANCE</span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mt-2">
              💼 Nossas Áreas de Divulgação
            </h2>
            <p className="text-sm sm:text-base text-white/50 mt-4 leading-relaxed">
              Formatos de mídia integrada que garantem audiência contínua, visibilidade empresarial e conversão direta para o seu caixa.
            </p>
          </div>

          {/* Grid List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES_DATA.map((service, idx) => {
              const ServiceIcon = service.icon;
              return (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05, duration: 0.4 }}
                  className="bg-gradient-to-b from-[#0f1016] to-[#08080c] border border-white/5 hover:border-[var(--primary)]/30 rounded-3xl p-6 flex flex-col justify-between hover:-translate-y-1.5 transition-all duration-300 shadow-xl select-none group relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-[var(--primary)] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  <div>
                    {/* Icon Wrapper */}
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-[0_4px_15px_rgba(0,0,0,0.4)]`}>
                      <ServiceIcon size={22} className="stroke-[2.5]" />
                    </div>

                    <h4 className="text-base font-black text-white group-hover:text-[var(--primary)] transition-colors duration-200">{service.title}</h4>
                    <p className="text-xs text-white/50 mt-3 leading-relaxed font-semibold">{service.desc}</p>
                  </div>

                  {/* Action query indicator */}
                  <div className="w-full border-t border-white/5 mt-6 pt-4 text-left">
                    <span className="text-[9px] text-[var(--primary)] font-black uppercase tracking-widest inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                      VERIFICAR SINAL ATIVO <ChevronRight size={10} className="stroke-[3]" />
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Section footer info */}
          <div className="mt-20 bg-gradient-to-r from-amber-500/5 to-transparent border border-white/5 rounded-[28px] p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-8 max-w-5xl mx-auto select-none">
            <div className="text-center md:text-left">
              <h4 className="text-xl font-black text-white">Pronto para dominar seu segmento comercial?</h4>
              <p className="text-xs sm:text-sm text-white/60 mt-2 max-w-lg leading-relaxed">Não perca vendas para seu maior concorrente da região. Fale agora mesmo com nossa central comercial no WhatsApp!</p>
            </div>
            <a 
              href={`https://wa.me/${appData.pricing.waLink.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Olá! Acessei a página comercial e gostaria de saber as disponibilidades de vagas para publicidade de meu negócio.')}`}
              target="_blank" 
              rel="noreferrer"
              className="bg-[var(--primary)] hover:bg-[#ffe066] text-black hover:scale-105 hover:shadow-[0_0_20px_rgba(251,191,36,0.3)] px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest text-center transition-all duration-300 flex items-center gap-2"
            >
              <Smartphone size={14} /> Falar com Consultor
            </a>
          </div>

        </div>
      </section>

      {/* Scout Pricing & Scarce Category Vacancy List */}
      <section id="anuncie" className="w-full py-16 md:py-24 bg-[#0a0a10] border-b border-white/5 relative">
        <div className="relative w-full max-w-7xl mx-auto px-4 md:px-6 z-10">
          
          {/* Grid container */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mt-8">
            
            {/* Scarcity Category Status - Left Column */}
            <div className="lg:col-span-7 select-none">
              <span className="text-[var(--primary)] text-xs font-bold font-mono tracking-widest uppercase mb-2 block">Vagas de Segmentos</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Categorias Oficiais e Vagas
              </h2>
              <p className="text-sm text-white/65 mt-3 leading-relaxed max-w-xl">
                {appData.sections.segments.highlight} Garantimos exclusividade categórica em algumas categorias para parceiros masters, confira o andamento:
              </p>

              {/* Table display segments */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                {appData.segmentsList.map(seg => (
                  <div 
                    key={seg.name} 
                    className="bg-[#0f1016]/40 border border-white/5 rounded-2xl p-4 flex justify-between items-center hover:bg-black/50 transition-all duration-200"
                  >
                    <div>
                      <h4 className="text-sm font-extrabold text-white">{seg.name}</h4>
                      <p className="text-[10px] text-white/45 mt-1 uppercase font-mono font-bold">{seg.status === "Ocupado" ? "Sponsor Exclusivo" : "Categoria Livre"}</p>
                    </div>
                    <span className={`text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full ${seg.status === "Ocupado" ? 'bg-amber-950/80 text-amber-500 border border-amber-500/20' : 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/20'}`}>
                      {seg.status}
                    </span>
                  </div>
                ))}
              </div>

              <div 
                onClick={() => setIsCheckoutOpen(true)}
                className="mt-8 bg-black/40 hover:bg-black/60 border border-white/5 hover:border-[var(--primary)]/30 rounded-2xl p-4.5 cursor-pointer transition-all duration-300"
              >
                <span className="text-xs text-[var(--primary)] font-black uppercase tracking-widest font-mono">
                  ⚡ {appData.sections.segments.callToAction || 'Anuncie para dominar seu segmento comercial!'}
                </span>
              </div>
            </div>

            {/* Highlight Pricing Card - Right Column */}
            <div className="lg:col-span-5">
              <div className="relative bg-gradient-to-b from-[#11111a] to-[#04050a] border-2 border-[var(--primary)] rounded-3xl p-8 md:p-10 shadow-2xl relative mt-4 lg:mt-0">
                
                {/* badge */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--primary)] text-black px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg shadow-black/25 select-none font-sans">
                  {appData.pricing.badge || 'Plano de Alta Conversão'}
                </div>

                <span className="text-[9px] text-white/50 tracking-widest font-mono uppercase text-center block mb-3 select-none">
                  Pacote de Mídia Integrada
                </span>
                <h3 className="text-xl md:text-2xl font-black text-white text-center select-none">{appData.pricing.title}</h3>
                
                {/* Price tag */}
                <div className="flex items-baseline justify-center gap-1 text-[#fbbf24] mt-6 select-none font-sans">
                  <span className="text-2xl font-bold font-mono">R$</span>
                  <span className="text-5xl md:text-6xl font-black tracking-tight">{appData.pricing.price}</span>
                  <span className="text-xs font-bold text-white/50 uppercase ml-1">/ {appData.pricing.period}</span>
                </div>

                {/* Feature List */}
                <ul className="flex flex-col gap-3.5 mt-8 border-t border-white/5 pt-8 select-none">
                  {appData.pricing.features.map((feat: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-xs font-semibold text-white/70">
                      <span className="text-emerald-400 mt-0.5"><Check size={14} /></span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA action */}
                <button 
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full block text-center bg-[var(--primary)] hover:brightness-110 text-black py-4 rounded-2xl font-extrabold text-xs uppercase tracking-widest shadow-xl shadow-[rgb(251,191,36)]/10 mt-8 transition-all duration-300 cursor-pointer"
                >
                  {appData.pricing.cta}
                </button>

                {/* Moneyback indicator secure */}
                <div className="flex items-center justify-center gap-2 mt-5 text-[10px] text-white/40 tracking-wider font-semibold select-none">
                  <span>🚀 Liberação e ativação no mesmo dia</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Outcomes and Reviews */}
      <section id="depoimentos" className="w-full py-20 md:py-28 bg-[#050508] border-b border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-gradient from-emerald-500/5 via-transparent to-transparent opacity-40 pointer-events-none" />
        <div className="relative w-full max-w-7xl mx-auto px-4 md:px-6">
          
          {/* Section Header */}
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16 select-none">
            <span className="text-[var(--primary)] text-xs font-black font-mono tracking-[0.2em] uppercase">MÍDIA E AUTORIDADE</span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mt-2">
              📊 Resultados de Alto Impacto
            </h2>
            <p className="text-sm text-white/50 mt-3 leading-relaxed max-w-xl">
              Nossos indicadores comprovam o crescimento e a conversão de novos clientes que as marcas parceiras obtêm todos os dias.
            </p>
          </div>

          {/* Premium Animated Credibility Metrics Grid */}
          <div className="grid grid-cols-1 min-[340px]:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-16 select-none">
            <div className="bg-[#0f1016]/60 border border-white/5 hover:border-[var(--primary)]/20 rounded-3xl p-6 flex flex-col justify-between hover:bg-black/40 transition-all duration-300">
              <span className="text-3xl sm:text-4xl font-mono font-black text-[var(--primary)]">98.2%</span>
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-white mt-4">Satisfação Comercial</h4>
                <p className="text-[10px] sm:text-xs text-white/40 mt-1 leading-normal font-semibold">Empresas que divulgam e renovam seus anúncios mensais.</p>
              </div>
            </div>
            <div className="bg-[#0f1016]/60 border border-white/5 hover:border-emerald-500/20 rounded-3xl p-6 flex flex-col justify-between hover:bg-black/40 transition-all duration-300">
              <span className="text-3xl sm:text-4xl font-mono font-black text-emerald-400">+45 Mil</span>
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-white mt-4">Leads de WhatsApp</h4>
                <p className="text-[10px] sm:text-xs text-white/40 mt-1 leading-normal font-semibold">Contatos comerciais diretos disparados para os anunciantes.</p>
              </div>
            </div>
            <div className="bg-[#0f1016]/60 border border-white/5 hover:border-blue-500/20 rounded-3xl p-6 flex flex-col justify-between hover:bg-black/40 transition-all duration-300">
              <span className="text-3xl sm:text-4xl font-mono font-black text-blue-400">+100</span>
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-white mt-4">Parceiros Ativos</h4>
                <p className="text-[10px] sm:text-xs text-white/40 mt-1 leading-normal font-semibold">Marcas locais anunciando estrategicamente em rádio e TV.</p>
              </div>
            </div>
            <div className="bg-[#0f1016]/60 border border-white/5 hover:border-purple-500/20 rounded-3xl p-6 flex flex-col justify-between hover:bg-black/40 transition-all duration-300">
              <span className="text-3xl sm:text-4xl font-mono font-black text-purple-400">24h/Dia</span>
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-white mt-4">Sinal Sem Quedas</h4>
                <p className="text-[10px] sm:text-xs text-white/40 mt-1 leading-normal font-semibold">Exposição contínua e sem quedas em nossa central multimídia.</p>
              </div>
            </div>
          </div>

          <div className="text-center mb-14 select-none">
            <span className="text-[var(--primary)] text-xs font-black font-mono tracking-[0.2em] uppercase">PROVA SOCIAL E CREDIBILIDADE</span>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">💬 O que nossos clientes dizem</h3>
            <p className="text-xs sm:text-sm text-white/50 mt-3 max-w-lg mx-auto">Relatos reais de empresários locais que expandiram sua visibilidade e multiplicaram suas vendas anunciando conosco.</p>
          </div>
 
          {/* Written reviews carousel track / grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 select-none">
            {appData.testimonials.map((t, idx) => (
              <div 
                key={idx}
                className="bg-gradient-to-b from-[#0f1016] to-[#08080c] border border-white/5 hover:border-[var(--primary)]/20 rounded-[28px] p-7 flex flex-col justify-between hover:-translate-y-1.5 hover:shadow-[0_12px_30px_rgba(251,191,36,0.03)] transition-all duration-300"
              >
                <div>
                  {/* Stars indicator rating */}
                  <div className="flex gap-1 text-amber-400 mb-5">
                    {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                  </div>
                  <p className="text-xs sm:text-sm text-white/75 italic leading-relaxed font-semibold">"{t.content}"</p>
                </div>
 
                {/* Author details card */}
                <div className="flex items-center gap-3.5 mt-8 border-t border-white/5 pt-6">
                  <div className="relative">
                    <img src={t.avatar} alt={t.author} className="w-12 h-12 rounded-full object-cover border-2 border-white/10 shadow-md" referrerPolicy="no-referrer" />
                    <span className="absolute -bottom-1 -right-1 bg-emerald-500 border-2 border-black w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] text-white">✓</span>
                  </div>
                  <div>
                    <h5 className="text-xs sm:text-sm font-extrabold text-white">{t.author}</h5>
                    <p className="text-[10px] text-[var(--primary)] tracking-wider uppercase font-extrabold mt-0.5">{t.role || 'Parceiro Oficial'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* WhatsApp Screenshots gallery */}
          {visibleWhatsappTestimonials && visibleWhatsappTestimonials.length > 0 && (
            <div className="mt-14 pt-12 border-t border-white/5 select-none">
              <div className="flex items-center gap-2 mb-8 justify-center sm:justify-start">
                <span className="w-2.5 h-2.5 rounded-full bg-[#25D366] animate-pulse" />
                <h4 className="text-xs font-black text-[#25D366] tracking-widest uppercase font-mono text-center sm:text-left">
                  Comprovações do WhatsApp (Clique para ampliar)
                </h4>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-white/10">
                {visibleWhatsappTestimonials.map((wt: any, idx: number) => {
                  const imgUrl = typeof wt === 'string' ? wt : wt?.image;
                  if (!imgUrl) return null;
                  return (
                    <div 
                      key={idx} 
                      className="flex-shrink-0 cursor-zoom-in group" 
                      onClick={() => setSelectedTestimonialImage(imgUrl)}
                    >
                      <img 
                        src={imgUrl} 
                        alt="Depoimento WhatsApp" 
                        className="h-56 sm:h-64 rounded-2xl border border-white/10 group-hover:border-[#25D366]/40 transition-all duration-300 shadow-xl object-contain bg-[#111116] p-1.5"
                        referrerPolicy="no-referrer" 
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Testimonial Zoom lightbox overlay */}
          {selectedTestimonialImage && (
            <div 
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(0, 0, 0, 0.95)',
                zIndex: 100000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'zoom-out'
              }}
              onClick={() => setSelectedTestimonialImage(null)}
            >
              <button 
                type="button"
                className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 text-white font-bold w-12 h-12 rounded-full flex items-center justify-center border-none cursor-pointer text-lg z-50 animate-pulse"
                onClick={() => setSelectedTestimonialImage(null)}
              >
                ✕
              </button>
              <img 
                src={selectedTestimonialImage} 
                alt="Depoimento WhatsApp Ampliado" 
                className="max-w-[90%] max-h-[80%] rounded-2xl border border-white/15 shadow-2xl object-contain bg-black"
                onClick={(e) => e.stopPropagation()}
                referrerPolicy="no-referrer"
              />
            </div>
          )}

        </div>
      </section>

      {/* Footer Section design */}
      <footer className="bg-black border-t border-white/5 pt-16 pb-24 text-white select-none">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            
            {/* About column */}
            <div className="md:col-span-6 flex flex-col gap-4">
              <img 
                src="https://i.postimg.cc/nVdYndYd" 
                alt="Minha Divulgação" 
                className="h-10 md:h-12 w-auto object-contain self-start" 
                referrerPolicy="no-referrer"
                onError={(e) => { e.currentTarget.src = "https://i.postimg.cc/nVdYndN2/minha-divulgacao-png.png" }}
              />
              <p className="text-xs text-white/50 max-w-sm leading-relaxed mt-2">
                {appData.siteInfo.description || 'O melhor canal de divulgação comercial e entretenimento da região.'}
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
              <p className="font-semibold">{appData.siteInfo.phone}</p>
              <p className="leading-relaxed leading-5 mt-1">{appData.siteInfo.address}</p>
            </div>

            {/* Legal info column */}
            <div className="md:col-span-3 flex flex-col gap-3 text-xs text-white/70">
              <h4 className="text-sm font-extrabold text-white uppercase tracking-wider mb-2">Informações</h4>
              <p className="font-semibold">CNPJ: {appData.siteInfo.cnpj}</p>
              <p className="leading-relaxed leading-5 mt-1">Desenvolvido por Bossa Infor. Todos os direitos reservados.</p>
            </div>

          </div>

          <div className="w-full border-t border-white/5 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/40">
            <span>&copy; {new Date().getFullYear()} {appData.siteInfo.name} - Todos os direitos reservados.</span>
            <span>Estúdio Comercial Integrado</span>
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
                <h2 className="dev-title">ÁREA DO GESTOR</h2>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button 
                    className="dev-btn" 
                    style={{ background: '#333', color: '#fff', fontSize: '11px', padding: '8px 12px' }} 
                    onClick={logout}
                  >
                    Sair / Logout
                  </button>
                  <button className="dev-close" onClick={() => setIsDevAreaOpen(false)}>✕</button>
                </div>
              </div>

              <div className="dev-tabs">
                {['geral', 'seções', 'categorias', 'empresas', 'anunciantes', (user?.isAdmin || user?.email === 'bossinhaa80@gmail.com') ? 'vídeos' : null, 'flyers', 'banners-horizontais', 'depoimentos-whats', 'preços', 'segmentos', 'chat', (hasAffiliateSystem || user?.isAdmin || user?.email === 'bossinhaa80@gmail.com') ? 'divulgadores' : null].filter(Boolean).map(tab => (
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
                    <h3>Informações Gerais e Tema</h3>
                    <div className="dev-grid-2">
                      <div className="dev-form-group">
                        <label>Cor Primária</label>
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
                        <label>Sufixo (ex: Divulgação)</label>
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
                      <label>Seu Link para Divulgação</label>
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
                            alert("Link copiado com sucesso! Agora você pode enviar para seus clientes.");
                          }}
                        >
                          COPIAR LINK
                        </button>
                      </div>
                    </div>

                    <div className="dev-form-group">
                      <label>Descrição</label>
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
                    <div className="dev-form-group">
                      <label>Link da Rádio (Universal - Apenas Visualização)</label>
                      <input type="text" className="dev-input" value={universalConfig.radioLink} readOnly style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                      <p style={{ fontSize: '10px', color: 'var(--primary)' }}>A rádio é universal e controlada pelo administrador master.</p>
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

                    <h4 style={{ marginTop: '30px', marginBottom: '15px' }}>Informações de Contato e Legal</h4>
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
                       <label>Endereço Completo</label>
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

                {activeTab === 'seções' && (
                  <div className="dev-forms-container">
                    <h3>Títulos e Textos das Seções</h3>
                    
                    <div className="dev-item-card">
                      <h4 style={{ color: 'var(--primary)', marginBottom: '10px' }}>Categorias</h4>
                      <div className="dev-form-group">
                        <label>Título Principal</label>
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
                        <label>Subtítulo</label>
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
                          <label>Título</label>
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
                          <label>Título</label>
                          <input type="text" className="dev-input" value={appData.sections.companies.title} onChange={(e) => updateData('sections', { ...appData.sections, companies: { ...appData.sections.companies, title: e.target.value } })} />
                        </div>
                      </div>
                      <div className="dev-form-group">
                        <label>Subtítulo</label>
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
                          <label>Título</label>
                          <input type="text" className="dev-input" value={appData.sections.howTo.title} onChange={(e) => updateData('sections', { ...appData.sections, howTo: { ...appData.sections.howTo, title: e.target.value } })} />
                        </div>
                      </div>
                    </div>

                    <div className="dev-item-card">
                      <h4 style={{ color: 'var(--primary)', marginBottom: '10px' }}>Benefícios</h4>
                      <div className="dev-grid-2">
                        <div className="dev-form-group">
                          <label>Selinho (Tag)</label>
                          <input type="text" className="dev-input" value={appData.sections.benefits.tag} onChange={(e) => updateData('sections', { ...appData.sections, benefits: { ...appData.sections.benefits, tag: e.target.value } })} />
                        </div>
                        <div className="dev-form-group">
                          <label>Título</label>
                          <input type="text" className="dev-input" value={appData.sections.benefits.title} onChange={(e) => updateData('sections', { ...appData.sections, benefits: { ...appData.sections.benefits, title: e.target.value } })} />
                        </div>
                      </div>
                    </div>

                    <div className="dev-item-card">
                      <h4 style={{ color: 'var(--primary)', marginBottom: '10px' }}>Segmentos (Urgência)</h4>
                      <div className="dev-grid-2">
                        <div className="dev-form-group">
                          <label>Selinho (Tag)</label>
                          <input type="text" className="dev-input" value={appData.sections.segments.tag} onChange={(e) => updateData('sections', { ...appData.sections, segments: { ...appData.sections.segments, tag: e.target.value } })} />
                        </div>
                        <div className="dev-form-group">
                          <label>Título</label>
                          <input type="text" className="dev-input" value={appData.sections.segments.title} onChange={(e) => updateData('sections', { ...appData.sections, segments: { ...appData.sections.segments, title: e.target.value } })} />
                        </div>
                      </div>
                      <div className="dev-form-group">
                        <label>Frase de Destaque</label>
                        <input type="text" className="dev-input" value={appData.sections.segments.highlight} onChange={(e) => updateData('sections', { ...appData.sections, segments: { ...appData.sections.segments, highlight: e.target.value } })} />
                      </div>
                      <div className="dev-form-group">
                        <label>Chamada para Ação</label>
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
                        const newCat = { name: "Nova Categoria", icon: "📁" };
                        setAppData(prev => {
                          if (!prev) return prev;
                          return { ...prev, categories: [...prev.categories, newCat] };
                        });
                      }}>+ Novo Nicho</button>
                    </div>
                    <div className="dev-items-grid">
                      {appData.categories.map((cat, idx) => (
                        <div key={idx} className="dev-item-card">
                          <button className="dev-remove-btn" onClick={() => {
                            setAppData(prev => {
                              if (!prev) return prev;
                              return { ...prev, categories: prev.categories.filter((_, i) => i !== idx) };
                            });
                          }}>✕</button>
                          <div className="dev-grid-2">
                            <div className="dev-form-group">
                              <div className="dev-label-row">
                                <label>Ícone (Emoji)</label>
                                <a href="https://getemoji.com/#activities" target="_blank" rel="noreferrer" className="dev-helper-link">
                                  🔎 Ver Lista de Emojis
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
                            {c.logo ? <img src={c.logo} style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }} alt="" referrerPolicy="no-referrer" /> : '🏢'}
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
                              title={c.active !== false ? "Anúncio Ativo (Clique para Ocultar)" : "Anúncio Oculto (Clique para Ativar)"}
                            >
                              {c.active !== false ? '👁️ ATIVO' : '🙈 OCULTO'}
                            </button>
                            <button className="dev-remove-btn" style={{ position: 'static', padding: '5px' }} onClick={(e) => { e.stopPropagation(); updateData('companies', appData.companies.filter((_, i) => i !== idx)); }}>✕</button>
                            <span>{openCompanyIndex === idx ? '▲' : '▼'}</span>
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
                                    <select className="dev-input" value={c.category} onChange={(e) => {
                                      const val = e.target.value;
                                      setAppData(prev => {
                                        if (!prev) return prev;
                                        const newList = [...prev.companies];
                                        newList[idx] = { ...newList[idx], category: val };
                                        return { ...prev, companies: newList };
                                      });
                                    }}>
                                      <option value="">Selecione uma categoria</option>
                                      {appData.categories.map(cat => (
                                        <option key={cat.name} value={cat.name}>{cat.name}</option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                                <div className="dev-form-group">
                                  <label>Descrição da Empresa</label>
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
                                    <a href="https://postimages.org/" target="_blank" rel="noreferrer" className="dev-helper-link">
                                      📸 Abrir PostImages
                                    </a>
                                  </div>
                                  <input type="text" className="dev-input" value={c.logo} onChange={(e) => {
                                    const newList = [...appData.companies];
                                    newList[idx].logo = e.target.value;
                                    updateData('companies', newList);
                                  }} placeholder="Cole o link direto .jpg ou .png aqui" />
                                  {c.logo && <img src={c.logo} className="dev-img-preview" alt="Preview da Logo" referrerPolicy="no-referrer" />}
                                </div>
                                <div className="dev-grid-2">
                                  <div className="dev-form-group">
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
                                  <div className="dev-form-group">
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
                                    <small style={{ color: '#888', fontSize: '0.7rem' }}>Apenas números (DDD + número)</small>
                                  </div>
                                  <div className="dev-form-group">
                                    <label>Destaque?</label>
                                    <select className="dev-input" value={c.featured ? 'sim' : 'nao'} onChange={(e) => {
                                      const newList = [...appData.companies];
                                      newList[idx].featured = e.target.value === 'sim';
                                      updateData('companies', newList);
                                    }}>
                                      <option value="sim">Sim</option>
                                      <option value="nao">Não</option>
                                    </select>
                                  </div>
                                </div>

                                <div className="dev-grid-2" style={{ marginTop: '15px' }}>
                                  <div className="dev-form-group">
                                    <label>Exibir Botão de Site / Mini-Site / Catálogo?</label>
                                    <select className="dev-input" value={c.hideMiniSite ? 'sim' : 'nao'} onChange={(e) => {
                                      const newList = [...appData.companies];
                                      newList[idx].hideMiniSite = e.target.value === 'sim';
                                      updateData('companies', newList);
                                    }}>
                                      <option value="nao">Exibir Botão (Se tiver site ou catálogo) 👁️</option>
                                      <option value="sim">Ocultar Botão (Apenas Botão de WhatsApp) 🙈</option>
                                    </select>
                                    <small style={{ color: '#aaa', fontSize: '0.7rem' }}>Se escolher ocultar, os botões "Ver Mini-site" ou "Visitar Site" sumirão no card, mantendo foco puro no WhatsApp.</small>
                                  </div>
                                  <div className="dev-form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'rgba(251, 191, 36, 0.05)', border: '1px dashed rgba(251, 191, 36, 0.15)', borderRadius: '12px', padding: '12px', marginTop: '12px' }}>
                                    <span style={{ fontSize: '11px', color: '#fbbf24', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                                      💡 Conversão Máxima
                                    </span>
                                    <p style={{ color: '#aaa', fontSize: '10.5px', lineHeight: '1.4', margin: 0 }}>
                                      Dica: Ocultando o mini-site, toda a atenção do visitante do portal será voltada para mandar mensagem direta e fechar negócio no WhatsApp!
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
                      updateData('companies', [...appData.companies, { id: Date.now(), name: "Nova Empresa", category: "Geral", desc: "Descrição aqui", logo: "", wa: "", ig: "", website: "", featured: false }]);
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
                        🔄 Atualizar Lista
                      </button>
                    </div>
                    <p style={{ color: '#aaa', fontSize: '12px', marginBottom: '20px' }}>
                      Aqui você controla quais anunciantes criaram conta no portal e ativa o <strong>Destaque</strong> ou <strong>Plano VIP</strong> (que concede produtos ilimitados) para eles.
                    </p>
                    
                    {isAdLoading ? (
                      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--primary)' }}>Carregando anunciantes...</div>
                    ) : advertiserCompanies.length === 0 ? (
                      <div className="text-center py-8" style={{ border: '1px dashed rgba(255,255,255,0.15)', borderRadius: '15px', color: '#999', padding: '30px' }}>
                        Nenhum anunciante cadastrado por conta própria nesta cidade ainda.
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
                                    <h4 style={{ margin: 0, fontWeight: 900, fontSize: '14px', color: '#fff' }}>{ad.name}</h4>
                                    <small style={{ color: '#aaa', fontSize: '11px', display: 'block', marginTop: '2px' }}>
                                      Email: <span style={{ color: '#fff' }}>{ad.email}</span> | Celular / WhatsApp: <span style={{ color: '#fff' }}>{ad.wa}</span>
                                    </small>
                                    <span style={{ color: 'var(--primary)', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', background: 'rgba(251,191,36,0.1)', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '4px' }}>
                                      {ad.category} | {ad.type || 'Geral'}
                                    </span>
                                  </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button 
                                    className="dev-btn"
                                    style={{ background: '#ff4444', border: 'none', color: '#fff', fontSize: '11px', padding: '6px 12px', cursor: 'pointer' }}
                                    onClick={async () => {
                                      if (confirm(`Tem certeza que deseja EXCLUIR o anunciante "${ad.name}" permanentemente? This will clear all their items too.`)) {
                                        setIsAdLoading(true);
                                        try {
                                          await deleteDoc(doc(db, 'advertisers', ad.id));
                                          await fetchAdvertisers(tenantId || 'fortaleza');
                                          alert("Anunciante excluído com sucesso!");
                                        } catch(e) {
                                          console.error("Erro deletando anunciante:", e);
                                          alert("Erro ao excluir.");
                                        } finally {
                                          setIsAdLoading(false);
                                        }
                                      }
                                    }}
                                  >
                                    🗑️ Excluir Conta
                                  </button>
                                </div>
                              </div>
                              
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed rgba(255, 255, 255, 0.05)' }}>
                                <div className="dev-form-group" style={{ margin: 0 }}>
                                  <label style={{ fontSize: '11px', color: '#bbb', display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Status do Plano:</label>
                                  <select 
                                    className="dev-input" 
                                    style={{ padding: '8px', fontSize: '12px', background: '#12131a', border: '1px solid rgba(255,255,255,0.1)' }}
                                    value={ad.hasPlan ? 'sim' : 'nao'} 
                                    onChange={async (e) => {
                                      const hasPlanVal = e.target.value === 'sim';
                                      setIsAdLoading(true);
                                      try {
                                        const docRef = doc(db, 'advertisers', ad.id);
                                        await setDoc(docRef, {
                                          email: ad.email,
                                          password: ad.password || '123456',
                                          tenantId: slugify(tenantId || 'fortaleza'),
                                          company: {
                                            ...ad,
                                            hasPlan: hasPlanVal,
                                            featured: ad.featured || hasPlanVal
                                          }
                                        });
                                        await fetchAdvertisers(tenantId || 'fortaleza');
                                        alert(`Plano do anunciante "${ad.name}" atualizado com sucesso!`);
                                      } catch(ee) {
                                        console.error(ee);
                                        alert("Falha ao salvar status.");
                                      } finally {
                                        setIsAdLoading(false);
                                      }
                                    }}
                                  >
                                    <option value="nao">Plano Grátis (Máx 6 produtos, sem destaque automático) 🛑</option>
                                    <option value="sim">Plano Adquirido / VIP (Produtos Ilimitados) ✅</option>
                                  </select>
                                </div>
                                
                                <div className="dev-form-group" style={{ margin: 0 }}>
                                  <label style={{ fontSize: '11px', color: '#bbb', display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Destaque Especial no Topo:</label>
                                  <select 
                                    className="dev-input" 
                                    style={{ padding: '8px', fontSize: '12px', background: '#12131a', border: '1px solid rgba(255,255,255,0.1)' }}
                                    value={ad.featured ? 'sim' : 'nao'} 
                                    onChange={async (e) => {
                                      const featuredVal = e.target.value === 'sim';
                                      setIsAdLoading(true);
                                      try {
                                        const docRef = doc(db, 'advertisers', ad.id);
                                        await setDoc(docRef, {
                                          email: ad.email,
                                          password: ad.password || '123456',
                                          tenantId: slugify(tenantId || 'fortaleza'),
                                          company: {
                                            ...ad,
                                            featured: featuredVal
                                          }
                                        });
                                        await fetchAdvertisers(tenantId || 'fortaleza');
                                        alert(`Destaque do anunciante "${ad.name}" atualizado com sucesso!`);
                                      } catch(ee) {
                                        console.error(ee);
                                        alert("Falha ao salvar destaque.");
                                      } finally {
                                        setIsAdLoading(false);
                                      }
                                    }}
                                  >
                                    <option value="nao">Sem Destaque (Lista normal) 👎</option>
                                    <option value="sim">Com Destaque (Destaque VIP do portal) ⭐</option>
                                  </select>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: '5px' }}>
                                  <span style={{ fontSize: '12px', color: '#fff' }}>
                                    Produtos: <strong style={{ color: ad.hasPlan ? 'var(--primary)' : '#25D366' }}>{itemsCount}</strong> {(!ad.hasPlan && itemsCount >= 6) ? '⚠️' : '✅'}
                                  </span>
                                  <small style={{ color: (!ad.hasPlan && itemsCount >= 6) ? '#ff4444' : '#888', fontSize: '10.5px', marginTop: '2px' }}>
                                    {(!ad.hasPlan && itemsCount >= 6) ? 'Status: Esgotado de fotos (limite 6)' : ad.hasPlan ? 'Liberado ilimitado (Premium)' : 'Grátis (limite 6)'}
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

                {activeTab === 'vídeos' && (
                  <div className="dev-forms-container">
                    <div style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.2)', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
                      <h4 style={{ color: '#fbbf24', margin: 0, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        ⚠️ ÁREA EXCLUSIVA DO ADMINISTRADOR
                      </h4>
                      <p style={{ margin: '5px 0 0 0', fontSize: '11px', color: '#aaa' }}>
                        Esta aba e os links abaixo são visíveis apenas para você. O cliente não tem acesso a esta configuração no painel dele.
                      </p>
                    </div>
                    <h3>Vídeos da TV (Links MP4)</h3>
                    {appData.videos.map((vRaw, idx) => {
                      const v = typeof vRaw === 'string' ? { url: vRaw, active: true } : vRaw;
                      return (
                        <div key={idx} className="dev-item-card" style={{ opacity: v.active !== false ? 1 : 0.6 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                              <span style={{ fontSize: '10px', fontWeight: 900, color: '#fbbf24' }}>VÍDEO #{idx + 1}</span>
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
                                {v.active !== false ? '👁️ ATIVO' : '🙈 OCULTO'}
                              </button>
                            </div>
                            <button className="dev-remove-btn" style={{ position: 'static' }} onClick={() => updateData('videos', appData.videos.filter((_, i) => i !== idx))}>✕</button>
                          </div>
                          <div className="dev-form-group">
                            <div className="dev-label-row">
                              <label>Link do Vídeo MP4</label>
                              <a href="https://archive.org/" target="_blank" rel="noreferrer" className="dev-helper-link">
                                🎥 Abrir Archive.org
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
                                  Ao desativar, o vídeo é mantido no banco mas não aparece na TV do site.
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
                    <button className="dev-add-btn" onClick={() => updateData('videos', [...appData.videos, ""])}>+ Adicionar Vídeo</button>
                  </div>
                )}

                {activeTab === 'flyers' && (
                  <div className="dev-forms-container">
                    <h3>Flyers de Promoção (Imagens e Links)</h3>
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
                              {flyerObj.active !== false ? '👁️ ATIVO' : '🙈 OCULTO'}
                            </button>
                            <button className="dev-remove-btn" style={{ position: 'static' }} onClick={() => updateData('flyers', appData.flyers.filter((_, i) => i !== idx))}>✕</button>
                          </div>
                          <div className="dev-grid-2">
                            <div className="dev-form-group">
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                                <label style={{ marginBottom: '0' }}>Link da Imagem Flyer</label>
                                <a 
                                  href="https://postimages.org/" 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="dev-btn dev-btn-secondary"
                                  style={{ padding: '4px 10px', fontSize: '0.65rem', textDecoration: 'none', height: 'auto', display: 'flex', alignItems: 'center', gap: '5px' }}
                                >
                                  🖼️ Enviar Foto no PostImage
                                </a>
                              </div>
                              <input type="text" className="dev-input" value={flyerObj.image || ''} onChange={(e) => {
                                const newList = [...appData.flyers];
                                if (typeof newList[idx] === 'string') {
                                  newList[idx] = { image: e.target.value, link: '' };
                                } else {
                                  newList[idx] = { ...newList[idx], image: e.target.value };
                                }
                                updateData('flyers', newList);
                              }} placeholder="Link .jpg ou .png" />
                              <small style={{ color: '#888', fontSize: '0.65rem' }}>Dica: No PostImage, use o "Link Direto"</small>
                            </div>
                            <div className="dev-form-group">
                              <label>Link de Ação (WhatsApp/IG/Site)</label>
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
                              <small style={{ color: '#888', fontSize: '0.7rem' }}>Cole o link ou apenas o número (DDD + número)</small>
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
                      Gerencie os banners horizontais (aspecto largo de outdoor, como os do Canva/Salão Stephanny Jessie) exibidos abaixo das Promoções da Semana.
                    </p>

                    {((appData as any).horizontalBanners || []).map((fb: any, idx: number) => {
                      const bannerObj = typeof fb === 'string' ? { image: fb, link: '', title: 'Banner sem título', active: true } : fb;
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
                              {bannerObj.active !== false ? '👁️ ATIVO' : '🙈 OCULTO'}
                            </button>
                            <button type="button" className="dev-remove-btn" style={{ position: 'static' }} onClick={() => updateData('horizontalBanners', ((appData as any).horizontalBanners || []).filter((_: any, i: number) => i !== idx))}>✕</button>
                          </div>
                          
                          <div className="dev-form-group" style={{ marginBottom: '15px' }}>
                            <label>Título ou Descrição Curta (Aparece no Banner)</label>
                            <input 
                              type="text" 
                              className="dev-input" 
                              value={bannerObj.title || ''} 
                              onChange={(e) => {
                                const newList = [...((appData as any).horizontalBanners || [])];
                                newList[idx] = { ...bannerObj, title: e.target.value };
                                updateData('horizontalBanners', newList);
                              }} 
                              placeholder="Ex: Salão Stephanny Jessie - Promoção que realça sua beleza!" 
                            />
                          </div>

                          <div className="dev-grid-2">
                            <div className="dev-form-group">
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                                <label style={{ marginBottom: '0' }}>Link da Imagem Horizontal</label>
                                <a 
                                  href="https://postimages.org/" 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="dev-btn dev-btn-secondary"
                                  style={{ padding: '4px 10px', fontSize: '0.65rem', textDecoration: 'none', height: 'auto', display: 'flex', alignItems: 'center', gap: '5px' }}
                                >
                                  🖼️ Enviar Foto no PostImage
                                </a>
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
                                placeholder="Link .jpg ou .png" 
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
                              <small style={{ color: '#888', fontSize: '0.7rem' }}>Número com DDD ou link completo de destino.</small>
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
                              {printObj.active !== false ? '👁️ ATIVO' : '🙈 OCULTO'}
                            </button>
                            <button 
                              className="dev-remove-btn" 
                              style={{ position: 'static' }} 
                              onClick={() => {
                                const newList = (appData.whatsappTestimonials || []).filter((_: any, i: number) => i !== idx);
                                updateData('whatsappTestimonials', newList);
                              }}
                            >
                              ✕
                            </button>
                          </div>
                          
                          <div className="dev-form-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                              <label style={{ marginBottom: '0' }}>Link da Imagem do Print</label>
                              <a 
                                href="https://postimages.org/" 
                                target="_blank" 
                                rel="noreferrer" 
                                className="dev-btn dev-btn-secondary"
                                style={{ padding: '4px 10px', fontSize: '0.65rem', textDecoration: 'none', height: 'auto', display: 'flex', alignItems: 'center', gap: '5px' }}
                              >
                                🖼️ Enviar Foto no PostImage
                              </a>
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
                              placeholder="Link direto .jpg ou .png" 
                            />
                            <small style={{ color: '#888', fontSize: '0.65rem', marginTop: '4px', display: 'block' }}>Dica: No PostImage, use o "Link Direto"</small>
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

                 {activeTab === 'preços' && (
                  <div className="dev-forms-container">
                    <h3>Plano e Preços</h3>
                    <div className="dev-grid-2">
                       <div className="dev-form-group">
                         <label>Selinho (Badge)</label>
                         <input type="text" className="dev-input" value={appData.pricing.badge} onChange={(e) => updateData('pricing', { ...appData.pricing, badge: e.target.value })} />
                       </div>
                       <div className="dev-form-group">
                         <label>Título do Plano</label>
                         <input type="text" className="dev-input" value={appData.pricing.title} onChange={(e) => updateData('pricing', { ...appData.pricing, title: e.target.value })} />
                       </div>
                    </div>
                    <div className="dev-grid-2">
                      <div className="dev-form-group">
                        <label>Preço (R$)</label>
                        <input type="text" className="dev-input" value={appData.pricing.price} onChange={(e) => updateData('pricing', { ...appData.pricing, price: e.target.value })} />
                      </div>
                      <div className="dev-form-group">
                        <label>Período (ex: /mês)</label>
                        <input type="text" className="dev-input" value={appData.pricing.period} onChange={(e) => updateData('pricing', { ...appData.pricing, period: e.target.value })} />
                      </div>
                    </div>
                    <div className="dev-grid-2">
                      <div className="dev-form-group">
                        <label>Texto do Botão (CTA)</label>
                        <input type="text" className="dev-input" value={appData.pricing.cta} onChange={(e) => updateData('pricing', { ...appData.pricing, cta: e.target.value })} />
                      </div>
                      <div className="dev-form-group">
                        <label>Link do WhatsApp de Venda (URL Completa)</label>
                        <input type="text" className="dev-input" value={appData.pricing.waLink} onChange={(e) => updateData('pricing', { ...appData.pricing, waLink: e.target.value })} />
                      </div>
                    </div>

                    <div className="dev-grid-2" style={{ marginTop: '15px', borderTop: '1px dashed rgba(255, 255, 255, 0.1)', paddingTop: '15px' }}>
                      <div className="dev-form-group">
                        <label>QR Code de Pagamento PIX (Link de Imagem)</label>
                        <input 
                          type="text" 
                          className="dev-input" 
                          placeholder="https://exemplo.com/qrcode.png" 
                          value={appData.pricing.pixQrCodeLink || ''} 
                          onChange={(e) => updateData('pricing', { ...appData.pricing, pixQrCodeLink: e.target.value })} 
                        />
                        <small style={{ color: '#aaa', fontSize: '11px', marginTop: '4px', display: 'block' }}>Insira o link de imagem direta (ex: do Postimages ou do seu próprio site/servidor) para exibir o QR Code no checkout.</small>
                      </div>
                      <div className="dev-form-group">
                        <label>Chave PIX Copia e Cola / Chave Aleatória</label>
                        <textarea 
                          className="dev-input" 
                          placeholder="00020126360014BR.GOV.BCB.PIX..." 
                          style={{ minHeight: '80px', fontFamily: 'monospace', fontSize: '11px', background: '#12131a', border: '1px solid rgba(255,255,255,0.1)' }}
                          value={appData.pricing.pixCopiaCola || ''} 
                          onChange={(e) => updateData('pricing', { ...appData.pricing, pixCopiaCola: e.target.value })} 
                        />
                        <small style={{ color: '#aaa', fontSize: '11px', marginTop: '4px', display: 'block' }}>O código PIX Copia e Cola completo para que os anunciantes possam copiar e efetuar o pagamento facilmente.</small>
                      </div>
                    </div>

                    <h4 style={{ marginTop: '20px', marginBottom: '10px' }}>Benefícios do Plano</h4>
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
                        }}>✕</button>
                      </div>
                    ))}
                    <button className="dev-add-btn" onClick={() => updateData('pricing', { ...appData.pricing, features: [...appData.pricing.features, "Novo benefício"] })}>+ Adicionar Benefício</button>
                  </div>
                )}

                {activeTab === 'segmentos' && (
                  <div className="dev-forms-container">
                    <h3>Segmentos e Ocupação</h3>
                    {appData.segmentsList.map((s, idx) => (
                      <div key={idx} className="dev-item-card">
                        <button className="dev-remove-btn" onClick={() => updateData('segmentsList', appData.segmentsList.filter((_, i) => i !== idx))}>✕</button>
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
                            <option value="Disponível">Disponível</option>
                            <option value="Ocupado">Ocupado</option>
                          </select>
                        </div>
                      </div>
                    ))}
                    <button className="dev-add-btn" onClick={() => updateData('segmentsList', [...appData.segmentsList, { name: "Novo", status: "Disponível" }])}>+ Adicionar Segmento</button>
                  </div>
                )}

                {activeTab === 'chat' && (
                  <div className="dev-forms-container">
                    <h3>Palavras-chave do Chat (Sinônimos e Nichos)</h3>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginBottom: '20px', lineHeight: '1.4' }}>
                      <strong>Dica de ouro:</strong> Você pode cadastrar e associar várias palavras separadas por vírgula para a mesma categoria. <br />
                      Ex: Se o cliente digitar "propaganda", "comercial" ou "divulgação", ele encontrará a categoria "Publicidade".
                    </p>
                    
                    <div className="dev-item-card" style={{ border: '1px dashed var(--primary)', background: 'rgba(251,191,36,0.05)' }}>
                      <h4 style={{ fontSize: '0.8rem', marginBottom: '10px', color: 'var(--primary)' }}>+ Adicionar Novo Grupo de Palavras-Chave</h4>
                      <div className="dev-grid-2">
                        <div className="dev-form-group">
                          <label>Palavra(s) do Cliente (Separadas por vírgula)</label>
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
                          }}>✕</button>
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
                        <button className="dev-add-btn" style={{ margin: 0 }} onClick={async () => {
                          const nameInput = prompt("Nome do Divulgador?");
                          const codeInput = prompt("Código/Slug do Link (ex: joao)?");
                          
                          if (!nameInput || !codeInput) return;

                          const tid = slugify(tenantId || 'fortaleza');
                          const slug = slugify(codeInput);
                          const affDoc = doc(db, 'tenants', tid, 'affiliates', slug);
                          
                          try {
                            const check = await getDoc(affDoc);
                            if (check.exists()) {
                              alert("Este código já está em uso por outro divulgador.");
                              return;
                            }
                            
                            const newAff = {
                              name: nameInput,
                              code: slug,
                              commission: "20%",
                              whatsapp: "",
                              clicks: 0,
                              sales: 0,
                              totalEarned: 0,
                              _auth: localStorage.getItem('tenantPass') 
                            };
                            
                            await setDoc(affDoc, newAff);
                            
                            // Update local state and ensure UI refreshes
                            setAffiliates(prev => [...(prev || []), { ...newAff, id: slug }]);
                            alert("Divulgador adicionado com sucesso!");
                          } catch (err: any) {
                            console.error("Erro ao adicionar divulgador:", err);
                            alert("Erro ao adicionar: " + err.message);
                          }
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
                                  }}>✕</button>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                    <div>
                                      <h4 style={{ color: 'var(--primary)', margin: 0 }}>{aff.name}</h4>
                                      <code style={{ fontSize: '10px', color: '#888' }}>Código: {aff.code}</code>
                                    </div>
                                    <div style={{ background: 'rgba(37, 211, 102, 0.1)', color: '#25D366', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 900 }}>
                                      {aff.commission} de Comissão
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
                                        <div style={{ fontWeight: 900, color: '#fbbf24' }}>{aff.sales || 0}</div>
                                     </div>
                                  </div>
     
                                  <div className="dev-form-group" style={{ marginTop: '15px' }}>
                                    <label>Ajustar Comissão / WhatsApp</label>
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
                  💾 Salvar
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
              <span className="icon">🔔</span>
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
              <div className="chat-header-icon">💬</div>
              <div>
                <div className="chat-header-title">Assistente Virtual</div>
                <div className="chat-header-status">
                  <div className="status-dot"></div>
                  Online agora
                </div>
              </div>
            </div>
            <button className="chat-close" onClick={toggleChat}>✕</button>
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
                {msg.results && msg.results.length > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    {msg.results.map(c => (
                      <div key={c.id} className="chat-result-card">
                        <div className="chat-result-info">
                          <img src={c.logo} className="chat-result-logo" referrerPolicy="no-referrer" />
                          <div className="chat-result-details">
                            <div className="chat-result-name">{c.name}</div>
                            <div className="chat-result-cat">{c.category}</div>
                          </div>
                        </div>
                        <div className="chat-result-actions" style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
                          <a href={`https://wa.me/${c.wa}`} target="_blank" className="chat-result-wa" style={{ flex: 1 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                          </a>
                          {c.ig && c.ig !== '' && c.ig !== '#' && (
                            <a href={c.ig} target="_blank" className="chat-result-wa" style={{ flex: 1, background: '#E1306C' }}>
                              IG
                            </a>
                          )}
                          {c.website && c.website !== '' && (
                            <a href={c.website} target="_blank" className="chat-result-wa" style={{ flex: 1, background: 'var(--primary)', color: 'black' }}>
                              Web
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                placeholder="Digite o que você precisa..." 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button id="chat-send" onClick={() => handleSendMessage()}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
            </div>
            <p style={{ fontSize: '10px', color: 'var(--text-dim)', textAlign: 'center', marginTop: '10px', fontWeight: 700, textTransform: 'uppercase' }}>Ex: supermercado, mecânico, internet...</p>
          </div>
        </div>
        <button id="chat-toggle-btn" className={`chat-toggle ${isChatOpen ? 'active' : ''}`} onClick={toggleChat}>
          <span>{isChatOpen ? '✕' : '💬'}</span>
          {!isChatOpen && chatMessages.length === 0 && <div className="chat-badge">1</div>}
        </button>
      </div>

      {/* =========================================================================
          INTERACTIVE SCREEN: MINI-SITE / LOJA VIRTUAL / CARDÁPIO DIGITAL
          ========================================================================= */}
      <AnimatePresence>
        {activeMiniSiteCompany && (() => {
          const company = activeMiniSiteCompany;
          const siteType = company.type || (
            ['servicos', 'saude', 'clinica', 'oficina', 'educacao', 'advocacia', 'publicidade', 'construcao', 'financas', 'academia'].some(c => company.category.toLowerCase().includes(c)) ? 'servico' : 'loja'
          );
          
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
                    setActiveMiniSiteCompany(null);
                    // Clear search ID parameter
                    const url = new URL(window.location.href);
                    url.searchParams.delete('id');
                    window.history.pushState({}, '', url.toString());
                    setShoppingCart({});
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
                    <h2 className="text-xl sm:text-3.5xl font-extrabold text-white tracking-tight mt-1 ml-1 select-none">
                      {company.name}
                    </h2>
                  </div>
                </div>
              </div>

              {/* Body Content */}
              <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-28 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
                
                {/* Details column (left) */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                  {/* Bio Description / Social Info */}
                  <div className="bg-[#0b0c10] border border-white/5 rounded-3xl p-6 sm:p-8 shadow-xl">
                    <h3 className="text-sm font-black font-mono uppercase tracking-[0.2em] text-[var(--primary)]">SOBRE NÓS</h3>
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

                  {/* Render Catalog Items (if Shop or Menu) */}
                  {(siteType === 'loja' || siteType === 'cardapio') && (
                    <div className="bg-[#0b0c10] border border-white/5 rounded-3xl p-6 sm:p-8 shadow-xl flex-1 flex flex-col">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
                        <div>
                          <h3 className="text-lg font-extrabold text-white tracking-tight">
                            {siteType === 'loja' ? "🛍️ Catálogo de Produtos" : "🍽️ Cardápio Digital"}
                          </h3>
                          <p className="text-xs text-white/50 mt-1">Selecione e monte seus pedidos de forma simples e rápida.</p>
                        </div>
                      </div>

                      {items.length === 0 ? (
                        <div className="text-center py-16 flex-1 flex flex-col items-center justify-center">
                          <span className="text-4xl">📦</span>
                          <h4 className="text-white/80 font-bold mt-4">Nenhum produto cadastrado</h4>
                          <p className="text-white/45 text-xs max-w-xs mt-1">Este comércio ainda não incluiu itens em seu portfólio digital, mas você pode chamá-los no WhatsApp!</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-6">
                          {items.map((item: any, idx: number) => {
                            const cartQty = shoppingCart[item.id]?.count || 0;
                            return (
                              <div key={item.id || idx} className="bg-neutral-900/60 hover:bg-neutral-900 border border-white/5 hover:border-white/10 rounded-2xl p-4 flex gap-4 transition-all duration-200">
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
                                    <p className="text-[11px] text-white/50 leading-relaxed mt-0.5 line-clamp-2">{item.desc || 'Sem descrição adicional.'}</p>
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
                                            onClick={() => {
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
                                            onClick={() => {
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
                                          onClick={() => {
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
                          🛠️ Serviços Disponíveis & Portfólio
                        </h3>
                        <p className="text-xs text-white/50 mt-1">Conheça nossa carteira de serviços profissionais e solicite orçamento direto.</p>
                      </div>

                      {items.length === 0 ? (
                        <div className="text-center py-12 flex-1 flex flex-col items-center justify-center">
                          <span className="text-4xl">💼</span>
                          <h4 className="text-white/80 font-bold mt-4">Nenhum serviço listado</h4>
                          <p className="text-white/45 text-xs max-w-xs mt-1">Você pode solicitar um atendimento personalizado clicando em Contactar WhatsApp.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-4 mt-6">
                          {items.map((item: any, idx: number) => (
                            <div key={item.id || idx} className="bg-neutral-900/60 hover:bg-neutral-900 border border-white/5 hover:border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row gap-4 transition-all duration-200">
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
                                <div className="flex items-center justify-between mt-4 sm:mt-1 pt-2 border-t border-white/5">
                                  <span className="text-xs font-black text-[var(--primary)] font-mono">
                                    {item.price ? `R$ ${parseFloat(item.price).toFixed(2).replace('.', ',')}` : 'Sob Consulta'}
                                  </span>
                                  <button 
                                    onClick={() => {
                                      const textMsg = `Olá! Gostaria de fazer um orçamento para o serviço comercial: *${item.name}* no portal ${appData.siteInfo.name}`;
                                      window.open(`https://wa.me/${company.wa.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(textMsg)}`, '_blank');
                                    }}
                                    className="px-4 py-2 rounded-xl bg-transparent hover:bg-amber-400/10 border border-[var(--primary)]/30 hover:border-[var(--primary)] text-[var(--primary)] text-[10px] font-black uppercase tracking-widest transition-all duration-200"
                                  >
                                    Pedir Orçamento
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
                      <h3 className="text-sm font-black font-mono uppercase tracking-[0.2em] text-[var(--primary)] flex items-center gap-2">
                        <ShoppingCart size={16} /> SACOLA DE PEDIDOS
                      </h3>
                      
                      {Object.keys(shoppingCart).length === 0 ? (
                        <div className="text-center py-12 flex-1 flex flex-col items-center justify-center">
                          <span className="text-2xl text-white/20">🛒</span>
                          <p className="text-xs text-white/40 mt-3 max-w-[200px] leading-relaxed">Sua sacola está vazia. Adicione produtos acima para enviar o seu pedido.</p>
                        </div>
                      ) : (() => {
                        const cartItemsArr = Object.values(shoppingCart) as any[];
                        const subtotal = cartItemsArr.reduce((total: number, car: any) => {
                          const val = car.item.price ? parseFloat(car.item.price) : 0;
                          return total + (val * car.count);
                        }, 0);
                        
                        return (
                          <div className="mt-4 flex flex-col gap-4 flex-1">
                            {/* Items List */}
                            <div className="flex flex-col gap-3 max-h-56 overflow-y-auto pr-1">
                              {cartItemsArr.map((car: any) => (
                                <div key={car.item.id} className="bg-neutral-900 border border-white/5 rounded-xl p-3 flex justify-between items-center">
                                  <div className="flex-1 min-w-0 pr-2">
                                    <h4 className="text-xs font-bold text-white truncate">{car.item.name}</h4>
                                    <p className="text-[10px] text-white/50 font-mono mt-0.5">{car.count}x • {car.item.price ? `R$ ${parseFloat(car.item.price).toFixed(2).replace('.', ',')}` : 'Grátis'}</p>
                                  </div>
                                  <span className="text-xs font-black text-white font-mono flex-shrink-0">
                                    {car.item.price ? `R$ ${(parseFloat(car.item.price) * car.count).toFixed(2).replace('.', ',')}` : 'Consulta'}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {/* Divider line */}
                            <div className="border-t border-white/5 pt-3">
                              <div className="flex justify-between items-center text-sm">
                                <span className="font-bold text-white">Total do Pedido:</span>
                                <span className="text-base font-black text-[var(--primary)] font-mono">
                                  R$ {subtotal.toFixed(2).replace('.', ',')}
                                </span>
                              </div>
                            </div>

                            {/* Client Details Form */}
                            <div className="flex flex-col gap-2.5 mt-2">
                              <label className="text-[10px] text-white/50 uppercase tracking-wider font-extrabold">Seu Nome *</label>
                              <input 
                                type="text"
                                placeholder="Informe seu nome"
                                value={cartCustomerName}
                                onChange={(e) => setCartCustomerName(e.target.value)}
                                className="w-full bg-[#11111a] border border-white/10 hover:border-white/20 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3 text-xs text-white"
                              />

                              <label className="text-[10px] text-white/50 uppercase tracking-wider font-extrabold mt-1">Endereço de Entrega ou Mesa / Observações *</label>
                              <textarea 
                                placeholder="Bairro, Rua, Nº / Observações como ponto de referência"
                                value={cartCustomerDetails}
                                onChange={(e) => setCartCustomerDetails(e.target.value)}
                                rows={2}
                                className="w-full bg-[#11111a] border border-white/10 hover:border-white/20 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3 text-xs text-white resize-none"
                              />
                            </div>

                            {/* WhatsApp Submit */}
                            <button 
                              onClick={() => {
                                if (!cartCustomerName || !cartCustomerDetails) {
                                  alert("Por favor, preencha seu nome e endereço/observações.");
                                  return;
                                }
                                
                                // Format perfect whatsapp message
                                let textMsg = `*🛒 NOVO PEDIDO - ${company.name.toUpperCase()}*\n`;
                                textMsg += `------------------------------------\n`;
                                textMsg += `*Cliente:* ${cartCustomerName}\n`;
                                textMsg += `*Entrega/Local:* ${cartCustomerDetails}\n`;
                                textMsg += `------------------------------------\n`;
                                textMsg += `*Itens Pedidos:*\n`;
                                
                                cartItemsArr.forEach((c: any) => {
                                  textMsg += `- ${c.count}x ${c.item.name} (${c.item.price ? `R$ ${parseFloat(c.item.price).toFixed(2).replace('.', ',')}` : 'Consulta'})\n`;
                                });
                                
                                textMsg += `------------------------------------\n`;
                                textMsg += `*Total Geral:* R$ ${subtotal.toFixed(2).replace('.', ',')}\n\n`;
                                textMsg += `Vi seu catálogo e fecho via WhatsApp através do portal *${appData.siteInfo.name}*!`;
                                
                                window.open(`https://wa.me/${company.wa.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(textMsg)}`, '_blank');
                              }}
                              className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest text-center flex items-center justify-center gap-2 transition-all duration-300 shadow-lg mt-2 cursor-pointer shadow-emerald-500/10"
                            >
                              <Smartphone size={14} /> Finalizar via WhatsApp
                            </button>
                            <p className="text-[10px] text-white/30 text-center leading-relaxed">
                              O checkout é finalizado de forma rápida e segura direto no WhatsApp do estabelecimento comercial, sem taxas na plataforma!
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Option B: Landing Quote form (for service-landing pages) */}
                  {siteType === 'servico' && (
                    <div className="bg-[#0b0c10] border border-white/5 rounded-3xl p-6 sm:p-8 shadow-xl relative sticky top-6">
                      <h3 className="text-sm font-black font-mono uppercase tracking-[0.2em] text-[var(--primary)]">SOLICITAR ORÇAMENTO</h3>
                      <p className="text-xs text-white/45 mt-2 leading-relaxed">Envie sua dúvida ou descreva o serviço que você precisa receber diretamente para o nosso suporte oficial!</p>
                      
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
                          <label className="text-[10px] text-white/50 uppercase tracking-widest font-extrabold">Qual serviço/atividade você deseja?</label>
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
                            placeholder="Descreva o que você precisa ou suas dúvidas..."
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
                              alert("Por favor, informe seu nome e descreva os detalhes do seu pedido de orçamento.");
                              return;
                            }
                            
                            let textMsg = `*📋 PEDIDO DE ORÇAMENTO COMERCIAL - ${company.name.toUpperCase()}*\n`;
                            textMsg += `------------------------------------\n`;
                            textMsg += `*Cliente:* ${clientName}\n`;
                            textMsg += `*Serviço Requerido:* ${serv}\n`;
                            textMsg += `------------------------------------\n`;
                            textMsg += `*Mensagem/Detalhes:*\n${notes}\n\n`;
                            textMsg += `Solicitação realizada via atendimento digital no portal *${appData.siteInfo.name}*!`;
                            
                            window.open(`https://wa.me/${company.wa.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(textMsg)}`, '_blank');
                          }}
                          className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest text-center flex items-center justify-center gap-2 transition-all duration-300 shadow-md cursor-pointer mt-2"
                        >
                          <Smartphone size={14} /> Enviar no WhatsApp
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
              {!currentAdvertiser ? (
                <div className="w-full max-w-md mx-auto py-8">
                  {/* Mode Selector */}
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
                      Cadastrar Negócio
                    </button>
                  </div>

                  {/* Mode 1: Advertiser Login Form */}
                  {adLoginMode === 'login' ? (
                    <div className="flex flex-col gap-4">
                      <div>
                        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                          🗝️ Login do Anunciante
                        </h2>
                        <p className="text-xs text-white/50 mt-1">Gerencie seu perfil, catálogo e pedidos de forma profissional.</p>
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
                          🚀 Cadastre Seu Negócio no Portal
                        </h2>
                        <p className="text-xs text-white/50 mt-1">Sua empresa será listada automaticamente de forma profissional e interativa.</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-white/50 uppercase font-black">Seu E-mail de Usuário</label>
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
                            value={adRegisterForm.category}
                            onChange={(e) => setAdRegisterForm(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full bg-[#11111a] border border-white/10 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3 text-xs text-white"
                          >
                            {(appData?.categories || []).map((cat: any) => (
                              <option key={cat.name} value={cat.name}>{cat.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-white/50 uppercase font-black">Estilo do seu Mini-Site</label>
                          <select 
                            value={adRegisterForm.type}
                            onChange={(e) => setAdRegisterForm(prev => ({ ...prev, type: e.target.value }))}
                            className="w-full bg-[#11111a] border border-white/10 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3 text-xs text-white"
                          >
                            <option value="loja">🛍️ Loja Virtual (Produtos com preço e carrinho)</option>
                            <option value="cardapio">🍔 Cardápio / Lanchonete (Itens alimentícios e pedidos)</option>
                            <option value="servico">🛠️ Prestador de Serviços (Listado de serviços, fotos, botão orçamentos)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] text-white/50 uppercase font-black">Link da Logo (Opcional)</label>
                            <div className="flex gap-1.5">
                              <a 
                                href={universalConfig.uploadImageHelpUrl || 'https://postimages.org/'} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-[9px] text-[var(--primary)] hover:underline flex items-center gap-1 bg-[var(--primary)]/10 px-1.5 py-0.5 rounded border border-[var(--primary)]/10 decoration-transparent"
                              >
                                📷 Imagem
                              </a>
                              <a 
                                href={universalConfig.uploadVideoHelpUrl || 'https://streamable.com/'} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-[9px] text-emerald-400 hover:underline flex items-center gap-1 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/10 decoration-transparent"
                              >
                                🎥 Vídeo
                              </a>
                            </div>
                          </div>
                          <input 
                            type="text"
                            placeholder="https://suaimagem.com/foto.jpg"
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

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-white/50 uppercase font-black">Descrição Curta do Negócio</label>
                        <textarea 
                          placeholder="Ex: Oferecemos o melhor da moda e confecções na região com descontos exclusivos e promoções todos os dias."
                          rows={2}
                          value={adRegisterForm.desc}
                          onChange={(e) => setAdRegisterForm(prev => ({ ...prev, desc: e.target.value }))}
                          className="w-full bg-[#11111a] border border-white/10 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3 text-xs text-white resize-none"
                        />
                      </div>

                      <button 
                        onClick={async () => {
                          const { email, password, name, wa, category, type, logo, ig, desc } = adRegisterForm;
                          if (!email || !password || !name || !wa) {
                            alert("Por favor, preencha todos os campos obrigatórios (E-mail, Senha, Nome da Empresa e WhatsApp).");
                            return;
                          }
                          
                          setIsAdLoading(true);
                          try {
                            const activeSlug = slugify(name);
                            const advertiserRef = doc(db, 'advertisers', activeSlug);
                            
                            // Check uniqueness
                            const checkRef = await getDoc(advertiserRef);
                            if (checkRef.exists()) {
                              alert("Já existe uma empresa cadastrada com este nome comercial. Escolha um nome exclusivo.");
                              setIsAdLoading(false);
                              return;
                            }
                            
                            const newCompany = {
                              id: activeSlug,
                              name: name.trim(),
                              category: category,
                              desc: desc.trim() || 'Sem descrição cadastrada.',
                              logo: logo.trim() || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150',
                              wa: wa.replace(/[^0-9]/g, ''),
                              ig: ig.trim() || '#',
                              type: type,
                              items: [],
                              featured: false,
                              active: true
                            };
                            
                            // Save to collection
                            await setDoc(advertiserRef, {
                              email: email.toLowerCase().trim(),
                              password: password,
                              tenantId: slugify(tenantId || 'fortaleza'),
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
                              company: newCompany
                            });
                            
                            // Refresh dynamic list
                            await fetchAdvertisers(tenantId || 'fortaleza');
                            alert("Sua empresa foi cadastrada com total sucesso e já está publicada online no portal!");
                          } catch (err) {
                            console.error("Cadastro falhou:", err);
                            alert("Erro ao tentar cadastrar seu negócio. Verifique os campos e tente novamente.");
                          } finally {
                            setIsAdLoading(false);
                          }
                        }}
                        disabled={isAdLoading}
                        className="w-full bg-[#25D366] hover:brightness-110 text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest text-center transition-all duration-200 mt-2 cursor-pointer shadow-lg shadow-emerald-500/10"
                      >
                        {isAdLoading ? "Salvando informações..." : "Completar Cadastro & Publicar"}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // SECTION B: IF AUTHENTICATED SHOW ADVERTISER DASHBOARD
                <div className="flex flex-col gap-6">
                  {/* Dashboard Header Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5 mt-4">
                    <div>
                      <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-1.5">
                        ⚙️ Painel de Controle • {currentAdvertiser.company.name}
                      </h2>
                      <p className="text-xs text-white/50">Edite seu perfil e seus serviços de forma independente, as atualizações são automáticas!</p>
                    </div>
                    <button 
                      onClick={() => {
                        localStorage.removeItem('ad_email');
                        localStorage.removeItem('ad_password');
                        setCurrentAdvertiser(null);
                        setEditingItemIndex(null);
                        alert("Sessão finalizada.");
                      }}
                      className="inline-flex items-center gap-1.5 self-start bg-red-600/10 border border-red-500/20 text-red-400 hover:bg-red-600 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150"
                    >
                      <LogOut size={13} /> Sair do Painel
                    </button>
                  </div>

                  {/* Tabs Nav */}
                  <div className="flex gap-3 border-b border-white/5 pb-1">
                    <button 
                      onClick={() => {
                        setAdDashboardTab('perfil');
                        setEditingItemIndex(null);
                      }}
                      className={`text-xs font-black uppercase tracking-wider pb-3 px-1 transition-all border-b-2 hover:text-white ${adDashboardTab === 'perfil' ? 'border-[var(--primary)] text-white' : 'border-transparent text-white/40'}`}
                    >
                      Perfil & Dados Gerais
                    </button>
                    <button 
                      onClick={() => {
                        setAdDashboardTab('catalogo');
                        setEditingItemIndex(null);
                      }}
                      className={`text-xs font-black uppercase tracking-wider pb-3 px-1 transition-all border-b-2 hover:text-white ${adDashboardTab === 'catalogo' ? 'border-[var(--primary)] text-white' : 'border-transparent text-white/40'}`}
                    >
                      Gerenciar Itens ({currentAdvertiser.company.items?.length || 0})
                    </button>
                  </div>

                  {/* Sub-Tab 1: Profile Edits */}
                  {adDashboardTab === 'perfil' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Form area */}
                      <div className="lg:col-span-2 flex flex-col gap-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] text-white/50 uppercase font-bold">Nome da Empresa</label>
                            <input 
                              type="text"
                              value={currentAdvertiser.company.name}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCurrentAdvertiser((prev: any) => ({
                                  ...prev,
                                  company: { ...prev.company, name: val }
                                }));
                              }}
                              className="w-full bg-[#11111a] border border-white/10 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3 text-xs text-white"
                            />
                          </div>
                          
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] text-white/50 uppercase font-bold">WhatsApp Comercial (com DDD)</label>
                            <input 
                              type="text"
                              value={currentAdvertiser.company.wa}
                              onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9]/g, '');
                                setCurrentAdvertiser((prev: any) => ({
                                  ...prev,
                                  company: { ...prev.company, wa: val }
                                }));
                              }}
                              className="w-full bg-[#11111a] border border-white/10 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3 text-xs text-white"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] text-white/50 uppercase font-bold">Categoria</label>
                            <select 
                              value={currentAdvertiser.company.category}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCurrentAdvertiser((prev: any) => ({
                                  ...prev,
                                  company: { ...prev.company, category: val }
                                }));
                              }}
                              className="w-full bg-[#11111a] border border-white/10 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3 text-xs text-white"
                            >
                              {(appData?.categories || []).map((cat: any) => (
                                <option key={cat.name} value={cat.name}>{cat.name}</option>
                              ))}
                            </select>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] text-white/50 uppercase font-bold">Estilo de Atendimento / Funcionalidade</label>
                            <select 
                              value={currentAdvertiser.company.type || 'loja'}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCurrentAdvertiser((prev: any) => ({
                                  ...prev,
                                  company: { ...prev.company, type: val }
                                }));
                              }}
                              className="w-full bg-[#11111a] border border-white/10 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3 text-xs text-white"
                            >
                              <option value="loja">🛍️ Loja Virtual (Produtos com carrinho e WhatsApp)</option>
                              <option value="cardapio">🍔 Cardápio / Lanchonete (Itens alimentícios e pedidos)</option>
                              <option value="servico">🛠️ Prestador de Serviços (Landing page de portfólio)</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] text-white/50 uppercase font-bold">Link da Foto Logo (URL)</label>
                              <div className="flex gap-2">
                                <a 
                                  href={universalConfig.uploadImageHelpUrl || 'https://postimages.org/'} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="text-[10px] text-[var(--primary)] hover:underline flex items-center gap-1 bg-[var(--primary)]/10 px-2 py-0.5 rounded border border-[var(--primary)]/20 decoration-transparent"
                                >
                                  📷 Imagem
                                </a>
                                <a 
                                  href={universalConfig.uploadVideoHelpUrl || 'https://streamable.com/'} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 decoration-transparent"
                                >
                                  🎥 Vídeo
                                </a>
                              </div>
                            </div>
                            <input 
                              type="text"
                              value={currentAdvertiser.company.logo}
                              placeholder="https://..."
                              onChange={(e) => {
                                const val = e.target.value;
                                setCurrentAdvertiser((prev: any) => ({
                                  ...prev,
                                  company: { ...prev.company, logo: val }
                                }));
                              }}
                              className="w-full bg-[#11111a] border border-white/10 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3 text-xs text-white"
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] text-white/50 uppercase font-bold">Link do Instagram (instagram.com/...)</label>
                            <input 
                              type="text"
                              value={currentAdvertiser.company.ig}
                              placeholder="https://..."
                              onChange={(e) => {
                                const val = e.target.value;
                                setCurrentAdvertiser((prev: any) => ({
                                  ...prev,
                                  company: { ...prev.company, ig: val }
                                }));
                              }}
                              className="w-full bg-[#11111a] border border-white/10 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3 text-xs text-white"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-white/50 uppercase font-bold">Apresentação / Quem Somos</label>
                          <textarea 
                            value={currentAdvertiser.company.desc}
                            rows={3}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCurrentAdvertiser((prev: any) => ({
                                  ...prev,
                                  company: { ...prev.company, desc: val }
                              }));
                            }}
                            className="w-full bg-[#11111a] border border-white/10 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3 text-xs text-white resize-none"
                          />
                        </div>

                        <button 
                          onClick={async () => {
                            setIsAdLoading(true);
                            try {
                              const docRef = doc(db, 'advertisers', currentAdvertiser.id);
                              
                              // Save exact state with proof of credentials matching security rules
                              await setDoc(docRef, {
                                email: currentAdvertiser.email,
                                password: currentAdvertiser.password,
                                tenantId: currentAdvertiser.tenantId,
                                company: {
                                  ...currentAdvertiser.company,
                                  name: currentAdvertiser.company.name.trim(),
                                  desc: currentAdvertiser.company.desc.trim()
                                }
                              });
                              
                              // sync local state list
                              await fetchAdvertisers(tenantId || 'fortaleza');
                              alert("Perfil do Anunciante salvo e atualizado online com total sucesso!");
                            } catch (err) {
                              console.error("Failed to update profile:", err);
                              alert("Erro ao tentar atualizar os dados do seu negócio.");
                            } finally {
                              setIsAdLoading(false);
                            }
                          }}
                          disabled={isAdLoading}
                          className="w-full sm:w-auto self-start px-8 py-3.5 bg-[var(--primary)] hover:brightness-110 text-black rounded-xl font-bold text-xs uppercase tracking-widest cursor-pointer shadow-lg"
                        >
                          {isAdLoading ? "Salvando..." : "💾 Salvar Alterações"}
                        </button>
                      </div>

                      {/* Card preview area (right) */}
                      <div className="bg-neutral-900/40 border border-white/5 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-5">Visualização Prévia do Cartão</span>
                        
                        <div className="bg-[#0f1016] border border-white/10 rounded-3xl p-6 w-full max-w-[280px] flex flex-col justify-between shadow-xl relative select-none">
                          <div>
                            <div className="w-16 h-16 rounded-full bg-white border border-white/15 overflow-hidden flex items-center justify-center shadow-lg mx-auto mb-4 p-0">
                              <img 
                                src={currentAdvertiser.company.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150'} 
                                alt="Previa" 
                                className="w-full h-full object-cover" 
                                onError={(e) => { (e.target as any).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150' }}
                                referrerPolicy="no-referrer" 
                              />
                            </div>
                            <span className="text-[9px] text-[var(--primary)] font-black uppercase tracking-widest bg-[var(--primary)]/10 px-2 rounded-full mb-2 inline-block">
                              {currentAdvertiser.company.category}
                            </span>
                            <h4 className="text-sm font-extrabold text-white mt-1 line-clamp-1">{currentAdvertiser.company.name || 'Nova Empresa'}</h4>
                            <p className="text-[10px] text-white/50 mt-1.5 leading-relaxed line-clamp-2 min-h-[2.5rem]">{currentAdvertiser.company.desc || 'Parceiro comercial ativo na rede.'}</p>
                          </div>
                          
                          <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-1.5">
                            <span className="w-full bg-amber-500/10 text-amber-400 text-[8px] font-black uppercase tracking-widest py-2 rounded-xl text-center">
                              Ativo no Portal
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sub-Tab 2: Catalog Management list */}
                  {adDashboardTab === 'catalogo' && (
                    <div className="flex flex-col gap-6">
                      
                      {/* Add Button and Title */}
                      <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl">
                        <div>
                          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Itens do Catálogo Virtual</h3>
                          <p className="text-[11px] text-white/50">Inclua seus produtos, serviços ou opções de cardápio.</p>
                        </div>
                        {editingItemIndex === null && (
                          <button 
                            onClick={() => {
                              setItemForm({ name: '', desc: '', price: '', photo: '' });
                              setEditingItemIndex(-1); // -1 triggers add new form
                            }}
                            className="inline-flex items-center gap-1.5 bg-[var(--primary)] hover:brightness-110 text-black px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer shadow"
                          >
                            <Plus size={14} /> Adicionar Item
                          </button>
                        )}
                      </div>

                      {/* Editing Item Form Inline Overlay */}
                      {editingItemIndex !== null && (
                        <div className="bg-neutral-900 border border-[var(--primary)]/20 rounded-3xl p-6 flex flex-col gap-4">
                          <h4 className="text-sm font-black text-white uppercase tracking-wider border-b border-white/5 pb-2">
                            {editingItemIndex === -1 ? '➕ Cadastrar Novo Item' : '✍️ Editar Item'}
                          </h4>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] text-white/50 uppercase font-bold">Nome do Produto / Serviço / Prato *</label>
                              <input 
                                type="text"
                                value={itemForm.name}
                                onChange={(e) => setItemForm(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Feijoada Completa, Camiseta Slim, Consulta..."
                                className="w-full bg-[#11111a] border border-white/10 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3 text-xs text-white"
                              />
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] text-white/50 uppercase font-bold">Valor (R$) *</label>
                              <input 
                                type="text"
                                value={itemForm.price}
                                onChange={(e) => setItemForm(prev => ({ ...prev, price: e.target.value }))}
                                placeholder="59.90 (Apenas números e ponto)"
                                className="w-full bg-[#11111a] border border-white/10 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3 text-xs text-white font-mono"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] text-white/50 uppercase font-bold">Descrição Curta</label>
                              <input 
                                type="text"
                                value={itemForm.desc}
                                onChange={(e) => setItemForm(prev => ({ ...prev, desc: e.target.value }))}
                                placeholder="Ingredientes, tamanhos disponíveis, etc"
                                className="w-full bg-[#11111a] border border-white/10 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3 text-xs text-white"
                              />
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <div className="flex justify-between items-center">
                                <label className="text-[10px] text-white/50 uppercase font-bold">Link da Foto URL (Opcional)</label>
                                <div className="flex gap-2">
                                  <a 
                                    href={universalConfig.uploadImageHelpUrl || 'https://postimages.org/'} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-[10px] text-[var(--primary)] hover:underline flex items-center gap-1 bg-[var(--primary)]/10 px-2 py-0.5 rounded border border-[var(--primary)]/20 decoration-transparent"
                                  >
                                    📷 Imagem
                                  </a>
                                  <a 
                                    href={universalConfig.uploadVideoHelpUrl || 'https://streamable.com/'} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 decoration-transparent"
                                  >
                                    🎥 Vídeo
                                  </a>
                                </div>
                              </div>
                              <input 
                                type="text"
                                value={itemForm.photo}
                                onChange={(e) => setItemForm(prev => ({ ...prev, photo: e.target.value }))}
                                placeholder="https://..."
                                className="w-full bg-[#11111a] border border-white/10 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3 text-xs text-white"
                              />
                            </div>
                          </div>

                          <div className="flex gap-2.5 justify-end mt-4">
                            <button 
                              onClick={() => setEditingItemIndex(null)}
                              className="px-5 py-2.5 bg-neutral-950 border border-white/10 hover:bg-neutral-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
                            >
                              Cancelar
                            </button>
                            
                            <button 
                              onClick={async () => {
                                const { name, price, desc, photo } = itemForm;
                                if (!name || !price) {
                                  alert("Preencha ao menos o Nome e o Preço do item.");
                                  return;
                                }

                                if (isNaN(Number(price))) {
                                  alert("O valor deve ser um número decimal, use ponto no centavo (ex: 39.90)");
                                  return;
                                }

                                if (editingItemIndex === -1) {
                                  const currentCount = currentAdvertiser.company.items?.length || 0;
                                  const hasPaidPlan = currentAdvertiser.company.hasPlan || currentAdvertiser.company.featured || false;
                                  if (currentCount >= 6 && !hasPaidPlan) {
                                    alert("Oops! Você atingiu o limite de 6 produtos/fotos do Plano Gratuito. Adquira o Plano para ter acesso ilimitado a produtos e ganhar destaque preferencial no portal!");
                                    setIsCheckoutOpen(true);
                                    return;
                                  }
                                }

                                const newItem = {
                                  id: editingItemIndex === -1 ? `item_${Date.now()}` : (currentAdvertiser.company.items[editingItemIndex]?.id || `item_${Date.now()}`),
                                  name: name.trim(),
                                  price: Number(price).toString(),
                                  desc: desc.trim(),
                                  photo: photo.trim()
                                };

                                let updatedItems = [...(currentAdvertiser.company.items || [])];
                                if (editingItemIndex === -1) {
                                  updatedItems.push(newItem);
                                } else {
                                  updatedItems[editingItemIndex] = newItem;
                                }

                                const updatedAdvertiser = {
                                  ...currentAdvertiser,
                                  company: {
                                    ...currentAdvertiser.company,
                                    items: updatedItems
                                  }
                                };

                                setIsAdLoading(true);
                                try {
                                  const docRef = doc(db, 'advertisers', currentAdvertiser.id);
                                  await setDoc(docRef, {
                                    email: currentAdvertiser.email,
                                    password: currentAdvertiser.password,
                                    tenantId: currentAdvertiser.tenantId,
                                    company: updatedAdvertiser.company
                                  });
                                  
                                  setCurrentAdvertiser(updatedAdvertiser);
                                  await fetchAdvertisers(tenantId || 'fortaleza');
                                  setEditingItemIndex(null);
                                  alert("Item salvo e publicado online de forma automática!");
                                } catch (err) {
                                  console.error("Save item failed", err);
                                  alert("Ocorreu um erro ao tentar salvar o item.");
                                } finally {
                                  setIsAdLoading(false);
                                }
                              }}
                              disabled={isAdLoading}
                              className="px-6 py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
                            >
                              {isAdLoading ? "Salvando..." : "✅ Salvar Item"}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Items Grid List */}
                      {editingItemIndex === null && (
                        currentAdvertiser.company.items?.length === 0 ? (
                          <div className="text-center py-16 bg-neutral-900/20 rounded-2xl border border-dashed border-white/5 flex flex-col items-center justify-center">
                            <span className="text-3xl">📭</span>
                            <h4 className="text-sm font-bold text-white mt-3">Você ainda não possui nenhum produto ou serviço</h4>
                            <p className="text-xs text-white/40 max-w-xs mt-1">Adicione itens digitais para ativar seu catálogo interativo com shopping-cart do portal.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {currentAdvertiser.company.items.map((it: any, i: number) => (
                              <div key={it.id || i} className="bg-[#12131a] border border-white/5 rounded-2xl p-4 flex gap-4 items-center justify-between">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-12 h-12 bg-neutral-950 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center border border-white/10">
                                    {it.photo ? (
                                      <img src={it.photo} alt={it.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                    ) : (
                                      <ImageIcon className="text-white/20" size={18} />
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="text-xs font-bold text-white truncate">{it.name}</h4>
                                    <span className="text-[10px] font-black text-[var(--primary)] font-mono">
                                      R$ {parseFloat(it.price).toFixed(2).replace('.', ',')}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex gap-2 flex-shrink-0">
                                  <button 
                                    onClick={() => {
                                      setItemForm({
                                        name: it.name,
                                        desc: it.desc || '',
                                        price: it.price,
                                        photo: it.photo || ''
                                      });
                                      setEditingItemIndex(i);
                                    }}
                                    className="p-2 rounded bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                                  >
                                    Editar
                                  </button>
                                  
                                  <button 
                                    onClick={async () => {
                                      if (!confirm("Tem certeza que deseja excluir este item?")) return;
                                      
                                      const updatedItems = currentAdvertiser.company.items.filter((_: any, idx: number) => idx !== i);
                                      const updatedAdvertiser = {
                                        ...currentAdvertiser,
                                        company: {
                                          ...currentAdvertiser.company,
                                          items: updatedItems
                                        }
                                      };

                                      setIsAdLoading(true);
                                      try {
                                        const docRef = doc(db, 'advertisers', currentAdvertiser.id);
                                        await setDoc(docRef, {
                                          email: currentAdvertiser.email,
                                          password: currentAdvertiser.password,
                                          tenantId: currentAdvertiser.tenantId,
                                          company: updatedAdvertiser.company
                                        });
                                        
                                        setCurrentAdvertiser(updatedAdvertiser);
                                        await fetchAdvertisers(tenantId || 'fortaleza');
                                        alert("Item excluído com sucesso.");
                                      } catch (err) {
                                        console.error("Delete failed", err);
                                        alert("Falha ao tentar excluir o item.");
                                      } finally {
                                        setIsAdLoading(false);
                                      }
                                    }}
                                    className="p-2 rounded bg-red-600/10 hover:bg-red-600 hover:text-white text-red-400 transition-colors"
                                  >
                                    Excluir
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCheckoutOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-md z-[2000] overflow-y-auto flex items-center justify-center p-4 font-sans"
          >
            <div className="bg-[#0b0c10] border border-white/10 rounded-3xl w-full max-w-md shadow-2xl p-6 sm:p-8 flex flex-col relative">
              {/* Close Button */}
              <button 
                onClick={() => setIsCheckoutOpen(false)}
                className="absolute top-5 right-5 text-white/50 hover:text-white hover:scale-105 transition-all p-2 bg-white/5 hover:bg-white/10 rounded-full cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="text-center">
                <span className="text-[10px] text-[var(--primary)] font-black uppercase tracking-widest bg-[var(--primary)]/10 px-3 py-1 rounded-full inline-block mb-3">
                  ⭐ Adquirir Plano VIP
                </span>
                <h3 className="text-xl font-black text-white">Checkout do Plano</h3>
                <p className="text-xs text-white/50 mt-1">Liberar Cadastro Ilimitado e Destaque no Portal</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mt-6 text-center select-none">
                <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Valor do Plano</span>
                <div className="text-2xl font-black text-[#fbbf24] mt-1">
                  R$ {appData?.pricing.price || '147,00'} <span className="text-xs text-white/40">/ {appData?.pricing.period || 'mês'}</span>
                </div>
              </div>

              {/* QR Code */}
              <div className="mt-6 flex flex-col items-center">
                <div className="w-48 h-48 bg-white border-4 border-white/10 rounded-2xl overflow-hidden flex items-center justify-center shadow-lg p-2">
                  {appData?.pricing.pixQrCodeLink ? (
                    <img 
                      src={appData.pricing.pixQrCodeLink} 
                      alt="QR Code Pix" 
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="text-center text-xs text-black flex flex-col items-center justify-center p-3">
                      <span className="text-2xl">⚡</span>
                      <span className="mt-2 font-black font-sans text-gray-800">QR Code PIX</span>
                      <span className="text-[10px] leading-tight text-gray-500 mt-1">O administrador ainda não cadastrou o link da imagem do QR Code. Peça a chave copia e cola abaixo.</span>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-white/45 font-bold uppercase tracking-widest mt-2 font-mono">QR Code Pix</span>
              </div>

              {/* Copy and Paste Box */}
              <div className="mt-5">
                <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest block mb-2 text-center">Pix Copia e Cola</span>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    readOnly 
                    value={appData?.pricing.pixCopiaCola || 'Chave PIX não configurada no painel.'} 
                    className="flex-1 bg-[#12131a] border border-white/10 rounded-xl px-4 py-3 text-xs text-white font-mono outline-none text-ellipsis"
                  />
                  <button 
                    onClick={() => {
                      if (appData?.pricing.pixCopiaCola) {
                        navigator.clipboard.writeText(appData.pricing.pixCopiaCola);
                        setPixCopied(true);
                        setTimeout(() => setPixCopied(false), 2000);
                      } else {
                        alert("Chave PIX não configurada pelo administrador.");
                      }
                    }}
                    className={`px-4 rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer transition-all ${pixCopied ? 'bg-emerald-500 text-white' : 'bg-white/10 hover:bg-white/15 text-white'}`}
                  >
                    {pixCopied ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>

              {/* JÁ EFETUEI O PAGAMENTO CTA */}
              <a 
                href={`https://wa.me/${(appData?.pricing.waLink || '5585992862177').replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Olá! Já efetuei o pagamento do plano de anúncios via PIX, aqui está o comprovante! Desejo ativar meu perfil premium.')}`}
                target="_blank" 
                rel="noreferrer"
                onClick={() => setIsCheckoutOpen(false)}
                className="w-full text-center bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest block mt-6 shadow-xl shadow-emerald-500/10 cursor-pointer transition-all"
              >
                🚀 Já Efetuei o Pagamento
              </a>

              <div className="text-center mt-3">
                <small style={{ fontSize: '11px', color: '#ff4444', fontWeight: 'bold' }}>
                  ⚠️ Envie o comprovante pelo botão acima para ativar imediatamente!
                </small>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
