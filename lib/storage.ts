export interface StoredLocation {
  lat: number;
  lng: number;
  label?: string;
}

const KEY = "ilmu-falak:lokasi";

/** Baca lokasi tersimpan dari localStorage (preferensi pengguna). */
export function loadStoredLocation(): StoredLocation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredLocation;
    if (typeof parsed.lat === "number" && typeof parsed.lng === "number") {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

/** Simpan lokasi ke localStorage. */
export function saveStoredLocation(location: StoredLocation): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(location));
  } catch {
    // Abaikan bila penyimpanan penuh atau diblokir.
  }
}
