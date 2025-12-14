const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const sizes = [
  { size: 72, name: "icon-72.png" },
  { size: 96, name: "icon-96.png" },
  { size: 128, name: "icon-128.png" },
  { size: 144, name: "icon-144.png" },
  { size: 152, name: "icon-152.png" },
  { size: 192, name: "icon-192.png" },
  { size: 384, name: "icon-384.png" },
  { size: 512, name: "icon-512.png" },
];

async function generateIcons(sourceImage) {
  const iconsDir = path.join(__dirname, "..", "public", "icons");

  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  console.log("Generating PWA icons...\n");

  for (const { size, name } of sizes) {
    const outputPath = path.join(iconsDir, name);

    await sharp(sourceImage)
      .resize(size, size, {
        fit: "contain",
        background: { r: 17, g: 24, b: 39, alpha: 1 }, // #111827 dark background
      })
      .png()
      .toFile(outputPath);

    console.log(`✓ Generated: ${name} (${size}x${size})`);
  }

  // Generate favicon
  const faviconPath = path.join(__dirname, "..", "public", "favicon.ico");
  await sharp(sourceImage)
    .resize(32, 32, {
      fit: "contain",
      background: { r: 17, g: 24, b: 39, alpha: 1 },
    })
    .png()
    .toFile(faviconPath);

  console.log("✓ Generated: favicon.ico (32x32)");

  // Generate apple-touch-icon
  const appleTouchPath = path.join(
    __dirname,
    "..",
    "public",
    "apple-touch-icon.png"
  );
  await sharp(sourceImage)
    .resize(180, 180, {
      fit: "contain",
      background: { r: 17, g: 24, b: 39, alpha: 1 },
    })
    .png()
    .toFile(appleTouchPath);

  console.log("✓ Generated: apple-touch-icon.png (180x180)");

  console.log("\n✅ All icons generated successfully!");
}

const sourceImage = process.argv[2];
if (!sourceImage) {
  console.error("Usage: node generate-icons.js <source-image>");
  console.error("Example: node scripts/generate-icons.js gym-rat-logo.png");
  process.exit(1);
}

if (!fs.existsSync(sourceImage)) {
  console.error(`Error: Source image not found: ${sourceImage}`);
  process.exit(1);
}

generateIcons(sourceImage).catch((err) => {
  console.error("Error generating icons:", err);
  process.exit(1);
});
