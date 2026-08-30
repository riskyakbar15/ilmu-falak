/** Koordinat resmi Ka'bah (Masjidil Haram, Makkah). */
export const KAABAH = {
  /** Lintang Ka'bah dalam derajat (utara positif). */
  lat: 21.4225,
  /** Bujur Ka'bah dalam derajat (timur positif). */
  lng: 39.8262,
} as const;

/** Radius rata-rata Bumi (model bola) dalam kilometer, IUGG mean radius R1. */
export const EARTH_RADIUS_KM = 6371;

/** Rujukan yang ditampilkan di Panel Metode & Rujukan. */
export const REFERENCES = {
  kaabahCoordinate: {
    label: "Koordinat Ka'bah 21°25′21″LU, 39°49′34″BT (21.4225, 39.8262)",
    source: "Masjidil Haram, Makkah",
  },
  method: {
    label: "Azimut awal lingkaran besar (great-circle initial bearing)",
    formula:
      "θ = atan2( sin Δλ · cos φ₂, cos φ₁ · sin φ₂ − sin φ₁ · cos φ₂ · cos Δλ )",
  },
  declination: {
    label:
      "Model WMM (World Magnetic Model) 2025 — dihitung offline di peramban",
    source: "NOAA/NCEI & British Geological Survey, via paket geomagnetism",
  },
} as const;
