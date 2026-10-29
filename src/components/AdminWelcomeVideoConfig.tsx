import React, { useState, useMemo, useRef } from 'react';
import { 
  Play, 
  Sparkles, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  Search, 
  Store, 
  Film, 
  Image as ImageIcon, 
  Trash2, 
  Upload, 
  Layers,
  Plus,
  ListOrdered,
  ChevronUp,
  ChevronDown,
  RotateCw,
  Clock,
  ArrowRight
} from 'lucide-react';
import { WhatsAppIcon } from './SocialMediaIcons';
import { PortalWelcomeVideoConfig, SponsoredItem, parseVideoSource } from './PortalWelcomeVideoModal';
import { uploadImageWithFallback } from '../lib/imageUpload';


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
  // Ensure items array exists and has at least an initial migration item if legacy fields were used
  const currentConfig: PortalWelcomeVideoConfig = useMemo(() => {
    let resolvedItems: SponsoredItem[] = [];

    if (config?.items && Array.isArray(config.items) && config.items.length > 0) {
      resolvedItems = config.items;
    } else if (config?.videoUrl || config?.flyerUrl) {
      // Legacy single configuration migration into items[0]
      resolvedItems = [{
        id: 'sponsor_1',
        name: config.companyName || config.title || 'Patrocinador 1',
        mediaType: config.mediaType || (config.flyerUrl && !config.videoUrl ? 'flyer' : 'video'),
        videoUrl: config.videoUrl || '',
        flyerUrl: config.flyerUrl || '',
        flyerDeleteUrl: config.flyerDeleteUrl || '',
        title: config.title || 'Destaque Patrocinado',
        badge: config.badge || 'PATROCINADO',
        buttonText: config.buttonText || 'Falar no WhatsApp',
        targetType: config.targetType || 'company',
        companyId: config.companyId || '',
        companyName: config.companyName || '',
        companyCategory: config.companyCategory || '',
        companyLogo: config.companyLogo || '',
        whatsappPhone: config.whatsappPhone || '',
        customLink: config.customLink || '',
        actionType: config.actionType || 'whatsapp',
        whatsappMessage: config.whatsappMessage || 'Olá! Vi seu anúncio no portal Minha Divulgação e gostaria de mais informações.',
        enabled: config.enabled !== false
      }];
    }

    return {
      enabled: config?.enabled !== false,
      frequency: config?.frequency || 'always',
      autoPlayMuted: config?.autoPlayMuted !== false,
      // Default / fallback fields
      mediaType: config?.mediaType || (config?.flyerUrl && !config?.videoUrl ? 'flyer' : 'video'),
      videoUrl: config?.videoUrl || resolvedItems[0]?.videoUrl || '',
      flyerUrl: config?.flyerUrl || resolvedItems[0]?.flyerUrl || '',
      flyerDeleteUrl: config?.flyerDeleteUrl || resolvedItems[0]?.flyerDeleteUrl || '',
      title: config?.title || resolvedItems[0]?.title || 'Destaque Patrocinado',
      badge: config?.badge || resolvedItems[0]?.badge || 'PATROCINADO',
      buttonText: config?.buttonText || resolvedItems[0]?.buttonText || 'Falar no WhatsApp',
      targetType: config?.targetType || resolvedItems[0]?.targetType || 'company',
      companyId: config?.companyId || resolvedItems[0]?.companyId || '',
      companyName: config?.companyName || resolvedItems[0]?.companyName || '',
      companyCategory: config?.companyCategory || resolvedItems[0]?.companyCategory || '',
      companyLogo: config?.companyLogo || resolvedItems[0]?.companyLogo || '',
      whatsappPhone: config?.whatsappPhone || resolvedItems[0]?.whatsappPhone || '',
      customLink: config?.customLink || resolvedItems[0]?.customLink || '',
      actionType: config?.actionType || resolvedItems[0]?.actionType || 'whatsapp',
      whatsappMessage: config?.whatsappMessage || resolvedItems[0]?.whatsappMessage || 'Olá! Vi seu anúncio no portal Minha Divulgação e gostaria de mais informações.',
      items: resolvedItems
    };
  }, [config]);

  const itemsList: SponsoredItem[] = currentConfig.items || [];

  // Selected item state for the editor
  const [selectedItemId, setSelectedItemId] = useState<string>(() => {
    return itemsList[0]?.id || '';
  });

  // Make sure selectedItemId points to a valid item
  const activeItem: SponsoredItem | undefined = useMemo(() => {
    if (!itemsList.length) return undefined;
    const found = itemsList.find(i => i.id === selectedItemId);
    return found || itemsList[0];
  }, [itemsList, selectedItemId]);

  const [companySearch, setCompanySearch] = useState('');
  const [previewError, setPreviewError] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);
  const [isUploadingFlyer, setIsUploadingFlyer] = useState(false);
  const [flyerUploadNotice, setFlyerUploadNotice] = useState('');
  const flyerFileInputRef = useRef<HTMLInputElement>(null);

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

  // Update top-level config fields
  const updateRootField = (field: keyof PortalWelcomeVideoConfig, value: any) => {
    onChange({
      ...currentConfig,
      [field]: value
    });
  };

  // Helper to sync items and top-level fields
  const syncItemsChange = (newItems: SponsoredItem[]) => {
    const firstActive = newItems.find(i => i.enabled !== false) || newItems[0];
    onChange({
      ...currentConfig,
      items: newItems,
      // Mirror first item to root for backwards compatibility
      videoUrl: firstActive?.videoUrl || '',
      flyerUrl: firstActive?.flyerUrl || '',
      flyerDeleteUrl: firstActive?.flyerDeleteUrl || '',
      mediaType: firstActive?.mediaType || 'auto',
      title: firstActive?.title || currentConfig.title,
      badge: firstActive?.badge || currentConfig.badge,
      companyName: firstActive?.companyName || currentConfig.companyName,
      companyCategory: firstActive?.companyCategory || currentConfig.companyCategory,
      companyLogo: firstActive?.companyLogo || currentConfig.companyLogo,
      whatsappPhone: firstActive?.whatsappPhone || currentConfig.whatsappPhone,
      customLink: firstActive?.customLink || currentConfig.customLink,
      actionType: firstActive?.actionType || currentConfig.actionType,
      buttonText: firstActive?.buttonText || currentConfig.buttonText,
      whatsappMessage: firstActive?.whatsappMessage || currentConfig.whatsappMessage
    });
  };

  // Add new sponsored item
  const handleAddNewItem = () => {
    const newId = `sponsor_${Date.now()}`;
    const newItemNumber = itemsList.length + 1;
    const newItem: SponsoredItem = {
      id: newId,
      name: `Patrocinador ${newItemNumber}`,
      mediaType: 'flyer',
      videoUrl: '',
      flyerUrl: '',
      flyerDeleteUrl: '',
      title: 'Destaque Patrocinado',
      badge: 'PATROCINADO',
      buttonText: 'Falar no WhatsApp',
      targetType: 'company',
      actionType: 'whatsapp',
      whatsappMessage: 'Olá! Vi seu anúncio no portal Minha Divulgação e gostaria de mais informações.',
      enabled: true
    };

    const updatedItems = [...itemsList, newItem];
    setSelectedItemId(newId);
    syncItemsChange(updatedItems);
  };

  // Update active sponsored item
  const handleUpdateActiveItem = (updates: Partial<SponsoredItem>) => {
    if (!activeItem) return;
    const updatedItems = itemsList.map(item => {
      if (item.id === activeItem.id) {
        return { ...item, ...updates };
      }
      return item;
    });
    syncItemsChange(updatedItems);
  };

  // Delete sponsored item
  const handleDeleteItem = (idToDelete: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Deseja realmente remover este patrocinador da rotação?")) {
      return;
    }

    const updatedItems = itemsList.filter(item => item.id !== idToDelete);
    if (selectedItemId === idToDelete) {
      setSelectedItemId(updatedItems[0]?.id || '');
    }
    syncItemsChange(updatedItems);
  };

  // Move item up/down in rotation sequence
  const handleMoveItem = (index: number, direction: 'up' | 'down', e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= itemsList.length) return;

    const newItems = [...itemsList];
    const [moved] = newItems.splice(index, 1);
    newItems.splice(targetIndex, 0, moved);
    syncItemsChange(newItems);
  };

  // Toggle item active/paused state
  const handleToggleItemEnabled = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updatedItems = itemsList.map(item => {
      if (item.id === id) {
        return { ...item, enabled: item.enabled === false ? true : false };
      }
      return item;
    });
    syncItemsChange(updatedItems);
  };

  // Select company from database for active item
  const handleSelectCompanyForActiveItem = (comp: any) => {
    const rawPhone = comp.wa || comp.phone || '';
    const cleanDigits = rawPhone.replace(/\D/g, '');
    const companyDefaultMessage = `Olá! Vi seu anúncio no portal Minha Divulgação e gostaria de mais informações.`;

    handleUpdateActiveItem({
      targetType: 'company',
      companyId: comp.id,
      companyName: comp.name,
      companyCategory: comp.category || '',
      companyLogo: comp.logo || '',
      whatsappPhone: cleanDigits || rawPhone,
      actionType: 'whatsapp',
      whatsappMessage: companyDefaultMessage,
      buttonText: 'Falar no WhatsApp',
      name: comp.name
    });
  };

  // Resilient upload of flyer image for active item (ImgBB with Canvas compression fallback)
  const handleFlyerFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeItem) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem (JPG, PNG, WEBP, etc.).');
      return;
    }

    setIsUploadingFlyer(true);
    setFlyerUploadNotice(`Enviando flyer de "${activeItem.name || 'Patrocinador'}"...`);

    try {
      const result = await uploadImageWithFallback(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.82,
        onNotice: (msg) => setFlyerUploadNotice(msg)
      });

      if (result && result.url) {
        handleUpdateActiveItem({
          flyerUrl: result.url,
          flyerDeleteUrl: '',
          mediaType: 'flyer'
        });

        setFlyerUploadNotice('✅ Flyer carregado e salvo com sucesso!');
        setTimeout(() => setFlyerUploadNotice(''), 3500);

        if (onSave) {
          onSave();
        }
      } else {
        throw new Error("Não foi possível processar a imagem do flyer.");
      }
    } catch (err: any) {
      console.error("Flyer upload error:", err);
      alert(err?.message || "Falha ao processar a imagem. Tente novamente ou use outra imagem.");
      setFlyerUploadNotice('');
    } finally {
      setIsUploadingFlyer(false);
      if (flyerFileInputRef.current) {
        flyerFileInputRef.current.value = '';
      }
    }
  };

  // Delete Flyer for active item
  const handleDeleteFlyer = async () => {
    if (!activeItem) return;
    if (!window.confirm(`Deseja realmente remover a imagem do Flyer deste patrocinador?`)) {
      return;
    }

    const deleteUrl = activeItem.flyerDeleteUrl;

    handleUpdateActiveItem({
      flyerUrl: '',
      flyerDeleteUrl: '',
      mediaType: activeItem.videoUrl ? 'video' : 'auto'
    });

    if (onSave) {
      onSave();
    }

    if (deleteUrl) {
      try {
        await fetch(deleteUrl, { method: 'GET', mode: 'no-cors' }).catch(() => {});
      } catch (_) {}
    }

    setSaveSuccessNotice(true);
  };

  const handleSaveClick = () => {
    if (onSave) {
      onSave();
      setSaveSuccessNotice(true);
      setTimeout(() => setSaveSuccessNotice(false), 3000);
    }
  };

  const activeMediaUrl = (activeItem?.flyerUrl || activeItem?.videoUrl || '').trim();
  const parsedVideo = parseVideoSource(activeItem?.videoUrl || '');
  const activeSponsorsCount = itemsList.filter(i => i.enabled !== false && (i.videoUrl?.trim() || i.flyerUrl?.trim())).length;

  return (
    <div className="dev-forms-container text-white">
      {/* Top Banner Exclusivo */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-500/10 border border-amber-500/40 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-2 rounded-xl bg-amber-500/30 text-amber-300 shadow-sm">
              <Sparkles className="w-5 h-5" />
            </span>
            <h3 className="text-base sm:text-lg font-black text-amber-400 m-0 tracking-wide">
              PATROCINADORES ROTATIVOS A CADA F5 / ATUALIZAÇÃO
            </h3>
          </div>
          <p className="text-xs text-white/80 m-0 max-w-2xl leading-relaxed">
            Cadastre <strong>quantos vídeos ou banners de patrocinadores você tiver</strong>! A cada atualização da página (F5) ou clique do visitante, o sistema mostra <strong>1 patrocinador por vez</strong> em ordem justa e alternada.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onTestPreview}
            disabled={activeSponsorsCount === 0}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition ${
              activeSponsorsCount > 0
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30'
                : 'bg-white/10 text-white/40 cursor-not-allowed'
            }`}
            title="Ver como o visitante verá o anúncio na tela"
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
        <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in shadow-md">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Alterações salvas com sucesso no banco de dados!
        </div>
      )}

      {/* Explicação da Rotação Inteligente */}
      <div className="mb-6 p-3.5 rounded-xl bg-gradient-to-r from-blue-900/30 via-indigo-900/20 to-blue-900/10 border border-blue-500/30 flex items-start sm:items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300 shrink-0">
          <RotateCw className="w-4 h-4" />
        </div>
        <div className="text-xs text-white/80 leading-relaxed flex-1">
          <span className="font-bold text-blue-300 block mb-0.5">Como funciona a exibição a cada F5:</span>
          Se você cadastrar 3 anunciantes, no <strong>1º F5</strong> o visitante vê o Patrocinador #1. No <strong>2º F5</strong> ele vê o Patrocinador #2. No <strong>3º F5</strong> ele vê o Patrocinador #3, e depois o ciclo recomeça. <em>Nunca são mostrados todos juntos ao mesmo tempo.</em>
        </div>
        <div className="shrink-0 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 font-extrabold text-xs text-center">
          {activeSponsorsCount} {activeSponsorsCount === 1 ? 'Anúncio Ativo' : 'Anúncios Ativos'}
        </div>
      </div>

      {/* GESTÃO DOS PATROCINADORES CADASTRADOS */}
      <div className="p-4 rounded-2xl bg-[#0f1322] border border-white/10 mb-6 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <ListOrdered className="w-5 h-5 text-amber-400" />
            <h4 className="text-sm font-extrabold uppercase tracking-wider text-white m-0">
              Fila de Patrocinadores Cadastrados ({itemsList.length})
            </h4>
          </div>

          <button
            type="button"
            onClick={handleAddNewItem}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 text-black font-black text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition"
          >
            <Plus className="w-4 h-4" />
            Adicionar Novo Patrocinador (Vídeo ou Banner)
          </button>
        </div>

        {itemsList.length === 0 ? (
          <div className="p-8 rounded-xl bg-black/40 border border-dashed border-white/20 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Layers className="w-6 h-6" />
            </div>
            <h5 className="text-sm font-bold text-white m-0">Nenhum patrocinador cadastrado ainda</h5>
            <p className="text-xs text-white/50 m-0 max-w-md">
              Clique no botão acima para adicionar seu primeiro anunciante pago. Você poderá colocar o Flyer (imagem) ou o link de vídeo dele.
            </p>
            <button
              type="button"
              onClick={handleAddNewItem}
              className="mt-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Cadastrar 1º Patrocinador
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {itemsList.map((item, index) => {
              const isSelected = item.id === (activeItem?.id || '');
              const hasMedia = Boolean(item.flyerUrl?.trim() || item.videoUrl?.trim());
              const isItemActive = item.enabled !== false;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  className={`p-3 rounded-xl border flex flex-col justify-between gap-3 cursor-pointer transition relative group ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/30 shadow-lg'
                      : isItemActive
                        ? 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/[0.08]'
                        : 'bg-black/40 border-white/5 opacity-60 hover:opacity-80'
                  }`}
                >
                  {/* Top card info */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                        isSelected ? 'bg-amber-500 text-black' : 'bg-white/10 text-white/80'
                      }`}>
                        #{index + 1}
                      </span>
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-white truncate m-0">
                          {item.companyName || item.name || `Patrocinador ${index + 1}`}
                        </h5>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-amber-300 font-semibold truncate">
                            {item.mediaType === 'video' ? 'Vídeo' : item.mediaType === 'flyer' ? 'Flyer' : 'Flyer/Vídeo'}
                          </span>
                          {!hasMedia && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                              Sem mídia
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Active toggle */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleItemEnabled(item.id, e)}
                      title={isItemActive ? 'Pausar este patrocinador' : 'Ativar este patrocinador'}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition shrink-0 ${
                        isItemActive
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                          : 'bg-gray-500/20 text-gray-400 border-gray-500/40 hover:bg-gray-500/30'
                      }`}
                    >
                      {isItemActive ? 'Ativo' : 'Pausado'}
                    </button>
                  </div>

                  {/* Thumbnail Preview miniature */}
                  <div className="h-20 w-full rounded-lg bg-black/50 border border-white/10 overflow-hidden flex items-center justify-center relative">
                    {item.flyerUrl ? (
                      <img src={item.flyerUrl} alt="" className="h-full w-full object-cover" />
                    ) : item.videoUrl ? (
                      <div className="flex flex-col items-center justify-center gap-1 text-amber-400">
                        <Film className="w-5 h-5" />
                        <span className="text-[9px] text-white/60">Vídeo</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-1 text-white/30">
                        <ImageIcon className="w-5 h-5" />
                        <span className="text-[9px]">Sem imagem</span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Card Controls: Move Up, Move Down, Delete */}
                  <div className="flex items-center justify-between pt-1 border-t border-white/10 text-xs">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => handleMoveItem(index, 'up', e)}
                        disabled={index === 0}
                        title="Mover para cima na ordem do F5"
                        className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleMoveItem(index, 'down', e)}
                        disabled={index === itemsList.length - 1}
                        title="Mover para baixo na ordem do F5"
                        className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteItem(item.id, e)}
                      title="Excluir patrocinador"
                      className="p-1 rounded hover:bg-red-500/20 text-red-400 hover:text-red-300 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Grid: Formulário do Patrocinador Selecionado à esquerda | Amostra ao vivo à direita */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Coluna Esquerda: Formulário de Edição do Patrocinador (7 colunas) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* 1. Ativação Geral e Frequência do Pop-up */}
          <div className="p-4 rounded-xl bg-[#121624] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-white mb-0.5">Exibir Destaque Patrocinado no Portal</h4>
              <p className="text-[11px] text-white/50 m-0">
                Ativa ou pausa a janela pop-up na entrada do portal.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={currentConfig.enabled}
                onChange={(e) => updateRootField('enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {/* Frequência: Sempre a cada F5 */}
          <div className="p-4 rounded-xl bg-[#121624] border border-white/10 flex flex-col gap-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white/80 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              Frequência de Exibição da Janela
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
                  onChange={() => updateRootField('frequency', 'always')}
                  className="text-amber-500 focus:ring-0"
                />
                <div>
                  <span className="font-bold block">Sempre (Todo F5 / Recarregamento)</span>
                  <span className="text-[10px] text-white/50">Abre em todo acesso, clique no link ou F5</span>
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
                  onChange={() => updateRootField('frequency', 'once_per_day')}
                  className="text-amber-500 focus:ring-0"
                />
                <div>
                  <span className="font-bold block">1 vez a cada 24 horas</span>
                  <span className="text-[10px] text-white/50">Por visitante no mesmo navegador</span>
                </div>
              </label>
            </div>
          </div>

          {/* SE HOUVER PATROCINADOR SELECIONADO: FORMULÁRIO DELE */}
          {activeItem ? (
            <div className="p-5 rounded-2xl bg-[#121624] border border-amber-500/30 flex flex-col gap-5 shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-500 text-black flex items-center justify-center text-xs font-black">
                    #{itemsList.findIndex(i => i.id === activeItem.id) + 1}
                  </span>
                  <h4 className="text-sm font-black text-amber-400 m-0 uppercase tracking-wide">
                    Editando: {activeItem.companyName || activeItem.name || 'Patrocinador'}
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-[11px] text-white/70 flex items-center gap-1.5 cursor-pointer">
                    <span>Ativo na Rotação</span>
                    <input
                      type="checkbox"
                      checked={activeItem.enabled !== false}
                      onChange={(e) => handleUpdateActiveItem({ enabled: e.target.checked })}
                      className="rounded text-amber-500 focus:ring-0"
                    />
                  </label>
                </div>
              </div>

              {/* Vincular a uma Empresa do Portal */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Store className="w-4 h-4" />
                  Vincular Empresa Cadastrada (Opcional)
                </label>
                <p className="text-[11px] text-white/50 m-0">
                  Preenche automaticamente nome, WhatsApp e logomarca cadastrados no portal:
                </p>

                <div className="relative">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/40 border border-white/15 focus-within:border-amber-400">
                    <Search className="w-4 h-4 text-white/40" />
                    <input
                      type="text"
                      value={companySearch}
                      onChange={(e) => setCompanySearch(e.target.value)}
                      placeholder="Pesquisar empresa cadastrada pelo nome..."
                      className="bg-transparent border-none text-xs text-white placeholder-white/40 focus:outline-none w-full"
                    />
                  </div>

                  {companySearch.trim() && (
                    <div className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-xl bg-[#1a2035] border border-white/20 shadow-2xl z-30 divide-y divide-white/5">
                      {filteredCompanies.slice(0, 10).map((comp) => (
                        <button
                          key={comp.id}
                          type="button"
                          onClick={() => {
                            handleSelectCompanyForActiveItem(comp);
                            setCompanySearch('');
                          }}
                          className="w-full p-2.5 flex items-center justify-between gap-3 text-xs hover:bg-amber-500/20 text-left transition cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {comp.logo ? (
                              <img src={comp.logo} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-amber-400 shrink-0">
                                {comp.name.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <span className="font-bold text-white block truncate">{comp.name}</span>
                              {comp.category && (
                                <span className="text-[10px] text-white/50 block truncate">{comp.category}</span>
                              )}
                            </div>
                          </div>
                          <span className="text-[10px] text-amber-400 font-bold shrink-0">Selecionar</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Nome e Título do Patrocinador */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-white/80 block mb-1">
                    Nome da Empresa / Anunciante
                  </label>
                  <input
                    type="text"
                    value={activeItem.companyName || activeItem.name || ''}
                    onChange={(e) => handleUpdateActiveItem({ companyName: e.target.value, name: e.target.value })}
                    placeholder="Ex: Pizzaria Forno Nobre"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-white/80 block mb-1">
                    Selo / Badge de Destaque
                  </label>
                  <input
                    type="text"
                    value={activeItem.badge || 'PATROCINADO'}
                    onChange={(e) => handleUpdateActiveItem({ badge: e.target.value })}
                    placeholder="Ex: PATROCINADO, PARCEIRO VIP, OFERTA"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Formato da Mídia (Flyer vs Vídeo vs Ambos) */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  Formato da Mídia do Patrocinador
                </label>

                <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-black/40 border border-white/10">
                  <button
                    type="button"
                    onClick={() => handleUpdateActiveItem({ mediaType: 'flyer' })}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeItem.mediaType === 'flyer'
                        ? 'bg-amber-500 text-black shadow'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Flyer (Imagem)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateActiveItem({ mediaType: 'video' })}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeItem.mediaType === 'video'
                        ? 'bg-amber-500 text-black shadow'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>Vídeo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateActiveItem({ mediaType: 'auto' })}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeItem.mediaType === 'auto'
                        ? 'bg-amber-500 text-black shadow'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Ambos (Abas)</span>
                  </button>
                </div>
              </div>

              {/* SEÇÃO DO FLYER / IMAGEM */}
              {(activeItem.mediaType === 'flyer' || activeItem.mediaType === 'auto' || !activeItem.videoUrl) && (
                <div className="p-4 rounded-xl bg-black/40 border border-amber-500/20 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4" />
                      Flyer / Banner em Imagem (Upload Direto / Celular)
                    </label>
                    <span className="text-[10px] text-white/50">JPG, PNG ou WEBP</span>
                  </div>

                  <input
                    type="file"
                    ref={flyerFileInputRef}
                    accept="image/*"
                    onChange={handleFlyerFileChange}
                    className="hidden"
                  />

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <button
                      type="button"
                      onClick={() => flyerFileInputRef.current?.click()}
                      disabled={isUploadingFlyer}
                      className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 text-black text-xs font-black flex items-center justify-center gap-2 shadow-md cursor-pointer transition disabled:opacity-50"
                    >
                      <Upload className="w-4 h-4" />
                      {isUploadingFlyer ? 'Processando e Enviando...' : '📷 Enviar Imagem do Flyer'}
                    </button>

                    {activeItem.flyerUrl && (
                      <button
                        type="button"
                        onClick={handleDeleteFlyer}
                        className="py-2.5 px-3.5 rounded-xl bg-red-600/20 hover:bg-red-600 border border-red-500/40 text-red-300 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                        title="Excluir flyer do patrocinador"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remover Imagem
                      </button>
                    )}
                  </div>

                  {flyerUploadNotice && (
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                      {flyerUploadNotice}
                    </div>
                  )}

                  {/* Campo de URL direta ou colada */}
                  <div>
                    <label className="text-[10px] text-white/60 block mb-1">
                      Ou cole o link direto da imagem:
                    </label>
                    <input
                      type="text"
                      value={activeItem.flyerUrl || ''}
                      onChange={(e) => handleUpdateActiveItem({ flyerUrl: e.target.value })}
                      placeholder="https://i.ibb.co/..."
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              )}

              {/* SEÇÃO DO VÍDEO PATROCINADO */}
              {(activeItem.mediaType === 'video' || activeItem.mediaType === 'auto') && (
                <div className="p-4 rounded-xl bg-black/40 border border-amber-500/20 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Film className="w-4 h-4" />
                      Link do Vídeo Patrocinado
                    </label>
                    <span className="text-[10px] text-white/50">MP4, YouTube ou Vimeo</span>
                  </div>

                  <input
                    type="text"
                    value={activeItem.videoUrl || ''}
                    onChange={(e) => handleUpdateActiveItem({ videoUrl: e.target.value })}
                    placeholder="https://seusite.com/video.mp4 ou https://youtu.be/..."
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              )}

              {/* DESTINO DO BOTÃO DE CONTATO / WHATSAPP */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-3">
                <label className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <WhatsAppIcon className="w-4 h-4 fill-emerald-400" />
                  Botão de Ação para o Visitante
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateActiveItem({ actionType: 'whatsapp' })}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                      activeItem.actionType !== 'link'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'bg-white/5 text-white/60 hover:text-white'
                    }`}
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
                    <span>WhatsApp Direto</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateActiveItem({ actionType: 'link' })}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                      activeItem.actionType === 'link'
                        ? 'bg-blue-600 text-white shadow'
                        : 'bg-white/5 text-white/60 hover:text-white'
                    }`}
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>Link Personalizado</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                  <div>
                    <label className="text-[11px] font-bold text-white/70 block mb-1">
                      Texto do Botão
                    </label>
                    <input
                      type="text"
                      value={activeItem.buttonText || 'Falar no WhatsApp'}
                      onChange={(e) => handleUpdateActiveItem({ buttonText: e.target.value })}
                      placeholder="Ex: Falar no WhatsApp, Pedir Agora"
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  {activeItem.actionType === 'link' ? (
                    <div>
                      <label className="text-[11px] font-bold text-white/70 block mb-1">
                        URL de Destino
                      </label>
                      <input
                        type="text"
                        value={activeItem.customLink || ''}
                        onChange={(e) => handleUpdateActiveItem({ customLink: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-400"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="text-[11px] font-bold text-white/70 block mb-1">
                        WhatsApp do Anunciante
                      </label>
                      <input
                        type="text"
                        value={activeItem.whatsappPhone || ''}
                        onChange={(e) => handleUpdateActiveItem({ whatsappPhone: e.target.value })}
                        placeholder="Ex: 85999998888"
                        className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                  )}
                </div>

                {activeItem.actionType !== 'link' && (
                  <div>
                    <label className="text-[11px] font-bold text-white/70 block mb-1">
                      Mensagem Automática do WhatsApp
                    </label>
                    <textarea
                      rows={2}
                      value={activeItem.whatsappMessage || ''}
                      onChange={(e) => handleUpdateActiveItem({ whatsappMessage: e.target.value })}
                      placeholder="Mensagem que o visitante enviará ao clicar..."
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-400 resize-none"
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-[#121624] border border-white/10 text-center text-white/50 text-xs">
              Selecione ou adicione um patrocinador acima para editar suas informações.
            </div>
          )}
        </div>

        {/* Coluna Direita: Amostra ao Vivo da Mídia Selecionada (5 colunas) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="p-4 rounded-2xl bg-[#101422] border border-amber-500/30 flex flex-col gap-3 sticky top-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Play className="w-4 h-4" />
                Amostra em Tempo Real
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                activeMediaUrl && currentConfig.enabled
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-white/10 text-white/40'
              }`}>
                {activeMediaUrl ? (currentConfig.enabled ? 'Ativo no F5' : 'Oculto') : 'Sem Mídia'}
              </span>
            </div>

            {/* Container da Amostra (Flyer ou Vídeo) */}
            <div className="relative rounded-2xl overflow-hidden bg-black border border-white/15 min-h-[260px] flex items-center justify-center p-2">
              {activeItem?.mediaType === 'flyer' || (!activeItem?.videoUrl && activeItem?.flyerUrl) ? (
                /* Amostra do Flyer */
                activeItem?.flyerUrl ? (
                  <div className="relative w-full flex flex-col items-center">
                    <img
                      src={activeItem.flyerUrl}
                      alt="Amostra do Flyer"
                      className="max-h-[350px] w-auto max-w-full object-contain rounded-xl shadow-lg"
                    />
                    <span className="mt-2 text-[10px] font-mono text-emerald-400">
                      ✅ Amostra do Flyer ({activeItem.name || 'Patrocinador'})
                    </span>
                  </div>
                ) : (
                  <div className="p-6 text-center flex flex-col items-center justify-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-white/60 m-0">Nenhum flyer carregado neste anúncio</p>
                    <p className="text-[11px] text-white/40 m-0 max-w-xs">
                      Envie a imagem pelo ImgBB ao lado para que o banner apareça todo na tela ao acessar o portal.
                    </p>
                  </div>
                )
              ) : activeItem?.videoUrl?.trim() ? (
                /* Amostra do Vídeo */
                parsedVideo.type === 'mp4' ? (
                  <video
                    src={parsedVideo.embedUrl}
                    controls
                    playsInline
                    className="w-full h-full object-contain bg-black max-h-[350px]"
                    onError={() => setPreviewError(true)}
                  />
                ) : (
                  <iframe
                    src={parsedVideo.embedUrl}
                    title="Amostra do Vídeo"
                    className="w-full aspect-video border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )
              ) : (
                <div className="p-6 text-center flex flex-col items-center justify-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
                    <Film className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-white/60 m-0">Nenhum vídeo colocado ainda</p>
                  <p className="text-[11px] text-white/40 m-0 max-w-xs">
                    Cole o link do vídeo MP4 ou envie um Flyer ao lado para ver a amostra rodando.
                  </p>
                </div>
              )}

              {/* Status de Erro do Vídeo */}
              {previewError && activeItem?.videoUrl?.trim() && activeItem?.mediaType !== 'flyer' && (
                <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-4 text-center">
                  <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
                  <p className="text-xs text-red-300 font-bold mb-1">Amostra do vídeo não carregou</p>
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
                <span className="truncate uppercase">{activeItem?.buttonText || 'Falar no WhatsApp'}</span>
              </div>
              <p className="text-[10.5px] text-white/50 text-center m-0 truncate">
                {activeItem?.companyName ? `Empresa: ${activeItem.companyName}` : 'Direcionamento direto'}
              </p>
            </div>

            {/* Botão de Testar Visualização Completa */}
            <button
              type="button"
              onClick={onTestPreview}
              disabled={activeSponsorsCount === 0}
              className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition ${
                activeSponsorsCount > 0
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-white/10 text-white/30 cursor-not-allowed'
              }`}
            >
              <Eye className="w-4 h-4" />
              Abrir Janela Completa de Teste (Simular Visitante)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
