import { useEffect, useRef } from "react";
import { getAnimalImage } from "../content/animals";
import type { ShapeId } from "../content/packs";
import { resolveCanvasBufferSize } from "../features/session/canvas-buffer";
import { paintRollFrame } from "../features/session/draw-shape";
import { sampleFaceExpression } from "../features/session/face";
import {
  createRollCast,
  type RotationStyle,
  sampleActorPose,
} from "../features/session/roll";
import {
  canStartPon,
  cssPointToPose,
  pickPonActorIndex,
  ponScaleFactor,
} from "../features/session/touch-pon";

type ShapeCanvasProps = {
  kind: "shape";
  sceneId: string;
  sceneDurationMs: number;
  shapeId: ShapeId;
  shapeColor: string;
  paused: boolean;
};

type AnimalCanvasProps = {
  kind: "animal";
  sceneId: string;
  imageSrc: string;
  paused: boolean;
};

type RollCanvasProps = ShapeCanvasProps | AnimalCanvasProps;

type ActivePon = {
  actorIndex: number;
  startElapsedMs: number;
};

function readDocumentVisible(): boolean {
  return typeof document === "undefined" || document.visibilityState !== "hidden";
}

/**
 * Canvas motion loop. Pause / tab visibility are refs so they start/stop the
 * rAF loop without tearing down ResizeObserver + cast (vercel
 * rerender-use-ref-transient-values).
 */
export function RollCanvas(props: RollCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const elapsedRef = useRef(0);
  const sceneIdRef = useRef(props.sceneId);
  const pausedRef = useRef(props.paused);
  const visibleRef = useRef(readDocumentVisible());
  const ponRef = useRef<ActivePon | null>(null);
  const lastPonStartMsRef = useRef<number | null>(null);
  const loopControlRef = useRef<{
    start: () => void;
    stopAndFreeze: () => void;
  } | null>(null);

  const sceneId = props.sceneId;
  const paused = props.paused;
  const kind = props.kind;
  const shapeId = props.kind === "shape" ? props.shapeId : null;
  const shapeColor = props.kind === "shape" ? props.shapeColor : null;
  const sceneDurationMs = props.kind === "shape" ? props.sceneDurationMs : null;
  const animalSrc = props.kind === "animal" ? props.imageSrc : null;
  const rotationStyle: RotationStyle = kind === "animal" ? "tilt" : "spin";
  const animalImage = animalSrc ? getAnimalImage(animalSrc) : null;

  pausedRef.current = paused;

  if (sceneIdRef.current !== sceneId) {
    sceneIdRef.current = sceneId;
    elapsedRef.current = 0;
    ponRef.current = null;
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const cast = createRollCast(sceneId);
    let frameId = 0;
    let cssWidth = Math.max(1, canvas.clientWidth);
    let cssHeight = Math.max(1, canvas.clientHeight);
    let lastWidth = 0;
    let lastHeight = 0;
    let baseElapsed = 0;
    let loopStartedAt = 0;

    const syncBuffer = () => {
      const { width, height } = resolveCanvasBufferSize(
        cssWidth,
        cssHeight,
        window.devicePixelRatio || 1,
      );
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
          kind === "shape" && shapeId && shapeColor && sceneDurationMs !== null
            ? {
                kind: "shape",
                shapeId,
                shapeColor,
                face: sampleFaceExpression(sceneId, elapsedMs, sceneDurationMs),
              }
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
      visibleRef.current = readDocumentVisible();
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
  }, [
    sceneId,
    sceneDurationMs,
    kind,
    shapeId,
    shapeColor,
    animalImage,
    rotationStyle,
  ]);

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
