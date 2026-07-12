import { useEffect, useRef } from "react";
import type { ShapeId } from "../content/packs";
import { paintRollFrame } from "../features/session/draw-shape";
import { createRollCast, sampleActorPose } from "../features/session/roll";

type RollCanvasProps = {
  sceneId: string;
  shapeId: ShapeId;
  shapeColor: string;
  paused: boolean;
};

export function RollCanvas({ sceneId, shapeId, shapeColor, paused }: RollCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const elapsedRef = useRef(0);
  const sceneIdRef = useRef(sceneId);

  if (sceneIdRef.current !== sceneId) {
    sceneIdRef.current = sceneId;
    elapsedRef.current = 0;
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
    let lastWidth = 0;
    let lastHeight = 0;

    const paintAt = (elapsedMs: number) => {
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      const width = Math.max(1, Math.floor(rect.width * ratio));
      const height = Math.max(1, Math.floor(rect.height * ratio));
      if (width !== lastWidth || height !== lastHeight) {
        canvas.width = width;
        canvas.height = height;
        lastWidth = width;
        lastHeight = height;
      }

      paintRollFrame(context, {
        width: canvas.width,
        height: canvas.height,
        shapeId,
        shapeColor,
        poses: cast.map((actor) => sampleActorPose(actor, elapsedMs)),
      });
    };

    if (paused) {
      paintAt(elapsedRef.current);
      return;
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
    };
  }, [sceneId, shapeId, shapeColor, paused]);

  return (
    <div aria-hidden="true" className="h-full w-full">
      <canvas className="roll-canvas h-full w-full" ref={canvasRef} />
    </div>
  );
}
