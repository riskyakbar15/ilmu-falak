import { solarCoords } from "./solar";

const DEG = Math.PI / 180;

export type PrayerMethodId = "kemenag" | "mwl" | "isna" | "ummqura" | "egypt";
export type AsrMethod = "standard" | "hanafi";

type IshaParam =
  | { type: "angle"; value: number }
  | { type: "interval"; minutes: number };

export interface PrayerMethod {
  id: PrayerMethodId;
  name: string;
  /** Sudut depresi Matahari untuk Subuh (derajat). */
  fajrAngle: number;
  /** Parameter Isya: sudut depresi atau interval menit setelah Magrib. */
  isha: IshaParam;
}

export const PRAYER_METHODS: Record<PrayerMethodId, PrayerMethod> = {
  kemenag: {
    id: "kemenag",
    name: "Kemenag RI",
    fajrAngle: 20,
    isha: { type: "angle", value: 18 },
  },
  mwl: {
    id: "mwl",
    name: "Muslim World League",
    fajrAngle: 18,
    isha: { type: "angle", value: 17 },
  },
  isna: {
    id: "isna",
    name: "ISNA (Amerika Utara)",
    fajrAngle: 15,
    isha: { type: "angle", value: 15 },
  },
  ummqura: {
    id: "ummqura",
    name: "Umm al-Qura (Makkah)",
    fajrAngle: 18.5,
    isha: { type: "interval", minutes: 90 },
  },
  egypt: {
    id: "egypt",
    name: "Egyptian General Authority",
    fajrAngle: 19.5,
    isha: { type: "angle", value: 17.5 },
  },
};

export interface IhtiyatMinutes {
  fajr?: number;
  sunrise?: number;
  dhuhr?: number;
  asr?: number;
  maghrib?: number;
  isha?: number;
}

/** Ihtiyat default gaya Kemenag: +2 menit tiap salat, −2 menit untuk Terbit. */
export const DEFAULT_IHTIYAT: Required<IhtiyatMinutes> = {
  fajr: 2,
  sunrise: -2,
  dhuhr: 2,
  asr: 2,
  maghrib: 2,
  isha: 2,
};

export interface PrayerOptions {
  method?: PrayerMethodId;
  asr?: AsrMethod;
  /** Ihtiyat (menit): angka tunggal (seragam) atau per-waktu. */
  ihtiyat?: number | IhtiyatMinutes;
}

export interface PrayerTimes {
  fajr: Date | null;
  sunrise: Date | null;
  dhuhr: Date | null;
  asr: Date | null;
  maghrib: Date | null;
  isha: Date | null;
}

export type PrayerName = keyof PrayerTimes;

export const PRAYER_LABELS: Record<PrayerName, string> = {
  fajr: "Subuh",
  sunrise: "Terbit",
  dhuhr: "Dzuhur",
  asr: "Ashar",
  maghrib: "Magrib",
  isha: "Isya",
};

/**
 * Sudut jam (derajat) saat Matahari berada pada ketinggian `altitudeDeg`.
 * Mengembalikan null bila Matahari tak pernah mencapai ketinggian itu (kutub).
 */
function hourAngle(
  altitudeDeg: number,
  lat: number,
  decl: number,
): number | null {
  const cosH =
    (Math.sin(altitudeDeg * DEG) - Math.sin(lat * DEG) * Math.sin(decl * DEG)) /
    (Math.cos(lat * DEG) * Math.cos(decl * DEG));
  if (cosH < -1 || cosH > 1) return null;
  return Math.acos(cosH) / DEG;
}

/**
 * Waktu salat untuk suatu tanggal & lokasi. Hasil berupa Date absolut (UTC);
 * format tampilan memakai zona waktu perangkat via Intl. Metode default Kemenag RI.
 */
export function prayerTimes(
  date: Date,
  lat: number,
  lng: number,
  options: PrayerOptions = {},
): PrayerTimes {
  const method = PRAYER_METHODS[options.method ?? "kemenag"];
  const asrFactor = options.asr === "hanafi" ? 2 : 1;

  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const baseUtc = Date.UTC(year, month, day);
  const { declination: decl, eqTimeMinutes } = solarCoords(
    new Date(baseUtc + 12 * 3_600_000),
  );

  // Tengah hari Matahari (Dzuhur) dalam jam UTC.
  const dhuhrUtc = 12 - lng / 15 - eqTimeMinutes / 60;
  const at = (hours: number) => new Date(baseUtc + hours * 3_600_000);
  const fromNoon = (angleDeg: number): number | null => {
    const ha = hourAngle(angleDeg, lat, decl);
    return ha === null ? null : ha / 15;
  };

  const dhuhr = at(dhuhrUtc);

  const riseArc = fromNoon(-0.833);
  const sunrise = riseArc === null ? null : at(dhuhrUtc - riseArc);
  const maghrib = riseArc === null ? null : at(dhuhrUtc + riseArc);

  const fajrArc = fromNoon(-method.fajrAngle);
  const fajr = fajrArc === null ? null : at(dhuhrUtc - fajrArc);

  let isha: Date | null = null;
  if (method.isha.type === "interval") {
    isha = maghrib
      ? new Date(maghrib.getTime() + method.isha.minutes * 60_000)
      : null;
  } else {
    const ishaArc = fromNoon(-method.isha.value);
    isha = ishaArc === null ? null : at(dhuhrUtc + ishaArc);
  }

  // Ketinggian Matahari saat Ashar dari faktor bayangan.
  const asrAltitude =
    Math.atan(1 / (asrFactor + Math.tan(Math.abs(lat - decl) * DEG))) / DEG;
  const asrArc = fromNoon(asrAltitude);
  const asr = asrArc === null ? null : at(dhuhrUtc + asrArc);

  // Ihtiyat per-waktu: geser tiap salat sesuai menit pengamannya.
  const ih = resolveIhtiyat(options.ihtiyat);
  const shift = (d: Date | null, minutes: number) =>
    d ? new Date(d.getTime() + minutes * 60_000) : null;

  return {
    fajr: shift(fajr, ih.fajr),
    sunrise: shift(sunrise, ih.sunrise),
    dhuhr: shift(dhuhr, ih.dhuhr),
    asr: shift(asr, ih.asr),
    maghrib: shift(maghrib, ih.maghrib),
    isha: shift(isha, ih.isha),
  };
}

/** Ubah opsi ihtiyat (angka seragam atau objek) menjadi nilai per-waktu. */
function resolveIhtiyat(
  opt: number | IhtiyatMinutes | undefined,
): Required<IhtiyatMinutes> {
  if (opt === undefined) {
    return { fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 };
  }
  if (typeof opt === "number") {
    // Seragam: Terbit dikurangi agar batas akhir Subuh lebih aman.
    return {
      fajr: opt,
      sunrise: -opt,
      dhuhr: opt,
      asr: opt,
      maghrib: opt,
      isha: opt,
    };
  }
  return {
    fajr: opt.fajr ?? 0,
    sunrise: opt.sunrise ?? 0,
    dhuhr: opt.dhuhr ?? 0,
    asr: opt.asr ?? 0,
    maghrib: opt.maghrib ?? 0,
    isha: opt.isha ?? 0,
  };
}

/** Nama salat berikutnya (fardhu) setelah `now`, atau null bila sudah lewat Isya. */
export function nextPrayer(times: PrayerTimes, now: Date): PrayerName | null {
  const order: PrayerName[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
  for (const name of order) {
    const t = times[name];
    if (t && t.getTime() > now.getTime()) return name;
  }
  return null;
}
