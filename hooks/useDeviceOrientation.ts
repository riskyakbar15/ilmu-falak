"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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
  permission: OrientationPermission;
  /** Minta izin sensor (dibutuhkan iOS, harus dipicu gestur pengguna). */
  requestPermission: () => Promise<void>;
}

interface WebkitDeviceOrientationEvent extends DeviceOrientationEvent {
  webkitCompassHeading?: number;
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
  const [permission, setPermission] =
    useState<OrientationPermission>("unknown");
  const listening = useRef(false);
  const lastEvent = useRef<DeviceOrientationEvent | null>(null);
  const absoluteSeen = useRef(false);

  const handleEvent = useCallback((event: DeviceOrientationEvent) => {
    const screenAngle = getScreenAngle();

    const webkitHeading = (event as WebkitDeviceOrientationEvent)
      .webkitCompassHeading;
    if (typeof webkitHeading === "number" && !Number.isNaN(webkitHeading)) {
      absoluteSeen.current = true;
      lastEvent.current = event;
      setHeading(normalize(webkitHeading + screenAngle));
      setAbsolute(true);
      return;
    }

    if (event.alpha !== null && event.alpha !== undefined) {
      const isAbsolute =
        event.type === "deviceorientationabsolute" || event.absolute === true;
      // Setelah sensor absolut tersedia, abaikan event relatif agar heading tak salah.
      if (!isAbsolute && absoluteSeen.current) return;
      if (isAbsolute) absoluteSeen.current = true;

      lastEvent.current = event;
      const base =
        event.beta !== null && event.gamma !== null
          ? tiltCompensatedHeading(event.alpha, event.beta, event.gamma)
          : 360 - event.alpha;
      setHeading(normalize(base + screenAngle));
      setAbsolute(isAbsolute);
    }
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

  return { heading, absolute, permission, requestPermission };
}
