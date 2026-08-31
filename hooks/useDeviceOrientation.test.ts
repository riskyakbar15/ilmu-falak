import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDeviceOrientation } from "./useDeviceOrientation";

function fire(type: string, props: Record<string, unknown>) {
  const event = new Event(type);
  Object.assign(event, props);
  window.dispatchEvent(event);
}

describe("useDeviceOrientation", () => {
  beforeEach(() => {
    // Aktifkan jalur non-iOS (tanpa requestPermission).
    Object.defineProperty(window, "DeviceOrientationEvent", {
      value: function DeviceOrientationEvent() {},
      configurable: true,
    });
  });

  afterEach(() => {
    Reflect.deleteProperty(window, "DeviceOrientationEvent");
  });

  it("memakai webkitCompassHeading sebagai heading absolut", async () => {
    const { result } = renderHook(() => useDeviceOrientation());
    await act(async () => {
      await result.current.requestPermission();
    });

    act(() => fire("deviceorientation", { webkitCompassHeading: 90 }));

    expect(result.current.heading).toBeCloseTo(90, 5);
    expect(result.current.absolute).toBe(true);
  });

  it("mengekspos akurasi dari webkitCompassAccuracy", async () => {
    const { result } = renderHook(() => useDeviceOrientation());
    await act(async () => {
      await result.current.requestPermission();
    });

    act(() =>
      fire("deviceorientation", {
        webkitCompassHeading: 90,
        webkitCompassAccuracy: 12,
      }),
    );

    expect(result.current.accuracy).toBe(12);
    expect(result.current.accuracyLevel).toBe("high");
  });

  it("menaksir akurasi via jitter saat heading stabil (heuristik Android)", async () => {
    const { result } = renderHook(() => useDeviceOrientation());
    await act(async () => {
      await result.current.requestPermission();
    });

    // Enam event absolut dengan heading nyaris konstan → jitter kecil → akurasi baik.
    act(() => {
      for (let i = 0; i < 6; i++) {
        fire("deviceorientationabsolute", { alpha: 100, absolute: true });
      }
    });

    expect(result.current.accuracy).toBeNull();
    expect(result.current.accuracyLevel).toBe("high");
  });

  it("mengabaikan event relatif setelah data absolut diterima", async () => {
    const { result } = renderHook(() => useDeviceOrientation());
    await act(async () => {
      await result.current.requestPermission();
    });

    act(() =>
      fire("deviceorientationabsolute", { alpha: 100, absolute: true }),
    );
    const absoluteHeading = result.current.heading;

    act(() => fire("deviceorientation", { alpha: 10, absolute: false }));

    expect(result.current.heading).toBe(absoluteHeading);
    expect(result.current.absolute).toBe(true);
  });

  it("menandai unsupported bila DeviceOrientationEvent tak ada", async () => {
    Reflect.deleteProperty(window, "DeviceOrientationEvent");
    const { result } = renderHook(() => useDeviceOrientation());
    await act(async () => {
      await result.current.requestPermission();
    });
    expect(result.current.permission).toBe("unsupported");
  });
});
