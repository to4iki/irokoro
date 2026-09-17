import { useEffect, useRef } from "react";
import { getAnimal, getAnimalImage } from "../content/animals";
import { getColor } from "../content/packs";
import { paintRollFrame } from "../features/session/draw-shape";
import {
  createRollCast,
  type RotationStyle,
  sampleActorPose,
} from "../features/session/roll";
import type { Scene } from "../features/session/sequence";
import { pickShapeFillColors } from "../features/session/shape-fill-colors";
import {
  canStartPon,
  cssPointToPose,
  pickPonActorIndex,
  ponScaleFactor,
} from "../features/session/touch-pon";

type RollCanvasProps = {
  scene: Scene;
  paused: boolean;
};

type ActivePon = {
  actorIndex: number;
  startElapsedMs: number;
};

/** Cap backing-store density so full-scene canvases stay affordable on retina. */
const MAX_CANVAS_DEVICE_PIXEL_RATIO = 2;

/**
 * Canvas motion loop. Pause / tab visibility are refs so they start/stop the
 * rAF loop without tearing down ResizeObserver + cast.
 */
export function RollCanvas({ scene, paused }: RollCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const elapsedRef = useRef(0);
  const pausedRef = useRef(paused);
  const visibleRef = useRef(document.visibilityState !== "hidden");
  const ponRef = useRef<ActivePon | null>(null);
  const lastPonStartMsRef = useRef<number | null>(null);
  const loopControlRef = useRef<{
    start: () => void;
    stopAndFreeze: () => void;
  } | null>(null);

  pausedRef.current = paused;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const rotationStyle: RotationStyle = scene.packId === "animals" ? "tilt" : "spin";
    const animalImage =
      scene.packId === "animals" ? getAnimalImage(getAnimal(scene.animalId).src) : null;
    const sceneColor = scene.packId === "colors" ? getColor(scene.colorId) : null;
    const shapeId = scene.packId === "colors" ? scene.shapeId : null;
    const cast = createRollCast(scene.id);
    const shapeColors = sceneColor
      ? pickShapeFillColors({
          sceneId: scene.id,
          backgroundHex: sceneColor.background,
          primaryForeground: sceneColor.foreground,
          count: cast.length,
        })
      : null;
    let frameId = 0;
    let cssWidth = Math.max(1, canvas.clientWidth);
    let cssHeight = Math.max(1, canvas.clientHeight);
    let lastWidth = 0;
    let lastHeight = 0;
    let baseElapsed = 0;
    let loopStartedAt = 0;

    const syncBuffer = () => {
      const ratio = Math.min(
        Math.max(window.devicePixelRatio || 1, 1),
        MAX_CANVAS_DEVICE_PIXEL_RATIO,
      );
      const width = Math.max(1, Math.floor(cssWidth * ratio));
      const height = Math.max(1, Math.floor(cssHeight * ratio));
      if (width !== lastWidth || height !== lastHeight) {
        canvas.width = width;
        canvas.height = height;
        lastWidth = width;
        lastHeight = height;
      }
    };

    const posesAt = (elapsedMs: number) =>
      cast.map((actor, index) => {
        const pose = sampleActorPose(actor, elapsedMs, rotationStyle);
        const pon = ponRef.current;
        if (!pon || pon.actorIndex !== index) {
          return pose;
        }
        return {
          ...pose,
          scale: pose.scale * ponScaleFactor(elapsedMs - pon.startElapsedMs),
        };
      });

    const paintAt = (elapsedMs: number) => {
      syncBuffer();
      paintRollFrame(context, {
        width: canvas.width,
        height: canvas.height,
        subject:
          shapeId && shapeColors
            ? { kind: "shape", shapeId, shapeColors }
            : { kind: "animal", image: animalImage },
        poses: posesAt(elapsedMs),
      });
    };

    const stopLoop = () => {
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
        frameId = 0;
      }
    };

    const stopAndFreeze = () => {
      stopLoop();
      paintAt(elapsedRef.current);
    };

    const startLoop = () => {
      if (frameId !== 0 || pausedRef.current || !visibleRef.current) {
        return;
      }
      baseElapsed = elapsedRef.current;
      loopStartedAt = performance.now();
      const tick = (now: number) => {
        if (pausedRef.current || !visibleRef.current) {
          frameId = 0;
          return;
        }
        elapsedRef.current = baseElapsed + (now - loopStartedAt);
        paintAt(elapsedRef.current);
        frameId = window.requestAnimationFrame(tick);
      };
      frameId = window.requestAnimationFrame(tick);
    };

    loopControlRef.current = { start: startLoop, stopAndFreeze };

    const onPointerDown = (event: PointerEvent) => {
      if (pausedRef.current || !event.isPrimary) {
        return;
      }

      const nowMs = performance.now();
      const active = ponRef.current;
      if (
        !canStartPon({
          nowMs,
          lastStartMs: lastPonStartMsRef.current,
          reactionElapsedMs:
            active === null ? null : elapsedRef.current - active.startElapsedMs,
        })
      ) {
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const tap = cssPointToPose(
        event.clientX - rect.left,
        event.clientY - rect.top,
        rect.width,
        rect.height,
      );

      lastPonStartMsRef.current = nowMs;
      ponRef.current = {
        actorIndex: pickPonActorIndex(posesAt(elapsedRef.current), tap.x, tap.y),
        startElapsedMs: elapsedRef.current,
      };
    };

    canvas.addEventListener("pointerdown", onPointerDown);

    const onAnimalLoad = () => paintAt(elapsedRef.current);
    animalImage?.addEventListener("load", onAnimalLoad);

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }
      const nextWidth = entry.contentRect.width;
      const nextHeight = entry.contentRect.height;
      if (nextWidth > 0) {
        cssWidth = nextWidth;
      }
      if (nextHeight > 0) {
        cssHeight = nextHeight;
      }
      if (pausedRef.current || !visibleRef.current) {
        paintAt(elapsedRef.current);
      }
    });
    resizeObserver.observe(canvas);

    const onVisibility = () => {
      visibleRef.current = document.visibilityState !== "hidden";
      if (visibleRef.current && !pausedRef.current) {
        startLoop();
        return;
      }
      stopAndFreeze();
    };

    document.addEventListener("visibilitychange", onVisibility);

    if (pausedRef.current || !visibleRef.current) {
      paintAt(elapsedRef.current);
    } else {
      startLoop();
    }

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("pointerdown", onPointerDown);
      animalImage?.removeEventListener("load", onAnimalLoad);
      stopLoop();
      resizeObserver.disconnect();
      loopControlRef.current = null;
    };
  }, [scene]);

  useEffect(() => {
    const control = loopControlRef.current;
    if (!control) {
      return;
    }
    if (paused) {
      control.stopAndFreeze();
      return;
    }
    if (visibleRef.current) {
      control.start();
    }
  }, [paused]);

  return (
    <div aria-hidden="true" className="h-full w-full">
      <canvas className="roll-canvas h-full w-full" ref={canvasRef} />
    </div>
  );
}
