import { formatBearing } from "@/lib/format";

interface CompassProps {
  /** Azimut kiblat dari Utara Sejati (derajat). */
  qiblaAzimuth: number;
  /** Sudut putar panah relatif layar; null bila sensor kompas tak aktif. */
  rotation: number | null;
  /** True bila perangkat sudah menghadap kiblat (kompas real-time aktif). */
  aligned?: boolean;
}

const CARDINALS = [
  { label: "U", angle: 0 },
  { label: "T", angle: 90 },
  { label: "S", angle: 180 },
  { label: "B", angle: 270 },
];

// Tik-tik piringan tiap 15°, lebih panjang pada kelipatan 45° (gaya astrolab).
const TICKS = Array.from({ length: 24 }, (_, i) => i * 15);

export function Compass({
  qiblaAzimuth,
  rotation,
  aligned = false,
}: CompassProps) {
  // Tanpa sensor: dial statis, panah menunjuk azimut dari Utara (atas = Utara).
  const needleAngle = rotation ?? qiblaAzimuth;
  const realtime = rotation !== null;
  const bearing = formatBearing(qiblaAzimuth);

  return (
    <div className="flex flex-col items-center gap-5">
      <svg
        viewBox="0 0 200 200"
        className="h-64 w-64 sm:h-72 sm:w-72"
        role="img"
        aria-label={`Arah kiblat ${bearing.degrees} ${bearing.compass}`}
      >
        <circle
          cx="100"
          cy="100"
          r="95"
          strokeWidth="2.5"
          className={
            aligned
              ? "fill-surface stroke-success-accent"
              : "fill-surface stroke-brass"
          }
        />
        <circle
          cx="100"
          cy="100"
          r="80"
          className="fill-none stroke-hairline"
          strokeWidth="1"
        />

        {TICKS.map((angle) => {
          const rad = (angle * Math.PI) / 180;
          const major = angle % 45 === 0;
          const inner = major ? 80 : 85;
          return (
            <line
              key={angle}
              x1={100 + Math.sin(rad) * inner}
              y1={100 - Math.cos(rad) * inner}
              x2={100 + Math.sin(rad) * 90}
              y2={100 - Math.cos(rad) * 90}
              className={major ? "stroke-brass" : "stroke-hairline"}
              strokeWidth={major ? 2 : 1}
              strokeLinecap="round"
            />
          );
        })}

        {/* Penanda target tetap di atas: sejajarkan panah ke sini saat pakai kompas. */}
        {realtime && (
          <g>
            <polygon
              points="100,5 93,19 107,19"
              className={aligned ? "fill-success-accent" : "fill-brass"}
            />
            <line
              x1="100"
              y1="20"
              x2="100"
              y2="100"
              strokeWidth="1"
              strokeDasharray="2 5"
              className={aligned ? "stroke-success-accent" : "stroke-hairline"}
            />
          </g>
        )}

        {CARDINALS.map(({ label, angle }) => {
          const rad = (angle * Math.PI) / 180;
          const x = 100 + Math.sin(rad) * 68;
          const y = 100 - Math.cos(rad) * 68;
          return (
            <text
              key={label}
              x={x}
              y={y + 4}
              textAnchor="middle"
              className={
                angle === 0
                  ? "fill-brass text-[13px] font-bold"
                  : "fill-muted text-[11px] font-semibold"
              }
            >
              {label}
            </text>
          );
        })}

        <g
          className="origin-center transition-transform duration-300 ease-out motion-reduce:transition-none"
          style={{ transform: `rotate(${needleAngle}deg)` }}
        >
          <polygon
            points="100,24 107,105 100,97 93,105"
            className={aligned ? "fill-success-accent" : "fill-brass"}
          />
          <polygon
            points="100,176 107,95 100,103 93,95"
            className="fill-hairline"
          />
        </g>

        <circle
          cx="100"
          cy="100"
          r="5"
          className={aligned ? "fill-success-accent" : "fill-brass-strong"}
        />
      </svg>

      <div className="text-center">
        <p
          className="font-display text-5xl font-semibold tracking-tight tabular-nums text-foreground"
          translate="no"
        >
          {bearing.degrees}
        </p>
        <p className="mt-1 text-sm text-muted">
          Azimut dari Utara Sejati · {bearing.compass}
        </p>
      </div>
    </div>
  );
}
