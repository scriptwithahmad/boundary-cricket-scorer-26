const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

const filename = path.resolve(__dirname, '../src/engine/cricket.ts');
const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const engineModule = new Module(filename, module);
engineModule.filename = filename;
engineModule.paths = module.paths;
engineModule._compile(compiled, filename);
const c = engineModule.exports;

function fixture() {
  return {
    id: 'test', status: 'live', overs: 20, teamAId: 'a', teamBId: 'b',
    squads: { a: ['a1', 'a2', 'a3', 'a4'], b: ['b1', 'b2'] },
    players: {}, teams: {},
    innings: [{ battingTeamId: 'a', bowlingTeamId: 'b', balls: [],
      striker: 'a1', nonStriker: 'a2', bowler: 'b1', lastOverBowler: null, status: 'live', endReason: undefined }],
  };
}

for (const kind of ['hittwice', 'obstructing', 'retiredout']) {
  const before = fixture();
  const after = c.applyBall(before, { runs: 0, wicket: { kind, playerOutId: 'a1' } });
  const inn = c.currentInnings(after);
  assert.equal(c.totals(inn).wickets, 1, kind);
  assert.equal(c.totals(inn).legal, kind === 'retiredout' ? 0 : 1, kind);
  assert.equal(c.battingCard(inn).find(s => s.id === 'a1').balls, kind === 'retiredout' ? 0 : 1, kind);
  assert.equal(c.bowlingCard(inn).reduce((sum, s) => sum + s.wickets, 0), 0, kind);
  assert.equal(inn.striker, null, kind);
  assert.ok(c.dismissalText(after, c.battingCard(inn).find(s => s.id === 'a1')), kind);
  assert.deepEqual(c.currentInnings(c.undoBall(after)), c.currentInnings(before), `undo ${kind}`);
}

let match = c.applyBall(fixture(), { runs: 0, wicket: { kind: 'bowled' } });
const beforeTimeout = match;
match = c.applyBall(match, { runs: 0, wicket: { kind: 'timedout', playerOutId: 'a3' } });
let inn = c.currentInnings(match);
assert.equal(c.totals(inn).legal, 1);
assert.equal(c.totals(inn).wickets, 2);
assert.equal(c.bowlingCard(inn)[0].wickets, 1);
assert.equal(c.battingCard(inn).find(s => s.id === 'a3').balls, 0);
assert.equal(c.battingCard(inn).find(s => s.id === 'a2').balls, 0);
assert.ok(c.battingOrder(inn).includes('a3'));
assert.equal(inn.striker, null);
assert.equal(inn.nonStriker, 'a2');
assert.deepEqual(c.currentInnings(c.undoBall(match)), c.currentInnings(beforeTimeout));
assert.equal(c.applyBall(match, { runs: 0, wicket: { kind: 'timedout', playerOutId: 'a3' } }), match);
match = c.applyBall(match, { runs: 0, wicket: { kind: 'timedout', playerOutId: 'a4' } });
assert.equal(c.currentInnings(match).endReason, 'All out');

for (const kind of ['hittwice', 'obstructing']) {
  const next = c.applyBall(fixture(), { runs: 0, extra: 'nb', wicket: { kind } });
  assert.equal(c.totals(c.currentInnings(next)).legal, 0);
  assert.equal(c.totals(c.currentInnings(next)).runs, 1);
  assert.equal(c.bowlingCard(c.currentInnings(next))[0].wickets, 0);
}
const runout = c.applyBall(fixture(), { runs: 1, wicket: { kind: 'runout', playerOutId: 'a2' } });
assert.equal(c.totals(c.currentInnings(runout)).runs, 1);
assert.equal(c.bowlingCard(c.currentInnings(runout))[0].wickets, 0);
console.log('Rare dismissal scoring, attribution, ball counts, all-out and undo checks passed.');
