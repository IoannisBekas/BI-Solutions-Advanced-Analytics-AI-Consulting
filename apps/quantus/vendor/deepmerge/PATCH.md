# Local deepmerge security patch

This is **deepmerge 4.3.1-security.1**, a locally maintained copy of upstream
deepmerge 4.3.1. It is not an upstream release. The package name and public API
remain `deepmerge`; the local version identifies the actual source change.

## Provenance

The source, bundled CommonJS/UMD entrypoints, declarations, README, changelog and
MIT license were copied from the official npm 4.3.1 package:

- Upstream: <https://github.com/TehShrike/deepmerge>
- Original archive: <https://registry.npmjs.org/deepmerge/-/deepmerge-4.3.1.tgz>
- Archive integrity: `sha512-3sUqbMEc77XqpdNO7FRyRog+eW3ph+GYCbj+rK+uYyRMuwsVy0rMiVtPn+QJlKFvWP/1PYpapqYn0Me2knFn+A==`
- Advisory: <https://github.com/advisories/GHSA-gcqx-w48m-w2h4>
- Upstream report and discussion: <https://github.com/TehShrike/deepmerge/issues/273>
- Proposed upstream fix: <https://github.com/TehShrike/deepmerge/pull/274>
- Proposed fix commit: `c5ad573121574db1c625b0aabcc6114ed7df6c5a`
- Proposed fix base: `5b87756a5671635679001cbac72aa42f23472c81`

As checked on 2026-10-28, the advisory lists no patched upstream release. PR 274
was closed without merging; its closure provides no technical counterexample to
the guard. This local copy applies that narrow guard, with separate regression
and compatibility tests. Original file SHA-256 values, before patching:

| File | SHA-256 |
| --- | --- |
| `index.js` | `12440c84957c1990ea2d5e33dc0091722dc1dc1585c6d20e0c780e568ffa9d30` |
| `dist/cjs.js` | `2e5160f84a1141bd927264afe4d15766f1e6cf07daef182b37ff53fea121de7d` |
| `dist/umd.js` | `f33e6596482d1fb5c7c427f8ef92f2aa849eea9223acd974176b2fb27ddbf73a` |
| `index.d.ts` | `146ba4b99c5feb82663e17a671bf9f53bb39c704cd76345d6c5a801c26372f44` |
| `license.txt` | `6cfc4687cb2f2d86f4a77e6b526290d3878e5e512f3fec2f4cb36a9cb36f798b` |

## Change and rationale

In `index.js` and its two shipped bundles, `propertyIsForbidden` rejects the
literal string `__proto__` before either the target-copy loop or source-merge
loop assigns it to the newly created destination object. The previous source
guard depended on the target's prototype chain and did not cover all targets;
the target-copy loop had no corresponding guard. A parsed own `__proto__`
property could therefore invoke the destination object's inherited setter and
change that result object's prototype.

The original inherited/non-enumerable property checks remain intact. Ordinary
own `constructor` and `prototype` data keys retain upstream behavior: assigning
them does not invoke that setter. The function export, `.all`, array merging,
cloning options, callbacks, symbol handling and declaration file are unchanged.
The package main remains the self-contained `dist/cjs.js`; the UMD build is
patched as well. `index.js` is the original unbundled source and, as upstream,
requires `is-mergeable-object` if used directly.

## Verification

From `apps/quantus`, run:

```sh
node --test scripts/deepmerge-security.test.cjs
```

Before the guard, these tests failed in six cases: source `__proto__` with a
null-prototype target, a nested null placeholder, and a target with an own
`__proto__`, each against the package main and UMD CommonJS entrypoint. Ten
compatibility cases passed. After the guard, all 16 behavior tests pass, plus an
installation test that verifies Rollup resolves this exact patched copy. The tests also
cover cloned array elements, resolver-style defaults, nested merging, symbols,
ordinary named data keys, `.all`, custom callbacks and `clone: false`.

## Maintenance

The consuming application must resolve its transitive `deepmerge` dependency to
this directory using a local file override and commit the corresponding lockfile
change. The audit threshold must remain unchanged. Remove the local override and
this copy when an official patched version or a compatible dependency update
removes the vulnerable implementation, then repeat the security tests and
application checks. The direct local development dependency and `$deepmerge`
override keep resolution relative to the application root; a direct transitive
file override can otherwise create a broken nested link. `npm ci` and the
installed-consumer regression verify that Rollup resolves this patched copy.
Retain the original MIT attribution while this copy is used.
