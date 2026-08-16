import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildComposeArguments,
  normalizeProjectName,
  resolveProjectName,
} from './compose.mjs';

test('normalizes a cloned directory into a valid Compose project name', () => {
  assert.equal(normalizeProjectName(' My Product! '), 'my-product');
  assert.equal(
    resolveProjectName('development', '/tmp/My Product'),
    'my-product-dev',
  );
  assert.equal(
    resolveProjectName('production', '/tmp/My Product'),
    'my-product-prod',
  );
});

test('builds environment-specific Compose arguments', () => {
  const arguments_ = buildComposeArguments('development', ['up', '--detach']);

  assert.equal(arguments_[0], 'compose');
  assert.ok(arguments_.includes('docker-compose.dev.yml'));
  assert.deepEqual(arguments_.slice(-2), ['up', '--detach']);
});
