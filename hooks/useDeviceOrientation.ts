"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  accuracyLevel,
  jitterToAccuracy,
  headingJitter,
  type AccuracyLevel,
} from "@/lib/compass";

export type OrientationPermission =
  | "unknown"
  | "granted"
  | "denied"
  | "unsupported";

export interface UseDeviceOrientation {
  /** Heading perangkat (derajat searah jarum jam dari Utara Magnet), atau null. */
  heading: number | null;
  /** True bila heading berasal dari sensor absolut (mengacu utara), bukan relatif. */
  absolute: boolean;
  /** Ketidakpastian kompas dalam derajat (webkitCompassAccuracy, iOS); null bila tak ada. */
  accuracy: number | null;
  /** Level akurasi kompas: nilai resmi iOS bila ada, jika tidak heuristik jitter (Android). */
  accuracyLevel: AccuracyLevel;
  permission: OrientationPermission;
  /** Minta izin sensor (dibutuhkan iOS, harus dipicu gestur pengguna). */
  requestPermission: () => Promise<void>;
}

interface WebkitDeviceOrientationEvent extends DeviceOrientationEvent {
  webkitCompassHeading?: number;
  webkitCompassAccuracy?: number;
}

interface IOSDeviceOrientationEventStatic {
  requestPermission?: () => Promise<"granted" | "denied">;
}

const normalize = (deg: number): number => ((deg % 360) + 360) % 360;

/** Sudut rotasi layar saat ini (0/90/180/270) untuk mengoreksi heading. */
function getScreenAngle(): number {
  if (typeof window === "undefined") return 0;
  const angle = window.screen?.orientation?.angle;
  if (typeof angle === "number") return angle;
  const legacy = (window as unknown as { orientation?: number }).orientation;
  return typeof legacy === "number" ? legacy : 0;
}

/** Heading kompas terkompensasi kemiringan dari sudut DeviceOrientation (derajat). */
function tiltCompensatedHeading(
  alpha: number,
  beta: number,
  gamma: number,
): number {
  const rad = Math.PI / 180;
  const cY = Math.cos(gamma * rad);
  const cZ = Math.cos(alpha * rad);
  const sX = Math.sin(beta * rad);
  const sY = Math.sin(gamma * rad);
  const sZ = Math.sin(alpha * rad);
  const vx = -cZ * sY - sZ * sX * cY;
  const vy = -sZ * sY + cZ * sX * cY;
  return normalize(Math.atan2(vx, vy) / rad);
}

export function useDeviceOrientation(): UseDeviceOrientation {
  const [heading, setHeading] = useState<number | null>(null);
  const [absolute, setAbsolute] = useState(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [level, setLevel] = useState<AccuracyLevel>("unknown");
  const [permission, setPermission] =
    useState<OrientationPermission>("unknown");
  const listening = useRef(false);
  const lastEvent = useRef<DeviceOrientationEvent | null>(null);
  const absoluteSeen = useRef(false);
  const samples = useRef<number[]>([]);

  const handleEvent = useCallback((event: DeviceOrientationEvent) => {
    const screenAngle = getScreenAngle();
    const webkit = event as WebkitDeviceOrientationEvent;

    let newHeading: number | null = null;
    let isAbsolute = false;
    let rawAccuracy: number | null = null;

    const webkitHeading = webkit.webkitCompassHeading;
    if (typeof webkitHeading === "number" && !Number.isNaN(webkitHeading)) {
      newHeading = normalize(webkitHeading + screenAngle);
      isAbsolute = true;
      absoluteSeen.current = true;
      if (typeof webkit.webkitCompassAccuracy === "number") {
        rawAccuracy = webkit.webkitCompassAccuracy;
      }
    } else if (event.alpha !== null && event.alpha !== undefined) {
      const abs =
        event.type === "deviceorientationabsolute" || event.absolute === true;
      // Setelah sensor absolut tersedia, abaikan event relatif agar heading tak salah.
      if (!abs && absoluteSeen.current) return;
      if (abs) absoluteSeen.current = true;
      const base =
        typeof event.beta === "number" && typeof event.gamma === "number"
          ? tiltCompensatedHeading(event.alpha, event.beta, event.gamma)
          : 360 - event.alpha;
      newHeading = normalize(base + screenAngle);
      isAbsolute = abs;
    } else {
      return;
    }

    lastEvent.current = event;

    // Kumpulkan sampel untuk heuristik jitter (Android tanpa nilai akurasi resmi).
    const buffer = samples.current;
    buffer.push(newHeading);
    if (buffer.length > 24) buffer.shift();

    const nextLevel =
      rawAccuracy !== null
        ? accuracyLevel(rawAccuracy)
        : jitterToAccuracy(headingJitter(buffer));

    setHeading(newHeading);
    setAbsolute(isAbsolute);
    if (rawAccuracy !== null) setAccuracy(rawAccuracy);
    setLevel((prev) => (prev === nextLevel ? prev : nextLevel));
  }, []);

  // Layar bisa diputar tanpa perangkat bergerak; hitung ulang dari event terakhir.
  const handleScreenChange = useCallback(() => {
    if (lastEvent.current) handleEvent(lastEvent.current);
  }, [handleEvent]);

  const startListening = useCallback(() => {
    if (listening.current) return;
    listening.current = true;
    window.addEventListener("deviceorientationabsolute", handleEvent);
    window.addEventListener("deviceorientation", handleEvent);
    window.screen?.orientation?.addEventListener("change", handleScreenChange);
  }, [handleEvent, handleScreenChange]);

  const requestPermission = useCallback(async () => {
    if (
      typeof window === "undefined" ||
      !("DeviceOrientationEvent" in window)
    ) {
      setPermission("unsupported");
      return;
    }

    const iosApi =
      DeviceOrientationEvent as unknown as IOSDeviceOrientationEventStatic;
    if (typeof iosApi.requestPermission === "function") {
      try {
        const result = await iosApi.requestPermission();
        setPermission(result === "granted" ? "granted" : "denied");
        if (result === "granted") startListening();
      } catch {
        setPermission("denied");
      }
      return;
    }

    setPermission("granted");
    startListening();
  }, [startListening]);

  useEffect(() => {
    return () => {
      window.removeEventListener("deviceorientationabsolute", handleEvent);
      window.removeEventListener("deviceorientation", handleEvent);
      window.screen?.orientation?.removeEventListener(
        "change",
        handleScreenChange,
      );
      listening.current = false;
    };
  }, [handleEvent, handleScreenChange]);

  return {
    heading,
    absolute,
    accuracy,
    accuracyLevel: level,
    permission,
    requestPermission,
  };
}
