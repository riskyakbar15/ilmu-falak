import { KAABAH, EARTH_RADIUS_KM } from "./constants";

const toRadians = (deg: number): number => (deg * Math.PI) / 180;
const toDegrees = (rad: number): number => (rad * 180) / Math.PI;

/** Normalisasi sudut ke rentang [0, 360). */
export function normalizeDegrees(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/**
 * Azimut awal (initial bearing) lingkaran besar dari lokasi pengguna ke Ka'bah,
 * diukur searah jarum jam dari Utara Sejati. Hasil dalam derajat [0, 360).
 */
export function qiblaAzimuth(lat: number, lng: number): number {
  const phi1 = toRadians(lat);
  const phi2 = toRadians(KAABAH.lat);
  const deltaLambda = toRadians(KAABAH.lng - lng);

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

  return normalizeDegrees(toDegrees(Math.atan2(y, x)));
}

/** Jarak lingkaran besar (haversine) dari lokasi pengguna ke Ka'bah, dalam kilometer. */
export function haversineDistance(lat: number, lng: number): number {
  const phi1 = toRadians(lat);
  const phi2 = toRadians(KAABAH.lat);
  const deltaPhi = toRadians(KAABAH.lat - lat);
  const deltaLambda = toRadians(KAABAH.lng - lng);

  const a =
    Math.sin(deltaPhi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;

  return EARTH_RADIUS_KM * 2 * Math.asin(Math.min(1, Math.sqrt(a)));
}
