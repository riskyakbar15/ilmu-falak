"use client";

import { useState } from "react";
import { searchCities, type City } from "@/data/cities";
import type { FavoriteLocation } from "@/lib/favorites";

interface LocationInputProps {
  onUseGps: () => void;
  onSelectLocation: (lat: number, lng: number, label: string) => void;
  status: string;
  error: string | null;
  /** Sumber lokasi aktif saat ini. */
  source: "gps" | "manual" | null;
  /** Daftar lokasi favorit tersimpan. */
  favorites: FavoriteLocation[];
  /** Lokasi aktif saat ini (untuk tombol simpan), null bila belum ada. */
  current: { lat: number; lng: number; label: string } | null;
  /** True bila lokasi aktif sudah ada di favorit. */
  currentIsFavorite: boolean;
  onSaveFavorite: () => void;
  onSelectFavorite: (fav: FavoriteLocation) => void;
  onRemoveFavorite: (id: string) => void;
}

export function LocationInput({
  onUseGps,
  onSelectLocation,
  status,
  error,
  source,
  favorites,
  current,
  currentIsFavorite,
  onSaveFavorite,
  onSelectFavorite,
  onRemoveFavorite,
}: LocationInputProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<City[]>([]);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  function handleQuery(value: string) {
    setQuery(value);
    setResults(searchCities(value));
  }

  function pickCity(city: City) {
    onSelectLocation(city.lat, city.lng, `${city.name}, ${city.region}`);
    setQuery(`${city.name}, ${city.region}`);
    setResults([]);
  }

  function submitManual(event: React.FormEvent) {
    event.preventDefault();
    const parsedLat = Number(lat);
    const parsedLng = Number(lng);
    if (
      lat.trim() !== "" &&
      lng.trim() !== "" &&
      Number.isFinite(parsedLat) &&
      Number.isFinite(parsedLng) &&
      parsedLat >= -90 &&
      parsedLat <= 90 &&
      parsedLng >= -180 &&
      parsedLng <= 180
    ) {
      onSelectLocation(parsedLat, parsedLng, "Koordinat manual");
    }
  }

  const isLocating = status === "locating";
  const gpsMode = source === "gps";
  const manualMode = source === "manual";
  const gpsGranted = gpsMode && status === "granted";

  return (
    <div className="flex w-full flex-col gap-3">
      {(favorites.length > 0 || current) && (
        <div className="rounded-xl border border-hairline p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              Favorit
            </span>
            {current && !currentIsFavorite && (
              <button
                type="button"
                onClick={onSaveFavorite}
                className="rounded-full border border-brass px-2.5 py-0.5 text-[0.7rem] font-semibold text-brass transition hover:bg-brass/10"
              >
                <span aria-hidden>★</span> Simpan lokasi ini
              </button>
            )}
          </div>
          {favorites.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {favorites.map((fav) => {
                const active =
                  current !== null &&
                  current.lat.toFixed(4) === fav.lat.toFixed(4) &&
                  current.lng.toFixed(4) === fav.lng.toFixed(4);
                return (
                  <li
                    key={fav.id}
                    className={`flex items-center overflow-hidden rounded-full border ${
                      active ? "border-brass bg-brass/10" : "border-hairline"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onSelectFavorite(fav)}
                      aria-pressed={active}
                      className="max-w-40 truncate px-3 py-1 text-xs font-medium text-foreground transition hover:bg-brass/10"
                    >
                      {fav.label}
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveFavorite(fav.id)}
                      aria-label={`Hapus favorit ${fav.label}`}
                      className="px-2 py-1 text-muted transition hover:text-danger-text"
                    >
                      <span aria-hidden>×</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-xs text-muted">
              Belum ada. Simpan lokasi aktif untuk akses cepat.
            </p>
          )}
        </div>
      )}

      <div
        className={`rounded-xl border p-3 transition-colors ${
          gpsMode ? "border-brass bg-brass/5" : "border-hairline"
        }`}
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">
            Otomatis (GPS)
          </span>
          {gpsMode && (
            <span className="rounded-full bg-brass/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-brass">
              Aktif
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onUseGps}
          disabled={isLocating}
          aria-pressed={gpsGranted}
          className={
            gpsGranted
              ? "flex w-full items-center justify-center gap-2 rounded-lg bg-brass px-4 py-2.5 text-sm font-semibold text-on-brass shadow-sm transition"
              : "flex w-full items-center justify-center gap-2 rounded-lg border border-brass bg-surface px-4 py-2.5 text-sm font-semibold text-brass transition hover:bg-brass/10 disabled:opacity-60"
          }
        >
          {isLocating ? (
            <>
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                aria-hidden
              />
              Mencari lokasi…
            </>
          ) : gpsGranted ? (
            <>
              <svg
                viewBox="0 0 20 20"
                className="h-4 w-4"
                fill="currentColor"
                aria-hidden
              >
                <path
                  fillRule="evenodd"
                  d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.3 3.3 6.8-6.8a1 1 0 0 1 1.4 0Z"
                  clipRule="evenodd"
                />
              </svg>
              Lokasi GPS aktif
            </>
          ) : (
            "Gunakan lokasi GPS"
          )}
        </button>
        {error && (
          <p role="alert" className="mt-2 text-sm text-warning">
            {error}
          </p>
        )}
      </div>

      <div
        className={`rounded-xl border p-3 transition-colors ${
          manualMode ? "border-brass bg-brass/5" : "border-hairline"
        }`}
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">
            Manual
          </span>
          {manualMode && (
            <span className="rounded-full bg-brass/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-brass">
              Aktif
            </span>
          )}
        </div>

        <div className="relative">
          <label
            htmlFor="city-search"
            className="mb-1 block text-sm font-medium"
          >
            Cari kota
          </label>
          <input
            id="city-search"
            type="text"
            value={query}
            onChange={(e) => handleQuery(e.target.value)}
            placeholder="mis. Jakarta"
            autoComplete="off"
            spellCheck={false}
            className="w-full rounded-lg border border-hairline bg-surface px-3 py-2 text-sm"
          />
          {results.length > 0 && (
            <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-hairline bg-surface shadow-lg">
              {results.map((city) => (
                <li key={`${city.name}-${city.region}`}>
                  <button
                    type="button"
                    onClick={() => pickCity(city)}
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-brass/10"
                  >
                    <span className="font-medium">{city.name}</span>
                    <span className="text-muted"> · {city.region}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <form onSubmit={submitManual} className="mt-3 flex flex-col gap-2">
          <span className="text-sm font-medium">Atau masukkan koordinat</span>
          <div className="flex gap-2">
            <input
              aria-label="Lintang"
              type="number"
              inputMode="decimal"
              step="any"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="Lintang"
              className="w-full rounded-lg border border-hairline bg-surface px-3 py-2 text-sm tabular-nums"
            />
            <input
              aria-label="Bujur"
              type="number"
              inputMode="decimal"
              step="any"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              placeholder="Bujur"
              className="w-full rounded-lg border border-hairline bg-surface px-3 py-2 text-sm tabular-nums"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg border border-brass px-4 py-2 text-sm font-semibold text-brass transition hover:bg-brass/10"
          >
            Terapkan koordinat
          </button>
        </form>
      </div>
    </div>
  );
}
