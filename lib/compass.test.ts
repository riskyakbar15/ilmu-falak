import { describe, it, expect } from "vitest";
import {
  compassRotation,
  turnInstruction,
  accuracyLevel,
  headingJitter,
  jitterToAccuracy,
} from "./compass";
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

describe("accuracyLevel", () => {
  it("null/undefined → unknown", () => {
    expect(accuracyLevel(null)).toBe("unknown");
    expect(accuracyLevel(undefined)).toBe("unknown");
  });

  it("negatif (tak terkalibrasi) → low", () => {
    expect(accuracyLevel(-1)).toBe("low");
  });

  it("memetakan derajat ketidakpastian ke level", () => {
    expect(accuracyLevel(5)).toBe("high");
    expect(accuracyLevel(15)).toBe("high");
    expect(accuracyLevel(25)).toBe("medium");
    expect(accuracyLevel(30)).toBe("medium");
    expect(accuracyLevel(45)).toBe("low");
  });
});

describe("headingJitter", () => {
  it("null bila sampel kurang dari 5", () => {
    expect(headingJitter([90, 90, 90, 90])).toBeNull();
  });

  it("≈ 0 untuk heading konstan", () => {
    expect(headingJitter([90, 90, 90, 90, 90, 90])).toBeCloseTo(0, 5);
  });

  it("kecil untuk sampel di sekitar 0° (wrap-around)", () => {
    const j = headingJitter([359, 0, 1, 359, 0, 1])!;
    expect(j).toBeLessThan(5);
  });

  it("besar untuk sampel yang tersebar", () => {
    const j = headingJitter([0, 60, 120, 180, 240, 300])!;
    expect(j).toBeGreaterThan(30);
  });
});

describe("jitterToAccuracy", () => {
  it("null → unknown", () => {
    expect(jitterToAccuracy(null)).toBe("unknown");
  });

  it("memetakan jitter ke level", () => {
    expect(jitterToAccuracy(3)).toBe("high");
    expect(jitterToAccuracy(10)).toBe("medium");
    expect(jitterToAccuracy(20)).toBe("low");
  });
});
