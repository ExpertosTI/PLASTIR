import React, { useState, useEffect } from 'react';
import { Sparkles, Gift, Play, Instagram, Video } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { StoryPlayerModal } from './StoryPlayerModal';

const DEFAULT_STORIES = [
  {
    id: 'story-1',
    title: 'Herméticos Click',
    badge: 'COCINA',
    liveNotice: '🔥 18 sets vendidos hoy',
    type: 'video',
    thumbnailUrl: '/img/nordic-containers.jpg',
    videoUrl: '/video/plastir-promo.mp4',
    instagramUrl: 'https://plastirrd.com/',
    price: 1890,
  },
  {
    id: 'story-2',
    title: 'Cajas Clóset',
    badge: 'ORDEN',
    liveNotice: '⚡ Envíos express COD',
    type: 'video',
    thumbnailUrl: '/img/closet-boxes.jpg',
    videoUrl: '/video/plastir-promo.mp4',
    instagramUrl: 'https://plastirrd.com/',
    price: 650,
  },
  {
    id: 'story-3',
    title: 'Cesto Ropa',
    badge: 'LAVADO',
    liveNotice: '🧺 Ventilado ergonómico',
    type: 'video',
    thumbnailUrl: '/img/laundry-basket.jpg',
    videoUrl: '/video/plastir-promo.mp4',
    instagramUrl: 'https://plastirrd.com/',
    price: 890,
  },
  {
    id: 'story-4',
    title: 'Gavetero 4 Niv',
    badge: 'NUEVO',
    liveNotice: '✨ Modular resistente',
    type: 'video',
    thumbnailUrl: '/img/drawer-tower.jpg',
    videoUrl: '/video/plastir-promo.mp4',
    instagramUrl: 'https://plastirrd.com/',
    price: 2450,
  },
  {
    id: 'story-5',
    title: 'Zafacón Pedal',
    badge: 'HIGIENE',
    liveNotice: '🌿 Sin tocar con manos',
    type: 'video',
    thumbnailUrl: '/img/zafacon-pedal.jpg',
    videoUrl: '/video/plastir-promo.mp4',
    instagramUrl: 'https://plastirrd.com/',
    price: 990,
  },
  {
    id: 'story-6',
    title: 'Silla Nórdica',
    badge: 'HOGAR',
    liveNotice: '🪑 Resistente a UV',
    type: 'video',
    thumbnailUrl: 'https://images.unsplash.com/photo-1503602642458-232111445657?q=80&w=400&auto=format&fit=crop',
    videoUrl: '/video/plastir-promo.mp4',
    instagramUrl: 'https://plastirrd.com/',
    price: 1350,
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
      '🔥 Entregado en Naco hace 5m',
      '⚡ Pedido COD a Santiago',
      '📦 En camino por Delivery',
      '✨ 28 personas viendo ahora',
      '⚡ Despacho el mismo día',
      '🏠 Organización de cocina',
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
      <div className="w-full bg-white border-b border-slate-200 py-3 px-3 overflow-x-auto no-scrollbar shadow-sm">
        <div className="flex items-center gap-3 sm:gap-6 min-w-max mx-auto max-w-7xl">
          {/* 1. Special Story: Spin Wheel VIP */}
          <button
            onClick={() => setIsWheelOpen(true)}
            className="flex flex-col items-center gap-1 focus:outline-none group"
            title="Girar Ruleta Plastir (-30% OFF)"
          >
            <div className="relative p-[2.5px] rounded-full transition-transform duration-300 group-hover:scale-110 group-active:scale-95 bg-gradient-to-tr from-amber-400 via-[#F16100] to-orange-500 shadow-sm animate-pulse">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-white bg-orange-50 flex items-center justify-center">
                <Gift className="text-[#F16100] group-hover:scale-110 transition-transform" size={26} />
              </div>
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#F16100] text-white text-[8.5px] font-black px-1.5 py-0.2 rounded-md shadow uppercase tracking-wider whitespace-nowrap">
                30% OFF
              </span>
            </div>
            <span className="text-[11px] font-bold text-slate-800 group-hover:text-[#F16100] transition-colors max-w-[80px] truncate text-center">
              Ruleta Premios
            </span>
            <span className="text-[9px] font-semibold text-emerald-600 max-w-[85px] truncate text-center">
              🎉 Descuento Hoy
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
              <div className="relative p-[2.5px] rounded-full transition-transform duration-300 group-hover:scale-110 group-active:scale-95 bg-gradient-to-tr from-[#F16100] via-orange-400 to-amber-400 shadow-sm">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-white bg-slate-100 flex items-center justify-center relative">
                  <img
                    src={story.thumbnailUrl}
                    alt={story.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?q=80&w=400'; }}
                  />

                  {/* Play / Media icon overlay */}
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
                    {story.type === 'instagram' ? (
                      <Instagram size={14} className="text-white drop-shadow" />
                    ) : (
                      <Play size={14} className="text-white fill-white drop-shadow ml-0.5" />
                    )}
                  </div>
                </div>

                {/* Badge */}
                {story.badge && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#F16100] text-white text-[8px] font-black px-1.5 py-0.2 rounded-md shadow uppercase tracking-wider whitespace-nowrap">
                    {story.badge}
                  </span>
                )}
              </div>

              {/* Story Label */}
              <span className="text-[11px] font-bold text-slate-800 group-hover:text-[#F16100] transition-colors max-w-[80px] truncate text-center">
                {story.title}
              </span>

              {/* Live sales indicator sublabel */}
              <span className="text-[9px] font-semibold text-emerald-600 max-w-[85px] truncate text-center">
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
