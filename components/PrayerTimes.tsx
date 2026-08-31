"use client";

import { useEffect, useMemo, useState } from "react";
import {
  prayerTimes,
  nextPrayer,
  PRAYER_METHODS,
  PRAYER_LABELS,
  DEFAULT_IHTIYAT,
  type PrayerMethodId,
  type AsrMethod,
  type PrayerName,
  type IhtiyatMinutes,
} from "@/lib/prayer";

interface PrayerTimesProps {
  lat: number;
  lng: number;
}

const METHOD_KEY = "ilmu-falak:metode-salat";
const ASR_KEY = "ilmu-falak:madzhab-ashar";
const IHTIYAT_KEY = "ilmu-falak:ihtiyat";

const timeFormatter = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const ROWS: PrayerName[] = [
  "fajr",
  "sunrise",
  "dhuhr",
  "asr",
  "maghrib",
  "isha",
];

function loadPref<T extends string>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    return (window.localStorage.getItem(key) as T) || fallback;
  } catch {
    return fallback;
  }
}

function loadIhtiyat(): Required<IhtiyatMinutes> {
  if (typeof window === "undefined") return DEFAULT_IHTIYAT;
  try {
    const raw = window.localStorage.getItem(IHTIYAT_KEY);
    if (!raw) return DEFAULT_IHTIYAT;
    const parsed = JSON.parse(raw) as IhtiyatMinutes;
    return { ...DEFAULT_IHTIYAT, ...parsed };
  } catch {
    return DEFAULT_IHTIYAT;
  }
}

export function PrayerTimes({ lat, lng }: PrayerTimesProps) {
  const [now, setNow] = useState<Date | null>(null);
  const [method, setMethod] = useState<PrayerMethodId>("kemenag");
  const [asr, setAsr] = useState<AsrMethod>("standard");
  const [ihtiyat, setIhtiyat] =
    useState<Required<IhtiyatMinutes>>(DEFAULT_IHTIYAT);

  useEffect(() => {
    // Preferensi & waktu dibaca di klien agar tidak memicu ketidakcocokan hidrasi.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMethod(loadPref<PrayerMethodId>(METHOD_KEY, "kemenag"));
    setAsr(loadPref<AsrMethod>(ASR_KEY, "standard"));
    setIhtiyat(loadIhtiyat());
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const times = useMemo(() => {
    if (!now) return null;
    // Hitung untuk hari kalender lokal (komponen tanggal lokal sebagai basis UTC).
    const day = new Date(
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()),
    );
    return prayerTimes(day, lat, lng, { method, asr, ihtiyat });
  }, [now, lat, lng, method, asr, ihtiyat]);

  if (!now || !times) return null;

  const upcoming = nextPrayer(times, now);

  function changeMethod(value: PrayerMethodId) {
    setMethod(value);
    try {
      window.localStorage.setItem(METHOD_KEY, value);
    } catch {}
  }

  function changeAsr(value: AsrMethod) {
    setAsr(value);
    try {
      window.localStorage.setItem(ASR_KEY, value);
    } catch {}
  }

  function changeIhtiyat(name: PrayerName, value: number) {
    setIhtiyat((prev) => {
      const next = { ...prev, [name]: value };
      try {
        window.localStorage.setItem(IHTIYAT_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  return (
    <section className="panel w-full p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-brass">
          Jadwal Salat Hari Ini
        </h2>
        <select
          aria-label="Metode perhitungan"
          value={method}
          onChange={(e) => changeMethod(e.target.value as PrayerMethodId)}
          className="rounded-md border border-hairline bg-surface px-2 py-1 text-xs text-foreground"
        >
          {Object.values(PRAYER_METHODS).map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      <ul className="divide-y divide-hairline">
        {ROWS.map((name) => {
          const time = times[name];
          const isNext = name === upcoming;
          return (
            <li
              key={name}
              className={
                isNext
                  ? "flex items-center justify-between rounded-md bg-brass/10 px-2 py-2 text-sm font-semibold text-brass"
                  : "flex items-center justify-between px-2 py-2 text-sm text-foreground"
              }
            >
              <span>
                {PRAYER_LABELS[name]}
                {isNext && (
                  <span className="ml-2 text-xs font-normal text-brass">
                    berikutnya
                  </span>
                )}
              </span>
              <span className="tabular-nums" translate="no">
                {time ? timeFormatter.format(time) : "—"}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
        <label className="flex items-center gap-2">
          <span>Ashar</span>
          <select
            aria-label="Madzhab Ashar"
            value={asr}
            onChange={(e) => changeAsr(e.target.value as AsrMethod)}
            className="rounded-md border border-hairline bg-surface px-2 py-1 text-foreground"
          >
            <option value="standard">Standar (Syafi&apos;i)</option>
            <option value="hanafi">Hanafi</option>
          </select>
        </label>
        <span>Zona waktu perangkat</span>
      </div>

      <details className="mt-3 text-xs text-muted">
        <summary className="cursor-pointer select-none">
          Ihtiyat per waktu (menit)
        </summary>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {ROWS.map((name) => (
            <label key={name} className="flex flex-col gap-1">
              <span>{PRAYER_LABELS[name]}</span>
              <input
                type="number"
                inputMode="numeric"
                aria-label={`Ihtiyat ${PRAYER_LABELS[name]}`}
                value={ihtiyat[name]}
                onChange={(e) => changeIhtiyat(name, Number(e.target.value))}
                className="w-full rounded-md border border-hairline bg-surface px-2 py-1 tabular-nums"
              />
            </label>
          ))}
        </div>
        <p className="mt-2">
          Nilai positif memundurkan waktu; Terbit biasanya diberi nilai negatif.
        </p>
      </details>
    </section>
  );
}
