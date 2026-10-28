# Publishing

This package is a community plugin. It is not an official DeepSeek plugin: the
official bundles are `@deepseek-ai/dsh-*` packages shipped with the Harness, and
the upstream repository does not accept external pull requests.

## Before the first publish

1. Create a public GitHub repository named `dsh-side-conversation`.
2. Add the `dsh-plugin` topic to the repository.
3. Replace the omitted `repository` field in `package.json`:

   ```json
   "repository": {
     "type": "git",
     "url": "git+https://github.com/<owner>/dsh-side-conversation.git"
   }
   ```

   The curated market reads the npm package's `repository` field to link it to
   the listed repository, so this must be set before `npm publish`.
4. Make sure `npm whoami` succeeds. Unscoped packages are public by default:

   ```sh
   npm whoami
   npm pack --dry-run
   npm publish --dry-run
   npm publish
   ```

   If the account uses 2FA for writes, pass `--otp=<code>`.

## GitHub

```sh
git remote add origin https://github.com/<owner>/dsh-side-conversation.git
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
url: https://github.com/<owner>/dsh-side-conversation
name: <owner>/dsh-side-conversation
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
