"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Compass } from "@/components/Compass";
import { SunGuide } from "@/components/SunGuide";
import { RashdulQibla } from "@/components/RashdulQibla";
import { LocationInput } from "@/components/LocationInput";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";
import { qiblaAzimuth, haversineDistance } from "@/lib/qibla";
import { magneticDeclination } from "@/lib/declination";
import { compassRotation } from "@/lib/compass";
import { loadStoredLocation, saveStoredLocation } from "@/lib/storage";

export function QiblaClient() {
  const geo = useGeolocation();
  const orientation = useDeviceOrientation();
  const [label, setLabel] = useState<string | null>(null);
  const [source, setSource] = useState<"gps" | "manual" | null>(null);
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
          <Compass qiblaAzimuth={result.azimuth} rotation={rotation} />

          <dl className="grid w-full grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
              <dt className="text-slate-500 dark:text-slate-400">
                Jarak ke Ka&apos;bah
              </dt>
              <dd className="text-lg font-semibold">
                {Math.round(result.distance).toLocaleString("id-ID")} km
              </dd>
            </div>
            <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
              <dt className="text-slate-500 dark:text-slate-400">Lokasi</dt>
              <dd className="text-sm font-semibold">
                {label ??
                  `${position!.lat.toFixed(4)}, ${position!.lng.toFixed(4)}`}
              </dd>
            </div>
          </dl>

          {rotation === null ? (
            <p className="text-center text-sm text-amber-600 dark:text-amber-400">
              {relativeOnly
                ? "Sensor kompas perangkat tidak mengacu Utara Sejati, jadi tidak dipakai. Gunakan metode Matahari di bawah, atau arahkan sisi atas perangkat ke Utara lalu putar sesuai azimut."
                : "Kompas real-time tidak aktif. Arahkan sisi atas perangkat ke Utara Sejati, lalu putar sesuai azimut di atas."}
              {orientation.permission === "unknown" && (
                <>
                  {" "}
                  <button
                    type="button"
                    onClick={orientation.requestPermission}
                    className="font-semibold underline"
                  >
                    Aktifkan kompas
                  </button>
                </>
              )}
            </p>
          ) : (
            <p className="text-center text-xs text-slate-500 dark:text-slate-400">
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
        </div>
      ) : (
        <p className="text-center text-slate-500 dark:text-slate-400">
          Tentukan lokasi Anda untuk menghitung arah kiblat.
        </p>
      )}

      <LocationInput
        onUseGps={handleUseGps}
        onSelectLocation={handleSelect}
        status={geo.status}
        error={geo.error}
        gpsActive={source === "gps"}
      />

      <RashdulQibla />
    </div>
  );
}
