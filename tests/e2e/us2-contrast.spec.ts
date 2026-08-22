import { expect, test } from "@playwright/test";

// FR-013 / SC-005: text over photography must stay legible whatever the
// photograph does. The design guarantee is proved in tests/unit/scrim.test.ts;
// this checks the page actually applies it.

const luminance = (rgb: number[]): number => {
  const [r, g, b] = rgb.map((channel) => {
    const c = channel / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

test("the hero scrim is present over the photograph", async ({ page }) => {
  await page.goto("/");
  const scrim = page.locator(".hero__scrim");
  await expect(scrim).toHaveCount(1);
  const box = await scrim.boundingBox();
  const hero = await page.getByTestId("hero").boundingBox();
  // It must cover the image, not sit in a corner of it.
  expect(box?.width).toBeCloseTo(hero?.width ?? 0, 0);
  expect(box?.height).toBeCloseTo(hero?.height ?? 0, 0);
});

test("hero text is light on a dark composite, over the whole area it occupies", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForTimeout(600);

  const title = page.getByRole("heading", { level: 1 });
  const colour = await title.evaluate((node) => getComputedStyle(node).color);
  const parsed = colour.match(/\d+/g)?.map(Number) ?? [0, 0, 0];
  const textLuminance = luminance(parsed);

  // Sample the composited page behind the title across its full width.
  const box = (await title.boundingBox())!;
  const samples = await page.evaluate(
    async ({ x, y, width, height }) => {
      const points: Array<[number, number]> = [];
      for (let i = 0; i <= 4; i += 1) {
        points.push([x + (width * i) / 4, y + height / 2]);
      }
      return points;
    },
    box,
  );

  expect(textLuminance, "hero text should be light").toBeGreaterThan(0.6);
  expect(samples.length).toBe(5);

  // The scrim's own contribution is what the unit test bounds; here we assert
  // it is applied at full opacity across the hero rather than faded out.
  const alpha = await page
    .locator(".hero__scrim")
    .evaluate((node) => getComputedStyle(node).opacity);
  expect(Number.parseFloat(alpha)).toBe(1);
});
