/**
 * gen-dither — build the 1-bit companion asset for every project poster.
 *
 * Terminals that speak the inline-image protocol (iTerm2, kitty, WezTerm) paint
 * pictures as terminal output. Before a project card resolves to its real
 * screenshot it shows that output: a true Floyd–Steinberg 1-bit render, pure
 * ink and pure paper, no midtones.
 *
 * Reads   public/assets/projects/<slug>/thumbnail/<theme>.png   (theme: dark | light)
 * Writes  public/assets/projects/<slug>/thumbnail/<theme>.jpg          (optimised, what the card resolves to)
 *         public/assets/projects/<slug>/thumbnail/<theme>-dither.png   (1-bit, what the card rests at)
 *
 * Run with `npm run gen:dither` and commit the output — this is deliberately not
 * part of `next build`, so production never needs sharp.
 */

import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const ROOT = join(process.cwd(), "public", "assets", "projects");
const WIDTH = 1200;
const HEIGHT = 675;

/** terminal palette — matches --bg-0 and --fg-1 in globals.css */
const INK = [0x05, 0x05, 0x05];
const PAPER = [0xf0, 0xed, 0xe8];

/**
 * Floyd–Steinberg error diffusion over an 8-bit greyscale buffer.
 * sharp can threshold but has no error diffusion, so this is hand-rolled:
 * quantise each pixel to black or white, then push the rounding error onto the
 * neighbours that have not been visited yet.
 */
function floydSteinberg(gray, w, h) {
  // float buffer so accumulated error keeps its precision
  const buf = Float32Array.from(gray);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const oldPx = buf[i];
      const newPx = oldPx < 128 ? 0 : 255;
      const err = oldPx - newPx;
      buf[i] = newPx;

      if (x + 1 < w) buf[i + 1] += (err * 7) / 16;
      if (y + 1 < h) {
        if (x > 0) buf[i + w - 1] += (err * 3) / 16;
        buf[i + w] += (err * 5) / 16;
        if (x + 1 < w) buf[i + w + 1] += (err * 1) / 16;
      }
    }
  }

  // map the two levels onto the terminal palette
  const rgb = Buffer.alloc(w * h * 3);
  for (let i = 0; i < w * h; i++) {
    const c = buf[i] < 128 ? INK : PAPER;
    rgb[i * 3] = c[0];
    rgb[i * 3 + 1] = c[1];
    rgb[i * 3 + 2] = c[2];
  }
  return rgb;
}

async function build(slug, theme) {
  const dir = join(ROOT, slug, "thumbnail");
  const src = join(dir, `${theme}.png`);

  try {
    await stat(src);
  } catch {
    console.log(`  ${slug}: no thumbnail/${theme}.png, skipped`);
    return;
  }

  const base = sharp(src).resize(WIDTH, HEIGHT, { fit: "cover", position: "top" });

  const jpgPath = join(dir, `${theme}.jpg`);
  await base.clone().jpeg({ quality: 80, mozjpeg: true }).toFile(jpgPath);

  const { data, info } = await base
    .clone()
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const rgb = floydSteinberg(data, info.width, info.height);
  const ditherPath = join(dir, `${theme}-dither.png`);
  await sharp(rgb, { raw: { width: info.width, height: info.height, channels: 3 } })
    // 2 colours only — palette output keeps this small despite the dot noise
    .png({ palette: true, colours: 2, effort: 10 })
    .toFile(ditherPath);

  const [a, b] = await Promise.all([stat(jpgPath), stat(ditherPath)]);
  console.log(
    `  ${slug}/${theme}: ${Math.round(a.size / 1024)}kb jpg · ${Math.round(b.size / 1024)}kb dither`,
  );
}

const entries = await readdir(ROOT, { withFileTypes: true });
const slugs = entries.filter((e) => e.isDirectory()).map((e) => e.name);

console.log(`gen-dither — ${slugs.length} project(s)`);
for (const slug of slugs) {
  await build(slug, "dark");
  await build(slug, "light");
}
