import React, { useState, useRef, useEffect } from 'react';
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
}

interface PortalWelcomeVideoModalProps {
  config?: PortalWelcomeVideoConfig | null;
  isOpen: boolean;
  onClose: () => void;
  isPreviewMode?: boolean;
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
  isPreviewMode = false
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

  const videoUrl = config?.videoUrl?.trim() || '';
  const flyerUrl = config?.flyerUrl?.trim() || '';
  const hasVideo = Boolean(videoUrl);
  const hasFlyer = Boolean(flyerUrl);

  // Set initial active media tab based on config
  useEffect(() => {
    if (config?.mediaType === 'flyer' && hasFlyer) {
      setActiveTabMedia('flyer');
    } else if (config?.mediaType === 'video' && hasVideo) {
      setActiveTabMedia('video');
    } else if (!hasVideo && hasFlyer) {
      setActiveTabMedia('flyer');
    } else {
      setActiveTabMedia('video');
    }
  }, [config?.mediaType, hasVideo, hasFlyer, isOpen]);

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

  // Build redirection link
  const buildActionUrl = () => {
    if (config?.actionType === 'link' && config.customLink) {
      return config.customLink;
    }

    const rawPhone = config?.whatsappPhone || '';
    const digits = rawPhone.replace(/\D/g, '');
    const cleanPhone = digits.length === 10 || digits.length === 11 ? `55${digits}` : digits;

    const baseMessage = config?.whatsappMessage?.trim() || 
      `Olá! Vi o anúncio no Portal de Divulgação e gostaria de saber mais informações!`;

    if (cleanPhone) {
      return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(baseMessage)}`;
    }

    if (config?.customLink) {
      return config.customLink;
    }

    return '#';
  };

  const actionUrl = buildActionUrl();
  const isWhatsApp = config?.actionType !== 'link' && (config?.whatsappPhone || !config?.customLink);
  const buttonLabel = config?.buttonText?.trim() || (isWhatsApp ? 'Falar no WhatsApp' : 'Acessar Link');
  const badgeLabel = config?.badge?.trim() || 'PATROCINADO';
  const companyTitle = config?.companyName?.trim() || config?.title?.trim() || 'Destaque Especial';

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (actionUrl && actionUrl !== '#') {
      window.open(actionUrl, '_blank', 'noopener,noreferrer');
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
                {config?.companyCategory && (
                  <span className="text-[10px] text-white/50 font-normal hidden sm:inline">
                    • {config.companyCategory}
                  </span>
                )}
              </h4>
              <p className="text-[10px] text-white/50 truncate">
                {isPreviewMode ? 'Modo de Teste do Administrador' : 'Exibição em Destaque no Portal'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold shrink-0 cursor-pointer"
            title="Fechar e ir para o portal"
          >
            <span className="hidden sm:inline text-[11px]">Ir para o Portal</span>
            <X className="w-4 h-4" />
          </button>
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
          {/* Target Company Info Card (if pulled from platform) */}
          {config?.companyName && (
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
              {config.companyLogo ? (
                <img 
                  src={config.companyLogo} 
                  alt={config.companyName} 
                  className="w-10 h-10 rounded-full object-cover border border-white/20 bg-black shrink-0" 
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-sm shrink-0">
                  <Store className="w-5 h-5" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Anunciante Oficial</p>
                <h5 className="text-white font-bold text-xs sm:text-sm truncate">{config.companyName}</h5>
                {config.whatsappPhone && (
                  <p className="text-[10px] text-emerald-400 font-mono truncate">
                    WhatsApp: {config.whatsappPhone}
                  </p>
                )}
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
