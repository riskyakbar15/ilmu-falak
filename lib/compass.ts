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

export type AccuracyLevel = "unknown" | "low" | "medium" | "high";

/**
 * Level akurasi kompas dari `webkitCompassAccuracy` (derajat ketidakpastian, iOS).
 * null/undefined → tak diketahui; negatif → tak terkalibrasi (rendah).
 */
export function accuracyLevel(
  accuracyDeg: number | null | undefined,
): AccuracyLevel {
  if (accuracyDeg === null || accuracyDeg === undefined) return "unknown";
  if (accuracyDeg < 0) return "low";
  if (accuracyDeg <= 15) return "high";
  if (accuracyDeg <= 30) return "medium";
  return "low";
}

/**
 * Deviasi sirkular (derajat) dari sampel heading — ukuran goyangan/jitter kompas.
 * Memperhitungkan wrap 0°/360°. Mengembalikan null bila sampel < 5.
 */
export function headingJitter(samples: number[]): number | null {
  if (samples.length < 5) return null;
  let sinSum = 0;
  let cosSum = 0;
  for (const deg of samples) {
    const rad = (deg * Math.PI) / 180;
    sinSum += Math.sin(rad);
    cosSum += Math.cos(rad);
  }
  const resultant =
    Math.sqrt(sinSum * sinSum + cosSum * cosSum) / samples.length;
  if (resultant >= 1) return 0;
  return (Math.sqrt(-2 * Math.log(resultant)) * 180) / Math.PI;
}

/**
 * Estimasi level akurasi dari jitter heading (heuristik Android tanpa nilai resmi).
 * null → tak diketahui.
 */
export function jitterToAccuracy(jitterDeg: number | null): AccuracyLevel {
  if (jitterDeg === null) return "unknown";
  if (jitterDeg <= 5) return "high";
  if (jitterDeg <= 12) return "medium";
  return "low";
}
