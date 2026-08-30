import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Compass } from "./Compass";

describe("Compass", () => {
  it("menampilkan azimut terformat dan mata angin", () => {
    render(<Compass qiblaAzimuth={295.16} rotation={null} />);
    expect(screen.getByText("295,2°")).toBeInTheDocument();
    expect(screen.getByText(/BL/)).toBeInTheDocument();
  });

  it("memberi label aksesibilitas pada gambar kompas", () => {
    render(<Compass qiblaAzimuth={58.48} rotation={120} />);
    expect(screen.getByRole("img")).toHaveAccessibleName(/arah kiblat/i);
  });
});
