import { startTransition, useEffect, useReducer, useRef } from "react";
import {
  type BackgroundMusicController,
  createBackgroundMusic,
} from "./audio/background-music";
import { FinishScreen } from "./components/finish-screen";
import { PlayerScreen } from "./components/player-screen";
import { SetupScreen } from "./components/setup-screen";
import { useSessionDocumentTitle } from "./features/session/screen-a11y";
import { createSceneSequence, type Scene } from "./features/session/sequence";
import { createInitialState, sessionReducer } from "./features/session/session-reducer";

const DEFAULT_SEQUENCES = {
  colors: createSceneSequence({ packId: "colors", length: 64 }),
  animals: createSceneSequence({ packId: "animals", length: 64 }),
} as const;

type AppProps = {
  /** Overrides the pack-selected sequence (tests). */
  sequence?: readonly Scene[];
};

export default function App({ sequence }: AppProps) {
  const [state, dispatch] = useReducer(sessionReducer, undefined, createInitialState);
  const audioRef = useRef<BackgroundMusicController | null>(null);
  const sceneRemainRef = useRef<{ id: string; remainingMs: number } | null>(null);
  /** After finished→setup, Setup takes heading focus. First load does not. */
  const focusSetupRef = useRef(false);
  const statusRef = useRef(state.status);
  statusRef.current = state.status;

  useSessionDocumentTitle(state.status);

  const activeSequence = sequence ?? DEFAULT_SEQUENCES[state.preferences.packId];
  const sceneIndex = state.status === "setup" ? 0 : state.sceneIndex;
  const scene = activeSequence[sceneIndex % activeSequence.length];

  if (!scene) {
    throw new RangeError("Unable to resolve the current scene.");
  }

  const status = state.status;
  const deadline = status === "playing" ? state.deadline : null;
  const sessionActive = status === "playing" || status === "paused";

  useEffect(() => {
    if (status !== "playing" || deadline === null) {
      return;
    }

    const tick = () => {
      startTransition(() => {
        dispatch({ type: "TICK", now: Date.now() });
      });
    };
    tick();
    const timer = window.setInterval(tick, 250);
    return () => window.clearInterval(timer);
  }, [status, deadline]);

  useEffect(() => {
    if (status !== "playing") {
      return;
    }

    const isNewScene =
      sceneRemainRef.current === null || sceneRemainRef.current.id !== scene.id;
    if (isNewScene) {
      sceneRemainRef.current = { id: scene.id, remainingMs: scene.durationMs };
    }

    const active = sceneRemainRef.current;
    if (!active) {
      return;
    }

    const budget = active.remainingMs;
    const startedAt = Date.now();
    const timer = window.setTimeout(() => {
      startTransition(() => {
        dispatch({ type: "NEXT_SCENE" });
      });
    }, budget);

    return () => {
      window.clearTimeout(timer);
      const elapsed = Date.now() - startedAt;
      if (sceneRemainRef.current?.id === scene.id) {
        sceneRemainRef.current = {
          id: scene.id,
          remainingMs: Math.max(0, budget - elapsed),
        };
      }
    };
  }, [status, scene.id, scene.durationMs]);

  useEffect(() => {
    if (status === "finished") {
      const audio = audioRef.current;
      audioRef.current = null;
      sceneRemainRef.current = null;
      audio?.dispose();
    }
  }, [status]);

  useEffect(() => {
    if (!sessionActive) {
      return;
    }

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        audioRef.current?.pause();
        return;
      }
      if (statusRef.current === "playing") {
        audioRef.current?.play();
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [sessionActive]);

  useEffect(
    () => () => {
      audioRef.current?.dispose();
    },
    [],
  );

  if (state.status === "setup") {
    return (
      <SetupScreen
        moveFocus={focusSetupRef.current}
        onDurationChange={(durationSeconds) =>
          dispatch({ type: "SET_DURATION", durationSeconds })
        }
        onPackChange={(packId) => dispatch({ type: "SET_PACK", packId })}
        onSoundChange={(soundEnabled) => dispatch({ type: "SET_SOUND", soundEnabled })}
        onStart={() => {
          sceneRemainRef.current = null;
          if (state.preferences.soundEnabled) {
            const music = createBackgroundMusic();
            audioRef.current = music;
            music?.play();
          }
          dispatch({ type: "START", now: Date.now() });
        }}
        preferences={state.preferences}
      />
    );
  }

  if (state.status === "finished") {
    return (
      <FinishScreen
        onReset={() => {
          focusSetupRef.current = true;
          dispatch({ type: "RESET" });
        }}
      />
    );
  }

  return (
    <PlayerScreen
      onPause={() => {
        audioRef.current?.pause();
        dispatch({ type: "PAUSE", now: Date.now() });
      }}
      onResume={() => {
        audioRef.current?.play();
        dispatch({ type: "RESUME", now: Date.now() });
      }}
      onStop={() => dispatch({ type: "STOP" })}
      scene={scene}
      state={state}
    />
  );
}
