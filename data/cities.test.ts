import { describe, it, expect } from "vitest";
import { searchCities, CITIES } from "./cities";

describe("searchCities", () => {
  it("mengembalikan kosong untuk kueri kosong", () => {
    expect(searchCities("")).toEqual([]);
    expect(searchCities("   ")).toEqual([]);
  });

  it("mencari berdasarkan nama tanpa peduli huruf besar/kecil", () => {
    const hasil = searchCities("jakarta");
    expect(hasil[0]?.name).toBe("Jakarta");
  });

  it("mencari berdasarkan wilayah", () => {
    const hasil = searchCities("Jawa Timur");
    expect(hasil.some((c) => c.name === "Surabaya")).toBe(true);
  });

  it("membatasi jumlah hasil", () => {
    expect(searchCities("a", 3).length).toBeLessThanOrEqual(3);
  });

  it("semua kota memiliki koordinat valid", () => {
    for (const c of CITIES) {
      expect(c.lat).toBeGreaterThanOrEqual(-90);
      expect(c.lat).toBeLessThanOrEqual(90);
      expect(c.lng).toBeGreaterThanOrEqual(-180);
      expect(c.lng).toBeLessThanOrEqual(180);
    }
  });
});
