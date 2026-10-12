import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  X, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  ExternalLink, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Store,
  Image as ImageIcon,
  Film
} from 'lucide-react';
import { WhatsAppIcon } from './SocialMediaIcons';

export interface SponsoredItem {
  id: string;
  name?: string;
  mediaType: 'video' | 'flyer' | 'auto';
  videoUrl?: string;
  flyerUrl?: string;
  flyerDeleteUrl?: string;
  title?: string;
  badge?: string;
  buttonText?: string;
  targetType?: 'company' | 'manual';
  companyId?: string | number;
  companyName?: string;
  companyCategory?: string;
  companyLogo?: string;
  whatsappPhone?: string;
  customLink?: string;
  actionType?: 'whatsapp' | 'link';
  whatsappMessage?: string;
  enabled?: boolean;
}

export interface PortalWelcomeVideoConfig {
  enabled: boolean;
  mediaType?: 'video' | 'flyer' | 'auto';
  videoUrl: string;
  flyerUrl?: string;
  flyerDeleteUrl?: string;
  title?: string;
  badge?: string;
  buttonText?: string;
  targetType?: 'company' | 'manual';
  companyId?: string | number;
  companyName?: string;
  companyCategory?: string;
  companyLogo?: string;
  whatsappPhone?: string;
  customLink?: string;
  actionType?: 'whatsapp' | 'link';
  whatsappMessage?: string;
  frequency?: 'always' | 'once_per_day';
  autoPlayMuted?: boolean;
  // Lista de múltiplos patrocinadores cadastrados para revezamento a cada F5/atualização
  items?: SponsoredItem[];
}

interface PortalWelcomeVideoModalProps {
  config?: PortalWelcomeVideoConfig | null;
  isOpen: boolean;
  onClose: () => void;
  isPreviewMode?: boolean;
  companies?: any[];
  onSelectCompany?: (company: any) => void;
}

// Convert common video URLs to embeddable or direct playable formats
export const parseVideoSource = (url: string): { type: 'mp4' | 'youtube' | 'vimeo' | 'iframe'; embedUrl: string } => {
  if (!url) return { type: 'mp4', embedUrl: '' };
  const trimmed = url.trim();

  // YouTube detection
  const ytMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1`
    };
  }

  // Vimeo detection
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&muted=1`
    };
  }

  // Default is treated as direct video stream (MP4, WebM, etc.)
  return {
    type: 'mp4',
    embedUrl: trimmed
  };
};

export const PortalWelcomeVideoModal: React.FC<PortalWelcomeVideoModalProps> = ({
  config,
  isOpen,
  onClose,
  isPreviewMode = false,
  companies = [],
  onSelectCompany
}) => {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showControlsHint, setShowControlsHint] = useState(false);
  const [activeTabMedia, setActiveTabMedia] = useState<'video' | 'flyer'>('video');
  const videoRef = useRef<HTMLVideoElement>(null);

  // Determinar todos os patrocinadores disponíveis para revezamento (rotativo)
  const allActiveSponsors = useMemo(() => {
    const list: SponsoredItem[] = [];

    // Se houver lista de patrocinadores cadastrados no items
    if (config?.items && Array.isArray(config.items) && config.items.length > 0) {
      config.items.forEach(it => {
        if (it && it.enabled !== false && (it.videoUrl?.trim() || it.flyerUrl?.trim())) {
          list.push(it);
        }
      });
    }

    // Se a lista estiver vazia ou se houver a mídia principal individual configurada
    if (list.length === 0 && config && (config.videoUrl?.trim() || config.flyerUrl?.trim())) {
      list.push({
        id: 'principal',
        name: config.companyName || config.title || 'Patrocinador',
        mediaType: config.mediaType || 'auto',
        videoUrl: config.videoUrl,
        flyerUrl: config.flyerUrl,
        flyerDeleteUrl: config.flyerDeleteUrl,
        title: config.title,
        badge: config.badge,
        buttonText: config.buttonText,
        targetType: config.targetType,
        companyId: config.companyId,
        companyName: config.companyName,
        companyCategory: config.companyCategory,
        companyLogo: config.companyLogo,
        whatsappPhone: config.whatsappPhone,
        customLink: config.customLink,
        actionType: config.actionType,
        whatsappMessage: config.whatsappMessage,
        enabled: config.enabled
      });
    }

    return list;
  }, [config]);

  // Índice do patrocinador atual (rotativo a cada visualização/F5)
  const [currentSponsorIndex, setCurrentSponsorIndex] = useState<number>(0);

  // Ao abrir o modal, avança para o próximo patrocinador de forma ordenada e justa
  useEffect(() => {
    if (isOpen && allActiveSponsors.length > 0) {
      try {
        const storedIdxStr = localStorage.getItem('last_seen_sponsor_idx');
        let nextIdx = 0;
        if (storedIdxStr !== null) {
          const parsedIdx = parseInt(storedIdxStr, 10);
          if (!isNaN(parsedIdx)) {
            nextIdx = (parsedIdx + 1) % allActiveSponsors.length;
          }
        }
        localStorage.setItem('last_seen_sponsor_idx', String(nextIdx));
        setCurrentSponsorIndex(nextIdx);
      } catch (e) {
        setCurrentSponsorIndex(prev => (prev + 1) % allActiveSponsors.length);
      }
    }
  }, [isOpen, allActiveSponsors.length]);

  // Patrocinador atualmente em exibição
  const activeSponsor: SponsoredItem | null = allActiveSponsors[currentSponsorIndex] || allActiveSponsors[0] || null;

  const videoUrl = (activeSponsor?.videoUrl || config?.videoUrl || '').trim();
  const flyerUrl = (activeSponsor?.flyerUrl || config?.flyerUrl || '').trim();
  const hasVideo = Boolean(videoUrl);
  const hasFlyer = Boolean(flyerUrl);
  const mediaType = activeSponsor?.mediaType || config?.mediaType || 'auto';

  // Set initial active media tab based on current sponsor config
  useEffect(() => {
    if (mediaType === 'flyer' && hasFlyer) {
      setActiveTabMedia('flyer');
    } else if (mediaType === 'video' && hasVideo) {
      setActiveTabMedia('video');
    } else if (!hasVideo && hasFlyer) {
      setActiveTabMedia('flyer');
    } else {
      setActiveTabMedia('video');
    }
  }, [mediaType, hasVideo, hasFlyer, isOpen, currentSponsorIndex]);

  // Reset states when opening
  useEffect(() => {
    if (isOpen) {
      setIsMuted(true);
      setIsPlaying(true);
      setHasError(false);
      setIsLoading(true);
      setCurrentTime(0);

      // Try playing when opened if video is active
      const timer = setTimeout(() => {
        if (videoRef.current && activeTabMedia === 'video') {
          videoRef.current.currentTime = 0;
          videoRef.current.play().catch(() => {});
        }
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [isOpen, videoUrl, activeTabMedia]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  if (!hasVideo && !hasFlyer && !isPreviewMode) return null;

  const parsed = parseVideoSource(videoUrl);

  const toggleMute = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (videoRef.current) {
      const nextMuted = !videoRef.current.muted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    } else {
      setIsMuted(prev => !prev);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
      setShowControlsHint(true);
      setTimeout(() => setShowControlsHint(false), 1500);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  // Localizar no banco de empresas do portal os dados cadastrados desta empresa (ex: Josepf Clean)
  const resolvedCompany = useMemo(() => {
    if (!companies || !Array.isArray(companies) || companies.length === 0 || !activeSponsor) {
      return null;
    }
    const targetId = activeSponsor.companyId ? String(activeSponsor.companyId).trim().toLowerCase() : '';
    const targetName = (activeSponsor.companyName || activeSponsor.name || activeSponsor.title || '').trim().toLowerCase();

    return companies.find((c: any) => {
      if (!c) return false;
      const cId = String(c.id ?? '').trim().toLowerCase();
      const cName = String(c.name ?? '').trim().toLowerCase();
      if (targetId && (cId === targetId || cName === targetId)) return true;
      if (targetName && (cName === targetName || cName.includes(targetName) || targetName.includes(cName))) {
        return true;
      }
      return false;
    }) || null;
  }, [companies, activeSponsor]);

  // Se houver mais de um anunciante ou o anunciante atual for específico (ex: Josepf Clean),
  // NUNCA vazar o contato geral da Bossa Infor / config raiz
  const isMultiSponsorOrSpecific = allActiveSponsors.length > 1 || Boolean(
    activeSponsor?.companyId || 
    (activeSponsor?.name && activeSponsor.id !== 'principal' && activeSponsor.name !== config?.companyName) ||
    resolvedCompany
  );

  const companyTitle = (
    activeSponsor?.companyName?.trim() ||
    resolvedCompany?.name ||
    activeSponsor?.name?.trim() ||
    activeSponsor?.title?.trim() ||
    (!isMultiSponsorOrSpecific ? (config?.companyName?.trim() || config?.title?.trim()) : '') ||
    'Destaque Patrocinado'
  );

  const companyCategory = (
    activeSponsor?.companyCategory ||
    resolvedCompany?.category ||
    (!isMultiSponsorOrSpecific ? config?.companyCategory : '') ||
    ''
  );

  const companyLogo = (
    activeSponsor?.companyLogo ||
    resolvedCompany?.logo ||
    (!isMultiSponsorOrSpecific ? config?.companyLogo : '') ||
    ''
  );

  // Telefone WhatsApp: Prioriza o contato da própria empresa anunciante.
  // Se for patrocinador da lista, NUNCA usa config.whatsappPhone (Bossa Infor)
  const sponsorPhoneRaw = (
    activeSponsor?.whatsappPhone?.trim() ||
    (resolvedCompany ? (resolvedCompany.wa || resolvedCompany.whatsapp || resolvedCompany.phone || '') : '') ||
    (!isMultiSponsorOrSpecific ? (config?.whatsappPhone?.trim() || '') : '') ||
    ''
  );

  const digits = sponsorPhoneRaw.replace(/\D/g, '');
  const cleanPhone = digits.length === 10 || digits.length === 11 ? `55${digits}` : digits;

  // Formatador visual de telefone
  const formatPhoneForDisplay = (raw: string) => {
    const d = raw.replace(/\D/g, '');
    const local = d.startsWith('55') && d.length > 10 ? d.slice(2) : d;
    if (local.length === 11) {
      return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`;
    }
    if (local.length === 10) {
      return `(${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`;
    }
    return local;
  };

  const displayPhone = cleanPhone && cleanPhone.length >= 8 ? formatPhoneForDisplay(cleanPhone) : '';

  // Mensagem do WhatsApp direcionada para a empresa específica
  const itemMessage = (
    activeSponsor?.whatsappMessage?.trim() ||
    (resolvedCompany
      ? `Olá! Vi o anúncio da empresa *${resolvedCompany.name}* no portal Minha Divulgação e gostaria de mais informações.`
      : `Olá! Vi o anúncio de *${companyTitle}* no portal Minha Divulgação e gostaria de mais informações.`)
  );

  // Build redirection link for the active sponsor
  const buildActionUrl = () => {
    const itemActionType = activeSponsor?.actionType || (!isMultiSponsorOrSpecific ? config?.actionType : 'whatsapp');
    const itemCustomLink = activeSponsor?.customLink || (!isMultiSponsorOrSpecific ? config?.customLink : '');

    if (itemActionType === 'link' && itemCustomLink) {
      return itemCustomLink;
    }

    if (cleanPhone && cleanPhone.length >= 8) {
      return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(itemMessage)}`;
    }

    if (itemCustomLink) {
      return itemCustomLink;
    }

    return '#';
  };

  const actionUrl = buildActionUrl();
  const sponsorActionType = activeSponsor?.actionType || (!isMultiSponsorOrSpecific ? config?.actionType : 'whatsapp');
  const isWhatsApp = sponsorActionType !== 'link' && (Boolean(cleanPhone && cleanPhone.length >= 8) || !activeSponsor?.customLink);

  const buttonLabel = activeSponsor?.buttonText?.trim() || 
    (resolvedCompany ? `Falar com ${resolvedCompany.name.split(' ')[0]}` : null) || 
    (!isMultiSponsorOrSpecific ? config?.buttonText?.trim() : null) || 
    (isWhatsApp ? 'Falar no WhatsApp' : 'Acessar Link');

  const badgeLabel = activeSponsor?.badge?.trim() || (!isMultiSponsorOrSpecific ? config?.badge?.trim() : null) || 'PATROCINADO';

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (actionUrl && actionUrl !== '#') {
      window.open(actionUrl, '_blank', 'noopener,noreferrer');
    } else if (resolvedCompany && onSelectCompany) {
      onClose();
      onSelectCompany(resolvedCompany);
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div 
      className="fixed inset-0 z-[99999] bg-black/92 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-[#0c101c] border border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col my-auto max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: '0 0 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(245, 158, 11, 0.2)'
        }}
      >
        {/* Top Header Bar */}
        <div className="px-4 py-3 bg-gradient-to-r from-black/95 via-[#101524]/95 to-black/95 border-b border-white/10 flex items-center justify-between gap-3 shrink-0 z-20">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 font-extrabold text-[11px] uppercase tracking-wider shrink-0">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              {badgeLabel}
            </span>
            <div className="truncate">
              <h4 className="text-white font-bold text-xs sm:text-sm truncate leading-tight flex items-center gap-1.5">
                {companyTitle}
                {companyCategory && (
                  <span className="text-[10px] text-white/50 font-normal hidden sm:inline">
                    • {companyCategory}
                  </span>
                )}
              </h4>
              <p className="text-[10px] text-white/50 truncate">
                {allActiveSponsors.length > 1 ? (
                  <span className="text-amber-300 font-medium">
                    Patrocinador {currentSponsorIndex + 1} de {allActiveSponsors.length} (Revezamento a cada acesso/F5)
                  </span>
                ) : (
                  isPreviewMode ? 'Modo de Teste do Administrador' : 'Exibição em Destaque no Portal'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isPreviewMode && allActiveSponsors.length > 1 && (
              <button
                type="button"
                onClick={() => setCurrentSponsorIndex(prev => (prev + 1) % allActiveSponsors.length)}
                className="px-2.5 py-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                title="Avançar para o próximo anunciante da fila"
              >
                <span>Próximo Anúncio ➔</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold shrink-0 cursor-pointer"
              title="Fechar e ir para o portal"
            >
              <span className="hidden sm:inline text-[11px]">Ir para o Portal</span>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Media Switcher Tabs if BOTH video and flyer are available */}
        {hasVideo && hasFlyer && (
          <div className="flex items-center justify-center gap-2 px-3 py-2 bg-[#090c16] border-b border-white/10 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTabMedia('video')}
              className={`px-3.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition ${
                activeTabMedia === 'video'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Vídeo Patrocinado</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTabMedia('flyer')}
              className={`px-3.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition ${
                activeTabMedia === 'flyer'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Flyer / Banner</span>
            </button>
          </div>
        )}

        {/* MEDIA DISPLAY CONTAINER */}
        {activeTabMedia === 'flyer' && hasFlyer ? (
          /* FLYER / BANNER IMAGE DISPLAY */
          <div 
            className="relative bg-black flex items-center justify-center overflow-hidden group p-2 cursor-pointer"
            style={{ minHeight: '340px', maxHeight: '62vh' }}
            onClick={handleActionClick}
            title="Clique para falar no WhatsApp ou abrir anúncio"
          >
            <img 
              src={flyerUrl} 
              alt={companyTitle}
              className="w-full h-auto max-h-[60vh] object-contain mx-auto rounded-xl shadow-2xl transition duration-200 group-hover:scale-[1.01]"
              loading="eager"
            />

            {/* Click to Open Hint Badge */}
            <div className="absolute bottom-4 right-4 z-20 pointer-events-none">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/80 text-amber-300 border border-amber-500/40 text-[11px] font-bold shadow-lg backdrop-blur-md">
                <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
                <span>Toque na imagem para contato direto</span>
              </span>
            </div>
          </div>
        ) : hasVideo ? (
          /* VIDEO PLAYER AREA */
          <div 
            className="relative bg-black flex items-center justify-center overflow-hidden cursor-pointer group"
            style={{ minHeight: '320px', maxHeight: '58vh' }}
            onClick={togglePlay}
          >
            {parsed.type === 'mp4' ? (
              <>
                <video
                  ref={videoRef}
                  src={parsed.embedUrl}
                  playsInline
                  autoPlay
                  muted={isMuted}
                  loop
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedData={() => setIsLoading(false)}
                  onError={() => {
                    setIsLoading(false);
                    setHasError(true);
                  }}
                  className="w-full h-auto max-h-[58vh] object-contain bg-black"
                />

                {/* Loading Spinner */}
                {isLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 gap-2">
                    <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-white/70 text-xs font-medium">Carregando vídeo...</span>
                  </div>
                )}

                {/* Error display */}
                {hasError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 p-4 text-center">
                    <p className="text-red-400 font-bold text-sm mb-1">Não foi possível carregar o vídeo</p>
                    <p className="text-white/60 text-xs max-w-xs mb-3">Verifique se o link direto MP4 está correto e acessível publicamente.</p>
                    <a 
                      href={videoUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-xs text-amber-400 underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Abrir link em nova aba
                    </a>
                  </div>
                )}

                {/* Tap to Play / Pause Hint Indicator */}
                {showControlsHint && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="p-3.5 rounded-full bg-black/60 border border-white/20 text-white backdrop-blur-sm animate-scale-in">
                      {isPlaying ? <Play className="w-7 h-7 text-white" /> : <Pause className="w-7 h-7 text-white" />}
                    </div>
                  </div>
                )}

                {/* Sound / Unmute Overlay Button */}
                <button
                  type="button"
                  onClick={toggleMute}
                  className="absolute top-3 left-3 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 hover:bg-black/90 border border-white/20 text-white text-xs font-semibold shadow-lg backdrop-blur-md transition cursor-pointer"
                >
                  {isMuted ? (
                    <>
                      <VolumeX className="w-4 h-4 text-amber-400" />
                      <span className="text-[11px] font-bold text-amber-300">Ativar Som 🔊</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-[11px] font-bold text-emerald-300">Som Ligado</span>
                    </>
                  )}
                </button>

                {/* Video Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-100" 
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </>
            ) : (
              <div className="w-full aspect-video max-h-[58vh]">
                <iframe
                  src={parsed.embedUrl}
                  title="Vídeo de Apresentação"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center bg-black/60 text-white/60">
            Nenhuma mídia configurada para exibição.
          </div>
        )}

        {/* Call to Action Direct Redirection Area */}
        <div className="p-4 sm:p-5 bg-gradient-to-b from-[#0c101c] via-[#101524] to-[#090d16] border-t border-white/10 flex flex-col gap-3 shrink-0">
          {/* Target Company Info Card (if pulled from platform or manually named) */}
          {companyTitle && (
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
              {companyLogo ? (
                <img 
                  src={companyLogo} 
                  alt={companyTitle} 
                  className="w-10 h-10 rounded-full object-cover border border-white/20 bg-black shrink-0" 
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-sm shrink-0">
                  <Store className="w-5 h-5" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-white/50 uppercase font-bold tracking-wider">
                  {allActiveSponsors.length > 1 ? `Patrocinador #${currentSponsorIndex + 1}` : 'Anunciante Oficial'}
                </p>
                <h5 className="text-white font-bold text-xs sm:text-sm truncate">{companyTitle}</h5>
                {displayPhone ? (
                  <p className="text-[10px] text-emerald-400 font-mono truncate">
                    WhatsApp: {displayPhone}
                  </p>
                ) : companyCategory ? (
                  <p className="text-[10px] text-amber-300 font-medium truncate">
                    Segmento: {companyCategory}
                  </p>
                ) : null}
              </div>
            </div>
          )}

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={handleActionClick}
            className={`w-full py-3.5 px-5 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
              isWhatsApp 
                ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white shadow-emerald-500/30' 
                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black shadow-amber-500/30'
            }`}
          >
            {isWhatsApp ? (
              <WhatsAppIcon className="w-5 h-5 fill-current shrink-0" />
            ) : (
              <ExternalLink className="w-5 h-5 shrink-0" />
            )}
            <span className="truncate uppercase tracking-wide">{buttonLabel}</span>
            <ArrowRight className="w-4 h-4 ml-1 shrink-0" />
          </button>

          {/* Message Preview and Skip Option */}
          <div className="flex items-center justify-between text-[11px] text-white/50 px-1 pt-1">
            <span className="truncate max-w-[70%] text-[10.5px]">
              {isWhatsApp ? '💬 Abre WhatsApp com mensagem automática' : '🔗 Direciona para link oficial'}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="text-white/60 hover:text-white underline cursor-pointer shrink-0"
            >
              Pular anúncio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
