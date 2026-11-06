const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const files = fs.readdirSync(__dirname).filter(name => /^check-.*\.cjs$/.test(name)).sort();
let failed = false;
for (const file of files) {
  const result = spawnSync(process.execPath, [path.join(__dirname, file)], { cwd: root, stdio: 'inherit' });
  if (result.error) console.error(result.error);
  if (result.error || result.status !== 0) failed = true;
}
if (failed) process.exitCode = 1;
else console.log(`All ${files.length} verification scripts passed.`);
