/**
 * Helpers para generar enlaces universales a apps de mapas nativas.
 *
 * Usamos las "Universal URLs" de Google Maps: en móvil abren la app de
 * Google Maps precargada (si está instalada), y en desktop/iOS sin la app
 * caen a la versión web. No requieren API key.
 */

/**
 * URL de navegación ("Cómo llegar") con la ruta completa del viaje
 * precargada: origen (pickup) → destino, en modo conducción.
 *
 * Al fijar `origin`, Google Maps muestra la ruta del envío completa en vez de
 * usar el GPS del dispositivo como punto de partida.
 *
 * @param originLat Latitud del origen (pickup)
 * @param originLng Longitud del origen (pickup)
 * @param destLat Latitud del destino
 * @param destLng Longitud del destino
 */
export function getDirectionsUrl(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number,
): string {
  return `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}&travelmode=driving`;
}

/**
 * URL para ver un punto (pin) en el mapa, sin iniciar navegación.
 *
 * @param lat Latitud del punto
 * @param lng Longitud del punto
 */
export function getLocationUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}
