import type { CSSProperties } from "react";
import { CONTENT_PACKS, getColor, getShape } from "../content/packs";
import type { Scene } from "../features/session/sequence";
import type { SessionState } from "../features/session/session-reducer";

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
      className="player-screen"
      data-motion={reducedMotion ? "reduced" : "full"}
      data-paused={state.status === "paused"}
      style={style}
    >
      <h1 className="sr-only">{pack.title}</h1>
      <header className="player-header">
        <div className="player-brand">
          <span aria-hidden="true">●</span>
          いろころ
        </div>
        <div className="timer" role="timer" aria-label="残り時間">
          <span aria-hidden="true">のこり</span>
          <output aria-live="off">{formatRemaining(state.remainingMs)}</output>
        </div>
      </header>

      <progress
        aria-label="セッションの残り時間"
        max={state.preferences.durationSeconds * 1_000}
        value={state.remainingMs}
      />

      <section aria-label={`${color.label}の${shape.label}`} className="scene">
        <div className="shape-stage" key={scene.id}>
          <div
            aria-hidden="true"
            className={`visual-shape visual-shape--${shape.id}`}
          />
        </div>
        <p className="scene-cue" data-testid="scene-cue">
          {pack.cue(scene)}
        </p>
        {reducedMotion && <p className="motion-status">動きを抑えて表示しています</p>}
      </section>

      {state.status === "paused" && (
        <div className="pause-message" role="status">
          <span aria-hidden="true">☁</span>
          <h2>ひとやすみ</h2>
          <p>画面も時間も止まっています。</p>
        </div>
      )}

      <div className="player-controls">
        <button
          className="control-button"
          onClick={state.status === "playing" ? onPause : onResume}
          type="button"
        >
          <span aria-hidden="true">{state.status === "playing" ? "Ⅱ" : "▶"}</span>
          {state.status === "playing" ? "一時停止" : "つづける"}
        </button>
        <button
          className="control-button control-button--finish"
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
