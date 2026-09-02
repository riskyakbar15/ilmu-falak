import { describe, it, expect } from "vitest";
import {
  prayerTimes,
  nextPrayer,
  upcomingPrayer,
  PRAYER_METHODS,
} from "./prayer";

const JAKARTA = { lat: -6.2088, lng: 106.8456 };

function wibHour(date: Date): number {
  // Jakarta = UTC+7, tanpa DST.
  return ((date.getUTCHours() + 7) % 24) + date.getUTCMinutes() / 60;
}

describe("prayerTimes", () => {
  const date = new Date("2025-06-01T00:00:00Z");
  const times = prayerTimes(date, JAKARTA.lat, JAKARTA.lng);

  it("mengembalikan keenam waktu untuk lokasi tropis", () => {
    for (const t of Object.values(times)) {
      expect(t).toBeInstanceOf(Date);
    }
  });

  it("urutan waktu benar: Subuh < Terbit < Dzuhur < Ashar < Magrib < Isya", () => {
    const seq = [
      times.fajr!,
      times.sunrise!,
      times.dhuhr!,
      times.asr!,
      times.maghrib!,
      times.isha!,
    ].map((t) => t.getTime());
    for (let i = 1; i < seq.length; i++) {
      expect(seq[i]).toBeGreaterThan(seq[i - 1]);
    }
  });

  it("terbit dan magrib simetris terhadap Dzuhur", () => {
    const before = times.dhuhr!.getTime() - times.sunrise!.getTime();
    const after = times.maghrib!.getTime() - times.dhuhr!.getTime();
    expect(Math.abs(before - after)).toBeLessThan(60_000); // < 1 menit
  });

  it("Dzuhur Jakarta berada di kisaran tengah hari (≈ 11:40–12:10 WIB)", () => {
    const h = wibHour(times.dhuhr!);
    expect(h).toBeGreaterThan(11.6);
    expect(h).toBeLessThan(12.2);
  });

  it("metode dengan sudut Subuh lebih besar menghasilkan Subuh lebih awal", () => {
    const kemenag = prayerTimes(date, JAKARTA.lat, JAKARTA.lng, {
      method: "kemenag",
    }); // 20°
    const isna = prayerTimes(date, JAKARTA.lat, JAKARTA.lng, {
      method: "isna",
    }); // 15°
    expect(kemenag.fajr!.getTime()).toBeLessThan(isna.fajr!.getTime());
  });

  it("Ashar Hanafi lebih lambat daripada standar", () => {
    const standard = prayerTimes(date, JAKARTA.lat, JAKARTA.lng, {
      asr: "standard",
    });
    const hanafi = prayerTimes(date, JAKARTA.lat, JAKARTA.lng, {
      asr: "hanafi",
    });
    expect(hanafi.asr!.getTime()).toBeGreaterThan(standard.asr!.getTime());
  });

  it("Umm al-Qura menetapkan Isya 90 menit setelah Magrib", () => {
    const t = prayerTimes(date, JAKARTA.lat, JAKARTA.lng, {
      method: "ummqura",
    });
    const diff = (t.isha!.getTime() - t.maghrib!.getTime()) / 60_000;
    expect(diff).toBeCloseTo(90, 0);
    expect(PRAYER_METHODS.ummqura.isha).toEqual({
      type: "interval",
      minutes: 90,
    });
  });

  it("ihtiyat seragam menggeser salat maju dan Terbit mundur", () => {
    const base = prayerTimes(date, JAKARTA.lat, JAKARTA.lng);
    const ih = prayerTimes(date, JAKARTA.lat, JAKARTA.lng, {
      ihtiyat: 2,
    });
    expect((ih.dhuhr!.getTime() - base.dhuhr!.getTime()) / 60_000).toBeCloseTo(
      2,
      5,
    );
    expect(
      (ih.maghrib!.getTime() - base.maghrib!.getTime()) / 60_000,
    ).toBeCloseTo(2, 5);
    expect(
      (ih.sunrise!.getTime() - base.sunrise!.getTime()) / 60_000,
    ).toBeCloseTo(-2, 5);
  });

  it("ihtiyat per-waktu menggeser tiap salat sesuai nilainya", () => {
    const base = prayerTimes(date, JAKARTA.lat, JAKARTA.lng);
    const ih = prayerTimes(date, JAKARTA.lat, JAKARTA.lng, {
      ihtiyat: { fajr: 3, maghrib: 1, sunrise: -4 },
    });
    expect((ih.fajr!.getTime() - base.fajr!.getTime()) / 60_000).toBeCloseTo(
      3,
      5,
    );
    expect(
      (ih.maghrib!.getTime() - base.maghrib!.getTime()) / 60_000,
    ).toBeCloseTo(1, 5);
    expect(
      (ih.sunrise!.getTime() - base.sunrise!.getTime()) / 60_000,
    ).toBeCloseTo(-4, 5);
    // Waktu tanpa nilai dibiarkan (0).
    expect((ih.dhuhr!.getTime() - base.dhuhr!.getTime()) / 60_000).toBeCloseTo(
      0,
      5,
    );
  });
});

describe("nextPrayer", () => {
  const times = prayerTimes(
    new Date("2025-06-01T00:00:00Z"),
    JAKARTA.lat,
    JAKARTA.lng,
  );

  it("mengembalikan salat fardhu berikutnya", () => {
    const beforeFajr = new Date(times.fajr!.getTime() - 60_000);
    expect(nextPrayer(times, beforeFajr)).toBe("fajr");

    const afterAsr = new Date(times.asr!.getTime() + 60_000);
    expect(nextPrayer(times, afterAsr)).toBe("maghrib");
  });

  it("mengembalikan null setelah Isya", () => {
    const afterIsha = new Date(times.isha!.getTime() + 60_000);
    expect(nextPrayer(times, afterIsha)).toBeNull();
  });
});

describe("upcomingPrayer", () => {
  const day = new Date("2025-06-01T00:00:00Z");
  const times = prayerTimes(day, JAKARTA.lat, JAKARTA.lng);

  it("mengembalikan salat hari ini yang belum lewat", () => {
    const afterAsr = new Date(times.asr!.getTime() + 60_000);
    const up = upcomingPrayer(day, afterAsr, JAKARTA.lat, JAKARTA.lng);
    expect(up.name).toBe("maghrib");
    expect(up.at.getTime()).toBe(times.maghrib!.getTime());
  });

  it("mengembalikan Subuh besok bila sudah lewat Isya", () => {
    const afterIsha = new Date(times.isha!.getTime() + 60_000);
    const up = upcomingPrayer(day, afterIsha, JAKARTA.lat, JAKARTA.lng);
    expect(up.name).toBe("fajr");
    expect(up.at.getTime()).toBeGreaterThan(times.isha!.getTime());
  });
});
