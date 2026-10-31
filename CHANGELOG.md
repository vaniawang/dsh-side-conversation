# Changelog

All notable changes to this project are documented in this file. The format is
based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this
project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.6.0] - 2026-10-31

### Added

- Context 2.0: the automatic parent snapshot now carries a compact Inline &
  Spill reference index (message/tool IDs and snippets) instead of only a
  recent-message tail.
- `recall_main_conversation` chain-of-recall tool: expand one exact parent
  message or tool call and return the next-hop refs; long histories are not
  copied into every request.
- Compatibility validation against DSH `0.2.1-rc.5`.
- Unit tests for the context index and recall expansion.
- Clean public release: removed internal/company/development-machine references from the trackable tree and release documentation; CI now runs the context test suite.
- Relay confirmation: `send_to_main_conversation` now stages a pending relay; the
  side-chat client asks the human to Send or Discard before the parent receives
  it. Decisions are exposed via `/dsh-side-conversation/relay/{pending,decision}`.
- History restore uses the runtime's native `sessionController.fork` when
  available, with the manual seeded copy as a fallback.

### Changed

- README positions the plugin as a Live Side Branch, explicitly distinct from
  the official `subagentchat` Sidebar catalog.


### Fixed

- Relay now queues through the session controller with a valid user message shape
  and side-session attribution; the old private `followup/inject` path could
  persist a malformed parent event and make the parent log fail replay
  validation.
- Plugin HTTP routes now reject untrusted Host/Origin/fetch-site requests.

## [0.3.0] - 2026-10-28

## [0.2.0] - 2026-10-28

### Added

- Side-conversation history: a History button in the side chat lists earlier
  side sessions for the current parent conversation so old threads can be
  reopened.
- `/dsh-side-conversation/history` endpoint backed by the session query service.
- Opening a historical entry forks it into a catalogued side session so the
  conversation surface can retain it (persisted side sessions are not in the
  client session catalogue).

## [0.1.0] - 2026-10-28

### Added

- Native right-sidebar side conversation rendered with the DSH conversation
  surface.
- One side session per parent conversation and completed-turn boundary, with
  resumable side threads.
- Live parent context injection: status, in-flight reasoning and response
  excerpts, pending tool calls, and a recent-message tail.
- Boundary instructions and a tool guard for subagent, teammate, goal,
  workflow, and loop tools.
- `send_to_main_conversation` relay tool and `read_main_conversation` snapshot
  tool.
- Token and cache usage badge backed by `/dsh-side-conversation/stats`.
- English and Chinese locale metadata, MIT license, and npm bundle packaging.
