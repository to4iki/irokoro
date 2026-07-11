# irokoro

## Cursor Cloud specific instructions

This repo is currently an empty [Bun](https://bun.com) project scaffold: there is no `package.json`, source code, or tests yet. Only the toolchain is configured.

### Toolchain
- Tool versions are managed by [mise](https://mise.jdx.dev) via `mise.toml`, which pins `bun = "latest"`.
- `mise` is installed at `~/.local/bin/mise` and activated in `~/.bashrc`, so `bun` is on `PATH` in interactive shells. In non-interactive shells, invoke via the mise shim (`~/.local/share/mise/shims/bun`) or run `eval "$(mise activate bash)"` first.
- The startup update script runs `mise trust` + `mise install`, which installs/refreshes the pinned Bun version.

### Running / testing / building
- Run a script: `bun run <file.ts>` (must be run from within `/workspace` so `mise.toml` resolves the tool version).
- Tests: `bun test` (the Bun test runner; no test files exist yet).
- There is no lint or build step configured yet (no `package.json` scripts).
- Once dependencies are added, install with `bun install`.

### Gotcha
- `bunfig.toml` sets `minimumReleaseAge = 86400` and `ignoreScripts = true` for installs. This means `bun install` will refuse to install package versions published in the last 24 hours, and lifecycle/postinstall scripts are skipped by default.
