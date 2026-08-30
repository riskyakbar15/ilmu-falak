import { describe, it, expect } from "vitest";
import { formatBearing } from "./format";

describe("formatBearing", () => {
  it("memformat derajat dengan satu desimal dan simbol", () => {
    expect(formatBearing(295.157).degrees).toBe("295,2°");
  });

  it("memetakan arah ke mata angin 16 penjuru (Bahasa Indonesia)", () => {
    expect(formatBearing(0).compass).toBe("U");
    expect(formatBearing(90).compass).toBe("T");
    expect(formatBearing(180).compass).toBe("S");
    expect(formatBearing(270).compass).toBe("B");
    expect(formatBearing(295.16).compass).toBe("BL");
    expect(formatBearing(58.48).compass).toBe("TL");
  });

  it("membungkus 360 kembali ke Utara", () => {
    expect(formatBearing(359.99).compass).toBe("U");
  });
});
