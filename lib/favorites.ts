export interface FavoriteLocation {
  id: string;
  lat: number;
  lng: number;
  label: string;
}

const KEY = "ilmu-falak:favorit";
const MAX = 8;

function sameSpot(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): boolean {
  return (
    a.lat.toFixed(4) === b.lat.toFixed(4) &&
    a.lng.toFixed(4) === b.lng.toFixed(4)
  );
}

function newId(): string {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID)
      return crypto.randomUUID();
  } catch {
    // Lanjut ke cadangan.
  }
  return `f-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Baca daftar lokasi favorit dari localStorage. */
export function loadFavorites(): FavoriteLocation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (f): f is FavoriteLocation =>
        typeof f === "object" &&
        f !== null &&
        typeof (f as FavoriteLocation).id === "string" &&
        typeof (f as FavoriteLocation).lat === "number" &&
        typeof (f as FavoriteLocation).lng === "number" &&
        typeof (f as FavoriteLocation).label === "string",
    );
  } catch {
    return [];
  }
}

function persist(list: FavoriteLocation[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // Abaikan bila penyimpanan penuh atau diblokir.
  }
}

/** Apakah koordinat sudah ada di daftar favorit. */
export function isFavorite(
  list: FavoriteLocation[],
  lat: number,
  lng: number,
): boolean {
  return list.some((f) => sameSpot(f, { lat, lng }));
}

/**
 * Tambah favorit baru (dedup berdasarkan koordinat, dibatasi {@link MAX}).
 * Mengembalikan daftar terbaru dan menyimpannya.
 */
export function addFavorite(
  list: FavoriteLocation[],
  entry: { lat: number; lng: number; label: string },
): FavoriteLocation[] {
  if (isFavorite(list, entry.lat, entry.lng)) return list;
  const favorite: FavoriteLocation = { id: newId(), ...entry };
  const next = [favorite, ...list].slice(0, MAX);
  persist(next);
  return next;
}

/** Hapus favorit berdasarkan id. Mengembalikan daftar terbaru dan menyimpannya. */
export function removeFavorite(
  list: FavoriteLocation[],
  id: string,
): FavoriteLocation[] {
  const next = list.filter((f) => f.id !== id);
  persist(next);
  return next;
}
