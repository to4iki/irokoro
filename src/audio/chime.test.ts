import { describe, expect, it, vi } from "vitest";
import { createChime, ROLL_SYLLABLES } from "./chime";

class FakeAudioParam {
  value = 0;
  setValueAtTime(value: number) {
    this.value = value;
  }
  exponentialRampToValueAtTime(value: number) {
    this.value = value;
  }
}

class FakeGainNode {
  gain = new FakeAudioParam();
  connect = vi.fn();
}

class FakeOscillatorNode {
  type = "sine";
  frequency = new FakeAudioParam();
  connect = vi.fn();
  start = vi.fn();
  stop = vi.fn();
}

class FakeAudioContext {
  currentTime = 10;
  state = "running";
  destination = {};
  gains: FakeGainNode[] = [];
  oscillators: FakeOscillatorNode[] = [];
  resume = vi.fn().mockResolvedValue(undefined);
  close = vi.fn().mockResolvedValue(undefined);

  createGain() {
    const gain = new FakeGainNode();
    this.gains.push(gain);
    return gain;
  }

  createOscillator() {
    const oscillator = new FakeOscillatorNode();
    this.oscillators.push(oscillator);
    return oscillator;
  }
}

describe("createChime", () => {
  it("plays a quiet rolling phrase and stops after dispose", async () => {
    const context = new FakeAudioContext();
    const chime = createChime(() => context as unknown as AudioContext);

    expect(chime).not.toBeNull();
    expect(context.gains[0]?.gain.value).toBe(0.055);

    chime?.play();
    expect(context.oscillators).toHaveLength(ROLL_SYLLABLES.length);

    await chime?.dispose();
    expect(context.close).toHaveBeenCalledOnce();

    chime?.play();
    expect(context.oscillators).toHaveLength(ROLL_SYLLABLES.length);
  });

  it("degrades silently when Web Audio is unavailable", () => {
    expect(
      createChime(() => {
        throw new DOMException("Audio is unavailable");
      }),
    ).toBeNull();
  });
});
