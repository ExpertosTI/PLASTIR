import React from 'react';
import { X, Heart, ShoppingBag, Trash2, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { PRODUCTS } from '../data/products';

export const WishlistModal = () => {
  const { 
    wishlist, 
    isWishlistOpen, 
    setIsWishlistOpen, 
    toggleFavorite, 
    addToCart, 
    formatMoney,
    catalogProducts,
    openDirectWhatsAppForProduct
  } = useCart();

  if (!isWishlistOpen) return null;

  // Use dynamic products pool if available, fallback to static products
  const pool = (catalogProducts && catalogProducts.length > 0) ? catalogProducts : PRODUCTS;
  const favoriteProducts = pool.filter((p) => 
    wishlist.some((id) => String(id) === String(p.id))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-mvp-card via-mvp-dark to-mvp-black border border-mvp-cardHover rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-mvp-cardHover bg-mvp-dark flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart size={20} className="text-mvp-red fill-mvp-red" />
            <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
              Tus Prendas Favoritas ({favoriteProducts.length})
            </h2>
          </div>
          <button
            onClick={() => setIsWishlistOpen(false)}
            className="p-1.5 text-mvp-muted hover:text-white rounded-lg hover:bg-mvp-card transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-3 flex-1">
          {favoriteProducts.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Heart size={40} className="text-mvp-muted mx-auto" />
              <h3 className="text-sm font-bold text-white">No tienes prendas guardadas</h3>
              <p className="text-xs text-mvp-silver/70">
                Toca el corazón en cualquier modelo para guardarlo en tu lista de deseos en tiempo real.
              </p>
            </div>
          ) : (
            favoriteProducts.map((product) => {
              const imageSrc = product.images?.[0] || product.image || '/img/drop-1.jpg';
              const defaultSize = (product.sizes && product.sizes[0]) || 'Estándar';
              const defaultColor = (product.colors && product.colors[0]?.name) || 'Original';

              return (
                <div
                  key={product.id}
                  className="bg-mvp-dark/70 border border-mvp-cardHover rounded-2xl p-3 flex gap-3 items-center"
                >
                  <img
                    src={imageSrc}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                    className="w-16 h-16 rounded-xl object-cover bg-black flex-shrink-0 border border-white/10"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-white truncate leading-snug">
                      {product.name}
                    </h4>
                    <div className="flex items-center gap-2 my-1">
                      <span className="text-sm font-black text-mvp-red">
                        {formatMoney(product.price)}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-xs text-mvp-muted line-through">
                          {formatMoney(product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {/* Direct WhatsApp Order */}
                    <button
                      onClick={() => openDirectWhatsAppForProduct(product, defaultSize, defaultColor)}
                      className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow"
                      title="Pedir por WhatsApp"
                    >
                      <MessageCircle size={16} />
                    </button>

                    {/* Move to Cart */}
                    <button
                      onClick={() => {
                        addToCart(product, defaultSize, defaultColor);
                        toggleFavorite(product.id);
                      }}
                      className="p-2 rounded-xl bg-mvp-red hover:bg-mvp-darkRed text-white text-xs font-bold transition-colors shadow"
                      title="Mover al Carrito"
                    >
                      <ShoppingBag size={16} />
                    </button>

                    {/* Remove */}
                    <button
                      onClick={() => toggleFavorite(product.id)}
                      className="p-2 rounded-xl bg-mvp-dark text-mvp-muted hover:text-red-400 border border-mvp-cardHover transition-colors"
                      title="Quitar de favoritos"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
