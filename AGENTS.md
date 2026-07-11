# AI開発ガイド

赤ちゃん向けのお遊びサービス。
JavaScriptランタイムとツールキットには Bun、デプロイ先には Cloudflare Workers を利用する。

## 開発環境

- プロジェクトの開発環境の構築には、mise を使う
- Git worktree を利用する際は、作成したディレクトリで、`mise trust` を実行すること

## 技術スタック

TODO

## ディレクトリ構造

TODO

## 開発コマンド

TODO

## Cursor Cloud specific instructions

- `mise` は `~/.local/bin/mise` にインストール済みで、`~/.bashrc` で有効化されているため、対話シェルでは `bun` に PATH が通る。
- 起動時の update script は `mise trust` と `mise install` を実行し、固定された Bun バージョンをインストール／更新する。
- 依存の再インストール後もツールバージョンは `mise.toml` により固定される。
