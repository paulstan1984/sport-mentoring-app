// Generates public/icon-sport.png and public/icon-mind.png
// Uses only built-in Node.js modules (zlib, fs)
const zlib = require("zlib");
const fs = require("fs");
const path = require("path");

const SIZE = 192;

/** CRC-32 table-based computation */
function crc32(buf) {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++)
    crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const t = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crcBuf]);
}

/** Build a raw RGBA PNG from a pixel-generator function */
function makePNG(size, getPixel) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // RGBA
  // bytes 10-12 are 0 (compression, filter, interlace)

  // Raw scanlines: 1 filter byte + size*4 RGBA bytes per row
  const raw = Buffer.alloc(size * (1 + size * 4));
  for (let y = 0; y < size; y++) {
    const rowBase = y * (1 + size * 4);
    raw[rowBase] = 0; // filter: None
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = getPixel(x, y, size);
      const off = rowBase + 1 + x * 4;
      raw[off] = r;
      raw[off + 1] = g;
      raw[off + 2] = b;
      raw[off + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk("IHDR", ihdrData), chunk("IDAT", compressed), chunk("IEND", Buffer.alloc(0))]);
}

/** ---- Sport icon: classic soccer ball ---- */
function sportPixel(x, y, size) {
  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 4; // outer radius
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Outside circle → transparent
  if (dist > R) return [255, 255, 255, 0];

  // Thin dark border
  if (dist > R - 7) return [17, 24, 39, 255];

  // Normalized position inside circle
  const nx = dx / R;
  const ny = dy / R;

  // Check if point is inside one of the dark pentagon patches
  // Using dot-product distance to patch centers on the sphere projection
  const patches = [
    [0, 0],          // center
    [0, -0.52],      // top
    [0.495, -0.16],  // top-right
    [0.306, 0.42],   // bottom-right
    [-0.306, 0.42],  // bottom-left
    [-0.495, -0.16], // top-left
  ];

  const PATCH_R = 0.18;
  for (const [px, py] of patches) {
    const d = Math.sqrt((nx - px) ** 2 + (ny - py) ** 2);
    if (d < PATCH_R) return [17, 24, 39, 255]; // dark patch
  }

  return [255, 255, 255, 255]; // white ball
}

/** ---- Mind icon: purple circle with white brain outline ---- */
function mindPixel(x, y, size) {
  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 4;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist > R) return [255, 255, 255, 0];
  if (dist > R - 7) return [91, 33, 182, 255]; // dark purple border

  // Purple background
  const bg = [124, 58, 237, 255];

  // Draw a simplified brain as a white shape using two lobes
  // Shift brain slightly up from center
  const bx = dx;
  const by = dy + size * 0.05;

  // Left lobe
  const leftLobeDx = bx + size * 0.15;
  const leftLobeDy = by;
  const leftLobe = Math.sqrt(leftLobeDx ** 2 + (leftLobeDy * 1.2) ** 2) < size * 0.22;

  // Right lobe
  const rightLobeDx = bx - size * 0.15;
  const rightLobeDy = by;
  const rightLobe = Math.sqrt(rightLobeDx ** 2 + (rightLobeDy * 1.2) ** 2) < size * 0.22;

  // Bottom stem
  const stem = Math.abs(bx) < size * 0.04 && by > size * 0.17 && by < size * 0.28;

  if (leftLobe || rightLobe || stem) {
    // Draw white with "folds" (darker stripes)
    // Horizontal fold lines inside each lobe
    const foldLeft = leftLobe && Math.abs((by + size * 0.05) % (size * 0.1) - size * 0.05) < size * 0.015 && leftLobeDx > -size * 0.18;
    const foldRight = rightLobe && Math.abs((by + size * 0.05) % (size * 0.1) - size * 0.05) < size * 0.015 && rightLobeDx < size * 0.18;
    if (foldLeft || foldRight) return [200, 180, 255, 255]; // light fold line
    return [255, 255, 255, 255];
  }

  return bg;
}

const outDir = path.join(__dirname, "..", "public");
fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(path.join(outDir, "icon-sport.png"), makePNG(SIZE, sportPixel));
console.log("✓ public/icon-sport.png");

fs.writeFileSync(path.join(outDir, "icon-mind.png"), makePNG(SIZE, mindPixel));
console.log("✓ public/icon-mind.png");
