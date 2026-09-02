"use client";

import { useEffect, useState } from "react";
import { formatHijri } from "@/lib/hijri";

const gregorianFormatter = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function HijriToday() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // Waktu klien dibaca setelah mount agar tak memicu ketidakcocokan hidrasi.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date());
  }, []);

  if (!now) return null;

  // Tengah hari UTC dari hari lokal → tanggal Hijriah hari ini yang stabil.
  const day = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 12),
  );

  return (
    <p className="text-center text-xs text-muted">
      <span className="font-semibold text-brass">{formatHijri(day)}</span> ·{" "}
      {gregorianFormatter.format(now)}
    </p>
  );
}
