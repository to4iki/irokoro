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
- Web Audio API: 外部音源を使わないチャイム合成

### UI / 状態 / スキーマ方針

- **Tailwind**: 採用。ブランド色は `@theme`、レイアウトはユーティリティ、形の clip-path / keyframes は CSS に残す
- **shadcn/ui**: 非採用。再生画面は独自の全画面演出が中心で、Radix系のフォーム／ダイアログ前提の shadcn と噛み合いにくい
- **状態管理**: `useReducer` のまま。画面は Setup → Playing ↔ Paused → Finished の単一 FSM だけなので、Jotai / Zustand は不要
- **TanStack Query**: 非採用。fetch・サーバ状態・キャッシュがない
- **Zod**: 当面非採用。コンテンツは TypeScript 定数。JSON / CMS / URL パラメータなど信頼境界をまたぐ入力が入ったら検討
- **clsx / tailwind-merge**: 非採用。条件クラスは `has-[:checked]` など CSS で足りる

## 命名

- `html` / `css` / `ts` / `tsx` ファイル名はケバブケース（例: `player-screen.tsx`）
- React コンポーネント定義はパスカルケース（例: `export function PlayerScreen`）

## ディレクトリ構造

- `src/audio/` - Web Audio の境界とチャイム生成
- `src/components/` - Setup、Player、Finish の画面コンポーネント
- `src/content/` - 色、形、親子遊びの ContentPack
- `src/features/session/` - 純粋 Reducer と決定的シーケンス
- `src/hooks/` - ブラウザー設定を React に接続する hooks
- `src/test/` - Vitest 共通セットアップ

## 開発コマンド

- `bun run dev` - Cloudflare ランタイムを含む Vite 開発サーバー
- `bun run check` - 型検査、Biome、単体テスト
- `bun run build` - 型検査と production build
- `bun run deploy:dry-run` - 実デプロイなしの Cloudflare 検証

## プロダクト制約

- 音は OFF、時間は 1 分を初期値とする
- 自動リピート、点滅、外部通信、分析 SDK、Cookie を追加しない
- 一時停止と終了を常時提供する
- `prefers-reduced-motion` では移動と拡縮を行わない
- 状態遷移やタイミングの変更は、先に失敗テストを追加する

## テスト方針

数より質。カバレッジは目的ではない。価値の低いテストは削除し、内部実装依存で偽陽性を生むテストは避ける。

### 書く

- 主要フローの最終状態（安全な初期値、一時停止で時間／シーンが止まる、自動リピートしない、など）
- 境界値・ガード（期限ちょうどで終了、不正なシーケンス長、など振る舞いとして意味のある分岐）
- ドメイン不変条件（隣接シーンで色・形が連続しない、dwell が 6–8 秒、など）

### 書かない

- モック呼び出し回数だけの検証（要件が「呼ばれないこと」なら、呼ばれたら即失敗にする）
- 同一観点の過剰分割（自然にまとまる入力整形・後続処理は 1 テストへ）
- 自明な setter / デフォルト→デフォルトのタウトロジー / 型で守れている未知 ID の throw

## Cursor Cloud specific instructions

- `mise` は `~/.local/bin/mise` にインストール済みで、`~/.bashrc` で有効化されているため、対話シェルでは `bun` に PATH が通る。
- 起動時の update script は `mise trust` と `mise install` を実行し、固定された Bun バージョンをインストール／更新する。
- 依存の再インストール後もツールバージョンは `mise.toml` により固定される。
