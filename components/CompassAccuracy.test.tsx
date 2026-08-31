import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CompassAccuracy } from "./CompassAccuracy";

describe("CompassAccuracy", () => {
  it("menampilkan label sesuai level", () => {
    render(<CompassAccuracy level="high" />);
    expect(screen.getByText(/akurasi kompas: baik/i)).toBeInTheDocument();
  });

  it("menampilkan panduan kalibrasi saat akurasi rendah", () => {
    render(<CompassAccuracy level="low" />);
    expect(screen.getByText(/angka 8/i)).toBeInTheDocument();
  });

  it("tidak menampilkan panduan kalibrasi saat akurasi baik", () => {
    render(<CompassAccuracy level="high" />);
    expect(screen.queryByText(/angka 8/i)).not.toBeInTheDocument();
  });
});
