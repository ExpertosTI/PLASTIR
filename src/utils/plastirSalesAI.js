// Motor de Inteligencia Artificial de Ventas & Asesoría para PLASTIR RD
// Diseñado para atender al cliente en contexto, responder dudas técnicas y cerrar ventas directamente en la web.

import { PRODUCTS } from '../data/products.js';

const DOMINICAN_SECTORS = [
  { keywords: ['naco', 'piantini', 'bella vista', 'gazcue', 'distrito nacional', 'd.n.', 'zona colonial', 'mirador', 'esperilla', 'evaristo'], zone: 'Distrito Nacional', cost: 250, time: '2 a 4 horas (Mismo día)' },
  { keywords: ['santo domingo este', 'sde', 'alma rosa', 'san vicente', 'charles', 'invivienda', 'san isidro', 'autopista san isidro', 'ensanche ozama'], zone: 'Santo Domingo Este', cost: 250, time: '2 a 4 horas (Mismo día)' },
  { keywords: ['santo domingo norte', 'sdn', 'villa mella', 'herrera', 'santo domingo oeste', 'sdo', 'alcarrizos', 'manoguayabo'], zone: 'Santo Domingo Norte / Oeste', cost: 300, time: 'Mismo día' },
  { keywords: ['santiago', 'santiago de los caballeros', 'gurabo', 'cercado'], zone: 'Santiago', cost: 350, time: '24 horas Express' },
  { keywords: ['san cristobal', 'bani', 'azua'], zone: 'San Cristóbal / Baní', cost: 300, time: '24 horas' },
  { keywords: ['la romana', 'san pedro', 'punta cana', 'bavaro', 'higuey'], zone: 'Región Este (Punta Cana / La Romana)', cost: 350, time: '24 a 48 horas' },
  { keywords: ['puerto plata', 'la vega', 'moca', 'san francisco', 'barahona'], zone: 'Interior del País', cost: 350, time: '24 a 48 horas vía Caribe Tours / Metro Pac' },
];

/**
 * Normaliza texto para búsqueda semántica simple
 */
function cleanText(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Encuentra el producto más relevante en el catálogo dado un texto de consulta
 */
export function findProductInCatalog(query) {
  if (!query) return null;
  const q = cleanText(query);

  // 1. Coincidencia exacta por ID
  const byId = PRODUCTS.find((p) => p.id === query.trim());
  if (byId) return byId;

  // 2. Coincidencia por palabras clave representativas
  if (q.includes('hermetico') || q.includes('nordic fresh') || q.includes('click lock') || q.includes('set 7') || q.includes('envase')) {
    return PRODUCTS.find((p) => p.id === 'pla-001') || PRODUCTS[0];
  }
  if (q.includes('dispensador') || q.includes('giratorio') || q.includes('grano') || q.includes('cereal') || q.includes('arroz') || q.includes('frijol')) {
    return PRODUCTS.find((p) => p.id === 'pla-002');
  }
  if (q.includes('caja') || q.includes('65') || q.includes('heavy duty') || q.includes('broche') || q.includes('closet')) {
    return PRODUCTS.find((p) => p.id === 'pla-003');
  }
  if (q.includes('gavetero') || q.includes('torre') || q.includes('cajones') || q.includes('4 nivel') || q.includes('nordic tower')) {
    return PRODUCTS.find((p) => p.id === 'pla-004');
  }
  if (q.includes('zapatera') || q.includes('drop box') || q.includes('zapatos') || q.includes('magnetica') || q.includes('tenis')) {
    return PRODUCTS.find((p) => p.id === 'pla-005');
  }
  if (q.includes('cesto') || q.includes('ropa') || q.includes('lavanderia') || q.includes('aeroclean')) {
    return PRODUCTS.find((p) => p.id === 'pla-006');
  }
  if (q.includes('balde') || q.includes('exprimidor') || q.includes('mopa') || q.includes('trapeador') || q.includes('cubo')) {
    return PRODUCTS.find((p) => p.id === 'pla-007');
  }
  if (q.includes('jarra') || q.includes('jugo') || q.includes('agua') || q.includes('2.5')) {
    return PRODUCTS.find((p) => p.id === 'pla-008');
  }
  if (q.includes('vaso') || q.includes('irrompible') || q.includes('brisa marina') || q.includes('copa')) {
    return PRODUCTS.find((p) => p.id === 'pla-009');
  }
  if (q.includes('infantil') || q.includes('bebe') || q.includes('joyful kids') || q.includes('nino')) {
    return PRODUCTS.find((p) => p.id === 'pla-010');
  }
  if (q.includes('zafacon') || q.includes('basura') || q.includes('pedal') || q.includes('120') || q.includes('ruedas')) {
    return PRODUCTS.find((p) => p.id === 'pla-011');
  }
  if (q.includes('agricola') || q.includes('tarima') || q.includes('pesada') || q.includes('50kg') || q.includes('almacen')) {
    return PRODUCTS.find((p) => p.id === 'pla-012');
  }
  if (q.includes('silla') || q.includes('monoblock') || q.includes('150 kg') || q.includes('terraza')) {
    return PRODUCTS.find((p) => p.id === 'pla-013');
  }

  // 3. Fallback por coincidencia difusa en nombres
  return PRODUCTS.find((p) => cleanText(p.name).split(' ').some((w) => w.length > 3 && q.includes(w))) || null;
}

/**
 * Procesa la consulta del cliente utilizando todo el contexto disponible
 * y genera una respuesta comercial incisiva, empática y precisa.
 */
export function generateSalesResponse({
  userMessage,
  currentProduct = null,
  viewedProducts = [],
  cart = [],
  customerName = '',
}) {
  const q = cleanText(userMessage);
  const nameGreeting = customerName ? `${customerName}` : 'Estimado/a cliente';

  // Determinar el producto foco (el actual, el mencionado en la pregunta, o el último visto)
  const mentionedProduct = findProductInCatalog(userMessage);
  const focusProduct = mentionedProduct || currentProduct || (viewedProducts.length > 0 ? viewedProducts[0] : null);

  // 1. CONSULTA DE MEDIDAS, CAPACIDAD O DIMENSIONES
  if (
    q.includes('medida') ||
    q.includes('mide') ||
    q.includes('tamano') ||
    q.includes('dimension') ||
    q.includes('caben') ||
    q.includes('capacidad') ||
    q.includes('litro') ||
    q.includes('kilo') ||
    q.includes('cm')
  ) {
    if (focusProduct) {
      return {
        reply: `📐 **Especificaciones de Medidas & Capacidad:**\n\nEl artículo **${focusProduct.name}** cuenta con:\n• **Dimensiones:** ${focusProduct.dimensions || 'Diseño modular estándar'}\n• **Capacidad:** ${focusProduct.capacity || 'Alta capacidad'}\n• **Material:** ${focusProduct.material || 'Polipropileno virgen libre de BPA'}\n\nEstá diseñado para maximizar el espacio vertical en tu hogar sin deformarse. Nos quedan **${focusProduct.stockLeft || 12} unidades** en almacén listas para despacho hoy. ¿Te gustaría que te lo reserve con Pago Contra Entrega?`,
        product: focusProduct,
        quickActions: [
          { type: 'add_to_cart', label: `🛒 Agregar ${focusProduct.name.split(' ')[0]} (RD$ ${Number(focusProduct.price).toLocaleString('es-DO')})`, product: focusProduct },
          { type: 'quick_checkout', label: '⚡ Comprar con Pago al Recibir', product: focusProduct }
        ],
        suggestedQuestions: [
          '¿Cuánto tarda el envío a mi casa?',
          '¿Tienen garantía de calidad?',
          '¿Hay descuento si llevo 2 o más?'
        ]
      };
    }
  }

  // 2. CONSULTA DE MATERIAL / CALIDAD / BPA / RESISTENCIA
  if (
    q.includes('material') ||
    q.includes('plastico') ||
    q.includes('bpa') ||
    q.includes('toxico') ||
    q.includes('calidad') ||
    q.includes('resistente') ||
    q.includes('rompe') ||
    q.includes('microondas') ||
    q.includes('congelador') ||
    q.includes('lavaplatos')
  ) {
    const prod = focusProduct || PRODUCTS[0];
    return {
      reply: `🛡️ **Calidad y Certificación de Materiales PLASTIR RD:**\n\nTodos nuestros productos están fabricados en **100% polipropileno virgen y polímeros grado alimenticio**, totalmente **libres de BPA y no tóxicos**.\n\n• Resisten impactos, no se quiebran como los plásticos genéricos.\n• Aptos para el clima tropical de República Dominicana (no amarillean ni acumulan hongos).\n• Ideales para uso en microondas, refrigerador y lavavajillas.\n\nEl **${prod.name}** cuenta con garantía de satisfacción. ¿Te aparto el tuyo para entrega hoy?`,
      product: prod,
      quickActions: [
        { type: 'add_to_cart', label: '🛒 Añadir al Carrito', product: prod },
        { type: 'quick_checkout', label: '⚡ Pedir Ahora Contra Entrega', product: prod }
      ],
      suggestedQuestions: [
        '¿Cuáles son las medidas exactas?',
        '¿Cuánto cuesta el envío a Santo Domingo?',
        '¿Cómo funciona el pago al recibir?'
      ]
    };
  }

  // 3. CONSULTA DE ENVIOS, TARIFAS Y TIEMPOS EN RD
  if (
    q.includes('envio') ||
    q.includes('entrega') ||
    q.includes('donde') ||
    q.includes('delivery') ||
    q.includes('santo domingo') ||
    q.includes('santiago') ||
    q.includes('punta cana') ||
    q.includes('tiempo') ||
    q.includes('cuanto dura') ||
    q.includes('sector') ||
    DOMINICAN_SECTORS.some((s) => s.keywords.some((k) => q.includes(k)))
  ) {
    const matchedZone = DOMINICAN_SECTORS.find((s) => s.keywords.some((k) => q.includes(k)));
    const zoneInfo = matchedZone
      ? `Para tu sector en **${matchedZone.zone}**, la tarifa de envío express es de **RD$ ${matchedZone.cost}** con tiempo de entrega estimado de **${matchedZone.time}**.`
      : `Realizamos **Envíos Express el mismo día** en todo el Gran Santo Domingo (RD$ 250 a RD$ 300) y entregas en **24 horas a todo el país** (Santiago, Punta Cana, La Romana por RD$ 350).`;

    return {
      reply: `🛵 **Logística & Envíos Express PLASTIR RD:**\n\n${zoneInfo}\n\nLo mejor de todo: **No tienes que pagar nada por adelantado.** Pagas en efectivo al mensajero cuando recibas el paquete en tu puerta. ¿A qué sector o municipio te gustaría que enviemos tu pedido?`,
      product: focusProduct,
      quickActions: focusProduct ? [
        { type: 'add_to_cart', label: `🛒 Agregar ${focusProduct.name.split(' ')[0]} al Carrito`, product: focusProduct },
        { type: 'quick_checkout', label: '⚡ Coordinar Entrega en Mi Puerta', product: focusProduct }
      ] : [],
      suggestedQuestions: [
        '¿Cómo funciona el Pago Contra Entrega?',
        '¿Tienen combos con descuento?',
        'Quiero consultar las medidas'
      ]
    };
  }

  // 4. CONSULTA DE PAGO CONTRA ENTREGA / SEGURIDAD
  if (
    q.includes('pago') ||
    q.includes('contra entrega') ||
    q.includes('efectivo') ||
    q.includes('tarjeta') ||
    q.includes('transferencia') ||
    q.includes('seguro') ||
    q.includes('estafa') ||
    q.includes('confianza')
  ) {
    return {
      reply: `💵 **Máxima Seguridad: Pago Contra Entrega (Pagas al Recibir)**\n\nEn PLASTIR RD tu tranquilidad es lo primero:\n\n1. Solicitas tu orden aquí en la tienda web.\n2. Nuestro mensajero express llega a tu casa, oficina o negocio.\n3. **Abres y revisas tu producto en mano.**\n4. Una vez verificado que todo está perfecto, le pagas en efectivo al mensajero.\n\nSin tarjetas, sin depósitos adelantados y con 0% riesgo. ¿Te tomo los datos de entrega para enviarte hoy?`,
      product: focusProduct,
      quickActions: focusProduct ? [
        { type: 'quick_checkout', label: '⚡ Completar Pedido Contra Entrega', product: focusProduct }
      ] : [],
      suggestedQuestions: [
        '¿Cuánto tarda en llegar a mi sector?',
        '¿Qué artículos tienen en oferta hoy?',
        'Ver el carrito de compras'
      ]
    };
  }

  // 5. CONSULTA DE OFERTAS Y PACKS AHORRO (ESTILO AMAZON)
  if (
    q.includes('oferta') ||
    q.includes('descuento') ||
    q.includes('combo') ||
    q.includes('pack') ||
    q.includes('ahorro') ||
    q.includes('promocion')
  ) {
    const prod = focusProduct || PRODUCTS[0];
    return {
      reply: `✨ **Ofertas y Packs Ahorro Plastir RD:**\n\n¡Aprovecha nuestros precios de temporada estilo Amazon para transformar tu hogar!\n\n• **Packs Ahorro:** Disponibles en opciones de 2, 3 y hasta 7 piezas con hasta un 30% de descuento incluido.\n• **Envío Express el mismo día** en Santo Domingo.\n• **Pago Contra Entrega Seguro:** Pagas al recibir en tu puerta.\n\nPara **${prod.name}**, el precio especial es de solo **RD$ ${prod.price?.toLocaleString()}** (Precio anterior: RD$ ${prod.originalPrice?.toLocaleString()}).\n\n¿Deseas que te lo agregue al carrito o prefieres ordenar directo?`,
      product: prod,
      quickActions: [
        { type: 'open_product', label: `🛍️ Ver ${prod.name.slice(0, 22)}...`, product: prod },
        { type: 'buy_cod', label: '⚡ Comprar con Pago al Recibir', product: prod }
      ],
      suggestedQuestions: [
        '¿Cuánto tarda la entrega en mi sector?',
        '¿Tienen garantía de satisfacción?',
        'Ver organizadores de cocina'
      ]
    };
  }

  // 6. CONSULTA SOBRE EL CARRITO O LO QUE HA VISTO EL CLIENTE
  if (
    q.includes('carrito') ||
    q.includes('mi pedido') ||
    q.includes('total') ||
    q.includes('que tengo') ||
    q.includes('mis productos')
  ) {
    if (cart.length > 0) {
      const itemsList = cart.map((i) => `• ${i.name} (x${i.quantity || 1}) - RD$ ${Number(i.price * (i.quantity || 1)).toLocaleString('es-DO')}`).join('\n');
      const total = cart.reduce((sum, i) => sum + (Number(i.price || 0) * Number(i.quantity || 1)), 0);
      return {
        reply: `🛒 **Tienes ${cart.length} artículo(s) en tu carrito:**\n\n${itemsList}\n\n💰 **Total estimado:** RD$ ${total.toLocaleString('es-DO')} DOP.\n\n¿Deseas que despachemos tu pedido hoy mismo con Pago Contra Entrega?`,
        product: cart[0],
        quickActions: [
          { type: 'open_checkout', label: '🚀 Finalizar Compra Contra Entrega', product: cart[0] }
        ],
        suggestedQuestions: [
          '¿El envío es gratis o cuánto cuesta?',
          '¿Puedo agregar otro artículo?',
          '¿Cuánto tarda en llegar?'
        ]
      };
    } else if (viewedProducts.length > 0) {
      const viewedList = viewedProducts.slice(0, 3).map((p) => `• **${p.name}** (RD$ ${Number(p.price).toLocaleString('es-DO')})`).join('\n');
      return {
        reply: `👀 **Artículos que has estado explorando hoy:**\n\n${viewedList}\n\nTu carrito está vacío actualmente, pero cualquiera de estos artículos está listo para despacho inmediato. ¿Cuál de ellos te gustaría recibir en tu puerta?`,
        product: viewedProducts[0],
        quickActions: [
          { type: 'add_to_cart', label: `🛒 Agregar ${viewedProducts[0].name.split(' ')[0]}`, product: viewedProducts[0] }
        ],
        suggestedQuestions: [
          '¿Tienen descuento si llevo 2 artículos?',
          '¿Cuáles son las medidas?',
          '¿Cómo es el pago al recibir?'
        ]
      };
    }
  }

  // 7. RESPUESTA PERSONALIZADA POR PRODUCTO FOCO
  if (focusProduct) {
    return {
      reply: `¡Con gusto, ${nameGreeting}! Con respecto a **${focusProduct.name}**:\n\n• **Precio de Oferta:** RD$ ${Number(focusProduct.price).toLocaleString('es-DO')} (Antes RD$ ${Number(focusProduct.originalPrice || focusProduct.price * 1.3).toLocaleString('es-DO')})\n• **Capacidad / Tamaño:** ${focusProduct.capacity || 'Estándar'}\n• **Medidas:** ${focusProduct.dimensions || 'Verificado para el hogar'}\n• **Material:** ${focusProduct.material || '100% virgen libre de BPA'}\n\n${focusProduct.description}\n\n🔥 **Stock en almacén:** Quedan solo **${focusProduct.stockLeft || 9} unidades** disponibles para despacho hoy. ¿Te gustaría aprovechar el precio de oferta y ordenar ahora con Pago Contra Entrega?`,
      product: focusProduct,
      quickActions: [
        { type: 'add_to_cart', label: `🛒 Agregar al Carrito (RD$ ${Number(focusProduct.price).toLocaleString('es-DO')})`, product: focusProduct },
        { type: 'quick_checkout', label: '⚡ Comprar con Pago Contra Entrega', product: focusProduct }
      ],
      suggestedQuestions: [
        '¿Cuánto tarda el envío a mi sector?',
        '¿Es apto para microondas y lavavajillas?',
        '¿Tienen garantía de cambio?'
      ]
    };
  }

  // 8. SALUDO O CONSULTA GENERAL
  const viewedCount = viewedProducts.length;
  const contextNote = viewedCount > 0
    ? `He registrado que has explorado **${viewedCount} solución(es) de organización** en nuestro catálogo.`
    : 'Somos la tienda departamental especializada en organización y plásticos de alta durabilidad en RD.';

  return {
    reply: `¡Hola, ${nameGreeting}! 👋 Soy el **Asistente Inteligente de PLASTIR RD**.\n\n${contextNote}\n\nPuedo informarte en tiempo real sobre:\n• 📐 **Medidas exactas y capacidades** de recipientes y cajas.\n• 🛵 **Tiempos y costos de envío express** en tu sector.\n• 💵 **Pago Contra Entrega** (pagas al recibir en tu puerta).\n• ✨ **Packs y combos ahorro** para el hogar.\n\n¿En qué artículo o área de tu hogar te ayudo a organizar hoy?`,
    product: PRODUCTS[0],
    quickActions: [
      { type: 'add_to_cart', label: `⭐ Ver Destacado: ${PRODUCTS[0].name.split(' ')[0]}`, product: PRODUCTS[0] }
    ],
    suggestedQuestions: [
      '¿Cuáles son los productos más vendidos?',
      '¿Cuánto cuesta el envío a Santo Domingo?',
      '¿Cómo es el Pago Contra Entrega?'
    ]
  };
}
