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
      name: 'Carolina Méndez',
      handle: '@carolina_hogar',
      city: 'Piantini, Santo Domingo',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      isVerified: true,
    },
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800&auto=format&fit=crop',
    caption: 'Mi despensa transformada con el set de 7 herméticos Plastir. Todo visible, libre de humedad y súper estético.',
    likes: 1240,
    commentsList: [
      { user: '@laura_rd', text: '¡Me encanta el orden! ¿Vienen con etiquetas?' },
      { user: '@carmen_santo', text: 'Los mejores herméticos que he comprado en RD' }
    ],
    taggedProductId: 'pla-001',
    timeAgo: 'hace 2 horas',
  },
  {
    id: 'look-2',
    user: {
      name: 'Marco Díaz',
      handle: '@marco_organiza',
      city: 'Santiago de los Caballeros',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      isVerified: true,
    },
    image: 'https://images.unsplash.com/photo-1558997519-83ea9252def8?q=80&w=800&auto=format&fit=crop',
    caption: 'Clóset ordenado con las cajas transparentes con broches Plastir. Plástico grueso y resistente.',
    likes: 890,
    commentsList: [
      { user: '@pedro_valdez', text: 'Hermano, ¿qué capacidad tienen esas cajas?' }
    ],
    taggedProductId: 'pla-003',
    timeAgo: 'hace 5 horas',
  },
  {
    id: 'look-3',
    user: {
      name: 'Laura Guzmán',
      handle: '@laura_lifestyle',
      city: 'Bella Vista, Santo Domingo',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      isVerified: true,
    },
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop',
    caption: 'Área de lavado perfecta con los cestos ergonómicos y gavetero modular Plastir. Entrega el mismo día impecable.',
    likes: 645,
    commentsList: [
      { user: '@maria_home', text: '¡Ese cesto es comodísimo para cargar la ropa!' }
    ],
    taggedProductId: 'pla-006',
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
  return (
    <section className="py-10 px-4 max-w-7xl mx-auto border-t border-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-[#F16100] px-3 py-1 rounded-full text-xs font-black uppercase mb-1 shadow-sm">
            <Sparkles size={14} className="text-[#F16100]" />
            <span>COMUNIDAD PLASTIR // ESPACIOS REALES</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-wide">
            HOGARES ORGANIZADOS EN REPÚBLICA DOMINICANA
          </h2>
          <p className="text-xs text-slate-500">
            Inspírate con cómo nuestra comunidad transforma su cocina, clóset y baño con soluciones Plastir.
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
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F16100] hover:bg-[#E05300] text-white font-black text-xs uppercase tracking-wider shadow-md shadow-orange-500/25 transition-all hover:scale-105"
        >
          <Camera size={16} />
          <span>Compartir Mi Espacio</span>
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
              className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              {/* User Header */}
              <div className="p-3 sm:p-4 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <img
                    src={look.user.avatar}
                    alt={look.user.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-[#F16100]"
                  />
                  <div>
                    <div className="flex items-center gap-1">
                      <h4 className="text-xs font-bold text-slate-900 leading-none">{look.user.name}</h4>
                      {look.user.isVerified && (
                        <CheckCircle2 size={13} className="text-emerald-500 fill-emerald-500/20" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {look.user.handle} • {look.user.city}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400">{look.timeAgo}</span>
              </div>

              {/* Photo Area */}
              <div className="relative aspect-[4/5] bg-slate-100 overflow-hidden">
                <img
                  src={look.image}
                  alt={look.caption}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />

                {/* Tagged Product Floating Pill */}
                {taggedProduct && (
                  <button
                    onClick={() => handleBuyTaggedProduct(taggedProduct.id)}
                    className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-2.5 flex items-center justify-between text-left hover:border-[#F16100] transition-all shadow-md group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={taggedProduct.images[0]}
                        alt={taggedProduct.name}
                        className="w-10 h-10 rounded-xl object-cover bg-slate-50 flex-shrink-0 border border-slate-200"
                      />
                      <div className="min-w-0">
                        <span className="text-[9px] text-[#F16100] font-black uppercase block">Artículo en Foto</span>
                        <h5 className="text-xs font-bold text-slate-900 truncate max-w-[150px]">{taggedProduct.name}</h5>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 pl-2">
                      <span className="text-xs font-black text-[#F16100] block">{formatMoney(taggedProduct.price)}</span>
                      <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5">
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
                        isLiked ? 'text-red-500' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Heart size={18} className={isLiked ? 'fill-red-500 text-red-500' : ''} />
                      <span>{look.likes.toLocaleString()}</span>
                    </button>

                    <button
                      onClick={() => setActiveCommentPostId(isCommenting ? null : look.id)}
                      className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800"
                    >
                      <MessageCircle size={18} />
                      <span>{look.commentsList?.length || 0}</span>
                    </button>
                  </div>

                  <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 border border-slate-200">
                    🇩🇴 Espacio Verificado
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-snug">
                  <strong className="text-slate-900 font-bold">{look.user.name}:</strong> {look.caption}
                </p>

                {/* Comments List */}
                {look.commentsList && look.commentsList.length > 0 && (
                  <div className="space-y-1 pt-1 border-t border-slate-100 text-[11px]">
                    {look.commentsList.slice(-2).map((c, i) => (
                      <div key={i} className="text-slate-600">
                        <span className="font-bold text-slate-900 mr-1">{c.user}:</span>
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
                      className="flex-1 bg-slate-50 border border-slate-200 focus:border-[#F16100] rounded-xl px-2.5 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-[#F16100] text-white text-xs font-bold rounded-xl"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 uppercase">Compartir mi Espacio Organizado</h3>
              <button onClick={() => setIsUploadModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePublishLook} className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-600 font-bold block mb-1">Artículo Plastir en tu espacio:</label>
                <select
                  value={uploadTaggedProduct}
                  onChange={(e) => setUploadTaggedProduct(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                >
                  {PRODUCTS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-600 font-bold block mb-1">Comentario o tip de organización:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ej: Transformé mi despensa y ahora encuentro todo al instante..."
                  value={uploadCaption}
                  onChange={(e) => setUploadCaption(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:border-[#F16100] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#F16100] hover:bg-[#E05300] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md shadow-orange-500/25 hover:scale-[1.02] transition-transform"
              >
                Publicar en la Comunidad Plastir
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
    </section>
  );
};
