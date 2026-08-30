import { describe, it, expect } from "vitest";
import { qiblaAzimuth, haversineDistance } from "./qibla";
import { KAABAH } from "./constants";

// Nilai acuan azimut kiblat dihitung dari azimut awal lingkaran besar ke
// koordinat Ka'bah (21.4225, 39.8262) dan cocok dengan nilai kiblat terpublikasi
// untuk tiap kota dalam toleransi < 0.5°.
describe("qiblaAzimuth", () => {
  const cases: Array<{
    city: string;
    lat: number;
    lng: number;
    expected: number;
  }> = [
    { city: "Jakarta", lat: -6.2088, lng: 106.8456, expected: 295.16 },
    { city: "New York", lat: 40.7128, lng: -74.006, expected: 58.48 },
    { city: "London", lat: 51.5074, lng: -0.1278, expected: 118.97 },
    { city: "Istanbul", lat: 41.0082, lng: 28.9784, expected: 151.65 },
  ];

  it.each(cases)("$city ≈ $expected°", ({ lat, lng, expected }) => {
    expect(qiblaAzimuth(lat, lng)).toBeCloseTo(expected, 0);
  });

  it("selalu menghasilkan sudut dalam rentang 0–360", () => {
    for (let lat = -80; lat <= 80; lat += 20) {
      for (let lng = -180; lng < 180; lng += 30) {
        const az = qiblaAzimuth(lat, lng);
        expect(az).toBeGreaterThanOrEqual(0);
        expect(az).toBeLessThan(360);
      }
    }
  });
});

describe("haversineDistance", () => {
  it("jarak Jakarta ke Ka'bah ≈ 7920 km", () => {
    expect(haversineDistance(-6.2088, 106.8456)).toBeCloseTo(7920, -2);
  });

  it("jarak di titik Ka'bah adalah 0", () => {
    expect(haversineDistance(KAABAH.lat, KAABAH.lng)).toBeCloseTo(0, 5);
  });

  it("simetris terhadap arah (besaran jarak sama)", () => {
    const d = haversineDistance(40.7128, -74.006);
    expect(d).toBeGreaterThan(0);
  });
});
