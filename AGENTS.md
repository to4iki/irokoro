# AI開発ガイド

赤ちゃん向けのお遊びサービス。
JavaScriptランタイムとツールキットには Bun、デプロイ先には Cloudflare Workers を利用する。

## 開発環境

- プロジェクトの開発環境の構築には、mise を使う
- Git worktree を利用する際は、作成したディレクトリで、`mise trust` を実行すること

## 技術スタック

- React 19 + React Compiler: UI とコンパイル時最適化
- Vite 8 + TypeScript 7: 開発サーバー、ビルド、型検査
- Cloudflare 公式 Vite プラグイン: Workers Static Assets
- Vitest + React Testing Library + fast-check: 単体、コンポーネント、プロパティベーステスト
- Playwright + axe-core: モバイル E2E とアクセシビリティ検査
- Biome: リンター、フォーマッター、import 整理
- Knip: 未使用コード、export、依存パッケージ検査
- Web Audio API: 外部音源を使わないチャイム合成

## ディレクトリ構造

- `e2e/` - Playwright のモバイル E2E とアクセシビリティ検査
- `src/audio/` - Web Audio の境界とチャイム生成
- `src/components/` - Setup、Player、Finish の画面コンポーネント
- `src/content/` - 色、形、親子遊びの ContentPack
- `src/features/session/` - 純粋 Reducer と決定的シーケンス
- `src/hooks/` - ブラウザー設定を React に接続する hooks
- `src/test/` - Vitest 共通セットアップ

## 開発コマンド

- `bun run dev` - Cloudflare ランタイムを含む Vite 開発サーバー
- `bun run check` - 型検査、Biome、単体テスト
- `bun run test:coverage` - カバレッジ閾値を含む Vitest
- `bun run test:e2e` - モバイル Chromium E2E と axe
- `bun run knip` - 未使用コードと依存関係の検査
- `bun run build` - 型検査と production build
- `bun run deploy:dry-run` - 実デプロイなしの Cloudflare 検証

## プロダクト制約

- 音は OFF、時間は 1 分を初期値とする
- 自動リピート、点滅、外部通信、分析 SDK、Cookie を追加しない
- 一時停止と終了を常時提供する
- `prefers-reduced-motion` では移動と拡縮を行わない
- 状態遷移やタイミングの変更は、先に失敗テストを追加する

## Cursor Cloud specific instructions

- `mise` は `~/.local/bin/mise` にインストール済みで、`~/.bashrc` で有効化されているため、対話シェルでは `bun` に PATH が通る。
- 起動時の update script は `mise trust` と `mise install` を実行し、固定された Bun バージョンをインストール／更新する。
- 依存の再インストール後もツールバージョンは `mise.toml` により固定される。
