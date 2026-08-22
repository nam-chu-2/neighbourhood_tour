import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Stop as StopModel } from "../../src/domain/types";
import { Stop } from "../../src/ui/Stop";

const base: StopModel = {
  id: "our-lady-of-peace",
  number: 4,
  headline: "Our Lady of Peace",
  standfirst: "Sunday mornings, and the parking lot afterwards",
  images: [
    { src: "stop-4-our-lady-of-peace.jpg", alt: "Our Lady of Peace", credit: "Author" },
  ],
  story: ["First paragraph of the story.", "Second paragraph of the story."],
  downtownTranslation: "This was our Rideau Centre.",
};

describe("Stop", () => {
  it("is a labelled section anchored by its id", () => {
    render(<Stop stop={base} />);
    const section = screen.getByTestId("stop");
    expect(section).toHaveAttribute("id", "our-lady-of-peace");
    expect(section).toHaveAttribute("data-stop-id", "our-lady-of-peace");
    expect(section).toHaveAttribute("data-stop-number", "4");
  });

  it("shows its itinerary number and headline", () => {
    render(<Stop stop={base} />);
    const section = screen.getByTestId("stop");
    expect(section).toHaveTextContent("04");
    expect(within(section).getByRole("heading", { level: 2 })).toHaveTextContent("Our Lady of Peace");
  });

  it("shows the standfirst when authored", () => {
    render(<Stop stop={base} />);
    expect(screen.getByText("Sunday mornings, and the parking lot afterwards")).toBeInTheDocument();
  });

  it("renders every story paragraph", () => {
    render(<Stop stop={base} />);
    expect(screen.getByText("First paragraph of the story.")).toBeInTheDocument();
    expect(screen.getByText("Second paragraph of the story.")).toBeInTheDocument();
  });

  it("renders the lead image with its text alternative", () => {
    render(<Stop stop={base} />);
    expect(screen.getByRole("img", { name: "Our Lady of Peace" })).toBeInTheDocument();
  });

  it("shows the downtown translation when authored", () => {
    render(<Stop stop={base} />);
    expect(screen.getByText(/Rideau Centre/)).toBeInTheDocument();
  });

  it("omits the translation and standfirst entirely when they are not authored", () => {
    const bare: StopModel = { ...base };
    delete bare.downtownTranslation;
    delete bare.standfirst;
    render(<Stop stop={bare} />);
    expect(screen.queryByText(/Rideau Centre/)).not.toBeInTheDocument();
    expect(screen.queryByText("Eight shops and a parking lot")).not.toBeInTheDocument();
    // The story still reads without them.
    expect(screen.getByText("First paragraph of the story.")).toBeInTheDocument();
  });
});
