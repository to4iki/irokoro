import { describe, expect, it, vi } from "vitest";
import { createBackgroundMusic } from "./background-music";

type FakeAudioOptions = {
  playImpl?: () => Promise<void>;
};

class FakeAudio {
  src: string;
  loop = false;
  volume = 1;
  currentTime = 0;
  paused = true;
  play = vi.fn(async () => {
    this.paused = false;
  });
  pause = vi.fn(() => {
    this.paused = true;
  });
  removeAttribute = vi.fn((name: string) => {
    if (name === "src") {
      this.src = "";
    }
  });
  load = vi.fn();

  constructor(src: string, options: FakeAudioOptions = {}) {
    this.src = src;
    if (options.playImpl) {
      this.play = vi.fn(options.playImpl);
    }
  }
}

const TRACKS = [
  {
    id: "a",
    title: "Track A",
    artist: "Artist",
    src: "track-a.mp3",
    pageUrl: "https://example.com/a/",
  },
  {
    id: "b",
    title: "Track B",
    artist: "Artist",
    src: "track-b.mp3",
    pageUrl: "https://example.com/b/",
  },
  {
    id: "c",
    title: "Track C",
    artist: "Artist",
    src: "track-c.mp3",
    pageUrl: "https://example.com/c/",
  },
] as const;

describe("createBackgroundMusic", () => {
  it("picks different tracks for different random inputs, loops quietly, and preserves currentTime across pause/resume", () => {
    const created: FakeAudio[] = [];
    const createAudio = (src: string) => {
      const audio = new FakeAudio(src);
      created.push(audio);
      return audio as unknown as HTMLAudioElement;
    };

    const first = createBackgroundMusic({
      tracks: TRACKS,
      random: () => 0.1,
      createAudio,
    });
    const second = createBackgroundMusic({
      tracks: TRACKS,
      random: () => 0.9,
      createAudio,
    });

    const firstAudio = created[0];
    const secondAudio = created[1];
    expect(first).not.toBeNull();
    expect(second).not.toBeNull();
    expect(firstAudio?.src).not.toBe(secondAudio?.src);
    expect(firstAudio?.loop).toBe(true);
    expect(firstAudio?.volume).toBeCloseTo(0.25, 2);

    first?.play();
    expect(firstAudio?.paused).toBe(false);

    if (!firstAudio) {
      throw new Error("expected an audio instance");
    }
    firstAudio.currentTime = 12.5;
    first?.pause();
    expect(firstAudio.paused).toBe(true);
    expect(firstAudio.currentTime).toBe(12.5);

    first?.play();
    expect(firstAudio.paused).toBe(false);
    expect(firstAudio.currentTime).toBe(12.5);

    first?.dispose();
    expect(firstAudio.paused).toBe(true);
    firstAudio.play.mockClear();
    first?.play();
    expect(firstAudio.play).not.toHaveBeenCalled();
  });

  it("degrades silently when Audio cannot be created or play fails", async () => {
    expect(
      createBackgroundMusic({
        tracks: TRACKS,
        random: () => 0,
        createAudio: () => {
          throw new DOMException("Audio is unavailable");
        },
      }),
    ).toBeNull();

    const rejecting = new FakeAudio("track-a.mp3", {
      playImpl: async () => {
        throw new DOMException("NotAllowedError");
      },
    });
    const throwing = new FakeAudio("track-a.mp3", {
      playImpl: () => {
        throw new DOMException("Playback failed");
      },
    });

    const rejectingController = createBackgroundMusic({
      tracks: TRACKS,
      random: () => 0,
      createAudio: () => rejecting as unknown as HTMLAudioElement,
    });
    const throwingController = createBackgroundMusic({
      tracks: TRACKS,
      random: () => 0,
      createAudio: () => throwing as unknown as HTMLAudioElement,
    });

    expect(() => rejectingController?.play()).not.toThrow();
    expect(() => throwingController?.play()).not.toThrow();
    await Promise.resolve();
  });
});
