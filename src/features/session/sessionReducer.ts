import type { PackId } from "../../content/packs";

export type DurationSeconds = 60 | 120 | 180;

export type SessionPreferences = {
  packId: PackId;
  durationSeconds: DurationSeconds;
  soundEnabled: boolean;
};

type SetupState = {
  status: "setup";
  preferences: SessionPreferences;
};

type PlayingState = {
  status: "playing";
  preferences: SessionPreferences;
  deadline: number;
  remainingMs: number;
  sceneIndex: number;
};

type PausedState = {
  status: "paused";
  preferences: SessionPreferences;
  deadline: null;
  remainingMs: number;
  sceneIndex: number;
};

type FinishedState = {
  status: "finished";
  preferences: SessionPreferences;
  lastSceneIndex: number;
};

export type SessionState = SetupState | PlayingState | PausedState | FinishedState;

export type SessionAction =
  | { type: "SET_PACK"; packId: PackId }
  | { type: "SET_DURATION"; durationSeconds: DurationSeconds }
  | { type: "SET_SOUND"; soundEnabled: boolean }
  | { type: "START"; now: number }
  | { type: "TICK"; now: number }
  | { type: "NEXT_SCENE" }
  | { type: "PAUSE"; now: number }
  | { type: "RESUME"; now: number }
  | { type: "STOP" }
  | { type: "RESET" };

const DEFAULT_PREFERENCES: Readonly<SessionPreferences> = {
  packId: "colors",
  durationSeconds: 60,
  soundEnabled: false,
};

export function createInitialState(): SessionState {
  return {
    status: "setup",
    preferences: { ...DEFAULT_PREFERENCES },
  };
}

function finish(state: PlayingState | PausedState): FinishedState {
  return {
    status: "finished",
    preferences: state.preferences,
    lastSceneIndex: state.sceneIndex,
  };
}

export function sessionReducer(
  state: SessionState,
  action: SessionAction,
): SessionState {
  switch (action.type) {
    case "SET_PACK":
      return state.status === "setup"
        ? {
            ...state,
            preferences: {
              ...state.preferences,
              packId: action.packId,
            },
          }
        : state;
    case "SET_DURATION":
      return state.status === "setup"
        ? {
            ...state,
            preferences: {
              ...state.preferences,
              durationSeconds: action.durationSeconds,
            },
          }
        : state;
    case "SET_SOUND":
      return state.status === "setup"
        ? {
            ...state,
            preferences: {
              ...state.preferences,
              soundEnabled: action.soundEnabled,
            },
          }
        : state;
    case "START": {
      if (state.status !== "setup") {
        return state;
      }
      const remainingMs = state.preferences.durationSeconds * 1_000;
      return {
        status: "playing",
        preferences: state.preferences,
        deadline: action.now + remainingMs,
        remainingMs,
        sceneIndex: 0,
      };
    }
    case "TICK": {
      if (state.status !== "playing") {
        return state;
      }
      const remainingMs = Math.max(0, state.deadline - action.now);
      return remainingMs === 0 ? finish(state) : { ...state, remainingMs };
    }
    case "NEXT_SCENE":
      return state.status === "playing"
        ? { ...state, sceneIndex: state.sceneIndex + 1 }
        : state;
    case "PAUSE": {
      if (state.status !== "playing") {
        return state;
      }
      const remainingMs = Math.max(0, state.deadline - action.now);
      return remainingMs === 0
        ? finish(state)
        : {
            ...state,
            status: "paused",
            deadline: null,
            remainingMs,
          };
    }
    case "RESUME":
      return state.status === "paused"
        ? {
            ...state,
            status: "playing",
            deadline: action.now + state.remainingMs,
          }
        : state;
    case "STOP":
      return state.status === "playing" || state.status === "paused"
        ? finish(state)
        : state;
    case "RESET":
      return state.status === "finished" ? createInitialState() : state;
  }
}
