import sharp from "sharp";

const sizes = [
  { name: "favicon-32.png", size: 32 },
  { name: "favicon-16.png", size: 16 },
  { name: "apple-touch-icon.png", size: 180 },
  { name: "preview.png", width: 1200, height: 630 },
];

const input = "public/favicon-source.png";

async function run() {
  for (const s of sizes) {
    if (s.size) {
      await sharp(input).resize(s.size, s.size).toFile(`public/${s.name}`);
    } else {
      await sharp(input).resize(s.width, s.height).toFile(`public/${s.name}`);
    }
  }

  console.log("Images generated ✅");
}

run();
