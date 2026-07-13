import { useEffect, useRef, useState } from "react";
import type { ShapeId } from "../content/packs";
import { resolveCanvasBufferSize } from "../features/session/canvas-buffer";
import { paintRollFrame } from "../features/session/draw-shape";
import { createRollCast, sampleActorPose } from "../features/session/roll";

type RollCanvasProps = {
  sceneId: string;
  shapeId: ShapeId;
  shapeColor: string;
  paused: boolean;
};

function readDocumentVisible(): boolean {
  return typeof document === "undefined" || document.visibilityState !== "hidden";
}

export function RollCanvas({ sceneId, shapeId, shapeColor, paused }: RollCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const elapsedRef = useRef(0);
  const sceneIdRef = useRef(sceneId);
  const [documentVisible, setDocumentVisible] = useState(readDocumentVisible);

  if (sceneIdRef.current !== sceneId) {
    sceneIdRef.current = sceneId;
    elapsedRef.current = 0;
  }

  useEffect(() => {
    const onVisibility = () => setDocumentVisible(readDocumentVisible());
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

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

    const paintAt = (elapsedMs: number) => {
      syncBuffer();
      paintRollFrame(context, {
        width: canvas.width,
        height: canvas.height,
        shapeId,
        shapeColor,
        poses: cast.map((actor) => sampleActorPose(actor, elapsedMs)),
      });
    };

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
      if (paused || !documentVisible) {
        paintAt(elapsedRef.current);
      }
    });
    resizeObserver.observe(canvas);

    if (paused || !documentVisible) {
      paintAt(elapsedRef.current);
      return () => {
        resizeObserver.disconnect();
      };
    }

    const baseElapsed = elapsedRef.current;
    const loopStartedAt = performance.now();

    const tick = (now: number) => {
      elapsedRef.current = baseElapsed + (now - loopStartedAt);
      paintAt(elapsedRef.current);
      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
    };
  }, [sceneId, shapeId, shapeColor, paused, documentVisible]);

  return (
    <div aria-hidden="true" className="h-full w-full">
      <canvas className="roll-canvas h-full w-full" ref={canvasRef} />
    </div>
  );
}
