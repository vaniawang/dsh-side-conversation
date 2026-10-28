# Side Conversation

[![ci](https://github.com/vaniawang/dsh-side-conversation/actions/workflows/ci.yml/badge.svg)](https://github.com/vaniawang/dsh-side-conversation/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/dsh-side-conversation.svg)](https://www.npmjs.com/package/dsh-side-conversation)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A DeepSeek Harness plugin that opens a native side conversation next to the
current conversation.

> **Community plugin.** This package is not an official DeepSeek plugin and is
> not affiliated with DeepSeek. Official bundles ship with the Harness.

The side conversation is a real forked session: it inherits the parent's
completed history, runs with the normal conversation UI and tools, and receives
a live snapshot of the parent on every request. It can relay a request or
conclusion back to the parent, and it reports its own token and cache usage.

## Features

- **Native conversation surface** — the side chat uses the host's own chat view,
  composer, model selector, reasoning effort, permission picker, attachments,
  commands, and stop controls.
- **Forked baseline** — one side session per parent conversation and completed
  turn boundary. Reopening before the parent advances resumes the same side
  session; after the parent completes a new turn, a fresh fork is created from
  the new boundary.
- **Live parent context** — every request includes the parent's current state:
  running/idle status, in-flight reasoning and response excerpts, tool calls in
  flight or awaiting results, and a recent-message tail.
- **Conversation boundary** — inherited history is reference material. The side
  agent is instructed not to continue the parent task or mutate the workspace
  unless explicitly asked.
- **Tool guard** — subagent, teammate, goal, workflow, and loop tools stay in the
  tool schema but are rejected inside a side conversation.
- **Relay** — the side agent can deliver a user-requested message to the parent
  conversation through the `send_to_main_conversation` tool.
- **Usage stats** — a badge shows the last request and cumulative token/cache
  usage; the `read_main_conversation` tool lets the agent request a larger
  parent snapshot.

## Requirements

- DeepSeek Harness `0.2.1-rc.1` or newer on the `0.2.1` line (`engines.dsh`).
- Node.js 22.19 or newer.

## Installation

In DSH Desktop, open **Settings → Plugins**, search for `dsh-side-conversation`,
and install it. The plugin manager links or installs the bundle into the active
profile. The npm package is published as
[`dsh-side-conversation`](https://www.npmjs.com/package/dsh-side-conversation).

From a terminal with the DSH CLI:

```sh
dsh plugin --profile <profile> add dsh-side-conversation
```

From a local checkout:

```sh
dsh plugin --profile <profile> add /path/to/dsh-side-conversation
```

Reload the Web UI after installation if the plugin list does not refresh itself.

If the package is not on npm yet, install from the repository or the release
tarball:

```sh
dsh plugin --profile <profile> add github:vaniawang/dsh-side-conversation
# or
dsh plugin --profile <profile> add ./dsh-side-conversation-0.1.0.tgz
```

## Usage

1. Open a conversation and click the side-conversation button in the header
   utilities.
2. Ask questions about the parent conversation, request analysis, or have a
   separate discussion.
3. To send a result back, ask the side agent to send it to the parent
   conversation; it uses the relay tool.
4. The badge in the top-right corner of the side panel shows the last request's
   input tokens and cache hit rate.

## How It Works

The host half watches the parent conversation and the side agents:

- `POST /dsh-side-conversation/open` creates or resumes a side session for the
  parent's latest completed turn boundary.
- `GET /dsh-side-conversation/stats` returns token, cache, and context usage for
  a live side session.
- `GET /dsh-side-conversation/health` reports the host and client build.

The side session is an ordinary session with its own agent, so it does not
append subagent notices to the parent. Parent state is injected through a
dynamic runtime context; the boundary and instructions are registered as
per-agent prompt sections.

## Compatibility

The plugin targets the `0.2.1` release line and is tested against
`0.2.1-rc.3`. It uses only public Harness extension points (Web routes, agent
tools, prompt sections, session API, and client slots).

## Privacy

The plugin makes no network requests of its own. Model requests go through the
Harness's configured provider, and the side session transcript includes context
inherited from the parent conversation. Files in the parent conversation are
not copied; the side agent can read them through normal tools when needed.

## Development

```sh
npm run check
npm run pack:check
npm pack
```

`npm run check` runs `node --check` on both halves plus the package metadata
validator in `scripts/validate.mjs`. The published package contains the host
half, the client half, the bundle patch, locale metadata, and the icon. There is
no build step.

## Contributing

Issues and pull requests are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for
the local checks and commit conventions. The release process is documented in
[PUBLISHING.md](PUBLISHING.md).

## Security

Report vulnerabilities privately through GitHub security advisories. See
[SECURITY.md](SECURITY.md).

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

## License

MIT. See [LICENSE](LICENSE).
