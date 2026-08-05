// Generates Android launcher icons for Sport Mentor
// No external dependencies — uses only built-in Node.js modules (zlib, fs)
const zlib = require("zlib");
const fs = require("fs");
const path = require("path");

// ── PNG writer (same approach as generate-icons.js) ─────────────────────────

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

function makePNG(size, getPixel) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // RGBA
  const raw = Buffer.alloc(size * (1 + size * 4));
  for (let y = 0; y < size; y++) {
    const rowBase = y * (1 + size * 4);
    raw[rowBase] = 0;
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = getPixel(x, y, size);
      const off = rowBase + 1 + x * 4;
      raw[off] = r; raw[off + 1] = g; raw[off + 2] = b; raw[off + 3] = a;
    }
  }
  const compressed = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk("IHDR", ihdrData), chunk("IDAT", compressed), chunk("IEND", Buffer.alloc(0))]);
}

// ── Icon designs ─────────────────────────────────────────────────────────────

// Smooth anti-aliased circle test: returns 0..1 coverage
function circleCoverage(dx, dy, R) {
  const dist = Math.sqrt(dx * dx + dy * dy);
  return Math.max(0, Math.min(1, R - dist + 0.5));
}

// Pentagon patch centres for a classic Telstar soccer ball (sphere-projected)
const PATCHES = [
  [ 0,      0    ],
  [ 0,     -0.52 ],
  [ 0.495, -0.16 ],
  [ 0.306,  0.42 ],
  [-0.306,  0.42 ],
  [-0.495, -0.16 ],
];
const PATCH_R = 0.195;

// Sphere lighting: light source at top-left-front
const LX = -0.35, LY = -0.55, LZ = 0.76;
const LLEN = Math.sqrt(LX * LX + LY * LY + LZ * LZ);

function ballColor(nx, ny, inPatch, edgeFade) {
  const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
  const diffuse = Math.max(0, (nx * LX + ny * LY + nz * LZ) / LLEN);
  // Specular highlight (Phong)
  const rz = 2 * nz * (LZ / LLEN) - (LZ / LLEN);
  const spec = Math.pow(Math.max(0, rz), 18) * 0.5;

  if (inPatch) {
    const v = Math.round((diffuse * 45 + spec * 60) * edgeFade);
    return [v, v, v];
  }
  const v = Math.round((200 + diffuse * 55 + spec * 100) * edgeFade);
  return [Math.min(255, v), Math.min(255, v), Math.min(255, v)];
}

function inAnyPatch(nx, ny) {
  for (const [px, py] of PATCHES) {
    if (Math.sqrt((nx - px) ** 2 + (ny - py) ** 2) < PATCH_R) return true;
  }
  return false;
}

// ic_launcher.png — blue circle background + 3-D shaded football
function launcherPixel(x, y, size) {
  const cx = size / 2, cy = size / 2;
  const dx = x - cx, dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const R = size / 2 - 1;

  if (dist > R + 0.5) return [0, 0, 0, 0];

  const iconAlpha = Math.round(255 * Math.min(1, R - dist + 0.5));
  const BG = [37, 99, 235]; // #2563eb

  // Subtle drop shadow just outside the ball
  const ballR = R * 0.72;
  const shadowR = ballR + Math.max(2, size * 0.03);
  if (dist > ballR + 0.5) {
    if (dist < shadowR) {
      // blend shadow with background
      const t = 1 - (dist - ballR - 0.5) / (shadowR - ballR - 0.5);
      const s = Math.round(t * 60);
      return [Math.max(0, BG[0] - s), Math.max(0, BG[1] - s), Math.max(0, BG[2] - s), iconAlpha];
    }
    return [...BG, iconAlpha];
  }

  // Thin black ball border
  if (dist > ballR - 0.5) return [10, 10, 10, iconAlpha];

  const nx = dx / ballR, ny = dy / ballR;
  const edgeFade = Math.min(1, (ballR - dist) / (ballR * 0.08) + 0.4);
  const [r, g, b] = ballColor(nx, ny, inAnyPatch(nx, ny), edgeFade);
  return [r, g, b, iconAlpha];
}

// ic_launcher_foreground.png — 3-D football on transparent bg (adaptive icon layer)
// Safe zone = inner 72/108 of the canvas; ball fills it fully
function foregroundPixel(x, y, size) {
  const cx = size / 2, cy = size / 2;
  const dx = x - cx, dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const ballR = size * 0.325;

  if (dist > ballR + 0.5) return [0, 0, 0, 0];
  if (dist > ballR - 0.5) return [10, 10, 10, 255];

  const nx = dx / ballR, ny = dy / ballR;
  const edgeFade = Math.min(1, (ballR - dist) / (ballR * 0.08) + 0.4);
  const [r, g, b] = ballColor(nx, ny, inAnyPatch(nx, ny), edgeFade);
  return [r, g, b, 255];
}

// ── Output config ─────────────────────────────────────────────────────────────

const RES = path.join(__dirname, "..", "mobile", "android", "app", "src", "main", "res");

const targets = [
  { dir: "mipmap-mdpi",    launcher: 48,  foreground: 108 },
  { dir: "mipmap-hdpi",    launcher: 72,  foreground: 162 },
  { dir: "mipmap-xhdpi",   launcher: 96,  foreground: 216 },
  { dir: "mipmap-xxhdpi",  launcher: 144, foreground: 324 },
  { dir: "mipmap-xxxhdpi", launcher: 192, foreground: 432 },
];

for (const { dir, launcher, foreground } of targets) {
  const out = path.join(RES, dir);
  fs.mkdirSync(out, { recursive: true });

  fs.writeFileSync(path.join(out, "ic_launcher.png"),       makePNG(launcher,   launcherPixel));
  fs.writeFileSync(path.join(out, "ic_launcher_round.png"), makePNG(launcher,   launcherPixel));
  fs.writeFileSync(path.join(out, "ic_launcher_foreground.png"), makePNG(foreground, foregroundPixel));
  console.log(`✓ ${dir}  (launcher: ${launcher}px, foreground: ${foreground}px)`);
}

console.log("\nDone. Run  npx cap sync android  then rebuild the app.");
