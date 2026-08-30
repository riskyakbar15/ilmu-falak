"use client";

import { useEffect, useState } from "react";
import { nextRashdulQibla, type RashdulEvent } from "@/lib/solar";

function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${days} hari ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

const wibFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "full",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

export function RashdulQibla() {
  const [now, setNow] = useState<Date | null>(null);
  const [event, setEvent] = useState<RashdulEvent | null>(null);

  useEffect(() => {
    const initial = new Date();
    // Waktu & perhitungan hanya dijalankan di klien (hindari ketidakcocokan hidrasi).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(initial);
    setEvent(nextRashdulQibla(initial));
    const id = setInterval(() => setNow(new Date()), 1_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (now && event && now.getTime() >= event.date.getTime()) {
      // Hitung ulang saat momen terlewati.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEvent(nextRashdulQibla(now));
    }
  }, [now, event]);

  if (!now || !event) return null;

  const remaining = event.date.getTime() - now.getTime();
  const isNow = remaining <= 0;

  return (
    <section className="w-full rounded-xl border border-sky-200 bg-sky-50/60 p-4 dark:border-sky-900/40 dark:bg-sky-950/20">
      <h2 className="text-sm font-semibold text-sky-800 dark:text-sky-300">
        Rashdul Qibla berikutnya
      </h2>
      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
        Saat Matahari tepat di atas Ka&apos;bah — bayangan benda tegak menunjuk
        lurus menjauhi kiblat, jadi arah kiblat bisa diverifikasi tanpa alat.
      </p>
      {isNow ? (
        <p className="mt-2 text-xl font-bold text-sky-700 dark:text-sky-400">
          Sedang berlangsung — perhatikan bayangan!
        </p>
      ) : (
        <p className="mt-2 font-mono text-xl font-bold text-sky-700 dark:text-sky-400">
          {formatCountdown(remaining)}
        </p>
      )}
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        {wibFormatter.format(event.date)} WIB
      </p>
    </section>
  );
}
