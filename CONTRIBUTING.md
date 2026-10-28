# Contributing

Thanks for taking the time to contribute.

## Reporting issues

Open a GitHub issue using the provided template. Include the plugin version, the
DSH version, the platform, and a minimal reproduction. Remove API keys, tokens,
and private conversation content from logs before pasting them.

## Pull requests

1. Fork the repository and create a topic branch from `main`.
2. Keep the change focused. Fixes and features should not mix unrelated
   refactors or formatting changes.
3. Run the local checks:

   ```sh
   node --check index.js
   node --check client.js
   node scripts/validate.mjs
   npm pack --dry-run
   ```

4. Write a conventional commit message (`feat:`, `fix:`, `docs:`, `chore:`).
5. Open the pull request and describe the behavior change, the verification,
   and any compatibility concerns with the DSH `0.2.1` line.

## Development setup

The plugin has no build step. For a local install:

```sh
dsh plugin --profile <profile> add /path/to/dsh-side-conversation
```

The host half runs in Node; the client half is a browser bundle loaded by the
Harness module loader. Keep host and client changes separate when possible.

## Community plugin policy

This is a community plugin. It is not part of the DeepSeek Harness repository
and does not depend on private APIs. Use only documented extension points so the
plugin continues to work across patch releases.
