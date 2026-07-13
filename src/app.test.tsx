import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./app";
import { createBackgroundMusic } from "./audio/background-music";
import type { Scene } from "./features/session/sequence";

vi.mock("./audio/background-music", () => ({
  createBackgroundMusic: vi.fn(),
}));

const TEST_SEQUENCE: Scene[] = [
  {
    id: "blue-circle",
    colorId: "blue",
    shapeId: "circle",
    durationMs: 5_000,
  },
  {
    id: "yellow-triangle",
    colorId: "yellow",
    shapeId: "triangle",
    durationMs: 5_000,
  },
];

describe("App", () => {
  const music = {
    play: vi.fn(),
    pause: vi.fn(),
    dispose: vi.fn(),
  };

  function setDocumentVisibility(state: DocumentVisibilityState) {
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => state,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  }

  async function flushLazyScreens() {
    await act(async () => {
      await Promise.resolve();
    });
  }

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-11T08:00:00Z"));
    vi.mocked(createBackgroundMusic).mockReturnValue(music);
    setDocumentVisibility("visible");
    document.title = "いろころ｜親子で色あそび";
    // Resolve lazy screen chunks before interactions (fake timers + Suspense).
    await import("./components/player-screen");
    await import("./components/finish-screen");
  });

  afterEach(() => {
    setDocumentVisibility("visible");
    vi.useRealTimers();
  });

  it("starts from safe defaults without unlocking audio", async () => {
    render(<App sequence={TEST_SEQUENCE} />);

    expect(screen.getByRole("radio", { name: "いろ" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "1分" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "音をつける" })).not.toBeChecked();

    fireEvent.click(screen.getByRole("button", { name: "はじめる" }));
    await flushLazyScreens();

    expect(screen.getByRole("main", { name: "いろの再生画面" })).toBeVisible();
    expect(createBackgroundMusic).not.toHaveBeenCalled();
  });

  it("keeps the session usable when BGM cannot be created", async () => {
    vi.mocked(createBackgroundMusic).mockReturnValue(null);
    render(<App sequence={TEST_SEQUENCE} />);

    fireEvent.click(screen.getByRole("checkbox", { name: "音をつける" }));
    fireEvent.click(screen.getByRole("button", { name: "はじめる" }));
    await flushLazyScreens();

    expect(screen.getByRole("main", { name: "いろの再生画面" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "一時停止" }));
    expect(screen.getByRole("heading", { name: "ひとやすみ" })).toBeVisible();
  });

  it("runs one BGM session across pause, tab hide, scene change, and stop", async () => {
    render(<App sequence={TEST_SEQUENCE} />);

    fireEvent.click(screen.getByRole("radio", { name: "3分" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "音をつける" }));
    fireEvent.click(screen.getByRole("button", { name: "はじめる" }));
    await flushLazyScreens();

    expect(screen.getByRole("main", { name: "いろの再生画面" })).toBeVisible();
    expect(createBackgroundMusic).toHaveBeenCalledOnce();

    act(() => vi.advanceTimersByTime(2_000));
    fireEvent.click(screen.getByRole("button", { name: "一時停止" }));
    fireEvent.click(screen.getByRole("button", { name: "つづける" }));

    act(() => {
      setDocumentVisibility("hidden");
      setDocumentVisibility("visible");
    });

    act(() => vi.advanceTimersByTime(3_000));
    // Scene advanced, but the same controller must keep running.
    expect(createBackgroundMusic).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole("button", { name: "おしまい" }));
    await flushLazyScreens();
    expect(music.dispose).toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: "おしまい" })).toBeVisible();
  });

  it("does not restart BGM when a paused session is foregrounded", async () => {
    render(<App sequence={TEST_SEQUENCE} />);
    fireEvent.click(screen.getByRole("checkbox", { name: "音をつける" }));
    fireEvent.click(screen.getByRole("button", { name: "はじめる" }));
    await flushLazyScreens();
    fireEvent.click(screen.getByRole("button", { name: "一時停止" }));
    music.play.mockClear();

    act(() => {
      setDocumentVisibility("hidden");
      setDocumentVisibility("visible");
    });

    expect(music.play).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: "ひとやすみ" })).toBeVisible();
  });

  it("freezes while paused, finishes without auto-repeat, and resets to safe defaults", async () => {
    render(<App sequence={TEST_SEQUENCE} />);
    fireEvent.click(screen.getByRole("checkbox", { name: "音をつける" }));
    fireEvent.click(screen.getByRole("button", { name: "はじめる" }));
    await flushLazyScreens();

    act(() => vi.advanceTimersByTime(5_000));
    fireEvent.click(screen.getByRole("button", { name: "一時停止" }));

    expect(screen.getByRole("heading", { name: "ひとやすみ" })).toBeVisible();

    act(() => vi.advanceTimersByTime(60_000));
    expect(screen.getByRole("heading", { name: "ひとやすみ" })).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "つづける" }));
    act(() => vi.advanceTimersByTime(54_999));
    expect(screen.queryByRole("heading", { name: "おしまい" })).not.toBeInTheDocument();

    act(() => vi.advanceTimersByTime(1));
    await flushLazyScreens();
    expect(screen.getByRole("heading", { name: "おしまい" })).toBeVisible();
    expect(music.dispose).toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(60_000));
    expect(screen.getByRole("heading", { name: "おしまい" })).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "はじめの画面へ" }));
    expect(screen.getByRole("checkbox", { name: "音をつける" })).not.toBeChecked();
  });

  it("updates the document title and moves focus across major screen hops only", async () => {
    render(<App sequence={TEST_SEQUENCE} />);

    expect(document.title).toBe("いろころ｜親子で色あそび");
    expect(screen.getByRole("heading", { name: "いろころ" })).not.toHaveFocus();

    fireEvent.click(screen.getByRole("button", { name: "はじめる" }));
    await flushLazyScreens();
    const playerHeading = screen.getByRole("heading", {
      name: "いろを みつけよう",
    });
    expect(document.title).toBe("再生中｜いろころ");
    expect(playerHeading).toHaveFocus();

    fireEvent.click(screen.getByRole("button", { name: "一時停止" }));
    expect(document.title).toBe("一時停止｜いろころ");
    expect(screen.getByRole("heading", { name: "ひとやすみ" })).toBeVisible();
    // Pause stays on the same PlayerScreen mount, so focus is not re-routed.
    expect(playerHeading).toHaveFocus();

    fireEvent.click(screen.getByRole("button", { name: "おしまい" }));
    await flushLazyScreens();
    const finishHeading = screen.getByRole("heading", { name: "おしまい" });
    expect(document.title).toBe("おしまい｜いろころ");
    expect(finishHeading).toHaveFocus();

    fireEvent.click(screen.getByRole("button", { name: "はじめの画面へ" }));
    const setupHeading = screen.getByRole("heading", { name: "いろころ" });
    expect(document.title).toBe("いろころ｜親子で色あそび");
    expect(setupHeading).toHaveFocus();
  });
});
