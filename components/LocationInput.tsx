"use client";

import { useState } from "react";
import { searchCities, type City } from "@/data/cities";

interface LocationInputProps {
  onUseGps: () => void;
  onSelectLocation: (lat: number, lng: number, label: string) => void;
  status: string;
  error: string | null;
  /** True bila lokasi aktif saat ini berasal dari GPS (bukan input manual). */
  gpsActive: boolean;
}

export function LocationInput({
  onUseGps,
  onSelectLocation,
  status,
  error,
  gpsActive,
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
  const gpsGranted = gpsActive && status === "granted";

  return (
    <div className="flex w-full flex-col gap-4">
      <button
        type="button"
        onClick={onUseGps}
        disabled={isLocating}
        aria-pressed={gpsGranted}
        className={
          gpsGranted
            ? "flex items-center justify-center gap-2 rounded-lg border-2 border-emerald-600 bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition"
            : "flex items-center justify-center gap-2 rounded-lg border-2 border-emerald-600 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-60 dark:bg-slate-900 dark:text-emerald-400 dark:hover:bg-slate-800"
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
        <p role="alert" className="text-sm text-amber-600 dark:text-amber-400">
          {error}
        </p>
      )}

      <div className="relative">
        <label htmlFor="city-search" className="mb-1 block text-sm font-medium">
          Cari kota
        </label>
        <input
          id="city-search"
          type="text"
          value={query}
          onChange={(e) => handleQuery(e.target.value)}
          placeholder="mis. Jakarta"
          autoComplete="off"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
        {results.length > 0 && (
          <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
            {results.map((city) => (
              <li key={`${city.name}-${city.region}`}>
                <button
                  type="button"
                  onClick={() => pickCity(city)}
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-emerald-50 dark:hover:bg-slate-800"
                >
                  <span className="font-medium">{city.name}</span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {" "}
                    · {city.region}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form onSubmit={submitManual} className="flex flex-col gap-2">
        <span className="text-sm font-medium">Atau masukkan koordinat</span>
        <div className="flex gap-2">
          <input
            aria-label="Lintang"
            type="number"
            step="any"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="Lintang"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
          <input
            aria-label="Bujur"
            type="number"
            step="any"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            placeholder="Bujur"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-slate-800"
        >
          Terapkan koordinat
        </button>
      </form>
    </div>
  );
}
