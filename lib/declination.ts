import geomagnetism from "geomagnetism";

export interface Declination {
  /** Deklinasi Magnetik dalam derajat (timur positif). 0 bila model tak tersedia. */
  value: number;
  /** True bila dihitung dari model WMM; false bila fallback (ADR-0004). */
  available: boolean;
}

/**
 * Deklinasi Magnetik di sebuah lokasi dari model WMM yang di-bundle (offline).
 * Bila perhitungan gagal, kembalikan fallback 0° dengan `available: false`
 * sehingga pemanggil dapat menampilkan azimut Utara Sejati + disclaimer.
 */
export function magneticDeclination(
  lat: number,
  lng: number,
  date: Date = new Date(),
): Declination {
  try {
    const model = geomagnetism.model(date);
    const { decl } = model.point([lat, lng]);
    if (!Number.isFinite(decl)) {
      return { value: 0, available: false };
    }
    return { value: decl, available: true };
  } catch {
    return { value: 0, available: false };
  }
}
