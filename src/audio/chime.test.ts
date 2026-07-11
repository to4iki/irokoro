import { describe, expect, it, vi } from "vitest";
import { createChime } from "./chime";

class FakeAudioParam {
  value = 0;
  events: Array<{ kind: string; value: number; at: number }> = [];

  setValueAtTime(value: number, at: number) {
    this.events.push({ kind: "set", value, at });
    this.value = value;
  }

  exponentialRampToValueAtTime(value: number, at: number) {
    this.events.push({ kind: "ramp", value, at });
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
  state = "suspended";
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
  it("unlocks audio immediately with a quiet fixed master gain", () => {
    const context = new FakeAudioContext();

    const chime = createChime(() => context as unknown as AudioContext);

    expect(chime).not.toBeNull();
    expect(context.resume).toHaveBeenCalledOnce();
    expect(context.gains[0]?.gain.value).toBe(0.04);
    expect(context.gains[0]?.connect).toHaveBeenCalledWith(context.destination);
  });

  it("synthesizes a short two-note chime and releases its context", async () => {
    const context = new FakeAudioContext();
    const chime = createChime(() => context as unknown as AudioContext);

    chime?.play();

    expect(context.oscillators).toHaveLength(2);
    expect(context.oscillators[0]?.start).toHaveBeenCalledWith(10);
    expect(context.oscillators[1]?.start).toHaveBeenCalledWith(10.09);
    for (const oscillator of context.oscillators) {
      const stopAt = oscillator.stop.mock.calls[0]?.[0];
      expect(stopAt).toBeGreaterThanOrEqual(10.1);
      expect(stopAt).toBeLessThanOrEqual(10.5);
    }

    await chime?.dispose();
    expect(context.close).toHaveBeenCalledOnce();
  });

  it("degrades silently when Web Audio is unavailable", () => {
    expect(
      createChime(() => {
        throw new DOMException("Audio is unavailable");
      }),
    ).toBeNull();
  });
});
