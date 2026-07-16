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

副作用（タイマー、BGM）は `src/app.tsx` に置き、Reducer は純粋に保つ。
再生中の残り時間 TICK / シーン送りは `startTransition` で送り、一時停止・終了操作を優先する。

## ディレクトリ

| パス | 責務 |
|------|------|
| `src/audio/` | HTMLMediaElement の BGM 境界（再生・一時停止・破棄） |
| `src/components/` | Setup / Player / Finish の画面。再生中の図形は `RollCanvas`（Canvas 2D） |
| `src/content/` | 色・形・パック定義（どうぶつ枠含む）と BGM メタデータ |
| `src/features/session/` | 純粋 Reducer・シーケンス・転がりモーション／Canvas 描画ヘルパ |
| `src/test/` | Vitest 共通セットアップ |

## スタイル

- ブランド色・余白などのトークンは `src/styles.css` の `@theme`
- レイアウトは Tailwind ユーティリティ
- 再生中の図形モーションは Canvas 2D（`requestAnimationFrame`）。一時停止中およびタブ非表示中はループを止める。pause / visibility は ref で見て、ResizeObserver と cast を作り直さない
- Player の scene 領域全体を Canvas stage とし、pose の x/y は幅・高さ基準で描画する。backing store の DPR は上限付き（`resolveCanvasBufferSize`）
- playing 中の scene タップ「ぽん」は `src/features/session/touch-pon.ts` の純粋関数で対象選定とスケール曲線を決め、Canvas 描画時に scale を乗算する（Reducer 非関与）
- `colors` 図形のかお（smile→surprise）は `src/features/session/face.ts` の純粋補間で進め、`draw-shape.ts` が path 描画直後に乗せる
- シーン入場フェードと背景クロスフェードは CSS
- Setup のクレジット表示は `src/content/music-credits.ts`（音源 import 非依存）と `src/content/animal-credits.ts`（画像 import 非依存）を参照する
- どうぶつ画像は `src/content/animals.ts` から ESM import し、Canvas では `drawImage` で描画する。回転は `tilt`（±12°）

## デプロイ

`wrangler.jsonc` の `assets.not_found_handling: single-page-application` のみ。
ビルド成果物を Static Assets として扱う。
