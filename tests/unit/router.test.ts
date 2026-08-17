import { describe, expect, it } from "vitest";
import { navigate, parseRoute, placeHref } from "../../src/router";

describe("parseRoute", () => {
  it("parses #/ (and empty hash) as welcome", () => {
    expect(parseRoute("#/")).toEqual({ name: "welcome", after: false, debug: false });
    expect(parseRoute("")).toEqual({ name: "welcome", after: false, debug: false });
    expect(parseRoute("#")).toEqual({ name: "welcome", after: false, debug: false });
  });

  it("parses #/tour and #/recap", () => {
    expect(parseRoute("#/tour").name).toBe("tour");
    expect(parseRoute("#/recap").name).toBe("recap");
  });

  it("parses #/place/:id with the place id", () => {
    expect(parseRoute("#/place/bells-corners-sign")).toEqual({
      name: "place",
      placeId: "bells-corners-sign",
      after: false,
      debug: false,
    });
  });

  it("treats #/place with no id as welcome", () => {
    expect(parseRoute("#/place").name).toBe("welcome");
  });

  it("treats unknown paths as welcome", () => {
    expect(parseRoute("#/nope/what").name).toBe("welcome");
  });

  it("reads after=1 and debug=1 from the hash query", () => {
    const route = parseRoute("#/place/the-school?after=1&debug=1");
    expect(route).toEqual({
      name: "place",
      placeId: "the-school",
      after: true,
      debug: true,
    });
  });

  it("reads flags from the page query too (shared links strip nothing)", () => {
    expect(parseRoute("#/place/the-school", "?after=1").after).toBe(true);
    expect(parseRoute("#/tour", "?debug=1").debug).toBe(true);
  });

  it("ignores non-'1' flag values", () => {
    expect(parseRoute("#/tour?after=0").after).toBe(false);
    expect(parseRoute("#/tour?after=yes").after).toBe(false);
  });
});

describe("placeHref", () => {
  it("builds a place link, optionally with after=1", () => {
    expect(placeHref("the-plaza")).toBe("#/place/the-plaza");
    expect(placeHref("the-plaza", { after: true })).toBe("#/place/the-plaza?after=1");
  });

  it("round-trips through parseRoute", () => {
    const route = parseRoute(placeHref("greenbelt-woods", { after: true }));
    expect(route.placeId).toBe("greenbelt-woods");
    expect(route.after).toBe(true);
  });
});

describe("navigate", () => {
  it("sets the location hash with or without a leading #", () => {
    navigate("#/tour");
    expect(window.location.hash).toBe("#/tour");
    navigate("/recap");
    expect(window.location.hash).toBe("#/recap");
  });
});
