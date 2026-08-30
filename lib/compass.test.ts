import { describe, it, expect } from "vitest";
import { compassRotation, turnInstruction } from "./compass";
import { normalizeDegrees } from "./qibla";

// compassRotation menghitung sudut putar panah kompas relatif terhadap layar.
// Panah harus menunjuk Arah Kiblat (Utara Sejati) setelah heading perangkat
// (yang mengacu Utara Magnet) dikoreksi dengan Deklinasi Magnetik.
describe("compassRotation", () => {
  it("panah lurus ke atas saat perangkat sudah menghadap kiblat (tanpa deklinasi)", () => {
    expect(compassRotation(300, 300, 0)).toBeCloseTo(0, 6);
  });

  it("memutar berlawanan arah heading perangkat", () => {
    // Heading 90° (menghadap timur), kiblat 0° → panah berputar ke -90 (=270).
    expect(compassRotation(90, 0, 0)).toBeCloseTo(normalizeDegrees(-90), 6);
  });

  it("menerapkan koreksi deklinasi ke heading magnet", () => {
    // Heading magnet 100°, deklinasi +5° → heading sejati 105°; kiblat 105° → 0°.
    expect(compassRotation(100, 105, 5)).toBeCloseTo(0, 6);
  });

  it("selalu menghasilkan sudut dalam rentang 0–360", () => {
    for (let h = 0; h < 360; h += 45) {
      const r = compassRotation(h, 123, -7);
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThan(360);
    }
  });
});

describe("turnInstruction", () => {
  it("dianggap tepat saat dalam toleransi", () => {
    expect(turnInstruction(0).aligned).toBe(true);
    expect(turnInstruction(3).aligned).toBe(true);
    expect(turnInstruction(357).aligned).toBe(true);
  });

  it("menyuruh putar ke kanan bila kiblat searah jarum jam", () => {
    const t = turnInstruction(30);
    expect(t.aligned).toBe(false);
    expect(t.direction).toBe("right");
    expect(t.degrees).toBe(30);
  });

  it("menyuruh putar ke kiri bila kiblat berlawanan jarum jam", () => {
    const t = turnInstruction(330);
    expect(t.direction).toBe("left");
    expect(t.degrees).toBe(30);
  });

  it("memilih putaran terpendek untuk sudut > 180", () => {
    const t = turnInstruction(200);
    expect(t.direction).toBe("left");
    expect(t.degrees).toBe(160);
  });
});
