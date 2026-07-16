import { useEffect, useRef, useState } from "react";
import { getAnimalImage } from "../content/animals";
import type { ShapeId } from "../content/packs";
import { resolveCanvasBufferSize } from "../features/session/canvas-buffer";
import { paintRollFrame } from "../features/session/draw-shape";
import {
  createRollCast,
  type RotationStyle,
  sampleActorPose,
} from "../features/session/roll";

type ShapeCanvasProps = {
  kind: "shape";
  sceneId: string;
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

function readDocumentVisible(): boolean {
  return typeof document === "undefined" || document.visibilityState !== "hidden";
}

export function RollCanvas(props: RollCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const elapsedRef = useRef(0);
  const sceneIdRef = useRef(props.sceneId);
  const [documentVisible, setDocumentVisible] = useState(readDocumentVisible);

  const sceneId = props.sceneId;
  const paused = props.paused;
  const kind = props.kind;
  const shapeId = props.kind === "shape" ? props.shapeId : null;
  const shapeColor = props.kind === "shape" ? props.shapeColor : null;
  const animalSrc = props.kind === "animal" ? props.imageSrc : null;
  const rotationStyle: RotationStyle = kind === "animal" ? "tilt" : "spin";
  const animalImage = animalSrc ? getAnimalImage(animalSrc) : null;

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
        subject:
          kind === "shape" && shapeId && shapeColor
            ? { kind: "shape", shapeId, shapeColor }
            : { kind: "animal", image: animalImage },
        poses: cast.map((actor) => sampleActorPose(actor, elapsedMs, rotationStyle)),
      });
    };

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
      if (paused || !documentVisible) {
        paintAt(elapsedRef.current);
      }
    });
    resizeObserver.observe(canvas);

    if (paused || !documentVisible) {
      paintAt(elapsedRef.current);
      return () => {
        animalImage?.removeEventListener("load", onAnimalLoad);
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
      animalImage?.removeEventListener("load", onAnimalLoad);
      resizeObserver.disconnect();
    };
  }, [
    sceneId,
    kind,
    shapeId,
    shapeColor,
    animalImage,
    paused,
    documentVisible,
    rotationStyle,
  ]);

  return (
    <div aria-hidden="true" className="h-full w-full">
      <canvas className="roll-canvas h-full w-full" ref={canvasRef} />
    </div>
  );
}
