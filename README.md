# いろころ

保護者が赤ちゃんに語りかけながら、色とかたちを1〜3分だけ楽しむための
小さな親子向けWebツールです。絵本や人との関わりの代替ではなく、画面の外の
遊びへつなぐ短時間の補助ツールとして設計しています。

## 安全上の位置付け

- 初期時間は1分、音は常にOFFです。
- 一時停止と終了は、再生中いつでも操作できます。
- 終了後に自動再生・自動リピートしません。
- 点滅、急な白画面、赤色フラッシュを使いません。
- `prefers-reduced-motion` では移動と拡縮を止め、クロスフェードだけにします。
- 広告、分析SDK、Cookie、外部CDN、個人情報収集、バックエンド通信はありません。
- 1歳未満の座位でのスクリーン時間を勧めるものではありません。保護者が
  そばで見守り、短時間で終了してください。

## 技術スタック

- React 19
- Vite 8 + TypeScript 7
- Tailwind CSS v4（ブランドトークンは `@theme`）
- Cloudflare公式Viteプラグイン + Workers Static Assets
- Vitest + React Testing Library + fast-check
- Biome
- Bun（`mise.toml` で固定）

画面遷移は外部状態管理を使わず、純粋な Reducer で
`Setup → Playing → Paused ↔ Playing → Finished → Setup` を表現しています。
色・形のシーケンスとチャイムはすべてローカルで生成します。

入れていないもの（現状の規模では依存コストが勝つ）:

- shadcn/ui … 全画面演出中心で、Radix系フォームキットの恩恵が薄い
- Zod … 外部入力がなく、TypeScript 定数で十分
- TanStack Query … サーバ状態・fetch がない
- Jotai / Zustand … 単一 FSM の `useReducer` で足りる

## ローカル開発

```sh
mise trust
mise install
bun install --frozen-lockfile
bun run dev
```

表示されたローカルURLをブラウザで開いてください。

## 品質チェック

```sh
bun run check
bun run build
```

## Cloudflare Workers Static Assets

API Workerはありません。`wrangler.jsonc` の
`assets.not_found_handling` だけを設定し、Viteのビルド結果をStatic Assetsとして
扱います。

接続前でも、実デプロイを行わないdry-runを実行できます。

```sh
bun run deploy:dry-run
```

Cloudflareへの接続後、実際に公開するときだけ次を実行します。

```sh
bun run deploy
```
