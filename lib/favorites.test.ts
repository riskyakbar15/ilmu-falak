import { describe, it, expect, beforeEach } from "vitest";
import {
  loadFavorites,
  addFavorite,
  removeFavorite,
  isFavorite,
  type FavoriteLocation,
} from "./favorites";

const KEY = "ilmu-falak:favorit";

describe("favorites", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("mengembalikan daftar kosong saat belum ada data", () => {
    expect(loadFavorites()).toEqual([]);
  });

  it("menambah favorit dan menyimpannya ke localStorage", () => {
    const list = addFavorite([], { lat: -6.2, lng: 106.8, label: "Jakarta" });
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ lat: -6.2, lng: 106.8, label: "Jakarta" });
    expect(list[0].id).toBeTruthy();
    expect(loadFavorites()).toHaveLength(1);
  });

  it("menaruh favorit terbaru di depan", () => {
    let list = addFavorite([], { lat: -6.2, lng: 106.8, label: "Jakarta" });
    list = addFavorite(list, { lat: -7.8, lng: 110.4, label: "Yogyakarta" });
    expect(list[0].label).toBe("Yogyakarta");
    expect(list[1].label).toBe("Jakarta");
  });

  it("tidak menduplikasi koordinat yang sama", () => {
    let list = addFavorite([], { lat: -6.2, lng: 106.8, label: "Jakarta" });
    list = addFavorite(list, {
      lat: -6.20001,
      lng: 106.80004,
      label: "Jakarta lagi",
    });
    expect(list).toHaveLength(1);
    expect(list[0].label).toBe("Jakarta");
  });

  it("membatasi jumlah favorit maksimal 8", () => {
    let list: FavoriteLocation[] = [];
    for (let i = 0; i < 10; i++) {
      list = addFavorite(list, { lat: i, lng: i, label: `Kota ${i}` });
    }
    expect(list).toHaveLength(8);
    expect(list[0].label).toBe("Kota 9");
  });

  it("menghapus favorit berdasarkan id", () => {
    let list = addFavorite([], { lat: -6.2, lng: 106.8, label: "Jakarta" });
    const id = list[0].id;
    list = removeFavorite(list, id);
    expect(list).toHaveLength(0);
    expect(loadFavorites()).toHaveLength(0);
  });

  it("isFavorite mendeteksi koordinat tersimpan", () => {
    const list = addFavorite([], { lat: -6.2, lng: 106.8, label: "Jakarta" });
    expect(isFavorite(list, -6.2, 106.8)).toBe(true);
    expect(isFavorite(list, 0, 0)).toBe(false);
  });

  it("mengabaikan data localStorage yang rusak", () => {
    window.localStorage.setItem(KEY, "{bukan array}");
    expect(loadFavorites()).toEqual([]);
  });
});
