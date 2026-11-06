const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const walk = directory => fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry =>
  entry.isDirectory() ? walk(path.join(directory, entry.name)) : [path.join(directory, entry.name)]);
const sourceFiles = walk(path.join(root, 'src')).filter(file => /\.tsx?$/.test(file));
for (const file of sourceFiles) {
  const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
  const relative = path.relative(root, file).replaceAll('\\', '/');
  for (const node of source.statements) {
    if (!ts.isImportDeclaration(node) && !ts.isExportDeclaration(node)) continue;
    const specifier = node.moduleSpecifier?.text;
    if (!specifier) continue;
    if (relative.startsWith('src/components/ui/')) {
      assert.ok(!specifier.includes('/features/'), `Shared UI must not import feature code: ${relative}`);
    }
    if (relative.startsWith('src/types/') || relative.startsWith('src/engine/')) {
      assert.ok(!/\/components\/|\/features\/|react-native|expo-router/.test(specifier), `Domain code must not depend on presentation: ${relative}`);
    }
  }
}
const routes = [
  'app/(tabs)/index.tsx', 'app/(tabs)/teams.tsx', 'app/(tabs)/stats.tsx',
  'app/(tabs)/settings.tsx', 'app/(tabs)/history.tsx', 'app/team/[id].tsx',
  'app/player/[id].tsx', 'app/match/new.tsx', 'app/match/[id]/index.tsx', 'app/match/[id]/score.tsx',
];
for (const route of routes) {
  assert.match(fs.readFileSync(path.join(root, route), 'utf8').trim(), /^export \{ default \} from ['"]@\/src\/features\/[^'"]+['"];$/, `Keep route entry points thin: ${route}`);
}
assert.ok(!fs.existsSync(path.join(root, 'yarn.lock')), 'Use the npm lockfile consistently');
assert.ok(fs.existsSync(path.join(root, 'package-lock.json')));
console.log(`Architecture boundaries and ${routes.length} route entry points passed.`);
