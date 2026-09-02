"use client";

import { useEffect, useState } from "react";
import { solarPosition, qiblaOffsetFromSun } from "@/lib/solar";
import { formatBearing } from "@/lib/format";

interface SunGuideProps {
  lat: number;
  lng: number;
  /** Azimut kiblat dari Utara Sejati (derajat). */
  qiblaAzimuth: number;
}

/** Titik pada lingkaran dial (atas = Utara), radius r, untuk azimut deg. */
function pointOnDial(azimuth: number, r: number): { x: number; y: number } {
  const rad = (azimuth * Math.PI) / 180;
  return { x: 100 + Math.sin(rad) * r, y: 100 - Math.cos(rad) * r };
}

function describeOffset(offset: number): string {
  if (offset < 1 || offset > 359) return "tepat ke arah Matahari";
  if (offset <= 180) {
    return `${Math.round(offset)}° ke kanan (searah jarum jam) dari Matahari`;
  }
  return `${Math.round(360 - offset)}° ke kiri dari Matahari`;
}

export function SunGuide({ lat, lng, qiblaAzimuth }: SunGuideProps) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // Waktu klien hanya dibaca setelah mount agar tidak memicu ketidakcocokan hidrasi.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Render setelah mount agar waktu klien tidak memicu ketidakcocokan hidrasi.
  if (!now) return null;

  const sun = solarPosition(lat, lng, now);
  const belowHorizon = sun.elevation < -0.833;
  const offset = qiblaOffsetFromSun(qiblaAzimuth, sun.azimuth);
  const shadowAzimuth = (sun.azimuth + 180) % 360;
  const sunPoint = pointOnDial(sun.azimuth, 74);
  const qiblaEnd = pointOnDial(qiblaAzimuth, 78);

  return (
    <section className="w-full rounded-xl border border-warning-border bg-warning-soft p-4">
      <h2 className="mb-1 text-sm font-semibold text-warning">
        Arah via Matahari (tanpa kompas)
      </h2>
      <p className="mb-3 text-xs text-muted">
        Dihitung dari lokasi &amp; waktu — tidak terpengaruh gangguan magnet.
      </p>

      {belowHorizon ? (
        <p className="text-sm text-muted">
          Matahari sedang di bawah ufuk, jadi metode bayangan belum bisa dipakai
          sekarang. Coba lagi saat siang hari.
        </p>
      ) : (
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <svg
            viewBox="0 0 200 200"
            className="h-40 w-40 shrink-0"
            role="img"
            aria-label={`Matahari pada azimut ${formatBearing(sun.azimuth).degrees}, kiblat ${formatBearing(qiblaAzimuth).degrees}`}
          >
            <circle
              cx="100"
              cy="100"
              r="88"
              className="fill-surface stroke-hairline"
              strokeWidth="2"
            />
            <text
              x="100"
              y="20"
              textAnchor="middle"
              className="fill-muted text-[10px] font-semibold"
            >
              U
            </text>
            <line
              x1="100"
              y1="100"
              x2={qiblaEnd.x}
              y2={qiblaEnd.y}
              className="stroke-success-accent"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle
              cx={sunPoint.x}
              cy={sunPoint.y}
              r="10"
              className="fill-warning-accent"
            />
            <circle cx="100" cy="100" r="4" className="fill-muted" />
          </svg>

          <div className="space-y-2 text-sm">
            <p className="text-foreground">
              Menghadap Matahari, kiblat berada{" "}
              <span className="font-semibold text-success-text">
                {describeOffset(offset)}
              </span>
              .
            </p>
            <p className="text-xs text-muted">
              Bayangan tongkat tegak menunjuk{" "}
              {formatBearing(shadowAzimuth).compass} (
              {formatBearing(shadowAzimuth).degrees}); Matahari di{" "}
              {formatBearing(sun.azimuth).compass} pada ketinggian{" "}
              {Math.round(sun.elevation)}°.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
