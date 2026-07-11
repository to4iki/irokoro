import { FINISH_SUGGESTIONS } from "../content/packs";

type FinishScreenProps = {
  lastSceneIndex: number;
  onReset: () => void;
};

export function FinishScreen({ lastSceneIndex, onReset }: FinishScreenProps) {
  const suggestion = FINISH_SUGGESTIONS[lastSceneIndex % FINISH_SUGGESTIONS.length];

  return (
    <main className="finish-screen">
      <section className="finish-card" aria-labelledby="finish-title">
        <div className="finish-illustration" aria-hidden="true">
          <span className="finish-sun" />
          <span className="finish-hill finish-hill--back" />
          <span className="finish-hill finish-hill--front" />
        </div>
        <p className="eyebrow">たのしかったね</p>
        <h1 id="finish-title">おしまい</h1>
        <p className="finish-lead">画面を閉じて、今度はお部屋で見つけてみよう。</p>
        <aside className="next-play">
          <span aria-hidden="true">✦</span>
          <div>
            <p>つぎの親子あそび</p>
            <strong>{suggestion}</strong>
          </div>
        </aside>
        <button className="secondary-button" onClick={onReset} type="button">
          はじめの画面へ
        </button>
        <p className="finish-note">
          自動では再開しません。続けるときは、もう一度設定してください。
        </p>
      </section>
    </main>
  );
}
