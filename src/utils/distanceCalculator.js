/**
 * Distance & Tiered Shipping Calculator based on PLASTIR RD Store Location
 * Base Location: https://maps.google.com/maps?q=18.509674072265625%2C-69.8631591796875&z=17&hl=es
 * Address: Av. San Vicente de Paúl No. 108, Los Mina, Santo Domingo Este, RD
 *
 * REGLAS TARIFARIAS MARGINALES EXACTAS:
 * - Mínimo absoluto de envío: RD$ 200
 * - Tramo 1 (0 a 10 KM): RD$ 35 / KM (10 km = RD$ 350)
 * - Tramo 2 (10 a 20 KM): +RD$ 25 / KM adicional (20 km = RD$ 600)
 * - Tramo 3 (> 20 KM): +RD$ 15 / KM adicional
 * - Redondeo OBLIGATORIO: Siempre a múltiplos exactos de RD$ 25 (200, 225, 250, 275, 300, 325...)
 */

export const MVP_STORE_LOCATION = {
  lat: 18.509674072265625,
  lng: -69.8631591796875,
  name: 'Tienda PLASTIR RD (Av. San Vicente de Paúl No. 108, Los Mina, Santo Domingo Este)',
  mapsUrl: 'https://maps.google.com/maps?q=18.509674072265625%2C-69.8631591796875&z=17&hl=es',
};
export const PLASTIR_STORE_LOCATION = MVP_STORE_LOCATION;

/**
 * Helper to round strictly to nearest multiple of RD$ 25
 */
export const roundToStep25 = (amount) => {
  return Math.round(Number(amount || 0) / 25) * 25;
};

// Common neighborhood presets in Santo Domingo & Dominican Republic with calibrated coordinates
export const NEIGHBORHOOD_PRESETS = [
  { name: 'Los Mina / San Vicente (Local)', lat: 18.5085, lng: -69.8620, approxCost: 200 },
  { name: 'Alma Rosa / Ens. Ozama', lat: 18.4912, lng: -69.8635, approxCost: 200 },
  { name: 'Invivienda / San Isidro', lat: 18.5145, lng: -69.8052, approxCost: 225 },
  { name: 'Zona Colonial / Gazcue', lat: 18.4735, lng: -69.8910, approxCost: 275 },
  { name: 'Naco / Piantini (Distrito Nacional)', lat: 18.4765, lng: -69.9320, approxCost: 325 },
  { name: 'Bella Vista / Mirador Sur', lat: 18.4485, lng: -69.9485, approxCost: 400 },
  { name: 'Villa Mella (Santo Domingo Norte)', lat: 18.5480, lng: -69.9050, approxCost: 425 },
  { name: 'Herrera / Los Alcarrizos (SDO)', lat: 18.4820, lng: -69.9850, approxCost: 500 },
  { name: 'San Cristóbal / Haina', lat: 18.4167, lng: -70.1083, approxCost: 550 },
  { name: 'Santiago de los Caballeros (24h)', lat: 19.4517, lng: -70.6970, approxCost: 350 },
  { name: 'La Romana / San Pedro (24h)', lat: 18.4273, lng: -68.9728, approxCost: 350 },
  { name: 'Punta Cana / Bávaro (24h)', lat: 18.5601, lng: -68.3725, approxCost: 400 },
];

/**
 * Extract GPS coordinates (lat, lng) from Google Maps URLs, WhatsApp location shares or raw string
 */
export const extractCoordinates = (input) => {
  if (!input || typeof input !== 'string') return null;
  let str = input.trim();
  try { str = decodeURIComponent(str); } catch {}

  // 1. Google Maps ?q=loc:lat,lng o ?q=lat,lng o ?query=lat,lng o ?center=lat,lng
  const qMatch = str.match(/[?&](?:q|query|center|ll|sll|destination|daddr)=(?:loc:)?(-?\d+\.\d+)[\s,%2C]+(-?\d+\.\d+)/i);
  if (qMatch) {
    const lat = parseFloat(qMatch[1]);
    const lng = parseFloat(qMatch[2]);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }

  // 2. Google Maps @lat,lng,zoom
  const atMatch = str.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    const lat = parseFloat(atMatch[1]);
    const lng = parseFloat(atMatch[2]);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }

  // 3. Coordenadas directas "18.5096, -69.8631" o "18.5096 -69.8631"
  const directMatch = str.match(/(-?\d{1,2}\.\d{3,15})[\s,;|/]+(-?\d{1,3}\.\d{3,15})/);
  if (directMatch) {
    const lat = parseFloat(directMatch[1]);
    const lng = parseFloat(directMatch[2]);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }

  // 4. geo:lat,lng
  const geoMatch = str.match(/^geo:(-?\d+\.\d+)[\s,%2C]+(-?\d+\.\d+)/i);
  if (geoMatch) {
    const lat = parseFloat(geoMatch[1]);
    const lng = parseFloat(geoMatch[2]);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }

  // 5. Coordenadas DMS (Grados, Minutos, Segundos)
  const dmsMatch = str.match(/(\d{1,2})[°º\s]+(\d{1,2})['′\s]+([\d.]+)?["″\s]*([NSns])[\s,]+(\d{1,3})[°º\s]+(\d{1,2})['′\s]+([\d.]+)?["″\s]*([EWOewo])/i);
  if (dmsMatch) {
    let lat = parseInt(dmsMatch[1], 10) + parseInt(dmsMatch[2], 10)/60 + (parseFloat(dmsMatch[3]) || 0)/3600;
    if (dmsMatch[4].toUpperCase() === 'S') lat = -lat;
    let lng = parseInt(dmsMatch[5], 10) + parseInt(dmsMatch[6], 10)/60 + (parseFloat(dmsMatch[7]) || 0)/3600;
    if (dmsMatch[8].toUpperCase() === 'W' || dmsMatch[8].toUpperCase() === 'O') lng = -lng;
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }

  return null;
};

/**
 * Calculate Great-Circle Distance (Haversine Formula) in KM with urban road factor
 */
export const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in KM
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightDistance = R * c;

  // Real urban road transit factor in Santo Domingo (~1.22x)
  const urbanDistance = straightDistance * 1.22;
  return {
    straightDistance: Number(straightDistance.toFixed(2)),
    urbanDistance: Number(urbanDistance.toFixed(2)),
  };
};

/**
 * Marginal Tiered Calculation Engine:
 * - 0 to 10 km: RD$ 35 / km (mínimo RD$ 200)
 * - 10 to 20 km: 350 + (km - 10) * 25
 * - > 20 km: 600 + (km - 20) * 15
 * - Rounded strictly to multiples of RD$ 25
 */
export const calculateTieredShippingCost = (distanceKm, minBaseFee = 200) => {
  const minimum = Math.max(200, Number(minBaseFee) || 200);

  let rawCost = 0;
  if (distanceKm <= 10.0) {
    rawCost = distanceKm * 35;
  } else if (distanceKm <= 20.0) {
    rawCost = (10.0 * 35) + ((distanceKm - 10.0) * 25);
  } else {
    rawCost = (10.0 * 35) + (10.0 * 25) + ((distanceKm - 20.0) * 15);
  }

  const rounded = roundToStep25(rawCost);
  return Math.max(minimum, rounded);
};

/**
 * Calculate Estimated Delivery Cost & Time from MVP Flow Store to Destination
 */
export const calculateShippingQuote = ({
  destinationInput,
  minBaseFee = 200,
  isIntercity = false,
}) => {
  const coords = extractCoordinates(destinationInput);

  if (!coords) {
    return {
      success: false,
      error: 'No se pudieron extraer las coordenadas de la ubicación pegada. Pega un enlace de Google Maps o coordenadas (ej. 18.4861, -69.9312).',
    };
  }

  const { urbanDistance } = calculateDistanceKm(
    MVP_STORE_LOCATION.lat,
    MVP_STORE_LOCATION.lng,
    coords.lat,
    coords.lng
  );

  let suggestedFee = 0;
  let estimatedTime = '';
  let tierBreakdown = '';

  // Intercity / Provincial parcel check (> 45km from Santo Domingo, e.g. Santiago, Punta Cana)
  if (urbanDistance > 45 || isIntercity) {
    suggestedFee = Math.min(450, Math.max(350, roundToStep25(350 + (urbanDistance - 45) * 0.5)));
    estimatedTime = '24 a 48 horas (Envío Provincial)';
    tierBreakdown = `Tarifa Provincial Encomienda Express (${urbanDistance} km)`;
  } else {
    suggestedFee = calculateTieredShippingCost(urbanDistance, minBaseFee);

    if (urbanDistance <= 10.0) {
      estimatedTime = '2 a 4 horas (Mismo día Express COD)';
      tierBreakdown = `Tramo 0 a 10 KM (@ RD$ 35/km, mínimo RD$ 200)`;
    } else if (urbanDistance <= 20.0) {
      estimatedTime = '2 a 4 horas (Mismo día Express COD)';
      tierBreakdown = `Tramo 10 a 20 KM (+RD$ 25/km acumulado)`;
    } else {
      estimatedTime = '3 a 5 horas (Mismo día Express COD)';
      tierBreakdown = `Tramo > 20 KM (+RD$ 15/km acumulado)`;
    }
  }

  // Google Maps directions URL from Store to Customer
  const googleRouteUrl = `https://www.google.com/maps/dir/?api=1&origin=${MVP_STORE_LOCATION.lat},${MVP_STORE_LOCATION.lng}&destination=${coords.lat},${coords.lng}&travelmode=driving`;

  return {
    success: true,
    destinationCoords: coords,
    distanceKm: urbanDistance,
    suggestedFee: suggestedFee,
    estimatedTime: estimatedTime,
    tierBreakdown: tierBreakdown,
    googleRouteUrl: googleRouteUrl,
    origin: MVP_STORE_LOCATION.name,
  };
};
