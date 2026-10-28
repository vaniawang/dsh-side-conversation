# Security

## Reporting a vulnerability

Please report vulnerabilities privately through GitHub's
[security advisory form](https://github.com/vaniawang/dsh-side-conversation/security/advisories/new)
instead of opening a public issue. Include a description, reproduction steps,
and the affected version. You will get a response as soon as possible.

## Scope

The plugin runs inside the DSH host with the permissions of the active profile.
Security-relevant areas:

- the local HTTP routes under `/dsh-side-conversation/` (same-origin only; no
  authentication beyond the host's local binding);
- the side agent's tool surface, including the tool guard and relay tool;
- context injection from the parent conversation into the side agent.

The plugin makes no outbound network requests. Model traffic is handled by the
Harness's configured provider.

## Supported versions

Only the latest published version is supported. Fixes are released as patch
versions.
