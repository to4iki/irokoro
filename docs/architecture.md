# アーキテクチャ

静的 Web アプリ。API Worker はなく、Cloudflare Workers Static Assets で配信する。

## 画面遷移

単一の純粋 Reducer（`sessionReducer`）でセッションを表す。

```
Setup → Playing ↔ Paused → Finished → Setup
```

- 設定変更（pack / duration / sound）は `setup` でのみ有効
- `playing` 中は `deadline` と `remainingMs` で残り時間を管理する
- `paused` では `deadline` を捨て、`remainingMs` だけを保持する
- `finished` からの再開は `RESET` 経由のみ（自動リピートなし）

副作用（タイマー、Web Audio）は `src/app.tsx` に置き、Reducer は純粋に保つ。

## ディレクトリ

| パス | 責務 |
|------|------|
| `src/audio/` | Web Audio の境界とチャイム生成 |
| `src/components/` | Setup / Player / Finish の画面 |
| `src/content/` | 色・形・パック定義（どうぶつ枠含む） |
| `src/features/session/` | 純粋 Reducer と決定的シーケンス |
| `src/test/` | Vitest 共通セットアップ |

## スタイル

- ブランド色・余白などのトークンは `src/styles.css` の `@theme`
- レイアウトは Tailwind ユーティリティ
- 形の clip-path / keyframes など演出専用 CSS は同ファイルに残す

## デプロイ

`wrangler.jsonc` の `assets.not_found_handling: single-page-application` のみ。
ビルド成果物を Static Assets として扱う。
