const MONTHS = [
  "Muharram",
  "Safar",
  "Rabiul Awal",
  "Rabiul Akhir",
  "Jumadil Awal",
  "Jumadil Akhir",
  "Rajab",
  "Syakban",
  "Ramadan",
  "Syawal",
  "Zulkaidah",
  "Zulhijah",
] as const;

export interface HijriDate {
  day: number;
  month: number; // 1–12
  year: number;
  monthName: string;
}

const formatter = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
  day: "numeric",
  month: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * Konversi tanggal Masehi ke Hijriah (kalender Umm al-Qura).
 * Berikan Date pada tengah hari UTC dari hari lokal untuk menghindari tepi tanggal.
 */
export function toHijri(date: Date): HijriDate {
  const parts = formatter.formatToParts(date);
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value);
  const month = get("month");
  return {
    day: get("day"),
    month,
    year: get("year"),
    monthName: MONTHS[month - 1],
  };
}

/** Format Hijriah, mis. "5 Zulhijah 1446 H". */
export function formatHijri(date: Date): string {
  const h = toHijri(date);
  return `${h.day} ${h.monthName} ${h.year} H`;
}
