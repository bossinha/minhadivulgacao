import React, { useState, useMemo, useEffect } from 'react';
import { 
  Video, 
  Play, 
  ExternalLink, 
  Sparkles, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  Search, 
  Store, 
  RefreshCw,
  Sliders,
  HelpCircle,
  Film
} from 'lucide-react';
import { WhatsAppIcon } from './SocialMediaIcons';
import { PortalWelcomeVideoConfig, parseVideoSource } from './PortalWelcomeVideoModal';

interface AdminWelcomeVideoConfigProps {
  config: PortalWelcomeVideoConfig | undefined;
  companies: any[];
  advertisers?: any[];
  onChange: (newConfig: PortalWelcomeVideoConfig) => void;
  onSave?: () => void;
  onTestPreview: () => void;
}

export const AdminWelcomeVideoConfig: React.FC<AdminWelcomeVideoConfigProps> = ({
  config,
  companies = [],
  advertisers = [],
  onChange,
  onSave,
  onTestPreview
}) => {
  // Local state for smooth editing
  const currentConfig: PortalWelcomeVideoConfig = useMemo(() => {
    return {
      enabled: config?.enabled !== false,
      videoUrl: config?.videoUrl || '',
      title: config?.title || 'Destaque Patrocinado',
      badge: config?.badge || 'PATROCINADO',
      buttonText: config?.buttonText || 'Falar no WhatsApp',
      targetType: config?.targetType || 'company',
      companyId: config?.companyId || '',
      companyName: config?.companyName || '',
      companyCategory: config?.companyCategory || '',
      companyLogo: config?.companyLogo || '',
      whatsappPhone: config?.whatsappPhone || '',
      customLink: config?.customLink || '',
      actionType: config?.actionType || 'whatsapp',
      whatsappMessage: config?.whatsappMessage || 'Olá! Vi o anúncio em vídeo no Portal de Divulgação e gostaria de saber mais informações!',
      frequency: config?.frequency || 'always',
      autoPlayMuted: config?.autoPlayMuted !== false
    };
  }, [config]);

  const [companySearch, setCompanySearch] = useState('');
  const [previewError, setPreviewError] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // Combine companies from appData and registered advertisers
  const allAvailableCompanies = useMemo(() => {
    const list: Array<{ id: string | number; name: string; category?: string; wa?: string; phone?: string; logo?: string; image?: string }> = [];
    const seen = new Set<string>();

    companies.forEach((c) => {
      const name = (c.name || '').trim();
      if (name && !seen.has(name.toLowerCase())) {
        seen.add(name.toLowerCase());
        list.push({
          id: c.id || name,
          name: name,
          category: c.category || '',
          wa: c.wa || c.whatsapp || c.phone || '',
          phone: c.phone || c.whatsapp || c.wa || '',
          logo: c.logo || c.image || ''
        });
      }
    });

    advertisers.forEach((a) => {
      const name = (a.name || a.companyName || '').trim();
      if (name && !seen.has(name.toLowerCase())) {
        seen.add(name.toLowerCase());
        list.push({
          id: a.id || a.advertiserId || name,
          name: name,
          category: a.category || a.segment || '',
          wa: a.wa || a.whatsapp || a.phone || '',
          phone: a.phone || a.whatsapp || a.wa || '',
          logo: a.logo || a.image || ''
        });
      }
    });

    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [companies, advertisers]);

  // Filtered company list for search dropdown
  const filteredCompanies = useMemo(() => {
    if (!companySearch.trim()) return allAvailableCompanies;
    const term = companySearch.toLowerCase();
    return allAvailableCompanies.filter(c => 
      c.name.toLowerCase().includes(term) || 
      (c.category && c.category.toLowerCase().includes(term))
    );
  }, [allAvailableCompanies, companySearch]);

  const updateField = (field: keyof PortalWelcomeVideoConfig, value: any) => {
    onChange({
      ...currentConfig,
      [field]: value
    });
  };

  const handleSelectCompany = (comp: any) => {
    const rawPhone = comp.wa || comp.phone || '';
    const cleanDigits = rawPhone.replace(/\D/g, '');

    const companyDefaultMessage = `Olá ${comp.name}! Vi o anúncio em vídeo no Portal de Divulgação e gostaria de saber mais informações!`;

    onChange({
      ...currentConfig,
      targetType: 'company',
      companyId: comp.id,
      companyName: comp.name,
      companyCategory: comp.category || '',
      companyLogo: comp.logo || '',
      whatsappPhone: cleanDigits || rawPhone,
      actionType: 'whatsapp',
      whatsappMessage: companyDefaultMessage,
      buttonText: 'Falar no WhatsApp'
    });
  };

  const parsedVideo = parseVideoSource(currentConfig.videoUrl);

  const handleSaveClick = () => {
    if (onSave) {
      onSave();
      setSaveSuccessNotice(true);
      setTimeout(() => setSaveSuccessNotice(false), 3000);
    }
  };

  return (
    <div className="dev-forms-container text-white">
      {/* Top Banner Exclusivo */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 border border-amber-500/30 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Film className="w-5 h-5" />
            </span>
            <h3 className="text-base sm:text-lg font-black text-amber-400 m-0">
              VÍDEO PATROCINADO DE ENTRADA (POPUP AO ABRIR O SITE)
            </h3>
          </div>
          <p className="text-xs text-white/70 m-0 max-w-2xl leading-relaxed">
            Configure o vídeo que abre na tela quando a pessoa clica no link do portal (ex: divulgações em grupos de WhatsApp). 
            Se não houver link configurado, o vídeo não aparece. Você vê a amostra ao vivo abaixo antes de salvar.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onTestPreview}
            disabled={!currentConfig.videoUrl.trim()}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition ${
              currentConfig.videoUrl.trim()
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30'
                : 'bg-white/10 text-white/40 cursor-not-allowed'
            }`}
            title="Ver como o visitante verá o vídeo na tela"
          >
            <Eye className="w-4 h-4" />
            Testar como Visitante
          </button>

          {onSave && (
            <button
              type="button"
              onClick={handleSaveClick}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Salvar Alterações
            </button>
          )}
        </div>
      </div>

      {saveSuccessNotice && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4" />
          Configurações do vídeo de entrada salvas com sucesso!
        </div>
      )}

      {/* Grid: Configurações à esquerda | Amostra ao vivo à direita */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Coluna Esquerda: Formulário de Configuração (7 colunas) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* 1. Ativação Geral */}
          <div className="p-4 rounded-xl bg-[#121624] border border-white/10 flex items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-white mb-0.5">Exibir Vídeo na Entrada</h4>
              <p className="text-[11px] text-white/50 m-0">
                O vídeo só aparece se esta opção estiver ativada E você tiver preenchido um link de vídeo válido.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={currentConfig.enabled}
                onChange={(e) => updateField('enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {/* 2. Link do Vídeo */}
          <div className="p-4 rounded-xl bg-[#121624] border border-white/10 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Video className="w-4 h-4" />
                Link do Vídeo (MP4, YouTube ou link direto)
              </label>
              <a 
                href="https://archive.org/" 
                target="_blank" 
                rel="noreferrer" 
                className="text-[11px] text-amber-400/80 hover:text-amber-300 underline flex items-center gap-1"
              >
                Hospedar no Archive.org <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <input
              type="text"
              value={currentConfig.videoUrl}
              onChange={(e) => {
                setPreviewError(false);
                setVideoLoaded(false);
                updateField('videoUrl', e.target.value);
              }}
              placeholder="Ex: https://archive.org/download/meuvideo/anuncio.mp4"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/20 text-white placeholder-white/30 text-xs font-mono focus:outline-none focus:border-amber-500 transition"
            />

            <div className="flex items-center justify-between text-[11px] text-white/50">
              <span>Formato recomendado: <strong>.mp4 direto</strong> (carrega leve e roda instantaneamente)</span>
              {currentConfig.videoUrl && (
                <button
                  type="button"
                  onClick={() => updateField('videoUrl', '')}
                  className="text-red-400 hover:text-red-300 cursor-pointer"
                >
                  Limpar link
                </button>
              )}
            </div>
          </div>

          {/* 3. Botão de Direcionamento (CTA) */}
          <div className="p-4 rounded-xl bg-[#121624] border border-white/10 flex flex-col gap-4">
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-1">
                <WhatsAppIcon className="w-4 h-4 fill-emerald-400" />
                Botão de Direcionamento do Vídeo
              </h4>
              <p className="text-[11px] text-white/50 m-0">
                Escolha para onde o cliente será direcionado caso queira saber o que é ou comprar.
              </p>
            </div>

            {/* Alternador de Modo: Puxar de Empresa vs Digitar Manualmente */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-black/40 border border-white/10">
              <button
                type="button"
                onClick={() => updateField('targetType', 'company')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  currentConfig.targetType === 'company'
                    ? 'bg-amber-500 text-black shadow'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                Puxar da Plataforma
              </button>
              <button
                type="button"
                onClick={() => updateField('targetType', 'manual')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  currentConfig.targetType === 'manual'
                    ? 'bg-amber-500 text-black shadow'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                Digitar Manualmente
              </button>
            </div>

            {/* Modo 1: Puxar Empresa da Plataforma */}
            {currentConfig.targetType === 'company' && (
              <div className="flex flex-col gap-3 p-3 rounded-xl bg-black/40 border border-amber-500/20">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white/80">
                    Selecione a Empresa Cadastrada ({allAvailableCompanies.length} disponíveis):
                  </label>
                  {currentConfig.companyName && (
                    <span className="text-[10px] text-amber-400 font-semibold">
                      Selecionada: {currentConfig.companyName}
                    </span>
                  )}
                </div>

                {/* Campo de Busca Rápida de Empresa */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-white/40" />
                  <input
                    type="text"
                    value={companySearch}
                    onChange={(e) => setCompanySearch(e.target.value)}
                    placeholder="Buscar empresa por nome ou categoria..."
                    className="w-full pl-8 pr-3 py-2 rounded-lg bg-black/60 border border-white/15 text-white text-xs placeholder-white/30 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Lista rolável de seleção de empresas */}
                <div className="max-h-44 overflow-y-auto rounded-lg border border-white/10 bg-black/30 divide-y divide-white/5">
                  {filteredCompanies.length > 0 ? (
                    filteredCompanies.map((comp) => {
                      const isSelected = String(currentConfig.companyId) === String(comp.id) || currentConfig.companyName === comp.name;
                      return (
                        <div
                          key={comp.id}
                          onClick={() => handleSelectCompany(comp)}
                          className={`p-2.5 flex items-center justify-between gap-3 text-xs cursor-pointer transition ${
                            isSelected
                              ? 'bg-amber-500/20 border-l-4 border-amber-500'
                              : 'hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {comp.logo ? (
                              <img src={comp.logo} alt={comp.name} className="w-7 h-7 rounded-full object-cover bg-black border border-white/10 shrink-0" />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-amber-400 shrink-0">
                                {comp.name.charAt(0)}
                              </div>
                            )}
                            <div className="truncate">
                              <span className="font-bold text-white block truncate">{comp.name}</span>
                              <span className="text-[10px] text-white/50 block truncate">
                                {comp.category || 'Empresa'} • WhatsApp: {comp.wa || comp.phone || 'Não informado'}
                              </span>
                            </div>
                          </div>
                          {isSelected && (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold shrink-0">
                              ✓ Selecionada
                            </span>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-xs text-white/40">
                      Nenhuma empresa encontrada com esse termo.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Campos de WhatsApp e Mensagem */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-white/80 block mb-1">
                  WhatsApp de Direcionamento (com DDD)
                </label>
                <input
                  type="text"
                  value={currentConfig.whatsappPhone || ''}
                  onChange={(e) => updateField('whatsappPhone', e.target.value)}
                  placeholder="Ex: 85992908713"
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white/80 block mb-1">
                  Texto do Botão
                </label>
                <input
                  type="text"
                  value={currentConfig.buttonText || ''}
                  onChange={(e) => updateField('buttonText', e.target.value)}
                  placeholder="Ex: Falar no WhatsApp Agora"
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Mensagem Padrão que vai no WhatsApp */}
            <div>
              <label className="text-xs font-bold text-white/80 block mb-1">
                Mensagem Automática do WhatsApp (sempre dizendo que viu no portal)
              </label>
              <textarea
                rows={2}
                value={currentConfig.whatsappMessage || ''}
                onChange={(e) => updateField('whatsappMessage', e.target.value)}
                placeholder="Ex: Olá! Vi o anúncio em vídeo no Portal de Divulgação e gostaria de saber mais informações!"
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-white text-xs focus:outline-none focus:border-emerald-500 resize-none"
              />
              <span className="text-[10px] text-white/40">
                Quando o cliente clicar no botão, o WhatsApp abrirá com essa mensagem já digitada para ele só enviar.
              </span>
            </div>

            {/* Link Externo Opcional (se não quiser WhatsApp) */}
            <div className="pt-2 border-t border-white/10">
              <label className="text-xs font-bold text-white/60 block mb-1">
                Link Externo Alternativo (Opcional - Site, Loja Virtual ou Instagram)
              </label>
              <input
                type="text"
                value={currentConfig.customLink || ''}
                onChange={(e) => updateField('customLink', e.target.value)}
                placeholder="Ex: https://meusite.com.br (deixe vazio se for WhatsApp)"
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* 4. Opções Adicionais */}
          <div className="p-4 rounded-xl bg-[#121624] border border-white/10 flex flex-col gap-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white/80">
              Frequência de Exibição
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition ${
                currentConfig.frequency === 'always'
                  ? 'bg-amber-500/15 border-amber-500/50 text-white'
                  : 'bg-black/40 border-white/10 text-white/60 hover:text-white'
              }`}>
                <input
                  type="radio"
                  name="freq"
                  checked={currentConfig.frequency === 'always'}
                  onChange={() => updateField('frequency', 'always')}
                  className="text-amber-500 focus:ring-0"
                />
                <div>
                  <span className="font-bold block">Sempre que abrir o site</span>
                  <span className="text-[10px] text-white/50">Ideal para campanhas nos grupos</span>
                </div>
              </label>

              <label className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition ${
                currentConfig.frequency === 'once_per_day'
                  ? 'bg-amber-500/15 border-amber-500/50 text-white'
                  : 'bg-black/40 border-white/10 text-white/60 hover:text-white'
              }`}>
                <input
                  type="radio"
                  name="freq"
                  checked={currentConfig.frequency === 'once_per_day'}
                  onChange={() => updateField('frequency', 'once_per_day')}
                  className="text-amber-500 focus:ring-0"
                />
                <div>
                  <span className="font-bold block">1 vez a cada 24 horas</span>
                  <span className="text-[10px] text-white/50">Por visitante no mesmo navegador</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Amostra ao Vivo do Vídeo (5 colunas) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="p-4 rounded-2xl bg-[#101422] border border-amber-500/30 flex flex-col gap-3 sticky top-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Play className="w-4 h-4" />
                Amostra do Vídeo em Tempo Real
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                currentConfig.videoUrl.trim() && currentConfig.enabled
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-white/10 text-white/40'
              }`}>
                {currentConfig.videoUrl.trim() ? (currentConfig.enabled ? 'Ativo' : 'Oculto') : 'Sem Link'}
              </span>
            </div>

            {/* Container do Player da Amostra */}
            <div className="relative rounded-2xl overflow-hidden bg-black border border-white/15 aspect-[9/14] sm:aspect-video flex items-center justify-center">
              {currentConfig.videoUrl.trim() ? (
                parsedVideo.type === 'mp4' ? (
                  <video
                    src={parsedVideo.embedUrl}
                    controls
                    playsInline
                    className="w-full h-full object-contain bg-black"
                    onLoadedData={() => {
                      setVideoLoaded(true);
                      setPreviewError(false);
                    }}
                    onError={() => {
                      setPreviewError(true);
                      setVideoLoaded(false);
                    }}
                  />
                ) : (
                  <iframe
                    src={parsedVideo.embedUrl}
                    title="Amostra do Vídeo"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )
              ) : (
                <div className="p-6 text-center flex flex-col items-center justify-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
                    <Film className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-white/60 m-0">Nenhum link colocado ainda</p>
                  <p className="text-[11px] text-white/40 m-0 max-w-xs">
                    Cole o link do seu vídeo MP4 ao lado para ver a amostra rodando aqui na hora.
                  </p>
                </div>
              )}

              {/* Status de Erro ou Sucesso */}
              {previewError && currentConfig.videoUrl.trim() && (
                <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-4 text-center">
                  <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
                  <p className="text-xs text-red-300 font-bold mb-1">Amostra não carregou</p>
                  <p className="text-[10px] text-white/60">
                    Verifique se o link é direto .mp4 e possui permissão de leitura pública.
                  </p>
                </div>
              )}
            </div>

            {/* Amostra Visual do Botão de Direcionamento */}
            <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-2">
              <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider">
                Amostra do Botão para o Visitante:
              </span>
              <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg">
                <WhatsAppIcon className="w-4 h-4 fill-white shrink-0" />
                <span className="truncate uppercase">{currentConfig.buttonText || 'Falar no WhatsApp'}</span>
              </div>
              <p className="text-[10.5px] text-white/50 text-center m-0 truncate">
                {currentConfig.companyName ? `Empresa: ${currentConfig.companyName}` : 'Direcionamento direto'}
              </p>
            </div>

            {/* Botão de Testar Visualização Completa */}
            <button
              type="button"
              onClick={onTestPreview}
              disabled={!currentConfig.videoUrl.trim()}
              className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition ${
                currentConfig.videoUrl.trim()
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-white/10 text-white/30 cursor-not-allowed'
              }`}
            >
              <Eye className="w-4 h-4" />
              Abrir Visualização Completa como Visitante
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
