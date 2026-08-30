# Website PWA murni klien (tanpa backend/DB)

Aplikasi dibangun sebagai website PWA (Next.js) yang berjalan sepenuhnya di sisi
klien: seluruh perhitungan dilakukan di browser, tanpa backend atau database.

## Rationale

Semua komputasi (azimut, deklinasi, jarak) dapat dilakukan di browser dan seluruh
data sensor/lokasi cukup tersedia lewat Web API. Konsekuensi positif: **privacy-first**
(lokasi tak pernah dikirim ke server), **bekerja offline** (PWA), dan arsitektur
sederhana. Preferensi disimpan di `localStorage`. Mengejutkan bagi yang mengira
aplikasi begini perlu server, sehingga dicatat.
