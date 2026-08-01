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
    desc: "Direcionamos dezenas de novos clientes prontos para comprar direto para o seu WhatsApp comercial. Sem complicação: você só precisa atender e fechar a venda!",
    icon: Users,
    color: "from-blue-500/20 to-cyan-500/20 text-cyan-400"
  },
  {
    title: "Destaque Premium Exclusivo",
    desc: "Sua marca posicionada no topo da sua cidade, garantindo exclusividade absoluta no seu segmento. Bloqueie seus concorrentes e seja a escolha número 1.",
    icon: Target,
    color: "from-purple-500/20 to-pink-500/20 text-pink-400"
  },
  {
    title: "Sua Vitrine Virtual Interativa",
    desc: "Seu catálogo ou cardápio online extremamente leve e rápido, criado de forma simples para qualquer cliente navegar, escolher e pedir sem complicação.",
    icon: Store,
    color: "from-amber-500/20 to-red-500/20 text-amber-400"
  },
  {
    title: "Fidelização e Retorno Rápido",
    desc: "Facilitamos para que o cliente salve o seu contato e crie o hábito de comprar diretamente com você, gerando faturamento constante e previsível.",
    icon: Heart,
    color: "from-green-500/20 to-emerald-500/20 text-emerald-400"
  },
  {
    title: "Sua Marca na Rádio do Portal",
    desc: "Gravamos um Spot de áudio profissional com locutor de estúdio para veicular a propaganda da sua empresa na nossa rádio digital conectada 24h por dia.",
    icon: Radio,
    color: "from-orange-500/20 to-yellow-500/20 text-orange-400"
  },
  {
    title: "Exposição Infinita na TV Online",
    desc: "Exibição contínua do seu comercial no telão de alta audiência do portal principal. Quem é visto é lembrado e vende muito mais todos os dias.",
    icon: Tv,
    color: "from-red-500/20 to-orange-500/20 text-red-500"
  },
  {
    title: "Clientes Prontos das Redes",
    desc: "Atraímos e filtramos o público qualificado que já está buscando os seus serviços ou produtos nas redes e enviamos direto para a sua vitrine virtual.",
    icon: TrendingUp,
    color: "from-indigo-500/20 to-violet-500/20 text-indigo-400"
  },
  {
    title: "Divulgação Massiva nas Redes",
    desc: "Sua marca recomendada e impulsionada de forma estratégica em todas as nossas mídias e grupos parceiros locais, gerando autoridade máxima para você.",
    icon: Sparkles,
    color: "from-rose-500/20 to-pink-500/20 text-rose-400"
  }
];

const COMPANIES_DATA = [
  { id: 1, name: "Bossa Infor", category: "Publicidade", desc: "Soluções em Áudio & Vídeo", logo: "https://i.postimg.cc/Gpykbbz5/nova_logo_bossa_infor_png.png", wa: "5585992862177", ig: "https://www.instagram.com/bossainfor/", website: "", featured: true },
  { id: 2, name: "Belém Rolamentos", category: "Oficina", desc: "Manutenção preventiva e corretiva.", logo: "https://i.postimg.cc/Y2mTTF1h/1.png", wa: "5591980342025", ig: "https://cutt.ly/belemrolamentoss", website: "", featured: true },
  { id: 3, name: "Assai Atacadista", category: "Supermercado", desc: "Preço Baixo Todo dia", logo: "https://i.postimg.cc/LX4fh1rh/assai.jpg", wa: "558535334476", ig: "https://www.assai.com.br/", website: "", featured: true },
  { id: 4, name: "Carneiro do Ordones", category: "Restaurante & bar", desc: "Restaurante Pioneiro no Brasil", logo: "https://i.postimg.cc/C1KwKkhv/images.jpg", wa: "558532815959", ig: "https://www.instagram.com/carneirodoordonesoriginal/", website: "", featured: true },
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

const BRAZIL_STATES = [
  { uf: "AC", name: "Acre" },
  { uf: "AL", name: "Alagoas" },
  { uf: "AP", name: "Amapá" },
  { uf: "AM", name: "Amazonas" },
  { uf: "BA", name: "Bahia" },
  { uf: "CE", name: "Ceará" },
  { uf: "DF", name: "Distrito Federal" },
  { uf: "ES", name: "Espírito Santo" },
  { uf: "GO", name: "Goiás" },
  { uf: "MA", name: "Maranhão" },
  { uf: "MT", name: "Mato Grosso" },
  { uf: "MS", name: "Mato Grosso do Sul" },
  { uf: "MG", name: "Minas Gerais" },
  { uf: "PA", name: "Pará" },
  { uf: "PB", name: "Paraíba" },
  { uf: "PR", name: "Paraná" },
  { uf: "PE", name: "Pernambuco" },
  { uf: "PI", name: "Piauí" },
  { uf: "RJ", name: "Rio de Janeiro" },
  { uf: "RN", name: "Rio Grande do Norte" },
  { uf: "RS", name: "Rio Grande do Sul" },
  { uf: "RO", name: "Rondônia" },
  { uf: "RR", name: "Roraima" },
  { uf: "SC", name: "Santa Catarina" },
  { uf: "SP", name: "São Paulo" },
  { uf: "SE", name: "Sergipe" },
  { uf: "TO", name: "Tocantins" }
];

const CATEGORIES = [
  { name: "Restaurantes & Bares", icon: "🍽️" },
  { name: "Pizzarias", icon: "🍕" },
  { name: "Hamburguerias & Lanches", icon: "🍔" },
  { name: "Mercados & Supermercados", icon: "🛒" },
  { name: "Farmácias & Drogarias", icon: "💊" },
  { name: "Padarias & Confeitarias", icon: "🥖" },
  { name: "Salões, Barbearias & Estética", icon: "✂️" },
  { name: "Pet Shops & Veterinárias", icon: "🐾" },
  { name: "Lojas de Roupas & Calçados", icon: "👗" },
  { name: "Oficinas Mecânicas & Auto", icon: "🔧" },
  { name: "Autopeças & Veículos", icon: "🚘" },
  { name: "Lava Jato & Borracharia", icon: "🚙" },
  { name: "Material de Construção & Reformas", icon: "🧱" },
  { name: "Clínicas & Médicos & Dentistas", icon: "🩺" },
  { name: "Academias & Fitness", icon: "🏋️" },
  { name: "Eletrônicos & Assistência de Celular", icon: "📱" },
  { name: "Informática & Tecnologia", icon: "💻" },
  { name: "Sorveterias & Açaí", icon: "🍦" },
  { name: "Marmitarias & Quentinhas", icon: "🍱" },
  { name: "Advogados & Jurídico", icon: "⚖️" },
  { name: "Contabilidade & Finanças", icon: "📊" },
  { name: "Imobiliárias & Corretores", icon: "🏠" },
  { name: "Escolas & Cursos & Treinamentos", icon: "🎓" },
  { name: "Gráficas & Comunicação Visual", icon: "🖨️" },
  { name: "Eletricistas & Encanadores", icon: "⚡" },
  { name: "Ar Condicionado & Refrigeração", icon: "❄️" },
  { name: "Chaveiros & Segurança", icon: "🔑" },
  { name: "Hotéis, Pousadas & Lazer", icon: "🏨" },
  { name: "Eventos, Festas & Buffet", icon: "🎈" },
  { name: "Transporte, Fretes & Mudanças", icon: "🚚" },
  { name: "Perfumarias & Cosméticos", icon: "💄" },
  { name: "Papelarias & Armarinhos", icon: "📚" },
  { name: "Óticas & Joalherias", icon: "👓" },
  { name: "Floriculturas & Jardinagem", icon: "💐" },
  { name: "Publicidade & Marketing", icon: "📢" },
  { name: "Serviços Gerais", icon: "🛠️" }
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
  theme: { primary: "#ff8a00", bg: "#090d16", text: "#ffffff", textDim: "#a0a0a0" },
  siteInfo: {
    name: "Minha", suffix: "Divulgação", description: "Sua maior vitrine digital em todo o Brasil.",
    cnpj: "62.133.196/0001-40", phone: "85 99290-8713", address: "Anúncios em Todo o Brasil",
    radioLink: "https://stream.zeno.fm/gsstolze3mjtv",
    heroTitle: "", heroSub: "", radioTitle: "", radioSub: "", ctaTitle: "", ctaSub: "",
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
    badge: "Exclusividade máxima garantida", title: "Plano Divulgação", price: "49,90", period: "MÊS",
    features: [
      "Comercial exibido na TV Online da plataforma 24h por dia",
      "Divulgação contínua na Rádio Digital da plataforma",
      "Card empresarial em destaque na página principal",
      "Presença nas buscas internas do guia digital",
      "Botão de contato direto via WhatsApp",
      "Catálogo digital on line 24 Horas",
      "Divulgação 24 horas",
      "Link personalizado para venda direta no whatsapp"
    ],
    cta: "QUERO DIVULGAR AGORA", waLink: "https://wa.me/5585992908713"
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
  if (!company) return { position: 1, totalInCat: 1, premiumInCat: 0, rankBadge: '1º Lugar' };

  const catName = (company.category || '').trim().toLowerCase();
  const sameCat = (allCompanies || []).filter(c => c && c.active !== false && (c.category || '').trim().toLowerCase() === catName);
  
  const pool = sameCat.length > 0 ? sameCat : [company];
  const sortedCat = sortCompaniesByPlanAndPriority(pool);

  const compIdStr = String(company.id || '');
  const compNameStr = (company.name || '').toLowerCase().trim();

  const index = sortedCat.findIndex(c => String(c.id || '') === compIdStr || (c.name || '').toLowerCase().trim() === compNameStr);
  const position = index !== -1 ? index + 1 : sortedCat.length;

  const premiumInCat = pool.filter(c => getCompanyPlanType(c) !== 'gratuito').length;

  let rankBadge = `#${position}º Lugar`;
  if (position === 1) rankBadge = '🥇 1º Lugar';
  else if (position === 2) rankBadge = '🥈 2º Lugar';
  else if (position === 3) rankBadge = '🥉 3º Lugar';

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
    { id: 'desc', label: 'Descrição detalhada do negócio', bonus: 10, done: hasDesc, action: 'perfil' },
    { id: 'wa', label: 'WhatsApp comercial para vendas diretas', bonus: 10, done: hasWa, action: 'perfil' },
    { id: 'items', label: 'Cadastrar 3 ou mais produtos / serviços', bonus: 15, done: hasItems, action: 'catalogo' },
    { id: 'hours', label: 'Informar Horário de Funcionamento', bonus: 10, done: hasHours, action: 'perfil' },
    { id: 'video', label: 'Adicionar Vídeo da Empresa', bonus: 10, done: hasVideo, action: 'perfil' },
    { id: 'promo', label: 'Cadastrar Promoções e Descontos', bonus: 10, done: hasPromo, action: 'catalogo' },
    { id: 'verificado', label: 'Ativar Selo de Empresa Verificada', bonus: 10, done: isVerificado, action: 'plano' },
    { id: 'premium', label: 'Ativar Plano Destaque ou Patrocinado (1º Lugar)', bonus: 15, done: isDestaque || isPatrocinado, action: 'plano' },
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
  label = "📷 Escolher do Celular", 
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
            <span className="animate-spin text-xs">⏳</span>
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
  label = "📷 Enviar Foto do Celular"
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
        {isUploading ? "⏳ Enviando..." : label}
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
        author: author.trim() || 'Anônimo',
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
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const [appData, setAppData] = useState<AppData | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showVideos, setShowVideos] = useState(false);
  const [showRadio, setShowRadio] = useState(true);
  const [tenantHasRadioPlayer, setTenantHasRadioPlayer] = useState(false);
  const [hasAffiliateSystem, setHasAffiliateSystem] = useState(false);
  const [hideAdvertiserAuth, setHideAdvertiserAuth] = useState(false);
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
    return localStorage.getItem('isAdPortalOpen') === 'true';
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
    video: ''
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
    const siteDesc = 'Cadastre sua empresa gratuitamente e seja encontrado por milhares de clientes na sua cidade.';
    
    document.title = `${siteName} | Cadastre sua Empresa Grátis & Guia Comercial`;

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
  const [activeMediaIndex, setActiveMediaIndex] = useState<number>(0);
  const [detailModalTab, setDetailModalTab] = useState<'detalhes' | 'avaliacoes'>('detalhes');
  const [itemReviews, setItemReviews] = useState<any[]>([]);
  const [newReviewForm, setNewReviewForm] = useState({ rating: 5, author: '', comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Reset activeMediaIndex when item changes
  useEffect(() => {
    setActiveMediaIndex(0);
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
                if (!loadedData.pricing.price || loadedData.pricing.price === '39,90' || loadedData.pricing.price === '39.90' || loadedData.pricing.price === '147') {
                  loadedData.pricing.price = '49,90';
                }
                if (!loadedData.pricing.title || loadedData.pricing.title === 'Plano Máquina de Clientes VIP') {
                  loadedData.pricing.title = 'Plano Divulgação';
                }
                if (loadedData.pricing.period) {
                  loadedData.pricing.period = loadedData.pricing.period.replace(/^\/+/, '').toUpperCase();
                } else {
                  loadedData.pricing.period = 'MÊS';
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
            setHideAdvertiserAuth(tData.hideAdvertiserAuth === true);
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
              setCustomRadioLink(data.customRadioLink || '');
              setShowVideos(data.showVideos === true);
              setShowRadio(data.showRadio !== false);
              setTenantHasRadioPlayer(data.hasRadioPlayer === true);
              setHideAdvertiserAuth(data.hideAdvertiserAuth === true);
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
            setHideAdvertiserAuth(tenantData.hideAdvertiserAuth === true);
          
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
          setShowRadio(data.showRadio !== false);
          setTenantHasRadioPlayer(data.hasRadioPlayer === true);
          setHideAdvertiserAuth(data.hideAdvertiserAuth === true);
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
  const [selectedStateFilter, setSelectedStateFilter] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'all' | 'loja' | 'servico'>('all');
  const [radioPlaying, setRadioPlaying] = useState(false);
  const [radioVolume, setRadioVolume] = useState(0.8);
  const radioAudioRef = useRef<HTMLAudioElement | null>(null);
  const [activeFlyerIndex, setActiveFlyerIndex] = useState(0);
  const [activeHorizontalBannerIndex, setActiveHorizontalBannerIndex] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        label = '🛠️ Ver Serviços & Orçamento';
      } else if (sType === 'agendamento') {
        label = '📅 Ver Serviços & Agendamento';
      } else if (sType === 'cardapio') {
        label = '🍽️ Ver Cardápio & Pedidos';
      } else {
        label = '🛍️ Ver Catálogo & Preços';
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
        let icon = "💼";
        const lowerName = catName.toLowerCase();
        if (lowerName.includes("refriger") || lowerName.includes("ar condicionado") || lowerName.includes("climatiz")) icon = "❄️";
        else if (lowerName.includes("pizz")) icon = "🍕";
        else if (lowerName.includes("hamburg") || lowerName.includes("lanche")) icon = "🍔";
        else if (lowerName.includes("restaurante") || lowerName.includes("comida") || lowerName.includes("gastronom")) icon = "🍽️";
        else if (lowerName.includes("oficina") || lowerName.includes("mecanica") || lowerName.includes("carro") || lowerName.includes("rolamento")) icon = "🔧";
        else if (lowerName.includes("mercado") || lowerName.includes("supermercado") || lowerName.includes("atacad")) icon = "🏭";
        else if (lowerName.includes("saude") || lowerName.includes("clinica") || lowerName.includes("medico") || lowerName.includes("remedio")) icon = "💊";
        else if (lowerName.includes("finan") || lowerName.includes("dinheiro") || lowerName.includes("banco") || lowerName.includes("cred")) icon = "💸";
        else if (lowerName.includes("publicidade") || lowerName.includes("propaganda") || lowerName.includes("som") || lowerName.includes("audio")) icon = "🎧";
        else if (lowerName.includes("lazer") || lowerName.includes("show") || lowerName.includes("shopping")) icon = "🎭";
        else if (lowerName.includes("informatic") || lowerName.includes("computador") || lowerName.includes("internet") || lowerName.includes("site") || lowerName.includes("tecnolog")) icon = "💻";
        else if (lowerName.includes("frete") || lowerName.includes("mudanc") || lowerName.includes("transport")) icon = "🚚";
        else if (lowerName.includes("servi")) icon = "🛠️";

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
    if (displayedCompanies.length > 0) {
      const fullUrl = window.location.href;
      const searchPart = fullUrl.includes('?') ? fullUrl.split('?')[1] : '';
      const urlParams = new URLSearchParams(searchPart);
      const urlId = urlParams.get('id');
      if (urlId) {
        const found = displayedCompanies.find((c: any) => 
          String(c.id) === urlId || 
          slugify(c.name) === urlId
        );
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
  }, [displayedCompanies]);

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
            // Default backward compatibility fallback: assume 'fortaleza' belongs to Ceará (CE)
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
      const topRecommended = sortCompaniesByPlanAndPriority(displayedCompanies.filter(c => c.active !== false)).slice(0, 3);
      setChatMessages([{ 
        sender: 'bot', 
        text: `👋 Olá! Sou o Assistente Virtual do Portal Guia Comercial. Como posso te ajudar hoje?\n\n⭐ Empresas Recomendadas em Destaque:`,
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
        botText = isExactCategory ? `Mostrando empresas da categoria ${displayedCompanies.find(c => normalize(c.category) === query)?.category}:` : "Encontrei estas empresas ordenadas por recomendação e destaque:";
        setChatMessages(prev => [...prev, { sender: 'bot', text: botText, results, categories: matchedCategories }]);
      } else if (matchedCategories.length > 0) {
        setChatMessages(prev => [...prev, { sender: 'bot', text: "Encontrei estas categorias relacionadas. Clique em uma para ver as empresas:", categories: matchedCategories }]);
      } else {
        setChatMessages(prev => [...prev, { sender: 'bot', text: "Desculpe, não encontrei nenhuma empresa com esse termo. Tente buscar por: pizzaria, supermercado, oficina, ar condicionado ou restaurante." }]);
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
                <label>Serviço de Upload de Imagens (ImgBB Integrado 📷)</label>
                <input 
                  type="text" 
                  className="dev-input" 
                  placeholder="API Key ImgBB ativa"
                  value="ImgBB API (Upload direto do Celular Ativo)" 
                  disabled
                />
                <small style={{ color: '#25D366' }}>✓ Upload direto ativado! Os usuários e anunciantes já podem selecionar fotos diretamente do celular.</small>
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
                       style={{ height: '36px', background: '#ff8a00', borderColor: '#ff8a00', color: '#000' }}
                       onClick={() => {
                         setDaysCityUname(uname);
                         setDaysToAddInput('30');
                         setShowDaysCityModal(true);
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
                        ? `Rádio ATIVA: ${udata.customRadioLink ? `Personalizada (${udata.customRadioLink})` : 'Universal'} (Clique para Configurar)` 
                        : "Rádio DESATIVADA no Portal (Clique para ATIVAR/Configurar)"
                      }
                    >
                      {udata.showRadio !== false ? '📻✅' : '📻❌'}
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
                        alert(udata.hideAdvertiserAuth === true ? "Botões de Login/Cadastro de anunciantes agora estão VISÍVEIS no portal!" : "Botões de Login/Cadastro de anunciantes agora estão OCULTOS no portal!");
                        // Refresh list
                        const s = await getDocs(collection(db, 'tenants'));
                        const u: any = {};
                        s.forEach(d => u[d.id] = d.data());
                        setAllUsers(u);
                      }}
                      title={udata.hideAdvertiserAuth === true ? "Login de Anunciantes OCULTO (Clique para MOSTRAR)" : "Login de Anunciantes ATIVO (Clique para OCULTAR)"}
                    >
                      {udata.hideAdvertiserAuth === true ? '👤❌' : '👤✅'}
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
                     onClick={() => {
                       setEditingCityUname(uname);
                       setEditingCityPass(udata.password || '');
                       setEditingCityName(udata.city || '');
                       setShowEditCityModal(true);
                     }}
                   >
                     ⚙️
                   </button>
                   <button 
                     className="dev-btn" 
                     style={{ height: '36px', background: 'rgba(255, 138, 0, 0.1)', borderColor: 'rgba(255, 138, 0, 0.2)', color: '#ff8a00' }}
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
                    <h2 style={{ margin: 0, color: '#fff' }}>Gerenciar Vídeos</h2>
                    <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '13px' }}>Editando vídeos de: <strong style={{ color: '#ff8a00' }}>{editingVideosFor.city}</strong></p>
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

          {/* ADD CITY MODAL */}
          {showAddCityModal && (
            <div className="modal-overlay">
              <div className="modal-content" style={{ maxWidth: '450px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, color: '#fff' }}>Adicionar Nova Cidade</h3>
                  <button onClick={() => setShowAddCityModal(false)} style={{ background: '#222', border: 'none', color: '#fff', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
                </div>
                <div style={{ display: 'grid', gap: '15px' }}>
                  <div className="dev-form-group">
                    <label>ID de Acesso (ex: belohorizonte)</label>
                    <input 
                      type="text" 
                      className="dev-input" 
                      style={{ width: '100%' }}
                      placeholder="Somente letras minúsculas e sem espaços"
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
                    <label>Nome Visível da Cidade</label>
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
                  <button onClick={() => setShowEditCityModal(false)} style={{ background: '#222', border: 'none', color: '#fff', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
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
                    <label>Nome Visível da Cidade</label>
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
                  <button onClick={() => setShowDaysCityModal(false)} style={{ background: '#222', border: 'none', color: '#fff', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
                </div>
                <div style={{ display: 'grid', gap: '15px' }}>
                  <p style={{ fontSize: '13px', color: '#aaa', margin: 0 }}>
                    Adicione dias de expiração para a cidade <strong style={{ color: '#ff8a00' }}>{daysCityUname}</strong>.
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
                          alert("Informe um número válido de dias.");
                          return;
                        }
                        try {
                          const udata = allUsers[daysCityUname];
                          let baseDate = new Date();
                          if (udata && udata.expiresAt) {
                            const currentExpiry = new Date(udata.expiresAt);
                            // Se não estiver expirado, adiciona ao vencimento atual. Se estiver vencido, adiciona a partir de hoje.
                            if (currentExpiry > baseDate) {
                              baseDate = currentExpiry;
                            }
                          }
                          const newExpiry = new Date(baseDate.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));
                          const expiryStr = newExpiry.toISOString().split('T')[0];
                          
                          await updateDoc(doc(db, 'tenants', daysCityUname), { expiresAt: expiryStr });
                          alert(`Assinatura renovada com sucesso até ${expiryStr}`);
                          
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
                  <h3 style={{ margin: 0, color: '#fff' }}>Rádio de <strong style={{ color: '#ff8a00' }}>{radioCityUname}</strong></h3>
                  <button onClick={() => setShowRadioCityModal(false)} style={{ background: '#222', border: 'none', color: '#fff', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
                </div>
                <div style={{ display: 'grid', gap: '15px' }}>
                  <div className="dev-form-group">
                    <label>Status da Rádio no Portal</label>
                    <select 
                      className="dev-input" 
                      style={{ width: '100%' }}
                      value={radioActiveInput ? "ativo" : "inativo"}
                      onChange={e => setRadioActiveInput(e.target.value === "ativo")}
                    >
                      <option value="ativo">Ativada (Visível no Portal) ✅</option>
                      <option value="inativo">Desativada (Oculta no Portal) ❌</option>
                    </select>
                  </div>
                  <div className="dev-form-group">
                    <label>Ativar Player de Rádio no Topo (Início)?</label>
                    <select 
                      className="dev-input" 
                      style={{ width: '100%' }}
                      value={radioHeaderPlayerInput ? "sim" : "nao"}
                      onChange={e => setRadioHeaderPlayerInput(e.target.value === "sim")}
                    >
                      <option value="nao">Não (Apenas no rodapé) ❌</option>
                      <option value="sim">Sim (Mostrar Player no Início da Página) 📻</option>
                    </select>
                    <small style={{ color: '#aaa', fontSize: '0.75rem' }}>
                      Se ativado, o player de rádio aparecerá no início da página (logo abaixo da introdução) para o dono do portal.
                    </small>
                  </div>
                  <div className="dev-form-group">
                    <label>Link Stream da Rádio Personalizada</label>
                    <input 
                      type="text" 
                      className="dev-input" 
                      style={{ width: '100%' }}
                      placeholder="Deixe em branco para usar a rádio universal"
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
                          alert("Configurações de rádio atualizadas com sucesso!");
                          const s = await getDocs(collection(db, 'tenants'));
                          const u: any = {};
                          s.forEach(d => u[d.id] = d.data());
                          setAllUsers(u);
                          setShowRadioCityModal(false);
                        } catch (err: any) {
                          alert("Erro ao atualizar rádio: " + err.message);
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
                  <button onClick={() => setShowAddAffiliateModal(false)} style={{ background: '#222', border: 'none', color: '#fff', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
                </div>
                <div style={{ display: 'grid', gap: '15px' }}>
                  <div className="dev-form-group">
                    <label>Nome do Divulgador / Parceiro</label>
                    <input 
                      type="text" 
                      className="dev-input" 
                      style={{ width: '100%' }}
                      placeholder="Ex: João Silva"
                      value={newAffName} 
                      onChange={e => setNewAffName(e.target.value)}
                    />
                  </div>
                  <div className="dev-form-group">
                    <label>Código do Link (ex: joao)</label>
                    <input 
                      type="text" 
                      className="dev-input" 
                      style={{ width: '100%' }}
                      placeholder="Somente minúsculas e sem espaços, exemplo: joao"
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
                          alert("Por favor, preencha o nome e o código.");
                          return;
                        }
                        const tid = slugify(tenantId || 'fortaleza');
                        const slug = slugify(codeVal);
                        const affDoc = doc(db, 'tenants', tid, 'affiliates', slug);
                        try {
                          const check = await getDoc(affDoc);
                          if (check.exists()) {
                            alert("Este código já está em uso por outro divulgador.");
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

          <div style={{ padding: '10px', background: 'rgba(255, 138, 0, 0.05)', border: '1px solid rgba(255, 138, 0, 0.15)', borderRadius: '12px', marginTop: '10px', marginBottom: '10px' }}>
            <p style={{ color: '#ff8a00', fontSize: '11px', margin: 0, textAlign: 'center', lineHeight: '1.4' }}>
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
              src={activeReferralPartner?.logo ? activeReferralPartner.logo : (appData?.siteInfo?.logo ? appData.siteInfo.logo : "https://i.postimg.cc/nVdYndN2/minha-divulgacao-png.png")} 
              alt={activeReferralPartner?.customTitle || activeReferralPartner?.name || "Minha Divulgação"} 
              className={`h-10 md:h-12 ${(activeReferralPartner?.logo || appData?.siteInfo?.logo) ? 'w-10 md:w-12 rounded-full object-cover border border-white/10' : 'w-auto object-contain'} transition-transform duration-300 group-hover:scale-105`} 
              referrerPolicy="no-referrer"
            />
            <div className="flex flex-col select-none">
              <span className="font-sans font-extrabold text-sm md:text-base leading-none text-white tracking-tight uppercase group-hover:text-[var(--primary)] transition-colors duration-200">
                {activeReferralPartner?.customTitle || activeReferralPartner?.name || appData.siteInfo.name} <span className="text-[var(--primary)]">{activeReferralPartner ? "" : appData.siteInfo.suffix}</span>
              </span>
              <span className="text-[9px] text-white/40 tracking-widest font-mono uppercase mt-0.5">
                {activeReferralPartner ? `Divulgador: ${activeReferralPartner.name}` : "Portal de Mídia"}
              </span>
            </div>
          </a>

          {/* Clean Menu - Desktop */}
          <div className="hidden lg:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-white/70">
            <a href="#destaque" onClick={(e) => { e.preventDefault(); scrollToSection('destaque'); }} className="hover:text-[var(--primary)] transition-colors duration-200">Destaques</a>
            {visibleFlyers.length > 0 && (
              <a href="#promocoes" onClick={(e) => { e.preventDefault(); scrollToSection('promocoes'); }} className="hover:text-[var(--primary)] transition-colors duration-200">Promoções</a>
            )}
            <a href="#filtro-empresas" onClick={(e) => { e.preventDefault(); scrollToSection('filtro-empresas'); }} className="hover:text-[var(--primary)] transition-colors duration-200">Anunciantes</a>
            {showRadio && (
              <a href="#radio-tv" onClick={(e) => { e.preventDefault(); scrollToSection('radio-tv'); }} className="hover:text-[var(--primary)] transition-colors duration-200">Rádio & TV</a>
            )}
            <a href="#servicos" onClick={(e) => { e.preventDefault(); scrollToSection('servicos'); }} className="hover:text-[var(--primary)] transition-colors duration-200">Serviços</a>
            <a href="#depoimentos" onClick={(e) => { e.preventDefault(); scrollToSection('depoimentos'); }} className="hover:text-[var(--primary)] transition-colors duration-200">Depoimentos</a>
          </div>

          {/* Action Buttons - Desktop */}
          {!hideAdvertiserAuth && (
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
          )}

          {/* Mobile Menu Trigger & Quick Actions */}
          <div className="flex lg:hidden items-center gap-2">
            {!hideAdvertiserAuth && (
              <>
                <button 
                  onClick={() => { setAuthMode('login'); setIsAdPortalOpen(true); }}
                  className="bg-neutral-900 border border-white/10 text-white px-2.5 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wide cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <User size={11} /> Entrar
                </button>
                <button 
                  onClick={() => { setAuthMode('register'); setIsAdPortalOpen(true); }}
                  className="bg-[var(--primary)] text-black px-2.5 py-1.5 rounded-lg font-black text-[10px] uppercase tracking-wide cursor-pointer shrink-0"
                >
                  🚀 Cadastrar
                </button>
              </>
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
                <a href="#destaque" onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); scrollToSection('destaque'); }} className="text-white hover:text-[var(--primary)] py-2">⭐ Destaques</a>
                {visibleFlyers.length > 0 && (
                  <a href="#promocoes" onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); scrollToSection('promocoes'); }} className="text-white hover:text-[var(--primary)] py-2">🔥 Promoções</a>
                )}
                <a href="#filtro-empresas" onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); scrollToSection('filtro-empresas'); }} className="text-white hover:text-[var(--primary)] py-2">🔍 Empresas</a>
                {showRadio && (
                  <a href="#radio-tv" onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); scrollToSection('radio-tv'); }} className="text-white hover:text-[var(--primary)] py-2">📻 Rádio & TV</a>
                )}
                <a href="#servicos" onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); scrollToSection('servicos'); }} className="text-white hover:text-[var(--primary)] py-2">🛠️ Serviços</a>
                <a href="#depoimentos" onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); scrollToSection('depoimentos'); }} className="text-white hover:text-[var(--primary)] py-2">💬 Depoimentos</a>
              </div>
              {!hideAdvertiserAuth && (
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
              )}
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
            className="inline-flex items-center gap-2.5 bg-neutral-950/90 border border-amber-500/40 backdrop-blur-2xl px-5 py-2.5 rounded-full text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase text-amber-400 mb-6 md:mb-8 font-mono shadow-[0_4px_30px_rgba(251,191,36,0.2)] select-none"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            Guia Comercial Digital & Divulgação Local
          </motion.div>
  
          {/* Main Headline & Subtitle */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-sans font-black text-white tracking-tight leading-[1.05] max-w-5xl select-none">
            Cadastre sua empresa <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 font-black">gratuitamente</span>
          </h1>
  
          <p className="text-base sm:text-xl md:text-2xl text-white/85 font-semibold max-w-3xl mt-5 leading-relaxed select-none">
            Seja encontrado por milhares de clientes da sua cidade e aumente suas vendas diretas pelo WhatsApp.
          </p>

          {/* Main Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 w-full sm:w-auto relative z-20">
            {!hideAdvertiserAuth ? (
              <button 
                onClick={() => { 
                  setAuthMode('register'); 
                  setIsAdPortalOpen(true); 
                }}
                className="group bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-black hover:scale-105 hover:shadow-[0_0_30px_rgba(251,191,36,0.4)] px-8 py-4.5 md:px-10 md:py-5 rounded-2xl font-black text-sm sm:text-base uppercase tracking-wider text-center transition-all duration-300 shadow-2xl flex items-center justify-center gap-3 cursor-pointer w-full sm:w-auto shrink-0 border border-amber-300/30"
              >
                🚀 Cadastrar Empresa Grátis
              </button>
            ) : (
              <a 
                href={`https://wa.me/${appData?.siteInfo?.phone?.replace(/[^0-9]/g, '') || ''}?text=${encodeURIComponent('Olá! Acessei o portal e gostaria de cadastrar minha empresa gratuitamente.')}`} 
                target="_blank"
                rel="noreferrer"
                className="group bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black hover:scale-105 px-8 py-4.5 rounded-2xl font-black text-sm sm:text-base uppercase tracking-wider text-center transition-all duration-300 shadow-xl flex items-center justify-center gap-2.5 w-full sm:w-auto shrink-0 decoration-transparent"
              >
                🚀 Cadastrar Empresa Grátis
              </a>
            )}
            
            <button 
              onClick={() => { 
                const el = document.getElementById('filtro-empresas');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white/10 hover:bg-white/15 text-white border border-white/20 hover:border-white/40 px-8 py-4.5 md:px-10 md:py-5 rounded-2xl font-black text-sm sm:text-base uppercase tracking-wider text-center transition-all duration-300 shadow-xl flex items-center justify-center gap-2.5 cursor-pointer w-full sm:w-auto shrink-0"
            >
              🔍 Encontrar Empresas
            </button>
          </div>

          {/* Advantages Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4 mt-12 w-full max-w-5xl text-left select-none relative z-20">
            {[
              { title: "Cadastro Gratuito", desc: "Sem taxas ou mensalidades" },
              { title: "WhatsApp Direto", desc: "Receba pedidos no seu celular" },
              { title: "Localização & Mapa", desc: "Endereço e rotas de acesso" },
              { title: "Redes Sociais", desc: "Instagram, Facebook e Site" },
              { title: "Catálogo de Produtos", desc: "Cardápio e serviços online" },
              { title: "Horário Comercial", desc: "Aberto / Fechado em tempo real" },
              { title: "Fotos da Empresa", desc: "Sua estrutura em destaque" },
              { title: "Perfil Profissional", desc: "Estilo Google Empresas" }
            ].map((item, idx) => (
              <div key={idx} className="bg-[#0b0c12]/90 border border-white/10 hover:border-amber-500/40 rounded-2xl p-4 flex flex-col justify-between shadow-lg backdrop-blur-md transition-all duration-200 hover:-translate-y-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-xs font-black shrink-0">
                    ✔
                  </span>
                  <h4 className="text-xs sm:text-sm font-black text-white leading-tight">{item.title}</h4>
                </div>
                <p className="text-[11px] text-white/60 font-medium pl-7">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* DUAL COLUMN WORK: INTERACTIVE SELECTION + NATIONAL STATS WIDGET (FROM IMAGE 2) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 mt-16 w-full max-w-6xl text-left select-none relative z-20">
            
            {/* Left Column: Search & Interactive Filter */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="bg-neutral-900/95 border border-white/10 rounded-3xl p-5 sm:p-6 shadow-[0_25px_60px_rgba(0,0,0,0.6)] backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500" />
                
                <span className="text-[10px] sm:text-xs font-black text-amber-500 tracking-[0.2em] uppercase block mb-2 font-mono">🔍 SISTEMA DE BUSCA NACIONAL</span>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug mb-5">
                  Selecione sua Região e Encontre Negócios
                </h3>

                {/* Tab selectors exactly like the image tabs */}
                <div className="flex bg-black/40 border border-white/5 rounded-2xl p-1 mb-5">
                  <button 
                    type="button"
                    onClick={() => {
                      setSelectedTypeFilter('loja');
                    }}
                    className={`flex-1 py-3 px-4 rounded-xl text-xs font-extrabold tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${selectedTypeFilter === 'loja' ? 'bg-amber-500 text-black shadow-lg font-black' : 'text-white/55 hover:text-white/80 font-bold'}`}
                  >
                    🏪 LOJAS COMERCIAIS
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setSelectedTypeFilter('servico');
                    }}
                    className={`flex-1 py-3 px-4 rounded-xl text-xs font-extrabold tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${selectedTypeFilter === 'servico' ? 'bg-blue-600 text-white shadow-lg font-black' : 'text-white/55 hover:text-white/80 font-bold'}`}
                  >
                    🛠️ PRESTADORES DE SERVIÇOS
                  </button>
                </div>

                {/* Custom input fields */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 text-base">📍</span>
                    <select
                      value={selectedStateFilter}
                      onChange={(e) => setSelectedStateFilter(e.target.value)}
                      className="w-full bg-[#111116] border border-white/10 hover:border-white/20 focus:border-amber-500 outline-none rounded-xl pl-11 pr-8 py-3.5 text-xs sm:text-sm text-white font-extrabold appearance-none cursor-pointer transition-all"
                    >
                      <option value="">Selecione seu estado</option>
                      {BRAZIL_STATES.map(st => (
                        <option key={st.uf} value={st.uf}>{st.name} ({st.uf})</option>
                      ))}
                    </select>
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none text-[10px]">▼</span>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('filtro-empresas');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs sm:text-sm uppercase tracking-wider px-6 py-3.5 rounded-xl transition-all duration-200 shrink-0 flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-orange-500/20"
                  >
                    🔍 Buscar
                  </button>
                </div>

                {/* Action button triggers for direct smooth scroll */}
                <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-white/5">
                  <button 
                    type="button"
                    onClick={() => {
                      setSelectedTypeFilter('loja');
                      const el = document.getElementById('filtro-empresas');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:scale-[1.02] transition-all cursor-pointer shadow-md"
                  >
                    🏪 Encontrar Lojas
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setSelectedTypeFilter('servico');
                      const el = document.getElementById('filtro-empresas');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.02] transition-all cursor-pointer shadow-md"
                  >
                    🛠️ Encontrar Serviços
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Dynamic National Statistics Block (From Image 2) */}
            <div className="lg:col-span-5 flex flex-col gap-4 justify-center">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#0c0d12]/90 border border-white/5 rounded-2xl p-4 flex flex-col gap-1 shadow-lg hover:border-amber-500/30 transition-all duration-200">
                  <span className="text-white/40 text-[9px] uppercase font-black tracking-widest font-mono">🏢 Empresas</span>
                  <span className="text-xl sm:text-2xl font-black text-white font-sans">500+</span>
                  <span className="text-[10px] text-white/50 mt-0.5 font-sans leading-tight">Lojas físicas e virtuais registradas</span>
                </div>
                <div className="bg-[#0c0d12]/90 border border-white/5 rounded-2xl p-4 flex flex-col gap-1 shadow-lg hover:border-blue-500/30 transition-all duration-200">
                  <span className="text-white/40 text-[9px] uppercase font-black tracking-widest font-mono">🛠️ Prestadores</span>
                  <span className="text-xl sm:text-2xl font-black text-white font-sans">200+</span>
                  <span className="text-[10px] text-white/50 mt-0.5 font-sans leading-tight">Profissionais autônomos ativos</span>
                </div>
                <div className="bg-[#0c0d12]/90 border border-white/5 rounded-2xl p-4 flex flex-col gap-1 shadow-lg transition-all duration-200">
                  <span className="text-white/40 text-[9px] uppercase font-black tracking-widest font-mono">📦 Produtos</span>
                  <span className="text-xl sm:text-2xl font-black text-white font-sans">10K+</span>
                  <span className="text-[10px] text-white/50 mt-0.5 font-sans leading-tight">Artigos cadastrados nos cardápios</span>
                </div>
                <div className="bg-[#0c0d12]/90 border border-white/5 rounded-2xl p-4 flex flex-col gap-1 shadow-lg transition-all duration-200">
                  <span className="text-white/40 text-[9px] uppercase font-black tracking-widest font-mono">🛒 Pedidos</span>
                  <span className="text-xl sm:text-2xl font-black text-white font-sans">12K+</span>
                  <span className="text-[10px] text-white/50 mt-0.5 font-sans leading-tight">Mensagens enviadas via WhatsApp</span>
                </div>
                <div className="bg-[#0c0d12]/90 border border-white/5 rounded-2xl p-4 flex flex-col gap-1 shadow-lg transition-all duration-200">
                  <span className="text-white/40 text-[9px] uppercase font-black tracking-widest font-mono">🇧🇷 Estados</span>
                  <span className="text-xl sm:text-2xl font-black text-white font-sans">BR 27</span>
                  <span className="text-[10px] text-white/50 mt-0.5 font-sans leading-tight">Estados de cobertura da plataforma</span>
                </div>
                <div className="bg-[#0c0d12]/90 border border-white/5 rounded-2xl p-4 flex flex-col gap-1 shadow-lg transition-all duration-200">
                  <span className="text-white/40 text-[9px] uppercase font-black tracking-widest font-mono">🟢 Conexão</span>
                  <span className="text-xl sm:text-2xl font-black text-emerald-400 font-sans flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#10b981]" />
                    100%
                  </span>
                  <span className="text-[10px] text-white/50 mt-0.5 font-sans leading-tight">Servidores e sinal ativo agora</span>
                </div>
              </div>

              {/* Verified Badge */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl p-3 text-xs font-bold flex items-center gap-2 uppercase select-none shadow-md">
                <span className="text-sm">🛡️</span>
                Presente em todo o Brasil! Seguro, confiável e 100% online
              </div>
            </div>

          </div>

          {/* Spacer */}
          <div className="w-full h-1 bg-white/5 my-12" />

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

                    {hasActiveReferral ? (
                      <div className="flex flex-col gap-2 mt-5">
                        {company.wa && (
                          <a 
                            href={`https://wa.me/${company.wa.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Olá, vi seu comércio no portal ${appData?.siteInfo?.name || ''}!${sessionStorage.getItem(`ref_${slugify(tenantId || 'fortaleza')}`) ? ` Fui indicado pelo parceiro: ${sessionStorage.getItem(`ref_${slugify(tenantId || 'fortaleza')}`)}` : ''}`)}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest text-center flex items-center justify-center gap-2 transition-all duration-300 shadow-md"
                          >
                            <Smartphone size={12} /> Falar no WhatsApp
                          </a>
                        )}
                        {company.ig && company.ig !== '#' && company.ig !== '' && (
                          <a 
                            href={company.ig} 
                            target="_blank" 
                            rel="noreferrer"
                            className="w-full bg-[#e1306c] hover:bg-[#d6245d] text-white py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest text-center flex items-center justify-center gap-2 transition-all duration-300 shadow-md"
                          >
                            <Instagram size={12} /> Instagram
                          </a>
                        )}
                        {company.website && company.website.trim() !== '' && (
                          <a 
                            href={company.website.trim().startsWith('http') ? company.website.trim() : `https://${company.website.trim()}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest text-center flex items-center justify-center gap-1.5 transition-all duration-300 shadow-md cursor-pointer"
                          >
                            <Globe size={12} /> Visitar Site Oficial
                          </a>
                        )}
                        {(!company.wa) && (!company.website || company.website.trim() === '') && (!company.ig || company.ig === '#' || company.ig === '') && (
                          <span className="text-[9px] text-white/35 text-center py-2.5 bg-white/5 rounded-2xl font-bold uppercase tracking-widest">
                            Sem Links Cadastrados
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 mt-5">
                        {(() => {
                          const hasIg = company.ig && company.ig !== '#' && company.ig.trim() !== '';
                          const hasWebsite = company.website && company.website !== '#' && company.website.trim() !== '';
                          const showCatalogBtn = !company.hideMiniSite && (!hasIg || !hasWebsite);
                          const btnInfo = getCompanyPrimaryButtonInfo(company);

                          return (
                            <>
                              {showCatalogBtn && (
                                <button 
                                  onClick={() => handleCompanyPrimaryButtonClick(company)}
                                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest text-center flex items-center justify-center gap-1.5 transition-all duration-300 shadow-md cursor-pointer"
                                >
                                  <ShoppingBag size={12} /> 
                                  {btnInfo.label}
                                </button>
                              )}

                              {company.wa && (
                                <a 
                                  href={`https://wa.me/${company.wa.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Olá, vi seu anúncio em destaque no portal ${appData.siteInfo.name}!`)}`} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest text-center flex items-center justify-center gap-2 transition-all duration-300 shadow-md"
                                >
                                  <Smartphone size={12} /> Falar no WhatsApp
                                </a>
                              )}

                              {(hasIg || hasWebsite) && (
                                <div className="flex gap-2">
                                  {hasIg && (
                                    <a 
                                      href={company.ig} 
                                      target="_blank" 
                                      rel="noreferrer" 
                                      className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest text-center transition-all duration-200"
                                    >
                                      Instagram
                                    </a>
                                  )}
                                  {hasWebsite && (
                                    <a 
                                      href={company.website.trim().startsWith('http') ? company.website.trim() : `https://${company.website.trim()}`} 
                                      target="_blank" 
                                      rel="noreferrer" 
                                      className="flex-1 bg-[var(--primary)] hover:brightness-110 text-black py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest text-center transition-all duration-200"
                                    >
                                      Website
                                    </a>
                                  )}
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    )}
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

                    {hasActiveReferral ? (
                      <div className="flex flex-col gap-2 mt-5">
                        {company.wa && (
                          <a 
                            href={`https://wa.me/${company.wa.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Olá, vi seu comércio no portal ${appData?.siteInfo?.name || ''}!${sessionStorage.getItem(`ref_${slugify(tenantId || 'fortaleza')}`) ? ` Fui indicado pelo parceiro: ${sessionStorage.getItem(`ref_${slugify(tenantId || 'fortaleza')}`)}` : ''}`)}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest text-center flex items-center justify-center gap-2 transition-all duration-300 shadow-md"
                          >
                            <Smartphone size={12} /> Falar no WhatsApp
                          </a>
                        )}
                        {company.ig && company.ig !== '#' && company.ig !== '' && (
                          <a 
                            href={company.ig} 
                            target="_blank" 
                            rel="noreferrer"
                            className="w-full bg-[#e1306c] hover:bg-[#d6245d] text-white py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest text-center flex items-center justify-center gap-2 transition-all duration-300 shadow-md"
                          >
                            <Instagram size={12} /> Instagram
                          </a>
                        )}
                        {company.website && company.website.trim() !== '' && (
                          <a 
                            href={company.website.trim().startsWith('http') ? company.website.trim() : `https://${company.website.trim()}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest text-center flex items-center justify-center gap-1.5 transition-all duration-300 shadow-md cursor-pointer"
                          >
                            <Globe size={12} /> Visitar Site Oficial
                          </a>
                        )}
                        {(!company.wa) && (!company.website || company.website.trim() === '') && (!company.ig || company.ig === '#' || company.ig === '') && (
                          <span className="text-[9px] text-white/35 text-center py-2.5 bg-white/5 rounded-2xl font-bold uppercase tracking-widest">
                            Sem Links Cadastrados
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 mt-5">
                        {(() => {
                          const hasIg = company.ig && company.ig !== '#' && company.ig.trim() !== '';
                          const hasWebsite = company.website && company.website !== '#' && company.website.trim() !== '';
                          const showCatalogBtn = !company.hideMiniSite && (!hasIg || !hasWebsite);
                          const btnInfo = getCompanyPrimaryButtonInfo(company);

                          return (
                            <>
                              {showCatalogBtn && (
                                <button 
                                  onClick={() => handleCompanyPrimaryButtonClick(company)}
                                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest text-center flex items-center justify-center gap-1.5 transition-all duration-300 shadow-md cursor-pointer"
                                >
                                  <ShoppingBag size={12} /> 
                                  {btnInfo.label}
                                </button>
                              )}

                              {company.wa && (
                                <a 
                                  href={`https://wa.me/${company.wa.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Olá, vi seu comércio no portal ${appData.siteInfo.name}!`)}`} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest text-center flex items-center justify-center gap-2 transition-all duration-300 shadow-md"
                                >
                                  <Smartphone size={12} /> WhatsApp Comercial
                                </a>
                              )}

                              {(hasIg || hasWebsite) && (
                                <div className="flex gap-2">
                                  {hasIg && (
                                    <a 
                                      href={company.ig} 
                                      target="_blank" 
                                      rel="noreferrer" 
                                      className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest text-center transition-all duration-200"
                                    >
                                      Instagram
                                    </a>
                                  )}
                                  {hasWebsite && (
                                    <a 
                                      href={company.website.trim().startsWith('http') ? company.website.trim() : `https://${company.website.trim()}`} 
                                      target="_blank" 
                                      rel="noreferrer" 
                                      className="flex-1 bg-[var(--primary)] hover:brightness-110 text-black py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest text-center transition-all duration-200"
                                    >
                                      Website
                                    </a>
                                  )}
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    )}
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

            {/* Dynamic Active Filters Badges */}
            {(selectedStateFilter || selectedTypeFilter !== 'all' || selectedCategory || searchQuery) && (
              <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
                {selectedStateFilter && (
                  <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-black px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-mono uppercase">
                    📍 {selectedStateFilter}
                    <button type="button" onClick={() => setSelectedStateFilter('')} className="hover:text-white text-[12px] font-extrabold cursor-pointer ml-1">✕</button>
                  </span>
                )}
                {selectedTypeFilter !== 'all' && (
                  <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-black px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-mono uppercase">
                    📁 {selectedTypeFilter === 'loja' ? 'Lojas' : 'Serviços'}
                    <button type="button" onClick={() => setSelectedTypeFilter('all')} className="hover:text-white text-[12px] font-extrabold cursor-pointer ml-1">✕</button>
                  </span>
                )}
                {selectedCategory && (
                  <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-black px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-mono uppercase">
                    🏷️ {selectedCategory}
                    <button type="button" onClick={() => setSelectedCategory(null)} className="hover:text-white text-[12px] font-extrabold cursor-pointer ml-1">✕</button>
                  </span>
                )}
                {searchQuery && (
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-mono uppercase">
                    🔍 "{searchQuery}"
                    <button type="button" onClick={() => setSearchQuery('')} className="hover:text-white text-[12px] font-extrabold cursor-pointer ml-1">✕</button>
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
                  🧹 LIMPAR FILTROS
                </button>
              </div>
            )}
          </div>

          {/* Interactive Category Grid Filter */}
          <div className="mb-12">
            <h3 className="text-xs font-black font-mono text-amber-400 tracking-[0.2em] uppercase text-center mb-6">
              📂 CATEGORIAS POPULARES
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
              {CATEGORIES.map((cat, idx) => {
                const isSelected = selectedCategory === cat.name;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedCategory(isSelected ? null : cat.name)}
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
                        🔥 PATROCINADO
                      </div>
                    )}
                    {planType === 'destaque' && (
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-black text-[9px] tracking-widest uppercase px-3 py-1 rounded-full shadow-lg flex items-center gap-1 z-10">
                        ⭐ DESTAQUE
                      </div>
                    )}
                    {planType === 'verificado' && (
                      <div className="absolute top-4 right-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-black text-[9px] tracking-widest uppercase px-3 py-1 rounded-full shadow-lg flex items-center gap-1 z-10">
                        ✔ VERIFICADO
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
                                ⭐ {average.toFixed(1)} ({count})
                              </span>
                            );
                          } else {
                            return (
                              <span className="text-[9px] text-white/40 font-bold uppercase tracking-wide bg-white/5 border border-white/10 px-2.5 py-1 rounded-full select-none flex items-center gap-1 font-mono">
                                ⭐ Novo
                              </span>
                            );
                          }
                        })()}
                        {(company.city || company.state || company.uf) && (
                          <span className="text-[9px] text-white/50 font-bold uppercase tracking-wide bg-white/5 border border-white/10 px-2.5 py-1 rounded-full select-none flex items-center gap-1 font-mono">
                            📍 {company.city || 'Fortaleza'}{company.state || company.uf ? ` - ${company.state || company.uf}` : ''}
                          </span>
                        )}
                        <span className="text-[9px] text-white/40 font-bold uppercase tracking-wide bg-white/5 border border-white/10 px-2 py-1 rounded-full select-none flex items-center gap-1 font-mono">
                          👁️ {company.views || 0}
                        </span>
                      </div>

                      <h3 className="text-base font-extrabold text-white mt-4 line-clamp-1 flex items-center gap-1.5">
                        {company.name}
                        {planType === 'verificado' && (
                          <span className="text-emerald-400 text-xs" title="Empresa Verificada">✔</span>
                        )}
                      </h3>
                      <p className="text-xs text-white/50 mt-2 line-clamp-3 leading-relaxed min-h-[3.5rem]">{company.desc || 'Anunciante comercial verificado de alta qualidade e atendimento dedicado.'}</p>
                    </div>

                  {/* Action Buttons */}
                  {hasActiveReferral ? (
                    <div className="flex flex-col gap-2.5 mt-6 border-t border-white/5 pt-5">
                      {company.wa && (
                        <a 
                          href={`https://wa.me/${company.wa.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Olá, vi seu anúncio no portal ${appData?.siteInfo?.name || ''}.${sessionStorage.getItem(`ref_${slugify(tenantId || 'fortaleza')}`) ? ` Fui indicado pelo parceiro: ${sessionStorage.getItem(`ref_${slugify(tenantId || 'fortaleza')}`)}` : ''}`)}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest text-center flex items-center justify-center gap-2 transition-all duration-300 shadow-md"
                        >
                          <Smartphone size={14} /> Falar no WhatsApp
                        </a>
                      )}
                      {company.ig && company.ig !== '#' && company.ig !== '' && (
                        <a 
                          href={company.ig} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="w-full bg-[#e1306c] hover:bg-[#d6245d] text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest text-center flex items-center justify-center gap-2 transition-all duration-300 shadow-md"
                        >
                          <Instagram size={14} /> Instagram
                        </a>
                      )}
                      {company.website && company.website.trim() !== '' && (
                        <a 
                          href={company.website.trim().startsWith('http') ? company.website.trim() : `https://${company.website.trim()}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest text-center flex items-center justify-center gap-1.5 transition-all duration-305 shadow-md cursor-pointer"
                        >
                          <Globe size={14} /> Visitar Site Oficial
                        </a>
                      )}
                      {(!company.wa) && (!company.website || company.website.trim() === '') && (!company.ig || company.ig === '#' || company.ig === '') && (
                        <span className="text-xs text-white/35 text-center py-3 bg-white/5 rounded-2xl font-bold uppercase tracking-widest">
                          Sem Links Cadastrados
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2.5 mt-6 border-t border-white/5 pt-5">
                      {(() => {
                        const hasIg = company.ig && company.ig !== '#' && company.ig.trim() !== '';
                        const hasWebsite = company.website && company.website !== '#' && company.website.trim() !== '';
                        const showCatalogBtn = !company.hideMiniSite && (!hasIg || !hasWebsite);
                        const btnInfo = getCompanyPrimaryButtonInfo(company);

                        return (
                          <>
                            {showCatalogBtn && (
                              <button 
                                onClick={() => handleCompanyPrimaryButtonClick(company)}
                                className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest text-center flex items-center justify-center gap-1.5 transition-all duration-305 shadow-md cursor-pointer"
                              >
                                <ShoppingBag size={14} /> 
                                {btnInfo.label}
                              </button>
                            )}

                            {company.wa && (
                              <a 
                                href={`https://wa.me/${company.wa.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Olá, vi seu anúncio no portal ${appData.siteInfo.name}.${sessionStorage.getItem(`ref_${slugify(tenantId || 'fortaleza')}`) ? ` Fui indicado pelo parceiro: ${sessionStorage.getItem(`ref_${slugify(tenantId || 'fortaleza')}`)}` : ''}`)}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest text-center flex items-center justify-center gap-2 transition-all duration-300 shadow-md"
                              >
                                <Smartphone size={14} /> Falar no WhatsApp
                              </a>
                            )}

                            {(hasIg || hasWebsite) && (
                              <div className="flex gap-2">
                                {hasIg && (
                                  <a 
                                    href={company.ig} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest text-center transition-all duration-200"
                                  >
                                    Instagram
                                  </a>
                                )}
                                {hasWebsite && (
                                  <a 
                                    href={company.website.trim().startsWith('http') ? company.website.trim() : `https://${company.website.trim()}`} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="flex-1 bg-[var(--primary)] hover:brightness-110 text-black py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest text-center transition-all duration-200"
                                  >
                                    Website
                                  </a>
                                )}
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              );
            })}
            </div>
          )}

        </div>
      </section>

      {/* Live Radio & TV Streaming Broadcast */}
      {showRadio && (
      <section id="radio-tv" className="relative w-full py-16 md:py-24 bg-[#0a0a10] border-b border-white/5 overflow-hidden">
        
        {/* Background graphics */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-[var(--primary)]/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="relative w-full max-w-7xl mx-auto px-4 md:px-6">
          
          {/* Section Header */}
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
            <span className="text-[var(--primary)] text-xs font-bold font-mono tracking-widest uppercase">Transmissões Digitais</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
              {activeReferralPartner?.radioTitle ? activeReferralPartner.radioTitle : (
                appData?.siteInfo?.radioTitle ? appData.siteInfo.radioTitle : "Rádio & TV Online Ao Vivo"
              )}
            </h2>
            <p className="text-sm text-white/50 mt-3">
              {activeReferralPartner?.radioSub ? activeReferralPartner.radioSub : (
                appData?.siteInfo?.radioSub ? appData.siteInfo.radioSub : "Acompanhe nossa programação musical completa em áudio de alta definição e assista aos melhores spots de anúncios na nossa TV interativa."
              )}
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
                  src={activeReferralPartner?.radioLink || customRadioLink || universalConfig.radioLink || (appData && appData.siteInfo && appData.siteInfo.radioLink)}
                  onPlay={() => setRadioPlaying(true)}
                  onPause={() => setRadioPlaying(false)}
                />

                <div className="flex items-end gap-1 h-6 mt-6 select-none">
                  {[0.1, 0.3, 0.2, 0.5, 0.4, 0.6, 0.3, 0.5, 0.2, 0.1, 0.4].map((delay, i) => (
                    <div 
                      key={i} 
                      className={`w-1 bg-[#ff8a00]/60 rounded-full ${radioPlaying ? 'animate-pulse' : 'h-1'}`}
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
      )}

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
              <h4 className="text-xl font-black text-white">
                {activeReferralPartner?.ctaTitle ? activeReferralPartner.ctaTitle : (
                  appData?.siteInfo?.ctaTitle ? appData.siteInfo.ctaTitle : "Pronto para dominar seu segmento comercial?"
                )}
              </h4>
              <p className="text-xs sm:text-sm text-white/60 mt-2 max-w-lg leading-relaxed">
                {activeReferralPartner?.ctaSub ? activeReferralPartner.ctaSub : (
                  appData?.siteInfo?.ctaSub ? appData.siteInfo.ctaSub : "Não perca vendas para seu maior concorrente da região. Fale agora mesmo com nossa central comercial no WhatsApp!"
                )}
              </p>
            </div>
            <a 
              href={`https://wa.me/${(activeReferralPartner?.whatsapp || appData?.siteInfo?.social?.wa || appData?.pricing?.waLink || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Olá! Acessei o portal ${activeReferralPartner?.customTitle || appData?.siteInfo?.name || ''} e gostaria de falar com um consultor sobre anúncios.`)}`}
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
          
          {/* Main Section Header for Plans */}
          <div className="text-center max-w-3xl mx-auto mb-12 select-none">
            <span className="text-[var(--primary)] text-xs font-bold font-mono tracking-widest uppercase block mb-2">
              ⭐ PLANOS DE ANÚNCIO & VISIBILIDADE
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Escolha o Plano Ideal Para Seu Negócio
            </h2>
            <p className="text-sm text-white/65 mt-3 leading-relaxed">
              Do perfil gratuito para estar presente na cidade aos planos Premium para dominar a concorrência e aparecer em 1º lugar no portal.
            </p>
          </div>

          {/* Conversion Triggers Banner */}
          <div className="bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 border border-amber-500/30 rounded-3xl p-6 mb-10 text-xs text-amber-200/90 shadow-2xl">
            <div className="flex items-center gap-2 font-black text-amber-300 text-sm uppercase tracking-wide mb-3">
              ⚡ POR QUE ANUNCIAR NO PLANO PREMIUM?
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-medium">
              <div className="bg-black/30 border border-amber-500/20 rounded-2xl p-3.5 flex items-start gap-2.5">
                <span className="text-base">🔴</span>
                <span><strong>Sua empresa está atrás das empresas Premium.</strong></span>
              </div>
              <div className="bg-black/30 border border-amber-500/20 rounded-2xl p-3.5 flex items-start gap-2.5">
                <span className="text-base">🔎</span>
                <span><strong>As empresas Premium aparecem primeiro nas pesquisas.</strong></span>
              </div>
              <div className="bg-black/30 border border-amber-500/20 rounded-2xl p-3.5 flex items-start gap-2.5">
                <span className="text-base">🤖</span>
                <span><strong>As empresas Premium possuem prioridade nas recomendações do Atendente Virtual.</strong></span>
              </div>
              <div className="bg-amber-500/20 border border-amber-500/40 rounded-2xl p-3.5 flex items-start gap-2.5 text-amber-200">
                <span className="text-base">🚀</span>
                <span><strong>Ative o Premium para aumentar sua visibilidade e vender mais!</strong></span>
              </div>
            </div>
          </div>

          {/* 4 Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 select-none">
            
            {/* 1. Gratuito */}
            <div className="bg-[#0f1016] border border-white/10 hover:border-white/20 rounded-3xl p-6 flex flex-col justify-between shadow-xl transition-all">
              <div>
                <span className="text-[10px] font-mono text-white/40 uppercase font-extrabold tracking-widest">Nível 1</span>
                <h3 className="text-xl font-black text-white mt-1 flex items-center gap-1.5">
                  🟢 Gratuito
                </h3>
                <div className="text-2xl font-black text-white/90 mt-2 font-mono">
                  R$ 0 <span className="text-xs text-white/40 font-normal">/ MÊS</span>
                </div>

                <ul className="text-xs text-white/70 space-y-2.5 mt-5 border-t border-white/5 pt-5">
                  <li className="flex items-center gap-1.5">✔ Perfil básico da empresa</li>
                  <li className="flex items-center gap-1.5">✔ Logo</li>
                  <li className="flex items-center gap-1.5">✔ Endereço</li>
                  <li className="flex items-center gap-1.5">✔ WhatsApp</li>
                  <li className="flex items-center gap-1.5">✔ Horário de funcionamento</li>
                  <li className="flex items-center gap-1.5">✔ Instagram</li>
                  <li className="flex items-center gap-1.5">✔ Facebook</li>
                  <li className="flex items-center gap-1.5">✔ Até 5 fotos</li>
                  <li className="flex items-center gap-1.5">✔ Até 5 produtos</li>
                  <li className="flex items-center gap-1.5 text-white/50">✔ Aparece nas buscas (sempre após empresas Premium)</li>
                </ul>
              </div>

              <div>
                <div className="mt-5 p-3.5 bg-white/5 border border-white/10 rounded-2xl text-[11px] text-white/60 leading-tight">
                  💡 <em>O plano gratuito permite que sua empresa esteja presente no portal.</em>
                </div>

                <button 
                  onClick={() => {
                    setAuthMode('register');
                    setIsAdPortalOpen(true);
                  }}
                  className="w-full mt-4 bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-wider py-3.5 rounded-2xl transition-all border border-white/10 cursor-pointer"
                >
                  🟢 Cadastrar Empresa Grátis
                </button>
              </div>
            </div>

            {/* 2. Premium Confiança */}
            <div className="bg-[#0f1016] border border-emerald-500/40 hover:border-emerald-500/70 rounded-3xl p-6 flex flex-col justify-between shadow-2xl relative transition-all group">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-extrabold tracking-widest">Nível 2</span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-500/40">
                    ✔ Verificada
                  </span>
                </div>
                <h3 className="text-xl font-black text-emerald-400 mt-1 flex items-center gap-1.5">
                  ⭐ Premium Confiança
                </h3>
                <div className="text-3xl font-black text-emerald-400 mt-2 font-mono flex items-baseline gap-1">
                  R$ 39,90 <span className="text-xs text-white/50 font-normal">/ MÊS</span>
                </div>

                <ul className="text-xs text-white/90 space-y-2.5 mt-5 border-t border-white/5 pt-5">
                  <li className="text-emerald-400 font-bold">⭐ Empresa Verificada</li>
                  <li className="font-semibold text-emerald-300">⭐ Aparece antes das empresas gratuitas</li>
                  <li>⭐ Destaque no Atendente Virtual</li>
                  <li>⭐ Prioridade nas pesquisas</li>
                  <li>⭐ Até 30 fotos</li>
                  <li>⭐ Até 100 produtos</li>
                  <li>⭐ Cadastro de vídeos & Promoções</li>
                  <li>⭐ Botão WhatsApp destacado</li>
                  <li>⭐ Catálogo completo</li>
                  <li className="text-emerald-300/90">⭐ Estatísticas completas (Visualizações, Cliques, WhatsApp, Relatório)</li>
                  <li className="text-emerald-300/90 font-bold">⭐ Badge Premium & Card diferenciado</li>
                </ul>
              </div>

              <div>
                <div className="mt-5 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-[11px] text-emerald-200/90 leading-tight">
                  🚀 <em>O plano Premium aumenta a visibilidade da sua empresa, coloca seu negócio na frente dos concorrentes e gera mais oportunidades de contato.</em>
                </div>

                <a 
                  href={`https://wa.me/5585992862177?text=${encodeURIComponent('Olá! Vi na página inicial e quero contratar o Plano Premium Confiança (R$ 39,90/mês) para minha empresa no portal.')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full block mt-4 bg-emerald-400 hover:bg-emerald-300 text-black font-black text-xs uppercase tracking-wider py-3.5 rounded-2xl text-center shadow-lg transition-all cursor-pointer"
                >
                  🚀 Quero Aparecer Primeiro
                </a>
              </div>
            </div>

            {/* 3. Premium Destaque VIP */}
            <div className="bg-[#0f1016] border-2 border-amber-400/60 hover:border-amber-400 rounded-3xl p-6 flex flex-col justify-between shadow-2xl relative transition-all group scale-[1.02]">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-black px-3.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md">
                MAIS POPULAR
              </div>

              <div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] font-mono text-amber-400 uppercase font-extrabold tracking-widest">Nível 3</span>
                  <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black px-2.5 py-1 rounded-full border border-amber-500/40">
                    ⭐ Premium VIP
                  </span>
                </div>
                <h3 className="text-xl font-black text-amber-400 mt-1 flex items-center gap-1.5">
                  ⭐ Premium Destaque VIP
                </h3>
                <div className="text-3xl font-black text-amber-400 mt-2 font-mono flex items-baseline gap-1">
                  R$ 49,90 <span className="text-xs text-white/50 font-normal">/ MÊS</span>
                </div>

                <ul className="text-xs text-white/90 space-y-2.5 mt-5 border-t border-white/5 pt-5">
                  <li className="text-amber-400 font-bold">⭐ Empresa Verificada & Selo VIP</li>
                  <li className="font-semibold text-amber-300">⭐ Aparece antes das gratuitas e verificadas</li>
                  <li>⭐ Destaque Especial no Atendente Virtual</li>
                  <li>⭐ Prioridade Alta nas pesquisas</li>
                  <li>⭐ Fotos, Produtos & Vídeos Ilimitados</li>
                  <li>⭐ Borda e Iluminação VIP no Portal</li>
                  <li>⭐ Botão WhatsApp em Destaque Especial</li>
                  <li>⭐ Catálogo Completo & Promoções</li>
                  <li className="text-amber-300/90">⭐ Estatísticas completas (Visualizações, Cliques, WhatsApp, Relatórios)</li>
                  <li className="text-amber-300/90 font-bold">⭐ Badge Premium & Card diferenciado</li>
                </ul>
              </div>

              <div>
                <div className="mt-5 p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-[11px] text-amber-200/90 leading-tight">
                  🚀 <em>O plano Premium aumenta a visibilidade da sua empresa, coloca seu negócio na frente dos concorrentes e gera mais oportunidades de contato.</em>
                </div>

                <a 
                  href={`https://wa.me/5585992862177?text=${encodeURIComponent('Olá! Vi na página inicial e quero contratar o Plano Premium Destaque VIP (R$ 49,90/mês) para minha empresa no portal.')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full block mt-4 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 text-black font-black text-xs uppercase tracking-wider py-3.5 rounded-2xl text-center shadow-lg transition-all cursor-pointer"
                >
                  🚀 Quero Aparecer Primeiro
                </a>
              </div>
            </div>

            {/* 4. Premium Patrocinado Top 1 */}
            <div className="bg-[#0f1016] border border-red-500/50 hover:border-red-500 rounded-3xl p-6 flex flex-col justify-between shadow-2xl relative transition-all group">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-red-400 uppercase font-extrabold tracking-widest">Nível Max</span>
                  <span className="bg-red-500/20 text-red-300 text-[10px] font-black px-2.5 py-1 rounded-full border border-red-500/40">
                    🔥 Empresa Recomendada
                  </span>
                </div>
                <h3 className="text-xl font-black text-red-400 mt-1 flex items-center gap-1.5">
                  🔥 Premium Patrocinado (1º Lugar)
                </h3>
                <div className="text-3xl font-black text-red-400 mt-2 font-mono flex items-baseline gap-1">
                  R$ 59,90 <span className="text-xs text-white/50 font-normal">/ MÊS</span>
                </div>

                <ul className="text-xs text-white/90 space-y-2.5 mt-5 border-t border-white/5 pt-5">
                  <li className="text-red-400 font-bold">🔥 1ª Posição Garantida (Top 1)</li>
                  <li className="font-semibold text-red-300">⭐ Posição Fixa Escolhida & Borda Dourada Animada</li>
                  <li>⭐ Prioridade Máxima no Atendente Virtual IA</li>
                  <li>⭐ Recomendação Direta no WhatsApp Chat</li>
                  <li>⭐ Atendimento via IA Prioritário</li>
                  <li>⭐ Fotos, Produtos & Vídeos Ilimitados</li>
                  <li>⭐ Botão WhatsApp em Destaque Absoluto</li>
                  <li>⭐ Estatísticas Completas (Visualizações, Cliques, WhatsApp)</li>
                  <li className="text-red-300/90 font-bold">⭐ Badge Premium & Card diferenciado</li>
                </ul>
              </div>

              <div>
                <div className="mt-5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-2xl text-[11px] text-red-200/90 leading-tight">
                  🚀 <em>O plano Premium aumenta a visibilidade da sua empresa, coloca seu negócio na frente dos concorrentes e gera mais oportunidades de contato.</em>
                </div>

                <a 
                  href={`https://wa.me/5585992862177?text=${encodeURIComponent('Olá! Vi na página inicial e quero contratar o Plano Premium Patrocinado Top 1 (R$ 59,90/mês) para minha empresa no portal.')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full block mt-4 bg-gradient-to-r from-red-600 via-amber-600 to-yellow-500 hover:brightness-110 text-white font-black text-xs uppercase tracking-wider py-3.5 rounded-2xl text-center shadow-lg transition-all cursor-pointer"
                >
                  🚀 Quero Aparecer Primeiro
                </a>
              </div>
            </div>

          </div>

          {/* Scarcity Category Status - Section below plans */}
          <div className="border-t border-white/10 pt-16 mt-8 select-none">
            <div className="max-w-3xl mb-8">
              <span className="text-[var(--primary)] text-xs font-bold font-mono tracking-widest uppercase mb-2 block">VAGAS EXCLUSIVAS DE SEGMENTOS</span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Categorias Oficiais e Vagas
              </h3>
              <p className="text-sm text-white/65 mt-2 leading-relaxed">
                {appData.sections.segments.highlight} Garantimos exclusividade categórica em algumas categorias para parceiros masters, confira o andamento:
              </p>
            </div>

            {/* Table display segments */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              className="mt-8 bg-black/40 hover:bg-black/60 border border-white/5 hover:border-[var(--primary)]/30 rounded-2xl p-4.5 cursor-pointer transition-all duration-300 text-center"
            >
              <span className="text-xs text-[var(--primary)] font-black uppercase tracking-widest font-mono">
                ⚡ {appData.sections.segments.callToAction || 'Anuncie para dominar seu segmento comercial!'}
              </span>
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
                alt="Minha Divulgação" 
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
              <p className="leading-relaxed leading-5 mt-1">{appData.siteInfo.address || 'Fortaleza - Ceará - Brasil'}</p>
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
                      <div className="dev-label-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', margin: 0 }}>
                          📷 Logomarca do Portal / Parceiro
                        </label>
                        <DevFileUploadButton 
                          label="📷 Escolher do Celular / PC" 
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
                          <span style={{ fontSize: '11px', color: '#888' }}>Visualização:</span>
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

                    <h4 style={{ marginTop: '25px', marginBottom: '10px', color: 'var(--primary)', fontWeight: 800 }}>📝 Textos Personalizados da Página (Opcional)</h4>
                    <p style={{ fontSize: '11px', color: '#888', marginBottom: '15px' }}>
                      Configure títulos e subtítulos personalizados para o seu portal. Deixe em branco para usar os textos padrão do sistema.
                    </p>
                    <div className="dev-grid-2">
                      <div className="dev-form-group">
                        <label>Título Principal (Hero)</label>
                        <input 
                          type="text" 
                          className="dev-input" 
                          value={appData.siteInfo.heroTitle || ''} 
                          placeholder="Ex: A maior vitrine digital para seu negócio no Brasil!"
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
                        <label>Subtítulo Principal (Hero)</label>
                        <textarea 
                          className="dev-input" 
                          style={{ minHeight: '42px', resize: 'vertical' }}
                          value={appData.siteInfo.heroSub || ''} 
                          placeholder="Ex: Coloque seu negócio na maior vitrine..."
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
                        <label>Título da Rádio & TV</label>
                        <input 
                          type="text" 
                          className="dev-input" 
                          value={appData.siteInfo.radioTitle || ''} 
                          placeholder="Ex: Rádio & TV Online Ao Vivo"
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
                        <label>Subtítulo da Rádio & TV</label>
                        <textarea 
                          className="dev-input" 
                          style={{ minHeight: '42px', resize: 'vertical' }}
                          value={appData.siteInfo.radioSub || ''} 
                          placeholder="Ex: Acompanhe nossa programação musical completa..."
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
                        <label>Título do Banner CTA</label>
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
                        <label>Subtítulo do Banner CTA</label>
                        <textarea 
                          className="dev-input" 
                          style={{ minHeight: '42px', resize: 'vertical' }}
                          value={appData.siteInfo.ctaSub || ''} 
                          placeholder="Ex: Não perca vendas para seu maior concorrente..."
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
                      <label>Link da Rádio ({customRadioLink ? "Personalizada" : "Universal"} - Apenas Visualização)</label>
                      <input type="text" className="dev-input" value={customRadioLink || universalConfig.radioLink} readOnly style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                      <p style={{ fontSize: '10px', color: 'var(--primary)' }}>
                        {customRadioLink 
                          ? "Sua cidade possui um link de rádio personalizado cadastrado pelo Master." 
                          : "A rádio é universal e controlada pelo administrador master."}
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
                      {(appData?.categories || []).map((cat, idx) => (
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
                                      <option value="__custom__">✍️ Outro (Digitar nicho personalizado...)</option>
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
                                    <DevFileUploadButton 
                                      label="📷 Enviar Foto do Celular" 
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
                                      placeholder="Ex: Fortaleza, São Paulo..." 
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
                                    
                                    <label style={{ marginTop: '15px' }}>Ação do Botão Principal (Site)</label>
                                    <select className="dev-input" value={c.primaryButtonAction || 'minisite'} onChange={(e) => {
                                      const val = e.target.value;
                                      setAppData(prev => {
                                        if (!prev) return prev;
                                        const newList = [...prev.companies];
                                        newList[idx] = { ...newList[idx], primaryButtonAction: val };
                                        return { ...prev, companies: newList };
                                      });
                                    }}>
                                      <option value="minisite">Abrir Mini-Site / Catálogo Interno 📲</option>
                                      <option value="site">Abrir Site Oficial Externo (Website) 🌐</option>
                                      <option value="instagram">Instagram Comercial 📸</option>
                                      <option value="facebook">Página do Facebook 👥</option>
                                    </select>

                                    <label style={{ marginTop: '10px' }}>Texto Personalizado do Botão</label>
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
                                      placeholder="Ex: Abrir Instagram, Visitar Loja (Vazio = Padrão)" 
                                    />
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
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                      <h4 style={{ margin: 0, fontWeight: 900, fontSize: '14px', color: '#fff' }}>{ad.name}</h4>
                                      {ad.isBlocked && (
                                        <span style={{ color: '#fff', background: '#ef4444', fontSize: '9px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                                          🚫 Bloqueado
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
                                      alert(`Entrando no painel de "${ad.name}" como Administrador. Você pode fazer alterações no perfil, catálogo e produtos!`);
                                    }}
                                  >
                                    👁️ Ver / Editar Loja
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
                                    {ad.isBlocked ? '🔓 Desbloquear' : '🚫 Bloquear'}
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
                              
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed rgba(255, 255, 255, 0.05)' }}>
                                <div className="dev-form-group" style={{ margin: 0 }}>
                                  <label style={{ fontSize: '11px', color: '#bbb', display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nível do Plano:</label>
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
                                    <option value="gratuito">⚪ Gratuito (Sem Destaque)</option>
                                    <option value="verificado">✔ Verificado (Selo de Confiança)</option>
                                    <option value="destaque">⭐ Destaque VIP (Selo Estelar)</option>
                                    <option value="patrocinado">🔥 Patrocinado (Top 1º Lugar + Borda Dourada)</option>
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
                                  <label style={{ fontSize: '11px', color: '#bbb', display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Posição na Categoria (1º, 2º, 3º lugar):</label>
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
                                        alert(`Posição na categoria alterada para ${posVal === 0 ? 'Automática' : posVal + 'º Lugar'}!`);
                                      } catch(ee) {
                                        console.error(ee);
                                      } finally {
                                        setIsAdLoading(false);
                                      }
                                    }}
                                  >
                                    <option value={0}>Automática (Por Pontuação/Visualizações)</option>
                                    <option value={1}>🥇 1º Lugar na Categoria (Exclusivo)</option>
                                    <option value={2}>🥈 2º Lugar na Categoria</option>
                                    <option value={3}>🥉 3º Lugar na Categoria</option>
                                  </select>
                                </div>

                                <div className="dev-form-group" style={{ margin: 0 }}>
                                  <label style={{ fontSize: '11px', color: '#bbb', display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Posição Fixa no Topo:</label>
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
                                        alert(`Posição fixa de "${ad.name}" alterada para ${posVal === 0 ? 'Ordem Padrão' : `${posVal}º Lugar`}`);
                                      } catch(ee) {
                                        console.error(ee);
                                      } finally {
                                        setIsAdLoading(false);
                                      }
                                    }}
                                  >
                                    <option value={0}>0 - Ordem por Prioridade/Plano</option>
                                    <option value={1}>🥇 1º Lugar Absoluto</option>
                                    <option value={2}>🥈 2º Lugar Absoluto</option>
                                    <option value={3}>🥉 3º Lugar Absoluto</option>
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
                                        alert(`Data de expiração de "${ad.name}" atualizada para ${newExpiryStr}!`);
                                      } catch(ee) {
                                        console.error(ee);
                                        alert("Falha ao salvar data de expiração.");
                                      } finally {
                                        setIsAdLoading(false);
                                      }
                                    }}
                                  />
                                  <small style={{ color: (ad.expiresAt && ad.expiresAt < new Date().toISOString().split('T')[0] && !ad.hasPlan) ? '#ff4444' : '#888', fontSize: '10px', marginTop: '4px', display: 'block' }}>
                                    {ad.hasPlan ? 'Plano Ativo (VIP)' : ad.expiresAt ? (ad.expiresAt < new Date().toISOString().split('T')[0] ? '❌ Expirado' : `⏱️ Expira em ${ad.expiresAt}`) : 'Sem data de expiração'}
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
                                          alert(`Plano de "${ad.name}" renovado por +30 dias! Nova expiração: ${newExpiryStr.split('-').reverse().join('/')}`);
                                        } catch(ee) {
                                          console.error(ee);
                                          alert("Falha ao renovar o plano.");
                                        } finally {
                                          setIsAdLoading(false);
                                        }
                                      }}
                                    >
                                      ⚡ Renovar +30 Dias (Sem Data)
                                    </button>
                                  </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: '5px' }}>
                                  <span style={{ fontSize: '12px', color: '#fff' }}>
                                    Produtos: <strong style={{ color: ad.hasPlan ? 'var(--primary)' : '#25D366' }}>{itemsCount}</strong> {(!ad.hasPlan && itemsCount >= 6 && (!ad.expiresAt || ad.expiresAt < new Date().toISOString().split('T')[0])) ? '⚠️' : '✅'}
                                  </span>
                                  <small style={{ color: ad.hasPlan ? 'var(--primary)' : '#34d399', fontSize: '10.5px', marginTop: '2px' }}>
                                    {ad.hasPlan 
                                      ? 'Plano Premium VIP (Ativo)' 
                                      : 'Cadastro Gratuito (Ativo)'
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

                {activeTab === 'vídeos' && (
                  <div className="dev-forms-container">
                    <div style={{ background: 'rgba(255, 138, 0, 0.1)', border: '1px solid rgba(255, 138, 0, 0.2)', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
                      <h4 style={{ color: '#ff8a00', margin: 0, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                              <span style={{ fontSize: '10px', fontWeight: 900, color: '#ff8a00' }}>VÍDEO #{idx + 1}</span>
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
                                <DevFileUploadButton 
                                  label="📷 Enviar Foto do Celular" 
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
                                <DevFileUploadButton 
                                  label="📷 Enviar Foto do Celular" 
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
                              <DevFileUploadButton 
                                label="📷 Enviar Print do Celular" 
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                          <label style={{ margin: 0 }}>QR Code de Pagamento PIX (Link de Imagem)</label>
                          <DevFileUploadButton 
                            label="📷 Enviar Foto QR Code" 
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
                                  }}>✕</button>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                      {aff.logo ? (
                                        <img src={aff.logo} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #333' }} alt="" referrerPolicy="no-referrer" />
                                      ) : (
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', border: '1px solid #333' }}>👤</div>
                                      )}
                                      <div>
                                        <h4 style={{ color: 'var(--primary)', margin: 0 }}>{aff.name}</h4>
                                        <code style={{ fontSize: '10px', color: '#888' }}>Código: {aff.code}</code>
                                        {aff.customTitle && <div style={{ fontSize: '10px', color: '#aaa', marginTop: '2px' }}>Portal: {aff.customTitle}</div>}
                                      </div>
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
                                        <div style={{ fontWeight: 900, color: '#ff8a00' }}>{aff.sales || 0}</div>
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

                                    <label style={{ marginTop: '15px', display: 'block', color: 'var(--primary)', fontWeight: 'bold' }}>📻 Configuração de Web Rádio (Exclusivo para Parceiros Rádio)</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px', background: 'rgba(251, 191, 36, 0.03)', border: '1px dashed rgba(251, 191, 36, 0.15)', borderRadius: '12px', padding: '12px', marginBottom: '10px' }}>
                                      <div className="dev-form-group">
                                        <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>Ativar Player de Rádio no Topo (Início da Página)?</label>
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
                                          <option value="nao">Não (Layout Padrão) ❌</option>
                                          <option value="sim">Sim (Ativar Player no Topo) 📻</option>
                                        </select>
                                        <small style={{ color: '#aaa', fontSize: '0.7rem' }}>Se ativado, um player de rádio exclusivo aparecerá no início da página (logo abaixo da introdução) apenas para este parceiro.</small>
                                      </div>
                                      <div className="dev-form-group">
                                        <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>Link de Transmissão da Rádio (Streaming URL)</label>
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
                                        <small style={{ color: '#aaa', fontSize: '0.7rem' }}>Caso fique vazio, usará o link de rádio padrão do portal.</small>
                                      </div>
                                    </div>

                                    <label style={{ marginTop: '15px', display: 'block', color: 'var(--primary)', fontWeight: 'bold' }}>📝 Textos Personalizados da Página (Opcional)</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                                      <div className="dev-form-group">
                                        <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>Título Principal (Hero)</label>
                                        <input 
                                          type="text" 
                                          className="dev-input" 
                                          style={{ width: '100%' }}
                                          value={aff.heroTitle || ''} 
                                          placeholder="Ex: A maior vitrine digital para seu negócio no Brasil!"
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
                                        <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>Subtítulo Principal (Hero)</label>
                                        <textarea 
                                          className="dev-input" 
                                          style={{ width: '100%', minHeight: '60px', resize: 'vertical' }}
                                          value={aff.heroSub || ''} 
                                          placeholder="Ex: Coloque seu negócio na maior vitrine..."
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
                                        <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>Título da Rádio & TV</label>
                                        <input 
                                          type="text" 
                                          className="dev-input" 
                                          style={{ width: '100%' }}
                                          value={aff.radioTitle || ''} 
                                          placeholder="Ex: Rádio & TV Online Ao Vivo"
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
                                        <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>Subtítulo da Rádio & TV</label>
                                        <textarea 
                                          className="dev-input" 
                                          style={{ width: '100%', minHeight: '60px', resize: 'vertical' }}
                                          value={aff.radioSub || ''} 
                                          placeholder="Ex: Acompanhe nossa programação musical completa..."
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
                                        <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>Título do Banner Call-to-Action (CTA)</label>
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
                                        <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>Subtítulo do Banner Call-to-Action (CTA)</label>
                                        <textarea 
                                          className="dev-input" 
                                          style={{ width: '100%', minHeight: '60px', resize: 'vertical' }}
                                          value={aff.ctaSub || ''} 
                                          placeholder="Ex: Não perca vendas para seu maior concorrente..."
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
                                  🔥 DESTAQUE
                                </span>
                              )}
                              {pType === 'destaque' && (
                                <span style={{ background: '#f59e0b', color: '#000', fontSize: '8px', fontWeight: 900, padding: '1px 5px', borderRadius: '10px' }}>
                                  ⭐ RECOMENDADO
                                </span>
                              )}
                              {pType === 'verificado' && (
                                <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontSize: '8px', fontWeight: 900, padding: '1px 5px', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                                  ✔ VERIFICADO
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="chat-result-actions" style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
                          <a href={`https://wa.me/${(c.wa || '').replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="chat-result-wa" style={{ flex: 1 }}>
                            WhatsApp 💬
                          </a>
                          {c.ig && c.ig !== '' && c.ig !== '#' && (
                            <a href={c.ig} target="_blank" rel="noreferrer" className="chat-result-wa" style={{ flex: 1, background: '#E1306C' }}>
                              IG 📸
                            </a>
                          )}
                          {c.website && c.website !== '' && (
                            <a href={c.website} target="_blank" rel="noreferrer" className="chat-result-wa" style={{ flex: 1, background: 'var(--primary)', color: 'black' }}>
                              Web 🌐
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
                            🔥 EMPRESAS RECOMENDADAS EM DESTAQUE:
                          </div>
                          {recommended.map(renderCard)}
                        </div>
                      )}

                      {others.length > 0 && (
                        <div>
                          {recommended.length > 0 && (
                            <div style={{ fontSize: '10px', fontWeight: 800, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', marginTop: '10px' }}>
                              📍 OUTROS ESTABELECIMENTOS LOCAIS:
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
                  title="Compartilhar Link de Divulgação"
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
                              ⭐ {average.toFixed(1)} ({count})
                            </div>
                          );
                        } else {
                          return (
                            <div className="flex items-center gap-1 bg-white/5 border border-white/10 text-white/40 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full select-none font-mono">
                              ⭐ Novo
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

                  {/* Reviews Section */}
                  {(() => {
                    const { average, count, reviewsList } = getCompanyReviewStats(company.id);
                    return (
                      <div className="bg-[#0b0c10] border border-white/5 rounded-3xl p-6 sm:p-8 shadow-xl">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                          <div>
                            <h3 className="text-sm font-black font-mono uppercase tracking-[0.2em] text-[var(--primary)]">AVALIAÇÕES</h3>
                            <p className="text-xs text-white/50 mt-1">O que os clientes dizem sobre {company.name}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {count > 0 ? (
                              <div className="text-right">
                                <div className="text-sm font-extrabold text-white flex items-center gap-1 justify-end">
                                  <span className="text-amber-400">★</span> {average.toFixed(1)} / 5.0
                                </div>
                                <div className="text-[10px] text-white/40 font-bold">{count} {count === 1 ? 'avaliação' : 'avaliações'}</div>
                              </div>
                            ) : (
                              <span className="text-xs text-white/40 font-bold">Nenhuma avaliação ainda</span>
                            )}
                          </div>
                        </div>

                        {/* Reviews List */}
                        {count === 0 ? (
                          <div className="text-center py-8 text-white/45 text-xs">
                            Seja o primeiro a avaliar esta empresa! Deixe sua opinião abaixo.
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
                                        ★
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
                              ⭐ Deixar Avaliação
                            </button>
                          ) : (
                            <div className="bg-neutral-900/60 border border-white/5 rounded-2xl p-5 flex flex-col gap-4">
                              <h4 className="text-xs font-black text-[var(--primary)] uppercase tracking-wider">Nova Avaliação</h4>
                              
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
                                        ★
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
                                <label className="text-[10px] text-white/50 uppercase font-extrabold">Seu Comentário *</label>
                                <textarea
                                  placeholder="Escreva sua opinião sincera sobre o atendimento, qualidade ou produtos..."
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
                                      alert("Por favor, preencha o comentário.");
                                      return;
                                    }
                                    const success = await addReview(company.id, newCompanyReviewForm.rating, newCompanyReviewForm.author, newCompanyReviewForm.comment);
                                    if (success) {
                                      alert("Avaliação registrada com sucesso! Muito obrigado.");
                                      setIsCompanyReviewFormOpen(false);
                                    } else {
                                      alert("Desculpe, ocorreu um erro ao registrar sua avaliação.");
                                    }
                                  }}
                                  className="px-5 py-2.5 bg-[var(--primary)] hover:bg-[#ffe066] text-black rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors duration-150 cursor-pointer"
                                >
                                  Enviar Avaliação
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
                          🛠️ Serviços Disponíveis & Portfólio
                        </h3>
                        <p className="text-xs text-white/50 mt-1">Conheça nossa carteira de serviços profissionais e solicite seu orçamento sem compromisso.</p>
                      </div>

                      {items.length === 0 ? (
                        <div className="text-center py-12 flex-1 flex flex-col items-center justify-center">
                          <span className="text-4xl">💼</span>
                          <h4 className="text-white/80 font-bold mt-4">Nenhum serviço listado</h4>
                          <p className="text-white/45 text-xs max-w-xs mt-1">Você pode solicitar um orçamento personalizado no formulário ao lado ou no WhatsApp!</p>
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
                                      const textMsg = `Olá! Gostaria de solicitar um orçamento para o serviço comercial: *${item.name}* no portal ${appData.siteInfo.name}`;
                                      window.open(`https://wa.me/${company.wa.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(textMsg)}`, '_blank');
                                    }}
                                    className="px-4 py-2 rounded-xl bg-[var(--primary)]/10 hover:bg-[var(--primary)] text-[var(--primary)] hover:text-black border border-[var(--primary)]/30 text-[10px] font-black uppercase tracking-widest transition-all duration-200 flex items-center gap-1.5"
                                  >
                                    <MessageSquare size={12} /> Solicitar Orçamento
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
                          📅 Serviços para Agendamento
                        </h3>
                        <p className="text-xs text-white/50 mt-1">Selecione o serviço e agende seu horário com total praticidade.</p>
                      </div>

                      {items.length === 0 ? (
                        <div className="text-center py-12 flex-1 flex flex-col items-center justify-center">
                          <span className="text-4xl">📅</span>
                          <h4 className="text-white/80 font-bold mt-4">Nenhum serviço disponível</h4>
                          <p className="text-white/45 text-xs max-w-xs mt-1">Você pode solicitar um agendamento direto pelo formulário de horário ou no WhatsApp!</p>
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
                                  <p className="text-xs text-white/55 leading-relaxed mt-1">{item.desc || 'Atendimento agendado com horário reservado.'}</p>
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
                                    <Calendar size={12} /> Agendar Horário
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
                            <div className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-1">
                              {cartItemsArr.map((car: any) => (
                                <div key={car.item.id} className="bg-neutral-900 border border-white/5 rounded-xl p-3 flex justify-between items-center gap-2 hover:border-white/10 transition-all">
                                  <div className="flex-1 min-w-0 pr-1">
                                    <h4 className="text-xs font-bold text-white truncate">{car.item.name}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-[10px] text-white/50 font-mono">
                                        {car.item.price ? `R$ ${parseFloat(car.item.price).toFixed(2).replace('.', ',')}` : 'Grátis'}
                                      </span>
                                      
                                      {/* Controles de Quantidade (- / +) */}
                                      <div className="flex items-center gap-1 bg-black/50 border border-white/10 rounded px-1.5 py-0.5">
                                        <button
                                          type="button"
                                          title="Diminuir quantidade"
                                          onClick={() => {
                                            setShoppingCart(prev => {
                                              const existing = prev[car.item.id];
                                              if (!existing) return prev;
                                              if (existing.count <= 1) {
                                                const copy = { ...prev };
                                                delete copy[car.item.id];
                                                return copy;
                                              }
                                              return { ...prev, [car.item.id]: { ...existing, count: existing.count - 1 } };
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
                                              [car.item.id]: { ...prev[car.item.id], count: (prev[car.item.id]?.count || 0) + 1 }
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
                                      {car.item.price ? `R$ ${(parseFloat(car.item.price) * car.count).toFixed(2).replace('.', ',')}` : 'Consulta'}
                                    </span>
                                    
                                    {/* Botão para Excluir Item */}
                                    <button
                                      type="button"
                                      title="Excluir este item da sacola"
                                      onClick={() => {
                                        setShoppingCart(prev => {
                                          const copy = { ...prev };
                                          delete copy[car.item.id];
                                          return copy;
                                        });
                                      }}
                                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/30 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/50 transition-all cursor-pointer flex items-center justify-center shrink-0"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                              ))}
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
                                  <span className="text-[10px] text-[var(--primary)] font-black uppercase tracking-wider block mb-1">📍 Endereço de Entrega</span>
                                  
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
                                      <label className="text-[9px] text-white/40 uppercase font-bold block mb-1">Número *</label>
                                      <input 
                                        type="text"
                                        placeholder="Nº"
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
                                    <label className="text-[9px] text-white/40 uppercase font-bold block mb-1">Ponto de Referência (Opcional)</label>
                                    <input 
                                      type="text"
                                      placeholder="Ex: Próximo à padaria"
                                      value={customerReference}
                                      onChange={(e) => setCustomerReference(e.target.value)}
                                      className="w-full bg-[#11111a] border border-white/10 outline-none rounded-lg px-3 py-2 text-xs text-white"
                                    />
                                  </div>

                                  <div>
                                    <label className="text-[9px] text-white/40 uppercase font-bold block mb-1">Instruções / Observações de Entrega</label>
                                    <textarea 
                                      placeholder="Deixe uma mensagem para o entregador ou observações do pedido"
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
                                  <label className="text-[10px] text-white/50 uppercase tracking-wider font-extrabold block mb-1">Instruções / Observações do Pedido</label>
                                  <textarea 
                                    placeholder="Mesa, talheres ou ponto de referência se necessário"
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
                                    <span>⚡ PIX Chave</span>
                                    <span className="text-[9px] font-mono text-white/40 uppercase">Direto</span>
                                  </button>
                                  <button 
                                    type="button"
                                    onClick={() => setPaymentMethod('cartao_entrega')}
                                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${paymentMethod === 'cartao_entrega' ? 'bg-neutral-900 text-[var(--primary)] border-[var(--primary)]/30' : 'bg-[#11111a] text-white/60 border-white/5 hover:border-white/10'}`}
                                  >
                                    <span>💳 Cartão na Entrega</span>
                                    <span className="text-[9px] font-mono text-white/40 uppercase">Maquininha</span>
                                  </button>
                                  {deliveryMethod === 'retirada' && (
                                    <button 
                                      type="button"
                                      onClick={() => setPaymentMethod('cartao_retirada')}
                                      className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${paymentMethod === 'cartao_retirada' ? 'bg-neutral-900 text-[var(--primary)] border-[var(--primary)]/30' : 'bg-[#11111a] text-white/60 border-white/5 hover:border-white/10'}`}
                                    >
                                      <span>🏪 Cartão na Retirada</span>
                                      <span className="text-[9px] font-mono text-white/40 uppercase">No balcão</span>
                                    </button>
                                  )}
                                  <button 
                                    type="button"
                                    onClick={() => setPaymentMethod('dinheiro')}
                                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${paymentMethod === 'dinheiro' ? 'bg-neutral-900 text-[var(--primary)] border-[var(--primary)]/30' : 'bg-[#11111a] text-white/60 border-white/5 hover:border-white/10'}`}
                                  >
                                    <span>💵 Dinheiro</span>
                                    <span className="text-[9px] font-mono text-white/40 uppercase">Cédulas</span>
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
                                        {company.pixKey || "Chave não configurada"}
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
                                        <span className="text-white/40">Instituição:</span>
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
                                      {cashChangeNeeded ? 'Sim' : 'Não'}
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
                                  alert("Por favor, preencha todos os campos obrigatórios do endereço de entrega.");
                                  return;
                                }
                                
                                const finalDeliveryFee = deliveryMethod === 'entrega' ? parseFloat(company.deliveryFee || '0') || 0 : 0;
                                const finalTotal = subtotal + finalDeliveryFee;

                                // Format perfect structured whatsapp message
                                let textMsg = `*🛒 NOVO PEDIDO - ${company.name.toUpperCase()}*\n`;
                                textMsg += `====================================\n`;
                                textMsg += `*👤 CLIENTE:* ${cartCustomerName}\n`;
                                textMsg += `*📱 WHATSAPP:* ${customerPhone}\n`;
                                textMsg += `*🛵 FORMA:* ${deliveryMethod === 'entrega' ? "ENTREGA" : "RETIRADA NA LOJA"}\n`;
                                
                                if (deliveryMethod === 'entrega') {
                                  textMsg += `------------------------------------\n`;
                                  textMsg += `*📍 ENDEREÇO DE ENTREGA:*\n`;
                                  textMsg += `*Rua/Av:* ${customerStreet}, Nº ${customerNumber}\n`;
                                  textMsg += `*Bairro:* ${customerNeighborhood}\n`;
                                  textMsg += `*Cidade/UF:* ${customerCity} - ${customerState.toUpperCase()}\n`;
                                  if (customerCep) textMsg += `*CEP:* ${customerCep}\n`;
                                  if (customerComplement) textMsg += `*Comp:* ${customerComplement}\n`;
                                  if (customerReference) textMsg += `*Ref:* ${customerReference}\n`;
                                }
                                
                                if (cartCustomerDetails) {
                                  textMsg += `------------------------------------\n`;
                                  textMsg += `*📝 OBSERVAÇÕES:*\n${cartCustomerDetails}\n`;
                                }
                                
                                textMsg += `====================================\n`;
                                textMsg += `*💳 PAGAMENTO:* `;
                                if (paymentMethod === 'pix_chave') textMsg += `PIX CHAVE`;
                                else if (paymentMethod === 'pix_qrcode') textMsg += `PIX QR CODE`;
                                else if (paymentMethod === 'cartao_entrega') textMsg += `CARTÃO NA ENTREGA`;
                                else if (paymentMethod === 'cartao_retirada') textMsg += `CARTÃO NA RETIRADA`;
                                else if (paymentMethod === 'dinheiro') {
                                  textMsg += `DINHEIRO`;
                                  if (cashChangeNeeded && cashChangeFor) {
                                    textMsg += ` (Troco para ${cashChangeFor})`;
                                  }
                                }
                                textMsg += `\n`;
                                
                                if (attachedProofName) {
                                  textMsg += `*📎 COMPROVANTE PIX:* Anexado (${attachedProofName})\n`;
                                }
                                
                                textMsg += `====================================\n`;
                                textMsg += `*📦 ITENS PEDIDOS:*\n`;
                                
                                cartItemsArr.forEach((c: any) => {
                                  textMsg += `• ${c.count}x ${c.item.name} (${c.item.price ? `R$ ${parseFloat(c.item.price).toFixed(2).replace('.', ',')}` : 'Consulta'}) - R$ ${(parseFloat(c.item.price || '0') * c.count).toFixed(2).replace('.', ',')}\n`;
                                });
                                
                                textMsg += `====================================\n`;
                                textMsg += `*Subtotal:* R$ ${subtotal.toFixed(2).replace('.', ',')}\n`;
                                if (finalDeliveryFee > 0) {
                                  textMsg += `*Taxa de Entrega:* R$ ${finalDeliveryFee.toFixed(2).replace('.', ',')}\n`;
                                }
                                textMsg += `*TOTAL GERAL:* R$ ${finalTotal.toFixed(2).replace('.', ',')}\n\n`;
                                textMsg += `Enviado através do portal *${appData.siteInfo.name}*!\n`;
                                textMsg += `Por favor, confirme meu pedido. Obrigado!`;
                                
                                window.open(`https://wa.me/${company.wa.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(textMsg)}`, '_blank');
                              }}
                              className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest text-center flex items-center justify-center gap-2 transition-all duration-300 shadow-lg mt-2 cursor-pointer shadow-emerald-500/10"
                            >
                              <Smartphone size={14} /> Confirmar Pedido (WhatsApp)
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
                    <div id="quote-side-form" className="bg-[#0b0c10] border border-white/5 rounded-3xl p-6 sm:p-8 shadow-xl relative sticky top-6">
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

                  {/* Option C: Agendamento form (for scheduling pages) */}
                  {siteType === 'agendamento' && (
                    <div className="bg-[#0b0c10] border border-white/5 rounded-3xl p-6 sm:p-8 shadow-xl relative sticky top-6">
                      <h3 className="text-sm font-black font-mono uppercase tracking-[0.2em] text-[var(--primary)] flex items-center gap-2">
                        <Calendar size={16} /> AGENDAMENTO DE HORÁRIO
                      </h3>
                      <p className="text-xs text-white/45 mt-2 leading-relaxed">
                        Escolha o serviço, selecione a data e o horário desejados e confirme o seu agendamento direto no WhatsApp!
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
                          <label className="text-[10px] text-white/50 uppercase tracking-widest font-extrabold">Serviço Desejado *</label>
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
                            <label className="text-[10px] text-white/50 uppercase tracking-widest font-extrabold">Horário *</label>
                            <input 
                              type="time"
                              id="booking-time"
                              defaultValue="09:00"
                              className="w-full bg-[#11111a] border border-white/10 focus:border-[var(--primary)] outline-none rounded-xl px-3 py-2.5 text-xs text-white font-mono"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-white/50 uppercase tracking-widest font-extrabold">Observações / Preferências</label>
                          <textarea 
                            placeholder="Ex: Preferência de profissional, orientações ou observações..."
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
                              alert("Por favor, selecione a data e o horário desejados.");
                              return;
                            }

                            const formattedDate = dateVal.split('-').reverse().join('/');
                            
                            let textMsg = `*📅 SOLICITAÇÃO DE AGENDAMENTO - ${company.name.toUpperCase()}*\n`;
                            textMsg += `====================================\n`;
                            textMsg += `*Cliente:* ${clientName}\n`;
                            textMsg += `*WhatsApp:* ${clientPhone}\n`;
                            textMsg += `*Serviço:* ${serv}\n`;
                            textMsg += `*Data:* ${formattedDate}\n`;
                            textMsg += `*Horário:* ${timeVal}hs\n`;
                            if (notes) {
                              textMsg += `*Observações:* ${notes}\n`;
                            }
                            textMsg += `====================================\n`;
                            textMsg += `Gostaria de confirmar a disponibilidade deste horário no portal *${appData.siteInfo.name}*!`;
                            
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
                        Cadastrar Negócio
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
                          🚀 Cadastre Seu Negócio no Portal
                        </h2>
                        <p className="text-xs text-white/50 mt-1">Sua empresa será listada automaticamente de forma profissional e interativa.</p>
                        <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-3.5 text-[11px] text-emerald-300 mt-3 font-medium leading-relaxed">
                          🎁 <strong>Cadastro 100% Gratuito:</strong> Sua empresa será divulgada gratuitamente na vitrine oficial da cidade! Sem taxas obrigatórias para cadastrar seu negócio e produtos.
                        </div>

                        {/* Video Tutorial Box */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mt-4 overflow-hidden flex flex-col gap-3">
                          <div className="flex items-center gap-2 text-white font-semibold text-xs tracking-wide uppercase">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            🎥 Vídeo Tutorial: Passo a Passo do Cadastro
                          </div>
                          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black/60 border border-white/10">
                            <iframe 
                              className="absolute top-0 left-0 w-full h-full"
                              src="https://www.youtube.com/embed/iJg2RtDqh-0" 
                              title="Tutorial de Cadastro"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                              allowFullScreen
                            ></iframe>
                          </div>
                          <p className="text-[10px] text-white/40 leading-relaxed">
                            Assista ao vídeo de 1 minuto acima para aprender a preencher corretamente o cadastro e publicar seu mini-site instantaneamente!
                          </p>
                        </div>
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
                            <option value="__custom__">✍️ Outro (Digitar nicho personalizado...)</option>
                          </select>
                          
                          {! (appData?.categories || []).some((cat: any) => cat.name === adRegisterForm.category) && (
                            <div className="flex flex-col gap-1.5 mt-2">
                              <label className="text-[9px] text-[var(--primary)] uppercase font-black">Escreva o Nome do seu Nicho *</label>
                              <input 
                                type="text"
                                value={adRegisterForm.category}
                                onChange={(e) => setAdRegisterForm(prev => ({ ...prev, category: e.target.value }))}
                                placeholder="Ex: Pizzaria, Fretes, Ar Condicionado, Informática..."
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
                            <DirectFileUploadButton 
                              label="📷 Escolher do Celular" 
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
                            placeholder="Ex: Fortaleza, São Paulo..."
                            value={adRegisterForm.city}
                            onChange={(e) => setAdRegisterForm(prev => ({ ...prev, city: e.target.value }))}
                            className="w-full bg-[#11111a] border border-white/10 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3 text-xs text-white"
                            required
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
                          const { email, password, name, wa, category, type, logo, ig, desc, state, city } = adRegisterForm;
                          if (!email || !password || !name || !wa || !state || !city) {
                            alert("Por favor, preencha todos os campos obrigatórios (E-mail, Senha, Nome da Empresa, WhatsApp, Estado e Cidade).");
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
                            
                            const creationDate = new Date();
                            const trialDays = 20;
                            const expiryDate = new Date(creationDate.getTime() + (trialDays * 24 * 60 * 60 * 1000));
                            const expiresAtStr = expiryDate.toISOString().split('T')[0];
                            const createdAtStr = creationDate.toISOString();

                            const newCompany = {
                              id: activeSlug,
                              name: name.trim(),
                              category: category,
                              desc: desc.trim() || 'Sem descrição cadastrada.',
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
                  {/* Registration Confirmation Banner & Public Preview Link */}
                  <div className="bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/15 border-2 border-emerald-500/40 rounded-2xl p-5 md:p-6 shadow-[0_0_30px_rgba(16,185,129,0.15)] flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-black flex items-center justify-center text-2xl font-black shrink-0 shadow-lg">
                        🎉
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-black text-white leading-snug">
                          Sua empresa já está publicada e visível para milhares de clientes!
                        </h3>
                        <p className="text-xs text-white/70 mt-1 font-medium">
                          Seu perfil comercial e botão de WhatsApp estão ativos no guia da sua cidade.
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
                        👁️ Ver Perfil Público
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
                        🔗 Copiar Link
                      </button>
                    </div>
                  </div>

                  {/* Dashboard Header Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5 mt-4">
                    <div>
                      <h2 className="text-2xl font-black text-white tracking-tight flex flex-wrap items-center gap-1.5">
                        ⚙️ Painel de Controle • {currentAdvertiser.company.name}
                        {user?.isAdmin && (
                          <span className="bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md ml-2 animate-pulse">
                            Modo Administrador
                          </span>
                        )}
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

                  {/* Plan Status Banner */}
                  {isAdExpired ? (
                    <div className="bg-red-500/15 border border-red-500/30 rounded-2xl p-5 md:p-6 text-center shadow-lg">
                      <span className="text-3xl">⚠️</span>
                      <h3 className="text-lg font-black text-white uppercase mt-2">Conta Suspensa / Bloqueada</h3>
                      <p className="text-xs text-white/70 mt-2 max-w-lg mx-auto leading-relaxed">
                        Sua conta foi suspensa temporariamente. Para reativar o seu acesso e continuar gerenciando seus produtos, entre em contato com o suporte oficial.
                      </p>
                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        <a 
                          href={`https://wa.me/${appData?.siteInfo?.phone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Olá! Preciso de ajuda para reativar minha conta ${currentAdvertiser?.company?.name}.`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-150 shadow decoration-transparent"
                        >
                          💬 Falar com Suporte no WhatsApp
                        </a>
                      </div>
                    </div>
                  ) : !currentAdvertiser?.company?.hasPlan ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-left">
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded font-black uppercase tracking-widest">✔ Cadastro Gratuito Ativo</span>
                        <p className="text-xs text-white/80 mt-2">
                          Sua empresa possui <strong>cadastro gratuito permanente</strong> no portal! Quer aparecer no topo e receber mais clientes no WhatsApp?
                        </p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setIsCheckoutOpen(true)}
                        className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:brightness-110 text-black rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-150 shrink-0 cursor-pointer shadow-lg"
                      >
                        ⭐ Ativar Plano Premium
                      </button>
                    </div>
                  ) : (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-left">
                        <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2.5 py-1 rounded font-black uppercase tracking-widest">⭐ Plano Premium VIP Ativo</span>
                        <p className="text-xs text-white/80 mt-2">
                          Sua empresa possui <strong>prioridade máxima de exibição</strong> no portal e no Atendente Virtual!
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
                        <h3 className="text-xs font-black font-mono uppercase tracking-[0.2em] text-[var(--primary)]">Link de Divulgação Oficial</h3>
                        <p className="text-[11px] text-white/50 mt-0.5">Use este link exclusivo e bonito para divulgar sua empresa nas redes sociais!</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch gap-2 bg-[#11111a] border border-white/10 rounded-2xl p-2.5">
                      <input 
                        type="text" 
                        readOnly 
                        value={`${window.location.origin}/#/${tenantId || 'fortaleza'}?id=${currentAdvertiser.id}`}
                        className="flex-1 bg-transparent border-none outline-none text-xs text-white/90 font-mono px-2 py-1 select-all"
                      />
                      <button
                        onClick={() => {
                          const shareUrl = `${window.location.origin}/#/${tenantId || 'fortaleza'}?id=${currentAdvertiser.id}`;
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
                          <>✅ Copiado!</>
                        ) : (
                          <>📋 Copiar Link</>
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
                      📊 Métricas & Visibilidade
                    </button>
                    <button 
                      onClick={() => { setAdDashboardTab('perfil'); setEditingItemIndex(null); }}
                      className={`text-xs font-black uppercase tracking-wider pb-3 px-3 transition-all border-b-2 hover:text-white shrink-0 cursor-pointer ${adDashboardTab === 'perfil' ? 'border-[var(--primary)] text-white' : 'border-transparent text-white/40'}`}
                    >
                      ⚙️ Perfil & Dados
                    </button>
                    <button 
                      onClick={() => { setAdDashboardTab('catalogo'); setEditingItemIndex(null); }}
                      className={`text-xs font-black uppercase tracking-wider pb-3 px-3 transition-all border-b-2 hover:text-white shrink-0 cursor-pointer ${adDashboardTab === 'catalogo' ? 'border-[var(--primary)] text-white' : 'border-transparent text-white/40'}`}
                    >
                      📦 Produtos & Serviços ({currentAdvertiser.company.items?.length || 0})
                    </button>
                    <button 
                      onClick={() => { setAdDashboardTab('plano'); setEditingItemIndex(null); }}
                      className={`text-xs font-black uppercase tracking-wider pb-3 px-3 transition-all border-b-2 hover:text-white shrink-0 cursor-pointer ${adDashboardTab === 'plano' ? 'border-[var(--primary)] text-white' : 'border-transparent text-white/40'}`}
                    >
                      💎 Meu Plano & Benefícios
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
                              Sua empresa está na posição <span className="text-amber-400 font-mono">#{rankInfo.position} de {rankInfo.totalInCat}</span> concorrentes.
                            </h3>
                            <p className="text-xs text-white/70 mt-2 max-w-2xl leading-relaxed">
                              {currentPlan === 'gratuito' 
                                ? 'As empresas com Plano Premium aparecem antes das gratuitas nas buscas do portal e no Atendente Virtual, recebendo até 10x mais contatos no WhatsApp!' 
                                : 'Sua empresa possui posição de alta visibilidade e prioridade máxima nas pesquisas dos clientes no portal!'}
                            </p>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => setIsCheckoutOpen(true)}
                            className="z-10 shrink-0 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 text-black font-black text-xs uppercase tracking-widest px-6 py-4 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer flex items-center gap-2"
                          >
                            ⭐ Quero Aparecer em Primeiro
                          </button>
                        </div>

                        {/* Automated Conversion Trigger Nudges */}
                        {currentPlan === 'gratuito' && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-[#11121d] border border-amber-500/20 p-4 rounded-2xl flex flex-col justify-between">
                              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase font-mono">
                                <span>📊</span> Tráfego do Perfil
                              </div>
                              <p className="text-xs text-white/80 mt-2 leading-relaxed">
                                Sua empresa recebeu <strong className="text-white">{views} visualizações</strong>. Você está atrás de <strong className="text-amber-400">{rankInfo.premiumInCat || 1} empresas Premium</strong> na sua categoria.
                              </p>
                              <button 
                                type="button" 
                                onClick={() => setIsCheckoutOpen(true)}
                                className="mt-3 text-[10px] font-black text-amber-400 uppercase tracking-widest hover:underline text-left cursor-pointer"
                              >
                                🚀 Passar a Frente no Topo →
                              </button>
                            </div>

                            <div className="bg-[#11121d] border border-amber-500/20 p-4 rounded-2xl flex flex-col justify-between">
                              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase font-mono">
                                <span>🎯</span> Ranking de Buscas
                              </div>
                              <p className="text-xs text-white/80 mt-2 leading-relaxed">
                                Posição atual: <strong className="text-white font-mono">#{rankInfo.position}</strong>. Empresas Premium ocupam as primeiras posições das pesquisas no portal.
                              </p>
                              <button 
                                type="button" 
                                onClick={() => setIsCheckoutOpen(true)}
                                className="mt-3 text-[10px] font-black text-amber-400 uppercase tracking-widest hover:underline text-left cursor-pointer"
                              >
                                ⭐ Garantir Posição Premium →
                              </button>
                            </div>

                            <div className="bg-[#11121d] border border-amber-500/20 p-4 rounded-2xl flex flex-col justify-between">
                              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase font-mono">
                                <span>🤖</span> Atendente Virtual
                              </div>
                              <p className="text-xs text-white/80 mt-2 leading-relaxed">
                                Clientes buscando por <strong className="text-white">{currentAdvertiser.company.category}</strong> recebem recomendações diretas do Atendente Virtual.
                              </p>
                              <button 
                                type="button" 
                                onClick={() => setIsCheckoutOpen(true)}
                                className="mt-3 text-[10px] font-black text-amber-400 uppercase tracking-widest hover:underline text-left cursor-pointer"
                              >
                                🔥 Ser Recomendado pelo Robô →
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Stat Counters Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                          <div className="bg-[#11111a] border border-white/10 p-4 rounded-2xl flex flex-col justify-between">
                            <div className="text-[10px] text-white/50 font-bold uppercase tracking-wider">👁️ Visualizações</div>
                            <div className="text-2xl font-black text-white mt-2 font-mono">{views}</div>
                            <div className="text-[9px] text-emerald-400 mt-1">Acessos no perfil</div>
                          </div>
                          <div className="bg-[#11111a] border border-white/10 p-4 rounded-2xl flex flex-col justify-between">
                            <div className="text-[10px] text-white/50 font-bold uppercase tracking-wider">💬 Cliques WhatsApp</div>
                            <div className="text-2xl font-black text-emerald-400 mt-2 font-mono">{currentAdvertiser.company.clicksWa || Math.floor(views * 0.4)}</div>
                            <div className="text-[9px] text-white/40 mt-1">Contatos diretos</div>
                          </div>
                          <div className="bg-[#11111a] border border-white/10 p-4 rounded-2xl flex flex-col justify-between">
                            <div className="text-[10px] text-white/50 font-bold uppercase tracking-wider">🔍 Buscas e Aparições</div>
                            <div className="text-2xl font-black text-amber-400 mt-2 font-mono">{currentAdvertiser.company.searchImpressions || Math.floor(views * 3.2 + 12)}</div>
                            <div className="text-[9px] text-white/40 mt-1">Exibições em buscas</div>
                          </div>
                          <div className="bg-[#11111a] border border-white/10 p-4 rounded-2xl flex flex-col justify-between">
                            <div className="text-[10px] text-white/50 font-bold uppercase tracking-wider">⭐ Posição na Categoria</div>
                            <div className="text-lg font-black text-white mt-2 font-mono">
                              #{rankInfo.position} de {rankInfo.totalInCat}
                            </div>
                            <div className="text-[9px] text-amber-400 mt-1">
                              {currentPlan === 'gratuito' ? 'Faça upgrade para subir' : 'Posição prioritária'}
                            </div>
                          </div>
                          <div className="bg-[#11111a] border border-white/10 p-4 rounded-2xl flex flex-col justify-between col-span-2 sm:col-span-1">
                            <div className="text-[10px] text-white/50 font-bold uppercase tracking-wider">📈 Taxa de Conversão</div>
                            <div className="text-2xl font-black text-blue-400 mt-2 font-mono">
                              {views ? `${((Math.floor(views * 0.4) / views) * 100).toFixed(1)}%` : '100%'}
                            </div>
                            <div className="text-[9px] text-white/40 mt-1">Visitantes → Cliques</div>
                          </div>
                        </div>

                        {/* Visibility Score Progress Box */}
                        <div className="bg-gradient-to-r from-[#13141f] via-[#1a1c2d] to-[#13141f] border border-white/10 p-6 rounded-3xl shadow-xl">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                            <div>
                              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                🚀 Score de Visibilidade do Perfil: <span className="text-[var(--primary)] font-mono text-xl">{score}%</span>
                              </h3>
                              <p className="text-xs text-white/60 mt-1">
                                Quanto maior o seu score, mais alto sua empresa aparece nas buscas do portal e do Google!
                              </p>
                            </div>
                            <div className="shrink-0">
                              <span className={`text-xs font-black uppercase px-3 py-1.5 rounded-full ${
                                score >= 80 ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400' :
                                score >= 50 ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400' :
                                'bg-red-500/20 border border-red-500/40 text-red-400'
                              }`}>
                                {score >= 80 ? '🔥 Excelente Visibilidade' : score >= 50 ? '⚡ Média Visibilidade' : '⚠️ Baixa Visibilidade'}
                              </span>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full h-3 bg-black/50 border border-white/10 rounded-full overflow-hidden p-0.5">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                score >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
                                score >= 50 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' :
                                'bg-gradient-to-r from-red-500 to-orange-500'
                              }`}
                              style={{ width: `${score}%` }}
                            />
                          </div>

                          {/* Practical Suggestions Checklist */}
                          <div className="mt-6">
                            <h4 className="text-xs font-bold text-white/70 uppercase tracking-widest mb-3">
                              Dicas Práticas para Aumentar sua Pontuação:
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                              {checklist.map((item) => (
                                <div 
                                  key={item.id} 
                                  className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                                    item.done 
                                      ? 'bg-emerald-500/5 border-emerald-500/20 text-white/90' 
                                      : 'bg-white/5 border-white/10 text-white/60'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5">
                                    <span className={item.done ? 'text-emerald-400 font-bold' : 'text-white/30'}>
                                      {item.done ? '✅' : '⭕'}
                                    </span>
                                    <span>{item.label}</span>
                                  </div>
                                  {!item.done ? (
                                    <button 
                                      type="button"
                                      onClick={() => setAdDashboardTab(item.action as any)}
                                      className="text-[10px] font-extrabold uppercase bg-[var(--primary)] text-black px-2.5 py-1 rounded-lg hover:brightness-110 shrink-0 ml-2 cursor-pointer"
                                    >
                                      +{item.bonus}%
                                    </button>
                                  ) : (
                                    <span className="text-[10px] text-emerald-400 font-mono font-bold">+{item.bonus}%</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Tab 4: Meu Plano & Benefícios */}
                  {adDashboardTab === 'plano' && (() => {
                    const currentPlan = getCompanyPlanType(currentAdvertiser.company);
                    return (
                      <div className="flex flex-col gap-6">
                        {/* Current Active Plan Header & Conversion Triggers */}
                        <div className="bg-gradient-to-r from-[#11121c] via-[#161726] to-[#11121c] border border-amber-500/30 p-6 rounded-3xl flex flex-col gap-5 shadow-2xl relative overflow-hidden">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                            <div>
                              <span className="text-[10px] text-amber-400 font-mono font-black uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                                ⭐ Status do Seu Negócio
                              </span>
                              <div className="flex items-center gap-3 mt-2">
                                <h3 className="text-2xl font-black text-white capitalize">
                                  {currentPlan === 'patrocinado' ? '🔥 Plano Patrocinado (1º Lugar Absoluto)' :
                                   currentPlan === 'destaque' ? '⭐ Plano Destaque VIP' :
                                   currentPlan === 'verificado' ? '✔ Empresa Verificada' :
                                   '🟢 Plano Gratuito (Perfil Básico)'}
                                </h3>
                              </div>
                              <p className="text-xs text-white/70 mt-1.5 max-w-2xl leading-relaxed">
                                {currentPlan === 'patrocinado' ? 'Sua empresa está no topo absoluto de todas as pesquisas com selo animado e prioridade máxima!' :
                                 currentPlan === 'destaque' ? 'Sua empresa aparece antes de todas as empresas gratuitas com selo estelar de destaque!' :
                                 currentPlan === 'verificado' ? 'Sua empresa transmite confiança total para clientes com o selo verde de Verificado.' :
                                 'Sua empresa possui o perfil básico e está listada após as empresas Premium no portal.'}
                              </p>
                            </div>

                            <a 
                              href={`https://wa.me/5585992862177?text=${encodeURIComponent(`Olá! Quero ativar o Plano Premium para minha empresa (${currentAdvertiser?.company?.name}) para aparecer em 1º lugar!`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 text-black px-7 py-4 rounded-2xl font-black text-xs uppercase tracking-wider text-center shadow-xl shadow-amber-500/20 shrink-0 cursor-pointer flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                            >
                              🚀 Quero Aparecer Primeiro
                            </a>
                          </div>

                          {/* Conversion Triggers Banner */}
                          {currentPlan === 'gratuito' && (
                            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-xs text-amber-200/90 flex flex-col gap-2">
                              <div className="flex items-center gap-2 font-black text-amber-300 text-xs uppercase tracking-wide">
                                ⚡ GATILHOS DE VISIBILIDADE & VANTAGEM COMPETITIVA:
                              </div>
                              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1 font-medium">
                                <li className="flex items-center gap-1.5">
                                  <span>🔴</span>
                                  <span><strong>Sua empresa está atrás das empresas Premium.</strong></span>
                                </li>
                                <li className="flex items-center gap-1.5">
                                  <span>🔎</span>
                                  <span><strong>As empresas Premium aparecem primeiro nas pesquisas.</strong></span>
                                </li>
                                <li className="flex items-center gap-1.5">
                                  <span>🤖</span>
                                  <span><strong>As empresas Premium possuem prioridade nas recomendações do Atendente Virtual.</strong></span>
                                </li>
                                <li className="flex items-center gap-1.5 text-emerald-300 font-bold">
                                  <span>🚀</span>
                                  <span>Ative o Premium para aumentar sua visibilidade e fechar mais vendas!</span>
                                </li>
                              </ul>
                            </div>
                          )}

                          {/* Modern Badges Showcase */}
                          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
                            <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest mr-2">Selos de Destaque Oficial:</span>
                            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] px-3 py-1 rounded-full font-black flex items-center gap-1 shadow">
                              ⭐ Premium
                            </span>
                            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] px-3 py-1 rounded-full font-black flex items-center gap-1 shadow">
                              ✔ Verificada
                            </span>
                            <span className="bg-red-500/20 text-red-300 border border-red-500/40 text-[11px] px-3 py-1 rounded-full font-black flex items-center gap-1 shadow">
                              🔥 Empresa Recomendada
                            </span>
                          </div>
                        </div>

                        {/* Four Tiers Comparison Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                          {/* Gratuito */}
                          <div className={`bg-[#0f1016] border rounded-3xl p-6 flex flex-col justify-between ${currentPlan === 'gratuito' ? 'border-white/30 ring-1 ring-white/20' : 'border-white/5 opacity-80'}`}>
                            <div>
                              <span className="text-[10px] font-mono text-white/40 uppercase font-extrabold tracking-widest">Nível 1</span>
                              <h4 className="text-lg font-black text-white mt-1 flex items-center gap-1.5">
                                🟢 Gratuito
                              </h4>
                              <div className="text-xl font-black text-white/80 mt-2 font-mono">R$ 0</div>
                              <ul className="text-xs text-white/70 space-y-2 mt-4">
                                <li>✔ Perfil básico da empresa</li>
                                <li>✔ Logo</li>
                                <li>✔ Endereço</li>
                                <li>✔ WhatsApp</li>
                                <li>✔ Horário de funcionamento</li>
                                <li>✔ Instagram</li>
                                <li>✔ Facebook</li>
                                <li>✔ Até 5 fotos</li>
                                <li>✔ Até 5 produtos</li>
                                <li className="text-white/50">✔ Aparece nas buscas (sempre após empresas Premium)</li>
                              </ul>
                            </div>
                            <div>
                              {/* Observation */}
                              <div className="mt-4 p-3 bg-white/5 border border-white/10 rounded-2xl text-[11px] text-white/60 leading-tight">
                                💡 <em>O plano gratuito permite que sua empresa esteja presente no portal.</em>
                              </div>

                              {currentPlan === 'gratuito' && (
                                <div className="mt-4 text-center text-xs font-black text-white/50 bg-white/5 py-2.5 rounded-xl uppercase tracking-wider">
                                  Plano Ativo
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Verificado - Confiança */}
                          <div className={`bg-[#0f1016] border rounded-3xl p-6 flex flex-col justify-between ${currentPlan === 'verificado' ? 'border-emerald-500 ring-1 ring-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'border-emerald-500/30'}`}>
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono text-emerald-400 uppercase font-extrabold tracking-widest">Nível 2</span>
                                <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-black px-2 py-0.5 rounded-full border border-emerald-500/40">
                                  ✔ Verificada
                                </span>
                              </div>
                              <h4 className="text-lg font-black text-emerald-400 mt-1 flex items-center gap-1.5">
                                ⭐ Premium Confiança
                              </h4>
                              <div className="text-2xl font-black text-emerald-400 mt-1 font-mono flex items-baseline gap-1">
                                R$ 39,90 <span className="text-xs text-white/50 font-normal">/ MÊS</span>
                              </div>
                              <ul className="text-xs text-white/90 space-y-2 mt-4">
                                <li className="text-emerald-400 font-bold">⭐ Empresa Verificada</li>
                                <li>⭐ Aparece antes das empresas gratuitas</li>
                                <li>⭐ Destaque no Atendente Virtual</li>
                                <li>⭐ Prioridade nas pesquisas</li>
                                <li>⭐ Até 30 fotos</li>
                                <li>⭐ Até 100 produtos</li>
                                <li>⭐ Cadastro de vídeos & Promoções</li>
                                <li>⭐ Botão WhatsApp destacado</li>
                                <li>⭐ Catálogo completo</li>
                                <li className="text-emerald-300/90">⭐ Estatísticas completas (Visualizações, Cliques, WhatsApp, Relatório)</li>
                                <li className="text-emerald-300/90 font-bold">⭐ Badge Premium & Card diferenciado</li>
                              </ul>
                            </div>
                            <div>
                              {/* Observation */}
                              <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-[11px] text-emerald-200/90 leading-tight">
                                🚀 <em>O plano Premium aumenta a visibilidade da sua empresa, coloca seu negócio na frente dos concorrentes e gera mais oportunidades de contato.</em>
                              </div>

                              {currentPlan === 'verificado' ? (
                                <div className="mt-4 text-center text-xs font-black text-emerald-400 bg-emerald-500/10 py-2.5 rounded-xl uppercase tracking-wider">
                                  Plano Ativo
                                </div>
                              ) : (
                                <a 
                                  href={`https://wa.me/5585992862177?text=${encodeURIComponent(`Olá! Quero fazer o UPGRADE para o Plano Premium Confiança (R$ 39,90/mês) da empresa ${currentAdvertiser.company.name}.`)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mt-4 text-center text-xs font-black text-black bg-emerald-400 hover:bg-emerald-300 py-3.5 rounded-xl uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  🚀 Quero Aparecer Primeiro
                                </a>
                              )}
                            </div>
                          </div>

                          {/* Destaque VIP */}
                          <div className={`bg-[#0f1016] border rounded-3xl p-6 flex flex-col justify-between ${currentPlan === 'destaque' ? 'border-amber-400 ring-1 ring-amber-400/50 shadow-[0_0_15px_rgba(251,191,36,0.25)]' : 'border-amber-500/30'}`}>
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono text-amber-400 uppercase font-extrabold tracking-widest">Nível 3</span>
                                <span className="bg-amber-500/20 text-amber-300 text-[9px] font-black px-2 py-0.5 rounded-full border border-amber-500/40">
                                  ⭐ Premium VIP
                                </span>
                              </div>
                              <h4 className="text-lg font-black text-amber-400 mt-1 flex items-center gap-1.5">
                                ⭐ Premium Destaque VIP
                              </h4>
                              <div className="text-2xl font-black text-amber-400 mt-1 font-mono flex items-baseline gap-1">
                                R$ 49,90 <span className="text-xs text-white/50 font-normal">/ MÊS</span>
                              </div>
                              <ul className="text-xs text-white/90 space-y-2 mt-4">
                                <li className="text-amber-400 font-bold">⭐ Empresa Verificada & Selo VIP</li>
                                <li>⭐ Aparece antes das gratuitas e verificadas</li>
                                <li>⭐ Destaque Especial no Atendente Virtual</li>
                                <li>⭐ Prioridade Alta nas pesquisas</li>
                                <li>⭐ Fotos, Produtos & Vídeos Ilimitados</li>
                                <li>⭐ Borda e Iluminação VIP no Portal</li>
                                <li>⭐ Botão WhatsApp em Destaque Especial</li>
                                <li>⭐ Catálogo Completo & Promoções</li>
                                <li className="text-amber-300/90">⭐ Estatísticas completas (Visualizações, Cliques, WhatsApp, Relatórios)</li>
                                <li className="text-amber-300/90 font-bold">⭐ Badge Premium & Card diferenciado</li>
                              </ul>
                            </div>
                            <div>
                              {/* Observation */}
                              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-[11px] text-amber-200/90 leading-tight">
                                🚀 <em>O plano Premium aumenta a visibilidade da sua empresa, coloca seu negócio na frente dos concorrentes e gera mais oportunidades de contato.</em>
                              </div>

                              {currentPlan === 'destaque' ? (
                                <div className="mt-4 text-center text-xs font-black text-amber-400 bg-amber-500/10 py-2.5 rounded-xl uppercase tracking-wider">
                                  Plano Ativo
                                </div>
                              ) : (
                                <a 
                                  href={`https://wa.me/5585992862177?text=${encodeURIComponent(`Olá! Quero fazer o UPGRADE para o Plano Premium Destaque VIP (R$ 49,90/mês) da empresa ${currentAdvertiser.company.name}.`)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mt-4 text-center text-xs font-black text-black bg-gradient-to-r from-amber-400 to-yellow-400 hover:brightness-110 py-3.5 rounded-xl uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  🚀 Quero Aparecer Primeiro
                                </a>
                              )}
                            </div>
                          </div>

                          {/* Patrocinado Top 1 */}
                          <div className={`bg-[#0f1016] border rounded-3xl p-6 flex flex-col justify-between ${currentPlan === 'patrocinado' ? 'border-red-500 ring-1 ring-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 'border-red-500/30'}`}>
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono text-red-400 uppercase font-extrabold tracking-widest">Nível Max</span>
                                <span className="bg-red-500/20 text-red-300 text-[9px] font-black px-2 py-0.5 rounded-full border border-red-500/40">
                                  🔥 Empresa Recomendada
                                </span>
                              </div>
                              <h4 className="text-lg font-black text-red-400 mt-1 flex items-center gap-1.5">
                                🔥 Premium Patrocinado (1º Lugar)
                              </h4>
                              <div className="text-2xl font-black text-red-400 mt-1 font-mono flex items-baseline gap-1">
                                R$ 59,90 <span className="text-xs text-white/50 font-normal">/ MÊS</span>
                              </div>
                              <ul className="text-xs text-white/90 space-y-2 mt-4">
                                <li className="text-red-400 font-bold">🔥 1ª Posição Garantida (Top 1)</li>
                                <li>⭐ Posição Fixa Escolhida & Borda Dourada Animada</li>
                                <li>⭐ Prioridade Máxima no Atendente Virtual IA</li>
                                <li>⭐ Recomendação Direta no WhatsApp Chat</li>
                                <li>⭐ Atendimento via IA Prioritário</li>
                                <li>⭐ Fotos, Produtos & Vídeos Ilimitados</li>
                                <li>⭐ Botão WhatsApp em Destaque Absoluto</li>
                                <li>⭐ Estatísticas Completas (Visualizações, Cliques, WhatsApp)</li>
                                <li className="text-red-300/90 font-bold">⭐ Badge Premium & Card diferenciado</li>
                              </ul>
                            </div>
                            <div>
                              {/* Observation */}
                              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-[11px] text-red-200/90 leading-tight">
                                🚀 <em>O plano Premium aumenta a visibilidade da sua empresa, coloca seu negócio na frente dos concorrentes e gera mais oportunidades de contato.</em>
                              </div>

                              {currentPlan === 'patrocinado' ? (
                                <div className="mt-4 text-center text-xs font-black text-red-400 bg-red-500/10 py-2.5 rounded-xl uppercase tracking-wider">
                                  Plano Ativo
                                </div>
                              ) : (
                                <a 
                                  href={`https://wa.me/5585992862177?text=${encodeURIComponent(`Olá! Quero fazer o UPGRADE para o Plano Premium Patrocinado Top 1 (R$ 59,90/mês) da empresa ${currentAdvertiser.company.name}.`)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mt-4 text-center text-xs font-black text-white bg-gradient-to-r from-red-600 via-amber-600 to-yellow-500 hover:brightness-110 py-3.5 rounded-xl uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  🚀 Quero Aparecer Primeiro
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

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
                              value={(appData?.categories || []).some((cat: any) => cat.name === currentAdvertiser.company.category) ? currentAdvertiser.company.category : "__custom__"}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === "__custom__") {
                                  setCurrentAdvertiser((prev: any) => ({
                                    ...prev,
                                    company: { ...prev.company, category: '' }
                                  }));
                                } else {
                                  setCurrentAdvertiser((prev: any) => ({
                                    ...prev,
                                    company: { ...prev.company, category: val }
                                  }));
                                }
                              }}
                              className="w-full bg-[#11111a] border border-white/10 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3 text-xs text-white"
                            >
                              {(appData?.categories || []).map((cat: any) => (
                                <option key={cat.name} value={cat.name}>{cat.name}</option>
                              ))}
                              <option value="__custom__">✍️ Outro (Digitar nicho personalizado...)</option>
                            </select>

                            {! (appData?.categories || []).some((cat: any) => cat.name === currentAdvertiser.company.category) && (
                              <div className="flex flex-col gap-1.5 mt-2">
                                <label className="text-[9px] text-[var(--primary)] uppercase font-black">Escreva o Nome do seu Nicho *</label>
                                <input 
                                  type="text"
                                  value={currentAdvertiser.company.category}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setCurrentAdvertiser((prev: any) => ({
                                      ...prev,
                                      company: { ...prev.company, category: val }
                                    }));
                                  }}
                                  placeholder="Ex: Pizzaria, Fretes, Ar Condicionado, Informática..."
                                  className="w-full bg-[#11111a] border border-[var(--primary)]/50 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3 text-xs text-white"
                                  required
                                />
                              </div>
                            )}
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
                              <option value="loja">🛍️ Loja Virtual / Vendas Online (Com Preços, Carrinho e Pedidos no WhatsApp)</option>
                              <option value="cardapio">🍔 Cardápio / Pizzaria (Com Preços, Carrinho e Pedidos no WhatsApp)</option>
                              <option value="servico">🛠️ Prestador de Serviços (Sem Preços/Carrinho, com Botão e Pedido de Orçamento)</option>
                              <option value="agendamento">📅 Agendamento de Horários (Sem Preços/Carrinho, com Formulário de Agendamento)</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] text-white/50 uppercase font-bold">Link da Foto Logo (URL)</label>
                              <DirectFileUploadButton 
                                label="📷 Escolher do Celular" 
                                onUploadSuccess={(url) => setCurrentAdvertiser((prev: any) => ({
                                  ...prev,
                                  company: { ...prev.company, logo: url }
                                }))} 
                              />
                            </div>
                            <input 
                              type="text"
                              value={currentAdvertiser.company.logo}
                              placeholder="Cole a URL ou escolha a foto do celular acima"
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] text-white/50 uppercase font-bold">Link do Site Oficial (Website)</label>
                            <input 
                              type="text"
                              value={currentAdvertiser.company.website || ''}
                              placeholder="https://seu-site.com"
                              onChange={(e) => {
                                const val = e.target.value;
                                setCurrentAdvertiser((prev: any) => ({
                                  ...prev,
                                  company: { ...prev.company, website: val }
                                }));
                              }}
                              className="w-full bg-[#11111a] border border-white/10 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3 text-xs text-white"
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] text-white/50 uppercase font-bold">Link do Facebook (facebook.com/...)</label>
                            <input 
                              type="text"
                              value={currentAdvertiser.company.fb || ''}
                              placeholder="https://facebook.com/sua-pagina"
                              onChange={(e) => {
                                const val = e.target.value;
                                setCurrentAdvertiser((prev: any) => ({
                                  ...prev,
                                  company: { ...prev.company, fb: val }
                                }));
                              }}
                              className="w-full bg-[#11111a] border border-white/10 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3 text-xs text-white"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] text-white/50 uppercase font-bold">Ação do Botão Principal (Site)</label>
                            <select 
                              value={currentAdvertiser.company.primaryButtonAction || 'minisite'}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCurrentAdvertiser((prev: any) => ({
                                  ...prev,
                                  company: { ...prev.company, primaryButtonAction: val }
                                }));
                              }}
                              className="w-full bg-[#11111a] border border-white/10 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3 text-xs text-white"
                            >
                              <option value="minisite">Abrir Mini-Site / Catálogo Interno 📲</option>
                              <option value="site">Abrir Site Oficial Externo (Website) 🌐</option>
                              <option value="instagram">Instagram Comercial 📸</option>
                              <option value="facebook">Página do Facebook 👥</option>
                            </select>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] text-white/50 uppercase font-bold">Texto Personalizado do Botão</label>
                            <input 
                              type="text"
                              value={currentAdvertiser.company.primaryButtonText || ''}
                              placeholder="Ex: Abrir Instagram (Vazio = Padrão)"
                              onChange={(e) => {
                                const val = e.target.value;
                                setCurrentAdvertiser((prev: any) => ({
                                  ...prev,
                                  company: { ...prev.company, primaryButtonText: val }
                                }));
                              }}
                              className="w-full bg-[#11111a] border border-white/10 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3 text-xs text-white"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] text-white/50 uppercase font-bold">Estado (UF) *</label>
                            <select 
                              value={currentAdvertiser.company.state || currentAdvertiser.company.uf || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCurrentAdvertiser((prev: any) => ({
                                  ...prev,
                                  company: { 
                                    ...prev.company, 
                                    state: val.toUpperCase(),
                                    uf: val.toUpperCase() 
                                  }
                                }));
                              }}
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
                            <label className="text-[10px] text-white/50 uppercase font-bold">Cidade *</label>
                            <input 
                              type="text"
                              value={currentAdvertiser.company.city || ''}
                              placeholder="Ex: Fortaleza, São Paulo..."
                              onChange={(e) => {
                                const val = e.target.value;
                                setCurrentAdvertiser((prev: any) => ({
                                  ...prev,
                                  company: { ...prev.company, city: val }
                                }));
                              }}
                              className="w-full bg-[#11111a] border border-white/10 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3 text-xs text-white"
                              required
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

                        <div className="border-t border-white/5 pt-5 mt-3">
                          <h4 className="text-xs font-black text-[var(--primary)] uppercase tracking-wider mb-4">💳 Recebimento de Pedidos (Pix & Entrega)</h4>
                          <p className="text-[11px] text-white/50 mb-4">Insira os dados do seu Pix para que seus clientes possam pagar direto pelo catálogo virtual (Mini-Site) ou cardápio digital.</p>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] text-white/50 uppercase font-bold">Chave PIX para Recebimento</label>
                              <input 
                                type="text"
                                placeholder="Ex: seu_email@email.com, celular ou chave aleatória"
                                value={currentAdvertiser.company.pixKey || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setCurrentAdvertiser((prev: any) => ({
                                    ...prev,
                                    company: { ...prev.company, pixKey: val }
                                  }));
                                }}
                                className="w-full bg-[#11111a] border border-white/10 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3 text-xs text-white"
                              />
                            </div>
                            
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] text-white/50 uppercase font-bold">Nome do Titular (Recebedor)</label>
                              <input 
                                type="text"
                                placeholder="Ex: Fulano de Tal da Silva"
                                value={currentAdvertiser.company.pixName || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setCurrentAdvertiser((prev: any) => ({
                                    ...prev,
                                    company: { ...prev.company, pixName: val }
                                  }));
                                }}
                                className="w-full bg-[#11111a] border border-white/10 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3 text-xs text-white"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] text-white/50 uppercase font-bold">Tipo da Chave</label>
                              <select 
                                value={currentAdvertiser.company.pixType || 'Celular'}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setCurrentAdvertiser((prev: any) => ({
                                    ...prev,
                                    company: { ...prev.company, pixType: val }
                                  }));
                                }}
                                className="w-full bg-[#11111a] border border-white/10 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3 text-xs text-white"
                              >
                                <option value="Celular">Celular</option>
                                <option value="E-mail">E-mail</option>
                                <option value="CPF">CPF</option>
                                <option value="CNPJ">CNPJ</option>
                                <option value="Chave Aleatória">Chave Aleatória</option>
                              </select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] text-white/50 uppercase font-bold">Instituição / Banco (Opcional)</label>
                              <input 
                                type="text"
                                placeholder="Ex: Nubank, Itaú, BB..."
                                value={currentAdvertiser.company.pixBank || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setCurrentAdvertiser((prev: any) => ({
                                    ...prev,
                                    company: { ...prev.company, pixBank: val }
                                  }));
                                }}
                                className="w-full bg-[#11111a] border border-white/10 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3 text-xs text-white"
                              />
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] text-white/50 uppercase font-bold">Taxa de Entrega (R$ - Opcional)</label>
                              <input 
                                type="number"
                                step="0.01"
                                placeholder="Ex: 5.00 ou 0 para grátis"
                                value={currentAdvertiser.company.deliveryFee || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setCurrentAdvertiser((prev: any) => ({
                                    ...prev,
                                    company: { ...prev.company, deliveryFee: val }
                                  }));
                                }}
                                className="w-full bg-[#11111a] border border-white/10 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3 text-xs text-white"
                              />
                            </div>
                          </div>
                        </div>

                        <button 
                          onClick={async () => {
                            if (isAdExpired && !user?.isAdmin) {
                              alert("Sua conta está suspensa ou bloqueada. Entre em contato com o suporte para reativar seu acesso.");
                              return;
                            }
                            if (!currentAdvertiser.company.name.trim() || !currentAdvertiser.company.wa.trim() || !(currentAdvertiser.company.state || currentAdvertiser.company.uf) || !currentAdvertiser.company.city?.trim()) {
                              alert("Por favor, preencha todos os campos obrigatórios (Nome, WhatsApp, Estado e Cidade).");
                              return;
                            }
                            setIsAdLoading(true);
                            try {
                              const docRef = doc(db, 'advertisers', currentAdvertiser.id);
                              
                              // Save exact state with proof of credentials matching security rules
                              await setDoc(docRef, {
                                email: currentAdvertiser.email,
                                password: currentAdvertiser.password,
                                tenantId: currentAdvertiser.tenantId,
                                expiresAt: currentAdvertiser.expiresAt || '',
                                createdAt: currentAdvertiser.createdAt || '',
                                company: {
                                  ...currentAdvertiser.company,
                                  name: currentAdvertiser.company.name.trim(),
                                  desc: currentAdvertiser.company.desc.trim(),
                                  city: currentAdvertiser.company.city.trim(),
                                  state: (currentAdvertiser.company.state || currentAdvertiser.company.uf).trim().toUpperCase(),
                                  uf: (currentAdvertiser.company.state || currentAdvertiser.company.uf).trim().toUpperCase(),
                                  expiresAt: currentAdvertiser.expiresAt || '',
                                  createdAt: currentAdvertiser.createdAt || ''
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
                              if (isAdExpired && !user?.isAdmin) {
                                alert("Sua conta está suspensa ou bloqueada. Entre em contato com o suporte.");
                                return;
                              }
                              setItemForm({ name: '', desc: '', price: '', photo: '', photo2: '', photo3: '', photo4: '', video: '' });
                              setEditingItemIndex(-1); // -1 triggers add new form
                            }}
                            className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer shadow transition-all duration-150 ${(isAdExpired && !user?.isAdmin) ? 'bg-neutral-800 text-white/30 border border-white/5 cursor-not-allowed' : 'bg-[var(--primary)] hover:brightness-110 text-black'}`}
                            disabled={isAdExpired && !user?.isAdmin}
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
                                <label className="text-[10px] text-white/50 uppercase font-bold">Foto Principal / Foto 1 (Opcional)</label>
                                <DirectFileUploadButton 
                                  label="📷 Foto 1" 
                                  onUploadSuccess={(url) => setItemForm(prev => ({ ...prev, photo: url }))} 
                                />
                              </div>
                              <input 
                                type="text"
                                value={itemForm.photo}
                                onChange={(e) => setItemForm(prev => ({ ...prev, photo: e.target.value }))}
                                placeholder="Cole a URL ou escolha do celular acima"
                                className="w-full bg-[#11111a] border border-white/10 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3 text-xs text-white"
                              />
                            </div>
                          </div>

                          {/* Additional Photos & Video */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 border-t border-white/5 pt-4">
                            <div className="flex flex-col gap-1.5">
                              <div className="flex justify-between items-center">
                                <label className="text-[10px] text-white/50 uppercase font-bold">Foto 2 (Opcional)</label>
                                <DirectFileUploadButton 
                                  label="📷 Foto 2" 
                                  onUploadSuccess={(url) => setItemForm(prev => ({ ...prev, photo2: url }))} 
                                />
                              </div>
                              <input 
                                type="text"
                                value={itemForm.photo2 || ''}
                                onChange={(e) => setItemForm(prev => ({ ...prev, photo2: e.target.value }))}
                                placeholder="https://..."
                                className="w-full bg-[#11111a] border border-white/10 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3 text-xs text-white"
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <div className="flex justify-between items-center">
                                <label className="text-[10px] text-white/50 uppercase font-bold">Foto 3 (Opcional)</label>
                                <DirectFileUploadButton 
                                  label="📷 Foto 3" 
                                  onUploadSuccess={(url) => setItemForm(prev => ({ ...prev, photo3: url }))} 
                                />
                              </div>
                              <input 
                                type="text"
                                value={itemForm.photo3 || ''}
                                onChange={(e) => setItemForm(prev => ({ ...prev, photo3: e.target.value }))}
                                placeholder="https://..."
                                className="w-full bg-[#11111a] border border-white/10 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3 text-xs text-white"
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <div className="flex justify-between items-center">
                                <label className="text-[10px] text-white/50 uppercase font-bold">Foto 4 (Opcional)</label>
                                <DirectFileUploadButton 
                                  label="📷 Foto 4" 
                                  onUploadSuccess={(url) => setItemForm(prev => ({ ...prev, photo4: url }))} 
                                />
                              </div>
                              <input 
                                type="text"
                                value={itemForm.photo4 || ''}
                                onChange={(e) => setItemForm(prev => ({ ...prev, photo4: e.target.value }))}
                                placeholder="https://..."
                                className="w-full bg-[#11111a] border border-white/10 focus:border-[var(--primary)] outline-none rounded-xl px-4 py-3 text-xs text-white"
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <div className="flex justify-between items-center">
                                <label className="text-[10px] text-white/50 uppercase font-bold">Link do Vídeo (Opcional)</label>
                                <a 
                                  href={universalConfig.uploadVideoHelpUrl || 'https://streamable.com/'} 
                                  onClick={(e) => handleOpenUploadHelper(e, universalConfig.uploadVideoHelpUrl || 'https://streamable.com/', 'portal_upload_video')} 
                                  rel="noreferrer"
                                  className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 decoration-transparent"
                                >
                                  🎥 Vídeo
                                </a>
                              </div>
                              <input 
                                type="text"
                                value={itemForm.video || ''}
                                onChange={(e) => setItemForm(prev => ({ ...prev, video: e.target.value }))}
                                placeholder="Ex: https://streamable.com/..."
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
                                if (isAdExpired && !user?.isAdmin) {
                                  alert("Sua conta está suspensa ou bloqueada. Entre em contato com o suporte.");
                                  return;
                                }
                                const { name, price, desc, photo, photo2, photo3, photo4, video } = itemForm;
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
                                  const planType = getCompanyPlanType(currentAdvertiser.company);
                                  const isFree = planType === 'gratuito';
                                  const isInTrialPeriod = (currentAdvertiser.expiresAt && !isAdExpired) || user?.isAdmin;
                                  if (isFree && currentCount >= 5 && !isInTrialPeriod && !user?.isAdmin) {
                                    alert("Oops! Você atingiu o limite de 5 produtos do Plano Gratuito. Adquira o Plano Premium para ter até 100 produtos no catálogo e prioridade máxima no portal!");
                                    setIsCheckoutOpen(true);
                                    return;
                                  }
                                }

                                const newItem = {
                                  id: editingItemIndex === -1 ? `item_${Date.now()}` : ((currentAdvertiser.company.items || [])[editingItemIndex]?.id || `item_${Date.now()}`),
                                  name: name.trim(),
                                  price: Number(price).toString(),
                                  desc: desc.trim(),
                                  photo: photo.trim(),
                                  photo2: (photo2 || '').trim(),
                                  photo3: (photo3 || '').trim(),
                                  photo4: (photo4 || '').trim(),
                                  video: (video || '').trim()
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
                                    expiresAt: currentAdvertiser.expiresAt || '',
                                    createdAt: currentAdvertiser.createdAt || '',
                                    company: {
                                      ...updatedAdvertiser.company,
                                      expiresAt: currentAdvertiser.expiresAt || '',
                                      createdAt: currentAdvertiser.createdAt || ''
                                    }
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
                        (!currentAdvertiser.company.items || currentAdvertiser.company.items.length === 0) ? (
                          <div className="text-center py-16 bg-neutral-900/20 rounded-2xl border border-dashed border-white/5 flex flex-col items-center justify-center">
                            <span className="text-3xl">📭</span>
                            <h4 className="text-sm font-bold text-white mt-3">Você ainda não possui nenhum produto ou serviço</h4>
                            <p className="text-xs text-white/40 max-w-xs mt-1">Adicione itens digitais para ativar seu catálogo interativo com shopping-cart do portal.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {(currentAdvertiser.company.items || []).map((it: any, i: number) => (
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
                                        photo: it.photo || '',
                                        photo2: it.photo2 || '',
                                        photo3: it.photo3 || '',
                                        photo4: it.photo4 || '',
                                        video: it.video || ''
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
                                      
                                      const updatedItems = (currentAdvertiser.company.items || []).filter((_: any, idx: number) => idx !== i);
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
                                          expiresAt: currentAdvertiser.expiresAt || '',
                                          createdAt: currentAdvertiser.createdAt || '',
                                          company: {
                                            ...updatedAdvertiser.company,
                                            expiresAt: currentAdvertiser.expiresAt || '',
                                            createdAt: currentAdvertiser.createdAt || ''
                                          }
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
        {selectedItemForDetail && (() => {
          const avgRating = itemReviews.length > 0 
            ? (itemReviews.reduce((sum, r) => sum + r.rating, 0) / itemReviews.length).toFixed(1)
            : '0.0';
          const siteType = getCompanySiteType(activeMiniSiteCompany);
          
          // Build media array for 1-4 photos and 1 video
          const mediaList: Array<{ type: 'image' | 'video'; url: string }> = [];
          if (selectedItemForDetail.photo) mediaList.push({ type: 'image', url: selectedItemForDetail.photo });
          if (selectedItemForDetail.photo2) mediaList.push({ type: 'image', url: selectedItemForDetail.photo2 });
          if (selectedItemForDetail.photo3) mediaList.push({ type: 'image', url: selectedItemForDetail.photo3 });
          if (selectedItemForDetail.photo4) mediaList.push({ type: 'image', url: selectedItemForDetail.photo4 });
          if (selectedItemForDetail.video) mediaList.push({ type: 'video', url: selectedItemForDetail.video });

          // Safe guard the active media index in case list length changed or item is empty
          const currentMedia = mediaList[activeMediaIndex] || mediaList[0] || null;

          const getVideoEmbedUrl = (url: string) => {
            if (!url) return null;
            if (url.includes('youtube.com') || url.includes('youtu.be')) {
              let videoId = '';
              if (url.includes('youtu.be/')) {
                videoId = url.split('youtu.be/')[1]?.split(/[?#]/)[0];
              } else {
                try {
                  const urlParts = url.split('?');
                  if (urlParts[1]) {
                    const urlParams = new URLSearchParams(urlParts[1]);
                    videoId = urlParams.get('v') || '';
                  }
                } catch (e) {}
              }
              if (videoId) return `https://www.youtube.com/embed/${videoId}`;
            }
            if (url.includes('streamable.com/')) {
              const videoId = url.split('streamable.com/')[1]?.split(/[?#]/)[0];
              if (videoId) return `https://streamable.com/e/${videoId}`;
            }
            if (url.includes('vimeo.com/')) {
              const videoId = url.split('vimeo.com/')[1]?.split(/[?#]/)[0];
              if (videoId) return `https://player.vimeo.com/video/${videoId}`;
            }
            return null;
          };

          return (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 backdrop-blur-md z-[2100] overflow-y-auto flex items-center justify-center p-4 font-sans"
            >
              <div className="bg-[#0b0c10] border border-white/10 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden relative flex flex-col md:flex-row md:h-[550px]">
                
                {/* Product Image Panel (Left/Top) */}
                <div className="w-full md:w-[280px] h-64 md:h-full bg-neutral-950 flex-shrink-0 relative overflow-hidden flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/10 pb-14 md:pb-16">
                  {currentMedia ? (
                    currentMedia.type === 'video' ? (
                      (() => {
                        const embedUrl = getVideoEmbedUrl(currentMedia.url);
                        if (embedUrl) {
                          return (
                            <iframe
                              src={embedUrl}
                              className="w-full h-full border-0 absolute inset-0 pb-14 md:pb-16 animate-fade-in"
                              allow="autoplay; fullscreen; picture-in-picture"
                              allowFullScreen
                            />
                          );
                        } else {
                          return (
                            <video
                              src={currentMedia.url}
                              controls
                              className="w-full h-full object-contain absolute inset-0 bg-black pb-14 md:pb-16"
                              playsInline
                            />
                          );
                        }
                      })()
                    ) : (
                      <img 
                        src={currentMedia.url} 
                        alt={selectedItemForDetail.name} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer" 
                      />
                    )
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 text-white/20">
                      <ShoppingBag size={48} />
                      <span className="text-[10px] uppercase tracking-wider font-bold">Sem imagem</span>
                    </div>
                  )}

                  {/* Media Selector Overlay / Thumbnails */}
                  {mediaList.length > 1 && (
                    <div className="absolute bottom-0 left-0 right-0 h-14 md:h-16 flex items-center justify-center gap-1.5 z-20 px-2 bg-black/80 border-t border-white/5 overflow-x-auto">
                      {mediaList.map((media, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveMediaIndex(idx)}
                          className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 relative flex items-center justify-center bg-black ${activeMediaIndex === idx ? 'border-[var(--primary)] scale-105' : 'border-white/10 hover:border-white/30'}`}
                        >
                          {media.type === 'video' ? (
                            <div className="w-full h-full flex flex-col items-center justify-center text-emerald-400 gap-0.5">
                              <Play size={12} className="fill-emerald-400" />
                              <span className="text-[6px] font-black uppercase tracking-widest leading-none">Vídeo</span>
                            </div>
                          ) : (
                            <img 
                              src={media.url} 
                              alt={`Foto ${idx + 1}`} 
                              className="w-full h-full object-cover" 
                              referrerPolicy="no-referrer"
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-14 md:bottom-16 h-8 bg-gradient-to-t from-[#0b0c10]/40 to-transparent pointer-events-none" />
                </div>

                {/* Content Panel (Right/Bottom) */}
                <div className="flex-1 p-6 sm:p-8 flex flex-col h-full overflow-hidden justify-between">
                  
                  {/* Top Header - Tabs & Control Buttons */}
                  <div className="flex flex-col gap-4 flex-shrink-0">
                     <div className="flex justify-between items-center">
                      {/* Tabs Selector */}
                      <div className="flex gap-2 bg-white/5 p-1 rounded-full">
                        <button
                          onClick={() => {
                            setDetailModalTab('detalhes');
                            setIsReviewFormOpen(false);
                          }}
                          className={`px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all duration-150 ${detailModalTab === 'detalhes' ? 'bg-[var(--primary)] text-black' : 'text-white/60 hover:text-white'}`}
                        >
                          Detalhes
                        </button>
                        <button
                          onClick={() => setDetailModalTab('avaliacoes')}
                          className={`px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all duration-150 ${detailModalTab === 'avaliacoes' ? 'bg-[var(--primary)] text-black' : 'text-white/60 hover:text-white'}`}
                        >
                          Avaliações ({itemReviews.length})
                        </button>
                      </div>

                      {/* Action Controls */}
                      <div className="flex items-center gap-2">
                        {/* Share Link Button */}
                        <button
                          onClick={() => {
                            const baseUrl = window.location.origin + window.location.pathname + window.location.hash.split('?')[0];
                            const itemUrl = `${baseUrl}?id=${activeMiniSiteCompany?.id || ''}&item=${selectedItemForDetail.id}`;
                            navigator.clipboard.writeText(itemUrl);
                            setShareCopied(true);
                            setTimeout(() => setShareCopied(false), 2000);
                          }}
                          className="p-2.5 bg-white/5 hover:bg-white/10 hover:scale-105 border border-white/10 text-white rounded-full transition-all flex items-center justify-center cursor-pointer relative"
                          title="Compartilhar link"
                        >
                          {shareCopied ? (
                            <span className="text-[9px] font-black text-[var(--primary)] absolute -top-8 bg-black/90 px-2 py-1 rounded border border-white/10 whitespace-nowrap">Link Copiado!</span>
                          ) : null}
                          <Share2 size={14} />
                        </button>

                        {/* Close Button */}
                        <button
                          onClick={() => setSelectedItemForDetail(null)}
                          className="p-2.5 bg-white/5 hover:bg-white/10 hover:scale-105 border border-white/10 text-white rounded-full transition-all flex items-center justify-center cursor-pointer"
                          aria-label="Fechar"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Scrollable Center Body */}
                  <div className="flex-1 overflow-y-auto my-4 pr-1 min-h-[180px]">
                    
                    {/* TAB A: DETALHES */}
                    {detailModalTab === 'detalhes' && (
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[8px] sm:text-[9px] font-black tracking-widest uppercase bg-[var(--primary)]/10 text-[var(--primary)] px-2.5 py-1 rounded border border-[var(--primary)]/20">
                            {activeMiniSiteCompany?.company?.name || 'Item do Catálogo'}
                          </span>
                          {itemReviews.length > 0 && (
                            <div className="flex items-center gap-1 bg-amber-500/10 text-amber-400 px-2 py-1 rounded border border-amber-500/25">
                              <Star size={10} className="fill-amber-400" />
                              <span className="text-[10px] font-bold">{avgRating}</span>
                            </div>
                          )}
                        </div>

                        <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                          {selectedItemForDetail.name}
                        </h3>

                        <p className="text-xs sm:text-sm text-white/60 leading-relaxed font-normal whitespace-pre-line">
                          {selectedItemForDetail.desc || 'Nenhuma descrição detalhada disponível para este item comercial.'}
                        </p>

                        {(siteType === 'loja' || siteType === 'cardapio') ? (
                          <div className="mt-4 bg-white/5 border border-white/5 rounded-2xl p-4">
                            <span className="text-[9px] text-white/40 font-bold uppercase tracking-widest block">Preço de Tabela</span>
                            <span className="text-2xl font-black text-[var(--primary)] font-mono mt-1 block">
                              {selectedItemForDetail.price ? `R$ ${parseFloat(selectedItemForDetail.price).toFixed(2).replace('.', ',')}` : 'Sob Consulta'}
                            </span>
                          </div>
                        ) : siteType === 'servico' ? (
                          <div className="mt-4 bg-white/5 border border-white/5 rounded-2xl p-4">
                            <span className="text-[9px] text-white/40 font-bold uppercase tracking-widest block">Condição Comercial</span>
                            <span className="text-sm font-bold text-amber-400 font-mono mt-1 block">
                              📋 Solicite orçamento sem compromisso
                            </span>
                          </div>
                        ) : (
                          <div className="mt-4 bg-white/5 border border-white/5 rounded-2xl p-4">
                            <span className="text-[9px] text-white/40 font-bold uppercase tracking-widest block">Atendimento por Agendamento</span>
                            <span className="text-sm font-bold text-amber-400 font-mono mt-1 block">
                              📅 Escolha a data e o horário para agendar
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB B: AVALIAÇÕES */}
                    {detailModalTab === 'avaliacoes' && (
                      <div className="flex flex-col h-full">
                        
                        {/* Rating Aggregation Info Header */}
                        <div className="bg-white/5 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div>
                            <span className="text-[9px] text-white/40 font-bold uppercase tracking-widest">Avaliação Média</span>
                            <div className="flex items-baseline gap-2 mt-1">
                              <span className="text-3xl font-black text-white">{avgRating}</span>
                              <span className="text-[11px] text-white/45">/ 5.0</span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1 sm:items-end">
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((s) => {
                                const numVal = parseFloat(avgRating);
                                const isFilled = s <= Math.round(numVal);
                                return (
                                  <Star 
                                    key={s} 
                                    size={14} 
                                    className={isFilled ? "text-amber-400 fill-amber-400" : "text-white/10"} 
                                  />
                                );
                              })}
                            </div>
                            <span className="text-[11px] text-white/50">{itemReviews.length} avaliações publicadas</span>
                          </div>
                        </div>

                        {/* Form or Review List */}
                        {!isReviewFormOpen ? (
                          <div className="flex flex-col flex-1 mt-4">
                            {itemReviews.length === 0 ? (
                              <div className="text-center py-8 flex flex-col items-center justify-center flex-1 bg-white/[0.02] rounded-2xl border border-dashed border-white/5">
                                <span className="text-2xl">⭐</span>
                                <h4 className="text-white/70 font-bold text-xs mt-3">Nenhuma avaliação cadastrada ainda</h4>
                                <p className="text-white/40 text-[11px] mt-1">Seja você o primeiro a deixar a sua opinião sobre este item!</p>
                              </div>
                            ) : (
                              <div className="flex flex-col gap-3 mt-1 max-h-[190px] overflow-y-auto pr-1">
                                {itemReviews.map((rev) => (
                                  <div key={rev.id} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-2">
                                    <div className="flex justify-between items-start gap-3">
                                      <div>
                                        <span className="text-xs font-black text-white block">{rev.author}</span>
                                        <span className="text-[9px] text-white/40 block mt-0.5">
                                          {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('pt-BR') : ''}
                                        </span>
                                      </div>
                                      <div className="flex gap-0.5">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                          <Star 
                                            key={s} 
                                            size={11} 
                                            className={s <= rev.rating ? "text-amber-400 fill-amber-400" : "text-white/25"} 
                                          />
                                        ))}
                                      </div>
                                    </div>
                                    {rev.comment && (
                                      <p className="text-xs text-white/80 leading-relaxed italic border-l-2 border-[var(--primary)]/20 pl-2.5 mt-1 bg-white/[0.01] py-1 rounded">
                                        "{rev.comment}"
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Button to open form */}
                            <button 
                              onClick={() => setIsReviewFormOpen(true)}
                              className="mt-4 text-xs font-black text-[var(--primary)] hover:brightness-110 flex items-center gap-1.5 bg-[var(--primary)]/10 px-4 py-2.5 rounded-xl border border-[var(--primary)]/20 w-fit self-center uppercase tracking-wider cursor-pointer"
                            >
                              + Deixar avaliação
                            </button>
                          </div>
                        ) : (
                          /* Add Review Form Overlay inside reviews tab */
                          <div className="bg-white/5 border border-white/5 rounded-2xl p-4 sm:p-5 mt-4 flex flex-col gap-3">
                            <h4 className="text-xs font-black text-white uppercase tracking-wider">✍️ Escrever Avaliação</h4>
                            
                            {/* Star selector */}
                            <div className="flex flex-col items-center py-1">
                              <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Sua Nota</span>
                              <div className="flex gap-2 mt-1">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <button 
                                    key={s} 
                                    onClick={() => setNewReviewForm(prev => ({ ...prev, rating: s }))}
                                    className="hover:scale-125 transition-transform p-1 cursor-pointer"
                                    type="button"
                                  >
                                    <Star 
                                      size={24} 
                                      className={s <= newReviewForm.rating ? "text-amber-400 fill-amber-400" : "text-white/10"} 
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Inputs */}
                            <div className="flex flex-col gap-3">
                              <div className="flex flex-col gap-1">
                                <label className="text-[9px] text-white/40 uppercase font-bold tracking-wider">Seu Nome *</label>
                                <input 
                                  type="text" 
                                  placeholder="Como você gostaria de aparecer" 
                                  value={newReviewForm.author} 
                                  onChange={(e) => setNewReviewForm(prev => ({ ...prev, author: e.target.value }))} 
                                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[var(--primary)]" 
                                />
                              </div>

                              <div className="flex flex-col gap-1">
                                <label className="text-[9px] text-white/40 uppercase font-bold tracking-wider">Comentário (Opcional)</label>
                                <textarea 
                                  placeholder="O que você achou deste produto / serviço?" 
                                  value={newReviewForm.comment} 
                                  onChange={(e) => setNewReviewForm(prev => ({ ...prev, comment: e.target.value }))} 
                                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[var(--primary)] h-16 resize-none" 
                                />
                              </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex gap-2 justify-end mt-2">
                              <button 
                                onClick={() => setIsReviewFormOpen(false)} 
                                className="px-4 py-2 bg-transparent hover:bg-white/5 text-white/60 hover:text-white rounded-xl text-[10px] uppercase tracking-wider font-bold cursor-pointer"
                              >
                                Cancelar
                              </button>
                              <button 
                                onClick={async () => {
                                  if (!newReviewForm.author.trim()) {
                                    alert("Por favor, preencha o seu nome.");
                                    return;
                                  }
                                  setIsSubmittingReview(true);
                                  try {
                                    const reviewId = `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                                    const docRef = doc(db, 'reviews', reviewId);
                                    await setDoc(docRef, {
                                      companyId: activeMiniSiteCompany.id || '',
                                      itemId: selectedItemForDetail.id,
                                      rating: newReviewForm.rating,
                                      author: newReviewForm.author.trim(),
                                      comment: newReviewForm.comment.trim(),
                                      createdAt: new Date().toISOString()
                                    });
                                    setIsReviewFormOpen(false);
                                    setNewReviewForm({ rating: 5, author: '', comment: '' });
                                    alert("Avaliação registrada com sucesso!");
                                  } catch (e) {
                                    console.error("Failed to save review", e);
                                    alert("Ocorreu um erro ao tentar salvar sua avaliação.");
                                  } finally {
                                    setIsSubmittingReview(false);
                                  }
                                }}
                                disabled={isSubmittingReview}
                                className="px-4 py-2 bg-[var(--primary)] hover:brightness-110 text-black rounded-xl text-[10px] uppercase tracking-widest font-black cursor-pointer"
                              >
                                {isSubmittingReview ? "Gravando..." : "✅ Publicar"}
                              </button>
                            </div>
                          </div>
                        )}

                      </div>
                    )}

                  </div>

                  {/* Footer Panel - Sticky Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/5 flex-shrink-0">
                    {siteType === 'servico' ? (
                      <div className="flex flex-col sm:flex-row gap-2.5 w-full">
                        <button
                          onClick={() => {
                            const textMsg = `Olá! Gostaria de solicitar um orçamento para o serviço: *${selectedItemForDetail.name}* no portal ${appData.siteInfo.name}`;
                            window.open(`https://wa.me/${activeMiniSiteCompany.wa.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(textMsg)}`, '_blank');
                          }}
                          className="flex-1 inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] hover:scale-[1.02] text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-500/10 cursor-pointer transition-all duration-200"
                        >
                          <MessageSquare size={14} /> Soliicitar no WhatsApp
                        </button>
                        <button
                          onClick={() => {
                            const servName = selectedItemForDetail.name;
                            setSelectedItemForDetail(null);
                            setTimeout(() => {
                              const selectEl = document.getElementById('quote-service-select') as HTMLSelectElement;
                              if (selectEl) selectEl.value = servName;
                              const formEl = document.getElementById('quote-side-form');
                              if (formEl) {
                                formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                const inputEl = document.getElementById('quote-sender-name') as HTMLInputElement;
                                if (inputEl) inputEl.focus();
                              }
                            }, 150);
                          }}
                          className="flex-1 inline-flex items-center justify-center gap-2 bg-[var(--primary)] hover:brightness-110 hover:scale-[1.02] text-black py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-[var(--primary)]/10 cursor-pointer transition-all duration-200"
                        >
                          <FileText size={14} /> Preencher Formulário
                        </button>
                      </div>
                    ) : siteType === 'agendamento' ? (
                      <div className="flex flex-col sm:flex-row gap-2.5 w-full">
                        <button
                          onClick={() => {
                            const textMsg = `Olá! Gostaria de agendar um horário para o serviço: *${selectedItemForDetail.name}* no portal ${appData.siteInfo.name}`;
                            window.open(`https://wa.me/${activeMiniSiteCompany.wa.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(textMsg)}`, '_blank');
                          }}
                          className="flex-1 inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] hover:scale-[1.02] text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-500/10 cursor-pointer transition-all duration-200"
                        >
                          <MessageSquare size={14} /> Agendar no WhatsApp
                        </button>
                        <button
                          onClick={() => {
                            const servName = selectedItemForDetail.name;
                            setSelectedItemForDetail(null);
                            setTimeout(() => {
                              const selectEl = document.getElementById('booking-service-select') as HTMLSelectElement;
                              if (selectEl) selectEl.value = servName;
                              const formEl = document.getElementById('booking-sender-name');
                              if (formEl) {
                                formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                formEl.focus();
                              }
                            }, 150);
                          }}
                          className="flex-1 inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 hover:scale-[1.02] text-black py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-amber-400/10 cursor-pointer transition-all duration-200"
                        >
                          <Calendar size={14} /> Preencher Agendamento
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            const priceText = selectedItemForDetail.price 
                              ? `R$ ${parseFloat(selectedItemForDetail.price).toFixed(2).replace('.', ',')}` 
                              : 'Sob Consulta';
                            const textMsg = `Olá! Tenho interesse no item listado no portal ${appData.siteInfo.name}: *${selectedItemForDetail.name}* (Valor: ${priceText}). Gostaria de mais informações ou solicitar o pedido.`;
                            window.open(`https://wa.me/${activeMiniSiteCompany.wa.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(textMsg)}`, '_blank');
                          }}
                          className="flex-1 inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] hover:scale-[1.02] text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-500/10 cursor-pointer transition-all duration-200"
                        >
                          <MessageSquare size={14} /> Pedir pelo WhatsApp
                        </button>

                        <button
                          onClick={() => {
                            setShoppingCart(prev => ({
                              ...prev,
                              [selectedItemForDetail.id]: { item: selectedItemForDetail, count: (prev[selectedItemForDetail.id]?.count || 0) + 1 }
                            }));
                            setSelectedItemForDetail(null);
                            alert("Item adicionado ao carrinho!");
                          }}
                          className="flex-1 inline-flex items-center justify-center gap-2 bg-[var(--primary)] hover:bg-[#ffe066] hover:scale-[1.02] text-black py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-[var(--primary)]/10 cursor-pointer transition-all duration-200"
                        >
                          <ShoppingCart size={14} /> Adicionar {selectedItemForDetail.price ? `R$ ${parseFloat(selectedItemForDetail.price).toFixed(2).replace('.', ',')}` : ''}
                        </button>
                      </>
                    )}
                  </div>

                </div>

              </div>
            </motion.div>
          );
        })()}
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
                <div className="text-2xl font-black text-[#ff8a00] mt-1">
                  R$ {appData?.pricing?.price || '49,90'} <span className="text-xs text-white/40">/ {appData?.pricing?.period ? appData.pricing.period.replace(/^\/+/, '') : 'MÊS'}</span>
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
