// Copies the supplied Sport Mentor artwork into Android launcher icon slots.
const fs = require("fs");
const path = require("path");

const source = path.join(__dirname, "..", "public", "sport-mentoring-icon.png");
const resourceRoot = path.join(__dirname, "..", "mobile", "android", "app", "src", "main", "res");
const densities = ["mdpi", "hdpi", "xhdpi", "xxhdpi", "xxxhdpi"];

if (!fs.existsSync(source)) {
  throw new Error(`Icon source not found: ${source}`);
}

for (const density of densities) {
  const outputDirectory = path.join(resourceRoot, `mipmap-${density}`);
  fs.mkdirSync(outputDirectory, { recursive: true });

  for (const filename of ["ic_launcher.png", "ic_launcher_round.png", "ic_launcher_foreground.png"]) {
    fs.copyFileSync(source, path.join(outputDirectory, filename));
  }

  console.log(`Copied supplied icon to mipmap-${density}`);
}

console.log("Android launcher icons updated.");
