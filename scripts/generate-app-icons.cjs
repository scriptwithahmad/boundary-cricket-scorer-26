// Run with Sharp installed: npm install --no-save --package-lock=false sharp
const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');

async function main() {
  const directory = path.resolve(__dirname, '../assets/images');
  const source = await fs.readFile(path.join(directory, 'logo.svg'));
  await sharp(source).flatten({ background: '#020907' }).png()
    .toFile(path.join(directory, 'icon.png'));
  await sharp(source).resize(64, 64).png()
    .toFile(path.join(directory, 'favicon.png'));
  await sharp(source).png().toFile(path.join(directory, 'splash-icon.png'));
  // Fit the entire square artwork inside Android's circular safe area.
  const foreground = await sharp(source).resize(480, 480).png().toBuffer();
  await sharp({ create: { width: 1024, height: 1024, channels: 4, background: '#00000000' } })
    .composite([{ input: foreground, gravity: 'centre' }]).png()
    .toFile(path.join(directory, 'adaptive-icon.png'));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
