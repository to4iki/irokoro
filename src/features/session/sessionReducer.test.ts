import { describe, expect, it } from "vitest";
import { createInitialState, sessionReducer } from "./sessionReducer";

describe("sessionReducer", () => {
  it("starts with the safest, shortest defaults", () => {
    expect(createInitialState()).toEqual({
      status: "setup",
      preferences: {
        packId: "colors",
        durationSeconds: 60,
        soundEnabled: false,
      },
    });
  });

  it("updates setup choices and starts a bounded session", () => {
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

  it("finishes exactly at the configured deadline", () => {
    const playing = sessionReducer(createInitialState(), {
      type: "START",
      now: 1_000,
    });

    const nearlyFinished = sessionReducer(playing, {
      type: "TICK",
      now: 60_999,
    });
    expect(nearlyFinished).toMatchObject({
      status: "playing",
      remainingMs: 1,
    });

    const finished = sessionReducer(nearlyFinished, {
      type: "TICK",
      now: 61_000,
    });
    expect(finished).toMatchObject({
      status: "finished",
      preferences: { soundEnabled: false },
      lastSceneIndex: 0,
    });
  });

  it("freezes time and scene changes while paused, then resumes the remainder", () => {
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

    const resumed = sessionReducer(paused, {
      type: "RESUME",
      now: 100_000,
    });
    expect(resumed).toMatchObject({
      status: "playing",
      deadline: 150_000,
      remainingMs: 50_000,
      sceneIndex: 1,
    });
  });

  it("supports explicit early finish and requires reset before another session", () => {
    const playing = sessionReducer(createInitialState(), {
      type: "START",
      now: 0,
    });
    const finished = sessionReducer(playing, { type: "STOP" });

    expect(finished.status).toBe("finished");
    expect(sessionReducer(finished, { type: "RESUME", now: 1 })).toBe(finished);
    expect(sessionReducer(finished, { type: "RESET" })).toEqual(createInitialState());
  });

  it("ignores preference changes outside setup", () => {
    const playing = sessionReducer(createInitialState(), {
      type: "START",
      now: 0,
    });

    expect(
      sessionReducer(playing, {
        type: "SET_SOUND",
        soundEnabled: true,
      }),
    ).toBe(playing);
  });
});
