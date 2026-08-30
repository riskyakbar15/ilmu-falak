import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LocationInput } from "./LocationInput";

function setup(
  overrides: Partial<React.ComponentProps<typeof LocationInput>> = {},
) {
  const onUseGps = vi.fn();
  const onSelectLocation = vi.fn();
  render(
    <LocationInput
      onUseGps={onUseGps}
      onSelectLocation={onSelectLocation}
      status="idle"
      error={null}
      gpsActive={false}
      {...overrides}
    />,
  );
  return { onUseGps, onSelectLocation };
}

describe("LocationInput", () => {
  it("memanggil onUseGps saat tombol GPS ditekan", async () => {
    const { onUseGps } = setup();
    await userEvent.click(
      screen.getByRole("button", { name: /gunakan lokasi gps/i }),
    );
    expect(onUseGps).toHaveBeenCalledOnce();
  });

  it("menampilkan status aktif saat GPS aktif dan granted", () => {
    setup({ gpsActive: true, status: "granted" });
    expect(
      screen.getByRole("button", { name: /lokasi gps aktif/i }),
    ).toBeInTheDocument();
  });

  it("memilih kota dari hasil pencarian", async () => {
    const { onSelectLocation } = setup();
    await userEvent.type(screen.getByLabelText(/cari kota/i), "Jakarta");
    await userEvent.click(screen.getByRole("button", { name: /Jakarta/ }));
    expect(onSelectLocation).toHaveBeenCalledWith(
      -6.2088,
      106.8456,
      "Jakarta, DKI Jakarta",
    );
  });

  it("menolak koordinat manual kosong", async () => {
    const { onSelectLocation } = setup();
    await userEvent.click(
      screen.getByRole("button", { name: /terapkan koordinat/i }),
    );
    expect(onSelectLocation).not.toHaveBeenCalled();
  });

  it("menerima koordinat manual yang valid", async () => {
    const { onSelectLocation } = setup();
    await userEvent.type(screen.getByLabelText(/lintang/i), "-7.25");
    await userEvent.type(screen.getByLabelText(/bujur/i), "112.75");
    await userEvent.click(
      screen.getByRole("button", { name: /terapkan koordinat/i }),
    );
    expect(onSelectLocation).toHaveBeenCalledWith(
      -7.25,
      112.75,
      "Koordinat manual",
    );
  });

  it("menampilkan pesan galat bila ada", () => {
    setup({ error: "Izin lokasi ditolak." });
    expect(screen.getByRole("alert")).toHaveTextContent(/ditolak/i);
  });
});
