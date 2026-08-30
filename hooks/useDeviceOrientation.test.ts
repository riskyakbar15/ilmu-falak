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
