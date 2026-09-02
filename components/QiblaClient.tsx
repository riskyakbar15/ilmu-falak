"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Compass } from "@/components/Compass";
import { CompassAccuracy } from "@/components/CompassAccuracy";
import { SunGuide } from "@/components/SunGuide";
import { RashdulQibla } from "@/components/RashdulQibla";
import { PrayerTimes } from "@/components/PrayerTimes";
import { LocationInput } from "@/components/LocationInput";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";
import { qiblaAzimuth, haversineDistance } from "@/lib/qibla";
import { magneticDeclination } from "@/lib/declination";
import { compassRotation, turnInstruction } from "@/lib/compass";
import { loadStoredLocation, saveStoredLocation } from "@/lib/storage";
import {
  loadFavorites,
  addFavorite,
  removeFavorite,
  isFavorite,
  type FavoriteLocation,
} from "@/lib/favorites";

export function QiblaClient() {
  const geo = useGeolocation();
  const orientation = useDeviceOrientation();
  const [label, setLabel] = useState<string | null>(null);
  const [source, setSource] = useState<"gps" | "manual" | null>(null);
  const [favorites, setFavorites] = useState<FavoriteLocation[]>([]);
  const lastSaved = useRef<string | null>(null);

  useEffect(() => {
    const stored = loadStoredLocation();
    if (stored) {
      geo.setManual(stored.lat, stored.lng);
      // Sinkronisasi satu kali dari localStorage saat mount (sumber eksternal).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLabel(stored.label ?? null);
      setSource(stored.label ? "manual" : "gps");
    }
    setFavorites(loadFavorites());
    // Hanya sekali saat mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const position = geo.position;

  const result = useMemo(() => {
    if (!position) return null;
    const azimuth = qiblaAzimuth(position.lat, position.lng);
    const distance = haversineDistance(position.lat, position.lng);
    const declination = magneticDeclination(position.lat, position.lng);
    return { azimuth, distance, declination };
  }, [position]);

  const rotation =
    result && orientation.heading !== null && orientation.absolute
      ? compassRotation(
          orientation.heading,
          result.azimuth,
          result.declination.value,
        )
      : null;

  // Sensor ada tetapi tidak mengacu utara (relatif) → jangan tampilkan kompas yang menyesatkan.
  const relativeOnly = orientation.heading !== null && !orientation.absolute;

  const hint = rotation !== null ? turnInstruction(rotation) : null;
  const wasAligned = useRef(false);

  // Getaran singkat sekali saat perangkat baru saja tepat menghadap kiblat.
  useEffect(() => {
    if (hint?.aligned && !wasAligned.current) {
      navigator.vibrate?.(60);
    }
    wasAligned.current = hint?.aligned ?? false;
  }, [hint?.aligned]);

  function handleSelect(lat: number, lng: number, nextLabel: string) {
    geo.setManual(lat, lng);
    setLabel(nextLabel);
    setSource("manual");
    saveStoredLocation({ lat, lng, label: nextLabel });
  }

  function handleUseGps() {
    setLabel(null);
    setSource("gps");
    geo.request();
  }

  const currentLabel =
    position &&
    (label ?? `${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`);
  const current = position
    ? { lat: position.lat, lng: position.lng, label: currentLabel as string }
    : null;
  const currentIsFavorite =
    position !== null && isFavorite(favorites, position.lat, position.lng);

  function handleSaveFavorite() {
    if (!current) return;
    setFavorites((prev) => addFavorite(prev, current));
  }

  function handleSelectFavorite(fav: FavoriteLocation) {
    geo.setManual(fav.lat, fav.lng);
    setLabel(fav.label);
    setSource("manual");
    saveStoredLocation({ lat: fav.lat, lng: fav.lng, label: fav.label });
  }

  function handleRemoveFavorite(id: string) {
    setFavorites((prev) => removeFavorite(prev, id));
  }

  useEffect(() => {
    if (geo.status === "granted" && position && label === null) {
      const key = `${position.lat.toFixed(5)},${position.lng.toFixed(5)}`;
      if (key !== lastSaved.current) {
        lastSaved.current = key;
        saveStoredLocation({ lat: position.lat, lng: position.lng });
      }
    }
  }, [geo.status, position, label]);

  return (
    <div className="flex w-full max-w-md flex-col gap-8">
      {result ? (
        <div className="flex flex-col items-center gap-6">
          <Compass
            qiblaAzimuth={result.azimuth}
            rotation={rotation}
            aligned={hint?.aligned ?? false}
          />

          {hint && (
            <p
              aria-live="polite"
              className={
                hint.aligned
                  ? "w-full rounded-lg bg-success-strong px-4 py-2 text-center text-sm font-semibold text-on-success"
                  : "w-full rounded-lg bg-warning-soft px-4 py-2 text-center text-sm font-semibold text-warning"
              }
            >
              {hint.aligned
                ? "\u2713 Tepat menghadap kiblat"
                : `Putar ke ${hint.direction === "right" ? "kanan" : "kiri"} ${hint.degrees}\u00b0`}
            </p>
          )}

          {rotation !== null && (
            <CompassAccuracy level={orientation.accuracyLevel} />
          )}

          <dl className="grid w-full grid-cols-2 gap-3 text-sm">
            <div className="panel p-3">
              <dt className="text-muted">Jarak ke Ka&apos;bah</dt>
              <dd className="text-lg font-semibold tabular-nums">
                {Math.round(result.distance).toLocaleString("id-ID")} km
              </dd>
            </div>
            <div className="panel p-3">
              <dt className="flex items-center justify-between gap-2 text-muted">
                Lokasi
                {source && (
                  <span className="rounded-full bg-brass/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-brass">
                    {source === "gps" ? "GPS" : "Manual"}
                  </span>
                )}
              </dt>
              <dd className="text-sm font-semibold">
                {label ??
                  `${position!.lat.toFixed(4)}, ${position!.lng.toFixed(4)}`}
              </dd>
            </div>
          </dl>

          {rotation === null ? (
            <p className="text-center text-sm text-warning">
              {relativeOnly
                ? "Sensor kompas perangkat tidak mengacu Utara Sejati, jadi tidak dipakai. Gunakan metode Matahari di bawah, atau arahkan sisi atas perangkat ke Utara lalu putar sesuai azimut."
                : "Kompas real-time tidak aktif. Arahkan sisi atas perangkat ke Utara Sejati, lalu putar sesuai azimut di atas."}
              {orientation.permission === "unknown" && (
                <>
                  {" "}
                  <button
                    type="button"
                    onClick={orientation.requestPermission}
                    className="font-semibold text-brass underline underline-offset-2"
                  >
                    Aktifkan kompas
                  </button>
                </>
              )}
            </p>
          ) : (
            <p className="text-center text-xs text-muted">
              {result.declination.available
                ? `Dikoreksi deklinasi ${result.declination.value.toFixed(1)}°.`
                : "Model deklinasi tak tersedia; menampilkan Utara Sejati tanpa koreksi."}{" "}
              Akurasi bergantung sensor perangkat.
            </p>
          )}

          <SunGuide
            lat={position!.lat}
            lng={position!.lng}
            qiblaAzimuth={result.azimuth}
          />

          <PrayerTimes lat={position!.lat} lng={position!.lng} />
        </div>
      ) : (
        <p className="panel px-4 py-8 text-center text-sm text-muted">
          Tentukan lokasi Anda untuk menghitung arah kiblat.
        </p>
      )}

      <LocationInput
        onUseGps={handleUseGps}
        onSelectLocation={handleSelect}
        status={geo.status}
        error={geo.error}
        source={source}
        favorites={favorites}
        current={current}
        currentIsFavorite={currentIsFavorite}
        onSaveFavorite={handleSaveFavorite}
        onSelectFavorite={handleSelectFavorite}
        onRemoveFavorite={handleRemoveFavorite}
      />

      <RashdulQibla />
    </div>
  );
}
