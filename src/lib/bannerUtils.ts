/**
 * Utility functions to reliably resolve and isolate banner advertiser contacts
 * and prevent cross-contamination of contacts between different advertisers.
 */

export interface BannerAdvertiserMatch {
  company: any | null;
  companyName: string;
  phone: string;
  waLink: string;
  isPortalOfficial: boolean;
}

const normalize = (str: string) => (str || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export const PORTAL_GENERAL_NUMBERS = [
  '5585992908713', 
  '5585992862177', 
  '85992908713', 
  '85992862177',
  '992908713',
  '992862177'
];

export function isPortalGeneralNumber(rawPhoneOrUrl: string | undefined | null): boolean {
  if (!rawPhoneOrUrl) return false;
  const digits = String(rawPhoneOrUrl).replace(/\D/g, '');
  if (!digits) return false;
  return PORTAL_GENERAL_NUMBERS.some(p => digits.endsWith(p) || p.endsWith(digits));
}

export function formatPhoneDigits(raw: string): string {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }
  return digits;
}

export function resolveBannerAdvertiser(
  banner: any, 
  allCompanies: any[] = []
): any | null {
  if (!banner) return null;
  const companies = Array.isArray(allCompanies) ? allCompanies : [];
  if (companies.length === 0) return null;

  const bannerObj = typeof banner === 'string' ? { image: banner } : banner;
  const bId = normalize(bannerObj.companyId);
  const bCompName = normalize(bannerObj.companyName);
  const bTitle = normalize(bannerObj.title || bannerObj.name);
  const bImg = normalize(bannerObj.image || bannerObj.flyerUrl || (typeof banner === 'string' ? banner : ''));
  const rawLink = String(bannerObj.link || bannerObj.whatsappPhone || '');
  const digits = rawLink.replace(/\D/g, '');

  // 1. Prioridade por Nome explícito da Empresa associada
  if (bCompName && !bCompName.includes('minha divulgacao') && !bCompName.includes('patrocinador')) {
    const match = companies.find((c: any) => {
      const cName = normalize(c?.name);
      return cName === bCompName || cName.includes(bCompName) || bCompName.includes(cName);
    });
    if (match) return match;
  }

  // 2. Prioridade por ID real da Empresa (desconsiderando IDs fictícios de templates)
  if (bId && bId !== 'principal' && !bId.startsWith('sponsor_')) {
    const match = companies.find((c: any) => normalize(c.id) === bId || normalize(c.name) === bId);
    if (match) return match;
  }

  // 3. Prioridade por Telefone cadastrado no link ou no whatsappPhone do banner
  if (digits.length >= 8 && !isPortalGeneralNumber(digits)) {
    const match = companies.find((c: any) => {
      const cPhone = String(c.wa || c.whatsapp || c.phone || '').replace(/\D/g, '');
      return cPhone && (digits.endsWith(cPhone) || cPhone.endsWith(digits));
    });
    if (match) return match;
  }

  // 4. Reconhecimento inteligente por imagem / slug / banner visual
  const keywordsMap: { [key: string]: string } = {
    'gih-cred': 'Gih Cred',
    'gih_cred': 'Gih Cred',
    'gihcred': 'Gih Cred',
    'salao': 'Salão Stephanny Jessie',
    'stephanny': 'Salão Stephanny Jessie',
    'belem': 'Belém Rolamentos',
    'rolamentos': 'Belém Rolamentos',
    'assai': 'Assai Atacadista',
    'atacadao': 'Atacadão',
    'ordones': 'Carneiro do Ordones',
    'carneiro': 'Carneiro do Ordones',
    'refrigeracao': 'ESPAÇO FRIO REFRIGERAÇÃO',
    'refrigera': 'ESPAÇO FRIO REFRIGERAÇÃO',
    'espaco frio': 'ESPAÇO FRIO REFRIGERAÇÃO',
    'espaco_frio': 'ESPAÇO FRIO REFRIGERAÇÃO',
    'cartao de todos': 'Cartão de Todos',
    'cartao_de_todos': 'Cartão de Todos',
    'north shopping': 'North Shopping',
    'north_shopping': 'North Shopping'
  };

  for (const [kw, compName] of Object.entries(keywordsMap)) {
    if (bImg.includes(kw) || bTitle.includes(kw)) {
      const found = companies.find((c: any) => normalize(c?.name) === normalize(compName));
      if (found) return found;
    }
  }

  // 5. Comparação de título específico contra nomes de empresas
  if (bTitle && !bTitle.includes('minha divulgacao') && !bTitle.includes('destaque') && !bTitle.includes('banner')) {
    const match = companies.find((c: any) => {
      const cName = normalize(c?.name);
      return cName && (bTitle.includes(cName) || cName.includes(bTitle));
    });
    if (match) return match;
  }

  return null;
}

export function getBannerWhatsAppLink(
  banner: any, 
  targetComp: any | null,
  portalDefaultWa: string = 'https://wa.me/5585992908713'
): string {
  const bannerObj = typeof banner === 'string' ? { image: banner, link: '' } : banner;
  
  // 1. Se a empresa foi identificada com seu WhatsApp próprio:
  if (targetComp) {
    const compWa = String(targetComp.wa || targetComp.whatsapp || targetComp.phone || '').replace(/\D/g, '');
    if (compWa && compWa.length >= 8) {
      const cleanWa = compWa.length === 10 || compWa.length === 11 ? `55${compWa}` : compWa;
      const text = `Olá! Vi o anúncio de *${targetComp.name}* no portal Minha Divulgação e gostaria de mais informações.`;
      return `https://wa.me/${cleanWa}?text=${encodeURIComponent(text)}`;
    }
  }

  // 2. Se o banner possui link direto para número específico (e não é o portal geral quando o banner tem outro nome):
  const rawLink = String(bannerObj.link || bannerObj.whatsappPhone || '');
  if (rawLink) {
    const digits = rawLink.replace(/\D/g, '');
    if (digits.length >= 8 && !isPortalGeneralNumber(digits)) {
      const cleanWa = digits.length === 10 || digits.length === 11 ? `55${digits}` : digits;
      const title = bannerObj.title || bannerObj.name || 'seu anúncio';
      const text = `Olá! Vi ${title} no portal Minha Divulgação e gostaria de mais informações.`;
      return `https://wa.me/${cleanWa}?text=${encodeURIComponent(text)}`;
    }
    if (rawLink.startsWith('http') && !isPortalGeneralNumber(rawLink)) {
      return rawLink;
    }
  }

  // 3. Fallback para WhatsApp oficial do portal
  return portalDefaultWa;
}
