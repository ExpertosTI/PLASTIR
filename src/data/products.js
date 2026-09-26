// Catálogo Oficial de Productos de PLASTIR RD | Tienda por Departamentos (Plásticos & Organización)
export const CATEGORIES = [
  { id: 'todos', name: 'Todos los Departamentos', icon: 'Sparkles' },
  { id: 'organizacion', name: 'Organización & Clóset', icon: 'Package' },
  { id: 'cocina', name: 'Cocina & Despensa', icon: 'Flame' },
  { id: 'lavanderia', name: 'Lavandería & Baño', icon: 'Layers' },
  { id: 'mesa_hogar', name: 'Mesa, Hogar & Terraza', icon: 'Crown' },
  { id: 'industrial', name: 'Industrial & Comercial B2B', icon: 'Zap' },
  { id: 'infantil', name: 'Infantil & Bebé', icon: 'Sparkles' },
  { id: 'muebles', name: 'Muebles & Sillas', icon: 'Shirt' },
];

export const SHOWROOMS = [
  {
    id: 'showroom-1',
    name: 'Despensa & Cocina en Armonía',
    subtitle: 'Aprovecha cada centímetro con herméticos apilables, dispensadores y organizadores de acrílico libres de BPA.',
    tag: 'Cocina & Despensa',
    room: 'Cocina',
    roomImage: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1200&auto=format&fit=crop',
    bundlePrice: 3890,
    originalBundlePrice: 5100,
    discountPercent: 24,
    productIds: ['pla-001', 'pla-002', 'pla-004', 'pla-008'],
    features: [
      'Envases 100% herméticos a prueba de humedad y polillas',
      'Plásticos transparentes grado alimenticio FDA',
      'Ahorra hasta un 40% de espacio en estanterías'
    ]
  },
  {
    id: 'showroom-2',
    name: 'El Clóset Soñado & Orden Total',
    subtitle: 'Cajas con broches transparentes, gaveteros modulares y zapateras apilables que protegen tu ropa y calzado.',
    tag: 'Organización & Dormitorio',
    room: 'Clóset & Dormitorio',
    roomImage: 'https://images.unsplash.com/photo-1558997519-83ea9252def8?q=80&w=1200&auto=format&fit=crop',
    bundlePrice: 4450,
    originalBundlePrice: 5900,
    discountPercent: 25,
    productIds: ['pla-003', 'pla-005', 'pla-010'],
    features: [
      'Visibilidad 360° para encontrar tus prendas al instante',
      'Cierre con broches herméticos contra polvo y polillas',
      'Estructuras apilables de alta resistencia a carga'
    ]
  },
  {
    id: 'showroom-3',
    name: 'Lavandería & Baño Impecable',
    subtitle: 'Cestos ventilados ergonómicos, cubos con sistema exprimidor y atomizadores industriales de larga vida útil.',
    tag: 'Lavandería & Limpieza',
    room: 'Lavandería',
    roomImage: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1200&auto=format&fit=crop',
    bundlePrice: 2890,
    originalBundlePrice: 3850,
    discountPercent: 25,
    productIds: ['pla-006', 'pla-007', 'pla-009'],
    features: [
      'Plástico grueso resistente a químicos y detergentes',
      'Asas suaves anti-fatiga para transporte cómodo',
      'Drenajes y rejillas con flujo de ventilación continua'
    ]
  },
  {
    id: 'showroom-4',
    name: 'Negocio, Almacén & Hostelería',
    subtitle: 'Zafacones industriales con pedal y ruedas resistentes, cajas plásticas agrícolas y tarimas reforzadas.',
    tag: 'Industrial & Comercial B2B',
    room: 'Almacén & Negocio',
    roomImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200&auto=format&fit=crop',
    bundlePrice: 8490,
    originalBundlePrice: 11200,
    discountPercent: 24,
    productIds: ['pla-011', 'pla-012', 'pla-015'],
    features: [
      'Certificación para manipulación de residuos y alimentos',
      'Pedal metálico reforzado para apertura higiénica sin manos',
      'Resistencia a impactos pesados y rayos UV'
    ]
  }
];

export const PRODUCTS = [
  {
    id: 'pla-001',
    name: 'Set de 7 Contenedores Herméticos "Nordic Fresh" Click-Lock',
    category: 'cocina',
    department: 'Cocina & Despensa',
    tag: '🔥 MÁS VENDIDO EN DESPENSA',
    price: 1890,
    originalPrice: 2600,
    discountPercent: 27,
    rating: 5.0,
    reviewsCount: 312,
    stockLeft: 18,
    soldPercent: 88,
    isFlashDeal: true,
    flashEndHours: 3.5,
    capacity: 'Set Variado (0.5L a 1.9L)',
    dimensions: 'Módulos apilables standard',
    material: 'Polipropileno Virgen 100% • Libre de BPA • Apto Lavavajillas',
    room: 'Cocina & Despensa',
    b2bDiscount: '15% OFF desde 6 sets (Ideal para negocios de comida)',
    colors: [
      { name: 'Transparente con Broche Blanco Nórdico', hex: '#F8FAFC' },
      { name: 'Transparente con Broche Gris Grafito', hex: '#334155' },
      { name: 'Transparente con Broche Azul Plastir', hex: '#0058A3' }
    ],
    sizes: ['Set Completo 7 Piezas', 'Pack x2 Sets (14 Piezas)', 'Pack Familiar x3 Sets'],
    images: [
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'Set insignia de 7 recipientes herméticos modulares con broche click-lock de silicona médica. Mantén cereales, harinas, pastas y granos libres de humedad y plagas con diseño nórdico minimalista.',
    features: [
      'Sello 100% hermético a prueba de fugas y humedad',
      'Cuerpo acrílico ultra-transparente como el cristal pero irrompible',
      'Tapas modulares con borde de encastre para apilado vertical seguro',
      'Apto para microondas, congelador y lavavajillas'
    ],
    reviews: [
      { user: 'Carmen M. (Naco, D.N.)', rating: 5, date: 'Ayer', comment: 'Transformó por completo mi despensa. Se ven igual que las fotos de Pinterest e IKEA.' },
      { user: 'Lic. Roberto P. (Santiago)', rating: 5, date: 'Hace 3 días', comment: 'Excelente calidad del plástico, cierran super herméticos. Compré 3 sets para el restaurante.' }
    ]
  },
  {
    id: 'pla-002',
    name: 'Dispensador Giratorio 360° para Granos y Cereales (6 Compartimentos)',
    category: 'cocina',
    department: 'Cocina & Despensa',
    tag: '⚡ TENDENCIA VIRAL TIKTOK',
    price: 2490,
    originalPrice: 3400,
    discountPercent: 27,
    rating: 4.9,
    reviewsCount: 198,
    stockLeft: 9,
    soldPercent: 94,
    isFlashDeal: true,
    flashEndHours: 2.0,
    capacity: '10 Kilogramos Totales (6 divisiones)',
    dimensions: '32 x 32 x 40 cm',
    material: 'Plástico ABS Grado Alimenticio Reforzado',
    room: 'Cocina & Despensa',
    b2bDiscount: '12% OFF desde 4 unidades',
    colors: [
      { name: 'Blanco Nieve & Oro Nórdico', hex: '#FFFFFF' },
      { name: 'Gris Perla Escandinavo', hex: '#94A3B8' }
    ],
    sizes: ['Capacidad 10 KG con Taza Medidora'],
    images: [
      'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'Dispensador rotatorio inteligente con un solo toque dosificador. Almacena arroz, frijoles, avena, maíz y lentejas en un solo lugar compacto y gira con suavidad milimétrica.',
    features: [
      'Botón de dosificación automática con taza medidora con escurridor',
      'Rotación suave 360 grados sobre rodamientos sellados',
      'Tapa superior desmontable con compartimento anti-insectos para anís/laurel',
      'Ahorra hasta un 60% de espacio en el counter de tu cocina'
    ],
    reviews: [
      { user: 'Yomaira G. (Piantini)', rating: 5, date: 'Hace 2 días', comment: 'El mejor invento para no tener fundas de arroz y habichuelas tiradas en la despensa.' }
    ]
  },
  {
    id: 'pla-003',
    name: 'Caja Organizadora Modular Transparente "Plastir Heavy Duty" 65 Litros',
    category: 'organizacion',
    department: 'Organización & Clóset',
    tag: '⭐ FAVORITO DE LOS HOGARES',
    price: 990,
    originalPrice: 1450,
    discountPercent: 32,
    rating: 5.0,
    reviewsCount: 420,
    stockLeft: 45,
    soldPercent: 82,
    isFlashDeal: false,
    capacity: '65 Litros',
    dimensions: '60 x 42 x 34 cm',
    material: 'Polipropileno Copolímero Alto Impacto',
    room: 'Clóset & Dormitorio',
    b2bDiscount: 'Precio Mayorista: RD$ 790 a partir de 12 unidades',
    colors: [
      { name: 'Translúcido con Broche Azul Plastir', hex: '#0058A3' },
      { name: 'Translúcido con Broche Blanco', hex: '#F1F5F9' },
      { name: 'Translúcido con Broche Gris', hex: '#475569' }
    ],
    sizes: ['1 Unidad (65L)', 'Pack x3 Ahorro (195L Totales)', 'Bulto x6 Unidades Mayorista'],
    images: [
      'https://images.unsplash.com/photo-1558997519-83ea9252def8?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'La caja organizadora más resistente de República Dominicana. Broches ergonómicos de alta presión, tapa reforzada acanalada para soportar apilamiento de hasta 80 kg.',
    features: [
      'Base y tapa con guías de encastre anti-deslizamiento para apilar torres',
      'Broches reforzados click-secure que no se sueltan ni con caídas',
      'Asas anatómicas integradas para fácil transporte sin lastimar las manos',
      'Resistente a la humedad y hongos del clima tropical de RD'
    ],
    reviews: [
      { user: 'Ing. Darío V. (Bella Vista)', rating: 5, date: 'Ayer', comment: 'Compré 12 para organizar el depósito y el clóset. Plástico duro, nada que ver con las cajas frágiles del súper.' }
    ]
  },
  {
    id: 'pla-004',
    name: 'Gavetero Plástico Modular 4 Niveles "Nordic Tower" con Ruedas 360°',
    category: 'organizacion',
    department: 'Organización & Clóset',
    tag: '✨ DISEÑO ESCANDINAVO',
    price: 2890,
    originalPrice: 3900,
    discountPercent: 26,
    rating: 4.8,
    reviewsCount: 167,
    stockLeft: 12,
    soldPercent: 89,
    isFlashDeal: true,
    flashEndHours: 4.0,
    capacity: '80 Litros Distribuidos',
    dimensions: '40 x 32 x 85 cm',
    material: 'Polipropileno Virgen Libre de Olores',
    room: 'Clóset & Dormitorio',
    b2bDiscount: '10% OFF a partir de 3 unidades',
    colors: [
      { name: 'Blanco Nórdico Minimalista', hex: '#FFFFFF' },
      { name: 'Gris Ceniza Moderno', hex: '#64748B' },
      { name: 'Pastel Mint Suave', hex: '#A7F3D0' }
    ],
    sizes: ['4 Niveles (85 cm)', '5 Niveles Torre Alta (105 cm)'],
    images: [
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1558997519-83ea9252def8?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'Gavetero versátil multiusos de alta capacidad con 4 cajones deslizantes suaves, top superior reforzado y ruedas ocultas para moverlo sin esfuerzo al limpiar.',
    features: [
      'Cajones con tope de seguridad anti-caída',
      'Top superior plano con reborde para colocar accesorios o decoraciones',
      'Ruedas silenciosas que no rayan porcelanato ni madera',
      'Estructura modular: puedes agregar o quitar niveles fácilmente'
    ],
    reviews: [
      { user: 'Paola S. (San Isidro)', rating: 5, date: 'Hace 4 días', comment: 'Armado en 2 minutos sin herramientas. El acabado es impecable, super elegante.' }
    ]
  },
  {
    id: 'pla-005',
    name: 'Set x6 Cajas Zapateras Magnéticas Apilables "Drop Box Clear"',
    category: 'organizacion',
    department: 'Organización & Clóset',
    tag: '👟 TENDENCIA SNEAKERHEAD',
    price: 2190,
    originalPrice: 3200,
    discountPercent: 31,
    rating: 4.9,
    reviewsCount: 284,
    stockLeft: 15,
    soldPercent: 91,
    isFlashDeal: true,
    flashEndHours: 5.0,
    capacity: 'Capacidad hasta talla 46 (12 US)',
    dimensions: '36 x 28 x 22 cm cada caja',
    material: 'Acrílico PET Transparente + Marco PP Extra Rígido',
    room: 'Clóset & Dormitorio',
    b2bDiscount: '15% OFF desde 4 sets (24 cajas)',
    colors: [
      { name: 'Transparente Cristal 100%', hex: '#FFFFFF' },
      { name: 'Ahumado Black Smoke', hex: '#1E293B' }
    ],
    sizes: ['Pack x6 Cajas', 'Pack x12 Cajas Pared Completa'],
    images: [
      'https://images.unsplash.com/photo-1558997519-83ea9252def8?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'El organizador definitivo para calzado. Puerta frontal abatible con cierre magnético y ventilación trasera anti-olores. Convierte tu colección de calzado en una galería.',
    features: [
      'Puerta frontal magnética de apertura instantánea con una sola mano',
      'Encastre superior y lateral patentado: apila hasta 15 cajas sin tambalearse',
      'Orificios traseros de micro-ventilación que evitan humedad y malos olores',
      'Plástico transparente anti-amarilleo UV'
    ],
    reviews: [
      { user: 'Miguel A. (Gazcue)', rating: 5, date: 'Ayer', comment: 'Mis Jordan ahora lucen como vitrina de tienda. Calidad insuperable.' }
    ]
  },
  {
    id: 'pla-006',
    name: 'Cesto de Ropa Ergonómico Ventilado "AeroClean" 60 Litros',
    category: 'lavanderia',
    department: 'Lavandería & Baño',
    tag: '🧺 BÁSICO DEL HOGAR',
    price: 890,
    originalPrice: 1250,
    discountPercent: 29,
    rating: 4.8,
    reviewsCount: 240,
    stockLeft: 30,
    soldPercent: 85,
    isFlashDeal: false,
    capacity: '60 Litros',
    dimensions: '44 x 35 x 58 cm',
    material: 'Polipropileno Flexible Ultra-Resistente',
    room: 'Lavandería',
    b2bDiscount: 'Precio Mayorista: RD$ 690 a partir de 10 unidades',
    colors: [
      { name: 'Blanco Nórdico', hex: '#F8FAFC' },
      { name: 'Gris Carbón', hex: '#334155' },
      { name: 'Azul Real Plastir', hex: '#0058A3' }
    ],
    sizes: ['Capacidad Estándar 60L', 'Pack x2 Cestos (Ropa Clara / Ropa Oscura)'],
    images: [
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'Cesto de ropa de gran capacidad con diseño de rombos micro-ventilados que previenen olores por sudor o humedad. Asas suaves engomadas para traslado fácil.',
    features: [
      'Malla de ventilación 360 grados que previene moho y hongos',
      'Asas dobles con textura anatómica para cargar con peso sin dolor',
      'Estructura elástica indeformable: soporta flexión sin quebrarse',
      'Base sólida que evita que el agua del suelo moje la ropa'
    ],
    reviews: [
      { user: 'Sonia T. (La Romana)', rating: 5, date: 'Hace 5 días', comment: 'Muy espacioso, caben las sábanas y toallas de la semana entera sin doblarse.' }
    ]
  },
  {
    id: 'pla-007',
    name: 'Balde Profesional 20 Litros con Exprimidor de Mopa Reforzado',
    category: 'lavanderia',
    department: 'Lavandería & Baño',
    tag: '⚡ USO RUDO & DOMÉSTICO',
    price: 1150,
    originalPrice: 1650,
    discountPercent: 30,
    rating: 4.9,
    reviewsCount: 180,
    stockLeft: 22,
    soldPercent: 87,
    isFlashDeal: false,
    capacity: '20 Litros con Escala Graduada',
    dimensions: '38 x 30 x 36 cm',
    material: 'Plástico Polímero Virgen Antigolpes',
    room: 'Lavandería',
    b2bDiscount: 'Precio Especial Empresas: RD$ 890 a partir de 6 unidades',
    colors: [
      { name: 'Azul Plastir Industrial', hex: '#0058A3' },
      { name: 'Gris Titanio', hex: '#475569' }
    ],
    sizes: ['Balde 20L + Exprimidor Removible'],
    images: [
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'Cubo de limpieza con sistema exprimidor de alta torsión que reduce el esfuerzo en un 50%. Asa metálica con empuñadura plástica ergonómica y vertedor de agua anti-salpicaduras.',
    features: [
      'Exprimidor desmontable compatible con todo tipo de trapeadores y mopas',
      'Pico vertedor curvo para desagüe limpio sin salpicar el piso',
      'Graduación interna de litros para dosificación exacta de desinfectantes',
      'Resistente al cloro puro y productos químicos abrasivos'
    ],
    reviews: [
      { user: 'Marcos R. (Herrera)', rating: 5, date: 'Hace 1 semana', comment: 'El exprimidor es fuerte de verdad, no se pandea como otros baldes baratos.' }
    ]
  },
  {
    id: 'pla-008',
    name: 'Jarra Plástica Graduada 2.5 Litros con Tapa Hermética Antigoteo',
    category: 'mesa_hogar',
    department: 'Mesa, Hogar & Terraza',
    tag: '🧊 VERANO & FAMILIA',
    price: 450,
    originalPrice: 650,
    discountPercent: 31,
    rating: 5.0,
    reviewsCount: 310,
    stockLeft: 40,
    soldPercent: 80,
    isFlashDeal: false,
    capacity: '2.5 Litros',
    dimensions: '18 x 12 x 26 cm',
    material: 'Acrílico SAN Grado Alimenticio • BPA Free',
    room: 'Cocina & Despensa',
    b2bDiscount: 'Pack Familiar x3 Jarras por RD$ 1,190',
    colors: [
      { name: 'Transparente con Tapa Blanca', hex: '#F8FAFC' },
      { name: 'Transparente con Tapa Azul Océano', hex: '#0284C7' },
      { name: 'Transparente con Tapa Verde Esmeralda', hex: '#10B981' }
    ],
    sizes: ['1 Unidad (2.5L)', 'Pack x3 Jarras Multiuso'],
    images: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'Jarra premium transparente con medida lateral en mililitros y onzas. Diseñada para caber perfectamente en la puerta de la nevera. Tapa giratoria con posición de colado para jugos naturales.',
    features: [
      'Perfil delgado optimizado para la puerta lateral del refrigerador',
      'Tapa de 3 posiciones: Abierto completo, colador de pulpa/hielo, y cerrado hermético',
      'Asa ergonómica antideslizante con agarre seguro incluso con manos mojadas',
      'Soporta líquidos fríos y tibios sin agrietarse'
    ],
    reviews: [
      { user: 'Elena C. (Los Prados)', rating: 5, date: 'Hace 3 días', comment: 'Excelente para té frío y jugos. Cabe exacta en la nevera y no derrama nada.' }
    ]
  },
  {
    id: 'pla-009',
    name: 'Set de 8 Vasos Irrompibles Texturizados "Brisa Marina" 450ml',
    category: 'mesa_hogar',
    department: 'Mesa, Hogar & Terraza',
    tag: '🥂 IRROMPIBLE & ELEGANTE',
    price: 890,
    originalPrice: 1350,
    discountPercent: 34,
    rating: 4.9,
    reviewsCount: 155,
    stockLeft: 25,
    soldPercent: 88,
    isFlashDeal: true,
    flashEndHours: 6.0,
    capacity: '450 ml (15 oz)',
    dimensions: 'Altura 14 cm, Boca 8.5 cm',
    material: 'Policarbonato Alimenticio Libre de BPA',
    room: 'Cocina & Mesa',
    b2bDiscount: 'Descuento para Piscinas y Hoteles: RD$ 690 desde 6 sets',
    colors: [
      { name: 'Cristal Transparente', hex: '#FFFFFF' },
      { name: 'Turquesa Caribeño', hex: '#06B6D4' },
      { name: 'Ámbar Cálido', hex: '#F59E0B' }
    ],
    sizes: ['Set de 8 Vasos', 'Set de 16 Vasos para Eventos'],
    images: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'La elegancia del cristal con la seguridad del polímero irrompible. Perfectos para el día a día, terrazas, piscinas y hogares con niños. No se rayan ni pierden brillo en el lavaplatos.',
    features: [
      '100% irrompibles ante caídas sobre pisos duros o terrazas',
      'Textura exterior facetada con agarre seguro antideslizante',
      'Apilables de forma cónica sin quedarse atascados',
      'Libres de BPA y no alteran el sabor de las bebidas'
    ],
    reviews: [
      { user: 'Valeria M. (Punta Cana)', rating: 5, date: 'Ayer', comment: 'Ideales para la terraza y piscina. Parecen cristal fino pero no se rompen.' }
    ]
  },
  {
    id: 'pla-010',
    name: 'Gavetero Infantil "Joyful Kids" 4 Cajones Pastel con Manijas Soft',
    category: 'infantil',
    department: 'Infantil & Bebé',
    tag: '👶 DORMITORIO INFANTIL',
    price: 3290,
    originalPrice: 4500,
    discountPercent: 27,
    rating: 5.0,
    reviewsCount: 130,
    stockLeft: 8,
    soldPercent: 92,
    isFlashDeal: false,
    capacity: '90 Litros de Almacenamiento',
    dimensions: '42 x 34 x 88 cm',
    material: 'Polipropileno Grado Médico Libre de Toxinas',
    room: 'Infantil & Bebé',
    b2bDiscount: '10% OFF para Colegios y Guarderías',
    colors: [
      { name: 'Multicolor Pastel (Rosa, Menta, Celeste, Vainilla)', hex: '#FDE047' },
      { name: 'Blanco Nórdico & Madera Soft', hex: '#F3F4F6' }
    ],
    sizes: ['4 Cajones con Ruedas'],
    images: [
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1558997519-83ea9252def8?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'El mueble ideal para ropa de bebé, juguetes y útiles escolares. Esquinas totalmente redondeadas sin bordes filosos y cajones ligeros para que los pequeños aprendan a ordenar.',
    features: [
      'Bordes 100% curvados anti-golpes infantiles',
      'Plástico virgen atóxico sin olor ni plomo',
      'Cajones con tope de retención que evitan que se salgan al abrir',
      'Fácil de limpiar con un paño húmedo'
    ],
    reviews: [
      { user: 'Patricia D. (Gazcue)', rating: 5, date: 'Hace 4 días', comment: 'Precioso para la habitación de mi niña. Todos los juguetes quedaron ordenados.' }
    ]
  },
  {
    id: 'pla-011',
    name: 'Zafacón Industrial con Pedal y Ruedas Heavy Duty 120 Litros',
    category: 'industrial',
    department: 'Industrial & Comercial B2B',
    tag: '🏭 COMERCIAL & EMPRESARIAL',
    price: 4890,
    originalPrice: 6500,
    discountPercent: 25,
    rating: 5.0,
    reviewsCount: 95,
    stockLeft: 14,
    soldPercent: 88,
    isFlashDeal: false,
    capacity: '120 Litros',
    dimensions: '55 x 48 x 93 cm',
    material: 'Polietileno de Alta Densidad (HDPE) con Protección UV',
    room: 'Almacén & Negocio',
    b2bDiscount: 'Precio Mayorista: RD$ 4,190 a partir de 4 unidades (Factura Fiscal B01)',
    colors: [
      { name: 'Gris Oscuro Industrial con Pedal', hex: '#1E293B' },
      { name: 'Azul Reciclaje Plastir', hex: '#0058A3' },
      { name: 'Verde Orgánico', hex: '#166534' }
    ],
    sizes: ['120 Litros con Pedal y Ruedas', '80 Litros Compacto', '50 Litros Interior'],
    images: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1558997519-83ea9252def8?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'Contenedor de basura industrial para restaurantes, clínicas, condominios y empresas. Pedal mecánico reforzado para apertura higiénica sin tocar la tapa y ruedas de goma maciza para transporte suave.',
    features: [
      'Pedal ultra-resistente probado para más de 100,000 aperturas',
      'Ruedas macizas de 200 mm que no se pinchan y suben aceras',
      'Tapa hermética con labio de cierre anti-olores e insectos',
      'Cumple normativas de sanidad y gestión ambiental en RD'
    ],
    reviews: [
      { user: 'Ing. Gustavo B. (Parque Industrial Haina)', rating: 5, date: 'Hace 3 días', comment: 'Compramos 10 para la nave industrial. Excelente grosor del plástico y el pedal aguanta trato rudo.' }
    ]
  },
  {
    id: 'pla-012',
    name: 'Caja Plástica Agrícola y Almacén Perforada Apilable 50kg',
    category: 'industrial',
    department: 'Industrial & Comercial B2B',
    tag: '📦 CARGA PESADA & LOGÍSTICA',
    price: 650,
    originalPrice: 950,
    discountPercent: 32,
    rating: 4.9,
    reviewsCount: 310,
    stockLeft: 120,
    soldPercent: 78,
    isFlashDeal: false,
    capacity: '50 Kilogramos de Carga',
    dimensions: '60 x 40 x 31 cm',
    material: 'Polipropileno Alto Impacto con Nervaduras Reforzadas',
    room: 'Almacén & Negocio',
    b2bDiscount: 'RD$ 520 por docena / RD$ 480 por bulto de 50+',
    colors: [
      { name: 'Azul Industrial Plastir', hex: '#0058A3' },
      { name: 'Rojo Carga', hex: '#DC2626' },
      { name: 'Negro Reciclado Eco', hex: '#0F172A' }
    ],
    sizes: ['1 Unidad', 'Pack x6 Cajas', 'Tarima x30 Cajas Mayorista'],
    images: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1558997519-83ea9252def8?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'La caja estándar de distribución y almacenamiento para colmados, supermercados, agropecuarias y almacenes. Apilamiento vertical seguro con nervaduras de refuerzo continuo.',
    features: [
      'Ventilación lateral y de fondo para conservación de frutas y víveres',
      'Asas integradas en los cuatro costados para manipulación ágil',
      'Resistencia a compresión: soporta torres de hasta 8 cajas llenas',
      'Fácilmente lavable con hidrolavadora a presión'
    ],
    reviews: [
      { user: 'Félix N. (Merca Santo Domingo)', rating: 5, date: 'Hace 1 semana', comment: 'El mejor precio del mercado y aguantan peso de verdad. Cliente fijo de Plastir.' }
    ]
  },
  {
    id: 'pla-013',
    name: 'Silla Plástica Monoblock Ergonómica Reforzada "Nordic Comfort"',
    category: 'muebles',
    department: 'Muebles & Sillas',
    tag: '🪑 RESISTENCIA 150 KG',
    price: 850,
    originalPrice: 1200,
    discountPercent: 29,
    rating: 4.8,
    reviewsCount: 190,
    stockLeft: 60,
    soldPercent: 82,
    isFlashDeal: false,
    capacity: 'Soporta hasta 150 kg',
    dimensions: '54 x 52 x 82 cm (Altura asiento 44 cm)',
    material: 'Polipropileno Virgen con Filtro UV Solar',
    room: 'Terraza & Comedor',
    b2bDiscount: 'Precio Mayorista Eventos: RD$ 690 a partir de 20 sillas',
    colors: [
      { name: 'Blanco Puro', hex: '#FFFFFF' },
      { name: 'Negro Grafito', hex: '#1E293B' },
      { name: 'Azul Marino Plastir', hex: '#003E75' }
    ],
    sizes: ['1 Silla', 'Pack x4 Sillas Comedor', 'Pack x10 Sillas Eventos'],
    images: [
      'https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'Silla plástica inyectada de una sola pieza con respaldo anatómico transpirable y patas reforzadas con topes antideslizantes. Ideal para terrazas, restaurantes, patios y eventos.',
    features: [
      'Inyección monoblock de una pieza: sin tornillos que se aflojen',
      'Tratamiento anti-UV: no se decolora ni se vuelve quebradiza con el sol caribeño',
      'Apilable hasta 25 unidades ocupando el mínimo espacio',
      'Certificada para uso comercial intensivo y residencial'
    ],
    reviews: [
      { user: 'Lic. Andrés K. (Boca Chica)', rating: 5, date: 'Hace 5 días', comment: 'Compré 40 para la terraza del restaurante. Cómodas, resistentes y fáciles de apilar.' }
    ]
  },
  {
    id: 'pla-014',
    name: 'Mesa Plástica Desmontable Cuadrada 80x80cm "Baviera"',
    category: 'muebles',
    department: 'Muebles & Sillas',
    tag: '☀️ TERRAZA & EXTERIOR',
    price: 1990,
    originalPrice: 2800,
    discountPercent: 29,
    rating: 4.9,
    reviewsCount: 110,
    stockLeft: 20,
    soldPercent: 85,
    isFlashDeal: false,
    capacity: '4 Personas (Soporta 80 kg)',
    dimensions: '80 x 80 x 74 cm',
    material: 'Polímero de Alta Resistencia con Orificio para Sombrilla',
    room: 'Terraza & Comedor',
    b2bDiscount: '12% OFF en Combo con 4 Sillas',
    colors: [
      { name: 'Blanco Nórdico', hex: '#FFFFFF' },
      { name: 'Negro Carbón', hex: '#0F172A' }
    ],
    sizes: ['Mesa 80x80cm (4 Puestos)', 'Combo Mesa + 4 Sillas Nordic'],
    images: [
      'https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'Mesa exterior práctica con orificio central para sombrilla o parasol. Patas desmontables a presión sin herramientas para guardarla en cualquier rincón cuando no se use.',
    features: [
      'Orificio central estándar de 40mm con tapón para sombrilla',
      'Patas con tapones niveladores que evitan tambaleos en pisos irregulares',
      'Textura semi-mate fácil de limpiar que repele grasa y líquidos',
      'Montaje y desmontaje en menos de 1 minuto'
    ],
    reviews: [
      { user: 'Clara S. (Santiago)', rating: 5, date: 'Hace 2 días', comment: 'Firme y muy linda. La tengo en el patio con las 4 sillas y ha llovido bastante sin afectarle nada.' }
    ]
  },
  {
    id: 'pla-015',
    name: 'Caja Organizadora Bajo Cama con Ruedas 50 Litros "UnderBed Slim"',
    category: 'organizacion',
    department: 'Organización & Clóset',
    tag: '🛏️ MAXIMIZA ESPACIO',
    price: 1290,
    originalPrice: 1850,
    discountPercent: 30,
    rating: 4.9,
    reviewsCount: 220,
    stockLeft: 26,
    soldPercent: 87,
    isFlashDeal: true,
    flashEndHours: 4.5,
    capacity: '50 Litros',
    dimensions: '80 x 45 x 18 cm (Perfil Slim)',
    material: 'Polipropileno Transparente de Alta Durabilidad',
    room: 'Clóset & Dormitorio',
    b2bDiscount: 'Pack x2 Cajas Bajo Cama por RD$ 2,290',
    colors: [
      { name: 'Transparente con Ruedas Blancas', hex: '#F1F5F9' },
      { name: 'Transparente con Ruedas Azul Plastir', hex: '#0058A3' }
    ],
    sizes: ['1 Unidad (50L)', 'Pack Doble x2 (100L Totales)'],
    images: [
      'https://images.unsplash.com/photo-1558997519-83ea9252def8?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'Aprovecha el espacio muerto debajo de tu cama para almacenar sábanas, edredones, toallas o ropa de otra temporada. Ruedas multidireccionales y tapa con apertura bipartida.',
    features: [
      'Tapa con bisagra central: ábrela sin tener que sacar toda la caja de la cama',
      'Ruedas de deslizamiento suave para deslizar sin rayar el piso',
      'Perfil bajo de solo 18 cm de alto: cabe bajo casi cualquier marco de cama',
      'Sellado hermético contra polvo del suelo'
    ],
    reviews: [
      { user: 'Mercedes V. (Bella Vista)', rating: 5, date: 'Hace 3 días', comment: 'El invento del siglo para apartamentos pequeños. Entré 4 edredones y cabe perfecto bajo la cama.' }
    ]
  }
];

export const ALL_PRODUCTS = PRODUCTS;
