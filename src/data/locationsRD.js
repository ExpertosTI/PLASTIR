// Directorio de Zonas de Entrega y Provincias de República Dominicana
export const DOMINICAN_ZONES = [
  {
    id: 'dn',
    name: 'Distrito Nacional (Santo Domingo Centro)',
    fee: 200,
    estimatedHours: '2 a 4 horas (Mismo día)',
    estimatedDelivery: '2 a 4 horas (Express)',
    isExpressAvailable: true,
    municipalities: [
      'Piantini', 'Naco', 'Gazcue', 'Bella Vista', 'Evaristo Morales', 
      'Los Prados', 'Zona Colonial', 'Mirador Sur / Norte', 'La Julia', 
      'El Millón', 'San Gerónimo', 'Cristo Rey', 'Ensanche La Fe', 'Villa Juana'
    ]
  },
  {
    id: 'santo_domingo_este',
    name: 'Santo Domingo Este',
    fee: 250,
    estimatedHours: '3 a 6 horas (Mismo día)',
    estimatedDelivery: 'Mismo día (3 a 6 horas)',
    isExpressAvailable: true,
    municipalities: [
      'Alma Rosa I y II', 'Ensanche Ozama', 'Lucerna', 'San Isidro', 
      'Autopista de San Isidro', 'Charles de Gaulle', 'Invivienda', 'Villa Faro', 'Los Mina'
    ]
  },
  {
    id: 'santo_domingo_oeste',
    name: 'Santo Domingo Oeste / Los Alcarrizos',
    fee: 250,
    estimatedHours: '4 a 8 horas',
    estimatedDelivery: '4 a 8 horas',
    isExpressAvailable: true,
    municipalities: [
      'Herrera', 'Bayona', 'Las Caobas', 'Alameda', 'Manoguayabo', 
      'Los Alcarrizos', 'Autopista Duarte Km 9-14'
    ]
  },
  {
    id: 'santo_domingo_norte',
    name: 'Santo Domingo Norte / Villa Mella',
    fee: 250,
    estimatedHours: '4 a 8 horas',
    estimatedDelivery: '4 a 8 horas',
    isExpressAvailable: true,
    municipalities: [
      'Villa Mella', 'Sabana Perdida', 'Harás Nacionales', 'Charles de Gaulle Norte'
    ]
  },
  {
    id: 'santiago',
    name: 'Santiago de los Caballeros',
    fee: 300,
    estimatedHours: '24 a 48 horas (Envío Express por Metro / Caribe Pack)',
    estimatedDelivery: '24 a 48 horas',
    isExpressAvailable: false,
    municipalities: [
      'Santiago Centro', 'Los Jardines', 'Cerros de Gurabo', 'Villa Olga', 
      'La Trinitaria', 'El Embrujo', 'Cienfuegos', 'Tamboril', 'Licey al Medio'
    ]
  },
  {
    id: 'la_romana',
    name: 'La Romana / Bayahibe',
    fee: 350,
    estimatedHours: '24 a 48 horas',
    estimatedDelivery: '24 a 48 horas',
    isExpressAvailable: false,
    municipalities: ['La Romana Centro', 'Buena Vista', 'Casa de Campo', 'Bayahibe', 'Guaymate']
  },
  {
    id: 'san_cristobal',
    name: 'San Cristóbal / Haina',
    fee: 300,
    estimatedHours: '24 horas',
    estimatedDelivery: '24 horas',
    isExpressAvailable: false,
    municipalities: ['San Cristóbal Centro', 'Bajos de Haina', 'Madre Vieja', 'Yaguate', 'Nigua']
  },
  {
    id: 'la_vega',
    name: 'La Vega / Jarabacoa',
    fee: 350,
    estimatedHours: '24 a 48 horas',
    estimatedDelivery: '24 a 48 horas',
    isExpressAvailable: false,
    municipalities: ['La Vega Centro', 'Jarabacoa', 'Constanza', 'Jima Abajo']
  },
  {
    id: 'puerto_plata',
    name: 'Puerto Plata / Sosúa / Cabarete',
    fee: 350,
    estimatedHours: '24 a 48 horas',
    estimatedDelivery: '24 a 48 horas',
    isExpressAvailable: false,
    municipalities: ['Puerto Plata Centro', 'Playa Dorada', 'Sosúa', 'Cabarete', 'Montellano']
  },
  {
    id: 'punta_cana',
    name: 'Punta Cana / Bávaro / Higüey',
    fee: 350,
    estimatedHours: '24 a 48 horas',
    estimatedDelivery: '24 a 48 horas',
    isExpressAvailable: false,
    municipalities: ['Bávaro', 'Punta Cana Village', 'Cap Cana', 'Higüey Centro', 'Verón', 'Friusa']
  },
  {
    id: 'resto_pais',
    name: 'Otras Provincias (Interior del País)',
    fee: 350,
    estimatedHours: '24 a 72 horas por Transporte Expreso',
    estimatedDelivery: '24 a 72 horas',
    isExpressAvailable: false,
    municipalities: [
      'San Pedro de Macorís', 'San Francisco de Macorís', 'Moca (Espaillat)', 
      'Bonao (Monseñor Nouel)', 'Baní (Peravia)', 'Azua', 'Barahona', 
      'San Juan de la Maguana', 'Samaná / Las Terrenas', 'Nagua (María T. Sánchez)',
      'Montecristi', 'Dajabón', 'Mao (Valverde)'
    ]
  }
];

export const RD_PROVINCES = DOMINICAN_ZONES;
export const RD_ZONES = DOMINICAN_ZONES;

export const getZoneByProvince = (provinceId) => {
  return DOMINICAN_ZONES.find((z) => z.id === provinceId) || DOMINICAN_ZONES[0];
};

export const getShippingCost = (provinceId) => {
  const zone = getZoneByProvince(provinceId);
  return zone ? zone.fee : 250;
};
