const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

const source = fs.readFileSync(require('node:path').join(__dirname, '../src/theme/index.tsx'), 'utf8');
const js = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React },
}).outputText;
const sandbox = { exports: {}, require: (id) => id === 'react' ? { createContext: () => ({}) } : {} };
vm.runInNewContext(js, sandbox);
const { THEME_COLORS, createPalette, darkColors, lightColors } = sandbox.exports;

function luminance(hex) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return c[0] * 0.2126 + c[1] * 0.7152 + c[2] * 0.0722;
}

assert.equal(createPalette('green', true), darkColors);
assert.equal(createPalette('green', false), lightColors);
let checked = 0;
for (const choice of THEME_COLORS) {
  for (const dark of [false, true]) {
    const p = createPalette(choice.value, dark);
    for (const [foreground, background] of [
      [p.text, p.bg], [p.text, p.surface], [p.text, p.surfaceAlt],
      [p.primary, p.primarySoft], [p.onPrimary, p.primary],
      [p.onHero, p.heroA], [p.onHeroMuted, p.heroA],
    ]) {
      const a = luminance(foreground), b = luminance(background);
      const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      assert.ok(ratio >= 4.5, `${choice.value}, dark=${dark}: ${foreground} on ${background}, contrast ${ratio}`);
      checked++;
    }
  }
}
console.log(`Passed ${checked} text contrast checks across ${THEME_COLORS.length * 2} palettes.`);
