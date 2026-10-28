/* global require, __dirname */
/* eslint-disable @typescript-eslint/no-require-imports -- Exercise the package's CommonJS entrypoints. */
const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const path = require('node:path');
const test = require('node:test');

const vendorDirectory = path.resolve(__dirname, '../vendor/deepmerge');
const installedMerge = require('deepmerge');
const implementations = [
  ['installed package entrypoint', installedMerge],
  ['UMD CommonJS entrypoint', require(path.join(vendorDirectory, 'umd.js'))],
];

test('installed root and Rollup consumers resolve the patched vendor implementation', () => {
  const rollupRequire = createRequire(require.resolve('@rollup/plugin-node-resolve'));
  assert.equal(installedMerge, require(vendorDirectory));
  assert.equal(rollupRequire('deepmerge'), installedMerge);
  assert.equal(rollupRequire.resolve('deepmerge'), require.resolve(vendorDirectory));
  assert.equal(rollupRequire('deepmerge/package.json').version, '4.3.1-security.2');
});

function assertUnpoisoned(value) {
  assert.equal(Object.getPrototypeOf(value), Object.prototype);
  assert.equal(value.isAdmin, undefined);
  assert.equal(Object.hasOwn(value, '__proto__'), false);
  assert.equal(Object.prototype.isAdmin, undefined);
}

for (const [entrypoint, merge] of implementations) {
  test(`${entrypoint}: rejects a source __proto__ key with a null-prototype target`, () => {
    const target = Object.assign(Object.create(null), { debug: false });
    const source = JSON.parse('{"__proto__":{"isAdmin":true}}');
    const result = merge(target, source);
    assertUnpoisoned(result);
    assert.equal(result.debug, false);
  });

  test(`${entrypoint}: rejects a source __proto__ key under a null placeholder`, () => {
    const source = JSON.parse('{"session":{"__proto__":{"isAdmin":true},"name":"learner"}}');
    const result = merge({ session: null }, source);
    assertUnpoisoned(result.session);
    assert.equal(result.session.name, 'learner');
  });

  test(`${entrypoint}: rejects an own __proto__ key copied from the target`, () => {
    const target = JSON.parse('{"__proto__":{"isAdmin":true},"debug":false}');
    const result = merge(target, { verbose: true });
    assertUnpoisoned(result);
    assert.equal(result.debug, false);
    assert.equal(result.verbose, true);
  });

  test(`${entrypoint}: keeps cloned array elements free of injected prototypes`, () => {
    const source = JSON.parse('{"list":[{"__proto__":{"isAdmin":true},"name":"learner"}]}');
    const result = merge({ list: [] }, source);
    assertUnpoisoned(result.list[0]);
    assert.equal(result.list[0].name, 'learner');
    assert.notEqual(result.list[0], source.list[0]);
  });

  test(`${entrypoint}: clones resolver-style defaults without mutating their arrays`, () => {
    const defaults = { extensions: ['.mjs', '.js', '.json', '.node'], dedupe: [], ignoreSideEffectsForRoot: false };
    const result = merge({}, defaults);
    assert.deepEqual(result, defaults);
    assert.notEqual(result.extensions, defaults.extensions);
    assert.notEqual(result.dedupe, defaults.dedupe);
    result.extensions.push('.ts');
    assert.equal(defaults.extensions.includes('.ts'), false);
  });

  test(`${entrypoint}: preserves nested merging, enumerable symbols and ordinary named data keys`, () => {
    const symbol = Symbol('entry');
    const target = Object.assign(Object.create(null), { constructor: { version: 1 }, prototype: { enabled: true } });
    const result = merge(target, { nested: { name: 'learner' }, [symbol]: { count: 2 } });
    assert.deepEqual(result.constructor, { version: 1 });
    assert.deepEqual(result.prototype, { enabled: true });
    assert.deepEqual(result[symbol], { count: 2 });
    assert.equal(Object.getPrototypeOf(result), Object.prototype);
    assert.deepEqual(merge({ nested: { first: 1 } }, { nested: { second: 2 } }), { nested: { first: 1, second: 2 } });
  });

  test(`${entrypoint}: preserves merge.all, array strategies and custom merge callbacks`, () => {
    assert.deepEqual(merge.all([{ list: [1] }, { list: [2] }, { list: [3] }]), { list: [1, 2, 3] });
    assert.throws(() => merge.all({}), /first argument should be an array/);
    const arrayMerge = (_target, source, options) => source.map(item => options.cloneUnlessOtherwiseSpecified(item, options));
    assert.deepEqual(merge({ list: [1] }, { list: [2] }, { arrayMerge }), { list: [2] });
    const customMerge = key => key === 'name' ? (left, right) => ({ value: `${left.value} ${right.value}` }) : undefined;
    assert.deepEqual(merge({ name: { value: 'first' } }, { name: { value: 'last' } }, { customMerge }), { name: { value: 'first last' } });
  });

  test(`${entrypoint}: preserves clone:false and special values`, () => {
    const reference = { nested: true };
    const date = new Date('2026-10-28T00:00:00.000Z');
    const expression = /learning/i;
    const result = merge({}, { reference, date, expression }, { clone: false });
    assert.equal(result.reference, reference);
    assert.equal(result.date, date);
    assert.equal(result.expression, expression);
  });
}
