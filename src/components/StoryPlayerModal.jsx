import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, 
  Volume2, 
  VolumeX, 
  Play, 
  MessageCircle, 
  ShoppingBag, 
  Share2, 
  CheckCircle2, 
  Heart,
  ExternalLink
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { trackStoryView } from '../utils/tracker';

function decodeHtmlEntities(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
      try { return String.fromCodePoint(parseInt(hex, 16)); } catch { return ''; }
    })
    .replace(/&#(\d+);/g, (_, dec) => {
      try { return String.fromCodePoint(parseInt(dec, 10)); } catch { return ''; }
    })
    .replace(/&amp;/g, () => '&')
    .replace(/&quot;/g, () => '"')
    .replace(/&#39;/g, () => "'")
    .replace(/&lt;/g, () => '<')
    .replace(/&gt;/g, () => '>')
    .trim();
}

export const StoryPlayerModal = ({ 
  isOpen, 
  onClose, 
  stories = [], 
  initialIndex = 0,
  onSelectCategory 
}) => {
  const { setSelectedProduct, catalogProducts } = useCart();

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [likedStories, setLikedStories] = useState({});

  const videoRef = useRef(null);
  const progressTimerRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
  const lastWheelTimeRef = useRef(0);

  // Sync index when modal opens
  useEffect(() => {
    if (isOpen) {
      const safeIndex = Math.min(Math.max(Number(initialIndex || 0), 0), Math.max(stories.length - 1, 0));
      setCurrentIndex(safeIndex);
      setProgress(0);
      setIsPaused(false);
    }
  }, [isOpen, initialIndex, stories.length]);

  const currentStory = stories[currentIndex] || stories[0];

  // Track story view analytics
  useEffect(() => {
    if (isOpen && currentStory) {
      trackStoryView(currentStory);
    }
  }, [isOpen, currentStory?.id]);

  // TikTok navigation: Next is DOWN, Prev is UP
  const handleNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      // Loop back to start in TikTok feed
      setCurrentIndex(0);
      setProgress(0);
    }
  }, [currentIndex, stories.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
    }
  }, [currentIndex]);

  // 1. GLOBAL MOUSE WHEEL SCROLL (TikTok on Desktop)
  useEffect(() => {
    if (!isOpen) return;

    const onGlobalWheel = (e) => {
      const now = Date.now();
      // Debounce to prevent skipping multiple videos on one swipe
      if (now - lastWheelTimeRef.current < 350) return;

      if (Math.abs(e.deltaY) > 20) {
        lastWheelTimeRef.current = now;
        if (e.deltaY > 0) {
          handleNext();
        } else {
          handlePrev();
        }
      }
    };

    window.addEventListener('wheel', onGlobalWheel, { passive: true });
    return () => window.removeEventListener('wheel', onGlobalWheel);
  }, [isOpen, handleNext, handlePrev]);

  // 2. KEYBOARD CONTROLS (Arrows Up/Down, Space, Esc)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setIsPaused((prev) => !prev);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  // 3. PROGRESS BAR & AUTO ADVANCE
  useEffect(() => {
    if (!isOpen || isPaused || !currentStory) return;

    if (currentStory.type === 'video' && currentStory.videoUrl) {
      const vid = videoRef.current;
      if (vid) {
        vid.muted = isMuted;
        vid.play().catch(() => {
          setIsMuted(true);
          vid.muted = true;
          vid.play().catch(() => {});
        });
      }
      return;
    }

    // Story duration: 18 seconds timer
    const stepMs = 50;
    const totalMs = 18000;
    const increment = (stepMs / totalMs) * 100;

    progressTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimerRef.current);
          handleNext();
          return 0;
        }
        return prev + increment;
      });
    }, stepMs);

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [isOpen, isPaused, currentIndex, currentStory, isMuted, handleNext]);

  // Sync progress with native video
  const handleTimeUpdate = () => {
    const vid = videoRef.current;
    if (vid && vid.duration) {
      setProgress((vid.currentTime / vid.duration) * 100);
    }
  };

  const handleVideoEnded = () => {
    handleNext();
  };

  // WhatsApp Order Handler
  const handleOrderWhatsApp = () => {
    if (!currentStory) return;
    const cleanPhone = '18096560219';
    const cleanTitle = decodeHtmlEntities(currentStory.title || currentStory.productName);
    const priceText = currentStory.price ? `RD$ ${Number(currentStory.price).toLocaleString('es-DO')}` : 'Precio en Oferta';
    
    const msg = 
      `¡Hola PLASTIR RD! 👋📦✨\n\n` +
      `Vi este producto en su video:\n` +
      `*${cleanTitle}*\n` +
      `💵 *Precio:* ${priceText}\n` +
      (currentStory.badge ? `🏷️ *Detalle:* ${currentStory.badge}\n` : '') +
      `📦 *Entrega:* Pago al recibir contra entrega\n` +
      `🌐 *Web:* https://plastirrd.com\n\n` +
      `¿Tienen disponibilidad para envío inmediato?`;

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  // View product in catalog
  const handleViewInStore = () => {
    if (!currentStory) return;
    const cleanTitle = decodeHtmlEntities(currentStory.title || currentStory.productName).toLowerCase();
    const matched = (catalogProducts || []).find((p) => 
      p.name.toLowerCase().includes(cleanTitle) ||
      cleanTitle.includes(p.name.toLowerCase())
    );

    onClose();
    if (matched) {
      setSelectedProduct(matched);
    } else {
      if (typeof onSelectCategory === 'function') onSelectCategory('all');
      setTimeout(() => {
        document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    }
  };

  // Share story
  const handleShareStory = () => {
    const shareUrl = window.location.origin;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const toggleLikeStory = (id) => {
    setLikedStories((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Touch handlers: Vertical Swipe (TikTok Navigation)
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
  };

  const handleTouchEnd = (e) => {
    const touch = e.changedTouches[0];
    const diffX = touch.clientX - touchStartRef.current.x;
    const diffY = touch.clientY - touchStartRef.current.y;
    const duration = Date.now() - touchStartRef.current.time;

    // Vertical Swipe UP -> Next video
    if (diffY < -50 && Math.abs(diffX) < 90) {
      handleNext();
      return;
    }

    // Vertical Swipe DOWN -> Previous video
    if (diffY > 50 && Math.abs(diffX) < 90) {
      handlePrev();
      return;
    }

    // Horizontal Swipe Right -> Close
    if (diffX > 110 && Math.abs(diffY) < 70) {
      onClose();
      return;
    }

    // Tap to pause/play
    if (duration < 250 && Math.abs(diffX) < 15 && Math.abs(diffY) < 15) {
      setIsPaused((prev) => !prev);
    }
  };

  if (!isOpen || !currentStory) return null;

  const displayTitle = decodeHtmlEntities(currentStory.title || currentStory.productName || 'MVP Flow');
  const isLiked = Boolean(likedStories[currentStory.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-0 sm:p-4 select-none">
      {/* 9:16 Full Screen TikTok Phone Player */}
      <div 
        className="relative w-full h-full sm:h-[92vh] sm:max-h-[850px] sm:max-w-[420px] sm:rounded-3xl overflow-hidden bg-black flex flex-col justify-between shadow-[0_0_80px_rgba(0,0,0,0.95)] border-0 sm:border sm:border-white/15"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* TikTok Top Progress Line */}
        <div className="absolute top-0 left-0 right-0 z-40 h-1 bg-white/20">
          <div 
            className="h-full bg-gradient-to-r from-mvp-red via-amber-400 to-emerald-400 transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Top Header Bar: Clean Minimalist */}
        <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between text-white drop-shadow-md">
          {/* Identity Pill */}
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15">
            <div className="w-7 h-7 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 to-mvp-red flex items-center justify-center flex-shrink-0">
              <img 
                src="/logo.png" 
                alt="MVP Flow" 
                className="w-full h-full object-cover rounded-full bg-black"
                onError={(e) => { e.target.src = '/img/drop-1.jpg'; }}
              />
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-1">
                <span className="text-xs font-black text-white tracking-wide">mvp_flow_losmina</span>
                <CheckCircle2 size={12} className="text-sky-400 fill-sky-400" />
              </div>
              <div className="flex items-center gap-1 text-[10px] text-white/70">
                <span>{currentIndex + 1} de {stories.length}</span>
              </div>
            </div>
          </div>

          {/* Top Actions: Instagram Link, Sound, Close */}
          <div className="flex items-center gap-1.5">
            {currentStory.instagramUrl && (
              <a
                href={currentStory.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-black/60 hover:bg-black/90 backdrop-blur-md px-2.5 py-1.5 rounded-full text-[11px] font-bold text-white/90 hover:text-white border border-white/15 transition-all flex items-center gap-1"
                title="Ver Reel en Instagram"
              >
                <span>IG</span>
                <ExternalLink size={11} />
              </a>
            )}

            {currentStory.type === 'video' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMuted(!isMuted);
                }}
                className="p-2 bg-black/60 hover:bg-black/90 backdrop-blur-md rounded-full text-white border border-white/15 transition-colors"
                title={isMuted ? 'Activar Sonido' : 'Silenciar'}
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-2 bg-black/60 hover:bg-black/90 backdrop-blur-md rounded-full text-white border border-white/15 transition-colors"
              title="Cerrar"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Media Player Area: 100% Full-Bleed Edge-to-Edge Visuals */}
        <div 
          className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden cursor-pointer"
          onClick={() => setIsPaused((prev) => !prev)}
        >
          {currentStory.type === 'video' && currentStory.videoUrl ? (
            <video
              ref={videoRef}
              src={currentStory.videoUrl}
              poster={currentStory.thumbnailUrl}
              autoPlay
              playsInline
              loop
              muted={isMuted}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleVideoEnded}
              className="w-full h-full object-cover"
            />
          ) : (
            /* Clean Full-Bleed Image Presentation (Zero Instagram Iframe noise) */
            <div className="relative w-full h-full overflow-hidden">
              <img
                src={currentStory.thumbnailUrl || '/img/drop-1.jpg'}
                alt={displayTitle}
                className="w-full h-full object-cover scale-[1.02] transition-transform duration-700"
              />
              {/* Subtle top & bottom shadow gradient for contrast */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/85 pointer-events-none" />
            </div>
          )}

          {/* Pause Indicator Overlay */}
          {isPaused && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-black/70 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-2xl">
                <Play size={30} className="ml-1 fill-white" />
              </div>
            </div>
          )}

          {/* TikTok Right Action Column: Ultra-Clean (Only 3 essential buttons) */}
          <div className="absolute right-3 bottom-24 z-30 flex flex-col items-center gap-3.5 text-white">
            {/* 1. Like Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLikeStory(currentStory.id);
              }}
              className="flex flex-col items-center group focus:outline-none"
            >
              <div className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md transition-transform group-hover:scale-110 active:scale-90 ${
                isLiked ? 'bg-rose-600 text-white shadow-glow-sm' : 'bg-black/60 text-white border border-white/20'
              }`}>
                <Heart size={21} className={isLiked ? 'fill-white' : ''} />
              </div>
              <span className="text-[10px] font-bold mt-1 drop-shadow-md">
                {(currentStory.likesCount || 65) + (isLiked ? 1 : 0)}
              </span>
            </button>

            {/* 2. Ver en Tienda / Catálogo */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleViewInStore();
              }}
              className="flex flex-col items-center group focus:outline-none"
              title="Ver en Catálogo"
            >
              <div className="w-11 h-11 rounded-full bg-black/60 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md transition-transform group-hover:scale-110 active:scale-90 border border-white/20">
                <ShoppingBag size={20} />
              </div>
              <span className="text-[10px] font-bold mt-1 drop-shadow-md">
                Tienda
              </span>
            </button>

            {/* 3. Compartir */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleShareStory();
              }}
              className="flex flex-col items-center group focus:outline-none"
              title="Compartir enlace"
            >
              <div className="w-11 h-11 rounded-full bg-black/60 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md transition-transform group-hover:scale-110 active:scale-90 border border-white/20">
                <Share2 size={19} />
              </div>
              <span className="text-[10px] font-bold mt-1 drop-shadow-md">
                {copiedLink ? '¡Copiado!' : 'Compartir'}
              </span>
            </button>
          </div>
        </div>

        {/* Bottom Area: Clean Title, Price & ONE Primary WhatsApp CTA */}
        <div className="absolute bottom-0 left-0 right-0 z-30 p-4 bg-gradient-to-t from-black via-black/85 to-transparent pt-12 space-y-2 pointer-events-auto">
          {/* Price Badge & Title */}
          <div className="pr-14">
            {currentStory.price ? (
              <span className="inline-block bg-emerald-500 text-black text-xs font-black px-2.5 py-0.5 rounded-lg uppercase tracking-wide shadow-md mb-1">
                RD$ {Number(currentStory.price).toLocaleString('es-DO')}
              </span>
            ) : currentStory.badge ? (
              <span className="inline-block bg-mvp-red text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-md mb-1">
                {currentStory.badge}
              </span>
            ) : null}

            <h3 className="text-sm font-black text-white leading-snug drop-shadow-md line-clamp-2">
              {displayTitle}
            </h3>
          </div>

          {/* ONE Single, High-Converting WhatsApp Button */}
          <button
            onClick={handleOrderWhatsApp}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(16,185,129,0.5)] active:scale-95 transition-all"
          >
            <MessageCircle size={18} className="fill-white/20" />
            <span>
              Pedir por WhatsApp {currentStory.price ? `• RD$ ${Number(currentStory.price).toLocaleString('es-DO')}` : ''}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoryPlayerModal;
