import { useEffect, useRef } from "react";
import type { ShapeId } from "../content/packs";
import { paintRollFrame } from "../features/session/draw-shape";
import { createRollCast } from "../features/session/roll";
import { sampleActorPose } from "../features/session/roll-motion";

type RollCanvasProps = {
  sceneId: string;
  shapeId: ShapeId;
  shapeColor: string;
  paused: boolean;
};

export function RollCanvas({ sceneId, shapeId, shapeColor, paused }: RollCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pausedRef = useRef(paused);
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

    const cast = createRollCast(sceneId);
    const startedAt = performance.now();
    let frozenElapsed = 0;
    let pauseStartedAt: number | null = pausedRef.current ? startedAt : null;
    let frameId = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      const width = Math.max(1, Math.floor(rect.width * ratio));
      const height = Math.max(1, Math.floor(rect.height * ratio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
    };

    const paint = (now: number) => {
      resize();

      if (pausedRef.current) {
        if (pauseStartedAt === null) {
          pauseStartedAt = now;
        }
      } else if (pauseStartedAt !== null) {
        frozenElapsed += now - pauseStartedAt;
        pauseStartedAt = null;
      }

      const elapsedMs = pausedRef.current
        ? Math.max(0, (pauseStartedAt ?? now) - startedAt - frozenElapsed)
        : Math.max(0, now - startedAt - frozenElapsed);

      const stageSize = Math.min(canvas.width, canvas.height);
      const actors = cast.map((actor) => ({
        pose: sampleActorPose(actor, elapsedMs, stageSize),
      }));

      paintRollFrame(context, {
        width: canvas.width,
        height: canvas.height,
        shapeId,
        shapeColor,
        actors,
      });

      // Soft enter via WAAPI-friendly opacity is handled by CSS on the canvas.
      frameId = window.requestAnimationFrame(paint);
    };

    // Scene remount fade: WAAPI when available, CSS fallback otherwise.
    canvas.style.opacity = "0";
    if (typeof canvas.animate === "function") {
      canvas.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 420,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "forwards",
      });
    } else {
      canvas.style.transition = "opacity 420ms cubic-bezier(0.22, 1, 0.36, 1)";
      canvas.style.opacity = "1";
    }

    frameId = window.requestAnimationFrame(paint);
    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [sceneId, shapeId, shapeColor]);

  return (
    <div aria-hidden="true" className="h-full w-full">
      <canvas className="roll-canvas h-full w-full" ref={canvasRef} />
    </div>
  );
}
