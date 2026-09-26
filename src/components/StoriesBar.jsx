import React, { useState, useEffect } from 'react';
import { Sparkles, Gift, Play, Instagram, Video } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { StoryPlayerModal } from './StoryPlayerModal';

const DEFAULT_STORIES = [
  {
    id: 'story-1',
    title: 'Jordan 4 Black Cat',
    badge: 'TOP 1',
    liveNotice: '🔥 2 pares en 41 y 42',
    type: 'video',
    thumbnailUrl: '/img/drop-1.jpg',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-showing-sneakers-41132-large.mp4',
    instagramUrl: 'https://www.instagram.com/mvp_flow_boutique08/',
    price: 4850,
  },
  {
    id: 'story-2',
    title: 'Adidas Campus 00s',
    badge: 'Y2K',
    liveNotice: '⚡ Pedido a Santiago',
    type: 'video',
    thumbnailUrl: '/img/drop-2.jpg',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-walking-with-sneakers-on-a-street-41135-large.mp4',
    instagramUrl: 'https://www.instagram.com/mvp_flow_boutique08/',
    price: 3950,
  },
  {
    id: 'story-3',
    title: '12x Boxers RD$790',
    badge: 'OFERTA',
    liveNotice: '📦 89 combos vendidos',
    type: 'video',
    thumbnailUrl: '/img/drop-7.jpg',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-folding-clothes-neatly-41150-large.mp4',
    instagramUrl: 'https://www.instagram.com/mvp_flow_boutique08/',
    price: 790,
  },
  {
    id: 'story-4',
    title: 'Asics Kayano 14',
    badge: 'NUEVO',
    liveNotice: '👟 Despacho activo',
    type: 'video',
    thumbnailUrl: '/img/drop-3.jpg',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-feet-of-a-man-walking-in-sneakers-on-the-street-41138-large.mp4',
    instagramUrl: 'https://www.instagram.com/mvp_flow_boutique08/',
    price: 4400,
  },
  {
    id: 'story-5',
    title: 'Nike Dunk Low Panda',
    badge: 'CALLE',
    liveNotice: '🔥 La verdadera grasa',
    type: 'video',
    thumbnailUrl: '/img/drop-4.jpg',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-person-walking-on-a-pavement-in-sneakers-41142-large.mp4',
    instagramUrl: 'https://www.instagram.com/mvp_flow_boutique08/',
    price: 4200,
  },
];

export const StoriesBar = ({ onSelectCategory }) => {
  const { setIsWheelOpen } = useCart();
  const [stories, setStories] = useState(DEFAULT_STORIES);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  // Fetch live stories from backend API
  useEffect(() => {
    fetch('/api/stories')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.stories && Array.isArray(data.stories) && data.stories.length > 0) {
          setStories(data.stories);
        }
      })
      .catch(() => {});
  }, []);

  // Dynamic live sales ticker rotation
  useEffect(() => {
    const notices = [
      '🔥 Vendido hace 1m en Los Mina',
      '⚡ Pedido COD a Naco',
      '📦 En camino por Delivery',
      '👟 Últimos pares en talla 41',
      '🔥 32 personas viendo ahora',
      '⚡ Despacho Express activo',
    ];

    const interval = setInterval(() => {
      setStories((prev) =>
        prev.map((s, idx) => ({
          ...s,
          liveNotice: notices[(idx + Math.floor(Date.now() / 15000)) % notices.length],
        }))
      );
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const handleOpenPlayer = (index) => {
    setSelectedStoryIndex(index);
    setIsPlayerOpen(true);
  };

  return (
    <>
      <div className="w-full bg-mvp-black/90 border-b border-mvp-cardHover/40 py-2.5 px-3 overflow-x-auto no-scrollbar backdrop-blur-md">
        <div className="flex items-center gap-3 sm:gap-6 min-w-max mx-auto max-w-7xl">
          {/* 1. Special Story: Spin Wheel VIP */}
          <button
            onClick={() => setIsWheelOpen(true)}
            className="flex flex-col items-center gap-1 focus:outline-none group"
            title="Girar Ruleta VIP (-30% OFF)"
          >
            <div className="relative p-[2.5px] rounded-full transition-transform duration-300 group-hover:scale-110 group-active:scale-95 bg-gradient-to-tr from-amber-400 via-mvp-red to-mvp-crimson animate-pulse shadow-[0_0_15px_rgba(255,30,39,0.5)]">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-mvp-black bg-mvp-dark flex items-center justify-center">
                <Gift className="text-amber-400 group-hover:scale-110 transition-transform" size={26} />
              </div>
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-amber-600 text-black text-[8.5px] font-black px-1.5 py-0.2 rounded-md shadow-md uppercase tracking-wider whitespace-nowrap border border-black/20">
                30% OFF
              </span>
            </div>
            <span className="text-[11px] font-bold text-amber-300 group-hover:text-white transition-colors max-w-[80px] truncate text-center">
              Ruleta VIP
            </span>
            <span className="text-[9px] font-semibold text-emerald-400 max-w-[85px] truncate text-center animate-pulse">
              🔥 Gana hoy
            </span>
          </button>

          {/* 2. Real Video / Instagram Stories (TikTok / Shorts Player) */}
          {stories.map((story, idx) => (
            <button
              key={story.id || idx}
              onClick={() => handleOpenPlayer(idx)}
              className="flex flex-col items-center gap-1 focus:outline-none group"
              title={`Ver video: ${story.title}`}
            >
              {/* Story Avatar Ring */}
              <div className="relative p-[2.5px] rounded-full transition-transform duration-300 group-hover:scale-110 group-active:scale-95 bg-gradient-to-tr from-mvp-red via-orange-500 to-amber-500 shadow-sm">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-mvp-black bg-mvp-dark flex items-center justify-center relative">
                  <img
                    src={story.thumbnailUrl || '/img/drop-1.jpg'}
                    alt={story.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => { e.target.src = '/img/drop-1.jpg'; }}
                  />

                  {/* Play / Media icon overlay */}
                  <div className="absolute inset-0 bg-black/25 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
                    {story.type === 'instagram' ? (
                      <Instagram size={14} className="text-white drop-shadow" />
                    ) : (
                      <Play size={14} className="text-white fill-white drop-shadow ml-0.5" />
                    )}
                  </div>
                </div>

                {/* Badge */}
                {story.badge && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-gradient-to-r from-mvp-red to-mvp-darkRed text-white text-[8px] font-black px-1.5 py-0.2 rounded-md shadow-md uppercase tracking-wider whitespace-nowrap border border-white/20">
                    {story.badge}
                  </span>
                )}
              </div>

              {/* Story Label */}
              <span className="text-[11px] font-bold text-white group-hover:text-amber-300 transition-colors max-w-[80px] truncate text-center">
                {story.title}
              </span>

              {/* Live sales indicator sublabel */}
              <span className="text-[9px] font-semibold text-emerald-400 max-w-[85px] truncate text-center">
                {story.liveNotice || '⚡ Ver Short'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Fullscreen Video / Shorts Story Player */}
      <StoryPlayerModal
        isOpen={isPlayerOpen}
        onClose={() => setIsPlayerOpen(false)}
        stories={stories}
        initialIndex={selectedStoryIndex}
        onSelectCategory={onSelectCategory}
      />
    </>
  );
};
