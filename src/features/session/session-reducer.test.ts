import { describe, expect, it } from "vitest";
import { createInitialState, sessionReducer } from "./session-reducer";

describe("sessionReducer", () => {
  it("starts a bounded session from configured preferences", () => {
    const configured = sessionReducer(createInitialState(), {
      type: "SET_DURATION",
      durationSeconds: 120,
    });
    const withSound = sessionReducer(configured, {
      type: "SET_SOUND",
      soundEnabled: true,
    });
    const playing = sessionReducer(withSound, {
      type: "START",
      now: 1_000,
    });

    expect(playing).toMatchObject({
      status: "playing",
      preferences: {
        durationSeconds: 120,
        soundEnabled: true,
      },
      deadline: 121_000,
      remainingMs: 120_000,
      sceneIndex: 0,
    });
  });

  it("finishes exactly at the deadline and when pausing at zero remaining", () => {
    const playing = sessionReducer(createInitialState(), {
      type: "START",
      now: 1_000,
    });

    expect(
      sessionReducer(playing, {
        type: "TICK",
        now: 60_999,
      }),
    ).toMatchObject({
      status: "playing",
      remainingMs: 1,
    });

    expect(
      sessionReducer(playing, {
        type: "TICK",
        now: 61_000,
      }),
    ).toMatchObject({
      status: "finished",
      sceneIndex: 0,
    });

    expect(
      sessionReducer(playing, {
        type: "PAUSE",
        now: 61_000,
      }),
    ).toMatchObject({
      status: "finished",
    });
  });

  it("freezes time and scenes while paused, then resumes the remainder", () => {
    const playing = sessionReducer(createInitialState(), {
      type: "START",
      now: 1_000,
    });
    const advanced = sessionReducer(playing, { type: "NEXT_SCENE" });
    const paused = sessionReducer(advanced, {
      type: "PAUSE",
      now: 11_000,
    });

    expect(paused).toMatchObject({
      status: "paused",
      remainingMs: 50_000,
      deadline: null,
      sceneIndex: 1,
    });
    expect(sessionReducer(paused, { type: "TICK", now: 99_000 })).toBe(paused);
    expect(sessionReducer(paused, { type: "NEXT_SCENE" })).toBe(paused);

    expect(
      sessionReducer(paused, {
        type: "RESUME",
        now: 100_000,
      }),
    ).toMatchObject({
      status: "playing",
      deadline: 150_000,
      remainingMs: 50_000,
      sceneIndex: 1,
    });
  });

  it("requires reset after an early finish and ignores invalid lifecycle actions", () => {
    const playing = sessionReducer(createInitialState(), {
      type: "START",
      now: 0,
    });
    const finished = sessionReducer(playing, { type: "STOP" });

    expect(finished.status).toBe("finished");
    expect(sessionReducer(finished, { type: "RESUME", now: 1 })).toBe(finished);
    expect(sessionReducer(finished, { type: "RESET" })).toEqual(createInitialState());

    expect(sessionReducer(playing, { type: "START", now: 1_000 })).toBe(playing);
    expect(sessionReducer(playing, { type: "RESET" })).toBe(playing);
    expect(
      sessionReducer(playing, {
        type: "SET_SOUND",
        soundEnabled: true,
      }),
    ).toBe(playing);
  });
});
