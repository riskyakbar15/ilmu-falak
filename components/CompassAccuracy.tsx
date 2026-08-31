import type { AccuracyLevel } from "@/lib/compass";

interface CompassAccuracyProps {
  level: AccuracyLevel;
}

const BADGE: Record<
  AccuracyLevel,
  { label: string; className: string; dot: string }
> = {
  high: {
    label: "Akurasi kompas: baik",
    className:
      "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  medium: {
    label: "Akurasi kompas: sedang",
    className:
      "bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  low: {
    label: "Akurasi kompas: rendah",
    className: "bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-300",
    dot: "bg-red-500",
  },
  unknown: {
    label: "Akurasi kompas: tidak diketahui",
    className:
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    dot: "bg-slate-400",
  },
};

export function CompassAccuracy({ level }: CompassAccuracyProps) {
  const badge = BADGE[level];
  const needsCalibration = level === "low";

  return (
    <div className="w-full">
      <div
        className={`flex items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium ${badge.className}`}
      >
        <span className={`h-2 w-2 rounded-full ${badge.dot}`} aria-hidden />
        {badge.label}
      </div>

      {needsCalibration && (
        <div className="mt-2 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50/60 p-3 text-xs text-red-800 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
          <svg
            viewBox="0 0 120 60"
            className="h-10 w-20 shrink-0 motion-safe:animate-pulse"
            aria-hidden
          >
            <path
              d="M60,30 C60,8 18,8 18,30 C18,52 60,52 60,30 C60,8 102,8 102,30 C102,52 60,52 60,30 Z"
              fill="none"
              className="stroke-red-400"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          <p>
            Kalibrasi kompas: gerakkan perangkat membentuk angka 8 beberapa
            kali, jauh dari benda logam/magnet.
          </p>
        </div>
      )}
    </div>
  );
}
