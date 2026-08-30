"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type GeolocationStatus =
  | "idle"
  | "locating"
  | "granted"
  | "denied"
  | "unavailable"
  | "error";

export interface GeoPosition {
  lat: number;
  lng: number;
  /** Akurasi horizontal dalam meter, bila tersedia. */
  accuracy: number | null;
}

export interface UseGeolocation {
  position: GeoPosition | null;
  status: GeolocationStatus;
  error: string | null;
  /** Minta lokasi sekali dan pantau perubahannya. */
  request: () => void;
  /** Setel lokasi secara manual (fallback saat GPS tak tersedia/ditolak). */
  setManual: (lat: number, lng: number) => void;
}

const options: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 15_000,
  maximumAge: 30_000,
};

export function useGeolocation(): UseGeolocation {
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [status, setStatus] = useState<GeolocationStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const watchId = useRef<number | null>(null);

  const request = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("unavailable");
      setError("Perangkat tidak mendukung geolokasi.");
      return;
    }

    setStatus("locating");
    setError(null);

    // Hentikan pantauan sebelumnya agar tidak menumpuk saat tombol ditekan berulang.
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy ?? null,
        });
        setStatus("granted");
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setStatus("denied");
          setError("Izin lokasi ditolak. Masukkan lokasi secara manual.");
        } else {
          setStatus("error");
          setError("Gagal memperoleh lokasi. Coba lagi atau isi manual.");
        }
      },
      options,
    );
  }, []);

  const setManual = useCallback((lat: number, lng: number) => {
    if (watchId.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setPosition({ lat, lng, accuracy: null });
    setStatus("granted");
    setError(null);
  }, []);

  useEffect(() => {
    return () => {
      if (watchId.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, []);

  return { position, status, error, request, setManual };
}
