import { QiblaClient } from "@/components/QiblaClient";
import { MethodPanel } from "@/components/MethodPanel";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-10 font-sans">
      <main className="flex w-full max-w-md flex-col items-center gap-8">
        <header className="flex flex-col items-center text-center">
          <span
            className="inline-flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-brass"
            translate="no"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              aria-hidden
              fill="none"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M12 3v18M3 12h18"
                stroke="currentColor"
                strokeWidth="1"
                opacity="0.5"
              />
              <path
                d="M12 6l1.6 4.4L18 12l-4.4 1.6L12 18l-1.6-4.4L6 12l4.4-1.6z"
                fill="currentColor"
              />
            </svg>
            Ilmu Falak
          </span>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-foreground">
            Arah Kiblat
          </h1>
          <p className="mt-2 max-w-xs text-pretty text-sm text-muted">
            Menentukan arah kiblat secara akurat &amp; transparan — lengkap
            dengan metode dan rujukannya.
          </p>
        </header>

        <QiblaClient />
        <MethodPanel />

        <footer className="pb-2 text-center text-xs text-muted">
          Semua perhitungan berjalan di peramban Anda. Lokasi tidak dikirim ke
          server.
        </footer>
      </main>
    </div>
  );
}
