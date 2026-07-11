import type { CSSProperties } from "react";
import { CONTENT_PACKS, getColor, getShape } from "../content/packs";
import type { Scene } from "../features/session/sequence";
import type { SessionState } from "../features/session/session-reducer";
import { cn } from "../lib/cn";

type PlayerState = Extract<SessionState, { status: "playing" | "paused" }>;

type PlayerScreenProps = {
  state: PlayerState;
  scene: Scene;
  reducedMotion: boolean;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
};

type SceneStyle = CSSProperties & {
  "--scene-background": string;
  "--shape-color": string;
  "--shimmer-iterations": number;
};

function formatRemaining(remainingMs: number): string {
  const seconds = Math.ceil(remainingMs / 1_000);
  return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`;
}

export function PlayerScreen({
  state,
  scene,
  reducedMotion,
  onPause,
  onResume,
  onStop,
}: PlayerScreenProps) {
  const color = getColor(scene.colorId);
  const shape = getShape(scene.shapeId);
  const pack = CONTENT_PACKS[state.preferences.packId];
  const style: SceneStyle = {
    "--scene-background": color.background,
    "--shape-color": color.foreground,
    "--shimmer-iterations": Math.ceil(state.preferences.durationSeconds / 8),
  };

  return (
    <main
      aria-label={`${pack.shortLabel}の再生画面`}
      className="player-screen relative isolate grid h-dvh grid-rows-[auto_auto_1fr_auto] overflow-hidden text-white select-none touch-manipulation p-[max(16px,env(safe-area-inset-top,0px))_max(16px,env(safe-area-inset-right,0px))_max(18px,env(safe-area-inset-bottom,0px))_max(16px,env(safe-area-inset-left,0px))]"
      data-motion={reducedMotion ? "reduced" : "full"}
      data-paused={state.status === "paused"}
      style={style}
    >
      <h1 className="sr-only">{pack.title}</h1>
      <header className="z-10 flex items-center justify-between gap-4">
        <div className="flex min-h-[42px] items-center gap-1.5 rounded-full border border-white/28 bg-[rgb(14_32_48_/_64%)] px-3.5 text-[0.82rem] font-extrabold tracking-[0.06em] text-white shadow-[0_8px_24px_rgb(0_0_0_/_10%)] backdrop-blur-[12px] max-[430px]:min-h-11">
          <span className="text-[0.7rem] text-[#f9d25e]" aria-hidden="true">
            ●
          </span>
          いろころ
        </div>
        <div
          className="flex min-h-[42px] items-center gap-1.5 rounded-full border border-white/28 bg-[rgb(14_32_48_/_64%)] px-3 text-white shadow-[0_8px_24px_rgb(0_0_0_/_10%)] backdrop-blur-[12px] max-[430px]:min-h-11"
          role="timer"
          aria-label="残り時間"
        >
          <span className="text-[0.65rem] font-bold text-[#d9e4e9]" aria-hidden="true">
            のこり
          </span>
          <output
            className="min-w-[39px] text-right text-[0.87rem] font-black tabular-nums"
            aria-live="off"
          >
            {formatRemaining(state.remainingMs)}
          </output>
        </div>
      </header>

      <progress
        aria-label="セッションの残り時間"
        max={state.preferences.durationSeconds * 1_000}
        value={state.remainingMs}
      />

      <section
        aria-label={`${color.label}の${shape.label}`}
        className="scene grid min-h-0 place-content-center place-items-center max-[430px]:gap-[18px]"
      >
        <div
          className="grid aspect-square w-[min(72vw,56dvh,360px)] place-items-center max-[430px]:w-[min(74vw,48dvh,320px)] max-[700px]:w-[min(52vw,42dvh,280px)]"
          key={scene.id}
        >
          <div
            aria-hidden="true"
            className={`visual-shape visual-shape--${shape.id}`}
          />
        </div>
        <p
          className="scene-cue max-w-[calc(100vw-36px)] rounded-full border border-white/26 bg-[rgb(13_29_43_/_70%)] px-[18px] py-2.5 text-[clamp(0.9rem,4vw,1.05rem)] font-extrabold tracking-[0.06em] text-white shadow-[0_8px_24px_rgb(0_0_0_/_10%)] backdrop-blur-[12px] max-[430px]:px-[18px] max-[430px]:py-3 max-[430px]:text-base max-[700px]:py-2"
          data-testid="scene-cue"
          key={`cue-${scene.id}`}
        >
          {pack.cue(scene)}
        </p>
        {reducedMotion && (
          <p className="mt-2 rounded-lg bg-[rgb(13_29_43_/_70%)] px-2.5 py-1.5 text-[0.66rem] font-bold text-white">
            動きを抑えて表示しています
          </p>
        )}
      </section>

      {state.status === "paused" && (
        <div
          className="absolute top-1/2 left-1/2 z-20 w-[min(calc(100%-40px),330px)] -translate-x-1/2 -translate-y-1/2 rounded-[28px] border border-white/38 bg-[rgb(255_249_236_/_94%)] p-6 text-center text-ink shadow-[0_24px_60px_rgb(0_0_0_/_22%)] backdrop-blur-[22px]"
          role="status"
        >
          <span
            className="block text-[2.5rem] leading-none text-[#5f91aa]"
            aria-hidden="true"
          >
            ☁
          </span>
          <h2 className="mt-2 text-[1.7rem]">ひとやすみ</h2>
          <p className="mt-1.5 text-[0.78rem] font-semibold text-[#4f6472]">
            画面も時間も止まっています。
          </p>
        </div>
      )}

      <div className="z-30 mx-auto grid w-[min(100%,440px)] grid-cols-2 gap-3 max-[430px]:w-full">
        <button
          className="inline-flex min-h-[60px] items-center justify-center gap-2 rounded-[18px] border border-white/27 bg-[rgb(13_29_43_/_78%)] text-[0.9rem] font-extrabold text-white shadow-[0_10px_28px_rgb(0_0_0_/_14%)] backdrop-blur-[14px] transition-colors hover:bg-[rgb(7_20_31_/_92%)] focus-visible:bg-[rgb(7_20_31_/_92%)] max-[700px]:min-h-14"
          onClick={state.status === "playing" ? onPause : onResume}
          type="button"
        >
          <span aria-hidden="true">{state.status === "playing" ? "Ⅱ" : "▶"}</span>
          {state.status === "playing" ? "一時停止" : "つづける"}
        </button>
        <button
          className={cn(
            "inline-flex min-h-[60px] items-center justify-center gap-2 rounded-[18px] border border-white/27 bg-[rgb(73_36_32_/_80%)] text-[0.9rem] font-extrabold text-white shadow-[0_10px_28px_rgb(0_0_0_/_14%)] backdrop-blur-[14px] transition-colors hover:bg-[rgb(7_20_31_/_92%)] focus-visible:bg-[rgb(7_20_31_/_92%)] max-[700px]:min-h-14",
          )}
          onClick={onStop}
          type="button"
        >
          <span aria-hidden="true">■</span>
          おしまい
        </button>
      </div>
    </main>
  );
}
