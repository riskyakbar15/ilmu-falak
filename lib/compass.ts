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

export interface TurnInstruction {
  /** True bila perangkat sudah menghadap kiblat dalam toleransi. */
  aligned: boolean;
  /** Arah putar perangkat agar lurus ke kiblat. */
  direction: "left" | "right" | "none";
  /** Besar sudut yang perlu diputar (derajat, dibulatkan). */
  degrees: number;
}

/**
 * Petunjuk belok dari sudut putar panah kompas. `rotation` adalah keluaran
 * `compassRotation` (posisi panah relatif atas layar). Positif = kiblat di kanan.
 */
export function turnInstruction(
  rotation: number,
  toleranceDeg = 5,
): TurnInstruction {
  const signed = rotation > 180 ? rotation - 360 : rotation;
  const magnitude = Math.abs(signed);
  if (magnitude <= toleranceDeg) {
    return { aligned: true, direction: "none", degrees: 0 };
  }
  return {
    aligned: false,
    direction: signed > 0 ? "right" : "left",
    degrees: Math.round(magnitude),
  };
}
