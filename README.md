# いろころ

保護者が赤ちゃんに語りかけながら、色とかたちを1〜3分だけ楽しむための
小さな親子向けWebツールです。絵本や人との関わりの代替ではなく、画面の外の
遊びへつなぐ短時間の補助ツールとして設計しています。

安全制約の詳細は [docs/product-spec.md](./docs/product-spec.md) を参照してください。

## 技術スタック

- React 19
- Vite 8 + TypeScript 7
- Tailwind CSS v4（ブランドトークンは `@theme`）
- Cloudflare公式Viteプラグイン + Workers Static Assets
- Vitest + React Testing Library + fast-check
- Biome
- Bun（`mise.toml` で固定）

画面遷移とディレクトリの責務は [docs/architecture.md](./docs/architecture.md) を参照してください。

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
