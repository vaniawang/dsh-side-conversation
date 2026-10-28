# Publishing

This package is a community plugin. It is not an official DeepSeek plugin: the
official bundles are `@deepseek-ai/dsh-*` packages shipped with the Harness, and
the upstream repository does not accept external pull requests.

## Current state

- GitHub repository: <https://github.com/vaniawang/dsh-side-conversation>
- Release `v0.1.0` with the npm tarball asset is published.
- `package.json` already points `repository` at the GitHub repo; keep it in sync
  if the repository moves. The curated market uses this field to link npm and
  GitHub entries.
- npm publishing is still pending `npm login`.

## Release checklist

1. `npm run check` and `npm run pack:check`.
2. Bump `version` in `package.json` and add a `CHANGELOG.md` entry.
3. `npm publish --dry-run`, then `npm publish`. Unscoped packages are public by
   default; pass `--otp=<code>` when the account uses 2FA for writes.
4. Create a GitHub release tag and attach the tarball.
5. Verify:

   ```sh
   npm view dsh-side-conversation version dist.tarball repository engines license
   ```

## GitHub

```sh
git remote add origin https://github.com/vaniawang/dsh-side-conversation.git
git push -u origin main
```

Write access requires a GitHub login, a personal access token, or a registered
SSH key. Read-only clones work anonymously.

## Curated market listing

`dshmarket` and the Discover index read the `awesome-dsh-plugin` catalog. Do not
open pull requests against the market application. Add one YAML file to
[awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin)
under `data/plugins/<owner>__dsh-side-conversation.yml`:

```yaml
url: https://github.com/vaniawang/dsh-side-conversation
name: vaniawang/dsh-side-conversation
category: session
description:
  en: "Forks the active conversation into an independent native-UI side session, injecting live main context and relaying requests or conclusions back to the main conversation."
  zh: "把当前对话分叉成独立的原生界面侧边会话：读取主对话实时上下文，并把请求或结论带回主对话。"
```

Do not add an `npm:` field; it is derived from the published package's
`repository` field. Listing requirements include a repository at least one day
old, the `dsh-plugin` topic, the `dsh.bundle` declaration, and a public license.

After the pull request merges, the site catalog, the `dsh-plugin-catalog` npm
index, and `dshmarket` refresh automatically, usually within a day.

## Local development install

```sh
dsh plugin --profile <profile> add /path/to/dsh-side-conversation
dsh plugin --profile <profile> remove dsh-side-conversation
```

For a desktop profile, use Settings -> Plugins instead of the CLI.
