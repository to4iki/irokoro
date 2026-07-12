export type ChimeController = {
  play: () => void;
  dispose: () => Promise<void>;
};

type AudioContextFactory = () => AudioContext;

/** Soft “ころころ〜” phrase while shapes tumble in. */
export const ROLL_SYLLABLES = [
  { frequency: 392.0, delay: 0, duration: 0.16 },
  { frequency: 329.63, delay: 0.17, duration: 0.16 },
  { frequency: 440.0, delay: 0.34, duration: 0.16 },
  { frequency: 349.23, delay: 0.51, duration: 0.18 },
  { frequency: 415.3, delay: 0.78, duration: 0.2 },
  { frequency: 293.66, delay: 1.02, duration: 0.28 },
] as const;

const MASTER_GAIN = 0.055;

export function createChime(
  createContext: AudioContextFactory = () => new AudioContext(),
): ChimeController | null {
  try {
    const context = createContext();
    const master = context.createGain();
    master.gain.value = MASTER_GAIN;
    master.connect(context.destination);

    if (context.state === "suspended") {
      void context.resume().catch(() => undefined);
    }

    let disposed = false;

    return {
      play() {
        if (disposed || context.state === "closed") {
          return;
        }

        for (const syllable of ROLL_SYLLABLES) {
          const startAt = context.currentTime + syllable.delay;
          const stopAt = startAt + syllable.duration;
          const oscillator = context.createOscillator();
          const envelope = context.createGain();

          oscillator.type = "triangle";
          oscillator.frequency.setValueAtTime(syllable.frequency, startAt);
          envelope.gain.setValueAtTime(0.0001, startAt);
          envelope.gain.exponentialRampToValueAtTime(0.85, startAt + 0.02);
          envelope.gain.exponentialRampToValueAtTime(0.0001, stopAt);

          oscillator.connect(envelope);
          envelope.connect(master);
          oscillator.start(startAt);
          oscillator.stop(stopAt);
        }
      },
      async dispose() {
        if (disposed) {
          return;
        }
        disposed = true;
        if (context.state !== "closed") {
          await context.close().catch(() => undefined);
        }
      },
    };
  } catch {
    return null;
  }
}
