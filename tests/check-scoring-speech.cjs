const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

function load(relativePath, mocks = {}) {
  const filename = path.resolve(__dirname, relativePath);
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const mod = new Module(filename, module);
  mod.filename = filename;
  mod.paths = module.paths;
  const originalRequire = mod.require.bind(mod);
  mod.require = (id) => id in mocks ? mocks[id] : originalRequire(id);
  mod._compile(compiled, filename);
  return mod.exports;
}

const cricket = load('../src/engine/cricket.ts');
const spoken = [];
const spokenOptions = [];
let stops = 0;
let ref = { current: null };
let cleanup;
const speech = load('../src/features/matches/hooks/useScoringSpeech.ts', {
  react: { useRef: () => ref, useEffect: (effect) => { cleanup?.(); cleanup = effect(); } },
  'expo-speech': { stop: async () => { stops++; }, speak: (text, options) => { spoken.push(text); spokenOptions.push(options); } },
  '@/src/engine/cricket': cricket,
});
const fixture = () => ({
  id: 'test', status: 'live', overs: 20, teamAId: 'a', teamBId: 'b',
  squads: { a: ['a1', 'a2', 'a3'], b: ['b1', 'b2'] },
  players: { a1: { name: 'Ali' } }, teams: {},
  innings: [{ battingTeamId: 'a', bowlingTeamId: 'b', balls: [],
    striker: 'a1', nonStriker: 'a2', bowler: 'b1', lastOverBowler: null, status: 'live' }],
});
const render = async (match, enabled, volume = 1) => {
  speech.useScoringSpeech(match, enabled, volume);
  await Promise.resolve();
};

async function main() {
  let match = fixture();
  await render(match, true);
  assert.equal(spoken.length, 0, 'opening scoring must not speak');
  match = cricket.applyBall(match, { runs: 4 });
  await render(match, true);
  assert.equal(spoken.at(-1), 'Four! 4 for 0.');
  await render(match, false);
  match = cricket.applyBall(match, { runs: 6 });
  await render(match, false);
  await render(match, true);
  assert.equal(spoken.length, 1, 'disabled sound and re-enabling must not replay');
  match = cricket.undoBall(match);
  await render(match, true);
  assert.equal(spoken.length, 1, 'undo must not announce an older ball');
  match = cricket.applyBall(match, { runs: 0, extra: 'wd' });
  await render(match, true);
  assert.match(spoken.at(-1), /Wide\. 1 run\. 5 for 0\./);
  match = cricket.applyBall(match, { runs: 0, wicket: { kind: 'bowled' } });
  await render(match, true);
  assert.match(spoken.at(-1), /Ali out\..*5 for 1\./);
  const count = spoken.length;
  cleanup();
  ref = { current: null };
  await render(match, true);
  assert.equal(spoken.length, count, 'reopening a match must not replay history');
  const next = cricket.applyBall(fixture(), { runs: 6 });
  await render(fixture(), true);
  speech.useScoringSpeech(next, true);
  cleanup();
  await Promise.resolve();
  assert.equal(spoken.length, count, 'leaving before speech starts must cancel it');
  assert.ok(stops > 0);
  await render(fixture(), true, 0.25);
  await render(cricket.applyBall(fixture(), { runs: 4 }), true, 0.25);
  assert.equal(spokenOptions.at(-1).volume, 0.25, 'selected volume reaches speech');
  await render(fixture(), true, 0);
  const beforeMute = spoken.length;
  await render(cricket.applyBall(fixture(), { runs: 6 }), true, 0);
  assert.equal(spoken.length, beforeMute, 'zero volume stays silent');
  console.log('Scoring speech checks passed: announcements, toggle, undo, reopen, and cancellation.');
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
