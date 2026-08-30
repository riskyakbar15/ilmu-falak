# Koreksi deklinasi magnetik via model WMM di-bundle (offline)

Pembacaan kompas magnetik perangkat dikoreksi ke Utara Sejati memakai Deklinasi
Magnetik yang dihitung dari model WMM/IGRF yang di-bundle ke aplikasi (dihitung
offline di browser).

## Considered Options

- API deklinasi eksternal (butuh online)
- Menunda koreksi (hanya tampilkan azimut dari Utara Sejati + disclaimer)

## Rationale

Kompas perangkat menunjuk Utara Magnet, sedangkan azimut kiblat mengacu Utara
Sejati; tanpa koreksi, arah bisa meleset beberapa derajat. Model WMM yang di-bundle
menjaga konsistensi "murni klien + offline" dan meningkatkan akurasi. Jika ukuran
library terlalu besar, fallback sementara: tampilkan azimut Utara Sejati + disclaimer,
lalu tambah WMM di iterasi berikut.
