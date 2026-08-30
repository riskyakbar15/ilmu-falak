import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useGeolocation } from "./useGeolocation";

type SuccessCb = (pos: {
  coords: { latitude: number; longitude: number; accuracy: number };
}) => void;
type ErrorCb = (err: { code: number; PERMISSION_DENIED: number }) => void;

function installGeolocation() {
  const geo = {
    watchPosition: vi.fn(),
    clearWatch: vi.fn(),
    getCurrentPosition: vi.fn(),
  };
  Object.defineProperty(globalThis.navigator, "geolocation", {
    value: geo,
    configurable: true,
  });
  return geo;
}

function removeGeolocation() {
  Object.defineProperty(globalThis.navigator, "geolocation", {
    value: undefined,
    configurable: true,
  });
}

describe("useGeolocation", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    removeGeolocation();
  });

  it("menyetel posisi & status granted saat berhasil", () => {
    const geo = installGeolocation();
    geo.watchPosition.mockImplementation((success: SuccessCb) => {
      success({ coords: { latitude: -6.2, longitude: 106.8, accuracy: 12 } });
      return 1;
    });

    const { result } = renderHook(() => useGeolocation());
    act(() => result.current.request());

    expect(result.current.status).toBe("granted");
    expect(result.current.position).toEqual({
      lat: -6.2,
      lng: 106.8,
      accuracy: 12,
    });
  });

  it("menandai denied saat izin ditolak", () => {
    const geo = installGeolocation();
    geo.watchPosition.mockImplementation((_s: SuccessCb, error: ErrorCb) => {
      error({ code: 1, PERMISSION_DENIED: 1 });
      return 1;
    });

    const { result } = renderHook(() => useGeolocation());
    act(() => result.current.request());

    expect(result.current.status).toBe("denied");
    expect(result.current.error).toMatch(/ditolak/i);
  });

  it("membersihkan pantauan sebelumnya saat request dipanggil ulang", () => {
    const geo = installGeolocation();
    geo.watchPosition.mockReturnValueOnce(1).mockReturnValueOnce(2);

    const { result } = renderHook(() => useGeolocation());
    act(() => result.current.request());
    act(() => result.current.request());

    expect(geo.clearWatch).toHaveBeenCalledWith(1);
  });

  it("setManual menghentikan pantauan GPS dan menyetel koordinat", () => {
    const geo = installGeolocation();
    geo.watchPosition.mockReturnValue(1);

    const { result } = renderHook(() => useGeolocation());
    act(() => result.current.request());
    act(() => result.current.setManual(10, 20));

    expect(geo.clearWatch).toHaveBeenCalledWith(1);
    expect(result.current.position).toEqual({
      lat: 10,
      lng: 20,
      accuracy: null,
    });
    expect(result.current.status).toBe("granted");
  });

  it("menandai unavailable bila geolokasi tak didukung", () => {
    removeGeolocation();
    const { result } = renderHook(() => useGeolocation());
    act(() => result.current.request());
    expect(result.current.status).toBe("unavailable");
  });
});
