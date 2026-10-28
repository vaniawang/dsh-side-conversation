# Changelog

All notable changes to this project are documented in this file. The format is
based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this
project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
