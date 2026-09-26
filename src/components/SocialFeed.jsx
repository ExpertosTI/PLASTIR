import React, { useState } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  ShoppingBag, 
  Sparkles, 
  Camera, 
  CheckCircle2, 
  Flame, 
  Zap, 
  Send,
  X,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { PRODUCTS } from '../data/products';

const INITIAL_LOOKS = [
  {
    id: 'look-1',
    user: {
      name: 'Yariel Santos',
      handle: '@yariel_flowrd',
      city: 'Santo Domingo',
      avatar: '/img/drop-1.jpg',
      isVerified: true,
    },
    image: '/img/drop-1.jpg',
    caption: 'Rompiendo la calle con los Jordan 5 Retro en Naco 🔥 Calidad G5 dura de verdad.',
    likes: 1240,
    commentsList: [
      { user: '@alex_flow', text: 'Esos Jordan están durísimos hermano' },
      { user: '@carlos_flowrd', text: '¿Qué talla pediste tú?' }
    ],
    taggedProductId: 'mvp-001',
    timeAgo: 'hace 2 horas',
  },
  {
    id: 'look-2',
    user: {
      name: 'Melvin Santana',
      handle: '@melvin_urban',
      city: 'Santiago',
      avatar: '/img/drop-2.jpg',
      isVerified: true,
    },
    image: '/img/drop-2.jpg',
    caption: 'Los Adidas Campus 00s no fallan con los cordones anchos. Entrega rápida en Santiago 💯.',
    likes: 890,
    commentsList: [
      { user: '@king_stodgo', text: 'Fuego puro 🔥🔥🔥' }
    ],
    taggedProductId: 'mvp-002',
    timeAgo: 'hace 5 horas',
  },
  {
    id: 'look-3',
    user: {
      name: 'Bryan De La Cruz',
      handle: '@bryan_mvp',
      city: 'La Romana',
      avatar: '/img/drop-6.jpg',
      isVerified: false,
    },
    image: '/img/drop-6.jpg',
    caption: 'El combo de tenis Jordan 12 ⚡ Me llegó en 24h a La Romana. Recomendados 100%.',
    likes: 645,
    commentsList: [
      { user: '@elchucky_flow', text: 'Esos retro están duros' }
    ],
    taggedProductId: 'mvp-005',
    timeAgo: 'hace 8 horas',
  },
];

export const SocialFeed = () => {
  const { currentUser, setIsAuthModalOpen } = useAuth();
  const { setSelectedProduct, formatMoney } = useCart();

  const [looks, setLooks] = useState(INITIAL_LOOKS);
  const [likedLooksMap, setLikedLooksMap] = useState({});
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  // Active comment box per post
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [commentText, setCommentText] = useState('');

  // Upload Form State
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadTaggedProduct, setUploadTaggedProduct] = useState(PRODUCTS[0].id);
  const [uploadImageUrl, setUploadImageUrl] = useState(
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'
  );

  const handleLike = (lookId) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    setLikedLooksMap((prev) => {
      const isLiked = !prev[lookId];
      setLooks((currentLooks) =>
        currentLooks.map((l) =>
          l.id === lookId ? { ...l, likes: l.likes + (isLiked ? 1 : -1) } : l
        )
      );
      return { ...prev, [lookId]: isLiked };
    });
  };

  const handleCommentSubmit = (lookId, e) => {
    e.preventDefault();
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!commentText.trim()) return;

    setLooks((prev) =>
      prev.map((l) => {
        if (l.id === lookId) {
          const updated = l.commentsList || [];
          return {
            ...l,
            commentsList: [...updated, { user: currentUser.username, text: commentText.trim() }],
          };
        }
        return l;
      })
    );

    setCommentText('');
  };

  const handlePublishLook = (e) => {
    e.preventDefault();
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!uploadCaption.trim()) return;

    const newLook = {
      id: `look-${Date.now()}`,
      user: {
        name: currentUser.name,
        handle: currentUser.username,
        city: 'Santo Domingo (Tú)',
        avatar: currentUser.avatar,
        isVerified: true,
      },
      image: uploadImageUrl,
      caption: uploadCaption.trim(),
      likes: 1,
      commentsList: [],
      taggedProductId: uploadTaggedProduct,
      timeAgo: 'Justo ahora',
    };

    setLooks([newLook, ...looks]);
    setIsUploadModalOpen(false);
    setUploadCaption('');
    alert('¡Tu look ha sido publicado en el feed oficial de la comunidad y ganaste 500 Puntos FLOW! 🎉');
  };

  const handleBuyTaggedProduct = (productId) => {
    const found = PRODUCTS.find((p) => p.id === productId);
    if (found) {
      setSelectedProduct(found);
    }
  };

  return (
    <section className="py-8 px-4 max-w-7xl mx-auto border-t border-mvp-cardHover/60">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-mvp-red/20 border border-mvp-red/40 text-mvp-red px-3 py-1 rounded-full text-xs font-black uppercase mb-1">
            <Flame size={14} className="fill-mvp-red animate-flame" />
            <span>COMUNIDAD MVP FLOW // LOOKS DE LA CALLE</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-black text-white uppercase tracking-wide">
            LA GENTE DEL VERDADERO FLOW
          </h2>
          <p className="text-xs text-mvp-silver/70">
            Mira cómo viste nuestra comunidad en Santo Domingo, Santiago y todo el país.
          </p>
        </div>

        {/* Upload Look Button */}
        <button
          onClick={() => {
            if (!currentUser) {
              setIsAuthModalOpen(true);
            } else {
              setIsUploadModalOpen(true);
            }
          }}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-mvp-red hover:brightness-110 text-white font-black text-xs uppercase tracking-wider shadow-glow-sm transition-all hover:scale-105"
        >
          <Camera size={16} />
          <span>Subir Mi Look (+500 Pts)</span>
        </button>
      </div>

      {/* Social Feed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {looks.map((look) => {
          const isLiked = !!likedLooksMap[look.id];
          const taggedProduct = PRODUCTS.find((p) => p.id === look.taggedProductId);
          const isCommenting = activeCommentPostId === look.id;

          return (
            <article
              key={look.id}
              className="bg-mvp-card border border-mvp-cardHover rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between"
            >
              {/* User Header */}
              <div className="p-3 sm:p-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={look.user.avatar}
                    alt={look.user.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-mvp-red"
                  />
                  <div>
                    <div className="flex items-center gap-1">
                      <h4 className="text-xs font-bold text-white leading-none">{look.user.name}</h4>
                      {look.user.isVerified && (
                        <CheckCircle2 size={13} className="text-mvp-neonGreen fill-mvp-neonGreen/20" />
                      )}
                    </div>
                    <span className="text-[10px] text-mvp-muted">
                      {look.user.handle} • {look.user.city}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-mvp-muted">{look.timeAgo}</span>
              </div>

              {/* Photo Area */}
              <div className="relative aspect-[4/5] bg-black/60 overflow-hidden">
                <img
                  src={look.image}
                  alt={look.caption}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />

                {/* Tagged Product Floating Pill */}
                {taggedProduct && (
                  <button
                    onClick={() => handleBuyTaggedProduct(taggedProduct.id)}
                    className="absolute bottom-3 left-3 right-3 bg-mvp-black/85 backdrop-blur-md border border-white/10 rounded-2xl p-2.5 flex items-center justify-between text-left hover:border-mvp-red transition-all shadow-lg group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={taggedProduct.images[0]}
                        alt={taggedProduct.name}
                        className="w-10 h-10 rounded-xl object-cover bg-black flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-[9px] text-mvp-red font-black uppercase block">Prenda en este Look</span>
                        <h5 className="text-xs font-bold text-white truncate max-w-[150px]">{taggedProduct.name}</h5>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 pl-2">
                      <span className="text-xs font-black text-white block">{formatMoney(taggedProduct.price)}</span>
                      <span className="text-[9px] text-mvp-neonGreen font-bold flex items-center gap-0.5">
                        <ShoppingBag size={10} /> Pedir COD
                      </span>
                    </div>
                  </button>
                )}
              </div>

              {/* Actions & Caption */}
              <div className="p-3 sm:p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleLike(look.id)}
                      className={`flex items-center gap-1 text-xs font-bold transition-transform active:scale-125 ${
                        isLiked ? 'text-mvp-red' : 'text-mvp-silver hover:text-white'
                      }`}
                    >
                      <Heart size={18} className={isLiked ? 'fill-mvp-red text-mvp-red' : ''} />
                      <span>{look.likes.toLocaleString()}</span>
                    </button>

                    <button
                      onClick={() => setActiveCommentPostId(isCommenting ? null : look.id)}
                      className="flex items-center gap-1 text-xs text-mvp-silver hover:text-white"
                    >
                      <MessageCircle size={18} />
                      <span>{look.commentsList?.length || 0}</span>
                    </button>
                  </div>

                  <span className="text-[10px] bg-mvp-dark px-2 py-0.5 rounded text-mvp-muted border border-mvp-cardHover">
                    🇩🇴 Look Verificado
                  </span>
                </div>

                <p className="text-xs text-mvp-silver/90 leading-snug">
                  <strong className="text-white font-bold">{look.user.name}:</strong> {look.caption}
                </p>

                {/* Comments List */}
                {look.commentsList && look.commentsList.length > 0 && (
                  <div className="space-y-1 pt-1 border-t border-mvp-cardHover/40 text-[11px]">
                    {look.commentsList.slice(-2).map((c, i) => (
                      <div key={i} className="text-mvp-silver/80">
                        <span className="font-bold text-white mr-1">{c.user}:</span>
                        <span>{c.text}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Comment Input Box */}
                {isCommenting && (
                  <form onSubmit={(e) => handleCommentSubmit(look.id, e)} className="flex gap-1.5 pt-2">
                    <input
                      type="text"
                      placeholder="Escribe un comentario..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="flex-1 bg-mvp-black border border-mvp-cardHover focus:border-mvp-red rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-mvp-muted focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-mvp-red text-white text-xs font-bold rounded-xl"
                    >
                      <Send size={12} />
                    </button>
                  </form>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Upload Look Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-gradient-to-b from-mvp-card via-mvp-dark to-mvp-black border border-mvp-red/50 rounded-3xl p-5 sm:p-6 space-y-4 shadow-glow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white uppercase">Publicar mi Look en la Comunidad</h3>
              <button onClick={() => setIsUploadModalOpen(false)} className="p-1 text-mvp-muted hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePublishLook} className="space-y-3">
              <div>
                <label className="text-[11px] text-mvp-muted font-bold block mb-1">Prenda MVP FLOW que llevas puesta:</label>
                <select
                  value={uploadTaggedProduct}
                  onChange={(e) => setUploadTaggedProduct(e.target.value)}
                  className="w-full bg-mvp-black border border-mvp-cardHover rounded-xl px-3 py-2 text-xs text-white"
                >
                  {PRODUCTS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-mvp-muted font-bold block mb-1">Pie de foto / Comentario sobre el drop:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ej: Rompiendo en Santo Domingo con este hoodie pesado 🔥"
                  value={uploadCaption}
                  onChange={(e) => setUploadCaption(e.target.value)}
                  className="w-full bg-mvp-black border border-mvp-cardHover rounded-xl p-3 text-xs text-white placeholder-mvp-muted focus:border-mvp-red focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-mvp-red to-mvp-crimson text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-glow-red hover:scale-[1.02] transition-transform"
              >
                Subir Look y Reclamar 500 Puntos
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
