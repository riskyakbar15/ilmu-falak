import { describe, it, expect } from "vitest";
import { solarPosition, nextRashdulQibla } from "./solar";
import { KAABAH } from "./constants";

describe("solarPosition", () => {
  it("hampir tepat di atas Ka'bah saat Rashdul Qibla (27 Mei 2025, 09:18 UTC)", () => {
    const date = new Date("2025-05-27T09:18:00Z");
    const pos = solarPosition(KAABAH.lat, KAABAH.lng, date);
    expect(pos.elevation).toBeGreaterThan(80);
    expect(pos.declination).toBeCloseTo(21.3, 0);
  });

  it("Matahari di timur pada pagi hari (London, solstis Juni, 06:00 UTC)", () => {
    const pos = solarPosition(
      51.5074,
      -0.1278,
      new Date("2025-06-21T06:00:00Z"),
    );
    expect(pos.elevation).toBeGreaterThan(0);
    expect(pos.azimuth).toBeGreaterThan(40);
    expect(pos.azimuth).toBeLessThan(120);
  });

  it("Matahari di barat pada sore hari (London, solstis Juni, 18:00 UTC)", () => {
    const pos = solarPosition(
      51.5074,
      -0.1278,
      new Date("2025-06-21T18:00:00Z"),
    );
    expect(pos.elevation).toBeGreaterThan(0);
    expect(pos.azimuth).toBeGreaterThan(240);
    expect(pos.azimuth).toBeLessThan(320);
  });

  it("Matahari di bawah ufuk saat tengah malam (London, solstis Desember, 00:00 UTC)", () => {
    const pos = solarPosition(
      51.5074,
      -0.1278,
      new Date("2025-12-21T00:00:00Z"),
    );
    expect(pos.elevation).toBeLessThan(0);
  });

  it("azimut selalu dalam rentang 0–360 dan elevasi dalam −90..90", () => {
    for (let h = 0; h < 24; h += 3) {
      const pos = solarPosition(
        -6.2088,
        106.8456,
        new Date(`2025-03-21T${String(h).padStart(2, "0")}:00:00Z`),
      );
      expect(pos.azimuth).toBeGreaterThanOrEqual(0);
      expect(pos.azimuth).toBeLessThan(360);
      expect(pos.elevation).toBeGreaterThanOrEqual(-90);
      expect(pos.elevation).toBeLessThanOrEqual(90);
    }
  });
});

describe("nextRashdulQibla", () => {
  it("peristiwa pertama setelah awal tahun jatuh di akhir Mei", () => {
    const event = nextRashdulQibla(new Date("2026-01-01T00:00:00Z"));
    expect(event).not.toBeNull();
    expect(event!.date.getUTCMonth()).toBe(4); // Mei
    expect(event!.date.getUTCDate()).toBeGreaterThanOrEqual(26);
    expect(event!.date.getUTCDate()).toBeLessThanOrEqual(29);
    expect(event!.elevation).toBeGreaterThan(89.8);
  });

  it("peristiwa setelah pertengahan Juni jatuh di pertengahan Juli", () => {
    const event = nextRashdulQibla(new Date("2026-06-15T00:00:00Z"));
    expect(event).not.toBeNull();
    expect(event!.date.getUTCMonth()).toBe(6); // Juli
    expect(event!.date.getUTCDate()).toBeGreaterThanOrEqual(14);
    expect(event!.date.getUTCDate()).toBeLessThanOrEqual(17);
  });

  it("mengembalikan momen di masa depan (setelah `from`)", () => {
    const from = new Date("2026-03-01T00:00:00Z");
    const event = nextRashdulQibla(from);
    expect(event!.date.getTime()).toBeGreaterThan(from.getTime());
  });

  it("elevasi Matahari di Ka'bah pada momen itu benar-benar mendekati 90°", () => {
    const event = nextRashdulQibla(new Date("2026-01-01T00:00:00Z"))!;
    const pos = solarPosition(KAABAH.lat, KAABAH.lng, event.date);
    expect(pos.elevation).toBeGreaterThan(89.8);
  });
});
