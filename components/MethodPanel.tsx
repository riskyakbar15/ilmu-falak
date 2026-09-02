import { REFERENCES } from "@/lib/constants";

export function MethodPanel() {
  return (
    <details className="panel w-full p-5">
      <summary className="cursor-pointer font-display text-lg font-semibold text-brass">
        Panel Metode &amp; Rujukan
      </summary>

      <div className="mt-4 space-y-4 text-sm leading-relaxed text-foreground">
        <section>
          <h3 className="font-semibold text-foreground">Metode</h3>
          <p>
            {REFERENCES.method.label}. Arah kiblat dihitung sebagai azimut awal
            lingkaran besar dari lokasi Anda ke Ka&apos;bah, diukur searah jarum
            jam dari Utara Sejati.
          </p>
          <pre className="mt-2 overflow-x-auto rounded-lg border border-hairline bg-background p-3 text-xs">
            {REFERENCES.method.formula}
          </pre>
        </section>

        <section>
          <h3 className="font-semibold text-foreground">
            Koordinat Ka&apos;bah
          </h3>
          <p>
            {REFERENCES.kaabahCoordinate.label}. Sumber:{" "}
            {REFERENCES.kaabahCoordinate.source}.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-foreground">
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
          <h3 className="font-semibold text-foreground">Arah via Matahari</h3>
          <p>
            Sebagai alternatif kompas, posisi Matahari (azimut &amp; ketinggian)
            dihitung dari lokasi dan waktu memakai algoritma NOAA. Selisih
            antara azimut kiblat dan azimut Matahari memberi acuan arah lewat
            bayangan — tidak terpengaruh gangguan magnet. Dua kali setahun
            Matahari tepat di atas Ka&apos;bah (Rashdul Qibla), saat itu
            bayangan benda tegak menunjuk lurus menjauhi kiblat.
          </p>
        </section>

        <p className="text-xs text-muted">
          Akurasi kompas bergantung pada sensor dan kalibrasi perangkat Anda.
          Jauhkan dari benda logam/magnet, dan gerakkan perangkat membentuk
          angka 8 untuk mengkalibrasi.
        </p>
      </div>
    </details>
  );
}
