import { CONTENT_PACKS, type PackId } from "../content/packs";
import {
  type DurationSeconds,
  type SessionPreferences,
} from "../features/session/sessionReducer";

type SetupScreenProps = {
  preferences: SessionPreferences;
  onPackChange: (packId: PackId) => void;
  onDurationChange: (duration: DurationSeconds) => void;
  onSoundChange: (enabled: boolean) => void;
  onStart: () => void;
};

const DURATIONS = [
  { value: 60, label: "1分" },
  { value: 120, label: "2分" },
  { value: 180, label: "3分" },
] as const;

export function SetupScreen({
  preferences,
  onPackChange,
  onDurationChange,
  onSoundChange,
  onStart,
}: SetupScreenProps) {
  return (
    <main className="setup-screen">
      <section className="setup-card" aria-labelledby="app-title">
        <header className="brand">
          <div className="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div>
            <p className="eyebrow">親子で 1〜3分</p>
            <h1 id="app-title">いろころ</h1>
          </div>
        </header>

        <p className="setup-lead">
          いっしょに話しながら、色とかたちをゆっくり眺めよう。
        </p>

        <aside className="safety-note" aria-label="短時間利用のお願い">
          <span aria-hidden="true">⌛</span>
          <p>
            <strong>短い時間で楽しみましょう。</strong>
            画面から目を離したくなったら、いつでもおしまいにできます。
          </p>
        </aside>

        <form
          className="setup-form"
          onSubmit={(event) => {
            event.preventDefault();
            onStart();
          }}
        >
          <fieldset>
            <legend>あそび</legend>
            <div className="choice-grid choice-grid--packs">
              {Object.values(CONTENT_PACKS).map((pack) => (
                <label className="choice-card" key={pack.id}>
                  <input
                    aria-label={pack.shortLabel}
                    checked={preferences.packId === pack.id}
                    name="pack"
                    onChange={() => onPackChange(pack.id)}
                    type="radio"
                    value={pack.id}
                  />
                  <span className="choice-card__title">{pack.shortLabel}</span>
                  <span className="choice-card__description">
                    {pack.id === "colors" ? "8つの色" : "4つのかたち"}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>じかん</legend>
            <div className="choice-grid choice-grid--time">
              {DURATIONS.map((duration) => (
                <label className="time-choice" key={duration.value}>
                  <input
                    checked={preferences.durationSeconds === duration.value}
                    name="duration"
                    onChange={() => onDurationChange(duration.value)}
                    type="radio"
                    value={duration.value}
                  />
                  <span>{duration.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="sound-setting">
            <div>
              <p className="sound-setting__label">音をつける</p>
              <p className="sound-setting__hint">
                小さな合成音です。端末音量もご確認ください。
              </p>
            </div>
            <label className="switch">
              <span className="sr-only">音をつける</span>
              <input
                checked={preferences.soundEnabled}
                onChange={(event) => onSoundChange(event.target.checked)}
                type="checkbox"
              />
              <span className="switch__track" aria-hidden="true">
                <span className="switch__thumb" />
              </span>
            </label>
          </div>

          <button className="primary-button" type="submit">
            <span>はじめる</span>
            <span aria-hidden="true">→</span>
          </button>
        </form>

        <p className="privacy-note">
          広告・Cookie・アクセス解析・個人情報の収集はありません。
        </p>
      </section>
    </main>
  );
}
