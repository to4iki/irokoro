import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
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

  it("offers safe defaults and starts in one explicit action", () => {
    render(<App sequence={TEST_SEQUENCE} />);

    expect(screen.getByRole("heading", { name: "いろころ" })).toBeVisible();
    expect(screen.getByRole("radio", { name: "いろ" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "1分" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "音をつける" })).not.toBeChecked();

    fireEvent.click(screen.getByRole("button", { name: "はじめる" }));

    expect(screen.getByRole("main", { name: "いろの再生画面" })).toBeVisible();
    expect(screen.getByText("あお、みつけた")).toBeVisible();
    expect(createChime).not.toHaveBeenCalled();
  });

  it("initializes audio from the start action and chimes only on scene changes", () => {
    render(<App sequence={TEST_SEQUENCE} />);

    fireEvent.click(screen.getByRole("checkbox", { name: "音をつける" }));
    fireEvent.click(screen.getByRole("button", { name: "はじめる" }));

    expect(createChime).toHaveBeenCalledOnce();
    expect(chime.play).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(5_000));

    expect(screen.getByText("きいろ、みつけた")).toBeVisible();
    expect(chime.play).toHaveBeenCalledOnce();
  });

  it("freezes both countdown and scene while paused, then finishes without repeating", () => {
    render(<App sequence={TEST_SEQUENCE} />);
    fireEvent.click(screen.getByRole("button", { name: "はじめる" }));

    act(() => vi.advanceTimersByTime(5_000));
    fireEvent.click(screen.getByRole("button", { name: "一時停止" }));

    expect(screen.getByRole("heading", { name: "ひとやすみ" })).toBeVisible();
    expect(screen.getByText("きいろ、みつけた")).toBeVisible();

    act(() => vi.advanceTimersByTime(60_000));

    expect(screen.getByRole("heading", { name: "ひとやすみ" })).toBeVisible();
    expect(screen.getByText("きいろ、みつけた")).toBeVisible();

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

  it("allows an explicit early finish from both playing and paused states", () => {
    render(<App sequence={TEST_SEQUENCE} />);
    fireEvent.click(screen.getByRole("button", { name: "はじめる" }));
    fireEvent.click(screen.getByRole("button", { name: "一時停止" }));
    fireEvent.click(screen.getByRole("button", { name: "おしまい" }));

    expect(screen.getByRole("heading", { name: "おしまい" })).toBeVisible();
  });

  it("exposes reduced-motion mode to the player", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({
        matches: true,
        media: "(prefers-reduced-motion: reduce)",
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }),
    );
    render(<App sequence={TEST_SEQUENCE} />);

    fireEvent.click(screen.getByRole("button", { name: "はじめる" }));

    expect(screen.getByRole("main", { name: "いろの再生画面" })).toHaveAttribute(
      "data-motion",
      "reduced",
    );
    expect(screen.getByText("動きを抑えて表示しています")).toBeVisible();
  });
});
