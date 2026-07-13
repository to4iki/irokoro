import { IRASUTOYA_SITE_URL } from "../content/animal-credits";
import { MOMIJIBA_SITE_URL } from "../content/music-credits";
import { PACK_CHOICES, type PackId } from "../content/packs";
import { SCREEN_HEADING_ID } from "../features/session/screen-a11y";
import type {
  DurationSeconds,
  SessionPreferences,
} from "../features/session/session-reducer";
import { useFocusScreenHeadingOnMount } from "../features/session/use-focus-screen-heading-on-mount";

type SetupScreenProps = {
  preferences: SessionPreferences;
  onPackChange: (packId: PackId) => void;
  onDurationChange: (duration: DurationSeconds) => void;
  onSoundChange: (enabled: boolean) => void;
  onStart: () => void;
  moveFocus?: boolean;
  /** Prefetch player/finish chunks (vercel bundle-preload). */
  onStartIntent?: () => void;
};

const DURATIONS = [
  { value: 60, label: "1分" },
  { value: 120, label: "2分" },
  { value: 180, label: "3分" },
] as const;

const choiceBase =
  "relative grid min-w-0 cursor-pointer border border-line bg-white/70 text-ink transition-[border-color,box-shadow,background-color,translate] duration-150 has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-white has-[:checked]:shadow-[0_7px_16px_rgb(23_52_81_/_17%)]";

export function SetupScreen({
  preferences,
  onPackChange,
  onDurationChange,
  onSoundChange,
  onStart,
  moveFocus = false,
  onStartIntent,
}: SetupScreenProps) {
  useFocusScreenHeadingOnMount(moveFocus);

  return (
    <main className="relative isolate grid min-h-dvh place-items-center overflow-hidden bg-[radial-gradient(circle_at_8%_7%,rgb(244_201_75_/_34%)_0_8%,transparent_24%),radial-gradient(circle_at_94%_82%,rgb(90_191_157_/_24%)_0_10%,transparent_27%),linear-gradient(145deg,#fff9ed_0%,#f8f4e8_100%)] p-[max(16px,env(safe-area-inset-top,0px))_max(16px,env(safe-area-inset-right,0px))_max(16px,env(safe-area-inset-bottom,0px))_max(16px,env(safe-area-inset-left,0px))] max-[430px]:place-items-stretch max-[430px]:content-center max-[700px]:place-items-start max-[700px]:justify-center">
      <span className="setup-orb setup-orb--circle" aria-hidden="true" />
      <span className="setup-orb setup-orb--triangle" aria-hidden="true" />

      <section
        className="w-full max-w-[500px] rounded-[clamp(24px,6vw,36px)] border border-white/75 bg-paper p-[clamp(18px,4vw,30px)] shadow-soft backdrop-blur-[20px] max-[430px]:max-w-none max-[430px]:rounded-[28px] max-[430px]:px-[18px] max-[430px]:py-5 max-[360px]:rounded-[25px] max-[360px]:p-[17px]"
        aria-labelledby={SCREEN_HEADING_ID}
      >
        <header className="flex items-center gap-3.5 max-[430px]:gap-3">
          <div
            className="brand-mark max-[360px]:w-[49px] max-[360px]:rounded-[15px]"
            aria-hidden="true"
          >
            <span />
            <span />
            <span />
          </div>
          <div>
            <p className="text-[0.73rem] font-extrabold tracking-[0.16em] text-[#526776] uppercase">
              親子で 1〜3分
            </p>
            <h1
              id={SCREEN_HEADING_ID}
              className="text-[clamp(2.25rem,9vw,3.35rem)] leading-none font-black tracking-[0.06em] text-ink max-[430px]:text-[clamp(2.1rem,11vw,2.6rem)] max-[360px]:text-[2.1rem]"
              tabIndex={-1}
            >
              いろころ
            </h1>
          </div>
        </header>

        <p className="mt-3 text-[clamp(0.88rem,3.5vw,1rem)] leading-[1.7] font-semibold text-[#40596a] max-[430px]:text-[0.92rem] max-[360px]:text-[0.82rem] max-[360px]:leading-[1.55]">
          いっしょに話しながら、色をゆっくり眺めよう。
        </p>

        <form
          className="mt-4 grid gap-3 max-[360px]:mt-2.5 max-[360px]:gap-2.5"
          onSubmit={(event) => {
            event.preventDefault();
            onStart();
          }}
        >
          <fieldset>
            <legend className="mb-1.5 text-[0.72rem] font-extrabold tracking-[0.08em] text-[#3f5769]">
              あそび
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {PACK_CHOICES.map((pack) => (
                <label
                  className={`${choiceBase} min-h-[61px] content-center rounded-[15px] px-3.5 py-2.5 max-[360px]:min-h-[54px] max-[360px]:px-2.5 max-[360px]:py-2`}
                  key={pack.id}
                >
                  <input
                    aria-label={pack.shortLabel}
                    checked={preferences.packId === pack.id}
                    className="peer absolute size-px opacity-0"
                    name="pack"
                    onChange={() => onPackChange(pack.id)}
                    type="radio"
                    value={pack.id}
                  />
                  <span className="text-base font-black">{pack.shortLabel}</span>
                  <span className="mt-px text-[0.68rem] font-semibold text-[#5a6d7a] peer-checked:text-[#dbe7ed]">
                    {pack.detail}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-1.5 text-[0.72rem] font-extrabold tracking-[0.08em] text-[#3f5769]">
              じかん
            </legend>
            <div className="grid grid-cols-3 gap-2">
              {DURATIONS.map((duration) => (
                <label
                  className={`${choiceBase} min-h-11 place-items-center rounded-[13px] text-[0.86rem] font-extrabold`}
                  key={duration.value}
                >
                  <input
                    checked={preferences.durationSeconds === duration.value}
                    className="absolute size-px opacity-0"
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

          <div className="flex min-h-[58px] items-center justify-between gap-3 rounded-[15px] border border-line bg-white/60 px-3 py-2.5 max-[360px]:min-h-[54px] max-[360px]:py-1.5">
            <div>
              <p className="text-[0.82rem] font-extrabold text-ink">音をつける</p>
              <p className="mt-0.5 text-[0.64rem] leading-[1.4] text-[#576b79]">
                再生中にやさしいBGMを流します。端末音量もご確認ください。
              </p>
            </div>
            <label className="relative shrink-0 cursor-pointer">
              <span className="sr-only">音をつける</span>
              <input
                checked={preferences.soundEnabled}
                className="peer absolute size-px opacity-0"
                onChange={(event) => onSoundChange(event.target.checked)}
                type="checkbox"
              />
              <span
                className="switch-track block h-[29px] w-[50px] rounded-full bg-[#a3afb7] p-[3px] transition-colors duration-150 peer-checked:bg-[#207b64] peer-checked:[&>span]:translate-x-[21px]"
                aria-hidden="true"
              >
                <span className="block aspect-square w-[23px] rounded-full bg-white shadow-[0_2px_6px_rgb(23_52_81_/_25%)] transition-transform duration-150" />
              </span>
            </label>
          </div>

          <button
            className="flex min-h-[54px] w-full items-center justify-center gap-3 rounded-2xl bg-coral font-black tracking-[0.04em] text-white shadow-[0_9px_20px_rgb(182_73_44_/_24%)] transition-[translate,box-shadow,background-color] duration-150 hover:translate-y-[-1px] hover:bg-[#db5f40] focus-visible:translate-y-[-1px] focus-visible:bg-[#db5f40] max-[430px]:min-h-[52px]"
            onFocus={onStartIntent}
            onPointerEnter={onStartIntent}
            type="submit"
          >
            <span>はじめる</span>
            <span aria-hidden="true">→</span>
          </button>
        </form>

        <p className="mt-3 text-center text-[0.72rem] leading-[1.55] text-[#40596a]">
          BGM:{" "}
          <a
            className="font-extrabold text-ink underline decoration-[#8aa0ae] underline-offset-2 transition-colors hover:text-coral focus-visible:text-coral"
            href={MOMIJIBA_SITE_URL}
            rel="noopener noreferrer"
            target="_blank"
          >
            もみじばミュージック
          </a>
          <br />
          どうぶつイラスト:{" "}
          <a
            className="font-extrabold text-ink underline decoration-[#8aa0ae] underline-offset-2 transition-colors hover:text-coral focus-visible:text-coral"
            href={IRASUTOYA_SITE_URL}
            rel="noopener noreferrer"
            target="_blank"
          >
            いらすとや
          </a>
        </p>

        <p className="mt-2 text-center text-[0.62rem] leading-[1.5] text-[#5c6f7b] max-[360px]:mt-1.5">
          広告・Cookie・アクセス解析・個人情報の収集はありません。
        </p>
      </section>
    </main>
  );
}
