import { useEffect, useReducer, useRef } from "react";
import { type ChimeController, createChime } from "./audio/chime";
import { FinishScreen } from "./components/FinishScreen";
import { PlayerScreen } from "./components/PlayerScreen";
import { SetupScreen } from "./components/SetupScreen";
import { createSceneSequence, type Scene } from "./features/session/sequence";
import { createInitialState, sessionReducer } from "./features/session/sessionReducer";
import { useReducedMotion } from "./hooks/useReducedMotion";

const DEFAULT_SEQUENCE = createSceneSequence({ length: 64 });

type AppProps = {
  sequence?: readonly Scene[];
};

export default function App({ sequence = DEFAULT_SEQUENCE }: AppProps) {
  const [state, dispatch] = useReducer(sessionReducer, undefined, createInitialState);
  const audioRef = useRef<ChimeController | null>(null);
  const reducedMotion = useReducedMotion();

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

  // biome-ignore lint/correctness/useExhaustiveDependencies: scene.id re-arms the timer for every new scene, even when consecutive durations are equal
  useEffect(() => {
    if (status !== "playing") {
      return;
    }

    const timer = window.setTimeout(() => {
      audioRef.current?.play();
      dispatch({ type: "NEXT_SCENE" });
    }, scene.durationMs);
    return () => window.clearTimeout(timer);
  }, [status, scene.id, scene.durationMs]);

  useEffect(() => {
    if (status === "finished") {
      const audio = audioRef.current;
      audioRef.current = null;
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
    return (
      <FinishScreen
        sceneIndex={state.sceneIndex}
        onReset={() => dispatch({ type: "RESET" })}
      />
    );
  }

  return (
    <PlayerScreen
      onPause={() => dispatch({ type: "PAUSE", now: Date.now() })}
      onResume={() => dispatch({ type: "RESUME", now: Date.now() })}
      onStop={() => dispatch({ type: "STOP" })}
      reducedMotion={reducedMotion}
      scene={scene}
      state={state}
    />
  );
}
