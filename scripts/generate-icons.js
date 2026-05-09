const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const iconDir = path.join(__dirname, "..", "public", "icons");
const svgPath = path.join(iconDir, "icon.svg");

async function generateIcons() {
  const sizes = [
    { size: 192, name: "icon-192x192.png" },
    { size: 512, name: "icon-512x512.png" },
    { size: 180, name: "apple-touch-icon.png" },
  ];

  for (const { size, name } of sizes) {
    await sharp(svgPath)
      .resize(size, size)
      .png()
      .toFile(path.join(iconDir, name));
    console.log(`Generated ${name} (${size}x${size})`);
  }
}

generateIcons().catch(console.error);
