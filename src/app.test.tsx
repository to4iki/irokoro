import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./app";
import { createChime } from "./audio/chime";
import type { Scene } from "./features/session/sequence";

vi.mock("./audio/chime", () => ({
  createChime: vi.fn(),
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
  const chime = {
    play: vi.fn(),
    dispose: vi.fn(),
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-11T08:00:00Z"));
    vi.mocked(createChime).mockReturnValue(chime);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts from safe defaults without unlocking audio", () => {
    render(<App sequence={TEST_SEQUENCE} />);

    expect(screen.getByRole("radio", { name: "いろ" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "1分" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "音をつける" })).not.toBeChecked();

    fireEvent.click(screen.getByRole("button", { name: "はじめる" }));

    expect(screen.getByRole("main", { name: "いろの再生画面" })).toBeVisible();
    expect(createChime).not.toHaveBeenCalled();
  });

  it("applies choices, chimes on scene change when sound is on, and disposes on stop", () => {
    render(<App sequence={TEST_SEQUENCE} />);

    fireEvent.click(screen.getByRole("radio", { name: "3分" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "音をつける" }));
    fireEvent.click(screen.getByRole("button", { name: "はじめる" }));

    expect(screen.getByRole("main", { name: "いろの再生画面" })).toBeVisible();
    expect(createChime).toHaveBeenCalledOnce();
    expect(chime.play).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(5_000));
    expect(chime.play).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole("button", { name: "おしまい" }));
    expect(chime.dispose).toHaveBeenCalledOnce();
    expect(screen.getByRole("heading", { name: "おしまい" })).toBeVisible();
  });

  it("freezes while paused, finishes without auto-repeat, and resets to safe defaults", () => {
    render(<App sequence={TEST_SEQUENCE} />);
    fireEvent.click(screen.getByRole("button", { name: "はじめる" }));

    act(() => vi.advanceTimersByTime(5_000));
    fireEvent.click(screen.getByRole("button", { name: "一時停止" }));

    expect(screen.getByRole("heading", { name: "ひとやすみ" })).toBeVisible();

    act(() => vi.advanceTimersByTime(60_000));
    expect(screen.getByRole("heading", { name: "ひとやすみ" })).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "つづける" }));
    act(() => vi.advanceTimersByTime(54_999));
    expect(screen.queryByRole("heading", { name: "おしまい" })).not.toBeInTheDocument();

    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByRole("heading", { name: "おしまい" })).toBeVisible();

    act(() => vi.advanceTimersByTime(60_000));
    expect(screen.getByRole("heading", { name: "おしまい" })).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "はじめの画面へ" }));
    expect(screen.getByRole("checkbox", { name: "音をつける" })).not.toBeChecked();
  });
});
