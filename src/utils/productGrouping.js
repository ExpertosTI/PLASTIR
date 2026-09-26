/**
 * Utility: Group products with the same name and price as color/style variants.
 * Specifically designed for Odoo and web catalog drops where separate entries
 * are created solely for color changes (e.g. LV73-6, LV73-5, LV73-10, LV73-13).
 */

export const groupProductsByVariant = (products = []) => {
  if (!Array.isArray(products) || products.length === 0) return [];

  const groups = new Map();

  const getStock = (p) => Number(p.stockLeft ?? p.qtyAvailable ?? p.stock ?? 0);

  products.forEach((p) => {
    // Normalization key: lowercase trimmed name + price
    const cleanName = (p.name || '').trim().toLowerCase();
    const cleanPrice = Number(p.price || 0);
    const groupKey = `${cleanName}__${cleanPrice}`;

    if (!groups.has(groupKey)) {
      groups.set(groupKey, []);
    }
    groups.get(groupKey).push(p);
  });

  const result = [];

  for (const [, items] of groups.entries()) {
    if (items.length === 1) {
      result.push(items[0]);
      continue;
    }

    // Multiple products with identical name & price -> Group into 1 with color variants!
    const base = items[0];
    const totalStock = items.reduce((sum, it) => sum + getStock(it), 0);

    const variants = items.map((it, idx) => {
      // Determine distinctive label: color name or clean identifier
      const codeMatch = (it.sku || it.code || it.tag || '').trim();
      const nameMatch = it.name.match(/\((.*?)\)/)?.[1] || it.name.match(/-\s*([A-Za-z0-9]+)/)?.[1];
      const hasMeaningfulCode = codeMatch && !codeMatch.startsWith('SKU-OD-') && !codeMatch.includes('NUEVO') && !codeMatch.includes('ÚLTIMOS');
      const colorLabel = nameMatch || (hasMeaningfulCode ? codeMatch : null) || `Color ${idx + 1}`;

      const itImages = Array.isArray(it.images) && it.images.length > 0
        ? it.images
        : [it.image || it.imageUrl].filter(Boolean);

      return {
        id: it.id,
        name: it.name,
        code: colorLabel,
        colorName: colorLabel,
        sku: it.sku || it.code || `VAR-${idx + 1}`,
        price: it.price,
        originalPrice: it.originalPrice || base.originalPrice,
        stock: getStock(it),
        stockLeft: getStock(it),
        qtyAvailable: getStock(it),
        image: itImages[0] || base.image || (base.images && base.images[0]),
        images: itImages.length > 0 ? itImages : (base.images || [base.image]),
        sizes: it.sizes || base.sizes || [],
        rawProduct: it,
      };
    });

    // Gather distinct images across all variants for the full gallery
    const combinedImages = [];
    variants.forEach((v) => {
      (v.images || []).forEach((img) => {
        if (img && !combinedImages.includes(img)) {
          combinedImages.push(img);
        }
      });
    });

    // Map color choices with direct thumbnail references
    const colors = variants.map((v, idx) => ({
      name: v.code || `Color ${idx + 1}`,
      hex: '#FF1E27',
      image: v.image,
      variantId: v.id,
      sku: v.sku,
      stock: v.stock,
    }));

    result.push({
      ...base,
      stock: totalStock,
      stockLeft: totalStock,
      qtyAvailable: totalStock,
      images: combinedImages.length > 0 ? combinedImages : (base.images || [base.image]),
      colors: colors.length > 0 ? colors : (base.colors || []),
      variants,
      hasVariants: true,
      variantCount: variants.length,
    });
  }

  return result;
};
