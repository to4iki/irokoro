# BGM クレジットと利用条件

確認日: 2026-07-13

## 配布元

- サイト: [もみじばミュージック](https://music.storyinvention.com/)
- 作者: もみじば
- 利用規約: https://music.storyinvention.com/music-riyou-kiyaku/

## 利用している楽曲

| タイトル | 公式ページ |
|----------|------------|
| ひよこの学校 | https://music.storyinvention.com/hiyoko-gakkou/ |
| てちてち生活 | https://music.storyinvention.com/techi-techi-seikatsu/ |
| ゆるゆる授業 | https://music.storyinvention.com/yuruyuru-jugyou/ |

各曲ページに特別条件は記載なし（確認日時点）。

## 利用条件の要約（確認日時点）

利用規約（https://music.storyinvention.com/music-riyou-kiyaku/）より:

- クレジット表記により無料で利用可能
- 個人・法人とも商用利用可、アプリ利用可、編集可
- 著作権放棄ではない
- 禁止例: 二次配布・販売、ストリーミング配信、音楽を聴かせることが主目的のコンテンツ、AI 学習用途など

## いろころでの扱い

- Setup 画面に「BGM: もみじばミュージック」を公式サイトへのリンク付きで表示する（リンク定数は `src/content/music-credits.ts`）
- 音源はアプリ同梱の ESM asset として配信し、直接ダウンロード導線は設けない
- セッション補助の BGM としてのみ再生する（聴取専用コンテンツにはしない）
