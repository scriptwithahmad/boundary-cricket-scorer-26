// Metro's development bundle follows the Lucide barrel into every icon.
// Resolve named icon imports to their files, keeping aliases and types intact.
const fs = require('fs');
const path = require('path');

module.exports = function ({ types: t }) {
  const root = path.dirname(require.resolve('lucide-react-native/package.json'));
  const entry = fs.readFileSync(path.join(root, 'dist/esm/lucide-react-native.js'), 'utf8');
  const icons = new Map();
  for (const match of entry.matchAll(/export \{([^}]+)\} from '\.\/icons\/([^']+)';/g)) {
    for (const alias of match[1].matchAll(/default as (\w+)/g)) {
      icons.set(alias[1], `lucide-react-native/dist/esm/icons/${match[2]}`);
    }
  }
  return {
    name: 'boundary-lucide-imports',
    visitor: {
      ImportDeclaration(importPath) {
        const node = importPath.node;
        if (node.source.value !== 'lucide-react-native' || node.importKind === 'type') return;
        const replacements = [];
        const remaining = [];
        for (const specifier of node.specifiers) {
          const target = t.isImportSpecifier(specifier) && specifier.importKind !== 'type'
            ? icons.get(specifier.imported.name) : undefined;
          if (target) replacements.push(t.importDeclaration([t.importDefaultSpecifier(specifier.local)], t.stringLiteral(target)));
          else remaining.push(specifier);
        }
        if (!replacements.length) return;
        if (remaining.length) replacements.push(t.importDeclaration(remaining, node.source));
        importPath.replaceWithMultiple(replacements);
      },
    },
  };
};
