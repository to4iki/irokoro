import { type CSSProperties, memo } from "react";
import { getAnimal } from "../content/animals";
import { CONTENT_PACKS, getColor, getShape } from "../content/packs";
import { SCREEN_HEADING_ID } from "../features/session/screen-a11y";
import type { Scene } from "../features/session/sequence";
import type { SessionState } from "../features/session/session-reducer";
import { useFocusScreenHeadingOnMount } from "../features/session/use-focus-screen-heading-on-mount";
import { RollCanvas } from "./roll-canvas";

type PlayerState = Extract<SessionState, { status: "playing" | "paused" }>;

type PlayerScreenProps = {
  state: PlayerState;
  scene: Scene;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
};

type SceneStyle = CSSProperties & {
  "--scene-background": string;
};

type SceneStageProps = {
  scene: Scene;
  paused: boolean;
  colorLabel: string;
  subjectLabel: string;
  shapeColor: string;
};

function formatRemaining(remainingMs: number): string {
  const seconds = Math.ceil(remainingMs / 1_000);
  return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`;
}

/** Isolates canvas from 250ms timer re-renders (vercel rerender-memo). */
const SceneStage = memo(function SceneStage({
  scene,
  paused,
  colorLabel,
  subjectLabel,
  shapeColor,
}: SceneStageProps) {
  return (
    <section
      aria-label={`${colorLabel}の${subjectLabel}`}
      className="scene relative min-h-0 overflow-hidden"
    >
      <div className="roll-stage absolute inset-0">
        {scene.packId === "animals" ? (
          <RollCanvas
            key={scene.id}
            imageSrc={getAnimal(scene.animalId).src}
            kind="animal"
            paused={paused}
            sceneId={scene.id}
          />
        ) : (
          <RollCanvas
            key={scene.id}
            kind="shape"
            paused={paused}
            sceneDurationMs={scene.durationMs}
            sceneId={scene.id}
            shapeColor={shapeColor}
            shapeId={scene.shapeId}
          />
        )}
      </div>
    </section>
  );
});

export function PlayerScreen({
  state,
  scene,
  onPause,
  onResume,
  onStop,
}: PlayerScreenProps) {
  useFocusScreenHeadingOnMount();

  const color = getColor(scene.colorId);
  const subjectLabel =
    scene.packId === "animals"
      ? getAnimal(scene.animalId).label
      : getShape(scene.shapeId).label;
  const pack = CONTENT_PACKS[state.preferences.packId];
  const style: SceneStyle = {
    "--scene-background": color.background,
  };
  const paused = state.status === "paused";

  return (
    <main
      aria-label={`${pack.shortLabel}の再生画面`}
      className="player-screen relative isolate grid h-dvh grid-rows-[auto_auto_1fr_auto] overflow-hidden text-white select-none touch-manipulation p-[max(16px,env(safe-area-inset-top,0px))_max(16px,env(safe-area-inset-right,0px))_max(18px,env(safe-area-inset-bottom,0px))_max(16px,env(safe-area-inset-left,0px))]"
      data-paused={paused}
      style={style}
    >
      <h1 className="sr-only" id={SCREEN_HEADING_ID} tabIndex={-1}>
        {pack.title}
      </h1>
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

      <SceneStage
        colorLabel={color.label}
        paused={paused}
        scene={scene}
        shapeColor={color.foreground}
        subjectLabel={subjectLabel}
      />

      {paused ? (
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
      ) : null}

      <div className="z-30 mx-auto grid w-[min(100%,440px)] grid-cols-2 gap-3 max-[430px]:w-full">
        <button
          className="inline-flex min-h-[60px] items-center justify-center gap-2 rounded-[18px] border border-white/27 bg-[rgb(13_29_43_/_78%)] text-[0.9rem] font-extrabold text-white shadow-[0_10px_28px_rgb(0_0_0_/_14%)] backdrop-blur-[14px] transition-colors hover:bg-[rgb(7_20_31_/_92%)] focus-visible:bg-[rgb(7_20_31_/_92%)] max-[700px]:min-h-14"
          onClick={paused ? onResume : onPause}
          type="button"
        >
          <span aria-hidden="true">{paused ? "▶" : "Ⅱ"}</span>
          {paused ? "つづける" : "一時停止"}
        </button>
        <button
          className="inline-flex min-h-[60px] items-center justify-center gap-2 rounded-[18px] border border-white/27 bg-[rgb(73_36_32_/_80%)] text-[0.9rem] font-extrabold text-white shadow-[0_10px_28px_rgb(0_0_0_/_14%)] backdrop-blur-[14px] transition-colors hover:bg-[rgb(7_20_31_/_92%)] focus-visible:bg-[rgb(7_20_31_/_92%)] max-[700px]:min-h-14"
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
