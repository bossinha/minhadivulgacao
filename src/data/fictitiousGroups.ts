// Gerador otimizado e determinístico de 7.000+ grupos fictícios e realistas
// com foco em Fortaleza (bairros), Região Metropolitana, Ceará e Brasil (OLX, Vendas, Feiras, Classificados, Negócios)
// Sem sobrecarregar memória do navegador e com rolagem ultra rápida

export interface FictitiousGroupItem {
  id: number;
  name: string;
  type: 'whatsapp' | 'facebook';
  category: string;
  members: string;
  region: 'Fortaleza' | 'Ceará' | 'Brasil';
}

const FORTALEZA_LOCATIONS = [
  "Aldeota", "Meireles", "Messejana", "Parangaba", "Montese", "Centro", "Papicu",
  "Varjota", "Cocó", "Benfica", "Fátima", "Barra do Ceará", "Pirambu", "Conjunto Ceará",
  "Antônio Bezerra", "Cambeba", "Lagoa Redonda", "Passaré", "Castelão", "Jangurussu",
  "Bom Jardim", "Granja Portugal", "Granja Lisboa", "Dionísio Torres", "Sapiranga",
  "Edson Queiroz", "Vila Velha", "Jardim Guanabara", "Parque Manibura", "Cidade 2000",
  "Maraponga", "Mondubim", "José Walter", "Joaquim Távora", "Bairro de Fátima", "Mucuripe",
  "Praia de Iracema", "Beira Mar", "Siqueira", "Genibaú", "Henrique Jorge", "Rodolfo Teófilo",
  "Parquelândia", "Amadeu Furtado", "Bela Vista", "Damas", "Itaperi", "Serrinha",
  "Dias Macedo", "Cidade dos Funcionários", "Parque Iracema", "Guajeru", "Paupina", "Ancuri",
  "Pedras", "Curió", "Coaçu", "São Bento", "Aerolândia", "Alto da Balança"
];

const CEARA_LOCATIONS = [
  "Juazeiro do Norte", "Sobral", "Crato", "Barbalha", "Iguatu", "Maracanaú", "Caucaia",
  "Itapipoca", "Quixadá", "Quixeramobim", "Russas", "Limoeiro do Norte", "Tianguá",
  "Canindé", "Pacatuba", "Guaiúba", "Horizonte", "Pacajus", "Aquiraz", "Cascavel",
  "Beberibe", "Camocim", "Jericoacoara", "Baturité", "Morada Nova", "Banabuiú",
  "São Gonçalo do Amarante", "Pecém", "Eusébio", "Icapuí", "Trairi", "Flecheiras",
  "Acaraú", "Itarema", "Crateús", "Tauá", "Aracati", "Canoa Quebrada", "Brejo Santo",
  "Barreira", "Redenção", "Capistrano", "Ubajara", "Viçosa do Ceará", "Santa Quitéria",
  "Boa Viagem", "Pedra Branca", "Senador Pompeu", "Jaguaribe", "Mombaça", "Várzea Alegre",
  "Campos Sales", "Lavras da Mangabeira", "Ipu", "Guaraciaba do Norte", "Nova Russas",
  "Jaguaruana", "Paraipaba", "Paracuru", "Amontada", "Granja", "Massapê", "Coreaú"
];

const BRASIL_THEMES = [
  "Brasil Vendas Rápidas", "OLX Brasil Classificados", "Feirão dos Estados Brasil",
  "Barganhas & Desapegos Brasil", "Rede Nacional de Negócios", "Mercado Aberto Brasil",
  "Ofertas Relâmpago Brasil", "Empreendedores do Brasil", "Bazar Virtual Brasil",
  "Anúncios Grátis Brasil", "Mega Feirão dos Lojistas Brasil", "Compre Direto do Fabricante Brasil",
  "Rede de Divulgação Contínua Brasil", "Super Ofertas Nordeste & Brasil", "Classificados VIP Brasil",
  "Portal Vende Fácil Brasil", "Feira de Rolo Brasil", "Vendas Diretas & Revenda Brasil",
  "Central de Anúncios Brasil 24h", "Classificados Brasil Capitais", "Comunidade de Vendas Brasil",
  "Balcão dos Negócios Brasil", "Rede Zap Vendas Brasil", "Ponto das Ofertas Brasil",
  "Compre e Venda Sem Intermediários Brasil", "Oportunidades & Negócios Brasil", "Classificados Express Brasil",
  "Feira dos Fabricantes & Varejo Brasil", "Circuito Nacional de Divulgações", "Brasil Vende Tudo 24h",
  "Atacado e Varejo Brasil", "Feirão dos Autônomos Brasil", "Vitrine de Negócios Brasil",
  "Desapega Brasil Nacional", "Rede de Comércio Brasil", "Anuncie Aqui Brasil Geral"
];

const CATEGORIES = [
  "Vendas Gerais", "Classificados", "Comércio Local", "Comunidade", "Ofertas & Promoções",
  "Desapego & Bazar", "Negócios & B2B", "Serviços & Autônomos", "Moda & Confecção",
  "Marketplace", "Brique & Rolo", "Varejo Popular", "Empreendedorismo", "Oportunidades",
  "Parcerias Comerciais", "Feira Livre", "Lojistas & Revenda"
];

const PREFIXES = [
  "Grupo de Vendas", "OLX & Classificados", "Feirão do Rolo", "Vende Tudo",
  "Divulgações & Ofertas", "Barganhas & Trocas", "Desapega", "Balcão de Negócios",
  "Compre e Venda", "Mercadão Virtual", "Rede Comercial", "Feira Livre & Comércio",
  "Anuncie Aqui", "Promoções do Dia", "Mega Bazar", "Classificados Rápidos",
  "Vitrine de Ofertas", "Central de Negócios", "Ponto das Vendas", "Circuito Comercial"
];

// Gera deterministamente exatamente 7.000 grupos estruturados
function generate7000Groups(): FictitiousGroupItem[] {
  const TOTAL_GROUPS = 7000;
  const list: FictitiousGroupItem[] = [];

  for (let i = 1; i <= TOTAL_GROUPS; i++) {
    const mod3 = i % 3;
    let region: 'Fortaleza' | 'Ceará' | 'Brasil';
    let name = '';
    let category = CATEGORIES[i % CATEGORIES.length];
    let type: 'whatsapp' | 'facebook' = (i % 5 === 0 || i % 7 === 0) ? 'facebook' : 'whatsapp';
    let members = '';

    const prefix = PREFIXES[i % PREFIXES.length];

    if (mod3 === 1) {
      // Fortaleza
      region = 'Fortaleza';
      const loc = FORTALEZA_LOCATIONS[Math.floor(i / 3) % FORTALEZA_LOCATIONS.length];
      const cycle = Math.floor(i / (FORTALEZA_LOCATIONS.length * 3)) + 1;
      const cycleSuffix = cycle > 1 ? ` #${cycle}` : '';
      name = `${prefix} ${loc}${cycleSuffix}`;
      if (type === 'whatsapp') {
        const memCount = 650 + ((i * 37) % 375); // 650 a 1.024 membros
        members = `${Math.min(1024, memCount)} membros`;
      } else {
        const memK = 18 + ((i * 17) % 110);
        members = `${memK}.${(i * 13) % 900 || '200'} membros`;
      }
    } else if (mod3 === 2) {
      // Ceará
      region = 'Ceará';
      const loc = CEARA_LOCATIONS[Math.floor(i / 3) % CEARA_LOCATIONS.length];
      const cycle = Math.floor(i / (CEARA_LOCATIONS.length * 3)) + 1;
      const cycleSuffix = cycle > 1 ? ` #${cycle}` : '';
      name = `${prefix} ${loc}${cycleSuffix}`;
      if (type === 'whatsapp') {
        const memCount = 600 + ((i * 41) % 424);
        members = `${Math.min(1024, memCount)} membros`;
      } else {
        const memK = 22 + ((i * 23) % 150);
        members = `${memK}.${(i * 19) % 900 || '400'} membros`;
      }
    } else {
      // Brasil
      region = 'Brasil';
      const theme = BRASIL_THEMES[Math.floor(i / 3) % BRASIL_THEMES.length];
      const cycle = Math.floor(i / (BRASIL_THEMES.length * 3)) + 1;
      name = `${theme} - Rede ${cycle > 1 ? cycle : 'Oficial'}`;
      if (type === 'whatsapp') {
        const memCount = 750 + ((i * 29) % 274);
        members = `${Math.min(1024, memCount)} membros`;
      } else {
        const memK = 60 + ((i * 31) % 480);
        members = `${memK}.${(i * 27) % 900 || '500'} membros`;
      }
    }

    list.push({
      id: i,
      name,
      type,
      category,
      members,
      region
    });
  }

  return list;
}

// Cria a coleção em memória de 7.000 grupos fictícios
export const FICTITIOUS_GROUPS_LIST: FictitiousGroupItem[] = generate7000Groups();
