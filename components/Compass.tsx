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
    <div className="flex flex-col items-center gap-4">
      <svg
        viewBox="0 0 200 200"
        className="h-64 w-64 sm:h-72 sm:w-72"
        role="img"
        aria-label={`Arah kiblat ${bearing.degrees} ${bearing.compass}`}
      >
        <circle
          cx="100"
          cy="100"
          r="94"
          strokeWidth="2"
          className={
            aligned
              ? "fill-white stroke-emerald-500 dark:fill-slate-900"
              : "fill-white stroke-emerald-200 dark:fill-slate-900 dark:stroke-slate-700"
          }
        />
        <circle
          cx="100"
          cy="100"
          r="78"
          className="fill-none stroke-emerald-100 dark:stroke-slate-800"
          strokeWidth="1"
        />

        {/* Penanda target tetap di atas: sejajarkan panah ke sini saat pakai kompas. */}
        {realtime && (
          <g>
            <polygon
              points="100,6 93,20 107,20"
              className={aligned ? "fill-emerald-500" : "fill-amber-500"}
            />
            <line
              x1="100"
              y1="20"
              x2="100"
              y2="100"
              strokeWidth="1"
              strokeDasharray="3 4"
              className={
                aligned
                  ? "stroke-emerald-400"
                  : "stroke-slate-300 dark:stroke-slate-600"
              }
            />
          </g>
        )}

        {CARDINALS.map(({ label, angle }) => {
          const rad = (angle * Math.PI) / 180;
          const x = 100 + Math.sin(rad) * 88;
          const y = 100 - Math.cos(rad) * 88;
          return (
            <text
              key={label}
              x={x}
              y={y + 4}
              textAnchor="middle"
              className="fill-slate-500 text-[11px] font-semibold dark:fill-slate-400"
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
            points="100,22 108,104 100,96 92,104"
            className={aligned ? "fill-emerald-500" : "fill-emerald-600"}
          />
          <polygon
            points="100,178 108,96 100,104 92,96"
            className="fill-slate-300 dark:fill-slate-600"
          />
        </g>

        <circle cx="100" cy="100" r="6" className="fill-emerald-700" />
      </svg>

      <div className="text-center">
        <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">
          {bearing.degrees}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Azimut dari Utara Sejati · {bearing.compass}
        </p>
      </div>
    </div>
  );
}
