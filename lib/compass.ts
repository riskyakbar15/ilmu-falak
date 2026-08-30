import { normalizeDegrees } from "./qibla";

/**
 * Sudut putar panah kompas (derajat, [0, 360)) agar menunjuk Arah Kiblat.
 *
 * @param heading Orientasi perangkat dari sensor, mengacu Utara Magnet.
 * @param qiblaAzimuth Azimut kiblat dari Utara Sejati.
 * @param declination Deklinasi Magnetik di lokasi (timur positif); heading
 *   magnet + deklinasi = heading terhadap Utara Sejati.
 */
export function compassRotation(
  heading: number,
  qiblaAzimuth: number,
  declination: number,
): number {
  const trueHeading = heading + declination;
  return normalizeDegrees(qiblaAzimuth - trueHeading);
}
