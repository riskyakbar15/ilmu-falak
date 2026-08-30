import { normalizeDegrees } from "./qibla";

/** Delapan penjuru mata angin (Bahasa Indonesia), mulai dari Utara. */
const COMPASS_POINTS = ["U", "TL", "T", "TG", "S", "BD", "B", "BL"] as const;

export interface FormattedBearing {
  /** Derajat terformat dengan simbol dan desimal koma, mis. "295,2°". */
  degrees: string;
  /** Singkatan mata angin terdekat, mis. "BL". */
  compass: string;
}

/** Format azimut menjadi derajat + arah mata angin untuk ditampilkan. */
export function formatBearing(deg: number): FormattedBearing {
  const normalized = normalizeDegrees(deg);
  const index = Math.round(normalized / 45) % COMPASS_POINTS.length;

  return {
    degrees: `${normalized.toFixed(1).replace(".", ",")}°`,
    compass: COMPASS_POINTS[index],
  };
}
