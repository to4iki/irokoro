export type ChimeController = {
  play: () => void;
  dispose: () => Promise<void>;
};

type AudioContextFactory = () => AudioContext;

const MASTER_GAIN = 0.04;

function createBrowserAudioContext(): AudioContext {
  const AudioContextClass =
    window.AudioContext ??
    (
      window as typeof window & {
        webkitAudioContext?: typeof AudioContext;
      }
    ).webkitAudioContext;

  if (!AudioContextClass) {
    throw new DOMException("Web Audio is unavailable.");
  }
  return new AudioContextClass();
}

export function createChime(
  createContext: AudioContextFactory = createBrowserAudioContext,
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

        const notes = [
          { frequency: 523.25, delay: 0, duration: 0.3 },
          { frequency: 659.25, delay: 0.09, duration: 0.3 },
        ] as const;

        for (const note of notes) {
          const startAt = context.currentTime + note.delay;
          const stopAt = startAt + note.duration;
          const oscillator = context.createOscillator();
          const envelope = context.createGain();

          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(note.frequency, startAt);
          envelope.gain.setValueAtTime(0.0001, startAt);
          envelope.gain.exponentialRampToValueAtTime(0.7, startAt + 0.025);
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
