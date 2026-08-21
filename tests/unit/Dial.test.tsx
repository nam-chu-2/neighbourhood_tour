import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RadioProvider } from "../../src/RadioProvider";
import type { Broadcast } from "../../src/domain/types";
import { LiveRegion } from "../../src/ui/a11y/LiveRegion";
import { Dial } from "../../src/ui/Dial";

const testBroadcast: Broadcast = {
  id: "bells-corners",
  title: "Test Radio",
  intro: "Drag the dial.",
  band: { min: 88, max: 108 },
  signOff: "That's the lot.",
  stations: [
    {
      id: "first-stop",
      order: 1,
      frequency: 90,
      name: "First Stop",
      memory: "A memory.",
      visuals: [{ src: "/a.svg", alt: "First stop", credit: "Author", kind: "illustration" }],
    },
    {
      id: "second-stop",
      order: 2,
      frequency: 100,
      name: "Second Stop",
      memory: "Another memory.",
      visuals: [{ src: "/b.svg", alt: "Second stop", credit: "Author", kind: "illustration" }],
    },
  ],
};

function renderDial() {
  return render(
    <LiveRegion>
      <RadioProvider broadcast={testBroadcast}>
        <Dial />
      </RadioProvider>
    </LiveRegion>,
  );
}

describe("Dial", () => {
  it("presents the band as a horizontal listbox", () => {
    renderDial();
    const band = screen.getByRole("listbox");
    expect(band).toHaveAttribute("aria-orientation", "horizontal");
    expect(band).toHaveAccessibleName(/dial/i);
  });

  it("renders one mark per station, in band order", () => {
    renderDial();
    const marks = screen.getAllByRole("option");
    expect(marks).toHaveLength(2);
    expect(marks[0]).toHaveAttribute("data-station-id", "first-stop");
    expect(marks[1]).toHaveAttribute("data-station-id", "second-stop");
  });

  it("names each station by name, frequency and reception state", () => {
    renderDial();
    const mark = screen.getAllByRole("option")[0]!;
    expect(mark).toHaveAccessibleName(/first stop/i);
    expect(mark).toHaveAccessibleName(/90/);
    expect(mark).toHaveAccessibleName(/not received/i);
  });

  it("marks every station unreceived before the tour starts", () => {
    renderDial();
    for (const mark of screen.getAllByRole("option")) {
      expect(mark).toHaveAttribute("data-received", "false");
      expect(mark).toHaveAttribute("aria-selected", "false");
    }
  });

  it("shows progress as a count out of the total", () => {
    renderDial();
    expect(screen.getByTestId("progress")).toHaveTextContent(/0\s+of\s+2/i);
  });

  it("keeps every station mark reachable by keyboard", () => {
    renderDial();
    for (const mark of screen.getAllByRole("option")) {
      expect(mark.tabIndex).toBeGreaterThanOrEqual(0);
    }
  });

  it("puts the same progress in the band's accessible name as on screen", () => {
    renderDial();
    // Progress must be available without seeing which marks are lit
    // (contract §2), so it lives in the label as well as in the readout.
    expect(screen.getByRole("listbox")).toHaveAccessibleName(/0 of 2 stations received/i);
    expect(screen.getByTestId("progress")).toHaveTextContent(/0 of 2/i);
  });
});
