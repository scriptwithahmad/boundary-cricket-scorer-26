// Preserve the supplied SVG artwork while exporting independent animation layers.
const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');

async function main() {
  const directory = path.resolve(__dirname, '../assets/images');
  const svg = await fs.readFile(path.join(directory, 'logo.svg'), 'utf8');
  const header = svg.slice(0, svg.indexOf('<g clip-path='));
  const body = svg.slice(svg.indexOf('<g clip-path=') + '<g clip-path="url(#rounded)">'.length, svg.lastIndexOf('</g></svg>'));
  const shadowStart = body.indexOf('<g filter="url(#shadow)">');
  const wicketStart = body.indexOf('<g fill="url(#stump)"');
  const wicketEnd = body.indexOf('</g>', wicketStart) + 4;
  const letterStart = body.indexOf('<path d="M342 345');
  const swooshStart = body.indexOf('<path d="M390 474');
  const ballStart = body.indexOf('<g transform="translate(635 622)');
  const textStart = body.indexOf('<g font-family=');
  const layers = {
    background: body.slice(0, shadowStart),
    wickets: `<g filter="url(#shadow)">${body.slice(wicketStart, wicketEnd)}</g>`,
    letter: `<g filter="url(#shadow)">${body.slice(letterStart, swooshStart).trim().replace(/<\/g>$/, '')}</g>`,
    swoosh: body.slice(swooshStart, ballStart),
    ball: body.slice(ballStart, textStart),
    wordmark: body.slice(textStart),
  };
  await fs.mkdir(path.join(directory, 'logo-layers'), { recursive: true });
  for (const [name, content] of Object.entries(layers)) {
    await sharp(Buffer.from(`${header}<g clip-path="url(#rounded)">${content}</g></svg>`))
      .resize(768, 768).png().toFile(path.join(directory, 'logo-layers', `${name}.png`));
  }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
