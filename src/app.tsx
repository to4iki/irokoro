import { useEffect, useReducer, useRef } from "react";
import { type ChimeController, createChime } from "./audio/chime";
import { FinishScreen } from "./components/finish-screen";
import { PlayerScreen } from "./components/player-screen";
import { SetupScreen } from "./components/setup-screen";
import { createSceneSequence, type Scene } from "./features/session/sequence";
import { createInitialState, sessionReducer } from "./features/session/session-reducer";

const DEFAULT_SEQUENCE = createSceneSequence({ length: 64 });

type AppProps = {
  sequence?: readonly Scene[];
};

export default function App({ sequence = DEFAULT_SEQUENCE }: AppProps) {
  const [state, dispatch] = useReducer(sessionReducer, undefined, createInitialState);
  const audioRef = useRef<ChimeController | null>(null);
  const sceneRemainRef = useRef<{ id: string; remainingMs: number } | null>(null);

  const sceneIndex = state.status === "setup" ? 0 : state.sceneIndex;
  const scene = sequence[sceneIndex % sequence.length];

  if (!scene) {
    throw new RangeError("Unable to resolve the current scene.");
  }

  const status = state.status;
  const deadline = status === "playing" ? state.deadline : null;

  useEffect(() => {
    if (status !== "playing" || deadline === null) {
      return;
    }

    const tick = () => dispatch({ type: "TICK", now: Date.now() });
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
      audioRef.current?.play();
    }

    const active = sceneRemainRef.current;
    if (!active) {
      return;
    }

    const budget = active.remainingMs;
    const startedAt = Date.now();
    const timer = window.setTimeout(() => {
      dispatch({ type: "NEXT_SCENE" });
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
      void audio?.dispose();
    }
  }, [status]);

  useEffect(
    () => () => {
      void audioRef.current?.dispose();
    },
    [],
  );

  if (state.status === "setup") {
    return (
      <SetupScreen
        onDurationChange={(durationSeconds) =>
          dispatch({ type: "SET_DURATION", durationSeconds })
        }
        onPackChange={(packId) => dispatch({ type: "SET_PACK", packId })}
        onSoundChange={(soundEnabled) => dispatch({ type: "SET_SOUND", soundEnabled })}
        onStart={() => {
          sceneRemainRef.current = null;
          if (state.preferences.soundEnabled) {
            audioRef.current = createChime();
          }
          dispatch({ type: "START", now: Date.now() });
        }}
        preferences={state.preferences}
      />
    );
  }

  if (state.status === "finished") {
    return <FinishScreen onReset={() => dispatch({ type: "RESET" })} />;
  }

  return (
    <PlayerScreen
      onPause={() => dispatch({ type: "PAUSE", now: Date.now() })}
      onResume={() => dispatch({ type: "RESUME", now: Date.now() })}
      onStop={() => dispatch({ type: "STOP" })}
      scene={scene}
      state={state}
    />
  );
}
