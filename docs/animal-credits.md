# どうぶつイラスト クレジットと利用条件

確認日: 2026-07-13

## 配布元

- サイト: [いらすとや](https://www.irasutoya.com/)
- 利用規約: https://www.irasutoya.com/p/terms.html

## 利用している素材（16 点）

| ID | 表示ラベル | 公式ページ | 素材ファイル名 |
|----|------------|------------|----------------|
| dog | わんわん | https://www.irasutoya.com/2017/09/blog-post_108.html | animal_stand_inu.png |
| cat | にゃーにゃー | https://www.irasutoya.com/2017/09/blog-post_763.html | animal_stand_neko.png |
| rabbit | うさぎ | https://www.irasutoya.com/2019/10/blog-post_68.html | animal_usagi_gray.png |
| bird | ことり | https://www.irasutoya.com/2019/08/blog-post_436.html | bird_sekisei_inko_blue.png |
| bear | くま | https://www.irasutoya.com/2016/10/blog-post_2.html | animal_bear_character.png |
| elephant | ぞう | https://www.irasutoya.com/2017/09/blog-post_599.html | animal_stand_zou.png |
| lion | らいおん | https://www.irasutoya.com/2017/09/blog-post_774.html | animal_stand_lion.png |
| frog | かえる | https://www.irasutoya.com/2018/11/blog-post_893.html | animal_stand_kaeru.png |
| pig | ぶた | https://www.irasutoya.com/2017/09/blog-post_966.html | animal_stand_buta.png |
| cow | うし | https://www.irasutoya.com/2017/09/blog-post_653.html | animal_stand_ushi.png |
| horse | うま | https://www.irasutoya.com/2017/09/blog-post_414.html | animal_stand_uma.png |
| sheep | ひつじ | https://www.irasutoya.com/2017/09/blog-post_968.html | animal_stand_hitsuji.png |
| monkey | さる | https://www.irasutoya.com/2017/09/blog-post_520.html | animal_stand_saru.png |
| penguin | ペンギン | https://www.irasutoya.com/2017/09/blog-post_861.html | animal_stand_penguin.png |
| chick | ひよこ | https://www.irasutoya.com/2013/03/blog-post_8130.html | hiyoko.png |
| turtle | かめ | https://www.irasutoya.com/2013/11/blog-post_7608.html | animal_midorigame.png |

同梱ファイルは `src/assets/animals/{id}.png`（余白トリム・最長辺 512px 程度へのリサイズのみ）。

## 利用条件の要約（確認日時点）

いらすとや「ご利用について」より:

- 著作権は放棄されていない
- 規約の範囲内で個人・法人・商用・非商用とも利用可
- 商用の無償利用は **1 制作物あたり 20 点まで**（本パックは 16 点）
- 素材そのものの販売・二次配布、イメージを損なう利用は禁止
- クレジット表記は必須ではないが、本アプリでは Setup で出典を示す

## いろころでの扱い

- Setup 画面に「どうぶつイラスト: いらすとや」を公式サイトへのリンク付きで表示する（定数は `src/content/animal-credits.ts`）
- 画像はアプリ同梱の ESM asset として配信し、外部 CDN は使わない
