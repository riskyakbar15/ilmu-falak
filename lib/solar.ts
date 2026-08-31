import { normalizeDegrees } from "./qibla";
import { KAABAH } from "./constants";

const toRadians = (deg: number): number => (deg * Math.PI) / 180;
const toDegrees = (rad: number): number => (rad * 180) / Math.PI;
const clamp = (v: number, lo: number, hi: number): number =>
  Math.min(hi, Math.max(lo, v));

export interface SolarPosition {
  /** Azimut Matahari (derajat searah jarum jam dari Utara Sejati), [0, 360). */
  azimuth: number;
  /** Ketinggian Matahari di atas ufuk (derajat; negatif bila di bawah ufuk). */
  elevation: number;
  /** Deklinasi Matahari (derajat). */
  declination: number;
}

export interface SolarCoords {
  /** Deklinasi Matahari (derajat). */
  declination: number;
  /** Equation of time (menit). */
  eqTimeMinutes: number;
}

/** Deklinasi Matahari & equation of time untuk suatu waktu (algoritma NOAA). */
export function solarCoords(date: Date = new Date()): SolarCoords {
  const julianDay = date.getTime() / 86_400_000 + 2_440_587.5;
  const t = (julianDay - 2_451_545) / 36_525;

  const meanLong = normalizeDegrees(
    280.46646 + t * (36_000.76983 + t * 0.0003032),
  );
  const meanAnom = 357.52911 + t * (35_999.05029 - 0.0001537 * t);
  const eccent = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);

  const center =
    Math.sin(toRadians(meanAnom)) * (1.914602 - t * (0.004817 + 0.000014 * t)) +
    Math.sin(toRadians(2 * meanAnom)) * (0.019993 - 0.000101 * t) +
    Math.sin(toRadians(3 * meanAnom)) * 0.000289;

  const trueLong = meanLong + center;
  const appLong =
    trueLong - 0.00569 - 0.00478 * Math.sin(toRadians(125.04 - 1934.136 * t));

  const meanObliq =
    23 +
    (26 + (21.448 - t * (46.815 + t * (0.00059 - t * 0.001813))) / 60) / 60;
  const obliqCorr =
    meanObliq + 0.00256 * Math.cos(toRadians(125.04 - 1934.136 * t));

  const declination = toDegrees(
    Math.asin(Math.sin(toRadians(obliqCorr)) * Math.sin(toRadians(appLong))),
  );

  const y = Math.tan(toRadians(obliqCorr / 2)) ** 2;
  const eqTimeMinutes =
    4 *
    toDegrees(
      y * Math.sin(2 * toRadians(meanLong)) -
        2 * eccent * Math.sin(toRadians(meanAnom)) +
        4 *
          eccent *
          y *
          Math.sin(toRadians(meanAnom)) *
          Math.cos(2 * toRadians(meanLong)) -
        0.5 * y * y * Math.sin(4 * toRadians(meanLong)) -
        1.25 * eccent * eccent * Math.sin(2 * toRadians(meanAnom)),
    );

  return { declination, eqTimeMinutes };
}

/**
 * Posisi Matahari untuk lokasi & waktu tertentu, memakai algoritma NOAA.
 * Dihitung murni dari lat/lng + waktu (tanpa sensor) sehingga bisa jadi acuan
 * arah kiblat via bayangan/Matahari.
 */
export function solarPosition(
  lat: number,
  lng: number,
  date: Date = new Date(),
): SolarPosition {
  const { declination, eqTimeMinutes: eqTime } = solarCoords(date);

  const minutesUtc =
    date.getUTCHours() * 60 + date.getUTCMinutes() + date.getUTCSeconds() / 60;
  const trueSolarTime =
    (((minutesUtc + eqTime + 4 * lng) % 1440) + 1440) % 1440;

  let hourAngle = trueSolarTime / 4;
  hourAngle = hourAngle < 0 ? hourAngle + 180 : hourAngle - 180;

  const zenithCos =
    Math.sin(toRadians(lat)) * Math.sin(toRadians(declination)) +
    Math.cos(toRadians(lat)) *
      Math.cos(toRadians(declination)) *
      Math.cos(toRadians(hourAngle));
  const zenith = toDegrees(Math.acos(clamp(zenithCos, -1, 1)));
  const elevation = 90 - zenith;

  let azimuth: number;
  const azDenom = Math.cos(toRadians(lat)) * Math.sin(toRadians(zenith));
  if (Math.abs(azDenom) > 0.001) {
    const azRad = clamp(
      (Math.sin(toRadians(lat)) * Math.cos(toRadians(zenith)) -
        Math.sin(toRadians(declination))) /
        azDenom,
      -1,
      1,
    );
    const az = toDegrees(Math.acos(azRad));
    azimuth =
      hourAngle > 0 ? normalizeDegrees(az + 180) : normalizeDegrees(540 - az);
  } else {
    azimuth = lat > 0 ? 180 : 0;
  }

  return { azimuth, elevation, declination };
}

/** Selisih sudut kiblat relatif terhadap Matahari (derajat searah jarum jam), [0, 360). */
export function qiblaOffsetFromSun(
  qiblaAzimuth: number,
  sunAzimuth: number,
): number {
  return normalizeDegrees(qiblaAzimuth - sunAzimuth);
}

export interface RashdulEvent {
  /** Waktu Matahari tepat di atas Ka'bah (Rashdul Qibla / Istiwa A'zam). */
  date: Date;
  /** Ketinggian Matahari di Ka'bah pada momen tersebut (mendekati 90°). */
  elevation: number;
}

/**
 * Momen Rashdul Qibla berikutnya sejak `from`: saat sub-titik Matahari melewati
 * Ka'bah (elevasi ≈ 90° di Ka'bah), sehingga bayangan benda tegak di mana pun
 * menunjuk lurus menjauhi kiblat. Terjadi dua kali setahun (akhir Mei & Juli).
 */
export function nextRashdulQibla(from: Date = new Date()): RashdulEvent | null {
  const start = from.getTime();
  let best: RashdulEvent | null = null;

  for (let day = 0; day <= 400; day++) {
    // Tengah hari Matahari di Makkah berada di sekitar 09:00–10:00 UTC.
    const noonWindow = new Date(start + day * 86_400_000);
    noonWindow.setUTCHours(9, 0, 0, 0);

    let peak = { t: 0, elevation: -Infinity };
    for (let minute = 0; minute <= 60; minute++) {
      const t = noonWindow.getTime() + minute * 60_000;
      if (t < start) continue;
      const elevation = solarPosition(
        KAABAH.lat,
        KAABAH.lng,
        new Date(t),
      ).elevation;
      if (elevation > peak.elevation) peak = { t, elevation };
    }

    if (peak.elevation >= 89.8) {
      if (!best || peak.elevation > best.elevation) {
        best = { date: new Date(peak.t), elevation: peak.elevation };
      } else {
        // Elevasi puncak mulai menurun → hari peristiwa sudah ditemukan.
        return best;
      }
    } else if (best) {
      return best;
    }
  }

  return best;
}
