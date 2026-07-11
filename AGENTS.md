# AI開発ガイド

`irokoro` は現時点では空の [Bun](https://bun.com) プロジェクトの雛形。
`package.json`・ソースコード・テストはまだ存在せず、ツールチェインのみが設定されている。

## 開発環境

- プロジェクトの開発環境の構築には、mise を使う（`mise.toml` で `bun = "latest"` を固定）
- Git worktree を利用する際は、作成したディレクトリで `mise trust` を実行すること
- 非対話シェルでは `bun` に PATH が通らない場合があるため、mise の shim (`~/.local/share/mise/shims/bun`) を使うか、事前に `eval "$(mise activate bash)"` を実行する

## 技術スタック

- Bun: JavaScript ランタイム兼ツールキット（実行・テスト・パッケージ管理）

## 開発コマンド

- `bun run <file.ts>` - スクリプト実行（`mise.toml` を解決するため `/workspace` 配下で実行すること）
- `bun test` - Bun のテストランナー（テストファイルは未作成）
- `bun install` - 依存パッケージのインストール（依存追加後）

## 注意点

- `bunfig.toml` は `minimumReleaseAge = 86400` と `ignoreScripts = true` を設定している。そのため `bun install` は公開から 24 時間以内のバージョンをインストールせず、ライフサイクル（postinstall 等）スクリプトも既定でスキップされる。
- リンター・ビルドの手順はまだ未設定（`package.json` の scripts が存在しない）。

## Cursor Cloud specific instructions

- `mise` は `~/.local/bin/mise` にインストール済みで、`~/.bashrc` で有効化されているため、対話シェルでは `bun` に PATH が通る。
- 起動時の update script は `mise trust` と `mise install` を実行し、固定された Bun バージョンをインストール／更新する。
- 依存の再インストール後もツールバージョンは `mise.toml` により固定される。
