# Plan — Ilmu Falak: Arah Kiblat

- **Tanggal**: 2026-08-30
- **Status**: Draft (hasil sesi grilling)
- **Tujuan**: Aplikasi web (PWA) penentu arah kiblat yang akurat dan transparan —
  menampilkan metode perhitungan beserta rujukannya. MVP fokus arah kiblat, siap
  diperluas ke modul ilmu falak lain.

## Ringkasan Keputusan (D1–D12)

| #   | Keputusan | Pilihan                                                       |
| --- | --------- | ------------------------------------------------------------- |
| D1  | Fokus     | Arah kiblat saja (metode + rujukan transparan)                |
| D2  | Platform  | Website PWA (DeviceOrientation + Geolocation)                 |
| D3  | Tujuan    | Praktis (umum) + edukatif (panel metode & rujukan)            |
| D4  | Metode    | Azimut great-circle (bola) + koreksi deklinasi + sumber resmi |
| D5  | Lokasi    | GPS otomatis + fallback manual                                |
| D6  | Tampilan  | Kompas real-time + fallback statis                            |
| D7  | Stack     | Next.js + PWA, murni klien (tanpa backend/DB)                 |
| D8  | Sensor    | Penanganan izin + kalibrasi + fallback (graceful degradation) |
| D9  | Pengujian | Unit test fungsi murni vs azimut acuan otoritatif             |
| D10 | Struktur  | Logika inti = fungsi murni di `lib/`, sensor via hooks        |
| D11 | Halaman   | Satu halaman utama + panel metode/rujukan + input lokasi      |
| D12 | Deklinasi | Model WMM di-bundle (offline); fallback tunda (utara sejati)  |

## Langkah Implementasi

1. Scaffold Next.js + TypeScript + Vitest + konfigurasi PWA.
2. `lib/` — fungsi murni:
   - `qiblaAzimuth(lat, lng)` — initial bearing great-circle ke Ka'bah.
   - `haversineDistance(lat, lng)` — jarak ke Ka'bah.
   - `magneticDeclination(lat, lng)` — dari model WMM (offline).
   - `compassRotation(heading, qiblaAzimuth, declination)` — sudut putar panah.
   - `formatBearing(deg)` — format derajat + arah mata angin.
3. Unit test fungsi murni vs **nilai azimut kiblat dari sumber otoritatif** untuk
   beberapa kota acuan (sumber kebenaran independen).
4. Hooks sensor: `useGeolocation` (izin, fallback), `useDeviceOrientation` (izin
   iOS via gesture, absolut/relatif, kalibrasi).
5. Input lokasi: GPS otomatis + manual (cari kota / input koordinat).
6. UI halaman utama: kompas real-time (panah SVG berputar) + azimut derajat + jarak
   ke Ka'bah + status lokasi & akurasi; fallback statis bila sensor tak ada.
7. Panel Metode & Rujukan: rumus, koordinat Ka'bah + sumber, penjelasan deklinasi.
8. PWA: manifest + service worker (offline), prompt install.
9. Penanganan izin/error + disclaimer akurasi kompas.

## Future Work (sengaja ditunda)

- Modul ilmu falak lain: jadwal salat, kalender hijriah, rukyat hilal.
- Model ellipsoid WGS84 (Vincenty) untuk presisi lebih tinggi.
- Overlay AR kamera untuk menunjuk kiblat.
- Aplikasi mobile native.
- Multi-bahasa (ID/EN/AR).
- Bundle WMM bila sempat ditunda pada MVP.

## Rekomendasi Skills (agar implementasi optimal)

| Skill                           | Dipakai untuk                                                |
| ------------------------------- | ------------------------------------------------------------ |
| **tdd**                         | Test-first fungsi murni matematis (azimut, jarak, deklinasi) |
| **vercel-react-best-practices** | Pola Next.js/React, banyak client component                  |
| **web-design-guidelines**       | Audit aksesibilitas & UX (izin sensor, status)               |
| **frontend-design**             | Desain visual kompas (SVG/animasi)                           |
| **readme-writer**               | `README.md` + penjelasan metode & rujukan                    |
| **stop-slop**                   | Merapikan prosa panel metode/README                          |
| **agent-browser**               | Dogfood/E2E alur izin→tampil arah                            |

Catatan: animasi kompas pakai `transform`/`opacity` (hormati `prefers-reduced-motion`),
dan tampilkan disclaimer akurasi sensor.

## Referensi

- Glosarium: [`CONTEXT.md`](./CONTEXT.md)
- ADR: [`adr/`](./adr/)
