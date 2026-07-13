# AI開発ガイド

赤ちゃん向けのお遊びサービス。
JavaScriptランタイムとツールキットには Bun、デプロイ先には Cloudflare Workers を利用する。

## 開発環境

- プロジェクトの開発環境の構築には、mise を使う
- Git worktree を利用する際は、作成したディレクトリで、`mise trust` を実行すること

## 技術スタック

- React 19: UI
- Vite 8 + TypeScript 7: 開発サーバー、ビルド、型検査
- Tailwind CSS v4（`@tailwindcss/vite`）: レイアウト・トークン・ユーティリティ
- Cloudflare 公式 Vite プラグイン: Workers Static Assets
- Vitest + React Testing Library + fast-check: 単体・コンポーネント・プロパティベーステスト
- Biome: リンター、フォーマッター、import 整理
- HTMLMediaElement: セッション再生中のループ BGM（`src/assets/sound` の ESM import）

## 開発コマンド

- `bun run dev` - Cloudflare ランタイムを含む Vite 開発サーバー
- `bun run check` - 型検査、Biome、単体テスト
- `bun run build` - 型検査と production build
- `bun run deploy:dry-run` - 実デプロイなしの Cloudflare 検証

## ルール

実装・レビュー・リファクタリングでは、関連ドキュメントを読んでから進める。

- [product-spec.md](./docs/product-spec.md) — 安全制約・セッション要件
- [architecture.md](./docs/architecture.md) — 画面遷移・ディレクトリ・責務
- [code-style.md](./docs/code-style.md) — 命名・ファイル構成
- [testing.md](./docs/testing.md) — テストの選定方針

状態遷移やタイミングの変更は、[testing.md](./docs/testing.md) に従い先に失敗テストを追加する。

## Cursor Cloud specific instructions

- `mise` は `~/.local/bin/mise` にインストール済みで、`~/.bashrc` で有効化されているため、対話シェルでは `bun` に PATH が通る。
- 起動時の update script は `mise trust` と `mise install` を実行し、固定された Bun バージョンをインストール／更新する。
- 依存の再インストール後もツールバージョンは `mise.toml` により固定される。
