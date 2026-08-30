# Ilmu Falak — Arah Kiblat

Aplikasi web (PWA) untuk menentukan arah kiblat secara akurat, dengan panel yang
transparan menampilkan metode perhitungan dan rujukannya. MVP fokus pada arah
kiblat; modul falak lain (jadwal salat, kalender hijriah, hilal) adalah pengembangan
lanjutan.

## Language

**Arah Kiblat**:
Azimut dari lokasi pengguna menuju Ka'bah sepanjang lingkaran besar (great-circle).
_Avoid_: kiblat direction, heading kiblat

**Azimut**:
Sudut arah horizontal diukur searah jarum jam dari Utara Sejati (0°–360°).
_Avoid_: bearing, sudut kompas

**Ka'bah**:
Titik acuan tujuan arah kiblat di Makkah, direpresentasikan oleh koordinat resmi
yang dirujuk.
_Avoid_: Mekkah, Baitullah (untuk konteks koordinat)

**Utara Sejati**:
Arah menuju kutub utara geografis; acuan untuk Azimut kiblat.
_Avoid_: true north, utara geografis

**Utara Magnet**:
Arah yang ditunjuk jarum kompas/sensor magnetometer; berbeda dari Utara Sejati
sebesar Deklinasi Magnetik.
_Avoid_: magnetic north

**Deklinasi Magnetik**:
Selisih sudut antara Utara Magnet dan Utara Sejati di suatu lokasi; dipakai untuk
mengoreksi pembacaan kompas perangkat.
_Avoid_: variasi magnetik, magnetic declination

**Heading**:
Orientasi perangkat saat ini (dari sensor `DeviceOrientation`), dipakai untuk
memutar panah kompas relatif terhadap Arah Kiblat.
_Avoid_: orientasi, arah hadap

**Panel Metode & Rujukan**:
Bagian UI yang menampilkan rumus, koordinat Ka'bah beserta sumbernya, dan penjelasan
koreksi deklinasi — inti nilai edukatif aplikasi.
_Avoid_: about, info panel
