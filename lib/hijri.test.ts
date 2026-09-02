import { describe, it, expect } from "vitest";
import { toHijri, formatHijri } from "./hijri";

describe("toHijri", () => {
  it("mengembalikan komponen tanggal yang valid", () => {
    const h = toHijri(new Date("2025-06-01T12:00:00Z"));
    expect(h.day).toBeGreaterThanOrEqual(1);
    expect(h.day).toBeLessThanOrEqual(30);
    expect(h.month).toBeGreaterThanOrEqual(1);
    expect(h.month).toBeLessThanOrEqual(12);
    expect(h.year).toBeGreaterThan(1400);
    expect(h.monthName).toBeTruthy();
  });

  it("nama bulan konsisten dengan nomor bulan", () => {
    const names = [
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
    ];
    const h = toHijri(new Date("2025-06-01T12:00:00Z"));
    expect(h.monthName).toBe(names[h.month - 1]);
  });

  it("hari berikutnya maju satu (hari atau bulan)", () => {
    const a = toHijri(new Date("2025-06-01T12:00:00Z"));
    const b = toHijri(new Date("2025-06-02T12:00:00Z"));
    const advancedDay = b.day === a.day + 1;
    const rolledOver = b.day === 1 && b.month !== a.month;
    expect(advancedDay || rolledOver).toBe(true);
  });

  it("formatHijri berakhiran ' H' dan memuat nama bulan", () => {
    const date = new Date("2025-06-01T12:00:00Z");
    const s = formatHijri(date);
    expect(s.endsWith(" H")).toBe(true);
    expect(s).toContain(toHijri(date).monthName);
  });
});
