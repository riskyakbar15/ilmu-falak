"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

const KEY = "ilmu-falak:tema";

const OPTIONS: { value: Theme; label: string; icon: React.ReactNode }[] = [
  {
    value: "light",
    label: "Terang",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
        <path
          d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    value: "system",
    label: "Sistem",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
        <rect
          x="3"
          y="4"
          width="18"
          height="12"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M8 20h8M12 16v4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    value: "dark",
    label: "Gelap",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
        <path
          d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    // Selaraskan tampilan dengan preferensi tersimpan (tema sudah diterapkan skrip inline).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme((localStorage.getItem(KEY) as Theme) || "system");
  }, []);

  function choose(value: Theme) {
    setTheme(value);
    try {
      if (value === "system") localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, value);
    } catch {}
    applyTheme(value);
  }

  return (
    <div
      role="group"
      aria-label="Tema tampilan"
      className="inline-flex rounded-lg border border-hairline bg-surface p-0.5"
    >
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => choose(opt.value)}
          aria-pressed={theme === opt.value}
          aria-label={opt.label}
          title={opt.label}
          className={
            theme === opt.value
              ? "flex h-8 w-8 items-center justify-center rounded-md bg-brass/15 text-brass"
              : "flex h-8 w-8 items-center justify-center rounded-md text-muted transition hover:text-brass"
          }
        >
          {opt.icon}
        </button>
      ))}
    </div>
  );
}
