export interface City {
  name: string;
  /** Provinsi atau negara untuk membedakan nama yang mirip. */
  region: string;
  lat: number;
  lng: number;
}

/** Dataset kota offline (di-bundle) untuk fallback pencarian lokasi manual. */
export const CITIES: readonly City[] = [
  { name: "Banda Aceh", region: "Aceh", lat: 5.5483, lng: 95.3238 },
  { name: "Medan", region: "Sumatera Utara", lat: 3.5952, lng: 98.6722 },
  { name: "Padang", region: "Sumatera Barat", lat: -0.9471, lng: 100.4172 },
  { name: "Pekanbaru", region: "Riau", lat: 0.5071, lng: 101.4478 },
  { name: "Jambi", region: "Jambi", lat: -1.6101, lng: 103.6131 },
  {
    name: "Palembang",
    region: "Sumatera Selatan",
    lat: -2.9761,
    lng: 104.7754,
  },
  { name: "Bengkulu", region: "Bengkulu", lat: -3.8004, lng: 102.2655 },
  { name: "Bandar Lampung", region: "Lampung", lat: -5.3971, lng: 105.2668 },
  {
    name: "Pangkal Pinang",
    region: "Kep. Bangka Belitung",
    lat: -2.1316,
    lng: 106.1169,
  },
  {
    name: "Tanjung Pinang",
    region: "Kepulauan Riau",
    lat: 0.9186,
    lng: 104.4552,
  },
  { name: "Jakarta", region: "DKI Jakarta", lat: -6.2088, lng: 106.8456 },
  { name: "Serang", region: "Banten", lat: -6.1103, lng: 106.1639 },
  { name: "Bandung", region: "Jawa Barat", lat: -6.9175, lng: 107.6191 },
  { name: "Bogor", region: "Jawa Barat", lat: -6.5971, lng: 106.806 },
  { name: "Bekasi", region: "Jawa Barat", lat: -6.2383, lng: 106.9756 },
  { name: "Semarang", region: "Jawa Tengah", lat: -6.9932, lng: 110.4203 },
  { name: "Yogyakarta", region: "DI Yogyakarta", lat: -7.7956, lng: 110.3695 },
  { name: "Surakarta", region: "Jawa Tengah", lat: -7.5755, lng: 110.8243 },
  { name: "Surabaya", region: "Jawa Timur", lat: -7.2575, lng: 112.7521 },
  { name: "Malang", region: "Jawa Timur", lat: -7.9666, lng: 112.6326 },
  { name: "Denpasar", region: "Bali", lat: -8.6705, lng: 115.2126 },
  {
    name: "Mataram",
    region: "Nusa Tenggara Barat",
    lat: -8.5833,
    lng: 116.1167,
  },
  {
    name: "Kupang",
    region: "Nusa Tenggara Timur",
    lat: -10.1772,
    lng: 123.607,
  },
  {
    name: "Pontianak",
    region: "Kalimantan Barat",
    lat: -0.0263,
    lng: 109.3425,
  },
  {
    name: "Palangka Raya",
    region: "Kalimantan Tengah",
    lat: -2.2088,
    lng: 113.9213,
  },
  {
    name: "Banjarmasin",
    region: "Kalimantan Selatan",
    lat: -3.3194,
    lng: 114.5906,
  },
  {
    name: "Samarinda",
    region: "Kalimantan Timur",
    lat: -0.5022,
    lng: 117.1536,
  },
  {
    name: "Balikpapan",
    region: "Kalimantan Timur",
    lat: -1.2379,
    lng: 116.8529,
  },
  {
    name: "Tanjung Selor",
    region: "Kalimantan Utara",
    lat: 2.8377,
    lng: 117.3616,
  },
  { name: "Manado", region: "Sulawesi Utara", lat: 1.4748, lng: 124.8421 },
  { name: "Gorontalo", region: "Gorontalo", lat: 0.5435, lng: 123.0568 },
  { name: "Palu", region: "Sulawesi Tengah", lat: -0.8917, lng: 119.8707 },
  { name: "Mamuju", region: "Sulawesi Barat", lat: -2.6748, lng: 118.8885 },
  { name: "Makassar", region: "Sulawesi Selatan", lat: -5.1477, lng: 119.4327 },
  { name: "Kendari", region: "Sulawesi Tenggara", lat: -3.9985, lng: 122.5127 },
  { name: "Ambon", region: "Maluku", lat: -3.6954, lng: 128.1814 },
  { name: "Ternate", region: "Maluku Utara", lat: 0.7833, lng: 127.3667 },
  { name: "Sofifi", region: "Maluku Utara", lat: 0.7333, lng: 127.5667 },
  { name: "Manokwari", region: "Papua Barat", lat: -0.8615, lng: 134.062 },
  { name: "Jayapura", region: "Papua", lat: -2.5337, lng: 140.7181 },
  { name: "Makkah", region: "Arab Saudi", lat: 21.4225, lng: 39.8262 },
  { name: "Madinah", region: "Arab Saudi", lat: 24.4686, lng: 39.6142 },
  { name: "Singapura", region: "Singapura", lat: 1.3521, lng: 103.8198 },
  { name: "Kuala Lumpur", region: "Malaysia", lat: 3.139, lng: 101.6869 },
  { name: "Istanbul", region: "Turki", lat: 41.0082, lng: 28.9784 },
  { name: "Kairo", region: "Mesir", lat: 30.0444, lng: 31.2357 },
  { name: "London", region: "Inggris", lat: 51.5074, lng: -0.1278 },
  { name: "New York", region: "Amerika Serikat", lat: 40.7128, lng: -74.006 },
];

/** Cari kota berdasarkan nama/wilayah (pencarian lokal, tanpa jaringan). */
export function searchCities(query: string, limit = 8): City[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return CITIES.filter(
    (city) =>
      city.name.toLowerCase().includes(q) ||
      city.region.toLowerCase().includes(q),
  ).slice(0, limit);
}
