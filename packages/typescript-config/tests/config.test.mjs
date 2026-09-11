import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

async function readConfig(name) {
  return JSON.parse(await readFile(new URL(`../${name}`, import.meta.url), 'utf8'));
}

test('base configuration enables strict mode', async () => {
  const config = await readConfig('base.json');
  assert.equal(config.compilerOptions.strict, true);
});

test('node configuration uses NodeNext resolution', async () => {
  const config = await readConfig('node.json');
  assert.equal(config.compilerOptions.moduleResolution, 'NodeNext');
});

test('react configuration does not emit files', async () => {
  const config = await readConfig('react.json');
  assert.equal(config.compilerOptions.noEmit, true);
});
