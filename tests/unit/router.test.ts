import { describe, expect, it } from "vitest";
import { parseRoute, stationHref } from "../../src/router";

describe("parseRoute", () => {
  it("treats an empty or root hash as the dial", () => {
    expect(parseRoute("")).toMatchObject({ name: "dial" });
    expect(parseRoute("#/")).toMatchObject({ name: "dial" });
    expect(parseRoute("#")).toMatchObject({ name: "dial" });
  });

  it("parses a station deep link", () => {
    expect(parseRoute("#/station/the-plaza")).toMatchObject({
      name: "station",
      stationId: "the-plaza",
    });
  });

  it("decodes an encoded station id", () => {
    expect(parseRoute("#/station/the%20plaza")).toMatchObject({ stationId: "the plaza" });
  });

  it("parses the guide and the sign-off", () => {
    expect(parseRoute("#/guide")).toMatchObject({ name: "guide" });
    expect(parseRoute("#/signoff")).toMatchObject({ name: "signoff" });
  });

  it("falls back to the dial for an unknown route", () => {
    expect(parseRoute("#/nowhere")).toMatchObject({ name: "dial" });
  });

  it("treats a station route with no id as the dial", () => {
    expect(parseRoute("#/station/")).toMatchObject({ name: "dial" });
  });

  it("reads the debug flag from either the hash query or the page query", () => {
    expect(parseRoute("#/?debug=1").debug).toBe(true);
    expect(parseRoute("#/", "?debug=1").debug).toBe(true);
    expect(parseRoute("#/").debug).toBe(false);
  });
});

describe("stationHref", () => {
  it("builds a shareable link for a station", () => {
    expect(stationHref("the-plaza")).toBe("#/station/the-plaza");
  });

  it("encodes ids that need it", () => {
    expect(stationHref("the plaza")).toBe("#/station/the%20plaza");
  });
});
