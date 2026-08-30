# Azimut great-circle (bola) sebagai metode acuan utama

Arah kiblat dihitung sebagai azimut awal (initial bearing) lingkaran besar dari
lokasi pengguna ke koordinat Ka'bah, menggunakan trigonometri bola.

## Considered Options

- Model ellipsoid WGS84 (mis. rumus Vincenty) untuk presisi lebih tinggi

## Rationale

Azimut great-circle adalah metode standar dan sudah cukup akurat untuk penentuan
arah kiblat. Model ellipsoid menambah kompleksitas dengan selisih yang sangat kecil
untuk kebutuhan ini, sehingga dijadikan opsi presisi lanjutan (future work). Rumus
dan sumber koordinat Ka'bah ditampilkan di Panel Metode & Rujukan sebagai "acuan
utama".
