import { REFERENCES } from "@/lib/constants";

export function MethodPanel() {
  return (
    <details className="w-full rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <summary className="cursor-pointer text-base font-semibold text-emerald-700 dark:text-emerald-400">
        Panel Metode &amp; Rujukan
      </summary>

      <div className="mt-4 space-y-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        <section>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Metode
          </h3>
          <p>
            {REFERENCES.method.label}. Arah kiblat dihitung sebagai azimut awal
            lingkaran besar dari lokasi Anda ke Ka&apos;bah, diukur searah jarum
            jam dari Utara Sejati.
          </p>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-100 p-3 text-xs dark:bg-slate-800">
            {REFERENCES.method.formula}
          </pre>
        </section>

        <section>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Koordinat Ka&apos;bah
          </h3>
          <p>
            {REFERENCES.kaabahCoordinate.label}. Sumber:{" "}
            {REFERENCES.kaabahCoordinate.source}.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Koreksi Deklinasi Magnetik
          </h3>
          <p>
            Kompas perangkat menunjuk Utara Magnet, sedangkan azimut kiblat
            mengacu Utara Sejati. Selisih keduanya — Deklinasi Magnetik —
            dikoreksi memakai {REFERENCES.declination.label}. Sumber:{" "}
            {REFERENCES.declination.source}.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Arah via Matahari
          </h3>
          <p>
            Sebagai alternatif kompas, posisi Matahari (azimut &amp; ketinggian)
            dihitung dari lokasi dan waktu memakai algoritma NOAA. Selisih
            antara azimut kiblat dan azimut Matahari memberi acuan arah lewat
            bayangan — tidak terpengaruh gangguan magnet. Dua kali setahun
            Matahari tepat di atas Ka&apos;bah (Rashdul Qibla), saat itu
            bayangan benda tegak menunjuk lurus menjauhi kiblat.
          </p>
        </section>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Akurasi kompas bergantung pada sensor dan kalibrasi perangkat Anda.
          Jauhkan dari benda logam/magnet, dan gerakkan perangkat membentuk
          angka 8 untuk mengkalibrasi.
        </p>
      </div>
    </details>
  );
}
