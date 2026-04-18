/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HashRouter, Routes, Route, useParams, useNavigate, useLocation } from 'react-router-dom';

import { auth, db, googleProvider } from './lib/firebase';
import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, collection, getDocs, deleteDoc } from 'firebase/firestore';

// --- Constants ---
const COMPANIES_DATA = [
  { id: 1, name: "Bossa Infor", category: "Publicidade", desc: "Soluções em Áudio & Vídeo", logo: "https://i.postimg.cc/Gpykbbz5/nova_logo_bossa_infor_png.png", wa: "5585992862177", ig: "https://www.instagram.com/bossainfor/", featured: true },
  { id: 2, name: "Belém Rolamentos", category: "Oficina", desc: "Manutenção preventiva e corretiva.", logo: "https://i.postimg.cc/Y2mTTF1h/1.png", wa: "5591980342025", ig: "https://cutt.ly/belemrolamentoss", featured: true },
  { id: 3, name: "Assai Atacadista", category: "Supermercado", desc: "Preço Baixo Todo dia", logo: "https://i.postimg.cc/LX4fh1rh/assai.jpg", wa: "558535334476", ig: "https://www.assai.com.br/", featured: true },
  { id: 4, name: "Carneiro do Ordones", category: "Restaurante & bar", desc: "Restaurante Pioneiro em Fortaleza", logo: "https://i.postimg.cc/C1KwKkhv/images.jpg", wa: "558532815959", ig: "https://www.instagram.com/carneirodoordonesoriginal/", featured: true },
  { id: 6, name: "Atacadão", category: "Supermercado", desc: "Preço baixo de verdade", logo: "https://i.postimg.cc/8PfPWRR8/atacadao-square-Logo-1758223460501.webp", wa: "558532159868", ig: "https://www.atacadao.com.br/", featured: true },
  { id: 7, name: "North Shopping", category: "Lazer", desc: "O Shopping mais completo para você", logo: "https://i.postimg.cc/mZ5m083x/images.png", wa: "558534043073", ig: "https://www.northshoppingfortaleza.com.br/", featured: true },
  { id: 8, name: "Gih Cred", category: "Financeiro", desc: "Crédito Rápido e Seguro", logo: "https://i.postimg.cc/QCby11tL/GIH_CRED.jpg", wa: "5585981502984", ig: "https://www.gihcred.com.br/", featured: false },
  { id: 9, name: "Cartão de Todos", category: "Saúde", desc: "O maior cartão de descontos do Brasil", logo: "https://i.postimg.cc/K8SfGPPV/Whats-App-Image-2026-03-12-at-06-48-20.jpg", wa: "5585999093518", ig: "#", featured: false },
  { id: 10, name: "ESPAÇO FRIO REFRIGERAÇÃO", category: "Refrigeração", desc: "Soluções em climatização com qualidade, eficiência e conforto para seu ambiente.", logo: "https://i.postimg.cc/7ZwfTgVM/LOGO.png", wa: "5585997403872", ig: "https://wa.me/5585997403872", featured: true }
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
  "https://i.postimg.cc/zDHJ5cCD/CURSO.png",
  "https://i.postimg.cc/qMbRP4YH/flyer-minha-divulgacao-c-zap-grupos.png",
  "https://i.postimg.cc/d0MqF19v/banner-mer-marco.jpg",
  "https://i.postimg.cc/MKvxjRsD/site.png",
  "https://i.postimg.cc/0j4TCWtL/supermercados.png",
  "https://i.postimg.cc/jjTGvJXY/banner-novo-comerciais-video.png",
  "https://i.postimg.cc/W3nCr9nF/Chat-GPT-Image-12-de-mar-de-2026-06-55-05.png",
  "https://i.postimg.cc/fbdt577W/gih-cred-2.png",
  "https://i.postimg.cc/3wQNLBMN/b-CRIE-ALGO-MAIS-OU.jpg",
  "https://i.postimg.cc/XYJ9KyDZ/gih-cred-1.png",
  "https://i.postimg.cc/CLX8Swgp/ok.png",
  "https://i.postimg.cc/fyyVkZjF/BANNER.png"
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
const NOTIFICATION_ACTIONS = ["acabou de procurar internet fibra", "visitou uma pizzaria", "pediu orçamento de oficina", "procurou salão de beleza", "visualizou uma empresa", "procurou restaurante", "buscou serviços na plataforma"];

const DEFAULT_DATA = {
  theme: { primary: "#fbbf24", bg: "#000000", text: "#ffffff", textDim: "#a0a0a0" },
  siteInfo: {
    name: "Minha", suffix: "Divulgação", description: "A maior vitrine digital para o seu negócio na Grande Fortaleza.",
    cnpj: "62.133.196/0001-40", phone: "85 99290-8713", address: "Fortaleza - Ceará - Brasil",
    radioLink: "https://stream.zeno.fm/gsstolze3mjtv",
    social: {
      fb: "https://www.facebook.com/profile.php?id=61586484977147",
      ig: "https://www.instagram.com/minhadivulgacaooficial/",
      wa: "https://wa.me/5585992908713"
    }
  },
  sections: {
    categories: { title: "ENCONTRE EMPRESAS E SERVIÇOS EM FORTALEZA", desc: "Escolha uma categoria e veja empresas anunciando na plataforma." },
    tv: { tag: "TV Digital", title: "COMERCIAIS" },
    companies: { tag: "Atendimento via WhatsApp", title: "FALE DIRETO COM A EMPRESA", desc: "Deslize para ver todas as empresas ou escolha uma categoria acima." },
    flyers: { tag: "Promoções em Destaque" },
    howTo: { tag: "Como Anunciar", title: "DIVULGUE SEU NEGÓCIO" },
    benefits: { tag: "Benefícios", title: "SEU ANÚNCIO APARECE EM VÁRIOS LUGARES" },
    segments: { tag: "Oportunidades", title: "SEGMENTOS DISPONÍVEIS", highlight: "Empresas já estão ocupando categorias na plataforma.", callToAction: "Garanta exclusividade no seu segmento antes que outro concorrente ocupe." }
  },
  pricing: {
    badge: "Exclusividade por categoria", title: "Plano Divulgação Fortaleza", price: "147", period: "/mês",
    features: [
      "Comercial exibido na TV Online da plataforma 24h por dia",
      "Divulgação contínua na Rádio Digital da plataforma",
      "Card empresarial em destaque na página principal",
      "Presença nas buscas internas do guia digital",
      "Botão de contato direto via WhatsApp",
      "Distribuição automática em canais digitais e redes parceiras",
      "Produção do vídeo e áudio comercial inclusos"
    ],
    cta: "QUERO DIVULGAR AGORA", waLink: "https://wa.me/5585992908713"
  },
  segmentsList: [
    { name: "Internet", status: "Disponível" }, { name: "Pizzaria", status: "Disponível" }, { name: "Oficina", status: "Ocupado" },
    { name: "Salão de Beleza", status: "Disponível" }, { name: "Farmácia", status: "Disponível" }, { name: "Pet Shop", status: "Disponível" }, { name: "Financeiro", status: "Ocupado" }
  ],
  chatKeywords: {
    'mercado': 'Supermercado', 'comida': 'Restaurante & bar', 'mecanico': 'Oficina', 'carro': 'Oficina',
    'saude': 'Saúde', 'dinheiro': 'Financeiro', 'credito': 'Financeiro', 'lazer': 'Lazer',
    'propaganda': 'Publicidade', 'ar condicionado': 'Refrigeração', 'geladeira': 'Refrigeração'
  },
  notificationsData: {
    names: NOTIFICATION_NAMES,
    actions: NOTIFICATION_ACTIONS
  },
  companies: COMPANIES_DATA,
  videos: VIDEOS,
  flyers: FLYERS,
  testimonials: TESTIMONIALS,
  categories: CATEGORIES
};

// --- Helper Functions ---
const normalize = (str: string) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

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
  flyers: string[];
  testimonials: any[];
  categories: any[];
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
  const [user, setUser] = useState<{ uid: string; email: string | null; username: string; city: string; isAdmin?: boolean } | null>(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '', city: '' });
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [universalConfig, setUniversalConfig] = useState({ radioLink: '' });
  const [allUsers, setAllUsers] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const [appData, setAppData] = useState<AppData | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);

  // --- Initial Firebase Data Load ---
  useEffect(() => {
    if (tenantId && tenantId !== 'login') {
      const fetchCity = async () => {
        setIsLoading(true);
        try {
          const snap = await getDoc(doc(db, 'tenants', tenantId.toLowerCase()));
          if (snap.exists()) {
            const tData = snap.data();
            setAppData(tData.data || DEFAULT_DATA);
            setIsBlocked(tData.isBlocked || false);
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
  }, [tenantId]);

  useEffect(() => {
    // Load persisted tenant session if exists
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
              if (!tenantId || tenantId === 'login') {
                navigate('/' + savedId);
              }
            }
          }
        } catch (e) {
          console.error("Session restoration failed:", e);
        }
      } else if (!tenantId) {
        navigate('/login');
      }
    };
    loadSession();

    // Listen for config changes
    const unsubConfig = onSnapshot(doc(db, 'settings', 'universal'), (snap) => {
      if (snap.exists()) setUniversalConfig(snap.data() as any);
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
        const tenantSnap = await getDoc(doc(db, 'tenants', firebaseUser.uid));
        
        if (tenantSnap.exists()) {
          const tenantData = tenantSnap.data();
          setUser({ 
            uid: firebaseUser.uid, 
            email: firebaseUser.email,
            username: firebaseUser.uid, 
            city: tenantData.city, 
            isAdmin: tenantData.isAdmin 
          });
          setAppData(tenantData.data || DEFAULT_DATA);
          setIsBlocked(tenantData.isBlocked || false);
          
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
            // Unrecognized user
            await signOut(auth);
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

    return () => { unsubAuth(); unsubConfig(); };
  }, []);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const id = loginForm.username.toLowerCase().trim();
      
      if (authMode === 'register') {
        if (!id || !loginForm.password || !loginForm.city) {
          alert("Preencha todos os campos.");
          return;
        }
        
        const snap = await getDoc(doc(db, 'tenants', id));
        if (snap.exists()) {
          alert("Este ID já está em uso. Escolha outro.");
          return;
        }

        await setDoc(doc(db, 'tenants', id), {
          city: loginForm.city,
          password: loginForm.password,
          data: DEFAULT_DATA,
          isAdmin: false
        });

        localStorage.setItem('tenantId', id);
        localStorage.setItem('tenantPass', loginForm.password);
        
        setUser({ uid: id, email: null, username: id, city: loginForm.city, isAdmin: false });
        setAppData(DEFAULT_DATA);
        alert("Portal criado com sucesso!");
        setIsDevAreaOpen(true);
        navigate('/' + id);
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
          setIsDevAreaOpen(true);
          navigate('/' + id);
          return;
        }
      }
      
      alert("Credenciais inválidas ou inquilino não encontrado.");
    } catch (e) {
      console.error(e);
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
      await updateDoc(doc(db, 'tenants', user.uid), {
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

  const videoRef = useRef<HTMLVideoElement>(null);

  // --- Helper to update specific data ---
  const updateData = (key: keyof typeof appData, value: any) => {
    setAppData(prev => ({ ...prev, [key]: value }));
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
    }, 5000);
  }, [appData]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      addNotification();
      const scheduleNext = () => {
        const delay = Math.floor(Math.random() * 7000) + 8000;
        setTimeout(() => {
          addNotification();
          scheduleNext();
        }, delay);
      };
      scheduleNext();
    }, 3000);
    return () => clearTimeout(timeout);
  }, [addNotification]);

  // --- Video Logic ---
  const handleVideoEnd = () => {
    if (!appData?.videos) return;
    setCurrentVideoIndex(prev => (prev + 1) % appData.videos.length);
  };

  useEffect(() => {
    if (videoRef.current && appData?.videos) {
      videoRef.current.src = appData.videos[currentVideoIndex];
      videoRef.current.play().catch(() => {});
    }
  }, [currentVideoIndex, appData]);

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
        if (query.includes(key)) {
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

  const filteredCompanies = (selectedCategory && appData)
    ? appData.companies.filter(c => c.category === selectedCategory)
    : (appData?.companies || []);

  if (user?.isAdmin && (!tenantId || tenantId.toLowerCase() === 'master')) {
    return (
      <div style={{ background: '#000', minHeight: '100vh', color: '#fff', fontFamily: 'Inter', padding: '40px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <h1 style={{ color: '#ffffff', fontWeight: 900 }}>ADMIN MASTER PORTAL</h1>
            <button className="dev-btn dev-btn-secondary" onClick={logout}>Sair</button>
          </div>

          <div className="dev-item-card" style={{ marginBottom: '40px' }}>
            <h3 style={{ marginBottom: '20px' }}>Configurações Globais (Todos os Sites)</h3>
            <div className="dev-form-group">
              <label>Link da Rádio (Universal)</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  className="dev-input" 
                  value={universalConfig.radioLink} 
                  onChange={e => setUniversalConfig({ radioLink: e.target.value })}
                />
                <button 
                  className="dev-btn dev-btn-primary" 
                  onClick={async () => {
                   try {
                     await setDoc(doc(db, 'settings', 'universal'), universalConfig);
                     alert("Configuração salva para todos!");
                   } catch(e) {
                     alert("Sem permissão para alterar configurações globais.");
                   }
                  }}
                >
                  Atualizar
                </button>
              </div>
            </div>
          </div>

          <h3 style={{ marginBottom: '20px' }}>GERENCIAR LOJAS (CIDADES)</h3>
          <div style={{ display: 'grid', gap: '15px' }}>
            {allUsers && Object.entries(allUsers).map(([uname, udata]: [string, any]) => (
              <div key={uname} className="dev-item-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                   <div style={{ width: '40px', height: '40px', background: '#222', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🏙️</div>
                   <div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{udata.city}</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>ID: {uname} | Senha: {udata.password}</div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                       <span style={{ fontSize: '10px', background: udata.data ? 'rgba(37, 211, 102, 0.1)' : 'rgba(255, 140, 0, 0.1)', color: udata.data ? '#25D366' : '#FF8C00', padding: '2px 8px', borderRadius: '4px', border: '1px solid currentColor' }}>
                         {udata.data ? 'ATIVO' : 'AGUARDANDO'}
                       </span>
                    </div>
                   </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      className="dev-btn" 
                      style={{ background: udata.isBlocked ? '#ff4444' : '#333', borderColor: udata.isBlocked ? '#ff4444' : '#444' }}
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
                     style={{ background: '#25D366', borderColor: '#25D366', color: '#fff' }}
                     onClick={() => navigate('/' + uname)}
                     title="Ver e Editar Portal"
                   >
                     👁️
                   </button>
                   <button 
                     className="dev-btn" 
                     style={{ background: '#333', borderColor: '#444' }}
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
                     style={{ background: 'rgba(251, 191, 36, 0.1)', borderColor: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24' }}
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
                    isAdmin: false 
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
      <div style={{ background: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'Inter' }}>
        <div style={{ width: '100%', maxWidth: '400px', padding: '40px', background: '#111', borderRadius: '24px', border: '1px solid #222' }}>
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
                placeholder="Ex: Fortaleza"
              />
            </div>
          )}

          <div className="dev-form-group">
            <label>{authMode === 'login' ? 'Usuário (Cidade)' : 'ID de Acesso (sem espaços)'}</label>
            <input 
              type="text" 
              className="dev-input" 
              value={loginForm.username} 
              onChange={e => setLoginForm({...loginForm, username: e.target.value})} 
              placeholder={authMode === 'login' ? 'ex: fortaleza' : 'fortaleza'}
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
            className="dev-btn" 
            style={{ width: '100%', background: 'transparent', border: '1px solid #333', color: '#888' }}
            onClick={loginWithGoogle}
          >
            🔑 Entrar como Admin Master
          </button>
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
        <div style={{ fontSize: '5rem', marginBottom: '20px' }}>🔒</div>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '10px', color: '#ff4444' }}>SERVIÇO SUSPENSO</h2>
        <p style={{ color: '#888', maxWidth: '500px', fontSize: '1.1rem', marginBottom: '40px', lineHeight: 1.6 }}>
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
        '--primary': appData.theme.primary,
        '--bg': appData.theme.bg,
        '--text': appData.theme.text,
        '--text-dim': appData.theme.textDim
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

      {(user?.isAdmin || (user?.uid && user.uid === tenantId)) && (
        <button 
          onClick={() => setIsDevAreaOpen(true)}
          className="dev-floating-btn"
          title="Área do Desenvolvedor"
        >
          🛠️
        </button>
      )}

      {/* Navigation */}
      <nav>
        <div className="container">
          <div className="nav-content">
            <a href="#" className="logo" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>{appData.siteInfo.name}<span style={{ color: '#ffffff' }}>{appData.siteInfo.suffix}</span></a>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
               {user && (
                 <button 
                   onClick={logout}
                   style={{ 
                     padding: '8px 15px', 
                     fontSize: '0.75rem', 
                     background: '#ff4444', 
                     color: '#fff',
                     border: 'none', 
                     borderRadius: '8px',
                     fontWeight: 800,
                     cursor: 'pointer',
                     display: 'flex',
                     alignItems: 'center',
                     gap: '5px'
                   }}
                 >
                   🚪 SAIR
                 </button>
               )}
               <button onClick={() => scrollToSection('anuncie')} className="btn-view" style={{ padding: '8px 20px', fontSize: '0.8rem', background: 'var(--primary)', border: 'none', cursor: 'pointer' }}>Anunciar</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Categories Section */}
      <section className="container" style={{ paddingTop: '140px' }}>
        <div className="section-header">
          <h2 className="section-title">{appData.sections.categories.title}</h2>
          <p style={{ color: 'var(--text-dim)', marginTop: '10px' }}>{appData.sections.categories.desc}</p>
        </div>
        <div className="home-categories-grid">
          {appData.categories.map(cat => (
            <div 
              key={cat.name} 
              className={`home-category-card cursor-pointer ${selectedCategory === cat.name ? 'active' : ''}`}
              onClick={() => setSelectedCategory(prev => prev === cat.name ? null : cat.name)}
            >
              <div className="home-category-icon">{cat.icon}</div>
              <span className="home-category-name">{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* TV Section */}
      <section className="section-comerciais">
        <div className="section-header">
          <span className="section-tag">{appData.sections.tv.tag}</span>
          <h2 className="section-title">{appData.sections.tv.title}</h2>
          <div className="visitors-counter">
            <div className="online-dot"></div>
            <span>{visitorCount.toLocaleString()}</span>
            <span>Visitantes Online</span>
          </div>
        </div>
        <div id="tv-comerciais">
          <div className="live-badge"><div className="live-dot"></div>AO VIVO</div>
          <AnimatePresence>
            {isMuted && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="tv-overlay" 
                onClick={() => setIsMuted(false)}
              >
                <div className="tv-overlay-icon">🔇</div>
                <div className="tv-overlay-text">Clique para Ativar o Som</div>
              </motion.div>
            )}
          </AnimatePresence>
          <video 
            ref={videoRef}
            autoPlay 
            playsInline 
            muted={isMuted}
            onEnded={handleVideoEnd}
          />
          <button className="tv-mute-btn" onClick={() => setIsMuted(!isMuted)}>
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>
      </section>

      {/* Companies Section */}
      <section id="empresas-whatsapp">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">{appData.sections.companies.tag}</span>
            <h2 className="section-title">{appData.sections.companies.title}</h2>
            <p style={{ color: 'var(--text-dim)', marginTop: '10px', fontWeight: 500 }}>{appData.sections.companies.desc}</p>
          </div>
        </div>
        <div className="carousel-wrapper">
          <div className="carousel-track">
            <div className="track-copy">
              {filteredCompanies.map(company => (
                <div key={company.id} className="company-card">
                  <div className={`card-inner ${company.featured ? 'featured-company' : ''}`}>
                    {company.featured && <div className="featured-badge">Destaque</div>}
                    <div className="logo-wrapper">
                      <img src={company.logo} alt={company.name} className="company-logo" referrerPolicy="no-referrer" />
                    </div>
                    <h3 className="company-name">{company.name}</h3>
                    <span className="company-category">{company.category}</span>
                    <p className="company-desc">{company.desc}</p>
                    <div className="card-actions">
                      <a href={`https://wa.me/${company.wa}`} target="_blank" className="wa-button">WhatsApp</a>
                      <a href={company.ig} target="_blank" className="btn-view">Ver Empresa</a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="track-copy duplicate">
              {filteredCompanies.map(company => (
                <div key={`${company.id}-dup`} className="company-card">
                  <div className={`card-inner ${company.featured ? 'featured-company' : ''}`}>
                    {company.featured && <div className="featured-badge">Destaque</div>}
                    <div className="logo-wrapper">
                      <img src={company.logo} alt={company.name} className="company-logo" referrerPolicy="no-referrer" />
                    </div>
                    <h3 className="company-name">{company.name}</h3>
                    <span className="company-category">{company.category}</span>
                    <p className="company-desc">{company.desc}</p>
                    <div className="card-actions">
                      <a href={`https://wa.me/${company.wa}`} target="_blank" className="wa-button">WhatsApp</a>
                      <a href={company.ig} target="_blank" className="btn-view">Ver Empresa</a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Logo Carousel */}
      <section style={{ background: '#080808' }}>
        <div className="container"><div className="section-header"><span className="section-tag">{appData.sections.companies.tag}</span></div></div>
        <div className="carousel-wrapper">
          <div className="carousel-track">
            <div className="track-copy">
              {appData.companies.map(c => (
                <div key={c.id} className="logo-item">
                  <img src={c.logo} alt={c.name} className="carousel-logo" referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
            <div className="track-copy duplicate">
              {appData.companies.map(c => (
                <div key={`${c.id}-dup`} className="logo-item">
                  <img src={c.logo} alt={c.name} className="carousel-logo" referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Audio Player Bar */}
      <div className="player-bar">
        <div className="container">
          <div className="player-flex">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ color: 'var(--primary)', fontWeight: 900, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Rádio Ao Vivo</span>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>Programação Exclusiva 24h</span>
            </div>
            <div className="vu-container">
              <div className="vu-meter">
                {[0.1, 0.3, 0.2, 0.5, 0.4, 0.6].map((delay, i) => (
                  <div key={i} className="vu-bar" style={{ animationDelay: `${delay}s` }}></div>
                ))}
              </div>
              <audio key={universalConfig.radioLink || appData.siteInfo.radioLink} controls style={{ height: '35px', filter: 'invert(1) brightness(1.5)', opacity: 0.8 }}>
                <source src={universalConfig.radioLink || appData.siteInfo.radioLink} type="audio/mpeg" />
              </audio>
            </div>
          </div>
        </div>
      </div>

      {/* Flyers Carousel */}
      <section>
        <div className="container"><div className="section-header"><span className="section-tag">{appData.sections.flyers.tag}</span></div></div>
        <div className="carousel-wrapper">
          <div className="carousel-track" style={{ animationDuration: '180s' }}>
            <div className="track-copy">
              {appData.flyers.map((src, i) => (
                <div key={i} className="flyer-item">
                  <div className="flyer-inner">
                    <img src={src} alt="Flyer" className="flyer-img" referrerPolicy="no-referrer" />
                  </div>
                </div>
              ))}
            </div>
            <div className="track-copy duplicate">
              {appData.flyers.map((src, i) => (
                <div key={`${i}-dup`} className="flyer-item">
                  <div className="flyer-inner">
                    <img src={src} alt="Flyer" className="flyer-img" referrerPolicy="no-referrer" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How to Advertise */}
      <section className="container" id="anuncie">
        <div className="how-to-section">
          <div className="section-header">
            <span className="section-tag">{appData.sections.howTo.tag}</span>
            <h2 className="section-title">{appData.sections.howTo.title}</h2>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <p className="step-text">Envie seus dados pelo WhatsApp</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <p className="step-text">Sua empresa é divulgada no mesmo dia em nossa plataforma e redes sociais</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <p className="step-text">Divulgação 24 horas, 7 dias por semana em nossa plataforma</p>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '60px' }}>
            <a href="https://wa.me/5585992908713" target="_blank" className="cta-button">ANUNCIAR AGORA</a>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container" style={{ background: 'rgba(255,255,255,0.02)', padding: '100px 0' }}>
        <div className="section-header">
          <span className="section-tag">{appData.sections.benefits.tag}</span>
          <h2 className="section-title">{appData.sections.benefits.title}</h2>
        </div>
        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon">📺</div>
            <h4 className="benefit-title">TV Online 24h</h4>
            <p className="benefit-desc">Sua marca em exibição contínua na nossa TV de comerciais.</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">📻</div>
            <h4 className="benefit-title">Rádio Online</h4>
            <p className="benefit-desc">Divulgação em áudio na rádio oficial da plataforma.</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">📱</div>
            <h4 className="benefit-title">Card no Site</h4>
            <p className="benefit-desc">Página exclusiva com todas as informações da sua empresa.</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">🔍</div>
            <h4 className="benefit-title">Buscas Internas</h4>
            <p className="benefit-desc">Sua empresa encontrada facilmente pelos visitantes.</p>
          </div>
        </div>
      </section>

      {/* Segments */}
      <section className="container">
        <div className="section-header">
          <span className="section-tag">{appData.sections.segments.tag}</span>
          <h2 className="section-title" style={{ marginBottom: '20px' }}>{appData.sections.segments.title}</h2>
          <div style={{ maxWidth: '700px', margin: '0 auto 40px' }}>
            <p style={{ color: '#fbbf24', opacity: 0.8, fontWeight: 700, fontSize: '1.1rem', marginBottom: '10px' }}>{appData.sections.segments.highlight}</p>
            <p style={{ color: '#fbbf24', fontWeight: 900, fontSize: '1.3rem', textTransform: 'uppercase' }}>{appData.sections.segments.callToAction}</p>
          </div>
        </div>
        <div className="segmentos-grid">
          {appData.segmentsList.map(seg => (
            <div key={seg.name} className="segmento-card">
              <div className="segmento-info">
                <h4>{seg.name}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{seg.status === "Ocupado" ? "Empresa oficial da categoria" : "Vaga em aberto"}</p>
              </div>
              <div className={`status-badge ${seg.status === "Ocupado" ? "status-ocupado" : "status-disponivel"}`}>
                {seg.status}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="container" id="anuncie">
        <div className="pricing-card">
          <div className="pricing-badge">{appData.pricing.badge}</div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 900 }}>{appData.pricing.title}</h3>
          <div className="price-tag">R$ {appData.pricing.price}<span>{appData.pricing.period}</span></div>
          <ul className="pricing-list">
            {appData.pricing.features.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
          <a href={appData.pricing.waLink} target="_blank" className="cta-button" style={{ width: '100%' }}>{appData.pricing.cta}</a>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ background: '#080808' }}>
        <div className="container"><div className="section-header"><span className="section-tag">Depoimentos</span><h2 className="section-title" style={{ marginTop: '10px' }}>O QUE DIZEM NOSSOS PARCEIROS</h2></div></div>
        <div className="carousel-wrapper">
          <div className="carousel-track" style={{ animationDuration: '120s' }}>
            <div className="track-copy">
              {appData.testimonials.map((t, i) => (
                <div key={i} className="testimonial-card">
                  <p className="testimonial-content">"{t.content}"</p>
                  <div className="testimonial-author">
                    <img src={t.avatar} alt={t.author} className="author-avatar" referrerPolicy="no-referrer" />
                    <div className="author-info">
                      <h5>{t.author}</h5>
                      <p>{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="track-copy duplicate">
              {appData.testimonials.map((t, i) => (
                <div key={`${i}-dup`} className="testimonial-card">
                  <p className="testimonial-content">"{t.content}"</p>
                  <div className="testimonial-author">
                    <img src={t.avatar} alt={t.author} className="author-avatar" referrerPolicy="no-referrer" />
                    <div className="author-info">
                      <h5>{t.author}</h5>
                      <p>{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <h4 style={{ color: 'var(--primary)', fontWeight: 900 }}>{appData.siteInfo.name} {appData.siteInfo.suffix}</h4>
              <p>{appData.siteInfo.description}</p>
              <div className="social-links">
                <a href={appData.siteInfo.social.fb} target="_blank" className="social-icon fb">FB</a>
                <a href={appData.siteInfo.social.ig} target="_blank" className="social-icon ig">IG</a>
                <a href={appData.siteInfo.social.wa} target="_blank" className="social-icon wa">WA</a>
              </div>
              <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                {(user?.isAdmin || (user?.uid && user.uid === tenantId)) && (
                  <button 
                    onClick={() => setIsDevAreaOpen(true)}
                    style={{ 
                      background: 'none', 
                      border: '1px solid #333', 
                      color: '#666', 
                      padding: '5px 10px', 
                      borderRadius: '5px', 
                      fontSize: '0.7rem',
                      cursor: 'pointer'
                    }}
                  >
                    ⚙️ Painel de Gestor
                  </button>
                )}
              </div>
            </div>
            <div className="footer-col">
              <h4>CONTATO</h4>
              <p>{appData.siteInfo.phone}</p>
              <p>{appData.siteInfo.address}</p>
            </div>
            <div className="footer-col">
              <h4>LEGAL</h4>
              <p>CNPJ: {appData.siteInfo.cnpj}</p>
            </div>
          </div>
          <p style={{ textAlign: 'center', marginTop: '40px', color: '#444', fontSize: '0.8rem' }}>&copy; 2026 Desenvolvido por Bossa Infor. Todos os direitos reservados.</p>
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
                {['geral', 'empresas', 'tv', 'flyers', 'preços', 'segmentos', 'chat'].map(tab => (
                  <button 
                    key={tab} 
                    className={`dev-tab ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab.toUpperCase()}
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
                        <input type="color" className="dev-input" value={appData.theme.primary} onChange={(e) => updateData('theme', { ...appData.theme, primary: e.target.value })} />
                      </div>
                      <div className="dev-form-group">
                        <label>Cor de Fundo</label>
                        <input type="color" className="dev-input" value={appData.theme.bg} onChange={(e) => updateData('theme', { ...appData.theme, bg: e.target.value })} />
                      </div>
                    </div>
                    <div className="dev-grid-2">
                      <div className="dev-form-group">
                        <label>Nome do Site</label>
                        <input type="text" className="dev-input" value={appData.siteInfo.name} onChange={(e) => updateData('siteInfo', { ...appData.siteInfo, name: e.target.value })} />
                      </div>
                      <div className="dev-form-group">
                        <label>Sufixo (ex: Divulgação)</label>
                        <input type="text" className="dev-input" value={appData.siteInfo.suffix} onChange={(e) => updateData('siteInfo', { ...appData.siteInfo, suffix: e.target.value })} />
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
                      <textarea className="dev-input" value={appData.siteInfo.description} onChange={(e) => updateData('siteInfo', { ...appData.siteInfo, description: e.target.value })} />
                    </div>
                    <div className="dev-form-group">
                      <label>Link da Rádio (Universal - Apenas Visualização)</label>
                      <input type="text" className="dev-input" value={universalConfig.radioLink} readOnly style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                      <p style={{ fontSize: '10px', color: 'var(--primary)' }}>A rádio é universal e controlada pelo administrador master.</p>
                    </div>
                    <div className="dev-grid-2">
                      <div className="dev-form-group">
                        <label>WhatsApp (Link completo)</label>
                        <input type="text" className="dev-input" value={appData.siteInfo.social.wa} onChange={(e) => updateData('siteInfo', { ...appData.siteInfo, social: { ...appData.siteInfo.social, wa: e.target.value } })} />
                      </div>
                      <div className="dev-form-group">
                        <label>Instagram</label>
                        <input type="text" className="dev-input" value={appData.siteInfo.social.ig} onChange={(e) => updateData('siteInfo', { ...appData.siteInfo, social: { ...appData.siteInfo.social, ig: e.target.value } })} />
                      </div>
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
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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
                                      const newList = [...appData.companies];
                                      newList[idx].name = e.target.value;
                                      updateData('companies', newList);
                                    }} />
                                  </div>
                                  <div className="dev-form-group">
                                    <label>Categoria</label>
                                    <input type="text" className="dev-input" value={c.category} onChange={(e) => {
                                      const newList = [...appData.companies];
                                      newList[idx].category = e.target.value;
                                      updateData('companies', newList);
                                    }} />
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
                                    <label>WhatsApp (Apenas números)</label>
                                    <input type="text" className="dev-input" value={c.wa} onChange={(e) => {
                                      const newList = [...appData.companies];
                                      newList[idx].wa = e.target.value;
                                      updateData('companies', newList);
                                    }} />
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
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                    <button className="dev-add-btn" onClick={() => {
                      const newIdx = appData.companies.length;
                      updateData('companies', [...appData.companies, { id: Date.now(), name: "Nova Empresa", category: "Geral", desc: "Descrição aqui", logo: "", wa: "", ig: "#", featured: false }]);
                      setOpenCompanyIndex(newIdx);
                    }}>+ Adicionar Empresa</button>
                  </div>
                )}

                {activeTab === 'tv' && (
                  <div className="dev-forms-container">
                    <h3>Vídeos da TV (Links MP4)</h3>
                    {appData.videos.map((v, idx) => (
                      <div key={idx} className="dev-item-card">
                        <button className="dev-remove-btn" onClick={() => updateData('videos', appData.videos.filter((_, i) => i !== idx))}>✕</button>
                        <div className="dev-form-group">
                          <div className="dev-label-row">
                            <label>Link do Vídeo MP4</label>
                            <a href="https://archive.org/" target="_blank" rel="noreferrer" className="dev-helper-link">
                              🎥 Abrir Archive.org
                            </a>
                          </div>
                          <input type="text" className="dev-input" value={v} onChange={(e) => {
                            const newList = [...appData.videos];
                            newList[idx] = e.target.value;
                            updateData('videos', newList);
                          }} placeholder="Cole o link direto .mp4 aqui" />
                          {v && (
                            <div className="dev-video-preview">
                              <video src={v} controls style={{ width: '100%', height: '100%', borderRadius: '8px' }} muted />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    <button className="dev-add-btn" onClick={() => updateData('videos', [...appData.videos, ""])}>+ Adicionar Vídeo</button>
                  </div>
                )}

                {activeTab === 'flyers' && (
                  <div className="dev-forms-container">
                    <h3>Flyers de Promoção (Links de Imagem)</h3>
                    {appData.flyers.map((f, idx) => (
                      <div key={idx} className="dev-item-card">
                        <button className="dev-remove-btn" onClick={() => updateData('flyers', appData.flyers.filter((_, i) => i !== idx))}>✕</button>
                        <div className="dev-form-group">
                          <div className="dev-label-row">
                            <label>Link da Imagem Flyer</label>
                            <a href="https://postimages.org/" target="_blank" rel="noreferrer" className="dev-helper-link">
                              📸 Abrir PostImages
                            </a>
                          </div>
                          <input type="text" className="dev-input" value={f} onChange={(e) => {
                            const newList = [...appData.flyers];
                            newList[idx] = e.target.value;
                            updateData('flyers', newList);
                          }} placeholder="Cole o link direto .jpg ou .png aqui" />
                          {f && <img src={f} className="dev-img-preview" alt="Preview do Flyer" referrerPolicy="no-referrer" />}
                        </div>
                      </div>
                    ))}
                    <button className="dev-add-btn" onClick={() => updateData('flyers', [...appData.flyers, ""])}>+ Adicionar Flyer</button>
                  </div>
                )}

                {activeTab === 'preços' && (
                  <div className="dev-forms-container">
                    <h3>Plano e Preços</h3>
                    <div className="dev-form-group">
                      <label>Título do Plano</label>
                      <input type="text" className="dev-input" value={appData.pricing.title} onChange={(e) => updateData('pricing', { ...appData.pricing, title: e.target.value })} />
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
                    <h3>Palavras-chave do Chat</h3>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginBottom: '20px' }}>
                      Ex: Se o cliente digitar "mercado", o chat busca por "Supermercado".
                    </p>
                    
                    <div className="dev-item-card" style={{ border: '1px dashed var(--primary)', background: 'rgba(255,0,0,0.05)' }}>
                      <h4 style={{ fontSize: '0.8rem', marginBottom: '10px', color: 'var(--primary)' }}>+ Adicionar Nova Palavra</h4>
                      <div className="dev-grid-2">
                        <div className="dev-form-group">
                          <label>Palavra do Cliente</label>
                          <input type="text" id="new-keyword-key" className="dev-input" placeholder="ex: pizza" />
                        </div>
                        <div className="dev-form-group">
                          <label>Categoria Alvo</label>
                          <input type="text" id="new-keyword-val" className="dev-input" placeholder="ex: Restaurante & bar" />
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
                        Adicionar Palavra
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
                        <a href={`https://wa.me/${c.wa}`} target="_blank" className="chat-result-wa">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        </a>
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
    </div>
  );
}
