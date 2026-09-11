import assert from 'node:assert/strict';
import test from 'node:test';

import { nodeConfig, reactConfig } from '../index.mjs';

test('exports non-empty flat configurations', () => {
  assert.ok(Array.isArray(nodeConfig));
  assert.ok(nodeConfig.length > 0);
  assert.ok(Array.isArray(reactConfig));
  assert.ok(reactConfig.length >= nodeConfig.length);
});
