# コードスタイル

## 命名

- `html` / `css` / `ts` / `tsx` ファイル名はケバブケース（例: `player-screen.tsx`）
- React コンポーネント定義はパスカルケース（例: `export function PlayerScreen`）

## 実装の指針

- 依頼された問題を解く最小のコードにする。投機的な抽象化や依存追加はしない
- 画面状態は `useReducer` のセッション FSM に寄せる。画面横断のストアを増やさない
- コンテンツは TypeScript 定数として `src/content/` に置く。信頼境界をまたぐ入力が入ったらスキーマ検証を検討する
