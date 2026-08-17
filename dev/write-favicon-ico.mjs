// dev/write-favicon-ico.mjs — generate a 32x32 hand-crafted favicon.ico
// that matches the brand (dark bg + cyan/violet ring).
import { writeFileSync, existsSync } from "node:fs";

const out = "public/favicon.ico";
const W = 32, H = 32;

// Color palette (BGRA byte order for BMP)
const colors = {
  bg:        [0x10, 0x05, 0x05, 0xff],  // #050510 dark
  cyan:      [0xff, 0xd4, 0x00, 0xff],  // #00d4ff cyan
  cyanDeep:  [0xea, 0xad, 0x5e, 0xff],  // #5eead4 teal
  violet:    [0xfa, 0x8b, 0xa7, 0xff],  // #a78bfa violet
  ring:      [0xff, 0xd4, 0x00, 0xff],  // cyan outer
  ringInner: [0xfa, 0x8b, 0xa7, 0xff],  // violet inner
};

// Build a 32x32 BGRA pixel buffer.  Origin is bottom-left in BMP.
function buildPixels() {
  const pixels = Buffer.alloc(W * H * 4);
  const cx = (W - 1) / 2, cy = (H - 1) / 2;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const dx = x - cx, dy = y - cy;
      const r = Math.sqrt(dx * dx + dy * dy);

      let c = colors.bg;
      // Outer ring (radius 13-15)
      if (r >= 13 && r <= 15) c = colors.ring;
      // Inner dot (radius < 4)
      else if (r < 4) c = colors.ringInner;
      // Three accent dots at fixed positions
      else {
        // Top dot
        if (Math.abs(x - 16) < 2 && Math.abs(y - 6) < 2) c = colors.cyan;
        // Right dot
        else if (Math.abs(x - 25) < 2 && Math.abs(y - 20) < 2) c = colors.violet;
        // Left dot
        else if (Math.abs(x - 7) < 2 && Math.abs(y - 20) < 2) c = colors.cyanDeep;
      }

      // BMP rows are bottom-up. Flip y.
      const row = H - 1 - y;
      const off = (row * W + x) * 4;
      pixels[off + 0] = c[0];
      pixels[off + 1] = c[1];
      pixels[off + 2] = c[2];
      pixels[off + 3] = c[3];
    }
  }
  return pixels;
}

const pixels = buildPixels();
const xorMaskSize = (W * H) / 8;     // 32-bit color, but XOR mask still required
const andMaskSize = (W * H) / 8;     // all 0 = all pixels visible
const bmpHeaderSize = 40;
const imageSize = bmpHeaderSize + W * H * 4 + xorMaskSize + andMaskSize;
const offset = 6 + 16;

const header = Buffer.from([0x00, 0x00, 0x01, 0x00, 0x01, 0x00]);

const dirEntry = Buffer.from([
  W & 0xff,
  H & 0xff,
  0x00, 0x00,
  0x01, 0x00,
  0x20, 0x00,
  ...new Uint8Array(new Uint32Array([imageSize]).buffer),
  ...new Uint8Array(new Uint32Array([offset]).buffer),
]);

const bmpHeader = Buffer.alloc(40);
bmpHeader.writeUInt32LE(40, 0);
bmpHeader.writeInt32LE(W, 4);
bmpHeader.writeInt32LE(H * 2, 8); // height is doubled for ICO (XOR + AND)
bmpHeader.writeUInt16LE(1, 12);   // planes
bmpHeader.writeUInt16LE(32, 14);  // bits per pixel

const xorMask = Buffer.alloc(xorMaskSize);   // all 0
const andMask = Buffer.alloc(andMaskSize);   // all 0 = fully visible
const ico = Buffer.concat([header, dirEntry, bmpHeader, pixels, xorMask, andMask]);

if (existsSync(out)) {
  const { readFileSync } = await import("node:fs");
  const existing = readFileSync(out);
  if (existing.length > 200) {
    console.log(`${out} already exists (${existing.length} bytes), skipping`);
    process.exit(0);
  }
}

writeFileSync(out, ico);
console.log(`✓ Wrote ${out} (${ico.length} bytes, 32x32 brand-colored)`);
