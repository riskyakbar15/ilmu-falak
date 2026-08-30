# Arah Kiblat — Ilmu Falak

Aplikasi web (PWA) untuk menentukan **arah kiblat** secara akurat dan transparan.
Selain menampilkan arah, aplikasi memperlihatkan **metode perhitungan beserta
rujukannya** melalui Panel Metode & Rujukan — inti nilai edukatifnya.

Seluruh perhitungan berjalan **sepenuhnya di peramban**: tanpa backend, tanpa
database. Lokasi Anda tidak pernah dikirim ke server (privasi terjaga) dan aplikasi
dapat berjalan **offline** sebagai PWA.

## Fitur

- Azimut kiblat dengan metode **great-circle** (initial bearing) ke koordinat Ka'bah.
- **Kompas real-time** (sensor perangkat) dengan **koreksi Deklinasi Magnetik** dari
  model **WMM 2025** yang di-bundle (offline), heading terkompensasi kemiringan, dan
  koreksi orientasi layar (portrait/landscape). Fallback statis bila sensor tak ada
  atau tidak mengacu Utara Sejati.
- **Arah via Matahari** (tanpa kompas) — posisi Matahari dihitung dari lokasi & waktu
  (algoritma NOAA), memberi acuan arah lewat bayangan; tidak terpengaruh gangguan magnet.
- **Rashdul Qibla** — hitung mundur ke momen Matahari tepat di atas Ka'bah, saat
  bayangan benda tegak menunjuk lurus menjauhi kiblat (verifikasi tanpa alat).
- Lokasi via **GPS otomatis** atau **fallback manual** (cari kota offline / koordinat),
  disimpan di `localStorage`.
- Jarak ke Ka'bah, status akurasi, dan disclaimer akurasi sensor.
- **PWA** installable dengan service worker (offline-first) dan ikon lengkap (maskable).

## Metode & Rujukan

- **Azimut kiblat** — azimut awal lingkaran besar dari lokasi pengguna ke Ka'bah,
  diukur searah jarum jam dari Utara Sejati:

  ```Azimut kiblat
  θ = atan2( sin Δλ · cos φ₂, cos φ₁ · sin φ₂ − sin φ₁ · cos φ₂ · cos Δλ )
  ```

- **Koordinat Ka'bah** — 21.4225° LU, 39.8262° BT (Masjidil Haram, Makkah).
- **Deklinasi Magnetik** — model WMM (World Magnetic Model) 2025, dihitung offline
  di peramban via paket [`geomagnetism`](https://github.com/naturalatlas/geomagnetism).
- **Posisi Matahari** — algoritma NOAA (azimut, ketinggian, deklinasi) untuk metode
  bayangan dan perhitungan Rashdul Qibla.

Keputusan desain dirangkum di [`docs/plan.md`](docs/plan.md) dan ADR di
[`docs/adr/`](docs/adr/); glosarium istilah di [`docs/CONTEXT.md`](docs/CONTEXT.md).

## Arsitektur

- **Logika inti = fungsi murni** di [`lib/`](lib/) (teruji unit, TDD): `qiblaAzimuth`,
  `haversineDistance`, `magneticDeclination`, `compassRotation`, `formatBearing`,
  `solarPosition`, `nextRashdulQibla`.
- **Sensor via hooks** di [`hooks/`](hooks/): `useGeolocation`, `useDeviceOrientation`.
- **UI** di [`components/`](components/): `Compass`, `LocationInput`, `MethodPanel`,
  `SunGuide`, `RashdulQibla`, `QiblaClient`.
- **Data kota offline** di [`data/cities.ts`](data/cities.ts); preferensi di
  [`lib/storage.ts`](lib/storage.ts).
- **Pengujian**: 48 unit/komponen test (Vitest + Testing Library) untuk fungsi murni,
  hooks, dan komponen.

## Pengembangan

```bash
npm install
npm run dev             # server pengembangan (http://localhost:3000, Turbopack)
npm test                # unit & component test (Vitest)
npm run lint            # ESLint
npm run build           # build produksi (webpack, menghasilkan service worker)
npm run generate-icons  # buat ulang ikon PWA dari public/icon.svg
```

> **Catatan build:** proyek memakai **webpack** untuk build (`next build --webpack`)
> karena `@serwist/next` belum mendukung Turbopack. Service worker hanya dihasilkan
> pada build produksi (dinonaktifkan saat `dev`). Karena memakai `output: "standalone"`,
> preview produksi lokal dijalankan dengan `node .next/standalone/server.js`.

## Deployment (Docker + Nginx + HTTPS)

Sensor `DeviceOrientation` dan Geolocation **membutuhkan HTTPS**. Stack Docker sudah
menyertakan Nginx (reverse proxy TLS) dan certbot (Let's Encrypt otomatis).

```bash
cp .env.example .env          # isi DOMAIN & CERTBOT_EMAIL
docker compose build
chmod +x init-letsencrypt.sh
./init-letsencrypt.sh         # terbitkan sertifikat pertama (uji: STAGING=1 ./init-letsencrypt.sh)
docker compose up -d          # jalankan web + nginx + certbot
```

Arsitektur runtime: `Internet → Nginx (443, TLS) → web:3000 (Next.js standalone)`.
Sertifikat diperpanjang otomatis oleh certbot; Nginx memuat ulang berkala. Prasyarat:
DNS domain mengarah ke VPS dan port 80/443 terbuka.

Aplikasi juga menyetel header keamanan (CSP, HSTS, `X-Frame-Options`,
`Permissions-Policy` yang membatasi sensor ke origin sendiri) via
[`next.config.ts`](next.config.ts).

## Batasan & Rencana Lanjutan

MVP fokus pada arah kiblat. Pengembangan lanjutan: model ellipsoid (Vincenty),
multi-bahasa (ID/EN/AR), overlay AR kamera, aplikasi native, serta modul ilmu falak
lain (jadwal salat, kalender hijriah, rukyat hilal). Lihat [`docs/plan.md`](docs/plan.md).

Akurasi kompas bergantung pada sensor dan kalibrasi perangkat. Jauhkan dari benda
logam/magnet dan kalibrasi dengan menggerakkan perangkat membentuk angka 8. Bila
sensor tak andal, gunakan **Arah via Matahari**.
