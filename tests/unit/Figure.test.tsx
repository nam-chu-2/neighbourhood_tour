import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Figure } from "../../src/ui/Figure";

const image = {
  src: "stop-4-our-lady-of-peace.jpg",
  alt: "Our Lady of Peace and its parking lot",
  credit: "Author photograph",
};

describe("Figure", () => {
  it("renders the image with its text alternative and credit", () => {
    render(<Figure image={image} />);
    expect(screen.getByRole("img", { name: "Our Lady of Peace and its parking lot" })).toBeInTheDocument();
    expect(screen.getByText("Author photograph")).toBeInTheDocument();
  });

  it("reserves the box with intrinsic dimensions from the manifest", () => {
    render(<Figure image={image} />);
    const img = screen.getByRole("img");
    // Without these the page shifts as photographs arrive (SC-003).
    expect(Number(img.getAttribute("width"))).toBeGreaterThan(0);
    expect(Number(img.getAttribute("height"))).toBeGreaterThan(0);
  });

  it("offers modern formats before the fallback", () => {
    const { container } = render(<Figure image={image} />);
    const types = [...container.querySelectorAll("source")].map((s) => s.getAttribute("type"));
    expect(types).toContain("image/avif");
    expect(types).toContain("image/webp");
    // AVIF is offered before WebP so browsers pick the smallest they support.
    expect(types.indexOf("image/avif")).toBeLessThan(types.indexOf("image/webp"));
  });

  it("lazy-loads by default", () => {
    render(<Figure image={image} />);
    expect(screen.getByRole("img")).toHaveAttribute("loading", "lazy");
  });

  it("loads the hero eagerly and at high priority", () => {
    render(<Figure image={image} priority />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("loading", "eager");
    expect(img).toHaveAttribute("fetchpriority", "high");
  });

  it("still renders something sane for an image with no manifest entry", () => {
    // A missing entry must not take the page down with it.
    render(<Figure image={{ ...image, src: "not-generated.jpg" }} />);
    expect(screen.getByRole("img", { name: "Our Lady of Peace and its parking lot" })).toBeInTheDocument();
  });
});
