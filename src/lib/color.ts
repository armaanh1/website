export type Rgb = { r: number; g: number; b: number };

/** Accepts `#abc`, `abc`, `#aabbcc`, `aabbcc`. Returns null if it isn't a colour. */
export function parseHex(input: string): Rgb | null {
  const hex = input.trim().replace(/^#/, '');
  const full =
    hex.length === 3
      ? hex
          .split('')
          .map((c) => c + c)
          .join('')
      : hex;
  if (!/^[0-9a-f]{6}$/i.test(full)) return null;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

export function toHex({ r, g, b }: Rgb): string {
  const c = (n: number) => Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** WCAG relative luminance. */
export function luminance({ r, g, b }: Rgb): number {
  const channel = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrast(a: Rgb, b: Rgb): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

export function rgbToHsl({ r, g, b }: Rgb): { h: number; s: number; l: number } {
  const [rn, gn, bn] = [r / 255, g / 255, b / 255];
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return { h, s, l };
}

export function hslToRgb({ h, s, l }: { h: number; s: number; l: number }): Rgb {
  if (s === 0) {
    const v = l * 255;
    return { r: v, g: v, b: v };
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const channel = (t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  return { r: channel(h + 1 / 3) * 255, g: channel(h) * 255, b: channel(h - 1 / 3) * 255 };
}

/**
 * Nudge a chosen colour's lightness until it reads against the page it sits on,
 * so one picked hex stays legible in both themes. Hue and saturation are kept.
 */
export function fitToBackground(colour: Rgb, background: Rgb, minContrast: number): Rgb {
  if (contrast(colour, background) >= minContrast) return colour;

  const hsl = rgbToHsl(colour);
  // Move away from the background: lighten on a dark page, darken on a light one.
  const towardsLight = luminance(background) < 0.2;
  let best = colour;

  for (let step = 1; step <= 40; step += 1) {
    const l = towardsLight ? hsl.l + step * 0.02 : hsl.l - step * 0.02;
    if (l <= 0 || l >= 1) break;
    best = hslToRgb({ ...hsl, l });
    if (contrast(best, background) >= minContrast) return best;
  }
  return best;
}

/** Text colour to sit on top of a filled accent. */
export function inkFor(colour: Rgb): string {
  const light: Rgb = { r: 255, g: 250, b: 245 };
  const dark: Rgb = { r: 26, g: 24, b: 21 };
  return contrast(light, colour) >= contrast(dark, colour) ? toHex(light) : toHex(dark);
}
