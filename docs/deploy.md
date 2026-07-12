# デプロイ

API Worker はない。`wrangler.jsonc` の `assets.not_found_handling` だけを設定し、Vite のビルド結果を Static Assets として扱う。

接続前でも、実デプロイを行わない dry-run を実行できる。

```sh
bun run deploy:dry-run
```

Cloudflare への接続後、実際に公開するときだけ次を実行する。

```sh
bun run deploy
```
