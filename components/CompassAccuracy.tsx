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
    className: "bg-success-soft text-success-text",
    dot: "bg-success-accent",
  },
  medium: {
    label: "Akurasi kompas: sedang",
    className: "bg-warning-soft text-warning",
    dot: "bg-warning-accent",
  },
  low: {
    label: "Akurasi kompas: rendah",
    className: "bg-danger-soft text-danger-text",
    dot: "bg-danger-accent",
  },
  unknown: {
    label: "Akurasi kompas: tidak diketahui",
    className: "bg-surface text-muted",
    dot: "bg-muted",
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
        <div className="mt-2 flex items-center gap-3 rounded-lg border border-danger-border bg-danger-soft p-3 text-xs text-danger-text">
          <svg
            viewBox="0 0 120 60"
            className="h-10 w-20 shrink-0 motion-safe:animate-pulse"
            aria-hidden
          >
            <path
              d="M60,30 C60,8 18,8 18,30 C18,52 60,52 60,30 C60,8 102,8 102,30 C102,52 60,52 60,30 Z"
              fill="none"
              className="stroke-danger-accent"
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
