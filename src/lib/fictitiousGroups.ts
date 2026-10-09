export interface FictitiousGroup {
  id: number;
  name: string;
  type: 'whatsapp' | 'facebook';
  members: string;
  region: string;
  category: string;
  verified: boolean;
}

export const FICTITIOUS_DISPATCH_GROUPS: FictitiousGroup[] = [
  // --- FORTALEZA & CEARÁ (WHATSAPP & FACEBOOK) ---
  {
    id: 1,
    name: "Grupo de Vendas OLX Fortaleza",
    type: "whatsapp",
    members: "1.020 membros",
    region: "Fortaleza - CE",
    category: "Vendas Gerais",
    verified: true
  },
  {
    id: 2,
    name: "OLX Ceará Vende Tudo Brasil",
    type: "facebook",
    members: "148.000 membros",
    region: "Ceará / Brasil",
    category: "Classificados & Negócios",
    verified: true
  },
  {
    id: 3,
    name: "Feirão do Rolo Fortaleza & Região",
    type: "whatsapp",
    members: "980 membros",
    region: "Fortaleza - CE",
    category: "Trocas & Compras",
    verified: true
  },
  {
    id: 4,
    name: "Classificados Fortaleza & Região Metropolitana",
    type: "facebook",
    members: "92.500 membros",
    region: "Fortaleza / RMF",
    category: "Comércio Geral",
    verified: true
  },
  {
    id: 5,
    name: "Mercado Livre & OLX Ceará Oficial",
    type: "whatsapp",
    members: "1.015 membros",
    region: "Fortaleza - CE",
    category: "Ofertas & Promoções",
    verified: true
  },
  {
    id: 6,
    name: "Bazar e Vendas Aldeota & Meireles",
    type: "whatsapp",
    members: "940 membros",
    region: "Fortaleza - CE (Aldeota)",
    category: "Moda & Serviços",
    verified: true
  },
  {
    id: 7,
    name: "Feirão de Negócios & Oportunidades Brasil",
    type: "facebook",
    members: "210.000 membros",
    region: "Brasil Geral",
    category: "Empreendimentos",
    verified: true
  },
  {
    id: 8,
    name: "Classificados Brasil Vendas 24h",
    type: "facebook",
    members: "175.000 membros",
    region: "Brasil",
    category: "Classificados",
    verified: true
  },
  {
    id: 9,
    name: "Vendas WhatsApp Fortaleza Centro & Bairros",
    type: "whatsapp",
    members: "890 membros",
    region: "Fortaleza - CE",
    category: "Comércio Local",
    verified: true
  },
  {
    id: 10,
    name: "Compras e Vendas Messejana & Eusébio",
    type: "whatsapp",
    members: "1.005 membros",
    region: "Messejana / Eusébio",
    category: "Classificados",
    verified: true
  },
  {
    id: 11,
    name: "Feirão do Rolo Caucaia & Litoral Oeste",
    type: "facebook",
    members: "64.000 membros",
    region: "Caucaia - CE",
    category: "Trocas e Vendas",
    verified: true
  },
  {
    id: 12,
    name: "Desapega e Vende Tudo Fortaleza CE",
    type: "whatsapp",
    members: "970 membros",
    region: "Fortaleza - CE",
    category: "Vendas Rápidas",
    verified: true
  },
  {
    id: 13,
    name: "OLX Maracanaú, Maranguape & Pacatuba",
    type: "facebook",
    members: "83.000 membros",
    region: "Região Metropolitana CE",
    category: "Ofertas Locais",
    verified: true
  },
  {
    id: 14,
    name: "Negócios & Oportunidades Ceará 24h",
    type: "whatsapp",
    members: "1.010 membros",
    region: "Fortaleza - CE",
    category: "Comércio & B2B",
    verified: true
  },
  {
    id: 15,
    name: "Feira Livre & Ofertas Montese, Parangaba & Serrinha",
    type: "whatsapp",
    members: "930 membros",
    region: "Fortaleza - CE",
    category: "Comércio & Bairros",
    verified: true
  },
  {
    id: 16,
    name: "Comunidade de Vendas e Divulgação Brasil",
    type: "facebook",
    members: "320.000 membros",
    region: "Brasil Geral",
    category: "Divulgação Direta",
    verified: true
  },
  {
    id: 17,
    name: "Classificados Automotivos & Veículos Fortaleza",
    type: "whatsapp",
    members: "1.024 membros",
    region: "Fortaleza - CE",
    category: "Autos & Peças",
    verified: true
  },
  {
    id: 18,
    name: "Bazar e Desapego Fátima, Benfica & Parreão",
    type: "whatsapp",
    members: "880 membros",
    region: "Fortaleza - CE",
    category: "Variedades",
    verified: true
  },
  {
    id: 19,
    name: "Vende-se Tudo Fortaleza & Interior do Ceará",
    type: "facebook",
    members: "115.000 membros",
    region: "Ceará Geral",
    category: "Classificados",
    verified: true
  },
  {
    id: 20,
    name: "Grupo de Promoções e Descontos Fortaleza",
    type: "whatsapp",
    members: "1.000 membros",
    region: "Fortaleza - CE",
    category: "Promoções",
    verified: true
  },
  {
    id: 21,
    name: "Mulheres Empreendedoras & Bazar Fortaleza",
    type: "whatsapp",
    members: "960 membros",
    region: "Fortaleza - CE",
    category: "Moda & Beleza",
    verified: true
  },
  {
    id: 22,
    name: "Classificados & Anúncios Nordeste Vendas",
    type: "facebook",
    members: "185.000 membros",
    region: "Nordeste / Brasil",
    category: "Comércio Geral",
    verified: true
  },
  {
    id: 23,
    name: "Mercado das Oportunidades Fortaleza Sul",
    type: "whatsapp",
    members: "915 membros",
    region: "Fortaleza - CE (Sul)",
    category: "Vendas Gerais",
    verified: true
  },
  {
    id: 24,
    name: "Feirão do Rolo Bezerra de Menezes & Parquelândia",
    type: "whatsapp",
    members: "950 membros",
    region: "Fortaleza - CE",
    category: "Comércio Local",
    verified: true
  },
  {
    id: 25,
    name: "Rede Nacional de Compras e Negócios Brasil",
    type: "facebook",
    members: "290.000 membros",
    region: "Brasil",
    category: "Atacado & Varejo",
    verified: true
  },
  {
    id: 26,
    name: "Ofertas e Vendas Papicu, Varjota & Dunas",
    type: "whatsapp",
    members: "895 membros",
    region: "Fortaleza - CE (Leste)",
    category: "Comércio & Gastronomia",
    verified: true
  },
  {
    id: 27,
    name: "Classificados São Gerardo, Farias Brito & Jacarecanga",
    type: "whatsapp",
    members: "860 membros",
    region: "Fortaleza - CE",
    category: "Bairros & Vendas",
    verified: true
  },
  {
    id: 28,
    name: "Comunidade OLX e Feirão do Rolo Brasil",
    type: "facebook",
    members: "410.000 membros",
    region: "Brasil Geral",
    category: "Classificados",
    verified: true
  },
  {
    id: 29,
    name: "Divulgações & Anúncios Ceará Expresso",
    type: "whatsapp",
    members: "1.018 membros",
    region: "Fortaleza - CE",
    category: "Marketing Direto",
    verified: true
  },
  {
    id: 30,
    name: "Feira de Negócios Eusébio, Aquiraz & Porto das Dunas",
    type: "facebook",
    members: "58.000 membros",
    region: "Litoral Leste CE",
    category: "Serviços & Imóveis",
    verified: true
  },
  {
    id: 31,
    name: "Grupo de Vendas Conjunto Ceará & Genibaú",
    type: "whatsapp",
    members: "925 membros",
    region: "Fortaleza - CE (Oeste)",
    category: "Vendas Locais",
    verified: true
  },
  {
    id: 32,
    name: "Anunciou Vendeu Fortaleza Oficial",
    type: "facebook",
    members: "135.000 membros",
    region: "Fortaleza - CE",
    category: "Classificados",
    verified: true
  },
  {
    id: 33,
    name: "Bazar e Brechó Chic Fortaleza",
    type: "whatsapp",
    members: "870 membros",
    region: "Fortaleza - CE",
    category: "Moda & Acessórios",
    verified: true
  },
  {
    id: 34,
    name: "Central de Serviços e Profissionais CE",
    type: "whatsapp",
    members: "990 membros",
    region: "Fortaleza - CE",
    category: "Prestação de Serviços",
    verified: true
  },
  {
    id: 35,
    name: "Vendas & Negócios São Paulo / Ceará Conexão",
    type: "facebook",
    members: "160.000 membros",
    region: "Brasil / SP / CE",
    category: "Mercadorias & Atacado",
    verified: true
  },
  {
    id: 36,
    name: "Feira da Madrugada & Vendas Fortaleza",
    type: "whatsapp",
    members: "1.012 membros",
    region: "Fortaleza - CE (Centro)",
    category: "Vestuário & Atacado",
    verified: true
  },
  {
    id: 37,
    name: "OLX e Vendas Barra do Ceará, Pirambu & Vila Velha",
    type: "whatsapp",
    members: "940 membros",
    region: "Fortaleza - CE",
    category: "Comércio Popular",
    verified: true
  },
  {
    id: 38,
    name: "Classificados Ceará Negócios Imobiliários & Gerais",
    type: "facebook",
    members: "76.000 membros",
    region: "Ceará",
    category: "Imóveis & Vendas",
    verified: true
  },
  {
    id: 39,
    name: "Grupo VIP de Ofertas e Lojas Fortaleza",
    type: "whatsapp",
    members: "1.022 membros",
    region: "Fortaleza - CE",
    category: "Promoções",
    verified: true
  },
  {
    id: 40,
    name: "Comércio Aberto Brasil - Todos os Estados",
    type: "facebook",
    members: "250.000 membros",
    region: "Brasil",
    category: "Divulgação Nacional",
    verified: true
  },
  {
    id: 41,
    name: "Vendas e Trocas Dionísio Torres & Joaquim Távora",
    type: "whatsapp",
    members: "885 membros",
    region: "Fortaleza - CE",
    category: "Vendas & Bairros",
    verified: true
  },
  {
    id: 42,
    name: "Bazar dos Confeiteiros e Gastronomia CE",
    type: "whatsapp",
    members: "920 membros",
    region: "Fortaleza - CE",
    category: "Alimentação & Doces",
    verified: true
  },
  {
    id: 43,
    name: "Feirão do Rolo Maracanaú Jereissati & Pajuçara",
    type: "facebook",
    members: "71.000 membros",
    region: "Maracanaú - CE",
    category: "Comércio Local",
    verified: true
  },
  {
    id: 44,
    name: "Classificados Fortaleza Eletrônicos & Celulares",
    type: "whatsapp",
    members: "1.015 membros",
    region: "Fortaleza - CE",
    category: "Tecnologia",
    verified: true
  },
  {
    id: 45,
    name: "Mercadão do Povo Fortaleza & Região",
    type: "facebook",
    members: "105.000 membros",
    region: "Fortaleza - CE",
    category: "Variedades",
    verified: true
  },
  {
    id: 46,
    name: "Vendas e Trocas Passaré, Castelão & Dias Macedo",
    type: "whatsapp",
    members: "935 membros",
    region: "Fortaleza - CE",
    category: "Comércio Regional",
    verified: true
  },
  {
    id: 47,
    name: "Rede de Divulgação WhatsApp Nordeste Oficial",
    type: "whatsapp",
    members: "1.008 membros",
    region: "Nordeste / CE",
    category: "Transmissões",
    verified: true
  },
  {
    id: 48,
    name: "Feirão Automotivo Ceará Carros & Motos",
    type: "facebook",
    members: "128.000 membros",
    region: "Ceará",
    category: "Veículos",
    verified: true
  },
  {
    id: 49,
    name: "Compras e Vendas Cocó, Cidade 2000 & Praia do Futuro",
    type: "whatsapp",
    members: "910 membros",
    region: "Fortaleza - CE",
    category: "Bairros Nobres",
    verified: true
  },
  {
    id: 50,
    name: "Brasil Classificados & Marketplace Geral",
    type: "facebook",
    members: "380.000 membros",
    region: "Brasil",
    category: "Classificados",
    verified: true
  },

  // --- SEGUNDA METADE (51 a 100) ---
  {
    id: 51,
    name: "Vendas OLX Mondubim, Esperança & Maraponga",
    type: "whatsapp",
    members: "955 membros",
    region: "Fortaleza - CE",
    category: "Comércio Local",
    verified: true
  },
  {
    id: 52,
    name: "Bazar e Empreendedorismo Feminino Brasil",
    type: "facebook",
    members: "190.000 membros",
    region: "Brasil",
    category: "Moda & Beleza",
    verified: true
  },
  {
    id: 53,
    name: "Classificados José Walter, Planalto & Bairros",
    type: "whatsapp",
    members: "895 membros",
    region: "Fortaleza - CE",
    category: "Vendas Bairros",
    verified: true
  },
  {
    id: 54,
    name: "Feirão dos Lojistas do Centro de Fortaleza",
    type: "whatsapp",
    members: "1.020 membros",
    region: "Fortaleza - CE",
    category: "Lojas & Varejo",
    verified: true
  },
  {
    id: 55,
    name: "Marketplace Fortaleza & Grande Fortaleza",
    type: "facebook",
    members: "155.000 membros",
    region: "Fortaleza - CE",
    category: "Vendas Online",
    verified: true
  },
  {
    id: 56,
    name: "Vendas e Oportunidades Messejana Centro & Coaçu",
    type: "whatsapp",
    members: "940 membros",
    region: "Messejana - CE",
    category: "Classificados",
    verified: true
  },
  {
    id: 57,
    name: "Anúncios Comerciais Brasil 24 Horas",
    type: "facebook",
    members: "270.000 membros",
    region: "Brasil",
    category: "Divulgação Comercial",
    verified: true
  },
  {
    id: 58,
    name: "Grupo de Trocas e Vendas Jóquei Clube & Demócrito Rocha",
    type: "whatsapp",
    members: "875 membros",
    region: "Fortaleza - CE",
    category: "Comércio Bairros",
    verified: true
  },
  {
    id: 59,
    name: "Feirão do Rolo Sobral & Norte do Ceará",
    type: "facebook",
    members: "88.000 membros",
    region: "Sobral / Norte CE",
    category: "Regional Ceará",
    verified: true
  },
  {
    id: 60,
    name: "Vendas WhatsApp Fortaleza Litoral & Turismo",
    type: "whatsapp",
    members: "980 membros",
    region: "Fortaleza - CE",
    category: "Serviços & Turismo",
    verified: true
  },
  {
    id: 61,
    name: "Bazar da Moda & Confecção José Avelino",
    type: "whatsapp",
    members: "1.015 membros",
    region: "Fortaleza - CE",
    category: "Moda Atacado",
    verified: true
  },
  {
    id: 62,
    name: "Classificados Rio / São Paulo / Fortaleza Brasil",
    type: "facebook",
    members: "235.000 membros",
    region: "Brasil",
    category: "Intermunicipal",
    verified: true
  },
  {
    id: 63,
    name: "Grupo de Compras Água Fria, Cambeba & Seisbocas",
    type: "whatsapp",
    members: "930 membros",
    region: "Fortaleza - CE",
    category: "Bairros Sul",
    verified: true
  },
  {
    id: 64,
    name: "Feirão de Construção, Reformas & Serviços CE",
    type: "whatsapp",
    members: "890 membros",
    region: "Fortaleza - CE",
    category: "Construção & Casa",
    verified: true
  },
  {
    id: 65,
    name: "OLX Juazeiro do Norte & Região do Cariri",
    type: "facebook",
    members: "110.000 membros",
    region: "Cariri / Sul CE",
    category: "Regional Ceará",
    verified: true
  },
  {
    id: 66,
    name: "Promoções e Vendas Henrique Jorge & Autran Nunes",
    type: "whatsapp",
    members: "865 membros",
    region: "Fortaleza - CE",
    category: "Comércio Bairros",
    verified: true
  },
  {
    id: 67,
    name: "Classificados Brasil Negócios e Franquias",
    type: "facebook",
    members: "165.000 membros",
    region: "Brasil",
    category: "Investimentos & Negócios",
    verified: true
  },
  {
    id: 68,
    name: "Vendas e Variedades Rodolfo Teófilo & Bela Vista",
    type: "whatsapp",
    members: "905 membros",
    region: "Fortaleza - CE",
    category: "Comércio Local",
    verified: true
  },
  {
    id: 69,
    name: "Comunidade de Vendas e Trocas Itaitinga & Pacatuba",
    type: "facebook",
    members: "49.000 membros",
    region: "RMF - CE",
    category: "Classificados",
    verified: true
  },
  {
    id: 70,
    name: "Divulgação Direta WhatsApp Ceará e Brasil",
    type: "whatsapp",
    members: "1.020 membros",
    region: "Ceará / Brasil",
    category: "Marketing Direto",
    verified: true
  },
  {
    id: 71,
    name: "Feirão das Peças & Acessórios Automotivos CE",
    type: "whatsapp",
    members: "960 membros",
    region: "Fortaleza - CE",
    category: "Autos",
    verified: true
  },
  {
    id: 72,
    name: "Bazar Beneficente & Vendas de Garagem Fortaleza",
    type: "whatsapp",
    members: "840 membros",
    region: "Fortaleza - CE",
    category: "Desapego",
    verified: true
  },
  {
    id: 73,
    name: "Comunidade Feirão do Rolo Bahia / Ceará",
    type: "facebook",
    members: "140.000 membros",
    region: "Nordeste Brasil",
    category: "Classificados",
    verified: true
  },
  {
    id: 74,
    name: "Grupo de Ofertas Bairro de Fátima & Aerolândia",
    type: "whatsapp",
    members: "910 membros",
    region: "Fortaleza - CE",
    category: "Comércio",
    verified: true
  },
  {
    id: 75,
    name: "Classificados Brasil Eletrônicos, Games & Informática",
    type: "facebook",
    members: "280.000 membros",
    region: "Brasil",
    category: "Tecnologia",
    verified: true
  },
  {
    id: 76,
    name: "Vendas Rápidas Carlito Pamplona & Álvaro Weyne",
    type: "whatsapp",
    members: "895 membros",
    region: "Fortaleza - CE",
    category: "Vendas Populares",
    verified: true
  },
  {
    id: 77,
    name: "Mercado Imobiliário Fortaleza Aluguel & Venda",
    type: "whatsapp",
    members: "1.015 membros",
    region: "Fortaleza - CE",
    category: "Imóveis",
    verified: true
  },
  {
    id: 78,
    name: "Classificados Ceará Saúde, Estética & Bem Estar",
    type: "facebook",
    members: "62.000 membros",
    region: "Ceará",
    category: "Beleza & Saúde",
    verified: true
  },
  {
    id: 79,
    name: "Feirão do Rolo Conjunto Palmeiras & Jangurussu",
    type: "whatsapp",
    members: "935 membros",
    region: "Fortaleza - CE",
    category: "Comércio Popular",
    verified: true
  },
  {
    id: 80,
    name: "Super Rede de Vendas Online Brasil 2026",
    type: "facebook",
    members: "340.000 membros",
    region: "Brasil Geral",
    category: "Marketplace",
    verified: true
  },
  {
    id: 81,
    name: "Vendas e Trocas Bairro Ellery & Monte Castelo",
    type: "whatsapp",
    members: "870 membros",
    region: "Fortaleza - CE",
    category: "Comércio Local",
    verified: true
  },
  {
    id: 82,
    name: "Classificados Pet & Agro Fortaleza & Ceará",
    type: "whatsapp",
    members: "925 membros",
    region: "Fortaleza - CE",
    category: "Pet & Agro",
    verified: true
  },
  {
    id: 83,
    name: "Feira de Oportunidades Aquiraz, Prainha & Iguape",
    type: "facebook",
    members: "47.000 membros",
    region: "Litoral Leste CE",
    category: "Turismo & Comércio",
    verified: true
  },
  {
    id: 84,
    name: "Grupo de Descontos e Cupons Fortaleza",
    type: "whatsapp",
    members: "1.010 membros",
    region: "Fortaleza - CE",
    category: "Cupons & Ofertas",
    verified: true
  },
  {
    id: 85,
    name: "Negócios Brasil - Atacadistas e Representantes",
    type: "facebook",
    members: "195.000 membros",
    region: "Brasil",
    category: "B2B & Representação",
    verified: true
  },
  {
    id: 86,
    name: "Vendas e Serviços Vila Peri, Vila Manoel Sátiro",
    type: "whatsapp",
    members: "880 membros",
    region: "Fortaleza - CE",
    category: "Comércio Bairros",
    verified: true
  },
  {
    id: 87,
    name: "Classificados Fortaleza Cursos, Aulas & Treinamentos",
    type: "whatsapp",
    members: "940 membros",
    region: "Fortaleza - CE",
    category: "Educação & Vagas",
    verified: true
  },
  {
    id: 88,
    name: "Feirão do Rolo Cumbuco, Tabuba & Icaraí",
    type: "facebook",
    members: "53.000 membros",
    region: "Litoral Oeste CE",
    category: "Comércio & Praias",
    verified: true
  },
  {
    id: 89,
    name: "Bazar Moda Praia & Fitness Fortaleza",
    type: "whatsapp",
    members: "975 membros",
    region: "Fortaleza - CE",
    category: "Moda Praia",
    verified: true
  },
  {
    id: 90,
    name: "Vendas Brasil - Pequenos Negócios e Autônomos",
    type: "facebook",
    members: "220.000 membros",
    region: "Brasil",
    category: "Empreendedores",
    verified: true
  },
  {
    id: 91,
    name: "Grupo de Comércio Bom Jardim & Granja Portugal",
    type: "whatsapp",
    members: "960 membros",
    region: "Fortaleza - CE",
    category: "Comércio Popular",
    verified: true
  },
  {
    id: 92,
    name: "Classificados Gastronomia, Lanches & Delivery Fortaleza",
    type: "whatsapp",
    members: "1.005 membros",
    region: "Fortaleza - CE",
    category: "Delivery & Comida",
    verified: true
  },
  {
    id: 93,
    name: "Feirão de Veículos e Trocas Horizonte & Pacajus",
    type: "facebook",
    members: "61.000 membros",
    region: "Região Metropolitana CE",
    category: "Autos & Peças",
    verified: true
  },
  {
    id: 94,
    name: "Vendas e Oportunidades Parque Manibura & Cidade dos Funcionários",
    type: "whatsapp",
    members: "935 membros",
    region: "Fortaleza - CE",
    category: "Bairros Nobres Sul",
    verified: true
  },
  {
    id: 95,
    name: "Classificados Ceará & Piauí Vendas Gerais",
    type: "facebook",
    members: "115.000 membros",
    region: "Nordeste",
    category: "Classificados",
    verified: true
  },
  {
    id: 96,
    name: "Grupo de Vendas Pan Americano, Demócrito & Couto Fernandes",
    type: "whatsapp",
    members: "860 membros",
    region: "Fortaleza - CE",
    category: "Comércio Bairros",
    verified: true
  },
  {
    id: 97,
    name: "Anúncios Rápidos WhatsApp Fortaleza 24 Horas",
    type: "whatsapp",
    members: "1.018 membros",
    region: "Fortaleza - CE",
    category: "Divulgação Direta",
    verified: true
  },
  {
    id: 98,
    name: "Feirão dos Móveis, Eletros & Decoração Fortaleza",
    type: "facebook",
    members: "96.000 membros",
    region: "Fortaleza - CE",
    category: "Casa & Móveis",
    verified: true
  },
  {
    id: 99,
    name: "Vendas e Negócios Messejana, Paupina & Ancuri",
    type: "whatsapp",
    members: "910 membros",
    region: "Fortaleza - CE",
    category: "Comércio Local",
    verified: true
  },
  {
    id: 100,
    name: "Grande Rede Minha Divulgação Brasil - Todos os Grupos",
    type: "facebook",
    members: "500.000+ membros",
    region: "Brasil / Fortaleza",
    category: "Rede Master Oficial",
    verified: true
  }
];

export function getRandomFictitiousGroup(seed?: number): FictitiousGroup {
  if (seed !== undefined) {
    const idx = Math.abs(seed) % FICTITIOUS_DISPATCH_GROUPS.length;
    return FICTITIOUS_DISPATCH_GROUPS[idx];
  }
  const randomIdx = Math.floor(Math.random() * FICTITIOUS_DISPATCH_GROUPS.length);
  return FICTITIOUS_DISPATCH_GROUPS[randomIdx];
}
