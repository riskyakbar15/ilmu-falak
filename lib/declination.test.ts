import { describe, it, expect } from "vitest";
import { magneticDeclination } from "./declination";

// Deklinasi Magnetik dari model WMM (di-bundle offline via paket geomagnetism).
// Nilai acuan kasar dari WMM untuk epoch 2025; toleransi longgar karena hanya
// memverifikasi arah/orde besaran, bukan presisi penuh model.
describe("magneticDeclination", () => {
  const date = new Date("2025-01-01T00:00:00Z");

  it("Jakarta memiliki deklinasi kecil positif (~0.5°)", () => {
    const d = magneticDeclination(-6.2088, 106.8456, date);
    expect(d.available).toBe(true);
    expect(d.value).toBeGreaterThan(-1);
    expect(d.value).toBeLessThan(2);
  });

  it("New York memiliki deklinasi barat (negatif, ~ -13°)", () => {
    const d = magneticDeclination(40.7128, -74.006, date);
    expect(d.value).toBeLessThan(-10);
    expect(d.value).toBeGreaterThan(-16);
  });

  it("selalu menandai model tersedia dan mengembalikan angka berhingga", () => {
    const d = magneticDeclination(51.5074, -0.1278, date);
    expect(d.available).toBe(true);
    expect(Number.isFinite(d.value)).toBe(true);
  });
});
