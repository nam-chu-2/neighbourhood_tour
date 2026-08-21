// Colour maths behind the contrast floor the palette has to hold (FR-021).
//
// The palette travels continuously across the band, so contrast is checked at
// interpolated mid-points as well as at the authored stops — which means the
// test needs the same interpolation the browser does. `color-mix(in oklab, …)`
// is reproduced here rather than approximated in sRGB (research R5).

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

export function parseHex(colour: string): Rgb {
  if (!HEX.test(colour)) {
    throw new Error(`Not a hex colour: ${colour} (palette stops must be #rgb or #rrggbb)`);
  }
  let hex = colour.slice(1);
  if (hex.length === 3) hex = hex.replace(/./g, (c) => c + c);
  return {
    r: Number.parseInt(hex.slice(0, 2), 16),
    g: Number.parseInt(hex.slice(2, 4), 16),
    b: Number.parseInt(hex.slice(4, 6), 16),
  };
}

const toHex = ({ r, g, b }: Rgb): string =>
  `#${[r, g, b].map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0")).join("")}`;

const toLinear = (channel: number): number => {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

const fromLinear = (channel: number): number => {
  const c = channel <= 0.0031308 ? channel * 12.92 : 1.055 * channel ** (1 / 2.4) - 0.055;
  return c * 255;
};

/** WCAG relative luminance. */
export function relativeLuminance(colour: string): number {
  const { r, g, b } = parseHex(colour);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/** WCAG contrast ratio, order-independent, 1–21. */
export function contrastRatio(a: string, b: string): number {
  const first = relativeLuminance(a);
  const second = relativeLuminance(b);
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);
  return (lighter + 0.05) / (darker + 0.05);
}

// Oklab conversion (Björn Ottosson's matrices), matching CSS `in oklab`.
interface Oklab {
  L: number;
  a: number;
  b: number;
}

function toOklab(colour: string): Oklab {
  const { r, g, b } = parseHex(colour);
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);

  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.629978701 * lb);

  return {
    L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  };
}

function fromOklab({ L, a, b }: Oklab): string {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;

  return toHex({
    r: fromLinear(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    g: fromLinear(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    b: fromLinear(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  });
}

/** Interpolate two colours the way `color-mix(in oklab, …)` does. */
export function mixOklab(from: string, to: string, t: number): string {
  if (t <= 0) return toHex(parseHex(from));
  if (t >= 1) return toHex(parseHex(to));
  const a = toOklab(from);
  const b = toOklab(to);
  return fromOklab({
    L: a.L + (b.L - a.L) * t,
    a: a.a + (b.a - a.a) * t,
    b: a.b + (b.b - a.b) * t,
  });
}
