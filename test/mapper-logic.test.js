import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

function logic() {
  const html = readFileSync(new URL('../tilt-tender-mapper.html', import.meta.url), 'utf8');
  const match = html.match(/\/\* LOGIC_START \*\/([\s\S]*?)\/\* LOGIC_END \*\//);
  assert.ok(match, 'expected a marked logic block in the application');
  const context = {};
  vm.createContext(context);
  vm.runInContext(`${match[1]}\nthis.api = { cellFromPoint, cellKey, parseCellKey, createDefaultState, fitBackground, paintCell, undo, redo, makeProject, validateProject, makeGameData };`, context);
  return context.api;
}

function equalData(actual, expected) {
  assert.equal(JSON.stringify(actual), JSON.stringify(expected));
}

test('converts game-pixel positions into 2px logical cells', () => {
  const { cellFromPoint } = logic();
  equalData(cellFromPoint(159.9, 239.9, 2), { x: 79, y: 119 });
});

test('keeps cell keys lossless', () => {
  const { cellKey, parseCellKey } = logic();
  equalData(parseCellKey(cellKey(42, 18)), { x: 42, y: 18 });
});

test('creates a 160 by 240 project with a 2px grid by default', () => {
  const { createDefaultState, makeProject } = logic();
  equalData(makeProject(createDefaultState()).canvas, { width: 160, height: 240, cellSize: 2 });
});

test('fits a 1200 by 1800 image proportionally inside the table', () => {
  const { fitBackground } = logic();
  equalData(fitBackground(1200, 1800), { x: 0, y: 0, scale: 0.13333333333333333 });
});

test('painting then undoing restores an empty category', () => {
  const { createDefaultState, paintCell, undo } = logic();
  const state = createDefaultState();
  paintCell(state, 'bumpers', { x: 42, y: 18 }, true);
  undo(state);
  assert.equal(state.parts.bumpers.size, 0);
});

test('game data exports category cells as numeric coordinate pairs', () => {
  const { createDefaultState, paintCell, makeGameData } = logic();
  const state = createDefaultState();
  paintCell(state, 'walls', { x: 0, y: 0 }, true);
  equalData(makeGameData(state).parts.walls, [[0, 0]]);
});

test('rejects project files with an unsupported version', () => {
  const { validateProject } = logic();
  assert.throws(() => validateProject({ version: 99 }), /Unsupported project version/);
});
