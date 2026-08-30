import { QiblaClient } from "@/components/QiblaClient";
import { MethodPanel } from "@/components/MethodPanel";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center bg-slate-50 px-4 py-10 font-sans dark:bg-slate-950">
      <main className="flex w-full max-w-md flex-col items-center gap-8">
        <header className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Arah Kiblat
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Penentu arah kiblat yang akurat dan transparan.
          </p>
        </header>

        <QiblaClient />
        <MethodPanel />

        <footer className="pb-4 text-center text-xs text-slate-400 dark:text-slate-500">
          Perhitungan berjalan sepenuhnya di peramban Anda. Lokasi tidak dikirim
          ke server.
        </footer>
      </main>
    </div>
  );
}
