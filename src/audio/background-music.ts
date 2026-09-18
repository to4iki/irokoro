import { BACKGROUND_TRACKS } from "../content/music";

export type BackgroundMusicController = {
  play: () => void;
  pause: () => void;
  dispose: () => void;
};

type CreateAudio = (src: string) => HTMLAudioElement;

type CreateBackgroundMusicOptions = {
  tracks?: readonly string[];
  random?: () => number;
  createAudio?: CreateAudio;
};

/** Quiet enough for baby-facing play; still audible when device volume is up. */
export const BACKGROUND_MUSIC_VOLUME = 0.25;

function pickSrc(tracks: readonly string[], random: () => number): string {
  const index = Math.min(tracks.length - 1, Math.floor(random() * tracks.length));
  const src = tracks[index];
  if (!src) {
    throw new RangeError("Unable to pick a background track.");
  }
  return src;
}

/** HTMLMediaElement BGM boundary. One track per controller, looped quietly. */
export function createBackgroundMusic(
  options: CreateBackgroundMusicOptions = {},
): BackgroundMusicController | null {
  const tracks = options.tracks ?? BACKGROUND_TRACKS;
  const random = options.random ?? Math.random;
  const createAudio = options.createAudio ?? ((src: string) => new Audio(src));

  if (tracks.length === 0) {
    return null;
  }

  try {
    const audio = createAudio(pickSrc(tracks, random));
    audio.loop = true;
    audio.volume = BACKGROUND_MUSIC_VOLUME;

    let disposed = false;

    return {
      play() {
        if (disposed) {
          return;
        }
        try {
          void audio.play().catch(() => undefined);
        } catch {
          // Playback failures must not interrupt the visual session.
        }
      },
      pause() {
        if (disposed) {
          return;
        }
        audio.pause();
      },
      dispose() {
        if (disposed) {
          return;
        }
        disposed = true;
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
      },
    };
  } catch {
    return null;
  }
}
